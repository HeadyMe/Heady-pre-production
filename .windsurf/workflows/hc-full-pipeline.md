---
description: HCFullPipeline - cloud-only archive, rebuild, and verification
---

# HCFullPipeline: Cloud Rebuild Protocol

## Overview
Runs archive/rebuild orchestration as a cloud-only workflow through branded APIs.

## Prerequisites
- `HEADY_API_KEY` is set.

## Phase 1: Pre-Flight Health and Readiness

1. Verify service health:
// turbo
```bash
curl -sf https://headysystems.com/api/health
curl -sf https://headycloud.com/api/health
curl -sf https://headyconnection.com/api/health
```

2. Verify system state before run:
// turbo
```bash
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/nodes
curl -sf https://headysystems.com/api/v1/orchestrator/state
```

## Phase 2: Inspect Pipeline Configuration

3. Validate configured pipeline and DAG:
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/config
curl -sf https://headycloud.com/api/pipeline/dag
```

## Phase 3: Execute HCFullPipeline Run

4. Trigger pipeline run:
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

5. Monitor pipeline state until completion:
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/history \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

## Phase 4: Validate Rebuild Outcome

6. Confirm orchestration and cluster status:
// turbo
```bash
curl -sf https://headysystems.com/api/v1/orchestrator/state
curl -sf https://headysystems.com/api/cluster/state
curl -sf https://headysystems.com/api/registry
```

7. Confirm generated site and service status:
// turbo
```bash
curl -sf https://headysystems.com/api/v1/sites/status
curl -sf https://headysystems.com/api/health
curl -sf https://headycloud.com/api/health
curl -sf https://headyconnection.com/api/health
```

## Rollback / Recovery

If any phase fails:
1. Inspect pipeline errors:
```bash
curl -sf https://headycloud.com/api/pipeline/state/full \
  -H "Authorization: Bearer $HEADY_API_KEY"
```
2. Re-run after remediation:
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Authorization: Bearer $HEADY_API_KEY"
```
