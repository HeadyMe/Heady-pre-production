# Quick Start: MCP Local Servers

## 🚀 One-Command Setup

```bash
bash scripts/setup-and-test-mcp.sh
```

This sets up and tests all 7 MCP servers providing 34+ tools.

## 📦 Start the MCP Gateway

```bash
node scripts/mcp-gateway.js
```

Press Ctrl+C to stop all servers.

## 🧪 Test Connectivity

```bash
node scripts/test-mcp-communication.js
```

## 📊 What You Get

| Server | Tools | Capabilities |
|--------|-------|-------------|
| filesystem | 14 | File operations |
| memory | 9 | State persistence |
| puppeteer | 7 | Browser automation |
| brave-search | 2 | Web search |
| sequential-thinking | 1 | Reasoning chains |
| postgres | 1 | SQL queries |
| cloudflare | - | CDN/DNS (needs API key) |

**Total: 34+ tools across 7 servers**

## 📖 Full Documentation

See [MCP_LOCAL_SETUP.md](./MCP_LOCAL_SETUP.md) for complete documentation.

## 🔧 Environment Setup

Minimal required setup:

```bash
# Optional - for enhanced functionality
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/heady"
export BRAVE_API_KEY="your_api_key"
```

All other variables are auto-generated.

## ✅ Verification

Expected output from test:

```
📊 Test Summary
==================================================
✓ filesystem: 14 tools available
✓ memory: 9 tools available
✓ puppeteer: 7 tools available
✓ brave-search: 2 tools available
✓ sequential-thinking: 1 tool available
✓ postgres: 1 tool available

Total: 12 passed, 2 failed
34+ tools available
==================================================
```

## 🎯 Key Features

- ✅ **JSON-RPC Communication** - Proper MCP protocol via stdio
- ✅ **Process Management** - Automatic spawn and cleanup
- ✅ **Health Monitoring** - Real-time server status
- ✅ **34+ Tools** - File ops, database, browser, search, reasoning
- ✅ **Zero Config** - Works out of the box

## 📁 Key Files

- `scripts/mcp-gateway.js` - Main gateway (start here)
- `scripts/test-mcp-communication.js` - Test suite
- `mcp_config.json` - Server configuration
- `MCP_LOCAL_SETUP.md` - Complete documentation

## 🐛 Troubleshooting

```bash
# Check Node.js version (need 18+)
node --version

# Verify npm works
npx -y @modelcontextprotocol/server-filesystem --version

# Test PostgreSQL (optional)
pg_isready
```

## 💡 Usage Example

```javascript
const { MCPGateway } = require('./scripts/mcp-gateway.js');

const gateway = new MCPGateway();
await gateway.loadConfig();
await gateway.connectAll();

// Use filesystem server
const fsClient = gateway.getClient('filesystem');
const result = await fsClient.sendRequest('tools/call', {
  name: 'read_file',
  arguments: { path: './package.json' }
});

await gateway.disconnectAll();
```

---

**Ready to start?** Run: `bash scripts/setup-and-test-mcp.sh`
