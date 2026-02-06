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
# ║  FILE: scripts/trigger-render-deploy.ps1                          ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# HEADY RENDER DEPLOY - Webhook Trigger
# Uses deploy hooks or dashboard

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  HEADY RENDER DEPLOYMENT TRIGGER" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

# Try deploy hook URLs (if configured)
$deployHooks = @{
    "HeadyMe" = "https://api.render.com/deploy/srv-headyme?key=deploy-hook-key"
    "HeadySystems" = "https://api.render.com/deploy/srv-headysystems?key=deploy-hook-key"
}

Write-Host "`nOpening Render Dashboard for manual deploy..." -ForegroundColor Yellow
Write-Host "GitHub PAT is configured - repos are connected." -ForegroundColor Green

# Open dashboard
Start-Process "https://dashboard.render.com/"

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  MANUAL DEPLOY STEPS:" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "1. Find 'heady-manager-headyme' service" -ForegroundColor Gray
Write-Host "2. Click 'Manual Deploy' → 'Deploy latest commit'" -ForegroundColor Gray
Write-Host "3. Find 'heady-manager-headysystems' service" -ForegroundColor Gray
Write-Host "4. Click 'Manual Deploy' → 'Deploy latest commit'" -ForegroundColor Gray
Write-Host "`nProduction URLs will be:" -ForegroundColor Yellow
Write-Host "  • https://heady-manager-headyme.onrender.com" -ForegroundColor Gray
Write-Host "  • https://heady-manager-headysystems.onrender.com" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan
