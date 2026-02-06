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
# ║  FILE: scripts/sync-render-blueprint.ps1                          ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# HEADY RENDER BLUEPRINT SYNC
# Syncs render.yaml to create production services

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  HEADY RENDER BLUEPRINT SYNC" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

$apiKey = "rnd_IHYAR6Ey5PTiOQPo032VKBvXcGcR"
$ownerId = "tea-d5seua718n1s73dva2f0"

Write-Host "`nOwner ID: $ownerId" -ForegroundColor Gray
Write-Host "API Key: $apiKey" -ForegroundColor Gray

Write-Host "`n==================================================" -ForegroundColor Yellow
Write-Host "  MANUAL BLUEPRINT SYNC (FASTEST)" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "`n1. Go to: https://dashboard.render.com/blueprint" -ForegroundColor Gray
Write-Host "2. Click 'New Blueprint Sync'" -ForegroundColor Gray
Write-Host "3. Connect GitHub (HeadyMe/Heady)" -ForegroundColor Gray
Write-Host "4. Select 'main' branch" -ForegroundColor Gray
Write-Host "5. Click 'Sync Blueprint'" -ForegroundColor Gray
Write-Host "`nThis will create:" -ForegroundColor Cyan
Write-Host "  • heady-manager-headyme (web service)" -ForegroundColor Gray
Write-Host "  • heady-conductor-headyme (background worker)" -ForegroundColor Gray
Write-Host "`n==================================================" -ForegroundColor Yellow
Write-Host "  OR USE DIRECT SERVICE CREATION" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Yellow

# Try creating service with minimal config
Write-Host "`nAttempting automated creation..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$serviceConfig = @{
    type = "web_service"
    name = "heady-manager-headyme"
    ownerId = $ownerId
    repo = "https://github.com/HeadyMe/Heady"
    branch = "main"
    buildCommand = "npm install"
    startCommand = "node heady-manager.js"
    serviceDetails = @{
        env = "node"
        plan = "starter"
        envSpecificDetails = @{
            runtime = "node"
        }
    }
    envVars = @(
        @{ key = "PORT"; value = "3300" }
        @{ key = "HEADY_TARGET"; value = "HeadyMe" }
        @{ key = "ENABLE_CODEMAP"; value = "true" }
        @{ key = "JULES_ENABLED"; value = "true" }
        @{ key = "OBSERVER_ENABLED"; value = "true" }
        @{ key = "BUILDER_ENABLED"; value = "true" }
        @{ key = "ATLAS_ENABLED"; value = "true" }
    )
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $serviceConfig
    Write-Host "✅ Service created successfully!" -ForegroundColor Green
    Write-Host "   ID: $($response.service.id)" -ForegroundColor Gray
    Write-Host "   URL: https://$($response.service.name).onrender.com" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  API Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Please use manual Blueprint Sync instead" -ForegroundColor Gray
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Files -> Scan -> Analyze -> Optimize" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
