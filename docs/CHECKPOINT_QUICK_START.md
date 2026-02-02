# CHECKPOINT SYSTEM - QUICK START GUIDE

## 🚀 Generate Your First Checkpoint

### Windows (PowerShell)
```powershell
cd c:\Users\erich\Heady
.\scripts\Invoke-Checkpoint.ps1
```

### Cross-Platform (Node.js)
```bash
cd c:\Users\erich\Heady
node scripts\checkpoint.js generate
```

## 📋 Common Commands

| Action | PowerShell | Node.js |
|--------|-----------|---------|
| Generate Report | `.\scripts\Invoke-Checkpoint.ps1 -Action generate` | `node scripts\checkpoint.js generate` |
| View Latest | `.\scripts\Invoke-Checkpoint.ps1 -Action view` | `node scripts\checkpoint.js view` |
| List All | `.\scripts\Invoke-Checkpoint.ps1 -Action list` | `node scripts\checkpoint.js list` |
| Help | `.\scripts\Invoke-Checkpoint.ps1 -Action help` | `node scripts\checkpoint.js help` |

## 📊 What Gets Tracked

✅ **Docker Containers** - All running containers with status  
✅ **MCP Servers** - Configured servers and governance rules  
✅ **Health Endpoints** - Service availability and response times  
✅ **Git Status** - Branch, commits, modified files  
✅ **File System** - Directory structure and file counts  
✅ **Processes** - Running Node.js processes  
✅ **Environment** - Configuration and variables  
✅ **Metrics** - Audit logs, memory patterns, validations  
✅ **Memory Usage** - Heap and RSS statistics  

## 📁 Output Location

Reports are saved to:
```
c:\Users\erich\Heady\audit_logs\
├── checkpoint_1738534800000.md    (Markdown report)
├── checkpoint_1738534800000.json  (JSON data)
└── last_checkpoint.json           (Metadata)
```

## 🔄 Automated Checkpoints

Add to your startup script or `heady-manager.js`:

```javascript
const GovernanceCheckpoint = require('./src/governance_checkpoint');

const checkpoint = new GovernanceCheckpoint({
  autoCheckpointInterval: 3600000, // 1 hour
  rootDir: __dirname
});

await checkpoint.initialize();
```

## 🎯 Use Cases

### Before Deployment
```powershell
.\scripts\Invoke-Checkpoint.ps1 -Action generate
# Deploy your changes
.\scripts\Invoke-Checkpoint.ps1 -Action generate
# Compare the two checkpoints
```

### Daily Health Check
```powershell
# Add to scheduled task
.\scripts\Invoke-Checkpoint.ps1 -Action generate
```

### Incident Investigation
```powershell
# List all checkpoints
.\scripts\Invoke-Checkpoint.ps1 -Action list

# View specific checkpoint
.\scripts\Invoke-Checkpoint.ps1 -Action view
```

## 🔍 Reading Reports

### Executive Summary
Quick overview at the top shows:
- Container count
- Service health (X/Y healthy)
- Git status (clean/modified)
- Key metrics

### Detailed Sections
Scroll down for:
- Full environment details
- Docker container table
- MCP server configuration
- Health check results
- Git repository status
- File system structure
- Process list
- Memory usage

## 💡 Pro Tips

1. **Generate before major changes** - Create a baseline checkpoint
2. **Compare checkpoints** - Track system evolution over time
3. **Archive old reports** - Keep last 30 days, archive the rest
4. **Automate generation** - Schedule hourly or daily checkpoints
5. **Review regularly** - Check for unexpected changes

## 🆘 Troubleshooting

**Problem:** Docker commands fail  
**Solution:** Ensure Docker is running and accessible

**Problem:** Permission denied  
**Solution:** Run with appropriate permissions for file access

**Problem:** Missing dependencies  
**Solution:** Run `npm install` in the Heady directory

**Problem:** No reports generated  
**Solution:** Check `audit_logs/` directory exists and is writable

## 📚 Full Documentation

See `docs/CHECKPOINT_SYSTEM.md` for complete documentation including:
- Architecture details
- Programmatic API usage
- Governance integration
- CI/CD integration
- Advanced features

---

**Quick Help:** `.\scripts\Invoke-Checkpoint.ps1 -Action help`
