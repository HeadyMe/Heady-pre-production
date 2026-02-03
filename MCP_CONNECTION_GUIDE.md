# HeadyMCP Connection Guide

Complete guide for connecting to and using HeadyMCP services.

## Quick Start

### 1. Check Status
```powershell
cd c:\Users\erich\Heady
.\scripts\Connect-HeadyMCP.ps1 -Action status
```

### 2. Start All Services
```powershell
.\scripts\Connect-HeadyMCP.ps1 -Action start -All
```

### 3. Test Connections
```powershell
.\scripts\Connect-HeadyMCP.ps1 -Action test
```

## Service Endpoints

### HeadyManager (Port 3300)
**Main MCP orchestrator and API gateway**

- **Base URL**: `http://localhost:3300`
- **Admin UI**: `http://localhost:3300/admin`
- **Health Check**: `http://localhost:3300/api/health`

**Key Endpoints:**
```
GET  /api/health              - System health
GET  /api/pulse               - Docker status
POST /api/hf/infer            - HuggingFace inference
POST /api/hf/generate         - Text generation
POST /api/hf/embed            - Embeddings
GET  /api/admin/roots         - Admin file roots
GET  /api/admin/files         - Browse files
POST /api/admin/file          - Read/write files
POST /api/admin/build         - Trigger builds
POST /api/admin/audit         - Run audits
```

**Authentication:**
- Header: `x-heady-api-key: <HEADY_API_KEY>`
- Or: `Authorization: Bearer <HEADY_API_KEY>`

### MCP Gateway (Port 3301)
**HeadyWindsurf Router - Intelligent request routing**

- **Base URL**: `http://localhost:3301`
- **Health Check**: `http://localhost:3301/health`

**Features:**
- Routes requests to appropriate Heady components
- Integrates with HeadyAcademy agents
- Audit logging enabled

### Orchestrator (Port 3100)
**Task orchestration and swarm management**

- **Base URL**: `http://localhost:3100`
- **Health Check**: `http://localhost:3100/api/health`

**Key Endpoints:**
```
POST /api/tasks               - Submit task
GET  /api/tasks/:id           - Get task status
POST /api/build/execute       - Execute build
GET  /api/questions           - List questions
POST /api/questions           - Ask question
POST /api/questions/:id/answer - Answer question
```

## MCP Services Configuration

### Configured Services (9)

From `mcp_config.json`:

1. **heady-windsurf-router**
   - Custom Heady routing service
   - Governance: Requires confirmation for write operations
   - Integrates with HeadyMaid

2. **filesystem**
   - File system operations
   - Allowed paths: `./src`, `./public`, `./backend`
   - Denied: `.env`, `*.key`, `*.pem`

3. **sequential-thinking**
   - Complex reasoning and planning
   - No special governance

4. **memory**
   - Persistent memory storage
   - Knowledge graph operations

5. **fetch**
   - HTTP requests
   - Allowed domains: `headysystems.com`, `localhost`

6. **postgres**
   - Database operations
   - Requires confirmation for schema changes

7. **git**
   - Version control operations
   - Allowed branches: `main`, `develop`, `feature/*`

8. **puppeteer**
   - Browser automation
   - Web scraping and testing

9. **cloudflare**
   - Cloudflare API integration
   - Requires API token

## Connection Methods

### Method 1: Direct API Calls

```powershell
# Using PowerShell
$Headers = @{ "x-heady-api-key" = $env:HEADY_API_KEY }
$Response = Invoke-RestMethod -Uri "http://localhost:3300/api/health" -Headers $Headers
```

```javascript
// Using Node.js
const fetch = require('node-fetch');

const response = await fetch('http://localhost:3300/api/health', {
  headers: {
    'x-heady-api-key': process.env.HEADY_API_KEY
  }
});
```

### Method 2: Using hc/hb Commands

```powershell
# Execute with all MCP tools
hc "Analyze system health"

# Submit task to orchestrator
hb task "Deploy updated module"

# Monitor governance stream
hb monitor
```

### Method 3: Using heady-cli

```powershell
# Install heady-cli globally
cd c:\Users\erich\Heady\packages\heady-cli
npm link

# Use commands
heady status
heady exec "Research AI security"
heady monitor
```

### Method 4: Direct MCP Protocol

```javascript
// Using @modelcontextprotocol/sdk
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

const transport = new StdioClientTransport({
  command: 'node',
  args: ['./mcp-servers/heady-windsurf-router/server.js']
});

const client = new Client({
  name: 'heady-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);
```

## Service Management

### Start Individual Service
```powershell
# Start HeadyManager
.\scripts\Connect-HeadyMCP.ps1 -Action start -Service HeadyManager

# Start MCP Gateway
.\scripts\Connect-HeadyMCP.ps1 -Action start -Service MCPGateway

# Start Orchestrator
.\scripts\Connect-HeadyMCP.ps1 -Action start -Service Orchestrator
```

### Stop Services
```powershell
# Stop specific service
.\scripts\Connect-HeadyMCP.ps1 -Action stop -Service HeadyManager

# Stop all services
.\scripts\Connect-HeadyMCP.ps1 -Action stop -All
```

### Restart Service
```powershell
.\scripts\Connect-HeadyMCP.ps1 -Action restart -Service HeadyManager
```

## Environment Variables

Required environment variables:

```powershell
# Core
$env:HEADY_API_KEY = "your-api-key-here"
$env:HF_TOKEN = "your-huggingface-token"

# Database
$env:DATABASE_URL = "postgresql://user:pass@localhost:5432/heady"

# Cloudflare (optional)
$env:COPILOT_MCP_CLOUDFLARE_API_TOKEN = "your-token"
$env:COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID = "your-account-id"

# MCP Gateway (optional)
$env:MCP_GATEWAY_JWT_SECRET = "your-jwt-secret"
```

## Troubleshooting

### Service Won't Start

1. **Check if port is in use:**
```powershell
Get-NetTCPConnection -LocalPort 3300 -State Listen
```

2. **Kill process on port:**
```powershell
$Process = Get-NetTCPConnection -LocalPort 3300 -State Listen
Stop-Process -Id $Process.OwningProcess -Force
```

3. **Check logs:**
```powershell
# HeadyManager logs
cd c:\Users\erich\Heady
npm start
```

### Connection Refused

1. **Verify service is running:**
```powershell
.\scripts\Connect-HeadyMCP.ps1 -Action status
```

2. **Test health endpoint:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3300/api/health"
```

3. **Check firewall:**
```powershell
New-NetFirewallRule -DisplayName "HeadyMCP" -Direction Inbound -LocalPort 3300,3301,3100 -Protocol TCP -Action Allow
```

### MCP Services Not Responding

1. **Run intelligence verification:**
```powershell
node src/heady_intelligence_verifier.js
```

2. **Check MCP config:**
```powershell
Get-Content mcp_config.json | ConvertFrom-Json
```

3. **Test individual MCP server:**
```powershell
npx -y @modelcontextprotocol/server-filesystem /workspaces
```

## Integration Examples

### Example 1: Submit Task via API

```powershell
$Body = @{
    instruction = "Generate API documentation"
    priority = "HIGH"
    use_all_mcp = $true
} | ConvertTo-Json

$Headers = @{ "x-heady-api-key" = $env:HEADY_API_KEY }

Invoke-RestMethod `
    -Uri "http://localhost:3100/api/tasks" `
    -Method POST `
    -Body $Body `
    -ContentType "application/json" `
    -Headers $Headers
```

### Example 2: Use Sequential Thinking

```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');

// Connect to sequential-thinking server
const client = await connectToMCP('sequential-thinking');

// Use sequential thinking for complex task
const result = await client.callTool('think', {
    problem: 'Design a scalable microservices architecture',
    steps: 10
});
```

### Example 3: File Operations

```javascript
// Connect to filesystem server
const client = await connectToMCP('filesystem');

// Read file
const content = await client.callTool('read_file', {
    path: '/workspaces/src/index.js'
});

// Write file
await client.callTool('write_file', {
    path: '/workspaces/output.txt',
    content: 'Generated content'
});
```

## Best Practices

1. **Always check service status before operations**
   ```powershell
   .\scripts\Connect-HeadyMCP.ps1 -Action status
   ```

2. **Use environment variables for secrets**
   - Never hardcode API keys
   - Use `.env` files (gitignored)

3. **Enable governance for destructive operations**
   - Configured in `mcp_config.json`
   - Requires user confirmation

4. **Monitor audit logs**
   - Location: `audit_logs/`
   - Retention: 90 days

5. **Use health checks**
   - Before critical operations
   - In automated scripts

## Quick Reference

### Common Commands

```powershell
# Status check
.\scripts\Connect-HeadyMCP.ps1 -Action status

# Start all services
.\scripts\Connect-HeadyMCP.ps1 -Action start -All

# Test connections
.\scripts\Connect-HeadyMCP.ps1 -Action test

# List all services
.\scripts\Connect-HeadyMCP.ps1 -Action list

# Execute task with all tools
hc "Your task here"

# Submit task to orchestrator
hb task "Your task here"

# Monitor logs
hb monitor

# Check system health
hb status
```

### Service URLs

- **HeadyManager**: http://localhost:3300
- **Admin UI**: http://localhost:3300/admin
- **MCP Gateway**: http://localhost:3301
- **Orchestrator**: http://localhost:3100

### Configuration Files

- **MCP Config**: `c:\Users\erich\Heady\mcp_config.json`
- **Registry**: `c:\Users\erich\Heady\.heady-memory\heady-registry.json`
- **Environment**: `c:\Users\erich\Heady\.env`

## Support

For issues or questions:
1. Run intelligence verification: `node src/heady_intelligence_verifier.js`
2. Check audit logs: `audit_logs/`
3. Review documentation: `docs/`
4. Test connections: `.\scripts\Connect-HeadyMCP.ps1 -Action test`
