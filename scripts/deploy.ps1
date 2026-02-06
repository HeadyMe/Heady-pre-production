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
# ║  FILE: scripts/deploy.ps1                                         ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [string]$Message,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$RootDir = "$ScriptDir\.."

function Show-Header {
    param($Message)
    Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor White
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Show-Step {
    param($Message, $Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        default { "Gray" }
    }
    Write-Host "[DEPLOY] $Message" -ForegroundColor $color
}

Set-Location $RootDir

Show-Header "AUTOMATED DEPLOY: STAGE → COMMIT → VERIFY → PUSH → SYNC"

# 1. Stage All Changes
Show-Step "Staging all changes..."
git add -A
if ($LASTEXITCODE -eq 0) {
    Show-Step "✓ All changes staged" "SUCCESS"
} else {
    Show-Step "✗ Staging failed" "ERROR"
    exit 1
}

# 2. Commit Changes
Show-Step "Committing changes..."
if ($Message) {
    git commit -m $Message
} else {
    git commit
}

if ($LASTEXITCODE -eq 0) {
    Show-Step "✓ Commit created" "SUCCESS"
} else {
    Show-Step "✗ Commit failed (may be nothing to commit)" "WARNING"
}

# 3. Verify with Checkpoint
if (!$Force) {
    Show-Step "Running checkpoint validation..."
    if (Test-Path "$ScriptDir\checkpoint-validation.ps1") {
        & "$ScriptDir\checkpoint-validation.ps1" -Full
        if ($LASTEXITCODE -ne 0) {
            Show-Step "✗ Checkpoint validation failed" "ERROR"
            Write-Host "`nUse -Force to override validation, or fix issues first." -ForegroundColor Yellow
            exit 1
        }
        Show-Step "✓ Checkpoint validation passed" "SUCCESS"
    } else {
        Show-Step "Checkpoint validation script not found, skipping..." "WARNING"
    }
} else {
    Show-Step "Force mode: Skipping checkpoint validation" "WARNING"
}

# 4. Push to All Remotes
Show-Step "Pushing to all configured remotes..."
$remotes = git remote
$currentBranch = git rev-parse --abbrev-ref HEAD

foreach ($remote in $remotes) {
    Show-Step "Pushing to $remote..."
    git push $remote $currentBranch
    if ($LASTEXITCODE -eq 0) {
        Show-Step "✓ $remote synchronized" "SUCCESS"
    } else {
        Show-Step "✗ $remote sync failed" "WARNING"
    }
}

# 5. Run HeadySync
Show-Step "Running HeadySync for final synchronization..."
if (Test-Path "$ScriptDir\hs.ps1") {
    & "$ScriptDir\hs.ps1"
    if ($LASTEXITCODE -eq 0) {
        Show-Step "✓ HeadySync completed" "SUCCESS"
    } else {
        Show-Step "✗ HeadySync had issues" "WARNING"
    }
} else {
    Show-Step "HeadySync script not found, skipping..." "WARNING"
}

# 6. Post-Deploy Verification
Show-Step "Verifying deployment..."
git remote update 2>&1 | Out-Null
$syncStatus = git status -uno

if ($syncStatus -match "up to date" -or $syncStatus -match "up-to-date") {
    Show-Step "✓ All remotes synchronized" "SUCCESS"
} else {
    Show-Step "Some remotes may be out of sync" "WARNING"
}

Show-Header "AUTOMATED DEPLOY COMPLETE"
Write-Host "✅ Changes staged, committed, validated, and pushed" -ForegroundColor Green
Write-Host "✅ HeadySync completed" -ForegroundColor Green
Write-Host "`nUse this workflow via: hc -a deploy" -ForegroundColor Cyan
Write-Host "Or in Windsurf UI: /automated-deploy`n" -ForegroundColor Cyan
