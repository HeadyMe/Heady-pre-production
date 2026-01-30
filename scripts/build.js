#!/usr/bin/env node
/**
 * Build script for Heady project
 * Calls the Python build orchestrator
 */

const { execSync } = require('child_process');
const path = require('path');

const buildScript = path.join(__dirname, '..', 'src', 'consolidated_builder.py');

try {
  console.log('Starting build...');
  execSync(`python ${buildScript} --project-root .`, { stdio: 'inherit' });
  console.log('Build completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Build failed');
  process.exit(1);
}
