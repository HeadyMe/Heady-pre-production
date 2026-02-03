#!/usr/bin/env node

/**
 * Heady Control - System Synchronization
 * Executes hc command with auto-build option for system synchronization
 */

const { spawn } = require('child_process');
const path = require('path');

function executeCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`[HC] Executing: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const actionIndex = args.indexOf('-a');
  
  if (actionIndex !== -1 && args[actionIndex + 1] === 'hs') {
    console.log('🚀 Executing Heady Sync with auto-build');
    
    try {
      // Run hs.ps1 equivalent operations
      await executeCommand('powershell', [
        '-ExecutionPolicy', 'Bypass',
        '-File', path.join(__dirname, '..', 'scripts', 'hs.ps1')
      ]);
      
      console.log('✅ Heady Sync completed successfully');
    } catch (error) {
      console.error('❌ Heady Sync failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('Usage: node heady-control.js -a hs');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, executeCommand };
