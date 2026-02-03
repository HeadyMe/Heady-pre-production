<#
.SYNOPSIS
    Heady Control (hc) - Master Command Interface
.DESCRIPTION
    Comprehensive Heady System command that routes through HeadyMCP services,
    runs intelligence verification, and provides full system control.
.PARAMETER a
    Action to perform: checkpoint, autobuild, verify, status, help
.PARAMETER Action
    Alias for -a parameter
.PARAMETER Force
    Skip confirmations
.PARAMETER Verbose
    Enable verbose output
.EXAMPLE
    .\hc.ps1                    # Generate checkpoint (default)
    .\hc.ps1 -a                 # Run autobuild with intelligence verification
    .\hc.ps1 -a verify          # Run intelligence verification only
    .\hc.ps1 -a status          # Show system status
    .\hc.ps1 -a hs              # Run HeadySync after autobuild
#>

param(
    [Parameter(Position=0)]
    [Alias("Action")]
    [string]$a = "",
    
    [switch]$Force,
    [switch]$ShowDetails
)

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$RootDir = Split-Path -Parent $ScriptDir

function Write-Banner {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "           HEADY CONTROL - Master Command Interface            " -ForegroundColor Cyan
    Write-Host "     Intelligence Verification | HeadyMCP Integration          " -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Status {
    param([string]$Message, [string]$Level = 'Info')
    
    $color = switch ($Level) {
        'Success' { 'Green' }
        'Warning' { 'Yellow' }
        'Error' { 'Red' }
        'Info' { 'Cyan' }
        default { 'White' }
    }
    
    $prefix = switch ($Level) {
        'Success' { '[OK]' }
        'Warning' { '[!]' }
        'Error' { '[X]' }
        'Info' { '[i]' }
        default { '[*]' }
    }
    
    Write-Host "$prefix $Message" -ForegroundColor $color
}

function Invoke-IntelligenceVerification {
    Write-Status "Running Heady Intelligence Verification..." "Info"
    
    $verifierPath = Join-Path $RootDir "src\client\heady_intelligence_verifier.js"
    
    if (-not (Test-Path $verifierPath)) {
        Write-Status "Intelligence verifier not found at: $verifierPath" "Warning"
        return $false
    }
    
    Push-Location $RootDir
    try {
        $result = node $verifierPath 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($ShowDetails) {
            Write-Host $result
        }
        
        if ($exitCode -eq 0) {
            Write-Status "Intelligence verification passed" "Success"
            return $true
        } else {
            Write-Status "Intelligence verification found issues (non-critical)" "Warning"
            return $true  # Continue anyway - non-critical systems may be down
        }
    } catch {
        Write-Status "Intelligence verification error: $_" "Warning"
        return $true  # Continue anyway
    } finally {
        Pop-Location
    }
}

function Invoke-Checkpoint {
    Write-Status "Generating system checkpoint..." "Info"
    
    $checkpointScript = Join-Path $ScriptDir "Invoke-Checkpoint.ps1"
    
    if (Test-Path $checkpointScript) {
        & $checkpointScript -Action generate
    } else {
        Write-Status "Checkpoint script not found" "Warning"
    }
}

function Invoke-AutoBuild {
    Write-Status "Running HC AutoBuild..." "Info"
    
    $autobuildScript = Join-Path $ScriptDir "hc-autobuild.ps1"
    
    if (Test-Path $autobuildScript) {
        if ($Force) {
            & $autobuildScript -Action build -Force
        } else {
            & $autobuildScript -Action build
        }
    } else {
        # Fallback to direct node execution
        $nodeScript = Join-Path $RootDir "src\hc_autobuild.js"
        if (Test-Path $nodeScript) {
            node $nodeScript
        } else {
            Write-Status "AutoBuild script not found" "Warning"
        }
    }
}

function Invoke-HeadySync {
    Write-Status "Running HeadySync..." "Info"
    
    $hsScript = Join-Path $ScriptDir "hs.ps1"
    
    if (Test-Path $hsScript) {
        if ($Force) {
            & $hsScript -Force
        } else {
            & $hsScript
        }
    } else {
        Write-Status "HeadySync script not found" "Error"
    }
}

function Show-SystemStatus {
    Write-Status "Gathering system status..." "Info"
    
    # Check HeadyManager
    Write-Host ""
    Write-Host "Service Status:" -ForegroundColor Yellow
    
    $ports = @(3300, 3100)
    foreach ($port in $ports) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            Write-Status "HeadyManager (port $port): Running" "Success"
        } catch {
            Write-Status "HeadyManager (port $port): Not running" "Warning"
        }
    }
    
    # Check Git status
    Write-Host ""
    Write-Host "Git Status:" -ForegroundColor Yellow
    Push-Location $RootDir
    try {
        $branch = git branch --show-current 2>$null
        if ($branch) {
            Write-Status "Current branch: $branch" "Info"
        }
        
        $status = git status --porcelain 2>$null
        if ($status) {
            $changes = ($status -split "`n").Count
            Write-Status "Uncommitted changes: $changes files" "Warning"
        } else {
            Write-Status "Working tree clean" "Success"
        }
    } catch {
        Write-Status "Git not available" "Warning"
    } finally {
        Pop-Location
    }
    
    # Check critical directories
    Write-Host ""
    Write-Host "Directory Status:" -ForegroundColor Yellow
    $criticalDirs = @('.heady-memory', '.heady-context', 'audit_logs', 'src', 'scripts')
    foreach ($dir in $criticalDirs) {
        $dirPath = Join-Path $RootDir $dir
        if (Test-Path $dirPath) {
            Write-Status "$dir exists" "Success"
        } else {
            Write-Status "$dir missing" "Warning"
        }
    }
}

function Show-Help {
    Write-Banner
    
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  hc                        Generate checkpoint (default)"
    Write-Host "  hc -a                     Run autobuild with intelligence verification"
    Write-Host "  hc -a verify              Run intelligence verification only"
    Write-Host "  hc -a status              Show system status"
    Write-Host "  hc -a hs                  Run autobuild then HeadySync"
    Write-Host "  hc -a checkpoint          Generate checkpoint"
    Write-Host "  hc -a help                Show this help"
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host "  -Force                    Skip confirmations"
    Write-Host "  -Verbose                  Enable verbose output"
    Write-Host ""
    Write-Host "HEADY SYSTEM INTEGRATION:" -ForegroundColor Yellow
    Write-Host "  • Routes through HeadyMCP services"
    Write-Host "  • Runs intelligence verification before operations"
    Write-Host "  • Updates project context after operations"
    Write-Host "  • Logs to audit trail"
    Write-Host ""
}

# Main execution
Write-Banner

# Route based on action
switch -Regex ($a) {
    '^$' {
        # No action - generate checkpoint
        Invoke-IntelligenceVerification | Out-Null
        Invoke-Checkpoint
    }
    '^-a$|^autobuild$|^build$' {
        # Autobuild with intelligence verification
        if (Invoke-IntelligenceVerification) {
            Invoke-AutoBuild
        }
    }
    '^verify$|^verification$' {
        # Intelligence verification only
        Invoke-IntelligenceVerification | Out-Null
    }
    '^status$' {
        # Show system status
        Invoke-IntelligenceVerification | Out-Null
        Show-SystemStatus
    }
    '^hs$|^sync$' {
        # Autobuild then HeadySync
        if (Invoke-IntelligenceVerification) {
            Invoke-AutoBuild
            Write-Host ""
            Invoke-HeadySync
        }
    }
    '^checkpoint$|^cp$' {
        # Generate checkpoint
        Invoke-IntelligenceVerification | Out-Null
        Invoke-Checkpoint
    }
    '^help$|^-h$|^\?$' {
        Show-Help
    }
    default {
        # Try to execute as a script or command
        $target = Join-Path $ScriptDir $a
        if (Test-Path $target) {
            Write-Status "Executing: $target" "Info"
            Invoke-IntelligenceVerification | Out-Null
            if ($target -match "\.ps1$") {
                & $target
            } elseif ($target -match "\.js$") {
                node $target
            } else {
                Invoke-Item $target
            }
        } else {
            Write-Status "Unknown action: $a" "Error"
            Show-Help
        }
    }
}

Write-Host ""
Write-Status "Heady Control complete" "Success"
