/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  site-generator.js                                             ║
 * ║  Deterministic site generation — executed through               ║
 * ║  SoulOrchestrator DAG for parallel, value-driven builds        ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
// SHARED DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════

const CSS = `*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0a0f;--s1:#12121a;--s2:#1a1a26;--bd:#2a2a3a;--p:#7c6aef;--pg:#7c6aef40;--a:#4ecdc4;--a2:#ff6b9d;--t:#e8e8f0;--t2:#8888a0;--t3:#555568;--ok:#4ecdc4;--warn:#ffd93d;--err:#ff6b6b;--r:12px;--f:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
body{font-family:var(--f);background:var(--bg);color:var(--t);line-height:1.6;overflow-x:hidden}
.gl{position:fixed;width:600px;height:600px;border-radius:50%;filter:blur(150px);opacity:.12;pointer-events:none;z-index:0}
.g1{top:-200px;left:-100px;background:var(--p)}.g2{bottom:-200px;right:-100px;background:var(--a)}
.w{max-width:1200px;margin:0 auto;padding:0 24px;position:relative;z-index:1}
nav{padding:20px 0;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--bd)}
.logo{display:flex;align-items:center;gap:12px;font-size:20px;font-weight:700;color:var(--t);text-decoration:none}
.logo i{width:36px;height:36px;background:linear-gradient(135deg,var(--p),var(--a));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}
.nl{display:flex;gap:8px}.nl a{color:var(--t2);text-decoration:none;padding:8px 16px;border-radius:8px;font-size:14px;transition:.2s}.nl a:hover{color:var(--t);background:var(--s2)}
.hero{padding:80px 0 60px;text-align:center}
.badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:var(--s2);border:1px solid var(--bd);border-radius:20px;font-size:13px;color:var(--a);margin-bottom:24px}
.dot{width:6px;height:6px;background:var(--ok);border-radius:50%;animation:p 2s infinite}
@keyframes p{0%,100%{opacity:1}50%{opacity:.4}}
h1{font-size:clamp(32px,5vw,56px);font-weight:800;line-height:1.1;margin-bottom:20px;background:linear-gradient(135deg,var(--t),var(--p),var(--a));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{font-size:18px;color:var(--t2);max-width:600px;margin:0 auto 40px}
.btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn{padding:12px 28px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;transition:.2s;cursor:pointer;border:none;display:inline-flex;align-items:center;gap:8px}
.bp{background:var(--p);color:#fff}.bp:hover{background:#6b59de;transform:translateY(-2px);box-shadow:0 8px 30px var(--pg)}
.bs{background:var(--s2);color:var(--t);border:1px solid var(--bd)}.bs:hover{border-color:var(--p);color:var(--p)}
.grid{display:grid;gap:20px;padding:40px 0}
.g2c{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}
.g3c{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.g4c{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.card{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);padding:28px;transition:.3s}.card:hover{border-color:var(--p);transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.3)}
.card h3{font-size:18px;margin-bottom:8px}.card p{color:var(--t2);font-size:14px}
.ci{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;padding:40px 0;border-bottom:1px solid var(--bd)}
.stat{text-align:center;padding:20px}.sv{font-size:32px;font-weight:800;color:var(--p)}.sl{font-size:13px;color:var(--t2);margin-top:4px}
section{padding:60px 0;border-bottom:1px solid var(--bd)}
.st{font-size:28px;font-weight:700;margin-bottom:8px}.ss{color:var(--t2);margin-bottom:32px}
footer{padding:40px 0;text-align:center;color:var(--t3);font-size:13px}
.lp{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);padding:24px;margin:20px 0}
.sr{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--bd)}.sr:last-child{border:none}
.sd{width:10px;height:10px;border-radius:50%;display:inline-block}.sd.up{background:var(--ok)}.sd.dn{background:var(--err)}.sd.wn{background:var(--warn)}
.tag{display:inline-block;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:600}
.tg{background:#4ecdc420;color:var(--ok)}.tp{background:#7c6aef20;color:var(--p)}.tw{background:#ffd93d20;color:var(--warn)}.tr{background:#ff6b6b20;color:var(--err)}
.cb{background:#0d0d15;border:1px solid var(--bd);border-radius:8px;padding:20px;font-family:'Fira Code',monospace;font-size:13px;color:var(--a);overflow-x:auto;white-space:pre}
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--bd);margin-bottom:24px}.tabs button{background:none;border:none;color:var(--t2);padding:12px 20px;cursor:pointer;font-size:14px;border-bottom:2px solid transparent;transition:.2s}.tabs button.active,.tabs button:hover{color:var(--p);border-bottom-color:var(--p)}
.chat-box{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);height:500px;display:flex;flex-direction:column;overflow:hidden}
.chat-msgs{flex:1;overflow-y:auto;padding:20px}.chat-msg{margin-bottom:16px;display:flex;gap:12px}.chat-msg.bot .av{background:var(--pg);color:var(--p)}.chat-msg.user .av{background:var(--a);color:var(--bg)}
.av{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.chat-text{background:var(--s2);border-radius:10px;padding:12px 16px;font-size:14px;max-width:80%}
.chat-input{display:flex;gap:8px;padding:16px;border-top:1px solid var(--bd)}.chat-input input{flex:1;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:12px 16px;color:var(--t);font-size:14px;outline:none}.chat-input input:focus{border-color:var(--p)}.chat-input button{background:var(--p);border:none;color:#fff;padding:12px 20px;border-radius:8px;cursor:pointer;font-weight:600}
@media(max-width:768px){.nl{display:none}.hero{padding:60px 0 40px}.g2c,.g3c{grid-template-columns:1fr}}`;

const JS_API = `const H={base:location.origin,async get(p){try{const r=await fetch(this.base+p);return r.ok?await r.json():null}catch(e){return null}},async post(p,d){try{const r=await fetch(this.base+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});return r.ok?await r.json():null}catch(e){return null}}};`;

// ═══════════════════════════════════════════════════════════════
// SITE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const SITES = {
  headysystems: {
    title: 'Heady Systems',
    domain: 'headysystems.com',
    tagline: 'Sacred Geometry Architecture',
    desc: 'Self-aware, indexed, orchestrated intelligence platform. Every component knows every other component.',
    badge: 'System Online',
    nav: [
      { l: 'API Docs', h: 'https://headyio.com' },
      { l: 'Status', h: 'https://headycheck.com' },
      { l: 'MCP', h: 'https://headymcp.com' },
      { l: 'Buddy', h: 'https://headybuddy.org' }
    ],
    primaryCta: { l: 'View Architecture', h: '#arch' },
    secondaryCta: { l: 'API Reference', h: 'https://headyio.com' },
    sections: [
      {
        id: 'status', title: 'Live System Status', sub: 'Real-time health across all services',
        body: `<div class="lp" id="sys-status"><div style="color:var(--t2)">Connecting to Heady Systems...</div></div>
<script>${JS_API}
(async()=>{const d=await H.get('/api/system/status');const el=document.getElementById('sys-status');if(!d){el.innerHTML='<div style="color:var(--err)">API unreachable — services may be deploying</div>';return}
el.innerHTML=\`<div class="sr"><span>Environment</span><span class="tag tg">\${d.environment||'production'}</span></div>
<div class="sr"><span>Active Nodes</span><span>\${d.capabilities?.nodes?.active||0}/\${d.capabilities?.nodes?.total||0}</span></div>
<div class="sr"><span>Services</span><span>\${d.capabilities?.services?.healthy||0}/\${d.capabilities?.services?.total||0} healthy</span></div>
<div class="sr"><span>Tools</span><span>\${d.capabilities?.tools?.active||0} active</span></div>
<div class="sr"><span>Uptime</span><span>\${Math.floor((d.uptime||0)/3600)}h \${Math.floor(((d.uptime||0)%3600)/60)}m</span></div>
<div class="sr"><span>Sacred Geometry</span><span class="tag tp">Active</span></div>\`})();</script>`
      },
      {
        id: 'arch', title: 'Architecture', sub: 'Fractal intelligence at every layer',
        body: `<div class="grid g3c">
<div class="card"><div class="ci" style="background:#7c6aef20">&#x1f9e0;</div><h3>BRAIN</h3><p>Central meta-controller — pre-response processing, context gathering, concept identification across all layers</p></div>
<div class="card"><div class="ci" style="background:#4ecdc420">&#x1f50d;</div><h3>LENS</h3><p>Real-time observability — performance-indexed data structures, comprehensive system health tracking</p></div>
<div class="card"><div class="ci" style="background:#ff6b9d20">&#x1f4be;</div><h3>MEMORY</h3><p>Persistent indexed storage — session memory, external sources, user preferences with GDPR compliance</p></div>
<div class="card"><div class="ci" style="background:#ffd93d20">&#x1f3bc;</div><h3>CONDUCTOR</h3><p>Orchestration engine — routes requests, manages agent lifecycles, optimizes resource allocation</p></div>
<div class="card"><div class="ci" style="background:#4ecdc420">&#x2728;</div><h3>SOUL</h3><p>Value governance — mission alignment scoring, ethical guardrails, drift detection, hard veto authority</p></div>
<div class="card"><div class="ci" style="background:#7c6aef20">&#x1f916;</div><h3>INTELLIGENCE</h3><p>DAG scheduler — parallel allocation, critical path monitoring, zero-idle backfill, anti-stagnation</p></div>
</div>`
      },
      {
        id: 'domains', title: 'Heady Ecosystem', sub: 'Unified domains, unified purpose',
        body: `<div class="grid g4c">
<div class="card"><h3>headysystems.com</h3><p>Primary API portal</p></div>
<div class="card"><h3>headycloud.com</h3><p>Cloud layer management</p></div>
<div class="card"><h3>headyconnection.com</h3><p>Connection & AI nodes</p></div>
<div class="card"><h3>headymcp.com</h3><p>MCP marketplace</p></div>
<div class="card"><h3>headybot.com</h3><p>AI assistant chat</p></div>
<div class="card"><h3>headycheck.com</h3><p>Health monitoring</p></div>
<div class="card"><h3>headyio.com</h3><p>Developer docs</p></div>
<div class="card"><h3>headybuddy.org</h3><p>HeadyBuddy portal</p></div>
</div>`
      }
    ]
  },

  headybuddy: {
    title: 'HeadyBuddy',
    domain: 'headybuddy.org',
    tagline: 'Your AI Assistant',
    desc: 'Conversational AI powered by Sacred Geometry principles. Ask anything, get intelligent answers.',
    badge: 'AI Active',
    nav: [
      { l: 'Chat', h: '#chat' },
      { l: 'Systems', h: 'https://headysystems.com' },
      { l: 'Docs', h: 'https://headyio.com' }
    ],
    primaryCta: { l: 'Start Chatting', h: '#chat' },
    secondaryCta: { l: 'Learn More', h: 'https://headyio.com' },
    sections: [
      {
        id: 'chat', title: 'Chat with HeadyBuddy', sub: 'Powered by 3-stage intent resolution',
        body: `<div class="chat-box"><div class="chat-msgs" id="chat-msgs">
<div class="chat-msg bot"><div class="av">&#x2728;</div><div class="chat-text">Hey! I'm HeadyBuddy. I can help you with system status, deployments, health checks, and more. What would you like to know?</div></div>
</div><div class="chat-input"><input type="text" id="chat-in" placeholder="Ask HeadyBuddy anything..." onkeydown="if(event.key==='Enter')sendMsg()"><button onclick="sendMsg()">Send</button></div></div>
<script>${JS_API}
async function sendMsg(){const inp=document.getElementById('chat-in');const msg=inp.value.trim();if(!msg)return;inp.value='';
const msgs=document.getElementById('chat-msgs');
msgs.innerHTML+=\`<div class="chat-msg user"><div class="av">&#x1f464;</div><div class="chat-text">\${msg}</div></div>\`;
msgs.scrollTop=msgs.scrollHeight;
const r=await H.post('/api/v1/chat/resolve',{message:msg,userId:'web-visitor'});
const reply=r?.data?.topMatch?'I can help with <strong>'+r.data.topMatch.skill+'</strong>: '+r.data.topMatch.description+(r.data.requiresConfirmation?' (requires confirmation)':''):'I\\'m still learning! Try asking about system status, health checks, or deployments.';
msgs.innerHTML+=\`<div class="chat-msg bot"><div class="av">&#x2728;</div><div class="chat-text">\${reply}</div></div>\`;
msgs.scrollTop=msgs.scrollHeight;}
</script>`
      },
      {
        id: 'features', title: 'Capabilities', sub: 'What HeadyBuddy can do',
        body: `<div class="grid g3c">
<div class="card"><div class="ci" style="background:#7c6aef20">&#x1f4ac;</div><h3>Natural Chat</h3><p>3-stage intent resolution with keyword, fuzzy, and LLM-ranked matching for natural conversation</p></div>
<div class="card"><div class="ci" style="background:#4ecdc420">&#x1f6e1;</div><h3>Safe Actions</h3><p>Confirmation policies for destructive actions — HeadyBuddy always asks before doing anything risky</p></div>
<div class="card"><div class="ci" style="background:#ff6b9d20">&#x1f9e0;</div><h3>Learns You</h3><p>Preference learning — HeadyBuddy remembers how you like things done and adapts over time</p></div>
</div>`
      }
    ]
  },

  headycheck: {
    title: 'HeadyCheck',
    domain: 'headycheck.com',
    tagline: 'Health Monitoring',
    desc: 'Real-time health dashboard for the entire Heady ecosystem. Every service, every node, every heartbeat.',
    badge: 'Monitoring Active',
    nav: [
      { l: 'Dashboard', h: '#dashboard' },
      { l: 'Systems', h: 'https://headysystems.com' },
      { l: 'Docs', h: 'https://headyio.com' }
    ],
    primaryCta: { l: 'View Dashboard', h: '#dashboard' },
    secondaryCta: { l: 'API Docs', h: 'https://headyio.com' },
    sections: [
      {
        id: 'dashboard', title: 'Health Dashboard', sub: 'Live system health across all services',
        body: `<div class="lp" id="health-dash"><div style="color:var(--t2)">Loading health data...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('health-dash');
const [status,drift,mc]=await Promise.all([H.get('/api/system/status'),H.get('/api/v1/drift/latest'),H.get('/api/monte-carlo/status')]);
let html='';
if(status){html+=\`<div class="sr"><span><span class="sd up"></span> System</span><span class="tag tg">Online</span></div>
<div class="sr"><span>Uptime</span><span>\${Math.floor((status.uptime||0)/3600)}h \${Math.floor(((status.uptime||0)%3600)/60)}m</span></div>\`}
else{html+='<div class="sr"><span><span class="sd dn"></span> System</span><span class="tag tr">Unreachable</span></div>'}
if(drift?.data){const d=drift.data;html+=\`<div class="sr"><span>Drift Score</span><span class="tag \${(d.compositeScore||0)>0.3?'tw':'tg'}">\${((d.compositeScore||0)*100).toFixed(0)}%</span></div>
<div class="sr"><span>Drift Status</span><span>\${d.recommendation||'nominal'}</span></div>\`}
if(mc){html+=\`<div class="sr"><span>Monte Carlo</span><span class="tag tp">\${mc.globalEnabled?'Always-On':'Off'}</span></div>\`}
html+=\`<div class="sr"><span>Last Check</span><span>\${new Date().toLocaleTimeString()}</span></div>\`;
el.innerHTML=html||'<div style="color:var(--t2)">No health data available yet</div>';
})();</script>`
      },
      {
        id: 'services', title: 'Service Health', sub: 'Individual service status',
        body: `<div class="grid g3c">
<div class="card"><div class="ci" style="background:#4ecdc420"><span class="sd up"></span></div><h3>headysystems.com</h3><p>Primary API — gateway, sessions, intelligence</p></div>
<div class="card"><div class="ci" style="background:#4ecdc420"><span class="sd up"></span></div><h3>headycloud.com</h3><p>Cloud orchestration — HeadyMe layer</p></div>
<div class="card"><div class="ci" style="background:#4ecdc420"><span class="sd up"></span></div><h3>headyconnection.com</h3><p>Connection layer — AI node mesh</p></div>
</div>`
      }
    ]
  },

  headyio: {
    title: 'Heady Docs',
    domain: 'headyio.com',
    tagline: 'Developer Documentation',
    desc: 'Complete API reference, architecture guides, and integration documentation for the Heady platform.',
    badge: 'Docs v3.0',
    nav: [
      { l: 'API', h: '#api' },
      { l: 'Architecture', h: '#arch' },
      { l: 'Systems', h: 'https://headysystems.com' },
      { l: 'Status', h: 'https://headycheck.com' }
    ],
    primaryCta: { l: 'API Reference', h: '#api' },
    secondaryCta: { l: 'Quick Start', h: '#quickstart' },
    sections: [
      {
        id: 'quickstart', title: 'Quick Start', sub: 'Get up and running in seconds',
        body: `<div class="cb">// Fetch system status
const response = await fetch('https://headysystems.com/api/system/status');
const status = await response.json();

// Create a session
const session = await fetch('https://headysystems.com/api/v1/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'your-user-id' })
});

// Chat with HeadyBuddy
const intent = await fetch('https://headysystems.com/api/v1/chat/resolve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'check system health', userId: 'you' })
});</div>`
      },
      {
        id: 'api', title: 'API Reference', sub: 'All available endpoints',
        body: `<div class="grid g2c">
<div class="card"><h3>System</h3><p><code>GET /api/system/status</code><br><code>GET /api/subsystems</code><br><code>GET /api/health-checks/latest</code></p></div>
<div class="card"><h3>Sessions</h3><p><code>POST /api/v1/sessions</code><br><code>GET /api/v1/sessions/:id</code><br><code>DELETE /api/v1/sessions/:id</code></p></div>
<div class="card"><h3>Chat</h3><p><code>POST /api/v1/chat/resolve</code><br><code>POST /api/v1/chat/learn</code><br><code>GET /api/v1/chat/stats</code></p></div>
<div class="card"><h3>Drift Detection</h3><p><code>GET /api/v1/drift/latest</code><br><code>POST /api/v1/drift/scan</code><br><code>GET /api/v1/drift/trend</code></p></div>
<div class="card"><h3>MCP Connectors</h3><p><code>POST /api/v1/mcp/connectors/register</code><br><code>GET /api/v1/mcp/connectors</code><br><code>GET /api/v1/mcp/connectors/dashboard</code></p></div>
<div class="card"><h3>Orchestrator</h3><p><code>POST /api/v1/orchestrator/execute</code><br><code>GET /api/v1/orchestrator/state</code><br><code>GET /api/v1/orchestrator/history</code></p></div>
<div class="card"><h3>Monte Carlo</h3><p><code>POST /api/monte-carlo/pipeline</code><br><code>POST /api/monte-carlo/deployment</code><br><code>GET /api/monte-carlo/status</code></p></div>
<div class="card"><h3>Intelligence</h3><p><code>GET /api/intelligence/state</code><br><code>POST /api/intelligence/tasks</code><br><code>GET /api/intelligence/critical-path</code></p></div>
</div>`
      }
    ]
  },

  headymcp: {
    title: 'HeadyMCP',
    domain: 'headymcp.com',
    tagline: 'MCP Connector Marketplace',
    desc: 'Discover, register, and manage Model Context Protocol connectors. Extend Heady with any tool.',
    badge: 'MCP Protocol',
    nav: [
      { l: 'Connectors', h: '#connectors' },
      { l: 'Register', h: '#register' },
      { l: 'Docs', h: 'https://headyio.com' },
      { l: 'Systems', h: 'https://headysystems.com' }
    ],
    primaryCta: { l: 'Browse Connectors', h: '#connectors' },
    secondaryCta: { l: 'Register Yours', h: '#register' },
    sections: [
      {
        id: 'connectors', title: 'Connector Registry', sub: 'Live connectors in the ecosystem',
        body: `<div class="lp" id="mcp-list"><div style="color:var(--t2)">Loading connectors...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('mcp-list');
const d=await H.get('/api/v1/mcp/connectors/dashboard');
if(!d||!d.data){el.innerHTML='<div style="color:var(--t2)">No connectors registered yet. Be the first!</div>';return}
const dash=d.data;
el.innerHTML=\`<div class="sr"><span>Total Connectors</span><span>\${dash.total||0}</span></div>
<div class="sr"><span>Active</span><span class="tag tg">\${dash.active||0}</span></div>
<div class="sr"><span>Verified</span><span class="tag tp">\${dash.byTier?.verified||0}</span></div>
<div class="sr"><span>Community</span><span>\${dash.byTier?.community||0}</span></div>
<div class="sr"><span>Health Check Interval</span><span>30s</span></div>\`})();</script>`
      },
      {
        id: 'register', title: 'Register a Connector', sub: 'Add your tool to the Heady ecosystem',
        body: `<div class="cb">{
  "name": "my-connector",
  "version": "1.0.0",
  "description": "What your connector does",
  "capabilities": [
    {
      "name": "my-capability",
      "description": "What this capability does",
      "inputSchema": { "type": "object" },
      "outputSchema": { "type": "object" }
    }
  ],
  "tier": "community",
  "endpoint": "https://your-service.com/mcp",
  "auth": { "type": "bearer" }
}</div>
<br><p style="color:var(--t2)">POST this manifest to <code>https://headysystems.com/api/v1/mcp/connectors/register</code></p>`
      }
    ]
  },

  headybot: {
    title: 'HeadyBot',
    domain: 'headybot.com',
    tagline: 'AI Chat Interface',
    desc: 'Direct line to HeadyBuddy AI. Chat naturally, get intelligent system-aware responses.',
    badge: 'Bot Online',
    nav: [
      { l: 'Chat', h: '#chat' },
      { l: 'Buddy Portal', h: 'https://headybuddy.org' },
      { l: 'Systems', h: 'https://headysystems.com' }
    ],
    primaryCta: { l: 'Start Chat', h: '#chat' },
    secondaryCta: { l: 'API Docs', h: 'https://headyio.com' },
    sections: [
      {
        id: 'chat', title: 'HeadyBot Chat', sub: 'Full-featured AI conversation interface',
        body: `<div class="chat-box" style="height:600px"><div class="chat-msgs" id="bot-msgs">
<div class="chat-msg bot"><div class="av">&#x1f916;</div><div class="chat-text">Welcome to HeadyBot! I'm connected to the full Heady intelligence platform. Ask me about system health, run drift scans, manage connectors, or just chat. What can I do for you?</div></div>
</div><div class="chat-input"><input type="text" id="bot-in" placeholder="Type your message..." onkeydown="if(event.key==='Enter')botSend()"><button onclick="botSend()">Send</button></div></div>
<script>${JS_API}
async function botSend(){const inp=document.getElementById('bot-in');const msg=inp.value.trim();if(!msg)return;inp.value='';
const msgs=document.getElementById('bot-msgs');
msgs.innerHTML+=\`<div class="chat-msg user"><div class="av">&#x1f464;</div><div class="chat-text">\${msg}</div></div>\`;
msgs.scrollTop=msgs.scrollHeight;
const r=await H.post('/api/v1/chat/resolve',{message:msg,userId:'headybot-web'});
let reply;
if(r?.data?.topMatch){const m=r.data.topMatch;reply='<strong>'+m.skill+'</strong>: '+m.description+'<br><small style="color:var(--t3)">Confidence: '+(m.confidence*100).toFixed(0)+'%'+(r.data.requiresConfirmation?' | Requires confirmation':'')+'</small>'}
else{reply="I'm processing your request through the intent resolver. Try asking about: system status, health checks, drift detection, deployments, or MCP connectors."}
msgs.innerHTML+=\`<div class="chat-msg bot"><div class="av">&#x1f916;</div><div class="chat-text">\${reply}</div></div>\`;
msgs.scrollTop=msgs.scrollHeight;}
</script>`
      }
    ]
  },

  headycloud: {
    title: 'HeadyCloud',
    domain: 'headycloud.com',
    tagline: 'Cloud Layer Management',
    desc: 'Manage cloud orchestration layers, service deployments, and infrastructure from a unified dashboard.',
    badge: 'Cloud Active',
    nav: [
      { l: 'Layers', h: '#layers' },
      { l: 'Deploy', h: '#deploy' },
      { l: 'Systems', h: 'https://headysystems.com' },
      { l: 'Status', h: 'https://headycheck.com' }
    ],
    primaryCta: { l: 'View Layers', h: '#layers' },
    secondaryCta: { l: 'Deploy Now', h: '#deploy' },
    sections: [
      {
        id: 'layers', title: 'Cloud Layers', sub: 'Active service layers in the Heady cloud',
        body: `<div class="lp" id="cloud-layers"><div style="color:var(--t2)">Fetching cloud layers...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('cloud-layers');
const [cfg,status]=await Promise.all([H.get('/api/config/env'),H.get('/api/system/status')]);
if(!cfg&&!status){el.innerHTML='<div style="color:var(--err)">Cloud services unreachable</div>';return}
const c=cfg?.config||{};
el.innerHTML=\`<div class="sr"><span>HeadySystems</span><span class="tag tg">\${c.HEADY_SYSTEMS_URL||'headysystems.com'}</span></div>
<div class="sr"><span>HeadyMe</span><span class="tag tg">\${c.HEADY_ME_URL||'headycloud.com'}</span></div>
<div class="sr"><span>HeadyConnection</span><span class="tag tg">\${c.HEADY_CONNECTION_URL||'headyconnection.com'}</span></div>
<div class="sr"><span>Target</span><span>\${c.HEADY_TARGET||'Cloud'}</span></div>
<div class="sr"><span>Profile</span><span>\${c.HEADY_SERVICE_PROFILE||'full'}</span></div>
<div class="sr"><span>Version</span><span class="tag tp">v\${c.HEADY_VERSION||'3.0.0'}</span></div>
<div class="sr"><span>Active Nodes</span><span>\${c.HEADY_NODE_COUNT||0}</span></div>\`})();</script>`
      },
      {
        id: 'deploy', title: 'Deployment', sub: 'Monte Carlo-validated deployment pipeline',
        body: `<div class="grid g3c">
<div class="card"><div class="ci" style="background:#4ecdc420">&#x1f680;</div><h3>HCFullPipeline</h3><p>9-stage deterministic build pipeline with checkpoint analysis, rollback, and soul governance</p></div>
<div class="card"><div class="ci" style="background:#7c6aef20">&#x1f3b2;</div><h3>Monte Carlo</h3><p>Always-on probabilistic simulation — deployment risk scoring before any production change</p></div>
<div class="card"><div class="ci" style="background:#ffd93d20">&#x1f6e1;</div><h3>Drift Detection</h3><p>6-signal drift engine — catches configuration drift, dependency skew, and soul value misalignment</p></div>
</div>`
      }
    ]
  },

  headyconnection: {
    title: 'HeadyConnection',
    domain: 'headyconnection.com',
    tagline: 'Connection Layer',
    desc: 'AI node mesh — connecting intelligence across services, agents, and cloud layers.',
    badge: 'Mesh Active',
    nav: [
      { l: 'Nodes', h: '#nodes' },
      { l: 'Agents', h: '#agents' },
      { l: 'Systems', h: 'https://headysystems.com' },
      { l: 'Cloud', h: 'https://headycloud.com' }
    ],
    primaryCta: { l: 'View Node Mesh', h: '#nodes' },
    secondaryCta: { l: 'Agent Registry', h: '#agents' },
    sections: [
      {
        id: 'nodes', title: 'Node Mesh', sub: 'Active intelligence nodes',
        body: `<div class="lp" id="node-mesh"><div style="color:var(--t2)">Scanning node mesh...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('node-mesh');
const cfg=await H.get('/api/config/env');
if(!cfg){el.innerHTML='<div style="color:var(--err)">Node mesh unreachable</div>';return}
const nodes=(cfg.config?.HEADY_ACTIVE_NODES||'').split(',').filter(Boolean);
el.innerHTML=nodes.map(n=>\`<div class="sr"><span><span class="sd up"></span> \${n}</span><span class="tag tg">Active</span></div>\`).join('')+'<div class="sr" style="margin-top:12px"><span><strong>Total Nodes</strong></span><span><strong>'+nodes.length+'</strong></span></div>';
})();</script>`
      },
      {
        id: 'agents', title: 'Agent Registry', sub: 'Registered AI agents in the system',
        body: `<div class="lp" id="agent-list"><div style="color:var(--t2)">Loading agents...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('agent-list');
const d=await H.get('/api/subsystems');
if(!d){el.innerHTML='<div style="color:var(--err)">Agent registry unreachable</div>';return}
const agents=d.supervisor?.agents||[];
el.innerHTML=agents.map(a=>\`<div class="sr"><span>\${a}</span><span class="tag tp">Registered</span></div>\`).join('')||'<div style="color:var(--t2)">No agents currently registered</div>';
})();</script>`
      }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// HTML BUILDER
// ═══════════════════════════════════════════════════════════════

function buildHTML(site) {
  const navHtml = site.nav.map(n => `<a href="${n.h}">${n.l}</a>`).join('');
  const sectionsHtml = site.sections.map(s => `
    <section id="${s.id}">
      <div class="w">
        <h2 class="st">${s.title}</h2>
        <p class="ss">${s.sub}</p>
        ${s.body}
      </div>
    </section>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.title} — ${site.tagline}</title>
  <meta name="description" content="${site.desc}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x221e;</text></svg>">
  <style>${CSS}</style>
</head>
<body>
  <div class="gl g1"></div><div class="gl g2"></div>
  <div class="w">
    <nav>
      <a href="/" class="logo"><i>&#x221e;</i>${site.title}</a>
      <div class="nl">${navHtml}</div>
    </nav>
  </div>
  <div class="hero">
    <div class="w">
      <div class="badge"><span class="dot"></span>${site.badge}</div>
      <h1>${site.tagline}</h1>
      <p class="sub">${site.desc}</p>
      <div class="btns">
        <a href="${site.primaryCta.h}" class="btn bp">${site.primaryCta.l}</a>
        <a href="${site.secondaryCta.h}" class="btn bs">${site.secondaryCta.l}</a>
      </div>
    </div>
  </div>
${sectionsHtml}
  <footer>
    <div class="w">
      <p>&copy; ${new Date().getFullYear()} Heady Systems &mdash; Sacred Geometry Architecture &mdash; &#x221e;</p>
      <p style="margin-top:8px">
        <a href="https://headysystems.com" style="color:var(--t3);text-decoration:none">Systems</a> &middot;
        <a href="https://headycheck.com" style="color:var(--t3);text-decoration:none">Status</a> &middot;
        <a href="https://headyio.com" style="color:var(--t3);text-decoration:none">Docs</a> &middot;
        <a href="https://headymcp.com" style="color:var(--t3);text-decoration:none">MCP</a> &middot;
        <a href="https://headybuddy.org" style="color:var(--t3);text-decoration:none">Buddy</a>
      </p>
    </div>
  </footer>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// SITE GENERATOR CLASS — Called by SoulOrchestrator
// ═══════════════════════════════════════════════════════════════

class SiteGenerator {
  constructor(outputDir) {
    this.outputDir = outputDir;
    this.generatedSites = new Map();
  }

  /**
   * Generate a single site — called as DAG task handler
   */
  async generate(task) {
    const domain = task.metadata?.domain;
    if (!domain) return { status: 'error', error: 'No domain in task metadata' };

    const siteKey = domain.replace('.com', '').replace('.org', '');
    const siteDef = SITES[siteKey];
    if (!siteDef) return { status: 'error', error: `Unknown site: ${siteKey}` };

    const html = buildHTML(siteDef);
    const siteDir = path.join(this.outputDir, siteKey);

    // Ensure directory exists
    fs.mkdirSync(siteDir, { recursive: true });

    // Write index.html
    const filePath = path.join(siteDir, 'index.html');
    fs.writeFileSync(filePath, html, 'utf8');

    // Generate content hash for deterministic verification
    const hash = crypto.createHash('sha256').update(html).digest('hex').slice(0, 16);

    const result = {
      status: 'completed',
      domain,
      siteKey,
      filePath,
      sizeBytes: Buffer.byteLength(html, 'utf8'),
      hash,
      generatedAt: new Date().toISOString()
    };

    this.generatedSites.set(siteKey, result);
    console.log(`[SiteGenerator] Generated ${domain} (${result.sizeBytes} bytes, hash: ${hash})`);

    return result;
  }

  /**
   * Generate shared CSS/JS assets
   */
  async generateSharedAssets() {
    const sharedDir = path.join(this.outputDir, '_shared');
    fs.mkdirSync(sharedDir, { recursive: true });

    fs.writeFileSync(path.join(sharedDir, 'heady.css'), CSS, 'utf8');
    fs.writeFileSync(path.join(sharedDir, 'heady.js'), JS_API, 'utf8');

    return {
      status: 'completed',
      files: ['heady.css', 'heady.js'],
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Verify all sites exist and are valid
   */
  async verifySites() {
    const results = {};
    let allPassed = true;

    for (const [key, siteDef] of Object.entries(SITES)) {
      const indexPath = path.join(this.outputDir, key, 'index.html');
      const exists = fs.existsSync(indexPath);
      const size = exists ? fs.statSync(indexPath).size : 0;
      const valid = exists && size > 1000;

      results[key] = {
        domain: siteDef.domain,
        exists,
        sizeBytes: size,
        valid,
        path: indexPath
      };

      if (!valid) allPassed = false;
    }

    return {
      status: allPassed ? 'completed' : 'partial',
      allPassed,
      sites: results,
      total: Object.keys(SITES).length,
      passed: Object.values(results).filter(r => r.valid).length,
      verifiedAt: new Date().toISOString()
    };
  }

  getGeneratedSites() {
    return Object.fromEntries(this.generatedSites);
  }
}

module.exports = { SiteGenerator, SITES, buildHTML };
