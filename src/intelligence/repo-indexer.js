// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: repo-indexer.js                                           ║
// ║  LAYER: intelligence                                             ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Repo Intelligence Indexer
 * Scans repos for optimization hints, classifies into performance profiles:
 *   Fast lanes: High-coverage, low-coupling → speed MAX by default
 *   Slow lanes: Legacy/cross-cutting → extra validation
 *   Hotspots: Frequently changed files → streamlined tooling, elevated scrutiny
 *
 * Self-optimizing estimator: learns actual durations, improves future estimates
 */

const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(__dirname, "intelligence-manifest.json"), "utf8")
);

class HeadyRepoIndexer extends EventEmitter {
  constructor() {
    super();
    this.repos = new Map();
    this.fileProfiles = new Map(); // filePath → { lane, change_count, avg_duration_ms }
    this.durationHistory = new Map(); // taskType → [actual_duration_ms]
    this.estimateAccuracy = [];
    this.metrics = {
      repos_indexed: 0,
      files_profiled: 0,
      fast_lane_files: 0,
      slow_lane_files: 0,
      hotspot_files: 0,
      estimates_improved: 0,
    };
  }

  /**
   * Index a repository — scan files, classify into lanes
   */
  indexRepo(repoId, fileList) {
    const repo = {
      id: repoId,
      indexed_at: new Date().toISOString(),
      total_files: fileList.length,
      profiles: { fast_lane: [], slow_lane: [], hotspot: [] },
      summary: {},
    };

    for (const file of fileList) {
      const profile = this._classifyFile(file);
      this.fileProfiles.set(file.path, profile);
      repo.profiles[profile.lane].push(file.path);
      this.metrics.files_profiled++;

      switch (profile.lane) {
        case "fast_lane": this.metrics.fast_lane_files++; break;
        case "slow_lane": this.metrics.slow_lane_files++; break;
        case "hotspot": this.metrics.hotspot_files++; break;
      }
    }

    repo.summary = {
      fast_lane_pct: Math.round((repo.profiles.fast_lane.length / fileList.length) * 100),
      slow_lane_pct: Math.round((repo.profiles.slow_lane.length / fileList.length) * 100),
      hotspot_pct: Math.round((repo.profiles.hotspot.length / fileList.length) * 100),
    };

    this.repos.set(repoId, repo);
    this.metrics.repos_indexed++;
    this.emit("repo_indexed", repo);
    return repo;
  }

  /**
   * Classify a file into a performance lane
   */
  _classifyFile(file) {
    const { path: filePath, change_frequency, test_coverage, coupling_score, is_legacy } = file;

    // Hotspot: frequently changed
    if ((change_frequency || 0) > 10) {
      return {
        lane: "hotspot",
        default_speed: MANIFEST.repo_profiles.hotspot.default_speed,
        validation: MANIFEST.repo_profiles.hotspot.validation,
        streamlined_tooling: true,
        reason: `change_frequency=${change_frequency}`,
      };
    }

    // Slow lane: legacy or cross-cutting with high coupling
    if (is_legacy || (coupling_score || 0) > 0.7) {
      return {
        lane: "slow_lane",
        default_speed: MANIFEST.repo_profiles.slow_lane.default_speed,
        validation: MANIFEST.repo_profiles.slow_lane.validation,
        streamlined_tooling: false,
        reason: is_legacy ? "legacy_code" : `coupling=${coupling_score}`,
      };
    }

    // Fast lane: good coverage, low coupling
    if ((test_coverage || 0) > 0.6 && (coupling_score || 0) < 0.3) {
      return {
        lane: "fast_lane",
        default_speed: MANIFEST.repo_profiles.fast_lane.default_speed,
        validation: MANIFEST.repo_profiles.fast_lane.validation,
        streamlined_tooling: false,
        reason: `coverage=${test_coverage},coupling=${coupling_score}`,
      };
    }

    // Default: treat as fast lane
    return {
      lane: "fast_lane",
      default_speed: "ON",
      validation: "balanced",
      streamlined_tooling: false,
      reason: "default_classification",
    };
  }

  /**
   * Get speed recommendation for a file path
   */
  getFileSpeedRecommendation(filePath) {
    const profile = this.fileProfiles.get(filePath);
    if (!profile) return { speed: "ON", lane: "unknown", reason: "not_indexed" };

    return {
      speed: profile.default_speed,
      lane: profile.lane,
      validation: profile.validation,
      streamlined_tooling: profile.streamlined_tooling,
      reason: profile.reason,
    };
  }

  /**
   * Self-Optimizing Estimator
   * Record actual task duration and improve future estimates
   */
  recordTaskDuration(taskType, estimatedMs, actualMs) {
    if (!this.durationHistory.has(taskType)) {
      this.durationHistory.set(taskType, []);
    }

    const history = this.durationHistory.get(taskType);
    history.push({
      estimated_ms: estimatedMs,
      actual_ms: actualMs,
      accuracy: estimatedMs > 0 ? actualMs / estimatedMs : 1,
      recorded_at: Date.now(),
    });

    // Keep bounded
    if (history.length > 1000) {
      this.durationHistory.set(taskType, history.slice(-500));
    }

    this.estimateAccuracy.push({
      task_type: taskType,
      estimated_ms: estimatedMs,
      actual_ms: actualMs,
      error_pct: estimatedMs > 0 ? Math.round(Math.abs(actualMs - estimatedMs) / estimatedMs * 100) : 0,
    });

    if (this.estimateAccuracy.length > 5000) {
      this.estimateAccuracy = this.estimateAccuracy.slice(-2500);
    }

    this.metrics.estimates_improved++;
  }

  /**
   * Get improved estimate for a task type based on historical data
   */
  getImprovedEstimate(taskType, fallbackMs = 30000) {
    const history = this.durationHistory.get(taskType);
    if (!history || history.length < 3) {
      return { estimate_ms: fallbackMs, confidence: "low", samples: history?.length || 0 };
    }

    // Use exponential moving average of recent actuals
    const recent = history.slice(-20);
    let ema = recent[0].actual_ms;
    const alpha = 0.3;
    for (let i = 1; i < recent.length; i++) {
      ema = alpha * recent[i].actual_ms + (1 - alpha) * ema;
    }

    const samples = recent.length;
    const confidence = samples >= 10 ? "high" : samples >= 5 ? "medium" : "low";

    return {
      estimate_ms: Math.round(ema),
      confidence,
      samples,
      avg_accuracy: Math.round(recent.reduce((s, h) => s + h.accuracy, 0) / recent.length * 100) / 100,
    };
  }

  /**
   * Get overall estimator performance
   */
  getEstimatorStats() {
    const taskTypes = [...this.durationHistory.keys()];
    const stats = {};

    for (const taskType of taskTypes) {
      const history = this.durationHistory.get(taskType);
      if (!history || history.length === 0) continue;

      const recent = history.slice(-20);
      const avgAccuracy = recent.reduce((s, h) => s + h.accuracy, 0) / recent.length;
      const avgActual = recent.reduce((s, h) => s + h.actual_ms, 0) / recent.length;

      stats[taskType] = {
        samples: history.length,
        avg_accuracy: Math.round(avgAccuracy * 100) / 100,
        avg_actual_ms: Math.round(avgActual),
        improved_estimate: this.getImprovedEstimate(taskType),
      };
    }

    return stats;
  }

  getState() {
    return {
      repos_indexed: this.metrics.repos_indexed,
      files_profiled: this.metrics.files_profiled,
      lane_distribution: {
        fast_lane: this.metrics.fast_lane_files,
        slow_lane: this.metrics.slow_lane_files,
        hotspot: this.metrics.hotspot_files,
      },
      estimator: {
        task_types_tracked: this.durationHistory.size,
        total_recordings: this.metrics.estimates_improved,
        stats: this.getEstimatorStats(),
      },
      repos: [...this.repos.values()].map((r) => ({
        id: r.id,
        indexed_at: r.indexed_at,
        total_files: r.total_files,
        summary: r.summary,
      })),
    };
  }
}

module.exports = HeadyRepoIndexer;
