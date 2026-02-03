# CLI Service Selection - Complete Guide

## Overview

All CLI commands (`hb`, `hc`, `heady-cli`) now support **modular service selection**. Choose exactly which MCP services to use for each operation.

## Updated CLI Parameters

### hb (Heady Build)

```powershell
# Use preset
hb task "Deploy app" --preset full-stack

# Select specific services
hb task "Build feature" --services "filesystem,git,memory"

# Auto-recommend based on task
hb task "Create database schema and deploy"
# Automatically selects optimal services

# Use all services
hb task "Complex analysis" --preset all
```

### hc (Heady Control)

```powershell
# Use preset
hc "Analyze codebase" --preset ai-enhanced

# Select specific services
hc "Read files" --services "filesystem"

# Auto-recommend (default)
hc "Research AI security best practices"
# Automatically recommends: fetch, sequential-thinking, memory
```

### heady-cli

```powershell
# Use preset
heady exec "Deploy" --preset cloud-deploy

# Select specific services
heady task "Build" --services "filesystem,git"

# List available presets
heady discover --presets

# List available services
heady discover --services
```

## Available Presets

### **minimal**
- Services: `filesystem`
- Use Case: Simple file operations
- Performance: Fastest (~5ms overhead)

### **basic**
- Services: `filesystem, git`
- Use Case: Basic development
- Performance: Fast (~8ms overhead)

### **development** (Default)
- Services: `heady-windsurf-router, filesystem, git, memory`
- Use Case: Standard development with tracking
- Performance: Balanced (~12ms overhead)

### **ai-enhanced**
- Services: `heady-windsurf-router, filesystem, sequential-thinking, memory`
- Use Case: AI-powered development
- Performance: Moderate (~15ms overhead)

### **full-stack**
- Services: `heady-windsurf-router, filesystem, git, sequential-thinking, memory, postgres`
- Use Case: Complete full-stack development
- Performance: Comprehensive (~20ms overhead)

### **research**
- Services: `heady-windsurf-router, fetch, sequential-thinking, memory`
- Use Case: Research and data gathering
- Performance: Optimized for external data (~15ms overhead)

### **automation**
- Services: `heady-windsurf-router, filesystem, puppeteer, memory`
- Use Case: Browser automation and testing
- Performance: Optimized for UI automation (~18ms overhead)

### **cloud-deploy**
- Services: `heady-windsurf-router, filesystem, git, cloudflare`
- Use Case: Cloud deployment workflows
- Performance: Optimized for deployment (~15ms overhead)

### **all**
- Services: All 9 MCP services
- Use Case: Maximum capabilities
- Performance: Highest overhead (~30ms overhead)

## Service Independence

Each service is **completely independent** and can be used alone or in any combination:

### Individual Service Usage

```powershell
# Use only filesystem
hb task "List files" --services "filesystem"

# Use only git
hb task "Check status" --services "git"

# Use only sequential-thinking
hb task "Plan architecture" --services "sequential-thinking"

# Use only memory
hb task "Store context" --services "memory"
```

### Custom Combinations

```powershell
# Files + Git (no AI)
hb task "Commit changes" --services "filesystem,git"

# AI + Memory (no files)
hb task "Analyze data" --services "sequential-thinking,memory"

# Network + AI
hb task "Research topic" --services "fetch,sequential-thinking"

# Full observability + minimal services
hb task "Track file changes" --services "heady-windsurf-router,filesystem"
```

## Auto-Recommendation

When no services are specified, the system **automatically recommends** optimal services based on task keywords:

### Example 1: File Operations
```powershell
hb task "Read configuration files and update settings"
# Auto-selects: heady-windsurf-router, filesystem, memory
```

### Example 2: Database Work
```powershell
hb task "Create database schema and migrate data"
# Auto-selects: heady-windsurf-router, filesystem, postgres, memory
```

### Example 3: Research
```powershell
hc "Research latest AI security vulnerabilities"
# Auto-selects: heady-windsurf-router, fetch, sequential-thinking, memory
```

### Example 4: Deployment
```powershell
hb task "Deploy application to Cloudflare Workers"
# Auto-selects: heady-windsurf-router, filesystem, git, cloudflare
```

## API Integration

### Check Available Services
```bash
curl -H "x-heady-api-key: $HEADY_API_KEY" \
  http://localhost:3300/api/mcp/services
```

Response:
```json
{
  "ok": true,
  "services": [
    {
      "name": "heady-windsurf-router",
      "category": "routing",
      "capabilities": ["file_ops", "commands", "git", "inventory"],
      "priority": 1,
      "connected": true
    },
    ...
  ]
}
```

### List Presets
```bash
curl -H "x-heady-api-key: $HEADY_API_KEY" \
  http://localhost:3300/api/mcp/presets
```

### Get Recommendation
```bash
curl -X POST http://localhost:3300/api/mcp/recommend \
  -H "x-heady-api-key: $HEADY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"task": "Build full-stack app with AI features"}'
```

Response:
```json
{
  "ok": true,
  "recommendation": {
    "services": ["heady-windsurf-router", "filesystem", "sequential-thinking", "memory", "postgres"],
    "reasoning": [
      "heady-windsurf-router: Full observability",
      "filesystem: File operations detected",
      "sequential-thinking: Complex analysis required",
      "memory: Data persistence needed",
      "postgres: Database operations detected"
    ],
    "preset": "full-stack"
  }
}
```

### Validate Combination
```bash
curl -X POST http://localhost:3300/api/mcp/validate \
  -H "x-heady-api-key: $HEADY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"services": ["filesystem", "git", "postgres"]}'
```

Response:
```json
{
  "ok": true,
  "validation": {
    "valid": true,
    "available": ["filesystem", "git", "postgres"],
    "missing": [],
    "canProceed": true,
    "warnings": []
  }
}
```

## Environment Variables

```powershell
# Set default preset
$env:HEADY_MCP_DEFAULT_PRESET = "development"

# Always include specific services
$env:HEADY_MCP_ALWAYS_INCLUDE = "heady-windsurf-router,filesystem"

# Disable auto-recommendation
$env:HEADY_MCP_AUTO_RECOMMEND = "false"
```

## Complete Examples

### Example 1: Research Task
```powershell
# Let system recommend
hc "Research Kubernetes security best practices"

# Or specify preset
hc "Research Kubernetes security best practices" --preset research

# Or explicit services
hc "Research Kubernetes security best practices" --services "fetch,sequential-thinking,memory"
```

### Example 2: Database Migration
```powershell
# Auto-recommend
hb task "Migrate database schema from v1 to v2"

# Or use preset
hb task "Migrate database schema from v1 to v2" --preset full-stack

# Or explicit
hb task "Migrate database schema from v1 to v2" --services "filesystem,postgres,git,memory"
```

### Example 3: UI Testing
```powershell
# Auto-recommend
heady exec "Test login page and capture screenshots"

# Or use preset
heady exec "Test login page and capture screenshots" --preset automation

# Or explicit
heady exec "Test login page and capture screenshots" --services "puppeteer,filesystem,memory"
```

## Verification

### Check What Services Were Used
```powershell
# Submit task
hb task "Deploy app" --preset cloud-deploy

# Check routing stats
curl -H "x-heady-api-key: $env:HEADY_API_KEY" \
  http://localhost:3300/api/mcp/routing-stats
```

Response includes:
```json
{
  "routing": {
    "servers": [
      {"name": "heady-windsurf-router", "status": "connected"},
      {"name": "filesystem", "status": "connected"},
      {"name": "git", "status": "connected"},
      {"name": "cloudflare", "status": "connected"}
    ]
  }
}
```

## Best Practices

### 1. Use Presets for Common Workflows
```powershell
# Good - clear and maintainable
hb task "Build feature" --preset development

# Less ideal - harder to maintain
hb task "Build feature" --services "heady-windsurf-router,filesystem,git,memory"
```

### 2. Let Auto-Recommend for New Tasks
```powershell
# Good - system optimizes
hb task "Create API with authentication and database"

# May miss optimal services
hb task "Create API with authentication and database" --services "filesystem,git"
```

### 3. Use Minimal for Simple Operations
```powershell
# Good - fast and efficient
hb task "Read config file" --preset minimal

# Overkill
hb task "Read config file" --preset all
```

### 4. Always Include heady-windsurf-router for Observability
```powershell
# Good - full tracking
--services "heady-windsurf-router,filesystem,git"

# Missing observability
--services "filesystem,git"
```

## Summary

✅ **All services are independent and modular**  
✅ **Any combination can be selected**  
✅ **9 predefined presets for common workflows**  
✅ **Auto-recommendation for optimal selection**  
✅ **Full validation before execution**  
✅ **Complete API support**  

**Every HeadyMCP service call can now use a custom combination of services tailored to the specific operation.**
