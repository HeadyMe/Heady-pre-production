/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              HEADY TASK COLLECTOR - Find All Tasks           ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📝 CODE          📋 CHECKPOINTS      📊 AUDIT          🔧 GIT
 *        │                    │                  │              │
 *        ▼                    ▼                  ▼              ▼
 *    ┌────────┐      ┌──────────────┐    ┌──────────┐    ┌────────┐
 *    │ TODO   │      │  Issues &    │    │ Failed   │    │Uncommit│
 *    │ FIXME  │      │  Warnings    │    │  Ops     │    │Changes │
 *    │ HACK   │      │              │    │          │    │        │
 *    └───┬────┘      └──────┬───────┘    └────┬─────┘    └───┬────┘
 *        │                  │                  │              │
 *        └──────────────────┴──────────────────┴──────────────┘
 *                              │
 *                              ▼
 *                    ┌──────────────────┐
 *                    │  TASK AGGREGATOR │
 *                    │  Collect & Merge │
 *                    └────────┬─────────┘
 *                             │
 *                             ▼
 *                    ┌──────────────────┐
 *                    │ ROUTING OPTIMIZER│
 *                    │  Queue by Priority│
 *                    └──────────────────┘
 * 
 * Sources:
 * - Code comments (TODO, FIXME, HACK, XXX, BUG, NOTE)
 * - HeadyMaid optimization opportunities
 * - Checkpoint reports (issues and warnings)
 * - Audit logs (failed operations, security events)
 * - Git (uncommitted changes, pending PRs)
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class TaskCollector extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      scanInterval: config.scanInterval || 60000, // 1 minute
      rootDirs: config.rootDirs || [process.cwd()],
      taskPatterns: config.taskPatterns || [
        /TODO:?\s*(.+)/gi,
        /FIXME:?\s*(.+)/gi,
        /HACK:?\s*(.+)/gi,
        /XXX:?\s*(.+)/gi,
        /BUG:?\s*(.+)/gi,
        /NOTE:?\s*(.+)/gi
      ],
      fileExtensions: config.fileExtensions || ['.js', '.py', '.ps1', '.md', '.ts'],
      excludePatterns: config.excludePatterns || ['node_modules', '.git', '.venv', 'dist', 'build'],
      ...config
    };

    this.discoveredTasks = new Map(); // taskId -> task
    this.taskSources = new Map(); // source -> tasks[]
    this.metrics = {
      totalTasks: 0,
      tasksByPriority: { critical: 0, high: 0, normal: 0, low: 0 },
      tasksBySource: new Map(),
      lastScan: null
    };
  }

  /**
   * Start task collection
   */
  async start() {
    console.log('[TASK COLLECTOR] Starting comprehensive task collection...');
    
    await this.collectAllTasks();
    
    // Periodic scanning
    setInterval(async () => {
      await this.collectAllTasks();
    }, this.config.scanInterval);
    
    console.log('[TASK COLLECTOR] Active and monitoring');
  }

  /**
   * Collect tasks from all sources
   */
  async collectAllTasks() {
    const startTime = Date.now();
    
    // Clear previous tasks
    this.discoveredTasks.clear();
    this.taskSources.clear();
    
    // Collect from multiple sources
    await Promise.all([
      this.collectCodeCommentTasks(),
      this.collectCheckpointTasks(),
      this.collectAuditLogTasks(),
      this.collectGitTasks()
    ]);
    
    // Update metrics
    this.metrics.totalTasks = this.discoveredTasks.size;
    this.metrics.lastScan = new Date().toISOString();
    
    const duration = Date.now() - startTime;
    console.log(`[TASK COLLECTOR] Collected ${this.metrics.totalTasks} tasks in ${duration}ms`);
    
    // Emit all tasks
    this.emit('tasks-collected', {
      tasks: Array.from(this.discoveredTasks.values()),
      sources: Array.from(this.taskSources.entries()),
      metrics: this.metrics
    });
    
    return Array.from(this.discoveredTasks.values());
  }

  /**
   * Collect tasks from code comments (TODO, FIXME, etc.)
   */
  async collectCodeCommentTasks() {
    const tasks = [];
    
    for (const rootDir of this.config.rootDirs) {
      await this.scanDirectory(rootDir, async (filepath) => {
        try {
          const content = await fs.readFile(filepath, 'utf8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            for (const pattern of this.config.taskPatterns) {
              const matches = line.matchAll(pattern);
              for (const match of matches) {
                const taskText = match[1]?.trim();
                if (taskText) {
                  const priority = this.determinePriority(match[0], taskText);
                  const task = {
                    id: `code-${filepath}-${index}`,
                    type: 'code-comment',
                    priority,
                    description: taskText,
                    source: {
                      file: filepath,
                      line: index + 1,
                      marker: match[0].split(':')[0]
                    },
                    createdAt: new Date().toISOString()
                  };
                  
                  this.addTask(task);
                  tasks.push(task);
                }
              }
            }
          });
        } catch (err) {
          // Skip files that can't be read
        }
      });
    }
    
    this.taskSources.set('code-comments', tasks);
    return tasks;
  }

  /**
   * Collect tasks from checkpoint reports
   */
  async collectCheckpointTasks() {
    const tasks = [];
    const checkpointDir = path.join(process.cwd(), 'audit_logs');
    
    try {
      const files = await fs.readdir(checkpointDir);
      const checkpoints = files.filter(f => f.startsWith('checkpoint_') && f.endsWith('.json'));
      
      for (const file of checkpoints.slice(-5)) { // Last 5 checkpoints
        try {
          const content = await fs.readFile(path.join(checkpointDir, file), 'utf8');
          const checkpoint = JSON.parse(content);
          
          // Extract tasks from checkpoint issues
          if (checkpoint.issues) {
            checkpoint.issues.forEach((issue, idx) => {
              const task = {
                id: `checkpoint-${file}-${idx}`,
                type: 'checkpoint-issue',
                priority: issue.severity === 'critical' ? 'critical' : 'high',
                description: issue.description || issue.message,
                source: {
                  checkpoint: file,
                  category: issue.category
                },
                createdAt: checkpoint.timestamp
              };
              
              this.addTask(task);
              tasks.push(task);
            });
          }
        } catch (err) {
          // Skip invalid checkpoints
        }
      }
    } catch (err) {
      // Checkpoint directory doesn't exist
    }
    
    this.taskSources.set('checkpoints', tasks);
    return tasks;
  }

  /**
   * Collect tasks from audit logs
   */
  async collectAuditLogTasks() {
    const tasks = [];
    const auditDir = path.join(process.cwd(), 'audit_logs');
    
    try {
      const files = await fs.readdir(auditDir);
      const auditLogs = files.filter(f => f.startsWith('audit_') && f.endsWith('.jsonl'));
      
      for (const file of auditLogs.slice(-3)) { // Last 3 days
        try {
          const content = await fs.readFile(path.join(auditDir, file), 'utf8');
          const lines = content.trim().split('\n');
          
          lines.forEach((line, idx) => {
            try {
              const entry = JSON.parse(line);
              
              // Look for failures or errors
              if (entry.event?.type === 'auth_failure' || 
                  entry.event?.type === 'operation_failed') {
                const task = {
                  id: `audit-${file}-${idx}`,
                  type: 'audit-issue',
                  priority: 'high',
                  description: `Investigate ${entry.event.type}: ${entry.event.details?.reason || 'Unknown'}`,
                  source: {
                    auditLog: file,
                    timestamp: entry.timestamp
                  },
                  createdAt: entry.timestamp
                };
                
                this.addTask(task);
                tasks.push(task);
              }
            } catch (err) {
              // Skip invalid lines
            }
          });
        } catch (err) {
          // Skip invalid audit logs
        }
      }
    } catch (err) {
      // Audit directory doesn't exist
    }
    
    this.taskSources.set('audit-logs', tasks);
    return tasks;
  }

  /**
   * Collect tasks from git (future: integrate with GitHub API)
   */
  async collectGitTasks() {
    const tasks = [];
    
    // Placeholder for git integration
    // Future: Scan for uncommitted changes, pending PRs, open issues
    
    this.taskSources.set('git', tasks);
    return tasks;
  }

  /**
   * Scan directory recursively
   */
  async scanDirectory(dir, callback) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip excluded patterns
        if (this.shouldExclude(entry.name)) continue;
        
        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, callback);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (this.config.fileExtensions.includes(ext)) {
            await callback(fullPath);
          }
        }
      }
    } catch (err) {
      // Skip directories we can't access
    }
  }

  /**
   * Check if path should be excluded
   */
  shouldExclude(name) {
    return this.config.excludePatterns.some(pattern => name.includes(pattern));
  }

  /**
   * Determine task priority based on marker and content
   */
  determinePriority(marker, text) {
    const lowerText = text.toLowerCase();
    
    // Critical keywords
    if (lowerText.match(/critical|security|urgent|asap|immediately/)) {
      return 'critical';
    }
    
    // High priority markers
    if (marker.startsWith('FIXME') || marker.startsWith('BUG')) {
      return 'high';
    }
    
    // High priority keywords
    if (lowerText.match(/important|fix|error|broken|fail/)) {
      return 'high';
    }
    
    // Low priority keywords
    if (lowerText.match(/cleanup|refactor|optimize|nice.*to.*have/)) {
      return 'low';
    }
    
    // Default to normal
    return 'normal';
  }

  /**
   * Add task to collection
   */
  addTask(task) {
    this.discoveredTasks.set(task.id, task);
    
    // Update metrics
    const priority = task.priority || 'normal';
    this.metrics.tasksByPriority[priority] = (this.metrics.tasksByPriority[priority] || 0) + 1;
    
    const source = task.type;
    this.metrics.tasksBySource.set(source, (this.metrics.tasksBySource.get(source) || 0) + 1);
  }

  /**
   * Get all tasks
   */
  getAllTasks() {
    return Array.from(this.discoveredTasks.values());
  }

  /**
   * Get tasks by priority
   */
  getTasksByPriority(priority) {
    return Array.from(this.discoveredTasks.values())
      .filter(task => task.priority === priority);
  }

  /**
   * Get tasks by source
   */
  getTasksBySource(source) {
    return this.taskSources.get(source) || [];
  }

  /**
   * Get collection metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      tasksBySource: Object.fromEntries(this.metrics.tasksBySource)
    };
  }
}

module.exports = TaskCollector;
