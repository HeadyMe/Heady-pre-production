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
// ║  FILE: packages/hc-health/src/index.js                            ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Node Health Check Runner
 *
 * Integrates node-cron with health check scripts and probes.
 * Provides NHC-style health checks for Heady services:
 *   - Process alive checks
 *   - HTTP endpoint checks
 *   - Disk/memory/load checks (via shell scripts)
 *   - Custom script execution
 *
 * Results feed into ReadinessEvaluator and System Brain.
 */

const { exec } = require("child_process");
const http = require("http");
const https = require("https");
const os = require("os");

class HealthCheckRunner {
  constructor(options = {}) {
    this.checks = options.checks || [];
    this.cronSchedule = options.cronSchedule || "*/5 * * * *"; // every 5 min
    this.results = new Map(); // checkName → last result
    this.history = [];
    this.cronJob = null;
    this.onResult = options.onResult || null; // callback(checkName, result)
  }

  /**
   * Register a health check.
   */
  addCheck(check) {
    this.checks.push(check);
  }

  /**
   * Run all checks once.
   */
  async runAll() {
    const timestamp = new Date().toISOString();
    const results = [];

    for (const check of this.checks) {
      try {
        const result = await this._runCheck(check);
        result.timestamp = timestamp;
        this.results.set(check.name, result);
        results.push(result);

        if (this.onResult) {
          this.onResult(check.name, result);
        }
      } catch (err) {
        const failResult = {
          name: check.name,
          type: check.type,
          status: "down",
          error: err.message,
          timestamp,
        };
        this.results.set(check.name, failResult);
        results.push(failResult);

        if (this.onResult) {
          this.onResult(check.name, failResult);
        }
      }
    }

    this.history.push({ timestamp, results });

    // Keep history bounded
    if (this.history.length > 100) {
      this.history = this.history.slice(-50);
    }

    return results;
  }

  /**
   * Start cron-scheduled health checks.
   */
  startCron() {
    try {
      const cron = require("node-cron");
      this.cronJob = cron.schedule(this.cronSchedule, () => {
        this.runAll().catch((err) => {
          console.error("[hc-health] Cron check error:", err.message);
        });
      });
      return true;
    } catch (err) {
      console.warn("[hc-health] node-cron not available, cron scheduling disabled:", err.message);
      return false;
    }
  }

  /**
   * Stop cron.
   */
  stopCron() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
  }

  async _runCheck(check) {
    switch (check.type) {
      case "http":
        return this._httpCheck(check);
      case "process":
        return this._processCheck(check);
      case "script":
        return this._scriptCheck(check);
      case "system":
        return this._systemCheck(check);
      default:
        return { name: check.name, type: check.type, status: "ok", detail: "unknown type — assumed ok" };
    }
  }

  _httpCheck(check) {
    return new Promise((resolve) => {
      const url = new URL(check.url);
      const client = url.protocol === "https:" ? https : http;
      const timeout = check.timeoutMs || 5000;
      const start = Date.now();

      const req = client.request(url, { method: check.method || "GET", timeout }, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          resolve({
            name: check.name,
            type: "http",
            status: res.statusCode === (check.expectedStatus || 200) ? "ok" : "degraded",
            statusCode: res.statusCode,
            latencyMs: Date.now() - start,
          });
        });
      });

      req.on("error", (err) => {
        resolve({ name: check.name, type: "http", status: "down", error: err.message, latencyMs: Date.now() - start });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({ name: check.name, type: "http", status: "down", error: "timeout", latencyMs: Date.now() - start });
      });

      req.end();
    });
  }

  _processCheck(check) {
    return new Promise((resolve) => {
      const procName = process.platform === "win32" && !check.processName.includes(".")
      ? `${check.processName}.exe`
      : check.processName;
    const cmd = process.platform === "win32"
        ? `tasklist /FI "IMAGENAME eq ${procName}" /NH`
        : `pgrep -f ${check.processName}`;

      exec(cmd, { timeout: 5000 }, (err, stdout) => {
        const running = !err && stdout && stdout.trim().length > 0
          && !stdout.includes("No tasks are running");
        resolve({
          name: check.name,
          type: "process",
          status: running ? "ok" : "down",
          detail: running ? "process found" : "process not found",
        });
      });
    });
  }

  _scriptCheck(check) {
    return new Promise((resolve) => {
      exec(check.command, { timeout: check.timeoutMs || 10000 }, (err, stdout, stderr) => {
        resolve({
          name: check.name,
          type: "script",
          status: err ? "down" : "ok",
          exitCode: err ? err.code : 0,
          output: stdout ? stdout.trim().slice(0, 500) : "",
          error: stderr ? stderr.trim().slice(0, 200) : "",
        });
      });
    });
  }

  _systemCheck(_check) {
    const loadAvg = os.loadavg();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    const cpuCount = os.cpus().length;

    let status = "ok";
    if (loadAvg[0] > cpuCount * 2) status = "degraded";
    if (memUsage > 95) status = "degraded";
    if (memUsage > 99) status = "down";

    return Promise.resolve({
      name: _check.name || "system",
      type: "system",
      status,
      load1m: loadAvg[0].toFixed(2),
      load5m: loadAvg[1].toFixed(2),
      memUsagePercent: memUsage.toFixed(1),
      freeMemMB: Math.round(freeMem / 1024 / 1024),
      cpuCount,
      uptime: os.uptime(),
    });
  }

  /**
   * Get current health snapshot (all latest results).
   */
  getSnapshot() {
    const entries = Array.from(this.results.entries()).map(([name, result]) => ({
      name,
      ...result,
    }));

    const healthy = entries.filter((e) => e.status === "ok").length;
    const degraded = entries.filter((e) => e.status === "degraded").length;
    const down = entries.filter((e) => e.status === "down").length;

    return {
      timestamp: new Date().toISOString(),
      total: entries.length,
      healthy,
      degraded,
      down,
      overallStatus: down > 0 ? "unhealthy" : degraded > 0 ? "degraded" : "healthy",
      checks: entries,
    };
  }

  getHistory() { return this.history; }
}

/**
 * Create a default set of Heady health checks.
 */
function createDefaultChecks() {
  return [
    {
      name: "heady-manager-health",
      type: "http",
      url: "http://localhost:3300/api/health",
      method: "GET",
      expectedStatus: 200,
      timeoutMs: 5000,
    },
    {
      name: "heady-manager-pulse",
      type: "http",
      url: "http://localhost:3300/api/pulse",
      method: "GET",
      expectedStatus: 200,
      timeoutMs: 5000,
    },
    {
      name: "system-resources",
      type: "system",
    },
    {
      name: "node-process",
      type: "process",
      processName: "node",
    },
  ];
}

module.exports = { HealthCheckRunner, createDefaultChecks };
