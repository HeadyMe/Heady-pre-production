# Heady System Startup & Demonstration Script
# Automates the launch of HeadyMCP services and Sacred Geometry UIs
param (
    [switch]$NonInteractive
)

Write-Host "∞ HEADY SYSTEMS INITIATION SEQUENCE ∞" -ForegroundColor Cyan
Write-Host "Loading Sacred Geometry Protocols..." -ForegroundColor DarkCyan

# 1. Environment Setup
Write-Host "`n[1/5] Verifying Environment..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from example" -ForegroundColor Green
}

# 2. Dependency Check
Write-Host "`n[2/5] Checking Dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies..."
    npm install
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Green
}

# 3. Build/Prepare Assets
Write-Host "`n[3/5] Preparing Sacred Assets..." -ForegroundColor Yellow
# Ensure mcp-servers directory structure exists
New-Item -ItemType Directory -Force -Path "mcp-servers/heady-graph" | Out-Null
New-Item -ItemType Directory -Force -Path "mcp-servers/heady-metrics" | Out-Null
New-Item -ItemType Directory -Force -Path "mcp-servers/heady-workflow" | Out-Null
New-Item -ItemType Directory -Force -Path "mcp-servers/heady-assets" | Out-Null

# 4. Launch Services
Write-Host "`n[4/5] Launching HeadyMCP Cluster..." -ForegroundColor Yellow

# Function to start a background process
function Start-ServiceProcess {
    param($Name, $Script, $Port, $Color)
    Write-Host "Starting $Name on port $Port..." -ForegroundColor $Color
    $proc = Start-Process -FilePath "node" -ArgumentList $Script -PassThru -NoNewWindow
    return $proc
}

# Start MCP Servers
$graph = Start-ServiceProcess "Heady Graph" "mcp-servers/heady-graph/server.js" 3301 "Cyan"
$metrics = Start-ServiceProcess "Heady Metrics" "mcp-servers/heady-metrics/server.js" 3302 "Green"
$workflow = Start-ServiceProcess "Heady Workflow" "mcp-servers/heady-workflow/server.js" 3303 "Magenta"
$assets = Start-ServiceProcess "Heady Assets" "mcp-servers/heady-assets/server.js" 3304 "Yellow"

# Start Backend Service
$backend = Start-ServiceProcess "Heady Backend" "backend/src/index.js" 4000 "Blue"

# Start Heady Manager (Main Entry Point)
Write-Host "Starting Heady Manager Core..." -ForegroundColor White
$npmCmd = if ($IsWindows) { "npm.cmd" } else { "npm" }
$manager = Start-Process -FilePath $npmCmd -ArgumentList "start" -PassThru -NoNewWindow

# 5. Demonstration
Write-Host "`n[5/5] Initiating Visual Interface..." -ForegroundColor Yellow
if (!$NonInteractive) {
    Start-Sleep -Seconds 5
}

$adminUrl = "http://localhost:3300/admin"
$monitorUrl = "http://localhost:3300/monitoring"

Write-Host "`n∞ SYSTEM ACTIVE ∞" -ForegroundColor Cyan
Write-Host "Admin Interface: $adminUrl" -ForegroundColor White
Write-Host "System Monitor:  $monitorUrl" -ForegroundColor White
Write-Host "`nOpening interfaces in browser..."

if (!$NonInteractive) {
    Start-Process $adminUrl
    Start-Process $monitorUrl
}

if (!$NonInteractive) {
    Write-Host "`nPress any key to stop all services..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

    # Cleanup
    Write-Host "`nStopping services..." -ForegroundColor Red
    Stop-Process -Id $graph.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $backend.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $metrics.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $workflow.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $assets.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $manager.Id -ErrorAction SilentlyContinue
    Write-Host "Shutdown complete." -ForegroundColor Green
} else {
    Write-Host "`nServices running in background. Use stop-heady-system.ps1 to stop." -ForegroundColor Yellow
}
