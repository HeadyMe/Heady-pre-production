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
<!-- ║  FILE: .windsurf/workflows/hc-autobuild.md                        ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: Run HCAutoBuild as a cloud-only pipeline workflow
---

# HCAutoBuild Workflow

## Overview
HCAutoBuild orchestrates build and readiness validation across Heady cloud layers.

## Quick Start

### Run HCAutoBuild
```bash
# // turbo
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### Or check run state
```bash
# // turbo
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

## What HCAutoBuild Does

1. **Loads Pipeline Config** - Pulls active cloud pipeline configuration
2. **Runs Build Stages** - Executes configured stages in HCFullPipeline
3. **Tracks Progress** - Publishes run status and stage checkpoints
4. **Validates Readiness** - Confirms node, cluster, and system status
5. **Reports Results** - Exposes run history and health outcomes

## Targeted Cloud Repositories

| Repository | Included in pipeline |
|------------|----------------------|
| HeadySystems/Heady | ✅ |
| HeadyMe/Heady | ✅ |
| HeadyConnection/Heady | ✅ |
| HeadySystems/sandbox | ✅ (if enabled) |
| Additional linked repos | ✅ (if configured) |

## Prerequisites

Before running HCAutoBuild, ensure:
```bash
test -n "$HEADY_API_KEY" && echo "HEADY_API_KEY is set" || echo "HEADY_API_KEY is missing"
curl -sf https://headycloud.com/api/health
curl -sf https://headysystems.com/api/health
```

## Build Options

### Full Automated Workflow
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### With System Restart
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild","mode":"restart"}'
```

## Output Example

```
🔨 Heady AutoBuild - Sacred Geometry Build System

🔍 Discovered cloud repositories:
   • HeadySystems/Heady
   • HeadyMe/Heady
   • HeadyConnection/Heady

📋 Found 5 buildable projects

📦 Building: HeadySystems/Heady
✅ HeadySystems/Heady - Build complete

════════════════════════════════════════════════════════════════
✅ Heady AutoBuild Complete!
   Success: 5 | Failed: 0
════════════════════════════════════════════════════════════════
```

## Troubleshooting

### Build Fails
```bash
curl -sf https://headycloud.com/api/pipeline/state/full \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pipeline/log \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

### Service health mismatch
```bash
curl -sf https://headysystems.com/api/system/status
curl -sf https://headysystems.com/api/nodes
curl -sf https://headysystems.com/api/cluster/state
```

## Post-Build Actions

After successful build:
1. Run `/verify-system` to check health
2. Run `/headysync-prep` for synchronization
3. Create checkpoint if deploying

## Integration with CI/CD

HCAutoBuild can be triggered from:
- API-triggered orchestration on `https://headycloud.com/api/pipeline/run`
- Scheduled cloud automations
- Manual execution via Windsurf workflow
