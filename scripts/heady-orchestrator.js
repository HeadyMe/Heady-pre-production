#!/usr/bin/env node
/**
 * Heady Orchestrator - Deterministic System Orchestration
 * Integrates Codex v13 architecture with existing Heady Manager
 * 
 * Features:
 * - Deterministic repository generation
 * - Governance-locked operations
 * - Trust domain enforcement
 * - MCP gateway integration
 * - Sacred Geometry UI coordination
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Configuration from environment
const HEADY_TRUST_DOMAIN = process.env.HEADY_TRUST_DOMAIN || 'headysystems.com';
const HEADY_APP_DOMAIN = process.env.HEADY_APP_DOMAIN || 'app.headysystems.com';
const HEADY_ASSIGNEE = process.env.HEADY_ASSIGNEE || 'HeadySystems Inc.';
const HEADY_INVENTOR = process.env.HEADY_INVENTOR || 'Eric Haywood';
const HEADY_GOVERNANCE_MODE = process.env.HEADY_GOVERNANCE_MODE || 'locked';
const HEADY_AUDIT_ENABLED = process.env.HEADY_AUDIT_ENABLED !== 'false';

const CODEX_BUILDER_PATH = path.join(__dirname, '../src/codex_builder_v13.py');
const HEADY_MANAGER_PATH = path.join(__dirname, '../heady-manager.js');
const PYTHON_BIN = process.env.HEADY_PYTHON_BIN || 'python';
const NODE_BIN = process.env.NODE_BIN || 'node';

class HeadyOrchestrator {
  constructor() {
    this.registry = null;
    this.manifest = null;
    this.governanceLock = null;
    this.processes = new Map();
    this.operationLog = [];
  }

  async initialize() {
    console.log('🔷 Heady Orchestrator v13 Initializing...');
    console.log(`   Trust Domain: ${HEADY_TRUST_DOMAIN}`);
    console.log(`   Governance: ${HEADY_GOVERNANCE_MODE}`);
    console.log(`   Audit: ${HEADY_AUDIT_ENABLED ? 'Enabled' : 'Disabled'}`);
    
    await this.loadRegistry();
    await this.loadManifest();
    await this.loadGovernanceLock();
    await this.validateIntegrity();
    
    console.log('✅ Orchestrator initialized successfully\n');
  }

  async loadRegistry() {
    try {
      const registryPath = path.join(__dirname, 'codex_v13', 'REGISTRY.json');
      const data = await fs.readFile(registryPath, 'utf8');
      this.registry = JSON.parse(data);
      console.log('   ✓ Registry loaded');
    } catch (error) {
      console.warn('   ⚠ Registry not found, will generate');
      this.registry = null;
    }
  }

  async loadManifest() {
    try {
      const manifestPath = path.join(__dirname, 'codex_v13', 'manifest.json');
      const data = await fs.readFile(manifestPath, 'utf8');
      this.manifest = JSON.parse(data);
      console.log('   ✓ Manifest loaded');
    } catch (error) {
      console.warn('   ⚠ Manifest not found');
      this.manifest = null;
    }
  }

  async loadGovernanceLock() {
    try {
      const lockPath = path.join(__dirname, 'codex_v13', 'governance.lock');
      const data = await fs.readFile(lockPath, 'utf8');
      this.governanceLock = JSON.parse(data);
      console.log('   ✓ Governance lock loaded');
    } catch (error) {
      console.warn('   ⚠ Governance lock not found');
      this.governanceLock = null;
    }
  }

  async validateIntegrity() {
    if (!this.manifest || !this.manifest.files) {
      console.log('   ⚠ Skipping integrity check (no manifest)');
      return;
    }

    console.log('   🔍 Validating file integrity...');
    let valid = 0;
    let invalid = 0;

    for (const file of this.manifest.files) {
      const filePath = path.join(__dirname, 'codex_v13', file.path);
      try {
        const content = await fs.readFile(filePath);
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        
        if (hash === file.sha256) {
          valid++;
        } else {
          console.warn(`   ⚠ Hash mismatch: ${file.path}`);
          invalid++;
        }
      } catch (error) {
        console.warn(`   ⚠ Missing file: ${file.path}`);
        invalid++;
      }
    }

    console.log(`   ✓ Integrity check: ${valid} valid, ${invalid} invalid`);
  }

  async runCodexBuilder() {
    console.log('\n🔨 Running Codex Builder v13...');
    
    return new Promise((resolve, reject) => {
      const codexDir = path.join(__dirname, 'codex_v13');
      const proc = spawn(PYTHON_BIN, [CODEX_BUILDER_PATH], {
        cwd: codexDir,
        stdio: 'inherit'
      });

      proc.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Codex Builder completed successfully');
          resolve();
        } else {
          reject(new Error(`Codex Builder exited with code ${code}`));
        }
      });

      proc.on('error', (error) => {
        reject(error);
      });
    });
  }

  async startHeadyManager() {
    console.log('\n🚀 Starting Heady Manager...');
    
    return new Promise((resolve, reject) => {
      const proc = spawn(NODE_BIN, [HEADY_MANAGER_PATH], {
        cwd: __dirname,
        stdio: 'inherit',
        env: {
          ...process.env,
          HEADY_TRUST_DOMAIN,
          HEADY_APP_DOMAIN,
          HEADY_ASSIGNEE,
          HEADY_INVENTOR,
          HEADY_GOVERNANCE_MODE,
          HEADY_AUDIT_ENABLED: String(HEADY_AUDIT_ENABLED)
        }
      });

      this.processes.set('heady-manager', proc);

      proc.on('error', (error) => {
        console.error('❌ Heady Manager error:', error);
        reject(error);
      });

      // Don't wait for manager to exit, it runs continuously
      setTimeout(() => {
        console.log('✅ Heady Manager started');
        resolve();
      }, 2000);
    });
  }

  async regenerateIfNeeded() {
    if (!this.registry || !this.manifest) {
      console.log('\n🔄 Regenerating Codex v13 structure...');
      await this.runCodexBuilder();
      await this.loadRegistry();
      await this.loadManifest();
      await this.loadGovernanceLock();
    }
  }

  async orchestrate() {
    try {
      await this.initialize();
      await this.regenerateIfNeeded();
      await this.startHeadyManager();
      
      console.log('\n🎯 Heady System fully orchestrated and running');
      console.log('   Press Ctrl+C to stop\n');

      // Keep process alive
      process.on('SIGINT', async () => {
        console.log('\n\n🛑 Shutting down Heady Orchestrator...');
        for (const [name, proc] of this.processes) {
          console.log(`   Stopping ${name}...`);
          proc.kill('SIGTERM');
        }
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      process.exit(1);
    }
  }

  logOperation(operation, status, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      operation,
      status,
      details
    };
    this.operationLog.push(entry);
    
    if (HEADY_AUDIT_ENABLED) {
      console.log(`[AUDIT] ${operation}: ${status}`);
    }
  }
}

// Main execution
if (require.main === module) {
  const orchestrator = new HeadyOrchestrator();
  orchestrator.orchestrate().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = HeadyOrchestrator;
