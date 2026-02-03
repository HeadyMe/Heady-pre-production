---
description: Monitor and manage the Heady Task System
---

# Task Monitoring Workflow

## Purpose
Monitor, manage, and optimize task execution across the Heady ecosystem.

## Usage

### Monitor Tasks
```bash
# View active tasks
node scripts/task-monitor.js --active

# View task history
node scripts/task-monitor.js --history --limit 100

# View task statistics
node scripts/task-monitor.js --stats

# Watch task stream
node scripts/task-monitor.js --watch
```

### Manage Tasks
```bash
# Cancel specific task
node scripts/task-monitor.js --cancel --task-id abc123

# Retry failed task
node scripts/task-monitor.js --retry --task-id abc123

# Pause task queue
node scripts/task-monitor.js --pause

# Resume task queue
node scripts/task-monitor.js --resume
```

### Programmatic Usage
```javascript
const TaskMonitor = require('./src/task_monitor');

const monitor = new TaskMonitor({
  refreshInterval: 5000,
  retentionDays: 30
});

monitor.on('task:complete', (task) => {
  console.log(`Task completed: ${task.id}`);
});

monitor.start();
```

## Metrics Tracked
- Task execution time
- Success/failure rates
- Queue depth
- Resource utilization
- Error patterns

## Alerts
- Task timeout warnings
- Failure rate spikes
- Queue congestion
- Resource exhaustion
