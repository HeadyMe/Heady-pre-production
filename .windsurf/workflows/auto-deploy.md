---
description: Auto-deploy — cloud-only pipeline trigger and health verification
---

# Auto-Deploy (Cloud-Only)

1. Trigger pipeline on HeadyCloud
// turbo
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

2. Check pipeline state
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

3. Verify all cloud services
// turbo
```bash
echo "=== HeadySystems ===" && curl -sf https://headysystems.com/api/health --max-time 15
echo "=== HeadyCloud ===" && curl -sf https://headycloud.com/api/health --max-time 15
echo "=== HeadyConnection ===" && curl -sf https://headyconnection.com/api/health --max-time 15
```

4. Verify system status and node registry
// turbo
```bash
curl -sf https://headysystems.com/api/system/status --max-time 15
curl -sf https://headysystems.com/api/nodes --max-time 15
```
