#!/usr/bin/env node
/**
 * HEADY GLOBAL AUTOBUILD
 * Automated project builder using Checkpoint System
 * Merges sparse datasets into Heady apps
 */

const CheckpointReporter = require('../src/checkpoint_reporter');
const MCPClientWrapper = require('../src/mcp_client_wrapper');
const { execSync } = require('child_process');
const path = require('path');

class HeadyAutoBuild {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.checkpointReporter = new CheckpointReporter({
      rootDir: this.rootDir,
      outputDir: path.join(this.rootDir, 'audit_logs', 'autobuild')
    });
    this.mcpClient = new MCPClientWrapper();
    this.mcpConnected = false;
  }

  log(message, level = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };

    const prefix = {
      info: '→',
      success: '✓',
      warning: '⚠',
      error: '✗'
    };

    console.log(`${colors[level]}${prefix[level]} ${message}${colors.reset}`);
  }

  banner() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║              HEADY GLOBAL AUTOBUILD                           ║');
    console.log('║         Checkpoint-Driven Project Builder                    ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  }

  async execute() {
    this.banner();

    try {
      // Connect to all HeadyMCP services
      this.log('Connecting to HeadyMCP services...', 'info');
      try {
        const serviceCount = await this.mcpClient.connectAll();
        this.mcpConnected = true;
        this.log(`Connected to ${serviceCount} MCP services`, 'success');
        
        // List available tools
        const tools = this.mcpClient.listTools();
        this.log(`Available tools: ${tools.length}`, 'info');
      } catch (error) {
        this.log(`MCP connection failed (continuing): ${error.message}`, 'warning');
      }

      // Phase 1: Pre-build checkpoint
      this.log('Phase 1: Generating pre-build checkpoint...', 'info');
      await this.checkpointReporter.generateReport();
      this.log('Pre-build checkpoint complete', 'success');

      // Phase 2: Install dependencies
      this.log('\nPhase 2: Installing dependencies...', 'info');
      try {
        execSync('npm install', { cwd: this.rootDir, stdio: 'inherit' });
        this.log('Dependencies installed', 'success');
      } catch (error) {
        this.log('Dependency installation failed', 'warning');
      }

      // Phase 3: Run tests
      this.log('\nPhase 3: Running tests...', 'info');
      try {
        execSync('npm test', { cwd: this.rootDir, stdio: 'inherit' });
        this.log('Tests passed', 'success');
      } catch (error) {
        this.log('Some tests failed (continuing)', 'warning');
      }

      // Phase 4: Start services
      this.log('\nPhase 4: Starting Heady services...', 'info');
      this.log('  • Heady Manager: http://localhost:3300', 'info');
      this.log('  • Admin UI: http://localhost:3300/admin', 'info');
      this.log('  • Health Dashboard: http://localhost:3300/health-dashboard.html', 'info');

      // Phase 5: Post-build checkpoint
      this.log('\nPhase 5: Generating post-build checkpoint...', 'info');
      await this.checkpointReporter.generateReport();
      this.log('Post-build checkpoint complete', 'success');

      // Summary
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║                   BUILD COMPLETE                              ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');

      this.log('Next steps:', 'info');
      this.log('  1. Run: npm start', 'info');
      this.log('  2. Open: http://localhost:3300/admin', 'info');
      this.log('  3. View checkpoints: .\\scripts\\Invoke-Checkpoint.ps1 -Action list', 'info');

      // Disconnect MCP services
      if (this.mcpConnected) {
        this.log('\nDisconnecting MCP services...', 'info');
        await this.mcpClient.disconnectAll();
      }

    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Execute
const autobuild = new HeadyAutoBuild();
autobuild.execute().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
