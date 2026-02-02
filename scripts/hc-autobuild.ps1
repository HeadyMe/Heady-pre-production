#!/usr/bin/env pwsh
<#
.SYNOPSIS
    HC AutoBuild - Heady Connection Automated Build System CLI

.DESCRIPTION
    Command-line interface for HCAutoBuild
    Provides autobuild and intelligent squash merge capabilities

.PARAMETER Action
    Action to perform: build, merge, analyze, test, deploy, status

.PARAMETER Mode
    Build mode: auto, manual, hybrid

.PARAMETER DryRun
    Run in dry-run mode (no actual changes)

.PARAMETER Verbose
    Enable verbose output

.PARAMETER Config
    Path to configuration file

.EXAMPLE
    .\hc-autobuild.ps1 -Action build
    .\hc-autobuild.ps1 -Action merge -DryRun
    .\hc-autobuild.ps1 -Action analyze -Verbose
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet('build', 'merge', 'analyze', 'test', 'deploy', 'status', 'help')]
    [string]$Action = 'build',
    
    [Parameter()]
    [ValidateSet('auto', 'manual', 'hybrid')]
    [string]$Mode = 'auto',
    
    [Parameter()]
    [switch]$DryRun,
    
    [Parameter()]
    [switch]$Verbose,
    
    [Parameter()]
    [string]$Config = '',
    
    [Parameter()]
    [string]$Target = 'production',
    
    [Parameter()]
    [switch]$SkipTests,
    
    [Parameter()]
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$ScriptRoot = Split-Path -Parent $PSScriptRoot
$NodeScript = Join-Path $ScriptRoot 'src' 'hc_autobuild.js'

function Write-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         HC AUTOBUILD - Heady Connection              ║" -ForegroundColor Cyan
    Write-Host "║     Intelligent Build & Squash Merge System          ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Status {
    param([string]$Message, [string]$Level = 'Info')
    
    $color = switch ($Level) {
        'Success' { 'Green' }
        'Warning' { 'Yellow' }
        'Error' { 'Red' }
        'Info' { 'Cyan' }
        default { 'White' }
    }
    
    $prefix = switch ($Level) {
        'Success' { '✓' }
        'Warning' { '⚠' }
        'Error' { '✗' }
        'Info' { 'ℹ' }
        default { '•' }
    }
    
    Write-Host "$prefix $Message" -ForegroundColor $color
}

function Show-Help {
    Write-Banner
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  hc-autobuild.ps1 -Action <action> [options]"
    Write-Host ""
    Write-Host "ACTIONS:" -ForegroundColor Yellow
    Write-Host "  build     - Execute full autobuild cycle"
    Write-Host "  merge     - Run intelligent squash merge only"
    Write-Host "  analyze   - Analyze codebase and dependencies"
    Write-Host "  test      - Run test suite"
    Write-Host "  deploy    - Deploy application"
    Write-Host "  status    - Show current build status"
    Write-Host "  help      - Show this help message"
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host "  -Mode <auto|manual|hybrid>  Build mode (default: auto)"
    Write-Host "  -DryRun                     Preview changes without executing"
    Write-Host "  -Verbose                    Enable verbose output"
    Write-Host "  -Config <path>              Path to configuration file"
    Write-Host "  -Target <env>               Deployment target (default: production)"
    Write-Host "  -SkipTests                  Skip test phase"
    Write-Host "  -Force                      Force execution (skip confirmations)"
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  hc-autobuild.ps1 -Action build"
    Write-Host "  hc-autobuild.ps1 -Action merge -DryRun"
    Write-Host "  hc-autobuild.ps1 -Action analyze -Verbose"
    Write-Host "  hc-autobuild.ps1 -Action deploy -Target staging"
    Write-Host ""
}

function Test-Prerequisites {
    Write-Status "Checking prerequisites..." "Info"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Status "Node.js: $nodeVersion" "Success"
    } catch {
        Write-Status "Node.js not found" "Error"
        return $false
    }
    
    # Check Git
    try {
        $gitVersion = git --version
        Write-Status "Git: $gitVersion" "Success"
    } catch {
        Write-Status "Git not found" "Error"
        return $false
    }
    
    # Check script exists
    if (-not (Test-Path $NodeScript)) {
        Write-Status "HCAutoBuild script not found: $NodeScript" "Error"
        return $false
    }
    
    Write-Status "Prerequisites check passed" "Success"
    return $true
}

function Invoke-HCAutoBuild {
    Write-Banner
    
    if ($Action -eq 'help') {
        Show-Help
        return
    }
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Status "Prerequisites check failed. Aborting." "Error"
        exit 1
    }
    
    # Build command arguments
    $nodeArgs = @($NodeScript)
    
    if ($Verbose) { $nodeArgs += '--verbose' }
    if ($DryRun) { $nodeArgs += '--dry-run' }
    if ($Mode -eq 'manual') { $nodeArgs += '--manual' }
    
    # Action-specific arguments
    switch ($Action) {
        'build' {
            Write-Status "Starting full autobuild cycle..." "Info"
            if ($SkipTests) { $nodeArgs += '--skip-tests' }
        }
        'merge' {
            Write-Status "Starting intelligent merge..." "Info"
            $nodeArgs += '--phase', 'merge'
        }
        'analyze' {
            Write-Status "Analyzing codebase..." "Info"
            $nodeArgs += '--phase', 'analyze'
        }
        'test' {
            Write-Status "Running tests..." "Info"
            $nodeArgs += '--phase', 'test'
        }
        'deploy' {
            Write-Status "Deploying to $Target..." "Info"
            $nodeArgs += '--phase', 'deploy', '--target', $Target
        }
        'status' {
            Write-Status "Checking build status..." "Info"
            $nodeArgs += '--status'
        }
    }
    
    # Add config if specified
    if ($Config) {
        $nodeArgs += '--config', $Config
    }
    
    # Confirmation for destructive actions
    if (-not $DryRun -and -not $Force -and $Action -in @('merge', 'deploy')) {
        Write-Host ""
        Write-Host "⚠ WARNING: This action will make changes to your repository." -ForegroundColor Yellow
        $confirm = Read-Host "Continue? (y/N)"
        if ($confirm -ne 'y' -and $confirm -ne 'Y') {
            Write-Status "Aborted by user" "Warning"
            exit 0
        }
    }
    
    Write-Host ""
    Write-Status "Executing: node $($nodeArgs -join ' ')" "Info"
    Write-Host ""
    
    # Execute Node.js script
    try {
        & node @nodeArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Status "HC AutoBuild completed successfully" "Success"
        } else {
            Write-Host ""
            Write-Status "HC AutoBuild failed with exit code $LASTEXITCODE" "Error"
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host ""
        Write-Status "Error executing HC AutoBuild: $_" "Error"
        exit 1
    }
}

# Main execution
Invoke-HCAutoBuild
