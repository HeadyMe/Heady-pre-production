# ╔══════════════════════════════════════════════════════════════════╗
# ║  HEADY SYSTEMS - Nexus Rebuild (HCFullPipeline Orchestrator)    ║
# ║  Master script that runs the full Archive & Rebuild pipeline    ║
# ╚══════════════════════════════════════════════════════════════════╝

param(
    [ValidateSet("preflight", "archive", "create-repos", "scaffold", "migrate", "push", "swap", "full")]
    [string]$Phase = "preflight",
    [switch]$DryRun,
    [switch]$Force,
    [string]$FreshPath = "C:\Users\erich\Heady-Fresh",
    [string]$ArchivePath = "C:\Users\erich\Heady-archived"
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptRoot

# ─── Banner ───────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  ∞ NEXUS REBUILD - HCFullPipeline Orchestrator ∞            ║" -ForegroundColor Magenta
Write-Host "║  Sacred Geometry v2.0.0 -> v3.0.0                           ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Phase:     $Phase" -ForegroundColor Cyan
Write-Host "  DryRun:    $DryRun" -ForegroundColor $(if ($DryRun) { "Yellow" } else { "Gray" })
Write-Host "  FreshPath: $FreshPath" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════
# PHASE: PREFLIGHT
# ═══════════════════════════════════════════════════════════════════════
function Invoke-Preflight {
    Write-Host "═══ PHASE 1: PREFLIGHT CHECKS ═══" -ForegroundColor Yellow
    Write-Host ""

    Push-Location $RepoRoot
    $status = git status --porcelain
    if ($status) {
        Write-Host "  [WARN] Uncommitted changes detected:" -ForegroundColor Yellow
        $status | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        if (-not $Force) {
            Write-Host "  Commit or stash changes first, or use -Force." -ForegroundColor Red
            Pop-Location; return $false
        }
    } else {
        Write-Host "  [OK] Working tree clean" -ForegroundColor Green
    }

    $unpushed = git log --oneline origin/main..HEAD 2>$null
    if ($unpushed) {
        Write-Host "  [WARN] Unpushed commits:" -ForegroundColor Yellow
        $unpushed | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    } else {
        Write-Host "  [OK] All commits pushed" -ForegroundColor Green
    }

    try { $ghVer = gh --version 2>&1 | Select-Object -First 1; Write-Host "  [OK] GitHub CLI: $ghVer" -ForegroundColor Green }
    catch { Write-Host "  [FAIL] GitHub CLI not found" -ForegroundColor Red; Pop-Location; return $false }

    try { gh auth status 2>&1 | Out-Null; Write-Host "  [OK] GitHub CLI authenticated" -ForegroundColor Green }
    catch { Write-Host "  [FAIL] GitHub CLI not authenticated" -ForegroundColor Red; Pop-Location; return $false }

    try { $nodeVer = node --version 2>&1; Write-Host "  [OK] Node.js: $nodeVer" -ForegroundColor Green }
    catch { Write-Host "  [FAIL] Node.js not found" -ForegroundColor Red; Pop-Location; return $false }

    Write-Host ""
    Write-Host "  Current remotes:" -ForegroundColor Cyan
    git remote -v | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }

    Pop-Location
    Write-Host ""
    Write-Host "  [OK] Preflight complete" -ForegroundColor Green
    return $true
}

# ═══════════════════════════════════════════════════════════════════════
# PHASE: ARCHIVE
# ═══════════════════════════════════════════════════════════════════════
function Invoke-Archive {
    Write-Host "═══ PHASE 2: ARCHIVE TO PRE-PRODUCTION ═══" -ForegroundColor Yellow
    Write-Host ""

    $archiveScript = Join-Path $ScriptRoot "hc-archive-to-preproduction.ps1"
    if (-not (Test-Path $archiveScript)) {
        Write-Host "  [FAIL] Archive script not found: $archiveScript" -ForegroundColor Red
        return $false
    }

    if ($DryRun) { & $archiveScript -DryRun }
    elseif ($Force) { & $archiveScript -Force }
    else { & $archiveScript }

    return $true
}

# ═══════════════════════════════════════════════════════════════════════
# PHASE: CREATE FRESH REPOS
# ═══════════════════════════════════════════════════════════════════════
function Invoke-CreateRepos {
    Write-Host "═══ PHASE 3: CREATE FRESH REPOS ═══" -ForegroundColor Yellow
    Write-Host ""

    $repos = @(
        @{ Full = "HeadySystems/Heady"; Desc = "Heady Systems - Sacred Geometry Architecture" }
        @{ Full = "HeadyMe/Heady"; Desc = "HeadyMe - Personal Heady Instance" }
        @{ Full = "HeadyConnection/Heady"; Desc = "HeadyConnection - Cross-System Bridge" }
        @{ Full = "HeadySystems/sandbox"; Desc = "Heady Sandbox - Experimental Features" }
    )

    foreach ($repo in $repos) {
        Write-Host "  Creating $($repo.Full)..." -ForegroundColor Cyan
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would create $($repo.Full)" -ForegroundColor Yellow
            continue
        }
        try {
            gh repo create $repo.Full --public --description $repo.Desc 2>&1
            Write-Host "  [OK] $($repo.Full) created" -ForegroundColor Green
        } catch {
            $err = $_.Exception.Message
            if ($err -match "already exists") { Write-Host "  [EXISTS] $($repo.Full)" -ForegroundColor Yellow }
            else { Write-Host "  [FAIL] $($repo.Full): $err" -ForegroundColor Red }
        }
    }
    return $true
}

# ═══════════════════════════════════════════════════════════════════════
# PHASE: SCAFFOLD
# ═══════════════════════════════════════════════════════════════════════
function Invoke-Scaffold {
    Write-Host "═══ PHASE 4: SCAFFOLD FRESH PROJECT ═══" -ForegroundColor Yellow
    Write-Host ""

    $scaffoldScript = Join-Path $ScriptRoot "hc-scaffold-fresh.ps1"
    if (-not (Test-Path $scaffoldScript)) {
        Write-Host "  [FAIL] Scaffold script not found" -ForegroundColor Red
        return $false
    }

    $skipInstall = if ($DryRun) { $true } else { $false }
    & $scaffoldScript -OutputPath $FreshPath -SkipNpmInstall:$skipInstall

    return (Test-Path (Join-Path $FreshPath "heady-manager.js"))
}

# ═══════════════════════════════════════════════════════════════════════
# PHASE: MIGRATE CORE LOGIC
# ═══════════════════════════════════════════════════════════════════════
function Invoke-Migrate {
    Write-Host "═══ PHASE 5: MIGRATE CORE LOGIC ═══" -ForegroundColor Yellow
    Write-Host ""

    $source = $RepoRoot
    $dest = $FreshPath

    $migrations = @(
        @{ From = "src/hc_pipeline.js";          To = "src/hc_pipeline.js" }
        @{ From = "src/hc_claude_agent.js";      To = "src/hc_claude_agent.js" }
        @{ From = "src/hc_monte_carlo.js";       To = "src/hc_monte_carlo.js" }
        @{ From = "src/heady_maid.js";           To = "src/heady_maid.js" }
        @{ From = "src/agents";                  To = "src/agents"; IsDir = $true }
        @{ From = "src/heady_project";           To = "src/heady_project"; IsDir = $true }
        @{ From = "configs";                     To = "configs"; IsDir = $true }
        @{ From = "HeadyAcademy";                To = "HeadyAcademy"; IsDir = $true }
        @{ From = "heady-registry.json";         To = "heady-registry.json" }
        @{ From = ".heady/registry.json";        To = ".heady/registry.json" }
        @{ From = "scripts/heady-layers.json";   To = "scripts/heady-layers.json" }
        @{ From = "scripts/heady-layer.ps1";     To = "scripts/heady-layer.ps1" }
        @{ From = "scripts/brand_headers.js";    To = "scripts/brand_headers.js" }
        @{ From = "mcp-servers";                 To = "mcp-servers"; IsDir = $true }
        @{ From = ".github/agents";              To = ".github/agents"; IsDir = $true }
        @{ From = ".windsurf/workflows";         To = ".windsurf/workflows"; IsDir = $true }
        @{ From = "notebooks";                   To = "notebooks"; IsDir = $true }
    )

    $copied = 0; $skipped = 0

    foreach ($m in $migrations) {
        $srcPath = Join-Path $source $m.From
        $dstPath = Join-Path $dest $m.To

        if (-not (Test-Path $srcPath)) {
            Write-Host "  [SKIP] $($m.From) (not found)" -ForegroundColor Yellow
            $skipped++; continue
        }
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would copy $($m.From)" -ForegroundColor Yellow
            continue
        }

        $parentDir = Split-Path -Parent $dstPath
        if (-not (Test-Path $parentDir)) { New-Item -ItemType Directory -Path $parentDir -Force | Out-Null }

        if ($m.IsDir) { Copy-Item $srcPath $dstPath -Recurse -Force }
        else { Copy-Item $srcPath $dstPath -Force }

        Write-Host "  [COPY] $($m.From)" -ForegroundColor Green
        $copied++
    }

    Write-Host ""
    Write-Host "  Copied: $copied | Skipped: $skipped" -ForegroundColor Cyan
    return $true
}

# ═══════════════════════════════════════════════════════════════════════
# PHASE: PUSH TO FRESH REPOS
# ═══════════════════════════════════════════════════════════════════════
function Invoke-Push {
    Write-Host "═══ PHASE 6: PUSH TO FRESH REPOS ═══" -ForegroundColor Yellow
    Write-Host ""

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would init git, commit, and push to all remotes" -ForegroundColor Yellow
        return $true
    }

    Push-Location $FreshPath

    git init 2>&1 | Out-Null
    git add . 2>&1 | Out-Null
    git commit -m "v3.0.0: HCFullPipeline fresh start - Sacred Geometry reborn" 2>&1 | Out-Null
    Write-Host "  [OK] Initial commit created" -ForegroundColor Green

    $remotes = @(
        @{ Name = "origin";     Url = "git@github.com:HeadySystems/Heady.git" }
        @{ Name = "heady-me";   Url = "git@github.com:HeadyMe/Heady.git" }
        @{ Name = "heady-sys";  Url = "git@github.com:HeadySystems/Heady.git" }
        @{ Name = "heady-conn"; Url = "git@github.com:HeadyConnection/Heady.git" }
        @{ Name = "sandbox";    Url = "git@github.com:HeadySystems/sandbox.git" }
    )

    foreach ($r in $remotes) {
        try {
            git remote add $r.Name $r.Url 2>&1 | Out-Null
            Write-Host "  [OK] Remote added: $($r.Name)" -ForegroundColor Green
        } catch {
            Write-Host "  [WARN] Remote $($r.Name) may already exist" -ForegroundColor Yellow
        }
    }

    # Push to each
    foreach ($r in $remotes) {
        try {
            git push -u $r.Name main 2>&1
            Write-Host "  [PUSH] $($r.Name)/main" -ForegroundColor Green
        } catch {
            Write-Host "  [FAIL] $($r.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Pop-Location
    return $true
}

# ═══════════════════════════════════════════════════════════════════════
# PHASE: SWAP LOCAL WORKSPACE
# ═══════════════════════════════════════════════════════════════════════
function Invoke-Swap {
    Write-Host "═══ PHASE 7: SWAP LOCAL WORKSPACE ═══" -ForegroundColor Yellow
    Write-Host ""

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would rename:" -ForegroundColor Yellow
        Write-Host "    $RepoRoot -> $ArchivePath" -ForegroundColor Gray
        Write-Host "    $FreshPath -> $RepoRoot" -ForegroundColor Gray
        return $true
    }

    Write-Host "  Swapping directories..." -ForegroundColor Cyan

    # Close any processes that might lock the directory
    Write-Host "  [WARN] Make sure no editors/terminals are open in $RepoRoot" -ForegroundColor Yellow

    try {
        Rename-Item $RepoRoot $ArchivePath -Force
        Write-Host "  [OK] $RepoRoot -> $ArchivePath" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Could not rename current repo: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }

    try {
        Rename-Item $FreshPath $RepoRoot -Force
        Write-Host "  [OK] $FreshPath -> $RepoRoot" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Could not rename fresh project: $($_.Exception.Message)" -ForegroundColor Red
        # Rollback
        Write-Host "  [ROLLBACK] Restoring original..." -ForegroundColor Yellow
        Rename-Item $ArchivePath $RepoRoot -Force
        return $false
    }

    Write-Host ""
    Write-Host "  [OK] Workspace swapped successfully" -ForegroundColor Green
    Write-Host "  Archive: $ArchivePath" -ForegroundColor Cyan
    Write-Host "  Active:  $RepoRoot" -ForegroundColor Cyan
    return $true
}

# ═══════════════════════════════════════════════════════════════════════
# PHASE ROUTER
# ═══════════════════════════════════════════════════════════════════════

$phases = [ordered]@{
    "preflight"    = { Invoke-Preflight }
    "archive"      = { Invoke-Archive }
    "create-repos" = { Invoke-CreateRepos }
    "scaffold"     = { Invoke-Scaffold }
    "migrate"      = { Invoke-Migrate }
    "push"         = { Invoke-Push }
    "swap"         = { Invoke-Swap }
}

if ($Phase -eq "full") {
    Write-Host "═══ FULL PIPELINE ═══" -ForegroundColor Magenta
    Write-Host ""

    foreach ($phaseName in $phases.Keys) {
        $result = & $phases[$phaseName]
        if (-not $result) {
            Write-Host ""
            Write-Host "  [ABORT] Pipeline stopped at phase: $phaseName" -ForegroundColor Red
            exit 1
        }
        Write-Host ""
    }

    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ∞ NEXUS REBUILD COMPLETE ∞                                 ║" -ForegroundColor Green
    Write-Host "║  Heady Systems v3.0.0 is live.                              ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
} else {
    $result = & $phases[$Phase]
    if (-not $result) { exit 1 }
}
