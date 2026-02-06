<!-- HEADY_BRAND:BEGIN -->
<!-- ╔══════════════════════════════════════════════════════════════════╗ -->
<!-- ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║ -->
<!-- ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║ -->
<!-- ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║ -->
<!-- ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║ -->
<!-- ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║ -->
<!-- ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║ -->
<!-- ║                                                                  ║ -->
<!-- ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║ -->
<!-- ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║ -->
<!-- ║  FILE: .windsurf/workflows/workspace-integration.md               ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: Integrate and synchronize all Windsurf workspaces
---

# Workspace Integration Protocol

## Overview
Unified integration of all Heady Windsurf worktrees for coordinated development.

## Active Worktrees

| Worktree | Path | Purpose |
|----------|------|---------|
| **Heady** | `C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052` | Core Heady system |
| **CascadeProjects** | `C:\Users\erich\.windsurf\worktrees\CascadeProjects\CascadeProjects-4aa75052` | Project workspace |
| **Projects** | `C:\Users\erich\.windsurf\worktrees\Projects\Projects-4ce25b33` | Bootstrap scripts and infrastructure |

## Integration Steps

### 1. Verify Worktree Status
```powershell
# Check all worktrees are accessible
$worktrees = @(
    "C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052",
    "C:\Users\erich\.windsurf\worktrees\CascadeProjects\CascadeProjects-4aa75052",
    "C:\Users\erich\.windsurf\worktrees\Projects\Projects-4ce25b33"
)

foreach ($wt in $worktrees) {
    if (Test-Path $wt) {
        Write-Host "✅ $wt" -ForegroundColor Green
    } else {
        Write-Host "❌ $wt" -ForegroundColor Red
    }
}
```

### 2. Sync Git State Across Worktrees
```powershell
# // turbo
foreach ($wt in $worktrees) {
    Push-Location $wt
    git fetch --all --prune
    git status --short
    Pop-Location
}
```

### 3. Run HCAutoBuild Across All Workspaces
```powershell
# // turbo
node "C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052\src\hc_autobuild.js"
```

### 4. Validate Shared Dependencies
```powershell
# Check for shared package versions
$packageFiles = Get-ChildItem -Path $worktrees -Filter "package.json" -Recurse -Depth 2
foreach ($pkg in $packageFiles) {
    Write-Host "📦 $($pkg.FullName)" -ForegroundColor Cyan
}
```

### 5. Link Shared Modules (Optional)
```powershell
# For monorepo-style linking
cd "C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052"
pnpm link --global
```

## Cross-Workspace Communication

### Shared Configuration Files
- `.windsurfrules` - AI behavior rules
- `.windsurf/workflows/*.md` - Workflow definitions
- `render.yaml` - Infrastructure as code

### Shared Scripts
- `hc_autobuild.js` - Multi-workspace build
- `recon.js` - Task analysis
- `heady-automated-workflow.ps1` - Full orchestration

## Verification Checklist

- [ ] All worktrees accessible
- [ ] Git remotes synchronized
- [ ] Dependencies installed
- [ ] Build scripts passing
- [ ] Shared configs aligned

## Troubleshooting

### Worktree Not Found
```powershell
# List git worktrees from main repo
git worktree list

# Add missing worktree
git worktree add <path> <branch>
```

### Dependency Conflicts
```powershell
# Clean and reinstall
pnpm store prune
pnpm install --force
```

## Notes
- Always run integration after major changes
- Use `/hc-autobuild` workflow for builds
- Check HeadyLens dashboard for status
