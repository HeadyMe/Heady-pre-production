<#
.SYNOPSIS
    Starts the Heady Orchestrator service
.DESCRIPTION
    Ensures the orchestrator service is running and connected to all MCP services
.EXAMPLE
    .\start-orchestrator.ps1
#>

$ErrorActionPreference = 'Stop'

# Start orchestrator
Start-Process -FilePath "node" -ArgumentList "src/mcp/heady-mcp-orchestrator.js" -WindowStyle Hidden

# Wait for service to become available
$timeout = 30
$elapsed = 0
$interval = 2

while ($elapsed -lt $timeout) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3304/tools/graph" -Method Get -ErrorAction Stop
        if ($response) {
            Write-Host "✅ Orchestrator service is running" -ForegroundColor Green
            exit 0
        }
    } catch {
        Write-Host "Waiting for orchestrator to start... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
        Start-Sleep -Seconds $interval
        $elapsed += $interval
    }
}

Write-Host "❌ Failed to start orchestrator service" -ForegroundColor Red
exit 1
