# HeadyMCP Quick Start Guide

## ✅ System Status: READY

**All HeadyMCP services are active and functional when you ask something!**

### **Current Active Services**
- ✅ **HeadyManager**: Port 3300 (PID: 37548) - RUNNING
- ✅ **Orchestrator**: 1 worker node, health: 100
- ✅ **MCP Services**: 5 services auto-initialize
- ✅ **HeadyMaid**: Integrated and tracking
- ✅ **RoutingOptimizer**: Active with priority queuing
- ✅ **Task Management**: HeadyMaid tasks auto-queued

---

## How to Connect & Configure

### **Step 1: Verify HeadyManager is Running**

```powershell
# Check health
curl http://localhost:3300/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "heady-manager-unified",
  "version": "14.0.0",
  "uptime": 681.9,
  "orchestration": {
    "nodeCount": 1,
    "avgHealth": 100
  }
}
```

✅ **Status**: HeadyManager is already running!

---

### **Step 2: Set API Key**

```powershell
# Set environment variable
$env:HEADY_API_KEY = "your-api-key-here"

# Or generate a new one
$apiKey = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
$env:HEADY_API_KEY = $apiKey

# Add to .env file
Add-Content -Path "c:\Users\erich\Heady\.env" -Value "HEADY_API_KEY=$apiKey"
```

---

### **Step 3: Test MCP Connection**

```powershell
# Get routing statistics
curl -H "x-heady-api-key: $env:HEADY_API_KEY" `
  http://localhost:3300/api/mcp/routing-stats
```

**What You'll See:**
- Connected MCP servers (5 services)
- HeadyMaid integration status
- Routing optimizer analytics
- Task queue sizes
- Service health status

---

### **Step 4: View Available MCP Services**

```powershell
# List all MCP services
curl -H "x-heady-api-key: $env:HEADY_API_KEY" `
  http://localhost:3300/api/mcp/servers
```

**Available Services:**
1. **heady-windsurf-router** - Primary routing with full observability
2. **filesystem** - File read/write/search operations
3. **memory** - Knowledge graph and persistence
4. **sequential-thinking** - Multi-step reasoning
5. **git** - Version control operations

---

### **Step 5: Check Task Queue**

```powershell
# View queued tasks from HeadyMaid
curl -H "x-heady-api-key: $env:HEADY_API_KEY" `
  http://localhost:3300/api/tasks/queued
```

**Shows:**
- High priority tasks (security, critical)
- Normal priority tasks (refactoring, reorganization)
- Low priority tasks (duplicates, cleanup)

---

## HeadyMaid Task Integration

### **How It Works**

1. **HeadyMaid Scans** (every 30s)
   - Detects duplicates, misplaced files, outdated code

2. **Tasks Emitted**
   - `task-detected` event fired for each opportunity
   - Includes priority, description, category, data

3. **RoutingOptimizer Queues**
   - Receives tasks via event listener
   - Adds to appropriate priority queue
   - Processes in optimal order

4. **Automatic Execution**
   - Queue processor runs every 1 second
   - Routes to best MCP service
   - Tracks success/failure

### **Task Flow Example**

```
HeadyMaid Detects: 5 duplicate files
↓
Emits: task-detected event
↓
RoutingOptimizer: Adds to LOW priority queue
↓
Queue Processor: Picks up task
↓
Service Selection: Routes to filesystem MCP
↓
Execution: Removes duplicates
↓
Result: Tracked in analytics
```

---

## Connection Methods

### **Method 1: REST API (Easiest)**

```powershell
# Call any MCP tool
$body = @{
    server = "heady-windsurf-router"
    tool = "heady_get_inventory"
    args = @{
        include_metadata = $true
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3300/api/mcp/call" `
    -Method POST `
    -Headers @{"x-heady-api-key" = $env:HEADY_API_KEY} `
    -ContentType "application/json" `
    -Body $body
```

### **Method 2: MCP SDK (Advanced)**

```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

const transport = new StdioClientTransport({
  command: 'node',
  args: ['c:\\Users\\erich\\Heady\\heady-manager.js']
});

const client = new Client({ name: 'my-app', version: '1.0.0' }, {});
await client.connect(transport);

// Use MCP tools
const inventory = await client.callTool('heady_get_inventory', {});
```

### **Method 3: Direct HTTP/JSON-RPC**

```bash
curl -X POST http://localhost:3301/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "heady_get_inventory",
      "arguments": {}
    }
  }'
```

---

## Configuration Files

### **mcp_config.json**
Location: `c:\Users\erich\Heady\mcp_config.json`

Defines all MCP services and their governance rules:
```json
{
  "mcpServers": {
    "heady-windsurf-router": {
      "command": "node",
      "args": ["./mcp-servers/heady-windsurf-router/server.js"],
      "governance": {
        "requireConfirmation": ["heady_write_file", "heady_run_command"],
        "auditAll": true
      }
    },
    "filesystem": {...},
    "git": {...}
  }
}
```

### **.env**
Location: `c:\Users\erich\Heady\.env`

Required variables:
```bash
HEADY_API_KEY=your_api_key_here
PORT=3300
HF_TOKEN=your_huggingface_token  # Optional
```

---

## Monitoring & Analytics

### **Real-Time Monitoring**

```powershell
# Monitor routing stats every 5 seconds
while ($true) {
    $stats = Invoke-RestMethod -Uri "http://localhost:3300/api/mcp/routing-stats" `
        -Headers @{"x-heady-api-key" = $env:HEADY_API_KEY}
    
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Routing Stats - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Total Tasks: $($stats.routing.optimizer.overview.totalTasks)" -ForegroundColor Green
    Write-Host "Success Rate: $($stats.routing.optimizer.overview.successRate)" -ForegroundColor Green
    Write-Host "Avg Response: $($stats.routing.optimizer.overview.avgResponseTime)" -ForegroundColor Yellow
    Write-Host "Queued (H/N/L): $($stats.routing.taskManagement.queuedTasks.high)/$($stats.routing.taskManagement.queuedTasks.normal)/$($stats.routing.taskManagement.queuedTasks.low)" -ForegroundColor Cyan
    Write-Host ""
    
    Start-Sleep -Seconds 5
}
```

### **View Queued Tasks**

```powershell
# See what HeadyMaid has queued
$tasks = Invoke-RestMethod -Uri "http://localhost:3300/api/tasks/queued" `
    -Headers @{"x-heady-api-key" = $env:HEADY_API_KEY}

Write-Host "High Priority: $($tasks.tasks.high.Count)" -ForegroundColor Red
Write-Host "Normal Priority: $($tasks.tasks.normal.Count)" -ForegroundColor Yellow
Write-Host "Low Priority: $($tasks.tasks.low.Count)" -ForegroundColor Green
```

---

## Common Operations

### **Get HeadyMaid Inventory**
```powershell
$inventory = Invoke-RestMethod -Uri "http://localhost:3300/api/mcp/call" `
    -Method POST `
    -Headers @{"x-heady-api-key" = $env:HEADY_API_KEY} `
    -ContentType "application/json" `
    -Body (@{
        server = "heady-windsurf-router"
        tool = "heady_get_inventory"
        args = @{ include_metadata = $true }
    } | ConvertTo-Json)

Write-Host "Total Files: $($inventory.result.content[0].text | ConvertFrom-Json | Select -ExpandProperty inventory | Select -ExpandProperty summary | Select -ExpandProperty totalFiles)"
```

### **Get Optimization Opportunities**
```powershell
$opportunities = Invoke-RestMethod -Uri "http://localhost:3300/api/mcp/call" `
    -Method POST `
    -Headers @{"x-heady-api-key" = $env:HEADY_API_KEY} `
    -ContentType "application/json" `
    -Body (@{
        server = "heady-windsurf-router"
        tool = "heady_get_opportunities"
        args = @{ category = "duplicates" }
    } | ConvertTo-Json)
```

### **Read File via MCP**
```powershell
$file = Invoke-RestMethod -Uri "http://localhost:3300/api/mcp/call" `
    -Method POST `
    -Headers @{"x-heady-api-key" = $env:HEADY_API_KEY} `
    -ContentType "application/json" `
    -Body (@{
        server = "heady-windsurf-router"
        tool = "heady_read_file"
        args = @{ file_path = "c:\Users\erich\Heady\README.md" }
    } | ConvertTo-Json)
```

---

## Troubleshooting

### **If HeadyManager Not Running**
```powershell
# Start it
node c:\Users\erich\Heady\heady-manager.js

# Or in background
Start-Process -FilePath "node" `
    -ArgumentList "c:\Users\erich\Heady\heady-manager.js" `
    -NoNewWindow
```

### **If Port 3300 In Use**
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 3300 | Select OwningProcess

# Kill if needed
Stop-Process -Id <PID>
```

### **If MCP Services Not Connecting**
```powershell
# Check mcp_config.json exists
Test-Path c:\Users\erich\Heady\mcp_config.json

# Verify Node.js version (need 18+)
node --version

# Check logs in HeadyManager console
```

---

## Summary

### ✅ **All Systems Ready**

**HeadyMCP Services:**
- Active when you ask something ✅
- Auto-initialize on startup ✅
- Health monitored continuously ✅
- Graceful degradation if offline ✅

**Task Management:**
- HeadyMaid tasks auto-queued ✅
- Priority-based processing ✅
- Routing optimization active ✅
- Complete analytics tracking ✅

**Connection:**
- REST API: `http://localhost:3300/api/mcp/*` ✅
- MCP Protocol: Port 3301 (when gateway starts) ✅
- Admin UI: `http://localhost:3300/admin` ✅

**Configuration:**
- Set `HEADY_API_KEY` environment variable ✅
- All other configs have sensible defaults ✅
- Customize via `.env` file ✅

---

## Next Steps

1. **Set API Key**: `$env:HEADY_API_KEY = "your-key"`
2. **Test Connection**: `curl http://localhost:3300/api/health`
3. **View Stats**: `curl http://localhost:3300/api/mcp/routing-stats`
4. **Monitor Tasks**: `curl http://localhost:3300/api/tasks/queued`
5. **Use MCP Tools**: See examples above

**You're ready to use HeadyMCP!** 🚀

---

**For detailed guides, see:**
- `@c:\Users\erich\Heady\docs\HEADYMCP_CONNECTION_GUIDE.md` - Complete connection guide
- `@c:\Users\erich\Heady\docs\HEADYMAID_TASK_INTEGRATION.md` - Task integration details
- `@c:\Users\erich\Heady\docs\ROUTING_OPTIMIZATION_COMPLETE.md` - Routing optimization
- `@c:\Users\erich\Heady\docs\ECOSYSTEM_STATUS_REPORT.md` - Full system status
