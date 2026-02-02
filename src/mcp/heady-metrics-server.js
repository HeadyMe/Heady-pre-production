/**
 * Heady Metrics MCP Server
 * Real-time metric collection, SSE streaming, health monitoring
 */

const express = require('express');
const { sendSuccess, sendError, initSSE, sendSSE, MetricRecorder, calculateHealthScore } = require('../utils/shared-utils');
const { PORTS, METRICS } = require('../../lib/constants');

const app = express();
app.use(express.json());

// Metrics storage
const metricRecorder = new MetricRecorder(METRICS.MAX_SAMPLES);
const healthData = new Map();

/**
 * Record metric
 */
app.post('/api/metrics/record', (req, res) => {
  try {
    const { name, value, tags = {} } = req.body;
    
    if (!name || value === undefined) {
      return sendError(res, 'Name and value required', 400);
    }
    
    metricRecorder.record(name, value);
    
    sendSuccess(res, { recorded: true, name, value });
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Get metrics
 */
app.get('/api/metrics/:name', (req, res) => {
  try {
    const { name } = req.params;
    const { count = 10 } = req.query;
    
    const recent = metricRecorder.getRecent(name, parseInt(count));
    const average = metricRecorder.getAverage(name);
    
    sendSuccess(res, {
      name,
      average,
      recentSamples: recent,
      sampleCount: recent.length
    });
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * SSE metrics stream
 */
app.get('/api/metrics/stream', (req, res) => {
  initSSE(res);
  
  const interval = setInterval(() => {
    // Generate wave and fractal metrics for UI animations
    const now = Date.now();
    const wave = Math.sin(now * METRICS.WAVE_FREQUENCY) * 50 + 50;
    const fractal = generateFractalValue(now);
    
    const metricsData = {
      timestamp: new Date().toISOString(),
      wave,
      fractal,
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      requests: Math.floor(Math.random() * 1000)
    };
    
    sendSSE(res, 'metrics', metricsData);
  }, METRICS.COLLECTION_INTERVAL);
  
  req.on('close', () => {
    clearInterval(interval);
  });
});

/**
 * Generate fractal value for Sacred Geometry animations
 */
function generateFractalValue(time) {
  let value = 0;
  
  for (let i = 0; i < METRICS.FRACTAL_DEPTH; i++) {
    const freq = Math.pow(2, i);
    const amp = 1 / freq;
    value += Math.sin(time * freq * 0.001) * amp;
  }
  
  return (value + 1) * 50; // Normalize to 0-100
}

/**
 * Update service health
 */
app.post('/api/metrics/health/:service', (req, res) => {
  try {
    const { service } = req.params;
    const { uptime, errorRate, avgLatency } = req.body;
    
    const healthScore = calculateHealthScore({ uptime, errorRate, avgLatency });
    
    healthData.set(service, {
      uptime,
      errorRate,
      avgLatency,
      healthScore,
      lastUpdate: new Date().toISOString()
    });
    
    sendSuccess(res, { service, healthScore });
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Get health data
 */
app.get('/api/metrics/health', (req, res) => {
  try {
    const services = {};
    
    for (const [service, data] of healthData.entries()) {
      services[service] = data;
    }
    
    const overallHealth = healthData.size > 0
      ? Array.from(healthData.values()).reduce((sum, d) => sum + d.healthScore, 0) / healthData.size
      : 100;
    
    sendSuccess(res, {
      overall: overallHealth,
      services
    });
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  sendSuccess(res, {
    status: 'healthy',
    service: 'heady-metrics-server',
    metricsTracked: metricRecorder.metrics.size,
    servicesMonitored: healthData.size
  });
});

const PORT = process.env.PORT || PORTS.METRICS_SERVER;

app.listen(PORT, () => {
  console.log(`✅ Heady Metrics Server running on port ${PORT}`);
});

module.exports = app;
