#!/usr/bin/env pwsh
<#
.SYNOPSIS
    HCAB - Global shortcut for HC AutoBuild

.DESCRIPTION
    Quick access to HC AutoBuild from anywhere in the system
    
.EXAMPLE
    hcab build
    hcab merge -DryRun
    hcab analyze
#>

param(
    [Parameter(Position = 0)]
    [string]$Action = 'build',
    
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$RemainingArgs
)

$HeadyRoot = 'c:\Users\erich\Heady'
$AutoBuildScript = Join-Path $HeadyRoot 'scripts' 'hc-autobuild.ps1'

if (-not (Test-Path $AutoBuildScript)) {
    Write-Error "HC AutoBuild script not found at: $AutoBuildScript"
    exit 1
}

& $AutoBuildScript -Action $Action @RemainingArgs
