#!/usr/bin/env node
/**
 * Heady MCP Gateway Sidecar
 * 
 * This gateway spawns and connects to all local MCP servers via stdio.
 * MCP servers communicate using JSON-RPC over stdin/stdout.
 * 
 * Features:
 * - Spawns MCP server processes
 * - Manages stdio communication
 * - Health monitoring
 * - Request routing
 */

const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MCP_CONFIG_PATH = path.join(PROJECT_ROOT, 'mcp_config.json');

class MCPClient extends EventEmitter {
  constructor(name, config) {
    super();
    this.name = name;
    this.config = config;
    this.process = null;
    this.connected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.messageBuffer = '';
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`[${this.name}] Starting MCP server...`);
      
      const args = this.config.args || [];
      const env = {
        ...process.env,
        ...(this.config.env || {})
      };

      // Replace environment variable placeholders
      const processedArgs = args.map(arg => {
        if (typeof arg === 'string' && arg.startsWith('${') && arg.endsWith('}')) {
          const varName = arg.slice(2, -1);
          return env[varName] || arg;
        }
        return arg;
      });

      // Spawn the MCP server process
      this.process = spawn(this.config.command, processedArgs, {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Handle stdout (JSON-RPC responses)
      this.process.stdout.on('data', (data) => {
        this.handleServerMessage(data.toString());
      });

      // Handle stderr (logging/errors)
      this.process.stderr.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          console.log(`[${this.name}] ${message}`);
        }
      });

      // Handle process exit
      this.process.on('exit', (code, signal) => {
        this.connected = false;
        console.log(`[${this.name}] Process exited (code: ${code}, signal: ${signal})`);
      });

      // Handle process errors
      this.process.on('error', (err) => {
        console.error(`[${this.name}] Process error:`, err.message);
        reject(err);
      });

      // Wait a moment for the process to start
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.connected = true;
          console.log(`[${this.name}] ✓ Connected (PID: ${this.process.pid})`);
          resolve();
        } else {
          reject(new Error(`Failed to start ${this.name}`));
        }
      }, 1000);
    });
  }

  handleServerMessage(data) {
    // MCP servers send JSON-RPC messages line by line
    this.messageBuffer += data;
    const lines = this.messageBuffer.split('\n');
    
    // Process complete lines, keep incomplete line in buffer
    this.messageBuffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line);
          this.emit('message', message);
        } catch (err) {
          console.error(`[${this.name}] Failed to parse message:`, line);
        }
      }
    }
  }

  async sendRequest(method, params = {}) {
    if (!this.connected || !this.process) {
      throw new Error(`Server ${this.name} is not connected`);
    }

    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout for ${method}`));
      }, 30000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      // Send request to server
      const requestLine = JSON.stringify(request) + '\n';
      this.process.stdin.write(requestLine);

      // Listen for response
      const responseHandler = (message) => {
        if (message.id === id) {
          clearTimeout(timeout);
          this.pendingRequests.delete(id);
          this.off('message', responseHandler);
          
          if (message.error) {
            reject(new Error(message.error.message || 'Server error'));
          } else {
            resolve(message.result);
          }
        }
      };

      this.on('message', responseHandler);
    });
  }

  async disconnect() {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
    this.connected = false;
    console.log(`[${this.name}] Disconnected`);
  }

  isConnected() {
    return this.connected && this.process && !this.process.killed;
  }

  getServerInfo() {
    if (!this.process) {
      return { status: 'stopped', pid: null };
    }
    
    if (this.process.killed) {
      return { status: 'killed', pid: this.process.pid };
    }

    return { status: 'running', pid: this.process.pid };
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
    console.log('\n🔌 Starting MCP servers...');
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
    console.log('\n🔌 Stopping MCP servers...');
    
    for (const [name, client] of this.clients) {
      await client.disconnect();
    }
    
    this.clients.clear();
    console.log('✓ All servers stopped');
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

    // Handle shutdown
    process.on('SIGINT', async () => {
      console.log('\n\nShutting down gateway...');
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
