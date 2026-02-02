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
# 2. NODE.JS BUILD (Manager)
# ------------------------------------------------------------------------------
# Validates 'buildCommand: npm install' from render.yaml
Write-Host "`n[2/3] Building Node.js Manager..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    try {
        npm install
        Write-Host "✓ Node dependencies installed." -ForegroundColor Green
    } catch {
        Write-Host "X Node build failed." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "! package.json not found. Skipping Node build." -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# 3. PYTHON BUILD (Worker)
# ------------------------------------------------------------------------------
# Validates 'buildCommand: pip install -r requirements.txt' from render.yaml
Write-Host "`n[3/3] Building Python Worker..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    try {
        pip install -r requirements.txt
        Write-Host "✓ Python dependencies installed." -ForegroundColor Green
    } catch {
        Write-Host "X Python build failed." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "! requirements.txt not found. Generating default..." -ForegroundColor DarkGray
    Set-Content "requirements.txt" "psycopg2-binary`nrequests`n"
    Write-Host "✓ Created default requirements.txt." -ForegroundColor Green
}

Write-Host "`n∞ CYCLE COMPLETE. READY FOR PUSH. ∞" -ForegroundColor Cyan
Write-Host "To push to remotes, run: .\nexus_deploy.ps1"
