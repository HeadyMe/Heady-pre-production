#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start HeadyMCP - Unified MCP Gateway Service

.DESCRIPTION
    Launches the HeadyMCP gateway that provides a convenient single connection point
    for all MCP services including HeadyMaid, Windsurf Router, and all other MCP servers.

.PARAMETER Port
    Port for MCP gateway (default: 3301)

.PARAMETER Daemon
    Run as background daemon

.EXAMPLE
    .\Start-HeadyMCP.ps1
    .\Start-HeadyMCP.ps1 -Port 3301 -Daemon

.NOTES
    HeadyMCP provides unified access to all MCP services
#>

param(
    [int]$Port = 3301,
    [switch]$Daemon
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

function Write-HeadyMCPBanner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║            HEADY MCP - UNIFIED GATEWAY                    ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

Write-HeadyMCPBanner

Write-Host "🚀 Starting HeadyMCP Gateway..." -ForegroundColor Cyan
Write-Host "   Port: $Port" -ForegroundColor Gray
Write-Host "   Mode: $(if ($Daemon) { 'Background Daemon' } else { 'Foreground' })" -ForegroundColor Gray
Write-Host ""

# Check if port is available
$portInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port $Port is already in use" -ForegroundColor Yellow
    Write-Host "   Checking if HeadyMCP is already running..." -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ HeadyMCP is already running on port $Port" -ForegroundColor Green
            Write-Host ""
            Write-Host "📡 Connection Info:" -ForegroundColor Cyan
            Write-Host "   URL: http://localhost:$Port" -ForegroundColor White
            Write-Host "   Health: http://localhost:$Port/health" -ForegroundColor White
            Write-Host "   MCP Endpoint: http://localhost:$Port/mcp" -ForegroundColor White
            Write-Host ""
            exit 0
        }
    } catch {
        Write-Host "❌ Port is in use by another service" -ForegroundColor Red
        Write-Host "   Try a different port or stop the conflicting service" -ForegroundColor Gray
        exit 1
    }
}

Push-Location $RootDir

try {
    # Start HeadyMCP gateway (heady-manager.js includes the gateway)
    if ($Daemon) {
        Write-Host "🔄 Starting HeadyMCP as background daemon..." -ForegroundColor Yellow
        
        $env:PORT = $Port
        $process = Start-Process -FilePath "node" `
            -ArgumentList "heady-manager.js" `
            -WindowStyle Hidden `
            -PassThru `
            -WorkingDirectory $RootDir
        
        Start-Sleep -Seconds 3
        
        # Verify it started
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/health" -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ HeadyMCP started successfully (PID: $($process.Id))" -ForegroundColor Green
                Write-Host ""
                Write-Host "📡 Connection Info:" -ForegroundColor Cyan
                Write-Host "   URL: http://localhost:$Port" -ForegroundColor White
                Write-Host "   Health: http://localhost:$Port/api/health" -ForegroundColor White
                Write-Host "   MCP Gateway: http://localhost:$Port/mcp" -ForegroundColor White
                Write-Host "   Admin UI: http://localhost:$Port/admin" -ForegroundColor White
                Write-Host ""
                Write-Host "🛠️  Available MCP Services:" -ForegroundColor Cyan
                Write-Host "   • heady-windsurf-router - Routes all Windsurf operations" -ForegroundColor Gray
                Write-Host "   • filesystem - File system operations" -ForegroundColor Gray
                Write-Host "   • git - Git repository operations" -ForegroundColor Gray
                Write-Host "   • sequential-thinking - Multi-step reasoning" -ForegroundColor Gray
                Write-Host "   • memory - Knowledge graph and persistence" -ForegroundColor Gray
                Write-Host "   • postgres - Database operations" -ForegroundColor Gray
                Write-Host "   • puppeteer - Browser automation" -ForegroundColor Gray
                Write-Host "   • cloudflare - Cloudflare API" -ForegroundColor Gray
                Write-Host ""
                Write-Host "💡 Control Commands:" -ForegroundColor Cyan
                Write-Host "   Monitor: Get-Process -Id $($process.Id)" -ForegroundColor Gray
                Write-Host "   Stop: Stop-Process -Id $($process.Id)" -ForegroundColor Gray
                Write-Host "   Logs: Get-Content $RootDir\heady-mcp.log -Wait" -ForegroundColor Gray
                Write-Host ""
            } else {
                Write-Host "⚠️  HeadyMCP may not have started correctly" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️  Could not verify HeadyMCP startup" -ForegroundColor Yellow
            Write-Host "   Check manually: http://localhost:$Port/api/health" -ForegroundColor Gray
        }
    } else {
        Write-Host "▶️  Starting HeadyMCP in foreground..." -ForegroundColor Yellow
        Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📡 Connection Info:" -ForegroundColor Cyan
        Write-Host "   URL: http://localhost:$Port" -ForegroundColor White
        Write-Host "   Health: http://localhost:$Port/api/health" -ForegroundColor White
        Write-Host "   MCP Gateway: http://localhost:$Port/mcp" -ForegroundColor White
        Write-Host "   Admin UI: http://localhost:$Port/admin" -ForegroundColor White
        Write-Host ""
        
        $env:PORT = $Port
        node heady-manager.js
    }
} catch {
    Write-Host "❌ Error starting HeadyMCP: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
