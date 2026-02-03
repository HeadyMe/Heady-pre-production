# HeadyMaid Task Integration with Routing System

## ✅ Integration Complete

**HeadyMaid optimization opportunities are now automatically sent to the Heady task management system (RoutingOptimizer).**

## How It Works

### **1. HeadyMaid Detects Opportunities**
HeadyMaid continuously scans the codebase and detects:
- **Duplicates**: Files with identical checksums
- **Misplaced**: Files in wrong directories
- **Outdated**: Files not modified in 90+ days
- **Fragmented**: Data spread across multiple locations
- **Unoptimized**: Files that could be improved

### **2. Tasks Emitted to Routing System**
When opportunities are detected, HeadyMaid emits `task-detected` events:

```javascript
headyMaid.emit('task-detected', {
  type: 'optimization',
  priority: 'low',  // or 'normal' for misplaced files
  description: 'Remove 5 duplicate files',
  category: 'duplicates',
  data: [...] // Detailed opportunity data
});
```

### **3. RoutingOptimizer Queues Tasks**
The RoutingOptimizer receives these tasks and:
- Adds them to appropriate priority queue (high/normal/low)
- Tracks task metadata
- Processes in priority order
- Routes to optimal MCP service

### **4. Task Processing**
Tasks are processed by the queue processor:
- **High priority**: Processed immediately
- **Normal priority**: Processed in order
- **Low priority**: Processed when system idle

## Task Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    HEADY MAID SCANNING                       │
│  • Continuous file monitoring                                │
│  • Quick scans every 30s                                     │
│  • Deep scans every 5 minutes                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              OPPORTUNITY DETECTION                           │
│  • Duplicates found                                          │
│  • Misplaced files identified                                │
│  • Outdated code detected                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              TASK EMISSION (Event)                           │
│  Event: 'task-detected'                                      │
│  Data: {type, priority, description, category, data}         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ROUTING OPTIMIZER                               │
│  • Receives task via event listener                          │
│  • Adds to priority queue                                    │
│  • Tracks task metadata                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PRIORITY QUEUE                                  │
│  High:   [security fixes, critical errors]                   │
│  Normal: [misplaced files, refactoring]                      │
│  Low:    [duplicates, outdated files, cleanup]               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              QUEUE PROCESSOR (1s intervals)                  │
│  • Processes high priority first                             │
│  • Then normal, then low                                     │
│  • Routes to optimal MCP service                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              TASK EXECUTION                                  │
│  • Via MCP services                                          │
│  • With timeout & retry                                      │
│  • Circuit breaker protection                                │
│  • Complete audit trail                                      │
└─────────────────────────────────────────────────────────────┘
```

## Event Listeners

### **In heady-manager.js**
```javascript
// Connect HeadyMaid tasks to RoutingOptimizer
headyMaid.on('task-detected', (task) => {
  console.log(`[TASK ROUTING] HeadyMaid detected task: ${task.description}`);
  routingOptimizer.queueTask(task);
});

headyMaid.on('opportunities-detected', (opportunities) => {
  console.log(`[TASK ROUTING] ${Object.values(opportunities).flat().length} optimization opportunities queued`);
});
```

## Task Types Emitted by HeadyMaid

### **1. Duplicate Removal Tasks**
```json
{
  "type": "optimization",
  "priority": "low",
  "description": "Remove 5 duplicate files",
  "category": "duplicates",
  "data": [
    {
      "checksum": "abc123...",
      "files": ["file1.js", "file2.js"],
      "potentialSavings": 15360
    }
  ]
}
```

### **2. File Reorganization Tasks**
```json
{
  "type": "optimization",
  "priority": "normal",
  "description": "Reorganize 3 misplaced files",
  "category": "misplaced",
  "data": [
    {
      "filepath": "config.js",
      "reason": "Config file deeply nested",
      "suggestion": "Move to root or config/ directory"
    }
  ]
}
```

### **3. Code Review Tasks**
```json
{
  "type": "review",
  "priority": "low",
  "description": "Review 12 outdated files",
  "category": "outdated",
  "data": [
    {
      "filepath": "old-module.js",
      "lastModified": "2025-08-15T10:30:00Z",
      "daysSinceModified": 171
    }
  ]
}
```

## Monitoring Task Flow

### **View Queued Tasks**
```bash
curl -H "x-heady-api-key: $HEADY_API_KEY" \
  http://localhost:3300/api/tasks/queued
```

**Response:**
```json
{
  "ok": true,
  "tasks": {
    "high": [],
    "normal": [
      {
        "type": "optimization",
        "priority": "normal",
        "description": "Reorganize 3 misplaced files",
        "queuedAt": 1738604400000
      }
    ],
    "low": [
      {
        "type": "optimization",
        "priority": "low",
        "description": "Remove 5 duplicate files",
        "queuedAt": 1738604400000
      }
    ],
    "summary": {
      "high": 0,
      "normal": 1,
      "low": 1
    }
  }
}
```

### **View Routing Statistics**
```bash
curl -H "x-heady-api-key: $HEADY_API_KEY" \
  http://localhost:3300/api/mcp/routing-stats
```

Includes `taskManagement` section showing queue sizes.

## Task Processing

### **Automatic Processing**
- Queue processor runs every 1 second
- Processes tasks in priority order
- Routes to optimal MCP service
- Tracks success/failure

### **Manual Trigger**
Tasks can also be manually triggered via API:
```bash
curl -X POST -H "x-heady-api-key: $HEADY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "optimization",
    "priority": "high",
    "description": "Fix critical issue",
    "tool": "heady_write_file",
    "args": {...}
  }' \
  http://localhost:3300/api/tasks/queue
```

## Benefits

### **Automated Optimization**
- HeadyMaid detects issues automatically
- Tasks queued without manual intervention
- Processed in optimal order
- Complete tracking and audit trail

### **Priority Management**
- Critical issues processed first
- Normal maintenance in order
- Low-priority cleanup when idle
- No manual task management needed

### **Complete Observability**
- All tasks tracked in routing analytics
- Success/failure rates monitored
- Performance metrics collected
- Audit trail maintained

## Verification

### **Check Integration Status**
```bash
curl -H "x-heady-api-key: $HEADY_API_KEY" \
  http://localhost:3300/api/mcp/routing-stats
```

Look for:
- `headyMaidIntegrated: true`
- `taskManagement.totalQueued: N`
- Queue sizes for each priority level

### **Monitor Task Emissions**
Watch HeadyManager console output for:
```
[TASK ROUTING] HeadyMaid detected task: Remove 5 duplicate files
[TASK ROUTING] 8 optimization opportunities queued
```

## Configuration

### **Adjust Scan Intervals**
In `.env`:
```bash
HEADY_MAID_SCAN_INTERVAL=30000      # Quick scan every 30s
HEADY_MAID_DEEP_SCAN=300000         # Deep scan every 5 minutes
```

### **Adjust Queue Processing**
In `routing_optimizer.js`:
```javascript
// Queue processor interval (default: 1000ms)
setInterval(async () => {
  // Process tasks
}, 1000);
```

## Status: ✅ FULLY INTEGRATED

**HeadyMaid tasks are now automatically sent to the Heady task management system (RoutingOptimizer)!**

All optimization opportunities detected by HeadyMaid are:
- ✅ Automatically emitted as tasks
- ✅ Queued by priority
- ✅ Processed by RoutingOptimizer
- ✅ Routed to optimal MCP services
- ✅ Tracked with complete analytics

---

**Date**: February 3, 2026  
**Version**: v14.2.0  
**Status**: PRODUCTION READY ✅
