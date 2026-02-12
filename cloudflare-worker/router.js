/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  cloudflare-worker/router.js - Unified Edge Router             ║
 * ║  Domain routing, caching, rate limiting, circuit breaker       ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const ROUTE_MAP = {
  'headysystems.com':        { envKey: 'RENDER_HEADYSYSTEMS',    layer: 'headysystems' },
  'api.headysystems.com':    { envKey: 'RENDER_HEADYSYSTEMS',    layer: 'headysystems' },
  'staging.headysystems.com':{ envKey: 'RENDER_HEADYSYSTEMS',    layer: 'headysystems', staging: true },
  'headycloud.com':          { envKey: 'RENDER_HEADYME',         layer: 'headyme' },
  'collab.headycloud.com':   { envKey: 'RENDER_HEADYME',         layer: 'headyme', ws: true },
  'headyconnection.com':     { envKey: 'RENDER_HEADYCONNECTION', layer: 'headyconnection' },
  'dev.headyconnection.org': { envKey: 'RENDER_HEADYCONNECTION', layer: 'headyconnection', dev: true },
  'headymcp.com':            { envKey: 'RENDER_HEADYSYSTEMS',    layer: 'headysystems' },
  'headybot.com':            { envKey: 'RENDER_HEADYME',         layer: 'headyme' },
  'headycheck.com':          { envKey: 'RENDER_HEADYSYSTEMS',    layer: 'headysystems' },
  'headyio.com':             { envKey: 'RENDER_HEADYSYSTEMS',    layer: 'headysystems' },
  'headybuddy.org':          { envKey: 'RENDER_HEADYME',         layer: 'headyme' },
};

const REDIRECTS = {
  'headyconnection.org':    'https://headyconnection.com',
  'www.headysystems.com':   'https://headysystems.com',
  'www.headycloud.com':     'https://headycloud.com',
  'www.headybuddy.org':     'https://headybuddy.org',
  'www.headyconnection.com':'https://headyconnection.com',
  'www.headymcp.com':       'https://headymcp.com',
  'www.headybot.com':       'https://headybot.com',
  'www.headycheck.com':     'https://headycheck.com',
  'www.headyio.com':        'https://headyio.com',
};

const CACHE_RULES = {
  '/api/v1/skills':         { ttl: 300,  swr: 60 },
  '/api/v1/health':         { ttl: 30,   swr: 10 },
  '/api/v1/mcp/connectors': { ttl: 300,  swr: 60 },
  '/api/v1/docs':           { ttl: 3600, swr: 300 },
};

const ALLOWED_ORIGINS = Object.keys(ROUTE_MAP).map(d => `https://${d}`);

function genTraceId() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  const h = Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
  return `hdy-${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16)}`;
}

function securityHeaders(h) {
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('X-Frame-Options', 'DENY');
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  h.delete('Server');
  h.delete('X-Powered-By');
  return h;
}

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Heady-Api-Key, X-Heady-Trace-Id',
    'Access-Control-Expose-Headers': 'X-Heady-Trace-Id, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Tier, Retry-After, Sunset',
    'Access-Control-Max-Age': '86400',
  };
  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function jsonError(code, message, status, opts = {}) {
  return new Response(JSON.stringify({
    error: {
      code, message,
      type: opts.type || 'nonRecoverable',
      retryable: opts.type === 'transient',
      retryAfterMs: opts.retryAfterMs || null,
      traceId: opts.traceId || null,
      suggestion: opts.suggestion || null,
      docs: `https://headyio.com/errors/${code}`
    }
  }), {
    status,
    headers: { 'Content-Type': 'application/json', ...(opts.extraHeaders || {}) }
  });
}

// Circuit breaker state per origin (in-memory per worker isolate)
const circuitState = {};

function checkCircuit(origin) {
  const s = circuitState[origin];
  if (!s) return { ok: true };
  if (s.state === 'open') {
    if (Date.now() - s.openedAt > 30000) {
      s.state = 'half-open';
      return { ok: true, halfOpen: true };
    }
    return { ok: false };
  }
  return { ok: true };
}

function recordOriginResult(origin, success) {
  if (!circuitState[origin]) {
    circuitState[origin] = { failures: 0, state: 'closed', openedAt: 0 };
  }
  const s = circuitState[origin];
  if (success) {
    s.failures = 0;
    s.state = 'closed';
  } else {
    s.failures++;
    if (s.failures >= 5) {
      s.state = 'open';
      s.openedAt = Date.now();
    }
  }
}

// Rate limiter (in-memory per isolate, KV-backed if available)
const rateBuckets = {};

function rateCheck(key, limit = 100) {
  const window = Math.floor(Date.now() / 3600000);
  const k = `${key}:${window}`;
  rateBuckets[k] = (rateBuckets[k] || 0) + 1;
  const count = rateBuckets[k];
  if (count > limit) {
    return { allowed: false, remaining: 0, limit, retryAfter: Math.ceil(3600 - (Date.now() / 1000) % 3600) };
  }
  return { allowed: true, remaining: limit - count, limit };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    const traceId = request.headers.get('X-Heady-Trace-Id') || genTraceId();
    const origin = request.headers.get('Origin');

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Handle redirects
    if (REDIRECTS[host]) {
      return Response.redirect(REDIRECTS[host] + url.pathname + url.search, 301);
    }

    // Find route
    const route = ROUTE_MAP[host];
    if (!route) {
      return jsonError('DOMAIN_NOT_FOUND', `Unknown domain: ${host}`, 404, {
        traceId, suggestion: 'Check the domain. Valid domains: headysystems.com, headycloud.com, headyconnection.com, headymcp.com, headybot.com, headycheck.com, headyio.com, headybuddy.org'
      });
    }

    // Resolve origin URL from env
    const originBase = env[route.envKey];
    if (!originBase) {
      return jsonError('ORIGIN_NOT_CONFIGURED', `Origin not configured for ${host}`, 503, {
        traceId, type: 'infrastructure',
        suggestion: 'The backend service is not configured. Contact support.'
      });
    }

    // Rate limiting (by IP)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const tier = request.headers.get('X-Heady-Tier') || 'free';
    const tierLimits = { free: 100, nonprofit: 10000, indie: 5000, pro: 50000, enterprise: 999999 };
    const rl = rateCheck(clientIP, tierLimits[tier] || 100);
    if (!rl.allowed) {
      return jsonError('RATE_LIMITED', `Rate limit exceeded`, 429, {
        traceId, type: 'transient',
        retryAfterMs: rl.retryAfter * 1000,
        suggestion: `Retry in ${rl.retryAfter}s. Upgrade at headyio.com/pricing.`,
        extraHeaders: { 'Retry-After': String(rl.retryAfter) }
      });
    }

    // Circuit breaker check
    const cb = checkCircuit(route.envKey);
    if (!cb.ok) {
      return jsonError('SERVICE_UNAVAILABLE', `Backend temporarily unavailable for ${host}`, 503, {
        traceId, type: 'transient', retryAfterMs: 30000,
        suggestion: 'The backend is recovering. Retry in 30 seconds.'
      });
    }

    // Build origin request
    const originUrl = new URL(url.pathname + url.search, originBase);
    const originHeaders = new Headers(request.headers);
    originHeaders.set('X-Heady-Trace-Id', traceId);
    originHeaders.set('X-Heady-Domain', host);
    originHeaders.set('X-Heady-Layer', route.layer);
    originHeaders.set('X-Forwarded-Host', host);

    // Check cache rules
    const cacheRule = Object.entries(CACHE_RULES).find(([path]) => url.pathname.startsWith(path));
    
    try {
      let response;

      if (cacheRule && request.method === 'GET') {
        const [, rule] = cacheRule;
        const cache = caches.default;
        const cacheKey = new Request(request.url, { method: 'GET' });
        response = await cache.match(cacheKey);

        if (response) {
          const h = new Headers(response.headers);
          h.set('X-Heady-Cache', 'HIT');
          h.set('X-Heady-Trace-Id', traceId);
          response = new Response(response.body, { status: response.status, headers: securityHeaders(h) });
        } else {
          response = await fetch(originUrl.toString(), {
            method: request.method,
            headers: originHeaders,
            body: request.method !== 'GET' ? request.body : undefined
          });

          if (response.ok) {
            const h = new Headers(response.headers);
            h.set('Cache-Control', `s-maxage=${rule.ttl}, stale-while-revalidate=${rule.swr || 0}`);
            h.set('X-Heady-Cache', 'MISS');
            const cached = new Response(response.clone().body, { status: response.status, headers: h });
            await cache.put(cacheKey, cached);
          }
        }
      } else {
        response = await fetch(originUrl.toString(), {
          method: request.method,
          headers: originHeaders,
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body
        });
      }

      recordOriginResult(route.envKey, response.ok);

      // Apply security + CORS + trace headers
      const finalHeaders = securityHeaders(new Headers(response.headers));
      const cors = corsHeaders(origin);
      for (const [k, v] of Object.entries(cors)) finalHeaders.set(k, v);
      finalHeaders.set('X-Heady-Trace-Id', traceId);
      finalHeaders.set('X-RateLimit-Remaining', String(rl.remaining));
      finalHeaders.set('X-RateLimit-Limit', String(rl.limit));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: finalHeaders
      });

    } catch (err) {
      recordOriginResult(route.envKey, false);

      // Retry once for transient errors
      if (!cb.halfOpen) {
        try {
          const retryResponse = await fetch(originUrl.toString(), {
            method: request.method,
            headers: originHeaders,
            body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body
          });
          recordOriginResult(route.envKey, retryResponse.ok);
          const h = securityHeaders(new Headers(retryResponse.headers));
          h.set('X-Heady-Trace-Id', traceId);
          h.set('X-Heady-Retry', '1');
          return new Response(retryResponse.body, { status: retryResponse.status, headers: h });
        } catch (retryErr) {
          recordOriginResult(route.envKey, false);
        }
      }

      return jsonError('ORIGIN_UNREACHABLE', `Could not reach backend for ${host}`, 502, {
        traceId, type: 'infrastructure',
        suggestion: 'The backend service may be restarting. Try again in 30 seconds.'
      });
    }
  }
};
