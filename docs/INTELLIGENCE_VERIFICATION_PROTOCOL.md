# Heady Intelligence Verification Protocol

## Overview

The **Heady Intelligence Verification System** ensures that all data processing, storage protocols, operations, and live connections are verified and operational **before any AI response is generated**. This creates a pre-response verification layer that guarantees intelligence systems are ready.

## Core Principle

> **"Prior to any Heady response, verification is done that verifies proper connection and operation of the data processing and storage protocols and schema are in place and have been accessed or will be before responding for intelligence."**

## Verification Scope

### 1. Core Intelligence Systems (Critical)
- ✅ **HeadyRegistry** - Component registry and routing configuration
- ✅ **Memory Storage** - Validations, patterns, persistent data
- ✅ **Checkpoint System** - System state snapshots and history
- ✅ **Context Persistence** - Codemap and project context
- ✅ **Data Schema** - Processing modules and protocols
- ✅ **Codemap Access** - Codebase structure and intelligence

### 2. Live Service Connections (Optional)
- 🔌 **HeadyManager** - Main service (port 3300/3100)
- 🔌 **MCP Servers** - Model Context Protocol servers
- 🔌 **Orchestrator** - Task orchestration service

### 3. Operational Processes (Critical)
- ✅ **SquashMerge System** - Multi-codebase merger readiness
- ✅ **Routing System** - HeadyRegistry router and bridge
- 🔌 **Governance** - Governance and audit system

### 4. Data Processing Pipelines (Critical)
- ✅ **Audit Logging** - Write access and log files
- 🔌 **Validation Pipeline** - Validation storage and processing

### 5. System Health (Critical)
- ✅ **File System Access** - Read/write permissions on critical directories
- 🔌 **Git Operations** - Version control availability

**Legend:**
- ✅ Critical - Must pass for system to be operational
- 🔌 Optional - Enhances functionality but not required

## Usage

### Automatic Verification (Recommended)

Every Heady operation automatically verifies intelligence systems:

```bash
# AutoBuild with automatic verification
hb

# Sync with verification
hs

# Checkpoint with verification
hc
```

### Manual Verification

```bash
# Run full verification
node src/heady_intelligence_verifier.js

# Verbose output
node src/heady_intelligence_verifier.js --verbose

# Check specific system
node src/heady_intelligence_verifier.js --check registry
```

### Programmatic Verification

```javascript
const HeadyIntelligenceVerifier = require('./src/heady_intelligence_verifier');

const verifier = new HeadyIntelligenceVerifier({ verbose: true });

// Run full verification
const results = await verifier.verify();

if (results.passed) {
  console.log('✅ All systems operational');
  // Proceed with AI response
} else {
  console.log('⚠️ System issues detected');
  console.log(results.checks);
  // Handle degraded state
}
```

## Verification Flow

```
User Request
    ↓
[VERIFY] Intelligence Systems Check
    ↓
┌─────────────────────────────────────┐
│ Core Intelligence (6 checks)        │
│ - Registry, Memory, Checkpoints     │
│ - Context, Schema, Codemap          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Live Connections (3 checks)         │
│ - HeadyManager, MCP, Orchestrator   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Operations (3 checks)               │
│ - SquashMerge, Routing, Governance  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Data Pipelines (2 checks)           │
│ - Audit Logging, Validation         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ System Health (2 checks)            │
│ - File System, Git Operations       │
└─────────────────────────────────────┘
    ↓
[RESULT] Pass/Fail + Detailed Report
    ↓
[PROCEED] Generate AI Response with Full Intelligence
```

## Verification Results

### Success Output

```
🔍 Heady Intelligence Verification Starting...
   Verifying all operations, processes, and connections...

  ✓ registry
  ✓ memory_storage
  ✓ checkpoint_system
  ✓ context_persistence
  ✓ data_schema
  ✓ codemap_access
  ✓ heady_manager
  ✓ mcp_servers
  ✓ orchestrator
  ✓ squash_merge_ready
  ✓ routing_system
  ✓ governance
  ✓ audit_logging
  ✓ validation_pipeline
  ✓ file_system_access
  ✓ git_operations

✅ All intelligence systems verified and operational

📊 Verification Summary:
{
  "status": "OPERATIONAL",
  "checks": "16/16",
  "timestamp": "2026-02-02T21:51:00Z"
}
```

### Degraded State Output

```
🔍 Heady Intelligence Verification Starting...

  ✓ registry
  ✓ memory_storage
  ✗ checkpoint_system: No checkpoints found
  ✓ context_persistence
  ✓ data_schema
  ✓ codemap_access
  ✗ heady_manager: HeadyManager not accessible

⚠️ Some intelligence systems require attention

📊 Verification Summary:
{
  "status": "DEGRADED",
  "checks": "14/16",
  "timestamp": "2026-02-02T21:51:00Z",
  "actions": [
    "Generate initial checkpoint: .\\scripts\\Invoke-Checkpoint.ps1",
    "Start HeadyManager: npm start"
  ]
}
```

## Integration Points

### 1. HCAutoBuild Integration

`hb` command automatically verifies before build:

```batch
@echo off
node src\heady_intelligence_verifier.js
if %ERRORLEVEL% NEQ 0 exit /b 1
node src\hc_autobuild.js %*
```

### 2. HeadySync Integration

`hs` command verifies before sync:

```powershell
# Pre-sync verification
node src/heady_intelligence_verifier.js
if ($LASTEXITCODE -ne 0) { exit 1 }

# Proceed with sync
.\scripts\hs.ps1
```

### 3. API Integration

HeadyManager can expose verification endpoint:

```javascript
app.get('/api/verify', async (req, res) => {
  const verifier = new HeadyIntelligenceVerifier();
  const results = await verifier.verify();
  res.json(results);
});
```

### 4. MCP Tool Integration

Expose as MCP tool for external AI clients:

```javascript
{
  "name": "verify_intelligence",
  "description": "Verify Heady intelligence systems",
  "inputSchema": {
    "type": "object",
    "properties": {
      "verbose": { "type": "boolean" }
    }
  }
}
```

## Context Persistence

After every operation, the system updates persistent context:

### Project Context (``.heady-context/project-context.json`)

```json
{
  "version": "1.0.0",
  "timestamp": "2026-02-02T21:51:00Z",
  "project": {
    "name": "Heady",
    "type": "hybrid",
    "languages": ["javascript", "python"],
    "frameworks": ["express", "react"]
  },
  "intelligence": {
    "registry": true,
    "checkpoints": true,
    "routing": true,
    "squashMerge": true
  },
  "lastOperation": {
    "type": "autobuild",
    "timestamp": "2026-02-02T21:50:00Z",
    "success": true,
    "details": { "phase": "complete" }
  },
  "operationHistory": [...]
}
```

### Codemap (`.heady-context/codemap.json`)

```json
{
  "version": "1.0.0",
  "timestamp": "2026-02-02T21:51:00Z",
  "rootDir": "c:/Users/erich/Heady",
  "files": [
    { "path": "src/hc_autobuild.js", "size": 25000 },
    { "path": "src/heady_squash_merge.js", "size": 35000 }
  ],
  "directories": ["src", "scripts", "docs"],
  "dependencies": {},
  "metadata": { "generated": true }
}
```

## Troubleshooting

### Issue: Verification Fails

**Check verification details:**
```bash
node src/heady_intelligence_verifier.js --verbose
```

**Common fixes:**
- Missing checkpoint: `.\scripts\Invoke-Checkpoint.ps1`
- Missing registry: Check `.heady-memory/heady-registry.json`
- Service not running: `npm start` (HeadyManager)

### Issue: Critical System Missing

**Regenerate critical files:**
```bash
# Regenerate registry
# (Registry should exist from setup)

# Generate checkpoint
.\scripts\Invoke-Checkpoint.ps1

# Initialize context
node src/heady_intelligence_verifier.js
```

### Issue: Degraded Performance

**Optional services offline:**
- HeadyManager: `npm start`
- Orchestrator: `docker-compose up orchestrator`
- MCP Servers: Check `mcp_config.json`

## Benefits

### 1. **Guaranteed Intelligence**
Every response is backed by verified data systems

### 2. **Persistent Context**
Codemap and project context always accessible

### 3. **Operational Awareness**
Know exactly which systems are operational

### 4. **Proactive Maintenance**
Issues detected before they impact operations

### 5. **Audit Trail**
All verifications logged for compliance

### 6. **Live Connection Monitoring**
Real-time status of all Heady services

## Best Practices

1. **Run verification before major operations**
2. **Keep checkpoints current** (generate regularly)
3. **Monitor optional services** (HeadyManager, MCP)
4. **Review verification logs** in audit_logs/
5. **Update context after operations**
6. **Fix critical issues immediately**
7. **Optional services can be offline** (degraded mode)

## Global Shortcuts

After running setup:

```bash
# From anywhere in your system
hb          # AutoBuild with verification
hs          # Sync with verification  
hc          # Checkpoint generation
```

## Conclusion

The Heady Intelligence Verification Protocol ensures that **every AI response is generated with full access to verified intelligence systems, persistent context, and operational data**. This creates a robust foundation for intelligent, context-aware AI operations.

**Status:** ✅ Operational  
**Version:** 1.0.0  
**Last Updated:** 2026-02-02
