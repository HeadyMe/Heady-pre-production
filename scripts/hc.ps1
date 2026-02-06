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
# ║  FILE: scripts/hc.ps1                                             ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [Alias("a")]
    [string]$Action,
    [switch]$Restart,
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
    param($Message)
    Write-Host "`n[HC] $Message" -ForegroundColor Yellow
}

Set-Location $RootDir

# 0. CUSTOM ACTION HANDLER
if ($Action) {
    Show-Header "HEADY CONTROL: EXECUTING ACTION '$Action'"
    
    # Special handling for hc_autobuild
    if ($Action -eq "hc_autobuild" -or $Action -eq "autobuild") {
        Show-Step "Running HeadyAutoBuild..."
        if (Test-Path "$ScriptDir\..\src\hc_autobuild.js") {
            node "$ScriptDir\..\src\hc_autobuild.js"
            exit $LASTEXITCODE
        } else {
            Write-Error "hc_autobuild.js not found"
            exit 1
        }
    }
    
    # Special handling for deploy
    if ($Action -eq "deploy") {
        Show-Step "Running Automated Deploy..."
        if (Test-Path "$ScriptDir\deploy.ps1") {
            $deployArgs = @()
            if ($args) { $deployArgs = $args }
            & "$ScriptDir\deploy.ps1" @deployArgs
            exit $LASTEXITCODE
        } else {
            Write-Error "deploy.ps1 not found"
            exit 1
        }
    }
    
    # Resolve target path
    $Target = "$ScriptDir\$Action"
    if (-not (Test-Path $Target)) {
        # Try checking if it's just a file in current dir or absolute path
        if (Test-Path $Action) {
            $Target = $Action
        }
    }
    
    if (Test-Path $Target) {
        Show-Step "Running script: $Target"
        if ($Target -match "\.js$") {
            node $Target
        } elseif ($Target -match "\.ps1$") {
            & $Target
        } else {
            # Fallback for other files
            Invoke-Item $Target
        }
    } else {
        # Try as a raw command or alias if file not found
        Show-Step "Executing command: $Action"
        try {
            Invoke-Expression $Action
        } catch {
            Write-Error "Action failed: $_"
            exit 1
        }
    }
    
    exit $LASTEXITCODE
}

# 1. PAUSE (Stop Services)
Show-Header "HEADY CONTROL: INITIATING MAINTENANCE CYCLE"
Show-Step "Pausing System (Stopping Services)..."
if (Test-Path "$ScriptDir\stop-heady-system.ps1") {
    & "$ScriptDir\stop-heady-system.ps1"
} else {
    Write-Warning "stop-heady-system.ps1 not found."
}

# 2. INTELLIGENT CATCH (Fetch & Update Knowledge)
Show-Step "Catching up (Fetching all remotes & Pruning worktrees)..."
git fetch --all --prune
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Failed to fetch remotes (Exit Code: $LASTEXITCODE). Proceeding locally."
    $LASTEXITCODE = 0 # Reset
}
# Prune stale worktree entries (safe cleanup)
git worktree prune


# 3. FIX ERRORS (Linting & Auto-correction)
Show-Step "Fixing Errors & standardizing code..."
if (Test-Path "package.json") {
    Write-Host "Running ESLint Auto-Fix..." -ForegroundColor Gray
    # Run in cmd /c to ensure npm is found and execution doesn't abort script on lint errors
    cmd /c "npm run lint -- --fix"
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Linting found issues that could not be auto-fixed, or exited with error."
        $LASTEXITCODE = 0 # Reset to allow script to continue
    }
}

# 4. MAKE IMPROVEMENTS (Optimization)
Show-Step "Making Improvements (Optimization)..."
if (Test-Path "$ScriptDir\optimize_repos.ps1") {
    & "$ScriptDir\optimize_repos.ps1"
}

# 5. FINAL SYNC (Squash & Push)
Show-Step "Finalizing Synchronization..."
if (Test-Path "$ScriptDir\Heady-Sync.ps1") {
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ($LASTEXITCODE -eq 0 -and !([string]::IsNullOrWhiteSpace($currentBranch))) {
        Write-Host "Detected active branch: $currentBranch" -ForegroundColor DarkGray
    } else {
        $currentBranch = "main"
        Write-Warning "Could not detect branch, defaulting to 'main'."
    }

    # Call Heady-Sync with proper parameters
    if ($Force) {
        & "$ScriptDir\Heady-Sync.ps1" -Force
    } else {
        & "$ScriptDir\Heady-Sync.ps1"
    }
}

# 6. RESTART (Optional)
if ($Restart) {
    Show-Step "Restarting System..."
    if (Test-Path "$ScriptDir\start-heady-system.ps1") {
        & "$ScriptDir\start-heady-system.ps1"
    }
} else {
    Show-Header "CYCLE COMPLETE. SYSTEM PAUSED."
    Write-Host "Run 'hc -Restart' next time to auto-resume, or run '.\scripts\start-heady-system.ps1' to start." -ForegroundColor Gray
}
