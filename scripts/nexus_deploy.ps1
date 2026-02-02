# HEADY NEXUS DEPLOYMENT PROTOCOL
# Executed via Windsurf Terminal

$ROOT = "C:\Users\erich\Heady"
Set-Location $ROOT

Write-Host "∞ INITIATING WINDSURF NEXUS EVENT ∞" -ForegroundColor Cyan

# 1. CLEAN SLATE (Intelligent Squash)
# We remove the old git folder to create a singular "Genesis" commit
if (Test-Path ".git") {
    Remove-Item -Path ".git" -Recurse -Force
    Write-Host "Old timeline dissolved." -ForegroundColor Gray
}

# 2. INITIALIZATION
git init
git branch -m main

# 3. CONFIGURE REMOTES (The 5 Pillars)
# We add all target repos as remotes
git remote add origin        "https://github.com/HeadyMe/main.git"
git remote add heady-me      "https://github.com/HeadyMe/Heady.git"
git remote add heady-sys     "https://github.com/HeadySystems/Heady.git"
git remote add sandbox       "https://github.com/HeadySystems/sandbox.git"
git remote add connection    "https://github.com/HeadySystems/HeadyConnection.git"

Write-Host "Remotes aligned." -ForegroundColor Green

# 4. IGNORE RULES
$ignoreContent = "node_modules/`n.env`n.heady_secrets`n__pycache__/`n*.log`n.venv/"
Set-Content ".gitignore" -Value $ignoreContent

# 5. GENESIS COMMIT
git add .
git commit -m "Genesis: HeadySystems Windsurf Initialization"

# 6. FORCE PUSH PROTOCOL
Write-Host "PREPARING FOR DISTRIBUTION..." -ForegroundColor Yellow
Write-Host "You may be prompted for GitHub credentials."

# Helper function to push safely
function Push-To-Remote ($remoteName) {
    Write-Host "Pushing to $remoteName..." -NoNewline
    $output = git push -u $remoteName main --force 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [SUCCESS]" -ForegroundColor Green
    } else {
        Write-Host " [FAILED - CHECK AUTH]" -ForegroundColor Red
        Write-Host "  Error: $output" -ForegroundColor DarkGray
    }
}

Push-To-Remote "origin"
Push-To-Remote "heady-me"
Push-To-Remote "heady-sys"
Push-To-Remote "sandbox"
Push-To-Remote "connection"

Write-Host "∞ NEXUS EVENT COMPLETE ∞" -ForegroundColor Cyan
