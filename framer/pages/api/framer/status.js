// Simple proxy endpoint for Framer app
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers for Framer app
  res.setHeader('Access-Control-Allow-Origin', 'https://youthful-vacation-500847.framer.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=60');

  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Fetch status from the main API endpoint
    const response = await fetch('https://stats.uptimerobot.com/api/getMonitorList/H8lyexLCjy');
    const data = await response.json();
    
    const isGreen = data?.stat === 'ok' && data?.psp?.status === 'up';
    const responseData = {
      status: isGreen ? 'operational' : 'outage',
      isGreen,
      isDegraded: false,
      isOutage: !isGreen,
      isMaintenance: false,
      statusText: isGreen ? 'All services operational' : 'Service disruption',
      timestamp: new Date().toISOString(),
      responseTime: data?.psp?.responseTime || 0,
      monitors: data?.psp?.monitors?.length || 0
    };
    
    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error in Framer status proxy:', error);
    const errorResponse = {
      status: 'error',
      isGreen: false,
      statusText: 'Unable to fetch status',
      timestamp: new Date().toISOString(),
      error: error.message
    };
    
    return res.status(500).json(errorResponse);
  }
}
