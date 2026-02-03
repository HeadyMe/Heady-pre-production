#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Heady Checkpoint Story Driver - PowerShell Wrapper

.DESCRIPTION
    Generates comprehensive system status reports at checkpoints.
    Tracks all services, MCP servers, infrastructure, and operational metrics.

.PARAMETER Action
    The action to perform: generate, view, list, help

.EXAMPLE
    .\Invoke-Checkpoint.ps1 -Action generate
    .\Invoke-Checkpoint.ps1 -Action view
    .\Invoke-Checkpoint.ps1 -Action list

.NOTES
    Part of the Heady Systems Story Driver Protocol
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('generate', 'view', 'list', 'help')]
    [string]$Action = 'generate'
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$CheckpointScript = Join-Path $ScriptDir 'checkpoint.js'

function Write-HeadyBanner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           HEADY CHECKPOINT STORY DRIVER                   ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host '  .\Invoke-Checkpoint.ps1 [-Action ACTION]'
    Write-Host '  - Environment and Configuration'
    Write-Host '  • Checkpoint will be saved to: audit_logs/checkpoint_{timestamp}.md' -ForegroundColor Cyan
    Write-Host ""
}

function Invoke-CheckpointGenerate {
    Write-HeadyBanner
    Write-Host "🚀 Generating checkpoint report..." -ForegroundColor Yellow
    Write-Host ""
    
    Push-Location $RootDir
    try {
        node $CheckpointScript generate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Checkpoint report generated successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📄 View report with: .\scripts\Invoke-Checkpoint.ps1 -Action view" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Error generating checkpoint report" -ForegroundColor Red
            exit 1
        }
    } finally {
        Pop-Location
    }
}

function Invoke-CheckpointView {
    Write-HeadyBanner
    
    Push-Location $RootDir
    try {
        node $CheckpointScript view
    } finally {
        Pop-Location
    }
}

function Invoke-CheckpointList {
    Write-HeadyBanner
    
    Push-Location $RootDir
    try {
        node $CheckpointScript list
    } finally {
        Pop-Location
    }
}

function Show-Help {
    Write-HeadyBanner
    
    Write-Host "Generate comprehensive system status reports at checkpoints." -ForegroundColor White
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host '  .\Invoke-Checkpoint.ps1 [-Action ACTION]'
    Write-Host ""
    Write-Host "ACTIONS:" -ForegroundColor Yellow
    Write-Host "  generate    Generate a new checkpoint report (default)"
    Write-Host "  view        View the latest checkpoint report"
    Write-Host "  list        List all checkpoint reports"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\Invoke-Checkpoint.ps1"
    Write-Host "  .\Invoke-Checkpoint.ps1 -Action generate"
    Write-Host "  .\Invoke-Checkpoint.ps1 -Action view"
    Write-Host "  .\Invoke-Checkpoint.ps1 -Action list"
    Write-Host ""
    Write-Host "REPORT CONTENTS:" -ForegroundColor Yellow
    Write-Host '  - Executive Summary'
    Write-Host '  - Environment and Configuration'
    Write-Host '  - Docker Services Status'
    Write-Host '  - MCP Server Status'
    Write-Host '  - Health Checks'
    Write-Host '  - Git Repository Status'
    Write-Host '  - File System Structure'
    Write-Host '  - Running Processes'
    Write-Host '  - Operational Metrics'
    Write-Host '  - Memory Usage'
    Write-Host ""
    Write-Host 'Reports are saved to: audit_logs/checkpoint_{timestamp}.md' -ForegroundColor Cyan
    Write-Host ""
}

# Main execution
switch ($Action) {
    'generate' { Invoke-CheckpointGenerate }
    'view' { Invoke-CheckpointView }
    'list' { Invoke-CheckpointList }
    'help' { Show-Help }
    default { Show-Help }
}
