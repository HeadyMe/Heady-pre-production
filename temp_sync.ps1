$mainRepo = "c:\Users\erich\Heady"

Push-Location $mainRepo

$worktreeOutput = git worktree list

$worktrees = $worktreeOutput | ForEach-Object { $_.Split()[0] }

Pop-Location

foreach ($wt in $worktrees) {

    Push-Location $wt

    git fetch --all --prune

    git status --short

    Pop-Location

}
