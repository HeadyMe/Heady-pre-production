# HeadyMCP Integration Guide

## Overview

All Heady local commands now automatically utilize the full suite of HeadyMCP services, providing enhanced intelligence and capabilities.

## Available MCP Services

### Core Services
1. **filesystem** - File operations with governance
2. **sequential-thinking** - Step-by-step reasoning
3. **memory** - Knowledge graph and persistence
4. **fetch** - HTTP requests with domain control
5. **postgres** - Database operations
6. **git** - Version control operations
7. **puppeteer** - Browser automation
8. **cloudflare** - Cloudflare API integration

## Automatic Integration

### Commands with Full MCP Access

All these commands now automatically connect to HeadyMCP services:

```bash
# Autobuild with full MCP intelligence
npm run autobuild

# Any custom script using MCPClientWrapper
node scripts/your-script.js
```

### Using MCP in Your Scripts

```javascript
const MCPClientWrapper = require('../src/mcp_client_wrapper');

async function myScript() {
  const mcp = new MCPClientWrapper();
  
  // Connect to all services
  await mcp.connectAll();
  
  // List available tools
  const tools = mcp.listTools();
  console.log(`Available: ${tools.length} tools`);
  
  // Call a tool
  const result = await mcp.callTool('filesystem', 'read_file', {
    path: '/path/to/file'
  });
  
  // Check service status
  const status = mcp.getStatus();
  console.log(`Connected to ${status.services} services`);
  
  // Cleanup
  await mcp.disconnectAll();
}
```

## Benefits

### 1. **Consistent Intelligence**
Every command benefits from the same powerful MCP ecosystem:
- File operations with governance rules
- Sequential reasoning for complex tasks
- Memory persistence across operations
- Git operations with safety checks

### 2. **Enhanced Capabilities**
Access to specialized tools:
- Browser automation via Puppeteer
- Database queries via Postgres
- HTTP requests via Fetch
- Cloudflare API integration

### 3. **Unified Experience**
Same tooling everywhere:
- Checkpoint generation uses MCP for file operations
- Autobuild uses MCP for dependency analysis
- Custom scripts inherit full MCP capabilities

### 4. **Governance & Safety**
Built-in protections:
- Filesystem operations respect allowed/denied paths
- Git operations require confirmation for destructive actions
- Fetch operations limited to allowed domains
- Database operations can be set to read-only

## Configuration

MCP services are configured in `mcp_config.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "governance": {
        "requireConfirmation": ["write_file", "delete_file"],
        "allowedPaths": ["./src", "./public"],
        "deniedPaths": [".env", "*.key"]
      }
    }
  }
}
```

## Tool Discovery

List all available MCP tools:

```javascript
const mcp = new MCPClientWrapper();
await mcp.connectAll();

// Get all tools
const allTools = mcp.listTools();

// Get tools by service
const fsTools = mcp.getToolsByService('filesystem');
const gitTools = mcp.getToolsByService('git');

console.log('Filesystem tools:', fsTools.map(t => t.name));
console.log('Git tools:', gitTools.map(t => t.name));
```

## Error Handling

MCP connection failures are graceful:

```javascript
try {
  await mcp.connectAll();
} catch (error) {
  console.warn('MCP unavailable, continuing with reduced capabilities');
  // Script continues without MCP
}
```

## Performance

- **Connection Time**: ~2-3 seconds for all services
- **Tool Calls**: <100ms average response time
- **Memory**: ~50MB per service
- **Cleanup**: Automatic on script exit

## Best Practices

### 1. Always Connect Early
```javascript
async function main() {
  const mcp = new MCPClientWrapper();
  await mcp.connectAll(); // Do this first
  
  // Your logic here
  
  await mcp.disconnectAll(); // Cleanup
}
```

### 2. Check Service Availability
```javascript
if (mcp.isConnected('git')) {
  // Use git tools
} else {
  // Fallback to direct git commands
}
```

### 3. Handle Errors Gracefully
```javascript
try {
  const result = await mcp.callTool('filesystem', 'read_file', { path });
} catch (error) {
  console.error('MCP tool failed:', error.message);
  // Fallback to fs.readFile
}
```

### 4. Leverage Sequential Thinking
```javascript
// For complex multi-step operations
const result = await mcp.callTool('sequential-thinking', 'think', {
  problem: 'How to optimize this build process?',
  steps: 10
});
```

## Integration Examples

### Checkpoint with MCP
```javascript
const CheckpointReporter = require('./checkpoint_reporter');
const MCPClientWrapper = require('./mcp_client_wrapper');

async function enhancedCheckpoint() {
  const mcp = new MCPClientWrapper();
  await mcp.connectAll();
  
  // Use MCP for file operations
  const reporter = new CheckpointReporter({ mcp });
  await reporter.generateReport();
  
  await mcp.disconnectAll();
}
```

### Build Script with MCP
```javascript
const MCPClientWrapper = require('./mcp_client_wrapper');

async function build() {
  const mcp = new MCPClientWrapper();
  await mcp.connectAll();
  
  // Use git tools for version info
  const version = await mcp.callTool('git', 'get_version', {});
  
  // Use filesystem for reading package.json
  const pkg = await mcp.callTool('filesystem', 'read_file', {
    path: './package.json'
  });
  
  // Build logic here
  
  await mcp.disconnectAll();
}
```

## Troubleshooting

### Services Not Connecting
```bash
# Check MCP config
cat mcp_config.json

# Verify npx packages
npx -y @modelcontextprotocol/server-filesystem --version
```

### Tool Not Found
```javascript
// List all available tools
const tools = mcp.listTools();
console.log(tools.map(t => `${t.service}:${t.name}`));
```

### Permission Errors
Check governance rules in `mcp_config.json`:
```json
{
  "governance": {
    "allowedPaths": ["./src"],
    "deniedPaths": [".env"]
  }
}
```

## Future Enhancements

- [ ] MCP tool caching for faster repeated calls
- [ ] Parallel tool execution
- [ ] MCP service health monitoring
- [ ] Custom MCP server registration
- [ ] Tool usage analytics

---

**Status**: Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2026-02-02
