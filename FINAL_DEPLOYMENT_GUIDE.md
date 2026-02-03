# Final Deployment Guide

## System Status: ✅ READY FOR DEPLOYMENT

This guide provides step-by-step instructions to deploy the Heady System with secure remote connectivity, proper workflows, and HeadySync integration.

---

## Part 1: Pre-Deployment Verification

### Step 1: Run System Verification
```powershell
.\scripts\verify-system.ps1
```

**Expected Output:**
```
✅ Passed:  25+
❌ Failed:  0
⚠️  Warnings: 0-2

✨ System is READY for deployment!
```

### Step 2: Verify Git Status
```powershell
git status
git remote -v
```

**Expected:**
- Clean working directory (or staged changes ready to commit)
- Multiple remotes configured (origin, connection, upstream-main)

### Step 3: Check Environment Configuration
```powershell
# Verify critical variables are set
Get-Content .env | Select-String "HEADY_API_KEY", "PORT", "NODE_ENV"
```

**Expected:**
- HEADY_API_KEY is set (non-empty)
- PORT is configured (default: 3300)
- NODE_ENV is set (development or production)

---

## Part 2: System Startup

### Step 1: Start HeadyManager
```powershell
npm start
# or
node heady-manager.js
```

**Expected Output:**
```
[MCP] Connecting to heady-router...
[MCP] Connected to heady-router
[MCP] Connecting to filesystem...
[MCP] Connected to filesystem
...
Server running on port 3300
```

### Step 2: Verify System is Running
```powershell
# In a new terminal
Invoke-WebRequest -Uri "http://localhost:3300/api/health" `
  -Headers @{ "X-Heady-API-Key" = $env:HEADY_API_KEY }
```

**Expected Response:**
```json
{
  "status": "ok",
  "uptime": 5,
  "timestamp": "2026-02-03T22:30:00.000Z"
}
```

---

## Part 3: Secure Remote Setup

### Step 1: Generate SSH Keys (if needed)
```powershell
# Check if keys exist
if (-not (Test-Path $env:USERPROFILE\.ssh\id_rsa)) {
  ssh-keygen -t rsa -b 4096 -f $env:USERPROFILE\.ssh\id_rsa -N ""
  Write-Host "✅ SSH keys generated"
}
```

### Step 2: Configure SSH Tunnel
```powershell
# Add to ~/.ssh/config
$sshConfig = @"
Host heady-remote
  HostName your-remote-server.com
  User heady-user
  IdentityFile ~/.ssh/id_rsa
  LocalForward 3300 localhost:3300
  ServerAliveInterval 60
  ServerAliveCountMax 3
"@

Add-Content "$env:USERPROFILE\.ssh\config" $sshConfig
```

### Step 3: Test Remote Connection
```powershell
# Start SSH tunnel in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ssh -N heady-remote"

# Wait 2 seconds for tunnel to establish
Start-Sleep -Seconds 2

# Test connection
$headers = @{ "X-Heady-API-Key" = $env:HEADY_API_KEY }
Invoke-WebRequest -Uri "https://localhost:3300/api/health" `
  -Headers $headers -SkipCertificateCheck
```

---

## Part 4: HeadySync Execution

### Step 1: Prepare for Sync
```powershell
# Run system preparation
.\scripts\system-prep.ps1

# Verify everything is ready
.\scripts\verify-system.ps1
```

### Step 2: Execute HeadySync
```powershell
# Full sync with all phases
.\hs.bat

# Or with specific options
.\hs.bat -Restart        # Restart services after sync
.\hs.bat -Force          # Skip confirmations
.\hs.bat -Phase "backup,commit,push"  # Specific phases
```

**Expected Output:**
```
🔍 Phase 1: Pre-Sync Validation
✅ System running
✅ Changes detected: 5 files
✅ Git remotes configured
✅ Current branch: main

💾 Phase 2: Backup & Snapshot
✅ Backup created: .\.heady-context\backups\hs_20260203_223000

🔧 Phase 3: Code Quality
✅ ESLint completed
✅ No merge conflicts

...

🚀 Phase 8: Push to Remotes
✅ origin: Success
✅ connection: Success
✅ upstream-main: Success

✔️  Phase 9: Post-Sync Verification
✅ System health: OK
✅ Sync log recorded

✨ HeadySync completed successfully!
```

---

## Part 5: Monitoring & Verification

### Step 1: Monitor System Health
```powershell
# Create scheduled health check (every 5 minutes)
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-File .\scripts\health-check.ps1"
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 5) `
  -At (Get-Date)
Register-ScheduledTask -Action $action -Trigger $trigger `
  -TaskName "HeadyHealthCheck" -Description "Heady System Health Check"
```

### Step 2: View Audit Logs
```powershell
# View latest audit logs
Get-ChildItem ".\audit_logs\*.jsonl" | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 5

# View specific date
Get-Content ".\audit_logs\audit_2026-02-03.jsonl" | ConvertFrom-Json | Select-Object timestamp, event
```

### Step 3: Check Backup Status
```powershell
# List all backups
Get-ChildItem ".\.heady-context\backups" -Directory | Sort-Object -Property CreationTime -Descending

# View latest backup
$latest = Get-ChildItem ".\.heady-context\backups" -Directory | Sort-Object -Property CreationTime -Descending | Select-Object -First 1
Get-ChildItem "$($latest.FullName)\*"
```

---

## Part 6: Automation Workflows

### Available Workflows

1. **Secure Remote Setup** (`.windsurf/workflows/secure-remote-setup.md`)
   - TLS certificate generation
   - SSH tunnel configuration
   - API key authentication
   - CORS configuration

2. **Automation Workflows** (`.windsurf/workflows/automation-workflows.md`)
   - Health check & monitoring
   - Automated backup
   - Dependency verification
   - Security audit
   - Log rotation
   - MCP server health check
   - Performance metrics collection

3. **HeadySync Preparation** (`.windsurf/workflows/headysync-prep.md`)
   - Pre-sync validation
   - Backup & snapshot
   - Code quality checks
   - Security audit
   - MCP validation
   - Commit & squash
   - Push to remotes
   - Post-sync verification

### Running Workflows
```powershell
# Execute specific workflow
Invoke-WebRequest -Uri "http://localhost:3300/api/workflows/secure-remote-setup" `
  -Method POST -Headers @{ "X-Heady-API-Key" = $env:HEADY_API_KEY }

# Monitor workflow status
Invoke-WebRequest -Uri "http://localhost:3300/api/workflows/status" `
  -Headers @{ "X-Heady-API-Key" = $env:HEADY_API_KEY }
```

---

## Part 7: Security Configuration

### API Key Management
```powershell
# Generate new API key
$newKey = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
Write-Host "New API Key: $newKey"

# Update .env
(Get-Content .env) -replace 'HEADY_API_KEY=.*', "HEADY_API_KEY=$newKey" | Set-Content .env
```

### CORS Configuration
```powershell
# Update .env with allowed origins
$origins = "https://app.example.com,https://admin.example.com"
(Get-Content .env) -replace 'HEADY_CORS_ORIGINS=.*', "HEADY_CORS_ORIGINS=$origins" | Set-Content .env
```

### Rate Limiting
```powershell
# Configure rate limiting in .env
# Default: 200 requests per minute per IP
# Adjust HEADY_RATE_LIMIT_MAX and HEADY_RATE_LIMIT_WINDOW_MS as needed
```

---

## Part 8: Troubleshooting

### System Won't Start
```powershell
# Check for port conflicts
netstat -ano | findstr :3300

# Kill process on port 3300
$process = Get-Process -Id (Get-NetTCPConnection -LocalPort 3300).OwningProcess
Stop-Process -Id $process.Id -Force

# Try starting again
npm start
```

### MCP Server Connection Failed
```powershell
# Verify mcp_config.json
Get-Content mcp_config.json | ConvertFrom-Json

# Check MCP package
npm list @modelcontextprotocol/sdk

# Reinstall if needed
npm install @modelcontextprotocol/sdk
```

### Git Push Failed
```powershell
# Verify SSH keys
ssh -T git@github.com

# Test git connection
git fetch origin

# Check remote URLs
git remote -v

# Update remote if needed
git remote set-url origin https://github.com/HeadyMe/Heady.git
```

### Audit Log Errors
```powershell
# Check directory permissions
Get-Acl .\audit_logs

# Check disk space
Get-PSDrive C | Select-Object Used, Free

# Fix permissions if needed
icacls .\audit_logs /grant:r "$env:USERNAME`:(OI)(CI)F"
```

---

## Part 9: Maintenance Schedule

### Daily Tasks
- [ ] Review audit logs for errors
- [ ] Check system health endpoint
- [ ] Monitor disk space

### Weekly Tasks
- [ ] Run security audit
- [ ] Verify backup integrity
- [ ] Check MCP server status
- [ ] Review performance metrics

### Monthly Tasks
- [ ] Rotate API keys
- [ ] Archive old logs
- [ ] Clean old backups
- [ ] Update dependencies

### Quarterly Tasks
- [ ] Test backup restoration
- [ ] Security penetration test
- [ ] Performance optimization review
- [ ] Disaster recovery drill

---

## Part 10: Support & Documentation

### Key Files
- **Workflows**: `.windsurf/workflows/`
- **Scripts**: `./scripts/`
- **Configuration**: `.env`, `mcp_config.json`
- **Logs**: `./audit_logs/`
- **Backups**: `./.heady-context/backups/`
- **Certificates**: `./.heady-context/certs/`

### Quick Commands
```powershell
# Start system
npm start

# Verify system
.\scripts\verify-system.ps1

# Prepare system
.\scripts\system-prep.ps1

# Run HeadySync
.\hs.bat

# Health check
Invoke-WebRequest http://localhost:3300/api/health

# View logs
Get-Content .\audit_logs\audit_*.jsonl | ConvertFrom-Json

# View backups
Get-ChildItem .\.heady-context\backups
```

---

## Deployment Checklist

- [ ] System verification passed (0 failures)
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] TLS certificates generated
- [ ] Git remotes configured
- [ ] SSH keys configured
- [ ] System starts without errors
- [ ] Health check endpoint responds
- [ ] Audit logging working
- [ ] Backup system functional
- [ ] HeadySync executed successfully
- [ ] Remote access tested
- [ ] Workflows operational
- [ ] Monitoring configured
- [ ] Documentation reviewed

---

## Final Status

**System Status**: ✅ READY FOR PRODUCTION DEPLOYMENT

**Deployment Date**: 2026-02-03
**Deployed By**: Cascade AI
**Next Review**: 2026-02-10

**Critical Reminders:**
1. Keep `.env` file secure and never commit to git
2. Rotate API keys every 90 days
3. Review audit logs regularly
4. Test backup restoration quarterly
5. Monitor system health continuously

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review audit logs: `.\audit_logs\`
3. Run verification: `.\scripts\verify-system.ps1`
4. Check documentation: `.windsurf/workflows/`
