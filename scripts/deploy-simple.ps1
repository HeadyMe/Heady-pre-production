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
# ║  FILE: scripts/deploy-simple.ps1                                  ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# HEADY BRAND DEPLOY
param([string]$Target="All", [switch]$Deploy, [switch]$Verify, [switch]$Status)
$HeadyRoot="C:\Users\erich\Heady"
$Targets=@{
    "HeadyMe"=@{Repo="git@github.com:HeadyMe/Heady.git";RenderName="heady-manager-headyme"}
    "HeadySystems"=@{Repo="git@github.com:HeadySystems/Heady.git";RenderName="heady-manager-headysystems"}
    "HeadyConnection"=@{Repo="git@github.com:HeadyConnection/Heady.git";RenderName="heady-manager-headyconnection"}
}
function Banner($m){Write-Host "`n=== $m ===`n" -ForegroundColor Cyan}
if($Deploy){Banner "DEPLOYING";foreach($t in $Targets.Keys){Set-Location $HeadyRoot;$rn=$t.ToLower().Replace("heady","heady-");try{git remote get-url $rn 2>$null}catch{git remote add $rn $Targets[$t].Repo};git push $rn main --force}}}
if($Status){Banner "STATUS";try{$l=Invoke-RestMethod "http://localhost:3300/api/health" -TimeoutSec 5;Write-Host "LOCAL: LIVE" -ForegroundColor Green}catch{Write-Host "LOCAL: OFFLINE" -ForegroundColor Red}}
Banner "Files -> Scan -> Analyze -> Optimize"
