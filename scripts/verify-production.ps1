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
# ║  FILE: scripts/verify-production.ps1                              ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# HEADY PRODUCTION VERIFICATION
# Monitors deployment status and verifies endpoints

param(
    [switch]$WaitForDeploy,
    [int]$TimeoutMinutes = 10
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  HEADY PRODUCTION VERIFICATION" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

$services = @{
    "HeadyCloud" = "https://headycloud.com/api/health"
    "HeadySystems" = "https://headysystems.com/api/health"
    "HeadyConnection" = "https://headyconnection.com/api/health"
}

# Check cloud production services
Write-Host "`nChecking PRODUCTION cloud services..." -ForegroundColor Yellow
$allLive = $true

foreach ($svc in $services.GetEnumerator()) {
    try {
        $response = Invoke-RestMethod -Uri $svc.Value -TimeoutSec 30
        if ($response.ok) {
            Write-Host "✅ $($svc.Key): LIVE (v$($response.version))" -ForegroundColor Green
            Write-Host "   URL: $($svc.Value -replace '/api/health','')" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⏳ $($svc.Key): Starting up or not deployed" -ForegroundColor Yellow
        $allLive = $false
    }
}

# Wait mode
if ($WaitForDeploy -and -not $allLive) {
    Write-Host "`n⏳ Waiting for deployment (timeout: ${TimeoutMinutes}min)..." -ForegroundColor Cyan
    $start = Get-Date
    while (-not $allLive -and (Get-Date) -lt $start.AddMinutes($TimeoutMinutes)) {
        Start-Sleep -Seconds 30
        $allLive = $true
        foreach ($svc in $services.GetEnumerator()) {
            try {
                $response = Invoke-RestMethod -Uri $svc.Value -TimeoutSec 30
                if ($response.ok) {
                    Write-Host "✅ $($svc.Key): NOW LIVE!" -ForegroundColor Green
                }
            } catch {
                $allLive = $false
                Write-Host "." -NoNewline -ForegroundColor Yellow
            }
        }
    }
    Write-Host ""
}

Write-Host "`n==================================================" -ForegroundColor Cyan
if ($allLive) {
    Write-Host "  ALL SYSTEMS LIVE!" -ForegroundColor Green
} else {
    Write-Host "  SOME SERVICES STARTING UP..." -ForegroundColor Yellow
    Write-Host "  Check dashboard: https://dashboard.render.com/" -ForegroundColor Gray
}
Write-Host "==================================================" -ForegroundColor Cyan
