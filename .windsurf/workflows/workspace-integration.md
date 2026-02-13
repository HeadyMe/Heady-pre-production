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
<!-- ║  FILE: .windsurf/workflows/workspace-integration.md               ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: Integrate and verify Heady cloud workspaces via APIs
---

# Workspace Integration Protocol

## Overview
Unified integration of Heady repositories and services using cloud APIs only.

## Active Cloud Repositories

| Repository | Purpose |
|------------|---------|
| `HeadySystems/Heady` | Core Heady system |
| `HeadyMe/Heady` | Personal layer integration |
| `HeadyConnection/Heady` | Cross-layer bridge |
| `HeadySystems/sandbox` | Experimental validation |

## Integration Steps

### 1. Verify cloud services
// turbo
```bash
curl -sf https://headysystems.com/api/health
curl -sf https://headycloud.com/api/health
curl -sf https://headyconnection.com/api/health
```

### 2. Verify cloud layer routing
```bash
curl -sf https://headycloud.com/api/layer \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pulse \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

### 3. Run HCAutoBuild across cloud repos
```bash
# // turbo
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### 4. Validate orchestration state
// turbo
```bash
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/nodes
curl -sf https://headysystems.com/api/v1/orchestrator/state
curl -sf https://headysystems.com/api/registry
```

### 5. Validate MCP and chat layers
// turbo
```bash
curl -sf https://headysystems.com/api/mcp/status
curl -sf https://headysystems.com/api/v1/chat/stats
```

## Cross-Workspace Communication

### Shared Cloud Configuration
- `.windsurfrules` - AI behavior rules
- `.windsurf/workflows/*.md` - Workflow definitions
- `render.yaml` - Infrastructure as code

### Shared APIs
- `https://headycloud.com/api/pipeline/*` - Build and deploy orchestration
- `https://headysystems.com/api/v1/orchestrator/*` - Goal orchestration
- `https://headysystems.com/api/mcp/*` - MCP integration state

## Verification Checklist

- [ ] Core cloud services healthy
- [ ] Active layer and pulse endpoints responding
- [ ] Pipeline run accepted
- [ ] Orchestrator and node status available
- [ ] MCP and chat layers responding

## Troubleshooting

### API authorization failure
```bash
test -n "$HEADY_API_KEY" && echo "HEADY_API_KEY is set" || echo "HEADY_API_KEY is missing"
```

### Pipeline already running
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

## Notes
- Always run integration after major changes
- Use `/hc-autobuild` workflow for build execution
- Check HeadyLens dashboard for status
