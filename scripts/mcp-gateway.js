#!/usr/bin/env node
/**
 * Heady MCP Gateway Sidecar
 * 
 * This gateway connects to all local MCP servers and provides:
 * - Unified client interface
 * - Connection management for each upstream server
 * - Health monitoring
 * - Request routing
 */

const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MCP_CONFIG_PATH = path.join(PROJECT_ROOT, 'mcp_config.json');
const PID_DIR = path.join(PROJECT_ROOT, 'tmp', 'mcp-pids');

class MCPClient extends EventEmitter {
  constructor(name, config) {
    super();
    this.name = name;
    this.config = config;
    this.process = null;
    this.connected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`[${this.name}] Connecting to MCP server...`);
      
      // Check if server process is running
      const pidFile = path.join(PID_DIR, `${this.name}.pid`);
      if (!fs.existsSync(pidFile)) {
        return reject(new Error(`Server ${this.name} is not running. No PID file found.`));
      }

      const pid = parseInt(fs.readFileSync(pidFile, 'utf8'));
      
      // Check if process is alive
      try {
        process.kill(pid, 0); // Signal 0 just checks if process exists
        this.connected = true;
        console.log(`[${this.name}] ✓ Connected (server PID: ${pid})`);
        resolve();
      } catch (err) {
        reject(new Error(`Server ${this.name} process (PID: ${pid}) is not running`));
      }
    });
  }

  async disconnect() {
    this.connected = false;
    console.log(`[${this.name}] Disconnected`);
  }

  isConnected() {
    return this.connected;
  }

  getServerInfo() {
    const pidFile = path.join(PID_DIR, `${this.name}.pid`);
    if (!fs.existsSync(pidFile)) {
      return { status: 'stopped', pid: null };
    }

    const pid = parseInt(fs.readFileSync(pidFile, 'utf8'));
    
    try {
      process.kill(pid, 0);
      return { status: 'running', pid };
    } catch (err) {
      return { status: 'crashed', pid };
    }
  }
}

class MCPGateway extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map();
    this.config = null;
  }

  async loadConfig() {
    console.log(`Loading MCP configuration from ${MCP_CONFIG_PATH}...`);
    
    if (!fs.existsSync(MCP_CONFIG_PATH)) {
      throw new Error(`MCP config file not found: ${MCP_CONFIG_PATH}`);
    }

    const configData = fs.readFileSync(MCP_CONFIG_PATH, 'utf8');
    this.config = JSON.parse(configData);
    
    console.log(`✓ Loaded configuration for ${Object.keys(this.config.mcpServers).length} servers`);
  }

  async connectAll() {
    console.log('\n🔌 Connecting to MCP servers...');
    console.log('================================');

    const servers = Object.entries(this.config.mcpServers);
    const results = [];

    for (const [name, config] of servers) {
      const client = new MCPClient(name, config);
      this.clients.set(name, client);

      try {
        await client.connect();
        results.push({ name, status: 'connected', error: null });
      } catch (err) {
        results.push({ name, status: 'failed', error: err.message });
        console.log(`[${name}] ✗ Failed: ${err.message}`);
      }
    }

    console.log('\n================================');
    const connected = results.filter(r => r.status === 'connected').length;
    const failed = results.filter(r => r.status === 'failed').length;
    console.log(`Summary: ${connected} connected, ${failed} failed`);

    return results;
  }

  async disconnectAll() {
    console.log('\n🔌 Disconnecting from MCP servers...');
    
    for (const [name, client] of this.clients) {
      await client.disconnect();
    }
    
    this.clients.clear();
    console.log('✓ All clients disconnected');
  }

  getClient(name) {
    return this.clients.get(name);
  }

  getAllClients() {
    return Array.from(this.clients.values());
  }

  getStatus() {
    const status = {
      total: this.clients.size,
      connected: 0,
      disconnected: 0,
      servers: {}
    };

    for (const [name, client] of this.clients) {
      const info = client.getServerInfo();
      status.servers[name] = info;
      
      if (client.isConnected() && info.status === 'running') {
        status.connected++;
      } else {
        status.disconnected++;
      }
    }

    return status;
  }
}

// Main execution
async function main() {
  const gateway = new MCPGateway();

  try {
    console.log('🚀 Heady MCP Gateway Sidecar');
    console.log('============================\n');

    // Load configuration
    await gateway.loadConfig();

    // Connect to all servers
    const connectionResults = await gateway.connectAll();

    // Display status
    console.log('\n📊 Gateway Status');
    console.log('=================');
    const status = gateway.getStatus();
    console.log(`Total servers: ${status.total}`);
    console.log(`Connected: ${status.connected}`);
    console.log(`Disconnected: ${status.disconnected}`);
    console.log('');

    // Keep gateway alive and monitor connections
    console.log('Gateway is running. Press Ctrl+C to exit.\n');

    // Monitor connections every 10 seconds
    const monitorInterval = setInterval(() => {
      const currentStatus = gateway.getStatus();
      if (currentStatus.disconnected > 0) {
        console.log(`[${new Date().toISOString()}] Warning: ${currentStatus.disconnected} server(s) disconnected`);
      }
    }, 10000);

    // Handle shutdown
    process.on('SIGINT', async () => {
      console.log('\n\nShutting down gateway...');
      clearInterval(monitorInterval);
      await gateway.disconnectAll();
      console.log('✓ Gateway shutdown complete');
      process.exit(0);
    });

    // Export gateway for testing
    if (require.main !== module) {
      module.exports = { MCPGateway, MCPClient };
    }

  } catch (err) {
    console.error('❌ Gateway error:', err.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { MCPGateway, MCPClient };
