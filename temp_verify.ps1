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
