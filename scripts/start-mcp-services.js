#!/usr/bin/env node

/**
 * Heady MCP Services Launcher
 * Starts all MCP services and the orchestrator
 */

const { spawn } = require('child_process');
const path = require('path');

const services = [
  {
    name: 'MCP Orchestrator',
    script: path.join(__dirname, '../src', 'mcp', 'heady-mcp-orchestrator.js'),
    port: 3304
  },
  {
    name: 'Backend API',
    script: path.join(__dirname, '../backend', 'src', 'index.js'),
    port: 4000
  }
];

const processes = [];

function startService(service) {
  console.log(`Starting ${service.name} on port ${service.port}...`);
  
  const proc = spawn('node', [service.script], {
    env: { ...process.env, PORT: service.port },
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  proc.stdout.on('data', (data) => {
    console.log(`[${service.name}] ${data.toString().trim()}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`[${service.name}] ERROR: ${data.toString().trim()}`);
  });
  
  proc.on('close', (code) => {
    console.log(`[${service.name}] exited with code ${code}`);
  });
  
  processes.push(proc);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down all services...');
  processes.forEach(proc => proc.kill());
  process.exit(0);
});

console.log('='.repeat(50));
console.log('Heady MCP Services Launcher');
console.log('='.repeat(50));

// Start all services
services.forEach(service => startService(service));

console.log('\nAll services started. Press Ctrl+C to stop.');
console.log('\nService URLs:');
console.log('  - MCP Gateway: http://localhost:3304');
console.log('  - Graph Server: http://localhost:3301');
console.log('  - Metrics Server: http://localhost:3302');
console.log('  - Workflow Server: http://localhost:3303');
console.log('  - Backend API: http://localhost:4000');
console.log('  - Admin UI: http://localhost:3300/admin');
I don't have enough information to understand your instruction. "mo" is too brief for me to determine what code you'd like me to generate. 

Could you please provide more details about what you'd like me to create?