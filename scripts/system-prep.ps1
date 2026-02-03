#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive system preparation for secure remote connectivity and HeadySync
.DESCRIPTION
    Prepares the Heady System for secure remote access, proper workflows, and HeadySync integration
.EXAMPLE
    .\system-prep.ps1
#>

param(
    [switch]$SkipBackup = $false,
    [switch]$SkipSecurity = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

Write-Host "╔════════════════════════════════════════════════════════════════╗"
Write-Host "║        HEADY SYSTEM PREPARATION & REMOTE SETUP                 ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"

# ============================================================================
# PHASE 1: ENVIRONMENT VALIDATION
# ============================================================================
Write-Host "`n📋 PHASE 1: Environment Validation"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion"
} catch {
    Write-Host "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion"
} catch {
    Write-Host "❌ npm not found"
    exit 1
}

# Check git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion"
} catch {
    Write-Host "❌ Git not found"
    exit 1
}

# Check OpenSSL (for certificate generation)
try {
    $opensslVersion = openssl version
    Write-Host "✅ OpenSSL: $opensslVersion"
} catch {
    Write-Host "⚠️  OpenSSL not found (needed for TLS certificates)"
}

# ============================================================================
# PHASE 2: DIRECTORY STRUCTURE
# ============================================================================
Write-Host "`n📁 PHASE 2: Directory Structure"

$requiredDirs = @(
    ".\.heady-context",
    ".\.heady-context\certs",
    ".\.heady-context\backups",
    ".\.heady-context\metrics",
    ".\audit_logs",
    ".\audit_logs\archive",
    ".\.windsurf\workflows",
    ".\scripts"
)

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        mkdir $dir -Force | Out-Null
        Write-Host "✅ Created: $dir"
    } else {
        Write-Host "✅ Exists: $dir"
    }
}

# ============================================================================
# PHASE 3: ENVIRONMENT CONFIGURATION
# ============================================================================
Write-Host "`n⚙️  PHASE 3: Environment Configuration"

if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env not found. Creating from .env.example..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env from template"
    } else {
        Write-Host "⚠️  .env.example not found. Please configure .env manually"
    }
} else {
    Write-Host "✅ .env exists"
}

# Verify critical environment variables
$requiredVars = @("HEADY_API_KEY", "PORT")
$missingVars = @()

foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "✅ $var configured"
    } else {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Missing environment variables: $($missingVars -join ', ')"
    Write-Host "   Please configure in .env file"
}

# ============================================================================
# PHASE 4: DEPENDENCIES
# ============================================================================
Write-Host "`n📦 PHASE 4: Dependencies"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..."
    npm install
    Write-Host "✅ Dependencies installed"
} else {
    Write-Host "✅ node_modules exists"
    
    # Verify critical packages
    $criticalPackages = @(
        "express",
        "compression",
        "cors",
        "helmet",
        "express-rate-limit",
        "ws",
        "@modelcontextprotocol/sdk"
    )
    
    $missing = @()
    foreach ($pkg in $criticalPackages) {
        if (-not (Test-Path "node_modules\$pkg")) {
            $missing += $pkg
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "⚠️  Missing packages: $($missing -join ', ')"
        Write-Host "Running: npm install"
        npm install
    } else {
        Write-Host "✅ All critical packages present"
    }
}

# ============================================================================
# PHASE 5: GIT CONFIGURATION
# ============================================================================
Write-Host "`n🔗 PHASE 5: Git Configuration"

# Verify git remotes
$remotes = git remote -v
if ($remotes) {
    Write-Host "✅ Git remotes configured:"
    $remotes | ForEach-Object { Write-Host "   $_" }
} else {
    Write-Host "⚠️  No git remotes configured"
}

# Check current branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "✅ Current branch: $branch"

# ============================================================================
# PHASE 6: SECURITY SETUP
# ============================================================================
if (-not $SkipSecurity) {
    Write-Host "`n🔐 PHASE 6: Security Setup"
    
    # Generate TLS certificates if missing
    if (-not (Test-Path ".\.heady-context\certs\server.crt")) {
        Write-Host "Generating TLS certificates..."
        try {
            openssl genrsa -out ".\.heady-context\certs\server.key" 2048 2>$null
            openssl req -new -x509 -key ".\.heady-context\certs\server.key" -out ".\.heady-context\certs\server.crt" -days 365 `
                -subj "/C=US/ST=State/L=City/O=HeadySystems/CN=localhost" 2>$null
            Write-Host "✅ TLS certificates generated"
        } catch {
            Write-Host "⚠️  Could not generate TLS certificates (OpenSSL required)"
        }
    } else {
        Write-Host "✅ TLS certificates exist"
    }
    
    # Verify .gitignore
    if (Test-Path ".gitignore") {
        if (Select-String -Path ".gitignore" -Pattern "^\.env$" -ErrorAction SilentlyContinue) {
            Write-Host "✅ .env properly ignored"
        } else {
            Write-Host "⚠️  .env not in .gitignore"
            Add-Content ".gitignore" ".env"
        }
    }
    
    # Check for exposed secrets
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
    
    if ($exposed.Count -gt 0) {
        Write-Host "⚠️  Exposed secrets detected in:"
        $exposed | ForEach-Object { Write-Host "   $_" }
    } else {
        Write-Host "✅ No exposed secrets detected"
    }
}

# ============================================================================
# PHASE 7: BACKUP
# ============================================================================
if (-not $SkipBackup) {
    Write-Host "`n💾 PHASE 7: Backup"
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = ".\.heady-context\backups\prep_$timestamp"
    mkdir $backupDir -Force | Out-Null
    
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
            Write-Host "✅ Backed up: $file"
        }
    }
}

# ============================================================================
# PHASE 8: MCP CONFIGURATION
# ============================================================================
Write-Host "`n🔌 PHASE 8: MCP Configuration"

if (Test-Path "mcp_config.json") {
    try {
        $mcpConfig = Get-Content "mcp_config.json" | ConvertFrom-Json
        $serverCount = ($mcpConfig.mcpServers | Get-Member -MemberType NoteProperty).Count
        Write-Host "✅ MCP servers configured: $serverCount"
    } catch {
        Write-Host "⚠️  Invalid mcp_config.json format"
    }
} else {
    Write-Host "⚠️  mcp_config.json not found"
}

# ============================================================================
# PHASE 9: AUDIT LOGGING
# ============================================================================
Write-Host "`n📊 PHASE 9: Audit Logging"

if (Test-Path ".\audit_logs") {
    $logCount = (Get-ChildItem ".\audit_logs" -Filter "*.jsonl" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "✅ Audit logs: $logCount files"
} else {
    Write-Host "✅ Audit logs directory ready"
}

# ============================================================================
# PHASE 10: HEALTH CHECK
# ============================================================================
Write-Host "`n🏥 PHASE 10: Health Check"

# Check if system is running
$healthCheck = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3300/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ System running on port 3300"
        $healthCheck = $true
    }
} catch {
    Write-Host "⚠️  System not running (start with: npm start)"
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════════╗"
Write-Host "║                    PREPARATION COMPLETE                         ║"
Write-Host "╚════════════════════════════════════════════════════════════════╝"

Write-Host "`n📝 Next Steps:"
Write-Host "  1. Start system: npm start"
Write-Host "  2. Run HeadySync: .\hs.bat"
Write-Host "  3. Setup remote: Invoke-WebRequest https://docs.headysystems.com/remote-setup"
Write-Host "  4. Monitor: http://localhost:3300/api/health"

Write-Host "`n🔐 Security Reminders:"
Write-Host "  • Keep .env file secure and never commit to git"
Write-Host "  • Rotate API keys every 90 days"
Write-Host "  • Review audit logs regularly"
Write-Host "  • Use SSH tunnels for remote access"

Write-Host "`n✨ System is ready for secure remote connectivity and HeadySync!"
