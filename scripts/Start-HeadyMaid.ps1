#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start HeadyMaid - Complete Data Observability Service

.DESCRIPTION
    Launches the HeadyMaid background service that maintains real-time
    inventory and observability of all data across the Heady ecosystem.

.PARAMETER Daemon
    Run as background daemon (detached process)

.PARAMETER ScanInterval
    Quick scan interval in milliseconds (default: 30000)

.PARAMETER DeepScanInterval
    Deep scan interval in milliseconds (default: 300000)

.EXAMPLE
    .\Start-HeadyMaid.ps1
    .\Start-HeadyMaid.ps1 -Daemon
    .\Start-HeadyMaid.ps1 -ScanInterval 60000

.NOTES
    HeadyMaid provides complete real-time observability of every bit of data
#>

param(
    [switch]$Daemon,
    [int]$ScanInterval = 30000,
    [int]$DeepScanInterval = 300000
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

function Write-HeadyMaidBanner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║              HEADY MAID - DATA OBSERVABILITY              ║" -ForegroundColor Magenta
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

Write-HeadyMaidBanner

Write-Host "🧹 Starting HeadyMaid service..." -ForegroundColor Cyan
Write-Host "   Scan Interval: $ScanInterval ms" -ForegroundColor Gray
Write-Host "   Deep Scan Interval: $DeepScanInterval ms" -ForegroundColor Gray
Write-Host ""

Push-Location $RootDir

try {
    if ($Daemon) {
        Write-Host "🔄 Starting HeadyMaid as background daemon..." -ForegroundColor Yellow
        
        $process = Start-Process -FilePath "node" `
            -ArgumentList "$RootDir\src\heady_maid_service.js --scanInterval $ScanInterval --deepScanInterval $DeepScanInterval" `
            -WindowStyle Hidden `
            -PassThru
        
        Write-Host "✅ HeadyMaid started (PID: $($process.Id))" -ForegroundColor Green
        Write-Host "   Monitor with: Get-Process -Id $($process.Id)" -ForegroundColor Gray
        Write-Host "   Stop with: Stop-Process -Id $($process.Id)" -ForegroundColor Gray
    } else {
        Write-Host "▶️  Starting HeadyMaid in foreground..." -ForegroundColor Yellow
        Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        
        node "$RootDir\src\heady_maid_service.js" --scanInterval $ScanInterval --deepScanInterval $DeepScanInterval
    }
} catch {
    Write-Host "❌ Error starting HeadyMaid: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
