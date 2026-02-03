---
description: Integrate and test Model Context Protocol (MCP) services
---

# MCP Integration Workflow

## MCP Server Configuration
MCP servers are configured in `mcp_config.json` with the following structure:

```json
{
  "mcpServers": {
    "[server-name]": {
      "command": "node",
      "args": ["./mcp-servers/[server]/server.js"],
      "description": "Service description"
    }
  },
  "gateway": {
    "bind": "127.0.0.1",
    "port": 3301
  }
}
```

## Integration Steps

### 1. Register New MCP Server
Add entry to `mcp_config.json`:
```json
"[server-name]": {
  "command": "npx",
  "args": ["-y", "@package/mcp-server-name"],
  "governance": {
    "requireConfirmation": ["write", "delete"],
    "auditAll": true
  }
}
```

### 2. Test Integration
```powershell
node src/client/mcp_service_selector.js --test
```

### 3. Verify Gateway Connection
```powershell
curl http://127.0.0.1:3301/health
```

## Available MCP Servers
- `heady-assets` - Asset management
- `heady-autobuild` - AutoBuild service
- `heady-brain` - AI logic and workflow intelligence
- `heady-cleanup` - Cleanup and storage organization
- `heady-graph` - Graph server for data relationships
- `heady-metrics` - Metrics collection and reporting
- `heady-monorepo` - Monorepo merge and push service
- `heady-router` - Router for system operations
- `heady-workflow` - Workflow execution service
- `filesystem` - File system operations
- `git` - Git version control
- `memory` - Persistent memory storage
- `fetch` - HTTP requests
- `postgres` - Database operations
