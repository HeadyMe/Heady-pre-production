param(
    [string]$Branch = "main",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

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
    Write-Host "[HS] $Message" -ForegroundColor $color
}

Show-Header "HEADYSYNC: UNIFIED SYNCHRONIZATION PROTOCOL"

# 1. Verify Base Layer Components
Show-Step "Verifying base layer components (HeadyBuddy + HeadyLens)..."

# Check if orchestrator is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3300/status" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    Show-Step "Orchestrator online" "SUCCESS"
} catch {
    Show-Step "Orchestrator not responding - attempting to start..." "WARNING"
    Start-Process -FilePath "node" -ArgumentList "heady-manager.js" -WorkingDirectory "$PSScriptRoot\.." -NoNewWindow
    Start-Sleep -Seconds 3
}

# 2. Repository Status Check
Show-Step "Checking repository status..."
$gitStatus = git status --porcelain
if ($gitStatus) {
    Show-Step "Working directory has changes:" "WARNING"
    git status --short
    
    if (-not $Force) {
        $response = Read-Host "Commit changes before sync? (y/n)"
        if ($response -eq 'y') {
            $commitMsg = Read-Host "Enter commit message"
            git add .
            git commit -m $commitMsg
            Show-Step "Changes committed" "SUCCESS"
        }
    } else {
        Show-Step "Force mode: committing all changes..." "WARNING"
        git add .
        git commit -m "HeadySync: Automated commit - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
}

# 3. Fetch All Remotes
Show-Step "Fetching updates from all remotes..."
git fetch --all --prune
if ($LASTEXITCODE -eq 0) {
    Show-Step "Remote fetch completed" "SUCCESS"
} else {
    Show-Step "Remote fetch had issues" "WARNING"
}

# 4. Push to All Remotes
Show-Step "Synchronizing to all configured remotes..."
$remotes = @("heady-me", "heady-sys", "origin")

foreach ($remote in $remotes) {
    Show-Step "Pushing to $remote..."
    
    if ($Force) {
        git push $remote $Branch --force-with-lease
    } else {
        git push $remote $Branch
    }
    
    if ($LASTEXITCODE -eq 0) {
        Show-Step "✓ $remote synchronized" "SUCCESS"
    } else {
        Show-Step "✗ $remote sync failed (exit code: $LASTEXITCODE)" "ERROR"
    }
}

# 5. Verify Sync Status
Show-Step "Verifying synchronization status..."
git remote update 2>&1 | Out-Null
$syncStatus = git status -uno

if ($syncStatus -match "up to date" -or $syncStatus -match "up-to-date") {
    Show-Step "All remotes synchronized successfully" "SUCCESS"
} else {
    Show-Step "Some remotes may be out of sync" "WARNING"
    git status -uno
}

# 6. Post-Sync Health Check
Show-Step "Running post-sync health checks..."
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3300/status" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($healthCheck.StatusCode -eq 200) {
        Show-Step "System health check passed" "SUCCESS"
    } else {
        Show-Step "System health check returned status: $($healthCheck.StatusCode)" "WARNING"
    }
} catch {
    Show-Step "System health check failed - verify services manually" "WARNING"
}

Show-Header "HEADYSYNC COMPLETE"
Write-Host "All configured remotes have been synchronized to branch: $Branch" -ForegroundColor Green
Write-Host "Base layer components: HeadyBuddy + HeadyLens" -ForegroundColor Gray
Write-Host "Orchestrator status: http://localhost:3300/status" -ForegroundColor Gray
