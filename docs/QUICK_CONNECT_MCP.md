# Quick Connect to HeadyMCP Services

## Super Convenient Methods

### Method 1: Double-Click (Easiest!)
```
Double-click: c:\Users\erich\Heady\connect-mcp.bat
```
That's it! All MCP services will start automatically.

### Method 2: From Anywhere
```powershell
# From any terminal
cd c:\Users\erich\Heady
.\connect-mcp.bat
```

### Method 3: NPM Command
```bash
# From Heady directory
npm run mcp
# or
npm run connect-mcp
# or just
npm start
```

### Method 4: PowerShell Script
```powershell
.\scripts\connect-mcp.ps1
```

## What Happens

When you connect, HeadyManager automatically:
1. ✓ Starts on port 3300
2. ✓ Connects to all 8 MCP services:
   - filesystem
   - sequential-thinking
   - memory
   - fetch
   - postgres
   - git
   - puppeteer
   - cloudflare
3. ✓ Provides access points:
   - Health API: http://localhost:3300/api/health
   - Admin UI: http://localhost:3300/admin
   - Dashboard: http://localhost:3300/health-dashboard.html

## Verify Connection

### Quick Check
```powershell
curl http://localhost:3300/api/health
```

### Full Verification
```powershell
node src/heady_intelligence_verifier.js
```

## Stop Services

Simply close the HeadyManager window or press `Ctrl+C`

## Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on port 3300
netstat -ano | findstr :3300
taskkill /PID <process_id> /F
```

### MCP Services Not Connecting
```powershell
# Check MCP config
cat mcp_config.json

# Verify npx packages
npx -y @modelcontextprotocol/server-filesystem --version
```

## Integration with Your Workflow

### Auto-start on Login
Create a shortcut to `connect-mcp.bat` in:
```
C:\Users\<YourName>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
```

### Task Scheduler
Schedule `connect-mcp.bat` to run at specific times or on system startup.

### IDE Integration
Add to your IDE's tasks or external tools:
- **VS Code**: Add to tasks.json
- **Windsurf**: Add to workspace commands

## Advanced Usage

### With Custom Config
```javascript
// Use MCPClientWrapper directly
const MCPClientWrapper = require('./src/mcp_client_wrapper');

const mcp = new MCPClientWrapper();
await mcp.connectAll();

// Your code here

await mcp.disconnectAll();
```

### Check Status Programmatically
```javascript
const status = mcp.getStatus();
console.log(`Connected: ${status.connected}`);
console.log(`Services: ${status.services}`);
console.log(`Tools: ${status.tools}`);
```

## Benefits

✓ **One Command** - Everything starts automatically  
✓ **No Configuration** - Works out of the box  
✓ **Full Access** - All 8 MCP services available  
✓ **Visual Feedback** - See connection status  
✓ **Health Monitoring** - Built-in health checks  
✓ **Multiple Methods** - Use whatever's convenient  

---

**Recommendation**: Pin `connect-mcp.bat` to your taskbar for instant access!
