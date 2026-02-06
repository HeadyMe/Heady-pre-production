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
// ║  FILE: scripts/sync-render-env.js                                 ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

#!/usr/bin/env node
/**
 * Render Environment Variable Sync
 * Pulls secrets from Render services to local .env file
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const RENDER_API_BASE = 'api.render.com';
const SERVICES = [
  'heady-manager-headyme',
  'heady-manager-headysystems'
];

function makeRequest(path, method = 'GET') {
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
        'Authorization': `Bearer ${apiKey}`
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
    req.end();
  });
}

async function findService(name) {
  const services = await makeRequest('/services?limit=50');
  return services.find(s => s.service?.name === name || s.name === name);
}

async function getEnvVars(serviceId) {
  return makeRequest(`/services/${serviceId}/env-vars`);
}

async function syncEnvVars() {
  console.log('🔄 Syncing Render Environment Variables\n');

  if (!process.env.RENDER_API_KEY) {
    console.error('❌ RENDER_API_KEY not set');
    console.log('\nSet it with:');
    console.log('  PowerShell: $env:RENDER_API_KEY = "rnd_xxxxxxxxxx"');
    process.exit(1);
  }

  const allEnvVars = new Map();
  const envFilePath = path.join(process.cwd(), '.env');

  for (const serviceName of SERVICES) {
    console.log(`🔍 Fetching env vars from ${serviceName}...`);
    
    try {
      const service = await findService(serviceName);
      if (!service) {
        console.error(`  ❌ Service not found`);
        continue;
      }

      const serviceId = service.service?.id || service.id;
      const envVars = await getEnvVars(serviceId);

      console.log(`  ✅ Found ${envVars.length} variables`);

      envVars.forEach(envVar => {
        const key = envVar.envVar?.key || envVar.key;
        const value = envVar.envVar?.value || envVar.value;
        const isSecret = envVar.envVar?.isSensitive || envVar.isSensitive;

        if (key && value !== undefined) {
          // Skip if already exists (first service wins)
          if (!allEnvVars.has(key)) {
            allEnvVars.set(key, { value, isSecret, source: serviceName });
          }
        }
      });

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  // Read existing .env if it exists
  let existingEnv = '';
  if (fs.existsSync(envFilePath)) {
    existingEnv = fs.readFileSync(envFilePath, 'utf8');
    console.log(`\n📄 Existing .env found, backing up...`);
    fs.writeFileSync(`${envFilePath}.backup`, existingEnv);
  }

  // Generate new .env content
  const lines = [
    '# Heady Systems Environment Variables',
    '# Auto-synced from Render services',
    `# Generated: ${new Date().toISOString()}`,
    '',
    '## Render Services'
  ];

  // Group by secret vs non-secret
  const secrets = [];
  const nonSecrets = [];

  allEnvVars.forEach((data, key) => {
    if (data.isSecret) {
      secrets.push({ key, ...data });
    } else {
      nonSecrets.push({ key, ...data });
    }
  });

  // Add non-secrets first
  if (nonSecrets.length > 0) {
    lines.push('\n# Non-Secret Variables');
    nonSecrets.forEach(({ key, value, source }) => {
      lines.push(`# From: ${source}`);
      lines.push(`${key}=${value}`);
    });
  }

  // Add secrets with placeholders
  if (secrets.length > 0) {
    lines.push('\n# Secret Variables (values hidden)');
    lines.push('# To get actual values:');
    lines.push('# 1. Go to https://dashboard.render.com/');
    lines.push('# 2. Select your service → Environment');
    lines.push('# 3. Copy values manually\n');

    secrets.forEach(({ key, source }) => {
      lines.push(`# From: ${source}`);
      lines.push(`# ${key}=<get from Render dashboard>`);
    });
  }

  // Add Render API key if not present
  if (!allEnvVars.has('RENDER_API_KEY')) {
    lines.push('\n# Render API');
    lines.push(`RENDER_API_KEY=${process.env.RENDER_API_KEY}`);
  }

  // Write to file
  const envContent = lines.join('\n') + '\n';
  fs.writeFileSync(envFilePath, envContent);

  console.log(`\n✅ .env file created/updated: ${envFilePath}`);
  console.log(`   Total variables: ${allEnvVars.size}`);
  console.log(`   Secrets: ${secrets.length}`);
  console.log(`   Non-secrets: ${nonSecrets.length}`);

  if (secrets.length > 0) {
    console.log(`\n⚠️  Secret values are hidden in .env for security.`);
    console.log('   Edit .env manually to add secret values from Render dashboard.');
  }

  console.log('\n✨ Sync complete!');
}

// Run if called directly
if (require.main === module) {
  syncEnvVars().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = { syncEnvVars };
