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
<!-- ║  FILE: .windsurf/workflows/docker-mcp-setup.md                    ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: HeadyMCP cloud setup and verification via branded APIs
---

# HeadyMCP Cloud Setup Workflow

This workflow validates and operates MCP integrations through branded Heady cloud APIs only.

## Prerequisites
- `HEADY_API_KEY` is set for protected endpoints.

## Steps

### 1. Verify core cloud health
// turbo
```bash
curl -sf https://headysystems.com/api/health
curl -sf https://headycloud.com/api/health
curl -sf https://headymcp.com
```

### 2. Check MCP gateway status
// turbo
```bash
curl -sf https://headysystems.com/api/mcp/status
curl -sf https://headysystems.com/api/mcp/servers
curl -sf https://headysystems.com/api/v1/mcp/connectors/dashboard
```

### 3. Register a cloud MCP connector (optional)
```bash
curl -sf -X POST https://headysystems.com/api/v1/mcp/connectors/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"id":"mcp-cloud-connector","name":"MCP Cloud Connector","url":"https://headymcp.com","capabilities":["health","status"]}'
```

### 4. Validate connector heartbeat and capabilities
```bash
curl -sf -X PUT https://headysystems.com/api/v1/mcp/connectors/mcp-cloud-connector/heartbeat \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headysystems.com/api/v1/mcp/connectors/mcp-cloud-connector/capabilities
```

### 5. Trigger cloud pipeline for MCP readiness
// turbo
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

### 6. Confirm post-run MCP health
// turbo
```bash
curl -sf https://headysystems.com/api/mcp/status
curl -sf https://headysystems.com/api/system/status
```

## Verification Checklist
- [ ] Core cloud health endpoints respond.
- [ ] MCP status and server inventory return valid JSON.
- [ ] Connector dashboard is accessible.
- [ ] Pipeline run is accepted and visible in state.
- [ ] System status remains healthy after MCP checks.

## Troubleshooting

### Missing API authorization
```bash
test -n "$HEADY_API_KEY" && echo "HEADY_API_KEY is set" || echo "HEADY_API_KEY is missing"
```

### No connectors listed
```bash
curl -sf https://headysystems.com/api/v1/mcp/connectors/dashboard
curl -sf https://headysystems.com/api/v1/mcp/connectors
```

### Pipeline already running
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

---

**Workflow Version**: 2.0
**Status**: Cloud-only
