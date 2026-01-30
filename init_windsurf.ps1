# HEADY WINDSURF INITIALIZATION PROTOCOL
# Generates .windsurfrules, System Files, and Git Automation Scripts

$ROOT = "C:\Users\erich\Heady"

# Ensure Root Exists
if (-not (Test-Path $ROOT)) { New-Item -ItemType Directory -Force -Path $ROOT | Out-Null }
Set-Location $ROOT

Write-Host "∞ INITIALIZING HEADY WINDSURF ENVIRONMENT ∞" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. DIRECTORY STRUCTURE
# ------------------------------------------------------------------------------
$dirs = @(
    "src",
    "public",
    ".github\workflows",
    "docs"
)
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path "$ROOT\$d" | Out-Null
}

# ------------------------------------------------------------------------------
# 2. WINDSURF RULES (The Brain)
# ------------------------------------------------------------------------------
# This file instructs the Windsurf Cascade agent on how to behave.
$windsurfRules = @"
# HEADY SYSTEMS | WINDSURF PROTOCOL

## PRIMARY DIRECTIVE
You are the Heady Project AI. Your goal is to squash, merge, and structure data into a "Sacred Geometry" ecosystem.

## DOCUMENTATION BEHAVIOR (The Quiz Protocol)
When asked to document code or generate summaries, YOU MUST FOLLOW THIS EXACT PROCEDURE:

1. **Review & Extract:** Read the material. Identify concepts, processes, and data.
2. **Generate Quiz Questions:** Create clear questions for each concept. Use open-ended for insights, boolean/multiple-choice for recall.
3. **Formulate Flashcards:** Convert Question-Answer pairs into flashcards. ONE idea per card.
4. **Iterative Coverage:** Repeat until all material is processed. Avoid redundancy.
5. **Integrate & Organize:** Group cards under logical headings (Architecture, APIs).
6. **Ensure Precision:** Verify accuracy.

## TECH STACK
- **Manager:** Node.js (MCP Protocol)
- **Worker:** Python (Render Worker)
- **Frontend:** React (CDN) with Sacred Geometry Aesthetics (Rounded, Organic, Breathing)
- **Deployment:** Render.com Blueprint

## PATHS
- `src/`: Backend logic
- `public/`: Sacred UI
- `.github/`: Copilot & Actions Configuration
"@
Set-Content -Path "$ROOT\.windsurfrules" -Value $windsurfRules -Encoding UTF8
Write-Host "✓ .windsurfrules Created" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 3. RENDER BLUEPRINT
# ------------------------------------------------------------------------------
$renderYaml = @"
services:
  - type: worker
    name: heady-data-worker
    env: python
    region: oregon
    buildCommand: pip install -r requirements.txt
    startCommand: python src/process_data.py
    disk:
      name: data
      mountPath: /data
      sizeGB: 10
    envVars:
      - fromGroup: heady-shared-secrets

databases:
  - name: heady-db
    databaseName: heady
    user: heady_user
    ipAllowList: [] # Internal access only

envVarGroups:
  - name: heady-shared-secrets
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: heady-db
          property: connectionString
      - key: OTHER_API_KEY
        generate: true
"@
Set-Content -Path "$ROOT\render.yaml" -Value $renderYaml
Write-Host "✓ render.yaml Created" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 4. GITHUB COPILOT CONFIGURATION
# ------------------------------------------------------------------------------
$copilotInstructions = @"
# HeadySystems Copilot Instructions

## Project Overview
This is a Node.js (Manager) and Python (Worker) hybrid system designed for the HeadyConnection ecosystem.

## Documentation Protocol
**CRITICAL:** All documentation must be generated using the Quiz & Flashcard Methodology.
1. Extract Key Points -> 2. Quiz Questions -> 3. Flashcards -> 4. Integration.

## Architecture
- **Root:** Configuration and Orchestration.
- **src/**: Data processing logic (Python).
- **public/**: React-based Sacred Geometry UI.
"@
Set-Content -Path "$ROOT\.github\copilot-instructions.md" -Value $copilotInstructions

$copilotWorkflow = @"
name: Copilot Setup Steps
on: workflow_dispatch

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install Dependencies
        run: |
          npm install
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
"@
Set-Content -Path "$ROOT\.github\workflows\copilot-setup-steps.yml" -Value $copilotWorkflow

$mcpConfig = @"
{
  "mcpServers": {
    "heady-manager": {
      "type": "local",
      "command": "node",
      "args": ["heady-manager.js"],
      "tools": ["*"]
    }
  }
}
"@
Set-Content -Path "$ROOT\.github\copilot-mcp-config.json" -Value $mcpConfig
Write-Host "✓ Copilot Configuration Created" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 5. CORE SYSTEM FILES (Node Manager & Python Worker)
# ------------------------------------------------------------------------------
$packageJson = @"
{
  "name": "heady-systems-core",
  "version": "1.0.0",
  "description": "HeadySystems Nexus Core",
  "main": "heady-manager.js",
  "scripts": {
    "start": "node heady-manager.js",
    "deploy": "powershell ./nexus_deploy.ps1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "dockerode": "^4.0.2",
    "@modelcontextprotocol/sdk": "^1.0.1",
    "zod": "^3.22.4"
  }
}
"@
Set-Content -Path "$ROOT\package.json" -Value $packageJson

# Python Worker Placeholder
$pyWorker = @"
import time
import os

print("∞ Heady Data Worker Initialized ∞")
print("Accessing Sacred Data Stream...")

while True:
    # Placeholder for data processing logic
    time.sleep(60)
"@
Set-Content -Path "$ROOT\src\process_data.py" -Value $pyWorker

# ------------------------------------------------------------------------------
# 6. NEXUS DEPLOY SCRIPT (Git Automator)
# ------------------------------------------------------------------------------
# Note: nexus_deploy.ps1 is created separately to avoid nested here-string issues
$nexusDeployLines = @(
    '# HEADY NEXUS DEPLOYMENT PROTOCOL',
    '# Executed via Windsurf Terminal',
    '',
    '$ROOT = "C:\Users\erich\Heady"',
    'Set-Location $ROOT',
    '',
    'Write-Host "∞ INITIATING WINDSURF NEXUS EVENT ∞" -ForegroundColor Cyan',
    '',
    '# 1. CLEAN SLATE (Intelligent Squash)',
    'if (Test-Path ".git") {',
    '    Remove-Item -Path ".git" -Recurse -Force',
    '    Write-Host "Old timeline dissolved." -ForegroundColor Gray',
    '}',
    '',
    '# 2. INITIALIZATION',
    'git init',
    'git branch -m main',
    '',
    '# 3. CONFIGURE REMOTES (The 5 Pillars)',
    'git remote add origin        "https://github.com/HeadyMe/main.git"',
    'git remote add heady-me      "https://github.com/HeadyMe/Heady.git"',
    'git remote add heady-sys     "https://github.com/HeadySystems/Heady.git"',
    'git remote add sandbox       "https://github.com/HeadySystems/sandbox.git"',
    'git remote add connection    "https://github.com/HeadySystems/HeadyConnection.git"',
    '',
    'Write-Host "Remotes aligned." -ForegroundColor Green',
    '',
    '# 4. IGNORE RULES',
    '$ignoreContent = "node_modules/`n.env`n.heady_secrets`n__pycache__/`n*.log`n.venv/"',
    'Set-Content ".gitignore" -Value $ignoreContent',
    '',
    '# 5. GENESIS COMMIT',
    'git add .',
    'git commit -m "Genesis: HeadySystems Windsurf Initialization"',
    '',
    '# 6. FORCE PUSH PROTOCOL',
    'Write-Host "PREPARING FOR DISTRIBUTION..." -ForegroundColor Yellow',
    'Write-Host "You may be prompted for GitHub credentials."',
    '',
    'function Push-To-Remote ($remoteName) {',
    '    Write-Host "Pushing to $remoteName..." -NoNewline',
    '    $output = git push -u $remoteName main --force 2>&1',
    '    if ($LASTEXITCODE -eq 0) {',
    '        Write-Host " [SUCCESS]" -ForegroundColor Green',
    '    } else {',
    '        Write-Host " [FAILED - CHECK AUTH]" -ForegroundColor Red',
    '    }',
    '}',
    '',
    'Push-To-Remote "origin"',
    'Push-To-Remote "heady-me"',
    'Push-To-Remote "heady-sys"',
    'Push-To-Remote "sandbox"',
    'Push-To-Remote "connection"',
    '',
    'Write-Host "∞ NEXUS EVENT COMPLETE ∞" -ForegroundColor Cyan'
)
$nexusDeployLines -join "`n" | Set-Content -Path "$ROOT\nexus_deploy.ps1" -Encoding UTF8
Write-Host "✓ nexus_deploy.ps1 Created" -ForegroundColor Green

Write-Host "`n---------------------------------------------------"
Write-Host "WINDSURF INITIALIZATION COMPLETE" -ForegroundColor Cyan
Write-Host "1. Open Windsurf to: $ROOT"
Write-Host "2. Install dependencies: npm install"
Write-Host "3. Deploy to GitHub: .\nexus_deploy.ps1"
Write-Host "---------------------------------------------------"
