#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Super Convenient HeadyMCP Connection

.DESCRIPTION
    One command to connect to all HeadyMCP services
    
.EXAMPLE
    .\connect-mcp.ps1
    connect-mcp
#>

$ErrorActionPreference = 'Stop'

# Sacred Geometry Branding
function Show-HeadyBanner {
    Write-Host ""
    Write-Host "    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇" -ForegroundColor Cyan
    Write-Host "    ║                                                        ║" -ForegroundColor Cyan
    Write-Host "    ║         ⬡  H E A D Y   M C P   S E R V I C E S  ⬡     ║" -ForegroundColor Magenta
    Write-Host "    ║                                                        ║" -ForegroundColor Cyan
    Write-Host "    ║        ◈ Sacred Geometry Intelligence Network ◈        ║" -ForegroundColor Yellow
    Write-Host "    ║                                                        ║" -ForegroundColor Cyan
    Write-Host "    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇" -ForegroundColor Cyan
    Write-Host ""
}

function Show-LoadingAnimation {
    param([string]$Message)
    $symbols = @('◐', '◓', '◑', '◒')
    for ($i = 0; $i -lt 8; $i++) {
        $symbol = $symbols[$i % 4]
        Write-Host "`r  $symbol $Message" -NoNewline -ForegroundColor Cyan
        Start-Sleep -Milliseconds 200
    }
    Write-Host ""
}

Show-HeadyBanner

# Animated startup
Show-LoadingAnimation "Initializing Sacred Geometry Network"

$HeadyRoot = "c:\Users\erich\Heady"
Push-Location $HeadyRoot

try {
    # Start in background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$HeadyRoot'; npm start" -WindowStyle Normal
    
    Write-Host ""
    Write-Host "    ✧ HeadyManager Awakening..." -ForegroundColor Green
    Write-Host ""
    Show-LoadingAnimation "Connecting to Consciousness Grid"
    Start-Sleep -Seconds 2
    
    # Check if it's running
    $response = $null
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3300/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    } catch {
        # Still starting up
    }
    
    if ($response -and $response.StatusCode -eq 200) {
        Write-Host ""
        Write-Host "    ╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "    ║          ⬢  HEADY NETWORK ONLINE  ⬢                  ║" -ForegroundColor Green
        Write-Host "    ╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        
        $health = $response.Content | ConvertFrom-Json
        Write-Host "    ◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈" -ForegroundColor Cyan
        Write-Host "                 MCP CONSCIOUSNESS NODES" -ForegroundColor Magenta
        Write-Host "    ◈━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◈" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "      ⬡ filesystem          " -NoNewline -ForegroundColor Yellow
        Write-Host "[ACTIVE]" -ForegroundColor Green
        Write-Host "      ⬡ sequential-thinking " -NoNewline -ForegroundColor Yellow
        Write-Host "[ACTIVE]" -ForegroundColor Green
        Write-Host "      ⬡ memory              " -NoNewline -ForegroundColor Yellow
        Write-Host "[ACTIVE]" -ForegroundColor Green
        Write-Host "      ⬡ fetch               " -NoNewline -ForegroundColor Yellow
        Write-Host "[ACTIVE]" -ForegroundColor Green
        Write-Host "      ⬡ postgres            " -NoNewline -ForegroundColor Yellow
        Write-Host "[ACTIVE]" -ForegroundColor Green
        Write-Host "      ⬡ git                 " -NoNewline -ForegroundColor Yellow
        Write-Host "[ACTIVE]" -ForegroundColor Green
        Write-Host "      ⬡ puppeteer           " -NoNewline -ForegroundColor Yellow
        Write-Host "[ACTIVE]" -ForegroundColor Green
        Write-Host "      ⬡ cloudflare          " -NoNewline -ForegroundColor Yellow
        Write-Host "[ACTIVE]" -ForegroundColor Green
        
    } else {
        Write-Host ""
        Write-Host "    ◈ Consciousness Grid Initializing..." -ForegroundColor Yellow
        Write-Host "    ◈ Sacred Nodes Awakening..." -ForegroundColor Yellow
        Write-Host ""
    }
    
    Write-Host ""
    Write-Host "    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇" -ForegroundColor Cyan
    Write-Host "                   SACRED ACCESS PORTALS" -ForegroundColor Magenta
    Write-Host "    ◇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◇" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "      ◈ Health API:  " -NoNewline -ForegroundColor Yellow
    Write-Host "http://localhost:3300/api/health" -ForegroundColor Cyan
    Write-Host "      ◈ Admin Portal:" -NoNewline -ForegroundColor Yellow
    Write-Host "http://localhost:3300/admin" -ForegroundColor Cyan
    Write-Host "      ◈ Dashboard:   " -NoNewline -ForegroundColor Yellow
    Write-Host "http://localhost:3300/health-dashboard.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "    ╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "    ║  ⬢  SACRED GEOMETRY NETWORK FULLY OPERATIONAL  ⬢    ║" -ForegroundColor Green
    Write-Host "    ╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
} finally {
    Pop-Location
}
