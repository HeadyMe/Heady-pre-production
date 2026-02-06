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
# ║  FILE: stop-docker-mcp.ps1                                        ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

<#
.SYNOPSIS
    Stop HeadyMCP Docker services

.DESCRIPTION
    Gracefully stops all MCP services and optionally cleans up containers and volumes.

.PARAMETER Clean
    Remove containers after stopping

.PARAMETER Volumes
    Remove volumes (WARNING: This deletes all data!)

.EXAMPLE
    .\stop-docker-mcp.ps1
    .\stop-docker-mcp.ps1 -Clean
    .\stop-docker-mcp.ps1 -Clean -Volumes
#>

param(
    [switch]$Clean,
    [switch]$Volumes
)

$ErrorActionPreference = "Stop"

Write-Host "∞ HEADY SYSTEMS :: STOPPING MCP SERVICES ∞" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Check Docker is running
Write-Host "`n[1/3] Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running" -ForegroundColor Red
    Write-Host "Services may already be stopped." -ForegroundColor Yellow
    exit 0
}

# Stop services
Write-Host "`n[2/3] Stopping MCP services..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.mcp.yml stop
    Write-Host "✓ Services stopped" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to stop services" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Clean up containers
if ($Clean) {
    Write-Host "`n[3/3] Removing containers..." -ForegroundColor Yellow
    
    if ($Volumes) {
        Write-Host "⚠ WARNING: This will delete all data in volumes!" -ForegroundColor Red
        $confirmation = Read-Host "Are you sure? (yes/no)"
        
        if ($confirmation -eq "yes") {
            docker-compose -f docker-compose.mcp.yml down -v
            Write-Host "✓ Containers and volumes removed" -ForegroundColor Green
        } else {
            Write-Host "✓ Cancelled - volumes preserved" -ForegroundColor Yellow
            docker-compose -f docker-compose.mcp.yml down
            Write-Host "✓ Containers removed" -ForegroundColor Green
        }
    } else {
        docker-compose -f docker-compose.mcp.yml down
        Write-Host "✓ Containers removed" -ForegroundColor Green
    }
} else {
    Write-Host "`n[3/3] Containers preserved" -ForegroundColor Gray
    Write-Host "  Use -Clean to remove containers" -ForegroundColor Gray
}

# Display status
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "∞ SERVICES STOPPED ∞" -ForegroundColor Green

if (-not $Clean) {
    Write-Host "`nTo restart: .\start-docker-mcp.ps1" -ForegroundColor Yellow
} else {
    Write-Host "`nTo start fresh: .\docker-mcp-setup.ps1 && .\start-docker-mcp.ps1" -ForegroundColor Yellow
}

Write-Host "`n∞ Sacred Geometry :: Organic Systems ∞" -ForegroundColor Cyan
