# HC AUTOBUILD - Heady Connection Automated Build System

**Version:** 1.0.0  
**Status:** Production Ready  
**Purpose:** Intelligent autobuild and hybrid squash merge for Heady ecosystem

---

## OVERVIEW

HC AutoBuild is a comprehensive automated build system that combines:

- **Intelligent Build Orchestration** - Multi-phase build pipeline with MCP integration
- **Hybrid Squash Merge Protocol** - Smart codebase merging with conflict resolution
- **Story-Driven Reporting** - Checkpoint-based narrative generation
- **Sacred Geometry Integration** - Heady transformations and Context Vector logging

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                   HC AUTOBUILD CORE                     │
├─────────────────────────────────────────────────────────┤
│  Phase 1: ANALYZE    │  Codebase & dependency analysis  │
│  Phase 2: EXTRACT    │  Component extraction            │
│  Phase 3: MERGE      │  Intelligent squash merge        │
│  Phase 4: TEST       │  Comprehensive testing           │
│  Phase 5: DEPLOY     │  Multi-target deployment         │
├─────────────────────────────────────────────────────────┤
│              INTEGRATIONS & SERVICES                    │
├─────────────────────────────────────────────────────────┤
│  • HeadyHive MCP Orchestration                         │
│  • Story Driver & Checkpoint Reporter                  │
│  • Governance & Context Vector Logging                 │
│  • Git & Version Control Integration                   │
└─────────────────────────────────────────────────────────┘
```

---

## QUICK START

### Installation

```bash
# Navigate to Heady directory
cd c:\Users\erich\Heady

# Verify prerequisites
node --version  # Should be v18+
git --version   # Should be 2.0+

# Test HC AutoBuild
.\scripts\hc-autobuild.ps1 -Action help
```

### Basic Usage

```powershell
# Full autobuild cycle
.\scripts\hc-autobuild.ps1 -Action build

# Dry run (preview changes)
.\scripts\hc-autobuild.ps1 -Action build -DryRun

# Analyze only
.\scripts\hc-autobuild.ps1 -Action analyze -Verbose

# Intelligent merge
.\scripts\hc-autobuild.ps1 -Action merge

# Run tests
.\scripts\hc-autobuild.ps1 -Action test

# Deploy to staging
.\scripts\hc-autobuild.ps1 -Action deploy -Target staging
```

---

## BUILD PHASES

### Phase 1: ANALYZE

**Purpose:** Analyze codebase structure, dependencies, and compatibility

**Actions:**
- Scan repositories for merge candidates
- Analyze dependencies and versions
- Detect naming and API conflicts
- Check compatibility matrix
- Generate MCP-powered recommendations

**Output:**
- Analysis report (`audit_logs/autobuild/analysis_*.json`)
- Conflict matrix
- Compatibility recommendations

**Example:**
```powershell
.\scripts\hc-autobuild.ps1 -Action analyze
```

### Phase 2: EXTRACT

**Purpose:** Extract components from source repositories

**Actions:**
- Load extraction configuration
- Extract specified components
- Apply Heady transformations
  - Context Vector logging injection
  - Sacred Geometry styling
  - MCP integration hooks
- Validate extracted components

**Output:**
- Extracted components (`./extracted/`)
- Transformation report
- Error log for failed extractions

**Configuration:**
```json
{
  "extraction": {
    "sources": {
      "electron": {
        "window_management": {
          "files": ["app/browser/window.ts"],
          "purpose": "Multi-window support",
          "transform": "heady"
        }
      }
    }
  }
}
```

### Phase 3: MERGE

**Purpose:** Intelligent merge using hybrid squash protocol

**Actions:**
- Pre-merge validation
- Conflict detection and resolution
- Execute merge strategy (intelligent/force/safe)
- Squash commits with context
- Generate merge audit trail

**Merge Strategies:**

1. **Intelligent** (Default)
   - Auto-detects conflicts
   - AI-powered resolution suggestions
   - Preserves important history
   - Context-aware commit messages

2. **Force**
   - Overrides conflicts
   - Fast execution
   - Use with caution

3. **Safe**
   - Manual conflict resolution
   - Maximum safety
   - Slower execution

**Example:**
```powershell
# Intelligent merge with dry run
.\scripts\hc-autobuild.ps1 -Action merge -DryRun

# Force merge (use carefully)
.\scripts\hc-autobuild.ps1 -Action merge -Force
```

### Phase 4: TEST

**Purpose:** Run comprehensive test suite

**Test Suites:**
- **Unit Tests** - Component-level testing
- **Integration Tests** - Component interaction testing
- **E2E Tests** - End-to-end workflow testing

**Coverage:**
- Minimum threshold: 80%
- Reporters: text, lcov, html
- Fail-fast option available

**Example:**
```powershell
# Run all tests
.\scripts\hc-autobuild.ps1 -Action test

# Skip tests during build
.\scripts\hc-autobuild.ps1 -Action build -SkipTests
```

### Phase 5: DEPLOY

**Purpose:** Deploy merged application to target environment

**Deployment Targets:**
- **Production** - Render.com production environment
- **Staging** - Render.com staging environment
- **Development** - Local development server

**Actions:**
- Build artifacts
- Run pre-deployment checks
- Deploy to target platform
- Verify health endpoints
- Generate deployment report

**Example:**
```powershell
# Deploy to production
.\scripts\hc-autobuild.ps1 -Action deploy -Target production

# Deploy to staging
.\scripts\hc-autobuild.ps1 -Action deploy -Target staging
```

---

## CONFIGURATION

### Configuration File

Location: `c:\Users\erich\Heady\.hcautobuild.config.json`

### Key Configuration Sections

#### Build Configuration
```json
{
  "build": {
    "mode": "auto",
    "phases": ["analyze", "extract", "merge", "test", "deploy"],
    "skipPhases": [],
    "parallel": false,
    "timeout": 3600000
  }
}
```

#### Merge Configuration
```json
{
  "merge": {
    "strategy": "intelligent",
    "conflictResolution": "auto",
    "validationLevel": "strict",
    "preserveHistory": true,
    "squashCommits": true,
    "baseBranch": "main"
  }
}
```

#### MCP Integration
```json
{
  "mcp": {
    "enabled": true,
    "endpoint": "http://localhost:3100",
    "services": {
      "orchestrator": true,
      "architect": true,
      "optimizer": true,
      "conductor": true
    }
  }
}
```

#### Story Driver
```json
{
  "storyDriver": {
    "enabled": true,
    "checkpoints": ["pre-build", "post-analyze", "post-merge", "post-test", "post-build"],
    "outputDir": "./audit_logs/autobuild",
    "format": "markdown"
  }
}
```

---

## INTELLIGENT SQUASH MERGE PROTOCOL

### Overview

The Intelligent Squash Merge Protocol combines multiple codebases into a unified application using AI-powered analysis and automated conflict resolution.

### Merge Workflow

```
1. Pre-Merge Validation
   ├─ Check git status
   ├─ Verify dependencies
   └─ Run compatibility checks

2. Conflict Detection
   ├─ Naming conflicts
   ├─ API incompatibilities
   └─ Dependency version conflicts

3. Conflict Resolution
   ├─ Auto-resolve (AI-powered)
   ├─ Manual resolution (if required)
   └─ Skip (with warnings)

4. Merge Execution
   ├─ Create merge branch
   ├─ Apply component changes
   ├─ Generate context-aware commits
   └─ Squash commits (optional)

5. Post-Merge Validation
   ├─ Run tests
   ├─ Check build status
   └─ Generate audit trail
```

### Conflict Resolution Strategies

#### Auto-Resolution (Default)
- AI analyzes conflict context
- Suggests optimal resolution
- Applies resolution automatically
- Logs decision rationale

#### Manual Resolution
- Pauses merge process
- Presents conflict details
- Waits for user input
- Resumes after resolution

#### Skip Resolution
- Logs conflict as warning
- Continues merge process
- Marks for later review

---

## HEADY TRANSFORMATIONS

All extracted components undergo Heady transformations:

### 1. Context Vector Logging
```javascript
// Before
function createTask(title) {
  return { id: uuid(), title };
}

// After (Heady Transformed)
function createTask(title) {
  const contextVector = {
    technical: 'Task creation initiated',
    business: `Creating task: ${title}`,
    health: 'CALM'
  };
  logContextVector('task_created', contextVector);
  
  return { id: uuid(), title };
}
```

### 2. Sacred Geometry Styling
```css
/* Before */
.button {
  border-radius: 4px;
}

/* After (Heady Transformed) */
.button {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### 3. MCP Integration Hooks
```javascript
// Auto-injected MCP hooks
window.addEventListener('task_created', async (event) => {
  await fetch('http://localhost:3300/api/mcp/event', {
    method: 'POST',
    body: JSON.stringify(event.detail)
  });
});
```

---

## STORY DRIVER INTEGRATION

### Checkpoint System

HC AutoBuild generates comprehensive checkpoint reports at key stages:

- **Pre-Build** - System state before build
- **Post-Analyze** - Analysis results and recommendations
- **Post-Merge** - Merge status and conflicts resolved
- **Post-Test** - Test results and coverage
- **Post-Build** - Final build summary

### Report Format

Each checkpoint generates:
- **Markdown Report** - Human-readable summary
- **JSON Data** - Machine-readable metrics
- **Master Reference** - Comprehensive system snapshot

### Example Checkpoint Report

```markdown
# HEADY SYSTEM CHECKPOINT REPORT
**Checkpoint ID:** checkpoint_1738543200000
**Timestamp:** 2026-02-02T21:00:00Z

## EXECUTIVE SUMMARY
- Docker Containers: 9 running
- Health Status: 9/9 services healthy
- MCP Servers: 12 configured
- Git Status: ✓ Clean

## BUILD METRICS
- Phase: MERGE
- Duration: 4m 32s
- Conflicts Detected: 3
- Conflicts Resolved: 3
- Status: SUCCESS
```

---

## MCP ORCHESTRATION

### Integration Points

HC AutoBuild integrates with HeadyHive MCP services:

1. **Orchestrator** - Task submission and tracking
2. **Architect** - Code generation and analysis
3. **Optimizer** - Build optimization recommendations
4. **Conductor** - Resource allocation and scaling

### Task Submission

```javascript
// Automatic MCP task submission during analysis
const task = {
  instruction: 'Analyze compatibility between Electron, YJS, and Fabric.js',
  context: {
    repositories: ['electron', 'yjs', 'fabric'],
    phase: 'analyze'
  }
};

await submitToMCP(task);
```

### Response Handling

```javascript
// MCP response with recommendations
{
  "status": "completed",
  "recommendations": [
    "Use Electron 28.x for best compatibility",
    "Upgrade YJS to 13.6+ for performance",
    "Consider Fabric.js alternatives for lighter bundle"
  ],
  "conflicts": [
    {
      "type": "dependency",
      "package": "react",
      "resolution": "Use version 18.2.0"
    }
  ]
}
```

---

## GOVERNANCE & AUDIT

### Audit Trail

All build operations are logged to `lens_stream.json`:

```json
{
  "timestamp": "2026-02-02T21:45:00Z",
  "event": "COMPONENT_EXTRACTED",
  "context_vector": {
    "narrative_angles": {
      "technical": "Extracted window management from Electron",
      "business": "Enables multi-window task organization",
      "health": "CALM"
    }
  },
  "metadata": {
    "source": "electron",
    "component": "window_management",
    "files": 12,
    "loc": 3456
  }
}
```

### Compliance Checklist

- [ ] All extracted code properly attributed
- [ ] Heady transformations applied consistently
- [ ] Context Vector logging on all components
- [ ] MCP integration hooks present
- [ ] Sacred Geometry styling applied to UI
- [ ] Story Driver narratives generated
- [ ] Tests passing (unit + integration)
- [ ] Build artifacts generated

---

## TROUBLESHOOTING

### Common Issues

#### Build Fails at Analysis Phase
```
Error: No repositories detected for merge
```
**Solution:** Ensure repositories are in expected locations or specify custom paths in config

#### Merge Conflicts Not Auto-Resolved
```
Error: Manual conflict resolution required
```
**Solution:** Set `conflictResolution: "auto"` in config or resolve manually

#### MCP Services Unavailable
```
Warning: MCP recommendations unavailable
```
**Solution:** Start HeadyHive services with `hb swarm start`

#### Tests Failing
```
Error: 5 tests failed
```
**Solution:** Review test output, fix issues, or use `-SkipTests` flag

### Debug Mode

Enable verbose logging:
```powershell
.\scripts\hc-autobuild.ps1 -Action build -Verbose
```

Enable dry-run mode:
```powershell
.\scripts\hc-autobuild.ps1 -Action build -DryRun
```

---

## ADVANCED USAGE

### Custom Extraction Configuration

Create custom extraction config:

```json
{
  "sources": {
    "my-repo": {
      "my-component": {
        "files": ["src/components/MyComponent.tsx"],
        "purpose": "Custom component for Heady",
        "transform": "heady"
      }
    }
  }
}
```

Load custom config:
```powershell
.\scripts\hc-autobuild.ps1 -Action build -Config .\my-config.json
```

### Programmatic Usage

```javascript
const HCAutoBuild = require('./src/hc_autobuild');

const autobuild = new HCAutoBuild({
  mode: 'auto',
  verbose: true,
  mcpEnabled: true
});

await autobuild.execute({
  phases: ['analyze', 'merge'],
  skipTests: true
});
```

### Custom Phase Implementation

```javascript
class CustomAutoBuild extends HCAutoBuild {
  async phaseCustom(options) {
    this.log('Running custom phase...', 'info');
    // Custom logic here
    return { status: 'success' };
  }
}
```

---

## API REFERENCE

### HCAutoBuild Class

#### Constructor
```javascript
new HCAutoBuild(config)
```

**Parameters:**
- `config.rootDir` - Root directory (default: `process.cwd()`)
- `config.mode` - Build mode: `auto`, `manual`, `hybrid`
- `config.verbose` - Enable verbose logging
- `config.dryRun` - Preview mode (no changes)
- `config.mcpEnabled` - Enable MCP integration
- `config.storyDriver` - Enable Story Driver

#### Methods

##### execute(options)
Execute full autobuild cycle
```javascript
await autobuild.execute({
  phases: ['analyze', 'merge', 'test'],
  skipTests: false
});
```

##### executePhase(phase, options)
Execute single phase
```javascript
await autobuild.executePhase('analyze', { verbose: true });
```

##### getBuildSummary()
Get build summary
```javascript
const summary = autobuild.getBuildSummary();
// { status: 'completed', duration: 45000, phases: 5, errors: 0 }
```

---

## SUCCESS METRICS

### Build Quality
- Component extraction success rate: **Target 100%**
- Conflict resolution time: **< 2 hours per conflict**
- Test coverage: **> 80%**

### Heady Integration
- Context Vector completeness: **100% of events**
- Story Driver narrative accuracy: **> 90%**
- MCP protocol success rate: **> 95%**

### Performance
- Build time: **< 10 minutes**
- Application startup: **< 3 seconds**
- Memory footprint: **< 500MB idle**

---

## ROADMAP

### Version 1.1 (Planned)
- [ ] Multi-repository parallel processing
- [ ] AI-powered code generation
- [ ] Visual merge conflict resolver
- [ ] Real-time build progress UI

### Version 1.2 (Planned)
- [ ] Cloud-based build execution
- [ ] Distributed testing
- [ ] Advanced analytics dashboard
- [ ] Plugin system for custom phases

---

## SUPPORT

### Documentation
- Main Guide: `docs/HC_AUTOBUILD_GUIDE.md`
- Squash Merge Protocol: `docs/INTELLIGENT_SQUASH_MERGE_PROTOCOL.md`
- Checkpoint System: `docs/CHECKPOINT_SYSTEM.md`

### Logs
- Build Reports: `audit_logs/autobuild/`
- Checkpoint Reports: `audit_logs/checkpoint_*.md`
- Governance Logs: `shared/state/lens_stream.json`

### Community
- GitHub Issues: Report bugs and feature requests
- Heady Discord: Real-time support and discussions

---

**Status:** Production Ready  
**Last Updated:** 2026-02-02  
**Maintained By:** Heady Systems Team
