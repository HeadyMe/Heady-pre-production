// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: compute-cluster-manager.js                                ║
// ║  LAYER: cluster                                                  ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * HeadyComputeCluster — HA Compute Node Manager
 *
 * Manages physical compute nodes (mini-computers, laptops, servers)
 * that extend the Heady cloud with local processing power.
 *
 * Features:
 *   - Node registration with hardware capability profiling
 *   - Capability-aware task routing (CPU, RAM, GPU, Docker, storage)
 *   - Health monitoring with automatic failover
 *   - Load balancing across heterogeneous hardware
 *   - Cloudflare Tunnel integration for secure connectivity
 *   - Heartbeat protocol with configurable TTL
 *   - Task execution tracking and performance metrics
 *   - Automatic node promotion/demotion based on reliability
 *
 * ALL traffic through branded domains only:
 *   headysystems.com | headycloud.com | headyconnection.com
 */

const { EventEmitter } = require("events");
const https = require("https");
const http = require("http");
const { URL } = require("url");

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
// NODE CAPABILITY PROFILES
// ═══════════════════════════════════════════════════════════════

const NODE_TIERS = {
  POWERHOUSE: { min_cores: 12, min_ram_gb: 24, label: "Powerhouse", priority_boost: 0.3 },
  STANDARD:   { min_cores: 4,  min_ram_gb: 8,  label: "Standard",   priority_boost: 0.1 },
  LIGHT:      { min_cores: 2,  min_ram_gb: 4,  label: "Light",      priority_boost: 0.0 },
};

const TASK_CAPABILITY_MAP = {
  build:        { min_cores: 4,  min_ram_gb: 4,  prefers: ["docker", "node"], label: "Build" },
  test:         { min_cores: 2,  min_ram_gb: 2,  prefers: ["node", "docker"], label: "Test" },
  lint:         { min_cores: 1,  min_ram_gb: 1,  prefers: ["node"],           label: "Lint" },
  security:     { min_cores: 2,  min_ram_gb: 2,  prefers: ["node"],           label: "Security Audit" },
  deployment:   { min_cores: 2,  min_ram_gb: 4,  prefers: ["docker", "git"],  label: "Deployment" },
  "site-gen":   { min_cores: 2,  min_ram_gb: 2,  prefers: ["node"],           label: "Site Generation" },
  drift:        { min_cores: 1,  min_ram_gb: 1,  prefers: ["git"],            label: "Drift Detection" },
  verify:       { min_cores: 1,  min_ram_gb: 1,  prefers: [],                 label: "Verification" },
  checkpoint:   { min_cores: 1,  min_ram_gb: 1,  prefers: ["git"],            label: "Checkpoint" },
  ai_inference: { min_cores: 8,  min_ram_gb: 16, prefers: ["python", "gpu"],  label: "AI Inference" },
  data_process: { min_cores: 4,  min_ram_gb: 8,  prefers: ["python"],         label: "Data Processing" },
  batch_job:    { min_cores: 4,  min_ram_gb: 8,  prefers: ["docker"],         label: "Batch Job" },
  indexing:     { min_cores: 2,  min_ram_gb: 4,  prefers: ["node"],           label: "Indexing" },
  backup:       { min_cores: 1,  min_ram_gb: 2,  prefers: ["storage"],        label: "Backup" },
};

// ═══════════════════════════════════════════════════════════════
// COMPUTE CLUSTER MANAGER
// ═══════════════════════════════════════════════════════════════

class HeadyComputeCluster extends EventEmitter {
  constructor(options = {}) {
    super();
    this.cloudLayer = options.cloudLayer || process.env.CLOUD_LAYER || "headysystems";
    this.nodes = new Map();
    this.taskHistory = [];
    this.heartbeatTTLSec = options.heartbeatTTLSec || 120;
    this.healthCheckIntervalSec = options.healthCheckIntervalSec || 30;
    this.maxTaskHistory = options.maxTaskHistory || 5000;
    this.healthTimer = null;
    this.metrics = {
      total_tasks_routed: 0,
      total_tasks_completed: 0,
      total_tasks_failed: 0,
      total_failovers: 0,
      avg_task_duration_ms: 0,
      node_registrations: 0,
      node_removals: 0,
    };
  }

  // ─── Node Registration ───────────────────────────────────────

  async registerNode(nodeData) {
    const {
      node_id,
      name,
      tunnel_url,
      hardware,
      capabilities,
      tags = [],
      location = "local",
    } = nodeData;

    if (!node_id || !tunnel_url) {
      return { success: false, error: "node_id and tunnel_url are required" };
    }

    console.log(`[Cluster] Registering compute node: ${node_id} (${name || node_id})`);

    // Verify connectivity
    let healthOk = false;
    try {
      const healthCheck = await httpRequest("GET", `${tunnel_url}/api/node/health`, null, {
        "User-Agent": `HeadyCluster/${this.cloudLayer}`,
      }, 10000);
      healthOk = healthCheck.status === 200;
    } catch (err) {
      console.warn(`[Cluster] Health check failed for ${node_id}: ${err.message}`);
    }

    const tier = this._classifyTier(hardware);
    const nodeInfo = {
      node_id,
      name: name || node_id,
      tunnel_url,
      hardware: {
        cpu_model: hardware?.cpu_model || "unknown",
        cpu_cores: hardware?.cpu_cores || 1,
        cpu_threads: hardware?.cpu_threads || 1,
        ram_gb: hardware?.ram_gb || 1,
        gpu_model: hardware?.gpu_model || null,
        gpu_vram_gb: hardware?.gpu_vram_gb || 0,
        storage_gb: hardware?.storage_gb || 0,
        os: hardware?.os || "unknown",
        arch: hardware?.arch || "x86_64",
      },
      capabilities: capabilities || [],
      tags,
      location,
      tier,
      status: healthOk ? "active" : "pending",
      reliability_score: 100,
      registered_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString(),
      failure_count: 0,
      consecutive_failures: 0,
      tasks_completed: 0,
      tasks_failed: 0,
      current_tasks: new Set(),
      max_concurrent: this._computeMaxConcurrent(hardware),
      avg_task_duration_ms: 0,
      total_cpu_time_ms: 0,
    };

    this.nodes.set(node_id, nodeInfo);
    this.metrics.node_registrations++;

    this.emit("node:registered", {
      node_id,
      tier: tier.label,
      status: nodeInfo.status,
      hardware: nodeInfo.hardware,
    });

    console.log(`[Cluster] ${node_id} registered — ${tier.label} tier, ${healthOk ? "ACTIVE" : "PENDING"}`);
    console.log(`[Cluster]   CPU: ${hardware?.cpu_model || "?"} (${hardware?.cpu_cores || "?"}c/${hardware?.cpu_threads || "?"}t), RAM: ${hardware?.ram_gb || "?"}GB`);

    return {
      success: true,
      node_id,
      tier: tier.label,
      status: nodeInfo.status,
      max_concurrent: nodeInfo.max_concurrent,
      cloud_layer: this.cloudLayer,
    };
  }

  // ─── Heartbeat Protocol ──────────────────────────────────────

  handleHeartbeat(heartbeatData) {
    const { node_id, status, metrics, current_load, system_stats } = heartbeatData;
    const node = this.nodes.get(node_id);
    if (!node) return { accepted: false, error: "Unknown node" };

    node.last_heartbeat = new Date().toISOString();
    node.status = status || "active";
    node.consecutive_failures = 0;

    if (metrics) {
      node.avg_task_duration_ms = metrics.avg_task_duration_ms || node.avg_task_duration_ms;
      node.tasks_completed = metrics.tasks_completed || node.tasks_completed;
    }

    if (system_stats) {
      node.system_stats = {
        cpu_usage_pct: system_stats.cpu_usage_pct,
        ram_usage_pct: system_stats.ram_usage_pct,
        disk_usage_pct: system_stats.disk_usage_pct,
        load_avg: system_stats.load_avg,
        uptime_sec: system_stats.uptime_sec,
        timestamp: new Date().toISOString(),
      };
    }

    if (typeof current_load === "number") {
      node.current_load = current_load;
    }

    this.emit("node:heartbeat", { node_id, status: node.status });
    return { accepted: true, node_id, next_heartbeat_sec: this.heartbeatTTLSec / 2 };
  }

  // ─── Task Routing ────────────────────────────────────────────

  async routeTask(task) {
    const taskType = task.type || "general";
    const requirements = TASK_CAPABILITY_MAP[taskType] || { min_cores: 1, min_ram_gb: 1, prefers: [] };

    // Find eligible nodes
    const candidates = this._findEligibleNodes(requirements, task);

    if (candidates.length === 0) {
      return {
        routed: false,
        reason: `No eligible compute nodes for task type: ${taskType}`,
        requirements,
        available_nodes: this._getActiveNodeCount(),
        fallback: "cloud",
      };
    }

    // Score and rank candidates
    const ranked = this._rankNodes(candidates, requirements, task);
    const selectedNode = ranked[0];

    console.log(`[Cluster] Routing ${taskType} → ${selectedNode.node_id} (score: ${ranked[0]._routingScore.toFixed(2)})`);

    try {
      const response = await httpRequest(
        "POST",
        `${selectedNode.tunnel_url}/api/node/task`,
        {
          task_id: task.id || `task-${Date.now()}`,
          task_type: taskType,
          priority: task.priority || "P2",
          payload: task.payload || {},
          metadata: task.metadata || {},
          source_cloud: this.cloudLayer,
          timeout_ms: task.estimated_duration_ms || 30000,
        },
        {
          "X-Priority": task.priority || "P2",
          "X-Source-Cloud": this.cloudLayer,
          "X-Task-Type": taskType,
        },
        task.priority === "P0" ? 300000 : 60000
      );

      // Track active task
      selectedNode.current_tasks.add(task.id);
      this.metrics.total_tasks_routed++;

      this.taskHistory.push({
        task_id: task.id,
        task_type: taskType,
        node_id: selectedNode.node_id,
        priority: task.priority,
        routed_at: new Date().toISOString(),
        status: "dispatched",
      });
      this._trimHistory();

      this.emit("task:routed", {
        task_id: task.id,
        node_id: selectedNode.node_id,
        task_type: taskType,
      });

      return {
        routed: true,
        node_id: selectedNode.node_id,
        node_name: selectedNode.name,
        node_tier: selectedNode.tier.label,
        response: response.data,
      };
    } catch (error) {
      console.error(`[Cluster] Task dispatch to ${selectedNode.node_id} failed:`, error.message);
      selectedNode.consecutive_failures++;
      selectedNode.failure_count++;
      this._updateReliability(selectedNode);

      // Try failover to next candidate
      if (ranked.length > 1 && !task._cluster_retried) {
        console.log(`[Cluster] Failing over to ${ranked[1].node_id}...`);
        task._cluster_retried = true;
        this.metrics.total_failovers++;
        this.emit("task:failover", { task_id: task.id, from: selectedNode.node_id, to: ranked[1].node_id });
        return this.routeTask({ ...task, _preferred_node: ranked[1].node_id });
      }

      return {
        routed: false,
        reason: error.message,
        node_id: selectedNode.node_id,
        fallback: "cloud",
      };
    }
  }

  handleTaskComplete(taskResult) {
    const { task_id, node_id, status, duration_ms, result } = taskResult;
    const node = this.nodes.get(node_id);
    if (!node) return false;

    node.current_tasks.delete(task_id);

    if (status === "completed") {
      node.tasks_completed++;
      node.total_cpu_time_ms += duration_ms || 0;
      node.avg_task_duration_ms = node.total_cpu_time_ms / Math.max(1, node.tasks_completed);
      node.consecutive_failures = 0;
      this.metrics.total_tasks_completed++;
      this._updateReliability(node);
    } else {
      node.tasks_failed++;
      node.consecutive_failures++;
      this.metrics.total_tasks_failed++;
      this._updateReliability(node);
    }

    // Update history
    const histEntry = this.taskHistory.find(h => h.task_id === task_id);
    if (histEntry) {
      histEntry.status = status;
      histEntry.duration_ms = duration_ms;
      histEntry.completed_at = new Date().toISOString();
    }

    this.emit("task:completed", { task_id, node_id, status, duration_ms });
    return true;
  }

  // ─── Health Monitoring ───────────────────────────────────────

  startHealthChecks() {
    if (this.healthTimer) return;
    console.log(`[Cluster] Health monitoring started (${this.healthCheckIntervalSec}s interval)`);
    this.healthTimer = setInterval(() => this._runHealthChecks(), this.healthCheckIntervalSec * 1000);
  }

  stopHealthChecks() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
  }

  async _runHealthChecks() {
    const now = Date.now();
    for (const [nodeId, node] of this.nodes) {
      const lastHeartbeatAge = (now - new Date(node.last_heartbeat).getTime()) / 1000;

      // Heartbeat TTL expired
      if (lastHeartbeatAge > this.heartbeatTTLSec) {
        if (node.status === "active") {
          console.warn(`[Cluster] Node ${nodeId} heartbeat expired (${Math.round(lastHeartbeatAge)}s ago)`);
          node.status = "stale";
          this.emit("node:stale", { node_id: nodeId, last_heartbeat_sec: lastHeartbeatAge });
        }

        // If stale for 5x TTL, mark offline
        if (lastHeartbeatAge > this.heartbeatTTLSec * 5) {
          node.status = "offline";
          this.emit("node:offline", { node_id: nodeId });
        }
        continue;
      }

      // Active probe for nodes that seem healthy
      if (node.status === "active" || node.status === "stale") {
        try {
          await httpRequest("GET", `${node.tunnel_url}/api/node/health`, null, {}, 5000);
          if (node.status === "stale") {
            node.status = "active";
            console.log(`[Cluster] Node ${nodeId} recovered from stale state`);
            this.emit("node:recovered", { node_id: nodeId });
          }
        } catch {
          node.consecutive_failures++;
          if (node.consecutive_failures >= 3) {
            node.status = "unhealthy";
            this.emit("node:unhealthy", { node_id: nodeId, failures: node.consecutive_failures });
          }
        }
      }
    }
  }

  // ─── Node Selection Logic ───────────────────────────────────

  _findEligibleNodes(requirements, task) {
    const eligible = [];
    for (const [, node] of this.nodes) {
      if (node.status !== "active") continue;
      if (node.current_tasks.size >= node.max_concurrent) continue;
      if (node.hardware.cpu_cores < requirements.min_cores) continue;
      if (node.hardware.ram_gb < requirements.min_ram_gb) continue;

      // If task prefers GPU and node has none, skip only if GPU is required
      if (requirements.prefers.includes("gpu") && !node.hardware.gpu_model) continue;

      // Check preferred node
      if (task._preferred_node && task._preferred_node !== node.node_id) continue;

      eligible.push(node);
    }
    return eligible;
  }

  _rankNodes(candidates, requirements, task) {
    return candidates.map(node => {
      let score = 0;

      // Capability match (how well does this node match the task requirements)
      const capMatch = requirements.prefers.filter(cap =>
        node.capabilities.includes(cap)
      ).length / Math.max(1, requirements.prefers.length);
      score += capMatch * 30;

      // Hardware headroom (more powerful = better for heavy tasks)
      const coreRatio = Math.min(node.hardware.cpu_cores / Math.max(1, requirements.min_cores), 4);
      const ramRatio = Math.min(node.hardware.ram_gb / Math.max(1, requirements.min_ram_gb), 4);
      score += (coreRatio + ramRatio) * 5;

      // Tier bonus
      score += (node.tier.priority_boost || 0) * 20;

      // Load penalty (busier nodes score lower)
      const loadPct = node.current_tasks.size / Math.max(1, node.max_concurrent);
      score -= loadPct * 25;

      // Reliability bonus
      score += (node.reliability_score / 100) * 15;

      // Latency preference (faster average task completion scores higher)
      if (node.avg_task_duration_ms > 0 && node.tasks_completed > 5) {
        score += Math.max(0, 10 - node.avg_task_duration_ms / 10000);
      }

      // Recent system stats bonus (lower CPU/RAM usage = more available)
      if (node.system_stats) {
        const cpuFree = 100 - (node.system_stats.cpu_usage_pct || 50);
        const ramFree = 100 - (node.system_stats.ram_usage_pct || 50);
        score += (cpuFree + ramFree) / 20;
      }

      node._routingScore = score;
      return node;
    }).sort((a, b) => b._routingScore - a._routingScore);
  }

  // ─── Internal Helpers ────────────────────────────────────────

  _classifyTier(hardware) {
    if (!hardware) return { ...NODE_TIERS.LIGHT };
    const cores = hardware.cpu_cores || 1;
    const ram = hardware.ram_gb || 1;

    if (cores >= NODE_TIERS.POWERHOUSE.min_cores && ram >= NODE_TIERS.POWERHOUSE.min_ram_gb) {
      return { ...NODE_TIERS.POWERHOUSE };
    }
    if (cores >= NODE_TIERS.STANDARD.min_cores && ram >= NODE_TIERS.STANDARD.min_ram_gb) {
      return { ...NODE_TIERS.STANDARD };
    }
    return { ...NODE_TIERS.LIGHT };
  }

  _computeMaxConcurrent(hardware) {
    if (!hardware) return 2;
    const cores = hardware.cpu_cores || 1;
    const ram = hardware.ram_gb || 1;
    // Allow up to cores/2 concurrent tasks, capped by RAM (2GB per task assumed)
    return Math.max(1, Math.min(Math.floor(cores / 2), Math.floor(ram / 2), 16));
  }

  _updateReliability(node) {
    const total = node.tasks_completed + node.tasks_failed;
    if (total === 0) { node.reliability_score = 100; return; }
    const baseScore = (node.tasks_completed / total) * 100;
    // Penalize consecutive failures heavily
    const penalty = Math.min(node.consecutive_failures * 10, 50);
    node.reliability_score = Math.max(0, Math.round(baseScore - penalty));

    // Auto-demote unreliable nodes
    if (node.reliability_score < 30 && node.status === "active") {
      node.status = "degraded";
      this.emit("node:degraded", { node_id: node.node_id, reliability: node.reliability_score });
    }
  }

  _getActiveNodeCount() {
    let count = 0;
    for (const [, node] of this.nodes) {
      if (node.status === "active") count++;
    }
    return count;
  }

  _trimHistory() {
    if (this.taskHistory.length > this.maxTaskHistory) {
      this.taskHistory = this.taskHistory.slice(-Math.floor(this.maxTaskHistory / 2));
    }
  }

  // ─── Node Management ────────────────────────────────────────

  removeNode(nodeId) {
    if (this.nodes.has(nodeId)) {
      this.nodes.delete(nodeId);
      this.metrics.node_removals++;
      this.emit("node:removed", { node_id: nodeId });
      return true;
    }
    return false;
  }

  getNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return null;
    return this._serializeNode(node);
  }

  getAllNodes() {
    return Array.from(this.nodes.values()).map(n => this._serializeNode(n));
  }

  _serializeNode(node) {
    return {
      node_id: node.node_id,
      name: node.name,
      tier: node.tier.label,
      status: node.status,
      hardware: node.hardware,
      capabilities: node.capabilities,
      tags: node.tags,
      location: node.location,
      reliability_score: node.reliability_score,
      max_concurrent: node.max_concurrent,
      current_tasks: node.current_tasks.size,
      tasks_completed: node.tasks_completed,
      tasks_failed: node.tasks_failed,
      avg_task_duration_ms: Math.round(node.avg_task_duration_ms),
      system_stats: node.system_stats || null,
      registered_at: node.registered_at,
      last_heartbeat: node.last_heartbeat,
    };
  }

  // ─── Cluster State ──────────────────────────────────────────

  getClusterState() {
    const allNodes = Array.from(this.nodes.values());
    const activeNodes = allNodes.filter(n => n.status === "active");
    const totalCores = allNodes.reduce((sum, n) => sum + n.hardware.cpu_cores, 0);
    const totalRam = allNodes.reduce((sum, n) => sum + n.hardware.ram_gb, 0);
    const totalGpuVram = allNodes.reduce((sum, n) => sum + (n.hardware.gpu_vram_gb || 0), 0);
    const totalSlots = allNodes.reduce((sum, n) => sum + n.max_concurrent, 0);
    const usedSlots = allNodes.reduce((sum, n) => sum + n.current_tasks.size, 0);
    const avgReliability = allNodes.length > 0
      ? allNodes.reduce((sum, n) => sum + n.reliability_score, 0) / allNodes.length
      : 0;

    return {
      cluster_name: "HeadyComputeCluster",
      cloud_layer: this.cloudLayer,
      protocol_version: "1.0",
      total_nodes: allNodes.length,
      active_nodes: activeNodes.length,
      offline_nodes: allNodes.filter(n => n.status === "offline").length,
      degraded_nodes: allNodes.filter(n => n.status === "degraded" || n.status === "unhealthy").length,
      stale_nodes: allNodes.filter(n => n.status === "stale").length,
      compute_capacity: {
        total_cpu_cores: totalCores,
        total_ram_gb: totalRam,
        total_gpu_vram_gb: totalGpuVram,
        total_task_slots: totalSlots,
        used_task_slots: usedSlots,
        available_task_slots: totalSlots - usedSlots,
        utilization_pct: totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0,
      },
      avg_reliability: Math.round(avgReliability),
      nodes_by_tier: {
        powerhouse: allNodes.filter(n => n.tier.label === "Powerhouse").length,
        standard: allNodes.filter(n => n.tier.label === "Standard").length,
        light: allNodes.filter(n => n.tier.label === "Light").length,
      },
      metrics: this.metrics,
      health_monitoring: !!this.healthTimer,
      heartbeat_ttl_sec: this.heartbeatTTLSec,
      task_routing_map: Object.fromEntries(
        Object.entries(TASK_CAPABILITY_MAP).map(([k, v]) => [k, v.label])
      ),
      nodes: allNodes.map(n => this._serializeNode(n)),
      timestamp: new Date().toISOString(),
    };
  }

  getTaskHistory(limit = 50) {
    return this.taskHistory.slice(-limit);
  }

  // ─── Capability Query ───────────────────────────────────────

  canHandleTask(taskType) {
    const requirements = TASK_CAPABILITY_MAP[taskType] || { min_cores: 1, min_ram_gb: 1, prefers: [] };
    const candidates = this._findEligibleNodes(requirements, {});
    return {
      can_handle: candidates.length > 0,
      eligible_nodes: candidates.length,
      requirements,
      best_node: candidates.length > 0
        ? this._rankNodes(candidates, requirements, {})[0]?.node_id
        : null,
    };
  }
}

module.exports = { HeadyComputeCluster, TASK_CAPABILITY_MAP, NODE_TIERS };
