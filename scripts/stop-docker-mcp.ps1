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
# ║  FILE: scripts/stop-docker-mcp.ps1                                ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [string]$DockerComposeFile = "docker-compose.mcp.yml",
    [switch]$RemoveVolumes = $false,
    [switch]$RemoveImages = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-HeadyLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor Cyan
}

function Stop-McpServices {
    Write-HeadyLog "Stopping MCP services..."
    
    if (-not (Test-Path $DockerComposeFile)) {
        Write-HeadyLog "docker-compose file not found: $DockerComposeFile" "ERROR"
        exit 1
    }
    
    $composeArgs = @("-f", $DockerComposeFile, "down")
    
    if ($RemoveVolumes) {
        $composeArgs += "-v"
        Write-HeadyLog "Will remove volumes"
    }
    
    if ($RemoveImages) {
        $composeArgs += "--rmi"
        $composeArgs += "all"
        Write-HeadyLog "Will remove images"
    }
    
    Write-HeadyLog "Running: docker-compose $($composeArgs -join ' ')"
    
    & docker-compose @composeArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-HeadyLog "MCP services stopped successfully"
    }
    else {
        Write-HeadyLog "Failed to stop MCP services" "ERROR"
        exit 1
    }
}

function Cleanup-Network {
    Write-HeadyLog "Cleaning up MCP network..."
    
    try {
        $networkExists = docker network ls --filter "name=mcp-network" --quiet
        if ($networkExists) {
            docker network rm mcp-network
            Write-HeadyLog "Removed MCP network"
        }
    }
    catch {
        Write-HeadyLog "Network cleanup warning: $_" "WARN"
    }
}

function Main {
    Write-HeadyLog "=== Stopping Docker MCP Services ==="
    
    Stop-McpServices
    
    if ($RemoveVolumes -or $RemoveImages) {
        Cleanup-Network
    }
    
    Write-HeadyLog "=== Docker MCP Services Stopped ==="
}

Main
