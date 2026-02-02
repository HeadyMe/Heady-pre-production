# ==============================================================================
# HEADY PROTOCOL: SMART SYNC & SQUASH (PowerShell Version)
# ------------------------------------------------------------------------------
# 1. Scans for changes.
# 2. Pulls remote DNA to ensure history alignment.
# 3. Squashes local work into a single "Evolution" commit.
# 4. Pushes to cloud.
# ==============================================================================

param(
    [string]$Branch = "main",
    [switch]$Force
)

$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "[HEADY] Initiating Repository Synchronization..." -ForegroundColor Cyan

# 1. INTELLIGENT SCAN (Generate Commit Message based on files)
$Status = git status --porcelain
$ChangedFiles = @()
foreach ($line in $Status -split "`n") {
    if ($line.Trim()) {
        $file = ($line -split '\s+', 2)[1]
        $ChangedFiles += $file
    }
}

$ChangedCount = $ChangedFiles.Count

if ($ChangedCount -eq 0) {
    Write-Host "No local changes detected. Checking for remote updates..." -ForegroundColor Yellow
    git pull origin $Branch --rebase
    exit 0
}

# Generate a summary of what changed
$FilesList = $ChangedFiles -join ', '
$CommitMsg = "HeadyHive Evolution [$Timestamp]: Updates to $FilesList"

Write-Host "[SCAN] Detected changes in $ChangedCount files." -ForegroundColor Yellow
Write-Host "[SCAN] Files: $FilesList" -ForegroundColor Gray

# 2. STAGE & COMMIT
Write-Host "[STAGE] Adding all changes..." -ForegroundColor Green
git add .

Write-Host "[COMMIT] Stamping version..." -ForegroundColor Magenta
git commit -m $CommitMsg

# 3. SAFE REBASE (The "Squash Merge" Logic)
# We pull changes. If histories are unrelated, we allow it.
# We prefer local changes during rebase conflicts because 
# your local HeadyHive build is the Source of Truth.
Write-Host "[SYNC] Aligning with remote..." -ForegroundColor Blue
try {
    # Fetch first to ensure we have latest refs
    git fetch origin $Branch
    # Rebase our new commit on top of origin
    git pull origin $Branch --rebase --strategy-option=theirs --allow-unrelated-histories
} catch {
    Write-Host "[WARNING] Rebase encountered conflicts, using local changes..." -ForegroundColor Yellow
    git pull origin $Branch --rebase --strategy-option=ours --allow-unrelated-histories
}

# 4. PUSH
Write-Host "[UPLINK] Pushing to GitHub..." -ForegroundColor Green
if ($Force) {
    git push origin $Branch --force
} else {
    git push origin $Branch
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Repository Synchronized." -ForegroundColor Green
    Write-Host "[TIMESTAMP] $Timestamp" -ForegroundColor Cyan
    Write-Host "[COMMIT] $CommitMsg" -ForegroundColor Gray
} else {
    Write-Host "`n[ERROR] Push rejected. You may need to Force Push if histories are incompatible." -ForegroundColor Red
    Write-Host "Run: .\Heady-Sync.ps1 -Force" -ForegroundColor Yellow
}
