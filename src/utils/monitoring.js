const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics (cpu, memory, etc.)
client.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
});

register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to track HTTP metrics
const httpMetricsMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(req.method, req.path, res.statusCode)
      .observe(duration);
  });
  next();
};

// Health check function
const performHealthCheck = async () => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  };
  try {
    // Add DB check or other service checks here if needed
    return health;
  } catch (e) {
    health.message = e;
    throw health;
  }
};

module.exports = {
  register,
  httpMetricsMiddleware,
  performHealthCheck,
};
