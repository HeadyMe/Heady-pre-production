/**
 * Task Collector - Collects TODO/FIXME tasks from codebase
 */
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class TaskCollector extends EventEmitter {
  constructor(options = {}) {
    super();
    this.rootDirs = options.rootDirs || [process.cwd()];
    this.taskSources = new Map();
    this.tasks = [];
  }

  async start() {
    console.log('[TaskCollector] Starting...');
    await this.collectTasks();
  }

  async collectTasks() {
    const tasks = [];
    for (const root of this.rootDirs) {
      await this.scanDirectory(root, tasks);
    }
    this.tasks = tasks;
    this.emit('tasks-collected', { tasks, source: 'filesystem' });
  }

  async scanDirectory(dir, tasks) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.includes('.git')) {
        await this.scanDirectory(fullPath, tasks);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.py'))) {
        await this.scanFile(fullPath, tasks);
      }
    }
  }

  async scanFile(filePath, tasks) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /(TODO|FIXME|XXX|HACK|BUG|NOTE):(.+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      tasks.push({
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: match[1],
        description: match[2].trim(),
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
        priority: match[1] === 'BUG' || match[1] === 'FIXME' ? 'high' : 'normal',
        category: 'code-quality'
      });
    }
  }

  getAllTasks() {
    return this.tasks;
  }

  getMetrics() {
    return {
      total: this.tasks.length,
      byPriority: {
        high: this.tasks.filter(t => t.priority === 'high').length,
        normal: this.tasks.filter(t => t.priority === 'normal').length,
        low: this.tasks.filter(t => t.priority === 'low').length
      }
    };
  }
}

module.exports = TaskCollector;
