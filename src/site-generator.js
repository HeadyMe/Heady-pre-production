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

// Per-domain accent colors + distinct identity (each domain has its own role and voice)
const DOMAIN_THEMES = {
  headysystems: {
    accent: '#00e5cc', accent2: '#0099ff', glow: '#00e5cc20',
    label: 'Platform',
    role: 'The Sacred Geometry AI platform powering every Heady product and service.',
    audience: 'Developers, enterprises, technical users',
    org: 'Heady Systems'
  },
  headybuddy: {
    accent: '#ff7eb3', accent2: '#ff758c', glow: '#ff7eb320',
    label: 'AI Companion',
    role: 'Your cross-device AI companion — chat, tasks, code, research — everywhere you are.',
    audience: 'Everyone',
    org: 'HeadyBuddy'
  },
  headycheck: {
    accent: '#00d4aa', accent2: '#00b4d8', glow: '#00d4aa20',
    label: 'System Health',
    role: 'Real-time health and observability across the entire Heady ecosystem.',
    audience: 'Operators, developers',
    org: 'Heady Systems'
  },
  headyio: {
    accent: '#a78bfa', accent2: '#818cf8', glow: '#a78bfa20',
    label: 'Developer Docs',
    role: 'API reference, architecture guides, and integration documentation.',
    audience: 'Developers, integrators',
    org: 'Heady Systems'
  },
  headymcp: {
    accent: '#f59e0b', accent2: '#ef4444', glow: '#f59e0b20',
    label: 'MCP Protocol',
    role: 'Model Context Protocol connectors — extend Heady with any tool or service.',
    audience: 'Developers, tool builders',
    org: 'Heady Systems'
  },
  headybot: {
    accent: '#06b6d4', accent2: '#8b5cf6', glow: '#06b6d420',
    label: 'AI Chat',
    role: 'Direct line to HeadyBuddy AI — full-featured conversational interface.',
    audience: 'Everyone',
    org: 'HeadyBuddy'
  },
  headycloud: {
    accent: '#3b82f6', accent2: '#6366f1', glow: '#3b82f620',
    label: 'Cloud',
    role: 'Cloud orchestration, deployment layers, and infrastructure management.',
    audience: 'Operators, developers',
    org: 'Heady Systems'
  },
  headyconnection: {
    accent: '#10b981', accent2: '#059669', glow: '#10b98120',
    label: 'Nonprofit',
    role: 'The nonprofit mission behind Heady — impact, governance, and community programs.',
    audience: 'Donors, partners, beneficiaries, community',
    org: 'HeadyConnection'
  },
  headyweb: {
    accent: '#7c3aed', accent2: '#a78bfa', glow: '#7c3aed20',
    label: 'AI Browser',
    role: 'AI-powered browser shell with HeadyBuddy sidebar — browse, research, code, and chat in one place.',
    audience: 'Everyone',
    org: 'Heady Systems'
  },
};

// Ecosystem registry — used for cross-links, footers, and system map
const ECOSYSTEM = [
  { key: 'headysystems', domain: 'headysystems.com', name: 'Heady Systems', short: 'Platform', icon: '✴️' },
  { key: 'headyconnection', domain: 'headyconnection.org', name: 'HeadyConnection', short: 'Nonprofit', icon: '🌐' },
  { key: 'headybuddy', domain: 'headybuddy.org', name: 'HeadyBuddy', short: 'Companion', icon: '✨' },
  { key: 'headybot', domain: 'headybot.com', name: 'HeadyBot', short: 'Chat', icon: '🤖' },
  { key: 'headycloud', domain: 'headycloud.com', name: 'HeadyCloud', short: 'Cloud', icon: '☁️' },
  { key: 'headymcp', domain: 'headymcp.com', name: 'HeadyMCP', short: 'MCP', icon: '🔌' },
  { key: 'headyio', domain: 'headyio.com', name: 'Heady Docs', short: 'Docs', icon: '📚' },
  { key: 'headycheck', domain: 'headycheck.com', name: 'HeadyCheck', short: 'Health', icon: '💚' },
  { key: 'headyweb', domain: 'headyweb.com', name: 'HeadyWeb', short: 'Browser', icon: '🌐' },
];

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

/* ── Ecosystem Block ── */
.eco-block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--sp-lg);
  margin: var(--sp-lg) 0;
  position: relative;
}
.eco-block::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent));
}
.eco-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--accent);
  font-weight: 600;
  margin-bottom: var(--sp-sm);
}
.eco-text {
  color: var(--text2);
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: var(--sp-md);
}
.eco-links {
  display: flex;
  gap: var(--sp-sm);
  flex-wrap: wrap;
}
.eco-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text2);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}
.eco-link:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--glow);
}
.eco-link .eco-icon { font-size: 14px; }

/* ── Tags ── */
.vtag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text3);
  margin-right: 4px;
}

/* ── Where This Fits ── */
.context-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: var(--sp-sm) 0;
  font-size: 13px;
  color: var(--text3);
  position: relative;
  z-index: 1;
}
.context-bar a {
  color: var(--accent);
  text-decoration: none;
}
.context-bar a:hover { text-decoration: underline; }
.context-sep { margin: 0 8px; opacity: 0.4; }

/* ── Footer Ecosystem Grid ── */
.footer-eco {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--sp-sm);
  margin-bottom: var(--sp-lg);
  text-align: left;
}
.footer-eco-item {
  padding: var(--sp-sm);
  border-radius: 8px;
  transition: background 0.2s;
}
.footer-eco-item:hover { background: var(--surface2); }
.footer-eco-item a {
  color: var(--text2);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  display: block;
}
.footer-eco-item a:hover { color: var(--accent); }
.footer-eco-item small {
  display: block;
  color: var(--text3);
  font-size: 11px;
  margin-top: 2px;
}
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  padding-top: var(--sp-md);
  border-top: 1px solid var(--border);
}
.footer-bottom a {
  color: var(--text3);
  text-decoration: none;
  font-size: 12px;
}
.footer-bottom a:hover { color: var(--accent); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .hero { padding: var(--sp-xl) 0 var(--sp-lg); }
  h1 { font-size: 32px; }
  .g2c, .g3c { grid-template-columns: 1fr; }
  .sg-flower { width: 400px; height: 400px; }
  .sg-metatron { width: 300px; height: 300px; }
  .footer-eco { grid-template-columns: repeat(2, 1fr); }
  .context-bar { display: none; }
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
    tagline: 'The Sacred Geometry AI Platform',
    desc: 'Self-aware, self-correcting intelligence infrastructure. 20 AI nodes, 9-stage pipeline, Monte Carlo validation \u2014 powering every Heady product.',
    badge: 'System Online',
    vertical: 'platform',
    tags: ['vertical: platform', 'layer: infrastructure', 'audience: dev'],
    ecosystemContext: 'This is the core platform that powers everything in the Heady universe. Revenue from Heady Systems products helps fund <a href="https://headyconnection.org">HeadyConnection\'s</a> nonprofit programs. Talk to <a href="https://headybuddy.org">HeadyBuddy</a> to interact with this platform from any device.',
    nav: [
      { l: 'Architecture', h: '#arch' },
      { l: 'Status', h: '#status' },
      { l: 'Docs', h: 'https://headyio.com' },
      { l: 'MCP', h: 'https://headymcp.com' },
      { l: 'Buddy', h: 'https://headybuddy.org' }
    ],
    primaryCta: { l: 'View Architecture', h: '#arch' },
    secondaryCta: { l: 'API Reference', h: 'https://headyio.com' },
    relatedLinks: [
      { label: 'Read the API docs', url: 'https://headyio.com', desc: 'Full endpoint reference' },
      { label: 'Talk to Buddy', url: 'https://headybot.com', desc: 'Ask anything about the platform' },
      { label: 'System health', url: 'https://headycheck.com', desc: 'Live uptime and drift scores' },
      { label: 'Our mission', url: 'https://headyconnection.org', desc: 'The nonprofit behind it all' }
    ],
    sections: [
      {
        id: 'status', title: 'Live System Status', sub: 'Real-time health across all services',
        body: `<div class="live-panel" id="sys-status"><div style="color:var(--text2)">Connecting to Heady Systems...</div></div>
<script>${JS_API}
(async()=>{const d=await H.get('/api/system/status');const el=document.getElementById('sys-status');if(!d){el.innerHTML='<div style="color:var(--err)">API unreachable \u2014 services may be deploying</div>';return}
el.innerHTML=\`<div class="status-row"><span>Environment</span><span class="tag tg">\${d.environment||'production'}</span></div>
<div class="status-row"><span>Active Nodes</span><span>\${d.capabilities?.nodes?.active||0}/\${d.capabilities?.nodes?.total||0}</span></div>
<div class="status-row"><span>Services</span><span>\${d.capabilities?.services?.healthy||0}/\${d.capabilities?.services?.total||0} healthy</span></div>
<div class="status-row"><span>Tools</span><span>\${d.capabilities?.tools?.active||0} active</span></div>
<div class="status-row"><span>Uptime</span><span>\${Math.floor((d.uptime||0)/3600)}h \${Math.floor(((d.uptime||0)%3600)/60)}m</span></div>
<div class="status-row"><span>Sacred Geometry</span><span class="tag tp">Active</span></div>\`})();</script>`
      },
      {
        id: 'arch', title: 'Architecture', sub: 'Fractal intelligence at every layer \u2014 same values at every scale',
        unique: true,
        body: `<div class="grid g3c">
<div class="card"><div class="card-icon" style="background:#7c6aef20">&#x1f9e0;</div><h3>BRAIN</h3><p>Central meta-controller \u2014 pre-response processing, context gathering, concept identification across all layers</p></div>
<div class="card"><div class="card-icon" style="background:#4ecdc420">&#x1f50d;</div><h3>LENS</h3><p>Real-time observability \u2014 performance-indexed data structures, comprehensive system health tracking</p></div>
<div class="card"><div class="card-icon" style="background:#ff6b9d20">&#x1f4be;</div><h3>MEMORY</h3><p>Persistent indexed storage \u2014 session memory, external sources, user preferences with GDPR compliance</p></div>
<div class="card"><div class="card-icon" style="background:#ffd93d20">&#x1f3bc;</div><h3>CONDUCTOR</h3><p>Orchestration engine \u2014 routes requests, manages agent lifecycles, optimizes resource allocation</p></div>
<div class="card"><div class="card-icon" style="background:#4ecdc420">&#x2728;</div><h3>SOUL</h3><p>Value governance \u2014 mission alignment scoring, ethical guardrails, drift detection, hard veto authority</p></div>
<div class="card"><div class="card-icon" style="background:#7c6aef20">&#x1f916;</div><h3>INTELLIGENCE</h3><p>DAG scheduler \u2014 parallel allocation, critical path monitoring, zero-idle backfill, anti-stagnation</p></div>
</div>
<div class="eco-block" style="margin-top:var(--sp-lg)">
  <div class="eco-label">Architecture Diagram</div>
  <div class="code-block" style="font-size:12px">HeadySoul (mission, values, ethics) \u2190 ULTIMATE GOVERNOR
  \u2193
Intelligence Engine v1.3 (DAG scheduler, priority queue)
  \u2193
HCFullPipeline (9-stage execution)
  \u2193
HCBrain (meta-controller)
  \u2193
Agents (execute with HeadySoul constraints)
  \u2193
HeadyBuddy (user-facing companion on all devices)</div>
</div>`
      },
      {
        id: 'why', title: 'Why Sacred Geometry?', sub: 'Organic systems that breathe, heal, and self-correct',
        unique: true,
        body: `<div class="grid g2c">
<div class="card"><h3>Organic, Not Mechanical</h3><p>Our systems follow natural patterns \u2014 Fibonacci spacing, golden ratio rhythms, fractal self-similarity. The same values govern code, services, and the organization itself.</p></div>
<div class="card"><h3>Self-Correcting</h3><p>6-signal drift detection, Monte Carlo validation on every deploy, and HeadySoul governance ensure the system heals itself before problems reach users.</p></div>
</div>
<p style="color:var(--text2);margin-top:var(--sp-md);font-size:14px">Revenue from Heady Systems products directly funds <a href="https://headyconnection.org" style="color:var(--accent)">HeadyConnection's nonprofit programs</a> \u2014 expanding access to underserved communities worldwide.</p>`
      }
    ]
  },

  headybuddy: {
    title: 'HeadyBuddy',
    domain: 'headybuddy.org',
    tagline: 'Your AI Companion, Everywhere',
    desc: 'One persistent, cross-device AI companion that can chat, execute tasks, browse, and code \u2014 following you seamlessly across phone, desktop, browser, and IDE.',
    badge: 'Always On',
    vertical: 'companion',
    tags: ['vertical: companion', 'layer: user-facing', 'audience: everyone'],
    ecosystemContext: 'HeadyBuddy is the primary interface to the entire Heady ecosystem. It runs on the <a href="https://headysystems.com">Heady Systems platform</a> and is a program of <a href="https://headyconnection.org">HeadyConnection</a>, the nonprofit that governs the mission.',
    nav: [
      { l: 'What Buddy Does', h: '#capabilities' },
      { l: 'Surfaces', h: '#surfaces' },
      { l: 'Try It', h: 'https://headybot.com' },
      { l: 'Platform', h: 'https://headysystems.com' },
      { l: 'Mission', h: 'https://headyconnection.org' }
    ],
    primaryCta: { l: 'Talk to Buddy', h: 'https://headybot.com' },
    secondaryCta: { l: 'See the Platform', h: 'https://headysystems.com' },
    relatedLinks: [
      { label: 'Chat now', url: 'https://headybot.com', desc: 'Open the full chat interface' },
      { label: 'Platform docs', url: 'https://headyio.com', desc: 'API reference for developers' },
      { label: 'Our mission', url: 'https://headyconnection.org', desc: 'Why we built Buddy' },
      { label: 'System health', url: 'https://headycheck.com', desc: 'Is Buddy online?' }
    ],
    sections: [
      {
        id: 'capabilities', title: 'One Buddy, Many Modes', sub: 'Not a narrow bot \u2014 a general-purpose AI companion like Google Assistant, but better',
        unique: true,
        body: `<div class="grid g2c">
<div class="card"><div class="card-icon" style="background:#7c6aef20">&#x1f4ac;</div><h3>Chat Mode</h3><p>Natural conversation, planning, summarization, Q&A \u2014 3-stage intent resolution with keyword, fuzzy, and LLM-ranked matching</p></div>
<div class="card"><div class="card-icon" style="background:#4ecdc420">&#x2699;&#xfe0f;</div><h3>Tasks Mode</h3><p>Execute workflows, call MCP tools, manage deployments \u2014 with confirmation policies for anything risky</p></div>
<div class="card"><div class="card-icon" style="background:#ff6b9d20">&#x1f4bb;</div><h3>Code Mode</h3><p>Generate and modify code, explain errors, run refactors \u2014 powered by HeadyAI-IDE and code-server integration</p></div>
<div class="card"><div class="card-icon" style="background:#ffd93d20">&#x1f50d;</div><h3>Research Mode</h3><p>Summarize pages, compare sources, maintain multi-tab research sessions across HeadyBrowser and standard browsers</p></div>
</div>
<p style="color:var(--text2);margin-top:var(--sp-md);font-size:14px">These are modes inside one Buddy, not separate products. HeadyBuddy adapts to what you need, remembers your preferences, and follows you across devices.</p>`
      },
      {
        id: 'surfaces', title: 'Buddy Lives Everywhere', sub: 'Same companion, every surface',
        unique: true,
        body: `<div class="grid g3c">
<div class="card"><div class="card-icon" style="background:#3b82f620">&#x1f5a5;&#xfe0f;</div><h3>Desktop Overlay</h3><p>Always-on tray icon with global hotkey (Ctrl+Shift+H). Draggable, resizable, stays on top. Clipboard and window-title context.</p></div>
<div class="card"><div class="card-icon" style="background:#10b98120">&#x1f4f1;</div><h3>Android Companion</h3><p>Foreground service with floating bubble. Always available, follows you between apps. Cross-device sync keeps your context.</p></div>
<div class="card"><div class="card-icon" style="background:#a78bfa20">&#x1f310;</div><h3>Browser Widget</h3><p>Buddy bubble on every Heady website. Same session, same identity. Context-aware based on the page you're viewing.</p></div>
<div class="card"><div class="card-icon" style="background:#f59e0b20">&#x1f468;&#x200d;&#x1f4bb;</div><h3>IDE Sidebar</h3><p>HeadyAI-IDE integration \u2014 Buddy in coding mode with full repo context, inline suggestions, and agent orchestration.</p></div>
<div class="card"><div class="card-icon" style="background:#06b6d420">&#x1f517;</div><h3>Cross-Device Sync</h3><p>Start a conversation on desktop, continue on phone, pick up in IDE. Your identity and context follow you everywhere.</p></div>
<div class="card"><div class="card-icon" style="background:#ff7eb320">&#x1f6e1;&#xfe0f;</div><h3>Privacy Controls</h3><p>See what Buddy knows, clear history, toggle clipboard reading, pause or quit from any device. You're always in control.</p></div>
</div>`
      },
      {
        id: 'philosophy', title: 'Why Buddy Exists', sub: 'Technology should feel like a friend, not a tool',
        unique: true,
        body: `<div class="grid g2c">
<div class="card"><h3>General, Not Narrow</h3><p>Other assistants are built for one thing. Buddy is your companion for everything \u2014 the default interface for all Heady capabilities. We don't create new assistants when a Buddy mode will do.</p></div>
<div class="card"><h3>Governed by Values</h3><p>Every Buddy action passes through HeadySoul \u2014 our mission alignment engine. No dark patterns, no vendor lock-in, no surveillance. Five hard vetoes protect you, always.</p></div>
</div>
<p style="color:var(--text2);margin-top:var(--sp-md);font-size:14px">HeadyBuddy is a program of <a href="https://headyconnection.org" style="color:var(--accent)">HeadyConnection</a>, the nonprofit behind Heady. Powered by <a href="https://headysystems.com" style="color:var(--accent)">Heady Systems</a> infrastructure.</p>`
      }
    ]
  },

  headycheck: {
    title: 'HeadyCheck',
    domain: 'headycheck.com',
    tagline: 'Ecosystem Health Dashboard',
    desc: 'Real-time health, drift detection, and Monte Carlo validation across every service, node, and pipeline in the Heady ecosystem.',
    badge: 'Monitoring Active',
    vertical: 'operations',
    tags: ['vertical: operations', 'layer: observability', 'audience: ops'],
    ecosystemContext: 'HeadyCheck monitors the <a href="https://headysystems.com">Heady Systems platform</a> and all connected services. Ask <a href="https://headybot.com">HeadyBuddy</a> about system health from any device.',
    nav: [
      { l: 'Dashboard', h: '#dashboard' },
      { l: 'Services', h: '#services' },
      { l: 'Platform', h: 'https://headysystems.com' },
      { l: 'Docs', h: 'https://headyio.com' },
      { l: 'Buddy', h: 'https://headybot.com' }
    ],
    primaryCta: { l: 'View Dashboard', h: '#dashboard' },
    secondaryCta: { l: 'API Docs', h: 'https://headyio.com' },
    relatedLinks: [
      { label: 'Full API reference', url: 'https://headyio.com', desc: 'Health check endpoints' },
      { label: 'Ask Buddy', url: 'https://headybot.com', desc: '"Is the system healthy?"' },
      { label: 'Platform details', url: 'https://headysystems.com', desc: 'Architecture behind the health' }
    ],
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
        id: 'services', title: 'Service Health', sub: 'Individual service status across the ecosystem',
        body: `<div class="grid g3c">
<div class="card"><div class="card-icon" style="background:#00e5cc20"><span class="status-dot up"></span></div><h3><a href="https://headysystems.com" style="color:inherit;text-decoration:none">headysystems.com</a></h3><p>Primary API \u2014 gateway, sessions, intelligence, orchestration</p></div>
<div class="card"><div class="card-icon" style="background:#3b82f620"><span class="status-dot up"></span></div><h3><a href="https://headycloud.com" style="color:inherit;text-decoration:none">headycloud.com</a></h3><p>Cloud orchestration \u2014 deployment layers, HeadyMe</p></div>
<div class="card"><div class="card-icon" style="background:#10b98120"><span class="status-dot up"></span></div><h3><a href="https://headyconnection.org" style="color:inherit;text-decoration:none">headyconnection.org</a></h3><p>Nonprofit mission \u2014 impact programs, governance</p></div>
</div>`
      }
    ]
  },

  headyio: {
    title: 'Heady Docs',
    domain: 'headyio.com',
    tagline: 'Developer Documentation',
    desc: 'Complete API reference, architecture guides, and integration docs for the Heady platform. Built for developers and integrators.',
    badge: 'Docs v3.0',
    vertical: 'documentation',
    tags: ['vertical: docs', 'layer: developer', 'audience: dev'],
    ecosystemContext: 'These docs cover the <a href="https://headysystems.com">Heady Systems platform</a> API. For a conversational way to explore, ask <a href="https://headybot.com">HeadyBuddy</a>. To understand why we built this, visit <a href="https://headyconnection.org">HeadyConnection</a>.',
    nav: [
      { l: 'Quick Start', h: '#quickstart' },
      { l: 'API', h: '#api' },
      { l: 'Platform', h: 'https://headysystems.com' },
      { l: 'MCP', h: 'https://headymcp.com' },
      { l: 'Health', h: 'https://headycheck.com' }
    ],
    primaryCta: { l: 'API Reference', h: '#api' },
    secondaryCta: { l: 'Quick Start', h: '#quickstart' },
    relatedLinks: [
      { label: 'See it live', url: 'https://headysystems.com', desc: 'The platform these docs describe' },
      { label: 'MCP connectors', url: 'https://headymcp.com', desc: 'Extend with any tool' },
      { label: 'Ask Buddy', url: 'https://headybot.com', desc: '"How do I use the sessions API?"' },
      { label: 'System health', url: 'https://headycheck.com', desc: 'Are endpoints responding?' }
    ],
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
        id: 'api', title: 'API Reference', sub: 'All available endpoints \u2014 hosted at headysystems.com',
        body: `<div class="grid g2c">
<div class="card"><h3>System</h3><p><code>GET /api/system/status</code><br><code>GET /api/subsystems</code><br><code>GET /api/health-checks/latest</code></p></div>
<div class="card"><h3>Sessions</h3><p><code>POST /api/v1/sessions</code><br><code>GET /api/v1/sessions/:id</code><br><code>DELETE /api/v1/sessions/:id</code></p></div>
<div class="card"><h3>Chat &amp; Buddy</h3><p><code>POST /api/v1/chat/resolve</code><br><code>POST /api/v1/chat/learn</code><br><code>GET /api/v1/chat/stats</code></p></div>
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
    desc: 'Discover, register, and manage Model Context Protocol connectors. Extend Heady \u2014 and HeadyBuddy \u2014 with any tool.',
    badge: 'MCP Protocol',
    vertical: 'extensibility',
    tags: ['vertical: extensibility', 'layer: protocol', 'audience: dev'],
    ecosystemContext: 'MCP connectors extend the <a href="https://headysystems.com">Heady Systems platform</a> with new tools and capabilities. <a href="https://headybuddy.org">HeadyBuddy</a> can use any registered connector. See the <a href="https://headyio.com">API docs</a> for integration details.',
    nav: [
      { l: 'Connectors', h: '#connectors' },
      { l: 'Register', h: '#register' },
      { l: 'Docs', h: 'https://headyio.com' },
      { l: 'Platform', h: 'https://headysystems.com' },
      { l: 'Buddy', h: 'https://headybuddy.org' }
    ],
    primaryCta: { l: 'Browse Connectors', h: '#connectors' },
    secondaryCta: { l: 'Register Yours', h: '#register' },
    relatedLinks: [
      { label: 'MCP API docs', url: 'https://headyio.com', desc: 'Registration and invocation endpoints' },
      { label: 'Platform', url: 'https://headysystems.com', desc: 'Where connectors run' },
      { label: 'Ask Buddy', url: 'https://headybot.com', desc: '"What MCP connectors are available?"' }
    ],
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
    tagline: 'Talk to HeadyBuddy',
    desc: 'Direct line to HeadyBuddy AI — the full chat interface. Ask about system health, run drift scans, manage connectors, or just have a conversation.',
    badge: 'Bot Online',
    vertical: 'companion',
    tags: ['vertical: companion', 'layer: user-facing', 'audience: everyone'],
    ecosystemContext: 'HeadyBot is the web chat interface for <a href="https://headybuddy.org">HeadyBuddy</a>, powered by the <a href="https://headysystems.com">Heady Systems platform</a>. Same Buddy, browser surface.',
    nav: [
      { l: 'Chat', h: '#chat' },
      { l: 'About Buddy', h: 'https://headybuddy.org' },
      { l: 'Platform', h: 'https://headysystems.com' },
      { l: 'Docs', h: 'https://headyio.com' }
    ],
    primaryCta: { l: 'Start Chat', h: '#chat' },
    secondaryCta: { l: 'About HeadyBuddy', h: 'https://headybuddy.org' },
    relatedLinks: [
      { label: 'About HeadyBuddy', url: 'https://headybuddy.org', desc: 'What Buddy is and where it lives' },
      { label: 'Platform', url: 'https://headysystems.com', desc: 'The AI engine behind the chat' },
      { label: 'API docs', url: 'https://headyio.com', desc: 'Chat resolve endpoint reference' },
      { label: 'System health', url: 'https://headycheck.com', desc: 'Is the chat backend healthy?' }
    ],
    sections: [
      {
        id: 'chat', title: 'HeadyBot Chat', sub: 'Full-featured AI conversation interface — powered by 3-stage intent resolution',
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
</script>
<p style="color:var(--text2);margin-top:var(--sp-md);font-size:14px">This is the web chat surface for <a href="https://headybuddy.org" style="color:var(--accent)">HeadyBuddy</a>. Buddy also lives on <a href="https://headybuddy.org#surfaces" style="color:var(--accent)">desktop, mobile, browser widget, and IDE</a>.</p>`
      }
    ]
  },

  headycloud: {
    title: 'HeadyCloud',
    domain: 'headycloud.com',
    tagline: 'Cloud Orchestration Layer',
    desc: 'Cloud orchestration, deployment layers, Monte Carlo-validated pipelines, and infrastructure management for the Heady ecosystem.',
    badge: 'Cloud Active',
    vertical: 'infrastructure',
    tags: ['vertical: infrastructure', 'layer: cloud', 'audience: ops'],
    ecosystemContext: 'HeadyCloud manages cloud deployments for the <a href="https://headysystems.com">Heady Systems platform</a>. Monitor deployment health at <a href="https://headycheck.com">HeadyCheck</a>. See the <a href="https://headyio.com">API docs</a> for orchestrator endpoints.',
    nav: [
      { l: 'Layers', h: '#layers' },
      { l: 'Deploy', h: '#deploy' },
      { l: 'Platform', h: 'https://headysystems.com' },
      { l: 'Health', h: 'https://headycheck.com' },
      { l: 'Docs', h: 'https://headyio.com' }
    ],
    primaryCta: { l: 'View Layers', h: '#layers' },
    secondaryCta: { l: 'Deploy Now', h: '#deploy' },
    relatedLinks: [
      { label: 'Platform', url: 'https://headysystems.com', desc: 'The system these layers deploy' },
      { label: 'Health dashboard', url: 'https://headycheck.com', desc: 'Are deploys healthy?' },
      { label: 'Orchestrator docs', url: 'https://headyio.com', desc: 'Pipeline and deploy API' },
      { label: 'Ask Buddy', url: 'https://headybot.com', desc: '"Deploy to production"' }
    ],
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
    tagline: 'The Nonprofit Behind Heady',
    desc: 'HeadyConnection is the nonprofit organization governing the Heady mission — expanding access to AI, funding community programs, and ensuring ethical technology for everyone.',
    badge: 'Nonprofit Active',
    vertical: 'nonprofit',
    tags: ['vertical: nonprofit', 'layer: governance', 'audience: community'],
    ecosystemContext: 'HeadyConnection is the nonprofit that governs the mission behind all Heady products. <a href="https://headysystems.com">Heady Systems</a> revenue funds these programs. <a href="https://headybuddy.org">HeadyBuddy</a> is our flagship user-facing companion.',
    nav: [
      { l: 'Mission', h: '#mission' },
      { l: 'Programs', h: '#programs' },
      { l: 'Buddy', h: 'https://headybuddy.org' },
      { l: 'Platform', h: 'https://headysystems.com' },
      { l: 'Docs', h: 'https://headyio.com' }
    ],
    primaryCta: { l: 'Our Mission', h: '#mission' },
    secondaryCta: { l: 'Meet Buddy', h: 'https://headybuddy.org' },
    relatedLinks: [
      { label: 'Meet HeadyBuddy', url: 'https://headybuddy.org', desc: 'Our flagship AI companion' },
      { label: 'The platform', url: 'https://headysystems.com', desc: 'Technology that funds the mission' },
      { label: 'System health', url: 'https://headycheck.com', desc: 'Is everything running?' },
      { label: 'Developer docs', url: 'https://headyio.com', desc: 'Build on our platform' }
    ],
    sections: [
      {
        id: 'mission', title: 'Our Mission', sub: 'Technology should expand access, not restrict it',
        unique: true,
        body: `<div class="grid g2c">
<div class="card"><div class="card-icon" style="background:#10b98120">&#x1f30d;</div><h3>Expand Access</h3><p>AI should be available to everyone regardless of income, location, or background. We build tools that reduce barriers, not create them.</p></div>
<div class="card"><div class="card-icon" style="background:#059669b20">&#x2696;&#xfe0f;</div><h3>Ensure Fairness</h3><p>Every Heady action passes through HeadySoul — our mission alignment engine. Five hard vetoes prevent dark patterns, surveillance, and exploitation.</p></div>
<div class="card"><div class="card-icon" style="background:#4ecdc420">&#x1f9e0;</div><h3>Build Intelligence</h3><p>Sacred Geometry architecture — organic, self-correcting systems that follow natural patterns. Same values at every scale, from code to organization.</p></div>
<div class="card"><div class="card-icon" style="background:#ff7eb320">&#x2764;&#xfe0f;</div><h3>Create Happiness</h3><p>Technology should feel like a friend, not a tool. HeadyBuddy is your companion — it remembers you, adapts to you, and follows you everywhere.</p></div>
</div>
<div class="eco-block" style="margin-top:var(--sp-lg)">
  <div class="eco-label">HeadySoul Value Weights</div>
  <div style="color:var(--text2);font-size:14px;line-height:1.7">
    <strong>Access: 30%</strong> · <strong>Fairness: 25%</strong> · <strong>Intelligence: 20%</strong> · <strong>Happiness: 15%</strong> · <strong>Redistribution: 10%</strong>
    <br><small style="color:var(--text3)">Every AI decision is scored against these weights. Scores below 40 are vetoed. Revenue flows back to nonprofit programs.</small>
  </div>
</div>`
      },
      {
        id: 'programs', title: 'Programs & Impact', sub: 'Where the mission meets the world',
        unique: true,
        body: `<div class="grid g3c">
<div class="card"><div class="card-icon" style="background:#3b82f620">&#x1f4da;</div><h3>HeadyAcademy</h3><p>Free AI education — courses, workshops, and mentorship for underserved communities</p></div>
<div class="card"><div class="card-icon" style="background:#f59e0b20">&#x1f4b0;</div><h3>PPP Pricing</h3><p>Purchasing power parity — automatically adjusted pricing so everyone can access premium features</p></div>
<div class="card"><div class="card-icon" style="background:#a78bfa20">&#x1f91d;</div><h3>Community Grants</h3><p>Funding for developers and organizations building ethical AI tools on the Heady platform</p></div>
</div>
<p style="color:var(--text2);margin-top:var(--sp-md);font-size:14px">HeadyConnection is funded by revenue from <a href="https://headysystems.com" style="color:var(--accent)">Heady Systems</a> products. 100% of nonprofit funds go to programs, not overhead.</p>`
      },
      {
        id: 'governance', title: 'Governance', sub: 'How we hold ourselves accountable',
        unique: true,
        body: `<div class="grid g2c">
<div class="card"><h3>HeadySoul Hard Vetoes</h3><p>Five non-negotiable rules that no AI action can bypass:<br><br>
<span class="vtag">No dark patterns</span>
<span class="vtag">No vendor lock-in</span>
<span class="vtag">No surveillance</span>
<span class="vtag">No paywalling essentials</span>
<span class="vtag">No exploiting vulnerable users</span></p></div>
<div class="card"><h3>Transparency</h3><p>Every HeadySoul decision is logged and auditable. Override tracking, escalation chains, and mission alignment scores are all public via the <a href="https://headyio.com" style="color:var(--accent)">API</a>.</p></div>
</div>`
      }
    ]
  },

  headyweb: {
    title: 'HeadyWeb',
    domain: 'headyweb.com',
    tagline: 'AI-Powered Browser',
    desc: 'Browse the web with HeadyBuddy at your side. Summarize pages, research topics, generate code, and manage tasks \u2014 all from one AI-native browser shell.',
    badge: 'Browser Active',
    vertical: 'browser',
    tags: ['vertical: browser', 'layer: user-facing', 'audience: everyone'],
    ecosystemContext: 'HeadyWeb is the AI browser shell for the <a href="https://headysystems.com">Heady Systems platform</a>. <a href="https://headybuddy.org">HeadyBuddy</a> lives in the sidebar, powered by the full intelligence stack. A program of <a href="https://headyconnection.org">HeadyConnection</a>.',
    nav: [
      { l: 'Features', h: '#features' },
      { l: 'Try It', h: '#launch' },
      { l: 'Buddy', h: 'https://headybuddy.org' },
      { l: 'Platform', h: 'https://headysystems.com' },
      { l: 'Docs', h: 'https://headyio.com' }
    ],
    primaryCta: { l: 'Launch HeadyWeb', h: '#launch' },
    secondaryCta: { l: 'Meet Buddy', h: 'https://headybuddy.org' },
    relatedLinks: [
      { label: 'About HeadyBuddy', url: 'https://headybuddy.org', desc: 'The AI companion powering the sidebar' },
      { label: 'Platform', url: 'https://headysystems.com', desc: 'The intelligence engine behind HeadyWeb' },
      { label: 'Chat directly', url: 'https://headybot.com', desc: 'Talk to Buddy without a browser shell' },
      { label: 'Our mission', url: 'https://headyconnection.org', desc: 'The nonprofit governing everything' }
    ],
    sections: [
      {
        id: 'features', title: 'Browser Meets AI Companion', sub: 'Four modes, one sidebar, every page',
        unique: true,
        body: `<div class="grid g2c">
<div class="card"><div class="card-icon" style="background:#7c3aed20">&#x1f4ac;</div><h3>Chat Mode</h3><p>Ask Buddy anything while browsing. Get instant answers, summaries, and explanations without leaving the page.</p></div>
<div class="card"><div class="card-icon" style="background:#a78bfa20">&#x2699;&#xfe0f;</div><h3>Tasks Mode</h3><p>Run deployments, trigger pipelines, manage MCP connectors, and orchestrate workflows \u2014 all from the sidebar.</p></div>
<div class="card"><div class="card-icon" style="background:#7c3aed20">&#x1f4bb;</div><h3>Code Mode</h3><p>Generate, explain, and refactor code. Buddy sees the page context and can help you work with any codebase.</p></div>
<div class="card"><div class="card-icon" style="background:#a78bfa20">&#x1f50d;</div><h3>Research Mode</h3><p>Summarize the current page, compare multiple sources, maintain research sessions across tabs.</p></div>
</div>
<p style="color:var(--text2);margin-top:var(--sp-md);font-size:14px">HeadyWeb merges browser and AI companion into one experience. <a href="https://headybuddy.org" style="color:var(--accent)">HeadyBuddy</a> is always aware of your current page and context.</p>`
      },
      {
        id: 'launch', title: 'Architecture', sub: 'How HeadyWeb connects everything',
        unique: true,
        body: `<div class="eco-block">
  <div class="eco-label">HeadyWeb Stack</div>
  <div class="code-block" style="font-size:12px">HeadyWeb (browser shell UI)
  \u251c\u2500\u2500 Viewport \u2014 multi-tab page rendering
  \u251c\u2500\u2500 Tab Manager \u2014 create, switch, close tabs
  \u251c\u2500\u2500 HeadyBuddy Sidebar \u2014 Chat / Tasks / Code / Research
  \u251c\u2500\u2500 Context Engine \u2014 page URL, selection, clipboard awareness
  \u2514\u2500\u2500 HeadySystems API \u2014 intent resolution, health, orchestration
       \u251c\u2500\u2500 3-stage intent matching (keyword, fuzzy, LLM)
       \u251c\u2500\u2500 MCP tool invocation
       \u2514\u2500\u2500 HeadySoul governance (value-weighted decisions)</div>
</div>
<div class="grid g3c" style="margin-top:var(--sp-md)">
<div class="card"><div class="card-icon" style="background:#7c3aed20">&#x1f310;</div><h3>Desktop App</h3><p>Tauri v2 shell with system WebView. Tray icon, global hotkey, always-on-top overlay.</p></div>
<div class="card"><div class="card-icon" style="background:#a78bfa20">&#x1f50c;</div><h3>Browser Extension</h3><p>Manifest V3 sidepanel for Chrome, Edge, Brave, Firefox. Same Buddy, existing browser.</p></div>
<div class="card"><div class="card-icon" style="background:#7c3aed20">&#x2601;&#xfe0f;</div><h3>Cloudflare Worker</h3><p>Edge-deployed web app. Zero-latency static hosting with API proxy to HeadySystems.</p></div>
</div>`
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

  // Tags HTML (vertical tags below hero)
  const tagsHtml = (site.tags || []).map(t => `<span class="vtag">${t}</span>`).join(' ');

  // Ecosystem context bar (breadcrumb-style "where this fits")
  const contextBarHtml = site.ecosystemContext ? `
  <div class="context-bar">
    <div class="wrap">
      <strong style="color:var(--accent)">Part of the Heady Ecosystem</strong>
      <span class="context-sep">/</span>
      ${site.ecosystemContext}
    </div>
  </div>` : '';

  // Related links ecosystem block (rendered after sections)
  const relatedHtml = (site.relatedLinks || []).length > 0 ? `
    <div class="wrap">
      <div class="eco-block">
        <div class="eco-label">Related in the Heady Ecosystem</div>
        <div class="eco-text">${theme.role}</div>
        <div class="eco-links">
          ${site.relatedLinks.map(r => `<a href="${r.url}" class="eco-link"><span class="eco-icon">&#x2192;</span> <span><strong>${r.label}</strong><br><small style="color:var(--text3)">${r.desc}</small></span></a>`).join('\n          ')}
        </div>
      </div>
    </div>` : '';

  // Footer ecosystem grid (uses ECOSYSTEM registry, highlights current site)
  const footerEcoHtml = ECOSYSTEM.map(e => {
    const isCurrent = e.key === siteKey;
    const eTheme = DOMAIN_THEMES[e.key] || {};
    return `<div class="footer-eco-item"${isCurrent ? ' style="background:var(--surface2);border-radius:8px"' : ''}>
        <a href="https://${e.domain}">${e.icon} ${e.name}${isCurrent ? ' (you are here)' : ''}</a>
        <small>${eTheme.role || e.short}</small>
      </div>`;
  }).join('\n      ');

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

${contextBarHtml}

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
      ${tagsHtml ? `<div style="margin:var(--sp-sm) 0">${tagsHtml}</div>` : ''}
      <div class="hero-btns">
        <a href="${site.primaryCta.h}" class="btn btn-primary">${site.primaryCta.l}</a>
        <a href="${site.secondaryCta.h}" class="btn btn-ghost">${site.secondaryCta.l}</a>
      </div>
    </div>
  </div>

${sectionsHtml}

${relatedHtml}

  <footer>
    <div class="wrap">
      <div class="sg-divider"><span>&#x221e;</span></div>
      <h3 style="color:var(--text1);font-size:16px;margin-bottom:var(--sp-md);text-align:center">The Heady Ecosystem</h3>
      <div class="footer-eco">
      ${footerEcoHtml}
      </div>
      <div class="footer-bottom">
        <span style="color:var(--text3);font-size:12px">&copy; ${new Date().getFullYear()} ${theme.org || 'Heady Systems'} &mdash; Sacred Geometry Architecture</span>
        <span>
          <a href="https://headyconnection.org">Nonprofit</a>
          <span style="margin:0 8px;color:var(--text3)">·</span>
          <a href="https://headyio.com">Docs</a>
          <span style="margin:0 8px;color:var(--text3)">·</span>
          <a href="https://headycheck.com">Status</a>
        </span>
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
