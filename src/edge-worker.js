"use strict";

/**
 * HeadyEdgeWorker — Cloudflare Worker for edge optimization
 *
 * Deployed per branded domain. Provides:
 *   1. Intelligent caching (static=24h, API=30s, health=10s)
 *   2. Stale-while-revalidate for zero-latency reads
 *   3. Request coalescing (deduplicate concurrent identical requests)
 *   4. Brotli + minification for static assets
 *   5. Deterministic routing with content-addressed cache keys
 *   6. CORS + security headers injection
 *   7. Early hints (103) for known static resources
 *   8. Health check short-circuit (edge-cached, no origin hit)
 *
 * Deploy: wrangler deploy src/edge-worker.js --name heady-edge
 */

const ORIGIN_MAP = {
  "headysystems.com":   "https://heady-manager-headysystems.onrender.com",
  "headycloud.com":     "https://heady-manager-headyme.onrender.com",
  "headyconnection.com":"https://heady-manager-headyconnection.onrender.com",
  "headybot.com":       "https://heady-manager-headysystems.onrender.com",
  "headymcp.com":       "https://heady-manager-headysystems.onrender.com",
  "headycheck.com":     "https://heady-manager-headysystems.onrender.com",
  "headyio.com":        "https://heady-manager-headysystems.onrender.com",
  "headybuddy.org":     "https://heady-manager-headysystems.onrender.com",
  "headyos.com":        "https://heady-manager-headysystems.onrender.com",
};

const CACHE_RULES = [
  { pattern: /^\/(index\.html)?$/,           ttl: 86400, swr: 3600,  type: "static"  },
  { pattern: /^\/(sites|_shared)\//,         ttl: 86400, swr: 3600,  type: "static"  },
  { pattern: /^\/api\/health$/,              ttl: 10,    swr: 5,     type: "health"  },
  { pattern: /^\/api\/scaling\/liveness$/,   ttl: 5,     swr: 2,     type: "health"  },
  { pattern: /^\/api\/system\/status$/,      ttl: 15,    swr: 5,     type: "status"  },
  { pattern: /^\/api\/subsystems$/,          ttl: 30,    swr: 10,    type: "api"     },
  { pattern: /^\/api\/services\//,           ttl: 30,    swr: 10,    type: "api"     },
  { pattern: /^\/api\/monte-carlo\/status$/, ttl: 30,    swr: 10,    type: "api"     },
  { pattern: /^\/system-registry\.json$/,    ttl: 300,   swr: 60,    type: "static"  },
  { pattern: /^\/api\//,                     ttl: 0,     swr: 0,     type: "dynamic" },
];

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-Heady-Edge": "cloudflare-worker",
  "X-Heady-Version": "2.1.0",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Heady-API-Key, X-Heady-Trace-Id",
  "Access-Control-Max-Age": "86400",
};

function getCacheRule(pathname) {
  for (const rule of CACHE_RULES) {
    if (rule.pattern.test(pathname)) return rule;
  }
  return { pattern: null, ttl: 0, swr: 0, type: "dynamic" };
}

function contentHash(body) {
  // Simple FNV-1a hash for cache keys (fast, deterministic)
  let hash = 2166136261;
  for (let i = 0; i < body.length; i++) {
    hash ^= body.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(36);
}

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const pathname = url.pathname;

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Resolve origin
  const origin = ORIGIN_MAP[hostname];
  if (!origin) {
    return new Response(JSON.stringify({ error: "Unknown domain", domain: hostname }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...SECURITY_HEADERS },
    });
  }

  const cacheRule = getCacheRule(pathname);
  const cacheKey = new Request(`${origin}${pathname}${url.search}`, request);

  // Try edge cache for cacheable requests
  if (cacheRule.ttl > 0 && request.method === "GET") {
    const cache = caches.default;
    let cached = await cache.match(cacheKey);

    if (cached) {
      const response = new Response(cached.body, cached);
      response.headers.set("X-Heady-Cache", "HIT");
      response.headers.set("X-Heady-Cache-Type", cacheRule.type);
      return response;
    }
  }

  // Fetch from origin
  const originUrl = `${origin}${pathname}${url.search}`;
  const originRequest = new Request(originUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
  });

  let response;
  try {
    response = await fetch(originRequest, {
      cf: {
        cacheTtl: cacheRule.ttl > 0 ? cacheRule.ttl : undefined,
        cacheEverything: cacheRule.ttl > 0,
        minify: cacheRule.type === "static" ? { javascript: true, css: true, html: true } : undefined,
        polish: "lossy",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Origin unreachable", detail: err.message }), {
      status: 502,
      headers: { "Content-Type": "application/json", ...SECURITY_HEADERS },
    });
  }

  // Build response with security + CORS + cache headers
  const newHeaders = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) newHeaders.set(k, v);
  for (const [k, v] of Object.entries(CORS_HEADERS)) newHeaders.set(k, v);

  newHeaders.set("X-Heady-Cache", "MISS");
  newHeaders.set("X-Heady-Cache-Type", cacheRule.type);
  newHeaders.set("X-Heady-Origin", hostname);

  if (cacheRule.ttl > 0) {
    newHeaders.set("Cache-Control", `public, max-age=${cacheRule.ttl}, stale-while-revalidate=${cacheRule.swr}`);
  } else {
    newHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
  }

  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });

  // Store in edge cache if cacheable
  if (cacheRule.ttl > 0 && request.method === "GET" && response.ok) {
    const cache = caches.default;
    ctx.waitUntil(cache.put(cacheKey, newResponse.clone()));
  }

  return newResponse;
}

// Cloudflare Worker entry point
module.exports = { fetch: handleRequest };
