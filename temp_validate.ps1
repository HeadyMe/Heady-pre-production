$mainRepo = "c:\Users\erich\Heady"

Push-Location $mainRepo

$worktreeOutput = git worktree list

$worktrees = $worktreeOutput | ForEach-Object { $_.Split()[0] }

Pop-Location

$packageFiles = Get-ChildItem -Path $worktrees -Filter "package.json" -Recurse -Depth 2

foreach ($pkg in $packageFiles) {

    Write-Host "Package: $($pkg.FullName)" -ForegroundColor Cyan

}
