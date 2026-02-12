// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: anti-stagnation-watchdog.js                               ║
// ║  LAYER: intelligence                                             ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Anti-Stagnation Watchdog
 * No progress for > 5 min → auto-reassign or escalate immediately
 * Connection fails latency target → pause and reroute instantly
 * Circular dependency detected → break lowest-priority edge and proceed
 */

const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(__dirname, "intelligence-manifest.json"), "utf8")
);

class HeadyAntiStagnationWatchdog extends EventEmitter {
  constructor(scheduler, allocator, speedController) {
    super();
    this.scheduler = scheduler;
    this.allocator = allocator;
    this.speedController = speedController;
    this.checkIntervalMs = (MANIFEST.execution.stagnation_check_interval_sec || 60) * 1000;
    this.stagnationLimitMs = (MANIFEST.execution.stagnation_limit_sec || 300) * 1000;
    this.timer = null;
    this.channelLatencies = new Map();
    this.interventions = [];
    this.metrics = {
      checks: 0,
      stagnations_detected: 0,
      reassignments: 0,
      escalations: 0,
      force_completes: 0,
      latency_pauses: 0,
      dependency_breaks: 0,
    };
  }

  /**
   * Start the watchdog loop
   */
  start() {
    if (this.timer) return;
    console.log(`[Intelligence] Anti-stagnation watchdog started (${this.checkIntervalMs / 1000}s interval)`);
    this.timer = setInterval(() => this.check(), this.checkIntervalMs);
    this.check(); // Run immediately
  }

  /**
   * Stop the watchdog
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("[Intelligence] Anti-stagnation watchdog stopped");
    }
  }

  /**
   * Core watchdog check — runs every 60s
   */
  check() {
    this.metrics.checks++;
    const actions = [];

    // 1. Check for stagnant tasks
    const stagnant = this.scheduler.getStagnantTasks();
    for (const task of stagnant) {
      const intervention = this._handleStagnation(task);
      if (intervention) actions.push(intervention);
    }

    // 2. Check channel latencies
    const latencyIssues = this._checkChannelLatencies();
    actions.push(...latencyIssues);

    // 3. Check for circular dependencies in pending tasks
    const circularFixes = this._checkCircularDependencies();
    actions.push(...circularFixes);

    if (actions.length > 0) {
      this.emit("watchdog_actions", actions);
    }

    return actions;
  }

  /**
   * Handle a stagnant task through escalation chain:
   * reassign → escalate_priority → force_complete
   */
  _handleStagnation(task) {
    this.metrics.stagnations_detected++;
    const chain = MANIFEST.anti_stagnation.escalation_chain;
    const retryCount = task.retry_count || 0;
    const actionIndex = Math.min(retryCount, chain.length - 1);
    const action = chain[actionIndex];

    let intervention;

    switch (action) {
      case "reassign": {
        // Reset stagnation timer and reassign
        task.stagnation_start = Date.now();
        task.retry_count = retryCount + 1;
        task.assigned_agent = null;
        task.status = "pending";
        this.metrics.reassignments++;
        intervention = {
          type: "reassign",
          task_id: task.id,
          priority: task.priority,
          stagnation_ms: Date.now() - (task.started_at || Date.now()),
          retry: retryCount + 1,
        };
        // Trigger reallocation
        this.allocator.allocate();
        break;
      }

      case "escalate_priority": {
        task.stagnation_start = Date.now();
        task.retry_count = retryCount + 1;
        this.speedController.escalateTask(task.id, "stagnation_escalation");
        this.metrics.escalations++;
        intervention = {
          type: "escalate",
          task_id: task.id,
          new_priority: "P0",
          stagnation_ms: Date.now() - (task.started_at || Date.now()),
          retry: retryCount + 1,
        };
        break;
      }

      case "force_complete": {
        task.status = "completed";
        task.completed_at = Date.now();
        task.result = { forced: true, reason: "stagnation_limit_exceeded" };
        this.scheduler.completedTasks.add(task.id);
        this.metrics.force_completes++;
        intervention = {
          type: "force_complete",
          task_id: task.id,
          stagnation_ms: Date.now() - (task.started_at || Date.now()),
          retry: retryCount + 1,
        };
        // Recompute DAG to unblock dependents
        this.scheduler.recomputeDAG();
        break;
      }

      default:
        break;
    }

    if (intervention) {
      intervention.timestamp = new Date().toISOString();
      this.interventions.push(intervention);
      if (this.interventions.length > 5000) {
        this.interventions = this.interventions.slice(-2500);
      }
      console.warn(`[Intelligence] Stagnation intervention: ${action} on ${task.id}`);
      this.emit("stagnation_intervention", intervention);
    }

    return intervention;
  }

  /**
   * Record and check channel latencies against targets
   */
  recordLatency(channel, latencyMs) {
    this.channelLatencies.set(channel, {
      latency_ms: latencyMs,
      timestamp: Date.now(),
    });
  }

  _checkChannelLatencies() {
    const actions = [];
    const targets = MANIFEST.channels.latency_targets_ms;

    for (const [channel, targetMs] of Object.entries(targets)) {
      const recorded = this.channelLatencies.get(channel);
      if (!recorded) continue;

      // Only check recent readings (within last 2 minutes)
      if (Date.now() - recorded.timestamp > 120000) continue;

      if (recorded.latency_ms > targetMs) {
        this.metrics.latency_pauses++;
        const action = {
          type: "latency_exceeded",
          channel,
          target_ms: targetMs,
          actual_ms: recorded.latency_ms,
          timestamp: new Date().toISOString(),
        };

        if (MANIFEST.channels.pause_on_latency_miss) {
          action.action_taken = "pause_and_reroute";
        }

        actions.push(action);
        this.emit("latency_exceeded", action);
      }
    }

    return actions;
  }

  /**
   * Check for and break circular dependencies in pending tasks
   */
  _checkCircularDependencies() {
    const fixes = [];

    for (const [taskId, task] of this.scheduler.tasks) {
      if (task.status !== "pending") continue;

      if (this.scheduler._detectCycle(taskId)) {
        const broken = this.scheduler._breakCycle(taskId);
        if (broken) {
          this.metrics.dependency_breaks++;
          fixes.push({
            type: "circular_dep_broken",
            task_id: taskId,
            broken_edge: broken,
            timestamp: new Date().toISOString(),
          });
          this.emit("circular_dep_broken", { taskId, broken });
        }
      }
    }

    return fixes;
  }

  getState() {
    return {
      running: !!this.timer,
      check_interval_sec: this.checkIntervalMs / 1000,
      stagnation_limit_sec: this.stagnationLimitMs / 1000,
      metrics: this.metrics,
      channel_latencies: Object.fromEntries(this.channelLatencies),
      recent_interventions: this.interventions.slice(-20),
      current_stagnant: this.scheduler.getStagnantTasks().map((t) => ({
        id: t.id,
        priority: t.priority,
        running_ms: Date.now() - (t.started_at || Date.now()),
        retry_count: t.retry_count,
      })),
    };
  }
}

module.exports = HeadyAntiStagnationWatchdog;
