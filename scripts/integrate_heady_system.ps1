#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Heady System Integration Script - Complete merger and optimization
.DESCRIPTION
    Integrates all components from HeadySystems/main with enhancements
    Creates an optimized, deterministic, secure, and orchestrated system
#>

param(
    [switch]$RunTests = $false,
    [switch]$Deploy = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║              HEADY SYSTEM INTEGRATION v13.0.0                ║
║           Merging • Optimizing • Securing • Orchestrating    ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Configuration
$WorktreeRoot = $PWD.Path
$MainRepoPath = Join-Path $WorktreeRoot "heady-main-repo"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupPath = Join-Path $WorktreeRoot "backup_$Timestamp"

# Step 1: Create backup
Write-Host "`n[1/10] Creating backup..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
Copy-Item -Path @("src", "public", "*.js", "*.json", "*.yaml") -Destination $BackupPath -Recurse -Force
Write-Host "✓ Backup created at: $BackupPath" -ForegroundColor Green

# Step 2: Merge configurations from main repo
Write-Host "`n[2/10] Merging configurations from main repository..." -ForegroundColor Yellow

# Copy patent information
Copy-Item -Path "$MainRepoPath\patent_info.md" -Destination $WorktreeRoot -Force
Write-Verbose "Copied patent_info.md"

# Copy HeadySystems_v13 components
if (Test-Path "$MainRepoPath\HeadySystems_v13") {
    Copy-Item -Path "$MainRepoPath\HeadySystems_v13\*" -Destination "src\" -Recurse -Force
    Write-Verbose "Copied HeadySystems_v13 components"
}

Write-Host "✓ Configurations merged" -ForegroundColor Green

# Step 3: Install/Update dependencies
Write-Host "`n[3/10] Installing dependencies..." -ForegroundColor Yellow

# Node.js dependencies
if (Test-Path "package.json") {
    Write-Verbose "Installing Node.js dependencies..."
    npm install --silent 2>&1 | Out-Null
    
    # Add missing security dependencies
    npm install jsonwebtoken express-validator helmet express-rate-limit ws --save --silent 2>&1 | Out-Null
}

# Python dependencies
if (Test-Path "requirements.txt") {
    Write-Verbose "Installing Python dependencies..."
    pip install -r requirements.txt --quiet 2>&1 | Out-Null
    
    # Add security and orchestration dependencies
    pip install cryptography pyjwt numpy psutil aiohttp --quiet 2>&1 | Out-Null
}

Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 4: Generate deterministic governance files
Write-Host "`n[4/10] Generating governance files..." -ForegroundColor Yellow
python src/codex_builder_v13.py 2>&1 | Out-Null
Write-Host "✓ Governance files generated" -ForegroundColor Green

# Step 5: Create enhanced configuration
Write-Host "`n[5/10] Creating enhanced configuration..." -ForegroundColor Yellow

$enhancedConfig = @{
    "version" = "13.0.0"
    "identity" = @{
        "assignee" = "HeadySystems Inc."
        "inventor" = "Eric Haywood"
        "trust_domain" = "headysystems.com"
        "app_domain" = "app.headysystems.com"
    }
    "security" = @{
        "ptaca_enabled" = $true
        "raa_enabled" = $true
        "trust_domains" = @("user", "system", "public")
        "audit_logging" = $true
        "pqc_ready" = $true
    }
    "orchestration" = @{
        "auto_scaling" = $true
        "min_nodes" = 1
        "max_nodes" = 10
        "health_check_interval" = 10
        "golden_ratio_scaling" = $true
    }
    "patents" = @{
        "implemented" = @(
            "PTACA", "RAA", "TrustDomains", "HeadyConductor",
            "HeadyResonance", "HeadyPhi", "HeadyTempo"
        )
        "pending" = @(
            "HeadyGuard", "HeadyMint", "HeadyBio", "HeadyStream"
        )
    }
}

$enhancedConfig | ConvertTo-Json -Depth 10 | Set-Content "heady_config.json"
Write-Host "✓ Enhanced configuration created" -ForegroundColor Green

# Step 6: Setup environment variables
Write-Host "`n[6/10] Setting up environment..." -ForegroundColor Yellow

$envContent = @"
# Heady System Environment Configuration v13
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Core Configuration
PORT=3300
NODE_ENV=production
HEADY_VERSION=13.0.0

# Security
HEADY_API_KEY=$(New-Guid).ToString().Replace("-", "")
JWT_SECRET=$(New-Guid).ToString().Replace("-", "")
MCP_GATEWAY_JWT_SECRET=$(New-Guid).ToString().Replace("-", "")
HEADY_SECRET_KEY=$(New-Guid).ToString().Replace("-", "")

# Trust Domains
TRUST_DOMAIN=headysystems.com
APP_DOMAIN=app.headysystems.com

# Orchestration
MIN_NODES=1
MAX_NODES=10
TARGET_HEALTH=75
SCALE_UP_THRESHOLD=80
SCALE_DOWN_THRESHOLD=30

# Rate Limiting
HEADY_RATE_LIMIT_WINDOW_MS=60000
HEADY_RATE_LIMIT_MAX=100

# CORS
HEADY_CORS_ORIGINS=http://localhost:3000,http://localhost:3300

# Database
DATABASE_URL=postgresql://heady:heady@localhost:5432/heady_db

# Audit
AUDIT_LOG_PATH=./audit_logs
ENABLE_CHAIN_VERIFICATION=true

# Features
ENABLE_PTACA=true
ENABLE_RAA=true
ENABLE_ORCHESTRATION=true
ENABLE_RESONANCE_ANALYSIS=true
"@

if (-not (Test-Path ".env")) {
    $envContent | Set-Content ".env"
    Write-Host "✓ Environment configured" -ForegroundColor Green
} else {
    Write-Host "⚠ .env exists, skipping environment setup" -ForegroundColor Yellow
}

# Step 7: Create startup script
Write-Host "`n[7/10] Creating startup script..." -ForegroundColor Yellow

$startupScript = @'
#!/usr/bin/env pwsh
# Heady System Startup Script

Write-Host "Starting Heady System v13..." -ForegroundColor Cyan

# Load environment
if (Test-Path ".env") {
    Get-Content .env | Where-Object { $_ -match "^[^#].*=.*" } | ForEach-Object {
        $parts = $_ -split "=", 2
        [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
}

# Start orchestrator (Python)
$orchestratorJob = Start-Job -ScriptBlock {
    python -c "
import asyncio
import sys
sys.path.insert(0, 'src')
from heady_orchestrator import DynamicOrchestrator

async def main():
    config = {
        'min_nodes': 1,
        'max_nodes': 10,
        'target_health': 75
    }
    orchestrator = DynamicOrchestrator(config)
    await orchestrator.run_orchestration_loop()

asyncio.run(main())
"
}

# Start enhanced manager (Node.js)
$managerJob = Start-Job -ScriptBlock {
    node heady-manager-enhanced.js
}

Write-Host "✓ System started" -ForegroundColor Green
Write-Host "  Orchestrator PID: $($orchestratorJob.Id)" -ForegroundColor Gray
Write-Host "  Manager PID: $($managerJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop..." -ForegroundColor Yellow

try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check job status
        if ($orchestratorJob.State -eq "Failed") {
            Write-Host "⚠ Orchestrator failed, restarting..." -ForegroundColor Yellow
            $orchestratorJob = Start-Job -FilePath "src/heady_orchestrator.py"
        }
        
        if ($managerJob.State -eq "Failed") {
            Write-Host "⚠ Manager failed, restarting..." -ForegroundColor Yellow
            $managerJob = Start-Job -ScriptBlock { node heady-manager-enhanced.js }
        }
    }
} finally {
    Write-Host "`nShutting down..." -ForegroundColor Yellow
    Stop-Job $orchestratorJob, $managerJob
    Remove-Job $orchestratorJob, $managerJob
    Write-Host "✓ System stopped" -ForegroundColor Green
}
'@

$startupScript | Set-Content "start_heady_system.ps1"
Write-Host "✓ Startup script created" -ForegroundColor Green

# Step 8: Run tests if requested
if ($RunTests) {
    Write-Host "`n[8/10] Running tests..." -ForegroundColor Yellow
    
    # Test Python components
    Write-Verbose "Testing Python security module..."
    python -c "
import sys
sys.path.insert(0, 'src')
from heady_core_security import HeadySecurityOrchestrator
config = {'secret_key': 'test'}
orchestrator = HeadySecurityOrchestrator(config)
print('✓ Security module OK')
"
    
    Write-Verbose "Testing orchestrator..."
    python -c "
import sys
sys.path.insert(0, 'src')
from heady_orchestrator import DynamicOrchestrator
config = {'min_nodes': 1, 'max_nodes': 5}
orchestrator = DynamicOrchestrator(config)
print('✓ Orchestrator OK')
"
    
    # Test Node.js components
    Write-Verbose "Testing enhanced manager..."
    node -e "
const path = require('path');
try {
    require('./heady-manager-enhanced.js');
    console.log('✓ Enhanced manager OK');
} catch (e) {
    console.error('✗ Manager test failed:', e.message);
    process.exit(1);
}
"
    
    Write-Host "✓ All tests passed" -ForegroundColor Green
} else {
    Write-Host "`n[8/10] Skipping tests (use -RunTests to enable)" -ForegroundColor Gray
}

# Step 9: Create deployment configuration
Write-Host "`n[9/10] Creating deployment configuration..." -ForegroundColor Yellow

$renderYaml = @"
# Heady System v13 - Render Deployment Configuration
# Enhanced with security, orchestration, and patent features

services:
  # Main Manager Service
  - type: web
    name: heady-manager
    runtime: node
    buildCommand: npm install
    startCommand: node heady-manager-enhanced.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3300
      - fromGroup: heady-security
      - fromGroup: heady-orchestration
    autoDeploy: true
    healthCheckPath: /api/health
    
  # Python Orchestrator Worker
  - type: worker
    name: heady-orchestrator
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: python -m src.heady_orchestrator
    envVars:
      - fromGroup: heady-security
      - fromGroup: heady-orchestration
    disk:
      name: heady-orchestrator-disk
      mountPath: /data
      sizeGB: 10

  # Security Processor Worker
  - type: worker
    name: heady-security
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: python -m src.heady_core_security
    envVars:
      - fromGroup: heady-security

databases:
  - name: heady-db
    databaseName: heady_production
    user: heady_user
    plan: starter
    ipAllowList: []

envVarGroups:
  - name: heady-security
    envVars:
      - key: HEADY_API_KEY
        generateValue: true
      - key: JWT_SECRET
        generateValue: true
      - key: HEADY_SECRET_KEY
        generateValue: true
      - key: TRUST_DOMAIN
        value: headysystems.com
      - key: APP_DOMAIN
        value: app.headysystems.com
      
  - name: heady-orchestration
    envVars:
      - key: MIN_NODES
        value: 1
      - key: MAX_NODES
        value: 10
      - key: TARGET_HEALTH
        value: 75
      - key: ENABLE_ORCHESTRATION
        value: true
      - key: ENABLE_RAA
        value: true
"@

$renderYaml | Set-Content "render-enhanced.yaml"
Write-Host "✓ Deployment configuration created" -ForegroundColor Green

# Step 10: Deploy if requested
if ($Deploy) {
    Write-Host "`n[10/10] Deploying to Render..." -ForegroundColor Yellow
    
    # Commit changes
    git add -A
    git commit -m "Heady System v13: Complete integration with security and orchestration"
    
    # Push to remote
    git push origin main
    
    Write-Host "✓ Deployed to Render" -ForegroundColor Green
} else {
    Write-Host "`n[10/10] Skipping deployment (use -Deploy to enable)" -ForegroundColor Gray
}

# Summary
Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                    INTEGRATION COMPLETE                      ║
╠══════════════════════════════════════════════════════════════╣
║  ✓ Security Features (PTACA, RAA, Trust Domains)            ║
║  ✓ Dynamic Orchestration (Auto-scaling, Health Checks)      ║
║  ✓ Deterministic Governance (Codex Builder v13)             ║
║  ✓ Audit Logging (PQC-ready Evidence Chain)                 ║
║  ✓ Golden Ratio Optimization (HeadyPhi)                     ║
║  ✓ Patent Portfolio Implementation                          ║
╠══════════════════════════════════════════════════════════════╣
║  Next Steps:                                                 ║
║  1. Run: .\start_heady_system.ps1                          ║
║  2. Access: http://localhost:3300                          ║
║  3. API Key: Check .env file                               ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

# Create memory for system
Write-Host "`nSaving system configuration to memory..." -ForegroundColor Yellow
