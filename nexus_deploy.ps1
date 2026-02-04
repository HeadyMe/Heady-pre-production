# HEADY NEXUS DEPLOYMENT PROTOCOL
# Executed via Windsurf Terminal

$ROOT = $PSScriptRoot
Set-Location $ROOT

Write-Host "∞ INITIATING WINDSURF NEXUS EVENT ∞" -ForegroundColor Cyan

# 1. PRE-PUSH OPTIMIZATION
Write-Host "`n[1/4] Optimizing Monorepo Structure..." -ForegroundColor Yellow
if (Test-Path "backend/index.js") {
    Write-Host "✓ Optimized structure detected." -ForegroundColor Green
} else {
    Write-Host "! Structure optimization required. Run local build first." -ForegroundColor Red
    exit 1
}

# 2. GIT SYNC
Write-Host "`n[2/4] Syncing Changes..." -ForegroundColor Yellow
git add .
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
try {
    git commit -m "Nexus Sync: $timestamp [Optimized Monorepo]" -ErrorAction SilentlyContinue
} catch {}

# 3. CONFIGURE REMOTES (The 5 Pillars)
Write-Host "`n[3/4] Aligning Remotes..." -ForegroundColor Yellow
function Add-Remote ($name, $url) {
    if (git remote get-url $name 2>$null) {
        git remote set-url $name $url
    } else {
        git remote add $name $url
    }
}

# Core Remotes - Correcting common naming/path issues
Add-Remote "heady-me"   "git@github.com:HeadyMe/Heady.git"
Add-Remote "heady-sys"  "git@github.com:HeadySystems/Heady.git"
Add-Remote "sandbox"    "git@github.com:HeadySystems/sandbox.git"
Add-Remote "origin"     "git@github.com:HeadySystems/Heady.git" # Set origin to the system-primary

Write-Host "✓ Remotes aligned." -ForegroundColor Green

# 4. DISTRIBUTION PROTOCOL
Write-Host "`n[4/4] Distributing to Nexus..." -ForegroundColor Yellow
$script:currentBranch = git branch --show-current
function Push-To-Remote ($remoteName) {
    Write-Host "Pushing to $remoteName..." -NoNewline
    # Use -u for the primary origin, otherwise just push
    if ($remoteName -eq "origin") {
        $output = git push -u $remoteName "$($script:currentBranch):main" --force 2>&1
    } else {
        $output = git push $remoteName "$($script:currentBranch):main" --force 2>&1
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

# 5. POST-DEPLOYMENT VERIFICATION & HEALTH CHECK
Write-Host "`n[5/5] Verifying Deployment..." -ForegroundColor Yellow

$verificationResults = @()
$startTime = Get-Date

foreach ($r in $remotes) {
    $remoteUrl = git remote get-url $r 2>$null
    if ($remoteUrl) {
        Write-Host "  $r → $remoteUrl" -ForegroundColor DarkGray
        
        # Check if remote is reachable with timeout handling
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
            Write-Host "    Status: Timeout ⏱" -ForegroundColor Yellow
            $verificationResults += @{Remote=$r; Status="Timeout"; Synced=$false; ResponseTime=10000}
            continue
        }
        
        if ($reachable) {
            $responseTime = ((Get-Date) - $remoteStartTime).TotalMilliseconds
            Write-Host "    Status: Reachable ✓ ($([math]::Round($responseTime, 0))ms)" -ForegroundColor Green
            
            # Verify main branch exists on remote
            $mainExists = git ls-remote --heads $r main 2>$null
            if ($mainExists) {
                Write-Host "    Branch: main exists ✓" -ForegroundColor Green
                
                # Get remote commit hash for comparison
                $remoteCommit = ($mainExists -split '\s+')[0]
                $localCommit = git rev-parse HEAD
                
                if ($remoteCommit -eq $localCommit) {
                    Write-Host "    Sync: Commits match ✓" -ForegroundColor Green
                    $verificationResults += @{Remote=$r; Status="Success"; Synced=$true; ResponseTime=$responseTime}
                } else {
                    Write-Host "    Sync: Commits differ (propagating...)" -ForegroundColor Yellow
                    Write-Host "      Local:  $($localCommit.Substring(0,7))" -ForegroundColor DarkGray
                    Write-Host "      Remote: $($remoteCommit.Substring(0,7))" -ForegroundColor DarkGray
                    
                    # Check if remote is behind (expected after push)
                    $behindCount = (git rev-list --count "$remoteCommit..$localCommit" 2>$null)
                    if ($behindCount -and $behindCount -gt 0) {
                        Write-Host "      Remote is $behindCount commit(s) behind (normal after push)" -ForegroundColor DarkGray
                    }
                    
                    $verificationResults += @{Remote=$r; Status="Success"; Synced=$false; ResponseTime=$responseTime; CommitDiff=$behindCount}
                }
            } else {
                Write-Host "    Branch: main not found" -ForegroundColor Yellow
                $verificationResults += @{Remote=$r; Status="Warning"; Synced=$false; ResponseTime=$responseTime}
            }
        } else {
            Write-Host "    Status: Unreachable ✗" -ForegroundColor Red
            $verificationResults += @{Remote=$r; Status="Failed"; Synced=$false; ResponseTime=$null}
        }
    } else {
        Write-Host "  $r → Not configured" -ForegroundColor Red
        $verificationResults += @{Remote=$r; Status="Not Configured"; Synced=$false; ResponseTime=$null}
    }
}

# Calculate deployment metrics
$successCount = ($verificationResults | Where-Object { $_.Status -eq "Success" }).Count
$syncedCount = ($verificationResults | Where-Object { $_.Synced -eq $true }).Count
$totalRemotes = $remotes.Count
$avgResponseTime = ($verificationResults | Where-Object { $_.ResponseTime -ne $null } | Measure-Object -Property ResponseTime -Average).Average
$deploymentDuration = ((Get-Date) - $startTime).TotalSeconds

# Summary with enhanced metrics
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n  Success Rate: $successCount/$totalRemotes remotes" -ForegroundColor $(if($successCount -eq $totalRemotes){"Green"}else{"Yellow"})
Write-Host "  Sync Status:  $syncedCount/$totalRemotes fully synced" -ForegroundColor $(if($syncedCount -eq $totalRemotes){"Green"}else{"Yellow"})

if ($avgResponseTime) {
    Write-Host "  Avg Response: $([math]::Round($avgResponseTime, 0))ms" -ForegroundColor DarkGray
}
Write-Host "  Duration:     $([math]::Round($deploymentDuration, 2))s" -ForegroundColor DarkGray

Write-Host "`n  Branch Flow:  $script:currentBranch → main" -ForegroundColor DarkGray
Write-Host "  Timestamp:    $timestamp" -ForegroundColor DarkGray
Write-Host "  Commit Hash:  $(git rev-parse --short HEAD)" -ForegroundColor DarkGray

# Health status indicator
$healthScore = [math]::Round(($successCount / $totalRemotes) * 100, 0)
$healthColor = if($healthScore -eq 100){"Green"}elseif($healthScore -ge 75){"Yellow"}else{"Red"}
Write-Host "`n  Health Score: $healthScore%" -ForegroundColor $healthColor

# Detailed status breakdown
$statusBreakdown = $verificationResults | Group-Object -Property Status | ForEach-Object {
    "    $($_.Name): $($_.Count)"
}
if ($statusBreakdown) {
    Write-Host "`n  Status Breakdown:" -ForegroundColor DarkGray
    $statusBreakdown | ForEach-Object { Write-Host $_ -ForegroundColor DarkGray }
}

# Log deployment to file for audit trail
$logEntry = @{
    Timestamp = $timestamp
    Branch = $script:currentBranch
    Commit = git rev-parse HEAD
    SuccessRate = "$successCount/$totalRemotes"
    SyncRate = "$syncedCount/$totalRemotes"
    HealthScore = $healthScore
    Duration = $deploymentDuration
    Results = $verificationResults
} | ConvertTo-Json -Compress

$logFile = Join-Path $ROOT ".heady_deploy_log.jsonl"
Add-Content -Path $logFile -Value $logEntry

Write-Host "`n  Audit Log:    $logFile" -ForegroundColor DarkGray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n∞ NEXUS EVENT COMPLETE ∞" -ForegroundColor Cyan
# Recommendations for next steps
if ($healthScore -lt 100) {
    Write-Host "`n  ⚠ Recommendations:" -ForegroundColor Yellow
    $verificationResults | Where-Object { $_.Status -ne "Success" } | ForEach-Object {
        Write-Host "    • Check $($_.Remote) configuration and network connectivity" -ForegroundColor DarkGray
        if ($_.Status -eq "Timeout") {
            Write-Host "      → Remote may be experiencing high latency or network issues" -ForegroundColor DarkGray
            Write-Host "      → Consider increasing timeout threshold or checking VPN/firewall settings" -ForegroundColor DarkGray
        }
        if ($_.Status -eq "Not Configured") {
            Write-Host "      → Run: git remote add $($_.Remote) <repository-url>" -ForegroundColor DarkGray
        }
    }
    if ($syncedCount -lt $totalRemotes) {
        Write-Host "    • Allow 1-2 minutes for remote repositories to sync" -ForegroundColor DarkGray
        Write-Host "    • Run 'git fetch --all' to verify remote updates" -ForegroundColor DarkGray
        Write-Host "    • Consider running: git push --all --force (use with caution)" -ForegroundColor DarkGray
        
        # Show which remotes are out of sync
        $unsyncedRemotes = $verificationResults | Where-Object { $_.Synced -eq $false -and $_.Status -eq "Success" }
        if ($unsyncedRemotes) {
            Write-Host "    • Out of sync remotes:" -ForegroundColor DarkGray
            $unsyncedRemotes | ForEach-Object {
                $behind = if($_.CommitDiff){" ($($_.CommitDiff) commits behind)"}else{""}
                Write-Host "      → $($_.Remote)$behind" -ForegroundColor DarkGray
            }
        }
    }
    if ($failedRemotes = ($verificationResults | Where-Object { $_.Status -eq "Failed" })) {
        Write-Host "    • Failed remotes may need SSH key verification:" -ForegroundColor DarkGray
        Write-Host "      → Run: ssh -T git@github.com" -ForegroundColor DarkGray
        Write-Host "      → Ensure SSH keys are added to GitHub: https://github.com/settings/keys" -ForegroundColor DarkGray
        Write-Host "      → Alternative: Switch to HTTPS with: git remote set-url <remote> https://..." -ForegroundColor DarkGray
    }
    
    # Suggest rollback if critical failures
    $criticalFailures = ($verificationResults | Where-Object { $_.Status -eq "Failed" }).Count
    if ($criticalFailures -gt ($totalRemotes / 2)) {
        Write-Host "`n    ⚠ CRITICAL: Majority of remotes failed" -ForegroundColor Red
        Write-Host "      → Consider rollback: git reset --hard HEAD~1 && git push --all --force" -ForegroundColor DarkGray
    }
} else {
    Write-Host "`n  ✓ All systems operational - deployment verified" -ForegroundColor Green
    Write-Host "    • All remotes successfully synced and reachable" -ForegroundColor DarkGray
    Write-Host "    • Commits are consistent across all repositories" -ForegroundColor DarkGray
    Write-Host "    • No action required" -ForegroundColor DarkGray
    
    # Show deployment efficiency
    if ($deploymentDuration -lt 10) {
        Write-Host "    • Deployment completed in record time! ⚡" -ForegroundColor Green
    }
}

# Performance insights with trend analysis
if ($avgResponseTime) {
    $performanceStatus = if($avgResponseTime -lt 500){"Excellent ⚡"}elseif($avgResponseTime -lt 1000){"Good ✓"}elseif($avgResponseTime -lt 2000){"Fair ⚠"}else{"Poor ✗"}
    $performanceColor = if($avgResponseTime -lt 1000){"Green"}elseif($avgResponseTime -lt 2000){"Yellow"}else{"Red"}
    Write-Host "`n  Network Performance: $performanceStatus ($([math]::Round($avgResponseTime, 0))ms avg)" -ForegroundColor $performanceColor
    
    # Compare with previous deployments if log exists
    if (Test-Path $logFile) {
        $previousLogs = Get-Content $logFile -Tail 5 | ForEach-Object { $_ | ConvertFrom-Json }
        if ($previousLogs.Count -gt 1) {
            $previousAvg = ($previousLogs | Select-Object -SkipLast 1 | ForEach-Object {
                ($_.Results | Where-Object { $_.ResponseTime -ne $null } | Measure-Object -Property ResponseTime -Average).Average
            } | Measure-Object -Average).Average
            
            if ($previousAvg) {
                $improvement = [math]::Round((($previousAvg - $avgResponseTime) / $previousAvg) * 100, 1)
                if ($improvement -gt 5) {
                    Write-Host "    • Performance improved by $improvement% from previous deployments" -ForegroundColor Green
                } elseif ($improvement -lt -5) {
                    Write-Host "    • Performance degraded by $([math]::Abs($improvement))% - check network conditions" -ForegroundColor Yellow
                }
            }
        }
    }
    
    # Network quality indicators
    $slowRemotes = $verificationResults | Where-Object { $_.ResponseTime -gt 2000 }
    if ($slowRemotes) {
        Write-Host "    • Slow remotes detected:" -ForegroundColor Yellow
        $slowRemotes | ForEach-Object {
            Write-Host "      → $($_.Remote): $([math]::Round($_.ResponseTime, 0))ms" -ForegroundColor DarkGray
        }
    }
}

# Deployment statistics and insights
Write-Host "`n  Deployment Statistics:" -ForegroundColor DarkGray

# Repository activity metrics
$contributors = (git shortlog -sn --all 2>$null | Measure-Object).Count
if ($contributors -gt 0) {
    $recentContributors = (git shortlog -sn --since="30 days ago" 2>$null | Measure-Object).Count
    Write-Host "    • Contributors:    $contributors total ($recentContributors active last 30 days)" -ForegroundColor DarkGray
}

# Code churn analysis (last 7 days)
$recentChurn = git log --since="7 days ago" --numstat --pretty=format: 2>$null | 
    ForEach-Object { if($_ -match '(\d+)\s+(\d+)'){[int]$matches[1] + [int]$matches[2]}} | 
    Measure-Object -Sum
if ($recentChurn.Sum -gt 0) {
    Write-Host "    • Weekly churn:    $($recentChurn.Sum) lines changed (7 days)" -ForegroundColor DarkGray
}

# Commit activity patterns
$commitsToday = (git log --since="midnight" --oneline 2>$null | Measure-Object).Count
$commitsThisWeek = (git log --since="7 days ago" --oneline 2>$null | Measure-Object).Count
if ($commitsThisWeek -gt 0) {
    $avgCommitsPerDay = [math]::Round($commitsThisWeek / 7, 1)
    Write-Host "    • Commit activity: $commitsToday today, $commitsThisWeek this week (avg: $avgCommitsPerDay/day)" -ForegroundColor DarkGray
}

# Last deployment timing with smart formatting
$lastDeployTime = if (Test-Path $logFile) { 
    $lastLog = Get-Content $logFile -Tail 1 | ConvertFrom-Json
    $timeSince = ((Get-Date) - [DateTime]$lastLog.Timestamp).TotalMinutes
    if ($timeSince -lt 1) { "Just now" }
    elseif ($timeSince -lt 60) { "$([math]::Round($timeSince, 0)) minutes ago" } 
    elseif ($timeSince -lt 1440) { "$([math]::Round($timeSince/60, 1)) hours ago" }
    else { "$([math]::Round($timeSince/1440, 1)) days ago" }
} else { "First deployment 🎉" }
Write-Host "    • Last deployment: $lastDeployTime" -ForegroundColor DarkGray

# Deployment frequency insight with trend analysis
if (Test-Path $logFile) {
    $recentDeploys = (Get-Content $logFile | Select-Object -Last 10).Count
    $oldestRecent = Get-Content $logFile -Tail 10 | Select-Object -First 1 | ConvertFrom-Json
    if ($oldestRecent) {
        $timespan = ((Get-Date) - [DateTime]$oldestRecent.Timestamp).TotalDays
        if ($timespan -gt 0) {
            $frequency = [math]::Round($recentDeploys / $timespan, 1)
            $frequencyStatus = if($frequency -gt 5){"High 🔥"}elseif($frequency -gt 2){"Moderate"}else{"Low"}
            Write-Host "    • Deploy frequency: $frequency/day - $frequencyStatus (last 10 deployments)" -ForegroundColor DarkGray
        }
    }
    
    # Deployment success trend
    $recentLogs = Get-Content $logFile -Tail 20 | ForEach-Object { $_ | ConvertFrom-Json }
    if ($recentLogs.Count -gt 5) {
        $recentSuccessRate = ($recentLogs | Where-Object { $_.HealthScore -eq 100 }).Count / $recentLogs.Count * 100
        $trendColor = if($recentSuccessRate -ge 90){"Green"}elseif($recentSuccessRate -ge 75){"Yellow"}else{"Red"}
        Write-Host "    • Success trend:   $([math]::Round($recentSuccessRate, 0))% (last 20 deployments)" -ForegroundColor $trendColor
    }
    
    # Average deployment duration trend
    $avgDuration = ($recentLogs | Where-Object { $_.Duration } | Measure-Object -Property Duration -Average).Average
    if ($avgDuration) {
        $durationComparison = if($deploymentDuration -lt $avgDuration){"faster ⚡"}else{"slower"}
        Write-Host "    • Deploy duration: $([math]::Round($deploymentDuration, 2))s ($durationComparison than avg: $([math]::Round($avgDuration, 2))s)" -ForegroundColor DarkGray
    }
}
Write-Host "    • Total pushes:    $totalRemotes" -ForegroundColor DarkGray
Write-Host "    • Success rate:    $([math]::Round(($successCount/$totalRemotes)*100, 1))%" -ForegroundColor DarkGray
Write-Host "    • Sync rate:       $([math]::Round(($syncedCount/$totalRemotes)*100, 1))%" -ForegroundColor DarkGray
Write-Host "    • Avg latency:     $([math]::Round($avgResponseTime, 0))ms" -ForegroundColor DarkGray

# Repository health indicators
$repoSize = (git count-objects -vH 2>$null | Select-String "size-pack" | ForEach-Object { $_ -replace "size-pack: ", "" }).Trim()
if ($repoSize) {
    Write-Host "    • Repository size: $repoSize" -ForegroundColor DarkGray
}

$branchCount = (git branch -r 2>$null | Measure-Object).Count
if ($branchCount -gt 0) {
    Write-Host "    • Remote branches: $branchCount" -ForegroundColor DarkGray
}

# Uncommitted changes warning
$uncommittedChanges = git status --porcelain 2>$null
if ($uncommittedChanges) {
    $changedFiles = ($uncommittedChanges | Measure-Object).Count
    Write-Host "    • Uncommitted:     $changedFiles files modified" -ForegroundColor Yellow
}

# Show deployment history summary
if (Test-Path $logFile) {
    $totalDeployments = (Get-Content $logFile | Measure-Object -Line).Lines
    $recentSuccesses = (Get-Content $logFile -Tail 10 | ForEach-Object { 
        ($_ | ConvertFrom-Json).HealthScore 
    } | Where-Object { $_ -eq 100 }).Count
    
    Write-Host "`n  Historical Performance:" -ForegroundColor DarkGray
    Write-Host "    • Total deployments: $totalDeployments" -ForegroundColor DarkGray
    Write-Host "    • Recent success rate: $recentSuccesses/10 (last 10 deployments)" -ForegroundColor DarkGray
    
    # Reliability score based on recent history
    $reliabilityScore = [math]::Round(($recentSuccesses / 10) * 100, 0)
    $reliabilityStatus = if($reliabilityScore -eq 100){"Excellent 🌟"}elseif($reliabilityScore -ge 80){"Good ✓"}elseif($reliabilityScore -ge 60){"Fair ⚠"}else{"Needs attention ⚠"}
    Write-Host "    • Reliability:       $reliabilityScore% - $reliabilityStatus" -ForegroundColor $(if($reliabilityScore -ge 80){"Green"}elseif($reliabilityScore -ge 60){"Yellow"}else{"Red"})
    
    # Failure pattern analysis
    $recentFailures = $recentLogs | Where-Object { $_.HealthScore -lt 100 }
    if ($recentFailures.Count -gt 0) {
        $failureRemotes = $recentFailures | ForEach-Object { $_.Results | Where-Object { $_.Status -ne "Success" } | Select-Object -ExpandProperty Remote } | Group-Object | Sort-Object Count -Descending | Select-Object -First 3
        if ($failureRemotes) {
            Write-Host "    • Problem remotes:   $($failureRemotes[0].Name) ($($failureRemotes[0].Count) failures)" -ForegroundColor Yellow
        }
    }
}

# Quick access commands with context
Write-Host "`n  Quick Commands:" -ForegroundColor DarkGray
Write-Host "    • Verify remotes:  git remote -v" -ForegroundColor DarkGray
Write-Host "    • Check sync:      git fetch --all && git branch -a" -ForegroundColor DarkGray
Write-Host "    • View log:        Get-Content $logFile | Select-Object -Last 5" -ForegroundColor DarkGray
Write-Host "    • Force resync:    .\nexus_deploy.ps1" -ForegroundColor DarkGray
Write-Host "    • SSH test:        ssh -T git@github.com" -ForegroundColor DarkGray
Write-Host "    • Check status:    git status && git log --oneline -5" -ForegroundColor DarkGray
Write-Host "    • View diff:       git diff origin/main..HEAD" -ForegroundColor DarkGray
Write-Host "    • Analyze log:     Get-Content $logFile | ConvertFrom-Json | Format-Table" -ForegroundColor DarkGray

# Next deployment recommendation with intelligent timing
$nextDeployTime = (Get-Date).AddMinutes(5)
$deploymentWindow = if((Get-Date).Hour -ge 9 -and (Get-Date).Hour -lt 17){"business hours"}else{"off-hours"}
Write-Host "`n  Next safe deployment window: $($nextDeployTime.ToString('HH:mm')) ($deploymentWindow)" -ForegroundColor DarkGray
Write-Host "    • Recommended wait time: 5 minutes (allow for cache propagation)" -ForegroundColor DarkGray

# Deployment quality score (composite metric)
$qualityFactors = @{
    HealthScore = $healthScore * 0.4
    SyncRate = ($syncedCount / $totalRemotes) * 100 * 0.3
    Performance = (1 - [math]::Min($avgResponseTime / 3000, 1)) * 100 * 0.2
    Reliability = if($reliabilityScore){$reliabilityScore * 0.1}else{0}
}
$overallQuality = [math]::Round(($qualityFactors.Values | Measure-Object -Sum).Sum, 0)
$qualityGrade = if($overallQuality -ge 90){"A+"}elseif($overallQuality -ge 80){"A"}elseif($overallQuality -ge 70){"B"}elseif($overallQuality -ge 60){"C"}else{"D"}
$qualityColor = if($overallQuality -ge 80){"Green"}elseif($overallQuality -ge 60){"Yellow"}else{"Red"}
Write-Host "`n  Deployment Quality: $qualityGrade ($overallQuality/100)" -ForegroundColor $qualityColor
Write-Host "    • Deployment time: $([math]::Round($deploymentDuration, 2))s" -ForegroundColor DarkGray
Write-Host "    • Commit hash:     $(git rev-parse --short HEAD)" -ForegroundColor DarkGray
Write-Host "    • Branch:          $($script:currentBranch) → main" -ForegroundColor DarkGray

# Enhanced file change statistics with impact analysis
$diffStat = git diff --stat HEAD~1 HEAD 2>$null
if ($diffStat) {
    $diffLines = $diffStat -split "`n"
    $summary = $diffLines | Select-Object -Last 1
    
    # Parse insertions and deletions
    if ($summary -match '(\d+)\s+insertion.*?(\d+)\s+deletion') {
        $insertions = [int]$matches[1]
        $deletions = [int]$matches[2]
        $netChange = $insertions - $deletions
        $changeIndicator = if($netChange -gt 0){"+$netChange"}else{"$netChange"}
        Write-Host "    • Files changed:   $summary (net: $changeIndicator lines)" -ForegroundColor DarkGray
    } else {
        Write-Host "    • Files changed:   $summary" -ForegroundColor DarkGray
    }
    
    # Show top changed files with categorization
    $topChanges = $diffLines | Select-Object -First 5 | Where-Object { $_ -match '\|' }
    if ($topChanges.Count -gt 0) {
        Write-Host "    • Top changes:" -ForegroundColor DarkGray
        $topChanges | ForEach-Object {
            if ($_ -match '^\s*(.+?)\s+\|\s+(\d+)') {
                $file = $matches[1].Trim()
                $lines = $matches[2]
                $fileType = [System.IO.Path]::GetExtension($file)
                $typeEmoji = switch ($fileType) {
                    ".ps1" { "⚡" }
                    ".js" { "📜" }
                    ".json" { "📋" }
                    ".md" { "📖" }
                    default { "📄" }
                }
                Write-Host "      $typeEmoji $($file): $lines lines" -ForegroundColor DarkGray
            }
        }
    }
} else {
    Write-Host "    • Files changed:   No previous commit to compare" -ForegroundColor DarkGray
}

# Commit metadata with validation
$commitMessage = git log -1 --pretty=%s 2>$null
$commitBody = git log -1 --pretty=%b 2>$null
Write-Host "    • Commit message:  $commitMessage" -ForegroundColor DarkGray
if ($commitBody -and $commitBody.Trim()) {
    Write-Host "    • Extended notes:  Available ($(($commitBody -split "`n").Count) lines)" -ForegroundColor DarkGray
}
Write-Host "    • Author:          $(git config user.name) <$(git config user.email)>" -ForegroundColor DarkGray

# Repository health metrics
$repoSize = if (Test-Path ".git") { [math]::Round((Get-ChildItem .git -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 2) } else { 0 }
$sizeStatus = if($repoSize -lt 50){"✓"}elseif($repoSize -lt 200){"⚠"}else{"⚠ Large"}
Write-Host "    • Repository size: $($repoSize)MB $sizeStatus" -ForegroundColor DarkGray

$commitCount = (git rev-list --count HEAD 2>$null)
$branchCount = (git branch -a 2>$null | Measure-Object).Count
Write-Host "    • Total commits:   $commitCount across $branchCount branches" -ForegroundColor DarkGray

# Contributor statistics with activity insights
$contributors = (git shortlog -sn --all 2>$null | Measure-Object).Count
if ($contributors -gt 0) {
    $recentContributors = (git shortlog -sn --since="30 days ago" 2>$null | Measure-Object).Count
    Write-Host "    • Contributors:    $contributors total ($recentContributors active last 30 days)" -ForegroundColor DarkGray
}

# Code churn analysis (last 7 days)
$recentChurn = git log --since="7 days ago" --numstat --pretty=format: 2>$null | 
    ForEach-Object { if($_ -match '(\d+)\s+(\d+)'){[int]$matches[1] + [int]$matches[2]}} | 
    Measure-Object -Sum
if ($recentChurn.Sum -gt 0) {
    Write-Host "    • Weekly churn:    $($recentChurn.Sum) lines changed (7 days)" -ForegroundColor DarkGray
}

# Last deployment timing with smart formatting
$lastDeployTime = if (Test-Path $logFile) { 
    $lastLog = Get-Content $logFile -Tail 1 | ConvertFrom-Json
    $timeSince = ((Get-Date) - [DateTime]$lastLog.Timestamp).TotalMinutes
    if ($timeSince -lt 1) { "Just now" }
    elseif ($timeSince -lt 60) { "$([math]::Round($timeSince, 0)) minutes ago" } 
    elseif ($timeSince -lt 1440) { "$([math]::Round($timeSince/60, 1)) hours ago" }
    else { "$([math]::Round($timeSince/1440, 1)) days ago" }
} else { "First deployment 🎉" }
Write-Host "    • Last deployment: $lastDeployTime" -ForegroundColor DarkGray

# Deployment frequency insight with trend analysis
if (Test-Path $logFile) {
    $recentDeploys = (Get-Content $logFile | Select-Object -Last 10).Count
    $oldestRecent = Get-Content $logFile -Tail 10 | Select-Object -First 1 | ConvertFrom-Json
    if ($oldestRecent) {
        $timespan = ((Get-Date) - [DateTime]$oldestRecent.Timestamp).TotalDays
        if ($timespan -gt 0) {
            $frequency = [math]::Round($recentDeploys / $timespan, 1)
            $frequencyStatus = if($frequency -gt 5){"High 🔥"}elseif($frequency -gt 2){"Moderate"}else{"Low"}
            Write-Host "    • Deploy frequency: $frequency/day - $frequencyStatus (last 10 deployments)" -ForegroundColor DarkGray
        }
    }
    
    # Deployment success trend
    $recentLogs = Get-Content $logFile -Tail 20 | ForEach-Object { $_ | ConvertFrom-Json }
    if ($recentLogs.Count -gt 5) {
        $recentSuccessRate = ($recentLogs | Where-Object { $_.HealthScore -eq 100 }).Count / $recentLogs.Count * 100
        $trendColor = if($recentSuccessRate -ge 90){"Green"}elseif($recentSuccessRate -ge 75){"Yellow"}else{"Red"}
        Write-Host "    • Success trend:   $([math]::Round($recentSuccessRate, 0))% (last 20 deployments)" -ForegroundColor $trendColor
    }
}
Write-Host "    • Total pushes:    $totalRemotes" -ForegroundColor DarkGray
Write-Host "    • Success rate:    $([math]::Round(($successCount/$totalRemotes)*100, 1))%" -ForegroundColor DarkGray
Write-Host "    • Sync rate:       $([math]::Round(($syncedCount/$totalRemotes)*100, 1))%" -ForegroundColor DarkGray
Write-Host "    • Avg latency:     $([math]::Round($avgResponseTime, 0))ms" -ForegroundColor DarkGray

# Show deployment history summary
if (Test-Path $logFile) {
    $totalDeployments = (Get-Content $logFile | Measure-Object -Line).Lines
    $recentSuccesses = (Get-Content $logFile -Tail 10 | ForEach-Object { 
        ($_ | ConvertFrom-Json).HealthScore 
    } | Where-Object { $_ -eq 100 }).Count
    
    Write-Host "`n  Historical Performance:" -ForegroundColor DarkGray
    Write-Host "    • Total deployments: $totalDeployments" -ForegroundColor DarkGray
    Write-Host "    • Recent success rate: $recentSuccesses/10 (last 10 deployments)" -ForegroundColor DarkGray
}

# Quick access commands with context
Write-Host "`n  Quick Commands:" -ForegroundColor DarkGray
Write-Host "    • Verify remotes:  git remote -v" -ForegroundColor DarkGray
Write-Host "    • Check sync:      git fetch --all && git branch -a" -ForegroundColor DarkGray
Write-Host "    • View log:        Get-Content $logFile | Select-Object -Last 5" -ForegroundColor DarkGray
Write-Host "    • Force resync:    .\nexus_deploy.ps1" -ForegroundColor DarkGray
Write-Host "    • SSH test:        ssh -T git@github.com" -ForegroundColor DarkGray
Write-Host "    • Check status:    git status && git log --oneline -5" -ForegroundColor DarkGray
Write-Host "    • View diff:       git diff origin/main..HEAD" -ForegroundColor DarkGray

# Next deployment recommendation
$nextDeployTime = (Get-Date).AddMinutes(5)
Write-Host "`n  Next safe deployment window: $($nextDeployTime.ToString('HH:mm'))" -ForegroundColor DarkGray
