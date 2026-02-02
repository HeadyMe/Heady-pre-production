# Heady Squash Merge Protocol

## Overview

The **Heady Squash Merge System** is an intelligent multi-codebase merger that automatically combines multiple source repositories with weighted distribution into a single, functional Heady application. It leverages the full Heady Systems infrastructure including HeadyAcademy agents for conflict resolution and optimization.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  USER INPUT                                 │
│  • Source Codebases (paths)                                 │
│  • Distribution Weights (0.0 - 1.0)                         │
│  • Metadata (names, priorities)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           PHASE 1: ANALYSIS                                 │
│  • Scan directory structures                                │
│  • Identify languages & frameworks                          │
│  • Extract dependencies                                     │
│  • Calculate file importance                                │
│  • Categorize file types                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           PHASE 2: STRATEGY                                 │
│  • Identify file conflicts                                  │
│  • Build resolution plan                                    │
│  • Determine merge order                                    │
│  • Assign HeadyAcademy agents                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           PHASE 3: MERGE EXECUTION                          │
│  • Create base structure                                    │
│  • Merge files by weight priority                           │
│  • Resolve conflicts (auto + agent)                         │
│  • Merge dependencies                                       │
│  • Generate artifacts                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           PHASE 4: VALIDATION                               │
│  • Syntax validation                                        │
│  • Structure validation                                     │
│  • Dependency validation                                    │
│  • Agent review (MURPHY, JULES)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           OUTPUT                                            │
│  • Merged Heady Application                                 │
│  • Merge Report (JSON)                                      │
│  • Audit Log (JSONL)                                        │
│  • Validation Results                                       │
└─────────────────────────────────────────────────────────────┘
```

## Weight Distribution System

### How Weights Work

Weights determine the priority of each source codebase during merge conflicts:

- **Range:** 0.0 to 1.0
- **Normalization:** Weights are automatically normalized to sum to 1.0
- **Priority:** Higher weight = higher priority in conflicts

### Example Weight Scenarios

#### Scenario 1: Primary + Secondary Codebases
```json
{
  "sources": [
    { "path": "./primary-app", "weight": 0.7, "name": "Primary Application" },
    { "path": "./feature-branch", "weight": 0.3, "name": "New Features" }
  ]
}
```
**Result:** Primary app takes precedence, but new features are integrated where no conflicts exist.

#### Scenario 2: Equal Merge
```json
{
  "sources": [
    { "path": "./codebase-a", "weight": 0.5, "name": "Codebase A" },
    { "path": "./codebase-b", "weight": 0.5, "name": "Codebase B" }
  ]
}
```
**Result:** Conflicts resolved by file importance and agent analysis.

#### Scenario 3: Multi-Source Integration
```json
{
  "sources": [
    { "path": "./core-system", "weight": 0.5, "name": "Core System" },
    { "path": "./ui-components", "weight": 0.3, "name": "UI Components" },
    { "path": "./utilities", "weight": 0.15, "name": "Utilities" },
    { "path": "./docs", "weight": 0.05, "name": "Documentation" }
  ]
}
```
**Result:** Core system dominates, UI components integrated, utilities and docs fill gaps.

## Conflict Resolution Strategies

### Automatic Resolution

The system automatically resolves conflicts using these strategies:

#### 1. Highest Weight
- **When:** Clear weight difference (>30%)
- **Action:** Use file from highest-weight source
- **Example:** Primary codebase (0.7) vs. feature branch (0.3)

#### 2. Highest Importance
- **When:** Similar weights but different file importance
- **Action:** Use file with highest calculated importance
- **Importance Factors:**
  - Critical files (package.json, README.md): +0.4
  - Entry points (index.js, main.py): +0.2
  - Core directories (src/, lib/): +0.15
  - Configuration (config/): +0.1

#### 3. Merge Content
- **When:** Configuration files (.json, .yaml, .env)
- **Action:** Intelligently merge content
- **Agent:** FOREMAN (Consolidator)
- **Process:**
  - Parse both versions
  - Merge non-conflicting keys
  - Use weight for conflicting keys
  - Validate merged result

#### 4. Newest Version
- **When:** Timestamps available and weights equal
- **Action:** Use most recently modified file

### Agent-Assisted Resolution

Complex conflicts are delegated to HeadyAcademy agents:

#### FOREMAN (The Consolidator)
- **Role:** Merge complex code files
- **Expertise:** Content consolidation, dependency resolution
- **Invoked For:** Code files with similar weights, configuration merges

#### JULES (The Hyper-Surgeon)
- **Role:** Optimize merged code
- **Expertise:** Code quality, performance optimization
- **Invoked For:** Post-merge optimization

#### MURPHY (The Inspector)
- **Role:** Security validation
- **Expertise:** Security audits, vulnerability scanning
- **Invoked For:** Validation phase security checks

## File Type Handling

### Configuration Files
- **Strategy:** Merge content
- **Files:** package.json, requirements.txt, docker-compose.yml, .env
- **Process:**
  - Parse both versions
  - Merge dependencies (highest weight wins for conflicts)
  - Combine scripts and configurations
  - Validate syntax

### Code Files
- **Strategy:** Highest weight or importance
- **Files:** .js, .ts, .py, .java, .go, .rs
- **Process:**
  - Compare file hashes
  - If identical, use one copy
  - If different, apply weight-based resolution
  - Invoke FOREMAN for complex merges

### Documentation
- **Strategy:** Highest weight
- **Files:** .md, .txt, .rst
- **Process:**
  - Use highest-weight version
  - Optionally combine if complementary

### Static Assets
- **Strategy:** Collect all unique assets
- **Files:** Images, fonts, media
- **Process:**
  - Copy all unique assets
  - Use highest-weight for duplicates

## Usage

### Interactive Mode

```powershell
cd c:\Users\erich\Heady
.\scripts\heady-merge.ps1 -Interactive
```

Follow the prompts to:
1. Specify output directory
2. Add source codebases with weights
3. Assign friendly names
4. Review configuration
5. Execute merge

### Configuration File Mode

Create `merge-config.json`:
```json
{
  "sources": [
    {
      "path": "c:/Users/erich/Heady",
      "weight": 0.6,
      "name": "Heady Core",
      "metadata": {
        "type": "core",
        "priority": "critical"
      }
    },
    {
      "path": "c:/Users/erich/Projects/HeadySystems",
      "weight": 0.3,
      "name": "HeadySystems Services",
      "metadata": {
        "type": "services",
        "priority": "high"
      }
    },
    {
      "path": "c:/Users/erich/Projects/apps/hive",
      "weight": 0.1,
      "name": "Hive Orchestration",
      "metadata": {
        "type": "orchestration",
        "priority": "medium"
      }
    }
  ],
  "outputDir": "./heady-unified-app"
}
```

Execute:
```powershell
.\scripts\heady-merge.ps1 -ConfigFile merge-config.json
```

### Programmatic Usage

```javascript
const HeadySquashMerge = require('./src/heady_squash_merge');

const merger = new HeadySquashMerge({
  outputDir: './merged-output',
  tempDir: './.merge-temp',
  auditLog: './audit_logs/merge.jsonl'
});

// Add sources
merger.addSource('./source1', 0.6, { name: 'Primary Codebase' });
merger.addSource('./source2', 0.3, { name: 'Feature Branch' });
merger.addSource('./source3', 0.1, { name: 'Utilities' });

// Execute merge
const result = await merger.execute();

console.log('Success:', result.success);
console.log('Output:', result.outputPath);
console.log('Report:', result.report);
```

## Output Structure

### Merged Application
```
heady-merged-output/
├── src/                    # Merged source code
├── config/                 # Merged configurations
├── public/                 # Merged static assets
├── docs/                   # Merged documentation
├── scripts/                # Merged scripts
├── tests/                  # Merged tests
├── package.json            # Merged dependencies
├── requirements.txt        # Merged Python deps (if applicable)
├── docker-compose.yml      # Merged Docker config (if applicable)
├── README.md               # Generated README
└── MERGE_REPORT.json       # Detailed merge report
```

### Merge Report

```json
{
  "mergeId": "a1b2c3d4e5f6g7h8",
  "timestamp": "2026-02-02T21:30:00Z",
  "sources": [
    {
      "name": "Heady Core",
      "weight": 0.6,
      "files": 245,
      "frameworks": ["Express", "React"]
    },
    {
      "name": "HeadySystems Services",
      "weight": 0.3,
      "files": 156,
      "frameworks": ["FastAPI", "Docker"]
    }
  ],
  "conflicts": 42,
  "resolutions": 42,
  "validation": {
    "syntaxCheck": { "passed": true, "errors": [] },
    "structureCheck": { "passed": true, "missing": [] },
    "dependencyCheck": { "passed": true, "dependencies": 87 }
  },
  "outputPath": "./heady-unified-app"
}
```

### Audit Log

Each line in `audit_logs/squash_merge.jsonl`:
```json
{
  "timestamp": "2026-02-02T21:30:15Z",
  "mergeId": "a1b2c3d4e5f6g7h8",
  "event": "conflict_resolved",
  "data": {
    "path": "src/index.js",
    "strategy": "highest_weight",
    "selectedSource": "Heady Core"
  }
}
```

## Validation

### Syntax Validation
- **JSON files:** Parse and validate structure
- **YAML files:** Parse and validate syntax
- **JavaScript/TypeScript:** Optional ESLint check
- **Python:** Optional pylint check

### Structure Validation
- **Required files:** package.json, src/, README.md
- **Directory structure:** Proper organization
- **Entry points:** Valid main files

### Dependency Validation
- **NPM:** Valid package.json with resolvable dependencies
- **Python:** Valid requirements.txt
- **Docker:** Valid docker-compose.yml (if present)

### Agent Validation
- **MURPHY:** Security audit using Semgrep
- **JULES:** Code quality optimization

## Best Practices

### Weight Assignment

1. **Primary Codebase:** 0.5 - 0.7
   - Your main, production-ready code
   - Highest trust and stability

2. **Feature Branches:** 0.2 - 0.4
   - New features to integrate
   - Tested but not production-proven

3. **Utilities/Libraries:** 0.05 - 0.15
   - Helper functions and tools
   - Fill gaps in primary codebase

4. **Documentation:** 0.01 - 0.05
   - Supplementary docs
   - Lowest conflict priority

### Pre-Merge Checklist

- [ ] All source paths are accessible
- [ ] Weights sum to reasonable distribution
- [ ] Backup original codebases
- [ ] Review expected conflicts
- [ ] Ensure sufficient disk space
- [ ] Set appropriate output directory

### Post-Merge Checklist

- [ ] Review merge report
- [ ] Check audit log for issues
- [ ] Run validation tests
- [ ] Review resolved conflicts
- [ ] Test merged application
- [ ] Update documentation
- [ ] Commit to version control

## Integration with Heady Systems

### HeadyRegistry Router

The merge system integrates with HeadyRegistry Router:

```javascript
const WindsurfHeadyBridge = require('./src/windsurf_heady_bridge');
const bridge = new WindsurfHeadyBridge();

// Route merge request through Heady infrastructure
const routing = await bridge.interceptRequest(
  "Merge HeadyCore and HeadySystems with 60/40 distribution"
);

if (routing.shouldDelegate) {
  // Execute through Heady agents
  await routing.execute();
}
```

### HeadyAcademy Integration

Agents are automatically invoked during merge:

- **Analysis Phase:** NOVA (Gap Scanner) identifies missing components
- **Strategy Phase:** SASHA (Dreamer) suggests optimal merge strategies
- **Merge Phase:** FOREMAN (Consolidator) resolves complex conflicts
- **Optimization Phase:** JULES (Hyper-Surgeon) optimizes merged code
- **Validation Phase:** MURPHY (Inspector) performs security audit

### HeadyChain Audit

All merge operations are logged to HeadyChain:

- Source additions
- Conflict identifications
- Resolution decisions
- Agent invocations
- Validation results

## Troubleshooting

### Common Issues

#### Issue: "Source path does not exist"
**Solution:** Verify all paths are absolute and accessible

#### Issue: "Merge validation failed"
**Solution:** Check validation report for specific errors, fix syntax issues

#### Issue: "Too many conflicts"
**Solution:** Adjust weights to give clearer priority, or merge in stages

#### Issue: "Dependency conflicts"
**Solution:** Manually review package.json, resolve version conflicts

### Debug Mode

Enable verbose logging:
```javascript
const merger = new HeadySquashMerge({
  debug: true,
  logLevel: 'verbose'
});
```

### Recovery

If merge fails mid-process:
1. Check audit log for last successful step
2. Review temp directory for partial results
3. Adjust configuration and retry
4. Use `-Analyze` flag to preview without executing

## Advanced Features

### Custom Resolution Strategies

```javascript
merger.addResolutionStrategy('custom', (conflict) => {
  // Custom logic
  return selectedSource;
});
```

### Agent Configuration

```javascript
merger.configureAgent('FOREMAN', {
  maxComplexity: 100,
  timeout: 30000,
  fallbackStrategy: 'highest_weight'
});
```

### Incremental Merging

```javascript
// Merge in stages
await merger.mergePhase1(); // Core
await merger.mergePhase2(); // Features
await merger.mergePhase3(); // Utilities
```

## Future Enhancements

1. **ML-Based Conflict Resolution:** Train model on historical merge decisions
2. **Real-Time Collaboration:** Multiple users can review conflicts
3. **Rollback Support:** Undo specific merge decisions
4. **Diff Visualization:** Visual diff tool for conflicts
5. **Automated Testing:** Run test suites on merged output
6. **CI/CD Integration:** GitHub Actions workflow for automated merges

## Conclusion

The Heady Squash Merge Protocol provides an intelligent, automated way to combine multiple codebases into a unified Heady application. By leveraging weight distribution, HeadyAcademy agents, and comprehensive validation, it ensures high-quality merges with minimal manual intervention.

**Key Benefits:**
- ✅ Automated conflict resolution
- ✅ Intelligent weight-based prioritization
- ✅ HeadyAcademy agent integration
- ✅ Comprehensive audit trail
- ✅ Validation and quality checks
- ✅ Flexible configuration
- ✅ Production-ready output
