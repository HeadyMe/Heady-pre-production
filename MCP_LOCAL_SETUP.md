# MCP Local Server Setup Guide

This guide explains how to set up and run local Model Context Protocol (MCP) servers for the Heady environment using the MCP Gateway.

## Overview

The Heady MCP infrastructure consists of 7 servers that provide 34+ tools across different capabilities:

| Server | Tools | Purpose |
|--------|-------|---------|
| **filesystem** | 14 | File operations (read/write files, list directories) |
| **sequential-thinking** | 1 | Reasoning chains for container deployment |
| **memory** | 9 | State persistence (store and retrieve data) |
| **brave-search** | 2 | Web search and remote fetches |
| **postgres** | 1 | SQL queries and database management |
| **puppeteer** | 7 | Headless browser testing and automation |
| **cloudflare** | - | CDN/DNS management (requires credentials) |

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (optional, for postgres server)

### Complete Setup (Recommended)

Run the all-in-one setup script:

```bash
bash scripts/setup-and-test-mcp.sh
```

This will:
1. Set up environment variables
2. Start the MCP Gateway
3. Test connectivity for 5 seconds
4. Display usage instructions

### Manual Setup

#### 1. Setup Environment

```bash
bash scripts/setup-mcp-env.sh
```

This creates necessary directories and configures environment variables.

#### 2. Start the MCP Gateway

```bash
node scripts/mcp-gateway.js
```

The gateway will:
- Spawn all configured MCP servers
- Manage stdio communication
- Monitor server health
- Press Ctrl+C to stop all servers

#### 3. Test the Servers

In a separate terminal:

```bash
node scripts/test-mcp-communication.js
```

This runs comprehensive tests and verifies all servers are functioning.

## Architecture

### MCP Protocol

MCP (Model Context Protocol) servers communicate via **stdio** (standard input/output) using JSON-RPC messages, not HTTP. The gateway spawns each server as a child process and communicates by:

1. Sending JSON-RPC requests to server's stdin
2. Receiving JSON-RPC responses from server's stdout
3. Monitoring stderr for logs and errors

### Gateway Design

```
┌─────────────────────────────────────┐
│       MCP Gateway Sidecar           │
│  (scripts/mcp-gateway.js)           │
└─────────────┬───────────────────────┘
              │
       ┌──────┴──────┐
       │             │
   ┌───▼───┐     ┌───▼───┐
   │Server │     │Server │  (spawned processes)
   │stdin  │     │stdin  │
   │stdout │     │stdout │
   └───────┘     └───────┘
```

## Environment Variables

### Required

```bash
# Database connection (for postgres server)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/heady

# Optional API keys for extended functionality
BRAVE_API_KEY=your_brave_api_key           # For brave-search server
COPILOT_MCP_CLOUDFLARE_API_TOKEN=token     # For cloudflare server
COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID=id       # For cloudflare server
```

### Auto-Generated

```bash
# These are automatically set if not provided
HEADY_API_KEY=heady_dev_xxxxx
PORT=3300
NODE_ENV=development
MCP_SERVER_LOG_DIR=./logs/mcp
MCP_SERVER_DATA_DIR=./data/mcp
```

## Configuration

The `mcp_config.json` file defines all MCP servers:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/workspace"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
    // ... more servers
  }
}
```

## Available Servers

### 1. Filesystem Server (14 tools)

**Tools Available:**
- `read_file` - Read file contents
- `write_file` - Write to files
- `create_directory` - Create directories
- `list_directory` - List directory contents
- `move_file` - Move/rename files
- `search_files` - Search for files
- And 8 more...

**Test:**
```javascript
const client = gateway.getClient('filesystem');
const result = await client.sendRequest('tools/call', {
  name: 'read_file',
  arguments: { path: '/path/to/file.txt' }
});
```

### 2. Sequential-Thinking Server (1 tool)

**Tools Available:**
- `sequential_thinking` - Multi-step reasoning for complex problems

**Purpose:** Helps reason about container deployments and orchestration strategies.

### 3. Memory Server (9 tools)

**Tools Available:**
- `create_entities` - Store knowledge
- `create_relations` - Create relationships
- `read_graph` - Query knowledge graph
- `search_nodes` - Search stored information
- And 5 more...

**Purpose:** Persistent state management across sessions.

### 4. Brave Search Server (2 tools)

**Tools Available:**
- `brave_web_search` - Web search
- `brave_local_search` - Local business search

**Note:** Requires `BRAVE_API_KEY` for full functionality.

### 5. Postgres Server (1 tool)

**Tools Available:**
- `query` - Execute SQL queries

**Requirements:**
- PostgreSQL running on localhost:5432
- Database named 'heady'

**Test:**
```bash
psql postgresql://postgres:postgres@localhost:5432/heady -c "SELECT version();"
```

### 6. Puppeteer Server (7 tools)

**Tools Available:**
- `puppeteer_navigate` - Navigate to URL
- `puppeteer_screenshot` - Capture screenshots
- `puppeteer_click` - Click elements
- `puppeteer_fill` - Fill forms
- `puppeteer_evaluate` - Execute JavaScript
- And 2 more...

**Purpose:** Headless browser automation and testing.

### 7. Cloudflare Server (requires setup)

**Tools Available:** DNS management, CDN operations, zone configuration

**Requirements:**
- `COPILOT_MCP_CLOUDFLARE_API_TOKEN`
- `COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID`

## Usage Examples

### Starting the Gateway

```bash
# Start gateway (spawns all servers)
node scripts/mcp-gateway.js

# Output:
# 🚀 Heady MCP Gateway Sidecar
# ============================
# 
# Loading MCP configuration...
# ✓ Loaded configuration for 7 servers
# 
# 🔌 Starting MCP servers...
# [filesystem] ✓ Connected (PID: 12345)
# [memory] ✓ Connected (PID: 12346)
# ...
# Summary: 7 connected, 0 failed
# 
# Gateway is running. Press Ctrl+C to exit.
```

### Programmatic Usage

```javascript
const { MCPGateway } = require('./scripts/mcp-gateway.js');

async function example() {
  const gateway = new MCPGateway();
  
  // Load config and start servers
  await gateway.loadConfig();
  await gateway.connectAll();
  
  // Get a client
  const fsClient = gateway.getClient('filesystem');
  
  // List available tools
  const tools = await fsClient.sendRequest('tools/list', {});
  console.log('Available tools:', tools.tools.map(t => t.name));
  
  // Call a tool
  const result = await fsClient.sendRequest('tools/call', {
    name: 'read_file',
    arguments: { path: './package.json' }
  });
  
  // Cleanup
  await gateway.disconnectAll();
}
```

### Testing

```bash
# Run comprehensive tests
node scripts/test-mcp-communication.js

# Output shows:
# - Connection status for each server
# - Number of tools available
# - Communication test results
# - Overall summary
```

## File Locations

```
Heady/
├── scripts/
│   ├── setup-mcp-env.sh              # Environment setup
│   ├── mcp-gateway.js                # MCP Gateway (main entry point)
│   ├── test-mcp-communication.js     # Test suite
│   └── setup-and-test-mcp.sh         # Complete setup wrapper
├── mcp_config.json                   # Server configuration
├── logs/mcp/                         # Server logs (auto-created)
├── data/mcp/                         # Server data (auto-created)
└── tmp/
    ├── mcp-env.sh                    # Exported environment variables
    └── .gitignored/                  # Other temp files
```

## Troubleshooting

### Gateway Won't Start

**Check Node.js version:**
```bash
node --version  # Should be 18+
```

**Check npm access:**
```bash
npx -y @modelcontextprotocol/server-filesystem --version
```

### Server Fails to Connect

1. **Check gateway output** - Look for error messages
2. **Verify paths** - Ensure filesystem paths exist
3. **Check dependencies** - Run `npm install` if needed

### Postgres Connection Issues

```bash
# Test PostgreSQL is running
pg_isready

# Test connection
psql postgresql://postgres:postgres@localhost:5432/heady -c "SELECT 1;"

# If not running, start PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start PostgreSQL service
```

### Memory/Performance Issues

MCP servers are lightweight, but if you experience issues:

1. Stop the gateway (Ctrl+C)
2. Clear logs: `rm -rf logs/mcp/*`
3. Clear data: `rm -rf data/mcp/*`
4. Restart: `node scripts/mcp-gateway.js`

## Integration with Heady Manager

The MCP gateway can be integrated with the main Heady manager:

```javascript
// In heady-manager.js or your application
const { MCPGateway } = require('./scripts/mcp-gateway.js');

const mcpGateway = new MCPGateway();

app.get('/api/mcp/status', async (req, res) => {
  const status = mcpGateway.getStatus();
  res.json(status);
});

app.post('/api/mcp/execute', async (req, res) => {
  const { server, tool, arguments } = req.body;
  const client = mcpGateway.getClient(server);
  
  const result = await client.sendRequest('tools/call', {
    name: tool,
    arguments
  });
  
  res.json(result);
});
```

## Development

### Adding a New Server

1. Check if the server exists on npm:
```bash
npm search @modelcontextprotocol/server-yourserver
```

2. Add to `mcp_config.json`:
```json
{
  "mcpServers": {
    "yourserver": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-yourserver"]
    }
  }
}
```

3. Add tests in `scripts/test-mcp-communication.js`

4. Restart the gateway

### Debugging

Enable verbose logging in the gateway:

```javascript
// In mcp-gateway.js, add to handleServerMessage:
console.log(`[${this.name}] Message:`, message);
```

Or monitor all server stderr:

```bash
# The gateway already logs stderr from all servers
node scripts/mcp-gateway.js | tee mcp-debug.log
```

## Production Deployment

For production, consider:

1. **Process Manager** - Use PM2 or similar:
```bash
pm2 start scripts/mcp-gateway.js --name heady-mcp-gateway
```

2. **Docker** - See `docker-compose.mcp.yml` for containerized setup

3. **Monitoring** - Add health checks and metrics

4. **Security** - Limit filesystem access, use secure database credentials

## Performance

- **Startup Time:** ~2-3 seconds to spawn all servers
- **Memory Usage:** ~50-100MB per server
- **Concurrent Requests:** Supports multiple concurrent tool calls
- **Latency:** <10ms for stdio communication

## Security

1. **Filesystem Access** - Limited to specified directories
2. **Database** - Use strong passwords, limit access
3. **API Keys** - Never commit to version control
4. **Process Isolation** - Each server runs in separate process

## Additional Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [Heady Documentation](./README.md)
- [Docker MCP Guide](./DOCKER_MCP_README.md)

## Test Results

Recent test run (January 30, 2026):

```
📊 Test Summary
==================================================
✓ filesystem: 2 passed, 0 failed (14 tools)
✓ sequential-thinking: 2 passed, 0 failed (1 tool)
✓ memory: 2 passed, 0 failed (9 tools)
⚠️ brave-search: 2 passed, 1 failed (2 tools, needs API key)
✓ postgres: 2 passed, 0 failed (1 tool)
✓ puppeteer: 2 passed, 0 failed (7 tools)
⚠️ cloudflare: 0 passed, 1 failed (needs configuration)

Total: 12 passed, 2 failed
34+ tools available across all servers
==================================================
```

## Support

For issues or questions:
1. Run tests: `node scripts/test-mcp-communication.js`
2. Check gateway output for errors
3. Review this documentation
4. Check GitHub issues: https://github.com/HeadyMe/Heady/issues
