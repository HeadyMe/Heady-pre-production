# HCAutoBuild UI - User Guide

## Overview

HCAutoBuild is now a **functional service** integrated into the Heady Admin UI with a dedicated interface for automated build orchestration.

## Access Methods

### Method 1: Standalone UI (Recommended)
```
http://localhost:3300/autobuild.html
```

### Method 2: Admin UI Tab
```
http://localhost:3300/admin.html
```
Click the **🏗️ AutoBuild** tab

## Features

### 1. **Build Configuration**
- **Build Mode:** Auto, Manual, or Hybrid
- **Dry Run:** Preview changes without executing
- **Verbose:** Enable detailed logging
- **Phase Selection:** Choose which phases to run

### 2. **Build Phases**
Select any combination:
- **Analyze** - Scan repositories and dependencies
- **Extract** - Extract components from sources
- **Merge** - Intelligent squash merge
- **Test** - Run test suites
- **Deploy** - Deploy artifacts

### 3. **Real-Time Status**
- Current build ID and status
- Active phase indicator
- Duration tracking
- Phase progress with icons

### 4. **Build History**
- All previous builds
- Status indicators (✓ success, ✗ failed, ⟳ running)
- Duration and phase count
- Error tracking

### 5. **Quick Actions**
- **Execute Build** - Run selected phases
- **Analyze Only** - Quick repository analysis
- **Merge Only** - Execute merge without other phases
- **Refresh** - Update status manually

## UI Components

### Build Configuration Panel
```
┌─────────────────────────────────────────────┐
│ Build Configuration                         │
├─────────────────────────────────────────────┤
│ Build Mode: [Auto ▼]                        │
│ ☑ Dry Run    ☑ Verbose                      │
│                                              │
│ Build Phases:                                │
│ [✓ Analyze] [✓ Extract] [✓ Merge]          │
│ [✓ Test] [✓ Deploy]                         │
│                                              │
│ [▶ Execute Build] [🔍 Analyze] [🔀 Merge]  │
└─────────────────────────────────────────────┘
```

### Current Build Panel
```
┌─────────────────────────────────────────────┐
│ Current Build                                │
├─────────────────────────────────────────────┤
│ Build ID: build-1738606800000               │
│ Status: RUNNING                              │
│ Phase: merge                                 │
│ Duration: 45s                                │
│                                              │
│ Phase Progress:                              │
│ ✓ analyze    (2340ms)                       │
│ ✓ extract    (1850ms)                       │
│ ⟳ merge      (running)                      │
│ ○ test       (pending)                      │
│ ○ deploy     (pending)                      │
└─────────────────────────────────────────────┘
```

### Build History Panel
```
┌─────────────────────────────────────────────┐
│ Build History                                │
├─────────────────────────────────────────────┤
│ Build #3                    2/3/26 8:45 AM  │
│ Status: ✓ completed  Duration: 120s         │
│ Phases: 5  Errors: 0                        │
├─────────────────────────────────────────────┤
│ Build #2                    2/3/26 8:30 AM  │
│ Status: ✗ failed     Duration: 45s          │
│ Phases: 2  Errors: 1                        │
└─────────────────────────────────────────────┘
```

## Usage Workflow

### 1. Start HeadyManager
```powershell
cd c:\Users\erich\Heady
npm start
```

### 2. Open UI
Navigate to: `http://localhost:3300/autobuild.html`

### 3. Configure Build
- Select build mode (auto recommended)
- Choose phases to run
- Enable dry run for preview

### 4. Execute Build
Click **▶ Execute Build**

### 5. Monitor Progress
- Watch real-time phase updates
- Check current phase status
- View duration tracking

### 6. Review Results
- Check build history
- Review phase results
- Examine any errors

## API Integration

The UI communicates with HCAutoBuild via HeadyMCP:

```javascript
// Execute build
POST /api/mcp/call
{
  "server": "heady-autobuild",
  "tool": "hc_autobuild_execute",
  "args": {
    "mode": "auto",
    "phases": ["analyze", "merge"],
    "dryRun": false
  }
}

// Get status
POST /api/mcp/call
{
  "server": "heady-autobuild",
  "tool": "hc_autobuild_status",
  "args": {
    "includeHistory": true
  }
}
```

## Real-Time Updates

The UI polls for status every 3 seconds:
- Build status updates
- Phase progress tracking
- Build history refresh
- Automatic state synchronization

## Keyboard Shortcuts

- **Ctrl+Enter** - Execute build (when focused)
- **Ctrl+R** - Refresh status
- **Esc** - Clear selection

## Status Indicators

### Build Status
- **🟢 COMPLETED** - Build finished successfully
- **🔴 FAILED** - Build encountered errors
- **🟡 RUNNING** - Build in progress
- **⚪ IDLE** - No active build

### Phase Status
- **✓** - Phase completed successfully
- **✗** - Phase failed
- **⟳** - Phase currently running
- **○** - Phase pending

## Troubleshooting

### UI Not Loading
1. Verify HeadyManager is running: `npm start`
2. Check port 3300 is accessible
3. Verify API key is set in localStorage

### Build Not Starting
1. Check HeadyMCP services: `.\scripts\Connect-HeadyMCP.ps1 -Action status`
2. Verify heady-autobuild is configured in `mcp_config.json`
3. Check console for errors (F12)

### Status Not Updating
1. Check browser console for errors
2. Verify API key is valid
3. Refresh page and re-enter API key

## Advanced Features

### Custom Phase Execution
Execute individual phases without full build:
1. Click phase-specific button (🔍 Analyze, 🔀 Merge)
2. Monitor progress in Current Build panel
3. View results in Build History

### Dry Run Mode
Preview build without making changes:
1. Enable "Dry Run" checkbox
2. Execute build
3. Review what would happen
4. Disable dry run and execute for real

### Verbose Logging
Get detailed build information:
1. Enable "Verbose" checkbox
2. Execute build
3. Check browser console (F12) for detailed logs
4. Review audit logs in `audit_logs/autobuild/`

## Integration Points

### With HeadyMaid
- All file operations tracked
- Optimization opportunities detected
- Duplicate prevention

### With HeadySquashMerge
- Intelligent multi-repo merging
- Weighted distribution
- Conflict resolution

### With CheckpointReporter
- Automatic checkpoint generation
- Story-driven documentation
- Audit trail

## Conclusion

✅ **HCAutoBuild is now a functional UI service**

- **Standalone page** at `/autobuild.html`
- **Admin UI tab** for integrated access
- **Real-time updates** every 3 seconds
- **Full build control** with phase selection
- **Complete history** tracking
- **MCP integration** for all operations

**Access it at: http://localhost:3300/autobuild.html**
