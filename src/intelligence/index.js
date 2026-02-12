// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: index.js                                                  ║
// ║  LAYER: intelligence                                             ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Heady Full-Stack Intelligence Protocol v1.2 — Unified Entry Point
 * Wires together: Scheduler, Allocator, Speed Controller, Critical Path Monitor,
 * Anti-Stagnation Watchdog, Repo Indexer
 *
 * Usage:
 *   const intel = require('./src/intelligence');
 *   intel.start();
 */

const HeadyTaskScheduler = require("./task-scheduler");
const HeadyParallelAllocator = require("./parallel-allocator");
const HeadySpeedController = require("./speed-controller");
const HeadyCriticalPathMonitor = require("./critical-path-monitor");
const HeadyAntiStagnationWatchdog = require("./anti-stagnation-watchdog");
const HeadyRepoIndexer = require("./repo-indexer");

class HeadyIntelligenceEngine {
  constructor() {
    this.scheduler = new HeadyTaskScheduler();
    this.allocator = new HeadyParallelAllocator(this.scheduler);
    this.speedController = new HeadySpeedController(this.scheduler, this.allocator);
    this.criticalPathMonitor = new HeadyCriticalPathMonitor(
      this.scheduler, this.speedController, this.allocator
    );
    this.watchdog = new HeadyAntiStagnationWatchdog(
      this.scheduler, this.allocator, this.speedController
    );
    this.repoIndexer = new HeadyRepoIndexer();
    this.started = false;
  }

  /**
   * Start all intelligence subsystems
   */
  start() {
    if (this.started) return;
    console.log("[Intelligence] Heady Full-Stack Intelligence Protocol v1.2 — starting");
    this.criticalPathMonitor.start();
    this.watchdog.start();
    this.started = true;
    console.log("[Intelligence] All subsystems active — zero idle, zero wait");
  }

  /**
   * Stop all intelligence subsystems
   */
  stop() {
    this.criticalPathMonitor.stop();
    this.watchdog.stop();
    this.started = false;
    console.log("[Intelligence] All subsystems stopped");
  }

  /**
   * Submit a task to the intelligence engine
   */
  submitTask(taskData) {
    const task = this.scheduler.addTask(taskData);

    // Check repo profile for speed recommendation
    if (taskData.file_path) {
      const rec = this.repoIndexer.getFileSpeedRecommendation(taskData.file_path);
      if (rec.lane !== "unknown") {
        task.speed_mode = rec.speed;
        task.metadata.repo_lane = rec.lane;
      }
    }

    // Use improved estimate if available
    if (taskData.type) {
      const est = this.repoIndexer.getImprovedEstimate(taskData.type, task.estimated_duration_ms);
      if (est.confidence !== "low") {
        task.estimated_duration_ms = est.estimate_ms;
        task.metadata.estimate_confidence = est.confidence;
      }
    }

    // Trigger allocation immediately
    const allocation = this.allocator.allocate();
    return { task, allocation };
  }

  /**
   * Complete a task and record duration for estimator
   */
  completeTask(taskId, result) {
    const task = this.scheduler.tasks.get(taskId);
    if (!task) return null;

    const completed = this.scheduler.completeTask(taskId, result);

    // Feed duration to self-optimizing estimator
    if (completed && completed.actual_duration_ms && completed.type) {
      this.repoIndexer.recordTaskDuration(
        completed.type,
        completed.estimated_duration_ms,
        completed.actual_duration_ms
      );
    }

    return completed;
  }

  /**
   * Get full system state
   */
  getState() {
    return {
      protocol: "Heady Full-Stack Intelligence Protocol",
      version: "1.2",
      status: this.started ? "active" : "stopped",
      scheduler: this.scheduler.getState(),
      allocator: this.allocator.getState(),
      speed_controller: this.speedController.getState(),
      critical_path_monitor: this.criticalPathMonitor.getState(),
      watchdog: this.watchdog.getState(),
      repo_indexer: this.repoIndexer.getState(),
    };
  }
}

module.exports = HeadyIntelligenceEngine;
