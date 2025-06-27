import fetch from 'node-fetch';

// Cache for storing monitor data to reduce API calls
let monitorCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes cache
};

// Helper function to fetch with timeout
async function fetchWithTimeout(url, options = {}) {
  const { timeout = 15000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        ...(fetchOptions.headers || {})
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      error.status = response.status;
      throw error;
    }
    
    // Get the response text first
    const text = await response.text();
    
    // Try to parse as JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response as JSON:', text.substring(0, 200));
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Enhance the error with more context
    if (error.name === 'AbortError') {
      error.message = `Request timed out after ${timeout}ms`;
    }
    
    throw error;
  }
}

// Get monitor status from UptimeRobot API
async function getMonitorStatus(useCache = true) {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (useCache && monitorCache.data && (now - monitorCache.timestamp) < monitorCache.ttl) {
    console.log('Returning cached monitor status');
    cacheHits.inc();
    return monitorCache.data;
  }
  
  // Track cache miss
  if (useCache) {
    cacheMisses.inc();
  }
  
  try {
    const apiUrl = 'https://stats.uptimerobot.com/api/getMonitorList/H8lyexLCjy';
    console.log('Fetching monitor status from:', apiUrl);
    
    // Make the API request with metrics tracking
    const fetchWithMetrics = async () => {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 15000
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error in fetchWithMetrics:', error);
        throw error;
      }
    };
    
    // Track the API call with metrics
    const data = await trackUptimeRobotApi(fetchWithMetrics);
    
    if (!data) {
      throw new Error('No data received from UptimeRobot API');
    }
    
    console.log('API response received with data structure:', Object.keys(data).join(', '));
    
    // Cache the successful response
    monitorCache = {
      data,
      timestamp: now,
      ttl: monitorCache.ttl
    };
    
    return data;
  } catch (error) {
    console.error('Error fetching monitor status:', error);
    
    // If we have cached data and the API fails, return the cached data
    if (monitorCache.data) {
      console.log('Using cached monitor data due to API error');
      return monitorCache.data;
    }
    
    throw error;
  }
}

// Import metrics
import { trackUptimeRobotApi, httpResponseTime, cacheHits, cacheMisses } from '../utils/metrics.js';

export default async function handler(req, res) {
  const startTime = process.hrtime();
  
  try {
    // Get the monitor data
    const monitorData = await getMonitorStatus();
    
    // Default to unknown status
    let status = 'unknown';
    let statusText = 'Status unknown';
    let allOperational = true;
    let hasIssues = false;
    let uptimePercentage = null;
    
    // Process monitor data if available
    if (monitorData && monitorData.statistics) {
      const stats = monitorData.statistics;
      const counts = stats.counts || {};
      
      // Determine overall status based on counts
      if (counts.down > 0) {
        status = 'outage';
        statusText = `${counts.down} service${counts.down > 1 ? 's' : ''} down`;
        allOperational = false;
        hasIssues = true;
      } else if (counts.warning > 0) {
        status = 'degraded';
        statusText = `${counts.warning} service${counts.warning > 1 ? 's' : ''} with issues`;
        allOperational = false;
        hasIssues = true;
      } else if (counts.up > 0) {
        status = 'operational';
        statusText = 'All services operational';
      } else if (counts.paused > 0) {
        status = 'maintenance';
        statusText = 'Services under maintenance';
      }
      
      // If we have uptime data, include it in the status text
      if (stats.uptime) {
        const uptime = stats.uptime;
        if (uptime.l1) {
          uptimePercentage = parseFloat(uptime.l1.ratio);
          statusText += ` (${uptimePercentage.toFixed(2)}% uptime)`;
        }
      }
    }
    
    // Calculate and record response time
    const responseTime = process.hrtime(startTime);
    const responseTimeMs = (responseTime[0] * 1e9 + responseTime[1]) / 1e6;
    
    // Record response time metric
    httpResponseTime.labels(req.method, req.path, 200).set(responseTimeMs);
    
    // Prepare response
    const response = {
      status,
      isGreen: status === 'operational',
      isDegraded: status === 'degraded',
      isOutage: status === 'outage',
      isMaintenance: status === 'maintenance',
      statusText,
      timestamp: new Date().toISOString(),
      responseTime: responseTimeMs.toFixed(2) + 'ms',
      monitors: monitorData && monitorData.statistics ? 
        (monitorData.statistics.counts?.up || 0) + 
        (monitorData.statistics.counts?.down || 0) + 
        (monitorData.statistics.counts?.paused || 0) : 0,
      ...(process.env.NODE_ENV !== 'production' ? { 
        debug: { 
          stats: monitorData?.statistics,
          monitors: monitorData?.monitors?.length || 0,
          uptimePercentage,
          cacheHit: monitorCache.data && (Date.now() - monitorCache.timestamp) < monitorCache.ttl
        } 
      } : {})
    };
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in status handler:', error);
    
    // Try to return a meaningful error response
    const statusCode = error.response?.status || 500;
    const errorMessage = error.message || 'Internal server error';
    
    return res.status(statusCode).json({
      status: 'error',
      error: errorMessage,
      isGreen: false,
      isDegraded: false,
      isOutage: true,
      statusText: 'Error fetching status',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' ? { debug: { error: error.toString() } } : {})
    });
  }
}