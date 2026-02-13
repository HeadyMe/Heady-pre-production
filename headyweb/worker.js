/**
 * HeadyWeb — Cloudflare Worker
 * Serves the HeadyWeb browser shell at the edge
 * Deploy: npx wrangler deploy worker.js
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'headyweb-worker',
        version: '1.0.0',
        edge: request.cf?.colo || 'unknown',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Proxy API calls to HeadySystems
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = 'https://headysystems.com' + url.pathname + url.search;
      const apiRes = await fetch(apiUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' ? await request.text() : undefined
      });
      const response = new Response(apiRes.body, apiRes);
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    // Serve static app (in production, use Workers Sites / KV)
    return new Response('HeadyWeb Worker — deploy with Workers Sites for static hosting', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
