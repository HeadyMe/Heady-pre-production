#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Heady Squash Merge CLI - Intelligent multi-codebase merger

.DESCRIPTION
    Interactive CLI for merging multiple codebases with weighted distribution
    Leverages HeadyAcademy agents for conflict resolution

.PARAMETER ConfigFile
    Path to merge configuration JSON file

.PARAMETER Interactive
    Run in interactive mode to build configuration

.PARAMETER Analyze
    Only analyze sources without merging

.EXAMPLE
    .\heady-merge.ps1 -Interactive
    
.EXAMPLE
    .\heady-merge.ps1 -ConfigFile merge-config.json
    
.EXAMPLE
    .\heady-merge.ps1 -ConfigFile merge-config.json -Analyze
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigFile,
    
    [Parameter(Mandatory=$false)]
    [switch]$Interactive,
    
    [Parameter(Mandatory=$false)]
    [switch]$Analyze
)

$ErrorActionPreference = "Stop"

function Show-Banner {
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     HEADY SQUASH MERGE ORCHESTRATOR v1.0              ║" -ForegroundColor Cyan
    Write-Host "║     Intelligent Multi-Codebase Merger                 ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Get-InteractiveConfig {
    Write-Host "=== Interactive Configuration Builder ===" -ForegroundColor Yellow
    Write-Host ""
    
    $config = @{
        sources = @()
        outputDir = ""
    }
    
    # Get output directory
    Write-Host "Enter output directory path (default: ./heady-merged-output):" -ForegroundColor Green
    $outputDir = Read-Host
    if ([string]::IsNullOrWhiteSpace($outputDir)) {
        $outputDir = "./heady-merged-output"
    }
    $config.outputDir = $outputDir
    
    Write-Host ""
    Write-Host "=== Add Source Codebases ===" -ForegroundColor Yellow
    Write-Host "You'll be prompted to add source codebases with weights." -ForegroundColor Gray
    Write-Host "Weights determine priority (0.0 to 1.0, will be normalized)." -ForegroundColor Gray
    Write-Host ""
    
    $sourceNum = 1
    $addMore = $true
    
    while ($addMore) {
        Write-Host "--- Source #$sourceNum ---" -ForegroundColor Cyan
        
        # Get path
        Write-Host "Enter source path:" -ForegroundColor Green
        $sourcePath = Read-Host
        
        if ([string]::IsNullOrWhiteSpace($sourcePath)) {
            Write-Host "Path cannot be empty. Skipping..." -ForegroundColor Red
            continue
        }
        
        if (-not (Test-Path $sourcePath)) {
            Write-Host "Warning: Path does not exist: $sourcePath" -ForegroundColor Yellow
            $continue = Read-Host "Continue anyway? (y/n)"
            if ($continue -ne 'y') {
                continue
            }
        }
        
        # Get weight
        Write-Host "Enter weight (0.0 to 1.0, default: 1.0):" -ForegroundColor Green
        $weightInput = Read-Host
        $weight = 1.0
        if (-not [string]::IsNullOrWhiteSpace($weightInput)) {
            try {
                $weight = [double]$weightInput
                if ($weight -lt 0 -or $weight -gt 1) {
                    Write-Host "Weight must be between 0 and 1. Using 1.0" -ForegroundColor Yellow
                    $weight = 1.0
                }
            } catch {
                Write-Host "Invalid weight. Using 1.0" -ForegroundColor Yellow
                $weight = 1.0
            }
        }
        
        # Get name
        Write-Host "Enter friendly name (optional):" -ForegroundColor Green
        $name = Read-Host
        if ([string]::IsNullOrWhiteSpace($name)) {
            $name = Split-Path -Leaf $sourcePath
        }
        
        # Add source
        $config.sources += @{
            path = $sourcePath
            weight = $weight
            name = $name
        }
        
        Write-Host "✓ Added: $name (weight: $weight)" -ForegroundColor Green
        Write-Host ""
        
        # Ask to add more
        $response = Read-Host "Add another source? (y/n)"
        $addMore = ($response -eq 'y')
        $sourceNum++
    }
    
    return $config
}

function Show-ConfigSummary {
    param($config)
    
    Write-Host "`n=== Configuration Summary ===" -ForegroundColor Yellow
    Write-Host "Output Directory: $($config.outputDir)" -ForegroundColor Gray
    Write-Host "Sources: $($config.sources.Count)" -ForegroundColor Gray
    Write-Host ""
    
    $totalWeight = ($config.sources | Measure-Object -Property weight -Sum).Sum
    
    foreach ($source in $config.sources) {
        $normalizedWeight = if ($totalWeight -gt 0) { $source.weight / $totalWeight } else { 0 }
        Write-Host "  • $($source.name)" -ForegroundColor Cyan
        Write-Host "    Path: $($source.path)" -ForegroundColor Gray
        Write-Host "    Weight: $($source.weight) (normalized: $($normalizedWeight.ToString('P2')))" -ForegroundColor Gray
    }
    
    Write-Host ""
}

function Save-Config {
    param($config, $path)
    
    $json = $config | ConvertTo-Json -Depth 10
    Set-Content -Path $path -Value $json -Encoding UTF8
    Write-Host "✓ Configuration saved to: $path" -ForegroundColor Green
}

function Invoke-HeadyMerge {
    param($configPath, [switch]$AnalyzeOnly)
    
    $mergerPath = Join-Path $PSScriptRoot "..\src\heady_squash_merge.js"
    
    if (-not (Test-Path $mergerPath)) {
        Write-Host "ERROR: Merger not found at $mergerPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Starting merge process..." -ForegroundColor Green
    Write-Host ""
    
    $result = node $mergerPath $configPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $result
        Write-Host "`n✓ Merge completed successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host $result
        Write-Host "`n✗ Merge failed!" -ForegroundColor Red
        return $false
    }
}

# Main execution
Show-Banner

if ($Interactive) {
    # Interactive mode
    $config = Get-InteractiveConfig
    
    if ($config.sources.Count -eq 0) {
        Write-Host "No sources added. Exiting." -ForegroundColor Red
        exit 1
    }
    
    Show-ConfigSummary -config $config
    
    # Ask to save config
    $saveConfig = Read-Host "Save this configuration? (y/n)"
    if ($saveConfig -eq 'y') {
        $configPath = Read-Host "Enter config file path (default: merge-config.json)"
        if ([string]::IsNullOrWhiteSpace($configPath)) {
            $configPath = "merge-config.json"
        }
        Save-Config -config $config -path $configPath
        $ConfigFile = $configPath
    } else {
        # Save to temp file
        $tempConfig = Join-Path $env:TEMP "heady-merge-temp-$([guid]::NewGuid()).json"
        Save-Config -config $config -path $tempConfig
        $ConfigFile = $tempConfig
    }
    
    # Ask to proceed
    Write-Host ""
    $proceed = Read-Host "Proceed with merge? (y/n)"
    if ($proceed -ne 'y') {
        Write-Host "Merge cancelled." -ForegroundColor Yellow
        exit 0
    }
}

if (-not $ConfigFile) {
    Write-Host "ERROR: No configuration file specified." -ForegroundColor Red
    Write-Host "Use -Interactive to build configuration or -ConfigFile to specify existing config." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $ConfigFile)) {
    Write-Host "ERROR: Configuration file not found: $ConfigFile" -ForegroundColor Red
    exit 1
}

# Load and display config
$config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
Show-ConfigSummary -config $config

# Execute merge
$success = Invoke-HeadyMerge -configPath $ConfigFile -AnalyzeOnly:$Analyze

if ($success) {
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "1. Review the merge report in the output directory" -ForegroundColor White
    Write-Host "2. Check the audit log for detailed merge history" -ForegroundColor White
    Write-Host "3. Run tests on the merged codebase" -ForegroundColor White
    Write-Host "4. Deploy using your standard Heady deployment workflow" -ForegroundColor White
    exit 0
} else {
    Write-Host "`nTroubleshooting:" -ForegroundColor Cyan
    Write-Host "1. Check the audit log for error details" -ForegroundColor White
    Write-Host "2. Verify all source paths are accessible" -ForegroundColor White
    Write-Host "3. Review weight distribution for conflicts" -ForegroundColor White
    Write-Host "4. Run with -Analyze flag to preview merge strategy" -ForegroundColor White
    exit 1
}
