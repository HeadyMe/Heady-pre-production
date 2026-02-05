// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: scripts/render-deploy.js
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
 * Simple Render API Deployment Script
 * No external dependencies required
 */

const https = require('https');

const RENDER_API_BASE = 'api.render.com';
const SERVICES = [
  'heady-manager-headyme',
  'heady-manager-headysystems'
];

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.RENDER_API_KEY;
    if (!apiKey) {
      reject(new Error('RENDER_API_KEY not set'));
      return;
    }

    const options = {
      hostname: RENDER_API_BASE,
      path: `/v1${path}`,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function findService(name) {
  const services = await makeRequest('/services?limit=50');
  return services.find(s => s.service?.name === name || s.name === name);
}

async function deployService(serviceId) {
  return makeRequest(`/services/${serviceId}/deploys`, 'POST', { clearCache: false });
}

async function main() {
  console.log('🚀 Heady Render Auto-Deploy\n');

  if (!process.env.RENDER_API_KEY) {
    console.error('❌ RENDER_API_KEY environment variable not set');
    console.log('\nSet it with:');
    console.log('  PowerShell: $env:RENDER_API_KEY = "rnd_xxxxxxxxxx"');
    console.log('  CMD: set RENDER_API_KEY=rnd_xxxxxxxxxx');
    process.exit(1);
  }

  for (const serviceName of SERVICES) {
    console.log(`🔍 Finding ${serviceName}...`);
    
    try {
      const service = await findService(serviceName);
      
      if (!service) {
        console.error(`❌ Service "${serviceName}" not found`);
        continue;
      }

      const serviceId = service.service?.id || service.id;
      console.log(`✅ Found: ${serviceId}`);

      console.log(`🚀 Triggering deploy...`);
      const deploy = await deployService(serviceId);
      
      console.log(`✅ Deploy triggered!`);
      console.log(`   ID: ${deploy.id || 'N/A'}`);
      console.log(`   Status: ${deploy.status || 'pending'}\n`);

    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }

  console.log('✨ Done! Check Render dashboard for deploy status:');
  console.log('   https://dashboard.render.com/\n');
}

main().catch(console.error);
