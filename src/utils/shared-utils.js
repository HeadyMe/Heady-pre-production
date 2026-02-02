/**
 * Shared Utilities Module
 * Consolidates common patterns used across MCP services
 */

/**
 * Generate ISO timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Express response helpers
 */
function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    timestamp: getTimestamp(),
    data
  });
}

function sendError(res, message, statusCode = 500) {
  res.status(statusCode).json({
    success: false,
    timestamp: getTimestamp(),
    error: message
  });
}

/**
 * SSE (Server-Sent Events) utilities
 */
function initSSE(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
}

function sendSSE(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Map manipulation functions
 */
function getMapSize(map) {
  return map instanceof Map ? map.size : Object.keys(map).length;
}

function clearMapOlderThan(map, maxAge) {
  const now = Date.now();
  const deleted = [];
  
  for (const [key, value] of map.entries()) {
    if (value.timestamp && (now - value.timestamp) > maxAge) {
      map.delete(key);
      deleted.push(key);
    }
  }
  
  return deleted;
}

/**
 * Health score calculation
 */
function calculateHealthScore(metrics) {
  const { uptime = 0, errorRate = 0, avgLatency = 0 } = metrics;
  
  let score = 100;
  
  // Penalize high error rate
  if (errorRate > 0.1) score -= 40;
  else if (errorRate > 0.05) score -= 20;
  else if (errorRate > 0.01) score -= 10;
  
  // Penalize high latency
  if (avgLatency > 2000) score -= 30;
  else if (avgLatency > 1000) score -= 15;
  else if (avgLatency > 500) score -= 5;
  
  // Bonus for good uptime
  if (uptime > 86400000) score += 10; // 24+ hours
  
  return Math.max(0, Math.min(100, score));
}

/**
 * ID generation
 */
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Event handler management
 */
class EventManager {
  constructor() {
    this.handlers = new Map();
  }
  
  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
  }
  
  emit(event, data) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }
  
  removeAll(event) {
    this.handlers.delete(event);
  }
}

/**
 * Metric recording class
 */
class MetricRecorder {
  constructor(maxSamples = 100) {
    this.metrics = new Map();
    this.maxSamples = maxSamples;
  }
  
  record(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const samples = this.metrics.get(name);
    samples.push({ value, timestamp: Date.now() });
    
    // Keep only recent samples
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }
  
  getAverage(name) {
    const samples = this.metrics.get(name) || [];
    if (samples.length === 0) return 0;
    
    const sum = samples.reduce((acc, s) => acc + s.value, 0);
    return sum / samples.length;
  }
  
  getRecent(name, count = 10) {
    const samples = this.metrics.get(name) || [];
    return samples.slice(-count);
  }
}

/**
 * Rate limiting class
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(key) {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside window
    const validRequests = requests.filter(time => (now - time) < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
  
  reset(key) {
    this.requests.delete(key);
  }
}

/**
 * Status transition logic
 */
const VALID_TRANSITIONS = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'failed', 'cancelled'],
  completed: [],
  failed: ['pending'],
  cancelled: ['pending']
};

function isValidTransition(fromStatus, toStatus) {
  const allowed = VALID_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

/**
 * Retry utilities
 */
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryOperation(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Batch processing utilities
 */
async function processBatch(items, processor, batchSize = 10) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Configuration validation
 */
function validateConfig(config, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!(field in config) || config[field] === undefined || config[field] === null) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
  
  return true;
}

module.exports = {
  // Timestamp
  getTimestamp,
  
  // Express helpers
  sendSuccess,
  sendError,
  
  // SSE
  initSSE,
  sendSSE,
  
  // Map utilities
  getMapSize,
  clearMapOlderThan,
  
  // Health
  calculateHealthScore,
  
  // ID generation
  generateId,
  
  // Classes
  EventManager,
  MetricRecorder,
  RateLimiter,
  
  // Status
  isValidTransition,
  VALID_TRANSITIONS,
  
  // Retry
  sleep,
  retryOperation,
  
  // Batch
  processBatch,
  
  // Config
  validateConfig
};
