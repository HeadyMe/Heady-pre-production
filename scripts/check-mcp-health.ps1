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
# ║  FILE: scripts/check-mcp-health.ps1                               ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [string]$DockerComposeFile = "docker-compose.mcp.yml",
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

function Write-HeadyLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "OK" { "Green" }
        default { "Cyan" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Check-ContainerHealth {
    param([string]$ContainerName)
    
    try {
        $status = docker inspect -f '{{.State.Status}}' $ContainerName 2>$null
        
        if ($status -eq "running") {
            Write-HeadyLog "$ContainerName is running" "OK"
            
            if ($Verbose) {
                $health = docker inspect -f '{{.State.Health.Status}}' $ContainerName 2>$null
                if ($health) {
                    Write-HeadyLog "  Health: $health"
                }
            }
            return $true
        }
        else {
            Write-HeadyLog "$ContainerName is $status" "WARN"
            return $false
        }
    }
    catch {
        Write-HeadyLog "$ContainerName not found" "ERROR"
        return $false
    }
}

function Check-ServicePort {
    param([string]$Host, [int]$Port, [string]$ServiceName)
    
    try {
        $connection = Test-NetConnection -ComputerName $Host -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-HeadyLog "$ServiceName ($Host:$Port) is accessible" "OK"
            return $true
        }
        else {
            Write-HeadyLog "$ServiceName ($Host:$Port) is not accessible" "WARN"
            return $false
        }
    }
    catch {
        Write-HeadyLog "$ServiceName port check failed: $_" "ERROR"
        return $false
    }
}

function Check-DockerCompose {
    Write-HeadyLog "Checking docker-compose status..."
    
    if (-not (Test-Path $DockerComposeFile)) {
        Write-HeadyLog "docker-compose file not found: $DockerComposeFile" "ERROR"
        return $false
    }
    
    try {
        & docker-compose -f $DockerComposeFile ps --quiet > $null 2>&1
        return $true
    }
    catch {
        Write-HeadyLog "docker-compose check failed" "ERROR"
        return $false
    }
}

function Get-ContainerStats {
    param([string]$ContainerName)
    
    try {
        $stats = docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}" $ContainerName 2>$null
        if ($stats) {
            Write-HeadyLog "  $stats"
        }
    }
    catch {
        # Silently skip if stats unavailable
    }
}

function Main {
    Write-HeadyLog "=== Docker MCP Health Check ==="
    
    $allHealthy = $true
    
    Write-HeadyLog ""
    Write-HeadyLog "Checking Docker daemon..."
    try {
        docker ps > $null 2>&1
        Write-HeadyLog "Docker daemon is running" "OK"
    }
    catch {
        Write-HeadyLog "Docker daemon is not running" "ERROR"
        $allHealthy = $false
    }
    
    Write-HeadyLog ""
    Write-HeadyLog "Checking docker-compose..."
    if (-not (Check-DockerCompose)) {
        $allHealthy = $false
    }
    
    Write-HeadyLog ""
    Write-HeadyLog "Checking MCP containers..."
    $containers = @(
        "heady-mcp-filesystem",
        "heady-mcp-postgres",
        "heady-mcp-memory",
        "heady-mcp-fetch",
        "heady-postgres",
        "heady-redis"
    )
    
    foreach ($container in $containers) {
        if (-not (Check-ContainerHealth $container)) {
            $allHealthy = $false
        }
        
        if ($Verbose) {
            Get-ContainerStats $container
        }
    }
    
    Write-HeadyLog ""
    Write-HeadyLog "Checking service ports..."
    Check-ServicePort "localhost" 5432 "PostgreSQL" | Out-Null
    Check-ServicePort "localhost" 6379 "Redis" | Out-Null
    
    Write-HeadyLog ""
    if ($allHealthy) {
        Write-HeadyLog "=== All MCP services are healthy ===" "OK"
    }
    else {
        Write-HeadyLog "=== Some MCP services have issues ===" "WARN"
        Write-HeadyLog "Run: docker-compose -f $DockerComposeFile logs"
    }
    
    Write-HeadyLog ""
    Write-HeadyLog "Detailed status:"
    & docker-compose -f $DockerComposeFile ps
}

Main
