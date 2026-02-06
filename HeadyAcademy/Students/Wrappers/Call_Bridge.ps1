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
# ║  FILE: HeadyAcademy/Students/Wrappers/Call_Bridge.ps1             ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [Parameter(Mandatory=$false)]
    [string]$Target = "server",
    
    [Parameter(Mandatory=$false)]
    [string]$Action = "start",
    
    [Parameter(Mandatory=$false)]
    [string]$Server = "heady_bridge",
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

$BASE = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
BRIDGE - Heady Network Connection Manager

USAGE:
    Call_Bridge.ps1 [-Target <type>] [-Action <action>] [-Server <name>]

TARGETS:
    mcp_client    - MCP client operations
    mcp_server    - MCP server operations  
    warp          - Warp network management
    server        - Default MCP server (default)

ACTIONS:
    start         - Start service (default)
    stop          - Stop service
    restart       - Restart service
    status        - Check status
    list          - List available servers
    connect       - Connect to server
    disconnect    - Disconnect from server

SERVERS:
    heady_bridge  - Primary bridge server
    heady_nova    - Nova server
    heady_oculus  - Oculus server

EXAMPLES:
    Call_Bridge.ps1                           # Start default MCP server
    Call_Bridge.ps1 -Target mcp_client -list   # List MCP servers
    Call_Bridge.ps1 -Target warp -status       # Check Warp status
    Call_Bridge.ps1 -Target mcp_server -Server heady_nova -start
"@
}

function Test-Python {
    try {
        $null = Get-Command python -ErrorAction Stop
        return $true
    } catch {
        Write-Host "❌ Python not found in PATH" -ForegroundColor Red
        return $false
    }
}

function Test-ToolExists {
    param([string]$ToolPath)
    
    if (Test-Path $ToolPath) {
        return $true
    } else {
        Write-Host "❌ Tool not found: $ToolPath" -ForegroundColor Red
        return $false
    }
}

function Invoke-BridgeCommand {
    param(
        [string]$Command,
        [string]$Arguments = ""
    )
    
    if (-not (Test-Python)) { return $false }
    if (-not (Test-ToolExists $Command)) { return $false }
    
    try {
        Write-Host "[BRIDGE] Executing: $Command $Arguments" -ForegroundColor Cyan
        
        if ($Arguments) {
            python $Command $Arguments.Split(" ")
        } else {
            python $Command
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Command completed successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Command failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error executing command: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "[BRIDGE] Heady Network Connection Manager v2.0" -ForegroundColor Cyan
Write-Host "Target: $Target | Action: $Action | Server: $Server" -ForegroundColor Gray

switch ($Target.ToLower()) {
    "mcp_client" {
        $toolPath = "$BASE\Tools\MCP\Client.py"
        $toolArgs = "$Action $Server".Trim()
        Invoke-BridgeCommand -Command $toolPath -Arguments $toolArgs
    }
    
    "mcp_server" {
        $toolPath = "$BASE\Tools\MCP\Server.py"
        $toolArgs = "$Action $Server".Trim()
        Invoke-BridgeCommand -Command $toolPath -Arguments $toolArgs
    }
    
    "warp" {
        $toolPath = "$BASE\Tools\Network\Warp_Manager.py"
        $toolArgs = $Action
        Invoke-BridgeCommand -Command $toolPath -Arguments $toolArgs
    }
    
    "server" {
        Write-Host ">> Starting MCP Server on Stdio..." -ForegroundColor Yellow
        $toolPath = "$BASE\Tools\MCP\Server.py"
        Invoke-BridgeCommand -Command $toolPath
    }
    
    default {
        Write-Host "❌ Unknown target: $Target" -ForegroundColor Red
        Write-Host "Use -Help for available options" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "[BRIDGE] Operation completed" -ForegroundColor Cyan
