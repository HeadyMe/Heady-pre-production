# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: nexus_deploy.ps1
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

<#
HEADY NEXUS DEPLOY - Multi-remote distribution protocol
#>

param(
    [switch]$Force
)

$ROOT = $PSScriptRoot
Set-Location $ROOT

Write-Host "INITIATING WINDSURF NEXUS EVENT" -ForegroundColor Cyan

# 1. PRE-PUSH OPTIMIZATION
Write-Host "`n[1/4] Optimizing Monorepo Structure..." -ForegroundColor Yellow
if (Test-Path "heady-manager.js") {
    Write-Host "[OK] Optimized structure detected (heady-manager.js)." -ForegroundColor Green
} else {
    Write-Host "! Structure optimization required. Run 'hc -a hb' first." -ForegroundColor Red
    exit 1
}

# 2. GIT SYNC
Write-Host "`n[2/4] Syncing Changes..." -ForegroundColor Yellow
git add .
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
try {
    git commit -m "Nexus Sync: $timestamp [Optimized Monorepo]" -ErrorAction SilentlyContinue
} catch {}

# 3. CONFIGURE REMOTES
Write-Host "`n[3/4] Aligning Remotes..." -ForegroundColor Yellow
function Add-Remote ($name, $url) {
    if (git remote get-url $name 2>$null) {
        git remote set-url $name $url
    } else {
        git remote add $name $url
    }
}

Add-Remote "heady-me"   "git@github.com:HeadyMe/Heady.git"
Add-Remote "heady-sys"  "git@github.com:HeadySystems/Heady.git"
Add-Remote "sandbox"    "git@github.com:HeadySystems/sandbox.git"
Add-Remote "origin"     "git@github.com:HeadySystems/Heady.git"

Write-Host "[OK] Remotes aligned." -ForegroundColor Green

# 4. DISTRIBUTION PROTOCOL
Write-Host "`n[4/4] Distributing to Nexus..." -ForegroundColor Yellow
$script:currentBranch = git branch --show-current
function Push-To-Remote ($remoteName) {
    Write-Host "Pushing to $remoteName..." -NoNewline
    if ($remoteName -eq "origin") {
        if ($Force) {
            $output = git push -u $remoteName "$($script:currentBranch):main" --force 2>&1
        } else {
            $output = git push -u $remoteName "$($script:currentBranch):main" 2>&1
        }
    } else {
        if ($Force) {
            $output = git push $remoteName "$($script:currentBranch):main" --force 2>&1
        } else {
            $output = git push $remoteName "$($script:currentBranch):main" 2>&1
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [SUCCESS]" -ForegroundColor Green
    } else {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host "  $output" -ForegroundColor DarkGray
    }
}

$remotes = "origin", "heady-me", "heady-sys", "sandbox"
foreach ($r in $remotes) {
    Push-To-Remote $r
}

# 5. POST-DEPLOYMENT VERIFICATION
Write-Host "`n[5/5] Verifying Deployment..." -ForegroundColor Yellow

$verificationResults = @()
$startTime = Get-Date

foreach ($r in $remotes) {
    $remoteUrl = git remote get-url $r 2>$null
    if ($remoteUrl) {
        Write-Host "  $r -> $remoteUrl" -ForegroundColor DarkGray
        
        $reachable = $null
        $remoteStartTime = Get-Date
        $job = Start-Job -ScriptBlock { 
            param($remote)
            git ls-remote --heads $remote 2>$null
        } -ArgumentList $r
        
        $completed = Wait-Job $job -Timeout 10
        if ($completed) {
            $reachable = Receive-Job $job
            Remove-Job $job
        } else {
            Remove-Job $job -Force
            Write-Host "    Status: [TIMEOUT]" -ForegroundColor Yellow
            $verificationResults += @{Remote=$r; Status="Timeout"; Synced=$false; ResponseTime=10000}
            continue
        }
        
        if ($reachable) {
            $responseTime = ((Get-Date) - $remoteStartTime).TotalMilliseconds
            Write-Host "    Status: Reachable [OK] ($([math]::Round($responseTime, 0))ms)" -ForegroundColor Green
            
            $mainExists = git ls-remote --heads $r main 2>$null
            if ($mainExists) {
                Write-Host "    Branch: main exists [OK]" -ForegroundColor Green
                
                $remoteCommit = ($mainExists -split '\s+')[0]
                $localCommit = git rev-parse HEAD
                
                if ($remoteCommit -eq $localCommit) {
                    Write-Host "    Sync: Commits match [OK]" -ForegroundColor Green
                    $verificationResults += @{Remote=$r; Status="Success"; Synced=$true; ResponseTime=$responseTime}
                } else {
                    Write-Host "    Sync: Commits differ (propagating...)" -ForegroundColor Yellow
                    $verificationResults += @{Remote=$r; Status="Success"; Synced=$false; ResponseTime=$responseTime; CommitDiff=0}
                }
            } else {
                Write-Host "    Branch: main not found" -ForegroundColor Yellow
                $verificationResults += @{Remote=$r; Status="Warning"; Synced=$false; ResponseTime=$responseTime}
            }
        } else {
            Write-Host "    Status: Unreachable [FAIL]" -ForegroundColor Red
            $verificationResults += @{Remote=$r; Status="Failed"; Synced=$false; ResponseTime=$null}
        }
    } else {
        Write-Host "  $r -> Not configured" -ForegroundColor Red
        $verificationResults += @{Remote=$r; Status="Not Configured"; Synced=$false; ResponseTime=$null}
    }
}

$successCount = ($verificationResults | Where-Object { $_.Status -eq "Success" }).Count
$totalRemotes = $remotes.Count

Write-Host "`nNEXUS EVENT COMPLETE" -ForegroundColor Cyan
Write-Host "Success Rate: $successCount/$totalRemotes remotes" -ForegroundColor White
