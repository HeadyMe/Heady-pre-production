# HCAutoBuild MCP Service - Complete Guide

## Overview

**HCAutoBuild** is now a convenient standalone HeadyMCP service that provides automated build orchestration through the MCP protocol.

## Service Information

- **Name:** `heady-autobuild`
- **Type:** MCP Server
- **Port:** Stdio (via HeadyMCP gateway)
- **Location:** `mcp-servers/heady-autobuild/server.js`
- **Version:** 1.0.0

## Available Tools

### 1. **hc_autobuild_execute**
Execute full autobuild cycle with all phases.

**Parameters:**
```json
{
  "mode": "auto|manual|hybrid",
  "phases": ["analyze", "extract", "merge", "test", "deploy"],
  "dryRun": false,
  "verbose": false,
  "repositories": ["repo1", "repo2"]
}
```

**Example:**
```powershell
# Via CLI
hc "Execute full autobuild cycle" --services "heady-autobuild"

# Via API
curl -X POST http://localhost:3300/api/mcp/call \
  -H "x-heady-api-key: $HEADY_API_KEY" \
  -d '{
    "server": "heady-autobuild",
    "tool": "hc_autobuild_execute",
    "args": {
      "mode": "auto",
      "verbose": true
    }
  }'
```

### 2. **hc_autobuild_analyze**
Analyze repositories, dependencies, and detect conflicts.

**Parameters:**
```json
{
  "repositories": ["path/to/repo1", "path/to/repo2"],
  "includeRecommendations": true
}
```

**Returns:**
```json
{
  "success": true,
  "analysis": {
    "repositories": [...],
    "dependencies": {...},
    "conflicts": [...],
    "compatibility": {...},
    "recommendations": [...]
  }
}
```

### 3. **hc_autobuild_merge**
Execute intelligent squash merge with weighted distribution.

**Parameters:**
```json
{
  "strategy": "intelligent|force|safe",
  "conflictResolution": "auto|manual|skip",
  "validationLevel": "strict|moderate|loose"
}
```

**Features:**
- Weighted repository merging
- Automatic conflict resolution
- HeadySquashMerge integration
- Validation before merge

### 4. **hc_autobuild_test**
Run comprehensive test suite.

**Parameters:**
```json
{
  "suites": ["unit", "integration", "e2e"],
  "coverage": true,
  "strictTesting": true
}
```

### 5. **hc_autobuild_deploy**
Deploy built artifacts to target environment.

**Parameters:**
```json
{
  "target": "production|staging|development",
  "dryRun": false
}
```

### 6. **hc_autobuild_status**
Get current build status and metrics.

**Parameters:**
```json
{
  "includeHistory": false
}
```

**Returns:**
```json
{
  "currentBuild": {
    "id": "build-1738606800000",
    "status": "running|completed|failed",
    "startTime": "2026-02-03T15:00:00Z"
  },
  "autobuildState": {...},
  "buildConfig": {...}
}
```

### 7. **hc_autobuild_checkpoint**
Generate system checkpoint report.

**Parameters:**
```json
{
  "stage": "pre-build|post-build|manual"
}
```

## Configuration

### mcp_config.json
```json
{
  "mcpServers": {
    "heady-autobuild": {
      "command": "node",
      "args": ["./mcp-servers/heady-autobuild/server.js"],
      "governance": {
        "requireConfirmation": ["hc_autobuild_merge", "hc_autobuild_deploy"],
        "auditAll": true
      }
    }
  }
}
```

### Governance
- **Requires Confirmation:** Merge and deploy operations
- **Audit Logging:** All operations logged
- **Integration:** Works with HeadyMaid, WindsurfBridge, SquashMerge

## Usage Examples

### CLI Usage

```powershell
# Full autobuild cycle
hc "Execute autobuild with all phases" --services "heady-autobuild"

# Analyze only
hc "Analyze repositories for conflicts" --services "heady-autobuild,filesystem,git"

# Merge with specific strategy
hc "Merge repositories using intelligent strategy" --services "heady-autobuild,git,memory"

# Deploy to staging
hc "Deploy to staging environment" --services "heady-autobuild,cloudflare"
```

### Direct MCP Call

```javascript
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');

// Connect to HeadyMCP
const client = await connectToHeadyMCP();

// Execute autobuild
const result = await client.callTool('heady-autobuild', 'hc_autobuild_execute', {
  mode: 'auto',
  phases: ['analyze', 'merge'],
  verbose: true
});

console.log(result);
```

### Via HeadyMCP API

```powershell
$body = @{
    server = "heady-autobuild"
    tool = "hc_autobuild_analyze"
    args = @{
        repositories = @("c:\Users\erich\Heady", "c:\Users\erich\Projects")
        includeRecommendations = $true
    }
} | ConvertTo-Json

$headers = @{
    "x-heady-api-key" = $env:HEADY_API_KEY
}

Invoke-RestMethod -Uri "http://localhost:3300/api/mcp/call" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"
```

## Build Phases

### Phase 1: Analyze
- Scan repositories
- Detect dependencies
- Find conflicts
- Check compatibility
- Generate recommendations (via MCP)

### Phase 2: Extract
- Extract components from sources
- Apply transformations
- Prepare for merge

### Phase 3: Merge
- Intelligent squash merge
- Weighted distribution
- Automatic conflict resolution
- Validation checks

### Phase 4: Test
- Run test suites (unit, integration, e2e)
- Calculate coverage
- Validate quality

### Phase 5: Deploy
- Build artifacts
- Deploy to target
- Verify deployment

## Service Combinations

### Recommended Combinations

**Basic Autobuild:**
```json
["heady-autobuild", "filesystem", "git"]
```

**AI-Enhanced Autobuild:**
```json
["heady-autobuild", "filesystem", "git", "sequential-thinking", "memory"]
```

**Full-Stack Autobuild:**
```json
["heady-autobuild", "filesystem", "git", "sequential-thinking", "memory", "postgres"]
```

**Cloud Deploy:**
```json
["heady-autobuild", "filesystem", "git", "cloudflare"]
```

**Complete Observability:**
```json
["heady-windsurf-router", "heady-autobuild", "filesystem", "git", "memory"]
```

## Integration with Other Services

### With HeadyMaid
```javascript
// HCAutoBuild automatically integrates with HeadyMaid
// File operations are tracked and optimized
```

### With WindsurfBridge
```javascript
// Routes requests through HeadyRegistry Router
// Ensures optimal component utilization
```

### With HeadySquashMerge
```javascript
// Uses HeadySquashMerge for intelligent merging
// Weighted distribution and conflict resolution
```

### With CheckpointReporter
```javascript
// Generates checkpoints at key stages
// Story-driven documentation
```

## Quick Start

### 1. Install Dependencies
```bash
cd c:\Users\erich\Heady\mcp-servers\heady-autobuild
npm install
```

### 2. Test Server
```bash
node server.js
# Should output: "Heady AutoBuild MCP Server running on stdio"
```

### 3. Use via CLI
```powershell
# Set API key
$env:HEADY_API_KEY = "your-key"

# Execute autobuild
hc "Run full autobuild cycle" --services "heady-autobuild"
```

### 4. Check Status
```powershell
hc "Get autobuild status" --services "heady-autobuild"
```

## API Endpoints

### List Tools
```bash
curl -X POST http://localhost:3300/api/mcp/call \
  -H "x-heady-api-key: $HEADY_API_KEY" \
  -d '{
    "server": "heady-autobuild",
    "method": "tools/list"
  }'
```

### Execute Build
```bash
curl -X POST http://localhost:3300/api/mcp/call \
  -H "x-heady-api-key: $HEADY_API_KEY" \
  -d '{
    "server": "heady-autobuild",
    "tool": "hc_autobuild_execute",
    "args": {
      "mode": "auto",
      "dryRun": true
    }
  }'
```

### Get Status
```bash
curl -X POST http://localhost:3300/api/mcp/call \
  -H "x-heady-api-key: $HEADY_API_KEY" \
  -d '{
    "server": "heady-autobuild",
    "tool": "hc_autobuild_status",
    "args": {
      "includeHistory": true
    }
  }'
```

## Convenience Commands

### PowerShell Wrapper
```powershell
# Add to hc.ps1 or create alias
function Invoke-HCAutoBuild {
    param(
        [string]$Action = "execute",
        [switch]$DryRun,
        [switch]$Verbose
    )
    
    $body = @{
        server = "heady-autobuild"
        tool = "hc_autobuild_$Action"
        args = @{
            dryRun = $DryRun.IsPresent
            verbose = $Verbose.IsPresent
        }
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3300/api/mcp/call" `
        -Method POST `
        -Headers @{ "x-heady-api-key" = $env:HEADY_API_KEY } `
        -Body $body `
        -ContentType "application/json"
}

# Usage
Invoke-HCAutoBuild -Action analyze -Verbose
Invoke-HCAutoBuild -Action execute -DryRun
```

### Bash Alias
```bash
# Add to .bashrc or .zshrc
alias hcab='curl -X POST http://localhost:3300/api/mcp/call \
  -H "x-heady-api-key: $HEADY_API_KEY" \
  -H "Content-Type: application/json"'

# Usage
hcab -d '{"server":"heady-autobuild","tool":"hc_autobuild_status","args":{}}'
```

## Monitoring

### Build Logs
```bash
# Audit logs location
c:\Users\erich\Heady\audit_logs\autobuild\

# View latest build
Get-Content (Get-ChildItem audit_logs\autobuild\*.json | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName | ConvertFrom-Json
```

### Real-time Status
```powershell
# Watch build status
while ($true) {
    hc "Get autobuild status" --services "heady-autobuild"
    Start-Sleep -Seconds 5
}
```

## Troubleshooting

### Service Not Available
```powershell
# Check if server is configured
Get-Content c:\Users\erich\Heady\mcp_config.json | ConvertFrom-Json | Select-Object -ExpandProperty mcpServers | Select-Object -ExpandProperty heady-autobuild

# Verify HeadyMCP is running
.\scripts\Connect-HeadyMCP.ps1 -Action status
```

### Build Failures
```powershell
# Check build logs
Get-Content audit_logs\autobuild\build-*.json | ConvertFrom-Json

# Run with verbose
hc "Execute autobuild" --services "heady-autobuild" --verbose
```

## Best Practices

1. **Always use with heady-windsurf-router** for full observability
2. **Start with dry-run** to preview changes
3. **Use analyze phase first** to understand conflicts
4. **Enable verbose logging** for debugging
5. **Check status regularly** during long builds
6. **Review audit logs** after completion

## Performance

- **Analyze Phase:** ~2-5 seconds per repository
- **Extract Phase:** ~1-3 seconds per component
- **Merge Phase:** ~5-15 seconds (depends on conflicts)
- **Test Phase:** ~10-60 seconds (depends on test suite)
- **Deploy Phase:** ~5-30 seconds (depends on target)

**Total:** ~25-120 seconds for full cycle

## Conclusion

✅ **HCAutoBuild is now a convenient HeadyMCP service**

- **7 MCP tools** for build automation
- **Full integration** with HeadyMCP ecosystem
- **Modular usage** - use individual phases or full cycle
- **Service combinations** - combine with other MCP services
- **Complete governance** - confirmation required for destructive ops
- **Audit logging** - all operations tracked

**Use it like any other MCP service - independently or in combination!**
