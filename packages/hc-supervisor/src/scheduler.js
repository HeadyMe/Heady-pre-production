// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
// ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
// ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
// ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
// ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
// ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
// ║                                                                  ║
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
// ║  FILE: packages/hc-supervisor/src/scheduler.js                    ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Scheduler - Concurrency control, dynamic scaling, and resource management.
 *
 * PROTOCOL:
 *   - Read maxConcurrentTasks, maxParallelAgents, priorities from config.
 *   - Adjust concurrency when error rates or latency increase.
 *   - Enforce hot/warm/cold path priority levels.
 *   - Bulkhead: separate critical from noisy workloads.
 */

class Scheduler {
  constructor(resourcePolicies = {}) {
    const concurrency = resourcePolicies.concurrency || {};
    this.maxConcurrentTasks = concurrency.maxConcurrentTasks || 8;
    this.maxParallelAgents = concurrency.maxParallelAgents || 6;
    this.maxTasksPerUser = concurrency.maxTasksPerUser || 4;
    this.agentTimeoutMs = (resourcePolicies.timeouts || {}).agentExecutionMs || 120000;

    // Dynamic scaling
    this.dynamicScaling = concurrency.dynamicScaling || { enabled: false };
    this.currentConcurrency = this.maxConcurrentTasks;

    // Tracking
    this.activeTasks = 0;
    this.queuedTasks = [];
    this.metrics = {
      totalExecuted: 0,
      totalErrors: 0,
      avgLatencyMs: 0,
      lastAdjustment: null,
    };
  }

  /**
   * Acquire a slot to execute a task.
   * Returns true if slot acquired, false if should queue/reject.
   */
  canExecute() {
    return this.activeTasks < this.currentConcurrency;
  }

  acquire() {
    if (!this.canExecute()) return false;
    this.activeTasks++;
    return true;
  }

  release(latencyMs, hadError) {
    this.activeTasks = Math.max(0, this.activeTasks - 1);
    this.metrics.totalExecuted++;
    if (hadError) this.metrics.totalErrors++;

    // Rolling average latency
    const alpha = 0.1;
    this.metrics.avgLatencyMs =
      this.metrics.avgLatencyMs * (1 - alpha) + latencyMs * alpha;

    // Dynamic scaling adjustment
    if (this.dynamicScaling.enabled) {
      this._adjustConcurrency();
    }
  }

  _adjustConcurrency() {
    const errorRate =
      this.metrics.totalExecuted > 0
        ? this.metrics.totalErrors / this.metrics.totalExecuted
        : 0;
    const utilization = this.activeTasks / this.currentConcurrency;

    const scaleUp = this.dynamicScaling.scaleUpThreshold || 0.85;
    const scaleDown = this.dynamicScaling.scaleDownThreshold || 0.3;
    const cooldown = (this.dynamicScaling.cooldownSeconds || 60) * 1000;

    if (this.metrics.lastAdjustment && Date.now() - this.metrics.lastAdjustment < cooldown) {
      return; // cooldown period
    }

    if (errorRate > 0.15) {
      // High error rate: reduce concurrency
      this.currentConcurrency = Math.max(1, this.currentConcurrency - 1);
      this.metrics.lastAdjustment = Date.now();
    } else if (utilization > scaleUp && this.currentConcurrency < this.maxConcurrentTasks) {
      this.currentConcurrency = Math.min(this.maxConcurrentTasks, this.currentConcurrency + 1);
      this.metrics.lastAdjustment = Date.now();
    } else if (utilization < scaleDown && this.currentConcurrency > 1) {
      this.currentConcurrency = Math.max(1, this.currentConcurrency - 1);
      this.metrics.lastAdjustment = Date.now();
    }
  }

  getStatus() {
    return {
      activeTasks: this.activeTasks,
      currentConcurrency: this.currentConcurrency,
      maxConcurrentTasks: this.maxConcurrentTasks,
      maxParallelAgents: this.maxParallelAgents,
      metrics: { ...this.metrics },
    };
  }
}

module.exports = { Scheduler };
