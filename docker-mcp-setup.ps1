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
# ║  FILE: docker-mcp-setup.ps1                                       ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

<#
.SYNOPSIS
    Setup Docker Desktop MCP Integration for HeadySystems

.DESCRIPTION
    Configures Docker Desktop to use HeadyMCP servers in the toolkit.
    Creates necessary directories, builds containers, and configures networking.

.PARAMETER Force
    Force rebuild of all containers

.PARAMETER SkipBuild
    Skip building containers (use existing images)

.EXAMPLE
    .\docker-mcp-setup.ps1
    .\docker-mcp-setup.ps1 -Force
#>

param(
    [switch]$Force,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host "∞ HEADY SYSTEMS :: DOCKER MCP SETUP ∞" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Check Docker Desktop is running
Write-Host "`n[1/7] Checking Docker Desktop..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker Desktop is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Desktop is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Create necessary directories
Write-Host "`n[2/7] Creating directories..." -ForegroundColor Yellow
$directories = @(
    "mcp-data",
    ".heady-memory/inventory",
    ".heady-memory/checkpoints",
    ".heady-memory/logs"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    }
}
Write-Host "✓ Directories ready" -ForegroundColor Green

# Check for .env file
Write-Host "`n[3/7] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  Created .env from .env.example" -ForegroundColor Gray
        Write-Host "  ⚠ Please update .env with your credentials" -ForegroundColor Yellow
    } else {
        Write-Host "  ⚠ No .env file found - using defaults" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ Environment file exists" -ForegroundColor Green
}

# Build HeadyMCP container
if (-not $SkipBuild) {
    Write-Host "`n[4/7] Building HeadyMCP container..." -ForegroundColor Yellow
    
    $buildArgs = @("build", "-t", "heady-mcp:latest")
    if ($Force) {
        $buildArgs += "--no-cache"
    }
    $buildArgs += "."
    
    try {
        & docker $buildArgs
        Write-Host "✓ HeadyMCP container built successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to build container" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n[4/7] Skipping container build" -ForegroundColor Gray
}

# Create Docker network
Write-Host "`n[5/7] Setting up Docker network..." -ForegroundColor Yellow
$networkExists = docker network ls --filter name=heady_mcp-network --format "{{.Name}}"
if (-not $networkExists) {
    docker network create heady_mcp-network | Out-Null
    Write-Host "✓ Created heady_mcp-network" -ForegroundColor Green
} else {
    Write-Host "✓ Network already exists" -ForegroundColor Green
}

# Initialize database
Write-Host "`n[6/7] Checking database initialization..." -ForegroundColor Yellow
if (-not (Test-Path "init.sql")) {
    @"
-- HEADY SYSTEMS :: Database Initialization
CREATE TABLE IF NOT EXISTS heady_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS heady_tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES heady_projects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_projects_status ON heady_projects(status);
CREATE INDEX idx_tasks_status ON heady_tasks(status);
"@ | Out-File -FilePath "init.sql" -Encoding UTF8
    Write-Host "  Created init.sql" -ForegroundColor Gray
}
Write-Host "✓ Database initialization ready" -ForegroundColor Green

# Verify docker-compose configuration
Write-Host "`n[7/7] Verifying docker-compose configuration..." -ForegroundColor Yellow
if (Test-Path "docker-compose.mcp.yml") {
    try {
        docker-compose -f docker-compose.mcp.yml config | Out-Null
        Write-Host "✓ Docker Compose configuration is valid" -ForegroundColor Green
    } catch {
        Write-Host "✗ Invalid docker-compose.mcp.yml" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ docker-compose.mcp.yml not found" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "∞ SETUP COMPLETE ∞" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Review and update .env file with your credentials" -ForegroundColor White
Write-Host "  2. Run: .\start-docker-mcp.ps1" -ForegroundColor White
Write-Host "  3. Verify: docker-compose -f docker-compose.mcp.yml ps" -ForegroundColor White
Write-Host "`n∞ Sacred Geometry :: Organic Systems ∞" -ForegroundColor Cyan
