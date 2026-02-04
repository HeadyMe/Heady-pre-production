# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: hc_autobuild.ps1
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
.SYNOPSIS
    HCAutoBuild - Automated Checkpoint & Build System
    
.DESCRIPTION
    Monitors workspaces for 100% functionality, automatically creates checkpoints,
    and manages the build pipeline until no tasks need attention.
    
    Pipeline: Prep → Commit → Push → Verify → Fix (if needed) → Push → Status Report → Standby
    
.PARAMETER Workspace
    Target workspace to monitor and build (default: auto-detect)
    
.PARAMETER Continuous
    Run in continuous monitoring mode until manually stopped
    
.PARAMETER ForceCheckpoint
    Force a checkpoint even if functionality is not at 100%
    
.EXAMPLE
    .\hc_autobuild.ps1                    # Single build cycle
    .\hc_autobuild.ps1 -Continuous        # Continuous monitoring
    .\hc_autobuild.ps1 -ForceCheckpoint   # Force checkpoint creation
#>

param(
    [string]$Workspace = "",
    [switch]$Continuous,
    [switch]$ForceCheckpoint,
    [switch]$StatusOnly
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# ================================================================================
# CONFIGURATION
# ================================================================================
$SCRIPT_VERSION = "1.0.0"
$CHECKPOINT_REGISTRY = ".heady/checkpoints.json"
$STATUS_LOG = ".heady/autobuild.log"
$WORKSPACES = @(
    "C:\Users\erich\.windsurf\worktrees\Heady\Heady-cbd7dddf",
    "C:\Users\erich\.windsurf\worktrees\CascadeProjects\CascadeProjects-cbd7dddf"
)

# Colors for output
$COLOR_INFO = "Cyan"
$COLOR_SUCCESS = "Green"
$COLOR_WARNING = "Yellow"
$COLOR_ERROR = "Red"
$COLOR_DEBUG = "DarkGray"

# ================================================================================
# UTILITY FUNCTIONS
# ================================================================================

function Write-Header($text) {
    Write-Host ""
    Write-Host "∞ $text ∞" -ForegroundColor $COLOR_INFO
    Write-Host ("=" * 60) -ForegroundColor $COLOR_INFO
}

function Write-Step($number, $total, $text) {
    Write-Host "[$number/$total] $text" -ForegroundColor $COLOR_WARNING
}

function Write-Success($text) {
    Write-Host "  ✓ $text" -ForegroundColor $COLOR_SUCCESS
}

function Write-Error($text) {
    Write-Host "  ✗ $text" -ForegroundColor $COLOR_ERROR
}

function Write-Info($text) {
    Write-Host "  → $text" -ForegroundColor $COLOR_DEBUG
}

function Initialize-Logging {
    $logDir = Split-Path $STATUS_LOG -Parent
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] HCAutoBuild v$SCRIPT_VERSION initialized" | Out-File $STATUS_LOG -Append
}

function Write-Log($message, $level = "INFO") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$timestamp] [$level] $message" | Out-File $STATUS_LOG -Append
}

# ================================================================================
# WORKSPACE DETECTION & ANALYSIS
# ================================================================================

function Get-ActiveWorkspaces {
    $active = @()
    foreach ($ws in $WORKSPACES) {
        if (Test-Path "$ws\.git") {
            $active += $ws
        }
    }
    return $active
}

function Get-WorkspaceStatus($workspacePath) {
    Write-Info "Analyzing workspace: $(Split-Path $workspacePath -Leaf)"
    
    Set-Location $workspacePath
    
    $status = @{
        Path = $workspacePath
        Name = Split-Path $workspacePath -Leaf
        HasChanges = $false
        Branch = ""
        CommitHash = ""
        FunctionalityScore = 0
        Issues = @()
        TasksPending = @()
        LastCheckpoint = $null
        CanBuild = $false
        IsFullyFunctional = $false
    }
    
    # Check git status
    $gitStatus = git status --porcelain 2>$null
    $status.HasChanges = ![string]::IsNullOrWhiteSpace($gitStatus)
    $status.Branch = git branch --show-current 2>$null
    $status.CommitHash = git rev-parse --short HEAD 2>$null
    
    # Check for package.json (Node.js projects)
    if (Test-Path "package.json") {
        $pkg = Get-Content "package.json" | ConvertFrom-Json
        $status.HasPackageJson = $true
        $status.ProjectName = $pkg.name
        $status.ProjectVersion = $pkg.version
    }
    
    # Check for Python worker
    if (Test-Path "backend/python_worker") {
        $status.HasPythonWorker = $true
    }
    
    # Check for existing checkpoints
    if (Test-Path $CHECKPOINT_REGISTRY) {
        $registry = Get-Content $CHECKPOINT_REGISTRY | ConvertFrom-Json
        $workspaceCheckpoints = $registry | Where-Object { $_.Workspace -eq $status.Name }
        if ($workspaceCheckpoints) {
            $status.LastCheckpoint = ($workspaceCheckpoints | Sort-Object Timestamp -Descending | Select-Object -First 1).Timestamp
        }
    }
    
    # Calculate base functionality score
    $score = 100
    
    # Check for build scripts
    if (!(Test-Path "commit_and_build.ps1")) {
        $score -= 10
        $status.Issues += "Missing commit_and_build.ps1"
    }
    
    if (!(Test-Path "nexus_deploy.ps1")) {
        $score -= 10
        $status.Issues += "Missing nexus_deploy.ps1"
    }
    
    # Check for render.yaml
    if (!(Test-Path "render.yaml")) {
        $score -= 5
        $status.Issues += "Missing render.yaml"
    }
    
    # Check for critical directories
    if (!(Test-Path "frontend") -and !(Test-Path "src")) {
        $score -= 15
        $status.Issues += "Missing frontend or src directory"
    }
    
    # Check for uncommitted changes (indicates work in progress)
    if ($status.HasChanges) {
        $changedFiles = ($gitStatus -split "`n").Count
        $score -= [Math]::Min(20, $changedFiles * 2)
        $status.TasksPending += "$changedFiles file(s) with uncommitted changes"
    }
    
    # Check for dependency issues
    if (Test-Path "package.json") {
        if (!(Test-Path "node_modules")) {
            $score -= 10
            $status.TasksPending += "node_modules not installed"
        }
    }
    
    # Apply codemap-enhanced scoring
    $enhanced = Get-CodemapEnhancedScore $workspacePath $score
    $status.FunctionalityScore = $enhanced.NewScore
    $status.BaseScore = $score
    $status.ScoreAdjustment = $enhanced.Adjustments
    $status.CodemapIssues = $enhanced.Issues
    $status.CodemapData = $enhanced.Codemap
    
    # Add codemap-derived issues to main issues list
    foreach ($issue in $enhanced.Issues) {
        if (!($status.Issues -contains $issue)) {
            $status.Issues += $issue
        }
    }
    
    $status.IsFullyFunctional = ($status.FunctionalityScore -ge 100)
    $status.CanBuild = ($status.FunctionalityScore -ge 80)
    
    return $status
}

# ================================================================================
# CODEMAP INTEGRATION
# ================================================================================

function Get-CodemapData($workspacePath) {
    $codemapData = @{
        Exists = $false
        Path = $null
        Services = @()
        Infrastructure = @{}
        SecurityIssues = @()
        PerformanceIssues = @()
        Gaps = @()
        Concepts = @()
        Agents = @()
        Tools = @()
        Files = @()
        Metadata = @{}
        ScoreAdjustment = 0
    }
    
    # Check for codemap.json
    $codemapPath = Join-Path $workspacePath ".heady-context\codemap.json"
    if (!(Test-Path $codemapPath)) {
        $codemapPath = Join-Path $workspacePath "codemap.json"
    }
    
    if (Test-Path $codemapPath) {
        try {
            $codemap = Get-Content $codemapPath | ConvertFrom-Json
            $codemapData.Exists = $true
            $codemapData.Path = $codemapPath
            
            # Extract services
            if ($codemap.codemap?.mcp_services) {
                $codemapData.Services = $codemap.codemap.mcp_services.PSObject.Properties | ForEach-Object { $_.Name }
            }
            
            # Extract infrastructure
            if ($codemap.codemap?.infrastructure) {
                $codemapData.Infrastructure = $codemap.codemap.infrastructure
            }
            
            # Extract metadata
            if ($codemap.metadata) {
                $codemapData.Metadata = $codemap.metadata
                if ($codemap.metadata.concepts) {
                    $codemapData.Concepts = $codemap.metadata.concepts
                }
                if ($codemap.metadata.agents) {
                    $codemapData.Agents = $codemap.metadata.agents
                }
                if ($codemap.metadata.tools) {
                    $codemapData.Tools = $codemap.metadata.tools
                }
            }
            
            # Extract files
            if ($codemap.files) {
                $codemapData.Files = $codemap.files | ForEach-Object { 
                    if ($_.path) { $_.path } else { $_ }
                }
            }
            
            Write-Log "Loaded codemap from $codemapPath"
        } catch {
            Write-Log "Failed to parse codemap: $_" "ERROR"
        }
    }
    
    # Check for concept registry
    $conceptPath = Join-Path (Split-Path $workspacePath -Parent) "heady_concept_registry.json"
    if (Test-Path $conceptPath) {
        try {
            $registry = Get-Content $conceptPath | ConvertFrom-Json
            if ($registry.concepts) {
                $concepts = $registry.concepts.PSObject.Properties | ForEach-Object {
                    $_.Value
                }
                $codemapData.Concepts = $concepts
                
                # Calculate concept-based score
                $totalScore = ($concepts | Measure-Object -Property score -Sum).Sum
                $conceptCount = $concepts.Count
                if ($conceptCount -gt 0) {
                    $avgScore = $totalScore / $conceptCount
                    $codemapData.ScoreAdjustment += [Math]::Min(10, $avgScore / 10)
                }
            }
        } catch {
            Write-Log "Failed to parse concept registry: $_" "ERROR"
        }
    }
    
    # Check for project-context.json (from codemap integrator)
    $contextPath = Join-Path $workspacePath ".heady-context\project-context.json"
    if (Test-Path $contextPath) {
        try {
            $context = Get-Content $contextPath | ConvertFrom-Json
            
            # Extract security issues
            if ($context.security) {
                if ($context.security.critical) {
                    $codemapData.SecurityIssues += $context.security.critical | ForEach-Object { 
                        @{Severity="Critical"; Issue=$_}
                    }
                }
                if ($context.security.moderate) {
                    $codemapData.SecurityIssues += $context.security.moderate | ForEach-Object { 
                        @{Severity="Moderate"; Issue=$_}
                    }
                }
            }
            
            # Extract performance issues
            if ($context.performance) {
                $codemapData.PerformanceIssues = $context.performance
            }
            
            # Extract gaps
            if ($context.gaps) {
                $codemapData.Gaps = $context.gaps
            }
            
            Write-Log "Loaded project context from $contextPath"
        } catch {
            Write-Log "Failed to parse project context: $_" "ERROR"
        }
    }
    
    return $codemapData
}

function Get-CodemapEnhancedScore($workspacePath, $baseScore) {
    $codemap = Get-CodemapData $workspacePath
    $adjustments = 0
    $issues = @()
    
    # Security issues reduce score
    $criticalIssues = ($codemap.SecurityIssues | Where-Object { $_.Severity -eq "Critical" }).Count
    $moderateIssues = ($codemap.SecurityIssues | Where-Object { $_.Severity -eq "Moderate" }).Count
    
    if ($criticalIssues -gt 0) {
        $adjustments -= [Math]::Min(30, $criticalIssues * 10)
        $issues += "$criticalIssues critical security issue(s)"
    }
    if ($moderateIssues -gt 0) {
        $adjustments -= [Math]::Min(15, $moderateIssues * 3)
        $issues += "$moderateIssues moderate security issue(s)"
    }
    
    # Performance issues reduce score
    if ($codemap.PerformanceIssues.Count -gt 0) {
        $adjustments -= [Math]::Min(10, $codemap.PerformanceIssues.Count * 2)
        $issues += "$($codemap.PerformanceIssues.Count) performance issue(s)"
    }
    
    # Gaps reduce score
    if ($codemap.Gaps.Count -gt 0) {
        $adjustments -= [Math]::Min(10, $codemap.Gaps.Count * 2)
        $issues += "$($codemap.Gaps.Count) functionality gap(s)"
    }
    
    # Bonus for codemap existence (indicates documentation)
    if ($codemap.Exists) {
        $adjustments += 5
    }
    
    # Bonus for concepts
    if ($codemap.Concepts.Count -gt 0) {
        $adjustments += [Math]::Min(5, $codemap.Concepts.Count / 10)
    }
    
    # Apply adjustment
    $codemap.ScoreAdjustment = $adjustments
    
    return @{
        NewScore = [Math]::Max(0, [Math]::Min(100, $baseScore + $adjustments))
        Adjustments = $adjustments
        Issues = $issues
        Codemap = $codemap
    }
}

function Save-Checkpoint($workspaceStatus) {
    Write-Step 2 5 "Creating Checkpoint"
    
    $checkpoint = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Workspace = $workspaceStatus.Name
        Branch = $workspaceStatus.Branch
        CommitHash = $workspaceStatus.CommitHash
        FunctionalityScore = $workspaceStatus.FunctionalityScore
        BaseScore = $workspaceStatus.BaseScore
        ScoreAdjustment = $workspaceStatus.ScoreAdjustment
        IsFullyFunctional = $workspaceStatus.IsFullyFunctional
        Codemap = @{
            Exists = $workspaceStatus.CodemapData.Exists
            Services = $workspaceStatus.CodemapData.Services.Count
            Concepts = $workspaceStatus.CodemapData.Concepts.Count
            SecurityIssues = $workspaceStatus.CodemapData.SecurityIssues.Count
            PerformanceIssues = $workspaceStatus.CodemapData.PerformanceIssues.Count
            Gaps = $workspaceStatus.CodemapData.Gaps.Count
        }
        Notes = "Auto-generated by HCAutoBuild with Codemap Integration"
    }
    
    # Ensure directory exists
    $checkpointDir = Split-Path $CHECKPOINT_REGISTRY -Parent
    if (!(Test-Path $checkpointDir)) {
        New-Item -ItemType Directory -Path $checkpointDir -Force | Out-Null
    }
    
    # Load existing registry or create new
    $registry = @()
    if (Test-Path $CHECKPOINT_REGISTRY) {
        $registry = Get-Content $CHECKPOINT_REGISTRY | ConvertFrom-Json
        if ($registry -isnot [array]) {
            $registry = @($registry)
        }
    }
    
    # Add new checkpoint
    $registry += $checkpoint
    
    # Keep only last 20 checkpoints
    if ($registry.Count -gt 20) {
        $registry = $registry | Sort-Object Timestamp -Descending | Select-Object -First 20
    }
    
    # Save registry
    $registry | ConvertTo-Json -Depth 3 | Out-File $CHECKPOINT_REGISTRY
    
    Write-Success "Checkpoint saved: $($checkpoint.Timestamp) @ $($checkpoint.CommitHash)"
    Write-Success "Codemap tracked: $($checkpoint.Codemap.Services) services, $($checkpoint.Codemap.Concepts) concepts"
    Write-Log "Checkpoint created for $($workspaceStatus.Name) at $($checkpoint.CommitHash)"
    
    return $checkpoint
}

function Get-LastCheckpoint($workspaceName) {
    if (!(Test-Path $CHECKPOINT_REGISTRY)) {
        return $null
    }
    
    $registry = Get-Content $CHECKPOINT_REGISTRY | ConvertFrom-Json
    $checkpoints = $registry | Where-Object { $_.Workspace -eq $workspaceName }
    
    if ($checkpoints) {
        return $checkpoints | Sort-Object Timestamp -Descending | Select-Object -First 1
    }
    return $null
}

# ================================================================================
# BUILD PIPELINE
# ================================================================================

function Invoke-PrepStage($workspaceStatus) {
    Write-Step 1 5 "Prep Stage"
    
    Set-Location $workspaceStatus.Path
    
    # Stage all changes
    if ($workspaceStatus.HasChanges) {
        Write-Info "Staging changes..."
        git add .
        Write-Success "Changes staged"
    } else {
        Write-Info "No changes to stage"
    }
    
    # Check for build requirements
    if (Test-Path "package.json") {
        if (!(Test-Path "node_modules")) {
            Write-Info "Installing Node.js dependencies..."
            try {
                npm install 2>&1 | Out-Null
                Write-Success "npm install completed"
            } catch {
                Write-Error "npm install failed: $_"
                return $false
            }
        }
    }
    
    # Check Python worker
    if ($workspaceStatus.HasPythonWorker) {
        $reqFile = "backend/python_worker/requirements.txt"
        if (Test-Path $reqFile) {
            Write-Info "Checking Python dependencies..."
            try {
                pip install -r $reqFile 2>&1 | Out-Null
                Write-Success "Python dependencies ready"
            } catch {
                Write-Error "Python dependency install failed: $_"
                return $false
            }
        }
    }
    
    return $true
}

function Invoke-CommitStage($workspaceStatus) {
    Write-Step 2 5 "Commit Stage"
    
    Set-Location $workspaceStatus.Path
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMessage = "HCAutoBuild Checkpoint: $timestamp [$(if($workspaceStatus.IsFullyFunctional){'100%'}else{'$($workspaceStatus.FunctionalityScore)%'})]"
    
    try {
        $commitOutput = git commit -m $commitMessage 2>&1
        if ($LASTEXITCODE -eq 0) {
            $newHash = git rev-parse --short HEAD
            Write-Success "Committed: $commitMessage"
            Write-Success "New commit: $newHash"
            Write-Log "Commit created: $newHash"
            return $true
        } else {
            if ($commitOutput -match "nothing to commit" -or $commitOutput -match "working tree clean") {
                Write-Success "Nothing to commit (working tree clean)"
                return $true
            }
            Write-Error "Commit failed: $commitOutput"
            return $false
        }
    } catch {
        Write-Error "Commit error: $_"
        return $false
    }
}

function Invoke-PushStage($workspaceStatus) {
    Write-Step 3 5 "Push Stage"
    
    Set-Location $workspaceStatus.Path
    
    # Get current branch
    $branch = git branch --show-current
    
    # Push to origin
    try {
        Write-Info "Pushing to origin/$branch..."
        $pushOutput = git push origin $branch 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Pushed to origin successfully"
        } else {
            Write-Warning "Push had issues: $pushOutput"
        }
    } catch {
        Write-Error "Push failed: $_"
        return $false
    }
    
    # Run nexus_deploy if available
    if (Test-Path "nexus_deploy.ps1") {
        Write-Info "Running Nexus Deploy..."
        try {
            .\nexus_deploy.ps1
            Write-Success "Nexus deploy completed"
        } catch {
            Write-Error "Nexus deploy failed: $_"
            return $false
        }
    }
    
    return $true
}

function Invoke-VerifyStage($workspaceStatus) {
    Write-Step 4 5 "Verify Stage"
    
    Set-Location $workspaceStatus.Path
    
    $verificationResults = @{
        GitSync = $false
        BuildSuccess = $false
        RemoteReachable = $false
        AllChecksPass = $false
    }
    
    # Verify git sync
    Write-Info "Verifying git synchronization..."
    $localCommit = git rev-parse HEAD
    try {
        $remoteCommit = git rev-parse "origin/$($workspaceStatus.Branch)" 2>$null
        if ($localCommit -eq $remoteCommit) {
            Write-Success "Local and remote are synchronized"
            $verificationResults.GitSync = $true
        } else {
            Write-Error "Local and remote are out of sync"
            $verificationResults.GitSync = $false
        }
    } catch {
        Write-Error "Could not verify remote sync"
    }
    
    # Verify build (if applicable)
    if (Test-Path "package.json") {
        Write-Info "Verifying build capability..."
        if (Test-Path "frontend/package.json") {
            try {
                $buildOutput = npm run build --prefix frontend 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Frontend build successful"
                    $verificationResults.BuildSuccess = $true
                } else {
                    Write-Error "Frontend build failed"
                    $verificationResults.BuildSuccess = $false
                }
            } catch {
                Write-Error "Build verification error: $_"
                $verificationResults.BuildSuccess = $false
            }
        }
    } else {
        $verificationResults.BuildSuccess = $true
    }
    
    # Check remote reachability
    Write-Info "Checking remote reachability..."
    try {
        $remoteTest = git ls-remote origin 2>&1 | Select-Object -First 1
        if ($remoteTest) {
            Write-Success "Remote is reachable"
            $verificationResults.RemoteReachable = $true
        } else {
            Write-Error "Remote is not reachable"
            $verificationResults.RemoteReachable = $false
        }
    } catch {
        Write-Error "Remote check failed: $_"
        $verificationResults.RemoteReachable = $false
    }
    
    # Determine overall status
    $verificationResults.AllChecksPass = $verificationResults.GitSync -and 
                                          $verificationResults.BuildSuccess -and 
                                          $verificationResults.RemoteReachable
    
    return $verificationResults
}

function Invoke-FixStage($workspaceStatus, $verificationResults) {
    Write-Step 5 5 "Fix Stage (Auto-Remediation)"
    
    $fixesApplied = 0
    
    if (!$verificationResults.GitSync) {
        Write-Info "Attempting to sync with remote..."
        try {
            git pull origin $workspaceStatus.Branch --rebase
            $fixesApplied++
            Write-Success "Synced with remote"
        } catch {
            Write-Error "Could not sync: $_"
        }
    }
    
    if (!$verificationResults.BuildSuccess) {
        Write-Info "Attempting to fix build issues..."
        # Clean install
        if (Test-Path "node_modules") {
            Remove-Item "node_modules" -Recurse -Force
        }
        try {
            npm install
            Write-Success "Reinstalled dependencies"
            $fixesApplied++
        } catch {
            Write-Error "Reinstall failed: $_"
        }
    }
    
    if ($fixesApplied -gt 0) {
        Write-Success "Applied $fixesApplied fix(es)"
        return $true
    } else {
        Write-Info "No fixes needed or could be applied"
        return $false
    }
}

# ================================================================================
# STATUS REPORTING
# ================================================================================

function Show-StatusReport($workspaceStatuses) {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $COLOR_INFO
    Write-Host "║              HCAutoBuild Status Report                       ║" -ForegroundColor $COLOR_INFO
    Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor $COLOR_INFO
    
    foreach ($ws in $workspaceStatuses) {
        Write-Host "║ Workspace: $($ws.Name)" -ForegroundColor $COLOR_INFO
        Write-Host "║   Path: $($ws.Path)" -ForegroundColor $COLOR_DEBUG
        Write-Host "║   Branch: $($ws.Branch)" -ForegroundColor $COLOR_DEBUG
        Write-Host "║   Commit: $($ws.CommitHash)" -ForegroundColor $COLOR_DEBUG
        Write-Host "║   Functionality: " -NoNewline -ForegroundColor $COLOR_DEBUG
        
        if ($ws.FunctionalityScore -ge 100) {
            Write-Host "100% ✓" -ForegroundColor $COLOR_SUCCESS
        } elseif ($ws.FunctionalityScore -ge 80) {
            Write-Host "$($ws.FunctionalityScore)% (Good)" -ForegroundColor $COLOR_WARNING
        } else {
            Write-Host "$($ws.FunctionalityScore)% (Needs Attention)" -ForegroundColor $COLOR_ERROR
        }
        
        Write-Host "║   Fully Functional: $(if($ws.IsFullyFunctional){'YES ✓'}else{'NO'})" -ForegroundColor $(if($ws.IsFullyFunctional){$COLOR_SUCCESS}else{$COLOR_WARNING})
        Write-Host "║   Can Build: $(if($ws.CanBuild){'YES ✓'}else{'NO'})" -ForegroundColor $(if($ws.CanBuild){$COLOR_SUCCESS}else{$COLOR_ERROR})
        Write-Host "║   Uncommitted Changes: $(if($ws.HasChanges){'YES'}else{'NO'})" -ForegroundColor $(if($ws.HasChanges){$COLOR_WARNING}else{$COLOR_DEBUG})
        
        if ($ws.LastCheckpoint) {
            Write-Host "║   Last Checkpoint: $($ws.LastCheckpoint)" -ForegroundColor $COLOR_DEBUG
        } else {
            Write-Host "║   Last Checkpoint: Never" -ForegroundColor $COLOR_DEBUG
        }
        
        if ($ws.TasksPending.Count -gt 0) {
            Write-Host "║   Pending Tasks:" -ForegroundColor $COLOR_WARNING
            foreach ($task in $ws.TasksPending) {
                Write-Host "║     • $task" -ForegroundColor $COLOR_WARNING
            }
        }
        
        if ($ws.Issues.Count -gt 0) {
            Write-Host "║   Issues Found:" -ForegroundColor $COLOR_ERROR
            foreach ($issue in $ws.Issues) {
                Write-Host "║     • $issue" -ForegroundColor $COLOR_ERROR
            }
        }
        
        Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor $COLOR_INFO
    }
    
    $totalWorkspaces = $workspaceStatuses.Count
    $functionalWorkspaces = ($workspaceStatuses | Where-Object { $_.IsFullyFunctional }).Count
    $buildableWorkspaces = ($workspaceStatuses | Where-Object { $_.CanBuild }).Count
    
    Write-Host "║ SUMMARY                                                      ║" -ForegroundColor $COLOR_INFO
    Write-Host "║   Total Workspaces: $totalWorkspaces" -ForegroundColor $COLOR_DEBUG
    Write-Host "║   Fully Functional: $functionalWorkspaces/$totalWorkspaces" -ForegroundColor $(if($functionalWorkspaces -eq $totalWorkspaces){$COLOR_SUCCESS}else{$COLOR_WARNING})
    Write-Host "║   Buildable: $buildableWorkspaces/$totalWorkspaces" -ForegroundColor $(if($buildableWorkspaces -eq $totalWorkspaces){$COLOR_SUCCESS}else{$COLOR_WARNING})
    Write-Host "║                                                              ║" -ForegroundColor $COLOR_INFO
    Write-Host "║   Status: $(if($functionalWorkspaces -eq $totalWorkspaces){'ALL SYSTEMS OPERATIONAL ✓'}else{'SOME SYSTEMS NEED ATTENTION'})" -ForegroundColor $(if($functionalWorkspaces -eq $totalWorkspaces){$COLOR_SUCCESS}else{$COLOR_WARNING})
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $COLOR_INFO
    Write-Host ""
}

# ================================================================================
# MAIN AUTOBUILD CYCLE
# ================================================================================

function Invoke-AutoBuildCycle($targetWorkspace = $null) {
    Write-Header "HCAutoBuild Cycle Initiated"
    Write-Log "Starting AutoBuild cycle"
    
    # Determine which workspaces to process
    $workspacesToProcess = @()
    if ($targetWorkspace -and (Test-Path $targetWorkspace)) {
        $workspacesToProcess += $targetWorkspace
    } else {
        $workspacesToProcess = Get-ActiveWorkspaces
    }
    
    Write-Info "Processing $($workspacesToProcess.Count) workspace(s)"
    
    $allStatuses = @()
    
    foreach ($wsPath in $workspacesToProcess) {
        Write-Host ""
        Write-Host "Processing: $(Split-Path $wsPath -Leaf)" -ForegroundColor $COLOR_INFO
        Write-Host ("-" * 40) -ForegroundColor $COLOR_INFO
        
        # Analyze workspace
        $status = Get-WorkspaceStatus $wsPath
        $allStatuses += $status
        
        # Display current status
        Write-Info "Functionality Score: $($status.FunctionalityScore)%"
        if ($status.IsFullyFunctional) {
            Write-Success "Workspace is at 100% functionality"
        } else {
            Write-Warning "Workspace at $($status.FunctionalityScore)% - issues detected"
        }
        
        # Determine if we should proceed with build
        $shouldBuild = $status.IsFullyFunctional -or $ForceCheckpoint
        
        if ($shouldBuild) {
            Write-Info "Initiating build pipeline..."
            
            # Stage 1: Prep
            $prepSuccess = Invoke-PrepStage $status
            if (!$prepSuccess) {
                Write-Error "Prep stage failed - aborting build"
                continue
            }
            
            # Stage 2: Commit
            $commitSuccess = Invoke-CommitStage $status
            if (!$commitSuccess) {
                Write-Error "Commit stage failed - aborting build"
                continue
            }
            
            # Stage 3: Push
            $pushSuccess = Invoke-PushStage $status
            if (!$pushSuccess) {
                Write-Error "Push stage failed - will attempt verification"
            }
            
            # Stage 4: Verify
            $verification = Invoke-VerifyStage $status
            
            # Stage 5: Fix (if needed)
            if (!$verification.AllChecksPass) {
                Write-Warning "Verification failed - attempting auto-fix"
                $fixApplied = Invoke-FixStage $status $verification
                
                if ($fixApplied) {
                    # Retry push after fix
                    Write-Info "Retrying push after fixes..."
                    Invoke-PushStage $status
                    $verification = Invoke-VerifyStage $status
                }
            }
            
            # Create checkpoint if successful
            if ($verification.AllChecksPass -or $status.IsFullyFunctional) {
                Save-Checkpoint $status
                Write-Success "Build cycle completed successfully"
            } else {
                Write-Warning "Build cycle completed with warnings"
            }
            
        } else {
            Write-Warning "Skipping build - workspace not at 100% functionality"
            Write-Info "Use -ForceCheckpoint to build anyway"
        }
    }
    
    # Show final status report
    Show-StatusReport $allStatuses
    
    # Determine overall system state
    $allFunctional = ($allStatuses | Where-Object { $_.IsFullyFunctional }).Count -eq $allStatuses.Count
    
    if ($allFunctional) {
        Write-Success "SYSTEM AT 100% FUNCTIONALITY - STANDBY MODE ACTIVATED"
        Write-Log "System at 100% - entering standby"
        return "STANDBY"
    } else {
        Write-Warning "SYSTEM REQUIRES ATTENTION - TASKS PENDING"
        $pendingTasks = ($allStatuses | ForEach-Object { $_.TasksPending.Count } | Measure-Object -Sum).Sum
        Write-Info "$pendingTasks task(s) pending across all workspaces"
        Write-Log "System not at 100% - $pendingTasks tasks pending"
        return "ACTIVE"
    }
}

# ================================================================================
# CONTINUOUS MONITORING MODE
# ================================================================================

function Start-ContinuousMonitoring {
    Write-Header "HCAutoBuild Continuous Monitoring"
    Write-Info "Monitoring workspaces for 100% functionality..."
    Write-Info "Press Ctrl+C to stop"
    Write-Host ""
    
    $cycleCount = 0
    $lastState = "UNKNOWN"
    
    while ($true) {
        $cycleCount++
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] Cycle #$cycleCount" -ForegroundColor $COLOR_DEBUG
        
        $currentState = Invoke-AutoBuildCycle
        
        if ($currentState -eq "STANDBY") {
            if ($lastState -ne "STANDBY") {
                Write-Success "System reached 100% - entering deep standby"
                Write-Info "Will check for changes every 30 seconds..."
            }
            Start-Sleep -Seconds 30
        } else {
            Write-Warning "System requires work - checking again in 10 seconds..."
            Start-Sleep -Seconds 10
        }
        
        $lastState = $currentState
        Write-Host ""
    }
}

# ================================================================================
# ENTRY POINT
# ================================================================================

Initialize-Logging

if ($StatusOnly) {
    Write-Header "HCAutoBuild Status Check"
    $workspaces = Get-ActiveWorkspaces
    $statuses = $workspaces | ForEach-Object { Get-WorkspaceStatus $_ }
    Show-StatusReport $statuses
    exit 0
}

if ($Continuous) {
    Start-ContinuousMonitoring
} else {
    $result = Invoke-AutoBuildCycle $Workspace
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $COLOR_INFO
    Write-Host "  HCAutoBuild Cycle Complete" -ForegroundColor $COLOR_INFO
    Write-Host "  Final State: $result" -ForegroundColor $(if($result -eq "STANDBY"){$COLOR_SUCCESS}else{$COLOR_WARNING})
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $COLOR_INFO
    Write-Host ""
    
    if ($result -eq "STANDBY") {
        Write-Host "System is at 100% functionality and in standby mode." -ForegroundColor $COLOR_SUCCESS
        Write-Host "Run with -Continuous flag to monitor for changes automatically." -ForegroundColor $COLOR_DEBUG
    } else {
        Write-Host "System has pending tasks. Address issues and re-run." -ForegroundColor $COLOR_WARNING
    }
    
    exit $(if($result -eq "STANDBY"){0}else{1})
}
