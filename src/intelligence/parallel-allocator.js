// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: parallel-allocator.js                                     ║
// ║  LAYER: intelligence                                             ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Dynamic Parallel Allocator
 * Launches tasks the instant they're ready, respects concurrency cap
 * Zero wait, zero idle — backfills with lower-priority work
 * 20% fair-access minimum for underserved tasks
 * Preemptive resource reservation for high-priority tasks
 */

const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(__dirname, "intelligence-manifest.json"), "utf8")
);

class HeadyParallelAllocator extends EventEmitter {
  constructor(scheduler) {
    super();
    this.scheduler = scheduler;
    this.maxConcurrency = MANIFEST.execution.max_concurrency;
    this.fairAccessMinPct = MANIFEST.execution.fair_access_minimum_pct;
    this.activeSlots = new Map(); // agentId → taskId
    this.reservedSlots = new Map(); // taskId → reserved_at
    this.agentPool = new Map(); // agentId → { status, capabilities, load }
    this.allocationHistory = [];
    this.metrics = {
      total_allocated: 0,
      total_preempted: 0,
      total_backfilled: 0,
      fair_access_allocations: 0,
      idle_cycles: 0,
      utilization_samples: [],
    };

    // Wire scheduler events
    this.scheduler.on("task_completed", () => this._onTaskComplete());
    this.scheduler.on("task_failed", () => this._onTaskComplete());
    this.scheduler.on("dag_recomputed", (data) => this._onDAGRecomputed(data));
  }

  /**
   * Register an agent (worker) in the pool
   */
  registerAgent(agentId, capabilities = {}) {
    this.agentPool.set(agentId, {
      id: agentId,
      status: "idle",
      capabilities,
      current_task: null,
      tasks_completed: 0,
      registered_at: Date.now(),
    });
    this.emit("agent_registered", { agentId });
    // Immediately try to allocate work
    this.allocate();
    return this.agentPool.get(agentId);
  }

  /**
   * Remove an agent from the pool
   */
  removeAgent(agentId) {
    const agent = this.agentPool.get(agentId);
    if (agent && agent.current_task) {
      this.activeSlots.delete(agentId);
    }
    this.agentPool.delete(agentId);
    this.emit("agent_removed", { agentId });
  }

  /**
   * Core allocation loop — called on every state change
   * Fills available slots with highest-priority ready tasks
   */
  allocate() {
    const running = this.scheduler.getRunningTasks().length;
    const available = this.maxConcurrency - running;

    if (available <= 0) return { allocated: 0, reason: "at_capacity" };

    const ready = this.scheduler.getReadyTasks();
    if (ready.length === 0) {
      this.metrics.idle_cycles++;
      return { allocated: 0, reason: "no_ready_tasks" };
    }

    // Fair access: reserve 20% of slots for P2/P3 if available
    const fairSlots = Math.max(1, Math.floor(this.maxConcurrency * this.fairAccessMinPct / 100));
    const p2p3Ready = ready.filter((t) => t.priority === "P2" || t.priority === "P3");
    const p0p1Ready = ready.filter((t) => t.priority === "P0" || t.priority === "P1");

    let allocated = 0;
    const toAllocate = [];

    // Allocate P0/P1 first (up to available - fairSlots if P2/P3 waiting)
    const p0p1Limit = p2p3Ready.length > 0 ? Math.max(0, available - fairSlots) : available;
    for (let i = 0; i < Math.min(p0p1Ready.length, p0p1Limit); i++) {
      toAllocate.push(p0p1Ready[i]);
    }

    // Fill remaining with P2/P3 (fair access)
    const remaining = available - toAllocate.length;
    for (let i = 0; i < Math.min(p2p3Ready.length, remaining); i++) {
      toAllocate.push(p2p3Ready[i]);
      this.metrics.fair_access_allocations++;
    }

    // If still have slots and more P0/P1 ready, fill those too
    if (toAllocate.length < available) {
      const extraP0P1 = p0p1Ready.slice(p0p1Limit);
      for (let i = 0; i < Math.min(extraP0P1.length, available - toAllocate.length); i++) {
        toAllocate.push(extraP0P1[i]);
      }
    }

    // Backfill with any remaining ready tasks
    if (toAllocate.length < available && MANIFEST.execution.zero_idle_backfill) {
      const allocatedIds = new Set(toAllocate.map((t) => t.id));
      const backfill = ready.filter((t) => !allocatedIds.has(t.id));
      for (let i = 0; i < Math.min(backfill.length, available - toAllocate.length); i++) {
        toAllocate.push(backfill[i]);
        this.metrics.total_backfilled++;
      }
    }

    // Execute allocations
    for (const task of toAllocate) {
      const agent = this._findAvailableAgent(task);
      const agentId = agent ? agent.id : `auto-agent-${Date.now()}-${allocated}`;

      if (!agent) {
        // Auto-create agent if needed
        this.registerAgent(agentId, { auto_created: true });
      }

      this.scheduler.startTask(task.id, agentId);
      this.activeSlots.set(agentId, task.id);

      if (this.agentPool.has(agentId)) {
        const a = this.agentPool.get(agentId);
        a.status = "busy";
        a.current_task = task.id;
      }

      allocated++;
      this.metrics.total_allocated++;

      this.allocationHistory.push({
        timestamp: new Date().toISOString(),
        task_id: task.id,
        agent_id: agentId,
        priority: task.priority,
        speed_mode: task.speed_mode,
      });
    }

    // Track utilization
    const totalAgents = Math.max(this.agentPool.size, this.maxConcurrency);
    const busyAgents = [...this.agentPool.values()].filter((a) => a.status === "busy").length;
    this.metrics.utilization_samples.push({
      timestamp: Date.now(),
      utilization: totalAgents > 0 ? busyAgents / totalAgents : 0,
    });
    // Keep bounded
    if (this.metrics.utilization_samples.length > 1000) {
      this.metrics.utilization_samples = this.metrics.utilization_samples.slice(-500);
    }

    if (allocated > 0) {
      this.emit("tasks_allocated", { count: allocated, tasks: toAllocate.map((t) => t.id) });
    }

    return { allocated, tasks: toAllocate.map((t) => ({ id: t.id, priority: t.priority })) };
  }

  /**
   * Preemptive reservation — reserve slots for high-priority tasks about to become ready
   */
  reserveForUpcoming() {
    if (!MANIFEST.execution.preemptive_warmup) return [];

    const reserved = [];
    for (const [, task] of this.scheduler.tasks) {
      if (task.status !== "pending") continue;
      if (task.priority !== "P0") continue;

      const deps = this.scheduler.edges.get(task.id) || new Set();
      const completedDeps = [...deps].filter((d) => this.scheduler.completedTasks.has(d));
      const remainingDeps = deps.size - completedDeps.length;

      // If only 1 dependency remaining and it's currently running, pre-reserve
      if (remainingDeps === 1) {
        const runningDep = [...deps].find((d) => {
          const dt = this.scheduler.tasks.get(d);
          return dt && dt.status === "running";
        });

        if (runningDep && !this.reservedSlots.has(task.id)) {
          this.reservedSlots.set(task.id, Date.now());
          reserved.push(task.id);
        }
      }
    }

    return reserved;
  }

  /**
   * Auto-crash critical path — add agents or skip optional steps if critical path is too long
   */
  crashCriticalPath() {
    if (!MANIFEST.execution.auto_crash_critical_path) return null;

    const criticalPath = this.scheduler.criticalPath;
    if (criticalPath.length === 0) return null;

    const actions = [];
    for (const taskId of criticalPath) {
      const task = this.scheduler.tasks.get(taskId);
      if (!task || task.status !== "pending") continue;

      // Escalate to P0 if not already
      if (task.priority !== "P0") {
        this.scheduler.reprioritize(taskId, "P0");
        actions.push({ action: "escalated", task_id: taskId, to: "P0" });
      }
    }

    return actions.length > 0 ? actions : null;
  }

  /**
   * Handle task completion — free slot, reallocate
   */
  _onTaskComplete() {
    // Free agent slots for completed tasks
    for (const [agentId, taskId] of this.activeSlots) {
      const task = this.scheduler.tasks.get(taskId);
      if (task && (task.status === "completed" || task.status === "failed")) {
        this.activeSlots.delete(agentId);
        if (this.agentPool.has(agentId)) {
          const agent = this.agentPool.get(agentId);
          agent.status = "idle";
          agent.current_task = null;
          agent.tasks_completed++;
        }
        // Clear reservation
        this.reservedSlots.delete(taskId);
      }
    }

    // Immediately allocate new work
    this.allocate();
    this.reserveForUpcoming();
  }

  _onDAGRecomputed() {
    this.allocate();
    this.reserveForUpcoming();
    this.crashCriticalPath();
  }

  _findAvailableAgent(task) {
    for (const [, agent] of this.agentPool) {
      if (agent.status === "idle") return agent;
    }
    return null;
  }

  getState() {
    const agents = [...this.agentPool.values()];
    return {
      max_concurrency: this.maxConcurrency,
      active_slots: this.activeSlots.size,
      available_slots: this.maxConcurrency - this.activeSlots.size,
      reserved_slots: this.reservedSlots.size,
      total_agents: agents.length,
      idle_agents: agents.filter((a) => a.status === "idle").length,
      busy_agents: agents.filter((a) => a.status === "busy").length,
      fair_access_minimum_pct: this.fairAccessMinPct,
      metrics: {
        total_allocated: this.metrics.total_allocated,
        total_preempted: this.metrics.total_preempted,
        total_backfilled: this.metrics.total_backfilled,
        fair_access_allocations: this.metrics.fair_access_allocations,
        idle_cycles: this.metrics.idle_cycles,
        avg_utilization: this._avgUtilization(),
      },
      recent_allocations: this.allocationHistory.slice(-20),
    };
  }

  _avgUtilization() {
    const samples = this.metrics.utilization_samples;
    if (samples.length === 0) return 0;
    const sum = samples.reduce((s, x) => s + x.utilization, 0);
    return Math.round((sum / samples.length) * 100) / 100;
  }
}

module.exports = HeadyParallelAllocator;
