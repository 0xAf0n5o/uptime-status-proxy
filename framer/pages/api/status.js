// CORS headers
const allowedOrigins = [
  'https://youthful-vacation-500847.framer.app',
  'https://uptime-status-proxy.vercel.app',
  'http://localhost:3000'
];

// Set CORS headers
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  // Set Vary header to prevent caching of CORS responses
  res.setHeader('Vary', 'Origin');
  
  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Set other headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=60');
}

export default async function handler(req, res) {
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
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
    
    // Set CORS headers and send response
    setCorsHeaders(req, res);
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
    
    // Set CORS headers and send error response
    setCorsHeaders(req, res);
    return res.status(200).json(errorResponse);
  }
}
