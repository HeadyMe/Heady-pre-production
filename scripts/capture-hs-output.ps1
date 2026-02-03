# Capture HeadySync Output to File
# Usage: .\capture-hs-output.ps1 [-OutputFile <path>]

param(
    [string]$OutputFile = "hs-output-$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').log"
)

$ErrorActionPreference = "Continue"
$RootDir = Split-Path -Parent $PSScriptRoot

# Resolve output path
if (-not [System.IO.Path]::IsPathRooted($OutputFile)) {
    $OutputFile = Join-Path $RootDir $OutputFile
}

Write-Host "Capturing HeadySync output to: $OutputFile" -ForegroundColor Cyan

# Run hs and capture all output
Set-Location $RootDir
& "$RootDir\hs.bat" *>&1 | Tee-Object -FilePath $OutputFile

Write-Host "`nOutput saved to: $OutputFile" -ForegroundColor Green
