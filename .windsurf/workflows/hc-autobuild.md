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
<!-- ║  FILE: .windsurf/workflows/hc-autobuild.md                        ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: Run HCAutoBuild to build all Heady workspaces
---

# HCAutoBuild Workflow

## Overview
HCAutoBuild automatically discovers and builds all Heady projects across Windsurf worktrees.

## Quick Start

### Run HCAutoBuild
```powershell
# // turbo
node "C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052\src\hc_autobuild.js"
```

### Or via hc.ps1
```powershell
# // turbo
& "C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052\scripts\hc.ps1" -a autobuild
```

## What HCAutoBuild Does

1. **Discovers Worktrees** - Scans all active Windsurf worktree directories
2. **Finds Projects** - Locates all `package.json` files up to 2 levels deep
3. **Installs Dependencies** - Runs `pnpm install` for each project
4. **Runs Build Scripts** - Executes `pnpm run build` if available
5. **Reports Results** - Summarizes success/failure counts

## Targeted Worktrees

| Worktree | Auto-Discovered |
|----------|----------------|
| Heady-4aa75052 | ✅ |
| CascadeProjects-4aa75052 | ✅ |
| Projects-4ce25b33 | ✅ |
| HeadyMonorepo | ✅ (if exists) |
| HeadySystems | ✅ (if exists) |

## Prerequisites

Before running HCAutoBuild, ensure:
```powershell
# Check Node.js
node --version

# Check pnpm
pnpm --version

# Check Git
git --version
```

## Build Options

### Full Automated Workflow
```powershell
& "C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052\scripts\heady-automated-workflow.ps1"
```

### With System Restart
```powershell
& "C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052\scripts\hc.ps1" -Restart
```

## Output Example

```
🔨 Heady AutoBuild - Sacred Geometry Build System

🔍 Discovered 3 worktrees:
   • C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052
   • C:\Users\erich\.windsurf\worktrees\CascadeProjects\CascadeProjects-4aa75052
   • C:\Users\erich\.windsurf\worktrees\Projects\Projects-4ce25b33

📋 Found 5 buildable projects

📦 Building: C:\Users\erich\.windsurf\worktrees\Heady\Heady-4aa75052
✅ Heady-4aa75052 - Build complete

════════════════════════════════════════════════════════════════
✅ Heady AutoBuild Complete!
   Success: 5 | Failed: 0
════════════════════════════════════════════════════════════════
```

## Troubleshooting

### Build Fails
```powershell
# Check for lockfile issues
pnpm install --no-frozen-lockfile

# Clear cache
pnpm store prune
```

### Missing Dependencies
```powershell
# Force reinstall
rm -rf node_modules
pnpm install
```

## Post-Build Actions

After successful build:
1. Run `/verify-system` to check health
2. Run `/headysync-prep` for synchronization
3. Create checkpoint if deploying

## Integration with CI/CD

HCAutoBuild can be triggered from:
- GitHub Actions (via `commit_and_build.ps1`)
- Render.com Blueprint (via `render.yaml`)
- Manual execution via Windsurf workflow
