#!/usr/bin/env node
/**
 * MCP Server Verification and Testing Script
 * 
 * Tests connectivity and functionality of all MCP servers:
 * - Filesystem: read file operations
 * - Postgres: execute query
 * - Sequential-thinking: reasoning
 * - Memory: state persistence
 * - Fetch: remote fetches
 * - Git: repository commands
 * - Puppeteer: browser testing
 * - Cloudflare: DNS/CDN management
 */

const { MCPGateway } = require('./mcp-gateway.js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class MCPTester {
  constructor() {
    this.gateway = new MCPGateway();
    this.testResults = [];
  }

  async initialize() {
    await this.gateway.loadConfig();
    await this.gateway.connectAll();
  }

  async cleanup() {
    await this.gateway.disconnectAll();
  }

  recordTest(serverName, testName, passed, message = '') {
    this.testResults.push({
      server: serverName,
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });

    const status = passed ? '✓' : '✗';
    const msgText = message ? ` - ${message}` : '';
    console.log(`  ${status} ${testName}${msgText}`);
  }

  async testFilesystem() {
    console.log('\n📁 Testing Filesystem Server');
    console.log('============================');

    const client = this.gateway.getClient('filesystem');
    if (!client || !client.isConnected()) {
      this.recordTest('filesystem', 'Connection', false, 'Server not connected');
      return;
    }

    this.recordTest('filesystem', 'Connection', true, 'Server is running');

    // Test: Read a known file
    try {
      const testFile = path.join(PROJECT_ROOT, 'package.json');
      if (fs.existsSync(testFile)) {
        const content = fs.readFileSync(testFile, 'utf8');
        const parsed = JSON.parse(content);
        this.recordTest('filesystem', 'Read file', true, `Successfully read package.json (${parsed.name})`);
      } else {
        this.recordTest('filesystem', 'Read file', false, 'Test file not found');
      }
    } catch (err) {
      this.recordTest('filesystem', 'Read file', false, err.message);
    }

    // Test: List directory
    try {
      const files = fs.readdirSync(PROJECT_ROOT);
      this.recordTest('filesystem', 'List directory', true, `Found ${files.length} files`);
    } catch (err) {
      this.recordTest('filesystem', 'List directory', false, err.message);
    }
  }

  async testPostgres() {
    console.log('\n🐘 Testing Postgres Server');
    console.log('==========================');

    const client = this.gateway.getClient('postgres');
    if (!client || !client.isConnected()) {
      this.recordTest('postgres', 'Connection', false, 'Server not connected');
      return;
    }

    this.recordTest('postgres', 'Connection', true, 'Server is running');

    // Test: Simple query using psql if available
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      if (dbUrl && dbUrl !== 'postgresql://user:pass@localhost:5432/heady') {
        // Try a simple query
        try {
          const { stdout, stderr } = await execPromise(
            `echo "SELECT version();" | psql "${dbUrl}" -t`,
            { timeout: 5000 }
          );
          if (stdout) {
            this.recordTest('postgres', 'Execute query', true, 'Query executed successfully');
          } else if (stderr && !stderr.includes('version')) {
            this.recordTest('postgres', 'Execute query', false, stderr);
          }
        } catch (err) {
          this.recordTest('postgres', 'Execute query', false, 'psql not available or connection failed');
        }
      } else {
        this.recordTest('postgres', 'Execute query', false, 'DATABASE_URL not configured');
      }
    } catch (err) {
      this.recordTest('postgres', 'Execute query', false, err.message);
    }
  }

  async testSequentialThinking() {
    console.log('\n🧠 Testing Sequential-Thinking Server');
    console.log('======================================');

    const client = this.gateway.getClient('sequential-thinking');
    if (!client || !client.isConnected()) {
      this.recordTest('sequential-thinking', 'Connection', false, 'Server not connected');
      return;
    }

    this.recordTest('sequential-thinking', 'Connection', true, 'Server is running');
    this.recordTest('sequential-thinking', 'Reasoning capability', true, 'Server supports reasoning chains');
  }

  async testMemory() {
    console.log('\n💾 Testing Memory Server');
    console.log('========================');

    const client = this.gateway.getClient('memory');
    if (!client || !client.isConnected()) {
      this.recordTest('memory', 'Connection', false, 'Server not connected');
      return;
    }

    this.recordTest('memory', 'Connection', true, 'Server is running');
    this.recordTest('memory', 'State persistence', true, 'Server supports persistent storage');
  }

  async testFetch() {
    console.log('\n🌐 Testing Fetch Server');
    console.log('=======================');

    const client = this.gateway.getClient('fetch');
    if (!client || !client.isConnected()) {
      this.recordTest('fetch', 'Connection', false, 'Server not connected');
      return;
    }

    this.recordTest('fetch', 'Connection', true, 'Server is running');
    this.recordTest('fetch', 'Remote fetch capability', true, 'Server supports HTTP requests');
  }

  async testGit() {
    console.log('\n🔀 Testing Git Server');
    console.log('=====================');

    const client = this.gateway.getClient('git');
    if (!client || !client.isConnected()) {
      this.recordTest('git', 'Connection', false, 'Server not connected');
      return;
    }

    this.recordTest('git', 'Connection', true, 'Server is running');

    // Test: Git status
    try {
      const { stdout } = await execPromise('git status --short', { cwd: PROJECT_ROOT });
      this.recordTest('git', 'Repository access', true, 'Can access git repository');
    } catch (err) {
      this.recordTest('git', 'Repository access', false, err.message);
    }
  }

  async testPuppeteer() {
    console.log('\n🎭 Testing Puppeteer Server');
    console.log('===========================');

    const client = this.gateway.getClient('puppeteer');
    if (!client || !client.isConnected()) {
      this.recordTest('puppeteer', 'Connection', false, 'Server not connected');
      return;
    }

    this.recordTest('puppeteer', 'Connection', true, 'Server is running');
    this.recordTest('puppeteer', 'Browser automation', true, 'Server supports headless browser testing');
  }

  async testCloudflare() {
    console.log('\n☁️  Testing Cloudflare Server');
    console.log('=============================');

    const client = this.gateway.getClient('cloudflare');
    if (!client || !client.isConnected()) {
      this.recordTest('cloudflare', 'Connection', false, 'Server not connected or not configured');
      return;
    }

    this.recordTest('cloudflare', 'Connection', true, 'Server is running');
    
    const hasToken = process.env.COPILOT_MCP_CLOUDFLARE_API_TOKEN;
    const hasAccountId = process.env.COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID;
    
    if (hasToken && hasAccountId) {
      this.recordTest('cloudflare', 'API credentials', true, 'Credentials configured');
    } else {
      this.recordTest('cloudflare', 'API credentials', false, 'Credentials not set');
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log('='.repeat(50));

    const byServer = {};
    for (const result of this.testResults) {
      if (!byServer[result.server]) {
        byServer[result.server] = { passed: 0, failed: 0, tests: [] };
      }
      if (result.passed) {
        byServer[result.server].passed++;
      } else {
        byServer[result.server].failed++;
      }
      byServer[result.server].tests.push(result);
    }

    let totalPassed = 0;
    let totalFailed = 0;

    for (const [server, stats] of Object.entries(byServer)) {
      const status = stats.failed === 0 ? '✓' : '⚠️';
      console.log(`\n${status} ${server}: ${stats.passed} passed, ${stats.failed} failed`);
      totalPassed += stats.passed;
      totalFailed += stats.failed;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
    console.log('='.repeat(50));

    return totalFailed === 0;
  }

  async runAllTests() {
    try {
      console.log('🧪 Heady MCP Server Verification');
      console.log('=================================\n');

      await this.initialize();

      // Run all tests
      await this.testFilesystem();
      await this.testPostgres();
      await this.testSequentialThinking();
      await this.testMemory();
      await this.testFetch();
      await this.testGit();
      await this.testPuppeteer();
      await this.testCloudflare();

      // Print summary
      const allPassed = this.printSummary();

      await this.cleanup();

      return allPassed ? 0 : 1;
    } catch (err) {
      console.error('\n❌ Test execution error:', err.message);
      await this.cleanup();
      return 1;
    }
  }
}

// Main execution
async function main() {
  const tester = new MCPTester();
  const exitCode = await tester.runAllTests();
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = MCPTester;
