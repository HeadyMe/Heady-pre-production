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
# ║  FILE: scripts/start-hybrid.ps1                                   ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# HEADY HYBRID CONTAINER STARTUP
# Builds and starts local containers with cloud connectivity

param(
    [switch]$Build,
    [switch]$CloudOnly,
    [switch]$LocalOnly
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  HEADY HYBRID CONTAINER STARTUP" -ForegroundColor White
Write-Host "  Local Containers + Cloud Live System" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

# Check Docker
Write-Host "`nChecking Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Load environment
if (Test-Path .env.hybrid) {
    Write-Host "✅ Loading hybrid environment..." -ForegroundColor Green
    Get-Content .env.hybrid | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }
} else {
    Write-Host "⚠️  .env.hybrid not found, using defaults" -ForegroundColor Yellow
}

# Build if requested
if ($Build) {
    Write-Host "`n🔨 Building containers..." -ForegroundColor Yellow
    docker-compose -f docker-compose.yml build --no-cache
}

# Start services
Write-Host "`n🚀 Starting Heady Hybrid System..." -ForegroundColor Yellow

if ($LocalOnly) {
    Write-Host "   Mode: LOCAL ONLY" -ForegroundColor Cyan
    docker-compose up -d heady-manager-local heady-redis heady-postgres
} elseif ($CloudOnly) {
    Write-Host "   Mode: CLOUD BRIDGE ONLY" -ForegroundColor Cyan
    docker-compose up -d heady-cloud-bridge
} else {
    Write-Host "   Mode: FULL HYBRID" -ForegroundColor Cyan
    docker-compose up -d
}

# Wait for services
Write-Host "`n⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verify local
Write-Host "`n🔍 Verifying local system..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3300/api/health" -TimeoutSec 10
    if ($response.ok) {
        Write-Host "✅ Local Manager: LIVE (v$($response.version))" -ForegroundColor Green
    }
} catch {
    Write-Host "⏳ Local Manager: Still starting..." -ForegroundColor Yellow
}

# Verify cloud connectivity
Write-Host "`n🌐 Checking cloud connectivity..." -ForegroundColor Yellow
$cloudUrls = @(
    "https://heady-manager-headyme.onrender.com/api/health",
    "https://heady-manager-headysystems.onrender.com/api/health"
)

foreach ($url in $cloudUrls) {
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 10
        if ($response.ok) {
            Write-Host "✅ Cloud: $($url.Split('/')[2]) - LIVE" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Cloud: $($url.Split('/')[2]) - Starting..." -ForegroundColor Yellow
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  HYBRID SYSTEM STATUS" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "`nLocal Endpoints:" -ForegroundColor Yellow
Write-Host "  • Manager: http://localhost:3300" -ForegroundColor Gray
Write-Host "  • Health:  http://localhost:3300/api/health" -ForegroundColor Gray
Write-Host "  • Redis:   localhost:6379" -ForegroundColor Gray
Write-Host "  • Postgres: localhost:5432" -ForegroundColor Gray
Write-Host "`nCloud Endpoints:" -ForegroundColor Yellow
Write-Host "  • HeadyMe: https://heady-manager-headyme.onrender.com" -ForegroundColor Gray
Write-Host "  • HeadySystems: https://heady-manager-headysystems.onrender.com" -ForegroundColor Gray
Write-Host "`nCommands:" -ForegroundColor Yellow
Write-Host "  • View logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "  • Stop: docker-compose down" -ForegroundColor Gray
Write-Host "  • Restart: docker-compose restart" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Files -> Scan -> Analyze -> Optimize" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
