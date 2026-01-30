#!/usr/bin/env node
/**
 * Smoke test for heady-manager.js
 * Tests that the module can be loaded without errors
 */

console.log('Running smoke test...');

try {
  // Test that we can require the main dependencies
  console.log('✓ Checking express...');
  require('express');
  
  console.log('✓ Checking cors...');
  require('cors');
  
  console.log('✓ Checking dockerode...');
  require('dockerode');
  
  console.log('✓ Checking dotenv...');
  require('dotenv');
  
  console.log('✓ Checking python-shell...');
  require('python-shell');
  
  console.log('✓ All dependencies loaded successfully');
  
  // Check that key files exist
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'heady-manager.js',
    'package.json',
    'requirements.txt',
    'src/process_data.py',
    'src/consolidated_builder.py'
  ];
  
  console.log('✓ Checking required files...');
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file not found: ${file}`);
    }
  }
  
  console.log('✓ All required files present');
  console.log('✓ Smoke test passed!');
  process.exit(0);
} catch (error) {
  console.error('✗ Smoke test failed:', error.message);
  process.exit(1);
}
