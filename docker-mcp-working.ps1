#!/usr/bin/env pwsh

# Docker Desktop MCP Configuration Setup Script

Write-Host "∞ DOCKER DESKTOP MCP CONFIGURATION SETUP ∞" -ForegroundColor Cyan

# Check if Docker Desktop is running
$dockerRunning = $false
try {
    $null = docker version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Host "✓ Docker Desktop is running" -ForegroundColor Green
    }
} catch {
    # Ignore
}

if (-not $dockerRunning) {
    Write-Host "❌ Docker Desktop is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Backup existing MCP config
if (Test-Path ".\mcp_config.json") {
    $backupPath = ".\mcp_config.json.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item ".\mcp_config.json" $backupPath
    Write-Host "✓ Backed up existing config to $backupPath" -ForegroundColor Green
}

# Create Docker-optimized MCP configuration
$config = @{
    mcpServers = @{
        filesystem = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-filesystem", "/Users/erich/Heady")
            description = "File system operations for Docker container management"
        }
        docker = @{
            command = "docker"
            args = @("run", "--rm", "-v", "/var/run/docker.sock:/var/run/docker.sock", "mcp-server-docker")
            description = "Docker container and image management"
            env = @{
                DOCKER_HOST = "unix:///var/run/docker.sock"
            }
        }
        "sequential-thinking" = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-sequential-thinking")
            description = "Reasoning chains for container deployment strategies"
        }
        memory = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-memory")
            description = "Persistent memory for container configurations and states"
        }
        fetch = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-fetch")
            description = "Web requests for container registry operations"
        }
        postgres = @{
            command = "docker"
            args = @("run", "--rm", "--network", "host", "mcp-server-postgres")
            description = "PostgreSQL database container management"
            env = @{
                DATABASE_URL = "postgresql://postgres:password@localhost:5432/heady"
                POSTGRES_HOST = "localhost"
                POSTGRES_PORT = "5432"
                POSTGRES_DB = "heady"
                POSTGRES_USER = "postgres"
                POSTGRES_PASSWORD = "password"
            }
        }
        git = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-git", "--repository", "/Users/erich/Heady")
            description = "Git operations for containerized applications"
        }
        puppeteer = @{
            command = "docker"
            args = @("run", "--rm", "--shm-size=1gb", "mcp-server-puppeteer")
            description = "Web automation for containerized application testing"
            env = @{
                PUPPETEER_HEADLESS = "true"
                PUPPETEER_ARGS = "--no-sandbox --disable-setuid-sandbox"
            }
        }
        cloudflare = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-cloudflare")
            description = "Cloudflare API for container CDN and DNS management"
            env = @{
                CLOUDFLARE_API_TOKEN = "`${COPILOT_MCP_CLOUDFLARE_API_TOKEN}"
                CLOUDFLARE_ACCOUNT_ID = "`${COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID}"
            }
        }
        kubernetes = @{
            command = "kubectl"
            args = @("mcp-server-kubernetes")
            description = "Kubernetes cluster management for container orchestration"
            env = @{
                KUBECONFIG = "`${KUBECONFIG:-$env:USERPROFILE/.kube/config}"
            }
        }
        monitoring = @{
            command = "docker"
            args = @("run", "--rm", "-v", "/var/run/docker.sock:/var/run/docker.sock", "mcp-server-monitoring")
            description = "Container health monitoring and metrics collection"
            env = @{
                MONITORING_INTERVAL = "30"
                METRICS_RETENTION = "24h"
            }
        }
    }
}

# Write configuration to file
$config | ConvertTo-Json -Depth 4 | Out-File -FilePath ".\mcp_config.json" -Encoding UTF8
Write-Host "✓ Created Docker-optimized MCP configuration" -ForegroundColor Green

# Create Docker Compose configuration
$composeConfig = @"
version: '3.8'

services:
  mcp-filesystem:
    image: node:18-alpine
    container_name: heady-mcp-filesystem
    volumes:
      - /Users/erich/Heady:/workspace
    working_dir: /app
    command: npx -y @modelcontextprotocol/server-filesystem /workspace
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - mcp-network

  mcp-postgres:
    image: node:18-alpine
    container_name: heady-mcp-postgres
    depends_on:
      - postgres
    working_dir: /app
    command: npx -y @modelcontextprotocol/server-postgres
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/heady
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - mcp-network

  mcp-memory:
    image: node:18-alpine
    container_name: heady-mcp-memory
    volumes:
      - ./mcp-data:/data
    working_dir: /app
    command: npx -y @modelcontextprotocol/server-memory
    environment:
      - NODE_ENV=production
      - MEMORY_STORAGE_PATH=/data
    restart: unless-stopped
    networks:
      - mcp-network

  mcp-fetch:
    image: node:18-alpine
    container_name: heady-mcp-fetch
    working_dir: /app
    command: npx -y @modelcontextprotocol/server-fetch
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - mcp-network

  postgres:
    image: postgres:15-alpine
    container_name: heady-postgres
    environment:
      - POSTGRES_DB=heady
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - mcp-network

  redis:
    image: redis:7-alpine
    container_name: heady-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - mcp-network

volumes:
  postgres_data:
  redis_data:

networks:
  mcp-network:
    driver: bridge
"@

$composeConfig | Out-File -FilePath "docker-compose.mcp.yml" -Encoding UTF8
Write-Host "✓ Created docker-compose.mcp.yml" -ForegroundColor Green

# Create startup script
$startupScript = @"
Write-Host "🚀 Starting Docker MCP Services..." -ForegroundColor Cyan
docker-compose -f docker-compose.mcp.yml up -d
Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

`$services = @("mcp-filesystem", "mcp-postgres", "mcp-memory", "mcp-fetch", "postgres", "redis")
foreach (`$service in `$services) {
    `$status = docker ps --filter "name=`$service" --format "table {{.Names}}`t{{.Status}}"
    if (`$status -match `$service) {
        Write-Host "✓ `$service is running" -ForegroundColor Green
    } else {
        Write-Host "❌ `$service failed to start" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Docker MCP Services startup complete!" -ForegroundColor Green
"@

$startupScript | Out-File -FilePath "start-docker-mcp.ps1" -Encoding UTF8
Write-Host "✓ Created start-docker-mcp.ps1" -ForegroundColor Green

# Install required npm packages
Write-Host "`n📦 Installing MCP npm packages..." -ForegroundColor Yellow
$packages = @(
    "@modelcontextprotocol/server-filesystem",
    "@modelcontextprotocol/server-sequential-thinking", 
    "@modelcontextprotocol/server-memory",
    "@modelcontextprotocol/server-fetch",
    "@modelcontextprotocol/server-postgres",
    "@modelcontextprotocol/server-git",
    "@modelcontextprotocol/server-puppeteer",
    "@modelcontextprotocol/server-cloudflare"
)

foreach ($package in $packages) {
    Write-Host "Installing $package..." -ForegroundColor Gray
    npm install -g $package 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $package installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Failed to install $package" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Docker Desktop MCP configuration complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start MCP services: .\start-docker-mcp.ps1" -ForegroundColor White
Write-Host "2. Check service status: docker-compose -f docker-compose.mcp.yml ps" -ForegroundColor White
Write-Host "3. View logs: docker-compose -f docker-compose.mcp.yml logs -f" -ForegroundColor White
Write-Host "4. Stop services: docker-compose -f docker-compose.mcp.yml down" -ForegroundColor White
