# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: temp_validate.ps1
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

$mainRepo = "c:\Users\erich\Heady"

Push-Location $mainRepo

$worktreeOutput = git worktree list

$worktrees = $worktreeOutput | ForEach-Object { $_.Split()[0] }

Pop-Location

$packageFiles = Get-ChildItem -Path $worktrees -Filter "package.json" -Recurse -Depth 2

foreach ($pkg in $packageFiles) {

    Write-Host "Package: $($pkg.FullName)" -ForegroundColor Cyan

}
