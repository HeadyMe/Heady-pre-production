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
# ║  FILE: scripts/deploy-unified.ps1                                 ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

param(
    [Parameter()]
    [ValidateSet("HeadyMe", "HeadySystems", "HeadyConnection", "All")]
    [string]$Target = "All",
    
    [switch]$Deploy,
    [switch]$Verify,
    [switch]$Status
)

$ErrorActionPreference = "Stop"
$HeadyRoot = "C:\Users\erich\Heady"

$Targets = @{
    "HeadyMe" = @{ 
        Repo = "git@github.com:HeadyMe/Heady.git"
        Url = "https://github.com/HeadyMe/Heady"
        RenderName = "heady-manager-headyme"
    }
    "HeadySystems" = @{ 
        Repo = "git@github.com:HeadySystems/Heady.git"
        Url = "https://github.com/HeadySystems/Heady"
        RenderName = "heady-manager-headysystems"
    }
    "HeadyConnection" = @{ 
        Repo = "git@github.com:HeadyConnection/Heady.git"
        Url = "https://github.com/HeadyConnection/Heady"
        RenderName = "heady-manager-headyconnection"
    }
}

function Write-HeadyBanner {
    param([string]$Message)
    Write-Host "`n∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor White
    Write-Host "∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞`n" -ForegroundColor Cyan
}

function Deploy-ToTarget {
    param([string]$Name)
    
    $config = $Targets[$Name]
    Write-HeadyBanner "Deploying to $Name"
    
    Set-Location $HeadyRoot
    
    # Ensure remote exists
    $remoteName = $Name.ToLower().Replace("heady", "heady-")
    git remote get-url $remoteName 2>$null || git remote add $remoteName $config.Repo
    
    # Push to target
    Write-Host "Pushing to $Name..." -ForegroundColor Yellow
    git push $remoteName main --force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $Name deployed successfully" -ForegroundColor Green
        Write-Host "   URL: $($config.Url)" -ForegroundColor Gray
        Write-Host "   Render: $($config.RenderName)" -ForegroundColor Gray
    } else {
        Write-Host "❌ $Name deployment failed" -ForegroundColor Red
    }
}

function Verify-Target {
    param([string]$Name)
    
    $config = $Targets[$Name]
    Write-HeadyBanner "Verifying $Name"
    
    try {
        $domainLookup = @{ "heady-manager-headyme" = "headycloud.com"; "heady-manager-headysystems" = "headysystems.com"; "heady-manager-headyconnection" = "headyconnection.com" }
        $fqdn = $domainLookup[$config.RenderName]
        $response = Invoke-RestMethod -Uri "https://$fqdn/api/health" -TimeoutSec 30
        if ($response.ok) {
            Write-Host "✅ $Name is LIVE" -ForegroundColor Green
            Write-Host "   Version: $($response.version)" -ForegroundColor Gray
            Write-Host "   Uptime: $($response.uptime)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️ $Name returned unhealthy status" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $Name unreachable: $_" -ForegroundColor Red
    }
}

function Get-DeploymentStatus {
    Write-HeadyBanner "Heady Deployment Status"
    
    # Cloud status
    Write-Host "`n☁️  CLOUD SYSTEMS" -ForegroundColor Magenta
    try {
        $cloud = Invoke-RestMethod -Uri "https://headysystems.com/api/health" -TimeoutSec 5
        Write-Host "   ✅ HeadySystems: LIVE (v$($cloud.version))" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ HeadySystems: OFFLINE" -ForegroundColor Red
    }
    
    # Remote statuses
    Write-Host "`n☁️  REMOTE SYSTEMS" -ForegroundColor Magenta
    foreach ($name in $Targets.Keys) {
        Verify-Target -Name $name
    }
}

# Main execution
if ($Target -eq "All") {
    $targetList = $Targets.Keys
} else {
    $targetList = @($Target)
}

if ($Deploy) {
    Write-HeadyBanner "HEADY UNIFIED DEPLOYMENT"
    foreach ($t in $targetList) {
        Deploy-ToTarget -Name $t
    }
}

if ($Verify) {
    foreach ($t in $targetList) {
        Verify-Target -Name $t
    }
}

if ($Status) {
    Get-DeploymentStatus
}

Write-HeadyBanner "Files → Scan → Analyze → Optimize"
