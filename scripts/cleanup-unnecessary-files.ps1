# Cleanup Unnecessary Files - Pre-HeadySync
# Removes temporary files, caches, and build artifacts

param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "`n🧹 Heady Cleanup: Removing Unnecessary Files" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$CleanupTargets = @(
    # Test coverage artifacts
    @{ Path = "coverage"; Type = "Directory"; Reason = "Test coverage reports (regenerated on test)" },
    
    # Python cache
    @{ Path = ".ruff_cache"; Type = "Directory"; Reason = "Ruff linter cache" },
    @{ Path = ".venv-health"; Type = "Directory"; Reason = "Unused Python virtual environment" },
    
    # Build artifacts
    @{ Path = "frontend\dist"; Type = "Directory"; Reason = "Frontend build output (regenerated)" },
    @{ Path = "backend\dist"; Type = "Directory"; Reason = "Backend build output (regenerated)" },
    
    # Old audit logs (keep recent)
    @{ Path = "audit_logs\autobuild"; Type = "Directory"; Reason = "Old autobuild logs (archived)" }
)

$TotalSize = 0
$RemovedCount = 0

foreach ($target in $CleanupTargets) {
    $fullPath = Join-Path $RootDir $target.Path
    
    if (Test-Path $fullPath) {
        try {
            # Calculate size
            $size = 0
            if ($target.Type -eq "Directory") {
                $size = (Get-ChildItem -Path $fullPath -Recurse -File -ErrorAction SilentlyContinue | 
                         Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            } else {
                $size = (Get-Item $fullPath -ErrorAction SilentlyContinue).Length
            }
            
            $sizeMB = [math]::Round($size / 1MB, 2)
            $TotalSize += $size
            
            if ($DryRun) {
                Write-Host "  [DRY RUN] Would remove: $($target.Path) ($sizeMB MB)" -ForegroundColor Yellow
                Write-Host "    Reason: $($target.Reason)" -ForegroundColor DarkGray
            } else {
                Write-Host "  Removing: $($target.Path) ($sizeMB MB)" -ForegroundColor Green
                Write-Host "    Reason: $($target.Reason)" -ForegroundColor DarkGray
                
                if ($target.Type -eq "Directory") {
                    Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
                } else {
                    Remove-Item -Path $fullPath -Force -ErrorAction Stop
                }
                
                $RemovedCount++
            }
        } catch {
            Write-Host "  ⚠️  Failed to remove $($target.Path): $_" -ForegroundColor Red
        }
    } elseif ($Verbose) {
        Write-Host "  [SKIP] Not found: $($target.Path)" -ForegroundColor DarkGray
    }
}

$TotalSizeMB = [math]::Round($TotalSize / 1MB, 2)

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "✅ Dry run complete. Would free up: $TotalSizeMB MB" -ForegroundColor Yellow
    Write-Host "   Run without -DryRun to actually remove files." -ForegroundColor Gray
} else {
    Write-Host "✅ Cleanup complete! Removed $RemovedCount items, freed $TotalSizeMB MB" -ForegroundColor Green
}
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
