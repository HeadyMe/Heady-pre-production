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
description: HeadySync cloud preparation and execution
---

# HeadySync Cloud Protocol

## Overview
HeadySync coordinates service readiness, orchestration state, and pipeline execution using branded cloud domains only.

## Prerequisites
- `HEADY_API_KEY` is set for protected endpoints.

## Preparation Steps

### 1. Verify base cloud services
// turbo
```bash
curl -sf https://headysystems.com/api/health
curl -sf https://headycloud.com/api/health
curl -sf https://headyconnection.com/api/health
curl -sf https://headybot.com/api/health || curl -sf https://headysystems.com/api/health
```

### 2. Validate orchestration and compute state
// turbo
```bash
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/nodes
curl -sf https://headysystems.com/api/cluster/state
curl -sf https://headysystems.com/api/v1/orchestrator/state
```

### 3. Validate platform integration state
```bash
curl -sf https://headysystems.com/api/registry
curl -sf https://headysystems.com/api/pulse
curl -sf https://headysystems.com/api/mcp/status
```

### 4. Execute HeadySync via cloud pipeline
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### 5. Monitor sync progress
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/history \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

## Troubleshooting

### Pipeline already running
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

### API authorization errors
```bash
test -n "$HEADY_API_KEY" && echo "HEADY_API_KEY is set" || echo "HEADY_API_KEY is missing"
```

## Success Criteria
- All service health checks return success.
- System status and node inventory return valid JSON.
- Pipeline run is accepted and visible in pipeline state/history.
