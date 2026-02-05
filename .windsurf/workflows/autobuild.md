<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: .windsurf/workflows/autobuild.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

---
description: Automated Checkpoint & Build System (HCAutoBuild)
---

# /autobuild Workflow

## Purpose
This workflow initiates the HCAutoBuild automated checkpoint and build system. It monitors workspaces for 100% functionality, automatically creates checkpoints, and manages the complete build pipeline until all systems are operational.

## Pipeline Stages
1. **Prep** - Stage changes, install dependencies
2. **Commit** - Create checkpoint commit
3. **Push** - Distribute to remotes
4. **Verify** - Validate deployment and builds
5. **Fix** - Auto-remediate issues if detected
6. **Report** - Generate detailed status report
7. **Standby** - Enter monitoring mode when at 100%

## Shortcut Commands

### Basic Usage
```powershell
# Run single build cycle
hc -a hb

# Start continuous monitoring
hc -a hb -Continuous

# Force checkpoint even if not 100%
hc -a hb -ForceCheckpoint

# View status only
hc -a hb -StatusOnly
```

### Direct PowerShell
```powershell
# Navigate to workspace and run
.\hc_autobuild.ps1

# With options
.\hc_autobuild.ps1 -Continuous
.\hc_autobuild.ps1 -ForceCheckpoint
.\hc_autobuild.ps1 -StatusOnly
```

## System Behavior

### When at 100% Functionality
- ✅ Automatic checkpoint created
- ✅ System enters standby mode
- ✅ Awaits changes to restart cycle
- ✅ Status report generated

### When Below 100% Functionality
- ⚠️ Issues logged and displayed
- 🔧 Auto-fix attempts applied
- 📋 Pending tasks enumerated
- 🔄 Continuous monitoring (if enabled)

## Expected Output

### Success State
```
╔══════════════════════════════════════════════════════════════╗
║              HCAutoBuild Status Report                       ║
╠══════════════════════════════════════════════════════════════╣
║ Workspace: Heady-cbd7dddf                                    ║
║   Functionality: 100% ✓                                      ║
║   Fully Functional: YES ✓                                    ║
║   Status: ALL SYSTEMS OPERATIONAL ✓                          ║
╚══════════════════════════════════════════════════════════════╝
```

### Active State (Tasks Pending)
```
╠══════════════════════════════════════════════════════════════╣
║ Workspace: Heady-cbd7dddf                                    ║
║   Functionality: 85% (Good)                                  ║
║   Pending Tasks:                                             ║
║     • 3 file(s) with uncommitted changes                     ║
║     • node_modules not installed                             ║
╚══════════════════════════════════════════════════════════════╝
SYSTEM REQUIRES ATTENTION - TASKS PENDING
```

## Integration Points

### Existing Scripts
- `commit_and_build.ps1` - Local build cycle
- `nexus_deploy.ps1` - Multi-remote distribution
- `render.yaml` - Infrastructure validation

### Checkpoint Registry
- Location: `.heady/checkpoints.json`
- Tracks last 20 checkpoints per workspace
- Includes timestamp, commit hash, functionality score

## Troubleshooting

### If Build Fails
1. Check `.heady/autobuild.log` for details
2. Run with `-StatusOnly` to diagnose
3. Address pending tasks manually
4. Re-run with `-ForceCheckpoint` if needed

### If Continuous Mode Won't Start
- Verify PowerShell execution policy: `Get-ExecutionPolicy`
- Check workspace paths in script configuration
- Ensure git remotes are configured

## Exit Codes
- `0` - Success (STANDBY state reached)
- `1` - Issues pending (ACTIVE state)

## Related Workflows
- `/verify-system` - Health and status verification
- `/deploy-system` - Manual deployment trigger
- `/setup-local` - Initial workspace setup
