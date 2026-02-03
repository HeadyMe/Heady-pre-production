param([string]$Action = "generate")

function Generate-Checkpoint {
    node "$PSScriptRoot\checkpoint.js" generate
}

function View-Checkpoint {
    node "$PSScriptRoot\checkpoint.js" view
}

switch ($Action) {
    "generate" { Generate-Checkpoint }
    "view" { View-Checkpoint }
    default { Write-Host "Usage: New-Checkpoint.ps1 [generate|view]" }
}
