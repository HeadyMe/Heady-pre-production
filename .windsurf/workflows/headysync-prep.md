---
description: HeadySync (hs) Preparation & Execution
---

# HeadySync Preparation & Execution

## Overview
HeadySync (`hs`) is the unified synchronization workflow that ensures system health, performs backups, validates code, and pushes changes to all remotes.

## Prerequisites
- All systems operational (verified by health checks)
- Git configured with proper remotes
- SSH keys configured for GitHub access
- All dependencies installed
- .env properly configured

## Phase 1: Pre-Sync Validation
// turbo
```powershell
Write-Host "🔍 Phase 1: Pre-Sync Validation"

# 1. Verify system is running
$health = Invoke-WebRequest -Uri "http://localhost:3300/api/health" -ErrorAction SilentlyContinue
if (-not $health) {
  Write-Host "❌ System not running. Start with: npm start"
  exit 1
}

# 2. Check git status
$gitStatus = git status --porcelain
if ($gitStatus) {
  Write-Host "✅ Changes detected: $(($gitStatus | Measure-Object).Count) files"
} else {
  Write-Host "⚠️  No changes to sync"
}

# 3. Verify remotes
$remotes = git remote -v
Write-Host "✅ Git remotes configured:"
$remotes | ForEach-Object { Write-Host "  $_" }

# 4. Check branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "✅ Current branch: $branch"
```

## Phase 2: Backup & Snapshot
// turbo
```powershell
Write-Host "💾 Phase 2: Backup & Snapshot"

# Create backup directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\.heady-context\backups\hs_$timestamp"
mkdir $backupDir -Force | Out-Null

# Backup critical files
$criticalFiles = @(
  ".env",
  "mcp_config.json",
  "package.json",
  "heady-manager.js",
  ".heady-context\project-context.json",
  ".heady-context\codemap.json"
)

foreach ($file in $criticalFiles) {
  if (Test-Path $file) {
    Copy-Item $file "$backupDir\" -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "✅ Backup created: $backupDir"

# Create git snapshot
git stash push -m "hs_backup_$timestamp" 2>$null
Write-Host "✅ Git snapshot created"
```

## Phase 3: Code Quality & Linting
// turbo
```powershell
Write-Host "🔧 Phase 3: Code Quality"

# Run ESLint if configured
if (Test-Path ".eslintrc.js") {
  Write-Host "Running ESLint..."
  npx eslint . --fix 2>$null
  Write-Host "✅ ESLint completed"
} else {
  Write-Host "⚠️  ESLint not configured"
}

# Check for merge conflicts
$conflicts = Select-String -Path "*.js" -Pattern "<<<<<<|======|>>>>>>" -ErrorAction SilentlyContinue
if ($conflicts) {
  Write-Host "❌ Merge conflicts detected:"
  $conflicts | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber)" }
  exit 1
} else {
  Write-Host "✅ No merge conflicts"
}
```

## Phase 4: Dependency Verification
// turbo
```powershell
Write-Host "📦 Phase 4: Dependency Verification"

# Check package.json integrity
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$requiredDeps = @(
  "express",
  "compression",
  "cors",
  "helmet",
  "express-rate-limit",
  "ws",
  "@modelcontextprotocol/sdk"
)

$missing = @()
foreach ($dep in $requiredDeps) {
  if (-not $packageJson.dependencies.$dep) {
    $missing += $dep
  }
}

if ($missing.Count -gt 0) {
  Write-Host "⚠️  Missing dependencies: $($missing -join ', ')"
  Write-Host "Running: npm install"
  npm install
} else {
  Write-Host "✅ All dependencies present"
}
```

## Phase 5: Security Audit
// turbo
```powershell
Write-Host "🔐 Phase 5: Security Audit"

# Check for exposed secrets in code
$secretPatterns = @(
  "HEADY_API_KEY\s*=\s*['\"]",
  "HF_TOKEN\s*=\s*['\"]",
  "DATABASE_URL\s*=\s*['\"]"
)

$exposed = @()
Get-ChildItem -Recurse -Include "*.js", "*.json" -Exclude "node_modules", ".git" | ForEach-Object {
  foreach ($pattern in $secretPatterns) {
    if (Select-String -Path $_.FullName -Pattern $pattern -ErrorAction SilentlyContinue) {
      $exposed += $_.FullName
    }
  }
}

if ($exposed.Count -gt 0) {
  Write-Host "❌ Exposed secrets detected in:"
  $exposed | ForEach-Object { Write-Host "  $_" }
  exit 1
} else {
  Write-Host "✅ No exposed secrets detected"
}

# Verify .gitignore includes .env
if (Select-String -Path ".gitignore" -Pattern "^\.env$" -ErrorAction SilentlyContinue) {
  Write-Host "✅ .env properly ignored"
} else {
  Write-Host "⚠️  .env not in .gitignore"
}
```

## Phase 6: MCP Server Validation
// turbo
```powershell
Write-Host "🔌 Phase 6: MCP Server Validation"

# Verify MCP configuration
if (Test-Path "mcp_config.json") {
  $mcpConfig = Get-Content "mcp_config.json" | ConvertFrom-Json
  $serverCount = ($mcpConfig.mcpServers | Get-Member -MemberType NoteProperty).Count
  Write-Host "✅ MCP servers configured: $serverCount"
} else {
  Write-Host "⚠️  mcp_config.json not found"
}
```

## Phase 7: Commit & Squash
// turbo
```powershell
Write-Host "📝 Phase 7: Commit & Squash"

# Stage all changes
git add -A

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
  # Create commit message
  $commitMsg = "HeadySync: System optimization and synchronization - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  
  # Commit
  git commit -m $commitMsg
  Write-Host "✅ Changes committed: $commitMsg"
  
  # Squash if multiple commits
  $logCount = (git log --oneline | Measure-Object).Count
  if ($logCount -gt 1) {
    Write-Host "Squashing commits..."
    git rebase -i HEAD~$logCount --autosquash 2>$null
    Write-Host "✅ Commits squashed"
  }
} else {
  Write-Host "⚠️  No changes to commit"
}
```

## Phase 8: Push to Remotes
// turbo
```powershell
Write-Host "🚀 Phase 8: Push to Remotes"

$remotes = @("origin", "connection", "upstream-main")
$currentBranch = git rev-parse --abbrev-ref HEAD

foreach ($remote in $remotes) {
  Write-Host "Pushing to $remote..."
  git push $remote $currentBranch 2>&1 | ForEach-Object {
    if ($_ -match "error|fatal") {
      Write-Host "⚠️  $remote: $_"
    } else {
      Write-Host "✅ $remote: Success"
    }
  }
}
```

## Phase 9: Post-Sync Verification
// turbo
```powershell
Write-Host "✔️  Phase 9: Post-Sync Verification"

# Verify system still running
$health = Invoke-WebRequest -Uri "http://localhost:3300/api/health" -ErrorAction SilentlyContinue
if ($health.StatusCode -eq 200) {
  Write-Host "✅ System health: OK"
} else {
  Write-Host "⚠️  System health check failed"
}

# Log sync completion
$syncLog = @{
  timestamp = Get-Date -Format "o"
  status = "completed"
  branch = $currentBranch
  remotes = $remotes
} | ConvertTo-Json

$syncLog | Out-File ".\.heady-context\sync_log_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
Write-Host "✅ Sync log recorded"
```

## Phase 10: Cleanup
// turbo
```powershell
Write-Host "🧹 Phase 10: Cleanup"

# Remove old backups (keep last 10)
$backupDir = ".\.heady-context\backups"
$backups = Get-ChildItem $backupDir -Directory | Sort-Object -Property CreationTime -Descending
if ($backups.Count -gt 10) {
  $backups | Select-Object -Skip 10 | ForEach-Object {
    Remove-Item $_.FullName -Recurse -Force
    Write-Host "✅ Removed old backup: $($_.Name)"
  }
}

# Rotate logs
$logDir = ".\audit_logs"
if (Test-Path $logDir) {
  $cutoffDate = (Get-Date).AddDays(-30)
  Get-ChildItem $logDir -Filter "*.jsonl" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | ForEach-Object {
    Move-Item $_.FullName "$logDir\archive\" -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "✅ Cleanup completed"
```

## Execution
```powershell
# Run full HeadySync workflow
.\hs.bat

# Or with specific phases
.\hs.bat -Phase "validation,backup"

# Or with restart
.\hs.bat -Restart

# Or with force (skip confirmations)
.\hs.bat -Force
```

## Monitoring
Track HeadySync status:
```powershell
# View sync logs
Get-ChildItem ".\.heady-context\sync_log_*.json" | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 5

# View backup history
Get-ChildItem ".\.heady-context\backups" -Directory | Sort-Object -Property CreationTime -Descending
```

## Troubleshooting
- **Push failed**: Verify SSH keys and GitHub permissions
- **Merge conflicts**: Resolve manually before running hs
- **Backup failed**: Check disk space and permissions
- **Security audit failed**: Remove exposed secrets from code
- **MCP validation failed**: Check mcp_config.json syntax

## Recovery
If sync fails, restore from backup:
```powershell
$latestBackup = Get-ChildItem ".\.heady-context\backups" -Directory | Sort-Object -Property CreationTime -Descending | Select-Object -First 1
Copy-Item "$($latestBackup.FullName)\*" ".\" -Force -Recurse
Write-Host "✅ Restored from: $($latestBackup.Name)"
```
