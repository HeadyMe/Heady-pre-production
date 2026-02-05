// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: scripts/deploy-render-auto.js
// LAYER: root
// 
//         _   _  _____    _    ____   __   __
//        | | | || ____|  / \  |  _ \ \ \ / /
//        | |_| ||  _|   / _ \ | | | | \ V / 
//        |  _  || |___ / ___ \| |_| |  | |  
//        |_| |_||_____/_/   \_\____/   |_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

#!/usr/bin/env node
/**
 * Heady Automated Render Deployment
 * Uses Render MCP Server for one-click deployment
 */

const { execSync } = require('child_process');
const path = require('path');

const SERVICES = [
  { name: 'heady-manager-headyme', id: null },
  { name: 'heady-manager-headysystems', id: null }
];

async function deploy() {
  console.log('🚀 Heady Automated Render Deployment\n');
  
  // Check for RENDER_API_KEY
  if (!process.env.RENDER_API_KEY) {
    console.error('❌ RENDER_API_KEY not set');
    console.log('Set it with: $env:RENDER_API_KEY = "your-key"');
    process.exit(1);
  }

  // Git push first
  console.log('📤 Pushing to remote...');
  try {
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Push successful\n');
  } catch (e) {
    console.log('⚠️  Push may have failed or nothing to push\n');
  }

  // Deploy each service
  for (const service of SERVICES) {
    console.log(`🎯 Deploying ${service.name}...`);
    
    try {
      // Use the Render MCP server via node
      const result = execSync(
        `node mcp-servers/render-mcp-server.js`,
        {
          env: { ...process.env, RENDER_API_KEY: process.env.RENDER_API_KEY },
          encoding: 'utf8',
          timeout: 30000
        }
      );
      
      console.log(`✅ ${service.name} deployed successfully`);
    } catch (error) {
      console.error(`❌ Failed to deploy ${service.name}: ${error.message}`);
    }
  }

  console.log('\n✨ Deployment complete!');
  console.log('URLs:');
  console.log('  • https://heady-manager-headyme.onrender.com');
  console.log('  • https://heady-manager-headysystems.onrender.com');
}

deploy().catch(console.error);
