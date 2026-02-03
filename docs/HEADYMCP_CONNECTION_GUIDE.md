# HEADY MCP - CONNECTION GUIDE

## Quick Start

### Start HeadyMCP Service

```powershell
# Navigate to Heady directory
cd c:\Users\erich\Heady

# Start HeadyMCP (foreground)
.\scripts\Start-HeadyMCP.ps1

# Or start as background daemon
.\scripts\Start-HeadyMCP.ps1 -Daemon

# Custom port
.\scripts\Start-HeadyMCP.ps1 -Port 3301
```

## Connection Information

### Primary Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| **MCP Gateway** | `http://localhost:3301/mcp` | Main MCP protocol endpoint |
| **Health Check** | `http://localhost:3300/api/health` | Service health status |
| **Admin UI** | `http://localhost:3300/admin` | Web administration interface |
| **API Base** | `http://localhost:3300/api` | REST API endpoints |

### MCP Services Available

Once connected, you have access to:

1. **heady-windsurf-router** - Routes all Windsurf operations
2. **filesystem** - File system operations
3. **git** - Git repository operations
4. **sequential-thinking** - Multi-step reasoning
5. **memory** - Knowledge graph and persistence
6. **postgres** - Database operations
7. **puppeteer** - Browser automation
8. **cloudflare** - Cloudflare API integration

## How to Connect

### Option 1: Direct HTTP/JSON-RPC

```javascript
// Node.js example
const http = require('http');

const data = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
});

const options = {
  hostname: 'localhost',
  port: 3301,
  path: '/mcp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const result = JSON.parse(body);
    console.log('Available tools:', result.result.tools);
  });
});

req.write(data);
req.end();
```

### Option 2: MCP SDK (Recommended)

```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

// Connect to HeadyMCP
const transport = new StdioClientTransport({
  command: 'node',
  args: ['c:\\Users\\erich\\Heady\\heady-manager.js']
});

const client = new Client({
  name: 'my-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);

// List available tools
const tools = await client.listTools();
console.log('Available tools:', tools);

// Call a tool
const result = await client.callTool('heady_read_file', {
  file_path: 'c:\\Users\\erich\\Heady\\package.json'
});
```

### Option 3: PowerShell

```powershell
# Call MCP tool via PowerShell
$body = @{
    jsonrpc = "2.0"
    id = 1
    method = "tools/call"
    params = @{
        name = "heady_get_inventory"
        arguments = @{
            include_metadata = $true
        }
    }
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:3301/mcp" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response.result
```

### Option 4: cURL

```bash
# List available tools
curl -X POST http://localhost:3301/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'

# Call a tool
curl -X POST http://localhost:3301/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "heady_get_inventory",
      "arguments": {
        "include_metadata": true
      }
    }
  }'
```

## Available MCP Tools

### File Operations

```javascript
// Read file
await client.callTool('heady_read_file', {
  file_path: 'c:\\path\\to\\file.js',
  track: true
});

// Write file
await client.callTool('heady_write_file', {
  file_path: 'c:\\path\\to\\file.js',
  content: 'console.log("Hello");',
  validate: true
});

// Edit file
await client.callTool('heady_edit_file', {
  file_path: 'c:\\path\\to\\file.js',
  edits: [
    { type: 'replace', old_text: 'foo', new_text: 'bar' }
  ]
});

// Search files
await client.callTool('heady_search_files', {
  query: 'pattern',
  path: 'c:\\Users\\erich\\Heady',
  use_cache: true
});
```

### Command Operations

```javascript
// Run command
await client.callTool('heady_run_command', {
  command: 'git status',
  cwd: 'c:\\Users\\erich\\Heady',
  require_approval: false
});

// Git operation
await client.callTool('heady_git_operation', {
  operation: 'status',
  args: []
});
```

### Observability Operations

```javascript
// Get HeadyMaid inventory
await client.callTool('heady_get_inventory', {
  include_metadata: true
});

// Get optimization opportunities
await client.callTool('heady_get_opportunities', {
  category: 'duplicates'
});

// Get audit log
await client.callTool('heady_audit_log', {
  limit: 50
});
```

## Authentication

### API Key (for HTTP endpoints)

```javascript
// Add API key header
headers: {
  'x-heady-api-key': process.env.HEADY_API_KEY
}

// Or use Bearer token
headers: {
  'Authorization': `Bearer ${process.env.HEADY_API_KEY}`
}
```

### Generate API Key

```powershell
# Generate new API key
npm run generate-key

# Or manually
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```
HEADY_API_KEY=your_generated_key_here
```

## Service Management

### Start HeadyMCP

```powershell
# Foreground (see logs)
.\scripts\Start-HeadyMCP.ps1

# Background daemon
.\scripts\Start-HeadyMCP.ps1 -Daemon
```

### Check Status

```powershell
# Health check
curl http://localhost:3300/api/health

# Or via PowerShell
Invoke-RestMethod -Uri "http://localhost:3300/api/health"
```

### Stop HeadyMCP

```powershell
# Find process
Get-Process -Name node | Where-Object { $_.CommandLine -like "*heady-manager*" }

# Stop by PID
Stop-Process -Id <PID>

# Or stop all node processes (careful!)
# Get-Process -Name node | Stop-Process
```

### View Logs

```powershell
# If running in foreground, logs appear in console

# If running as daemon, check process output
# Or enable file logging in heady-manager.js
```

## Integration Examples

### Connect from Python

```python
import requests
import json

# MCP endpoint
url = "http://localhost:3301/mcp"

# List tools
payload = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
}

response = requests.post(url, json=payload)
tools = response.json()['result']['tools']
print(f"Available tools: {len(tools)}")

# Call a tool
payload = {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
        "name": "heady_get_inventory",
        "arguments": {"include_metadata": True}
    }
}

response = requests.post(url, json=payload)
inventory = response.json()['result']
print(f"Files tracked: {inventory['inventory']['summary']['totalFiles']}")
```

### Connect from JavaScript/TypeScript

```typescript
import axios from 'axios';

const MCP_URL = 'http://localhost:3301/mcp';

async function callMCPTool(name: string, args: any) {
  const response = await axios.post(MCP_URL, {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name,
      arguments: args
    }
  });
  
  return response.data.result;
}

// Usage
const inventory = await callMCPTool('heady_get_inventory', {
  include_metadata: true
});

console.log(`Total files: ${inventory.inventory.summary.totalFiles}`);
```

### Connect from Windsurf

Windsurf automatically connects to HeadyMCP via the configuration in `mcp_config.json`. All Windsurf operations are automatically routed through HeadyMCP.

## Troubleshooting

### Connection Refused

**Problem**: Cannot connect to HeadyMCP

**Solutions**:
1. Check if service is running: `.\scripts\Start-HeadyMCP.ps1`
2. Verify port: `Get-NetTCPConnection -LocalPort 3301`
3. Check firewall settings
4. Try different port: `.\scripts\Start-HeadyMCP.ps1 -Port 3302`

### Tool Not Found

**Problem**: MCP tool returns "not found"

**Solutions**:
1. List available tools: `method: "tools/list"`
2. Check MCP server is running
3. Verify `mcp_config.json` configuration
4. Restart HeadyMCP

### Timeout Errors

**Problem**: Requests timeout

**Solutions**:
1. Increase timeout in client
2. Check if HeadyMaid is scanning (may slow down)
3. Reduce scan intervals
4. Check system resources

### Permission Denied

**Problem**: Operation blocked by governance

**Solutions**:
1. Add confirmation header: `x-heady-confirmed: true`
2. Use API key for authentication
3. Check governance rules in `mcp_config.json`

## Advanced Usage

### Batch Operations

```javascript
// Call multiple tools in sequence
const tools = [
  { name: 'heady_read_file', args: { file_path: 'file1.js' } },
  { name: 'heady_read_file', args: { file_path: 'file2.js' } },
  { name: 'heady_get_inventory', args: {} }
];

for (const tool of tools) {
  const result = await callMCPTool(tool.name, tool.args);
  console.log(`${tool.name}:`, result);
}
```

### Stream Events

```javascript
// Subscribe to HeadyMaid events via WebSocket
const ws = new WebSocket('ws://localhost:3300/events');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  console.log('Event:', event);
});
```

### Custom MCP Client

```javascript
class HeadyMCPClient {
  constructor(url = 'http://localhost:3301/mcp') {
    this.url = url;
    this.id = 0;
  }

  async call(method, params = {}) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: ++this.id,
        method,
        params
      })
    });
    
    const result = await response.json();
    if (result.error) throw new Error(result.error.message);
    return result.result;
  }

  async listTools() {
    return this.call('tools/list');
  }

  async callTool(name, args) {
    return this.call('tools/call', { name, arguments: args });
  }
}

// Usage
const client = new HeadyMCPClient();
const tools = await client.listTools();
const inventory = await client.callTool('heady_get_inventory', {});
```

## Environment Variables

Add to `.env`:

```bash
# HeadyMCP Configuration
PORT=3300                           # Main service port
MCP_GATEWAY_PORT=3301              # MCP gateway port
HEADY_API_KEY=your_api_key_here    # API authentication

# HeadyMaid Configuration
HEADY_MAID_SCAN_INTERVAL=30000     # Quick scan interval (ms)
HEADY_MAID_DEEP_SCAN=300000        # Deep scan interval (ms)

# MCP Gateway Configuration
MCP_GATEWAY_JWT_SECRET=your_jwt_secret
HEADY_CORS_ORIGINS=http://localhost,http://127.0.0.1
HEADY_RATE_LIMIT_MAX=60
HEADY_RATE_LIMIT_WINDOW_MS=60000
```

## Integration Checklist

✅ **Start HeadyMCP**: `.\scripts\Start-HeadyMCP.ps1 -Daemon`  
✅ **Verify health**: `curl http://localhost:3300/api/health`  
✅ **Test MCP connection**: List tools via JSON-RPC  
✅ **Check HeadyMaid**: Call `heady_get_inventory`  
✅ **Verify routing**: All operations logged in audit  
✅ **Test file operations**: Read/write through MCP  
✅ **Monitor events**: Subscribe to real-time updates  

## Benefits of Connecting to HeadyMCP

🎯 **Unified Access** - Single connection point for all MCP services  
🔍 **Complete Observability** - All operations tracked by HeadyMaid  
🛡️ **Governance Layer** - Automatic validation and approval workflows  
📊 **Real-Time Monitoring** - Live events and metrics  
🧹 **Data Quality** - Automatic optimization detection  
⚡ **Performance** - Caching and intelligent routing  

## Next Steps

1. **Start the service**: `.\scripts\Start-HeadyMCP.ps1 -Daemon`
2. **Test connection**: `curl http://localhost:3300/api/health`
3. **Explore tools**: Call `tools/list` via MCP
4. **Check inventory**: Call `heady_get_inventory`
5. **Monitor activity**: View audit logs and HeadyMaid events

---

**HeadyMCP is now your unified gateway to the entire Heady ecosystem!**

**Connection URL**: `http://localhost:3301/mcp`  
**Admin UI**: `http://localhost:3300/admin`  
**Documentation**: See `docs/` directory for detailed guides
