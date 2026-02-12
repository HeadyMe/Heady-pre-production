// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: decision_logger.js                                        ║
// ║  LAYER: soul                                                     ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Decision Logger — audit trail for every HeadySoul decision
 * In-memory with bounded retention + JSON export
 * All logged to LEARNING_LOG for continuous improvement
 */

class DecisionLogger {
  constructor(maxEntries = 10000) {
    this.decisions = [];
    this.maxEntries = maxEntries;
    this.overrides = [];
    this.stats = {
      total: 0,
      approved: 0,
      vetoed: 0,
      escalated: 0,
      overridden: 0,
    };
  }

  log(decision) {
    const entry = {
      ...decision,
      logged_at: new Date().toISOString(),
      seq: this.stats.total,
    };

    this.decisions.push(entry);
    this.stats.total++;

    if (decision.veto) this.stats.vetoed++;
    else if (decision.escalate) this.stats.escalated++;
    else this.stats.approved++;

    // Bound memory
    if (this.decisions.length > this.maxEntries) {
      this.decisions = this.decisions.slice(-Math.floor(this.maxEntries / 2));
    }

    return entry;
  }

  logOverride(taskId, originalDecision, humanDecision, reason) {
    const override = {
      task_id: taskId,
      original_score: originalDecision.score,
      original_veto: originalDecision.veto,
      human_decision: humanDecision, // "approve" or "veto"
      reason,
      timestamp: new Date().toISOString(),
    };

    this.overrides.push(override);
    this.stats.overridden++;

    if (this.overrides.length > 5000) {
      this.overrides = this.overrides.slice(-2500);
    }

    return override;
  }

  getDecisions(filter = {}) {
    let results = this.decisions;

    if (filter.runId) {
      results = results.filter((d) => d.run_id === filter.runId);
    }
    if (filter.minScore !== undefined) {
      results = results.filter((d) => d.score >= filter.minScore);
    }
    if (filter.maxScore !== undefined) {
      results = results.filter((d) => d.score <= filter.maxScore);
    }
    if (filter.vetoed !== undefined) {
      results = results.filter((d) => d.veto === filter.vetoed);
    }
    if (filter.limit) {
      results = results.slice(-filter.limit);
    }

    return results;
  }

  getOverrides(limit = 50) {
    return this.overrides.slice(-limit);
  }

  getStats() {
    return { ...this.stats };
  }

  getRecentAvgScore(window = 20) {
    const recent = this.decisions.slice(-window);
    if (recent.length === 0) return 0;
    return recent.reduce((sum, d) => sum + (d.score || 0), 0) / recent.length;
  }

  exportJSON() {
    return {
      stats: this.stats,
      decisions: this.decisions,
      overrides: this.overrides,
      exported_at: new Date().toISOString(),
    };
  }
}

module.exports = DecisionLogger;
