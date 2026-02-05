# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: temp_verify.ps1
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

$worktrees = @(
    "C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052",
    "C:\Users\erich\.windsurf\worktrees\CascadeProjects\CascadeProjects-4aa75052",
    "C:\Users\erich\.windsurf\worktrees\Projects\Projects-4ce25b33"
)

foreach ($wt in $worktrees) {
    if (Test-Path $wt) {
        Write-Host "✅ $wt" -ForegroundColor Green
    } else {
        Write-Host "❌ $wt" -ForegroundColor Red
    }
}
