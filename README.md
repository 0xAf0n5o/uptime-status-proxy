# Uptime Status Proxy

> Last deployment: 2025-06-26 20:57:30 UTC

A lightweight Node.js proxy server that provides a clean API for checking the status of UptimeRobot monitors. This service fetches data from UptimeRobot's internal API and provides a simple JSON endpoint for checking status, along with Prometheus metrics for monitoring.

## Features

- 🚀 Simple REST API for checking monitor status
- 📊 Prometheus metrics endpoint
- ⚡ Response caching to reduce API calls
- 🔒 Rate limiting to prevent abuse
- 🏥 Health check endpoint
- 🐳 Docker and Docker Compose support
- 📈 Built-in monitoring with Prometheus and Grafana

## API Endpoints

### `GET /api/status`

Returns the current status of all monitors.

**Example Response:**
```json
{
  "status": "operational",
  "isGreen": true,
  "isDegraded": false,
  "isOutage": false,
  "isMaintenance": false,
  "statusText": "All services operational (100.00% uptime)",
  "timestamp": "2025-06-27T01:36:30.619Z",
  "responseTime": "723.33ms",
  "monitors": 6,
  "debug": {
    "stats": { ... },
    "monitors": 6,
    "uptimePercentage": 100,
    "cacheHit": true
  }
}
```

### `GET /health`

Health check endpoint that returns the service status and basic system information.

**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-27T01:36:30.619Z",
  "uptime": "1h 23m 45.67s",
  "memory": {
    "rss": "45.2 MB",
    "heapTotal": "12.3 MB",
    "heapUsed": "8.9 MB",
    "external": "2.1 MB"
  },
  "node": {
    "version": "v20.17.0",
    "env": "production"
  }
}
```

### `GET /metrics`

Prometheus metrics endpoint. Returns metrics in Prometheus format.

### `GET /api/version`

Returns the current version of the application.

## Metrics

The following metrics are exposed via the `/metrics` endpoint:

- `uptime_status_proxy_http_requests_total`: Total HTTP requests
- `uptime_status_proxy_http_response_time_ms`: HTTP response time in milliseconds
- `uptime_status_proxy_cache_hits_total`: Total cache hits
- `uptime_status_proxy_cache_misses_total`: Total cache misses
- `uptime_status_proxy_service_status`: Current service status (1 = operational, 0 = not operational)
- `uptime_status_proxy_uptimerobot_api_duration_ms`: Duration of UptimeRobot API calls
- `uptime_status_proxy_uptimerobot_api_errors_total`: Total UptimeRobot API errors

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/uptime-status-proxy.git
   cd uptime-status-proxy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Using Docker

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. Access the services:
   - API: http://localhost:3000
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)

## Configuration

Environment variables can be used to configure the application:

- `PORT`: Port to run the server on (default: 3000)
- `NODE_ENV`: Environment (development, production, etc.)
- `CACHE_TTL`: Cache TTL in milliseconds (default: 30000)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds (default: 60000)
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 100)

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Monitoring

### Prometheus

Prometheus is configured to scrape metrics from the application every 5 seconds. You can access the Prometheus dashboard at http://localhost:9090.

### Grafana

Grafana is pre-configured with a dashboard for monitoring the application. You can access it at http://localhost:3001 (admin/admin).

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgments

- [UptimeRobot](https://uptimerobot.com/) for the monitoring service
- [Prometheus](https://prometheus.io/) for metrics
- [Grafana](https://grafana.com/) for visualization
- [Express](https://expressjs.com/) for the web framework
# uptime-status-proxy
