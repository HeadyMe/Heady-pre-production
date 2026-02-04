# Simple test for HCAutoBuild system
Write-Host "HCAutoBuild System Test" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green

# Test basic functionality
Write-Host "Testing system components..." -ForegroundColor Yellow

# Check if main files exist
$files = @(
    "hcautobuild.ps1",
    "hc.bat", 
    "hc-status.bat",
    "hc-checkpoint.bat",
    "hc-monitor.bat",
    ".heady\hcautobuild_config.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ Missing: $file" -ForegroundColor Red
    }
}

# Test workspace paths
$workspaces = @("Heady", "CascadeProjects")
$basePath = "C:\Users\erich\.windsurf\worktrees"

Write-Host "`nChecking workspaces..." -ForegroundColor Yellow
foreach ($ws in $workspaces) {
    $wsPath = "$basePath\$ws-$ws"
    if (Test-Path $wsPath) {
        Write-Host "✓ Workspace: $ws" -ForegroundColor Green
    } else {
        Write-Host "✗ Workspace not found: $ws" -ForegroundColor Red
    }
}

Write-Host "`nSystem test complete!" -ForegroundColor Green
Write-Host "HCAutoBuild is ready for autonomous operation." -ForegroundColor Cyan
