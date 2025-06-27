// Set CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export default async function handler(req, res) {
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify(responseData));
    
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
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify(errorResponse));
  }
}
