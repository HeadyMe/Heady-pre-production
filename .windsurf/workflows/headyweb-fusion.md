---
description: HeadyWeb + HeadyBuddy fusion execution and rollout
---

# HeadyWeb + HeadyBuddy Fusion

1. Verify core cloud readiness
// turbo
```bash
curl -sf https://headysystems.com/api/health
curl -sf https://headycloud.com/api/health
curl -sf https://headyconnection.com/api/health
```

2. Capture baseline orchestration state
// turbo
```bash
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/nodes
curl -sf https://headysystems.com/api/cluster/state
curl -sf https://headysystems.com/api/v1/orchestrator/state
```

3. Trigger fusion rollout pipeline
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

4. Monitor rollout
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/state -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/history -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/log -H "Authorization: Bearer $HEADY_API_KEY"
```

5. Validate post-run ecosystem state
// turbo
```bash
curl -sf https://headysystems.com/api/registry
curl -sf https://headysystems.com/api/mcp/status
curl -sf https://headysystems.com/api/v1/sites/status
curl -sf https://headybot.com/api/health || curl -sf https://headysystems.com/api/health
```

6. If run is degraded, inspect and restart
```bash
curl -sf https://headycloud.com/api/pipeline/state/full -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild","mode":"restart"}'
```
