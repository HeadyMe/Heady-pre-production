// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
// ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
// ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
// ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
// ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
// ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
// ║                                                                  ║
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
// ║  FILE: packages/networking/src/index.js                           ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * @heady/networking - Centralized HTTP client creation.
 *
 * PROTOCOL:
 *   - Heady-internal domains (*.heady.internal, localhost, 127.0.0.1, render internal)
 *     are ALWAYS called via direct sockets (no proxy).
 *   - External domains use proxies only when explicitly configured.
 *   - Circuit breaker wraps every external call.
 *   - Retry with exponential backoff + jitter on transient failures.
 */

const axios = require("axios");
const http = require("http");
const https = require("https");
const { CircuitBreaker } = require("./circuit-breaker");

// ─── INTERNAL DOMAINS (always bypass proxy) ──────────────────────────────
const INTERNAL_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "::1",
  "*.heady.internal",
  "api.heady.local",
  "heady-manager",
  "*.onrender.com",
];

// ─── DIRECT AGENTS (no proxy, keep-alive) ────────────────────────────────
const directHttpAgent = new http.Agent({ keepAlive: true, maxSockets: 20 });
const directHttpsAgent = new https.Agent({ keepAlive: true, maxSockets: 20 });

/**
 * Check if a hostname matches internal domain patterns.
 */
function isInternalDomain(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  for (const pattern of INTERNAL_DOMAINS) {
    if (pattern.startsWith("*")) {
      const suffix = pattern.slice(1); // e.g. ".heady.internal"
      if (h.endsWith(suffix)) return true;
    } else if (h === pattern) {
      return true;
    }
  }
  return false;
}

// ─── RETRY WITH EXPONENTIAL BACKOFF + JITTER ─────────────────────────────
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 30000,
  jitterMaxMs: 1000,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeDelay(attempt, config) {
  const exponential = Math.min(
    config.baseDelayMs * Math.pow(2, attempt),
    config.maxDelayMs
  );
  const jitter = Math.random() * config.jitterMaxMs;
  return exponential + jitter;
}

function isRetryable(error) {
  if (!error.response) return true; // network error
  const status = error.response.status;
  return status === 429 || status >= 500;
}

async function retryRequest(fn, config = DEFAULT_RETRY_CONFIG) {
  let lastError;
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < config.maxRetries && isRetryable(err)) {
        const delay = computeDelay(attempt, config);
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

// ─── CLIENT FACTORIES ────────────────────────────────────────────────────

/**
 * Create a Heady internal client that ALWAYS bypasses proxies.
 * Used by HCFullPipeline Supervisor for direct agent routing.
 */
function createHeadyInternalClient(baseURL, options = {}) {
  const client = axios.create({
    baseURL,
    timeout: options.timeout || 30000,
    httpAgent: directHttpAgent,
    httpsAgent: directHttpsAgent,
    proxy: false, // CRITICAL: bypass all proxies
    headers: {
      "User-Agent": "HeadyInternalClient/1.0",
      "X-Heady-Internal": "true",
      ...(options.apiKey ? { "X-API-Key": options.apiKey } : {}),
      ...(options.headers || {}),
    },
    ...options.axiosConfig,
  });

  // Add request interceptor for logging
  client.interceptors.request.use((config) => {
    config.metadata = { startTime: Date.now() };
    return config;
  });

  // Add response interceptor for latency tracking
  client.interceptors.response.use(
    (response) => {
      const latency = Date.now() - response.config.metadata.startTime;
      response.latencyMs = latency;
      return response;
    },
    (error) => {
      if (error.config && error.config.metadata) {
        error.latencyMs = Date.now() - error.config.metadata.startTime;
      }
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Create an external client with optional proxy support and circuit breaker.
 * Used for non-Heady domains (Algolia, HuggingFace, GitHub, etc).
 */
function createExternalClient(baseURL, options = {}) {
  const breaker = new CircuitBreaker({
    name: options.name || baseURL,
    failureThreshold: options.failureThreshold || 5,
    resetTimeoutMs: options.resetTimeoutMs || 30000,
    halfOpenMaxRequests: options.halfOpenMaxRequests || 2,
  });

  const client = axios.create({
    baseURL,
    timeout: options.timeout || 30000,
    headers: {
      "User-Agent": "HeadyExternalClient/1.0",
      ...(options.headers || {}),
    },
    ...options.axiosConfig,
  });

  // Wrap requests with circuit breaker and retry
  const originalRequest = client.request.bind(client);
  client.request = async function (config) {
    return breaker.execute(() =>
      retryRequest(() => originalRequest(config), options.retryConfig)
    );
  };

  // Convenience methods that go through the wrapped request
  const methods = ["get", "delete", "head", "options"];
  methods.forEach((method) => {
    client[method] = (url, config) =>
      client.request({ ...config, method, url });
  });
  const dataMethods = ["post", "put", "patch"];
  dataMethods.forEach((method) => {
    client[method] = (url, data, config) =>
      client.request({ ...config, method, url, data });
  });

  client.circuitBreaker = breaker;
  return client;
}

/**
 * Smart client factory: auto-detects internal vs external and creates appropriate client.
 */
function createClient(baseURL, options = {}) {
  try {
    const url = new URL(baseURL);
    if (isInternalDomain(url.hostname)) {
      return createHeadyInternalClient(baseURL, options);
    }
  } catch {
    // If URL parsing fails, treat as internal (likely a relative path)
    return createHeadyInternalClient(baseURL, options);
  }
  return createExternalClient(baseURL, options);
}

module.exports = {
  createHeadyInternalClient,
  createExternalClient,
  createClient,
  isInternalDomain,
  retryRequest,
  INTERNAL_DOMAINS,
  DEFAULT_RETRY_CONFIG,
};
