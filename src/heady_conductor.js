/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           HEADY CONDUCTOR - Pattern Change Handler          ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📢 RECEIVE       🧠 ANALYZE        📋 DECIDE         ✅ EXECUTE
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │Pattern │─────▶│ Assess   │─────▶│ Create   │─────▶│ Route    │
 *    │ Change │      │ Impact   │      │ Tasks    │      │ to Queue │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 * 
 * Responsibilities:
 * - Receive pattern change notifications from HeadyPatternRecognizer
 * - Analyze impact and determine appropriate response
 * - Create tasks for necessary adaptations
 * - Route tasks to RoutingOptimizer
 * - Maintain pattern change history
 * - Generate actionable recommendations
 * - Coordinate system-wide pattern updates
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class HeadyConductor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      autoCreateTasks: config.autoCreateTasks !== false,
      rootDir: config.rootDir || process.cwd(),
      ...config
    };

    // Pattern change tracking
    this.handledChanges = [];
    this.createdTasks = [];
    
    // Metrics
    this.metrics = {
      changesReceived: 0,
      tasksCreated: 0,
      highImpactChanges: 0,
      lastUpdate: null
    };
  }

  /**
   * Handle pattern change notification
   */
  async handlePatternChange(notification) {
    const { change, advice, taskRecommendation } = notification;
    
    this.metrics.changesReceived++;
    if (change.impact === 'HIGH') {
      this.metrics.highImpactChanges++;
    }
    
    console.log(`[HEADY CONDUCTOR] Handling ${change.type}: ${change.patternName}`);
    
    // Analyze and decide
    const decision = await this.analyzeAndDecide(change, advice, taskRecommendation);
    
    // Execute decision
    if (decision.createTask) {
      await this.createTask(decision.task);
    }
    
    // Log decision
    await this.logDecision(change, decision);
    
    // Store handled change
    this.handledChanges.push({
      change,
      advice,
      decision,
      timestamp: new Date().toISOString()
    });
    
    this.metrics.lastUpdate = new Date().toISOString();
    
    // Emit completion
    this.emit('change-handled', { change, decision });
    
    return decision;
  }

  /**
   * Analyze change and decide on action
   */
  async analyzeAndDecide(change, advice, taskRecommendation) {
    const decision = {
      changeType: change.type,
      pattern: change.patternName,
      impact: change.impact,
      createTask: false,
      task: null,
      reasoning: []
    };
    
    // High impact changes always create tasks
    if (change.impact === 'HIGH') {
      decision.createTask = true;
      decision.reasoning.push('High impact change requires immediate attention');
    }
    
    // Use task recommendation from pattern recognizer
    if (taskRecommendation.shouldCreate) {
      decision.createTask = true;
      decision.task = taskRecommendation.task;
      decision.reasoning.push('Pattern recognizer recommends task creation');
    }
    
    // Pattern removal is critical
    if (change.type === 'PATTERN_REMOVED') {
      decision.createTask = true;
      decision.task = {
        type: 'critical-review',
        priority: 'critical',
        description: `URGENT: ${change.patternName} pattern removed - verify intentional`,
        category: change.category,
        data: change,
        actions: advice.actions
      };
      decision.reasoning.push('Pattern removal requires urgent review');
    }
    
    // Significant pattern changes
    if (change.type === 'PATTERN_CHANGE' && change.impact === 'HIGH') {
      decision.createTask = true;
      decision.task = {
        type: 'pattern-review',
        priority: 'high',
        description: `Review ${change.patternName} change: ${change.changePercent}`,
        category: change.category,
        data: change,
        actions: advice.actions
      };
      decision.reasoning.push('Significant pattern change detected');
    }
    
    return decision;
  }

  /**
   * Create task and route to optimizer
   */
  async createTask(task) {
    if (!task) return;
    
    console.log(`[HEADY CONDUCTOR] Creating task: ${task.description}`);
    
    // Add metadata
    task.id = `conductor-${Date.now()}`;
    task.createdBy = 'HeadyConductor';
    task.createdAt = new Date().toISOString();
    task.source = 'pattern-change';
    
    // Store created task
    this.createdTasks.push(task);
    this.metrics.tasksCreated++;
    
    // Emit task for routing
    this.emit('task-created', task);
    
    return task;
  }

  /**
   * Log decision to audit trail
   */
  async logDecision(change, decision) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'conductor_decision',
      change: {
        type: change.type,
        pattern: change.patternName,
        impact: change.impact
      },
      decision: {
        createTask: decision.createTask,
        reasoning: decision.reasoning
      }
    };
    
    const logPath = path.join(this.config.rootDir, 'audit_logs', 'conductor_decisions.jsonl');
    
    try {
      await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    } catch (err) {
      console.error('[HEADY CONDUCTOR] Failed to log decision:', err.message);
    }
  }

  /**
   * Get conductor status
   */
  getStatus() {
    return {
      active: true,
      metrics: this.metrics,
      recentChanges: this.handledChanges.slice(-5),
      pendingTasks: this.createdTasks.filter(t => !t.completed).length
    };
  }

  /**
   * Get conductor report
   */
  getReport() {
    return {
      summary: {
        changesHandled: this.handledChanges.length,
        tasksCreated: this.metrics.tasksCreated,
        highImpactChanges: this.metrics.highImpactChanges,
        lastUpdate: this.metrics.lastUpdate
      },
      recentChanges: this.handledChanges.slice(-10),
      createdTasks: this.createdTasks.slice(-10),
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = HeadyConductor;
