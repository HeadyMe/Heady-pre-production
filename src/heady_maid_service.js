#!/usr/bin/env node

/**
 * HEADY MAID SERVICE
 * Standalone service wrapper for HeadyMaid
 */

const HeadyMaid = require('./heady_maid');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  scanInterval: 30000,
  deepScanInterval: 300000,
  rootDirs: [process.cwd()],
  enableRealtime: true
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--scanInterval' && args[i + 1]) {
    config.scanInterval = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--deepScanInterval' && args[i + 1]) {
    config.deepScanInterval = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--no-realtime') {
    config.enableRealtime = false;
  }
}

// Initialize HeadyMaid
const maid = new HeadyMaid(config);

// Event handlers
maid.on('initialized', (data) => {
  console.log('[SERVICE] HeadyMaid initialized');
  console.log(`[SERVICE] Tracking ${data.inventory.totalFiles} files, ${data.inventory.totalDirectories} directories`);
});

maid.on('scan-complete', (data) => {
  console.log(`[SERVICE] Quick scan complete: ${data.files} files in ${data.duration}ms`);
});

maid.on('deep-scan-complete', (data) => {
  console.log(`[SERVICE] Deep scan complete: ${data.inventory.totalFiles} files in ${data.duration}ms`);
  console.log(`[SERVICE] Optimization opportunities: ${data.opportunities.duplicates.length} duplicates, ${data.opportunities.misplaced.length} misplaced`);
});

maid.on('file-change', (data) => {
  console.log(`[SERVICE] File ${data.eventType}: ${path.basename(data.filepath)}`);
});

maid.on('opportunities-detected', (opportunities) => {
  if (opportunities.duplicates.length > 0) {
    console.log(`[SERVICE] Found ${opportunities.duplicates.length} duplicate file groups`);
  }
  if (opportunities.misplaced.length > 0) {
    console.log(`[SERVICE] Found ${opportunities.misplaced.length} misplaced files`);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[SERVICE] Shutting down HeadyMaid...');
  await maid.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[SERVICE] Shutting down HeadyMaid...');
  await maid.shutdown();
  process.exit(0);
});

// Start service
console.log('[SERVICE] Starting HeadyMaid...');
console.log(`[SERVICE] Scan interval: ${config.scanInterval}ms`);
console.log(`[SERVICE] Deep scan interval: ${config.deepScanInterval}ms`);
console.log(`[SERVICE] Real-time monitoring: ${config.enableRealtime ? 'enabled' : 'disabled'}`);

maid.initialize().catch(err => {
  console.error('[SERVICE] Fatal error:', err);
  process.exit(1);
});
