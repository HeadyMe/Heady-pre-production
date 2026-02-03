#!/usr/bin/env pwsh
# HeadySync Preparation Script
# Ensures system readiness for synchronization

param(
    [switch]$Force,
    [switch]$SkipTests,
    [switch]$AutoCommit
)

Write-Host "🔄 HeadySync Preparation Protocol" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$WarningCount = 0

# Function to check command availability
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# 1. System Health Check
Write-Host "📋 Phase 1: System Health Check" -ForegroundColor Yellow
if (Test-Path "scripts/system-health-check.js") {
    node scripts/system-health-check.js
    if ($LASTEXITCODE -ne 0) {
        $WarningCount++
        Write-Host "   ⚠️  Health check reported issues" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Health check script not found" -ForegroundColor Yellow
    $WarningCount++
}

# 2. Git Status Check
Write-Host "`n📋 Phase 2: Git Repository Status" -ForegroundColor Yellow
$GitStatus = git status --porcelain 2>&1
if ($GitStatus) {
    Write-Host "   📝 Uncommitted changes detected:" -ForegroundColor Cyan
    $GitStatus | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
    
    if ($AutoCommit) {
        Write-Host "   🔄 Auto-committing changes..." -ForegroundColor Green
        git add -A
        $CommitMessage = "HeadySync: Auto-commit before synchronization $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git commit -m "$CommitMessage"
        Write-Host "   ✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Please commit changes before sync (or use -AutoCommit)" -ForegroundColor Yellow
        $WarningCount++
    }
} else {
    Write-Host "   ✅ Working tree clean" -ForegroundColor Green
}

# 3. Remote Repository Check
Write-Host "`n📋 Phase 3: Remote Repository Sync" -ForegroundColor Yellow
try {
    # Fetch latest from remote
    git fetch --all --quiet 2>&1 | Out-Null
    
    # Check if we're behind
    $Behind = git rev-list --count "HEAD..@{upstream}" 2>&1
    if ($Behind -and $Behind -ne "0") {
        Write-Host "   ⚠️  Local branch is $Behind commits behind remote" -ForegroundColor Yellow
        $WarningCount++
        
        if ($Force) {
            Write-Host "   🔄 Pulling latest changes..." -ForegroundColor Green
            git pull --rebase
            Write-Host "   ✅ Pulled latest changes" -ForegroundColor Green
        }
    } else {
        Write-Host "   ✅ In sync with remote" -ForegroundColor Green
    }
    
    # Check if we're ahead
    $Ahead = git rev-list --count "@{upstream}..HEAD" 2>&1
    if ($Ahead -and $Ahead -ne "0") {
        Write-Host "   📤 Local branch is $Ahead commits ahead of remote" -ForegroundColor Cyan
        
        if ($Force) {
            Write-Host "   🔄 Pushing changes to remote..." -ForegroundColor Green
            git push
            Write-Host "   ✅ Pushed changes" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Remember to push changes" -ForegroundColor Yellow
            $WarningCount++
        }
    }
} catch {
    Write-Host "   ❌ Failed to check remote status: $_" -ForegroundColor Red
    $ErrorCount++
}

# 4. Dependency Check
Write-Host "`n📋 Phase 4: Dependency Verification" -ForegroundColor Yellow
if (Test-Path "package.json") {
    if (-not (Test-Path "node_modules")) {
        Write-Host "   📦 Installing dependencies..." -ForegroundColor Cyan
        npm install
    }
    
    # Check for outdated packages
    $Outdated = npm outdated --json 2>&1
    if ($Outdated -and $Outdated -ne "{}") {
        Write-Host "   ⚠️  Some packages are outdated" -ForegroundColor Yellow
        $WarningCount++
    } else {
        Write-Host "   ✅ Dependencies up to date" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ No Node.js project detected" -ForegroundColor Green
}

# 5. Test Execution (unless skipped)
if (-not $SkipTests) {
    Write-Host "`n📋 Phase 5: Test Suite Execution" -ForegroundColor Yellow
    if (Test-Path "package.json") {
        $TestResult = npm test 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ⚠️  Some tests failed" -ForegroundColor Yellow
            $WarningCount++
        } else {
            Write-Host "   ✅ All tests passed" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⏭️  No tests to run" -ForegroundColor Gray
    }
} else {
    Write-Host "`n📋 Phase 5: Test Suite Execution" -ForegroundColor Yellow
    Write-Host "   ⏭️  Skipped (--SkipTests flag)" -ForegroundColor Gray
}

# 6. MCP Services Check
Write-Host "`n📋 Phase 6: MCP Services Verification" -ForegroundColor Yellow
if (Test-Path "mcp_config.json") {
    try {
        $MCPConfig = Get-Content "mcp_config.json" | ConvertFrom-Json
        $MCPCount = ($MCPConfig.mcpServers | Get-Member -MemberType NoteProperty).Count
        Write-Host "   ✅ $MCPCount MCP servers configured" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to parse MCP configuration" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "   ⚠️  No MCP configuration found" -ForegroundColor Yellow
    $WarningCount++
}

# 7. HeadyRegistry Verification
Write-Host "`n📋 Phase 7: HeadyRegistry Verification" -ForegroundColor Yellow
$RegistryPath = "src/.heady-memory/heady-registry.json"
if (Test-Path $RegistryPath) {
    try {
        $Registry = Get-Content $RegistryPath | ConvertFrom-Json
        $ComponentCount = ($Registry.components | Get-Member -MemberType NoteProperty).Count
        Write-Host "   ✅ Registry loaded with $ComponentCount components" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to parse registry" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "   ❌ Registry file not found" -ForegroundColor Red
    $ErrorCount++
}

# Final Report
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "📊 HeadySync Readiness Report" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "✨ System is FULLY READY for HeadySync!" -ForegroundColor Green
    Write-Host "   Run 'hs' or 'Heady-Sync.ps1' to proceed" -ForegroundColor Cyan
    exit 0
} elseif ($ErrorCount -eq 0) {
    Write-Host "👍 System is READY with $WarningCount warnings" -ForegroundColor Yellow
    Write-Host "   Consider addressing warnings before sync" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ System has $ErrorCount errors and $WarningCount warnings" -ForegroundColor Red
    Write-Host "   Please fix errors before synchronization" -ForegroundColor Red
    exit 1
}
