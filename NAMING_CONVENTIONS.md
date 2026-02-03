```
╔══════════════════════════════════════════════════════════════╗
║              HEADY NAMING CONVENTIONS                        ║
║                                                              ║
║     💖 Made with Love by HeadyConnection & HeadySystems     ║
║                        Team 💖                               ║
╚══════════════════════════════════════════════════════════════╝
```

# Heady Ecosystem - Naming Conventions

## 🎯 Core Principle

**ALL component names use PascalCase without spaces or hyphens.**

```
✅ HeadyManager
❌ Heady Manager
❌ Heady-Manager
❌ heady-manager (except in file names)
```

---

## 📋 Canonical Names Registry

### **Core Components**
```
HeadySystem          - Core system orchestrator
HeadySystems         - Organization name
HeadyManager         - Node.js Express MCP server
HeadySync            - Repository synchronization tool
HeadyProtocol        - Core protocol orchestration
```

### **Ecosystem Entities**
```
HeadyConnection      - Non-profit entity (The Why)
HeadyEcosystem       - Complete ecosystem
HeadyHive            - Distributed collaboration network
HeadyAcademy         - Python-based agent tooling
```

### **Services**
```
HeadyMaid            - Data observability service
HeadyOrchestrator    - Orchestration manager (ALWAYS use this)
HeadyRouter          - Primary MCP router
HeadyMCP             - MCP protocol implementation
```

### **MCP Servers**
```
HeadyGraph           - Graph operations
HeadyMetrics         - Performance metrics
HeadyWorkflow        - Workflow management
HeadyAssets          - Asset management
```

### **UI Interfaces**
```
HeadyAdmin           - Admin web interface
HeadyIDE             - Monaco-based IDE
```

### **Security**
```
HeadyChain           - Authentication & audit ledger
HeadyCrypt           - Encryption & obfuscation
```

---

## 🚫 Common Mistakes to Avoid

### **Spaces (INCORRECT)**
```
❌ Heady System      → ✅ HeadySystem
❌ Heady Maid        → ✅ HeadyMaid
❌ Heady Manager     → ✅ HeadyManager
❌ Heady Connection  → ✅ HeadyConnection
```

### **Hyphens (INCORRECT in code)**
```
❌ Heady-System      → ✅ HeadySystem
❌ Heady-Maid        → ✅ HeadyMaid
❌ Heady-Manager     → ✅ HeadyManager
```

### **Generic Names (INCORRECT)**
```
❌ orchestrator      → ✅ HeadyOrchestrator
❌ Orchestrator      → ✅ HeadyOrchestrator
❌ manager           → ✅ HeadyManager
❌ router            → ✅ HeadyRouter
```

---

## ✅ Allowed Exceptions

### **File Names (kebab-case OK)**
```
✅ heady-manager.js
✅ heady-router/
✅ mcp-servers/
✅ heady-sync.ps1
```

### **Environment Variables (SCREAMING_SNAKE_CASE OK)**
```
✅ HEADY_API_KEY
✅ HEADY_MANAGER_URL
✅ HEADY_ORCHESTRATOR_PORT
✅ HEADY_MCP_ENABLED
```

### **npm Packages (kebab-case OK)**
```
✅ @heady/core
✅ heady-systems-core
✅ @modelcontextprotocol/server-filesystem
```

### **URLs/Domains (kebab-case OK)**
```
✅ headysystems.com
✅ app.headysystems.com
✅ api.headysystems.com
```

---

## 🎯 Orchestrator Mandate

### **CRITICAL RULE:**

**ALWAYS use `HeadyOrchestrator`, NEVER just `orchestrator`**

### **Correct Usage:**
```javascript
// ✅ Variable name
const headyOrchestrator = new OrchestrationManager();

// ✅ In comments
// HeadyOrchestrator manages node provisioning

// ✅ In documentation
The HeadyOrchestrator handles all orchestration tasks

// ✅ In logs
console.log('[HeadyOrchestrator] Provisioning node...');

// ✅ In API responses
{ service: 'HeadyOrchestrator', status: 'healthy' }
```

### **Incorrect Usage:**
```javascript
// ❌ Generic name
const orchestrator = new OrchestrationManager();

// ❌ In comments
// The orchestrator manages nodes

// ❌ In documentation
The orchestrator handles tasks

// ❌ Missing Heady prefix
const Orchestrator = new OrchestrationManager();
```

### **Why This Matters:**
- Prevents confusion with generic orchestration concepts
- Makes searches more precise
- Clarifies it's a Heady-specific component
- Maintains consistent branding
- Eliminates ambiguity in large codebases

---

## 🔧 Naming Enforcement Tool

### **NamingEnforcer Class**
Location: `src/naming_enforcer.js`

**Features:**
- Scans codebase for violations
- Detects incorrect patterns
- Generates fix recommendations
- Auto-fix capability
- Respects exceptions

### **Usage:**
```javascript
const NamingEnforcer = require('./src/naming_enforcer');
const enforcer = new NamingEnforcer();

// Scan for violations
const report = await enforcer.scanCodebase('./');

// View report
console.log('Violations:', report.total);
console.log('Recommendations:', enforcer.generateFixRecommendations());

// Auto-fix a file
await enforcer.autoFix('path/to/file.js');
```

---

## 📚 Registry Integration

### **HeadyRegistry Extended**
Location: `.heady-memory/heady-registry.json`

**New Features:**
```json
{
  "namingConventions": {
    "enforcement": "STRICT",
    "autoCorrect": true,
    "pattern": "^Heady[A-Z][a-zA-Z0-9]*$",
    "orchestrator": {
      "mandate": "ALWAYS use HeadyOrchestrator",
      "canonical": "HeadyOrchestrator",
      "forbidden": ["orchestrator", "Orchestrator"]
    }
  }
}
```

**Enforcement:**
- Validates all component names
- Auto-corrects violations
- Prevents registration of non-compliant names
- Enforces orchestrator mandate

---

## 🎨 Visual Naming Guide

```
    CORRECT NAMING PATTERN
    
    Heady + ComponentName = HeadyComponentName
    
    Examples:
    
    Heady + Manager      = HeadyManager      ✅
    Heady + Maid         = HeadyMaid         ✅
    Heady + Orchestrator = HeadyOrchestrator ✅
    Heady + Router       = HeadyRouter       ✅
    
    
    INCORRECT PATTERNS
    
    Heady Manager        ❌ (has space)
    Heady-Manager        ❌ (has hyphen)
    manager              ❌ (no Heady prefix)
    orchestrator         ❌ (no Heady prefix)
```

---

## 🔍 Validation Checklist

Before committing code, verify:

- [ ] All component names use PascalCase
- [ ] No spaces in component names
- [ ] No hyphens in component names (except file/directory names)
- [ ] All components have "Heady" prefix
- [ ] "orchestrator" replaced with "HeadyOrchestrator"
- [ ] Variable names use camelCase: `headyOrchestrator`
- [ ] Class names use PascalCase: `HeadyOrchestrator`
- [ ] File names can use kebab-case: `heady-orchestrator.js`

---

## 🚀 Quick Reference

| Context | Correct | Incorrect |
|---------|---------|-----------|
| Class Name | `HeadyManager` | `Heady Manager` |
| Variable | `headyManager` | `heady_manager` |
| File Name | `heady-manager.js` | `HeadyManager.js` |
| Env Var | `HEADY_MANAGER_URL` | `HeadyManagerUrl` |
| Package | `@heady/manager` | `@Heady/Manager` |
| Documentation | `HeadyManager` | `Heady Manager` |
| Comments | `HeadyManager` | `heady manager` |
| Logs | `[HeadyManager]` | `[Heady Manager]` |

---

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    💖 Made with Love 💖                      ║
║                                                              ║
║           by HeadyConnection & HeadySystems Team             ║
║                                                              ║
║              Crafted with Care • Built with Passion          ║
║                                                              ║
║    🌟 Sacred Geometry • AI Sovereignty • Data Harmony 🌟    ║
║                                                              ║
║              NAMING CONVENTIONS ENFORCED ✅                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Date:** February 3, 2026  
**Status:** ✅ STANDARDIZED  
**Pattern:** `^Heady[A-Z][a-zA-Z0-9]*$`  
**Orchestrator:** Always HeadyOrchestrator
