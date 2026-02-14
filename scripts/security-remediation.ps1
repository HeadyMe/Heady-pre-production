# HEADY_BRAND:BEGIN
# ╔══════════════════════════════════════════════════════════════════╗
# ║ HEADY SYSTEMS :: EMERGENCY SECURITY REMEDIATION SCRIPT             ║
# ║ Sacred Geometry · Zero-Defect Protocol                             ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

<#
.SYNOPSIS
    Emergency security remediation script for Heady repository

.DESCRIPTION
    This script removes sensitive files from Git tracking and history.
    ⚠️ WARNING: This will rewrite Git history. All team members must re-clone.

.NOTES
    Author: Heady Systems Security Team
    Date: 2026-02-14
    Issue: https://github.com/HeadyMe/Heady-pre-production/issues/41
#>

param(
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║  🔒 HEADY SYSTEMS SECURITY REMEDIATION                    ║" -ForegroundColor Red
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

# Files to remove from Git history
$sensitiveFiles = @(
    ".env.hybrid",
    "server.pid",
    "audit_logs.jsonl",
    ".heady_deploy_log.jsonl",
    "heady-manager.js.bak"
)

if ($DryRun) {
    Write-Host "[🔎 DRY RUN MODE] Checking for sensitive files..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($file in $sensitiveFiles) {
        if (Test-Path $file) {
            Write-Host "  ⚠️  FOUND: $file ($(( Get-Item $file ).Length) bytes)" -ForegroundColor Red
            git log --all --oneline -- $file | Select-Object -First 5 | ForEach-Object {
                Write-Host "     ↳ $_" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "  ✓ NOT FOUND: $file" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "To execute removal, run: .\scripts\security-remediation.ps1 -Force" -ForegroundColor Yellow
    exit 0
}

if (-not $Force) {
    Write-Host "⚠️  This script will REWRITE GIT HISTORY." -ForegroundColor Red
    Write-Host "All team members will need to re-clone the repository." -ForegroundColor Red
    Write-Host ""
    Write-Host "Files to be removed:" -ForegroundColor Yellow
    $sensitiveFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }
    Write-Host ""
    $confirm = Read-Host "Type 'CONFIRM' to proceed"
    
    if ($confirm -ne "CONFIRM") {
        Write-Host "Aborted." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "[🛡️] Step 1: Creating backup..." -ForegroundColor Cyan
$backupName = "heady-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').bundle"
git bundle create $backupName --all
Write-Host "  ✓ Backup created: $backupName" -ForegroundColor Green

Write-Host "[🛡️] Step 2: Removing files from working directory..." -ForegroundColor Cyan
foreach ($file in $sensitiveFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
    }
}

Write-Host "[🛡️] Step 3: Removing files from Git index..." -ForegroundColor Cyan
foreach ($file in $sensitiveFiles) {
    git rm --cached $file -f 2>$null
    Write-Host "  ✓ Unstaged: $file" -ForegroundColor Green
}

Write-Host "[🛡️] Step 4: Checking for git-filter-repo..." -ForegroundColor Cyan
$hasFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if (-not $hasFilterRepo) {
    Write-Host "  ⚠️  git-filter-repo not found. Installing..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install git-filter-repo:" -ForegroundColor Cyan
    Write-Host "  pip install git-filter-repo" -ForegroundColor White
    Write-Host "  OR download from: https://github.com/newren/git-filter-repo" -ForegroundColor White
    Write-Host ""
    Write-Host "After installing, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "[🛡️] Step 5: Rewriting Git history (this may take a few minutes)..." -ForegroundColor Cyan
$fileArgs = $sensitiveFiles | ForEach-Object { "--path $_" }
git filter-repo --invert-paths $fileArgs --force

Write-Host "  ✓ History rewritten successfully" -ForegroundColor Green

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ SECURITY REMEDIATION COMPLETE                          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Force push to remote: git push origin --force --all" -ForegroundColor Cyan
Write-Host "  2. Notify all team members to RE-CLONE the repository" -ForegroundColor Cyan
Write-Host "  3. Rotate ALL credentials exposed in .env.hybrid" -ForegroundColor Red
Write-Host "  4. Enable GitHub secret scanning" -ForegroundColor Cyan
Write-Host "  5. Review issue #41 for remaining security tasks" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backup saved: $backupName" -ForegroundColor Green
