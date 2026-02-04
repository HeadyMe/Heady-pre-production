# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: start-docker-mcp.ps1
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

<#
.SYNOPSIS
    Start HeadyMCP Docker services

.DESCRIPTION
    Starts all MCP services using Docker Compose with proper health checks
    and logging configuration.

.PARAMETER Detached
    Run containers in detached mode (default: true)

.PARAMETER Logs
    Follow logs after starting

.EXAMPLE
    .\start-docker-mcp.ps1
    .\start-docker-mcp.ps1 -Logs
#>

param(
    [switch]$Detached,
    [switch]$Logs
)

$ErrorActionPreference = "Stop"

Write-Host "∞ HEADY SYSTEMS :: STARTING MCP SERVICES ∞" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Check Docker is running
Write-Host "`n[1/4] Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Write-Host "`n[2/4] Loading environment..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "✓ Environment loaded" -ForegroundColor Green
} else {
    Write-Host "⚠ No .env file found - using defaults" -ForegroundColor Yellow
}

# Start services
Write-Host "`n[3/4] Starting MCP services..." -ForegroundColor Yellow
try {
    if ($Logs) {
        docker-compose -f docker-compose.mcp.yml up
    } else {
        docker-compose -f docker-compose.mcp.yml up -d
    }
    Write-Host "✓ Services started" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to start services" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Wait for services to be healthy
Write-Host "`n[4/4] Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$services = @("heady-mcp-filesystem", "heady-mcp-postgres", "heady-mcp-memory", "heady-mcp-fetch", "heady-postgres", "heady-redis")
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $allHealthy = $true
    
    foreach ($service in $services) {
        $status = docker inspect --format='{{.State.Status}}' $service 2>$null
        if ($status -ne "running") {
            $allHealthy = $false
            break
        }
    }
    
    if ($allHealthy) {
        Write-Host "✓ All services are healthy" -ForegroundColor Green
        break
    }
    
    $attempt++
    Write-Host "  Waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if ($attempt -eq $maxAttempts) {
    Write-Host "⚠ Some services may not be fully ready" -ForegroundColor Yellow
}

# Display service status
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "∞ SERVICE STATUS ∞" -ForegroundColor Green
Write-Host ""
docker-compose -f docker-compose.mcp.yml ps

# Display endpoints
Write-Host "`n∞ AVAILABLE ENDPOINTS ∞" -ForegroundColor Cyan
Write-Host "  HeadyManager API: http://localhost:3300/api/health" -ForegroundColor White
Write-Host "  PostgreSQL:       localhost:5432" -ForegroundColor White
Write-Host "  Redis:            localhost:6379" -ForegroundColor White

# Follow logs if requested
if ($Logs) {
    Write-Host "`n∞ FOLLOWING LOGS (Ctrl+C to exit) ∞" -ForegroundColor Cyan
    docker-compose -f docker-compose.mcp.yml logs -f
} else {
    Write-Host "`nTo view logs: docker-compose -f docker-compose.mcp.yml logs -f" -ForegroundColor Yellow
}

Write-Host "`n∞ Sacred Geometry :: Organic Systems ∞" -ForegroundColor Cyan
