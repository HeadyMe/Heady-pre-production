// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: heady-node-agent.js                                       ║
// ║  LAYER: cluster                                                  ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * HeadyNode Agent — Runs on physical compute hardware
 *
 * Lightweight Express server that:
 *   - Registers with HeadyComputeCluster on the cloud services
 *   - Reports hardware capabilities (CPU, RAM, GPU, storage)
 *   - Accepts task dispatches from the Intelligence Engine
 *   - Executes tasks in isolated processes
 *   - Sends heartbeats with system metrics
 *   - Reports task completion/failure back to the cluster
 *
 * Designed for: Ryzen 9 mini-computer (32GB RAM), old laptops, any Linux/macOS box
 * Connectivity: Cloudflare Tunnel for zero-trust ingress
 */

const express = require("express");
const os = require("os");
const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const { URL } = require("url");

// ═══════════════════════════════════════════════════════════════
// HTTP CLIENT
// ═══════════════════════════════════════════════════════════════

function httpRequest(method, urlStr, body, headers = {}, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const lib = parsed.protocol === "https:" ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: { "Content-Type": "application/json", ...headers },
      timeout,
    };
    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROFILER
// ═══════════════════════════════════════════════════════════════

class SystemProfiler {
  static getHardwareProfile() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();

    let gpuModel = null;
    let gpuVramGb = 0;
    try {
      // Try nvidia-smi for NVIDIA GPUs
      const nvidiaSmi = execSync("nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits 2>/dev/null", { encoding: "utf8" }).trim();
      if (nvidiaSmi) {
        const parts = nvidiaSmi.split(",").map(s => s.trim());
        gpuModel = parts[0];
        gpuVramGb = Math.round(parseInt(parts[1] || "0") / 1024);
      }
    } catch { /* no NVIDIA GPU */ }

    if (!gpuModel) {
      try {
        // Try lspci for AMD GPUs
        const lspci = execSync("lspci 2>/dev/null | grep -i 'vga\\|3d\\|display'", { encoding: "utf8" }).trim();
        if (lspci) {
          gpuModel = lspci.split(":").slice(-1)[0].trim().substring(0, 80);
        }
      } catch { /* no lspci */ }
    }

    let storageGb = 0;
    try {
      const df = execSync("df -BG / 2>/dev/null | tail -1 | awk '{print $2}'", { encoding: "utf8" }).trim();
      storageGb = parseInt(df) || 0;
    } catch { /* fallback */ }

    return {
      cpu_model: cpus[0]?.model || "unknown",
      cpu_cores: os.cpus().length,
      cpu_threads: os.cpus().length,
      ram_gb: Math.round(totalMem / (1024 ** 3)),
      gpu_model: gpuModel,
      gpu_vram_gb: gpuVramGb,
      storage_gb: storageGb,
      os: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      hostname: os.hostname(),
    };
  }

  static getSystemStats() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const loadAvg = os.loadavg();

    // CPU usage calculation
    let totalIdle = 0, totalTick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) totalTick += cpu.times[type];
      totalIdle += cpu.times.idle;
    }
    const cpuUsagePct = Math.round((1 - totalIdle / totalTick) * 100);

    const ramUsagePct = Math.round(((totalMem - freeMem) / totalMem) * 100);

    let diskUsagePct = 0;
    try {
      const df = execSync("df / 2>/dev/null | tail -1 | awk '{print $5}'", { encoding: "utf8" }).trim();
      diskUsagePct = parseInt(df) || 0;
    } catch { /* fallback */ }

    return {
      cpu_usage_pct: cpuUsagePct,
      ram_usage_pct: ramUsagePct,
      ram_free_gb: Math.round(freeMem / (1024 ** 3) * 10) / 10,
      disk_usage_pct: diskUsagePct,
      load_avg: loadAvg.map(l => Math.round(l * 100) / 100),
      uptime_sec: os.uptime(),
    };
  }

  static detectCapabilities() {
    const caps = [];

    // Node.js
    caps.push("node");

    // Docker
    try { execSync("docker --version 2>/dev/null"); caps.push("docker"); } catch { /* */ }

    // Git
    try { execSync("git --version 2>/dev/null"); caps.push("git"); } catch { /* */ }

    // Python
    try { execSync("python3 --version 2>/dev/null"); caps.push("python"); } catch {
      try { execSync("python --version 2>/dev/null"); caps.push("python"); } catch { /* */ }
    }

    // GPU
    try { execSync("nvidia-smi 2>/dev/null"); caps.push("gpu"); caps.push("cuda"); } catch { /* */ }

    // Storage (if > 100GB free)
    try {
      const df = execSync("df -BG / 2>/dev/null | tail -1 | awk '{print $4}'", { encoding: "utf8" }).trim();
      if (parseInt(df) > 100) caps.push("storage");
    } catch { /* */ }

    // Build tools
    try { execSync("make --version 2>/dev/null"); caps.push("make"); } catch { /* */ }
    try { execSync("gcc --version 2>/dev/null"); caps.push("gcc"); } catch { /* */ }

    return caps;
  }
}

// ═══════════════════════════════════════════════════════════════
// TASK EXECUTOR
// ═══════════════════════════════════════════════════════════════

class TaskExecutor {
  constructor() {
    this.activeTasks = new Map();
    this.completedTasks = [];
    this.maxHistory = 500;
    this.metrics = {
      total_executed: 0,
      total_completed: 0,
      total_failed: 0,
      total_duration_ms: 0,
    };
  }

  async execute(task) {
    const startTime = Date.now();
    const taskId = task.task_id || `local-${Date.now()}`;

    this.activeTasks.set(taskId, {
      ...task,
      started_at: new Date().toISOString(),
      status: "running",
    });

    this.metrics.total_executed++;

    try {
      let result;

      switch (task.task_type) {
        case "build":
          result = await this._executeBuild(task);
          break;
        case "test":
          result = await this._executeTest(task);
          break;
        case "lint":
          result = await this._executeLint(task);
          break;
        case "docker_build":
          result = await this._executeDockerBuild(task);
          break;
        case "data_process":
          result = await this._executeDataProcess(task);
          break;
        case "batch_job":
          result = await this._executeBatchJob(task);
          break;
        case "indexing":
          result = await this._executeIndexing(task);
          break;
        case "backup":
          result = await this._executeBackup(task);
          break;
        case "shell":
          result = await this._executeShell(task);
          break;
        default:
          result = await this._executeGeneric(task);
      }

      const duration = Date.now() - startTime;
      this.metrics.total_completed++;
      this.metrics.total_duration_ms += duration;

      const completed = {
        task_id: taskId,
        status: "completed",
        result,
        duration_ms: duration,
        completed_at: new Date().toISOString(),
      };

      this.activeTasks.delete(taskId);
      this.completedTasks.push(completed);
      this._trimHistory();

      return completed;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.total_failed++;

      const failed = {
        task_id: taskId,
        status: "failed",
        error: error.message,
        duration_ms: duration,
        completed_at: new Date().toISOString(),
      };

      this.activeTasks.delete(taskId);
      this.completedTasks.push(failed);
      this._trimHistory();

      return failed;
    }
  }

  async _executeBuild(task) {
    const cwd = task.payload?.cwd || process.cwd();
    const cmd = task.payload?.command || "npm run build";
    return this._runProcess(cmd, cwd, task.timeout_ms || 120000);
  }

  async _executeTest(task) {
    const cwd = task.payload?.cwd || process.cwd();
    const cmd = task.payload?.command || "npm test";
    return this._runProcess(cmd, cwd, task.timeout_ms || 60000);
  }

  async _executeLint(task) {
    const cwd = task.payload?.cwd || process.cwd();
    const cmd = task.payload?.command || "npm run lint";
    return this._runProcess(cmd, cwd, task.timeout_ms || 30000);
  }

  async _executeDockerBuild(task) {
    const dockerfile = task.payload?.dockerfile || "Dockerfile";
    const tag = task.payload?.tag || "heady-build:latest";
    const context = task.payload?.context || ".";
    return this._runProcess(`docker build -f ${dockerfile} -t ${tag} ${context}`, process.cwd(), task.timeout_ms || 300000);
  }

  async _executeDataProcess(task) {
    if (task.payload?.script) {
      const python = task.payload?.python || "python3";
      return this._runProcess(`${python} ${task.payload.script}`, process.cwd(), task.timeout_ms || 600000);
    }
    return { status: "completed", message: "No script provided" };
  }

  async _executeBatchJob(task) {
    if (task.payload?.command) {
      return this._runProcess(task.payload.command, task.payload?.cwd || process.cwd(), task.timeout_ms || 600000);
    }
    return { status: "completed", message: "No command provided" };
  }

  async _executeIndexing(task) {
    const cwd = task.payload?.cwd || process.cwd();
    const cmd = task.payload?.command || "find . -type f -name '*.js' | head -100";
    return this._runProcess(cmd, cwd, task.timeout_ms || 60000);
  }

  async _executeBackup(task) {
    const source = task.payload?.source || "/tmp/heady-backup";
    const dest = task.payload?.destination || "/tmp/heady-backup-archive";
    return this._runProcess(`tar -czf ${dest}.tar.gz ${source}`, "/", task.timeout_ms || 300000);
  }

  async _executeShell(task) {
    if (!task.payload?.command) {
      return { status: "failed", error: "No shell command provided" };
    }
    return this._runProcess(task.payload.command, task.payload?.cwd || process.cwd(), task.timeout_ms || 60000);
  }

  async _executeGeneric(task) {
    if (task.payload?.command) {
      return this._runProcess(task.payload.command, task.payload?.cwd || process.cwd(), task.timeout_ms || 30000);
    }
    // Simulate execution for unrecognized task types
    await new Promise(r => setTimeout(r, Math.min(task.timeout_ms || 1000, 5000)));
    return { status: "completed", simulated: true, task_type: task.task_type };
  }

  _runProcess(command, cwd, timeoutMs) {
    return new Promise((resolve, reject) => {
      const proc = spawn("bash", ["-c", command], {
        cwd,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
        timeout: timeoutMs,
      });

      let stdout = "";
      let stderr = "";
      const maxOutput = 50000; // Cap output at 50KB

      proc.stdout.on("data", (data) => {
        if (stdout.length < maxOutput) stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        if (stderr.length < maxOutput) stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        proc.kill("SIGTERM");
        reject(new Error(`Process timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      proc.on("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve({ exit_code: 0, stdout: stdout.slice(-5000), stderr: stderr.slice(-2000) });
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr.slice(-2000)}`));
        }
      });

      proc.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  getActiveTasks() {
    return Array.from(this.activeTasks.values());
  }

  getMetrics() {
    return {
      ...this.metrics,
      avg_duration_ms: this.metrics.total_completed > 0
        ? Math.round(this.metrics.total_duration_ms / this.metrics.total_completed)
        : 0,
      active_tasks: this.activeTasks.size,
      success_rate: this.metrics.total_executed > 0
        ? Math.round((this.metrics.total_completed / this.metrics.total_executed) * 100)
        : 100,
    };
  }

  _trimHistory() {
    if (this.completedTasks.length > this.maxHistory) {
      this.completedTasks = this.completedTasks.slice(-Math.floor(this.maxHistory / 2));
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// HEADY NODE AGENT SERVER
// ═══════════════════════════════════════════════════════════════

class HeadyNodeAgent {
  constructor(config = {}) {
    this.nodeId = config.nodeId || `node-${os.hostname()}`;
    this.nodeName = config.nodeName || os.hostname();
    this.port = config.port || parseInt(process.env.HEADY_NODE_PORT) || 7700;
    this.cloudEndpoints = config.cloudEndpoints || [
      "https://headysystems.com",
      "https://headycloud.com",
      "https://headyconnection.com",
    ];
    this.tunnelUrl = config.tunnelUrl || process.env.HEADY_TUNNEL_URL || null;
    this.heartbeatIntervalSec = config.heartbeatIntervalSec || 45;
    this.heartbeatTimer = null;
    this.registered = false;

    this.hardware = SystemProfiler.getHardwareProfile();
    this.capabilities = SystemProfiler.detectCapabilities();
    this.executor = new TaskExecutor();
    this.app = express();
    this._setupRoutes();
  }

  _setupRoutes() {
    this.app.use(express.json({ limit: "10mb" }));

    // Health endpoint (used by cluster manager for probes)
    this.app.get("/api/node/health", (req, res) => {
      res.json({
        ok: true,
        node_id: this.nodeId,
        name: this.nodeName,
        status: "active",
        registered: this.registered,
        hardware: this.hardware,
        capabilities: this.capabilities,
        system_stats: SystemProfiler.getSystemStats(),
        executor: this.executor.getMetrics(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    // Task dispatch endpoint (called by cluster manager)
    this.app.post("/api/node/task", async (req, res) => {
      const task = req.body;
      console.log(`[HeadyNode] Task received: ${task.task_type} (${task.task_id}) priority=${task.priority}`);

      // Execute asynchronously, return acceptance immediately
      res.json({
        accepted: true,
        task_id: task.task_id,
        node_id: this.nodeId,
        message: `Task ${task.task_id} accepted for execution`,
      });

      // Execute and report back
      const result = await this.executor.execute(task);

      // Report completion to all cloud endpoints
      this._reportTaskCompletion(result);
    });

    // Active tasks
    this.app.get("/api/node/tasks", (req, res) => {
      res.json({
        active: this.executor.getActiveTasks(),
        metrics: this.executor.getMetrics(),
        history: this.executor.completedTasks.slice(-20),
      });
    });

    // System info
    this.app.get("/api/node/system", (req, res) => {
      res.json({
        node_id: this.nodeId,
        hardware: this.hardware,
        capabilities: this.capabilities,
        system_stats: SystemProfiler.getSystemStats(),
      });
    });

    // Manual task submission (for local testing)
    this.app.post("/api/node/execute", async (req, res) => {
      try {
        const result = await this.executor.execute(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log("");
        console.log("  ╔══════════════════════════════════════════════════════════════╗");
        console.log("  ║  ∞ HEADY NODE AGENT ∞  Compute Cluster Worker               ║");
        console.log("  ╠══════════════════════════════════════════════════════════════╣");
        console.log(`  ║  Node ID:       ${this.nodeId.padEnd(44)}║`);
        console.log(`  ║  Port:          ${String(this.port).padEnd(44)}║`);
        console.log(`  ║  CPU:           ${this.hardware.cpu_model.substring(0, 44).padEnd(44)}║`);
        console.log(`  ║  Cores/Threads: ${(this.hardware.cpu_cores + "/" + this.hardware.cpu_threads).padEnd(44)}║`);
        console.log(`  ║  RAM:           ${(this.hardware.ram_gb + " GB").padEnd(44)}║`);
        console.log(`  ║  GPU:           ${(this.hardware.gpu_model || "None").substring(0, 44).padEnd(44)}║`);
        console.log(`  ║  Storage:       ${(this.hardware.storage_gb + " GB").padEnd(44)}║`);
        console.log(`  ║  OS:            ${this.hardware.os.substring(0, 44).padEnd(44)}║`);
        console.log(`  ║  Capabilities:  ${this.capabilities.join(", ").substring(0, 44).padEnd(44)}║`);
        console.log(`  ║  Tunnel:        ${(this.tunnelUrl || "Not configured").substring(0, 44).padEnd(44)}║`);
        console.log("  ╚══════════════════════════════════════════════════════════════╝");
        console.log("");

        // Register with cloud services
        this._registerWithCloud();

        // Start heartbeat
        this._startHeartbeat();

        resolve();
      });
    });
  }

  async stop() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.server) this.server.close();
    console.log("[HeadyNode] Agent stopped");
  }

  async _registerWithCloud() {
    if (!this.tunnelUrl) {
      console.warn("[HeadyNode] No tunnel URL configured — cannot register with cloud. Set HEADY_TUNNEL_URL.");
      return;
    }

    const registrationData = {
      node_id: this.nodeId,
      name: this.nodeName,
      tunnel_url: this.tunnelUrl,
      hardware: this.hardware,
      capabilities: this.capabilities,
      tags: ["compute", "physical", this.hardware.arch],
      location: "local",
    };

    for (const endpoint of this.cloudEndpoints) {
      try {
        const result = await httpRequest(
          "POST",
          `${endpoint}/api/cluster/nodes/register`,
          registrationData,
          { "X-Node-Id": this.nodeId },
          15000
        );
        if (result.status === 200 || result.status === 201) {
          console.log(`[HeadyNode] Registered with ${endpoint} — ${result.data?.tier || "ok"}`);
          this.registered = true;
        } else {
          console.warn(`[HeadyNode] Registration with ${endpoint} returned ${result.status}`);
        }
      } catch (err) {
        console.warn(`[HeadyNode] Could not register with ${endpoint}: ${err.message}`);
      }
    }
  }

  _startHeartbeat() {
    this.heartbeatTimer = setInterval(() => this._sendHeartbeat(), this.heartbeatIntervalSec * 1000);
  }

  async _sendHeartbeat() {
    if (!this.tunnelUrl) return;

    const heartbeat = {
      node_id: this.nodeId,
      status: "active",
      current_load: this.executor.getActiveTasks().length,
      metrics: this.executor.getMetrics(),
      system_stats: SystemProfiler.getSystemStats(),
    };

    for (const endpoint of this.cloudEndpoints) {
      try {
        await httpRequest("POST", `${endpoint}/api/cluster/nodes/heartbeat`, heartbeat, {
          "X-Node-Id": this.nodeId,
        }, 10000);
      } catch { /* heartbeat failure is non-fatal */ }
    }
  }

  async _reportTaskCompletion(taskResult) {
    for (const endpoint of this.cloudEndpoints) {
      try {
        await httpRequest("POST", `${endpoint}/api/cluster/tasks/complete`, {
          ...taskResult,
          node_id: this.nodeId,
        }, { "X-Node-Id": this.nodeId }, 10000);
      } catch { /* completion report failure is non-fatal */ }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// STANDALONE ENTRY POINT
// ═══════════════════════════════════════════════════════════════

if (require.main === module) {
  const agent = new HeadyNodeAgent({
    nodeId: process.env.HEADY_NODE_ID || `node-${os.hostname()}`,
    nodeName: process.env.HEADY_NODE_NAME || os.hostname(),
    port: parseInt(process.env.HEADY_NODE_PORT) || 7700,
    tunnelUrl: process.env.HEADY_TUNNEL_URL || null,
    heartbeatIntervalSec: parseInt(process.env.HEADY_HEARTBEAT_SEC) || 45,
  });

  agent.start().catch(err => {
    console.error("[HeadyNode] Failed to start:", err.message);
    process.exit(1);
  });

  process.on("SIGTERM", () => agent.stop());
  process.on("SIGINT", () => agent.stop());
}

module.exports = { HeadyNodeAgent, SystemProfiler, TaskExecutor };
