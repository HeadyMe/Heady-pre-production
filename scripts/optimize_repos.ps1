# HEADY SINGULARITY SQUASH PROTOCOL
# Repository Optimization + Garbage Collection

$ROOT = Get-Location
Set-Location $ROOT

Write-Host "INITIATING SINGULARITY SQUASH" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    Write-Host "  ! No .git directory found. Aborting." -ForegroundColor Red
    exit 1
}

Write-Host "  > Expiring reflogs..." -ForegroundColor DarkGray
& git reflog expire --expire=now --all | Out-Null

Write-Host "  > Repacking objects..." -ForegroundColor DarkGray
& git repack -Ad | Out-Null

Write-Host "  > Garbage collection..." -ForegroundColor DarkGray
& git gc --aggressive --prune=now | Out-Null

Write-Host "  Repository optimized." -ForegroundColor Green
Write-Host "PROTOCOL COMPLETE." -ForegroundColor Cyan
