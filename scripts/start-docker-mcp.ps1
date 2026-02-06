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
# ║  FILE: scripts/start-docker-mcp.ps1                               ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [string]$DockerComposeFile = "docker-compose.mcp.yml",
    [switch]$Detach = $true,
    [switch]$BuildImages = $false,
    [string[]]$Services = @()
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-HeadyLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor Cyan
}

function Test-DockerRunning {
    try {
        docker ps > $null 2>&1
        return $true
    }
    catch {
        return $false
    }
}

function Start-McpServices {
    Write-HeadyLog "Starting MCP services..."
    
    if (-not (Test-DockerRunning)) {
        Write-HeadyLog "Docker daemon is not running" "ERROR"
        exit 1
    }
    
    $composeArgs = @("-f", $DockerComposeFile)
    
    if ($BuildImages) {
        $composeArgs += "up"
        $composeArgs += "--build"
    }
    else {
        $composeArgs += "up"
    }
    
    if ($Detach) {
        $composeArgs += "-d"
    }
    
    if ($Services.Count -gt 0) {
        $composeArgs += $Services
    }
    
    Write-HeadyLog "Running: docker-compose $($composeArgs -join ' ')"
    
    & docker-compose @composeArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-HeadyLog "MCP services started successfully"
        
        if ($Detach) {
            Start-Sleep -Seconds 3
            Write-HeadyLog "Service status:"
            & docker-compose -f $DockerComposeFile ps
        }
    }
    else {
        Write-HeadyLog "Failed to start MCP services" "ERROR"
        exit 1
    }
}

function Main {
    Write-HeadyLog "=== Starting Docker MCP Services ==="
    
    if (-not (Test-Path $DockerComposeFile)) {
        Write-HeadyLog "docker-compose file not found: $DockerComposeFile" "ERROR"
        exit 1
    }
    
    Start-McpServices
    
    Write-HeadyLog "=== Docker MCP Services Started ==="
    Write-HeadyLog "View logs: docker-compose -f $DockerComposeFile logs -f"
    Write-HeadyLog "Stop services: .\scripts\stop-docker-mcp.ps1"
}

Main
