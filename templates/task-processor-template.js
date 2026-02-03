/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              TASK PROCESSOR TEMPLATE                         ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📥 RECEIVE       🎯 VALIDATE       🔧 PROCESS        ✅ COMPLETE
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │  Task  │─────▶│  Check   │─────▶│ Execute  │─────▶│  Track   │
 *    │  Queue │      │  Rules   │      │  Logic   │      │  Result  │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 * 
 * Template for creating task processors that integrate with RoutingOptimizer.
 */

const { EventEmitter } = require('events');

class [PROCESSOR_NAME] extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      concurrency: config.concurrency || 5,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      ...config
    };

    this.activeTasks = new Map();
    this.metrics = {
      total: 0,
      successful: 0,
      failed: 0,
      avgDuration: 0
    };
  }

  /**
   * Process a task
   */
  async processTask(task) {
    const startTime = Date.now();
    const taskId = task.id || `task-${Date.now()}`;
    
    this.activeTasks.set(taskId, {
      task,
      startTime,
      status: 'processing'
    });
    
    this.emit('task-started', { taskId, task });
    
    try {
      // Validate task
      this.validateTask(task);
      
      // Execute with timeout
      const result = await this.executeWithTimeout(task);
      
      // Track success
      const duration = Date.now() - startTime;
      this.recordSuccess(duration);
      
      this.activeTasks.delete(taskId);
      this.emit('task-completed', { taskId, task, result, duration });
      
      return { success: true, result, duration };
      
    } catch (error) {
      // Track failure
      const duration = Date.now() - startTime;
      this.recordFailure();
      
      this.activeTasks.delete(taskId);
      this.emit('task-failed', { taskId, task, error: error.message, duration });
      
      throw error;
    }
  }

  /**
   * Validate task
   */
  validateTask(task) {
    if (!task) {
      throw new Error('Task is required');
    }
    
    if (!task.type) {
      throw new Error('Task type is required');
    }
    
    // Add your validation logic here
  }

  /**
   * Execute task with timeout
   */
  async executeWithTimeout(task) {
    return Promise.race([
      this.execute(task),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Task timeout')), this.config.timeout)
      )
    ]);
  }

  /**
   * Execute task logic (Override this method)
   */
  async execute(task) {
    // TODO: Implement your task processing logic here
    
    switch (task.type) {
      case 'example':
        return await this.handleExample(task);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  /**
   * Example task handler
   */
  async handleExample(task) {
    // Your logic here
    return {
      processed: true,
      data: task.data
    };
  }

  /**
   * Record successful execution
   */
  recordSuccess(duration) {
    this.metrics.total++;
    this.metrics.successful++;
    
    // Update average duration
    const total = this.metrics.successful;
    this.metrics.avgDuration = 
      (this.metrics.avgDuration * (total - 1) + duration) / total;
  }

  /**
   * Record failure
   */
  recordFailure() {
    this.metrics.total++;
    this.metrics.failed++;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.total > 0 
        ? (this.metrics.successful / this.metrics.total * 100).toFixed(2) + '%'
        : 'N/A',
      avgDuration: this.metrics.avgDuration.toFixed(0) + 'ms',
      activeTasks: this.activeTasks.size
    };
  }
}

module.exports = [PROCESSOR_NAME];

// Example usage
if (require.main === module) {
  const processor = new [PROCESSOR_NAME]();
  
  // Listen to events
  processor.on('task-started', ({ taskId }) => {
    console.log(`🚀 Task started: ${taskId}`);
  });
  
  processor.on('task-completed', ({ taskId, duration }) => {
    console.log(`✅ Task completed: ${taskId} in ${duration}ms`);
  });
  
  processor.on('task-failed', ({ taskId, error }) => {
    console.error(`❌ Task failed: ${taskId} - ${error}`);
  });
  
  // Example task
  const exampleTask = {
    id: 'example-1',
    type: 'example',
    data: { message: 'Hello Heady!' }
  };
  
  processor.processTask(exampleTask)
    .then(result => console.log('Result:', result))
    .catch(err => console.error('Error:', err));
}
