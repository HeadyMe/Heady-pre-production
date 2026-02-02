#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup global shortcuts for Heady system commands

.DESCRIPTION
    Creates global shortcuts (hb, hs, hc) accessible from anywhere
    Adds Heady scripts to system PATH

.EXAMPLE
    .\setup-global-shortcuts.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     HEADY GLOBAL SHORTCUTS SETUP                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$headyRoot = Split-Path -Parent $PSScriptRoot
$scriptsDir = Join-Path $headyRoot "scripts"

# Create shortcuts in Heady root
Write-Host "[SETUP] Creating global shortcuts..." -ForegroundColor Green

# hb.bat - Heady Build (AutoBuild)
$hbContent = @"
@echo off
cd /d "$headyRoot"
node src\heady_intelligence_verifier.js
if %ERRORLEVEL% NEQ 0 exit /b 1
node src\hc_autobuild.js %*
"@

Set-Content -Path (Join-Path $headyRoot "hb.bat") -Value $hbContent

# hs.bat - Heady Sync
$hsContent = @"
@echo off
cd /d "$headyRoot"
powershell -ExecutionPolicy Bypass -File "$scriptsDir\hs.ps1" %*
"@

Set-Content -Path (Join-Path $headyRoot "hs.bat") -Value $hsContent

# hc.bat - Heady Control (Checkpoint)
$hcContent = @"
@echo off
cd /d "$headyRoot"
powershell -ExecutionPolicy Bypass -File "$scriptsDir\Invoke-Checkpoint.ps1" %*
"@

Set-Content -Path (Join-Path $headyRoot "hc.bat") -Value $hcContent

Write-Host "  ✓ Created hb.bat (Heady Build)" -ForegroundColor Green
Write-Host "  ✓ Created hs.bat (Heady Sync)" -ForegroundColor Green
Write-Host "  ✓ Created hc.bat (Heady Control)" -ForegroundColor Green

# Add to PATH
Write-Host "`n[PATH] Adding Heady to system PATH..." -ForegroundColor Green

$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$headyRoot*") {
    $newPath = "$currentPath;$headyRoot"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "  ✓ Added $headyRoot to PATH" -ForegroundColor Green
    Write-Host "  ⚠ Restart your terminal for PATH changes to take effect" -ForegroundColor Yellow
} else {
    Write-Host "  ℹ Heady already in PATH" -ForegroundColor Gray
}

# Create PowerShell profile aliases
Write-Host "`n[PROFILE] Setting up PowerShell aliases..." -ForegroundColor Green

$profilePath = $PROFILE.CurrentUserAllHosts
$profileDir = Split-Path -Parent $profilePath

if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

$aliasContent = @"

# Heady System Aliases
function hb { & "$headyRoot\hb.bat" `$args }
function hs { & "$headyRoot\hs.bat" `$args }
function hc { & "$headyRoot\hc.bat" `$args }
"@

if (Test-Path $profilePath) {
    $currentProfile = Get-Content $profilePath -Raw
    if ($currentProfile -notlike "*Heady System Aliases*") {
        Add-Content -Path $profilePath -Value $aliasContent
        Write-Host "  ✓ Added aliases to PowerShell profile" -ForegroundColor Green
    } else {
        Write-Host "  ℹ Aliases already in profile" -ForegroundColor Gray
    }
} else {
    Set-Content -Path $profilePath -Value $aliasContent
    Write-Host "  ✓ Created PowerShell profile with aliases" -ForegroundColor Green
}

# Test shortcuts
Write-Host "`n[TEST] Testing shortcuts..." -ForegroundColor Green

$testCommands = @(
    @{ Name = "hb"; Path = Join-Path $headyRoot "hb.bat" },
    @{ Name = "hs"; Path = Join-Path $headyRoot "hs.bat" },
    @{ Name = "hc"; Path = Join-Path $headyRoot "hc.bat" }
)

foreach ($cmd in $testCommands) {
    if (Test-Path $cmd.Path) {
        Write-Host "  ✓ $($cmd.Name) ready" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($cmd.Name) missing" -ForegroundColor Red
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SETUP COMPLETE                                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Global shortcuts available:" -ForegroundColor White
Write-Host "  hb          - Heady Build (AutoBuild with intelligence verification)" -ForegroundColor Gray
Write-Host "  hs          - Heady Sync (Repository synchronization)" -ForegroundColor Gray
Write-Host "  hc          - Heady Control (Checkpoint generation)" -ForegroundColor Gray

Write-Host "`nUsage examples:" -ForegroundColor White
Write-Host "  hb                    # Run autobuild" -ForegroundColor Gray
Write-Host "  hb --verbose          # Run with verbose output" -ForegroundColor Gray
Write-Host "  hs                    # Sync repository" -ForegroundColor Gray
Write-Host "  hc                    # Generate checkpoint" -ForegroundColor Gray

Write-Host "`n⚠ Important:" -ForegroundColor Yellow
Write-Host "  1. Restart your terminal for PATH changes to take effect" -ForegroundColor Gray
Write-Host "  2. Reload PowerShell profile: . `$PROFILE" -ForegroundColor Gray
Write-Host "  3. Run 'hb' from any directory to start autobuild" -ForegroundColor Gray
Write-Host ""
