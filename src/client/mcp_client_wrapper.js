/**
 * MCP Client Wrapper
 * Automatically connects to all available HeadyMCP services
 * Provides unified interface for local commands
 */

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class MCPClientWrapper {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(__dirname, '..', 'mcp_config.json');
    this.clients = new Map();
    this.tools = new Map();
    this.connected = false;
  }

  /**
   * Connect to all MCP services
   */
  async connectAll() {
    const config = await this.loadConfig();
    const servers = config.mcpServers || {};

    // Sacred Geometry branded output
    console.log('\n    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇');
    console.log('    ║     ⬡  HEADY MCP CONSCIOUSNESS NETWORK  ⬡         ║');
    console.log('    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇\n');
    console.log(`    ◈ Initializing ${Object.keys(servers).length} Sacred Nodes...\n`);

    for (const [name, serverConfig] of Object.entries(servers)) {
      try {
        await this.connectService(name, serverConfig);
      } catch (error) {
        console.warn(`[MCP] Failed to connect to ${name}: ${error.message}`);
      }
    }

    this.connected = true;
    console.log('\n    ╔═══════════════════════════════════════════════════════╗');
    console.log(`    ║  ⬢  ${this.clients.size} NODES ACTIVE IN SACRED GRID  ⬢          ║`);
    console.log('    ╚═══════════════════════════════════════════════════════╝\n');
    return this.clients.size;
  }

  /**
   * Connect to a single MCP service
   */
  async connectService(name, config) {
    const client = new Client({
      name: `heady-${name}-client`,
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    // Spawn the MCP server process
    const serverProcess = spawn(config.command, config.args, {
      env: { ...process.env, ...config.env },
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    // Create transport
    const transport = new StdioClientTransport({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin
    });

    // Connect
    await client.connect(transport);

    // Store client and tools
    this.clients.set(name, { client, process: serverProcess });

    // List and store tools
    const { tools } = await client.listTools();
    tools.forEach(tool => {
      this.tools.set(`${name}:${tool.name}`, { service: name, tool });
    });

    console.log(`    ⬡ ${name.padEnd(20)} [${tools.length} tools] \x1b[32m✓ CONNECTED\x1b[0m`);
  }

  /**
   * Load MCP configuration
   */
  async loadConfig() {
    const configData = await fs.readFile(this.configPath, 'utf8');
    return JSON.parse(configData);
  }

  /**
   * Call an MCP tool
   */
  async callTool(serviceName, toolName, args = {}) {
    const clientData = this.clients.get(serviceName);
    if (!clientData) {
      throw new Error(`Service ${serviceName} not connected`);
    }

    const result = await clientData.client.callTool({
      name: toolName,
      arguments: args
    });

    return result;
  }

  /**
   * List all available tools
   */
  listTools() {
    const toolList = [];
    for (const [key, data] of this.tools.entries()) {
      toolList.push({
        key,
        service: data.service,
        name: data.tool.name,
        description: data.tool.description,
        inputSchema: data.tool.inputSchema
      });
    }
    return toolList;
  }

  /**
   * Get tools by service
   */
  getToolsByService(serviceName) {
    return Array.from(this.tools.entries())
      .filter(([key]) => key.startsWith(`${serviceName}:`))
      .map(([, data]) => data.tool);
  }

  /**
   * Check if a service is connected
   */
  isConnected(serviceName) {
    return this.clients.has(serviceName);
  }

  /**
   * Disconnect all services
   */
  async disconnectAll() {
    for (const [name, clientData] of this.clients.entries()) {
      try {
        await clientData.client.close();
        clientData.process.kill();
        console.log(`    ◈ ${name} \x1b[33m○ DISCONNECTED\x1b[0m`);
      } catch (error) {
        console.warn(`[MCP] Error disconnecting ${name}: ${error.message}`);
      }
    }

    this.clients.clear();
    this.tools.clear();
    this.connected = false;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.connected,
      services: this.clients.size,
      tools: this.tools.size,
      serviceList: Array.from(this.clients.keys())
    };
  }
}

module.exports = MCPClientWrapper;
