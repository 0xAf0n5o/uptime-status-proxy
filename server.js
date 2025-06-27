import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import statusHandler from './api/status.js';
import { responseTimeMiddleware, getMetrics, trackUptimeRobotApi } from './utils/metrics.js';

const app = express();
const port = process.env.PORT || 3000;

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Trust first proxy (if behind a reverse proxy like Nginx, etc.)
app.set('trust proxy', 1);

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use(cors());
app.use(express.json());

// Add response time middleware for metrics
app.use(responseTimeMiddleware);

// Version endpoint to verify running code
app.get('/api/version', (req, res) => {
  const versionInfo = {
    version: '1.0.0',
    lastModified: new Date().toISOString(),
    message: 'Server is running with latest code'
  };
  console.log('Version endpoint hit:', versionInfo);
  res.json(versionInfo);
});

app.get('/api/status', statusHandler);

// Test endpoint to verify logging
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit at', new Date().toISOString());
  res.json({ 
    message: 'Test successful', 
    timestamp: new Date().toISOString(),
    ip: req.ip,
    headers: req.headers
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`
    }
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain');
    const metrics = await getMetrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).end('Error getting metrics');
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log('Environment:', process.env.NODE_ENV);
});


// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
