// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: heady_soul.js                                             ║
// ║  LAYER: soul — Ultimate Governance Layer                         ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * HeadySoul — Ultimate Governance Layer
 *
 * Sits ABOVE HCBrain, HCFullPipeline, and Intelligence Engine.
 * Every decision gets scored against mission values before execution.
 *
 * HCBrain optimizes for speed and reliability.
 * HeadySoul optimizes for goodness.
 *
 * Architecture:
 *   HeadySoul (mission, values, ethics)
 *     ↓
 *   Intelligence Engine (DAG scheduler, priority queue)
 *     ↓
 *   HCFullPipeline (9-stage execution)
 *     ↓
 *   HCBrain (meta-controller)
 *     ↓
 *   Agents (execute with HeadySoul constraints)
 */

const { EventEmitter } = require("events");
const ValueWeights = require("./value_weights");
const MissionScorer = require("./mission_scorer");
const DecisionLogger = require("./decision_logger");

class HeadySoul extends EventEmitter {
  constructor(configPath) {
    super();
    this.valueWeights = new ValueWeights(configPath);
    this.scorer = new MissionScorer(this.valueWeights);
    this.logger = new DecisionLogger(10000);
    this.started = false;
    this.escalationQueue = [];
    this.alignmentReports = [];
    this.metrics = {
      tasks_evaluated: 0,
      strategies_filtered: 0,
      hard_vetoes: 0,
      drift_warnings: 0,
      colab_scores: 0,
      local_scores: 0,
    };
  }

  /**
   * Start HeadySoul governance
   */
  start() {
    if (this.started) return;
    console.log("[HeadySoul] Ultimate governance layer ACTIVE");
    console.log(`[HeadySoul] Values: ${Object.entries(this.valueWeights.getWeights()).map(([k, v]) => `${k}=${v}`).join(", ")}`);
    console.log(`[HeadySoul] Thresholds: veto<${this.valueWeights.getThresholds().veto}, escalate<${this.valueWeights.getThresholds().escalate}, auto>${this.valueWeights.getThresholds().auto_approve}`);
    this.started = true;
  }

  /**
   * Stop HeadySoul
   */
  stop() {
    this.started = false;
    console.log("[HeadySoul] Governance layer stopped");
  }

  // ─── Core Decision Evaluation ──────────────────────────────────────

  /**
   * Evaluate a task for mission alignment
   * Called before any task launches in the Intelligence Engine
   *
   * Returns: { score, breakdown, veto, escalate, auto_approve, reason, tier }
   */
  async evaluateTask(task) {
    this.metrics.tasks_evaluated++;
    const thresholds = this.valueWeights.getThresholds();

    // Determine evaluation tier
    const tier = this._determineTier(task);

    // Tier 3: skip evaluation for low-risk work
    if (tier === "tier3") {
      const skipResult = {
        task_id: task.id,
        score: 75,
        breakdown: {},
        veto: false,
        escalate: false,
        auto_approve: true,
        tier: "tier3",
        reason: "Low-risk task — trusted to Intelligence Engine",
        timestamp: new Date().toISOString(),
      };
      this.logger.log(skipResult);
      return skipResult;
    }

    // Check hard vetoes first (non-negotiable)
    const hardVetoes = this.scorer.checkHardVetoes(task);
    if (hardVetoes.length > 0) {
      this.metrics.hard_vetoes++;
      const vetoResult = {
        task_id: task.id,
        score: 0,
        breakdown: {},
        veto: true,
        escalate: false,
        auto_approve: false,
        hard_veto: true,
        tier: "tier1",
        reason: `Hard veto: ${hardVetoes.map((v) => v.description).join("; ")}`,
        triggered_rules: hardVetoes,
        timestamp: new Date().toISOString(),
      };
      this.logger.log(vetoResult);
      this.emit("hard_veto", vetoResult);
      return vetoResult;
    }

    // Score against mission dimensions
    const score = await this.scorer.scoreTask(task);

    if (this.scorer.colabAvailable) this.metrics.colab_scores++;
    else this.metrics.local_scores++;

    // Build decision
    const decision = {
      task_id: task.id,
      score: score.total,
      breakdown: score.breakdown,
      sacred_geometry: score.sacred_geometry,
      veto: score.total < thresholds.veto,
      escalate: score.total >= thresholds.veto && score.total < thresholds.escalate,
      auto_approve: score.total >= thresholds.auto_approve,
      tier,
      reason: null,
      timestamp: new Date().toISOString(),
    };

    // Generate reason for non-approved decisions
    if (decision.veto) {
      decision.reason = this._explainVeto(score);
      this.emit("task_vetoed", decision);
    } else if (decision.escalate) {
      decision.reason = this._explainEscalation(score);
      this._addToEscalationQueue(task, decision);
      this.emit("task_escalated", decision);
    }

    this.logger.log(decision);

    // Check for drift after every evaluation
    const drift = this._checkDrift();
    if (drift) {
      this.metrics.drift_warnings++;
      this.emit("drift_detected", drift);
    }

    return decision;
  }

  /**
   * Filter Monte Carlo strategies by mission alignment
   * Only aligned strategies pass through to the scheduler
   */
  async filterStrategies(strategies, context = {}) {
    this.metrics.strategies_filtered++;
    const minScore = context.minAlignmentScore || this.valueWeights.getThresholds().escalate;

    const scored = [];
    for (const strategy of strategies) {
      const alignmentScore = await this.scorer.scoreStrategy(strategy, context);
      scored.push({
        strategy,
        alignment: alignmentScore,
        approved: alignmentScore >= minScore,
      });
    }

    const approved = scored.filter((s) => s.approved).map((s) => s.strategy);
    const rejected = scored.filter((s) => !s.approved);

    if (rejected.length > 0) {
      console.log(`[HeadySoul] Filtered ${rejected.length}/${strategies.length} strategies below alignment threshold (${minScore})`);
    }

    return {
      approved,
      rejected: rejected.map((r) => ({ id: r.strategy.id, alignment: r.alignment })),
      total: strategies.length,
      passed: approved.length,
    };
  }

  /**
   * Audit an entire pipeline run
   */
  auditPipelineRun(runId) {
    const decisions = this.logger.getDecisions({ runId });
    const approved = decisions.filter((d) => !d.veto && !d.escalate);
    const vetoed = decisions.filter((d) => d.veto);
    const escalated = decisions.filter((d) => d.escalate);
    const avgScore = decisions.length > 0
      ? decisions.reduce((sum, d) => sum + (d.score || 0), 0) / decisions.length
      : 0;

    const warnings = this._detectDriftInDecisions(decisions);

    const report = {
      run_id: runId,
      total_decisions: decisions.length,
      approved: approved.length,
      vetoed: vetoed.length,
      escalated: escalated.length,
      avg_alignment: Math.round(avgScore * 100) / 100,
      drift_warnings: warnings,
      timestamp: new Date().toISOString(),
    };

    this.alignmentReports.push(report);
    if (this.alignmentReports.length > 500) {
      this.alignmentReports = this.alignmentReports.slice(-250);
    }

    return report;
  }

  // ─── Human Override Interface ──────────────────────────────────────

  /**
   * Record a human override decision
   * Feeds into learning model to improve future scoring
   */
  recordOverride(taskId, humanDecision, reason) {
    const originalDecision = this.logger.getDecisions({}).find((d) => d.task_id === taskId);
    if (!originalDecision) return { error: "Decision not found" };

    const override = this.logger.logOverride(taskId, originalDecision, humanDecision, reason);

    // Remove from escalation queue
    this.escalationQueue = this.escalationQueue.filter((e) => e.task_id !== taskId);

    this.emit("override_recorded", override);
    return override;
  }

  /**
   * Get pending escalations awaiting human decision
   */
  getEscalationQueue() {
    // Auto-approve old escalations past threshold
    const autoApproveHours = this.valueWeights.escalation?.auto_approve_after_hours || 24;
    const cutoff = Date.now() - autoApproveHours * 60 * 60 * 1000;

    const expired = this.escalationQueue.filter((e) => new Date(e.escalated_at).getTime() < cutoff);
    for (const e of expired) {
      e.auto_approved = true;
      e.auto_approved_at = new Date().toISOString();
    }

    this.escalationQueue = this.escalationQueue.filter((e) => !e.auto_approved);
    return {
      pending: this.escalationQueue,
      auto_approved: expired,
      total_pending: this.escalationQueue.length,
    };
  }

  // ─── Cross-Component Coherence ─────────────────────────────────────

  /**
   * Generate alignment report for all components
   */
  generateAlignmentReport() {
    const stats = this.logger.getStats();
    const recentAvg = this.logger.getRecentAvgScore(20);
    const drift = this._checkDrift();

    return {
      protocol: "HeadySoul Alignment Report",
      timestamp: new Date().toISOString(),
      overall_alignment: recentAvg,
      trend: this._getAlignmentTrend(),
      stats,
      drift_warning: drift,
      escalation_queue: this.escalationQueue.length,
      scorer_stats: this.scorer.getStats(),
      values: this.valueWeights.getWeights(),
      thresholds: this.valueWeights.getThresholds(),
      metrics: this.metrics,
      recent_reports: this.alignmentReports.slice(-5),
    };
  }

  // ─── Colab GPU Integration ─────────────────────────────────────────

  /**
   * Connect to Colab GPU node for ML-powered scoring
   */
  async connectColab(url) {
    await this.scorer.setColabUrl(url);
    return { connected: this.scorer.colabAvailable, url };
  }

  // ─── Internal Methods ──────────────────────────────────────────────

  _determineTier(task) {
    const priority = task.priority || "P2";
    const type = task.type || "";
    const meta = task.metadata || {};

    // Tier 1: Critical path, deployments, pricing, user-facing, policy
    if (priority === "P0" || type === "deployment" || type === "pricing" ||
        meta.user_facing === true || type === "policy") {
      return "tier1";
    }

    // Tier 3: Docs, polish, internal-only
    if (priority === "P3" || type === "docs" || type === "polish" ||
        meta.internal === true) {
      return "tier3";
    }

    // Tier 2: Everything else
    return "tier2";
  }

  _explainVeto(score) {
    const lowDims = Object.entries(score.breakdown)
      .filter(([, v]) => v < 40)
      .map(([k]) => k);

    return `Mission alignment too low (${score.total.toFixed(1)}/100). ` +
      `Failing dimensions: ${lowDims.join(", ") || "overall"}. ` +
      `Consider: increase access, remove extractive patterns, or add fairness guarantees.`;
  }

  _explainEscalation(score) {
    const weakDims = Object.entries(score.breakdown)
      .filter(([, v]) => v < 60)
      .sort(([, a], [, b]) => a - b)
      .map(([k]) => k);

    return `Alignment borderline (${score.total.toFixed(1)}/100). ` +
      `Weak dimensions: ${weakDims.join(", ")}. Escalated for human review.`;
  }

  _addToEscalationQueue(task, decision) {
    const maxPending = this.valueWeights.escalation?.max_pending_escalations || 20;
    if (this.escalationQueue.length >= maxPending) {
      // Auto-approve oldest to prevent bottleneck
      this.escalationQueue.shift();
    }

    this.escalationQueue.push({
      task_id: task.id,
      task_type: task.type,
      score: decision.score,
      breakdown: decision.breakdown,
      reason: decision.reason,
      escalated_at: new Date().toISOString(),
    });
  }

  _checkDrift() {
    const window = this.valueWeights.drift?.window_size || 20;
    const threshold = this.valueWeights.drift?.threshold || 10.0;
    const decisions = this.logger.getDecisions({});

    if (decisions.length < window * 2) return null;

    const recent = decisions.slice(-window);
    const earlier = decisions.slice(-(window * 2), -window);

    const recentAvg = recent.reduce((s, d) => s + (d.score || 0), 0) / recent.length;
    const earlierAvg = earlier.reduce((s, d) => s + (d.score || 0), 0) / earlier.length;

    if (earlierAvg - recentAvg > threshold) {
      return {
        type: "mission_drift",
        severity: earlierAvg - recentAvg > (this.valueWeights.drift?.severe_drift_threshold || 20) ? "severe" : "warning",
        drop: Math.round((earlierAvg - recentAvg) * 100) / 100,
        recent_avg: Math.round(recentAvg * 100) / 100,
        earlier_avg: Math.round(earlierAvg * 100) / 100,
        message: `Mission drift detected: alignment dropped ${(earlierAvg - recentAvg).toFixed(1)} points`,
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }

  _detectDriftInDecisions(decisions) {
    if (decisions.length < 10) return [];
    const warnings = [];

    const recent = decisions.slice(-10);
    const earlier = decisions.slice(-20, -10);

    if (earlier.length > 0) {
      const recentAvg = recent.reduce((s, d) => s + (d.score || 0), 0) / recent.length;
      const earlierAvg = earlier.reduce((s, d) => s + (d.score || 0), 0) / earlier.length;

      if (earlierAvg - recentAvg > 10) {
        warnings.push(`Alignment dropped ${(earlierAvg - recentAvg).toFixed(1)} points in this run`);
      }
    }

    // Check consecutive vetoes
    const consecutiveVetoes = this.valueWeights.drift?.alert_on_consecutive_vetoes || 3;
    let vetoStreak = 0;
    for (let i = decisions.length - 1; i >= 0; i--) {
      if (decisions[i].veto) vetoStreak++;
      else break;
    }
    if (vetoStreak >= consecutiveVetoes) {
      warnings.push(`${vetoStreak} consecutive vetoes detected`);
    }

    return warnings;
  }

  _getAlignmentTrend() {
    const decisions = this.logger.getDecisions({});
    if (decisions.length < 20) return "insufficient_data";

    const recent10 = decisions.slice(-10);
    const prev10 = decisions.slice(-20, -10);

    const recentAvg = recent10.reduce((s, d) => s + (d.score || 0), 0) / recent10.length;
    const prevAvg = prev10.reduce((s, d) => s + (d.score || 0), 0) / prev10.length;

    if (recentAvg > prevAvg + 5) return "improving";
    if (recentAvg < prevAvg - 5) return "degrading";
    return "stable";
  }

  /**
   * Get full HeadySoul state
   */
  getState() {
    return {
      protocol: "HeadySoul — Ultimate Governance Layer",
      version: "1.0.0",
      status: this.started ? "active" : "stopped",
      values: this.valueWeights.getWeights(),
      thresholds: this.valueWeights.getThresholds(),
      metrics: this.metrics,
      decision_stats: this.logger.getStats(),
      recent_avg_alignment: this.logger.getRecentAvgScore(20),
      alignment_trend: this._getAlignmentTrend(),
      escalation_queue_size: this.escalationQueue.length,
      drift: this._checkDrift(),
      scorer: this.scorer.getStats(),
      sacred_geometry: this.valueWeights.sacredGeometry,
    };
  }
}

module.exports = HeadySoul;
