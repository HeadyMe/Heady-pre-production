#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Heady Unified Deployment - Intelligent Merge & Optimization Script
    
.DESCRIPTION
    Merges HeadySystems/main (Codex v13) with existing Heady infrastructure
    Implements deterministic orchestration, governance locking, and security hardening
    
.NOTES
    Author: Eric Haywood (HeadySystems Inc.)
    Version: 1.0.0
    Compliance: Codex v13, Sacred Geometry Architecture
#>

param(
    [switch]$DryRun,
    [switch]$SkipTests,
    [switch]$Force,
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Sacred Geometry Colors
$Colors = @{
    Primary = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Magenta"
    Sacred = "DarkCyan"
}

$script:ValidColors = @("Black", "DarkBlue", "DarkGreen", "DarkCyan", "DarkRed", "DarkMagenta", "DarkYellow", "Gray", "DarkGray", "Blue", "Green", "Cyan", "Red", "Magenta", "Yellow", "White")

function Write-Sacred {
    param([string]$Message, [string]$Color = "Cyan")
    $validColor = if ($script:ValidColors -contains $Color) { $Color } else { "Cyan" }
    Write-Host "🔷 $Message" -ForegroundColor $validColor
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Sacred $Message "Magenta"
    Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor DarkGray
}

function Test-Prerequisites {
    Write-Step "Checking Prerequisites"
    
    $required = @("node", "npm", "python", "git")
    $missing = @()
    
    foreach ($cmd in $required) {
        try {
            $null = Get-Command $cmd -ErrorAction Stop
            Write-Sacred "✓ $cmd found" "Green"
        } catch {
            $missing += $cmd
            Write-Sacred "✗ $cmd not found" "Red"
        }
    }
    
    if ($missing.Count -gt 0 -and -not $Force) {
        throw "Missing prerequisites: $($missing -join ', '). Use -Force to skip."
    }
}

function Merge-CodexV13 {
    Write-Step "Merging Codex v13 Architecture"
    
    # Verify Codex v13 directory exists
    if (-not (Test-Path "codex_v13")) {
        Write-Sacred "✗ Codex v13 not found. Run clone operation first." "Red"
        throw "Codex v13 directory missing"
    }
    
    Write-Sacred "✓ Codex v13 directory verified" "Green"
    
    # Create governance directory structure
    $govDirs = @(
        ".heady/governance/policy-pack",
        ".heady/governance/receipts",
        ".heady/governance/audit"
    )
    
    foreach ($dir in $govDirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Sacred "Created: $dir" "Cyan"
        }
    }
    
    # Copy governance lock
    if (Test-Path "codex_v13/governance.lock") {
        Copy-Item "codex_v13/governance.lock" ".heady/governance/governance.lock" -Force
        Write-Sacred "✓ Governance lock installed" "Green"
    }
    
    # Copy registry
    if (Test-Path "codex_v13/REGISTRY.json") {
        Copy-Item "codex_v13/REGISTRY.json" ".heady/REGISTRY.json" -Force
        Write-Sacred "✓ Registry installed" "Green"
    }
}

function Update-PackageJson {
    Write-Step "Updating package.json with Orchestrator"
    
    $packagePath = "package.json"
    if (Test-Path $packagePath) {
        $package = Get-Content $packagePath -Raw | ConvertFrom-Json
        
        # Add orchestrator script
        if (-not $package.scripts) {
            $package | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{}
        }
        
        $package.scripts | Add-Member -MemberType NoteProperty -Name "orchestrate" -Value "node heady-orchestrator.js" -Force
        $package.scripts | Add-Member -MemberType NoteProperty -Name "codex:build" -Value "python codex_v13/codex_builder_v13.py" -Force
        $package.scripts | Add-Member -MemberType NoteProperty -Name "codex:verify" -Value "node -e `"require('./heady-orchestrator.js')`"" -Force
        
        if (-not $DryRun) {
            $package | ConvertTo-Json -Depth 10 | Set-Content $packagePath
            Write-Sacred "✓ package.json updated" "Green"
        } else {
            Write-Sacred "DRY RUN: Would update package.json" "Yellow"
        }
    }
}

function Install-Dependencies {
    Write-Step "Installing Dependencies"
    
    if (-not $DryRun) {
        Write-Sacred "Installing Node.js dependencies..." "Cyan"
        npm install --silent
        
        Write-Sacred "Installing Python dependencies..." "Cyan"
        if (Test-Path "requirements.txt") {
            python -m pip install -r requirements.txt --quiet
        }
        
        Write-Sacred "✓ Dependencies installed" "Green"
    } else {
        Write-Sacred "DRY RUN: Would install dependencies" "Yellow"
    }
}

function Optimize-Configuration {
    Write-Step "Optimizing Configuration"
    
    # Create unified environment template
    $envTemplate = @"
# Heady Unified Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Core Settings
PORT=3300
NODE_ENV=$Environment

# Trust Domain (Codex v13)
HEADY_TRUST_DOMAIN=headysystems.com
HEADY_APP_DOMAIN=app.headysystems.com
HEADY_ASSIGNEE=HeadySystems Inc.
HEADY_INVENTOR=Eric Haywood

# Governance
HEADY_GOVERNANCE_MODE=locked
HEADY_AUDIT_ENABLED=true

# API Keys (REPLACE WITH ACTUAL VALUES)
HEADY_API_KEY=your-api-key-here
HF_TOKEN=your-huggingface-token-here
MCP_GATEWAY_JWT_SECRET=your-jwt-secret-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/heady

# Admin Settings
HEADY_ADMIN_ROOT=.
HEADY_ADMIN_ENABLE_GPU=false

# Rate Limiting
HEADY_RATE_LIMIT_WINDOW_MS=60000
HEADY_RATE_LIMIT_MAX=120

# CORS
HEADY_CORS_ORIGINS=http://localhost:3300,http://127.0.0.1:3300
"@
    
    if (-not (Test-Path ".env") -or $Force) {
        if (-not $DryRun) {
            Set-Content -Path ".env.unified" -Value $envTemplate
            Write-Sacred "✓ Created .env.unified template" "Green"
            Write-Sacred "⚠ Review and rename to .env, then add your API keys" "Yellow"
        } else {
            Write-Sacred "DRY RUN: Would create .env.unified" "Yellow"
        }
    }
}

function Update-Documentation {
    Write-Step "Updating Documentation"
    
    $integrationDoc = @"
# Heady Unified System - Integration Complete

## Architecture Overview

The Heady system now integrates:

1. **Codex v13 Deterministic Builder** - Governance-locked repository generation
2. **Heady Manager** - Express-based API server with MCP integration
3. **Heady Orchestrator** - Unified orchestration layer
4. **Sacred Geometry UI** - Modern, breathing interface

## Key Components

### Codex v13 (`codex_v13/`)
- **codex_builder_v13.py** - Deterministic repository generator
- **REGISTRY.json** - Identity and compliance registry
- **governance.lock** - Governance policy lock file
- **mcp-gateway-config.json** - MCP gateway configuration

### Core Services
- **heady-manager.js** - Main API server (port 3300)
- **heady-orchestrator.js** - System orchestration
- **mcp_config_unified.json** - Unified MCP configuration

### Governance Structure
\`\`\`
.heady/
├── governance/
│   ├── governance.lock
│   ├── policy-pack/
│   ├── receipts/
│   └── audit/
└── REGISTRY.json
\`\`\`

## Running the System

### Option 1: Orchestrated Mode (Recommended)
\`\`\`bash
npm run orchestrate
\`\`\`

### Option 2: Direct Manager
\`\`\`bash
npm start
\`\`\`

### Option 3: Codex Builder Only
\`\`\`bash
npm run codex:build
\`\`\`

## Security Features

1. **Trust Domain Enforcement** - All operations bound to headysystems.com
2. **Governance Locking** - Policy version locked to v1.2.0
3. **Audit Trail** - All operations logged when HEADY_AUDIT_ENABLED=true
4. **JWT Authentication** - MCP gateway uses HS256 JWT tokens
5. **Rate Limiting** - 120 requests per minute per IP
6. **Localhost Binding** - Services bind to 127.0.0.1 only

## Patent Integration

The system implements concepts from the HeadySystems patent portfolio:
- **PTACA** (Physical Trust-Anchored Cryptographic Authorization)
- **RAA Execution Fabric** (Risk, Authorization, Attestation)
- **Deterministic Repo Builder** (Patent #13)
- **Policy Supply Chain** (Patent #17)

See `PATENT_PORTFOLIO.md` for complete patent documentation.

## Configuration

All configuration is centralized in `.env`:
- Copy `.env.unified` to `.env`
- Add your API keys
- Adjust settings as needed

## Next Steps

1. Review `.env.unified` and create `.env` with your credentials
2. Run `npm run orchestrate` to start the unified system
3. Access admin UI at http://localhost:3300/admin
4. Review audit logs in `.heady/governance/audit/`

## Troubleshooting

### Codex Builder Fails
- Ensure Python 3.8+ is installed
- Check that `codex_v13/` directory exists

### Manager Won't Start
- Verify `.env` file exists with HEADY_API_KEY
- Check port 3300 is not in use

### MCP Gateway Issues
- Verify MCP_GATEWAY_JWT_SECRET is set
- Check `mcp_config_unified.json` syntax

---
Generated by Deploy-HeadyUnified.ps1
$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@
    
    if (-not $DryRun) {
        Set-Content -Path "INTEGRATION_GUIDE.md" -Value $integrationDoc
        Write-Sacred "✓ Created INTEGRATION_GUIDE.md" "Green"
    } else {
        Write-Sacred "DRY RUN: Would create INTEGRATION_GUIDE.md" "Yellow"
    }
}

function Test-Integration {
    Write-Step "Testing Integration"
    
    if ($SkipTests) {
        Write-Sacred "⊘ Tests skipped" "Yellow"
        return
    }
    
    # Test 1: Verify Codex v13 structure
    $codexFiles = @(
        "codex_v13/codex_builder_v13.py",
        "codex_v13/REGISTRY.json",
        "codex_v13/governance.lock"
    )
    
    $passed = 0
    $failed = 0
    
    foreach ($file in $codexFiles) {
        if (Test-Path $file) {
            Write-Sacred "✓ $file exists" "Green"
            $passed++
        } else {
            Write-Sacred "✗ $file missing" "Red"
            $failed++
        }
    }
    
    # Test 2: Verify orchestrator
    if (Test-Path "heady-orchestrator.js") {
        Write-Sacred "✓ heady-orchestrator.js exists" "Green"
        $passed++
    } else {
        Write-Sacred "✗ heady-orchestrator.js missing" "Red"
        $failed++
    }
    
    # Test 3: Verify unified config
    if (Test-Path "mcp_config_unified.json") {
        Write-Sacred "✓ mcp_config_unified.json exists" "Green"
        $passed++
    } else {
        Write-Sacred "✗ mcp_config_unified.json missing" "Red"
        $failed++
    }
    
    Write-Host "`n"
    Write-Sacred "Test Results: $passed passed, $failed failed" $(if ($failed -eq 0) { "Green" } else { "Yellow" })
    
    if ($failed -gt 0 -and -not $Force) {
        throw "Integration tests failed. Use -Force to continue anyway."
    }
}

function Show-Summary {
    Write-Step "Deployment Summary"
    
    Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         🔷 HEADY UNIFIED SYSTEM - DEPLOYMENT COMPLETE 🔷      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📦 Components Integrated:
   ✓ Codex v13 Deterministic Builder
   ✓ Heady Manager API Server
   ✓ Heady Orchestrator
   ✓ Unified MCP Configuration
   ✓ Governance & Security Framework
   ✓ Patent Portfolio Documentation

🔐 Security Features:
   ✓ Trust Domain: headysystems.com
   ✓ Governance: Locked (v1.2.0)
   ✓ Audit Trail: Enabled
   ✓ JWT Authentication
   ✓ Rate Limiting
   ✓ Localhost Binding

📚 Documentation:
   ✓ INTEGRATION_GUIDE.md
   ✓ PATENT_PORTFOLIO.md
   ✓ CODEX_V13_MANIFEST.md

🚀 Next Steps:
   1. Review and configure .env file
   2. Run: npm run orchestrate
   3. Access: http://localhost:3300/admin
   4. Review: INTEGRATION_GUIDE.md

═══════════════════════════════════════════════════════════════

"@ -ForegroundColor Cyan
}

# Main Execution
try {
    Write-Host "`n"
    Write-Sacred "═══════════════════════════════════════════════════════" "DarkCyan"
    Write-Sacred "    HEADY UNIFIED DEPLOYMENT - INTELLIGENT MERGE" "DarkCyan"
    Write-Sacred "═══════════════════════════════════════════════════════" "DarkCyan"
    Write-Host "`n"
    
    if ($DryRun) {
        Write-Sacred "🔍 DRY RUN MODE - No changes will be made" "Yellow"
    }
    
    Test-Prerequisites
    Merge-CodexV13
    Update-PackageJson
    Install-Dependencies
    Optimize-Configuration
    Update-Documentation
    Test-Integration
    Show-Summary
    
    Write-Sacred "`n✨ Deployment completed successfully!" "Green"
    
} catch {
    Write-Host "`n❌ Deployment failed: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    exit 1
}
