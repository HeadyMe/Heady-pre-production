# System Preparation Checklist

## Pre-Deployment Verification

### ✅ Environment & Dependencies
- [x] Node.js installed (v18+)
- [x] npm/pnpm configured
- [x] Git configured with remotes
- [x] All npm dependencies installed
- [x] .env file configured with required variables
- [x] mcp_config.json present and valid

### ✅ Directory Structure
- [x] `.heady-context/` directory created
- [x] `.heady-context/certs/` for TLS certificates
- [x] `.heady-context/backups/` for backup storage
- [x] `.heady-context/metrics/` for performance data
- [x] `audit_logs/` directory created
- [x] `.windsurf/workflows/` directory created
- [x] `scripts/` directory with automation scripts

### ✅ Security Configuration
- [x] TLS certificates generated (server.key, server.crt)
- [x] HEADY_API_KEY configured in .env
- [x] .env file added to .gitignore
- [x] No exposed secrets in code
- [x] Rate limiting configured (200 req/min)
- [x] CORS configured for remote domains
- [x] Audit logging enabled

### ✅ Git & Version Control
- [x] Git remotes configured (origin, connection, upstream-main)
- [x] Current branch identified
- [x] No merge conflicts in heady-manager.js
- [x] .gitignore properly configured
- [x] Commit history clean

### ✅ MCP Integration
- [x] mcp_config.json validated
- [x] MCP servers configured (18 total)
- [x] Core servers operational:
  - [x] heady-router
  - [x] filesystem
  - [x] memory
  - [x] sequential-thinking
  - [x] git
  - [x] heady-cleanup
  - [x] heady-monorepo
  - [x] heady-brain

### ✅ Automation Workflows
- [x] `/secure-remote-setup` workflow created
- [x] `/automation-workflows` workflow created
- [x] `/headysync-prep` workflow created
- [x] `system-prep.ps1` script created
- [x] Health check endpoints configured
- [x] Backup automation ready
- [x] Log rotation configured

### ✅ Remote Connectivity
- [x] HTTPS support configured
- [x] SSH tunnel configuration template
- [x] API key authentication enabled
- [x] CORS headers configured
- [x] Trust proxy settings configured
- [x] Rate limiting in place
- [x] Audit logging for remote access

### ✅ HeadySync Preparation
- [x] Git remotes verified
- [x] Backup system configured
- [x] Code quality checks ready
- [x] Security audit workflow ready
- [x] MCP validation ready
- [x] Commit & squash workflow ready
- [x] Post-sync verification ready

### ✅ Monitoring & Observability
- [x] Health check endpoint (`/api/health`)
- [x] Audit logging system operational
- [x] Metrics collection configured
- [x] Performance monitoring ready
- [x] Log rotation configured
- [x] Backup history tracking

## System Health Status

| Component | Status | Details |
|-----------|--------|---------|
| **Node.js** | ✅ | v18+ required |
| **npm** | ✅ | Dependencies installed |
| **Git** | ✅ | Remotes configured |
| **Environment** | ✅ | .env configured |
| **Security** | ✅ | TLS + API key auth |
| **MCP Servers** | ✅ | 18 configured |
| **Workflows** | ✅ | 3 workflows ready |
| **Remote Access** | ✅ | HTTPS + SSH ready |
| **Audit Logging** | ✅ | Active |
| **Backups** | ✅ | Automated |

## Quick Start Commands

### Start System
```powershell
npm start
# or
node heady-manager.js
```

### Run System Preparation
```powershell
.\scripts\system-prep.ps1
```

### Execute HeadySync
```powershell
.\hs.bat
# or with restart
.\hs.bat -Restart
```

### Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:3300/api/health" `
  -Headers @{ "X-Heady-API-Key" = $env:HEADY_API_KEY }
```

### View Audit Logs
```powershell
Get-ChildItem ".\audit_logs\*.jsonl" | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 5
```

### View Backups
```powershell
Get-ChildItem ".\.heady-context\backups" -Directory | Sort-Object -Property CreationTime -Descending
```

## Remote Access Setup

### 1. Generate SSH Keys (if not done)
```powershell
ssh-keygen -t rsa -b 4096 -f $env:USERPROFILE\.ssh\id_rsa
```

### 2. Configure SSH Tunnel
```powershell
# Add to ~/.ssh/config
Host heady-remote
  HostName your-server.com
  User heady-user
  IdentityFile ~/.ssh/id_rsa
  LocalForward 3300 localhost:3300
```

### 3. Start SSH Tunnel
```powershell
ssh -N heady-remote
```

### 4. Test Remote Connection
```powershell
$headers = @{ "X-Heady-API-Key" = $env:HEADY_API_KEY }
Invoke-WebRequest -Uri "https://localhost:3300/api/health" `
  -Headers $headers -SkipCertificateCheck
```

## Security Best Practices

### API Key Management
- [ ] Rotate HEADY_API_KEY every 90 days
- [ ] Store in secure environment variable
- [ ] Never commit to git
- [ ] Use different keys for dev/prod

### Audit Logging
- [ ] Review audit logs daily
- [ ] Archive logs older than 30 days
- [ ] Monitor for failed authentication attempts
- [ ] Track all file modifications

### Remote Access
- [ ] Always use SSH tunnel or VPN
- [ ] Enable HTTPS only
- [ ] Restrict access to known IPs
- [ ] Monitor connection logs
- [ ] Use strong API keys

### Backup Strategy
- [ ] Backup before every sync
- [ ] Keep last 10 backups
- [ ] Test backup restoration quarterly
- [ ] Store backups securely
- [ ] Document recovery procedures

## Troubleshooting

### System Won't Start
```powershell
# Check dependencies
npm list

# Verify environment
Get-Content .env | Select-String "HEADY_API_KEY", "PORT"

# Check port availability
netstat -ano | findstr :3300
```

### MCP Server Connection Failed
```powershell
# Verify mcp_config.json
Get-Content mcp_config.json | ConvertFrom-Json

# Check MCP server status
npm list @modelcontextprotocol/sdk
```

### Git Push Failed
```powershell
# Verify remotes
git remote -v

# Check SSH keys
ssh -T git@github.com

# Test connection
git fetch origin
```

### Audit Log Errors
```powershell
# Check directory permissions
Get-Acl .\audit_logs

# Verify disk space
Get-PSDrive C

# Check log file size
Get-ChildItem .\audit_logs\*.jsonl | Measure-Object -Property Length -Sum
```

## Performance Optimization

### Memory Usage
- Monitor with: `Get-Process node | Select-Object Name, WorkingSet`
- Increase if needed: Set `NODE_OPTIONS=--max-old-space-size=4096`

### CPU Usage
- Check with: `Get-WmiObject win32_processor | Select-Object LoadPercentage`
- Reduce concurrency if needed: Adjust `HF_MAX_CONCURRENCY` in .env

### Disk Space
- Monitor: `Get-PSDrive C | Select-Object Used, Free`
- Clean old backups: Remove from `.heady-context/backups`
- Archive old logs: Move to `audit_logs/archive`

## Maintenance Schedule

### Daily
- [ ] Review audit logs for errors
- [ ] Check system health endpoint
- [ ] Monitor disk space

### Weekly
- [ ] Run security audit
- [ ] Verify backup integrity
- [ ] Check MCP server status
- [ ] Review performance metrics

### Monthly
- [ ] Rotate API keys
- [ ] Archive old logs
- [ ] Clean old backups
- [ ] Update dependencies

### Quarterly
- [ ] Test backup restoration
- [ ] Security penetration test
- [ ] Performance optimization review
- [ ] Disaster recovery drill

## Support & Documentation

- **Workflows**: `.windsurf/workflows/`
- **Scripts**: `./scripts/`
- **Logs**: `./audit_logs/`
- **Backups**: `./.heady-context/backups/`
- **Configuration**: `.env`, `mcp_config.json`

## Sign-Off

**System Preparation Date**: 2026-02-03
**Prepared By**: Cascade AI
**Status**: ✅ READY FOR DEPLOYMENT
**Next Step**: Execute `npm start` and run `.\hs.bat`
