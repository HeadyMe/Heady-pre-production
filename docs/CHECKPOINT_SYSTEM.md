# HEADY CHECKPOINT STORY DRIVER

## Overview

The Checkpoint Story Driver is a comprehensive system status reporting tool that generates detailed markdown reports at each checkpoint. It tracks every component of the Heady ecosystem including services, MCP servers, infrastructure, Docker containers, Git status, file system structure, running processes, and operational metrics.

## Architecture

### Core Components

1. **CheckpointReporter** (`src/checkpoint_reporter.js`)
   - Main reporting engine
   - Scans all system components
   - Generates markdown and JSON reports
   - Collects recon data from multiple sources

2. **GovernanceCheckpoint** (`src/governance_checkpoint.js`)
   - Integrates with governance system
   - Automated checkpoint scheduling
   - Event-triggered checkpoints
   - Checkpoint comparison and history

3. **CLI Interface** (`scripts/checkpoint.js`)
   - Command-line interface for manual checkpoint generation
   - View and list existing checkpoints
   - Node.js-based execution

4. **PowerShell Wrapper** (`scripts/Invoke-Checkpoint.ps1`)
   - Windows-friendly interface
   - Colored output and banners
   - Easy integration with existing scripts

## Report Contents

Each checkpoint report includes:

### 📊 Executive Summary
- Docker container count
- Service health status
- MCP server count
- Git repository status
- Memory patterns and validations

### 🌍 Environment
- Node.js version and platform info
- Environment variables (masked secrets)
- MCP configuration summary
- System uptime and memory usage

### 🐳 Docker Services
- Running containers with IDs, names, status, ports
- Docker Compose service status
- Container health checks

### 🔌 MCP Servers
- Configured MCP servers
- Command and arguments
- Governance rules per server

### 💚 Health Status
- Service health endpoints
- Response times
- Status codes

### 📦 Git Repository
- Current branch and commit
- Modified/added/deleted files
- Untracked files
- Remote repositories

### 📁 File System
- Critical directory structure
- File counts per directory
- Last modified timestamps
- Missing directories flagged

### ⚙️ Processes
- Running Node.js processes
- Process IDs and memory usage

### 📈 Metrics
- Audit log count
- Memory patterns
- Validation count

### 💾 Memory Usage
- RSS, Heap Total, Heap Used
- External memory

## Usage

### Manual Checkpoint Generation

**PowerShell:**
```powershell
# Generate a new checkpoint
.\scripts\Invoke-Checkpoint.ps1 -Action generate

# View the latest checkpoint
.\scripts\Invoke-Checkpoint.ps1 -Action view

# List all checkpoints
.\scripts\Invoke-Checkpoint.ps1 -Action list

# Show help
.\scripts\Invoke-Checkpoint.ps1 -Action help
```

**Node.js:**
```bash
# Generate a new checkpoint
node scripts/checkpoint.js generate

# View the latest checkpoint
node scripts/checkpoint.js view

# List all checkpoints
node scripts/checkpoint.js list
```

### Programmatic Usage

```javascript
const CheckpointReporter = require('./src/checkpoint_reporter');

// Create reporter instance
const reporter = new CheckpointReporter({
  rootDir: '/path/to/heady',
  outputDir: '/path/to/heady/audit_logs'
});

// Generate report
const markdown = await reporter.generateReport();
console.log(`Report ID: ${reporter.checkpointId}`);
```

### Governance Integration

```javascript
const GovernanceCheckpoint = require('./src/governance_checkpoint');

// Initialize governance checkpoint system
const checkpoint = new GovernanceCheckpoint({
  autoCheckpointInterval: 3600000, // 1 hour
  checkpointOnEvents: ['deployment', 'major_change', 'error_threshold'],
  rootDir: process.cwd()
});

await checkpoint.initialize();

// Manual trigger
await checkpoint.triggerCheckpoint('deployment', {
  version: '1.2.0',
  deployer: 'admin'
});

// Get history
const history = await checkpoint.getCheckpointHistory(10);

// Compare checkpoints
const diff = await checkpoint.compareCheckpoints(
  'checkpoint_1234567890',
  'checkpoint_1234567891'
);
```

## Output Files

Each checkpoint generates two files:

1. **Markdown Report** (`checkpoint_<timestamp>.md`)
   - Human-readable status report
   - Organized sections with tables
   - Executive summary
   - Saved to `audit_logs/`

2. **JSON Data** (`checkpoint_<timestamp>.json`)
   - Machine-readable recon data
   - Complete system state snapshot
   - Used for comparison and analysis
   - Saved to `audit_logs/`

## Automated Checkpoints

The governance system can trigger checkpoints automatically based on:

- **Scheduled Intervals**: Every N milliseconds (default: 1 hour)
- **Deployment Events**: Before/after deployments
- **Major Changes**: Significant code or config changes
- **Error Thresholds**: When error rates exceed limits
- **Manual Triggers**: Explicit checkpoint requests

## Checkpoint Comparison

Compare two checkpoints to see what changed:

```javascript
const diff = await checkpoint.compareCheckpoints(
  'checkpoint_1234567890',
  'checkpoint_1234567891'
);

console.log('Docker Changes:', diff.dockerChanges);
console.log('MCP Changes:', diff.mcpChanges);
console.log('Git Changes:', diff.gitChanges);
console.log('Health Changes:', diff.healthChanges);
console.log('Metrics Changes:', diff.metricsChanges);
```

## Integration Points

### Heady Manager Integration

Add to `heady-manager.js`:

```javascript
const GovernanceCheckpoint = require('./src/governance_checkpoint');

// Initialize on startup
const checkpoint = new GovernanceCheckpoint({
  autoCheckpointInterval: 3600000,
  rootDir: __dirname
});

await checkpoint.initialize();

// Trigger on deployment
app.post('/api/deploy', async (req, res) => {
  // ... deployment logic ...
  
  await checkpoint.triggerCheckpoint('deployment', {
    version: req.body.version
  });
  
  res.json({ success: true });
});
```

### MCP Server Integration

Expose checkpoint generation via MCP:

```javascript
// Add to MCP server
server.tool('generate_checkpoint', async (params) => {
  const reporter = new CheckpointReporter();
  const markdown = await reporter.generateReport();
  
  return {
    checkpointId: reporter.checkpointId,
    markdown
  };
});
```

### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Generate Checkpoint
  run: |
    node scripts/checkpoint.js generate
    
- name: Upload Checkpoint
  uses: actions/upload-artifact@v3
  with:
    name: checkpoint-report
    path: audit_logs/checkpoint_*.md
```

## Best Practices

1. **Regular Checkpoints**: Generate checkpoints at regular intervals (hourly/daily)
2. **Event-Driven**: Trigger checkpoints on significant events (deployments, errors)
3. **Retention Policy**: Keep last 30 days of checkpoints, archive older ones
4. **Comparison**: Compare checkpoints to track system evolution
5. **Alerting**: Alert on significant changes between checkpoints
6. **Documentation**: Use checkpoints as system documentation snapshots

## Troubleshooting

### Docker Not Available
If Docker commands fail, the report will note the error but continue with other sections.

### Git Not Available
If Git is not available, the Git section will show an error but other sections will complete.

### Permission Issues
Ensure the script has read access to all directories being scanned.

### Missing Dependencies
Run `npm install` to ensure all Node.js dependencies are available.

## Future Enhancements

- [ ] Web UI for viewing checkpoints
- [ ] Diff visualization between checkpoints
- [ ] Alert system for anomalies
- [ ] Export to external monitoring systems
- [ ] Integration with Heady Admin UI
- [ ] Real-time checkpoint streaming
- [ ] Checkpoint-based rollback system

## Related Documentation

- `docs/admin/ADMIN_UI.md` - Admin UI integration
- `docs/HEADY_MCP_PRODUCTION_CHECKLIST.md` - Production deployment
- `.heady-memory/README.md` - Memory system integration
- `SECURITY.md` - Security considerations

## Support

For issues or questions about the Checkpoint System:
1. Check existing checkpoint reports in `audit_logs/`
2. Review the governance logs
3. Run with verbose logging: `DEBUG=checkpoint:* node scripts/checkpoint.js generate`
4. Contact the Heady Systems team

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-02  
**Maintained By:** Heady Systems Story Driver Team
