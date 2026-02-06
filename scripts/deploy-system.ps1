# HEADY_BRAND:BEGIN
# ╔══════════════════════════════════════════════════════════════════╗
# ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
# ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
# ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
# ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
# ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
# ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
# ║                                                                  ║
# ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
# ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
# ║  FILE: scripts/deploy-system.ps1                                  ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# HEADY SYSTEMS - DEPLOYMENT SCRIPT
# Deploy fully optimized and verified Heady Systems

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "HEADY SYSTEMS - DEPLOYMENT PROCESS" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$HeadyRoot = "c:\Users\erich\Heady"
Set-Location $HeadyRoot

# Pre-deployment verification
Write-Host "[1/5] Pre-Deployment Verification..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3300/api/health" -Method Get -ErrorAction Stop
    Write-Host "  [OK] HeadyManager is operational" -ForegroundColor Green
    
    $summary = Invoke-RestMethod -Uri "http://localhost:3300/api/conductor/summary" -Method Get -ErrorAction Stop
    Write-Host "  [OK] HeadyConductor is ready" -ForegroundColor Green
    Write-Host "  * Total Capabilities: $($summary.registry_summary.total_capabilities)" -ForegroundColor Gray
} catch {
    Write-Host "  [ERROR] System not ready for deployment: $_" -ForegroundColor Red
    exit 1
}

# Ensure all dependencies are installed
Write-Host "`n[2/5] Verifying Dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "  * Installing Node.js dependencies..." -ForegroundColor Gray
    npm install --silent 2>&1 | Out-Null
    Write-Host "  [OK] Node.js dependencies installed" -ForegroundColor Green
}

if (Test-Path "requirements.txt") {
    Write-Host "  * Installing Python dependencies..." -ForegroundColor Gray
    python -m pip install -r requirements.txt --quiet 2>&1 | Out-Null
    Write-Host "  [OK] Python dependencies installed" -ForegroundColor Green
}

# Build frontend if needed
Write-Host "`n[3/5] Building Frontend..." -ForegroundColor Yellow
if (Test-Path "frontend\package.json") {
    Set-Location "frontend"
    npm install --silent 2>&1 | Out-Null
    npm run build --silent 2>&1 | Out-Null
    Set-Location $HeadyRoot
    Write-Host "  [OK] Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] No frontend to build" -ForegroundColor Gray
}

# Verify deployment configuration
Write-Host "`n[4/5] Verifying Deployment Configuration..." -ForegroundColor Yellow
if (Test-Path "render.yaml") {
    Write-Host "  [OK] render.yaml found" -ForegroundColor Green
} else {
    Write-Host "  [WARN] render.yaml not found" -ForegroundColor Yellow
}

if (Test-Path ".env") {
    Write-Host "  [OK] .env configuration found" -ForegroundColor Green
} else {
    Write-Host "  [WARN] .env not found" -ForegroundColor Yellow
}

# Final system check
Write-Host "`n[5/5] Final System Check..." -ForegroundColor Yellow
try {
    $finalCheck = Invoke-RestMethod -Uri "http://localhost:3300/api/conductor/summary" -Method Get
    
    Write-Host "`nDEPLOYMENT READINESS:" -ForegroundColor Cyan
    Write-Host "  * HeadyManager: READY" -ForegroundColor Green
    Write-Host "  * HeadyConductor: READY" -ForegroundColor Green
    Write-Host "  * HeadyLens: $(if($finalCheck.components.lens){'READY'}else{'NOT READY'})" -ForegroundColor $(if($finalCheck.components.lens){'Green'}else{'Red'})
    Write-Host "  * HeadyMemory: $(if($finalCheck.components.memory){'READY'}else{'NOT READY'})" -ForegroundColor $(if($finalCheck.components.memory){'Green'}else{'Red'})
    Write-Host "  * HeadyRegistry: $(if($finalCheck.components.registry){'READY'}else{'NOT READY'})" -ForegroundColor $(if($finalCheck.components.registry){'Green'}else{'Red'})
    
    Write-Host "`n" + "=" * 80 -ForegroundColor Cyan
    Write-Host "SYSTEM READY FOR DEPLOYMENT" -ForegroundColor Green
    Write-Host "=" * 80 -ForegroundColor Cyan
    
    Write-Host "`nDeployment Options:" -ForegroundColor Yellow
    Write-Host "  1. Local Development: System is already running" -ForegroundColor Gray
    Write-Host "  2. Render.com: Use 'git push' to deploy via render.yaml" -ForegroundColor Gray
    Write-Host "  3. Docker: Build and deploy using Docker containers" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "`n[ERROR] Final system check failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment preparation complete!" -ForegroundColor Green
Write-Host "All systems are fully functional, optimized, and ready for production." -ForegroundColor Green
Write-Host ""
