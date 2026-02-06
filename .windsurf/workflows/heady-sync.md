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
<!-- ║  FILE: .windsurf/workflows/heady-sync.md                          ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: HeadySync - Comprehensive sync workflow with full system awareness
---

# HeadySync - Comprehensive Sync Workflow

## Overview
Complete automated workflow that integrates with HeadyConductor for real-time monitoring and system status reporting at each checkpoint.

## Workflow Steps

### 1. Check Git Status
Detect all changes in the working directory.

### 2. Stage All Changes
```bash
git add -A
```

### 3. Commit Changes
```bash
git commit -m "HeadySync: Automated checkpoint"
```

### 4. Run HCAutoBuild Checkpoint
// turbo
```bash
.\hc.bat -a
```

### 5. Generate HeadyRegistry Status Report
Query HeadyRegistry for comprehensive system status at checkpoint:
- Total capabilities
- Nodes count
- Workflows count
- Services count
- Tools count

### 6. Push to All Remotes
// turbo
```bash
.\hs.bat
```

### 7. Verify Local/Remote Sync
Verify that local and remote repositories are identical for all remotes.

### 8. Notify HeadyConductor
Store complete sync operation data in HeadyMemory:
- Sync events and status
- Registry status at checkpoint
- Verification results
- Duration and timestamps

## HeadyConductor Integration

### Real-Time Monitoring
HeadyLens monitors the entire sync operation:
- Tracks each step execution
- Records timing and performance
- Monitors system resources during sync

### Memory Storage
All sync operations stored in HeadyMemory:
- Category: `sync_operation`
- Tags: `sync`, `git`, `checkpoint`
- Includes: events, status, registry snapshot, verification results

### System Awareness
HeadyConductor maintains 100% awareness:
- Current sync status
- Historical sync patterns
- System state at each checkpoint
- Verification results

## Usage

### Basic Usage
```bash
hsync
```

### With Custom Message
```bash
hsync "Feature: Added new capability"
```

### Skip Verification
```bash
.\heady_sync.ps1 -SkipVerify
```

### Verbose Output
```bash
.\heady_sync.ps1 -Verbose
```

## What Gets Stored in HeadyMemory

### Sync Events
- `sync_start` - Sync operation initiated
- `changes_detected` - Changes found in working directory
- `stage` - Changes staged successfully
- `commit` - Changes committed
- `hcautobuild` - HCAutoBuild checkpoint completed
- `registry_status` - System status captured
- `push_all` - Pushed to all remotes
- `verify_sync` - Verification completed
- `sync_complete` - Full workflow completed

### Registry Status Snapshot
At each checkpoint, captures:
```json
{
  "total_capabilities": 50,
  "nodes": 19,
  "workflows": 7,
  "services": 6,
  "tools": 21
}
```

### Verification Data
```json
{
  "remotes_count": 3,
  "all_synced": true,
  "local_commit": "abc123",
  "remote_commits": {
    "origin": "abc123",
    "backup": "abc123",
    "github": "abc123"
  }
}
```

## Benefits

### Complete Awareness
HeadyConductor knows:
- When syncs occur
- What was synced
- System state at sync time
- Whether verification passed

### Historical Tracking
Query past sync operations:
```python
from HeadyMemory import HeadyMemory

memory = HeadyMemory()
syncs = memory.query(category="sync_operation", limit=10)
```

### Performance Optimization
HeadyRegistry status at checkpoint enables:
- Optimal processing decisions
- Resource allocation
- Capability availability tracking

### 100% Functional Verification
Ensures local and remote repos are identical before marking sync complete.

## Integration with Other Workflows

### Works With
- `/hcautobuild` - Automated checkpoint system
- `/deploy-system` - System deployment
- `/verify-system` - Health verification

### Triggers
Can be triggered by:
- Manual execution: `hsync`
- HCAutoBuild workflow
- CI/CD pipelines
- Scheduled tasks

## Monitoring

### Real-Time Status
HeadyLens provides live monitoring:
```python
from HeadyLens import HeadyLens

lens = HeadyLens()
state = lens.get_current_state()
# Shows active sync operations
```

### Query Sync History
```python
from HeadyMemory import HeadyMemory

memory = HeadyMemory()
recent_syncs = memory.query(tags=["sync"], limit=20)
```

## Error Handling

### Automatic Notification
If sync fails:
- Error stored in HeadyMemory
- HeadyConductor notified
- Detailed error information captured

### Recovery
HeadyConductor can analyze failed syncs and suggest recovery actions.

---

**∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞**

HeadySync ensures complete system awareness and 100% functional verification at every checkpoint.
