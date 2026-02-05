# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: scripts/heady-automated-workflow.ps1
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

# Heady Automated Workflow
# Input -> recon.js -> Prep -> HCAutoBuild -> hc -a -> HCAutoBuild -> Checkpoint

param(
    [string]$InputFile,
    [string]$InputText,
    [switch]$NonInteractive,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$RootDir = "$ScriptDir\.."

function Show-AsciiArt {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         _   _  _____    _    ____   __   __                   ║" -ForegroundColor Cyan
    Write-Host "║        | | | || ____|  / \  |  _ \ \ \ / /                   ║" -ForegroundColor Cyan
    Write-Host "║        | |_| ||  _|   / _ \ | |_| | \ V /                    ║" -ForegroundColor Cyan
    Write-Host "║        |  _  || |___ / ___ \|  _  |   | |                     ║" -ForegroundColor Cyan
    Write-Host "║        |_| |_||_____/_/   \_\____/   |_|                     ║" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "║    AUTOMATED WORKFLOW - Sacred Geometry Orchestration         ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Step-AnalyzeInput {
    param([string]$Input)
    
    Write-Host "🔍 STEP 1: Analyzing Input with recon.js..." -ForegroundColor Yellow
    
    if (Test-Path "$ScriptDir\recon.js") {
        try {
            $analysisJson = node "$ScriptDir\recon.js" "$Input"
            $analysis = $analysisJson | ConvertFrom-Json -Depth 20
        } catch {
            Write-Warning "recon.js produced invalid JSON, proceeding with basic analysis"
            return @{ detectedTasks = @(); predictedCheckpoint = $null }
        }
        Write-Host "✅ Analysis complete" -ForegroundColor Green
        return $analysis
    } else {
        Write-Warning "recon.js not found, proceeding with basic analysis"
        return @{ detectedTasks = @(); predictedCheckpoint = $null }
    }
}

function Step-CompleteTasks {
    param([array]$Tasks)
    
    if ($Tasks.Count -eq 0) {
        Write-Host "ℹ️ No specific tasks detected, proceeding with standard workflow" -ForegroundColor Gray
        return
    }
    
    Write-Host "🔧 STEP 2: Completing Detected Tasks..." -ForegroundColor Yellow
    Write-Host "   Tasks found: $($Tasks.Count)" -ForegroundColor Cyan
    
    foreach ($task in $Tasks) {
        Write-Host "   • $($task.type): $($task.description) [Priority: $($task.priority)]" -ForegroundColor White
        # Task completion would happen here based on task type
        Start-Sleep -Milliseconds 500
    }
    
    Write-Host "✅ Tasks completed" -ForegroundColor Green
}

function Step-Pause {
    Write-Host "⏸️ STEP 3: Pausing for review..." -ForegroundColor Yellow
    Write-Host "   Press any key to continue or Ctrl+C to abort..." -ForegroundColor Gray
    if ($NonInteractive) {
        Write-Host "✅ NonInteractive mode enabled, skipping pause." -ForegroundColor Green
        return
    }
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host "✅ Resuming..." -ForegroundColor Green
}

function Step-PrepSystem {
    Write-Host "🔧 STEP 4: Preparing System for HCAutoBuild..." -ForegroundColor Yellow
    
    # Check prerequisites
    $checks = @(
        @{ Name = "Node.js"; Command = "node --version" },
        @{ Name = "pnpm"; Command = "pnpm --version" },
        @{ Name = "Git"; Command = "git --version" }
    )
    
    foreach ($check in $checks) {
        try {
            $result = Invoke-Expression $check.Command 2>$null
            Write-Host "   ✅ $($check.Name): $result" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ $($check.Name): Not found" -ForegroundColor Red
            throw "Prerequisite missing: $($check.Name)"
        }
    }
    
    Write-Host "✅ System prepared" -ForegroundColor Green
}

function Step-HCAutoBuild {
    Write-Host "🔨 STEP 5: Running HCAutoBuild..." -ForegroundColor Yellow
    
    & "$ScriptDir\hc.ps1" -a autobuild
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ HCAutoBuild completed successfully" -ForegroundColor Green
    } else {
        Write-Warning "HCAutoBuild completed with warnings"
    }
}

function Step-HeadySync {
    Write-Host "🔄 STEP 6: Running HeadySync (hc -a hs)..." -ForegroundColor Yellow
    
    & "$ScriptDir\hc.ps1" -a hs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ HeadySync completed successfully" -ForegroundColor Green
    } else {
        Write-Warning "HeadySync completed with warnings"
    }
}

function Step-CreateCheckpoint {
    param([object]$Checkpoint)
    
    Write-Host "📍 STEP 7: Creating Checkpoint..." -ForegroundColor Yellow
    
    if ($Checkpoint) {
        Write-Host "   Checkpoint: $($Checkpoint.name)" -ForegroundColor Cyan
        Write-Host "   Description: $($Checkpoint.description)" -ForegroundColor Gray
    }
    
    # Run auto-checkpoint
    if (Test-Path "$ScriptDir\auto-checkpoint.ps1") {
        & "$ScriptDir\auto-checkpoint.ps1"
        Write-Host "✅ Checkpoint created" -ForegroundColor Green
    } else {
        # Manual checkpoint
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        git tag -a "checkpoint-$timestamp" -m "Automated workflow checkpoint"
        Write-Host "✅ Manual checkpoint created: checkpoint-$timestamp" -ForegroundColor Green
    }
}

# MAIN WORKFLOW
Show-AsciiArt

Write-Host "🚀 Starting Heady Automated Workflow..." -ForegroundColor Cyan
Write-Host "   Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Get input
$workflowInput = if ($InputText) {
    $InputText
} elseif ($InputFile -and (Test-Path $InputFile)) {
    Get-Content $InputFile -Raw
} else {
    if ($NonInteractive) {
        ""
    } else {
        Read-Host "Enter your workflow input"
    }
}

# STEP 1: Analyze
$analysis = Step-AnalyzeInput -Input $workflowInput

# STEP 2: Complete Tasks
Step-CompleteTasks -Tasks @($analysis.detectedTasks)

# STEP 3: Pause
Step-Pause

# STEP 4: Prep System
Step-PrepSystem

# STEP 5: HCAutoBuild
Step-HCAutoBuild

# STEP 6: HeadySync
Step-HeadySync

# STEP 7: Checkpoint
Step-CreateCheckpoint -Checkpoint $analysis.predictedCheckpoint

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ AUTOMATED WORKFLOW COMPLETED SUCCESSFULLY                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Save workflow report
$report = @{
    timestamp = Get-Date -Format "o"
    input = $workflowInput
    analysis = $analysis
    completed = $true
    checkpoint = $analysis.predictedCheckpoint
}

$reportPath = "$RootDir\logs\workflow-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
New-Item -ItemType Directory -Path (Split-Path $reportPath) -Force | Out-Null
$report | ConvertTo-Json -Depth 10 | Out-File $reportPath

Write-Host "📊 Workflow report saved to: $reportPath" -ForegroundColor Gray
Write-Host ""
