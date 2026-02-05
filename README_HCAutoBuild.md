<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: README_HCAutoBuild.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# HCAutoBuild - Autonomous Checkpoint System

## Overview

HCAutoBuild is an intelligent checkpoint system that automatically monitors workspace functionality, creates checkpoints when 100% functionality is achieved, and maintains autonomous operation until all tasks are completed. The system integrates seamlessly with the existing Heady infrastructure.

## Quick Start

### Basic Commands

```bash
# Run full HCAutoBuild cycle
.\hcautobuild.ps1

# Or use the shortcut
hc

# Check status of all workspaces
hc-status

# Force checkpoint creation
hc-checkpoint

# Start continuous monitoring
hc-monitor
```

### PowerShell Parameters

```powershell
# Full cycle with verbose output
.\hcautobuild.ps1 -verbose

# Process specific workspace only
.\hcautobuild.ps1 -workspace Heady

# Force checkpoint regardless of functionality score
.\hcautobuild.ps1 -checkpoint -force

# Debug mode with detailed logging
.\hcautobuild.ps1 -debug -verbose
```

## Features

### 🎯 Automatic Checkpoint Creation
- Monitors workspace functionality in real-time
- Creates checkpoints when 100% functionality is achieved
- Commits and pushes changes automatically
- Maintains detailed checkpoint metadata

### 📊 Functionality Scoring
- **Health Check** (40%): Git status, dependencies, build artifacts
- **Build Status** (30%): Successful build and test execution
- **Git Cleanliness** (15%): Working directory status
- **Recent Activity** (15%): Commit recency

### 🔄 Continuous Monitoring
- Monitors all configured workspaces
- Detects functionality changes automatically
- Creates checkpoints on improvement
- Runs in background until stopped

### 📈 Status Reporting
- Comprehensive workspace analysis
- Visual status indicators
- Detailed issue reporting
- Recommendations for improvement

## Workflow

### 1. System Initialization
```
HCAutoBuild → Scan Workspaces → Establish Baseline → Ready State
```

### 2. Continuous Operation
```
Monitor Changes → Calculate Functionality → 
└─ If ≥100%: Create Checkpoint → Commit → Push → Report
└─ If <100%: Continue Monitoring → Log Issues
```

### 3. Autonomous Development
```
Predict Next Checkpoint → Implement Changes → Validate → 
└─ Success: New Checkpoint
└─ Failure: Fix Issues → Retry
```

### 4. Standby Mode
```
No Changes Detected → Standby → Monitor for Changes → 
└─ Changes Found: Resume Operation
```

## Configuration

### Main Configuration File
Location: `.heady/hcautobuild_config.json`

```json
{
  "workspaces": ["Heady", "CascadeProjects"],
  "settings": {
    "monitor_interval_seconds": 300,
    "functionality_threshold": 95,
    "auto_commit": true,
    "auto_push": true
  },
  "services": {
    "heady_manager": { "port": 3300 },
    "frontend": { "port": 3000 }
  }
}
```

### Environment Variables
```bash
HCAUTOBUILD_ENABLED=true
HCAUTOBUILD_MONITOR_INTERVAL=300
HCAUTOBUILD_FUNCTIONALITY_THRESHOLD=95
```

## Integration

### With Existing Scripts
- **commit_and_build.ps1**: Used for build validation
- **nexus_deploy.ps1**: Triggered after checkpoint creation
- **heady_protocol.ps1**: Maintains sacred geometry principles

### Git Integration
- Automatic commits with checkpoint metadata
- Push to all configured remotes
- Branch synchronization
- Conflict detection

### Service Health
- Heady Manager (port 3300)
- Frontend services (port 3000)
- Database connectivity
- API endpoint availability

## Checkpoint Structure

### Checkpoint Metadata
```json
{
  "checkpoint_id": "auto_20241201_120000",
  "timestamp": "2024-12-01T12:00:00Z",
  "workspace": "Heady",
  "functionality_score": 100,
  "functionality_details": {
    "score": 100,
    "max_score": 100,
    "percentage": 100.0,
    "factors": ["Health: 40/40", "Build: 30/30", "Git: 15/15", "Activity: 15/15"]
  },
  "git_commit": "abc123...",
  "build_status": "passed",
  "health_status": "Excellent",
  "changes_since_last": ["file1.js", "file2.py"]
}
```

### Storage Location
- Checkpoints stored in `.heady/checkpoints/`
- JSON format for easy parsing
- Automatic cleanup of old checkpoints
- Backup creation before cleanup

## Monitoring and Alerts

### Real-time Monitoring
- File system watcher
- Git repository monitoring
- Service health checks
- Build pipeline status

### Alert Types
- **ERROR**: Build failures, service downtime
- **WARNING**: Test failures, configuration drift
- **INFO**: Checkpoint creation, status updates

### Log Files
- Main log: `.heady/hcautobuild.log`
- Structured logging with timestamps
- Configurable log levels
- Automatic log rotation

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build status
hc-status

# Force rebuild
hc -force

# Debug mode
hc -debug -verbose
```

#### Git Issues
```bash
# Check git status
git status

# Resolve conflicts manually
git mergetool

# Continue after resolution
hc -skip-validation
```

#### Service Unavailable
```bash
# Check service health
Get-Process -Name "node"

# Restart services
npm start

# Verify ports
netstat -an | findstr :3300
```

### Debug Mode
```powershell
# Enable full debugging
.\hcautobuild.ps1 -debug -verbose -workspace Heady

# Check logs
Get-Content .heady\hcautobuild.log -Tail 50
```

## Best Practices

### Development Workflow
1. Make small, incremental changes
2. Test frequently with `hc-status`
3. Let HCAutoBuild handle checkpoints
4. Review status reports regularly

### Checkpoint Management
- Create checkpoints at major milestones
- Tag important releases manually
- Review checkpoint history
- Clean up old checkpoints periodically

### Monitoring
- Use continuous monitoring for active development
- Review status reports daily
- Address alerts promptly
- Update configuration as needed

## Advanced Usage

### Custom Workspaces
```powershell
# Add new workspace to config
.\hcautobuild.ps1 -workspace "NewProject"

# Process multiple specific workspaces
.\hcautobuild.ps1 -workspace "Heady" -workspace "CascadeProjects"
```

### Batch Operations
```powershell
# Force checkpoint for all workspaces
hc-checkpoint -force

# Status report with full details
hc-status -verbose

# Monitor with custom interval
hc-monitor -interval 60
```

### Integration with CI/CD
```yaml
# GitHub Actions example
- name: HCAutoBuild Checkpoint
  run: |
    .\hcautobuild.ps1 -checkpoint
    git push origin main --tags
```

## Performance Optimization

### Parallel Processing
- Concurrent workspace validation
- Parallel test execution
- Simultaneous service checks

### Caching
- Build artifact caching
- Dependency caching
- Test result caching

### Resource Management
- Memory-efficient monitoring
- Optimized file operations
- Minimal system impact

## Security

### Secret Management
- Automatic secret sanitization
- Environment variable protection
- Secure credential storage

### Access Control
- Workspace isolation
- Permission validation
- Audit logging

## Future Enhancements

### AI-Powered Features
- Predictive change implementation
- Intelligent conflict resolution
- Automated optimization suggestions

### Advanced Monitoring
- Performance metrics collection
- Anomaly detection
- Predictive maintenance

### Enhanced Reporting
- Visual dashboards
- Trend analysis
- Historical comparisons

## Support

### Getting Help
```bash
# Show help
.\hcautobuild.ps1 -help

# Check version
hc --version

# System diagnostics
hc -debug
```

### Community
- GitHub Issues: Report bugs and request features
- Documentation: Updated regularly with new features
- Wiki: Detailed guides and tutorials

---

**HCAutoBuild** - Maintaining 100% functionality through intelligent automation
