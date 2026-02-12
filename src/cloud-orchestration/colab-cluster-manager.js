// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: colab-cluster-manager.js                                  ║
// ║  LAYER: cloud-orchestration                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Heady Colab Pro+ Cluster Manager
 * Manages GPU compute nodes running on Google Colab Pro+
 * Registers nodes, routes tasks, handles heartbeats, load balancing
 *
 * ALL traffic through branded domains only:
 *   headysystems.com | headycloud.com | headyconnection.com
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");
const path = require("path");
const fs = require("fs");

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

const CLOUD_DOMAINS = {
  headysystems: "https://headysystems.com",
  headyme: "https://headycloud.com",
  headyconnection: "https://headyconnection.com",
};

const TASK_NODE_MAP = {
  generate_embeddings: "atlas",
  semantic_search: "atlas",
  documentation: "atlas",
  summarize: "atlas",
  generate_text: "pythia",
  reasoning_chain: "pythia",
  huggingface: "pythia",
  predict: "pythia",
  infer: "pythia",
  optimization: "jules",
  code_quality: "jules",
  refactor: "jules",
  build_project: "builder",
  newproject: "builder",
  hydrate: "builder",
};

const GPU_TASK_TYPES = new Set(Object.keys(TASK_NODE_MAP));

class HeadyColabClusterManager {
  constructor(cloudLayer) {
    this.cloudLayer = cloudLayer || process.env.CLOUD_LAYER || "headysystems";
    this.registeredNodes = new Map();
    this.nodeMetrics = new Map();
  }

  async registerNode(nodeData) {
    const { node_id, node_role, url, capabilities, triggers, primary_tool } = nodeData;
    console.log(`[${this.cloudLayer}] Registering Colab node: ${node_id} (${node_role})`);

    try {
      const healthCheck = await httpRequest("GET", `${url}/health`, null, {
        "User-Agent": `HeadyManager/${this.cloudLayer}`,
      }, 10000);

      const nodeInfo = {
        ...nodeData,
        status: "active",
        registered_at: new Date().toISOString(),
        last_heartbeat: new Date().toISOString(),
        cloud_source: this.cloudLayer,
        gpu_type: capabilities?.gpu_type || "unknown",
        gpu_memory_gb: capabilities?.gpu_memory_gb || 0,
        health_check_passed: true,
        failure_count: 0,
        metrics: { total_tasks: 0, current_load: 0 },
      };

      this.registeredNodes.set(node_id, nodeInfo);

      console.log(`[${this.cloudLayer}] ${node_id} registered — GPU: ${capabilities?.gpu_type}`);

      return {
        success: true,
        node_id,
        cloud: this.cloudLayer,
        branded_domain: CLOUD_DOMAINS[this.cloudLayer],
        message: `Registered ${node_role} with ${this.cloudLayer}`,
      };
    } catch (error) {
      console.error(`[${this.cloudLayer}] Failed to register ${node_id}:`, error.message);
      return {
        success: false,
        error: error.message,
        hint: "Check node URL and HEADY_API_KEY",
      };
    }
  }

  handleHeartbeat(heartbeatData) {
    const { node_id, status, metrics } = heartbeatData;

    if (this.registeredNodes.has(node_id)) {
      const node = this.registeredNodes.get(node_id);
      node.last_heartbeat = new Date().toISOString();
      node.status = status;
      if (metrics) {
        node.metrics = { ...node.metrics, ...metrics };
      }
      // Reset failure count on successful heartbeat
      if (status === "active") {
        node.failure_count = 0;
      }
      return true;
    }
    return false;
  }

  isNodeHealthy(node) {
    if (!node || !node.last_heartbeat) return false;
    const age = (Date.now() - new Date(node.last_heartbeat).getTime()) / 1000;
    return age < 120 && node.status === "active" && node.failure_count < 3;
  }

  getHealthyNodes(requiredNodeId) {
    const nodes = [];
    for (const [id, node] of this.registeredNodes) {
      if (node.node_id === requiredNodeId && this.isNodeHealthy(node)) {
        nodes.push(node);
      }
    }
    // Sort by load (lowest first)
    return nodes.sort((a, b) => (a.metrics?.current_load || 0) - (b.metrics?.current_load || 0));
  }

  isGpuTask(taskType) {
    return GPU_TASK_TYPES.has(taskType);
  }

  mapTaskToNode(taskType) {
    return TASK_NODE_MAP[taskType] || "pythia";
  }

  async routeTask(task) {
    const requiredNodeId = this.mapTaskToNode(task.type);
    const availableNodes = this.getHealthyNodes(requiredNodeId);

    if (availableNodes.length === 0) {
      return {
        routed: false,
        reason: `No healthy GPU nodes for ${requiredNodeId} (task: ${task.type})`,
        fallback: "local",
      };
    }

    const selectedNode = availableNodes[0]; // Lowest load

    console.log(
      `[${this.cloudLayer}] Routing ${task.type} → ${selectedNode.node_id} (${selectedNode.gpu_type})`
    );

    try {
      const response = await httpRequest(
        "POST",
        `${selectedNode.url}/task`,
        {
          task_id: task.id || `task-${Date.now()}`,
          task_type: task.type,
          payload: task.payload,
          priority: task.priority || "P1",
          source_cloud: this.cloudLayer,
        },
        {
          "X-Priority": task.priority || "P1",
          "X-Source-Cloud": this.cloudLayer,
          Authorization: `Bearer ${process.env.HEADY_API_KEY}`,
        },
        task.priority === "P0" ? 300000 : 60000
      );

      // Update metrics
      selectedNode.metrics.total_tasks = (selectedNode.metrics.total_tasks || 0) + 1;
      selectedNode.metrics.last_task_duration_ms = response.data?.execution_time_ms;

      return {
        routed: true,
        node_id: selectedNode.node_id,
        gpu_type: selectedNode.gpu_type,
        ...response.data,
      };
    } catch (error) {
      console.error(
        `[${this.cloudLayer}] Task failed on ${selectedNode.node_id}:`,
        error.message
      );
      selectedNode.failure_count = (selectedNode.failure_count || 0) + 1;

      if (selectedNode.failure_count >= 3) {
        selectedNode.status = "unhealthy";
        console.warn(`[${this.cloudLayer}] Node ${selectedNode.node_id} marked unhealthy`);
      }

      // Try backup node
      if (availableNodes.length > 1 && !task._retried) {
        console.log(`[${this.cloudLayer}] Retrying on backup node...`);
        task._retried = true;
        return this.routeTask(task);
      }

      return {
        routed: false,
        reason: error.message,
        fallback: "local",
        node_id: selectedNode.node_id,
      };
    }
  }

  getNodeById(nodeId) {
    return this.registeredNodes.get(nodeId) || null;
  }

  getAllNodes() {
    return Array.from(this.registeredNodes.values());
  }

  getClusterStatus() {
    const allNodes = this.getAllNodes();
    const healthyNodes = allNodes.filter((n) => this.isNodeHealthy(n));

    return {
      cloud_layer: this.cloudLayer,
      branded_domain: CLOUD_DOMAINS[this.cloudLayer],
      total_nodes: allNodes.length,
      active_nodes: healthyNodes.length,
      unhealthy_nodes: allNodes.length - healthyNodes.length,
      total_gpu_memory_gb: allNodes.reduce((sum, n) => sum + (n.gpu_memory_gb || 0), 0),
      gpu_routing_enabled: process.env.ENABLE_COLAB_ROUTING === "true",
      nodes_by_role: allNodes.reduce((acc, n) => {
        acc[n.node_id] = {
          status: n.status,
          gpu_type: n.gpu_type,
          gpu_memory_gb: n.gpu_memory_gb,
          current_load: n.metrics?.current_load || 0,
          total_tasks: n.metrics?.total_tasks || 0,
          last_heartbeat: n.last_heartbeat,
          healthy: this.isNodeHealthy(n),
        };
        return acc;
      }, {}),
      average_load:
        healthyNodes.length > 0
          ? healthyNodes.reduce((sum, n) => sum + (n.metrics?.current_load || 0), 0) /
          healthyNodes.length
          : 0,
      task_routing_map: TASK_NODE_MAP,
    };
  }

  removeNode(nodeId) {
    if (this.registeredNodes.has(nodeId)) {
      this.registeredNodes.delete(nodeId);
      console.log(`[${this.cloudLayer}] Removed node: ${nodeId}`);
      return true;
    }
    return false;
  }
}

module.exports = HeadyColabClusterManager;
