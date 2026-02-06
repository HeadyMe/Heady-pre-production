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
# ║  FILE: scripts/auto-checkpoint.ps1                                ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$RootDir = "$ScriptDir\.."

function Test-BuildComplete {
    # Check if dist/build directories exist
    return (Test-Path "$RootDir\dist") -or (Test-Path "$RootDir\build")
}

function Test-DependenciesInstalled {
    # Check if node_modules exists
    return (Test-Path "$RootDir\node_modules")
}

function Test-GitClean {
    $status = git -C $RootDir status --porcelain
    return [string]::IsNullOrWhiteSpace($status)
}

function Test-PatternsValid {
    # Check if pattern registry exists
    return (Test-Path "$RootDir\apps\heady-conductor\pattern-registry.ts")
}

function Test-DocsComplete {
    # Check if key docs exist
    $docs = @("README.md", "USER_MANUAL.md", "YOUR_HEADY_SYSTEM.md")
    foreach ($doc in $docs) {
        if (!(Test-Path "$RootDir\$doc")) {
            return $false
        }
    }
    return $true
}

function Test-BrandingComplete {
    # Check if branding script exists
    return (Test-Path "$ScriptDir\brand_headers.js")
}

function Test-FunctionalState {
    $checks = @{
        build = Test-BuildComplete
        deps = Test-DependenciesInstalled
        git = Test-GitClean
        patterns = Test-PatternsValid
        docs = Test-DocsComplete
        branding = Test-BrandingComplete
    }
    
    $failed = $checks.GetEnumerator() | Where-Object { !$_.Value }
    
    if ($failed.Count -gt 0) {
        Write-Host "`n⚠️ System not in fully functional state:" -ForegroundColor Yellow
        foreach ($check in $failed) {
            Write-Host "  ❌ $($check.Key)" -ForegroundColor Red
        }
        return $false
    }
    
    Write-Host "`n✅ System in fully functional state!" -ForegroundColor Green
    return $true
}

Set-Location $RootDir

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " INTELLIGENT CHECKPOINT SYSTEM" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check functional state
if ((Test-FunctionalState) -or $Force) {
    Write-Host "`n🎯 Creating checkpoint at fully functional state..." -ForegroundColor Cyan
    
    # Run full checkpoint validation
    if (Test-Path "$ScriptDir\checkpoint-validation.ps1") {
        & "$ScriptDir\checkpoint-validation.ps1" -Full
    }
    
    # Create git tag
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $tagName = "checkpoint-$timestamp"
    
    git tag -a $tagName -m "Automatic checkpoint - fully functional state validated"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Checkpoint created: $tagName" -ForegroundColor Green
        Write-Host "   Rollback with: git checkout $tagName" -ForegroundColor Gray
    } else {
        Write-Host "`n⚠️ Failed to create git tag" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️ System not ready for checkpoint" -ForegroundColor Yellow
    Write-Host "   Fix issues above or use -Force to create checkpoint anyway" -ForegroundColor Gray
    exit 1
}

Write-Host "`n════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
