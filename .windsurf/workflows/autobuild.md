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
<!-- ║  FILE: .windsurf/workflows/autobuild.md                           ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: Automated cloud checkpoint and build workflow (HCAutoBuild)
---

# /autobuild Workflow

## Purpose
This workflow initiates HCAutoBuild through cloud APIs, verifies readiness, and confirms system-wide health without local commands.

## Pipeline Stages
1. **Prep** - Validate cloud health and orchestration readiness
2. **Run** - Trigger HCAutoBuild pipeline execution
3. **Monitor** - Track state, checkpoints, and run history
4. **Verify** - Validate nodes, cluster, registry, and MCP status
5. **Report** - Capture final state and readiness score

## Cloud Commands

### 1) Trigger single build cycle
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### 2) Monitor run state
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/history \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

## System Behavior

### When at 100% Functionality
- ✅ Pipeline run completes successfully
- ✅ Checkpoints are recorded in pipeline state/history
- ✅ System status remains healthy
- ✅ Node and cluster readiness stay stable

### When Below 100% Functionality
- ⚠️ Pipeline reports errors in run state/full logs
- 🔧 Orchestrator can re-run goal-based remediation
- 📋 Node/cluster/registry diagnostics identify blockers
- 🔄 Health and readiness endpoints remain monitorable

## Expected Output

### Success State
```
{
  "status": "completed",
  "readiness": 100,
  "pipeline": "autobuild",
  "result": "all systems operational"
}
```

### Active State (Tasks Pending)
```
{
  "status": "running",
  "currentStageId": "verify",
  "pending": ["node-readiness", "cluster-health"],
  "result": "requires attention"
}
```

## Integration Points

### Core APIs
- `https://headycloud.com/api/pipeline/run` - Trigger HCAutoBuild
- `https://headycloud.com/api/pipeline/state` - Current run state
- `https://headycloud.com/api/pipeline/history` - Run history
- `https://headysystems.com/api/system/status` - Global status
- `https://headysystems.com/api/nodes` - Node status
- `https://headysystems.com/api/cluster/state` - Cluster readiness
- `https://headysystems.com/api/registry` - Capability inventory
- `https://headysystems.com/api/mcp/status` - MCP integration status

### Checkpoint Registry
- Exposed through `pipeline/state` and `pipeline/history`
- Includes stage status, timestamps, and run metrics
- Supports readiness verification and troubleshooting

## Troubleshooting

### If Build Fails
1. Check full run state:
```bash
curl -sf https://headycloud.com/api/pipeline/state/full \
  -H "Authorization: Bearer $HEADY_API_KEY"
```
2. Check pipeline log:
```bash
curl -sf https://headycloud.com/api/pipeline/log \
  -H "Authorization: Bearer $HEADY_API_KEY"
```
3. Verify service status:
```bash
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/nodes
curl -sf https://headysystems.com/api/cluster/state
```
4. Re-run pipeline:
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### If authorization fails
```bash
test -n "$HEADY_API_KEY" && echo "HEADY_API_KEY is set" || echo "HEADY_API_KEY is missing"
```

## Exit Codes
- `0` - Pipeline completed with healthy status
- `1` - Pipeline incomplete, degraded, or failed

## Related Workflows
- `/verify-system` - Health and status verification
- `/heady-health` - Full cloud health verification
- `/auto-deploy` - Cloud deployment trigger and checks
