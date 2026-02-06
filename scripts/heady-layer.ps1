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
# ║  FILE: scripts/heady-layer.ps1                                    ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

<#
.SYNOPSIS
    Heady Layer Switcher - Switch between and identify Heady cloud layers.

.DESCRIPTION
    Manage which Heady system you're connected to: Local, Cloud HeadyMe,
    Cloud HeadySystems, Cloud HeadyConnection, or Hybrid mode.

.PARAMETER Action
    The action to perform: status, switch, list, health, or set.

.PARAMETER Layer
    The target layer ID (local, cloud-me, cloud-sys, cloud-conn, hybrid).

.EXAMPLE
    .\heady-layer.ps1                    # Show current layer + quick health
    .\heady-layer.ps1 status             # Detailed status of active layer
    .\heady-layer.ps1 list               # List all layers with health
    .\heady-layer.ps1 switch cloud-me    # Switch to HeadyMe cloud
    .\heady-layer.ps1 switch local       # Switch back to local
    .\heady-layer.ps1 health             # Health check all layers
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet("status", "switch", "list", "health", "set", "")]
    [string]$Action = "",

    [Parameter(Position = 1)]
    [string]$Layer = ""
)

$ErrorActionPreference = "SilentlyContinue"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptRoot
$LayersConfigPath = Join-Path $ScriptRoot "heady-layers.json"
$StateFilePath = Join-Path $ScriptRoot ".heady-active-layer"

# ─── Load Configuration ───────────────────────────────────────────────────────

function Load-LayersConfig {
    if (-not (Test-Path $LayersConfigPath)) {
        Write-Host "  ERROR: heady-layers.json not found at $LayersConfigPath" -ForegroundColor Red
        exit 1
    }
    return Get-Content $LayersConfigPath -Raw | ConvertFrom-Json
}

# ─── State Management ─────────────────────────────────────────────────────────

function Get-ActiveLayer {
    if (Test-Path $StateFilePath) {
        return (Get-Content $StateFilePath -Raw).Trim()
    }
    $config = Load-LayersConfig
    return $config.default_layer
}

function Set-ActiveLayer {
    param([string]$LayerId)
    $LayerId | Out-File -FilePath $StateFilePath -Encoding utf8 -NoNewline
}

# ─── Health Check ─────────────────────────────────────────────────────────────

function Check-LayerHealth {
    param([string]$Endpoint)
    
    try {
        $response = Invoke-RestMethod -Uri "$Endpoint/api/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.ok -eq $true) {
            return @{
                Status  = "LIVE"
                Version = $response.version
                Uptime  = [math]::Round($response.uptime / 60, 1)
            }
        }
        return @{ Status = "ERROR"; Version = "?"; Uptime = 0 }
    }
    catch {
        return @{ Status = "DOWN"; Version = "-"; Uptime = 0 }
    }
}

# ─── Display Helpers ──────────────────────────────────────────────────────────

function Show-Banner {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════════╗" -ForegroundColor DarkCyan
    Write-Host "  ║        " -ForegroundColor DarkCyan -NoNewline
    Write-Host "HEADY LAYER SWITCHER" -ForegroundColor Cyan -NoNewline
    Write-Host "                      ║" -ForegroundColor DarkCyan
    Write-Host "  ║   " -ForegroundColor DarkCyan -NoNewline
    Write-Host "Sacred Geometry :: Cloud Layer Management" -ForegroundColor DarkGray -NoNewline
    Write-Host "       ║" -ForegroundColor DarkCyan
    Write-Host "  ╚══════════════════════════════════════════════════════╝" -ForegroundColor DarkCyan
    Write-Host ""
}

function Show-LayerIndicator {
    param(
        [string]$LayerId,
        [object]$LayerConfig,
        [bool]$IsActive = $false,
        [object]$Health = $null
    )

    $color = $LayerConfig.color
    $icon = $LayerConfig.icon
    $name = $LayerConfig.name

    # Status indicator
    if ($Health) {
        switch ($Health.Status) {
            "LIVE"  { $statusIcon = "[OK]"; $statusColor = "Green" }
            "DOWN"  { $statusIcon = "[--]"; $statusColor = "Red" }
            "ERROR" { $statusIcon = "[!!]"; $statusColor = "Yellow" }
            default { $statusIcon = "[??]"; $statusColor = "DarkGray" }
        }
    }
    else {
        $statusIcon = "[  ]"
        $statusColor = "DarkGray"
    }

    # Active indicator
    if ($IsActive) {
        Write-Host ("  " + [char]0x25B6 + [char]0x25B6 + [char]0x25B6 + " ") -ForegroundColor White -NoNewline
    }
    else {
        Write-Host "      " -NoNewline
    }

    # Layer icon
    Write-Host "[$icon] " -ForegroundColor $color -NoNewline

    # Layer name
    $nameDisplay = $name.PadRight(25)
    if ($IsActive) {
        Write-Host $nameDisplay -ForegroundColor $color -NoNewline
    }
    else {
        Write-Host $nameDisplay -ForegroundColor DarkGray -NoNewline
    }

    # Health status
    Write-Host $statusIcon -ForegroundColor $statusColor -NoNewline

    # Health details
    if ($Health -and $Health.Status -eq "LIVE") {
        Write-Host " v$($Health.Version) " -ForegroundColor DarkGray -NoNewline
        Write-Host "up $($Health.Uptime)m" -ForegroundColor DarkGray
    }
    elseif ($Health) {
        Write-Host " $($Health.Status)" -ForegroundColor $statusColor
    }
    else {
        Write-Host ""
    }
}

function Show-ActiveLayerBadge {
    $activeId = Get-ActiveLayer
    $config = Load-LayersConfig
    $layer = $config.layers.$activeId

    if (-not $layer) {
        Write-Host "  [?] Unknown layer: $activeId" -ForegroundColor Red
        return
    }

    $color = $layer.color
    $name = $layer.name
    $endpoint = $layer.endpoint

    Write-Host ""
    Write-Host "  Active Layer:" -ForegroundColor DarkGray
    Write-Host "  ┌─────────────────────────────────────────────┐" -ForegroundColor $color
    Write-Host "  │  " -ForegroundColor $color -NoNewline
    Write-Host "[$($layer.icon)] $name" -ForegroundColor $color -NoNewline
    $padding = 42 - $name.Length - $layer.icon.Length - 4
    Write-Host (" " * [Math]::Max($padding, 1)) -NoNewline
    Write-Host "│" -ForegroundColor $color
    Write-Host "  │  " -ForegroundColor $color -NoNewline
    $epDisplay = $endpoint
    if ($epDisplay.Length -gt 39) { $epDisplay = $epDisplay.Substring(0, 39) + ".." }
    Write-Host $epDisplay -ForegroundColor DarkGray -NoNewline
    $padding2 = 42 - $epDisplay.Length - 1
    Write-Host (" " * [Math]::Max($padding2, 1)) -NoNewline
    Write-Host "│" -ForegroundColor $color
    Write-Host "  └─────────────────────────────────────────────┘" -ForegroundColor $color

    # Quick health
    $health = Check-LayerHealth $endpoint
    if ($health.Status -eq "LIVE") {
        Write-Host "  Status: " -ForegroundColor DarkGray -NoNewline
        Write-Host "LIVE" -ForegroundColor Green -NoNewline
        Write-Host " | v$($health.Version) | uptime $($health.Uptime)m" -ForegroundColor DarkGray
    }
    else {
        Write-Host "  Status: " -ForegroundColor DarkGray -NoNewline
        Write-Host "$($health.Status)" -ForegroundColor Red
    }

    if ($layer.git_remote) {
        Write-Host "  Git Remote: " -ForegroundColor DarkGray -NoNewline
        Write-Host "$($layer.git_remote)" -ForegroundColor DarkGray
    }

    Write-Host ""
}

# ─── Actions ──────────────────────────────────────────────────────────────────

function Action-Status {
    Show-Banner
    Show-ActiveLayerBadge
}

function Action-List {
    Show-Banner
    $config = Load-LayersConfig
    $activeId = Get-ActiveLayer

    Write-Host "  All Layers:" -ForegroundColor DarkGray
    Write-Host "  ────────────────────────────────────────────────" -ForegroundColor DarkGray

    $layerIds = @("local", "cloud-me", "cloud-sys", "cloud-conn", "hybrid")
    foreach ($id in $layerIds) {
        $layer = $config.layers.$id
        if (-not $layer) { continue }

        $isActive = ($id -eq $activeId)
        $health = Check-LayerHealth $layer.endpoint
        Show-LayerIndicator -LayerId $id -LayerConfig $layer -IsActive $isActive -Health $health
    }

    Write-Host ""
    Write-Host "  ────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "  Switch: " -ForegroundColor DarkGray -NoNewline
    Write-Host "hl switch <layer-id>" -ForegroundColor White
    Write-Host "  IDs:    " -ForegroundColor DarkGray -NoNewline
    Write-Host "local | cloud-me | cloud-sys | cloud-conn | hybrid" -ForegroundColor DarkGray
    Write-Host ""
}

function Action-Switch {
    param([string]$TargetLayer)

    $config = Load-LayersConfig

    if (-not $TargetLayer) {
        Write-Host ""
        Write-Host "  Usage: hl switch <layer-id>" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Available layers:" -ForegroundColor DarkGray
        Write-Host "    local      - Local Dev (localhost:3300)" -ForegroundColor Green
        Write-Host "    cloud-me   - Cloud HeadyMe (Render)" -ForegroundColor Cyan
        Write-Host "    cloud-sys  - Cloud HeadySystems (Render)" -ForegroundColor Magenta
        Write-Host "    cloud-conn - Cloud HeadyConnection (Render)" -ForegroundColor Yellow
        Write-Host "    hybrid     - Hybrid Local+Cloud" -ForegroundColor White
        Write-Host ""
        return
    }

    $layer = $config.layers.$TargetLayer
    if (-not $layer) {
        Write-Host "  ERROR: Unknown layer '$TargetLayer'" -ForegroundColor Red
        Write-Host "  Valid: local, cloud-me, cloud-sys, cloud-conn, hybrid" -ForegroundColor DarkGray
        return
    }

    $previousId = Get-ActiveLayer
    $previousLayer = $config.layers.$previousId

    # Health check before switching
    Write-Host ""
    Write-Host "  Checking target layer health..." -ForegroundColor DarkGray
    $health = Check-LayerHealth $layer.endpoint

    if ($health.Status -ne "LIVE") {
        Write-Host "  WARNING: $($layer.name) is $($health.Status)" -ForegroundColor Yellow
        Write-Host "  Switching anyway (you may experience connectivity issues)" -ForegroundColor DarkGray
    }

    # Perform switch
    Set-ActiveLayer $TargetLayer

    # Update environment variable for current session
    $env:HEADY_ACTIVE_LAYER = $TargetLayer
    $env:HEADY_ACTIVE_ENDPOINT = $layer.endpoint

    # Update the cascade-heady-proxy to use the new endpoint
    $proxyPath = Join-Path $ProjectRoot ".windsurf" "cascade-heady-proxy.py"
    if (Test-Path $proxyPath) {
        $proxyContent = Get-Content $proxyPath -Raw
        $proxyContent = $proxyContent -replace 'HEADY_MANAGER_URL = ".*"', "HEADY_MANAGER_URL = `"$($layer.endpoint)`""
        $proxyContent | Set-Content $proxyPath -Encoding utf8
    }

    Write-Host ""
    Write-Host "  ┌─────────────────────────────────────────────┐" -ForegroundColor $layer.color
    Write-Host "  │  " -ForegroundColor $layer.color -NoNewline
    Write-Host "SWITCHED" -ForegroundColor White -NoNewline
    Write-Host " to " -ForegroundColor DarkGray -NoNewline
    Write-Host "$($layer.name)" -ForegroundColor $layer.color -NoNewline
    $switchPad = 30 - $layer.name.Length
    Write-Host (" " * [Math]::Max($switchPad, 1)) -NoNewline
    Write-Host "│" -ForegroundColor $layer.color
    Write-Host "  └─────────────────────────────────────────────┘" -ForegroundColor $layer.color

    if ($previousLayer) {
        Write-Host "  From: $($previousLayer.name)" -ForegroundColor DarkGray
    }
    Write-Host "  Endpoint: $($layer.endpoint)" -ForegroundColor DarkGray

    if ($health.Status -eq "LIVE") {
        Write-Host "  Status: " -ForegroundColor DarkGray -NoNewline
        Write-Host "LIVE" -ForegroundColor Green -NoNewline
        Write-Host " v$($health.Version)" -ForegroundColor DarkGray
    }

    if ($layer.git_remote) {
        Write-Host "  Git Remote: $($layer.git_remote)" -ForegroundColor DarkGray
    }

    Write-Host ""
    Write-Host "  All Cascade interactions now route to: " -ForegroundColor DarkGray -NoNewline
    Write-Host "$($layer.name)" -ForegroundColor $layer.color
    Write-Host ""
}

function Action-Health {
    Show-Banner
    $config = Load-LayersConfig

    Write-Host "  Health Check (all layers):" -ForegroundColor DarkGray
    Write-Host "  ────────────────────────────────────────────────" -ForegroundColor DarkGray

    $layerIds = @("local", "cloud-me", "cloud-sys", "cloud-conn", "hybrid")
    foreach ($id in $layerIds) {
        $layer = $config.layers.$id
        if (-not $layer) { continue }

        Write-Host "  Checking $($layer.name)..." -ForegroundColor DarkGray -NoNewline
        $health = Check-LayerHealth $layer.endpoint

        # Clear the "Checking..." line
        Write-Host "`r" -NoNewline
        Write-Host "  [$($layer.icon)] " -ForegroundColor $layer.color -NoNewline
        Write-Host "$($layer.name.PadRight(25))" -ForegroundColor $layer.color -NoNewline

        switch ($health.Status) {
            "LIVE" {
                Write-Host "[OK]" -ForegroundColor Green -NoNewline
                Write-Host " v$($health.Version) up $($health.Uptime)m" -ForegroundColor DarkGray
            }
            "DOWN" {
                Write-Host "[--] DOWN" -ForegroundColor Red
            }
            default {
                Write-Host "[!!] $($health.Status)" -ForegroundColor Yellow
            }
        }
    }

    Write-Host "  ────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────

switch ($Action) {
    ""       { Action-Status }
    "status" { Action-Status }
    "list"   { Action-List }
    "switch" { Action-Switch -TargetLayer $Layer }
    "set"    { Action-Switch -TargetLayer $Layer }
    "health" { Action-Health }
    default  { Action-Status }
}
