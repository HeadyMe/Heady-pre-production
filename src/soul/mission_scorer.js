// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: mission_scorer.js                                         ║
// ║  LAYER: soul                                                     ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Mission Scorer — evaluates tasks/strategies against HeadySoul value dimensions
 * Uses keyword matching + metadata analysis locally
 * Falls back to Colab GPU node for ML-powered semantic scoring when available
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");

// Mission keyword banks per dimension
const MISSION_KEYWORDS = {
  access: [
    "free", "nonprofit", "student", "open-source", "ppp", "purchasing power",
    "underserved", "accessibility", "a11y", "inclusive", "education", "community",
    "low-income", "global south", "multilingual", "offline", "mobile-first",
  ],
  fairness: [
    "transparent", "co-ownership", "open", "no lock-in", "portable", "export",
    "ethical", "consent", "privacy", "fair", "equitable", "democratic",
    "no dark pattern", "honest", "trust", "accountability",
  ],
  intelligence: [
    "learning", "adaptive", "self-improving", "ai", "ml", "optimization",
    "pattern", "prediction", "analysis", "insight", "intelligent", "smart",
    "autonomous", "self-correcting", "evolution",
  ],
  happiness: [
    "joy", "delight", "satisfaction", "ux", "user experience", "beautiful",
    "intuitive", "simple", "fast", "responsive", "pleasant", "friendly",
    "helpful", "supportive", "empowering",
  ],
  redistribution: [
    "revenue sharing", "donation", "wealth", "redistribution", "profit sharing",
    "cooperative", "mutual aid", "social impact", "giveback", "scholarship",
    "subsidy", "pay-what-you-can", "sliding scale",
  ],
};

// Anti-patterns — these REDUCE scores
const ANTI_PATTERNS = {
  access: ["paywall", "premium-only", "enterprise-only", "restricted", "gated"],
  fairness: ["lock-in", "dark pattern", "manipulate", "deceive", "hidden fee", "vendor lock"],
  intelligence: ["hardcoded", "static", "manual-only", "no-learning"],
  happiness: ["frustrating", "confusing", "slow", "broken", "error-prone"],
  redistribution: ["extract", "maximize profit", "squeeze", "exploit", "monopolize"],
};

// Sacred Geometry alignment keywords
const SACRED_GEOMETRY_KEYWORDS = [
  "organic", "breathing", "deterministic", "self-correcting", "fractal",
  "natural", "rhythmic", "renewal", "healing", "coherent", "harmonic",
];

class MissionScorer {
  constructor(valueWeights) {
    this.valueWeights = valueWeights;
    this.colabUrl = process.env.HEADY_SOUL_COLAB_URL || null;
    this.colabAvailable = false;
    this.scoringHistory = [];
  }

  /**
   * Score a task against all mission dimensions
   * Returns { total: 0-100, breakdown: { access, fairness, ... }, sacred_geometry: 0-1 }
   */
  async scoreTask(task, dimensionInputs = {}) {
    // Try Colab GPU scoring first (ML-powered semantic similarity)
    if (this.colabUrl && this.colabAvailable) {
      try {
        const colabScore = await this._scoreViaColab(task);
        if (colabScore) return colabScore;
      } catch (_) {
        this.colabAvailable = false;
      }
    }

    // Local scoring: keyword matching + metadata analysis
    const weights = this.valueWeights.getWeights();
    const text = this._extractText(task);
    const breakdown = {};

    for (const dimension of Object.keys(weights)) {
      const keywordScore = this._keywordScore(text, dimension);
      const metadataScore = dimensionInputs[dimension] ?? this._metadataScore(task, dimension);
      const antiScore = this._antiPatternPenalty(text, dimension);

      // Blend keyword (40%), metadata (40%), anti-pattern penalty (20%)
      breakdown[dimension] = Math.max(0, Math.min(100,
        (keywordScore * 0.4 + metadataScore * 100 * 0.4 - antiScore * 0.2)
      ));
    }

    // Sacred Geometry coherence bonus
    const sgScore = this._sacredGeometryScore(text);
    const sgWeight = this.valueWeights.sacredGeometry?.coherence_weight || 0.15;

    // Weighted total
    let total = 0;
    for (const [dim, weight] of Object.entries(weights)) {
      total += (breakdown[dim] || 0) * weight;
    }
    // Add Sacred Geometry bonus (up to 15 points)
    total += sgScore * sgWeight * 100;
    total = Math.min(100, Math.round(total * 100) / 100);

    const result = { total, breakdown, sacred_geometry: sgScore };

    this.scoringHistory.push({
      task_id: task.id || "unknown",
      score: total,
      timestamp: Date.now(),
    });
    if (this.scoringHistory.length > 5000) {
      this.scoringHistory = this.scoringHistory.slice(-2500);
    }

    return result;
  }

  /**
   * Score a strategy for Monte Carlo filtering
   */
  async scoreStrategy(strategy, context) {
    const task = {
      id: strategy.id || `strategy-${Date.now()}`,
      title: strategy.name || "",
      description: JSON.stringify(strategy.steps || strategy),
      metadata: { ...strategy, context },
    };
    const score = await this.scoreTask(task);
    return score.total;
  }

  /**
   * Check hard vetoes — these are non-negotiable
   */
  checkHardVetoes(task) {
    const text = this._extractText(task).toLowerCase();
    const vetoes = this.valueWeights.hardVetoes || [];
    const triggered = [];

    for (const veto of vetoes) {
      if (text.includes(veto.pattern.replace(/_/g, " ")) ||
        text.includes(veto.pattern.replace(/_/g, ""))) {
        triggered.push(veto);
      }
    }

    return triggered;
  }

  /**
   * Keyword-based dimension score (0-100)
   */
  _keywordScore(text, dimension) {
    const keywords = MISSION_KEYWORDS[dimension] || [];
    if (keywords.length === 0) return 50;

    let matches = 0;
    const lower = text.toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw)) matches++;
    }

    // Scale: 0 matches = 60 (baseline), each match adds up to 40/keywords.length
    const matchRatio = matches / keywords.length;
    return Math.min(100, 60 + matchRatio * 40);
  }

  /**
   * Metadata-based dimension score (0-1)
   */
  _metadataScore(task, dimension) {
    const meta = task.metadata || {};

    switch (dimension) {
      case "access":
        if (meta.targetUsers) {
          const targets = Array.isArray(meta.targetUsers) ? meta.targetUsers : [meta.targetUsers];
          const accessTargets = ["free", "nonprofit", "student", "community"];
          const overlap = targets.filter((t) => accessTargets.includes(t)).length;
          return overlap > 0 ? 0.8 + overlap * 0.1 : 0.7;
        }
        return 0.7;

      case "fairness":
        if (meta.extractive === true) return 0.1;
        if (meta.openSource === true) return 0.9;
        if (meta.transparent === true) return 0.8;
        return 0.7;

      case "intelligence":
        if (meta.aiImprovement === true || meta.learning === true) return 0.9;
        if (meta.selfImproving === true) return 0.85;
        return 0.7;

      case "happiness":
        if (meta.uxImprovement === true) return 0.8;
        if (meta.userFacing === true) return 0.6;
        return 0.7;

      case "redistribution":
        if (meta.redistributionMechanism === true) return 1.0;
        if (meta.revenueSharing === true) return 0.9;
        if (meta.donation === true) return 0.8;
        return 0.6;

      default:
        return 0.5;
    }
  }

  /**
   * Anti-pattern penalty (0-100 reduction)
   */
  _antiPatternPenalty(text, dimension) {
    const patterns = ANTI_PATTERNS[dimension] || [];
    const lower = text.toLowerCase();
    let penalty = 0;

    for (const pattern of patterns) {
      if (lower.includes(pattern)) penalty += 20;
    }

    return Math.min(100, penalty);
  }

  /**
   * Sacred Geometry alignment score (0-1)
   */
  _sacredGeometryScore(text) {
    const lower = text.toLowerCase();
    let matches = 0;
    for (const kw of SACRED_GEOMETRY_KEYWORDS) {
      if (lower.includes(kw)) matches++;
    }
    return Math.min(1.0, matches / 3);
  }

  /**
   * Extract searchable text from task
   */
  _extractText(task) {
    const parts = [
      task.title || "",
      task.description || "",
      task.type || "",
      JSON.stringify(task.payload || ""),
      JSON.stringify(task.metadata || ""),
    ];
    return parts.join(" ");
  }

  /**
   * Score via Colab GPU node (ML-powered semantic similarity)
   */
  async _scoreViaColab(task) {
    return new Promise((resolve, reject) => {
      const parsed = new URL(`${this.colabUrl}/api/soul/evaluate`);
      const lib = parsed.protocol === "https:" ? https : http;
      const body = JSON.stringify(task);

      const req = lib.request({
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: parsed.pathname,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
        timeout: 10000,
      }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve(null); }
        });
      });

      req.on("error", reject);
      req.on("timeout", () => { req.destroy(); reject(new Error("Colab timeout")); });
      req.write(body);
      req.end();
    });
  }

  /**
   * Set Colab URL and test connectivity
   */
  async setColabUrl(url) {
    this.colabUrl = url;
    try {
      await this._scoreViaColab({ title: "connectivity_test", type: "ping" });
      this.colabAvailable = true;
      console.log(`[HeadySoul] Colab GPU scoring connected: ${url}`);
    } catch (_) {
      this.colabAvailable = false;
      console.log(`[HeadySoul] Colab unavailable, using local scoring`);
    }
  }

  getStats() {
    const recent = this.scoringHistory.slice(-100);
    return {
      total_scored: this.scoringHistory.length,
      colab_available: this.colabAvailable,
      colab_url: this.colabUrl ? "configured" : "not_set",
      avg_recent_score: recent.length > 0
        ? Math.round(recent.reduce((s, h) => s + h.score, 0) / recent.length * 100) / 100
        : 0,
    };
  }
}

module.exports = MissionScorer;
