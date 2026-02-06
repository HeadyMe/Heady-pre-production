# ╔══════════════════════════════════════════════════════════════════╗
# ║  HEADY SYSTEMS - Archive to Pre-Production                      ║
# ║  Renames all current GitHub repos to *-pre-production            ║
# ╚══════════════════════════════════════════════════════════════════╝

param(
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# ─── Configuration ────────────────────────────────────────────────────
$repos = @(
    @{ Owner = "HeadySystems"; Name = "Heady"; NewName = "Heady-pre-production" }
    @{ Owner = "HeadyMe";      Name = "Heady"; NewName = "Heady-pre-production" }
    @{ Owner = "HeadyConnection"; Name = "Heady"; NewName = "Heady-pre-production" }
    @{ Owner = "HeadySystems"; Name = "sandbox"; NewName = "sandbox-pre-production" }
)

# ─── Pre-flight ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  HCFullPipeline: Archive to Pre-Production       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check gh CLI
try {
    $ghVersion = gh --version 2>&1 | Select-Object -First 1
    Write-Host "[OK] GitHub CLI: $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] GitHub CLI (gh) not found. Install: winget install GitHub.cli" -ForegroundColor Red
    exit 1
}

# Check auth
try {
    $authStatus = gh auth status 2>&1
    Write-Host "[OK] GitHub CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Not authenticated. Run: gh auth login" -ForegroundColor Red
    exit 1
}

# ─── Verify repos exist ──────────────────────────────────────────────
Write-Host ""
Write-Host "Verifying source repos exist..." -ForegroundColor Yellow
$allExist = $true
foreach ($repo in $repos) {
    $fullName = "$($repo.Owner)/$($repo.Name)"
    try {
        $info = gh repo view $fullName --json name 2>&1
        Write-Host "  [EXISTS] $fullName" -ForegroundColor Green
    } catch {
        Write-Host "  [MISSING] $fullName - skipping" -ForegroundColor Red
        $allExist = $false
    }
}

# ─── Check for name collisions ───────────────────────────────────────
Write-Host ""
Write-Host "Checking target names are available..." -ForegroundColor Yellow
foreach ($repo in $repos) {
    $targetName = "$($repo.Owner)/$($repo.NewName)"
    try {
        $check = gh repo view $targetName --json name 2>&1
        Write-Host "  [CONFLICT] $targetName already exists!" -ForegroundColor Red
        if (-not $Force) {
            Write-Host "  Use -Force to proceed anyway (will fail if GitHub rejects)" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "  [AVAILABLE] $targetName" -ForegroundColor Green
    }
}

# ─── Confirmation ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "┌─────────────────────────────────────────────────┐" -ForegroundColor White
Write-Host "│  RENAME PLAN:                                    │" -ForegroundColor White
foreach ($repo in $repos) {
    $from = "$($repo.Owner)/$($repo.Name)"
    $to = "$($repo.Owner)/$($repo.NewName)"
    Write-Host "│  $from -> $to" -ForegroundColor White
}
Write-Host "└─────────────────────────────────────────────────┘" -ForegroundColor White

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] No changes made." -ForegroundColor Yellow
    exit 0
}

if (-not $Force) {
    Write-Host ""
    $confirm = Read-Host "Type 'ARCHIVE' to proceed (or anything else to abort)"
    if ($confirm -ne "ARCHIVE") {
        Write-Host "Aborted." -ForegroundColor Yellow
        exit 0
    }
}

# ─── Create archive tag locally first ─────────────────────────────────
Write-Host ""
Write-Host "Creating local archive tag..." -ForegroundColor Yellow
$tagName = "pre-production-archive-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
try {
    Push-Location C:\Users\erich\Heady
    git tag -a $tagName -m "Archive point before HCFullPipeline rebuild on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "  [OK] Tag: $tagName" -ForegroundColor Green

    # Push tag to all remotes
    $remotes = @("origin", "heady-me", "heady-sys")
    foreach ($remote in $remotes) {
        try {
            git push $remote $tagName 2>&1 | Out-Null
            Write-Host "  [OK] Pushed tag to $remote" -ForegroundColor Green
        } catch {
            Write-Host "  [WARN] Could not push tag to $remote" -ForegroundColor Yellow
        }
    }
    Pop-Location
} catch {
    Write-Host "  [WARN] Could not create tag: $_" -ForegroundColor Yellow
    Pop-Location
}

# ─── Execute renames ──────────────────────────────────────────────────
Write-Host ""
Write-Host "Renaming repos..." -ForegroundColor Yellow
$results = @()

foreach ($repo in $repos) {
    $fullName = "$($repo.Owner)/$($repo.Name)"
    $newName = $repo.NewName

    Write-Host ""
    Write-Host "  Renaming $fullName -> $newName ..." -ForegroundColor Cyan

    try {
        gh repo rename $newName --repo $fullName --yes 2>&1
        Write-Host "  [OK] $fullName renamed to $($repo.Owner)/$newName" -ForegroundColor Green
        $results += @{ Repo = $fullName; Status = "OK"; NewName = "$($repo.Owner)/$newName" }
    } catch {
        $errMsg = $_.Exception.Message
        Write-Host "  [FAIL] $fullName : $errMsg" -ForegroundColor Red
        $results += @{ Repo = $fullName; Status = "FAIL"; Error = $errMsg }
    }
}

# ─── Summary ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ARCHIVE RESULTS                                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan

$successCount = ($results | Where-Object { $_.Status -eq "OK" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count

foreach ($r in $results) {
    if ($r.Status -eq "OK") {
        Write-Host "  [OK] $($r.Repo) -> $($r.NewName)" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $($r.Repo): $($r.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  Archived: $successCount / $($repos.Count)  |  Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Yellow" } else { "Green" })
Write-Host "  Archive Tag: $tagName" -ForegroundColor Cyan
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "All repos archived. Ready for Phase 3: Create Fresh Repos." -ForegroundColor Green
    Write-Host "Next: Run hc-scaffold-fresh.ps1" -ForegroundColor Yellow
} else {
    Write-Host "Some renames failed. Check GitHub permissions and retry." -ForegroundColor Yellow
}
