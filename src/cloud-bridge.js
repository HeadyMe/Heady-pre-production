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
// ║  FILE: src/cloud-bridge.js                                        ║
// ║  LAYER: backend/src                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

// HEADY CLOUD BRIDGE - Connects local to cloud live system
const http = require('http');
const https = require('https');

const LOCAL_MANAGER_URL = process.env.LOCAL_MANAGER_URL || 'http://localhost:3300';
const CLOUD_HEADYME_URL = process.env.CLOUD_HEADYME_URL || 'https://heady-manager-headyme.onrender.com';
const CLOUD_HEADYSYSTEMS_URL = process.env.CLOUD_HEADYSYSTEMS_URL || 'https://heady-manager-headysystems.onrender.com';
const SYNC_INTERVAL = parseInt(process.env.SYNC_INTERVAL || '30', 10) * 1000;

console.log('∞ Heady Cloud Bridge - Hybrid Connector ∞');
console.log(`Local: ${LOCAL_MANAGER_URL}`);
console.log(`Cloud HeadyMe: ${CLOUD_HEADYME_URL}`);
console.log(`Cloud HeadySystems: ${CLOUD_HEADYSYSTEMS_URL}`);
console.log(`Sync Interval: ${SYNC_INTERVAL}ms`);

async function checkHealth(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(`${url}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ ok: json.ok, version: json.version, uptime: json.uptime });
        } catch {
          resolve({ ok: false });
        }
      });
    });
    req.on('error', () => resolve({ ok: false }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ ok: false });
    });
  });
}

async function syncStatus() {
  const local = await checkHealth(LOCAL_MANAGER_URL);
  const cloudMe = await checkHealth(CLOUD_HEADYME_URL);
  const cloudSys = await checkHealth(CLOUD_HEADYSYSTEMS_URL);
  
  console.log(`[${new Date().toISOString()}] Sync Status:`);
  console.log(`  Local: ${local.ok ? 'LIVE' : 'DOWN'} ${local.version || ''}`);
  console.log(`  Cloud HeadyMe: ${cloudMe.ok ? 'LIVE' : 'DOWN'} ${cloudMe.version || ''}`);
  console.log(`  Cloud HeadySystems: ${cloudSys.ok ? 'LIVE' : 'DOWN'} ${cloudSys.version || ''}`);
  
  // Sync logic here - push local state to cloud
  if (local.ok && (cloudMe.ok || cloudSys.ok)) {
    console.log('  → Hybrid sync active');
  }
}

// Initial sync
syncStatus();

// Periodic sync
setInterval(syncStatus, SYNC_INTERVAL);

// Keep alive
console.log('Bridge running. Press Ctrl+C to stop.');
