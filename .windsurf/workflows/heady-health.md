---
description: Full cloud health check across Heady domains and APIs
---

# Heady Cloud Health Check (Cloud-Only)

1. Core service health
// turbo
```bash
curl -sf https://headysystems.com/api/health && echo "headysystems.com: OK"
curl -sf https://headycloud.com/api/health && echo "headycloud.com: OK"
curl -sf https://headyconnection.com/api/health && echo "headyconnection.com: OK"
```

2. System and node status
// turbo
```bash
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/nodes
```

3. Cluster and orchestrator state
// turbo
```bash
curl -sf https://headysystems.com/api/cluster/state
curl -sf https://headysystems.com/api/v1/orchestrator/state
```

4. Pipeline state
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/state
```

5. Summary
// turbo
```bash
echo "All checks are cloud-only via branded domains."
```
