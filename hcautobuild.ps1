# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: hcautobuild_enhanced.ps1
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
║     ∞ HCAutoBuild Enhanced - Codemap-Powered Intelligence ∞                    ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                         ║
║     Advanced autonomous system with AI node integration                         ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
#>

param(
    [switch]$checkpoint,
    [switch]$status,
    [switch]$monitor,
    [switch]$debug,
    [switch]$verbose,
    [switch]$force,
    [switch]$skipValidation,
    [switch]$optimize,
    [switch]$codemap,
    [string]$workspace,
    [switch]$help
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Import base HCAutoBuild functionality
. (Join-Path $PSScriptRoot "hcautobuild.ps1")

# Enhanced Configuration with Codemap Integration
$ENHANCED_CONFIG = @{
    BaseConfig = $CONFIG
    CodemapNodes = @("JULES", "OBSERVER", "BUILDER", "ATLAS")
    OptimizationInterval = 3600  # 1 hour
    AutoOptimize = $true
    NodeTimeout = 300  # 5 minutes
    ParallelExecution = $true
}

function Write-EnhancedLog {
    param([string]$Message, [string]$Node = "ENHANCED", [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [ENHANCED-$Node] $Message"
    
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "Cyan" }
        "DEBUG" { "Magenta" }
        default { "White" }
    }
    
    Write-Host $logEntry -ForegroundColor $color
    
    # Enhanced logging
    $logDir = ".heady\logs\enhanced"
    if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
    Add-Content -Path "$logDir\hcautobuild_enhanced.log" -Value $logEntry
}

function Invoke-CodemapOptimization {
    param([string]$WorkspacePath)
    
    Write-EnhancedLog "Initiating codemap optimization..." -Node "COORDINATOR"
    
    $optimizerScript = Join-Path $PSScriptRoot "hcautobuild_optimizer.ps1"
    
    if (-not (Test-Path $optimizerScript)) {
        Write-EnhancedLog "Optimizer script not found" -Node "COORDINATOR" -Level "ERROR"
        return $false
    }
    
    try {
        # Run optimization with all nodes
        $args = @("-optimize")
        if ($verbose) { $args += "-verbose" }
        $args += "-workspace", "`"$WorkspacePath`""
        
        Write-EnhancedLog "Executing: .\hcautobuild_optimizer.ps1 $($args -join ' ')" -Node "COORDINATOR"
        
        $result = & powershell -ExecutionPolicy Bypass -File $optimizerScript @args
        
        if ($LASTEXITCODE -eq 0) {
            Write-EnhancedLog "Codemap optimization completed successfully" -Node "COORDINATOR" -Level "SUCCESS"
            return $true
        } else {
            Write-EnhancedLog "Codemap optimization failed" -Node "COORDINATOR" -Level "WARNING"
            return $false
        }
    } catch {
        Write-EnhancedLog "Codemap optimization error: $($_.Exception.Message)" -Node "COORDINATOR" -Level "ERROR"
        return $false
    }
}

function Get-EnhancedFunctionalityScore {
    param([string]$WorkspacePath)
    
    Write-EnhancedLog "Calculating enhanced functionality score..." -Node "ANALYZER"
    
    # Get base functionality score
    $baseScore = Get-FunctionalityScore $WorkspacePath
    
    # Apply codemap optimizations
    $enhancements = @{
        code_quality = 0
        documentation = 0
        performance = 0
        security = 0
    }
    
    # Check for optimization reports
    $optReportDir = ".heady\optimization_reports"
    if (Test-Path $optReportDir) {
        $latestReport = Get-ChildItem $optReportDir -Filter "*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latestReport) {
            try {
                $report = Get-Content $latestReport.FullName | ConvertFrom-Json
                $enhancements.code_quality += [math]::Min($report.optimizations_found * 2, 10)
                Write-EnhancedLog "Found $($report.optimizations_found) optimizations from codemap analysis" -Node "ANALYZER"
            } catch {
                Write-EnhancedLog "Could not read optimization report" -Node "ANALYZER" -Level "DEBUG"
            }
        }
    }
    
    # Check for observer reports
    $observerReportDir = ".heady\observer_reports"
    if (Test-Path $observerReportDir) {
        $latestReport = Get-ChildItem $observerReportDir -Filter "*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latestReport) {
            try {
                $report = Get-Content $latestReport.FullName | ConvertFrom-Json
                $enhancements.performance += [math]::Min(10 - $report.optimization_opportunities.Count, 10)
                Write-EnhancedLog "Observer analysis: $($report.optimization_opportunities.Count) opportunities found" -Node "ANALYZER"
            } catch {
                Write-EnhancedLog "Could not read observer report" -Node "ANALYZER" -Level "DEBUG"
            }
        }
    }
    
    # Check for atlas reports
    $atlasReportDir = ".heady\atlas_reports"
    if (Test-Path $atlasReportDir) {
        $latestReport = Get-ChildItem $atlasReportDir -Filter "*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latestReport) {
            try {
                $report = Get-Content $latestReport.FullName | ConvertFrom-Json
                $enhancements.documentation += [math]::Min($report.documentation_files.Count, 10)
                Write-EnhancedLog "Atlas documentation: $($report.documentation_files.Count) files found" -Node "ANALYZER"
            } catch {
                Write-EnhancedLog "Could not read atlas report" -Node "ANALYZER" -Level "DEBUG"
            }
        }
    }
    
    # Calculate enhanced score
    $totalEnhancements = $enhancements.Values | Measure-Object -Sum | Select-Object -ExpandProperty Sum
    $enhancedScore = $baseScore.Score + $totalEnhancements
    $maxEnhancedScore = $baseScore.MaxScore + 40  # Add 40 points for enhancements
    
    $enhancedPercentage = [math]::Round(($enhancedScore / $maxEnhancedScore) * 100, 1)
    
    Write-EnhancedLog "Enhanced score: $enhancedScore/$maxEnhancedScore ($enhancedPercentage%)" -Node "ANALYZER"
    Write-EnhancedLog "Base score: $($baseScore.Score)/$($baseScore.MaxScore) ($($baseScore.Percentage)%)" -Node "ANALYZER"
    Write-EnhancedLog "Enhancements: +$totalEnhancements points" -Node "ANALYZER"
    
    return @{
        Score = $enhancedScore
        MaxScore = $maxEnhancedScore
        Percentage = $enhancedPercentage
        BaseScore = $baseScore
        Enhancements = $enhancements
        Factors = $baseScore.Factors + @("Codemap: +$totalEnhancements")
    }
}

function New-EnhancedCheckpoint {
    param([string]$WorkspacePath, [hashtable]$FunctionalityScore)
    
    Write-EnhancedLog "Creating enhanced checkpoint..." -Node "CHECKPOINT"
    
    # Create base checkpoint
    $checkpoint = New-Checkpoint $WorkspacePath $FunctionalityScore.BaseScore
    
    if ($checkpoint) {
        # Add enhanced metadata
        $checkpoint.enhanced_score = $FunctionalityScore.Percentage
        $checkpoint.base_score = $FunctionalityScore.BaseScore.Percentage
        $checkpoint.enhancements = $FunctionalityScore.Enhancements
        $checkpoint.codemap_nodes = $ENHANCED_CONFIG.CodemapNodes
        $checkpoint.optimization_applied = $optimize
        
        # Save enhanced checkpoint
        $checkpointPath = Join-Path $WorkspacePath $CONFIG.CheckpointDir
        $checkpointFile = Join-Path $checkpointPath "$($checkpoint.checkpoint_id)_enhanced.json"
        
        $checkpoint | ConvertTo-Json -Depth 10 | Set-Content $checkpointFile
        
        Write-EnhancedLog "Enhanced checkpoint created: $($checkpoint.checkpoint_id)" -Node "CHECKPOINT" -Level "SUCCESS"
        Write-EnhancedLog "Enhanced functionality: $($FunctionalityScore.Percentage)%" -Node "CHECKPOINT"
        Write-EnhancedLog "Base functionality: $($FunctionalityScore.BaseScore.Percentage)%" -Node "CHECKPOINT"
        
        return $checkpoint
    }
    
    return $null
}

function Invoke-EnhancedMonitoring {
    param([string]$WorkspacePath)
    
    Write-EnhancedLog "Starting enhanced monitoring with codemap integration..." -Node "MONITOR"
    
    $lastStates = @{}
    $lastOptimization = Get-Date
    
    # Initialize last states
    foreach ($workspaceName in $CONFIG.Workspaces) {
        $wsPath = Get-WorkspacePath $workspaceName
        if (Test-Path $wsPath) {
            $lastStates[$workspaceName] = Get-EnhancedFunctionalityScore $wsPath
        }
    }
    
    try {
        while ($true) {
            Start-Sleep -Seconds $CONFIG.MonitorInterval
            
            Write-EnhancedLog "Enhanced monitoring check - $(Get-Date)" -Node "MONITOR"
            
            foreach ($workspaceName in $CONFIG.Workspaces) {
                $wsPath = Get-WorkspacePath $workspaceName
                if (-not (Test-Path $wsPath)) { continue }
                
                $currentState = Get-EnhancedFunctionalityScore $wsPath
                $lastState = $lastStates[$workspaceName]
                
                # Check for significant changes
                if ($lastState -and $currentState.Percentage -ne $lastState.Percentage) {
                    Write-EnhancedLog "Enhanced functionality change in $workspaceName`: $($lastState.Percentage)% → $($currentState.Percentage)%" -Node "MONITOR"
                }
                
                # Auto-optimize if enabled and enough time has passed
                if ($ENHANCED_CONFIG.AutoOptimize -and 
                    ((Get-Date) - $lastOptimization).TotalSeconds -ge $ENHANCED_CONFIG.OptimizationInterval) {
                    
                    Write-EnhancedLog "Running automatic optimization..." -Node "MONITOR"
                    Invoke-CodemapOptimization $wsPath
                    $lastOptimization = Get-Date
                    
                    # Recalculate score after optimization
                    $currentState = Get-EnhancedFunctionalityScore $wsPath
                }
                
                # Create checkpoint if 100% enhanced functionality achieved
                if ($currentState.Percentage -ge 100 -and ($lastState.Percentage -lt 100 -or $force)) {
                    Write-EnhancedLog "🎯 100% enhanced functionality achieved in $workspaceName! Creating checkpoint..." -Node "MONITOR" -Level "SUCCESS"
                    $checkpoint = New-EnhancedCheckpoint $wsPath $currentState
                    
                    if ($checkpoint) {
                        $commitMsg = "HCAutoBuild Enhanced Checkpoint $($checkpoint.checkpoint_id) - 100% Enhanced Functionality"
                        Invoke-CommitAndPush $wsPath $commitMsg
                    }
                }
                
                $lastStates[$workspaceName] = $currentState
            }
        }
    } catch [System.Management.Automation.HaltCommandException] {
        Write-EnhancedLog "Enhanced monitoring stopped by user" -Node "MONITOR"
    } catch {
        Write-EnhancedLog "Enhanced monitoring error: $($_.Exception.Message)" -Node "MONITOR" -Level "ERROR"
    }
}

function Invoke-EnhancedHCAutoBuild {
    Write-Host "∞ HCAutoBuild Enhanced - Codemap-Powered Intelligence ∞" -ForegroundColor Cyan
    Write-Host "Version: 2.0.0" -ForegroundColor Cyan
    Write-Host "Workspaces: $($CONFIG.Workspaces -join ', ')" -ForegroundColor Cyan
    Write-Host "Codemap Nodes: $($ENHANCED_CONFIG.CodemapNodes -join ', ')" -ForegroundColor Green
    
    $overallSuccess = $true
    
    foreach ($workspaceName in $CONFIG.Workspaces) {
        if ($workspace -and $workspaceName -ne $workspace) { continue }
        
        $workspacePath = Get-WorkspacePath $workspaceName
        
        if (-not (Test-Path $workspacePath)) {
            Write-EnhancedLog "Workspace not found: $workspacePath" -Node "MAIN" -Level "ERROR"
            $overallSuccess = $false
            continue
        }
        
        Write-Host "`nProcessing enhanced workspace: $workspaceName" -ForegroundColor Cyan
        Write-Host "Path: $workspacePath" -ForegroundColor Debug
        
        # Run codemap optimization if requested
        if ($optimize -or $codemap) {
            Write-EnhancedLog "Running codemap optimization..." -Node "MAIN"
            if (-not (Invoke-CodemapOptimization $workspacePath)) {
                Write-EnhancedLog "Codemap optimization failed, continuing..." -Node "MAIN" -Level "WARNING"
            }
        }
        
        # Get enhanced functionality score
        $functionality = Get-EnhancedFunctionalityScore $workspacePath
        
        Write-Host "Enhanced Functionality Score: $($functionality.Percentage)% ($($functionality.Score)/$($functionality.MaxScore))" -ForegroundColor $(if($functionality.Percentage -ge 100) {"Green"} elseif($functionality.Percentage -ge 95) {"Cyan"} else {"Yellow"})
        Write-Host "Base Functionality Score: $($functionality.BaseScore.Percentage)%" -ForegroundColor $(if($functionality.BaseScore.Percentage -ge 95) {"Green"} else {"Yellow"})
        
        if ($verbose) {
            Write-Host "Enhancement breakdown:" -ForegroundColor Debug
            foreach ($key in $functionality.Enhancements.Keys) {
                Write-Host "  • $key`: +$($functionality.Enhancements[$key]) points" -ForegroundColor Debug
            }
            foreach ($factor in $functionality.Factors) {
                Write-Host "  • $factor" -ForegroundColor Debug
            }
        }
        
        # Create enhanced checkpoint if at 100% functionality or forced
        if ($functionality.Percentage -ge 100 -or $force) {
            Write-Host "Creating enhanced checkpoint..." -ForegroundColor Green
            $checkpoint = New-EnhancedCheckpoint $workspacePath $functionality
            
            if ($checkpoint) {
                # Commit and push changes
                $commitMsg = "HCAutoBuild Enhanced Checkpoint $($checkpoint.checkpoint_id) - Enhanced Functionality: $($functionality.Percentage)%"
                if (Invoke-CommitAndPush $workspacePath $commitMsg) {
                    Write-Host "Changes committed and pushed" -ForegroundColor Green
                } else {
                    Write-Host "Commit/push failed" -ForegroundColor Yellow
                    $overallSuccess = $false
                }
            } else {
                Write-Host "Enhanced checkpoint creation failed" -ForegroundColor Red
                $overallSuccess = $false
            }
        } else {
            Write-Host "Enhanced functionality below threshold (100% required for checkpoint)" -ForegroundColor Yellow
            
            # Show suggestions
            if ($functionality.Enhancements.Values | Where-Object { $_ -eq 0 }) {
                Write-Host "Suggestions for improvement:" -ForegroundColor Yellow
                if ($functionality.Enhancements.code_quality -eq 0) {
                    Write-Host "  • Run JULES optimization for code quality improvements" -ForegroundColor Cyan
                }
                if ($functionality.Enhancements.documentation -eq 0) {
                    Write-Host "  • Run ATLAS documentation analysis" -ForegroundColor Cyan
                }
                if ($functionality.Enhancements.performance -eq 0) {
                    Write-Host "  • Run OBSERVER monitoring for performance insights" -ForegroundColor Cyan
                }
            }
        }
    }
    
    return $overallSuccess
}

# Main execution with enhanced features
try {
    if ($help) {
        Write-Host @"
HCAutoBuild Enhanced - Codemap-Powered Intelligence

USAGE:
    .\hcautobuild_enhanced.ps1 [OPTIONS]

BASE OPTIONS:
    -checkpoint      Create enhanced checkpoint regardless of functionality score
    -status          Show detailed enhanced status report
    -monitor         Start enhanced continuous monitoring
    -debug           Enable debug logging
    -verbose         Show detailed output
    -force           Force operations even if conditions not met
    -workspace NAME  Process specific workspace only
    -help            Show this help message

ENHANCED OPTIONS:
    -optimize        Run codemap optimization before analysis
    -codemap         Alias for -optimize

CODEMAP NODES:
    JULES    - Code optimization and analysis
    OBSERVER - Enhanced monitoring and performance
    BUILDER  - Project optimization and cleanup
    ATLAS    - Documentation generation

EXAMPLES:
    .\hcautobuild_enhanced.ps1                    # Run enhanced cycle
    .\hcautobuild_enhanced.ps1 -optimize          # Run with optimization
    .\hcautobuild_enhanced.ps1 -status            # Show enhanced status
    .\hcautobuild_enhanced.ps1 -monitor           # Start enhanced monitoring
    .\hcautobuild_enhanced.ps1 -workspace Heady  # Process specific workspace
"@
        exit 0
    }
    
    Write-EnhancedLog "HCAutoBuild Enhanced started with codemap integration" -Node "MAIN"
    
    if ($status) {
        # Enhanced status reporting would go here
        Write-Host "Enhanced status reporting not yet implemented" -ForegroundColor Yellow
        exit 0
    }
    
    if ($monitor) {
        Invoke-EnhancedMonitoring
        exit 0
    }
    
    if ($checkpoint) {
        Write-Host "FORCE ENHANCED CHECKPOINT MODE" -ForegroundColor Yellow
        $force = $true
    }
    
    $success = Invoke-EnhancedHCAutoBuild
    
    if ($success) {
        Write-Host "∞ HCAutoBuild Enhanced COMPLETE ∞" -ForegroundColor Green
        Write-Host "✓ All enhanced operations completed successfully" -ForegroundColor Green
        Write-Host "System is ready for autonomous operation with codemap intelligence" -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "∞ HCAutoBuild Enhanced COMPLETE WITH ISSUES ∞" -ForegroundColor Yellow
        Write-Host "⚠ Some enhanced operations failed. Check logs for details." -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-EnhancedLog "Fatal error: $($_.Exception.Message)" -Node "MAIN" -Level "ERROR"
    if ($debug) {
        Write-Host "Stack trace:" -ForegroundColor Red
        Write-Host $_.ScriptStackTrace -ForegroundColor Red
    }
    exit 1
}
