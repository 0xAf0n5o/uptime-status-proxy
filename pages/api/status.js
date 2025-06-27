import fetch from 'node-fetch';

// Status endpoint for Framer app
export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    'https://youthful-vacation-500847.framer.app',
    'https://uptime-status-proxy.vercel.app',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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
      responseTime: data?.psp?.responseTime ?? 0,
      monitors: data?.psp?.monitors?.length ?? 0,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in status endpoint:', error);
    return res.status(500).json({
      status: 'error',
      isGreen: false,
      statusText: 'Unable to fetch status',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}
