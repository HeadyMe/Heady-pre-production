/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  gateway/index.js - Unified API Gateway                        ║
 * ║  Versioning, Authentication, Rate Limiting, Structured Errors  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const crypto = require('crypto');
const manifest = require('../../heady-architecture-manifest.json');

// ═══════════════════════════════════════════════════════════════
// TOKEN BUCKET RATE LIMITER
// ═══════════════════════════════════════════════════════════════

class TokenBucket {
  constructor() {
    this.buckets = new Map();
    this.tiers = manifest.rateLimiting.tiers;
    // Cleanup expired buckets every 5 minutes
    setInterval(() => this._cleanup(), 300000);
  }

  _getBucket(key, tier) {
    if (!this.buckets.has(key)) {
      const config = this.tiers[tier] || this.tiers.free;
      this.buckets.set(key, {
        tokens: config.tokensPerHour || 100,
        maxTokens: config.tokensPerHour || 100,
        burstMax: (config.tokensPerHour || 100) * (config.burstMultiplier || 2),
        refillRate: (config.tokensPerHour || 100) / 3600, // tokens per second
        lastRefill: Date.now(),
        tier: tier,
        burstActive: false,
        burstExpires: 0
      });
    }
    return this.buckets.get(key);
  }

  consume(key, tier = 'free', cost = 1) {
    const bucket = this._getBucket(key, tier);
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    const effectiveMax = bucket.burstActive && now < bucket.burstExpires
      ? bucket.burstMax
      : bucket.maxTokens;

    // Refill tokens
    bucket.tokens = Math.min(effectiveMax, bucket.tokens + elapsed * bucket.refillRate);
    bucket.lastRefill = now;

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        limit: bucket.maxTokens,
        resetAt: new Date(now + ((bucket.maxTokens - bucket.tokens) / bucket.refillRate) * 1000).toISOString(),
        tier: bucket.tier
      };
    }

    const retryAfter = Math.ceil((cost - bucket.tokens) / bucket.refillRate);
    return {
      allowed: false,
      remaining: 0,
      limit: bucket.maxTokens,
      resetAt: new Date(now + retryAfter * 1000).toISOString(),
      retryAfterSeconds: retryAfter,
      tier: bucket.tier
    };
  }

  activateBurst(key) {
    const bucket = this.buckets.get(key);
    if (bucket) {
      bucket.burstActive = true;
      bucket.burstExpires = Date.now() + 60000; // 60 second burst
    }
  }

  _cleanup() {
    const now = Date.now();
    const staleThreshold = 3600000; // 1 hour
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.lastRefill > staleThreshold) {
        this.buckets.delete(key);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// JWT AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

class AuthProvider {
  constructor() {
    this.apiKeys = new Map(); // sha256(key) → { tier, scopes, userId, createdAt }
    this.jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
    this.jwtAlgorithm = 'HS256'; // Upgrade to RS256 when key management is in place
  }

  registerApiKey(plainKey, metadata) {
    const hash = crypto.createHash('sha256').update(plainKey).digest('hex');
    this.apiKeys.set(hash, {
      tier: metadata.tier || 'free',
      scopes: metadata.scopes || ['read'],
      userId: metadata.userId,
      createdAt: new Date().toISOString(),
      lastUsed: null
    });
    return hash;
  }

  validateApiKey(plainKey) {
    const hash = crypto.createHash('sha256').update(plainKey).digest('hex');
    const entry = this.apiKeys.get(hash);
    if (!entry) return null;
    entry.lastUsed = new Date().toISOString();
    return { ...entry, keyHash: hash };
  }

  generateJWT(payload, expiresInSeconds = 3600) {
    const header = Buffer.from(JSON.stringify({ alg: this.jwtAlgorithm, typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const body = Buffer.from(JSON.stringify({
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
      iss: 'headysystems.com'
    })).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  verifyJWT(token) {
    try {
      const [header, body, signature] = token.split('.');
      const expectedSig = crypto
        .createHmac('sha256', this.jwtSecret)
        .update(`${header}.${body}`)
        .digest('base64url');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        return { valid: false, error: 'invalid_signature' };
      }

      const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, error: 'token_expired' };
      }

      return { valid: true, payload };
    } catch (e) {
      return { valid: false, error: 'malformed_token' };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// STRUCTURED ERROR SYSTEM
// ═══════════════════════════════════════════════════════════════

class HeadyError {
  static create(code, message, options = {}) {
    return {
      error: {
        code,
        message,
        type: options.type || 'nonRecoverable',
        retryable: options.type === 'transient',
        retryAfterMs: options.retryAfterMs || null,
        traceId: options.traceId || null,
        cause: options.cause || null,
        suggestion: options.suggestion || null,
        rollbackAvailable: options.rollbackAvailable || false,
        rollbackCommand: options.rollbackCommand || null,
        docs: `https://headyio.com/errors/${code}`
      }
    };
  }

  static transient(code, message, retryAfterMs, traceId) {
    return HeadyError.create(code, message, {
      type: 'transient', retryAfterMs, traceId,
      suggestion: `Transient error. Retry in ${Math.ceil(retryAfterMs / 1000)} seconds.`
    });
  }

  static unauthorized(traceId) {
    return HeadyError.create('UNAUTHORIZED', 'Authentication required', {
      type: 'nonRecoverable', traceId,
      suggestion: 'Provide a valid API key via X-Heady-Api-Key header or OAuth2 bearer token.'
    });
  }

  static rateLimited(retryAfterSeconds, tier, traceId) {
    return HeadyError.create('RATE_LIMITED', `Rate limit exceeded for tier: ${tier}`, {
      type: 'transient',
      retryAfterMs: retryAfterSeconds * 1000,
      traceId,
      suggestion: `Retry after ${retryAfterSeconds}s. Upgrade tier at headyio.com/pricing for higher limits.`
    });
  }

  static notFound(resource, traceId) {
    return HeadyError.create('NOT_FOUND', `Resource not found: ${resource}`, {
      type: 'nonRecoverable', traceId,
      suggestion: `Check the resource path. API docs at headyio.com/docs.`
    });
  }

  static internal(message, traceId) {
    return HeadyError.create('INTERNAL_ERROR', message, {
      type: 'infrastructure', traceId,
      suggestion: 'This is a server error. The team has been notified. Try again shortly.'
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE ENVELOPE
// ═══════════════════════════════════════════════════════════════

function envelope(data, req, options = {}) {
  const traceId = req.traceId || req.headers?.['x-heady-trace-id'] || generateTraceId();
  return {
    data: data,
    meta: {
      requestId: generateRequestId(),
      traceId: traceId,
      version: 'v1',
      timestamp: new Date().toISOString(),
      service: process.env.HEADY_LAYER || 'headysystems',
      ...(options.rateLimit ? { rateLimit: options.rateLimit } : {})
    },
    ...(options.pagination ? { pagination: options.pagination } : {}),
    errors: options.errors || [],
    links: options.links || {}
  };
}

function generateTraceId() {
  return `hdy-${crypto.randomUUID()}`;
}

function generateRequestId() {
  return `req-${crypto.randomUUID()}`;
}

// ═══════════════════════════════════════════════════════════════
// GATEWAY MIDDLEWARE FACTORY
// ═══════════════════════════════════════════════════════════════

class HeadyGateway {
  constructor() {
    this.rateLimiter = new TokenBucket();
    this.auth = new AuthProvider();
    this.requestLog = [];
    this.maxLogSize = 10000;
  }

  // Trace ID injection middleware
  traceMiddleware() {
    return (req, res, next) => {
      req.traceId = req.headers['x-heady-trace-id'] || generateTraceId();
      req.requestId = generateRequestId();
      req.startTime = Date.now();
      res.setHeader('X-Heady-Trace-Id', req.traceId);
      res.setHeader('X-Heady-Request-Id', req.requestId);
      next();
    };
  }

  // Authentication middleware
  authMiddleware(options = { required: true }) {
    return (req, res, next) => {
      // Try API key first
      const apiKey = req.headers['x-heady-api-key'];
      if (apiKey) {
        const keyData = this.auth.validateApiKey(apiKey);
        if (keyData) {
          req.auth = { method: 'api_key', ...keyData };
          req.tier = keyData.tier;
          return next();
        }
      }

      // Try Bearer token (JWT)
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const result = this.auth.verifyJWT(token);
        if (result.valid) {
          req.auth = { method: 'jwt', ...result.payload };
          req.tier = result.payload.tier || 'free';
          return next();
        }
      }

      // No valid auth
      if (options.required) {
        return res.status(401).json(HeadyError.unauthorized(req.traceId));
      }

      req.auth = null;
      req.tier = 'free';
      next();
    };
  }

  // Rate limiting middleware
  rateLimitMiddleware() {
    return (req, res, next) => {
      const key = req.auth?.keyHash || req.auth?.userId || req.ip || 'anonymous';
      const tier = req.tier || 'free';
      const result = this.rateLimiter.consume(key, tier);

      // Always set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetAt);
      res.setHeader('X-RateLimit-Tier', result.tier);

      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfterSeconds);
        return res.status(429).json(
          HeadyError.rateLimited(result.retryAfterSeconds, result.tier, req.traceId)
        );
      }

      req.rateLimit = result;
      next();
    };
  }

  // API versioning middleware
  versionMiddleware() {
    return (req, res, next) => {
      const versionMatch = req.path.match(/^\/api\/(v\d+)\//);
      if (versionMatch) {
        const version = versionMatch[1];
        const supported = manifest.apiVersioning.supported;
        if (!supported.includes(version)) {
          return res.status(400).json(
            HeadyError.create('UNSUPPORTED_VERSION', `API version ${version} is not supported. Supported: ${supported.join(', ')}`, {
              type: 'nonRecoverable',
              traceId: req.traceId,
              suggestion: `Use one of: ${supported.map(v => `/api/${v}/`).join(', ')}`
            })
          );
        }
        req.apiVersion = version;

        // Add sunset header for deprecated versions
        if (version !== manifest.apiVersioning.current) {
          const sunsetDate = new Date();
          sunsetDate.setMonth(sunsetDate.getMonth() + 6);
          res.setHeader('Sunset', sunsetDate.toUTCString());
          res.setHeader('Deprecation', 'true');
        }
      }
      next();
    };
  }

  // Security headers middleware
  securityMiddleware() {
    return (req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '0');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Content-Security-Policy', "default-src 'self'");
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      next();
    };
  }

  // CORS middleware
  corsMiddleware() {
    const allowedOrigins = Object.keys(manifest.domains).map(d => `https://${d}`);
    return (req, res, next) => {
      const origin = req.headers.origin;
      if (origin && allowedOrigins.some(o => origin.startsWith(o))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Heady-Api-Key, X-Heady-Trace-Id');
      res.setHeader('Access-Control-Expose-Headers', 'X-Heady-Trace-Id, X-Heady-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Tier, Retry-After, Sunset, Deprecation');
      res.setHeader('Access-Control-Max-Age', '86400');
      if (req.method === 'OPTIONS') return res.status(204).end();
      next();
    };
  }

  // Request logging middleware
  logMiddleware() {
    return (req, res, next) => {
      const originalEnd = res.end;
      res.end = (...args) => {
        const entry = {
          timestamp: new Date().toISOString(),
          traceId: req.traceId,
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Date.now() - req.startTime,
          tier: req.tier || 'free',
          service: process.env.HEADY_LAYER || 'headysystems',
          component: req.path.split('/')[3] || 'root',
          userId: req.auth?.userId ? crypto.createHash('sha256').update(req.auth.userId).digest('hex').slice(0, 16) : null
        };
        this.requestLog.push(entry);
        if (this.requestLog.length > this.maxLogSize) {
          this.requestLog = this.requestLog.slice(-this.maxLogSize / 2);
        }
        // Structured JSON log to stdout (Render log drain picks this up)
        if (process.env.NODE_ENV !== 'test') {
          console.log(JSON.stringify(entry));
        }
        originalEnd.apply(res, args);
      };
      next();
    };
  }

  // Apply all gateway middleware to an Express app
  applyTo(app) {
    app.use(this.traceMiddleware());
    app.use(this.securityMiddleware());
    app.use(this.corsMiddleware());
    app.use(this.versionMiddleware());
    app.use(this.logMiddleware());
    return this;
  }

  // Create protected route handler
  protected(scopes = []) {
    return [
      this.authMiddleware({ required: true }),
      this.rateLimitMiddleware(),
      (req, res, next) => {
        if (scopes.length > 0 && req.auth) {
          const hasScope = scopes.some(s => (req.auth.scopes || []).includes(s));
          if (!hasScope) {
            return res.status(403).json(
              HeadyError.create('FORBIDDEN', `Required scopes: ${scopes.join(', ')}`, {
                type: 'nonRecoverable',
                traceId: req.traceId,
                suggestion: `Your API key needs these scopes: ${scopes.join(', ')}. Update at headyio.com/dashboard.`
              })
            );
          }
        }
        next();
      }
    ];
  }

  // Create public route handler (with rate limiting but no auth)
  public() {
    return [
      this.authMiddleware({ required: false }),
      this.rateLimitMiddleware()
    ];
  }

  getStats() {
    return {
      totalRequests: this.requestLog.length,
      activeBuckets: this.rateLimiter.buckets.size,
      registeredKeys: this.auth.apiKeys.size,
      recentErrors: this.requestLog.filter(r => r.status >= 400).slice(-20)
    };
  }
}

module.exports = { HeadyGateway, HeadyError, TokenBucket, AuthProvider, envelope, generateTraceId };
