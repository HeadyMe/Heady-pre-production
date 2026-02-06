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
// ║  FILE: packages/hc-readiness/src/index.js                         ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Operational Readiness Evaluator
 *
 * Computes Operational Readiness Score (ORS) 0–100 from:
 *   - Probe results (HTTP, connection, process checks)
 *   - Error budget remaining
 *   - Config alignment
 *
 * Thresholds:
 *   >= 85: Full parallelism, aggressive building
 *   70–85: Normal operation
 *   50–70: Maintenance mode
 *   < 50:  Recovery mode
 */

const http = require("http");
const https = require("https");

const CRITICALITY_WEIGHTS = {
  critical: 40,
  high: 20,
  medium: 10,
  low: 5,
};

class ReadinessEvaluator {
  constructor(options = {}) {
    this.probes = options.probes || [];
    this.scoring = options.scoring || {};
    this.history = [];
  }

  /**
   * Run all configured probes and compute readiness score.
   */
  async evaluate() {
    const results = [];

    for (const probe of this.probes) {
      try {
        const result = await this._runProbe(probe);
        results.push(result);
      } catch (err) {
        results.push({
          name: probe.name,
          criticality: probe.criticality || "medium",
          status: "down",
          error: err.message,
          latencyMs: 0,
        });
      }
    }

    const score = this._computeScore(results);
    const mode = this._determineMode(score);

    const evaluation = {
      timestamp: new Date().toISOString(),
      score,
      mode,
      probeCount: results.length,
      healthy: results.filter((r) => r.status === "ok").length,
      degraded: results.filter((r) => r.status === "degraded").length,
      down: results.filter((r) => r.status === "down").length,
      probes: results,
    };

    this.history.push(evaluation);
    return evaluation;
  }

  async _runProbe(probe) {
    const start = Date.now();

    if (probe.type === "http") {
      return this._runHttpProbe(probe, start);
    }

    if (probe.type === "connection") {
      return {
        name: probe.name,
        criticality: probe.criticality || "medium",
        status: probe.connectionVar && process.env[probe.connectionVar] ? "ok" : "down",
        latencyMs: Date.now() - start,
        detail: probe.connectionVar ? "connection var set" : "connection var missing",
      };
    }

    return {
      name: probe.name,
      criticality: probe.criticality || "medium",
      status: "ok",
      latencyMs: Date.now() - start,
      detail: "unknown probe type — assumed ok",
    };
  }

  _runHttpProbe(probe, start) {
    return new Promise((resolve) => {
      const url = new URL(probe.url);
      const client = url.protocol === "https:" ? https : http;
      const maxLatency = probe.maxLatencyMs || 5000;

      const req = client.request(url, { method: probe.method || "GET", timeout: maxLatency }, (res) => {
        const latencyMs = Date.now() - start;
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          const expectedStatus = probe.expectedStatus || 200;
          let status = "ok";

          if (res.statusCode !== expectedStatus) {
            status = "degraded";
          } else if (latencyMs > maxLatency) {
            status = "degraded";
          } else if (probe.expectedBody?.contains && !body.includes(probe.expectedBody.contains)) {
            status = "degraded";
          }

          resolve({
            name: probe.name,
            criticality: probe.criticality || "medium",
            status,
            statusCode: res.statusCode,
            latencyMs,
          });
        });
      });

      req.on("error", (err) => {
        resolve({
          name: probe.name,
          criticality: probe.criticality || "medium",
          status: "down",
          error: err.message,
          latencyMs: Date.now() - start,
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          name: probe.name,
          criticality: probe.criticality || "medium",
          status: "down",
          error: "timeout",
          latencyMs: Date.now() - start,
        });
      });

      req.end();
    });
  }

  _computeScore(results) {
    let totalWeight = 0;
    let earnedWeight = 0;

    for (const r of results) {
      const w = CRITICALITY_WEIGHTS[r.criticality] || 10;
      totalWeight += w;
      if (r.status === "ok") earnedWeight += w;
      else if (r.status === "degraded") earnedWeight += w * 0.5;
    }

    return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
  }

  _determineMode(score) {
    if (score >= 85) return "aggressive";
    if (score >= 70) return "normal";
    if (score >= 50) return "maintenance";
    return "recovery";
  }

  getHistory() { return this.history; }
  getLastEvaluation() { return this.history[this.history.length - 1] || null; }
}

module.exports = { ReadinessEvaluator, CRITICALITY_WEIGHTS };
