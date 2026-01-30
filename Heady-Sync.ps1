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
foreach ($line in $Status) {
    if ($line.Length -gt 3) {
        $file = $line.Substring(3).Trim()
        $ChangedFiles += $file
    }
}

$ChangedCount = $ChangedFiles.Count

if ($ChangedCount -eq 0) {
    Write-Host "No local changes detected. Checking for remote updates..." -ForegroundColor Yellow
    git pull origin $Branch --rebase
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Pull failed. Exiting." -ForegroundColor Red
        exit $LASTEXITCODE
    }
    exit 0
}

# Generate a summary of what changed
$FilesList = $ChangedFiles -join ', '
$CommitMsg = "HeadyHive Evolution [$Timestamp]: Updates to $FilesList"

Write-Host "[SCAN] Detected changes in $ChangedCount files." -ForegroundColor Yellow
Write-Host "[SCAN] Files: $FilesList" -ForegroundColor Gray

# 2. STAGE & TEMP COMMIT
Write-Host "[STAGE] Adding all changes..." -ForegroundColor Green
git add .
git commit -m "Temp commit for sync"

# 3. SAFE REBASE (The "Squash Merge" Logic)
# We pull changes. If histories are unrelated, we allow it.
# We prefer local changes during rebase conflicts because
# your local HeadyHive build is the Source of Truth.
Write-Host "[SYNC] Aligning with remote..." -ForegroundColor Blue

# Try pull with 'theirs' (which favors local changes in rebase)
git pull origin $Branch --rebase --strategy-option=theirs --allow-unrelated-histories

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Rebase failed or encountered conflicts that could not be automatically resolved." -ForegroundColor Red
    Write-Host "Please resolve conflicts manually, then finish the rebase and run the script again." -ForegroundColor Yellow
    exit 1
}

# 4. SQUASH & COMMIT
Write-Host "[SQUASH] Squashing local history..." -ForegroundColor Magenta
# Reset soft to origin to put all commits (temp + rebased) back into staging
git reset --soft origin/$Branch

Write-Host "[COMMIT] Stamping version..." -ForegroundColor Magenta
git commit -m $CommitMsg

# 5. PUSH
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
