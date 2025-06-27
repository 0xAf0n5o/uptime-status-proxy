// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60',
  'Vary': 'Origin'
};

export default async function handler(req, res) {
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://stats.uptimerobot.com/api/getMonitorList/H8lyexLCjy');
    const data = await response.json();
    
    const isGreen = data?.stat === 'ok' && data?.psp?.status === 'up';
    const responseData = {
      status: isGreen ? 'operational' : 'outage',
      isGreen,
      statusText: isGreen ? 'All systems operational' : 'Service disruption',
      timestamp: new Date().toISOString(),
      responseTime: data?.psp?.responseTime,
      monitors: data?.psp?.monitors?.length || 0
    };
    
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Send response
    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error fetching status:', error);
    const errorResponse = {
      status: 'unknown',
      isGreen: false,
      statusText: 'Unable to determine status',
      timestamp: new Date().toISOString(),
      error: error.message
    };
    
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Send error response
    return res.status(200).json(errorResponse);
  }
}
