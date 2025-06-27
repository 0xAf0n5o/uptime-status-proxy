import { collectDefaultMetrics, Gauge, Counter, Registry } from 'prom-client';

// Create a registry to hold the metrics
const register = new Registry();

// Enable default metrics (event loop lag, memory usage, etc.)
collectDefaultMetrics({
  prefix: 'uptime_status_proxy_',
  timeout: 5000, // Collect metrics every 5 seconds
  gcDurationBuckets: [0.1, 1, 5, 15, 30, 60, 180, 300], // GC duration buckets in seconds
  register, // Register the metrics
});

// Create custom metrics
const httpRequestDurationMicroseconds = new Gauge({
  name: 'uptime_status_proxy_http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'code'],
  registers: [register],
});

// Track response times
const httpResponseTime = new Gauge({
  name: 'uptime_status_proxy_http_response_time_ms',
  help: 'HTTP response time in milliseconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpRequestsTotal = new Counter({
  name: 'uptime_status_proxy_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'],
  registers: [register],
});

const uptimeRobotApiDuration = new Gauge({
  name: 'uptime_status_proxy_uptimerobot_api_duration_ms',
  help: 'Duration of UptimeRobot API calls in milliseconds',
  registers: [register],
});

const uptimeRobotApiErrors = new Counter({
  name: 'uptime_status_proxy_uptimerobot_api_errors_total',
  help: 'Total number of UptimeRobot API errors',
  registers: [register],
});

const serviceStatus = new Gauge({
  name: 'uptime_status_proxy_service_status',
  help: 'Current service status (1 = operational, 0 = not operational)',
  registers: [register],
});

// Track cache hits/misses
const cacheHits = new Counter({
  name: 'uptime_status_proxy_cache_hits_total',
  help: 'Total number of cache hits',
  registers: [register],
});

const cacheMisses = new Counter({
  name: 'uptime_status_proxy_cache_misses_total',
  help: 'Total number of cache misses',
  registers: [register],
});

// Track response time middleware
const responseTimeMiddleware = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationMs = (duration[0] * 1e9 + duration[1]) / 1e6; // Convert to milliseconds
    
    httpRequestDurationMicroseconds
      .labels(req.method, req.path, res.statusCode)
      .set(durationMs);
      
    httpRequestsTotal
      .labels(req.method, req.path, res.statusCode)
      .inc();
  });
  
  next();
};

// Track UptimeRobot API metrics
const trackUptimeRobotApi = async (fn) => {
  const start = process.hrtime();
  
  try {
    const result = await fn();
    const duration = process.hrtime(start);
    const durationMs = (duration[0] * 1e9 + duration[1]) / 1e6;
    
    uptimeRobotApiDuration.set(durationMs);
    serviceStatus.set(1); // Mark as operational
    
    return result;
  } catch (error) {
    uptimeRobotApiErrors.inc();
    serviceStatus.set(0); // Mark as not operational
    throw error;
  }
};

// Get metrics as a string for the /metrics endpoint
const getMetrics = async () => {
  try {
    // Get metrics from the registry
    const metrics = await register.metrics();
    return metrics;
  } catch (error) {
    console.error('Error collecting metrics:', error);
    throw error;
  }
};

export {
  httpRequestDurationMicroseconds,
  httpResponseTime,
  httpRequestsTotal,
  uptimeRobotApiDuration,
  uptimeRobotApiErrors,
  serviceStatus,
  responseTimeMiddleware,
  trackUptimeRobotApi,
  getMetrics,
  cacheHits,
  cacheMisses,
};
