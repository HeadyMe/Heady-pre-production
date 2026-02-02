---
description: HeadyMaid - Complete Data Observability & Optimization
---

# HEADY MAID WORKFLOW

## Purpose
HeadyMaid is a low-resource background service that maintains complete real-time observability of every bit of data across the entire Heady ecosystem. It continuously scans, validates, and optimizes data placement to ensure system-wide awareness and integrity.

## Core Capabilities

### 🔍 Complete Data Inventory
- Real-time tracking of all files and directories
- Checksum-based integrity verification
- Metadata extraction and categorization
- File type detection and classification

### 📊 Real-Time Observability
- File system watchers for instant change detection
- Continuous scanning with configurable intervals
- Event-driven architecture for low resource usage
- System capability detection (Docker, Git, MCP)

### 🎯 Optimization Detection
- Duplicate file identification
- Misplaced file detection
- Outdated code identification
- Data fragmentation analysis

### 🧹 Data Quality Assurance
- Validates data placement correctness
- Ensures proper file organization
- Detects configuration drift
- Monitors system health

## Usage

### Start HeadyMaid

**PowerShell:**
```powershell
# Start in foreground
.\scripts\Start-HeadyMaid.ps1

# Start as background daemon
.\scripts\Start-HeadyMaid.ps1 -Daemon

# Custom scan intervals
.\scripts\Start-HeadyMaid.ps1 -ScanInterval 60000 -DeepScanInterval 600000
```

**Node.js:**
```bash
# Direct execution
node src/heady_maid_service.js

# With custom intervals
node src/heady_maid_service.js --scanInterval 60000 --deepScanInterval 600000

# Disable real-time monitoring
node src/heady_maid_service.js --no-realtime
```

### Integration with Checkpoint System

HeadyMaid automatically integrates with the checkpoint system to provide data observability reports:

```javascript
const HeadyMaid = require('./src/heady_maid');
const CheckpointReporter = require('./src/checkpoint_reporter');

// HeadyMaid provides inventory data to checkpoints
const maid = new HeadyMaid();
await maid.initialize();

// Generate checkpoint with HeadyMaid data
const reporter = new CheckpointReporter();
reporter.reconData.inventory = maid.getInventory();
reporter.reconData.opportunities = maid.getOpportunities();
await reporter.generateReport();
```

### Programmatic Usage

```javascript
const HeadyMaid = require('./src/heady_maid');

const maid = new HeadyMaid({
  scanInterval: 30000,        // Quick scan every 30s
  deepScanInterval: 300000,   // Deep scan every 5 minutes
  enableRealtime: true,       // Enable file watchers
  rootDirs: [process.cwd()],  // Directories to monitor
  excludePatterns: ['node_modules', '.git']
});

// Event handlers
maid.on('initialized', (data) => {
  console.log(`Tracking ${data.inventory.totalFiles} files`);
});

maid.on('deep-scan-complete', (data) => {
  console.log(`Found ${data.opportunities.duplicates.length} duplicates`);
});

maid.on('file-change', (data) => {
  console.log(`File ${data.eventType}: ${data.filepath}`);
});

await maid.initialize();
```

## Configuration

### Scan Intervals
- **Quick Scan** (default: 30s): Checks modified files only
- **Deep Scan** (default: 5m): Full system scan with optimization detection

### Monitored Directories
By default, HeadyMaid monitors:
- Current working directory
- All subdirectories (recursive)

Excluded patterns:
- `node_modules`
- `.git`
- `.venv`
- `__pycache__`
- `dist`, `build`, `.next`

### Output Location
- **Inventory**: `.heady-memory/inventory/inventory.json`
- **Reports**: `.heady-memory/inventory/report_<timestamp>.json`

## Data Tracked

### File Information
- Path, size, modification time
- SHA-256 checksum (files < 10MB)
- File type and category
- Importance level (critical/high/medium/normal)

### Metadata Extraction
- **JSON files**: Keys, depth, parse status
- **Markdown files**: Line count, word count, code blocks
- **Code files**: Line count, imports, exports

### Optimization Opportunities
- **Duplicates**: Files with identical checksums
- **Misplaced**: Files in incorrect directories
- **Outdated**: Code not modified in 90+ days
- **Fragmented**: Scattered related files

## Integration Points

### With Checkpoint System
HeadyMaid data is automatically included in checkpoint reports:
- Complete file inventory
- Optimization opportunities
- System health metrics

### With hs Command
```powershell
# Generate checkpoint with HeadyMaid data
hs -Checkpoint
```

### With Governance
HeadyMaid emits events to the governance system:
- File change events
- Optimization opportunities detected
- System health alerts

## Benefits

### 🎯 Complete Observability
- Know the location and status of every file
- Real-time awareness of all data changes
- Historical tracking of system evolution

### 🚀 Optimization Opportunities
- Identify duplicate files to save space
- Detect misplaced files for better organization
- Find outdated code for cleanup

### 🛡️ Data Integrity
- Checksum verification for critical files
- Detect data corruption early
- Ensure proper file placement

### 💡 System Awareness
- No manual file scanning needed
- Automatic integration with all tools
- Guides system optimization decisions

## Performance

### Low Resource Usage
- Event-driven architecture
- Incremental scanning
- Configurable scan intervals
- Minimal memory footprint

### Scalability
- Handles thousands of files efficiently
- Parallel scanning support
- Optimized for large codebases

## Monitoring

### Real-Time Events
```javascript
maid.on('file-change', (data) => {
  // React to file changes instantly
});

maid.on('opportunities-detected', (opportunities) => {
  // Act on optimization opportunities
});
```

### Metrics
- Scans completed
- Bytes scanned
- Issues detected
- Optimizations applied
- Average scan time

### Health Checks
```javascript
const metrics = maid.getMetrics();
console.log(`Active scanners: ${metrics.activeScanners}`);
console.log(`Queued scans: ${metrics.queuedScans}`);
```

## Best Practices

1. **Run as Daemon**: Start HeadyMaid as a background service for continuous monitoring
2. **Adjust Intervals**: Tune scan intervals based on your workflow
3. **Review Opportunities**: Regularly check optimization opportunities
4. **Integrate with Checkpoints**: Use HeadyMaid data in checkpoint reports
5. **Monitor Events**: Subscribe to events for real-time awareness

## Troubleshooting

### High CPU Usage
- Increase scan intervals
- Reduce monitored directories
- Add more exclude patterns

### Missing Files
- Check exclude patterns
- Verify directory permissions
- Review real-time monitoring status

### Slow Scans
- Reduce deep scan frequency
- Exclude large directories
- Disable checksums for large files

## Future Enhancements

- [ ] Remote data source integration
- [ ] Cloud storage monitoring
- [ ] Database schema tracking
- [ ] API endpoint inventory
- [ ] Automated optimization application
- [ ] ML-based anomaly detection
- [ ] Integration with external monitoring tools

---

**HeadyMaid ensures complete real-time observability of all data across the entire Heady ecosystem, eliminating the need for manual file scanning and enabling intelligent system optimization.**
