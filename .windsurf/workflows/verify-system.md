---
description: Verify the health and status of the Heady System
---

# Verify System Health

## Quick Health Check
```powershell
pnpm verify
```

## Detailed Verification
```powershell
node src/client/heady_intelligence_verifier.js
```

## Verification Checklist
- [ ] HeadyRegistry (component registry)
- [ ] Memory Storage (validations, patterns)
- [ ] Checkpoint System (state snapshots)
- [ ] Context Persistence (codemap, project context)
- [ ] Data Schema (processing modules)
- [ ] Codemap Access (codebase intelligence)
- [ ] SquashMerge System (multi-codebase merger)
- [ ] Routing System (HeadyRegistry router)
- [ ] Audit Logging (write access)
- [ ] File System Access (critical directories)

## Optional Systems
- [ ] HeadyManager (port 3300/3100)
- [ ] MCP Servers (configured in mcp_config.json)
- [ ] Orchestrator (port 3100)
- [ ] Governance (governance_checkpoint.js)
- [ ] Validation Pipeline
- [ ] Git Operations

## Post-Verification Actions
1. Update `.heady-context/project-context.json`
2. Update `.heady-context/codemap.json`
3. Log to audit trail
4. Generate checkpoint if major change
