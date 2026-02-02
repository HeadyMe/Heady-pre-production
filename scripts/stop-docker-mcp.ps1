#!/usr/bin/env pwsh

# Docker MCP Services Stop Script
# Stops all MCP services in Docker containers

Write-Host "🛑 Stopping Docker MCP Services..." -ForegroundColor Yellow

# Stop Docker Compose MCP services
docker-compose -f docker-compose.mcp.yml down

# Remove stopped containers
Write-Host "🧹 Cleaning up stopped containers..." -ForegroundColor Gray
docker container prune -f

# Check if services are stopped
$services = @("mcp-filesystem", "mcp-postgres", "mcp-memory", "mcp-fetch", "postgres", "redis")

Write-Host "`n📊 Checking service status..." -ForegroundColor Cyan
foreach ($service in $services) {
    $status = docker ps -a --filter "name=$service" --format "table {{.Names}}\t{{.Status}}"
    if ($status -match $service) {
        Write-Host "⚠️  $service still exists" -ForegroundColor Yellow
    } else {
        Write-Host "✓ $service stopped and removed" -ForegroundColor Green
    }
}

Write-Host "`n✅ Docker MCP Services stopped!" -ForegroundColor Green
