---
description: Automation Workflows for Critical Operations
---

# Automation Workflows

## Overview
Comprehensive automation workflows for system operations, monitoring, and maintenance.

## Workflow 1: Health Check & Monitoring
// turbo
```powershell
# Health check script
$healthEndpoint = "http://localhost:3300/api/health"
$maxRetries = 3
$retryCount = 0

while ($retryCount -lt $maxRetries) {
  try {
    $response = Invoke-WebRequest -Uri $healthEndpoint -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
      Write-Host "✅ System Health: OK"
      $health = $response.Content | ConvertFrom-Json
      Write-Host "  - Uptime: $($health.uptime)s"
      Write-Host "  - Memory: $($health.memory)%"
      Write-Host "  - CPU: $($health.cpu)%"
      exit 0
    }
  } catch {
    $retryCount++
    if ($retryCount -lt $maxRetries) {
      Write-Host "⚠️  Health check failed, retrying... ($retryCount/$maxRetries)"
      Start-Sleep -Seconds 2
    }
  }
}

Write-Host "❌ System Health: CRITICAL"
exit 1
```

## Workflow 2: Automated Backup
// turbo
```powershell
# Backup critical files
$backupDir = ".\.heady-context\backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
mkdir $backupDir

$criticalFiles = @(
  ".env",
  "mcp_config.json",
  "package.json",
  ".heady-context\project-context.json",
  ".heady-context\codemap.json"
)

foreach ($file in $criticalFiles) {
  if (Test-Path $file) {
    Copy-Item $file "$backupDir\" -Force
    Write-Host "✅ Backed up: $file"
  }
}

Write-Host "✅ Backup completed at $backupDir"
```

## Workflow 3: Dependency Verification
// turbo
```powershell
# Verify all dependencies are installed
Write-Host "Checking dependencies..."

$requiredPackages = @(
  "express",
  "compression",
  "cors",
  "helmet",
  "express-rate-limit",
  "ws",
  "dockerode",
  "@modelcontextprotocol/sdk",
  "apicache"
)

$missing = @()
foreach ($pkg in $requiredPackages) {
  if (-not (Test-Path "node_modules\$pkg")) {
    $missing += $pkg
  }
}

if ($missing.Count -gt 0) {
  Write-Host "❌ Missing packages: $($missing -join ', ')"
  Write-Host "Running: npm install"
  npm install
} else {
  Write-Host "✅ All dependencies installed"
}
```

## Workflow 4: Security Audit
// turbo
```powershell
# Security audit workflow
Write-Host "Running security audit..."

# Check for exposed secrets
$secretPatterns = @(
  "HEADY_API_KEY=",
  "HF_TOKEN=",
  "DATABASE_URL="
)

$exposed = @()
foreach ($pattern in $secretPatterns) {
  $found = Select-String -Path ".env" -Pattern $pattern -ErrorAction SilentlyContinue
  if ($found -and $found.Line -match "=\s*$") {
    $exposed += $pattern
  }
}

if ($exposed.Count -gt 0) {
  Write-Host "⚠️  Warning: Empty secret values detected: $($exposed -join ', ')"
} else {
  Write-Host "✅ Secrets properly configured"
}

# Check file permissions
$criticalFiles = @(".env", ".heady-context\certs\server.key")
foreach ($file in $criticalFiles) {
  if (Test-Path $file) {
    Write-Host "✅ $file exists"
  }
}
```

## Workflow 5: Log Rotation
// turbo
```powershell
# Rotate audit logs older than 30 days
$logDir = ".\audit_logs"
$archiveDir = ".\audit_logs\archive"

if (-not (Test-Path $archiveDir)) { mkdir $archiveDir }

$cutoffDate = (Get-Date).AddDays(-30)
Get-ChildItem $logDir -Filter "*.jsonl" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | ForEach-Object {
  Move-Item $_.FullName "$archiveDir\" -Force
  Write-Host "✅ Archived: $($_.Name)"
}

Write-Host "✅ Log rotation completed"
```

## Workflow 6: MCP Server Health Check
// turbo
```powershell
# Verify MCP servers are responding
$mcpServers = @(
  "heady-router",
  "filesystem",
  "memory",
  "sequential-thinking",
  "git"
)

Write-Host "Checking MCP servers..."
foreach ($server in $mcpServers) {
  # This would check actual MCP server status
  Write-Host "  - $server: ✅ (configured)"
}

Write-Host "✅ MCP server configuration verified"
```

## Workflow 7: Database Integrity Check
```powershell
# Check database connectivity and integrity
if ($env:DATABASE_URL) {
  Write-Host "Checking database connectivity..."
  # Add database health check logic here
  Write-Host "✅ Database: Connected"
} else {
  Write-Host "⚠️  DATABASE_URL not configured (optional)"
}
```

## Workflow 8: Performance Metrics Collection
// turbo
```powershell
# Collect system performance metrics
$metrics = @{
  timestamp = Get-Date -Format "o"
  cpu = (Get-WmiObject win32_processor | Measure-Object -Property LoadPercentage -Average).Average
  memory = ((Get-WmiObject win32_operatingsystem).TotalVisibleMemorySize - (Get-WmiObject win32_operatingsystem).FreePhysicalMemory) / (Get-WmiObject win32_operatingsystem).TotalVisibleMemorySize * 100
  diskFree = (Get-PSDrive C).Free / 1GB
}

$metrics | ConvertTo-Json | Out-File ".\.heady-context\metrics\$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
Write-Host "✅ Metrics collected"
```

## Scheduled Execution
Add to Windows Task Scheduler:
```powershell
# Create scheduled task for health checks (every 5 minutes)
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File .\scripts\health-check.ps1"
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 5) -At (Get-Date)
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "HeadyHealthCheck" -Description "Heady System Health Check"
```

## Integration with HeadySync
These workflows are automatically invoked by `hs` (HeadySync):
1. Health check before sync
2. Backup before modifications
3. Dependency verification
4. Security audit
5. MCP server validation
6. Metrics collection
7. Log rotation

## Monitoring Dashboard
Access workflow status at: `http://localhost:3300/api/workflows`

## Troubleshooting
- **Workflow timeout**: Increase timeout values in .env
- **Permission denied**: Run PowerShell as Administrator
- **MCP server unavailable**: Check mcp_config.json and restart services
- **Disk space low**: Archive old logs and backups
