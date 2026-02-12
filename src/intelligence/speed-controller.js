// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: speed-controller.js                                       ║
// ║  LAYER: intelligence                                             ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Speed Mode Controller
 * Auto-escalates critical path tasks to MAX speed
 * Manages speed modes: MAX (0.9), ON (0.8), OFF (0.7)
 * Handles automated task crashing — adds agents, skips optional steps
 */

const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(__dirname, "intelligence-manifest.json"), "utf8")
);

class HeadySpeedController extends EventEmitter {
  constructor(scheduler, allocator) {
    super();
    this.scheduler = scheduler;
    this.allocator = allocator;
    this.speedOverrides = new Map(); // taskId → forced speed mode
    this.escalationLog = [];
    this.metrics = {
      escalations: 0,
      crashes: 0,
      speed_switches: 0,
      skipped_steps: 0,
    };
  }

  /**
   * Evaluate and apply speed modes to all active tasks
   * Critical path → MAX, high fan-out → ON, everything else → OFF
   */
  evaluateAll() {
    const criticalPath = new Set(this.scheduler.criticalPath);
    const running = this.scheduler.getRunningTasks();
    const changes = [];

    for (const task of running) {
      let targetMode;

      // Forced override takes precedence
      if (this.speedOverrides.has(task.id)) {
        targetMode = this.speedOverrides.get(task.id);
      }
      // Critical path always MAX
      else if (criticalPath.has(task.id)) {
        targetMode = "MAX";
      }
      // High fan-out (unblocks 3+ tasks) → ON
      else if (this._getFanOut(task.id) >= 3) {
        targetMode = "ON";
      }
      // Default from priority
      else {
        targetMode = MANIFEST.priorities[task.priority]?.speed_mode || "OFF";
      }

      if (task.speed_mode !== targetMode) {
        const oldMode = task.speed_mode;
        task.speed_mode = targetMode;
        task.speed_weight = MANIFEST.speed_modes[targetMode]?.weight || 0.7;
        this.metrics.speed_switches++;

        changes.push({
          task_id: task.id,
          from: oldMode,
          to: targetMode,
          reason: criticalPath.has(task.id) ? "critical_path" :
                  this._getFanOut(task.id) >= 3 ? "high_fan_out" : "priority_default",
        });

        this._logEscalation("speed_switch", {
          task_id: task.id,
          from: oldMode,
          to: targetMode,
        });
      }
    }

    if (changes.length > 0) {
      this.emit("speed_changes", changes);
    }
    return changes;
  }

  /**
   * Auto-escalate a task to higher priority + MAX speed
   */
  escalateTask(taskId, reason) {
    const task = this.scheduler.tasks.get(taskId);
    if (!task) return null;

    const oldPriority = task.priority;
    const newPriority = this._higherPriority(task.priority);

    if (newPriority !== task.priority) {
      this.scheduler.reprioritize(taskId, newPriority);
      this.speedOverrides.set(taskId, "MAX");
      this.metrics.escalations++;

      this._logEscalation("auto_escalate", {
        task_id: taskId,
        from_priority: oldPriority,
        to_priority: newPriority,
        reason,
      });

      this.emit("task_escalated", { taskId, from: oldPriority, to: newPriority, reason });
    }

    return { taskId, oldPriority, newPriority, speed_mode: "MAX", reason };
  }

  /**
   * Automated Task Crashing
   * Critical path too long → escalate priorities, skip optional steps
   */
  crashIfNeeded() {
    const criticalPath = this.scheduler.criticalPath;
    if (criticalPath.length <= 2) return null;

    const actions = [];

    for (const taskId of criticalPath) {
      const task = this.scheduler.tasks.get(taskId);
      if (!task || task.status === "completed") continue;

      // Force MAX speed on all critical path tasks
      if (task.speed_mode !== "MAX") {
        this.speedOverrides.set(taskId, "MAX");
        task.speed_mode = "MAX";
        task.speed_weight = 0.9;
        actions.push({ action: "force_max_speed", task_id: taskId });
      }

      // Escalate non-P0 critical path tasks
      if (task.priority !== "P0" && task.status === "pending") {
        this.scheduler.reprioritize(taskId, "P0");
        actions.push({ action: "escalate_to_P0", task_id: taskId });
      }

      // Skip optional steps for MAX speed tasks
      if (MANIFEST.speed_modes.MAX.skip_optional_steps && !task.metadata._optional_skipped) {
        task.metadata._optional_skipped = true;
        this.metrics.skipped_steps++;
        actions.push({ action: "skip_optional_steps", task_id: taskId });
      }
    }

    if (actions.length > 0) {
      this.metrics.crashes++;
      this._logEscalation("auto_crash", { critical_path_length: criticalPath.length, actions });
      this.emit("critical_path_crashed", actions);
    }

    return actions.length > 0 ? actions : null;
  }

  /**
   * Get speed configuration for a task
   */
  getSpeedConfig(taskId) {
    const task = this.scheduler.tasks.get(taskId);
    if (!task) return null;

    const override = this.speedOverrides.get(taskId);
    const effectiveMode = override || task.speed_mode;
    const config = MANIFEST.speed_modes[effectiveMode] || MANIFEST.speed_modes.OFF;

    return {
      task_id: taskId,
      priority: task.priority,
      speed_mode: effectiveMode,
      is_critical_path: this.scheduler.criticalPath.includes(taskId),
      is_override: !!override,
      config,
    };
  }

  _getFanOut(taskId) {
    const dependents = this.scheduler.reverseEdges.get(taskId);
    return dependents ? dependents.size : 0;
  }

  _higherPriority(current) {
    const order = ["P0", "P1", "P2", "P3"];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : current;
  }

  _logEscalation(event, data) {
    this.escalationLog.push({
      timestamp: new Date().toISOString(),
      event,
      ...data,
    });
    if (this.escalationLog.length > 5000) {
      this.escalationLog = this.escalationLog.slice(-2500);
    }
  }

  getState() {
    return {
      speed_overrides: Object.fromEntries(this.speedOverrides),
      metrics: this.metrics,
      recent_escalations: this.escalationLog.slice(-20),
      speed_modes: MANIFEST.speed_modes,
    };
  }
}

module.exports = HeadySpeedController;
