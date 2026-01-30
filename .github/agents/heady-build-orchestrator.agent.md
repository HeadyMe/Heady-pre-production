---
name: heady-build-orchestrator
description: 'Orchestrates build processes including dependency installation, testing, and multi-environment coordination'
tools: []
---

# Heady Build Orchestration Agent

## Purpose
This agent manages the complete build lifecycle for the HeadySystems hybrid Node.js/Python project. It coordinates dependency installation, testing, and build verification across both ecosystems (`src/consolidated_builder.py`).

## When to Use
- Initial project setup and dependency installation
- Continuous integration build processes
- Multi-stage build coordination
- Dependency verification and auditing
- Test execution across Node.js and Python
- Build artifact generation and validation

## Capabilities
### Dependency Management
- **Node.js**: Detects package.json, runs `npm install`
- **Python**: Detects requirements.txt, runs `pip install`
- Parallel installation support
- Dependency conflict detection

### Testing
- Auto-detects test directories (tests/, test/, __tests__/)
- Runs appropriate test framework:
  - npm test for Node.js projects
  - pytest for Python projects
- Timeout protection (600 seconds for tests)
- Test failure reporting with continuation option

### Build Orchestration
- Sequential execution with proper error handling
- Build status tracking with timestamps
- JSON-formatted build reports
- Timeout protection (300 seconds for commands)

## Inputs
- `--project-root`: Directory path (default: current working directory)
- `--output`: Optional path for build info JSON output
- Environment variables for configuration

## Outputs
Structured build information:
```json
{
  "status": "success",
  "timestamp": "ISO-8601 timestamp",
  "project_root": "/path/to/project",
  "node_deps_installed": true/false,
  "python_deps_installed": true/false,
  "tests_run": true/false
}
```

## Tool Access
- Subprocess execution (shell commands)
- File system operations (Path, exists, iterdir)
- JSON serialization for reports
- Argparse for CLI interface

## Workflow
1. **Detect project type**: Check for package.json and requirements.txt
2. **Install dependencies**: Run npm/pip as needed
3. **Discover tests**: Search for test directories
4. **Execute tests**: Run appropriate test runner
5. **Generate report**: Create JSON build summary
6. **Exit**: Success (0) or failure (1) with error details

## Limitations
- Command timeout: 300 seconds (configurable)
- Test timeout: 600 seconds
- Continues on test failure (non-blocking)
- Single-threaded execution
- Requires npm/pip in PATH

## Progress Reporting
- Real-time logging with [INFO]/[ERROR] prefixes
- ISO-8601 timestamps on all log entries
- stderr for errors, stdout for info
- Exit codes: 0 (success), 1 (failure)

## Error Handling
- Timeout errors with clear messages
- Command failure with stdout/stderr capture
- Continued execution after test failures
- Exception propagation with context