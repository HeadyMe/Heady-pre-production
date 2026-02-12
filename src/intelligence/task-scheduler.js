// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: task-scheduler.js                                         ║
// ║  LAYER: intelligence                                             ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Heady Full-Stack Intelligence Protocol v1.2
 * DAG-based Topological Scheduler with Priority Queue
 *
 * - Dependency graph enforcement (no circular deps)
 * - Topological sort for execution ordering
 * - Priority-weighted task queue (P0→P3)
 * - Recomputes on every task completion
 * - Critical path identification
 */

const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(__dirname, "intelligence-manifest.json"), "utf8")
);

const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

class HeadyTaskScheduler extends EventEmitter {
  constructor() {
    super();
    this.tasks = new Map();
    this.edges = new Map();       // taskId → Set<dependencyId>
    this.reverseEdges = new Map(); // taskId → Set<dependentId>
    this.completedTasks = new Set();
    this.failedTasks = new Set();
    this.learningLog = [];
    this.criticalPath = [];
    this.lastRecompute = 0;
  }

  addTask(task) {
    const t = {
      id: task.id,
      type: task.type || "generic",
      priority: task.priority || "P2",
      status: "pending",
      dependencies: task.dependencies || [],
      payload: task.payload || {},
      created_at: Date.now(),
      started_at: null,
      completed_at: null,
      estimated_duration_ms: task.estimated_duration_ms || 30000,
      actual_duration_ms: null,
      assigned_agent: null,
      speed_mode: MANIFEST.priorities[task.priority || "P2"]?.speed_mode || "OFF",
      speed_weight: MANIFEST.priorities[task.priority || "P2"]?.speed_weight || 0.7,
      stagnation_start: null,
      retry_count: 0,
      social_impact_tag: task.social_impact_tag || null,
      metadata: task.metadata || {},
    };

    this.tasks.set(t.id, t);
    this.edges.set(t.id, new Set(t.dependencies));

    // Build reverse edges
    for (const dep of t.dependencies) {
      if (!this.reverseEdges.has(dep)) this.reverseEdges.set(dep, new Set());
      this.reverseEdges.get(dep).add(t.id);
    }

    // Check for circular dependencies
    if (this._detectCycle(t.id)) {
      const broken = this._breakCycle(t.id);
      this._log("circular_dep_broken", { task_id: t.id, broken_edge: broken });
    }

    this.emit("task_added", t);
    return t;
  }

  removeTask(taskId) {
    this.tasks.delete(taskId);
    this.edges.delete(taskId);
    // Clean reverse edges
    for (const [, deps] of this.reverseEdges) {
      deps.delete(taskId);
    }
    this.reverseEdges.delete(taskId);
  }

  completeTask(taskId, result) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = "completed";
    task.completed_at = Date.now();
    task.actual_duration_ms = task.started_at ? task.completed_at - task.started_at : 0;
    task.result = result;
    this.completedTasks.add(taskId);

    this._log("task_completed", {
      task_id: taskId,
      priority: task.priority,
      estimated_ms: task.estimated_duration_ms,
      actual_ms: task.actual_duration_ms,
      speed_mode: task.speed_mode,
    });

    // Recompute DAG — launch newly unblocked tasks
    if (MANIFEST.execution.recompute_on_completion) {
      this.recomputeDAG();
    }

    this.emit("task_completed", task);
    return task;
  }

  failTask(taskId, error) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = "failed";
    task.completed_at = Date.now();
    task.error = error;
    this.failedTasks.add(taskId);

    this._log("task_failed", { task_id: taskId, error, priority: task.priority });
    this.emit("task_failed", task);
    return task;
  }

  startTask(taskId, agentId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = "running";
    task.started_at = Date.now();
    task.assigned_agent = agentId;
    task.stagnation_start = Date.now();

    this._log("task_started", { task_id: taskId, agent: agentId, priority: task.priority });
    this.emit("task_started", task);
    return task;
  }

  /**
   * Get all tasks ready to execute (dependencies satisfied)
   * Sorted by priority (P0 first), then by creation time
   */
  getReadyTasks() {
    const ready = [];
    for (const [taskId, task] of this.tasks) {
      if (task.status !== "pending") continue;

      const deps = this.edges.get(taskId) || new Set();
      const allDepsComplete = [...deps].every((d) => this.completedTasks.has(d));

      if (allDepsComplete) {
        ready.push(task);
      }
    }

    // Sort: P0 first, then by creation time (oldest first)
    return ready.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 99;
      const pb = PRIORITY_ORDER[b.priority] ?? 99;
      if (pa !== pb) return pa - pb;
      return a.created_at - b.created_at;
    });
  }

  /**
   * Get tasks currently running
   */
  getRunningTasks() {
    return [...this.tasks.values()].filter((t) => t.status === "running");
  }

  /**
   * Recompute the DAG — find newly unblocked tasks, recalculate critical path
   */
  recomputeDAG() {
    this.lastRecompute = Date.now();
    this.criticalPath = this._computeCriticalPath();
    const ready = this.getReadyTasks();

    this._log("dag_recomputed", {
      ready_count: ready.length,
      running_count: this.getRunningTasks().length,
      critical_path_length: this.criticalPath.length,
    });

    this.emit("dag_recomputed", { ready, criticalPath: this.criticalPath });
    return { ready, criticalPath: this.criticalPath };
  }

  /**
   * Topological sort of all pending/running tasks
   */
  topologicalSort() {
    const visited = new Set();
    const sorted = [];
    const visiting = new Set();

    const visit = (taskId) => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) return; // cycle — skip
      visiting.add(taskId);

      const deps = this.edges.get(taskId) || new Set();
      for (const dep of deps) {
        if (this.tasks.has(dep) && !this.completedTasks.has(dep)) {
          visit(dep);
        }
      }

      visiting.delete(taskId);
      visited.add(taskId);
      sorted.push(taskId);
    };

    for (const taskId of this.tasks.keys()) {
      if (!this.completedTasks.has(taskId) && !this.failedTasks.has(taskId)) {
        visit(taskId);
      }
    }

    return sorted;
  }

  /**
   * Compute critical path — longest chain of dependent tasks
   */
  _computeCriticalPath() {
    const distances = new Map();
    const predecessors = new Map();
    const sorted = this.topologicalSort();

    for (const taskId of sorted) {
      const task = this.tasks.get(taskId);
      if (!task || this.completedTasks.has(taskId)) continue;
      distances.set(taskId, task.estimated_duration_ms || 0);
    }

    for (const taskId of sorted) {
      const task = this.tasks.get(taskId);
      if (!task || this.completedTasks.has(taskId)) continue;

      const dependents = this.reverseEdges.get(taskId) || new Set();
      for (const depId of dependents) {
        const depTask = this.tasks.get(depId);
        if (!depTask || this.completedTasks.has(depId)) continue;

        const newDist = (distances.get(taskId) || 0) + (depTask.estimated_duration_ms || 0);
        if (newDist > (distances.get(depId) || 0)) {
          distances.set(depId, newDist);
          predecessors.set(depId, taskId);
        }
      }
    }

    // Find longest path endpoint
    let maxDist = 0;
    let endNode = null;
    for (const [taskId, dist] of distances) {
      if (dist > maxDist) {
        maxDist = dist;
        endNode = taskId;
      }
    }

    // Trace back
    const path = [];
    let current = endNode;
    while (current) {
      path.unshift(current);
      current = predecessors.get(current) || null;
    }

    return path;
  }

  /**
   * Detect cycles using DFS
   */
  _detectCycle(startId) {
    const visited = new Set();
    const stack = new Set();

    const dfs = (nodeId) => {
      if (stack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      stack.add(nodeId);

      const deps = this.edges.get(nodeId) || new Set();
      for (const dep of deps) {
        if (dfs(dep)) return true;
      }

      stack.delete(nodeId);
      return false;
    };

    return dfs(startId);
  }

  /**
   * Break cycle by removing lowest-priority edge
   */
  _breakCycle(taskId) {
    const deps = this.edges.get(taskId) || new Set();
    let lowestPriDep = null;
    let lowestPri = -1;

    for (const dep of deps) {
      const depTask = this.tasks.get(dep);
      const pri = depTask ? (PRIORITY_ORDER[depTask.priority] ?? 99) : 99;
      if (pri > lowestPri) {
        lowestPri = pri;
        lowestPriDep = dep;
      }
    }

    if (lowestPriDep) {
      deps.delete(lowestPriDep);
      const rev = this.reverseEdges.get(lowestPriDep);
      if (rev) rev.delete(taskId);
      console.warn(`[Intelligence] Broke circular dep: ${taskId} → ${lowestPriDep}`);
      return { from: taskId, to: lowestPriDep };
    }
    return null;
  }

  /**
   * Reprioritize a task
   */
  reprioritize(taskId, newPriority) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const oldPriority = task.priority;
    task.priority = newPriority;
    task.speed_mode = MANIFEST.priorities[newPriority]?.speed_mode || task.speed_mode;
    task.speed_weight = MANIFEST.priorities[newPriority]?.speed_weight || task.speed_weight;

    this._log("reprioritized", { task_id: taskId, from: oldPriority, to: newPriority });
    this.emit("task_reprioritized", task);
    return task;
  }

  /**
   * Get stagnant tasks (running longer than stagnation limit)
   */
  getStagnantTasks() {
    const now = Date.now();
    return this.getRunningTasks().filter((t) => {
      const limit = (MANIFEST.priorities[t.priority]?.max_stagnation_sec || 300) * 1000;
      return t.stagnation_start && (now - t.stagnation_start) > limit;
    });
  }

  /**
   * Get full scheduler state
   */
  getState() {
    const allTasks = [...this.tasks.values()];
    return {
      total_tasks: allTasks.length,
      pending: allTasks.filter((t) => t.status === "pending").length,
      running: allTasks.filter((t) => t.status === "running").length,
      completed: this.completedTasks.size,
      failed: this.failedTasks.size,
      ready: this.getReadyTasks().length,
      stagnant: this.getStagnantTasks().length,
      critical_path: this.criticalPath,
      critical_path_length: this.criticalPath.length,
      last_recompute: this.lastRecompute,
      by_priority: {
        P0: allTasks.filter((t) => t.priority === "P0" && t.status !== "completed").length,
        P1: allTasks.filter((t) => t.priority === "P1" && t.status !== "completed").length,
        P2: allTasks.filter((t) => t.priority === "P2" && t.status !== "completed").length,
        P3: allTasks.filter((t) => t.priority === "P3" && t.status !== "completed").length,
      },
      learning_log_size: this.learningLog.length,
    };
  }

  /**
   * Get all tasks with details
   */
  getAllTasks() {
    return [...this.tasks.values()];
  }

  _log(event, data) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      ...data,
    };
    this.learningLog.push(entry);
    // Keep log bounded
    if (this.learningLog.length > 10000) {
      this.learningLog = this.learningLog.slice(-5000);
    }
  }

  getLearningLog(limit = 100) {
    return this.learningLog.slice(-limit);
  }
}

module.exports = HeadyTaskScheduler;
