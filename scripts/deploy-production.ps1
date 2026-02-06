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
# ║  FILE: scripts/deploy-production.ps1                              ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# HEADY PRODUCTION DEPLOYMENT
# Deploys unified system to Render for live production

param(
    [Parameter()]
    [ValidateSet("HeadyMe", "HeadySystems", "All")]
    [string]$Target = "All"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  HEADY PRODUCTION DEPLOYMENT" -ForegroundColor White
Write-Host "  Sacred Geometry :: Organic Systems :: Breathing Interfaces" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

$RenderServices = @{
    "HeadyMe" = "heady-manager-headyme"
    "HeadySystems" = "heady-manager-headysystems"
}

function Deploy-ToRender {
    param([string]$Name)
    
    $serviceName = $RenderServices[$Name]
    Write-Host "`nDeploying $Name to Render..." -ForegroundColor Yellow
    
    # Trigger Render deploy via API (requires RENDER_API_KEY)
    if ($env:RENDER_API_KEY) {
        $headers = @{
            "Authorization" = "Bearer $env:RENDER_API_KEY"
            "Content-Type" = "application/json"
        }
        
        try {
            # Get service ID
            $services = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Headers $headers
            $service = $services | Where-Object { $_.service.name -eq $serviceName }
            
            if ($service) {
                # Trigger deploy
                Invoke-RestMethod -Uri "https://api.render.com/v1/services/$($service.service.id)/deploys" -Method POST -Headers $headers
                Write-Host "✅ $Name deployment triggered on Render" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Service $serviceName not found. Manual deploy required." -ForegroundColor Yellow
                Write-Host "   Deploy via: https://dashboard.render.com/" -ForegroundColor Gray
            }
        } catch {
            Write-Host "❌ Render API error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "ℹ️  RENDER_API_KEY not set. Manual deployment required." -ForegroundColor Cyan
        Write-Host "   1. Go to https://dashboard.render.com/" -ForegroundColor Gray
        Write-Host "   2. Find service: $serviceName" -ForegroundColor Gray
        Write-Host "   3. Click 'Manual Deploy' > 'Deploy latest commit'" -ForegroundColor Gray
    }
}

function Verify-Production {
    param([string]$Name)
    
    $serviceName = $RenderServices[$Name]
    $url = "https://$serviceName.onrender.com/api/health"
    
    Write-Host "`nVerifying $Name at $url..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 60
        if ($response.ok) {
            Write-Host "✅ $Name is LIVE in production!" -ForegroundColor Green
            Write-Host "   Version: $($response.version)" -ForegroundColor Gray
            Write-Host "   Uptime: $($response.uptime) seconds" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host "⏳ $Name starting up... (Render takes ~2-5 mins)" -ForegroundColor Yellow
        return $false
    }
}

# Main execution
if ($Target -eq "All") {
    $targetList = $RenderServices.Keys
} else {
    $targetList = @($Target)
}

Write-Host "`nTargets: $($targetList -join ', ')" -ForegroundColor Cyan

# Deploy
foreach ($t in $targetList) {
    Deploy-ToRender -Name $t
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT INITIATED" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "`nProduction URLs:" -ForegroundColor White
foreach ($t in $targetList) {
    Write-Host "  • $t : https://$($RenderServices[$t]).onrender.com" -ForegroundColor Gray
}

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait 2-5 minutes for Render build" -ForegroundColor Gray
Write-Host "  2. Run: .\scripts\verify-production.ps1" -ForegroundColor Gray
Write-Host "  3. Check health: curl https://<service>.onrender.com/api/health" -ForegroundColor Gray

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Files -> Scan -> Analyze -> Optimize" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
