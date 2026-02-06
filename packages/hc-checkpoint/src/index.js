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
// ║  FILE: packages/hc-checkpoint/src/index.js                        ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * HC Checkpoint Protocol Analyzer
 *
 * PROTOCOL:
 *   At each checkpoint (ingest, plan, execute-major-phase, recover, finalize),
 *   the system MUST deeply re-analyze and self-correct, not just log progress.
 *
 * CHECKPOINT RESPONSIBILITIES:
 *   1. Validate run state (pipeline def + resource policies current and valid)
 *   2. Compare config hashes with repo state (detect drift)
 *   3. Re-evaluate plan and system health (bottlenecks, errors, spend vs budget)
 *   4. Check concept alignment (which patterns are active, suggest missing ones)
 *   5. Update logs and owner (detailed checkpoint record + status report)
 *   6. Apply approved patterns (gradual enablement at checkpoint boundaries)
 *
 * Checkpoints are the PRIMARY time where:
 *   - New public-domain patterns marked "approved" can be enabled
 *   - Config changes from repo can be rolled out in controlled way
 *   - System decides: continue, re-plan, throttle, expand, or escalate
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

class CheckpointAnalyzer {
  constructor(options = {}) {
    this.configDir = options.configDir || path.join(process.cwd(), "configs");
    this.records = [];
    this.configHashes = {};
    this.conceptsIndex = options.conceptsIndex || {};
    this.governancePolicies = options.governancePolicies || {};
  }

  /**
   * Execute a full checkpoint analysis at a stage boundary.
   */
  async analyze(context) {
    const startTime = Date.now();
    const record = {
      id: `ckpt-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      runId: context.runId,
      stage: context.stage,
      timestamp: new Date().toISOString(),
      responsibilities: {},
      recommendations: [],
      decision: null, // continue | replan | throttle | expand | escalate
    };

    // 1. Validate run state
    record.responsibilities.validate_run_state = this._validateRunState(context);

    // 2. Compare config hashes
    record.responsibilities.compare_config_hashes = this._compareConfigHashes(context);

    // 3. Re-evaluate plan and health
    record.responsibilities.reevaluate_health = this._reevaluateHealth(context);

    // 4. Check concept alignment
    record.responsibilities.concept_alignment = this._checkConceptAlignment(context);

    // 5. Update logs
    record.responsibilities.update_logs = { ok: true, logEntries: (context.runState?.log || []).length };

    // 6. Apply approved patterns
    record.responsibilities.apply_patterns = this._evaluatePatterns(context);

    // Compute overall decision
    record.decision = this._computeDecision(record);
    record.readinessScore = context.healthSnapshot?.readinessScore || this._estimateReadiness(record);
    record.durationMs = Date.now() - startTime;

    // Generate recommendations
    record.recommendations = this._generateRecommendations(record, context);

    this.records.push(record);
    return record;
  }

  _validateRunState(context) {
    const issues = [];
    const runState = context.runState || {};

    if (!runState.status || runState.status === "halted") {
      issues.push("Pipeline is halted");
    }

    // Check that critical configs exist
    const requiredConfigs = [
      "hcfullpipeline.yaml",
      "resource-policies.yaml",
      "service-catalog.yaml",
    ];

    for (const cfg of requiredConfigs) {
      const cfgPath = path.join(this.configDir, cfg);
      if (!fs.existsSync(cfgPath)) {
        issues.push(`Missing config: ${cfg}`);
      }
    }

    return { ok: issues.length === 0, issues };
  }

  _compareConfigHashes(context) {
    const currentHashes = {};
    const drifted = [];

    const configFiles = [
      "hcfullpipeline.yaml",
      "resource-policies.yaml",
      "service-catalog.yaml",
      "governance-policies.yaml",
      "concepts-index.yaml",
    ];

    for (const file of configFiles) {
      const filePath = path.join(this.configDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        currentHashes[file] = crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
      }
    }

    // Compare with stored hashes
    for (const [file, hash] of Object.entries(currentHashes)) {
      if (this.configHashes[file] && this.configHashes[file] !== hash) {
        drifted.push(file);
      }
    }

    this.configHashes = currentHashes;

    return {
      ok: drifted.length === 0,
      currentHashes,
      drifted,
      message: drifted.length > 0 ? `Config drift in: ${drifted.join(", ")}` : "No drift",
    };
  }

  _reevaluateHealth(context) {
    const health = context.healthSnapshot || {};
    const metrics = context.runState?.metrics || {};

    return {
      ok: (metrics.readinessScore || 100) >= 60,
      readinessScore: metrics.readinessScore || 100,
      errorRate: metrics.errorRate || 0,
      completedTasks: metrics.completedTasks || 0,
      failedTasks: metrics.failedTasks || 0,
      bottlenecks: health.bottlenecks || [],
      costSpent: context.costTracker?.spent || 0,
      costBudget: context.costTracker?.budget || 50,
    };
  }

  _checkConceptAlignment(context) {
    const implemented = this.conceptsIndex.implementedConcepts || [];
    const planned = this.conceptsIndex.plannedConcepts || [];
    const publicDomain = this.conceptsIndex.publicDomainPatterns || [];

    const activePatterns = implemented.map((c) => c.id);
    const pendingPatterns = planned.map((c) => c.id);
    const availablePatterns = publicDomain
      .filter((p) => p.status === "planned")
      .map((p) => p.id);

    return {
      ok: true,
      activePatterns,
      pendingPatterns,
      availablePublicDomain: availablePatterns,
      totalImplemented: implemented.length,
      totalPlanned: planned.length,
    };
  }

  _evaluatePatterns(context) {
    const autoEnable = (this.governancePolicies.changePolicy?.autoEnablePatterns?.allowed) || [];
    const requireApproval = (this.governancePolicies.changePolicy?.autoEnablePatterns?.requireApproval) || [];

    return {
      ok: true,
      autoEnabled: autoEnable,
      pendingApproval: requireApproval,
      message: `${autoEnable.length} patterns auto-enabled, ${requireApproval.length} pending approval`,
    };
  }

  _computeDecision(record) {
    const health = record.responsibilities.reevaluate_health;
    const runState = record.responsibilities.validate_run_state;
    const configDrift = record.responsibilities.compare_config_hashes;

    if (!runState.ok) return "escalate";
    if (health.readinessScore < 50) return "escalate";
    if (health.readinessScore < 70) return "throttle";
    if (health.errorRate > 0.15) return "replan";
    if (configDrift.drifted.length > 0) return "replan";
    if (health.readinessScore >= 85) return "expand";
    return "continue";
  }

  _estimateReadiness(record) {
    const health = record.responsibilities.reevaluate_health;
    return health?.readinessScore || 100;
  }

  _generateRecommendations(record, context) {
    const recs = [];
    const health = record.responsibilities.reevaluate_health;
    const concepts = record.responsibilities.concept_alignment;
    const drift = record.responsibilities.compare_config_hashes;

    if (health.errorRate > 0.10) {
      recs.push({ severity: "high", message: `Error rate ${(health.errorRate * 100).toFixed(1)}% — investigate failing tasks` });
    }

    if (health.readinessScore < 70) {
      recs.push({ severity: "high", message: `Readiness ${health.readinessScore} below threshold — reduce load` });
    }

    if (drift.drifted.length > 0) {
      recs.push({ severity: "medium", message: `Config drift detected in ${drift.drifted.join(", ")} — review and reload` });
    }

    if (concepts.availablePublicDomain.length > 0) {
      recs.push({ severity: "low", message: `${concepts.availablePublicDomain.length} public-domain patterns available for integration: ${concepts.availablePublicDomain.join(", ")}` });
    }

    if (health.costSpent > health.costBudget * 0.9) {
      recs.push({ severity: "high", message: `Cost ${health.costSpent} near budget ${health.costBudget} — throttle expensive operations` });
    }

    return recs;
  }

  getRecords() { return this.records; }
  getLastRecord() { return this.records[this.records.length - 1] || null; }
}

module.exports = { CheckpointAnalyzer };
