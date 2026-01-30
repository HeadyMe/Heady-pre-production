#!/usr/bin/env node
/**
 * Python syntax check script
 * Validates Python files in the src directory
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

// Check if src directory exists
if (!fs.existsSync(srcDir)) {
  console.error('Error: src directory not found');
  process.exit(1);
}

try {
  console.log('Checking Python syntax...');
  execSync('python -m compileall src', { stdio: 'inherit' });
  console.log('✓ Python syntax check passed');
  process.exit(0);
} catch (error) {
  console.error('✗ Python syntax check failed');
  process.exit(1);
}
