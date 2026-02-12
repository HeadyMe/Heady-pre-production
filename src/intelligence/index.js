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
const HeadySoul = require("../soul/heady_soul");

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
    this.soul = new HeadySoul();
    this.started = false;
  }

  /**
   * Start all intelligence subsystems
   */
  start() {
    if (this.started) return;
    console.log("[Intelligence] Heady Full-Stack Intelligence Protocol v1.3 — starting");
    this.soul.start();
    this.criticalPathMonitor.start();
    this.watchdog.start();
    this.started = true;
    console.log("[Intelligence] All subsystems active — HeadySoul governing, zero idle, zero wait");
  }

  /**
   * Stop all intelligence subsystems
   */
  stop() {
    this.soul.stop();
    this.criticalPathMonitor.stop();
    this.watchdog.stop();
    this.started = false;
    console.log("[Intelligence] All subsystems stopped");
  }

  /**
   * Submit a task to the intelligence engine
   */
  async submitTask(taskData) {
    // HeadySoul evaluates FIRST — mission alignment before anything else
    const soulDecision = await this.soul.evaluateTask(taskData);

    // Hard veto: block entirely
    if (soulDecision.veto) {
      return {
        task: { id: taskData.id, status: "BLOCKED_MISSION_VETO", ...taskData },
        allocation: { allocated: 0 },
        soul: soulDecision,
      };
    }

    // Add task to scheduler with soul metadata
    const task = this.scheduler.addTask(taskData);
    task.metadata.soul_score = soulDecision.score;
    task.metadata.soul_tier = soulDecision.tier;
    task.metadata.soul_auto_approve = soulDecision.auto_approve;

    // If escalated, mark but allow (pending human review)
    if (soulDecision.escalate) {
      task.metadata.soul_escalated = true;
      task.metadata.soul_reason = soulDecision.reason;
    }

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
    return { task, allocation, soul: soulDecision };
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
      version: "1.3",
      status: this.started ? "active" : "stopped",
      soul: this.soul.getState(),
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
