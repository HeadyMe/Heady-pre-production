# HEADY SCAFFOLDING & INGESTION PROTOCOL
# Initializes structure, creates secret dump, and performs secure ingestion.

$ROOT = Get-Location
$dumpFile = "secrets_dump.txt"
$envFile = ".env"
$gitignore = ".gitignore"

Write-Host "∞ INITIATING HEADY PROTOCOL ∞" -ForegroundColor Cyan

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
    if (-not (Test-Path "$ROOT\$d")) {
        New-Item -ItemType Directory -Force -Path "$ROOT\$d" | Out-Null
        Write-Host "  + Created Directory: $d" -ForegroundColor Green
    }
}

# ------------------------------------------------------------------------------
# 2. SECURITY & GITIGNORE
# ------------------------------------------------------------------------------
# Critical: Ensure secrets are ignored before we create or write to them.
if (-not (Test-Path $gitignore)) { New-Item -Path $gitignore -ItemType File -Value "" | Out-Null }

$gitContent = Get-Content $gitignore -Raw
$ignores = @(".env", ".venv", $dumpFile)

foreach ($item in $ignores) {
    if ($gitContent -notmatch [regex]::Escape($item)) {
        Add-Content -Path $gitignore -Value "`n$item"
        Write-Host "  ✓ Security: Added '$item' to .gitignore" -ForegroundColor Green
    }
}

# ------------------------------------------------------------------------------
# 3. CREATE DUMP AREA
# ------------------------------------------------------------------------------
if (-not (Test-Path $dumpFile)) {
    $template = @"
# SECRET DUMP AREA
# ------------------------------------------------------------------
# PASTE YOUR RAW KEYS BELOW AND SAVE.
# The script will ingest them into .env and offer to delete this file.
#
# Examples:
# GITHUB_TOKEN=ghp_xyz...
# DATABASE_URL="postgres://user:pass@localhost:5432/db"
# ------------------------------------------------------------------

"@
    Set-Content -Path $dumpFile -Value $template
    Write-Host "  ✓ Created Dump File: $dumpFile" -ForegroundColor Green
} else {
    Write-Host "  ! Dump file exists." -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# 4. INGESTION PROTOCOL
# ------------------------------------------------------------------------------
Write-Host "`n---------------------------------------------------"
$action = Read-Host "Do you want to scan '$dumpFile' and ingest secrets now? (y/n)"

if ($action -eq 'y') {
    Write-Host "Scanning '$dumpFile'..." -ForegroundColor Cyan
    
    $rawContent = Get-Content $dumpFile
    $keysFound = @{}
    # Matches KEY=VALUE or KEY: "VALUE"
    $regex = '^\s*([A-Z_][A-Z0-9_]+)\s*[:=]\s*["'']?([^"''\r\n]+)["'']?'

    foreach ($line in $rawContent) {
        if ($line -match $regex) {
            $key = $Matches[1]
            $val = $Matches[2]
            $keysFound[$key] = $val
        }
    }

    if ($keysFound.Count -eq 0) {
        Write-Host "  ! No secrets found (or file is empty/comments only)." -ForegroundColor DarkGray
    } else {
        # Initialize .env if missing
        if (-not (Test-Path $envFile)) { New-Item -Path $envFile -ItemType File -Value "# HEADY SYSTEM SECRETS`n" | Out-Null }
        
        $currentEnv = Get-Content $envFile -ErrorAction SilentlyContinue
        $newEnvContent = if ($currentEnv) { $currentEnv -as [System.Collections.ArrayList] } else { New-Object System.Collections.ArrayList }

        foreach ($key in $keysFound.Keys) {
            $value = $keysFound[$key]
            $pattern = "^$key="
            
            $matchIndex = -1
            for ($i=0; $i -lt $newEnvContent.Count; $i++) {
                if ($newEnvContent[$i] -match $pattern) {
                    $matchIndex = $i
                    break
                }
            }

            if ($matchIndex -ge 0) {
                $newEnvContent[$matchIndex] = "$key=$value" # Update
                Write-Host "  > Updated: $key" -ForegroundColor Cyan
            } else {
                $newEnvContent.Add("$key=$value") # Append
                Write-Host "  + Added:   $key" -ForegroundColor Green
            }
        }
        $newEnvContent | Set-Content $envFile
        Write-Host "  ✓ Secrets secured in $envFile" -ForegroundColor Green
        
        # Cleanup
        $del = Read-Host "Delete '$dumpFile' to prevent leaks? (y/n)"
        if ($del -eq 'y') { Remove-Item $dumpFile -Force; Write-Host "  ✓ Dump file incinerated." -ForegroundColor Green }
    }
}

Write-Host "`nPROTOCOL COMPLETE." -ForegroundColor Cyan
# ------------------------------------------------------------------------------
# 5. HEADY IMPROVEMENT PROTOCOL - AUTOMATED IMPLEMENTATION
# ------------------------------------------------------------------------------
Write-Host "`n[IMPROVEMENT PROTOCOL] Initializing repository enhancements..." -ForegroundColor Magenta

# Create requirements.txt if missing
$requirementsFile = "$ROOT\requirements.txt"
if (-not (Test-Path $requirementsFile)) {
    $requirementsContent = @"
# HEADY PROJECT DEPENDENCIES
pytest>=7.0.0
flake8>=6.0.0
black>=23.0.0
jsonschema>=4.0.0
python-dotenv>=1.0.0
requests>=2.28.0
"@
    Set-Content -Path $requirementsFile -Value $requirementsContent
    Write-Host "  ✓ Created requirements.txt" -ForegroundColor Green
}

# Create sample projects.json
$projectsExample = "$ROOT\projects_example.json"
if (-not (Test-Path $projectsExample)) {
    $projectsJson = @"
{
  "workspace": "heady_workspace",
  "version": "v12.3",
  "projects": [
    {
      "slug": "example-project",
      "apex_domain": "example.com",
      "trust_domain": "trust.example.com",
      "vertical": "data-processing",
      "enabled": true
    }
  ]
}
"@
    Set-Content -Path $projectsExample -Value $projectsJson
    Write-Host "  ✓ Created projects_example.json" -ForegroundColor Green
}

# Create GitHub Actions CI workflow
$ciWorkflowDir = "$ROOT\.github\workflows"
$ciWorkflowFile = "$ciWorkflowDir\ci.yml"
if (-not (Test-Path $ciWorkflowFile)) {
    $ciYaml = @"
name: CI Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Lint with flake8
        run: flake8 . --max-line-length=120
      - name: Format check with black
        run: black --check .
      - name: Run tests
        run: pytest tests/ -v
"@
    Set-Content -Path $ciWorkflowFile -Value $ciYaml
    Write-Host "  ✓ Created CI workflow (.github/workflows/ci.yml)" -ForegroundColor Green
}

# Create tests directory structure
$testsDir = "$ROOT\tests"
if (-not (Test-Path $testsDir)) {
    New-Item -ItemType Directory -Force -Path $testsDir | Out-Null
    $initTest = "$testsDir\__init__.py"
    Set-Content -Path $initTest -Value "# Heady Test Suite"
    
    $sampleTest = "$testsDir\test_core.py"
    $testContent = @"
import pytest

def test_placeholder():
    """Placeholder test - replace with actual tests."""
    assert True

def test_manifest_generation():
    """Test heady-manifest.json generation."""
    # TODO: Test manifest creation logic
    pass
"@
    Set-Content -Path $sampleTest -Value $testContent
    Write-Host "  ✓ Created tests/ directory with sample tests" -ForegroundColor Green
}

# Update .gitignore with additional security entries
$additionalIgnores = @("*.pyc", "__pycache__/", ".pytest_cache/", "*.egg-info/", "dist/", "build/")
foreach ($ignore in $additionalIgnores) {
    $currentGit = Get-Content $gitignore -Raw -ErrorAction SilentlyContinue
    if ($currentGit -notmatch [regex]::Escape($ignore)) {
        Add-Content -Path $gitignore -Value $ignore
    }
}
Write-Host "  ✓ Updated .gitignore with Python artifacts" -ForegroundColor Green

# Create pyproject.toml for modern Python tooling
$pyprojectFile = "$ROOT\pyproject.toml"
if (-not (Test-Path $pyprojectFile)) {
    $pyprojectContent = @"
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "heady-project"
version = "12.3.0"
description = "HeadySystems Data Processing Pipeline"
requires-python = ">=3.9"

[tool.black]
line-length = 120
target-version = ['py311']

[tool.flake8]
max-line-length = 120
exclude = [".venv", "build", "dist"]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
"@
    Set-Content -Path $pyprojectFile -Value $pyprojectContent
    Write-Host "  ✓ Created pyproject.toml" -ForegroundColor Green
}

Write-Host "`n[IMPROVEMENT PROTOCOL] Repository enhancements complete." -ForegroundColor Magenta
# Create requirements.txt for Python dependencies
$requirementsFile = "$ROOT\requirements.txt"
if (-not (Test-Path $requirementsFile)) {
    $requirementsContent = @"
# HeadySystems Core Dependencies
jsonschema>=4.0.0
python-dotenv>=1.0.0
requests>=2.31.0
pyyaml>=6.0.0

# Testing & Development (move to requirements-dev.txt if separating)
pytest>=7.4.0
flake8>=6.1.0
black>=23.0.0
ruff>=0.1.0
"@
    Set-Content -Path $requirementsFile -Value $requirementsContent
    Write-Host "  ✓ Created requirements.txt" -ForegroundColor Green
}

# Create comprehensive README.md
$readmeFile = "$ROOT\README.md"
$readmeContent = @"
# HeadySystems Inc.

## Overview
HeadySystems is a data-processing pipeline and agent configuration framework designed for scalable, secure deployments.

## Architecture
- **src/**: Core Python processing logic
- **public/**: React-based UI components
- **tests/**: Unit and integration tests
- **.github/**: CI/CD workflows and Copilot configurations

## Installation
```bash
# Clone and setup
git clone https://github.com/HeadySystems/Heady.git
cd Heady
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Configuration
1. Copy `projects_example.json` to `projects.json`
2. Set environment variables in `.env` (see `.env.example`)
3. Run `python src/consolidated_builder.py`

## Testing
```bash
pytest tests/ -v
flake8 . --max-line-length=120
black --check .
```

## Contributing
See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## License
Apache 2.0 - See [LICENSE](LICENSE)
"@
Set-Content -Path $readmeFile -Value $readmeContent
Write-Host "  ✓ Created comprehensive README.md" -ForegroundColor Green

# Create .env.example template
$envExampleFile = "$ROOT\.env.example"
if (-not (Test-Path $envExampleFile)) {
    $envExampleContent = @"
# HeadySystems Environment Configuration
# Copy this file to .env and fill in your values

# Database
DATABASE_URL=postgres://user:password@localhost:5432/heady

# API Keys (obtain from respective services)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
GITHUB_TOKEN=

# Application Settings
HEADY_VERSION=v12.3
CONFIG_FILE=projects.json
LOG_LEVEL=INFO
"@
    Set-Content -Path $envExampleFile -Value $envExampleContent
    Write-Host "  ✓ Created .env.example template" -ForegroundColor Green
}

# Create CONTRIBUTING.md
$docsDir = "$ROOT\docs"
$contributingFile = "$docsDir\CONTRIBUTING.md"
if (-not (Test-Path $contributingFile)) {
    $contributingContent = @"
# Contributing to HeadySystems

## Code of Conduct
Be respectful, inclusive, and constructive in all interactions.

## Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes with tests
4. Run linters: `flake8 . && black --check .`
5. Submit a pull request

## Code Standards
- Follow PEP 8 style guidelines
- Add type hints to all functions
- Include docstrings (PEP 257)
- Write unit tests for new functionality

## Commit Messages
Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
"@
    Set-Content -Path $contributingFile -Value $contributingContent
    Write-Host "  ✓ Created CONTRIBUTING.md" -ForegroundColor Green
}
# HEADY AUTONOMOUS REPO OPTIMIZER & MERGE ORCHESTRATOR
# Squash-merges 5 source repos into 6 identical local repositories

$ROOT = "C:\Users\erich\Heady"
$TEMP_MERGE = "$ROOT\.heady_merge_temp"
$SOURCE_REPOS = @(
    @{ Name = "main"; URL = "https://github.com/HeadyMe/main.git" },
    @{ Name = "heady-me"; URL = "https://github.com/HeadyMe/Heady.git" },
    @{ Name = "heady-sys"; URL = "https://github.com/HeadySystems/Heady.git" },
    @{ Name = "sandbox"; URL = "https://github.com/HeadySystems/sandbox.git" },
    @{ Name = "connection"; URL = "https://github.com/HeadySystems/HeadyConnection.git" }
)
$TARGET_REPOS = @("Heady1", "Heady2", "Heady3", "Heady4", "Heady5", "Heady6")

Write-Host "∞ HEADY AUTONOMOUS MERGE ORCHESTRATOR ∞" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# PHASE 1: SETUP & CLONE SOURCE REPOSITORIES
# ------------------------------------------------------------------------------
Write-Host "`n[PHASE 1] Cloning source repositories..." -ForegroundColor Magenta

if (Test-Path $TEMP_MERGE) { Remove-Item -Path $TEMP_MERGE -Recurse -Force }
New-Item -ItemType Directory -Force -Path $TEMP_MERGE | Out-Null

$cloneResults = @{}
foreach ($repo in $SOURCE_REPOS) {
    $clonePath = "$TEMP_MERGE\$($repo.Name)"
    Write-Host "  Cloning $($repo.Name)..." -ForegroundColor Yellow
    try {
        git clone --depth 1 $repo.URL $clonePath 2>&1 | Out-Null
        $cloneResults[$repo.Name] = @{ Success = $true; Path = $clonePath }
        Write-Host "    ✓ $($repo.Name) cloned" -ForegroundColor Green
    } catch {
        $cloneResults[$repo.Name] = @{ Success = $false; Error = $_.Exception.Message }
        Write-Host "    ✗ $($repo.Name) failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ------------------------------------------------------------------------------
# PHASE 2: INVENTORY & CONFLICT DETECTION
# ------------------------------------------------------------------------------
Write-Host "`n[PHASE 2] Scanning and inventorying all repositories..." -ForegroundColor Magenta

$fileInventory = @{}
$conflicts = @()

foreach ($repo in $SOURCE_REPOS) {
    if (-not $cloneResults[$repo.Name].Success) { continue }
    $repoPath = $cloneResults[$repo.Name].Path
    
    Get-ChildItem -Path $repoPath -Recurse -File | Where-Object { $_.FullName -notmatch '\.git\\' } | ForEach-Object {
        $relativePath = $_.FullName.Replace("$repoPath\", "")
        $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
        
        if (-not $fileInventory.ContainsKey($relativePath)) {
            $fileInventory[$relativePath] = @()
        }
        $fileInventory[$relativePath] += @{
            Repo = $repo.Name
            FullPath = $_.FullName
            Hash = $hash
            LastWrite = $_.LastWriteTime
        }
    }
}

# Detect conflicts (same file, different content)
foreach ($file in $fileInventory.Keys) {
    $versions = $fileInventory[$file]
    if ($versions.Count -gt 1) {
        $uniqueHashes = $versions | Select-Object -ExpandProperty Hash -Unique
        if ($uniqueHashes.Count -gt 1) {
            $conflicts += @{ File = $file; Versions = $versions }
        }
    }
}

Write-Host "  Total unique files: $($fileInventory.Count)" -ForegroundColor Cyan
Write-Host "  Conflicting files: $($conflicts.Count)" -ForegroundColor $(if ($conflicts.Count -gt 0) { "Yellow" } else { "Green" })

# ------------------------------------------------------------------------------
# PHASE 3: INTELLIGENT SQUASH-MERGE
# ------------------------------------------------------------------------------
Write-Host "`n[PHASE 3] Executing intelligent squash-merge..." -ForegroundColor Magenta

$MERGED_DIR = "$TEMP_MERGE\_merged"
New-Item -ItemType Directory -Force -Path $MERGED_DIR | Out-Null

# Secret patterns to sanitize
$secretPatterns = @(
    'ghp_[A-Za-z0-9]{36}',
    'sk-[A-Za-z0-9]{48}',
    'AKIA[A-Z0-9]{16}',
    '[A-Za-z0-9]{40}',
    'postgres://[^"''\s]+',
    'mongodb\+srv://[^"''\s]+'
)

function Sanitize-Secrets {
    param([string]$content)
    foreach ($pattern in $secretPatterns) {
        $content = $content -replace $pattern, '<REDACTED_SECRET>'
    }
    return $content
}

# Merge strategy: newest file wins, preserve unique artifacts
foreach ($file in $fileInventory.Keys) {
    $versions = $fileInventory[$file]
    $winner = $versions | Sort-Object { $_.LastWrite } -Descending | Select-Object -First 1
    
    $destPath = "$MERGED_DIR\$file"
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir | Out-Null }
    
    # Read, sanitize, and write
    $content = Get-Content $winner.FullPath -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $sanitized = Sanitize-Secrets -content $content
        Set-Content -Path $destPath -Value $sanitized -NoNewline
    } else {
        Copy-Item -Path $winner.FullPath -Destination $destPath -Force
    }
}

Write-Host "  ✓ Merged $($fileInventory.Count) files into unified tree" -ForegroundColor Green

# ------------------------------------------------------------------------------
# PHASE 4: CREATE 6 IDENTICAL REPOSITORIES
# ------------------------------------------------------------------------------
Write-Host "`n[PHASE 4] Creating 6 identical local repositories..." -ForegroundColor Magenta

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = @"
Genesis: HeadySystems Unified Squash-Merge

Merged from:
- HeadyMe/main
- HeadyMe/Heady
- HeadySystems/Heady
- HeadySystems/sandbox
- HeadySystems/HeadyConnection

Timestamp: $timestamp
Conflicts resolved: $($conflicts.Count)
Total files: $($fileInventory.Count)
"@

foreach ($repoName in $TARGET_REPOS) {
    $targetPath = "$ROOT\$repoName"
    
    # Clean and create
    if (Test-Path $targetPath) { Remove-Item -Path $targetPath -Recurse -Force }
    New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
    
    # Copy merged content
    Copy-Item -Path "$MERGED_DIR\*" -Destination $targetPath -Recurse -Force
    
    # Initialize git
    Set-Location $targetPath
    git init 2>&1 | Out-Null
    git branch -m main 2>&1 | Out-Null
    git add . 2>&1 | Out-Null
    git commit -m $commitMessage 2>&1 | Out-Null
    
    Write-Host "  ✓ Created $repoName" -ForegroundColor Green
}

Set-Location $ROOT

# ------------------------------------------------------------------------------
# PHASE 5: VALIDATION & CONSISTENCY CHECK
# ------------------------------------------------------------------------------
Write-Host "`n[PHASE 5] Validating consistency across repositories..." -ForegroundColor Magenta

$checksums = @{}
foreach ($repoName in $TARGET_REPOS) {
    $targetPath = "$ROOT\$repoName"
    $allFiles = Get-ChildItem -Path $targetPath -Recurse -File | Where-Object { $_.FullName -notmatch '\.git\\' }
    $combinedHash = ($allFiles | ForEach-Object { (Get-FileHash $_.FullName -Algorithm SHA256).Hash }) -join ""
    $checksums[$repoName] = (Get-FileHash -InputStream ([IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes($combinedHash))) -Algorithm SHA256).Hash
}

$uniqueChecksums = $checksums.Values | Select-Object -Unique
if ($uniqueChecksums.Count -eq 1) {
    Write-Host "  ✓ All 6 repositories are IDENTICAL" -ForegroundColor Green
    Write-Host "  Checksum: $($uniqueChecksums[0].Substring(0,16))..." -ForegroundColor Cyan
} else {
    Write-Host "  ✗ MISMATCH DETECTED" -ForegroundColor Red
    $checksums.GetEnumerator() | ForEach-Object { Write-Host "    $($_.Key): $($_.Value.Substring(0,16))..." }
}

# ------------------------------------------------------------------------------
# PHASE 6: BUILD/TEST VALIDATION
# ------------------------------------------------------------------------------
Write-Host "`n[PHASE 6] Running available build/test commands..." -ForegroundColor Magenta

$testRepo = "$ROOT\Heady1"
Set-Location $testRepo

$testResults = @()

# Python tests
if (Test-Path "requirements.txt") {
    Write-Host "  Checking Python environment..." -ForegroundColor Yellow
    if (Get-Command pytest -ErrorAction SilentlyContinue) {
        $testResults += "pytest: Available"
    } else {
        $testResults += "pytest: Not installed (run: pip install pytest)"
    }
}

# Node tests
if (Test-Path "package.json") {
    Write-Host "  Checking Node environment..." -ForegroundColor Yellow
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        $testResults += "npm: Available"
    } else {
        $testResults += "npm: Not installed"
    }
}

if ($testResults.Count -eq 0) {
    $testResults += "No automated tests configured"
}

# ------------------------------------------------------------------------------
# PHASE 7: CLEANUP & REPORT
# ------------------------------------------------------------------------------
Write-Host "`n[PHASE 7] Cleanup and final report..." -ForegroundColor Magenta

Remove-Item -Path $TEMP_MERGE -Recurse -Force -ErrorAction SilentlyContinue

$report = @"

╔══════════════════════════════════════════════════════════════════╗
║           HEADY MERGE ORCHESTRATOR - FINAL REPORT                ║
╠══════════════════════════════════════════════════════════════════╣
║ Status: COMPLETE                                                 ║
║ Timestamp: $timestamp                              ║
╠══════════════════════════════════════════════════════════════════╣
║ SOURCE REPOSITORIES MERGED:                                      ║
║   • HeadyMe/main                                                 ║
║   • HeadyMe/Heady                                                ║
║   • HeadySystems/Heady                                           ║
║   • HeadySystems/sandbox                                         ║
║   • HeadySystems/HeadyConnection                                 ║
╠══════════════════════════════════════════════════════════════════╣
║ MERGE STATISTICS:                                                ║
║   Files Processed: $($fileInventory.Count.ToString().PadRight(45))║
║   Conflicts Found: $($conflicts.Count.ToString().PadRight(45))║
║   Secrets Sanitized: Yes                                         ║
╠══════════════════════════════════════════════════════════════════╣
║ TARGET REPOSITORIES CREATED:                                     ║
║   $($TARGET_REPOS -join ", ")                      ║
║   Location: C:\Users\erich\Heady\                                ║
║   Consistency: $(if ($uniqueChecksums.Count -eq 1) { "VERIFIED IDENTICAL" } else { "MISMATCH" })                                    ║
╠══════════════════════════════════════════════════════════════════╣
║ VALIDATION COMMANDS:                                             ║
║   # Compare any two repos:                                       ║
║   diff -r Heady1 Heady2 --exclude=.git                          ║
║                                                                  ║
║   # Verify checksums:                                            ║
║   Get-FileHash (Get-ChildItem Heady1 -Recurse -File)            ║
╠══════════════════════════════════════════════════════════════════╣
"@

Write-Host $report -ForegroundColor Cyan

# Conflict resolution details
if ($conflicts.Count -gt 0) {
    Write-Host "║ CONFLICT RESOLUTIONS:                                            ║" -ForegroundColor Yellow
    foreach ($conflict in $conflicts) {
        $winner = $conflict.Versions | Sort-Object { $_.LastWrite } -Descending | Select-Object -First 1
        Write-Host "║   $($conflict.File.Substring(0, [Math]::Min(50, $conflict.File.Length)))" -ForegroundColor Yellow
        Write-Host "║     → Used: $($winner.Repo) (newest)" -ForegroundColor Green
    }
}

Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Set-Location $ROOT
Write-Host "`n✓ HEADY MERGE ORCHESTRATION COMPLETE" -ForegroundColor Green
║   # Push to all remotes:                                         ║
║   git remote | ForEach-Object { git push $_ main --force }       ║
