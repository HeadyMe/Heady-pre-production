/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              EXPRESS API SERVICE TEMPLATE                    ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📥 REQUEST       🔐 AUTH          🔧 PROCESS        📤 RESPONSE
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │ Receive│─────▶│ Validate │─────▶│ Execute  │─────▶│  Return  │
 *    │  HTTP  │      │  & Auth  │      │  Logic   │      │  JSON    │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 * 
 * Template for creating new Express API services in the Heady ecosystem.
 */

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuration
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.API_KEY || 'change-me';

// Initialize Express
const app = express();

// Middleware Stack (Order matters!)
app.use(compression());                    // Gzip compression
app.use(helmet());                         // Security headers
app.use(cors());                           // CORS
app.use(express.json({ limit: '10mb' })); // JSON parsing
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60000,  // 1 minute
  max: 100,         // 100 requests per minute
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// Authentication Middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Async Handler Wrapper
const asyncHandler = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

// Routes

// Health Check (No auth required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: '[service-name]',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Example Protected Endpoint
app.get('/api/example', authenticate, asyncHandler(async (req, res) => {
  // Your logic here
  const result = {
    message: 'Example response',
    data: {}
  };
  
  res.json({ ok: true, result });
}));

app.post('/api/example', authenticate, asyncHandler(async (req, res) => {
  const { input } = req.body;
  
  if (!input) {
    throw { status: 400, message: 'Input required' };
  }
  
  // Your logic here
  const result = {
    processed: input
  };
  
  res.json({ ok: true, result });
}));

// Error Handler (Must be last)
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Server Error';
  
  console.error(`[Error] ${status} - ${message}`, err);
  
  res.status(status).json({ 
    ok: false, 
    error: message 
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║              [SERVICE_NAME] API Server                       ║
║  Port: ${String(PORT).padEnd(54)}║
╚══════════════════════════════════════════════════════════════╝
    `);
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    💖 Made with Love 💖                      ║
║           by HeadyConnection & HeadySystems Team             ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
