<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: HEADY_SYNC_README.md -->
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

# HEADY SYNC - COMPREHENSIVE WORKFLOW

## Quick Start

```bash
# Simple sync
hsync

# With custom message
hsync "Feature: Added new monitoring system"
```

## What It Does

**HeadySync** is a comprehensive workflow that combines all sync operations with full HeadyConductor awareness:

```
modify → stage → commit → checkpoint → registry status → push → verify → monitor
```

### Complete Workflow

1. **Check Git Status** - Detect all changes
2. **Stage Changes** - `git add -A`
3. **Commit** - With custom or default message
4. **HCAutoBuild Checkpoint** - `hc -a` for automated checkpoint
5. **HeadyRegistry Status Report** - Capture system state at checkpoint
6. **Push to All Remotes** - `hs` to sync all remotes
7. **Verify Sync** - Confirm local/remote repos are identical
8. **Notify HeadyConductor** - Store all data in HeadyMemory

## HeadyConductor Integration

### Real-Time Monitoring
- **HeadyLens** monitors the entire sync operation
- Tracks each step execution and timing
- Records system resources during sync

### Persistent Storage
All sync operations stored in **HeadyMemory**:
- Sync events and status
- Registry status snapshot at checkpoint
- Verification results
- Duration and performance metrics

### System Awareness
HeadyConductor maintains **100% awareness**:
- Current sync status
- Historical sync patterns
- System state at each checkpoint
- Verification results for all remotes

## Registry Status at Checkpoint

At each checkpoint, HeadyRegistry provides optimal processing data:

```
Registry Status at Checkpoint:
  Total Capabilities: 50
  Nodes: 19
  Workflows: 7
  Services: 6
  Tools: 21
```

This enables:
- **Optimal Processing** - Know exactly what's available
- **Resource Allocation** - Allocate based on current state
- **Capability Tracking** - Track changes over time
- **Performance Optimization** - Make informed decisions

## Verification System

### Local/Remote Sync Verification
Checks all configured remotes:
- Compares local commit with remote commit
- Detects if local is ahead/behind
- Confirms identical state across all remotes

### Example Output
```
✓ origin is synced
✓ backup is synced
✓ github is synced
✓ All remotes verified identical
```

## Data Stored in HeadyMemory

### Sync Events Tracked
- `sync_start` - Operation initiated
- `changes_detected` - Changes found (with count)
- `stage` - Changes staged
- `commit` - Committed (with hash)
- `hcautobuild` - Checkpoint completed
- `registry_status` - System status captured
- `push_all` - Pushed to all remotes
- `verify_sync` - Verification completed
- `sync_complete` - Full workflow finished

### Example Memory Entry
```json
{
  "category": "sync_operation",
  "content": {
    "event": "sync_complete",
    "status": "success",
    "timestamp": "2024-01-01T12:00:00Z",
    "data": {
      "duration_seconds": 15.3,
      "registry_status": {
        "total_capabilities": 50,
        "nodes": 19,
        "workflows": 7
      }
    }
  },
  "tags": ["sync", "git", "checkpoint"]
}
```

## Usage Examples

### Basic Sync
```bash
hsync
```

### Custom Commit Message
```bash
hsync "Feature: Integrated HeadyLens monitoring"
```

### PowerShell with Options
```powershell
# Skip verification
.\heady_sync.ps1 -SkipVerify

# Verbose output
.\heady_sync.ps1 -Verbose

# Custom message with verbose
.\heady_sync.ps1 -Message "Update: Fixed sync workflow" -Verbose
```

## Query Sync History

### Python
```python
from HeadyAcademy.HeadyMemory import HeadyMemory

memory = HeadyMemory()

# Get recent syncs
recent_syncs = memory.query(category="sync_operation", limit=10)

# Get syncs with specific tags
checkpoint_syncs = memory.query(tags=["checkpoint"], limit=20)

# Get sync statistics
stats = memory.get_statistics()
print(f"Total sync operations: {stats['by_category'].get('sync_operation', 0)}")
```

### Via HeadyConductor
```python
from HeadyAcademy.HeadyConductor import HeadyConductor

conductor = HeadyConductor()

# Query sync-related capabilities
results = conductor.query_capabilities("sync")

# Get system summary (includes sync data)
summary = conductor.get_system_summary()
```

## Integration with Workflows

### Workflow Integration
HeadySync is registered as `/heady-sync` workflow:
```bash
# Via workflow system
/heady-sync

# Via HeadyConductor
python HeadyAcademy/HeadyConductor.py --workflow heady-sync
```

### Orchestration
```python
from HeadyAcademy.HeadyConductor import HeadyConductor

conductor = HeadyConductor()

# Orchestrate sync operation
result = conductor.orchestrate("sync all changes and verify remotes")
# HeadyConductor will find and execute HeadySync workflow
```

## Benefits

### 🎯 Complete Awareness
- HeadyConductor knows when syncs occur
- What was synced and committed
- System state at sync time
- Whether verification passed

### 📊 Optimal Processing
- Registry status at checkpoint enables informed decisions
- Resource allocation based on current capabilities
- Performance optimization through historical data

### ✅ 100% Functional Verification
- Ensures local and remote repos are identical
- Checks all configured remotes
- Detects sync issues immediately

### 🧠 Intelligent Monitoring
- Real-time tracking via HeadyLens
- Persistent storage in HeadyMemory
- Historical pattern analysis
- Predictive insights

### 🔄 Seamless Integration
- Works with HCAutoBuild
- Integrates with all workflows
- Compatible with CI/CD
- Supports automation

## Monitoring Dashboard

### Check Current Sync Status
```python
from HeadyAcademy.HeadyLens import HeadyLens

lens = HeadyLens()
state = lens.get_current_state()

# Check for active sync operations
print(f"System Health: {state['system_health']}")
print(f"Recent Events: {len(state['events_recent'])}")
```

### View Sync Activity
```python
# Query node activity for sync-related nodes
activity = lens.query_index("node_activity", {"node": "CONDUCTOR"})

# Query recent events
events = lens.query_index("events", {"limit": 50})
```

## Error Handling

### Automatic Error Capture
If sync fails:
- Error details stored in HeadyMemory
- HeadyConductor immediately notified
- Detailed stack trace and context captured
- Recovery suggestions generated

### Example Error Entry
```json
{
  "event": "sync_failed",
  "status": "error",
  "data": {
    "error": "Push failed: remote rejected",
    "timestamp": "2024-01-01T12:00:00Z",
    "step": "push_all"
  }
}
```

## Files

- `heady_sync.ps1` - Main PowerShell script
- `hsync.bat` - Shortcut command
- `.windsurf/workflows/heady-sync.md` - Workflow definition
- `HEADY_SYNC_README.md` - This file

## Requirements

- Git installed and configured
- Python with HeadyAcademy modules
- PowerShell (Windows) or PowerShell Core (cross-platform)
- HeadyConductor ecosystem initialized

## Advanced Usage

### Scheduled Syncs
```powershell
# Windows Task Scheduler
schtasks /create /tn "HeadySync" /tr "C:\path\to\hsync.bat" /sc daily /st 00:00
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: HeadySync
  run: |
    powershell -ExecutionPolicy Bypass -File heady_sync.ps1 -Message "CI: Automated sync"
```

### Custom Automation
```powershell
# Watch for changes and auto-sync
while ($true) {
    $changes = git status --porcelain
    if ($changes) {
        .\hsync.bat "Auto: Detected changes"
    }
    Start-Sleep -Seconds 300
}
```

---

**∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞**

HeadySync ensures complete system awareness and 100% functional verification at every checkpoint, with all data properly indexed in HeadyRegistry for optimal processing.
