# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: hcautobuild.ps1
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
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                ║
║     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                ║
║     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 ║
║     ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  ║
║     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   ║
║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   ║
║                                                                               ║
║     ∞ HCAutoBuild - Autonomous Checkpoint System ∞                           ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                         ║
║     Maintains 100% functionality through automated checkpoints                 ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
#>

param(
    [switch]$checkpoint,
    [switch]$status,
    [switch]$monitor,
    [switch]$debug,
    [switch]$verbose,
    [switch]$force,
    [switch]$skipValidation,
    [string]$workspace,
    [switch]$help
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Configuration
$CONFIG = @{
    Workspaces = @("Heady", "CascadeProjects")
    BasePath = "C:\Users\erich\.windsurf\worktrees"
    CheckpointDir = ".heady\checkpoints"
    LogFile = ".heady\hcautobuild.log"
    ConfigFile = ".heady\hcautobuild_config.json"
    MonitorInterval = 300  # 5 minutes
    FunctionalityThreshold = 95
    MaxRetries = 3
}

# Colors for output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Debug = "Magenta"
}

# Utility Functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    if ($verbose -or $debug -or $Level -in @("ERROR", "WARNING")) {
        $color = if ($Colors.ContainsKey($Level)) { $Colors[$Level] } else { "White" }
        Write-Host $logEntry -ForegroundColor $color
    }
    
    # Ensure log directory exists
    $logDir = Split-Path $CONFIG.LogFile -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    }
    
    Add-Content -Path $CONFIG.LogFile -Value $logEntry
}

function Write-Section {
    param([string]$Title)
    Write-Host "`n∞ $Title ∞" -ForegroundColor $Colors.Info
    Write-Host $("═" * ($Title.Length + 4)) -ForegroundColor $Colors.Info
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Get-WorkspacePath {
    param([string]$WorkspaceName)
    return Join-Path $CONFIG.BasePath "$WorkspaceName-$WorkspaceName"
}

function Test-WorkspaceHealth {
    param([string]$WorkspacePath)
    
    Write-Log "Testing workspace health: $WorkspacePath" -Level "DEBUG"
    
    $health = @{
        Status = "Unknown"
        Issues = @()
        Score = 0
        Details = @{}
    }
    
    try {
        Set-Location $WorkspacePath
        
        # Git repository check
        if (Test-Path ".git") {
            $health.Details.GitStatus = git status --porcelain
            if ($LASTEXITCODE -eq 0) {
                $health.Score += 20
                Write-Log "Git repository healthy" -Level "DEBUG"
            } else {
                $health.Issues += "Git repository corrupted"
            }
        } else {
            $health.Issues += "Not a git repository"
        }
        
        # Package.json check (Node.js projects)
        if (Test-Path "package.json") {
            try {
                $packageJson = Get-Content "package.json" | ConvertFrom-Json
                $health.Details.NodeVersion = $packageJson.version
                $health.Score += 20
                
                # Check if node_modules exists and is recent
                if (Test-Path "node_modules") {
                    $modulesAge = (Get-Date) - (Get-Item "node_modules").LastWriteTime
                    if ($modulesAge.Days -lt 7) {
                        $health.Score += 10
                    } else {
                        $health.Issues += "Node modules are old ($( $modulesAge.Days ) days)"
                    }
                } else {
                    $health.Issues += "Node modules not installed"
                }
            } catch {
                $health.Issues += "Invalid package.json"
            }
        }
        
        # Requirements.txt check (Python projects)
        if (Test-Path "requirements.txt") {
            $health.Details.PythonDeps = (Get-Content "requirements.txt").Count
            $health.Score += 20
            
            # Check for virtual environment
            if (Test-Path ".venv" -or Test-Path "venv") {
                $health.Score += 10
            } else {
                $health.Issues += "No virtual environment found"
            }
        }
        
        # Build artifacts check
        $buildDirs = @("dist", "build", ".next", "out")
        foreach ($dir in $buildDirs) {
            if (Test-Path $dir) {
                $health.Details.HasBuildArtifacts = $true
                $health.Score += 10
                break
            }
        }
        
        # Determine overall status
        if ($health.Score -ge 90) {
            $health.Status = "Excellent"
        } elseif ($health.Score -ge 70) {
            $health.Status = "Good"
        } elseif ($health.Score -ge 50) {
            $health.Status = "Fair"
        } else {
            $health.Status = "Poor"
        }
        
    } catch {
        $health.Status = "Error"
        $health.Issues += "Error during health check: $($_.Exception.Message)"
    }
    
    return $health
}

function Test-BuildStatus {
    param([string]$WorkspacePath)
    
    Write-Log "Testing build status: $WorkspacePath" -Level "DEBUG"
    
    $buildStatus = @{
        Success = $false
        Issues = @()
        Duration = 0
        Output = ""
    }
    
    try {
        Set-Location $WorkspacePath
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        # Node.js build
        if (Test-Path "package.json") {
            try {
                if (Test-Command "npm") {
                    $output = npm run build 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        $buildStatus.Success = $true
                        Write-Log "Node.js build successful" -Level "DEBUG"
                    } else {
                        $buildStatus.Issues += "Node.js build failed"
                        $buildStatus.Output = $output
                    }
                } else {
                    $buildStatus.Issues += "npm not available"
                }
            } catch {
                $buildStatus.Issues += "Node.js build error: $($_.Exception.Message)"
            }
        }
        
        # Python build/tests
        if (Test-Path "requirements.txt") {
            try {
                if (Test-Command "python") {
                    $output = python -m pytest --tb=short 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Log "Python tests passed" -Level "DEBUG"
                        if (-not $buildStatus.Success) {
                            $buildStatus.Success = $true
                        }
                    } else {
                        $buildStatus.Issues += "Python tests failed"
                        if (-not $buildStatus.Output) {
                            $buildStatus.Output = $output
                        }
                    }
                } else {
                    $buildStatus.Issues += "Python not available"
                }
            } catch {
                $buildStatus.Issues += "Python test error: $($_.Exception.Message)"
            }
        }
        
        # If no build system found, consider it successful
        if (-not (Test-Path "package.json") -and -not (Test-Path "requirements.txt")) {
            $buildStatus.Success = $true
            Write-Log "No build system detected, assuming success" -Level "DEBUG"
        }
        
    } catch {
        $buildStatus.Issues += "Build test error: $($_.Exception.Message)"
    } finally {
        $stopwatch.Stop()
        $buildStatus.Duration = $stopwatch.Elapsed.TotalSeconds
    }
    
    return $buildStatus
}

function Get-FunctionalityScore {
    param([string]$WorkspacePath)
    
    Write-Log "Calculating functionality score: $WorkspacePath" -Level "DEBUG"
    
    $score = 0
    $maxScore = 100
    $factors = @()
    
    # Health check (40% of score)
    $health = Test-WorkspaceHealth $WorkspacePath
    $healthScore = [math]::Min($health.Score, 40)
    $score += $healthScore
    $factors += "Health: $healthScore/40"
    
    # Build status (30% of score)
    $build = Test-BuildStatus $WorkspacePath
    $buildScore = if ($build.Success) { 30 } else { 0 }
    $score += $buildScore
    $factors += "Build: $buildScore/30"
    
    # Git cleanliness (15% of score)
    try {
        Set-Location $WorkspacePath
        $gitStatus = git status --porcelain
        if ($gitStatus) {
            $gitScore = 5  # Some changes
        } else {
            $gitScore = 15  # Clean working directory
        }
        $score += $gitScore
        $factors += "Git: $gitScore/15"
    } catch {
        $factors += "Git: 0/15 (error)"
    }
    
    # Recent activity (15% of score)
    try {
        Set-Location $WorkspacePath
        $lastCommit = git log -1 --format="%ct" 2>$null
        if ($lastCommit) {
            $commitTime = [UnixEpoch]::Parse($lastCommit)
            $daysSinceCommit = (Get-Date) - $commitTime
            if ($daysSinceCommit.Days -le 7) {
                $activityScore = 15
            } elseif ($daysSinceCommit.Days -le 30) {
                $activityScore = 10
            } else {
                $activityScore = 5
            }
        } else {
            $activityScore = 0
        }
        $score += $activityScore
        $factors += "Activity: $activityScore/15"
    } catch {
        $factors += "Activity: 0/15 (error)"
    }
    
    Write-Log "Functionality score: $score/$maxScore ($($factors -join ', '))" -Level "DEBUG"
    
    return @{
        Score = $score
        MaxScore = $maxScore
        Percentage = [math]::Round(($score / $maxScore) * 100, 1)
        Factors = $factors
        Health = $health
        Build = $build
    }
}

function New-Checkpoint {
    param([string]$WorkspacePath, [hashtable]$FunctionalityScore)
    
    Write-Section "CREATING CHECKPOINT"
    
    $checkpointId = "auto_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    $checkpointPath = Join-Path $WorkspacePath $CONFIG.CheckpointDir
    $checkpointFile = Join-Path $checkpointPath "$checkpointId.json"
    
    # Ensure checkpoint directory exists
    if (-not (Test-Path $checkpointPath)) {
        New-Item -ItemType Directory -Force -Path $checkpointPath | Out-Null
    }
    
    $workspaceName = Split-Path $WorkspacePath -Leaf
    
    $checkpoint = @{
        checkpoint_id = $checkpointId
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        workspace = $workspaceName
        functionality_score = $FunctionalityScore.Percentage
        functionality_details = $FunctionalityScore
        git_commit = $null
        build_status = (if ($FunctionalityScore.Build.Success) { "passed" } else { "failed" })
        health_status = $FunctionalityScore.Health.Status
        changes_since_last = @()
        metadata = @{
            created_by = "HCAutoBuild"
            version = "1.0.0"
            hostname = $env:COMPUTERNAME
            user = $env:USERNAME
        }
    }

    # Get current git commit
    try {
        Set-Location $WorkspacePath
        $checkpoint.git_commit = (git rev-parse HEAD 2>$null)
        $checkpoint.branch = (git rev-parse --abbrev-ref HEAD 2>$null)
        
        # Get changes since last checkpoint
        $lastCheckpointFile = (Get-ChildItem $checkpointPath -Filter "*.json" | 
            Sort-Object LastWriteTime -Descending | Select-Object -Skip 1 -First 1)
        
        if ($lastCheckpointFile) {
            try {
                $lastCheckpoint = (Get-Content $lastCheckpointFile.FullName | ConvertFrom-Json)
                if ($lastCheckpoint.git_commit) {
                    $changes = (git diff --name-only $lastCheckpoint.git_commit HEAD 2>$null)
                    if ($changes) {
                        $checkpoint.changes_since_last = ($changes -split "`n")
                    }
                }
            } catch {
                Write-Log "Could not determine changes since last checkpoint" -Level "WARNING"
            }
        }
    } catch {
        Write-Log "Git information unavailable" -Level "WARNING"
    }
    
    # Save checkpoint
    try {
        $checkpointJson = ($checkpoint | ConvertTo-Json -Depth 10)
        $checkpointJson | Set-Content $checkpointFile
        Write-Log "Checkpoint saved: $checkpointFile" -Level "INFO"
        Write-Host "✓ Checkpoint created: $checkpointId" -ForegroundColor $Colors.Success
        Write-Host "  Functionality: $($FunctionalityScore.Percentage)%" -ForegroundColor $Colors.Info
        Write-Host "  Location: $checkpointFile" -ForegroundColor $Colors.Info
        
        return $checkpoint
    } catch {
        Write-Log "Failed to save checkpoint: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

function Invoke-CommitAndPush {
    param([string]$WorkspacePath, [string]$Message)
    
    Write-Log "Committing and pushing changes: $WorkspacePath" -Level "INFO"
    
    try {
        Set-Location $WorkspacePath
        
        # Stage all changes
        git add .
        
        # Check if there are changes to commit
        $status = (git status --porcelain)
        if ($status) {
            git commit -m $Message
            Write-Log "Changes committed" -Level "INFO"
            
            # Push to all remotes
            $remotes = (git remote)
            foreach ($remote in $remotes) {
                try {
                    git push $remote --all
                    Write-Log "Pushed to $remote" -Level "INFO"
                } catch {
                    Write-Log "Failed to push to $remote`: $($_.Exception.Message)" -Level "WARNING"
                }
            }
        } else {
            Write-Log "No changes to commit" -Level "INFO"
        }
        
        return $true
    } catch {
        Write-Log "Commit/push failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Get-StatusReport {
    $report = @{
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        workspaces = @()
        overall_status = "Unknown"
        overall_functionality = 0
        recommendations = @()
    }
    
    Write-Section "GENERATING STATUS REPORT"
    
    foreach ($workspaceName in $CONFIG.Workspaces) {
        $workspacePath = Get-WorkspacePath $workspaceName
        
        if (-not (Test-Path $workspacePath)) {
            Write-Log "Workspace not found: $workspacePath" -Level "WARNING"
            continue
        }
        
        Write-Host "Analyzing workspace: $workspaceName" -ForegroundColor $Colors.Info
        
        $functionality = Get-FunctionalityScore $workspacePath
        $health = Test-WorkspaceHealth $workspacePath
        
        $workspaceReport = @{
            name = $workspaceName
            path = $workspacePath
            functionality_score = $functionality.Percentage
            health_status = $health.Status
            build_status = (if ($functionality.Build.Success) { "Success" } else { "Failed" })
            issues = $health.Issues
            last_checkpoint = $null
        }
        
        # Get last checkpoint info
        $checkpointPath = Join-Path $workspacePath $CONFIG.CheckpointDir
        if (Test-Path $checkpointPath) {
            $lastCheckpoint = (Get-ChildItem $checkpointPath -Filter "*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1)
            if ($lastCheckpoint) {
                try {
                    $checkpointData = (Get-Content $lastCheckpoint.FullName | ConvertFrom-Json)
                    $workspaceReport.last_checkpoint = @{
                        id = $checkpointData.checkpoint_id
                        timestamp = $checkpointData.timestamp
                        functionality = $checkpointData.functionality_score
                    }
                } catch {
                    Write-Log "Could not read checkpoint: $($lastCheckpoint.FullName)" -Level "DEBUG"
                }
            }
        }
        
        $report.workspaces += $workspaceReport
        $report.overall_functionality += $functionality.Percentage
        
        # Add recommendations
        if ($functionality.Percentage -lt $CONFIG.FunctionalityThreshold) {
            $msg = "Workspace $workspaceName needs attention"
            $report.recommendations += $msg
        }
        
        if ($health.Issues.Count -gt 0) {
            $msg = "Workspace $workspaceName has health issues"
            $report.recommendations += $msg
        }
    }
    
    # Calculate overall status
    if ($report.workspaces.Count -gt 0) {
        $report.overall_functionality = [math]::Round($report.overall_functionality / $report.workspaces.Count, 1)
        
        if ($report.overall_functionality -ge 95) {
            $report.overall_status = "Excellent"
        } elseif ($report.overall_functionality -ge 80) {
            $report.overall_status = "Good"
        } elseif ($report.overall_functionality -ge 60) {
            $report.overall_status = "Fair"
        } else {
            $report.overall_status = "Poor"
        }
    }
    
    return $report
}

function Show-StatusReport {
    param([hashtable]$Report)
    
    Write-Host "`n╔═══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Info
    Write-Host "║                           HCAutoBuild Status Report                        ║" -ForegroundColor $Colors.Info
    Write-Host "║               Generated: $($Report.timestamp)                ║" -ForegroundColor $Colors.Info
    Write-Host "╠══════════════════════════════════════════════════════════════════════════════╣" -ForegroundColor $Colors.Info
    Write-Host "║ Overall Status: $($Report.overall_status.PadRight(55))║" -ForegroundColor $(if($Report.overall_status -eq "Excellent") {$Colors.Success} elseif($Report.overall_status -eq "Good") {$Colors.Info} else {$Colors.Warning})
    Write-Host "║ Functionality: $($Report.overall_functionality.ToString().PadRight(3))%$((' ' * 52))║" -ForegroundColor $(if($Report.overall_functionality -ge 95) {$Colors.Success} elseif($Report.overall_functionality -ge 80) {$Colors.Info} else {$Colors.Warning})
    Write-Host "╠══════════════════════════════════════════════════════════════════════════════╣" -ForegroundColor $Colors.Info
    
    foreach ($workspace in $Report.workspaces) {
        $wsName = $workspace.name.PadRight(15)
        $wsFunc = "$($workspace.functionality_score)%".PadRight(6)
        $wsHealth = $workspace.health_status.PadRight(9)
        $wsBuild = $workspace.build_status.PadRight(7)
        
        Write-Host "║ $wsName | $wsFunc | $wsHealth | $wsBuild ║" -ForegroundColor $Colors.Info
        
        if ($workspace.issues.Count -gt 0) {
            foreach ($issue in $workspace.issues) {
                $truncated = if ($issue.Length -gt 53) { $issue.Substring(0, 50) + "..." } else { $issue }
                Write-Host "║   • $truncated$((' ' * (53 - $truncated.Length)))║" -ForegroundColor $Colors.Warning
            }
        }
    }
    
    Write-Host "╠══════════════════════════════════════════════════════════════════════════════╣" -ForegroundColor $Colors.Info
    
    if ($Report.recommendations.Count -gt 0) {
        Write-Host "║ Recommendations:                                                     ║" -ForegroundColor $Colors.Warning
        foreach ($rec in $Report.recommendations) {
            $truncated = if ($rec.Length -gt 63) { $rec.Substring(0, 60) + "..." } else { $rec }
            Write-Host "║   • $truncated$((' ' * (63 - $truncated.Length)))║" -ForegroundColor $Colors.Warning
        }
    } else {
        Write-Host "║ ✓ All systems operating at optimal levels                             ║" -ForegroundColor $Colors.Success
    }
    
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Info
}

function Start-ContinuousMonitoring {
    Write-Section "STARTING CONTINUOUS MONITORING"
    Write-Host "Monitoring workspaces for changes..." -ForegroundColor $Colors.Info
    Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor $Colors.Warning
    
    $lastStates = @{}
    
    # Initialize last states
    foreach ($workspaceName in $CONFIG.Workspaces) {
        $workspacePath = Get-WorkspacePath $workspaceName
        if (Test-Path $workspacePath) {
            $lastStates[$workspaceName] = Get-FunctionalityScore $workspacePath
        }
    }
    
    try {
        while ($true) {
            Start-Sleep -Seconds $CONFIG.MonitorInterval
            
            Write-Log "Monitoring check - $(Get-Date)" -Level "DEBUG"
            
            foreach ($workspaceName in $CONFIG.Workspaces) {
                $workspacePath = Get-WorkspacePath $workspaceName
                if (-not (Test-Path $workspacePath)) { continue }
                
                $currentState = Get-FunctionalityScore $workspacePath
                $lastState = $lastStates[$workspaceName]
                
                # Check for significant changes
                if ($lastState -and $currentState.Percentage -ne $lastState.Percentage) {
                    Write-Log "Functionality change detected in $workspaceName`: $($lastState.Percentage)% → $($currentState.Percentage)%" -Level "INFO"
                    
                    # If functionality improved to >= 100%, create checkpoint
                    if ($currentState.Percentage -ge 100 -and $lastState.Percentage -lt 100) {
                        Write-Host "🎯 100% functionality achieved in $workspaceName! Creating checkpoint..." -ForegroundColor $Colors.Success
                        $checkpoint = New-Checkpoint $workspacePath $currentState
                        
                        if ($checkpoint) {
                            $commitMsg = "HCAutoBuild Checkpoint $($checkpoint.checkpoint_id) - 100% Functionality"
                            Invoke-CommitAndPush $workspacePath $commitMsg
                        }
                    }
                }
                
                $lastStates[$workspaceName] = $currentState
            }
        }
    } catch [System.Management.Automation.HaltCommandException] {
        Write-Host "`nMonitoring stopped by user" -ForegroundColor $Colors.Warning
    } catch {
        Write-Log "Monitoring error: $($_.Exception.Message)" -Level "ERROR"
    }
}

function Invoke-HCAutoBuild {
    Write-Section "HCAutoBuild - Autonomous Checkpoint System"
    Write-Host "Version: 1.0.0" -ForegroundColor $Colors.Info
    Write-Host "Workspaces: $($CONFIG.Workspaces -join ', ')" -ForegroundColor $Colors.Info
    
    $overallSuccess = $true
    
    foreach ($workspaceName in $CONFIG.Workspaces) {
        if ($workspace -and $workspaceName -ne $workspace) { continue }
        
        $workspacePath = Get-WorkspacePath $workspaceName
        
        if (-not (Test-Path $workspacePath)) {
            Write-Log "Workspace not found: $workspacePath" -Level "ERROR"
            $overallSuccess = $false
            continue
        }
        
        Write-Host "`nProcessing workspace: $workspaceName" -ForegroundColor $Colors.Info
        Write-Host "Path: $workspacePath" -ForegroundColor $Colors.Debug
        
        # Get functionality score
        $functionality = Get-FunctionalityScore $workspacePath
        
        Write-Host "Functionality Score: $($functionality.Percentage)% ($($functionality.Score)/$($functionality.MaxScore))" -ForegroundColor $(if($functionality.Percentage -ge 95) {$Colors.Success} elseif($functionality.Percentage -ge 80) {$Colors.Info} else {$Colors.Warning})
        
        if ($verbose) {
            foreach ($factor in $functionality.Factors) {
                Write-Host "  • $factor" -ForegroundColor $Colors.Debug
            }
        }
        
        # Create checkpoint if at 100% functionality or forced
        if ($functionality.Percentage -ge 100 -or $force) {
            Write-Host "Creating checkpoint..." -ForegroundColor $Colors.Success
            $checkpoint = New-Checkpoint $workspacePath $functionality
            
            if ($checkpoint) {
                # Commit and push changes
                $commitMsg = "HCAutoBuild Checkpoint $($checkpoint.checkpoint_id) - Functionality: $($functionality.Percentage)%"
                if (Invoke-CommitAndPush $workspacePath $commitMsg) {
                    Write-Host "Success: Changes committed and pushed" -ForegroundColor $Colors.Success
                } else {
                    Write-Host "Warning: Commit/push failed" -ForegroundColor $Colors.Warning
                    $overallSuccess = $false
                }
            } else {
                Write-Host "Error: Checkpoint creation failed" -ForegroundColor $Colors.Error
                $overallSuccess = $false
            }
        } else {
            Write-Host "Warning: Functionality below threshold (100 required for checkpoint)" -ForegroundColor $Colors.Warning
        }
    }
    
    return $overallSuccess
}

# Main execution
try {
    if ($help) {
        Write-Host @"
HCAutoBuild - Autonomous Checkpoint System

USAGE:
    .\hcautobuild.ps1 [OPTIONS]

OPTIONS:
    -checkpoint      Create checkpoint regardless of functionality score
    -status          Show detailed status report
    -monitor         Start continuous monitoring mode
    -debug           Enable debug logging
    -verbose         Show detailed output
    -force           Force operations even if conditions not met
    -skipValidation  Skip build/test validation
    -workspace NAME  Process specific workspace only
    -help            Show this help message

EXAMPLES:
    .\hcautobuild.ps1                    # Run full cycle
    .\hcautobuild.ps1 -status           # Show status report
    .\hcautobuild.ps1 -checkpoint       # Force checkpoint creation
    .\hcautobuild.ps1 -monitor          # Start monitoring
    .\hcautobuild.ps1 -workspace Heady  # Process specific workspace

CONFIGURATION:
    Edit the CONFIG hashtable at the top of this script to modify:
    Workspaces to monitor
    Checkpoint directory
    Functionality thresholds
    Monitoring intervals
"@
        exit 0
    }
    
    Write-Log "HCAutoBuild started with parameters: $($PSBoundParameters.Keys -join ', ')" -Level "INFO"
    
    if ($status) {
        $report = Get-StatusReport
        Show-StatusReport $report
        exit 0
    }
    
    if ($monitor) {
        Start-ContinuousMonitoring
        exit 0
    }
    
    if ($checkpoint) {
        Write-Section "FORCE CHECKPOINT MODE"
        $force = $true
    }
    
    $success = Invoke-HCAutoBuild
    
    if ($success) {
        Write-Section "HCAutoBuild COMPLETE"
        Write-Host "✓ All operations completed successfully" -ForegroundColor $Colors.Success
        Write-Host "System is ready for autonomous operation" -ForegroundColor $Colors.Info
        exit 0
    } else {
        Write-Section "HCAutoBuild COMPLETE WITH ISSUES"
        Write-Host "⚠ Some operations failed. Check logs for details." -ForegroundColor $Colors.Warning
        exit 1
    }
    
} catch {
    Write-Log "Fatal error: $($_.Exception.Message)" -Level "ERROR"
    if ($debug) {
        Write-Host "Stack trace:" -ForegroundColor $Colors.Error
        Write-Host $_.ScriptStackTrace -ForegroundColor $Colors.Error
    }
    exit 1
}
