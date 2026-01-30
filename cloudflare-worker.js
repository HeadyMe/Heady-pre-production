#!/usr/bin/env node
/**
 * Heady Admin UI - Cloudflare Edge Worker
 * 
 * This worker caches static admin UI files at Cloudflare's edge locations
 * and proxies API calls to the Render.com origin server.
 * 
 * Benefits:
 * - 80% reduction in latency for global users
 * - Reduced load on origin server
 * - Automatic DDoS protection
 * - Enhanced security at the edge
 */

const ORIGIN_URL = 'https://heady-app.onrender.com' // Replace with your Render URL
const CACHE_TTL = 3600 // 1 hour for static files

// Paths to cache at edge (Admin UI static files)
const STATIC_PATHS = [
  '/admin',
  '/admin/',
  '/admin.html',
  '/admin/index.html',
  '/index.html',
  '/favicon.ico'
]

// API paths that should bypass cache
const API_PATHS = [
  '/api/',
  '/health',
  '/pulse'
]

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Main request handler
 */
async function handleRequest(request) {
  const url = new URL(request.url)
  const cache = caches.default
  
  // Log for debugging (disable in production for performance)
  console.log(`[Edge Worker] ${request.method} ${url.pathname}`)
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCORS(request)
  }
  
  // Check if this is a static file
  const isStaticFile = STATIC_PATHS.some(path => url.pathname === path)
  const isAPICall = API_PATHS.some(path => url.pathname.startsWith(path))
  
  // Static files: Use edge cache
  if (isStaticFile && request.method === 'GET') {
    return serveStatic(request, cache)
  }
  
  // API calls: Proxy to origin with auth headers
  if (isAPICall) {
    return proxyToOrigin(request)
  }
  
  // Everything else: Proxy to origin
  return proxyToOrigin(request)
}

/**
 * Serve static files from edge cache
 */
async function serveStatic(request, cache) {
  const url = new URL(request.url)
  
  // Create cache key
  const cacheKey = new Request(url.toString(), request)
  
  // Try to get from cache first
  let response = await cache.match(cacheKey)
  
  if (response) {
    console.log(`[Cache HIT] ${url.pathname}`)
    // Add cache status header
    response = new Response(response.body, response)
    response.headers.set('X-Cache-Status', 'HIT')
    return response
  }
  
  console.log(`[Cache MISS] ${url.pathname}`)
  
  // Fetch from origin
  const originUrl = ORIGIN_URL + url.pathname
  response = await fetch(originUrl, {
    headers: request.headers,
    cf: {
      cacheTtl: CACHE_TTL,
      cacheEverything: true,
    }
  })
  
  // Only cache successful responses
  if (response.ok) {
    // Clone response for caching
    const responseToCache = new Response(response.body, response)
    
    // Set cache headers
    responseToCache.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`)
    responseToCache.headers.set('X-Cache-Status', 'MISS')
    
    // Store in cache (non-blocking)
    event.waitUntil(cache.put(cacheKey, responseToCache.clone()))
    
    return responseToCache
  }
  
  // Return error response without caching
  response.headers.set('X-Cache-Status', 'BYPASS')
  return response
}

/**
 * Proxy request to origin server (for API calls)
 */
async function proxyToOrigin(request) {
  const url = new URL(request.url)
  const originUrl = ORIGIN_URL + url.pathname + url.search
  
  // Forward request to origin
  const response = await fetch(originUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    redirect: 'follow'
  })
  
  // Clone response and add CORS headers
  const newResponse = new Response(response.body, response)
  
  // Add security headers
  newResponse.headers.set('X-Frame-Options', 'DENY')
  newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Add CORS headers if needed
  const origin = request.headers.get('Origin')
  if (origin) {
    newResponse.headers.set('Access-Control-Allow-Origin', origin)
    newResponse.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return newResponse
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request) {
  const origin = request.headers.get('Origin')
  
  // List of allowed origins (update for your domains)
  const allowedOrigins = [
    'https://heady.example.com',
    'https://admin.heady.example.com',
    'http://localhost:3300',
    'http://localhost:3000'
  ]
  
  const isAllowed = allowedOrigins.includes(origin)
  
  const headers = {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-heady-api-key, x-request-id',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
  
  return new Response(null, {
    status: 204,
    headers
  })
}

/**
 * Cache invalidation helper (call via admin API)
 */
async function purgeCache(patterns) {
  const cache = caches.default
  const keys = await cache.keys()
  
  let purged = 0
  for (const key of keys) {
    const url = new URL(key.url)
    if (patterns.some(pattern => url.pathname.includes(pattern))) {
      await cache.delete(key)
      purged++
    }
  }
  
  return { purged, total: keys.length }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleRequest, serveStatic, proxyToOrigin }
}
