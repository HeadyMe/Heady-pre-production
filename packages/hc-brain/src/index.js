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
// ║  FILE: packages/hc-brain/src/index.js                             ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * System Brain — Meta-Controller
 *
 * The single "System Brain" module that owns:
 *   - Service catalog (roles, skills, tools, owners)
 *   - Node & role health views
 *   - Resource policies and parallelism limits
 *   - Concept ingestion from external research
 *   - Auto-tuning loop
 *   - Governance enforcement
 *
 * At each checkpoint it:
 *   - Evaluates operational readiness and health
 *   - Adapts concurrency and routing
 *   - Decides whether to enable new patterns
 *   - Keeps all "meta decisions" in one place
 */

const fs = require("fs");
const path = require("path");

class SystemBrain {
  constructor(options = {}) {
    this.configDir = options.configDir || path.join(process.cwd(), "configs");
    this.serviceCatalog = options.serviceCatalog || {};
    this.resourcePolicies = options.resourcePolicies || {};
    this.conceptsIndex = options.conceptsIndex || {};
    this.governancePolicies = options.governancePolicies || {};

    // Runtime state
    this.healthViews = new Map(); // role → { status, lastCheck, metrics }
    this.tuningHistory = [];
    this.decisionLog = [];
    this.patternActivations = [];
  }

  /**
   * Load all configs from disk and refresh internal state.
   */
  loadConfigs(yamlLoader) {
    if (typeof yamlLoader === "function") {
      try {
        this.serviceCatalog = yamlLoader("service-catalog.yaml") || {};
        this.resourcePolicies = yamlLoader("resource-policies.yaml") || {};
        this.conceptsIndex = yamlLoader("concepts-index.yaml") || {};
        this.governancePolicies = yamlLoader("governance-policies.yaml") || {};
      } catch (err) {
        this.decisionLog.push({
          ts: new Date().toISOString(),
          action: "loadConfigs",
          error: err.message,
        });
      }
    }
  }

  /**
   * Update health view for a role/service.
   */
  updateHealth(roleId, status, metrics = {}) {
    this.healthViews.set(roleId, {
      status, // healthy | degraded | down
      lastCheck: new Date().toISOString(),
      metrics,
    });
  }

  /**
   * Compute Operational Readiness Score (ORS) 0–100.
   */
  computeReadinessScore(probeResults = []) {
    if (probeResults.length === 0) {
      // Estimate from health views
      const entries = Array.from(this.healthViews.values());
      if (entries.length === 0) return 100;

      const healthy = entries.filter((e) => e.status === "healthy").length;
      const degraded = entries.filter((e) => e.status === "degraded").length;
      return Math.round(((healthy + degraded * 0.5) / entries.length) * 100);
    }

    // Weighted scoring from app-readiness.yaml model
    let score = 0;
    let totalWeight = 0;
    const weights = { critical: 40, high: 20, medium: 10 };

    for (const probe of probeResults) {
      const w = weights[probe.criticality] || 10;
      totalWeight += w;
      if (probe.status === "ok") score += w;
      else if (probe.status === "degraded") score += w * 0.5;
    }

    return totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 100;
  }

  /**
   * Determine operational mode based on readiness.
   */
  determineMode(readinessScore) {
    if (readinessScore >= 85) return "aggressive";
    if (readinessScore >= 70) return "normal";
    if (readinessScore >= 50) return "maintenance";
    return "recovery";
  }

  /**
   * Auto-tuning: adjust concurrency and routing based on observed metrics.
   */
  autoTune(observedMetrics = {}) {
    const { errorRate = 0, avgLatencyMs = 0, queueUtilization = 0 } = observedMetrics;
    const policies = this.resourcePolicies.concurrency || {};
    const maxTasks = policies.maxConcurrentTasks || 8;

    let recommended = maxTasks;
    let reason = "nominal";

    if (errorRate > 0.15) {
      recommended = Math.max(1, Math.floor(maxTasks * 0.5));
      reason = `high error rate ${(errorRate * 100).toFixed(1)}%`;
    } else if (avgLatencyMs > 10000) {
      recommended = Math.max(1, maxTasks - 2);
      reason = `high latency ${avgLatencyMs}ms`;
    } else if (queueUtilization > 0.85 && errorRate < 0.05) {
      recommended = Math.min(maxTasks, recommended + 1);
      reason = `high utilization, low errors`;
    } else if (queueUtilization < 0.3) {
      recommended = Math.max(1, recommended - 1);
      reason = `low utilization ${(queueUtilization * 100).toFixed(0)}%`;
    }

    const entry = {
      ts: new Date().toISOString(),
      observedMetrics,
      previousMax: maxTasks,
      recommended,
      reason,
    };
    this.tuningHistory.push(entry);
    return entry;
  }

  /**
   * Check governance: is a given action allowed?
   */
  checkGovernance(action, actor, domain) {
    const rules = this.governancePolicies.accessControl?.rules || [];
    const matching = rules.find((r) => r.role === actor);

    if (!matching) {
      return { allowed: false, reason: `No access rule for role '${actor}'` };
    }

    if (!matching.allowedDomains.includes(domain)) {
      return { allowed: false, reason: `Role '${actor}' not allowed in domain '${domain}'` };
    }

    if (!matching.allowedActions.includes(action)) {
      return { allowed: false, reason: `Role '${actor}' cannot perform '${action}' in '${domain}'` };
    }

    return { allowed: true };
  }

  /**
   * Evaluate whether a new pattern should be enabled.
   */
  evaluatePatternAdoption(patternId) {
    const autoAllowed = this.governancePolicies.changePolicy?.autoEnablePatterns?.allowed || [];
    const requireApproval = this.governancePolicies.changePolicy?.autoEnablePatterns?.requireApproval || [];

    if (autoAllowed.includes(patternId)) {
      return { decision: "auto-enable", reason: "Pattern in auto-enable list" };
    }
    if (requireApproval.includes(patternId)) {
      return { decision: "pending-approval", reason: "Pattern requires human approval" };
    }
    return { decision: "unknown", reason: "Pattern not in governance lists" };
  }

  /**
   * Checkpoint integration: called by CheckpointAnalyzer.
   */
  onCheckpoint(checkpointRecord) {
    const readiness = checkpointRecord.readinessScore || 100;
    const mode = this.determineMode(readiness);

    const decision = {
      ts: new Date().toISOString(),
      checkpointId: checkpointRecord.id,
      readinessScore: readiness,
      mode,
      checkpointDecision: checkpointRecord.decision,
      recommendations: checkpointRecord.recommendations || [],
    };

    this.decisionLog.push(decision);
    return decision;
  }

  /**
   * Get full brain status for monitoring/dashboard.
   */
  getStatus() {
    const healthEntries = Array.from(this.healthViews.entries()).map(([k, v]) => ({ role: k, ...v }));
    const readiness = this.computeReadinessScore();

    return {
      readinessScore: readiness,
      mode: this.determineMode(readiness),
      healthViews: healthEntries,
      recentDecisions: this.decisionLog.slice(-10),
      recentTuning: this.tuningHistory.slice(-5),
      conceptStats: {
        implemented: (this.conceptsIndex.implementedConcepts || []).length,
        planned: (this.conceptsIndex.plannedConcepts || []).length,
        publicDomain: (this.conceptsIndex.publicDomainPatterns || []).length,
      },
      patternActivations: this.patternActivations.slice(-10),
    };
  }
}

module.exports = { SystemBrain };
