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
<!-- ║  FILE: .windsurf/workflows/hcautobuild.md                         ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: HCAutoBuild - cloud-only autonomous build and readiness protocol
---

# HCAutoBuild - Cloud Autonomous Protocol

## Overview
HCAutoBuild executes a cloud-managed pipeline and validates end-to-end readiness using branded Heady domains.

## Prerequisites
- `HEADY_API_KEY` is set.

## Workflow Phases

### Phase 1: Baseline Health
// turbo
```bash
curl -sf https://headysystems.com/api/health
curl -sf https://headycloud.com/api/health
curl -sf https://headyconnection.com/api/health
```

### Phase 2: Trigger HCAutoBuild
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### Phase 3: Monitor Progress
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/history \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/dag
```

### Phase 4: Verify Readiness
// turbo
```bash
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/nodes
curl -sf https://headysystems.com/api/cluster/state
curl -sf https://headysystems.com/api/registry
curl -sf https://headysystems.com/api/mcp/status
curl -sf https://headysystems.com/api/v1/orchestrator/state
```

## Usage Commands

### Start run
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### Check status
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

### Check full detail
```bash
curl -sf https://headycloud.com/api/pipeline/state/full \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

## Success Criteria
- Pipeline reaches completed status.
- No critical stage errors are present.
- System, node, cluster, registry, and orchestrator endpoints return healthy states.

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

### Failed run diagnostics
```bash
curl -sf https://headycloud.com/api/pipeline/state/full \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/log \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

### Manual re-run
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild","mode":"restart"}'
```
