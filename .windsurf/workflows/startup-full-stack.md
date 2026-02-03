---
description: Start the complete Heady Systems full-stack environment
---

# Full Stack Startup

## Prerequisites
1. MCP services configured (`mcp_config.json`)
2. Environment variables set (`.env`)
3. Dependencies installed (`pnpm install`)

## Startup Sequence

### 1. Start Heady Manager
```powershell
node heady-manager.js
```
- Starts on port 3300
- Initializes all MCP clients
- Sets up WebSocket server

### 2. Verify Services
```powershell
pnpm verify
```

### 3. Check Status
```powershell
hs -Status
```

## Service Ports
| Service | Port | Description |
|---------|------|-------------|
| HeadyManager | 3300 | Main manager |
| MCP Gateway | 3301 | MCP protocol gateway |
| Web Server | 3000 | Next.js frontend |

## Troubleshooting
- Port in use: `netstat -ano | findstr :3300`
- MCP not connecting: Check `mcp_config.json`
- Environment issues: Verify `.env` file
