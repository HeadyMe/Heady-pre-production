---
description: HCFullPipeline - Archive current repos to pre-production and rebuild from scratch
---

# HCFullPipeline: Archive & Rebuild Protocol

## Overview
Archives all current Heady repos to `*-pre-production` variants on GitHub, then scaffolds a clean project from scratch with proper structure, no merge conflicts, and modern tooling.

## Prerequisites
- GitHub CLI (`gh`) authenticated with access to HeadySystems, HeadyMe, HeadyConnection orgs
- Node.js 20+ and Python 3.12+
- All local changes committed and pushed

## Phase 1: Pre-Flight Checks

1. Verify all changes are committed and pushed to all remotes:
```powershell
// turbo
git status
git log --oneline origin/main..HEAD
```

2. Verify GitHub CLI is authenticated:
```powershell
// turbo
gh auth status
```

3. Create a local backup tag for safety:
```powershell
git tag -a pre-production-archive -m "Archive point before HCFullPipeline rebuild"
git push origin pre-production-archive
git push heady-me pre-production-archive
git push heady-sys pre-production-archive
```

## Phase 2: Archive Repos to Pre-Production

4. Run the archive script to rename all GitHub repos:
```powershell
.\scripts\hc-archive-to-preproduction.ps1
```

This renames (via GitHub API):
| Current Repo | Archived To |
|---|---|
| `HeadySystems/Heady` | `HeadySystems/Heady-pre-production` |
| `HeadyMe/Heady` | `HeadyMe/Heady-pre-production` |
| `HeadyConnection/Heady` | `HeadyConnection/Heady-pre-production` |
| `HeadySystems/sandbox` | `HeadySystems/sandbox-pre-production` |

5. Verify archives exist:
```powershell
// turbo
gh repo list HeadySystems --json name --jq '.[].name'
gh repo list HeadyMe --json name --jq '.[].name'
```

## Phase 3: Create Fresh Repos

6. Create new empty repos on GitHub:
```powershell
gh repo create HeadySystems/Heady --public --description "Heady Systems - Sacred Geometry Architecture"
gh repo create HeadyMe/Heady --public --description "HeadyMe - Personal Heady Instance"
gh repo create HeadyConnection/Heady --public --description "HeadyConnection - Cross-System Bridge"
gh repo create HeadySystems/sandbox --public --description "Heady Sandbox - Experimental Features"
```

## Phase 4: Scaffold Fresh Project

7. Run the scaffold script from a clean directory:
```powershell
.\scripts\hc-scaffold-fresh.ps1 -OutputPath C:\Users\erich\Heady-Fresh
```

This creates:
```
Heady-Fresh/
├── .github/
│   ├── workflows/ci.yml
│   └── copilot-instructions.md
├── .windsurf/
│   └── workflows/
├── backend/
│   ├── python_worker/
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── src/
│   ├── agents/
│   ├── hc_pipeline.js
│   ├── hc_claude_agent.js
│   └── heady_maid.js
├── configs/
├── scripts/
├── HeadyAcademy/
├── .gitignore
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── heady-manager.js
├── package.json
├── render.yaml
└── README.md
```

## Phase 5: Migrate Core Logic

8. Copy essential business logic from the archive (not raw files — clean rewrites):
   - `heady-manager.js` → Modularized into route files
   - `src/hc_pipeline.js` → Keep pipeline engine
   - `src/agents/` → Keep agent handlers
   - `HeadyAcademy/` → Keep academy structure
   - `configs/` → Keep YAML configs
   - `scripts/` → Keep essential scripts (Heady-Sync, layers, hc.ps1)

9. Review and validate the fresh project:
```powershell
// turbo
cd C:\Users\erich\Heady-Fresh
npm install
npm run build
npm start
```

## Phase 6: Push Fresh Project to All Repos

10. Initialize git and push to all fresh repos:
```powershell
cd C:\Users\erich\Heady-Fresh
git init
git add .
git commit -m "v3.0.0: HCFullPipeline fresh start - Sacred Geometry reborn"
git remote add origin git@github.com:HeadySystems/Heady.git
git remote add heady-me git@github.com:HeadyMe/Heady.git
git remote add heady-sys git@github.com:HeadySystems/Heady.git
git remote add heady-conn git@github.com:HeadyConnection/Heady.git
git remote add sandbox git@github.com:HeadySystems/sandbox.git
git push -u origin main
git push heady-me main
git push heady-conn main
git push sandbox main
```

## Phase 7: Swap Local Workspace

11. Replace local workspace:
```powershell
Rename-Item C:\Users\erich\Heady C:\Users\erich\Heady-archived
Rename-Item C:\Users\erich\Heady-Fresh C:\Users\erich\Heady
```

12. Verify everything works:
```powershell
cd C:\Users\erich\Heady
npm install
node heady-manager.js
# Test: http://localhost:3300/api/health
```

## Phase 8: Post-Rebuild

13. Re-deploy to Render.com (render.yaml already in fresh project)
14. Update Windsurf workspace paths if needed
15. Run HeadySync to verify all remotes are in sync:
```powershell
.\scripts\Heady-Sync.ps1
```

## Rollback Plan
If anything goes wrong:
1. Pre-production repos still exist with all history
2. Local `C:\Users\erich\Heady-archived` has the full workspace
3. Tag `pre-production-archive` marks the exact commit
4. Rename repos back via `gh repo rename`
