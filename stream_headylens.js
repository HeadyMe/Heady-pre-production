#!/usr/bin/env node

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
// ║  FILE: stream_headylens.js                                      ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const HEADY_MANAGER_URL = 'https://heady-manager-headysystems.onrender.com';
const POLL_INTERVAL = 2000; // 2 seconds

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Clear screen and show header
function showHeader() {
  console.clear();
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                ║
║     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                ║
║     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 ║
║     ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  ║
║     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   ║
║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   ║
║                                                                               ║
║      LENS - REAL-TIME SYSTEM MONITORING STREAM                               ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
  console.log(`${colors.yellow}📡 Streaming HeadyLens data from ${HEADY_MANAGER_URL}${colors.reset}`);
  console.log(`${colors.yellow}⏱️  Update interval: ${POLL_INTERVAL}ms${colors.reset}`);
  console.log(`${colors.yellow}🔄 Press Ctrl+C to stop${colors.reset}\n`);
}

// Format system health with colors
function formatHealth(health) {
  switch (health) {
    case 'healthy':
      return `${colors.green}●${colors.reset} ${colors.green}HEALTHY${colors.reset}`;
    case 'degraded':
      return `${colors.yellow}●${colors.reset} ${colors.yellow}DEGRADED${colors.reset}`;
    case 'critical':
      return `${colors.red}●${colors.reset} ${colors.red}CRITICAL${colors.reset}`;
    default:
      return `${colors.white}○${colors.reset} ${health.toUpperCase()}`;
  }
}

// Format resource usage with colors
function formatResource(value, type) {
  let color = colors.green;
  if (value > 80) color = colors.red;
  else if (value > 60) color = colors.yellow;

  const icon = type === 'cpu' ? '🔥' : type === 'memory' ? '🧠' : '💾';
  return `${icon} ${color}${value.toFixed(1)}%${colors.reset}`;
}

// Format timestamp
function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleTimeString();
}

// Fetch data from HeadyLens
async function fetchLensData() {
  return new Promise((resolve, reject) => {
    const url = `${HEADY_MANAGER_URL}/api/system/status`;

    http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Display the streaming data
function displayData(data) {
  // Move cursor to top of data area
  process.stdout.write('\x1b[8;1H');

  // Clear data area
  for (let i = 0; i < 20; i++) {
    process.stdout.write('\x1b[K\n');
  }
  process.stdout.write('\x1b[8;1H');

  // System Overview
  console.log(`${colors.bright}═══ SYSTEM OVERVIEW${colors.reset}`);
  console.log(`🌐 Layer: ${colors.cyan}${data.active_layer?.name || 'Unknown'}${colors.reset} (${data.active_layer?.id || 'unknown'})`);
  console.log(`🏥 Health: ${formatHealth(data.system_health || 'unknown')}`);
  console.log(`⚡ Uptime: ${colors.blue}${(data.uptime || 0).toFixed(0)}s${colors.reset}`);
  console.log(`🔧 Environment: ${colors.magenta}${data.environment || 'unknown'}${colors.reset}`);
  console.log(`🚀 Production Ready: ${data.production_ready ? `${colors.green}YES${colors.reset}` : `${colors.red}NO${colors.reset}`}`);
  console.log('');

  // Capabilities
  const caps = data.capabilities || {};
  console.log(`${colors.bright}═══ CAPABILITIES${colors.reset}`);
  console.log(`🤖 Nodes: ${caps.nodes?.active || 0}/${caps.nodes?.total || 0} active`);
  console.log(`🛠️  Tools: ${caps.tools?.active || 0}/${caps.tools?.total || 0} active`);
  console.log(`🔄 Workflows: ${caps.workflows?.active || 0}/${caps.workflows?.total || 0} active`);
  console.log(`🌐 Services: ${caps.services?.healthy || 0}/${caps.services?.total || 0} healthy`);
  console.log('');

  // Monte Carlo Analysis
  const mc = data.monteCarlo || {};
  if (mc.compositeScore) {
    console.log(`${colors.bright}═══ MONTE CARLO ANALYSIS${colors.reset}`);
    console.log(`📊 Composite Score: ${colors.cyan}${mc.compositeScore.toFixed(1)}${colors.reset} (${colors.green}${mc.grade || 'UNKNOWN'}${colors.reset})`);
    console.log(`🚀 Pipeline Success: ${colors.green}${(mc.pipeline?.successRate * 100).toFixed(1)}%${colors.reset}`);
    console.log(`⚠️  Deployment Risk: ${colors.yellow}${mc.deployment?.riskGrade || 'UNKNOWN'}${colors.reset}`);
    console.log(`📈 Readiness Score: ${colors.blue}${mc.readiness?.score?.toFixed(1) || 'N/A'}${colors.reset} (${colors.cyan}${mc.readiness?.grade || 'UNKNOWN'}${colors.reset})`);
    console.log('');
  }

  // Memory Usage
  const memory = data.memory || {};
  if (memory.rss) {
    console.log(`${colors.bright}═══ MEMORY USAGE${colors.reset}`);
    console.log(`💾 RSS: ${(memory.rss / 1024 / 1024).toFixed(1)} MB`);
    console.log(`🧠 Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(1)} MB / ${(memory.heapTotal / 1024 / 1024).toFixed(1)} MB`);
    console.log('');
  }

  // Last Update
  console.log(`${colors.dim}Last update: ${formatTimestamp(data.timestamp)}${colors.reset}`);
}

// Main streaming loop
async function startStreaming() {
  showHeader();

  // Reserve space for header (7 lines) + data area
  console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');

  while (true) {
    try {
      const data = await fetchLensData();
      displayData(data);
    } catch (error) {
      console.error(`${colors.red}Error fetching data:${colors.reset}`, error.message);
    }

    // Wait for next poll
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}🛑 Stopping HeadyLens stream...${colors.reset}`);
  process.exit(0);
});

// Start streaming
console.log(`${colors.cyan}🔍 Starting HeadyLens data stream...${colors.reset}`);
startStreaming().catch(err => {
  console.error(`${colors.red}Failed to start streaming:${colors.reset}`, err);
  process.exit(1);
});
