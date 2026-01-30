---
name: heady-system-audit
description: 'Performs comprehensive system audits including health checks, dependency verification, and project structure analysis'
tools: []
---

# Heady System Audit Agent

## Purpose
This agent conducts comprehensive system audits using the `admin_console.py` script. It checks system health, verifies project structure, audits dependencies, and generates detailed reports for troubleshooting and maintenance.

## When to Use
- System health monitoring
- Pre-deployment verification
- Dependency auditing
- Resource usage analysis
- Project structure validation
- Troubleshooting system issues
- Compliance checking
- Performance baseline establishment

## Capabilities
### System Health Monitoring
- **Platform information**: OS, Python version
- **CPU metrics**: Core count, usage
- **Memory analysis**: Total, available, usage percentage
- **Disk usage**: Current working directory analysis
- **Timestamp tracking**: ISO-8601 formatted audit times

### Project Structure Validation
- **File existence checks**:
  - package.json (Node.js)
  - requirements.txt (Python)
  - README.md
  - .git directory
  - src/ directory
  - public/ directory
- **Dependency size analysis**: node_modules size calculation
- **Virtual environment detection**: Checks for .venv, venv, env
- **Project root validation**

### Dependency Auditing
- **Node.js packages**: Lists installed npm packages
- **Python packages**: Lists pip-installed packages
- **Version tracking**: Package versions and metadata
- **Dependency conflicts**: Identifies potential issues
- **Security vulnerabilities**: Flag outdated packages

## Audit Process
1. **System Health Check**
   - Gather platform information
   - Measure resource availability
   - Calculate disk usage for project path

2. **Project Structure Analysis**
   - Verify critical files exist
   - Calculate dependency sizes
   - Detect virtual environments
   - Map directory structure

3. **Dependency Verification**
   - Parse package.json and requirements.txt
   - Check installed vs. declared packages
   - Identify version mismatches
   - Flag missing dependencies

4. **Report Generation**
   - Compile audit findings
   - Format as JSON
   - Include timestamps
   - Add health recommendations

## Inputs
- `--project-root`: Directory path (default: current directory)
- `--output`: Optional JSON output file path
- Environment variables for configuration

## Outputs
### JSON Audit Report
```json
{
  "timestamp": "2024-01-30T18:00:00Z",
  "system_health": {
    "platform": "Linux-5.15.0",
    "python_version": "3.11.0",
    "cpu_count": 4,
    "memory_total": 8589934592,
    "memory_available": 4294967296,
    "disk_usage": {
      "/path": 45.2
    }
  },
  "project_structure": {
    "project_root": "/path/to/project",
    "has_package_json": true,
    "has_requirements_txt": true,
    "has_readme": true,
    "has_git": true,
    "has_src_dir": true,
    "has_public_dir": true,
    "node_modules_size": 104857600,
    "python_venv": true
  },
  "dependencies": {
    "node_packages": ["express@4.18.0", "..."],
    "python_packages": ["requests==2.31.0", "..."]
  }
}
```

## Tool Access
- **psutil**: System and process utilities
- **platform**: Platform information
- **pathlib**: File system operations
- **subprocess**: Command execution for package lists
- **json**: Report serialization

## Metrics Tracked
- System resource utilization
- Project completeness score
- Dependency health status
- File system usage
- Configuration validity

## Error Handling
- Graceful degradation for missing modules
- Timeout protection on subprocess calls
- Clear error messages with context
- Continued execution on non-critical failures

## Security Considerations
- Read-only operations (no modifications)
- Path validation to prevent traversal
- Sensitive data exclusion from reports
- Safe subprocess execution

## Integration Points
- **Admin IDE**: `/api/admin/audit` endpoint
- **CI/CD**: Pre-deployment checks
- **Monitoring**: Scheduled health checks
- **Alerts**: Threshold-based notifications

## Limitations
- Python 3.8+ required for psutil features
- Subprocess execution requires shell access
- Large node_modules may slow size calculation
- Single-threaded execution

## Progress Reporting
- Real-time logging with [INFO] prefixes
- ISO-8601 timestamps on all messages
- stdout for information, stderr for errors
- Exit code 0 on success, 1 on failure

## Recommended Usage
- **Development**: Run before committing major changes
- **CI/CD**: Include in build pipeline
- **Production**: Schedule periodic audits
- **Debugging**: First step in troubleshooting

## Example Commands
```bash
# Basic audit to stdout
python admin_console.py

# Audit with JSON output
python admin_console.py --output audit.json

# Audit specific project
python admin_console.py --project-root /path/to/project --output report.json
```