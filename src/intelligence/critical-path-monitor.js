// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: critical-path-monitor.js                                  ║
// ║  LAYER: intelligence                                             ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Continuous Critical-Path Monitor
 * Every 30s: recalculate critical path, detect drift, reprioritize or crash tasks
 * Feeds data to Pattern Engine and Learning Log
 */

const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(__dirname, "intelligence-manifest.json"), "utf8")
);

class HeadyCriticalPathMonitor extends EventEmitter {
  constructor(scheduler, speedController, allocator) {
    super();
    this.scheduler = scheduler;
    this.speedController = speedController;
    this.allocator = allocator;
    this.intervalMs = (MANIFEST.execution.critical_path_reanalysis_interval_sec || 30) * 1000;
    this.timer = null;
    this.history = [];
    this.driftEvents = [];
    this.metrics = {
      reanalyses: 0,
      drifts_detected: 0,
      reprioritizations: 0,
      crashes_triggered: 0,
    };
  }

  /**
   * Start the 30s monitoring loop
   */
  start() {
    if (this.timer) return;
    console.log(`[Intelligence] Critical-path monitor started (${this.intervalMs / 1000}s interval)`);
    this.timer = setInterval(() => this.analyze(), this.intervalMs);
    this.analyze(); // Run immediately
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("[Intelligence] Critical-path monitor stopped");
    }
  }

  /**
   * Core analysis cycle — runs every 30s
   */
  analyze() {
    this.metrics.reanalyses++;
    const timestamp = Date.now();

    // 1. Recompute DAG and critical path
    const { ready, criticalPath } = this.scheduler.recomputeDAG();

    // 2. Detect drift from previous critical path
    const previousPath = this.history.length > 0
      ? this.history[this.history.length - 1].critical_path
      : [];
    const drift = this._detectDrift(previousPath, criticalPath);

    if (drift.drifted) {
      this.metrics.drifts_detected++;
      this.driftEvents.push({
        timestamp: new Date().toISOString(),
        previous_length: previousPath.length,
        current_length: criticalPath.length,
        added: drift.added,
        removed: drift.removed,
      });
      this.emit("drift_detected", drift);
    }

    // 3. Auto-escalate critical path tasks to MAX speed
    const speedChanges = this.speedController.evaluateAll();

    // 4. Crash if critical path is growing
    let crashActions = null;
    if (criticalPath.length > previousPath.length && previousPath.length > 0) {
      crashActions = this.speedController.crashIfNeeded();
      if (crashActions) this.metrics.crashes_triggered++;
    }

    // 5. Trigger allocation for newly ready tasks
    const allocation = this.allocator.allocate();

    // 6. Record snapshot
    const snapshot = {
      timestamp: new Date().toISOString(),
      critical_path: [...criticalPath],
      critical_path_length: criticalPath.length,
      ready_count: ready.length,
      running_count: this.scheduler.getRunningTasks().length,
      stagnant_count: this.scheduler.getStagnantTasks().length,
      drift: drift.drifted,
      speed_changes: speedChanges.length,
      crash_actions: crashActions ? crashActions.length : 0,
      allocated: allocation.allocated,
      scheduler_state: this.scheduler.getState(),
    };

    this.history.push(snapshot);
    if (this.history.length > 500) {
      this.history = this.history.slice(-250);
    }

    this.emit("analysis_complete", snapshot);
    return snapshot;
  }

  /**
   * Detect drift between two critical paths
   */
  _detectDrift(previous, current) {
    const prevSet = new Set(previous);
    const currSet = new Set(current);

    const added = current.filter((t) => !prevSet.has(t));
    const removed = previous.filter((t) => !currSet.has(t));

    return {
      drifted: added.length > 0 || removed.length > 0,
      added,
      removed,
      previous_length: previous.length,
      current_length: current.length,
      growth: current.length - previous.length,
    };
  }

  /**
   * Get performance trend over recent analyses
   */
  getTrend(window = 10) {
    const recent = this.history.slice(-window);
    if (recent.length < 2) return { trend: "insufficient_data" };

    const pathLengths = recent.map((s) => s.critical_path_length);
    const readyCounts = recent.map((s) => s.ready_count);
    const stagnantCounts = recent.map((s) => s.stagnant_count);

    const avgPathLength = pathLengths.reduce((s, v) => s + v, 0) / pathLengths.length;
    const pathTrend = pathLengths[pathLengths.length - 1] - pathLengths[0];

    return {
      trend: pathTrend < 0 ? "improving" : pathTrend > 0 ? "degrading" : "stable",
      avg_critical_path_length: Math.round(avgPathLength * 100) / 100,
      path_trend: pathTrend,
      avg_ready: Math.round(readyCounts.reduce((s, v) => s + v, 0) / readyCounts.length * 100) / 100,
      avg_stagnant: Math.round(stagnantCounts.reduce((s, v) => s + v, 0) / stagnantCounts.length * 100) / 100,
      samples: recent.length,
    };
  }

  getState() {
    return {
      running: !!this.timer,
      interval_sec: this.intervalMs / 1000,
      metrics: this.metrics,
      trend: this.getTrend(),
      recent_drifts: this.driftEvents.slice(-10),
      latest_snapshot: this.history.length > 0 ? this.history[this.history.length - 1] : null,
    };
  }
}

module.exports = HeadyCriticalPathMonitor;
