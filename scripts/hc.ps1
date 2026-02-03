<#
.SYNOPSIS
    Heady Control - System Synchronization
.DESCRIPTION
    Executes hc command with auto-build option for system synchronization
.EXAMPLE
    .\hc.ps1 -a hs
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$a = ""
)

$ErrorActionPreference = 'Stop'

if ($a -eq "hs") {
    Write-Host "🚀 Executing Heady Sync with auto-build"
    node "$PSScriptRoot\..\src\heady-control.js" -a hs
} else {
    Write-Host "Usage: .\hc.ps1 -a hs"
}
