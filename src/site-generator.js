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

// ═══════════════════════════════════════════════════════════════
// SACRED GEOMETRY SVG ELEMENTS
// ═══════════════════════════════════════════════════════════════

// Flower of Life pattern (tiling circles — sacred geometry core symbol)
const SVG_FLOWER_OF_LIFE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="sg-pattern sg-flower">
<defs><circle id="c" r="30" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.15"/></defs>
<use href="#c" x="100" y="100"/><use href="#c" x="130" y="100"/><use href="#c" x="70" y="100"/>
<use href="#c" x="115" y="74"/><use href="#c" x="85" y="74"/><use href="#c" x="115" y="126"/><use href="#c" x="85" y="126"/>
<use href="#c" x="100" y="48"/><use href="#c" x="100" y="152"/><use href="#c" x="145" y="74"/><use href="#c" x="55" y="74"/>
<use href="#c" x="145" y="126"/><use href="#c" x="55" y="126"/><use href="#c" x="160" y="100"/><use href="#c" x="40" y="100"/>
<use href="#c" x="130" y="48"/><use href="#c" x="70" y="48"/><use href="#c" x="130" y="152"/><use href="#c" x="70" y="152"/>
</svg>`;

// Metatron's Cube (connecting all Platonic solids)
const SVG_METATRON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="sg-pattern sg-metatron">
<g fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.12">
<circle cx="100" cy="100" r="50"/><circle cx="100" cy="50" r="50"/><circle cx="100" cy="150" r="50"/>
<circle cx="143" cy="75" r="50"/><circle cx="57" cy="75" r="50"/><circle cx="143" cy="125" r="50"/><circle cx="57" cy="125" r="50"/>
<line x1="100" y1="50" x2="143" y2="75"/><line x1="143" y1="75" x2="143" y2="125"/><line x1="143" y1="125" x2="100" y2="150"/>
<line x1="100" y1="150" x2="57" y2="125"/><line x1="57" y1="125" x2="57" y2="75"/><line x1="57" y1="75" x2="100" y2="50"/>
<line x1="100" y1="50" x2="143" y2="125"/><line x1="143" y1="75" x2="57" y2="125"/><line x1="143" y1="125" x2="57" y2="75"/>
<line x1="100" y1="150" x2="57" y2="75"/><line x1="57" y1="125" x2="143" y2="75"/><line x1="100" y1="50" x2="57" y2="125"/>
</g></svg>`;

// Sacred Geometry logo — Seed of Life with ∞ center
const SVG_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="sg-logo">
<defs>
<linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:var(--accent)"/><stop offset="100%" style="stop-color:var(--accent2)"/>
</linearGradient>
</defs>
<circle cx="24" cy="24" r="23" fill="none" stroke="url(#lg)" stroke-width="1.5"/>
<circle cx="24" cy="24" r="10" fill="none" stroke="url(#lg)" stroke-width="0.8" opacity="0.6"/>
<circle cx="24" cy="14" r="10" fill="none" stroke="url(#lg)" stroke-width="0.5" opacity="0.3"/>
<circle cx="24" cy="34" r="10" fill="none" stroke="url(#lg)" stroke-width="0.5" opacity="0.3"/>
<circle cx="32.7" cy="19" r="10" fill="none" stroke="url(#lg)" stroke-width="0.5" opacity="0.3"/>
<circle cx="15.3" cy="19" r="10" fill="none" stroke="url(#lg)" stroke-width="0.5" opacity="0.3"/>
<circle cx="32.7" cy="29" r="10" fill="none" stroke="url(#lg)" stroke-width="0.5" opacity="0.3"/>
<circle cx="15.3" cy="29" r="10" fill="none" stroke="url(#lg)" stroke-width="0.5" opacity="0.3"/>
<text x="24" y="28" text-anchor="middle" fill="url(#lg)" font-size="16" font-weight="700" font-family="serif">&#x221e;</text>
</svg>`;

// Per-domain accent colors (each domain has its own feel)
const DOMAIN_THEMES = {
  headysystems: { accent: '#00e5cc', accent2: '#0099ff', glow: '#00e5cc20', label: 'Infrastructure' },
  headybuddy: { accent: '#ff7eb3', accent2: '#ff758c', glow: '#ff7eb320', label: 'AI Assistant' },
  headycheck: { accent: '#00d4aa', accent2: '#00b4d8', glow: '#00d4aa20', label: 'Health Monitor' },
  headyio: { accent: '#a78bfa', accent2: '#818cf8', glow: '#a78bfa20', label: 'Documentation' },
  headymcp: { accent: '#f59e0b', accent2: '#ef4444', glow: '#f59e0b20', label: 'Protocol' },
  headybot: { accent: '#06b6d4', accent2: '#8b5cf6', glow: '#06b6d420', label: 'Chat AI' },
  headycloud: { accent: '#3b82f6', accent2: '#6366f1', glow: '#3b82f620', label: 'Cloud Layer' },
  headyconnection: { accent: '#10b981', accent2: '#059669', glow: '#10b98120', label: 'Node Mesh' },
};

function buildCSS(siteKey) {
  const theme = DOMAIN_THEMES[siteKey] || DOMAIN_THEMES.headysystems;
  return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: #060610;
  --surface: #0c0c1a;
  --surface2: #141428;
  --border: #1e1e3a;
  --border-glow: ${theme.accent}30;
  --accent: ${theme.accent};
  --accent2: ${theme.accent2};
  --glow: ${theme.glow};
  --text: #e4e4f0;
  --text2: #9494b0;
  --text3: #5a5a78;
  --ok: #00d4aa;
  --warn: #f59e0b;
  --err: #ef4444;
  --radius: 16px;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', monospace;
  /* Golden ratio spacing */
  --phi: 1.618;
  --sp-xs: 8px;
  --sp-sm: 13px;
  --sp-md: 21px;
  --sp-lg: 34px;
  --sp-xl: 55px;
  --sp-2xl: 89px;
}

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  line-height: 1.618; /* golden ratio */
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ── Sacred Geometry Background ── */
.sg-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.sg-pattern {
  position: absolute;
  color: var(--accent);
}
.sg-flower {
  width: 800px;
  height: 800px;
  top: -200px;
  right: -200px;
  animation: sg-rotate 120s linear infinite;
}
.sg-metatron {
  width: 600px;
  height: 600px;
  bottom: -150px;
  left: -150px;
  animation: sg-rotate 90s linear infinite reverse;
}
@keyframes sg-rotate { to { transform: rotate(360deg); } }

/* Ambient glow orbs */
.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}
.orb-1 {
  width: 500px; height: 500px;
  top: -150px; left: -100px;
  background: var(--accent);
  opacity: 0.06;
  animation: orb-breathe 8s ease-in-out infinite;
}
.orb-2 {
  width: 400px; height: 400px;
  bottom: -100px; right: -80px;
  background: var(--accent2);
  opacity: 0.05;
  animation: orb-breathe 10s ease-in-out infinite 2s;
}
.orb-3 {
  width: 300px; height: 300px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--accent);
  opacity: 0.03;
  animation: orb-breathe 12s ease-in-out infinite 4s;
}
@keyframes orb-breathe {
  0%, 100% { opacity: 0.04; transform: scale(1); }
  50% { opacity: 0.08; transform: scale(1.15); }
}

/* Grid overlay — subtle sacred grid lines */
.sg-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(var(--accent) 1px, transparent 1px),
    linear-gradient(90deg, var(--accent) 1px, transparent 1px);
  background-size: 89px 89px; /* fibonacci number */
  opacity: 0.015;
}

/* ── Layout ── */
.wrap {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 var(--sp-lg);
  position: relative;
  z-index: 1;
}

/* ── Navigation ── */
nav {
  padding: var(--sp-md) 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg)cc; /* semi-transparent */
}
.logo {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  text-decoration: none;
  color: var(--text);
}
.logo .sg-logo { width: 40px; height: 40px; }
.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.logo-sub {
  font-size: 11px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 500;
}
.nav-links {
  display: flex;
  gap: 4px;
}
.nav-links a {
  color: var(--text2);
  text-decoration: none;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}
.nav-links a:hover {
  color: var(--accent);
  background: var(--glow);
}

/* ── Hero ── */
.hero {
  padding: var(--sp-2xl) 0 var(--sp-xl);
  text-align: center;
  position: relative;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: 6px 18px;
  background: var(--glow);
  border: 1px solid var(--accent)40;
  border-radius: 100px;
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: var(--sp-lg);
  backdrop-filter: blur(10px);
}
.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  position: relative;
}
.pulse-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1.5px solid var(--accent);
  animation: pulse-ring 2s ease-out infinite;
}
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
h1 {
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: var(--sp-md);
  background: linear-gradient(135deg, var(--text) 0%, var(--accent) 50%, var(--accent2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-desc {
  font-size: 18px;
  color: var(--text2);
  max-width: 560px;
  margin: 0 auto var(--sp-lg);
  line-height: 1.7;
}
.hero-btns {
  display: flex;
  gap: var(--sp-sm);
  justify-content: center;
  flex-wrap: wrap;
}
.btn {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-family: var(--font);
}
.btn-primary {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
  box-shadow: 0 4px 20px var(--glow);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 40px var(--accent)40;
}
.btn-ghost {
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 20px var(--glow);
}

/* ── Divider with sacred geometry ── */
.sg-divider {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-lg) 0;
  color: var(--text3);
}
.sg-divider::before, .sg-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}
.sg-divider span { font-size: 20px; opacity: 0.4; }

/* ── Cards ── */
.grid { display: grid; gap: var(--sp-md); padding: var(--sp-lg) 0; }
.g2c { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
.g3c { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.g4c { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--sp-lg);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.card:hover {
  border-color: var(--accent)50;
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.3), 0 0 30px var(--glow);
}
.card:hover::before { opacity: 1; }
.card h3 {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}
.card p {
  color: var(--text2);
  font-size: 14px;
  line-height: 1.6;
}
.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: var(--sp-sm);
  background: var(--glow);
  border: 1px solid var(--accent)20;
}

/* ── Sections ── */
section {
  padding: var(--sp-xl) 0;
  position: relative;
}
section + section {
  border-top: 1px solid var(--border);
}
.section-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: var(--sp-xs);
}
.section-sub {
  color: var(--text2);
  margin-bottom: var(--sp-lg);
  font-size: 15px;
}

/* ── Live Panels ── */
.live-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--sp-lg);
  margin: var(--sp-md) 0;
  position: relative;
  overflow: hidden;
}
.live-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent)60, transparent);
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-sm) 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.status-row:last-child { border: none; }
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: var(--sp-xs);
}
.status-dot.up { background: var(--ok); box-shadow: 0 0 8px var(--ok)60; }
.status-dot.dn { background: var(--err); box-shadow: 0 0 8px var(--err)60; }
.status-dot.wn { background: var(--warn); box-shadow: 0 0 8px var(--warn)60; }

.tag {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.tg { background: #00d4aa18; color: var(--ok); }
.tp { background: var(--glow); color: var(--accent); }
.tw { background: #f59e0b18; color: var(--warn); }
.tr { background: #ef444418; color: var(--err); }

/* ── Code Blocks ── */
.code-block {
  background: #08080f;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: var(--sp-md);
  font-family: var(--mono);
  font-size: 13px;
  color: var(--accent);
  overflow-x: auto;
  white-space: pre;
  line-height: 1.7;
}

/* ── Chat Interface ── */
.chat-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-msgs {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-md);
}
.chat-msg {
  margin-bottom: var(--sp-sm);
  display: flex;
  gap: var(--sp-sm);
}
.chat-msg.bot .avatar { background: var(--glow); color: var(--accent); border: 1px solid var(--accent)30; }
.chat-msg.user .avatar { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; }
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.chat-text {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: var(--sp-sm) var(--sp-md);
  font-size: 14px;
  max-width: 75%;
  line-height: 1.6;
}
.chat-input {
  display: flex;
  gap: var(--sp-xs);
  padding: var(--sp-sm);
  border-top: 1px solid var(--border);
  background: var(--surface2);
}
.chat-input input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: var(--sp-sm) var(--sp-md);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font);
  outline: none;
  transition: border-color 0.2s;
}
.chat-input input:focus { border-color: var(--accent); box-shadow: 0 0 12px var(--glow); }
.chat-input button {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border: none;
  color: #fff;
  padding: var(--sp-sm) var(--sp-md);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font);
  transition: all 0.2s;
}
.chat-input button:hover { box-shadow: 0 4px 16px var(--glow); }

/* ── Footer ── */
footer {
  padding: var(--sp-xl) 0 var(--sp-lg);
  text-align: center;
  color: var(--text3);
  font-size: 13px;
  border-top: 1px solid var(--border);
  position: relative;
  z-index: 1;
}
footer .sg-divider { padding: 0 0 var(--sp-md) 0; }
footer a {
  color: var(--text3);
  text-decoration: none;
  transition: color 0.2s;
}
footer a:hover { color: var(--accent); }
.footer-links {
  display: flex;
  gap: var(--sp-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--sp-sm);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .hero { padding: var(--sp-xl) 0 var(--sp-lg); }
  h1 { font-size: 32px; }
  .g2c, .g3c { grid-template-columns: 1fr; }
  .sg-flower { width: 400px; height: 400px; }
  .sg-metatron { width: 300px; height: 300px; }
}
`;
}

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
      { l: 'API Docs', h: 'https://headysystems.com' },
      { l: 'Status', h: 'https://headysystems.com' },
      { l: 'MCP', h: 'https://headysystems.com' },
      { l: 'Buddy', h: 'https://headysystems.com' }
    ],
    primaryCta: { l: 'View Architecture', h: '#arch' },
    secondaryCta: { l: 'API Reference', h: 'https://headysystems.com' },
    sections: [
      {
        id: 'status', title: 'Live System Status', sub: 'Real-time health across all services',
        body: `<div class="live-panel" id="sys-status"><div style="color:var(--text2)">Connecting to Heady Systems...</div></div>
<script>${JS_API}
(async()=>{const d=await H.get('/api/system/status');const el=document.getElementById('sys-status');if(!d){el.innerHTML='<div style="color:var(--err)">API unreachable — services may be deploying</div>';return}
el.innerHTML=\`<div class="status-row"><span>Environment</span><span class="tag tg">\${d.environment||'production'}</span></div>
<div class="status-row"><span>Active Nodes</span><span>\${d.capabilities?.nodes?.active||0}/\${d.capabilities?.nodes?.total||0}</span></div>
<div class="status-row"><span>Services</span><span>\${d.capabilities?.services?.healthy||0}/\${d.capabilities?.services?.total||0} healthy</span></div>
<div class="status-row"><span>Tools</span><span>\${d.capabilities?.tools?.active||0} active</span></div>
<div class="status-row"><span>Uptime</span><span>\${Math.floor((d.uptime||0)/3600)}h \${Math.floor(((d.uptime||0)%3600)/60)}m</span></div>
<div class="status-row"><span>Sacred Geometry</span><span class="tag tp">Active</span></div>\`})();</script>`
      },
      {
        id: 'arch', title: 'Architecture', sub: 'Fractal intelligence at every layer',
        body: `<div class="grid g3c">
<div class="card"><div class="card-icon" style="background:#7c6aef20">&#x1f9e0;</div><h3>BRAIN</h3><p>Central meta-controller — pre-response processing, context gathering, concept identification across all layers</p></div>
<div class="card"><div class="card-icon" style="background:#4ecdc420">&#x1f50d;</div><h3>LENS</h3><p>Real-time observability — performance-indexed data structures, comprehensive system health tracking</p></div>
<div class="card"><div class="card-icon" style="background:#ff6b9d20">&#x1f4be;</div><h3>MEMORY</h3><p>Persistent indexed storage — session memory, external sources, user preferences with GDPR compliance</p></div>
<div class="card"><div class="card-icon" style="background:#ffd93d20">&#x1f3bc;</div><h3>CONDUCTOR</h3><p>Orchestration engine — routes requests, manages agent lifecycles, optimizes resource allocation</p></div>
<div class="card"><div class="card-icon" style="background:#4ecdc420">&#x2728;</div><h3>SOUL</h3><p>Value governance — mission alignment scoring, ethical guardrails, drift detection, hard veto authority</p></div>
<div class="card"><div class="card-icon" style="background:#7c6aef20">&#x1f916;</div><h3>INTELLIGENCE</h3><p>DAG scheduler — parallel allocation, critical path monitoring, zero-idle backfill, anti-stagnation</p></div>
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
      { l: 'Docs', h: 'https://headysystems.com' }
    ],
    primaryCta: { l: 'Start Chatting', h: '#chat' },
    secondaryCta: { l: 'Learn More', h: 'https://headysystems.com' },
    sections: [
      {
        id: 'chat', title: 'Chat with HeadyBuddy', sub: 'Powered by 3-stage intent resolution',
        body: `<div class="chat-box"><div class="chat-msgs" id="chat-msgs">
<div class="chat-msg bot"><div class="avatar">&#x2728;</div><div class="chat-text">Hey! I'm HeadyBuddy. I can help you with system status, deployments, health checks, and more. What would you like to know?</div></div>
</div><div class="chat-input"><input type="text" id="chat-in" placeholder="Ask HeadyBuddy anything..." onkeydown="if(event.key==='Enter')sendMsg()"><button onclick="sendMsg()">Send</button></div></div>
<script>${JS_API}
async function sendMsg(){const inp=document.getElementById('chat-in');const msg=inp.value.trim();if(!msg)return;inp.value='';
const msgs=document.getElementById('chat-msgs');
msgs.innerHTML+=\`<div class="chat-msg user"><div class="avatar">&#x1f464;</div><div class="chat-text">\${msg}</div></div>\`;
msgs.scrollTop=msgs.scrollHeight;
const r=await H.post('/api/v1/chat/resolve',{message:msg,userId:'web-visitor'});
const reply=r?.data?.topMatch?'I can help with <strong>'+r.data.topMatch.skill+'</strong>: '+r.data.topMatch.description+(r.data.requiresConfirmation?' (requires confirmation)':''):'I\\'m still learning! Try asking about system status, health checks, or deployments.';
msgs.innerHTML+=\`<div class="chat-msg bot"><div class="avatar">&#x2728;</div><div class="chat-text">\${reply}</div></div>\`;
msgs.scrollTop=msgs.scrollHeight;}
</script>`
      },
      {
        id: 'features', title: 'Capabilities', sub: 'What HeadyBuddy can do',
        body: `<div class="grid g3c">
<div class="card"><div class="card-icon" style="background:#7c6aef20">&#x1f4ac;</div><h3>Natural Chat</h3><p>3-stage intent resolution with keyword, fuzzy, and LLM-ranked matching for natural conversation</p></div>
<div class="card"><div class="card-icon" style="background:#4ecdc420">&#x1f6e1;</div><h3>Safe Actions</h3><p>Confirmation policies for destructive actions — HeadyBuddy always asks before doing anything risky</p></div>
<div class="card"><div class="card-icon" style="background:#ff6b9d20">&#x1f9e0;</div><h3>Learns You</h3><p>Preference learning — HeadyBuddy remembers how you like things done and adapts over time</p></div>
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
      { l: 'Docs', h: 'https://headysystems.com' }
    ],
    primaryCta: { l: 'View Dashboard', h: '#dashboard' },
    secondaryCta: { l: 'API Docs', h: 'https://headysystems.com' },
    sections: [
      {
        id: 'dashboard', title: 'Health Dashboard', sub: 'Live system health across all services',
        body: `<div class="live-panel" id="health-dash"><div style="color:var(--text2)">Loading health data...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('health-dash');
const [status,drift,mc]=await Promise.all([H.get('/api/system/status'),H.get('/api/v1/drift/latest'),H.get('/api/monte-carlo/status')]);
let html='';
if(status){html+=\`<div class="status-row"><span><span class="status-dot up"></span> System</span><span class="tag tg">Online</span></div>
<div class="status-row"><span>Uptime</span><span>\${Math.floor((status.uptime||0)/3600)}h \${Math.floor(((status.uptime||0)%3600)/60)}m</span></div>\`}
else{html+='<div class="status-row"><span><span class="status-dot dn"></span> System</span><span class="tag tr">Unreachable</span></div>'}
if(drift?.data){const d=drift.data;html+=\`<div class="status-row"><span>Drift Score</span><span class="tag \${(d.compositeScore||0)>0.3?'tw':'tg'}">\${((d.compositeScore||0)*100).toFixed(0)}%</span></div>
<div class="status-row"><span>Drift Status</span><span>\${d.recommendation||'nominal'}</span></div>\`}
if(mc){html+=\`<div class="status-row"><span>Monte Carlo</span><span class="tag tp">\${mc.globalEnabled?'Always-On':'Off'}</span></div>\`}
html+=\`<div class="status-row"><span>Last Check</span><span>\${new Date().toLocaleTimeString()}</span></div>\`;
el.innerHTML=html||'<div style="color:var(--text2)">No health data available yet</div>';
})();</script>`
      },
      {
        id: 'services', title: 'Service Health', sub: 'Individual service status',
        body: `<div class="grid g3c">
<div class="card"><div class="card-icon" style="background:#4ecdc420"><span class="status-dot up"></span></div><h3>headysystems.com</h3><p>Primary API — gateway, sessions, intelligence</p></div>
<div class="card"><div class="card-icon" style="background:#4ecdc420"><span class="status-dot up"></span></div><h3>headycloud.com</h3><p>Cloud orchestration — HeadyMe layer</p></div>
<div class="card"><div class="card-icon" style="background:#4ecdc420"><span class="status-dot up"></span></div><h3>headyconnection.com</h3><p>Connection layer — AI node mesh</p></div>
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
      { l: 'Status', h: 'https://headysystems.com' }
    ],
    primaryCta: { l: 'API Reference', h: '#api' },
    secondaryCta: { l: 'Quick Start', h: '#quickstart' },
    sections: [
      {
        id: 'quickstart', title: 'Quick Start', sub: 'Get up and running in seconds',
        body: `<div class="code-block">// Fetch system status
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
      { l: 'Docs', h: 'https://headysystems.com' },
      { l: 'Systems', h: 'https://headysystems.com' }
    ],
    primaryCta: { l: 'Browse Connectors', h: '#connectors' },
    secondaryCta: { l: 'Register Yours', h: '#register' },
    sections: [
      {
        id: 'connectors', title: 'Connector Registry', sub: 'Live connectors in the ecosystem',
        body: `<div class="live-panel" id="mcp-list"><div style="color:var(--text2)">Loading connectors...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('mcp-list');
const d=await H.get('/api/v1/mcp/connectors/dashboard');
if(!d||!d.data){el.innerHTML='<div style="color:var(--text2)">No connectors registered yet. Be the first!</div>';return}
const dash=d.data;
el.innerHTML=\`<div class="status-row"><span>Total Connectors</span><span>\${dash.total||0}</span></div>
<div class="status-row"><span>Active</span><span class="tag tg">\${dash.active||0}</span></div>
<div class="status-row"><span>Verified</span><span class="tag tp">\${dash.byTier?.verified||0}</span></div>
<div class="status-row"><span>Community</span><span>\${dash.byTier?.community||0}</span></div>
<div class="status-row"><span>Health Check Interval</span><span>30s</span></div>\`})();</script>`
      },
      {
        id: 'register', title: 'Register a Connector', sub: 'Add your tool to the Heady ecosystem',
        body: `<div class="code-block">{
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
<br><p style="color:var(--text2)">POST this manifest to <code>https://headysystems.com/api/v1/mcp/connectors/register</code></p>`
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
      { l: 'Buddy Portal', h: 'https://headysystems.com' },
      { l: 'Systems', h: 'https://headysystems.com' }
    ],
    primaryCta: { l: 'Start Chat', h: '#chat' },
    secondaryCta: { l: 'API Docs', h: 'https://headysystems.com' },
    sections: [
      {
        id: 'chat', title: 'HeadyBot Chat', sub: 'Full-featured AI conversation interface',
        body: `<div class="chat-box" style="height:600px"><div class="chat-msgs" id="bot-msgs">
<div class="chat-msg bot"><div class="avatar">&#x1f916;</div><div class="chat-text">Welcome to HeadyBot! I'm connected to the full Heady intelligence platform. Ask me about system health, run drift scans, manage connectors, or just chat. What can I do for you?</div></div>
</div><div class="chat-input"><input type="text" id="bot-in" placeholder="Type your message..." onkeydown="if(event.key==='Enter')botSend()"><button onclick="botSend()">Send</button></div></div>
<script>${JS_API}
async function botSend(){const inp=document.getElementById('bot-in');const msg=inp.value.trim();if(!msg)return;inp.value='';
const msgs=document.getElementById('bot-msgs');
msgs.innerHTML+=\`<div class="chat-msg user"><div class="avatar">&#x1f464;</div><div class="chat-text">\${msg}</div></div>\`;
msgs.scrollTop=msgs.scrollHeight;
const r=await H.post('/api/v1/chat/resolve',{message:msg,userId:'headybot-web'});
let reply;
if(r?.data?.topMatch){const m=r.data.topMatch;reply='<strong>'+m.skill+'</strong>: '+m.description+'<br><small style="color:var(--text3)">Confidence: '+(m.confidence*100).toFixed(0)+'%'+(r.data.requiresConfirmation?' | Requires confirmation':'')+'</small>'}
else{reply="I'm processing your request through the intent resolver. Try asking about: system status, health checks, drift detection, deployments, or MCP connectors."}
msgs.innerHTML+=\`<div class="chat-msg bot"><div class="avatar">&#x1f916;</div><div class="chat-text">\${reply}</div></div>\`;
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
      { l: 'Status', h: 'https://headysystems.com' }
    ],
    primaryCta: { l: 'View Layers', h: '#layers' },
    secondaryCta: { l: 'Deploy Now', h: '#deploy' },
    sections: [
      {
        id: 'layers', title: 'Cloud Layers', sub: 'Active service layers in the Heady cloud',
        body: `<div class="live-panel" id="cloud-layers"><div style="color:var(--text2)">Fetching cloud layers...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('cloud-layers');
const [cfg,status]=await Promise.all([H.get('/api/config/env'),H.get('/api/system/status')]);
if(!cfg&&!status){el.innerHTML='<div style="color:var(--err)">Cloud services unreachable</div>';return}
const c=cfg?.config||{};
el.innerHTML=\`<div class="status-row"><span>HeadySystems</span><span class="tag tg">\${c.HEADY_SYSTEMS_URL||'headysystems.com'}</span></div>
<div class="status-row"><span>HeadyMe</span><span class="tag tg">\${c.HEADY_ME_URL||'headycloud.com'}</span></div>
<div class="status-row"><span>HeadyConnection</span><span class="tag tg">\${c.HEADY_CONNECTION_URL||'headyconnection.com'}</span></div>
<div class="status-row"><span>Target</span><span>\${c.HEADY_TARGET||'Cloud'}</span></div>
<div class="status-row"><span>Profile</span><span>\${c.HEADY_SERVICE_PROFILE||'full'}</span></div>
<div class="status-row"><span>Version</span><span class="tag tp">v\${c.HEADY_VERSION||'3.0.0'}</span></div>
<div class="status-row"><span>Active Nodes</span><span>\${c.HEADY_NODE_COUNT||0}</span></div>\`})();</script>`
      },
      {
        id: 'deploy', title: 'Deployment', sub: 'Monte Carlo-validated deployment pipeline',
        body: `<div class="grid g3c">
<div class="card"><div class="card-icon" style="background:#4ecdc420">&#x1f680;</div><h3>HCFullPipeline</h3><p>9-stage deterministic build pipeline with checkpoint analysis, rollback, and soul governance</p></div>
<div class="card"><div class="card-icon" style="background:#7c6aef20">&#x1f3b2;</div><h3>Monte Carlo</h3><p>Always-on probabilistic simulation — deployment risk scoring before any production change</p></div>
<div class="card"><div class="card-icon" style="background:#ffd93d20">&#x1f6e1;</div><h3>Drift Detection</h3><p>6-signal drift engine — catches configuration drift, dependency skew, and soul value misalignment</p></div>
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
        body: `<div class="live-panel" id="node-mesh"><div style="color:var(--text2)">Scanning node mesh...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('node-mesh');
const cfg=await H.get('/api/config/env');
if(!cfg){el.innerHTML='<div style="color:var(--err)">Node mesh unreachable</div>';return}
const nodes=(cfg.config?.HEADY_ACTIVE_NODES||'').split(',').filter(Boolean);
el.innerHTML=nodes.map(n=>\`<div class="status-row"><span><span class="status-dot up"></span> \${n}</span><span class="tag tg">Active</span></div>\`).join('')+'<div class="status-row" style="margin-top:12px"><span><strong>Total Nodes</strong></span><span><strong>'+nodes.length+'</strong></span></div>';
})();</script>`
      },
      {
        id: 'agents', title: 'Agent Registry', sub: 'Registered AI agents in the system',
        body: `<div class="live-panel" id="agent-list"><div style="color:var(--text2)">Loading agents...</div></div>
<script>${JS_API}
(async()=>{const el=document.getElementById('agent-list');
const d=await H.get('/api/subsystems');
if(!d){el.innerHTML='<div style="color:var(--err)">Agent registry unreachable</div>';return}
const agents=d.supervisor?.agents||[];
el.innerHTML=agents.map(a=>\`<div class="status-row"><span>\${a}</span><span class="tag tp">Registered</span></div>\`).join('')||'<div style="color:var(--text2)">No agents currently registered</div>';
})();</script>`
      }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// HTML BUILDER
// ═══════════════════════════════════════════════════════════════

function buildHTML(site, siteKey) {
  const theme = DOMAIN_THEMES[siteKey] || DOMAIN_THEMES.headysystems;
  const navHtml = site.nav.map(n => `<a href="${n.h}">${n.l}</a>`).join('');
  const sectionsHtml = site.sections.map((s, i) => `
    ${i > 0 ? '<div class="wrap"><div class="sg-divider"><span>&#x221e;</span></div></div>' : ''}
    <section id="${s.id}">
      <div class="wrap">
        <h2 class="section-title">${s.title}</h2>
        <p class="section-sub">${s.sub}</p>
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
  <meta name="theme-color" content="${theme.accent}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x221e;</text></svg>">
  <style>${buildCSS(siteKey)}</style>
</head>
<body>
  <!-- Sacred Geometry Background Layer -->
  <div class="sg-bg">
    ${SVG_FLOWER_OF_LIFE}
    ${SVG_METATRON}
  </div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <div class="sg-grid"></div>

  <div class="wrap">
    <nav>
      <a href="/" class="logo">
        ${SVG_LOGO}
        <div>
          <div class="logo-text">${site.title}</div>
          <div class="logo-sub">${theme.label}</div>
        </div>
      </a>
      <div class="nav-links">${navHtml}</div>
    </nav>
  </div>

  <div class="hero">
    <div class="wrap">
      <div class="hero-badge"><span class="pulse-dot"></span>${site.badge}</div>
      <h1>${site.tagline}</h1>
      <p class="hero-desc">${site.desc}</p>
      <div class="hero-btns">
        <a href="${site.primaryCta.h}" class="btn btn-primary">${site.primaryCta.l}</a>
        <a href="${site.secondaryCta.h}" class="btn btn-ghost">${site.secondaryCta.l}</a>
      </div>
    </div>
  </div>

${sectionsHtml}

  <footer>
    <div class="wrap">
      <div class="sg-divider"><span>&#x221e;</span></div>
      <p>&copy; ${new Date().getFullYear()} Heady Systems &mdash; Sacred Geometry Architecture</p>
      <div class="footer-links">
        <a href="https://headysystems.com">Systems</a>
        <a href="https://headysystems.com">Status</a>
        <a href="https://headysystems.com">Docs</a>
        <a href="https://headysystems.com">MCP</a>
        <a href="https://headysystems.com">Buddy</a>
        <a href="https://headycloud.com">Cloud</a>
        <a href="https://headyconnection.com">Connection</a>
      </div>
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

    const html = buildHTML(siteDef, siteKey);
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

    const CSS = buildCSS('headysystems'); // Define CSS constant

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
