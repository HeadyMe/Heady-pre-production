#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive system verification and health check
.DESCRIPTION
    Verifies all system components are operational and ready for HeadySync
.EXAMPLE
    .\verify-system.ps1
#>

param(
    [switch]$Verbose = $false,
    [switch]$Full = $false
)

$ErrorActionPreference = "Continue"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

Write-Host "╔════════════════════════════════════════════════════════════════╗"
Write-Host "║              HEADY SYSTEM VERIFICATION                         ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"

$results = @{
    passed = 0
    failed = 0
    warnings = 0
    checks = @()
}

function Test-Component {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$FixCommand = ""
    )
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host "✅ $Name"
            $results.passed++
            $results.checks += @{ name = $Name; status = "PASS" }
        } else {
            Write-Host "❌ $Name"
            if ($FixCommand) { Write-Host "   Fix: $FixCommand" }
            $results.failed++
            $results.checks += @{ name = $Name; status = "FAIL"; fix = $FixCommand }
        }
    } catch {
        Write-Host "⚠️  $Name - Error: $($_.Exception.Message)"
        $results.warnings++
        $results.checks += @{ name = $Name; status = "WARN"; error = $_.Exception.Message }
    }
}

# ============================================================================
# ENVIRONMENT CHECKS
# ============================================================================
Write-Host "`n📋 Environment Checks"

Test-Component "Node.js installed" {
    $null = node --version
    $true
} -FixCommand "Install from https://nodejs.org"

Test-Component "npm installed" {
    $null = npm --version
    $true
} -FixCommand "npm should be installed with Node.js"

Test-Component "Git installed" {
    $null = git --version
    $true
} -FixCommand "Install from https://git-scm.com"

Test-Component ".env file exists" {
    Test-Path ".env"
} -FixCommand "Copy .env.example to .env and configure"

Test-Component "package.json valid" {
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    $pkg.name -eq "heady-systems"
} -FixCommand "Verify package.json is valid JSON"

# ============================================================================
# DIRECTORY CHECKS
# ============================================================================
Write-Host "`n📁 Directory Checks"

$requiredDirs = @(
    ".\.heady-context",
    ".\.heady-context\certs",
    ".\.heady-context\backups",
    ".\audit_logs",
    ".\.windsurf\workflows",
    ".\scripts"
)

foreach ($dir in $requiredDirs) {
    Test-Component "Directory: $dir" {
        Test-Path $dir
    } -FixCommand "mkdir $dir"
}

# ============================================================================
# SECURITY CHECKS
# ============================================================================
Write-Host "`n🔐 Security Checks"

Test-Component "TLS certificate exists" {
    Test-Path ".\.heady-context\certs\server.crt"
} -FixCommand "Run: openssl req -new -x509 -key server.key -out server.crt"

Test-Component "TLS private key exists" {
    Test-Path ".\.heady-context\certs\server.key"
} -FixCommand "Generate with OpenSSL"

Test-Component ".env in .gitignore" {
    if (Test-Path ".gitignore") {
        Select-String -Path ".gitignore" -Pattern "^\.env$" -ErrorAction SilentlyContinue
    } else {
        $false
    }
} -FixCommand "Add '.env' to .gitignore"

Test-Component "No exposed secrets in code" {
    $secretPatterns = @(
        "HEADY_API_KEY\s*=\s*['\"]",
        "HF_TOKEN\s*=\s*['\"]"
    )
    
    $exposed = @()
    Get-ChildItem -Recurse -Include "*.js" -Exclude "node_modules", ".git" -ErrorAction SilentlyContinue | ForEach-Object {
        foreach ($pattern in $secretPatterns) {
            if (Select-String -Path $_.FullName -Pattern $pattern -ErrorAction SilentlyContinue) {
                $exposed += $_.FullName
            }
        }
    }
    
    $exposed.Count -eq 0
} -FixCommand "Remove hardcoded secrets from code"

Test-Component "HEADY_API_KEY configured" {
    $env:HEADY_API_KEY -or (Select-String -Path ".env" -Pattern "^HEADY_API_KEY=" -ErrorAction SilentlyContinue)
} -FixCommand "Set HEADY_API_KEY in .env"

# ============================================================================
# DEPENDENCIES CHECK
# ============================================================================
Write-Host "`n📦 Dependencies Check"

Test-Component "node_modules exists" {
    Test-Path "node_modules"
} -FixCommand "npm install"

$criticalPackages = @(
    "express",
    "compression",
    "cors",
    "helmet",
    "express-rate-limit",
    "ws",
    "@modelcontextprotocol/sdk"
)

foreach ($pkg in $criticalPackages) {
    Test-Component "Package: $pkg" {
        Test-Path "node_modules\$pkg"
    } -FixCommand "npm install $pkg"
}

# ============================================================================
# GIT CHECKS
# ============================================================================
Write-Host "`n🔗 Git Checks"

Test-Component "Git repository initialized" {
    Test-Path ".git"
} -FixCommand "git init"

Test-Component "Git remotes configured" {
    $remotes = git remote -v 2>$null
    $remotes.Count -gt 0
} -FixCommand "git remote add origin <url>"

Test-Component "No merge conflicts" {
    $conflicts = Select-String -Path "*.js" -Pattern "<<<<<<|======|>>>>>>" -ErrorAction SilentlyContinue
    $conflicts.Count -eq 0
} -FixCommand "Resolve merge conflicts manually"

Test-Component "Current branch identified" {
    $branch = git rev-parse --abbrev-ref HEAD 2>$null
    $branch -and $branch -ne "HEAD"
} -FixCommand "git checkout -b main"

# ============================================================================
# MCP CHECKS
# ============================================================================
Write-Host "`n🔌 MCP Checks"

Test-Component "mcp_config.json exists" {
    Test-Path "mcp_config.json"
} -FixCommand "Create mcp_config.json with MCP server definitions"

Test-Component "mcp_config.json valid JSON" {
    $mcp = Get-Content "mcp_config.json" | ConvertFrom-Json
    $mcp.mcpServers -ne $null
} -FixCommand "Verify mcp_config.json syntax"

Test-Component "MCP servers configured" {
    $mcp = Get-Content "mcp_config.json" | ConvertFrom-Json
    ($mcp.mcpServers | Get-Member -MemberType NoteProperty).Count -gt 0
} -FixCommand "Add MCP server definitions to mcp_config.json"

# ============================================================================
# SYSTEM RUNTIME CHECKS
# ============================================================================
Write-Host "`n🏥 System Runtime Checks"

Test-Component "Port 3300 available" {
    $port = 3300
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    -not $connection.TcpTestSucceeded
} -FixCommand "Kill process on port 3300: netstat -ano | findstr :3300"

Test-Component "Disk space available" {
    $drive = Get-PSDrive C
    $drive.Free -gt 1GB
} -FixCommand "Free up disk space (need at least 1GB)"

Test-Component "Memory available" {
    $memory = Get-WmiObject win32_operatingsystem
    $freeMemory = $memory.FreePhysicalMemory / 1MB
    $freeMemory -gt 512
} -FixCommand "Close other applications to free memory"

# ============================================================================
# WORKFLOW CHECKS
# ============================================================================
Write-Host "`n⚙️  Workflow Checks"

$workflows = @(
    ".\.windsurf\workflows\secure-remote-setup.md",
    ".\.windsurf\workflows\automation-workflows.md",
    ".\.windsurf\workflows\headysync-prep.md"
)

foreach ($workflow in $workflows) {
    Test-Component "Workflow: $(Split-Path $workflow -Leaf)" {
        Test-Path $workflow
    } -FixCommand "Workflow file missing"
}

# ============================================================================
# AUDIT LOGGING CHECKS
# ============================================================================
Write-Host "`n📊 Audit Logging Checks"

Test-Component "Audit logs directory writable" {
    $testFile = ".\audit_logs\test_$(Get-Random).tmp"
    try {
        "test" | Out-File $testFile
        Remove-Item $testFile
        $true
    } catch {
        $false
    }
} -FixCommand "Check audit_logs directory permissions"

Test-Component "Audit logs exist" {
    $logs = Get-ChildItem ".\audit_logs\*.jsonl" -ErrorAction SilentlyContinue
    $logs.Count -gt 0
} -FixCommand "Logs will be created when system runs"

# ============================================================================
# BACKUP CHECKS
# ============================================================================
Write-Host "`n💾 Backup Checks"

Test-Component "Backup directory exists" {
    Test-Path ".\.heady-context\backups"
} -FixCommand "mkdir .\.heady-context\backups"

Test-Component "Backup directory writable" {
    $testFile = ".\.heady-context\backups\test_$(Get-Random).tmp"
    try {
        "test" | Out-File $testFile
        Remove-Item $testFile
        $true
    } catch {
        $false
    }
} -FixCommand "Check backup directory permissions"

# ============================================================================
# OPTIONAL CHECKS
# ============================================================================
if ($Full) {
    Write-Host "`n🔍 Optional Checks"
    
    Test-Component "OpenSSL installed" {
        $null = openssl version
        $true
    } -FixCommand "Install OpenSSL for certificate generation"
    
    Test-Component "Docker available" {
        $null = docker --version
        $true
    } -FixCommand "Docker is optional but recommended"
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════════╗"
Write-Host "║                    VERIFICATION SUMMARY                         ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"

Write-Host "`n📊 Results:"
Write-Host "  ✅ Passed:  $($results.passed)"
Write-Host "  ❌ Failed:  $($results.failed)"
Write-Host "  ⚠️  Warnings: $($results.warnings)"

if ($results.failed -eq 0) {
    Write-Host "`n✨ System is READY for deployment!"
    Write-Host "`n🚀 Next Steps:"
    Write-Host "  1. npm start"
    Write-Host "  2. .\hs.bat"
    exit 0
} else {
    Write-Host "`n⚠️  System has issues that need to be resolved."
    Write-Host "`n📝 Failed Checks:"
    $results.checks | Where-Object { $_.status -eq "FAIL" } | ForEach-Object {
        Write-Host "  ❌ $($_.name)"
        if ($_.fix) { Write-Host "     Fix: $($_.fix)" }
    }
    exit 1
}
