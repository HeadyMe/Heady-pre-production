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
// ║  FILE: heady-manager.js                                           ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                ║
 * ║     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                ║
 * ║     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 ║
 * ║     ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  ║
 * ║     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   ║
 * ║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   ║
 * ║                                                                               ║
 * ║     ∞ SACRED GEOMETRY ARCHITECTURE ∞                                          ║
 * ║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                         ║
 * ║     HEADY MANAGER - Node.js MCP Server & Admin API                            ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const helmet = require("helmet");

const { HEADY_MAID_CONFIG } = require(path.join(__dirname, "src", "heady_maid"));
const { pipeline: hcPipeline, registerTaskHandler, RunStatus } = require(path.join(__dirname, "src", "hc_pipeline"));
const { claudeExecute, claudeAnalyzeCode, claudeSecurityAudit } = require(path.join(__dirname, "src", "hc_claude_agent"));
const { registerAllHandlers, initializeSubsystems, getSubsystems } = require(path.join(__dirname, "src", "agents", "pipeline-handlers"));
const { simulatePipelineReliability, simulateDeploymentRisk, simulateReadinessConfidence, simulateNodePerformance, simulateFullSystem, mcGlobal } = require(path.join(__dirname, "src", "hc_monte_carlo"));
const HeadyColabClusterManager = require(path.join(__dirname, "src", "cloud-orchestration", "colab-cluster-manager"));

// ─── Boot HCFullPipeline with all subsystems ─────────────────────────────
// 1. Load pipeline configs (YAML → circuit breakers, stage DAG)
hcPipeline.load();

// 2. Initialize all subsystems with loaded configs
//    (Supervisor, Brain, CheckpointAnalyzer, ReadinessEvaluator, HealthRunner)
initializeSubsystems(hcPipeline.configs);

// 3. Register subsystem-backed task handlers with the pipeline engine
//    These handlers use real Supervisor routing, Health checks, Readiness scoring, etc.
registerAllHandlers(registerTaskHandler);

// 4. Get shared subsystem instances for API exposure
const { supervisor: hcSupervisor, brain: hcBrain, checkpointAnalyzer: hcCheckpoint, readinessEvaluator: hcReadiness, healthRunner: hcHealth } = getSubsystems();

// 5. Wire pipeline events → subsystems + Monte Carlo (real-time feedback loop)
hcPipeline.on("run:start", ({ runId }) => {
  mcGlobal.onPipelineStart(runId);
});

hcPipeline.on("checkpoint", async ({ stageId }) => {
  try {
    const record = await hcCheckpoint.analyze({
      runId: hcPipeline.getState()?.runId || "unknown",
      stage: stageId,
      runState: hcPipeline.getState() || {},
      healthSnapshot: hcHealth.getSnapshot(),
    });
    hcBrain.onCheckpoint(record);
    mcGlobal.onCheckpoint(stageId, record);
  } catch (err) {
    console.error("[pipeline→checkpoint] analysis error:", err.message);
  }
});

hcPipeline.on("stage:end", ({ stageId, status }) => {
  const state = hcPipeline.getState();
  if (state) {
    const tuneData = {
      errorRate: state.metrics.errorRate,
      avgLatencyMs: state.metrics.elapsedMs / Math.max(1, state.metrics.totalTasks),
      queueUtilization: state.metrics.completedTasks / Math.max(1, state.metrics.totalTasks),
    };
    hcBrain.autoTune(tuneData);
    mcGlobal.onStageEnd(stageId, status, state.metrics);
    mcGlobal.onBrainTune(tuneData);
  }
});

hcPipeline.on("run:end", async ({ runId, status, metrics }) => {
  try {
    const evaluation = await hcReadiness.evaluate();
    hcBrain.updateHealth("pipeline", evaluation.score >= 70 ? "healthy" : "degraded", { runId, status, ...metrics, readiness: evaluation });
  } catch (_) { /* readiness eval non-fatal */ }
  mcGlobal.onPipelineEnd(runId, status, metrics);
});

// 8. Start health check cron (feeds results into Brain + Monte Carlo automatically)
try { hcHealth.startCron(); } catch (_) { /* node-cron optional */ }

// ─── Colab Pro+ GPU Cluster Manager ──────────────────────────────────
const colabManager = new HeadyColabClusterManager(process.env.CLOUD_LAYER || "headysystems");

const PORT = Number(process.env.PORT || 3300);
const HEADY_ADMIN_SCRIPT = process.env.HEADY_ADMIN_SCRIPT || path.join(__dirname, "src", "heady_project", "heady_conductor.py");
const HEADY_PYTHON_BIN = process.env.HEADY_PYTHON_BIN || "python";

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Performance middleware
app.use(compression());
app.use(express.json({ limit: "5mb" }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { error: "Too many requests from this IP" },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Enhanced caching middleware
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  // Evict stale entries first, then cap at 100
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.timestamp >= CACHE_TTL) cache.delete(k);
    }
    // If still over limit, drop oldest inserted
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
  }
}

function readJsonFileSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}


// Serve Frontend Build (React)
const frontendBuildPath = path.join(__dirname, "frontend", "build");
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json(mcGlobal.enrich({
    ok: true,
    service: "heady-manager",
    ts: new Date().toISOString(),
    version: "2.0.0",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: {
      size: cache.size,
      maxSize: 100
    }
  }));
});

app.get("/api/registry", (req, res) => {
  const cacheKey = 'registry';
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  const registryPath = path.join(__dirname, "heady-registry.json");
  const registry = readJsonFileSafe(registryPath);

  if (!registry) {
    return res.status(404).json({ error: "Registry not found or invalid" });
  }

  setCachedData(cacheKey, registry);
  res.json(registry);
});

app.get("/api/maid/config", (req, res) => {
  res.json(HEADY_MAID_CONFIG);
});

app.get("/api/maid/inventory", (req, res) => {
  const cacheKey = 'inventory';
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  const inventoryPath = path.join(__dirname, ".heady-memory", "inventory", "inventory.json");
  const inventory = readJsonFileSafe(inventoryPath);

  if (!inventory) {
    return res.status(404).json({ error: "Inventory not found or invalid" });
  }

  setCachedData(cacheKey, inventory);
  res.json(inventory);
});

// HeadyConductor API Endpoints
app.post("/api/conductor/orchestrate", async (req, res) => {
  try {
    const { request } = req.body;
    if (!request) {
      return res.status(400).json({ error: "Request parameter required" });
    }

    const result = await runPythonConductor(["--request", request]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/conductor/summary", async (req, res) => {
  try {
    const result = await runPythonConductor(["--summary"]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/conductor/health", async (req, res) => {
  try {
    const result = await runPythonConductor(["--health"]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/conductor/query", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' required" });
    }

    const result = await runPythonConductor(["--query", q]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/conductor/workflow", async (req, res) => {
  try {
    const { workflow } = req.body;
    if (!workflow) {
      return res.status(400).json({ error: "Workflow parameter required" });
    }

    const result = await runPythonConductor(["--workflow", workflow]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/conductor/node", async (req, res) => {
  try {
    const { node } = req.body;
    if (!node) {
      return res.status(400).json({ error: "Node parameter required" });
    }

    const result = await runPythonConductor(["--node", node]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced Python conductor execution with timeout and error handling
function runPythonConductor(args, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const conductorPath = path.join(__dirname, "HeadyAcademy", "HeadyConductor.py");
    const pythonBin = process.env.HEADY_PYTHON_BIN || "python";

    // Verify conductor script exists
    if (!fs.existsSync(conductorPath)) {
      return reject(new Error(`HeadyConductor script not found at ${conductorPath}`));
    }

    const proc = spawn(pythonBin, [conductorPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error(`HeadyConductor execution timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        reject(new Error(`HeadyConductor exited with code ${code}: ${stderr}`));
      } else {
        try {
          // Extract JSON from output (last JSON object)
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]));
          } else {
            resolve({ output: stdout, stderr });
          }
        } catch (e) {
          resolve({ output: stdout, stderr, parseError: e.message });
        }
      }
    });

    proc.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start HeadyConductor: ${error.message}`));
    });
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('HeadyManager Error:', error);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Layer Management
const LAYERS_CONFIG_PATH = path.join(__dirname, "scripts", "heady-layers.json");
const LAYER_STATE_PATH = path.join(__dirname, "scripts", ".heady-active-layer");

function getActiveLayer() {
  try {
    if (fs.existsSync(LAYER_STATE_PATH)) {
      return fs.readFileSync(LAYER_STATE_PATH, "utf8").trim();
    }
    const config = readJsonFileSafe(LAYERS_CONFIG_PATH);
    return config ? config.default_layer : "local";
  } catch {
    return "local";
  }
}

function getLayerConfig() {
  return readJsonFileSafe(LAYERS_CONFIG_PATH);
}

app.get("/api/layer", (req, res) => {
  const activeId = getActiveLayer();
  const config = getLayerConfig();
  const layer = config && config.layers ? config.layers[activeId] : null;

  res.json({
    active_layer: activeId,
    name: layer ? layer.name : "Unknown",
    endpoint: layer ? layer.endpoint : "http://localhost:3300",
    icon: layer ? layer.icon : "?",
    color: layer ? layer.color : "White",
    description: layer ? layer.description : "",
    git_remote: layer ? layer.git_remote : null,
    all_layers: config ? Object.keys(config.layers) : [],
    timestamp: new Date().toISOString()
  });
});

app.post("/api/layer/switch", (req, res) => {
  const { layer } = req.body;
  const config = getLayerConfig();

  if (!config || !config.layers || !config.layers[layer]) {
    return res.status(400).json({
      error: `Unknown layer '${layer}'`,
      available: config ? Object.keys(config.layers) : []
    });
  }

  try {
    fs.writeFileSync(LAYER_STATE_PATH, layer, "utf8");
    const layerInfo = config.layers[layer];
    res.json({
      success: true,
      active_layer: layer,
      name: layerInfo.name,
      endpoint: layerInfo.endpoint,
      message: `Switched to ${layerInfo.name}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System pulse endpoint
app.get("/api/pulse", (req, res) => {
  const activeLayer = getActiveLayer();
  const config = getLayerConfig();
  const layer = config && config.layers ? config.layers[activeLayer] : null;

  res.json({
    ok: true,
    service: "heady-manager",
    ts: new Date().toISOString(),
    version: "2.0.0",
    status: "active",
    active_layer: activeLayer,
    layer_name: layer ? layer.name : "Unknown",
    endpoints: ["/api/health", "/api/registry", "/api/maid/*", "/api/conductor/*", "/api/layer", "/api/monte-carlo/*"],
    monte_carlo: { available: true, simulations: ["pipeline", "deployment", "readiness", "nodes", "full"] }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// PRODUCTION NODE MANAGEMENT & SYSTEM STATE
// ═══════════════════════════════════════════════════════════════════════

const REGISTRY_PATH = path.join(__dirname, ".heady", "registry.json");

function loadRegistry() {
  return readJsonFileSafe(REGISTRY_PATH) || { nodes: {}, tools: {}, workflows: {}, services: {}, skills: {} };
}

function saveRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), "utf8");
}

// ─── Monte Carlo Global: Bind + Auto-Run ─────────────────────────────
// Bind live system references so MC pulls real-time data from all subsystems.
// Start the always-on background cycle (every 60s) + immediate boot sim.
mcGlobal.bind({
  pipeline: hcPipeline,
  brain: hcBrain,
  health: hcHealth,
  readiness: hcReadiness,
  registry: loadRegistry,
});
mcGlobal.startAutoRun();

// Get all nodes and their status
app.get("/api/nodes", (req, res) => {
  const reg = loadRegistry();
  const nodes = Object.entries(reg.nodes || {}).map(([key, node]) => ({
    id: key,
    ...node
  }));
  res.json({
    total: nodes.length,
    active: nodes.filter(n => n.status === "active").length,
    nodes,
    timestamp: new Date().toISOString()
  });
});

// Get single node status
app.get("/api/nodes/:nodeId", (req, res) => {
  const reg = loadRegistry();
  const node = reg.nodes[req.params.nodeId.toUpperCase()];
  if (!node) return res.status(404).json({ error: `Node '${req.params.nodeId}' not found` });
  res.json({ id: req.params.nodeId.toUpperCase(), ...node });
});

// Activate a single node
app.post("/api/nodes/:nodeId/activate", (req, res) => {
  const reg = loadRegistry();
  const nodeId = req.params.nodeId.toUpperCase();
  if (!reg.nodes[nodeId]) return res.status(404).json({ error: `Node '${nodeId}' not found` });

  reg.nodes[nodeId].status = "active";
  reg.nodes[nodeId].last_invoked = new Date().toISOString();
  saveRegistry(reg);

  res.json({ success: true, node: nodeId, status: "active", activated_at: reg.nodes[nodeId].last_invoked });
});

// Activate ALL nodes (production mode)
app.post("/api/nodes/activate-all", (req, res) => {
  const reg = loadRegistry();
  const ts = new Date().toISOString();
  const activated = [];

  for (const [name, node] of Object.entries(reg.nodes)) {
    node.status = "active";
    node.last_invoked = ts;
    activated.push(name);
  }

  reg.metadata = reg.metadata || {};
  reg.metadata.last_updated = ts;
  reg.metadata.environment = "production";
  reg.metadata.all_nodes_active = true;

  saveRegistry(reg);

  res.json({
    success: true,
    activated_count: activated.length,
    nodes: activated,
    environment: "production",
    timestamp: ts
  });
});

// Deactivate a single node
app.post("/api/nodes/:nodeId/deactivate", (req, res) => {
  const reg = loadRegistry();
  const nodeId = req.params.nodeId.toUpperCase();
  if (!reg.nodes[nodeId]) return res.status(404).json({ error: `Node '${nodeId}' not found` });

  reg.nodes[nodeId].status = "available";
  saveRegistry(reg);

  res.json({ success: true, node: nodeId, status: "available" });
});

// Full system status (production dashboard)
app.get("/api/system/status", (req, res) => {
  const reg = loadRegistry();
  const activeLayer = getActiveLayer();
  const config = getLayerConfig();
  const layer = config && config.layers ? config.layers[activeLayer] : null;

  const nodeList = Object.entries(reg.nodes || {});
  const toolList = Object.entries(reg.tools || {});
  const workflowList = Object.entries(reg.workflows || {});
  const serviceList = Object.entries(reg.services || {});

  const activeNodes = nodeList.filter(([, n]) => n.status === "active").length;
  const activeTools = toolList.filter(([, t]) => t.status === "active").length;
  const activeWorkflows = workflowList.filter(([, w]) => w.status === "active").length;
  const healthyServices = serviceList.filter(([, s]) => s.status === "healthy" || s.status === "active").length;

  const isProduction = (reg.metadata || {}).environment === "production";
  const allNodesActive = activeNodes === nodeList.length;

  res.json(mcGlobal.enrich({
    system: "Heady Systems",
    version: (reg.metadata || {}).version || "2.0.0",
    environment: isProduction ? "production" : "development",
    production_ready: isProduction && allNodesActive,
    active_layer: {
      id: activeLayer,
      name: layer ? layer.name : "Unknown",
      endpoint: layer ? layer.endpoint : "http://localhost:3300"
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    capabilities: {
      nodes: { total: nodeList.length, active: activeNodes, list: nodeList.map(([k, v]) => ({ id: k, role: v.role, status: v.status })) },
      tools: { total: toolList.length, active: activeTools },
      workflows: { total: workflowList.length, active: activeWorkflows },
      services: { total: serviceList.length, healthy: healthyServices }
    },
    sacred_geometry: {
      architecture: "active",
      organic_systems: allNodesActive,
      breathing_interfaces: isProduction
    },
    timestamp: new Date().toISOString()
  }));
});

// Production activation endpoint - activates EVERYTHING
app.post("/api/system/production", (req, res) => {
  const reg = loadRegistry();
  const ts = new Date().toISOString();
  const report = { nodes: [], tools: [], workflows: [], services: [] };

  // Activate all nodes
  for (const [name, node] of Object.entries(reg.nodes || {})) {
    node.status = "active";
    node.last_invoked = ts;
    report.nodes.push(name);
  }

  // Activate all tools
  for (const [name, tool] of Object.entries(reg.tools || {})) {
    tool.status = "active";
    report.tools.push(name);
  }

  // Activate all workflows
  for (const [name, wf] of Object.entries(reg.workflows || {})) {
    wf.status = "active";
    report.workflows.push(name);
  }

  // Set services to active
  for (const [name, svc] of Object.entries(reg.services || {})) {
    if (name === "heady-manager") svc.status = "healthy";
    else svc.status = "active";
    report.services.push(name);
  }

  // Activate all skills
  for (const [name, sk] of Object.entries(reg.skills || {})) {
    sk.status = "active";
  }

  // Update metadata
  reg.metadata = {
    ...(reg.metadata || {}),
    last_updated: ts,
    version: "2.0.0-production",
    environment: "production",
    all_nodes_active: true,
    production_activated_at: ts
  };

  saveRegistry(reg);

  // Switch layer state to production
  try {
    fs.writeFileSync(LAYER_STATE_PATH, "cloud-sys", "utf8");
  } catch (e) {
    console.error("Could not set production layer:", e.message);
  }

  res.json({
    success: true,
    environment: "production",
    activated: {
      nodes: report.nodes.length,
      tools: report.tools.length,
      workflows: report.workflows.length,
      services: report.services.length
    },
    node_manifest: report.nodes.map(n => {
      const node = reg.nodes[n];
      return { id: n, role: node.role, tool: node.primary_tool, status: "active" };
    }),
    sacred_geometry: "FULLY_ACTIVATED",
    timestamp: ts
  });
});

// ═══════════════════════════════════════════════════════════════════════
// HCFULLPIPELINE API
// ═══════════════════════════════════════════════════════════════════════

// Pipeline config summary & DAG
app.get("/api/pipeline/config", (req, res) => {
  try {
    const summary = hcPipeline.getConfigSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/pipeline/dag", (req, res) => {
  try {
    const dag = hcPipeline.getStageDag();
    res.json({ stages: dag });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger a pipeline run
app.post("/api/pipeline/run", async (req, res) => {
  try {
    if (hcPipeline.getState() && hcPipeline.getState().status === RunStatus.RUNNING) {
      return res.status(409).json({ error: "Pipeline already running", runId: hcPipeline.getState().runId });
    }
    // Reload configs (picks up YAML changes) and re-init subsystems
    hcPipeline.load();
    initializeSubsystems(hcPipeline.configs);
    registerAllHandlers(registerTaskHandler);
    const runPromise = hcPipeline.run();
    // Return immediately with runId
    res.json({
      accepted: true,
      runId: hcPipeline.getState().runId,
      status: hcPipeline.getState().status,
      message: "Pipeline run started",
      timestamp: new Date().toISOString(),
    });
    // Let it finish in background
    runPromise.catch((err) => {
      console.error("Pipeline run error:", err.message);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Current run state
app.get("/api/pipeline/state", (req, res) => {
  const state = hcPipeline.getState();
  if (!state) {
    return res.json(mcGlobal.enrich({ status: "idle", message: "No pipeline run in progress or completed" }));
  }
  res.json(mcGlobal.enrich({
    runId: state.runId,
    status: state.status,
    currentStageId: state.currentStageId,
    startedAt: state.startedAt,
    completedAt: state.completedAt,
    metrics: state.metrics,
    checkpoints: state.checkpoints,
    errors: state.errors.length,
    stages: Object.fromEntries(
      Object.entries(state.stages).map(([id, s]) => [id, { status: s.status, tasks: s.tasks || {} }])
    ),
  }));
});

// Full run detail (verbose)
app.get("/api/pipeline/state/full", (req, res) => {
  const state = hcPipeline.getState();
  if (!state) {
    return res.json({ status: "idle" });
  }
  res.json(state);
});

// Run history
app.get("/api/pipeline/history", (req, res) => {
  res.json({ runs: hcPipeline.getHistory() });
});

// Circuit breaker status
app.get("/api/pipeline/circuit-breakers", (req, res) => {
  res.json(hcPipeline.getCircuitBreakers());
});

// Claude Code ad-hoc execution
app.post("/api/pipeline/claude", async (req, res) => {
  const { prompt, model, allowedTools, maxBudgetUsd, timeoutMs } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }
  try {
    const result = await claudeExecute(prompt, {
      model: model || null,
      allowedTools: allowedTools || ["Read", "Grep", "Glob"],
      maxBudgetUsd: maxBudgetUsd || 0.25,
      timeoutMs: timeoutMs || 120000,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claude Code analyze endpoint
app.post("/api/pipeline/claude/analyze", async (req, res) => {
  const { paths } = req.body;
  try {
    const result = await claudeAnalyzeCode(paths || ["src/", "heady-manager.js"]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claude Code security audit endpoint
app.post("/api/pipeline/claude/security", async (req, res) => {
  try {
    const result = await claudeSecurityAudit();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pipeline log (last N entries)
app.get("/api/pipeline/log", (req, res) => {
  const state = hcPipeline.getState();
  if (!state) {
    return res.json({ entries: [] });
  }
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  res.json({ entries: state.log.slice(-limit) });
});

// ═══════════════════════════════════════════════════════════════════════
// HCFULLPIPELINE SUBSYSTEM APIs
// ═══════════════════════════════════════════════════════════════════════

// Supervisor status and routing
app.get("/api/supervisor/status", (req, res) => {
  res.json(hcSupervisor.getStatus());
});

app.post("/api/supervisor/route", async (req, res) => {
  const { type, taskType, skills, description, targets } = req.body;
  if (!type && !taskType) {
    return res.status(400).json({ error: "type or taskType required" });
  }
  try {
    const response = await hcSupervisor.route({
      id: `api-${Date.now()}`,
      type: type || "general",
      taskType: taskType || type,
      skills: skills || [],
      description: description || "",
      targets: targets || [],
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System Brain
app.get("/api/brain/status", (req, res) => {
  res.json(hcBrain.getStatus());
});

app.post("/api/brain/tune", (req, res) => {
  const { errorRate, avgLatencyMs, queueUtilization } = req.body || {};
  const result = hcBrain.autoTune({ errorRate, avgLatencyMs, queueUtilization });
  res.json(result);
});

app.post("/api/brain/governance-check", (req, res) => {
  const { action, actor, domain } = req.body;
  if (!action || !actor || !domain) {
    return res.status(400).json({ error: "action, actor, and domain required" });
  }
  res.json(hcBrain.checkGovernance(action, actor, domain));
});

app.post("/api/brain/evaluate-pattern", (req, res) => {
  const { patternId } = req.body;
  if (!patternId) {
    return res.status(400).json({ error: "patternId required" });
  }
  res.json(hcBrain.evaluatePatternAdoption(patternId));
});

// Readiness Evaluator
app.get("/api/readiness/evaluate", async (req, res) => {
  try {
    const evaluation = await hcReadiness.evaluate();
    mcGlobal.onHealthCheck(hcHealth.getSnapshot());
    res.json(mcGlobal.enrich(evaluation));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/readiness/history", (req, res) => {
  res.json({ evaluations: hcReadiness.getHistory().slice(-20) });
});

// Health Checks
app.get("/api/health-checks/snapshot", (req, res) => {
  res.json(mcGlobal.enrich(hcHealth.getSnapshot()));
});

app.post("/api/health-checks/run", async (req, res) => {
  try {
    const results = await hcHealth.runAll();
    mcGlobal.onHealthCheck(hcHealth.getSnapshot());
    res.json(mcGlobal.enrich({ timestamp: new Date().toISOString(), results }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health-checks/history", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  res.json({ runs: hcHealth.getHistory().slice(-limit) });
});

// Checkpoint Analyzer
app.post("/api/checkpoint/analyze", async (req, res) => {
  const { stage } = req.body;
  try {
    const pipelineState = hcPipeline.getState();
    const record = await hcCheckpoint.analyze({
      runId: pipelineState?.runId || `manual-${Date.now()}`,
      stage: stage || "manual",
      runState: pipelineState || {},
      healthSnapshot: hcHealth.getSnapshot(),
    });
    // Feed into brain
    hcBrain.onCheckpoint(record);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/checkpoint/records", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  res.json({ records: hcCheckpoint.getRecords().slice(-limit) });
});

// Claude Code Agent direct access
app.get("/api/agents/claude-code/status", (req, res) => {
  const agent = hcSupervisor.agents.get("claude-code");
  if (!agent) return res.status(404).json({ error: "claude-code agent not registered" });
  res.json(agent.getStatus());
});

// Combined subsystem overview
app.get("/api/subsystems", (req, res) => {
  const readinessLast = hcReadiness.getLastEvaluation();
  const checkpointLast = hcCheckpoint.getLastRecord();
  res.json(mcGlobal.enrich({
    supervisor: { agentCount: hcSupervisor.agents.size, agents: Array.from(hcSupervisor.agents.keys()) },
    brain: { readinessScore: hcBrain.computeReadinessScore(), mode: hcBrain.determineMode(hcBrain.computeReadinessScore()) },
    readiness: readinessLast ? { score: readinessLast.score, mode: readinessLast.mode, timestamp: readinessLast.timestamp } : { score: null, mode: "unknown" },
    health: hcHealth.getSnapshot(),
    checkpoint: checkpointLast ? { id: checkpointLast.id, decision: checkpointLast.decision, stage: checkpointLast.stage } : null,
    timestamp: new Date().toISOString(),
  }));
});

// ═══════════════════════════════════════════════════════════════════════
// MONTE CARLO SIMULATION APIs
// ═══════════════════════════════════════════════════════════════════════

// Pipeline reliability simulation
app.post("/api/monte-carlo/pipeline", (req, res) => {
  try {
    const { stages, iterations } = req.body;
    if (!stages || !Array.isArray(stages)) {
      // Use pipeline DAG defaults if no stages provided
      const dag = hcPipeline.getStageDag();
      const defaultStages = dag.map((s) => ({
        id: s.id,
        failureRate: 0.05,
        latencyMeanMs: s.timeout ? s.timeout / 2 : 5000,
        latencyStddevMs: s.timeout ? s.timeout / 6 : 1500,
        timeoutMs: s.timeout || 30000,
        retries: 1,
        dependsOn: s.dependsOn || [],
      }));
      const result = simulatePipelineReliability(defaultStages, iterations || 10000);
      return res.json(result);
    }
    const result = simulatePipelineReliability(stages, iterations || 10000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deployment risk simulation
app.post("/api/monte-carlo/deployment", (req, res) => {
  try {
    const profile = req.body.profile || {
      buildFailureRate: 0.05,
      testFailureRate: 0.08,
      rollbackRate: 0.03,
      downtime: { meanMs: 30000, stddevMs: 15000 },
      serviceCount: 3,
      hasCanaryDeploy: false,
      hasDatabaseMigration: false,
      changeComplexity: "medium",
    };
    const result = simulateDeploymentRisk(profile, req.body.iterations || 5000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Readiness confidence simulation
app.post("/api/monte-carlo/readiness", async (req, res) => {
  try {
    const signals = req.body.signals || {
      nodeAvailability: 1.0,
      apiLatencyMs: { mean: 150, stddev: 50 },
      errorRate: 0.01,
      memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
      cpuUsage: 0.3,
      uptime: process.uptime(),
      testPassRate: 0.95,
      coveragePercent: 60,
    };
    // Enrich with live data if available
    try {
      const healthSnap = hcHealth.getSnapshot();
      if (healthSnap && healthSnap.results) {
        const total = Object.keys(healthSnap.results).length;
        const healthy = Object.values(healthSnap.results).filter((r) => r.status === "pass").length;
        signals.nodeAvailability = total > 0 ? healthy / total : signals.nodeAvailability;
      }
    } catch (_) { /* non-fatal enrichment */ }
    const result = simulateReadinessConfidence(signals, req.body.iterations || 8000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Node performance prediction
app.post("/api/monte-carlo/nodes", (req, res) => {
  try {
    const { profiles, load, iterations } = req.body;
    if (!profiles || !load) {
      // Build defaults from registry
      const reg = loadRegistry();
      const defaultProfiles = Object.entries(reg.nodes || {}).map(([id, n]) => ({
        id,
        capacity: 10,
        processingTimeMeanMs: 500,
        processingTimeStddevMs: 200,
        failureRate: 0.02,
      }));
      const defaultLoad = {
        tasksPerSecond: 5,
        durationSeconds: 60,
        burstFactor: 3,
        burstProbability: 0.1,
      };
      if (defaultProfiles.length === 0) {
        return res.status(400).json({ error: "No nodes in registry and no profiles provided" });
      }
      const result = simulateNodePerformance(defaultProfiles, defaultLoad, iterations || 5000);
      return res.json(result);
    }
    const result = simulateNodePerformance(profiles, load, iterations || 5000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Full system simulation (composite)
app.post("/api/monte-carlo/full", async (req, res) => {
  try {
    const config = req.body.config || {};
    // Auto-build config from live system state if not provided
    if (!config.pipeline) {
      try {
        const dag = hcPipeline.getStageDag();
        config.pipeline = {
          stages: dag.map((s) => ({
            id: s.id,
            failureRate: 0.05,
            latencyMeanMs: s.timeout ? s.timeout / 2 : 5000,
            latencyStddevMs: s.timeout ? s.timeout / 6 : 1500,
            timeoutMs: s.timeout || 30000,
            retries: 1,
            dependsOn: s.dependsOn || [],
          })),
        };
      } catch (_) { }
    }
    if (!config.readiness) {
      config.readiness = {
        nodeAvailability: 1.0,
        apiLatencyMs: { mean: 150, stddev: 50 },
        errorRate: 0.01,
        memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        cpuUsage: 0.3,
        uptime: process.uptime(),
        testPassRate: 0.95,
        coveragePercent: 60,
      };
    }
    const result = simulateFullSystem(config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quick simulation status (includes always-on global MC status)
app.get("/api/monte-carlo/status", (req, res) => {
  res.json({
    available: true,
    globalEnabled: true,
    alwaysOn: mcGlobal.getStatus(),
    simulations: ["pipeline", "deployment", "readiness", "nodes", "full"],
    endpoints: {
      pipeline: "POST /api/monte-carlo/pipeline",
      deployment: "POST /api/monte-carlo/deployment",
      readiness: "POST /api/monte-carlo/readiness",
      nodes: "POST /api/monte-carlo/nodes",
      full: "POST /api/monte-carlo/full",
      globalStatus: "GET /api/monte-carlo/global",
      globalHistory: "GET /api/monte-carlo/global/history",
      globalEvents: "GET /api/monte-carlo/global/events",
      globalCycle: "POST /api/monte-carlo/global/cycle",
    },
    defaults: {
      pipelineIterations: 10000,
      deploymentIterations: 5000,
      readinessIterations: 8000,
      nodeIterations: 5000,
      globalFastIterations: 500,
    },
    timestamp: new Date().toISOString(),
  });
});

// Global Monte Carlo always-on status
app.get("/api/monte-carlo/global", (req, res) => {
  const status = mcGlobal.getStatus();
  res.json(status);
});

// Global MC cycle history
app.get("/api/monte-carlo/global/history", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  res.json({ cycles: mcGlobal.getHistory(limit) });
});

// Global MC event log
app.get("/api/monte-carlo/global/events", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  res.json({ events: mcGlobal.getEventLog(limit) });
});

// Force a global MC cycle
app.post("/api/monte-carlo/global/cycle", (req, res) => {
  try {
    const result = mcGlobal.runFullCycle(req.body.trigger || "api");
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Colab Pro+ GPU Cluster API ───────────────────────────────────────
// Node registration from Colab notebooks
app.post("/api/nodes/register", async (req, res) => {
  try {
    const result = await colabManager.registerNode(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Heartbeat receiver from Colab nodes
app.post("/api/nodes/heartbeat", (req, res) => {
  try {
    const received = colabManager.handleHeartbeat(req.body);
    res.json({
      status: received ? "received" : "unknown_node",
      cloud: colabManager.cloudLayer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GPU cluster status
app.get("/api/nodes/colab/status", (req, res) => {
  try {
    res.json(colabManager.getClusterStatus());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Specific node status
app.get("/api/nodes/:nodeId", (req, res) => {
  const node = colabManager.getNodeById(req.params.nodeId);
  if (!node) {
    return res.status(404).json({ error: "Node not found", node_id: req.params.nodeId });
  }
  res.json(node);
});

// Remove a node
app.delete("/api/nodes/:nodeId", (req, res) => {
  const removed = colabManager.removeNode(req.params.nodeId);
  res.json({ removed, node_id: req.params.nodeId });
});

// Route task to Colab GPU cluster
app.post("/api/tasks/colab", async (req, res) => {
  try {
    const result = await colabManager.routeTask(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message, cloud: colabManager.cloudLayer });
  }
});

// Auto-detect GPU tasks and route to Colab or execute locally
app.post("/api/tasks/execute", async (req, res) => {
  const task = req.body;
  const priority = req.headers["x-priority"] || task.priority || "P2";

  if (colabManager.isGpuTask(task.type) && process.env.ENABLE_COLAB_ROUTING === "true") {
    console.log(`[${colabManager.cloudLayer}] GPU task detected → routing to Colab cluster`);
    try {
      const result = await colabManager.routeTask({ ...task, priority });
      if (result.routed) {
        return res.json(result);
      }
      console.log(`[${colabManager.cloudLayer}] Colab unavailable, falling back to local`);
    } catch (error) {
      console.error(`Colab routing failed, falling back: ${error.message}`);
    }
  }

  // Local execution fallback
  res.json({
    task_id: task.id || `task-${Date.now()}`,
    status: "executed_locally",
    task_type: task.type,
    gpu_accelerated: false,
    cloud: colabManager.cloudLayer,
    timestamp: new Date().toISOString()
  });
});

// ─── Cloud Config API ─────────────────────────────────────────────────
// Cloud-managed configuration — source of truth for all Heady clients
const CLOUD_CONFIG_PATH = path.join(__dirname, "configs", "services.json");
let cloudEnvConfig = {
  HEADY_ENDPOINT: "https://headysystems.com",
  HEADY_ME_URL: "https://headycloud.com",
  HEADY_SYSTEMS_URL: "https://headysystems.com",
  HEADY_CONNECTION_URL: "https://headyconnection.com",
  HEADY_MCP_URL: "https://headymcp.com",
  HEADY_BUDDY_URL: "https://headybot.com",
  HEADY_DOCS_URL: "https://headyio.com",
  HEADY_STATUS_URL: "https://headycheck.com",
  HEADY_TARGET: "Cloud",
  HEADY_VERSION: "3.0.0",
  HEADY_SERVICE_PROFILE: "full",
  HEADY_ENFORCE_ALL: true,
  HEADY_EXCLUSION_REQUIRES_JUSTIFICATION: true,
  HEADY_ACTIVE_NODES: "BRIDGE,BRAIN,CONDUCTOR,SOPHIA,SENTINEL,MURPHY,JANITOR,JULES,OBSERVER,MUSE,NOVA,CIPHER,ATLAS,SASHA,SCOUT,OCULUS,BUILDER,PYTHIA,LENS,MEMORY",
  HEADY_NODE_COUNT: 20
};

app.get("/api/config/env", (req, res) => {
  res.json({ config: cloudEnvConfig, timestamp: new Date().toISOString() });
});

app.post("/api/config/env", (req, res) => {
  if (req.body && req.body.config) {
    cloudEnvConfig = { ...cloudEnvConfig, ...req.body.config };
  }
  res.json({ success: true, config: cloudEnvConfig, timestamp: new Date().toISOString() });
});

app.get("/api/config/services", (req, res) => {
  try {
    const services = JSON.parse(fs.readFileSync(CLOUD_CONFIG_PATH, "utf8"));
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Services config not found", message: err.message });
  }
});

app.post("/api/config/services", (req, res) => {
  try {
    fs.writeFileSync(CLOUD_CONFIG_PATH, JSON.stringify(req.body, null, 2), "utf8");
    res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to write services config", message: err.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, () => {
  const c = "\x1b[36m", m = "\x1b[35m", g = "\x1b[32m", y = "\x1b[33m", w = "\x1b[37m", d = "\x1b[2m", b = "\x1b[1m", r = "\x1b[0m";
  const agentList = hcSupervisor?.agents ? Array.from(hcSupervisor.agents.keys()).join(", ") : "none";
  const agentCount = hcSupervisor?.agents ? hcSupervisor.agents.size : 0;
  const env = process.env.NODE_ENV || "development";
  console.log("");
  console.log(`${c}${b}  ╔══════════════════════════════════════════════════════════════════╗${r}`);
  console.log(`${c}${b}  ║${r}${m}  ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                     ${r}${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}${m}  ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                     ${r}${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}${m}  ███████║█████╗  ███████║██║  ██║ ╚████╔╝                      ${r}${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}${m}  ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                       ${r}${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}${m}  ██║  ██║███████╗██║  ██║██████╔╝   ██║                        ${r}${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}${m}  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ${r}${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}                                                                  ${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}${y}  ∞ SACRED GEOMETRY ∞  ${d}Organic Systems · Breathing Interfaces${r}   ${c}${b}║${r}`);
  console.log(`${c}${b}  ╠══════════════════════════════════════════════════════════════════╣${r}`);
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Port:${r}         ${b}${PORT}${r}                                            ${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Environment:${r}  ${b}${env}${r}${" ".repeat(Math.max(0, 42 - env.length))}${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Pipeline:${r}     ${b}HCFullPipeline + Claude Code${r}                    ${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Supervisor:${r}   ${m}${agentCount} agents${r} registered                          ${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Subsystems:${r}   ${d}Brain ┃ Checkpoint ┃ Readiness ┃ Health${r}     ${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Monte Carlo:${r}  ${y}ALWAYS-ON${r} ${d}┃ Pipeline ┃ Deploy ┃ Ready ┃ Nodes${r}${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Agents:${r}       ${d}${agentList.substring(0, 46)}${r}${" ".repeat(Math.max(0, 46 - agentList.substring(0, 46).length))}${c}${b}║${r}`);
  console.log(`${c}${b}  ╚══════════════════════════════════════════════════════════════════╝${r}`);
  console.log("");
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mcGlobal.stopAutoRun();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mcGlobal.stopAutoRun();
  server.close(() => {
    console.log('Process terminated');
  });
});
