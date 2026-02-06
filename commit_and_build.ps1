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
# ║  FILE: commit_and_build.ps1                                       ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# HEADY COMMIT & BUILD PROTOCOL
$ErrorActionPreference = "Stop"

Write-Host "∞ INITIATING LOCAL BUILD & COMMIT CYCLE ∞" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. GIT COMMIT PROTOCOL
# ------------------------------------------------------------------------------
Write-Host "`n[1/3] Staging and Committing..." -ForegroundColor Yellow
git add .
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
try {
    git commit -m "Heady Build Update: $timestamp"
    Write-Host "✓ Changes committed." -ForegroundColor Green
} catch {
    Write-Host "O Nothing to commit (working tree clean)." -ForegroundColor Gray
}

# ------------------------------------------------------------------------------
# 2. MONOREPO BUILD (Manager & Frontend)
# ------------------------------------------------------------------------------
Write-Host "`n[2/3] Building Heady Monorepo..." -ForegroundColor Yellow
try {
    npm install
    npm run build --prefix frontend
    Write-Host "✓ Monorepo dependencies installed and frontend built." -ForegroundColor Green
} catch {
    Write-Host "X Monorepo build failed." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# 3. PYTHON BUILD (Worker)
# ------------------------------------------------------------------------------
Write-Host "`n[3/3] Building Python Worker..." -ForegroundColor Yellow
$workerReqs = "backend/python_worker/requirements.txt"
if (Test-Path $workerReqs) {
    try {
        pip install -r $workerReqs
        Write-Host "✓ Python dependencies installed." -ForegroundColor Green
    } catch {
        Write-Host "X Python build failed." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "! $workerReqs not found." -ForegroundColor DarkGray
}

Write-Host "`n∞ CYCLE COMPLETE. READY FOR PUSH. ∞" -ForegroundColor Cyan
Write-Host "To push to remotes, run: .\nexus_deploy.ps1"
