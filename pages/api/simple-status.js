import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Fetch status from UptimeRobot
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
    console.error('Error in simple status endpoint:', error);
    return res.status(500).json({
      status: 'error',
      isGreen: false,
      statusText: 'Unable to fetch status',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}
