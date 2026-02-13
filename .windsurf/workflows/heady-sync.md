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
description: HeadySync - cloud-only sync orchestration and verification
---

# HeadySync Cloud Workflow

## Overview
HeadySync coordinates cloud pipeline execution and cross-service verification using branded Heady API domains only.

## Prerequisites
- `HEADY_API_KEY` is set.

## Workflow Steps

### 1. Verify baseline cloud health
// turbo
```bash
curl -sf https://headysystems.com/api/health
curl -sf https://headycloud.com/api/health
curl -sf https://headyconnection.com/api/health
```

### 2. Capture current sync context
// turbo
```bash
curl -sf https://headysystems.com/api/registry
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/v1/orchestrator/state
```

### 3. Execute sync via cloud pipeline
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### 4. Monitor sync progress
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/history \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

### 5. Validate post-sync platform state
// turbo
```bash
curl -sf https://headysystems.com/api/nodes
curl -sf https://headysystems.com/api/cluster/state
curl -sf https://headysystems.com/api/mcp/status
curl -sf https://headysystems.com/api/v1/chat/stats
```

## Usage

### Run standard sync
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### Run orchestrator-directed sync goal
```bash
curl -sf -X POST https://headysystems.com/api/v1/orchestrator/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"goal":"sync-and-verify"}'
```

## Success Criteria
- Core cloud health endpoints return success.
- Pipeline run is accepted and visible in state/history.
- Registry, node, cluster, and orchestrator endpoints return valid JSON.
- MCP and chat endpoints respond without critical errors.

## Troubleshooting

### Missing API key
```bash
test -n "$HEADY_API_KEY" && echo "HEADY_API_KEY is set" || echo "HEADY_API_KEY is missing"
```

### Pipeline already running
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

### Investigate detailed run errors
```bash
curl -sf https://headycloud.com/api/pipeline/state/full \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/log \
  -H "Authorization: Bearer $HEADY_API_KEY"
```
