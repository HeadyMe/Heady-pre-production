---
description: HeadyWeb Implementation - connected websites, Buddy model routing, and rollout governance
---

# HeadyWeb Implementation (Cloud-Only)

## Purpose
Implement HeadyWeb as the unified browser/web surface with HeadyBuddy as the visible assistant and Heady as the default model profile across all major surfaces.

## Scope
1. Connected website information architecture
2. Windsurf-style UI with Heady model selection
3. Windows parity and desktop shortcut outcomes
4. Container legitimacy and release artifact governance

## 1) Baseline cloud readiness
// turbo
```bash
curl -sf https://headysystems.com/api/health
curl -sf https://headycloud.com/api/health
curl -sf https://headyconnection.com/api/health
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/v1/orchestrator/state
```

## 2) Launch implementation goals
```bash
curl -sf -X POST https://headysystems.com/api/v1/orchestrator/execute-many \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"goals":["headyweb-connected-ia","heady-model-selector-default","buddy-cross-surface-unification","container-release-hardening"]}'
```

## 3) Trigger pipeline rollout
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

## 4) Monitor rollout and diagnostics
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/state -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/history -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/log -H "Authorization: Bearer $HEADY_API_KEY"
```

## 5) Validate ecosystem state
// turbo
```bash
curl -sf https://headysystems.com/api/nodes
curl -sf https://headysystems.com/api/cluster/state
curl -sf https://headysystems.com/api/registry
curl -sf https://headysystems.com/api/mcp/status
curl -sf https://headysystems.com/api/v1/sites/status
```

## 6) Release quality gates (must pass)
- Distinct role statement + ecosystem block on each flagship page.
- Cross-domain links functional for nav/footer/CTA pathways.
- Heady model profile available and defaulted in Windsurf-style surfaces.
- Buddy modes (chat/tasks/code/research) available consistently.
- Container health and service dependencies are healthy.
- Distribution artifacts and E-folder mirror are refreshed after green run.

## 7) Recovery path
```bash
curl -sf https://headycloud.com/api/pipeline/state/full -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild","mode":"restart"}'
```
