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
<!-- ║  FILE: .windsurf/workflows/codemap-optimization.md                ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: Codemap optimization via Heady cloud orchestration APIs
---

# Codemap Optimization Workflow

## Overview
Runs codemap optimization as a cloud-native orchestration workload using branded Heady APIs.

## Node Registry

### 🧠 JULES - The Hyper-Surgeon
- **Role**: Code optimization and analysis
- **Execution**: Orchestrator goal `optimize-code`
- **Capabilities**:
  - Unused import detection
  - Code quality analysis
  - Performance optimization suggestions
  - Security vulnerability scanning

### 👁️ OBSERVER - The Natural Observer
- **Role**: Enhanced monitoring and performance analysis
- **Execution**: Orchestrator goal `monitor-performance`
- **Capabilities**:
  - Real-time system analysis
  - Service and pipeline monitoring
  - Performance metrics collection
  - Optimization opportunity detection

### 🔨 BUILDER - The Constructor
- **Role**: Project optimization and cleanup
- **Execution**: Orchestrator goal `optimize-build`
- **Capabilities**:
  - Build optimization
  - Dependency management
  - Resource cleanup
  - Project structure optimization

### 📚 ATLAS - The Auto-Archivist
- **Role**: Documentation generation and maintenance
- **Execution**: Orchestrator goal `refresh-docs`
- **Capabilities**:
  - Automatic documentation generation
  - API documentation extraction
  - Code analysis and documentation
  - Knowledge base creation

## Workflow Phases

### Phase 1: Node Activation
```bash
# Activate codemap workload across all optimization nodes
curl -sf -X POST https://headysystems.com/api/v1/orchestrator/execute-many \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"goals":["optimize-code","monitor-performance","optimize-build","refresh-docs"]}'
```

### Phase 2: Analysis & Optimization
1. **JULES Analysis**: Code quality and optimization
2. **OBSERVER Monitoring**: Performance and resource analysis
3. **BUILDER Optimization**: Project structure and dependencies
4. **ATLAS Documentation**: Automatic documentation generation

### Phase 3: Enhanced Scoring
- Base functionality score: 100 points
- Codemap enhancements: up to 40 points
  - Code quality: up to 10 points
  - Documentation: up to 10 points
  - Performance: up to 10 points
  - Security: up to 10 points

### Phase 4: Intelligent Checkpointing
- Enhanced checkpoints include codemap analysis
- Automatic optimization suggestions
- Performance metrics tracking
- Documentation status reporting

## Integration with HCAutoBuild

### Enhanced Commands
```bash
# Run enhanced HCAutoBuild with codemap optimization
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'

# Run codemap optimization only
curl -sf -X POST https://headysystems.com/api/v1/orchestrator/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"goal":"optimize-code"}'

# Enhanced monitoring with codemap integration
curl -sf https://headysystems.com/api/v1/orchestrator/state
```

### Configuration
```json
{
  "codemap_nodes": ["JULES", "OBSERVER", "BUILDER", "ATLAS"],
  "optimization_interval": 3600,
  "auto_optimize": true,
  "node_timeout": 300,
  "parallel_execution": true
}
```

## Optimization Reports

### JULES Reports
- Location: `.heady/logs/optimization_reports/`
- Format: Markdown with code suggestions
- Content: Unused imports, long lines, TODOs, magic numbers

### OBSERVER Reports
- Location: `.heady/observer_reports/`
- Format: JSON with detailed metrics
- Content: File counts, sizes, language distribution, activity

### BUILDER Reports
- Location: `.heady/builder_reports/`
- Format: JSON with optimization suggestions
- Content: Build optimizations, cleanup opportunities

### ATLAS Reports
- Location: `.heady/atlas_reports/`
- Format: JSON with documentation analysis
- Content: API docs, dependencies, existing documentation

## Performance Benefits

### Code Quality Improvements
- Automatic detection of code issues
- Performance optimization suggestions
- Security vulnerability identification
- Best practices enforcement

### Enhanced Monitoring
- Real-time performance metrics
- Resource usage optimization
- File system efficiency analysis
- Automated cleanup suggestions

### Documentation Automation
- Automatic API documentation
- Code structure analysis
- Knowledge base generation
- Documentation maintenance

### Intelligent Checkpointing
- Enhanced functionality scoring
- Optimization-aware checkpoints
- Performance tracking
- Automated improvement suggestions

## Usage Examples

### Basic Optimization
```bash
# Run full codemap optimization
curl -sf -X POST https://headysystems.com/api/v1/orchestrator/execute-many \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"goals":["optimize-code","monitor-performance","optimize-build","refresh-docs"]}'

# Run specific node
curl -sf -X POST https://headysystems.com/api/v1/orchestrator/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"goal":"optimize-code"}'
```

### Enhanced HCAutoBuild
```bash
# Run HCAutoBuild with optimization
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'

# Enhanced monitoring
curl -sf https://headycloud.com/api/pipeline/state

# Force enhanced checkpoint
curl -sf -X POST https://headysystems.com/api/v1/orchestrator/execute-many \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"goals":["optimize-code","refresh-docs"]}'
```

### Analysis Mode
```bash
# Run analysis nodes only
curl -sf -X POST https://headysystems.com/api/pipeline/claude/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"paths":["src/","configs/"]}'

# Specific analysis
curl -sf -X POST https://headysystems.com/api/pipeline/claude/security \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

## Troubleshooting

### Common Issues
1. **Python not available**: JULES requires Python for optimization
2. **Authorization missing**: Ensure `HEADY_API_KEY` is set
3. **Service unavailable**: Verify `https://headysystems.com/api/health`
4. **Node timeout**: Increase NodeTimeout in configuration

### Debug Mode
```bash
# Run with debug output
curl -sv https://headysystems.com/api/v1/orchestrator/state
curl -sv https://headycloud.com/api/pipeline/state
```

### Log Files
- Pipeline state: `https://headycloud.com/api/pipeline/state`
- Pipeline history: `https://headycloud.com/api/pipeline/history`
- Orchestrator history: `https://headysystems.com/api/v1/orchestrator/history`

## Best Practices

### Optimization Frequency
- Run JULES optimization after code changes
- Use OBSERVER monitoring for long-running projects
- Run BUILDER optimization before deployments
- Use ATLAS documentation for API changes

### Integration Strategy
1. Start with basic HCAutoBuild functionality
2. Gradually integrate codemap nodes
3. Monitor performance improvements
4. Adjust configuration based on results

### Performance Considerations
- Codemap optimization increases analysis time
- Parallel execution improves performance
- Caching results reduces redundant work
- Monitor resource usage during optimization

## Future Enhancements

### Additional Nodes
- **MURPHY**: Security auditing integration
- **SOPHIA**: Machine learning optimization
- **CIPHER**: Code obfuscation and protection
- **SCOUT**: GitHub integration and analysis

### Advanced Features
- Predictive optimization
- Machine learning integration
- Advanced performance profiling
- Automated code refactoring

### Integration Opportunities
- CI/CD pipeline integration
- IDE plugin development
- Real-time code analysis
- Cloud-based optimization services

## Configuration Reference

### Node Configuration
```yaml
nodes:
  JULES:
    enabled: true
    timeout: 300
    parallel: true
    priority: high
  OBSERVER:
    enabled: true
    interval: 300
    metrics: ["performance", "size", "activity"]
  BUILDER:
    enabled: true
    cleanup: true
    optimize_dependencies: true
  ATLAS:
    enabled: true
    auto_generate: true
    format: ["markdown", "json"]
```

### API Authentication
```bash
HEADY_API_KEY=<required-token>
```

### Optimization Rules
```yaml
optimization_rules:
  code_quality:
    max_line_length: 120
    check_unused_imports: true
    detect_magic_numbers: true
  performance:
    max_file_size: 10MB
    check_memory_usage: true
    analyze_dependencies: true
  documentation:
    require_api_docs: true
    generate_readme: true
    update_changelog: true
```

---

**Codemap Optimization transforms HCAutoBuild into an intelligent, AI-powered system that continuously improves code quality, performance, and maintainability.**
