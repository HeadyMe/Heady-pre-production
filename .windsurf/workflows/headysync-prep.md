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
<!-- ║  FILE: .windsurf/workflows/headysync-prep.md                      ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: HeadySync (hs) Preparation & Execution
---

# HeadySync Preparation Protocol

## Overview
HeadySync (hs) is the unified synchronization system that coordinates all Heady components, repositories, and services across local and remote environments.

## Prerequisites

### Base Layer Components (Always Required)
- **HeadyBuddy**: Desktop overlay task completion assistant
- **HeadyLens**: Monitoring and observability layer

### Core Services
- **HeadyConductor**: Orchestration engine (heady-manager.js on port 3300)
- **Task Manager**: Automated task assignment and completion
- **MCP Services**: Model Context Protocol integrations

### Repository Targets
- **heady-me**: Personal development repository
- **heady-sys**: HeadySystems organization repository
- **origin**: Primary remote (HeadySystems/Heady)
- **connection**: HeadyConnection repository
- **sandbox**: Testing and experimentation

## Preparation Steps

### 1. Verify Base Layer
```powershell
# Check HeadyBuddy status
Get-Process | Where-Object {$_.ProcessName -like "*heady*"}

# Verify HeadyLens monitoring
curl http://localhost:3300/status
```

### 2. Initialize Core Services
```powershell
# Start orchestrator
cd c:\Users\erich\Heady
node heady-manager.js &

# Verify task manager
python backend/python_worker/admin_console.py --status
```

### 3. Validate Repository Configuration
```powershell
# Check all remotes
git remote -v

# Fetch all remote updates
git fetch --all --prune

# Verify branch status
git status
```

### 4. Pre-Sync Checks
```powershell
# Run linting and auto-fix
npm run lint -- --fix

# Verify no blocking issues
git diff --check

# Ensure working directory is clean or changes are staged
git status --short
```

### 5. Execute HeadySync
```powershell
# Full sync with all remotes
.\scripts\hc.ps1 -Restart

# Or manual sync to specific remote
git push heady-me main
git push heady-sys main
git push origin main
```

## Layer-Specific Readiness

### HeadyBuddy Layer
- Desktop overlay process running
- Task completion assistant active
- Context-aware help enabled

### HeadyLens Layer
- Real-time monitoring active
- Performance metrics collection enabled
- System observability dashboard accessible

### HeadyE Layer (Browser Integration)
- Browser overlay initialized
- HeadyBuddy integration verified
- Remote UI synchronization ready

### HeadyIDE Layer
- Code assistance active
- Workflow automation enabled
- Intelligent suggestions ready

### HeadyAdminUI Layer (Drupal)
- Admin interface accessible
- Layer management controls active
- System configuration interface ready

## Troubleshooting

### Orchestrator Not Starting
```powershell
# Check port availability
netstat -ano | findstr :3300

# Kill existing process if needed
taskkill /F /PID <pid>

# Restart orchestrator
node heady-manager.js
```

### Remote Push Rejected
```powershell
# Pull and rebase
git pull --rebase <remote> <branch>

# Force push if necessary (use with caution)
git push <remote> <branch> --force-with-lease
```

### Submodule Issues
```powershell
# Update all submodules
git submodule update --init --recursive

# Sync submodule URLs
git submodule sync --recursive
```

## Post-Sync Verification

### 1. Service Health Check
```powershell
# Verify orchestrator
curl http://localhost:3300/status

# Check all layers
curl http://localhost:3300/layers/status
```

### 2. Repository Sync Status
```powershell
# Verify all remotes are up to date
git remote update
git status -uno
```

### 3. Layer Integration Test
```powershell
# Test HeadyBuddy + HeadyLens integration
curl http://localhost:3300/test/base-layer

# Verify full stack
curl http://localhost:3300/test/full-stack
```

## Success Criteria

- ✅ All base layer components (HeadyBuddy + HeadyLens) active
- ✅ Orchestrator and task manager online
- ✅ All repository remotes synchronized
- ✅ No uncommitted changes or conflicts
- ✅ All layers responding to health checks
- ✅ Workflow automation systems operational

## Notes

- HeadySync should be run after significant changes or before deployment
- Always verify base layer components are active before sync
- Use `hc.ps1 -Restart` for full automated cycle
- Monitor HeadyLens dashboard during sync for real-time status
