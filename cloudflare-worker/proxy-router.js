// ╔══════════════════════════════════════════════════════════════════╗
// ║  HEADY SYSTEMS — Proxy Worker Router                              ║
// ║  ∞ Sacred Geometry ∞                                             ║
// ║  Bypasses DNS zones by proxying all domains to Render            ║
// ╚══════════════════════════════════════════════════════════════════╝

const RENDER_SERVICES = {
  'headysystems.com': 'https://heady-manager-headysystems.onrender.com',
  'headymcp.com': 'https://heady-manager-headysystems.onrender.com',
  'headycheck.com': 'https://heady-manager-headysystems.onrender.com',
  'headyio.com': 'https://heady-manager-headysystems.onrender.com',
  'headycloud.com': 'https://heady-manager-headyme.onrender.com',
  'headybot.com': 'https://heady-manager-headyme.onrender.com',
  'headybuddy.org': 'https://heady-manager-headyme.onrender.com',
  'headyconnection.com': 'https://heady-manager-headyconnection.onrender.com',
  'headyconnection.org': 'https://heady-manager-headyconnection.onrender.com'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    // Route to appropriate Render service
    const targetUrl = RENDER_SERVICES[hostname] || RENDER_SERVICES['headysystems.com'];
    
    // Create new request with target URL
    const target = new URL(targetUrl + url.pathname + url.search);
    
    const newRequest = new Request(target, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });
    
    // Add custom headers
    newRequest.headers.set('X-Forwarded-Host', hostname);
    newRequest.headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || 'unknown');
    newRequest.headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP') || 'unknown');
    
    try {
      const response = await fetch(newRequest);
      
      // Add CORS headers
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return newResponse;
    } catch (error) {
      return new Response(`Proxy Error: ${error.message}`, { status: 502 });
    }
  }
};
