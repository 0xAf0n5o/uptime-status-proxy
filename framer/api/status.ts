import { Request, Response } from 'express';

// Cache configuration
const CACHE_TTL = 30000; // 30 seconds
let monitorCache = {
  data: null as any,
  timestamp: 0,
  ttl: CACHE_TTL
};

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: any = {}): Promise<any> {
  const { timeout = 10000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    console.error('Fetch error:', error);
    throw error;
  }
}

// Get monitor status from UptimeRobot API
async function getMonitorStatus(useCache = true) {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (useCache && monitorCache.data && (now - monitorCache.timestamp) < monitorCache.ttl) {
    console.log('Returning cached monitor status');
    return monitorCache.data;
  }
  
  try {
    const apiUrl = 'https://stats.uptimerobot.com/api/getMonitorList/H8lyexLCjy';
    console.log('Fetching monitor status from:', apiUrl);
    
    // Make the API request
    const data = await fetchWithTimeout(apiUrl, {
      method: 'GET',
      timeout: 15000
    });
    
    console.log('API response received with data structure:', Object.keys(data).join(', '));
    
    // Cache the successful response
    monitorCache = {
      data,
      timestamp: now,
      ttl: CACHE_TTL
    };
    
    return data;
  } catch (error) {
    console.error('Error in getMonitorStatus:', error);
    
    // Return cached data if available, even if expired
    if (monitorCache.data) {
      console.log('Using expired cache due to API error');
      return monitorCache.data;
    }
    
    throw error;
  }
}

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
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
    
    // Calculate response time
    const responseTime = process.hrtime(startTime);
    const responseTimeMs = (responseTime[0] * 1e9 + responseTime[1]) / 1e6;
    
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
    const statusCode = (error as any).response?.status || 500;
    const errorMessage = (error as Error).message || 'Internal server error';
    
    return res.status(statusCode).json({
      status: 'error',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}
