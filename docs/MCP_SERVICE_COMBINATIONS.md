# HeadyMCP Service Combinations Guide

## Overview

HeadyMCP services are **fully modular and independent**. You can select any combination of services for each operation based on your specific needs.

## Available Services

### 1. **heady-windsurf-router** (Priority: 1)
- **Category:** Routing
- **Capabilities:** file_ops, commands, git, inventory, optimization
- **Purpose:** Primary router with HeadyMaid integration and full observability
- **Recommended:** Include in all combinations for complete tracking

### 2. **filesystem** (Priority: 2)
- **Category:** Files
- **Capabilities:** read, write, list, move, delete
- **Purpose:** File system operations
- **Use When:** Reading/writing files, managing directories

### 3. **git** (Priority: 2)
- **Category:** VCS
- **Capabilities:** commit, push, pull, branch, status
- **Purpose:** Version control operations
- **Use When:** Git operations, repository management

### 4. **sequential-thinking** (Priority: 3)
- **Category:** AI
- **Capabilities:** planning, reasoning, analysis
- **Purpose:** Complex multi-step reasoning
- **Use When:** Planning, architecture, complex analysis

### 5. **memory** (Priority: 3)
- **Category:** Data
- **Capabilities:** store, retrieve, knowledge_graph
- **Purpose:** Persistent memory and knowledge graphs
- **Use When:** Storing context, building knowledge bases

### 6. **postgres** (Priority: 3)
- **Category:** Data
- **Capabilities:** query, schema, transactions
- **Purpose:** Database operations
- **Use When:** SQL queries, database management

### 7. **fetch** (Priority: 3)
- **Category:** Network
- **Capabilities:** http_get, http_post, api_calls
- **Purpose:** HTTP requests and API calls
- **Use When:** External API integration, web requests

### 8. **puppeteer** (Priority: 4)
- **Category:** Automation
- **Capabilities:** browser, scraping, testing
- **Purpose:** Browser automation
- **Use When:** Web scraping, UI testing, screenshots

### 9. **cloudflare** (Priority: 4)
- **Category:** Cloud
- **Capabilities:** dns, workers, kv
- **Purpose:** Cloudflare API integration
- **Use When:** DNS management, Workers deployment

## Predefined Combinations (Presets)

### **minimal**
```javascript
['filesystem']
```
**Use Case:** Simple file operations only  
**Performance:** Fastest, minimal overhead

### **basic**
```javascript
['filesystem', 'git']
```
**Use Case:** Basic development workflow  
**Performance:** Fast, low overhead

### **development** (Default)
```javascript
['heady-windsurf-router', 'filesystem', 'git', 'memory']
```
**Use Case:** Standard development with tracking  
**Performance:** Balanced, full observability

### **ai-enhanced**
```javascript
['heady-windsurf-router', 'filesystem', 'sequential-thinking', 'memory']
```
**Use Case:** AI-powered development and analysis  
**Performance:** Moderate, intelligent assistance

### **full-stack**
```javascript
['heady-windsurf-router', 'filesystem', 'git', 'sequential-thinking', 'memory', 'postgres']
```
**Use Case:** Complete full-stack development  
**Performance:** Comprehensive, all features

### **research**
```javascript
['heady-windsurf-router', 'fetch', 'sequential-thinking', 'memory']
```
**Use Case:** Research and data gathering  
**Performance:** Optimized for external data

### **automation**
```javascript
['heady-windsurf-router', 'filesystem', 'puppeteer', 'memory']
```
**Use Case:** Browser automation and testing  
**Performance:** Optimized for UI automation

### **cloud-deploy**
```javascript
['heady-windsurf-router', 'filesystem', 'git', 'cloudflare']
```
**Use Case:** Cloud deployment workflows  
**Performance:** Optimized for deployment

### **all**
```javascript
All 9 services
```
**Use Case:** Maximum capabilities  
**Performance:** Highest overhead, complete features

## Usage Examples

### CLI Commands

#### Using Presets:
```powershell
# Use development preset (default)
hb task "Build feature" --preset development

# Use AI-enhanced preset
hc "Analyze codebase" --preset ai-enhanced

# Use minimal preset for speed
heady exec "Read file" --preset minimal
```

#### Explicit Service Selection:
```powershell
# Select specific services
hb task "Deploy app" --services "filesystem,git,cloudflare"

# Single service
hc "List files" --services "filesystem"

# Custom combination
heady exec "Research topic" --services "fetch,sequential-thinking,memory"
```

#### Auto-Recommendation:
```powershell
# Let system recommend based on task
hb task "Create database schema and deploy"
# Automatically selects: filesystem, postgres, git, cloudflare
```

### JavaScript API

```javascript
const MCPServiceSelector = require('./src/mcp_service_selector');
const selector = new MCPServiceSelector(mcpManager);

// Use preset
const combo1 = selector.getCombination({ preset: 'development' });

// Explicit services
const combo2 = selector.getCombination({ 
  services: ['filesystem', 'git', 'memory'] 
});

// Auto-recommend
const combo3 = selector.getCombination({ 
  task: 'Build API with database and deploy to cloud' 
});
// Returns: {
//   services: ['heady-windsurf-router', 'filesystem', 'postgres', 'cloudflare'],
//   source: 'recommended',
//   reasoning: [...]
// }
```

### PowerShell API

```powershell
# Call MCP with specific services
$Body = @{
    method = "POST"
    path = "/api/tasks"
    body = @{
        instruction = "Deploy application"
        services = @("filesystem", "git", "cloudflare")
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3300/api/mcp/orchestrator" `
    -Method POST `
    -Body $Body `
    -ContentType "application/json"
```

## Service Selection Strategies

### By Capability

```javascript
// Get all services that can handle file operations
const fileServices = selector.getServicesByCapability('read');
// Returns: ['heady-windsurf-router', 'filesystem']

// Get all services for reasoning
const aiServices = selector.getServicesByCapability('reasoning');
// Returns: ['sequential-thinking']
```

### By Category

```javascript
// Get all data services
const dataServices = selector.getServicesByCategory('data');
// Returns: ['memory', 'postgres']

// Get all AI services
const aiServices = selector.getServicesByCategory('ai');
// Returns: ['sequential-thinking']
```

### Auto-Recommendation

```javascript
const recommendation = selector.recommendServices(
  'Analyze codebase, find bugs, and create database schema'
);

console.log(recommendation);
// {
//   services: ['heady-windsurf-router', 'filesystem', 'sequential-thinking', 'postgres'],
//   reasoning: [
//     'heady-windsurf-router: Full observability',
//     'filesystem: File operations detected',
//     'sequential-thinking: Complex analysis required',
//     'postgres: Database operations detected'
//   ],
//   preset: null
// }
```

## Validation

All service combinations are validated before execution:

```javascript
const validation = selector.validateCombination([
  'filesystem', 'git', 'nonexistent-service'
]);

console.log(validation);
// {
//   valid: false,
//   available: ['filesystem', 'git'],
//   missing: ['nonexistent-service'],
//   canProceed: true,
//   warnings: ['Missing services: nonexistent-service']
// }
```

## Performance Considerations

### Overhead by Service Count:
- **1-2 services:** ~5-10ms overhead
- **3-4 services:** ~10-15ms overhead
- **5+ services:** ~15-25ms overhead
- **All services:** ~25-35ms overhead

### Recommendations:
1. **Use minimal combinations** for simple operations
2. **Include heady-windsurf-router** for observability (worth the overhead)
3. **Use presets** for common workflows
4. **Let auto-recommend** suggest optimal combinations

## Environment Variables

```powershell
# Default preset
$env:HEADY_MCP_DEFAULT_PRESET = "development"

# Always include specific services
$env:HEADY_MCP_ALWAYS_INCLUDE = "heady-windsurf-router,filesystem"

# Disable auto-recommendation
$env:HEADY_MCP_AUTO_RECOMMEND = "false"
```

## Best Practices

### 1. **Always Include heady-windsurf-router**
```javascript
// Good
['heady-windsurf-router', 'filesystem', 'git']

// Missing observability
['filesystem', 'git']
```

### 2. **Use Presets for Common Tasks**
```javascript
// Good - clear intent
preset: 'development'

// Harder to maintain
services: ['heady-windsurf-router', 'filesystem', 'git', 'memory']
```

### 3. **Let Auto-Recommend for Complex Tasks**
```javascript
// Good - system optimizes
task: 'Build full-stack app with AI features'

// May miss optimal services
services: ['filesystem', 'git']
```

### 4. **Validate Before Critical Operations**
```javascript
const combo = selector.getCombination({ preset: 'full-stack' });
if (!combo.validation.valid) {
  console.warn('Missing services:', combo.validation.missing);
}
```

## API Reference

### List All Presets
```bash
curl http://localhost:3300/api/mcp/presets
```

### List All Services
```bash
curl http://localhost:3300/api/mcp/services
```

### Get Recommendation
```bash
curl -X POST http://localhost:3300/api/mcp/recommend \
  -H "Content-Type: application/json" \
  -d '{"task": "Deploy application with database"}'
```

### Validate Combination
```bash
curl -X POST http://localhost:3300/api/mcp/validate \
  -H "Content-Type: application/json" \
  -d '{"services": ["filesystem", "git", "postgres"]}'
```

## Conclusion

HeadyMCP services are **fully modular** - select any combination that fits your needs:
- ✅ **Independent services** - each works standalone
- ✅ **Flexible combinations** - mix and match freely
- ✅ **Predefined presets** - for common workflows
- ✅ **Auto-recommendation** - intelligent selection
- ✅ **Full validation** - ensures availability

**Choose the right combination for each task to optimize performance and capabilities.**
