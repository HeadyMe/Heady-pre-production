# HEADY GENESIS PROTOCOL
# Scaffolds, Secures, and Intelligent-Squashes the System.

$ROOT = Get-Location
$ErrorActionPreference = "Stop"

Write-Host "∞ INITIATING HEADY GENESIS PROTOCOL ∞" -ForegroundColor Cyan

# ==============================================================================
# 1. SYSTEM SCAFFOLDING (The Skeleton)
# ==============================================================================
Write-Host "`n[1/4] Constructing Architecture..." -ForegroundColor Yellow

# Create Directories
$dirs = @("src", "public", "docs", ".github\workflows", "tools")
foreach ($d in $dirs) {
    if (-not (Test-Path "$ROOT\$d")) {
        New-Item -ItemType Directory -Force -Path "$ROOT\$d" | Out-Null
        Write-Host "  + Created: $d" -ForegroundColor Green
    }
}

# Generate .gitignore (CRITICAL SECURITY STEP)
$gitignoreContent = @"
node_modules/
.env
.venv
__pycache__/
*.log
secrets_dump.txt
"@
Set-Content -Path "$ROOT\.gitignore" -Value $gitignoreContent
Write-Host "  + Secured: .gitignore" -ForegroundColor Green

# Generate Core Files
$files = @{
    "package.json" = @'
{
  "name": "heady-systems-core",
  "version": "1.0.0",
  "main": "heady-manager.js",
  "scripts": { "start": "node heady-manager.js" },
  "dependencies": { "express": "^4.18.2", "cors": "^2.8.5", "dockerode": "^4.0.2", "@modelcontextprotocol/sdk": "^1.0.1" }
}
'@
    "render.yaml" = @'
services:
  - type: web
    name: heady-manager
    env: node
    buildCommand: npm install
    startCommand: node heady-manager.js
    envVars:
      - fromGroup: heady-shared-secrets
'@
    "heady-manager.js" = @'
const express = require("express"); const app = express();
app.use(express.static("public"));
app.listen(3300, () => console.log("∞ Heady System Active on Port 3300 ∞"));
'@
    "public\index.html" = @'
<!DOCTYPE html><html><head><title>Heady Codex</title><style>body{background:#020208;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;}</style></head><body><h1>∞ HEADY SYSTEMS ACTIVE ∞</h1></body></html>
'@
    "src\process_data.py" = 'print("Heady Data Worker Initialized")'
}

foreach ($name in $files.Keys) {
    Set-Content -Path "$ROOT\$name" -Value $files[$name]
}
Write-Host "  + Generated Core Files" -ForegroundColor Green

# ==============================================================================
# 2. SECRET VAULT GENERATION
# ==============================================================================
Write-Host "`n[2/4] Initializing Secret Vault..." -ForegroundColor Yellow

$secretScript = @'
# HEADY SECRET LOADER
$envFile = "$PSScriptRoot\.env"
if (-not (Test-Path $envFile)) {
    $template = @"
# HEADY MASTER KEYS
# -----------------
DATABASE_URL=
GITHUB_PERSONAL_ACCESS_TOKEN=
HF_TOKEN=
HEADY_API_KEY=
"@
    Set-Content -Path $envFile -Value $template
    Write-Host "  > Created .env template" -ForegroundColor Green
}
# ACL Hardening could go here
# Load to session
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.*)') {
        [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], "Process")
    }
}
Write-Host "  > Secrets Loaded into Memory" -ForegroundColor Cyan
'@
Set-Content -Path "$ROOT\organize_secrets.ps1" -Value $secretScript

# Run it immediately to create the .env file
Invoke-Expression "$ROOT\organize_secrets.ps1"

# ==============================================================================
# 3. INTELLIGENT SQUASH (The Singularity)
# ==============================================================================
Write-Host "`n[3/4] Performing Singularity Squash..." -ForegroundColor Yellow

# The "Nuclear" Option: Remove existing git folder to force a true start-over
if (Test-Path "$ROOT\.git") {
    Remove-Item -Path "$ROOT\.git" -Recurse -Force
    Write-Host "  - Dissolved old timeline" -ForegroundColor Gray
}

git init | Out-Null
git branch -m main
git add .
git commit -m "Genesis: HeadySystems Singularity Build" | Out-Null
Write-Host "  + Created Genesis Commit" -ForegroundColor Green

# ==============================================================================
# 4. NEXUS CONNECTION (Remotes)
# ==============================================================================
Write-Host "`n[4/4] Linking Nexus Pillars..." -ForegroundColor Yellow

$remotes = @{
    "origin"     = "https://github.com/HeadyMe/main.git"
    "heady-me"   = "https://github.com/HeadyMe/Heady.git"
    "heady-sys"  = "https://github.com/HeadySystems/Heady.git"
    "sandbox"    = "https://github.com/HeadySystems/sandbox.git"
    "connection" = "https://github.com/HeadySystems/HeadyConnection.git"
}

foreach ($name in $remotes.Keys) {
    git remote add $name $remotes[$name]
    Write-Host "  + Linked: $name" -ForegroundColor Green
}

Write-Host "`n---------------------------------------------------"
Write-Host "GENESIS COMPLETE." -ForegroundColor Cyan
Write-Host "1. Open the '.env' file to add secrets."
Write-Host "2. Run '.\organize_secrets.ps1' to load them."
Write-Host "3. Run 'npm install' to finish setup."
Write-Host "---------------------------------------------------"

<#
---
### **Phase 2: How to Provide Secrets to the File**

The script above automatically created a file named `.env` in your project folder (`C:\Users\erich\Heady\.env`). This is your **Vault**.

**Step 1: Open the Vault**
1.  Go to your file explorer (or Windsurf file tree).
2.  Click on the file named `.env`.

**Step 2: Enter Your Keys**
The file will look like this. Paste your actual keys immediately after the equals sign (`=`). **Do not** add spaces or quotes around standard keys.

```text
# HEADY MASTER KEYS
# -----------------
DATABASE_URL=postgres://user:password@hostname:5432/db
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_YourActualLongTokenStringHere12345
HF_TOKEN=hf_YourHuggingFaceTokenHere
HEADY_API_KEY=my-local-dev-key
```

**Step 3: Save and Load**
1.  Save the file (`Ctrl+S`).
2.  To make the system *use* these keys immediately, run this command in your terminal:
    ```powershell
    .\organize_secrets.ps1
    ```
This command will read your `.env` file and load the variables into the current session.

**Important Security Notes:**
- NEVER commit your `.env` file to Git (it's already in .gitignore)
- Keep backups of your keys in a secure password manager
- Rotate keys periodically for enhanced security

---
#>