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

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;
const { spawn } = require("child_process");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const helmet = require("helmet");
const { ScalableCache } = require(path.join(__dirname, "src", "scalable-cache"));
const { PythonWorkerPool } = require(path.join(__dirname, "src", "python-worker-pool"));

const { HEADY_MAID_CONFIG } = require(path.join(__dirname, "src", "heady_maid"));
const { pipeline: hcPipeline, registerTaskHandler, RunStatus } = require(path.join(__dirname, "src", "hc_pipeline"));
const { claudeExecute, claudeAnalyzeCode, claudeSecurityAudit } = require(path.join(__dirname, "src", "hc_claude_agent"));
const { registerAllHandlers, initializeSubsystems, getSubsystems } = require(path.join(__dirname, "src", "agents", "pipeline-handlers"));
const { simulatePipelineReliability, simulateDeploymentRisk, simulateReadinessConfidence, simulateNodePerformance, simulateFullSystem, mcGlobal } = require(path.join(__dirname, "src", "hc_monte_carlo"));

// ─── Deep Research Wave 1+2 Modules ──────────────────────────────────
const { HeadyGateway, HeadyError, envelope } = require(path.join(__dirname, "src", "gateway"));
const { HeadySessionManager } = require(path.join(__dirname, "src", "sessions"));
const { DriftDetectionEngine } = require(path.join(__dirname, "src", "drift"));
const { IntentResolver, ConfirmationPolicy } = require(path.join(__dirname, "src", "chat", "intent-resolver"));
const { ConnectorRegistry } = require(path.join(__dirname, "src", "mcp", "connector-registry"));
const { SoulOrchestrator } = require(path.join(__dirname, "src", "soul", "soul-orchestrator"));
const { HeadyModelProvider, ArenaMergeEngine } = require(path.join(__dirname, "src", "heady-ide"));
const { HeadyServiceManifest } = require(path.join(__dirname, "src", "service-manifest"));
const { DeterministicConfig } = require(path.join(__dirname, "src", "deterministic-config"));

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

const PORT = Number(process.env.PORT || 3300);
const HEADY_ADMIN_SCRIPT = process.env.HEADY_ADMIN_SCRIPT || path.join(__dirname, "src", "heady_project", "heady_conductor.py");
const HEADY_PYTHON_BIN = process.env.HEADY_PYTHON_BIN || "python";

const app = express();
app.set('trust proxy', true);

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

// Rate limiting — scaled for high concurrency
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // 10x increase: 10,000 requests per IP per window
  message: { error: "Too many requests from this IP" },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Scalable cache — Redis-backed when REDIS_URL is set, in-memory fallback
const cache = new ScalableCache({ maxSize: 10000, ttlMs: 5 * 60 * 1000, prefix: "heady:" });

// Async JSON file reader (non-blocking)
async function readJsonFileAsync(filePath) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// Sync fallback for boot-time only (not in request handlers)
function readJsonFileSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}


// ─── Domain-based branded site routing (MUST come before static middleware) ───
const SITES_DIR = path.join(__dirname, "sites");
const BRANDED_DOMAIN_MAP = {
  'headysystems.com': 'headysystems',
  'headybuddy.org': 'headybuddy',
  'headycheck.com': 'headycheck',
  'headyio.com': 'headyio',
  'headymcp.com': 'headymcp',
  'headybot.com': 'headybot',
  'headycloud.com': 'headycloud',
  'headyconnection.com': 'headyconnection',
  'headyos.com': 'headyos',
};

function resolveHost(req) {
  const raw = req.headers['x-forwarded-host'] || req.headers['x-heady-domain'] || req.hostname || req.headers['host'] || '';
  return raw.split(',')[0].trim().replace(/:\d+$/, '').replace(/^www\./, '').toLowerCase();
}

// Serve branded site if the request hostname matches a known domain
app.use((req, res, next) => {
  // Skip API routes and /sites/ path-based access
  if (req.path.startsWith('/api/') || req.path.startsWith('/sites')) return next();
  const host = resolveHost(req);
  const siteKey = BRANDED_DOMAIN_MAP[host];
  if (!siteKey) return next();
  const siteDir = path.join(SITES_DIR, siteKey);
  if (!fs.existsSync(siteDir)) return next();
  // Serve the requested file, or fall back to index.html for SPA-style
  const requestedFile = req.path === '/' ? 'index.html' : req.path.replace(/^\//, '');
  const filePath = path.join(siteDir, requestedFile);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return res.sendFile(filePath);
  // Fall back to site's index.html
  const indexPath = path.join(siteDir, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  next();
});

// Static assets fallback (only reached if no branded domain matched)
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
    cache: cache.getStats(),
    workers: {
      pid: process.pid,
      conductorPool: conductorPool.getStats(),
    }
  }));
});

app.get("/api/registry", async (req, res) => {
  const cacheKey = 'registry';
  const cachedData = await cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  const registryPath = path.join(__dirname, "heady-registry.json");
  const registry = await readJsonFileAsync(registryPath);

  if (!registry) {
    return res.status(404).json({ error: "Registry not found or invalid" });
  }

  await cache.set(cacheKey, registry);
  res.json(registry);
});

app.get("/api/maid/config", (req, res) => {
  res.json(HEADY_MAID_CONFIG);
});

app.get("/api/maid/inventory", async (req, res) => {
  const cacheKey = 'inventory';
  const cachedData = await cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  const inventoryPath = path.join(__dirname, ".heady-memory", "inventory", "inventory.json");
  const inventory = await readJsonFileAsync(inventoryPath);

  if (!inventory) {
    return res.status(404).json({ error: "Inventory not found or invalid" });
  }

  await cache.set(cacheKey, inventory);
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

// Python worker pool — persistent, queued, max 4 concurrent (replaces per-request spawning)
const conductorPool = new PythonWorkerPool({
  maxWorkers: parseInt(process.env.HEADY_PYTHON_WORKERS, 10) || 4,
  timeoutMs: 30000,
  scriptPath: path.join(__dirname, "HeadyAcademy", "HeadyConductor.py"),
  pythonBin: process.env.HEADY_PYTHON_BIN || "python",
});

// Backward-compatible wrapper
function runPythonConductor(args, timeoutMs = 30000) {
  return conductorPool.execute(args, timeoutMs);
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

async function getActiveLayer() {
  try {
    if (fs.existsSync(LAYER_STATE_PATH)) {
      const content = await fsp.readFile(LAYER_STATE_PATH, "utf8");
      return content.trim();
    }
    const config = await readJsonFileAsync(LAYERS_CONFIG_PATH);
    return config ? config.default_layer : "local";
  } catch {
    return "local";
  }
}

async function getLayerConfig() {
  return readJsonFileAsync(LAYERS_CONFIG_PATH);
}

app.get("/api/layer", async (req, res) => {
  const activeId = await getActiveLayer();
  const config = await getLayerConfig();
  const layer = config && config.layers ? config.layers[activeId] : null;

  res.json({
    active_layer: activeId,
    name: layer ? layer.name : "Unknown",
    endpoint: layer ? layer.endpoint : "https://headysystems.com",
    icon: layer ? layer.icon : "?",
    color: layer ? layer.color : "White",
    description: layer ? layer.description : "",
    git_remote: layer ? layer.git_remote : null,
    all_layers: config ? Object.keys(config.layers) : [],
    timestamp: new Date().toISOString()
  });
});

app.post("/api/layer/switch", async (req, res) => {
  const { layer } = req.body;
  const config = await getLayerConfig();

  if (!config || !config.layers || !config.layers[layer]) {
    return res.status(400).json({
      error: `Unknown layer '${layer}'`,
      available: config ? Object.keys(config.layers) : []
    });
  }

  try {
    await fsp.writeFile(LAYER_STATE_PATH, layer, "utf8");
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
app.get("/api/pulse", async (req, res) => {
  const activeLayer = await getActiveLayer();
  const config = await getLayerConfig();
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

async function loadRegistry() {
  return (await readJsonFileAsync(REGISTRY_PATH)) || { nodes: {}, tools: {}, workflows: {}, services: {}, skills: {} };
}

async function saveRegistry(data) {
  await fsp.writeFile(REGISTRY_PATH, JSON.stringify(data, null, 2), "utf8");
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
app.get("/api/nodes", async (req, res) => {
  const reg = await loadRegistry();
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
app.get("/api/nodes/:nodeId", async (req, res) => {
  const reg = await loadRegistry();
  const node = reg.nodes[req.params.nodeId.toUpperCase()];
  if (!node) return res.status(404).json({ error: `Node '${req.params.nodeId}' not found` });
  res.json({ id: req.params.nodeId.toUpperCase(), ...node });
});

// Activate a single node
app.post("/api/nodes/:nodeId/activate", async (req, res) => {
  const reg = await loadRegistry();
  const nodeId = req.params.nodeId.toUpperCase();
  if (!reg.nodes[nodeId]) return res.status(404).json({ error: `Node '${nodeId}' not found` });

  reg.nodes[nodeId].status = "active";
  reg.nodes[nodeId].last_invoked = new Date().toISOString();
  await saveRegistry(reg);

  res.json({ success: true, node: nodeId, status: "active", activated_at: reg.nodes[nodeId].last_invoked });
});

// Activate ALL nodes (production mode)
app.post("/api/nodes/activate-all", async (req, res) => {
  const reg = await loadRegistry();
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

  await saveRegistry(reg);

  res.json({
    success: true,
    activated_count: activated.length,
    nodes: activated,
    environment: "production",
    timestamp: ts
  });
});

// Deactivate a single node
app.post("/api/nodes/:nodeId/deactivate", async (req, res) => {
  const reg = await loadRegistry();
  const nodeId = req.params.nodeId.toUpperCase();
  if (!reg.nodes[nodeId]) return res.status(404).json({ error: `Node '${nodeId}' not found` });

  reg.nodes[nodeId].status = "available";
  await saveRegistry(reg);

  res.json({ success: true, node: nodeId, status: "available" });
});

// Full system status (production dashboard)
app.get("/api/system/status", async (req, res) => {
  const reg = await loadRegistry();
  const activeLayer = await getActiveLayer();
  const config = await getLayerConfig();
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
      endpoint: layer ? layer.endpoint : "https://headysystems.com"
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
app.post("/api/system/production", async (req, res) => {
  const reg = await loadRegistry();
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

  await saveRegistry(reg);

  // Switch layer state to production
  try {
    await fsp.writeFile(LAYER_STATE_PATH, "cloud-sys", "utf8");
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

// ═══════════════════════════════════════════════════════════════════════
// SERVICE MANIFEST — ALL SERVICES REGISTERED
// ═══════════════════════════════════════════════════════════════════════

const serviceManifest = new HeadyServiceManifest({
  configPath: path.join(__dirname, "..", "config", "services.json"),
});

const deterministicConfig = new DeterministicConfig({
  ai: {
    temperature: parseFloat(process.env.HEADY_TEMPERATURE || "0"),
    seed: parseInt(process.env.HEADY_SEED || "42"),
  },
  monteCarlo: {
    defaultIterations: parseInt(process.env.HEADY_MONTE_CARLO_ITERATIONS || "10000"),
  },
});
app.locals.deterministicConfig = deterministicConfig;

// Register every live runtime module so /api/subsystems reports ALL of them
serviceManifest.registerModule("hcPipeline", hcPipeline, { type: "pipeline", group: "execution", description: "HCFullPipeline — 9-stage deterministic build/deploy" });
serviceManifest.registerModule("hcSupervisor", hcSupervisor, { type: "supervisor", group: "execution", description: "Agent supervisor — routes tasks to registered agents" });
serviceManifest.registerModule("hcBrain", hcBrain, { type: "controller", group: "execution", description: "HCBrain meta-controller — readiness scoring, auto-tune" });
serviceManifest.registerModule("hcCheckpoint", hcCheckpoint, { type: "analyzer", group: "execution", description: "Checkpoint analyzer — stage-gate validation" });
serviceManifest.registerModule("hcReadiness", hcReadiness, { type: "evaluator", group: "execution", description: "Readiness evaluator — deploy-readiness scoring" });
serviceManifest.registerModule("hcHealth", hcHealth, { type: "health", group: "observability", description: "Health check runner — cron-based service probes" });
serviceManifest.registerModule("mcGlobal", mcGlobal, { type: "simulation", group: "validation", description: "Monte Carlo — always-on probabilistic scoring" });
serviceManifest.registerModule("soulOrchestrator", soulOrchestrator, { type: "orchestrator", group: "governance", description: "SoulOrchestrator v2.0 — goal decomposition + value-driven execution" });
serviceManifest.registerModule("driftEngine", driftEngine, { type: "detector", group: "observability", description: "Drift detection — 6-signal config/dependency/soul drift" });
serviceManifest.registerModule("intentResolver", intentResolver, { type: "resolver", group: "companion", description: "Intent resolver — 3-stage keyword/fuzzy/LLM matching" });
serviceManifest.registerModule("confirmationPolicy", confirmationPolicy, { type: "policy", group: "governance", description: "Confirmation policy — risk-gated action approval" });
serviceManifest.registerModule("connectorRegistry", connectorRegistry, { type: "registry", group: "extensibility", description: "MCP connector registry — tool registration + invocation" });
serviceManifest.registerModule("sessionManager", sessionManager, { type: "manager", group: "companion", description: "Session manager — T1/T2/T3 tiered conversation state" });
serviceManifest.registerModule("computeCluster", computeCluster, { type: "cluster", group: "infrastructure", description: "Compute cluster — physical node routing + heartbeat" });
serviceManifest.registerModule("colabManager", colabManager, { type: "cluster", group: "gpu", description: "Colab GPU cluster — A100/V100/T4 task routing" });
serviceManifest.registerModule("headyModelProvider", headyModelProvider, { type: "provider", group: "ide", description: "Model provider — 7 Heady service models + external LLMs" });
serviceManifest.registerModule("arenaMergeEngine", arenaMergeEngine, { type: "engine", group: "ide", description: "Arena merge — branch/worktree parallel evaluation" });
serviceManifest.registerModule("cache", cache, { type: "cache", group: "infrastructure", description: "Scalable cache — Redis-backed or in-memory, 10K entries" });
serviceManifest.registerModule("conductorPool", conductorPool, { type: "pool", group: "infrastructure", description: "Python worker pool — persistent queued HeadyConductor" });
if (typeof intelligenceEngine !== "undefined" && intelligenceEngine) {
  serviceManifest.registerModule("intelligenceEngine", intelligenceEngine, { type: "engine", group: "execution", description: "Intelligence Engine v1.3 — DAG scheduler, parallel allocator, speed controller" });
}
if (typeof siteGenerator !== "undefined" && siteGenerator) {
  serviceManifest.registerModule("siteGenerator", siteGenerator, { type: "generator", group: "content", description: "Site generator — 9 branded domain static sites" });
}

// Expose manifest on app.locals for domain routers
app.locals.serviceManifest = serviceManifest;

// Combined subsystem overview — NOW reports ALL services
app.get("/api/subsystems", (req, res) => {
  const readinessLast = hcReadiness.getLastEvaluation();
  const checkpointLast = hcCheckpoint.getLastRecord();
  const manifestSummary = serviceManifest.getHCAutoFlowSummary();
  const moduleProbes = serviceManifest.probeAllModules();

  res.json(mcGlobal.enrich({
    supervisor: { agentCount: hcSupervisor.agents.size, agents: Array.from(hcSupervisor.agents.keys()) },
    brain: { readinessScore: hcBrain.computeReadinessScore(), mode: hcBrain.determineMode(hcBrain.computeReadinessScore()) },
    readiness: readinessLast ? { score: readinessLast.score, mode: readinessLast.mode, timestamp: readinessLast.timestamp } : { score: null, mode: "unknown" },
    health: hcHealth.getSnapshot(),
    checkpoint: checkpointLast ? { id: checkpointLast.id, decision: checkpointLast.decision, stage: checkpointLast.stage } : null,
    services: manifestSummary,
    moduleHealth: moduleProbes,
    timestamp: new Date().toISOString(),
  }));
});

// Full service manifest — every single service, node, engine, domain
app.get("/api/services/full", (req, res) => {
  res.json(serviceManifest.getFullManifest());
});

// Full scan — probe all modules + return complete state
app.post("/api/services/scan", (req, res) => {
  const scan = serviceManifest.fullScan();
  res.json(scan);
});

// HCAutoFlow summary — grouped counts for pipeline verification
app.get("/api/services/summary", (req, res) => {
  res.json(serviceManifest.getHCAutoFlowSummary());
});

// Deterministic execution config
app.get("/api/config/deterministic", (req, res) => {
  res.json(deterministicConfig.getAll());
});

app.get("/api/config/ai-params", (req, res) => {
  res.json(deterministicConfig.getAIParams());
});

app.get("/api/config/edge", (req, res) => {
  res.json(deterministicConfig.getEdgeConfig());
});

app.get("/api/config/gpu", (req, res) => {
  res.json(deterministicConfig.getGPUConfig());
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
app.post("/api/monte-carlo/nodes", async (req, res) => {
  try {
    const { profiles, load, iterations } = req.body;
    if (!profiles || !load) {
      // Build defaults from registry
      const reg = await loadRegistry();
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

app.get("/api/config/services", async (req, res) => {
  try {
    const raw = await fsp.readFile(CLOUD_CONFIG_PATH, "utf8");
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: "Services config not found", message: err.message });
  }
});

app.post("/api/config/services", async (req, res) => {
  try {
    await fsp.writeFile(CLOUD_CONFIG_PATH, JSON.stringify(req.body, null, 2), "utf8");
    res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to write services config", message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// DEEP RESEARCH: GATEWAY, SESSIONS, DRIFT, CHAT, MCP APIs
// ═══════════════════════════════════════════════════════════════════════

// Initialize Deep Research modules
const headyGateway = new HeadyGateway();
const sessionManager = new HeadySessionManager();
const driftEngine = new DriftDetectionEngine(__dirname);
const intentResolver = new IntentResolver();
const confirmationPolicy = new ConfirmationPolicy();
const connectorRegistry = new ConnectorRegistry();
app.locals.connectorRegistry = connectorRegistry;

// Initialize SoulOrchestrator — THE unified decision authority
let intelligenceEngine;
try { const IntelEngine = require(path.join(__dirname, "src", "intelligence")); intelligenceEngine = new IntelEngine(); } catch (e) { intelligenceEngine = null; }
const soulOrchestrator = new SoulOrchestrator(
  intelligenceEngine?.soul || null,
  intelligenceEngine
);

// Register site generation handler
const { SiteGenerator } = require(path.join(__dirname, "src", "site-generator"));
const siteGenerator = new SiteGenerator(path.join(__dirname, "sites"));
soulOrchestrator.registerHandler('site-gen', async (task) => siteGenerator.generate(task));
soulOrchestrator.registerHandler('build', async (task) => {
  if (task.metadata?.resources?.includes('sites/shared')) return siteGenerator.generateSharedAssets();
  return { status: 'completed', type: 'build' };
});
soulOrchestrator.registerHandler('verify', async (task) => siteGenerator.verifySites());

// Start orchestrator + background processes
soulOrchestrator.start();
if (intelligenceEngine) intelligenceEngine.start();
driftEngine.startPeriodicScan();
connectorRegistry.startHealthChecks();

// ─── Gateway Stats ───────────────────────────────────────────────────
app.get("/api/v1/gateway/stats", (req, res) => {
  res.json(envelope(headyGateway.getStats(), req));
});

// ─── Session APIs ────────────────────────────────────────────────────
app.post("/api/v1/sessions", (req, res) => {
  const session = sessionManager.createSession(req.body);
  res.status(201).json(envelope(session, req));
});

app.get("/api/v1/sessions/:id", (req, res) => {
  const session = sessionManager.getSession(req.params.id);
  if (!session) return res.status(404).json(HeadyError.notFound(`session:${req.params.id}`));
  res.json(envelope(session, req));
});

app.post("/api/v1/sessions/:id/messages", (req, res) => {
  const session = sessionManager.t1.addMessage(req.params.id, req.body);
  if (!session) return res.status(404).json(HeadyError.notFound(`session:${req.params.id}`));
  res.json(envelope({ messageCount: session.conversationHistory.length }, req));
});

app.post("/api/v1/sessions/:id/actions", (req, res) => {
  const action = sessionManager.t1.addPendingAction(req.params.id, req.body);
  if (!action) return res.status(404).json(HeadyError.notFound(`session:${req.params.id}`));
  res.status(201).json(envelope(action, req));
});

app.post("/api/v1/sessions/:id/actions/:actionId/approve", (req, res) => {
  const action = sessionManager.t1.approvePendingAction(req.params.id, req.params.actionId);
  if (!action) return res.status(404).json(HeadyError.notFound(`action:${req.params.actionId}`));
  res.json(envelope(action, req));
});

app.post("/api/v1/sessions/:id/actions/:actionId/reject", (req, res) => {
  const action = sessionManager.t1.rejectPendingAction(req.params.id, req.params.actionId);
  if (!action) return res.status(404).json(HeadyError.notFound(`action:${req.params.actionId}`));
  res.json(envelope(action, req));
});

app.post("/api/v1/sessions/:id/promote", (req, res) => {
  const ok = sessionManager.promoteToT2(req.params.id);
  if (!ok) return res.status(404).json(HeadyError.notFound(`session:${req.params.id}`));
  res.json(envelope({ promoted: true, tier: "t2" }, req));
});

app.post("/api/v1/sessions/:id/memory-proposal", (req, res) => {
  const proposal = sessionManager.proposeMemory(req.params.id, req.body);
  res.status(201).json(envelope(proposal, req));
});

app.get("/api/v1/sessions/:id/summary", (req, res) => {
  const summary = sessionManager.generateSummary(req.params.id);
  if (!summary) return res.status(404).json(HeadyError.notFound(`session:${req.params.id}`));
  res.json(envelope(summary, req));
});

app.delete("/api/v1/sessions/:id", async (req, res) => {
  const summary = await sessionManager.endSession(req.params.id);
  res.json(envelope({ ended: true, summary }, req));
});

app.get("/api/v1/sessions/stats/overview", (req, res) => {
  res.json(envelope(sessionManager.getStats(), req));
});

// ─── GDPR / Privacy APIs ────────────────────────────────────────────
app.get("/api/v1/privacy/:userId/export", async (req, res) => {
  const format = req.query.format || "json";
  const data = await sessionManager.exportUserData(req.params.userId, format);
  res.json(envelope(data, req));
});

app.post("/api/v1/privacy/:userId/delete", async (req, res) => {
  const request = await sessionManager.requestDeletion(req.params.userId);
  res.status(202).json(envelope(request, req));
});

// ─── Emergency System Operations ───────────────────────────────────────────
app.post("/api/v1/emergency/generate-sites", async (req, res) => {
  try {
    console.log("[EMERGENCY] Generating sites bypassing HeadySoul evaluation");
    const result = await siteGenerator.generate({
      id: 'emergency-sites',
      type: 'generate-sites',
      metadata: { emergency_override: true, user_facing: true }
    });
    res.json(envelope({ status: 'completed', result, emergency: true }, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

app.post("/api/v1/emergency/execute", async (req, res) => {
  try {
    const goal = req.body;
    goal.metadata = { ...goal.metadata, emergency_override: true };

    // Execute directly through handlers without soul evaluation
    const handler = soulOrchestrator.handlers[goal.type] || soulOrchestrator.handlers['build'];
    if (handler) {
      const result = await handler(goal);
      res.json(envelope({ status: 'completed', result, emergency: true }, req));
    } else {
      res.status(400).json(HeadyError.create("NO_HANDLER", `No handler for ${goal.type}`));
    }
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

// ─── HeadySoul APIs ─────────────────────────────────────────────────────
app.post("/api/soul/reload", (req, res) => {
  try {
    // Reload value weights and mission scorer
    const ValueWeights = require(path.join(__dirname, "src", "soul", "value_weights"));
    const MissionScorer = require(path.join(__dirname, "src", "soul", "mission_scorer"));

    // Clear require cache to force reload
    delete require.cache[require.resolve(path.join(__dirname, "src", "soul", "value_weights"))];
    delete require.cache[require.resolve(path.join(__dirname, "src", "soul", "mission_scorer"))];

    // Reinitialize with new values
    const newValueWeights = new ValueWeights();
    const newMissionScorer = new MissionScorer(newValueWeights);

    // Update soul orchestrator if it exists
    if (soulOrchestrator && soulOrchestrator.soulRef) {
      soulOrchestrator.soulRef.valueWeights = newValueWeights;
      soulOrchestrator.soulRef.scorer = newMissionScorer;
    }

    res.json(envelope({ reloaded: true, thresholds: newValueWeights.getThresholds() }, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

// ─── Compute Cluster (HA Physical Nodes) ─────────────────────────────────
const { HeadyComputeCluster } = require(path.join(__dirname, "src", "cluster", "compute-cluster-manager"));
const computeCluster = new HeadyComputeCluster({
  cloudLayer: process.env.CLOUD_LAYER || "headysystems",
  heartbeatTTLSec: 120,
  healthCheckIntervalSec: 30,
});
computeCluster.startHealthChecks();

// Bind compute cluster to intelligence engine allocator
if (intelligenceEngine && intelligenceEngine.allocator) {
  intelligenceEngine.allocator.bindComputeCluster(computeCluster);
}

// ─── Compute Cluster APIs ─────────────────────────────────────────────

// Register a compute node
app.post("/api/cluster/nodes/register", async (req, res) => {
  try {
    const result = await computeCluster.registerNode(req.body);
    res.status(result.success ? 201 : 400).json(envelope(result, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

// Node heartbeat
app.post("/api/cluster/nodes/heartbeat", (req, res) => {
  const result = computeCluster.handleHeartbeat(req.body);
  res.json(envelope(result, req));
});

// Get cluster state
app.get("/api/cluster/state", (req, res) => {
  res.json(envelope(computeCluster.getClusterState(), req));
});

// Get all nodes
app.get("/api/cluster/nodes", (req, res) => {
  res.json(envelope({ nodes: computeCluster.getAllNodes() }, req));
});

// Get single node
app.get("/api/cluster/nodes/:nodeId", (req, res) => {
  const node = computeCluster.getNode(req.params.nodeId);
  if (!node) return res.status(404).json(HeadyError.notFound(`node:${req.params.nodeId}`));
  res.json(envelope(node, req));
});

// Remove a node
app.delete("/api/cluster/nodes/:nodeId", (req, res) => {
  const removed = computeCluster.removeNode(req.params.nodeId);
  if (!removed) return res.status(404).json(HeadyError.notFound(`node:${req.params.nodeId}`));
  res.json(envelope({ removed: true, node_id: req.params.nodeId }, req));
});

// Route a task to the cluster
app.post("/api/cluster/tasks/route", async (req, res) => {
  try {
    const result = await computeCluster.routeTask(req.body);
    res.json(envelope(result, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

// Report task completion from a node
app.post("/api/cluster/tasks/complete", (req, res) => {
  const result = computeCluster.handleTaskComplete(req.body);
  res.json(envelope({ accepted: result }, req));
});

// Check if cluster can handle a task type
app.get("/api/cluster/can-handle/:taskType", (req, res) => {
  res.json(envelope(computeCluster.canHandleTask(req.params.taskType), req));
});

// Cluster task history
app.get("/api/cluster/tasks/history", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  res.json(envelope({ history: computeCluster.getTaskHistory(limit) }, req));
});

// ─── Colab GPU Connection APIs ───────────────────────────────────────────
const HeadyColabClusterManager = require(path.join(__dirname, "src", "cloud-orchestration", "colab-cluster-manager"));
const colabManager = new HeadyColabClusterManager(process.env.CLOUD_LAYER || "headysystems");

app.post("/api/soul/colab/connect", async (req, res) => {
  try {
    const result = await colabManager.registerNode(req.body);
    res.json(envelope(result, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

app.post("/api/soul/colab/heartbeat", (req, res) => {
  const success = colabManager.handleHeartbeat(req.body);
  res.json(envelope({ received: success }, req));
});

app.get("/api/soul/colab/status", (req, res) => {
  res.json(envelope(colabManager.getClusterStatus(), req));
});

app.post("/api/soul/colab/route", async (req, res) => {
  try {
    const result = await colabManager.routeTask(req.body);
    res.json(envelope(result, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

// ─── Chat Intent Resolution APIs ─────────────────────────────────────
app.post("/api/v1/chat/resolve", async (req, res) => {
  const { message, userId } = req.body;
  if (!message) return res.status(400).json(HeadyError.create("MISSING_MESSAGE", "message field required"));
  const result = await intentResolver.resolve(message, { userId });
  res.json(envelope(result, req));
});

app.post("/api/v1/chat/learn", (req, res) => {
  const { userId, input, skill, params } = req.body;
  intentResolver.learnPreference(userId, input, skill, params);
  res.json(envelope({ learned: true }, req));
});

app.get("/api/v1/chat/stats", (req, res) => {
  res.json(envelope(intentResolver.getStats(), req));
});

app.get("/api/v1/chat/confirmation-policy", (req, res) => {
  res.json(envelope(confirmationPolicy.policies, req));
});

app.post("/api/v1/chat/pre-approve", (req, res) => {
  const { userId, category } = req.body;
  const result = confirmationPolicy.preApprove(userId, category);
  res.json(envelope(result, req));
});

// ─── Drift Detection APIs ────────────────────────────────────────────
app.get("/api/v1/drift/latest", (req, res) => {
  const report = driftEngine.getLatestReport();
  if (!report) return res.json(envelope({ status: "no_scans_yet" }, req));
  res.json(envelope(report, req));
});

app.get("/api/v1/drift/history", (req, res) => {
  res.json(envelope({ reports: driftEngine.getHistory().slice(-20) }, req));
});

app.get("/api/v1/drift/trend", (req, res) => {
  res.json(envelope(driftEngine.getTrend(), req));
});

app.post("/api/v1/drift/scan", async (req, res) => {
  try {
    const report = await driftEngine.runFullScan();
    res.json(envelope(report, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

// ─── MCP Connector Registry APIs ─────────────────────────────────────
app.post("/api/v1/mcp/connectors/register", (req, res) => {
  const result = connectorRegistry.register(req.body);
  if (!result.success) return res.status(400).json(envelope(result, req));
  res.status(201).json(envelope(result, req));
});

app.get("/api/v1/mcp/connectors", (req, res) => {
  const list = connectorRegistry.listConnectors(req.query);
  res.json(envelope({ connectors: list, total: list.length }, req));
});

app.get("/api/v1/mcp/connectors/dashboard", (req, res) => {
  res.json(envelope(connectorRegistry.getDashboard(), req));
});

app.get("/api/v1/mcp/connectors/:id", (req, res) => {
  const connector = connectorRegistry.getConnector(req.params.id);
  if (!connector) return res.status(404).json(HeadyError.notFound(`connector:${req.params.id}`));
  res.json(envelope(connector, req));
});

app.delete("/api/v1/mcp/connectors/:id", (req, res) => {
  const result = connectorRegistry.deregister(req.params.id);
  if (!result.success) return res.status(404).json(envelope(result, req));
  res.status(204).end();
});

app.put("/api/v1/mcp/connectors/:id/heartbeat", (req, res) => {
  const result = connectorRegistry.heartbeat(req.params.id);
  if (!result.success) return res.status(404).json(envelope(result, req));
  res.json(envelope(result, req));
});

app.get("/api/v1/mcp/connectors/:id/capabilities", (req, res) => {
  const caps = connectorRegistry.getCapabilities(req.params.id);
  if (!caps) return res.status(404).json(HeadyError.notFound(`connector:${req.params.id}`));
  res.json(envelope({ capabilities: caps }, req));
});

app.post("/api/v1/mcp/connectors/:id/invoke/:capability", async (req, res) => {
  const result = await connectorRegistry.invokeCapability(
    req.params.id, req.params.capability, req.body, { traceId: req.headers['x-heady-trace-id'] }
  );
  if (!result.success) return res.status(400).json(envelope(result, req));
  res.json(envelope(result, req));
});

// ─── MCP API Compatibility (for frontend) ───────────────────────────────
app.get("/api/mcp/servers", (req, res) => {
  const connectors = connectorRegistry.listConnectors(req.query);
  const servers = connectors.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status || 'active',
    capabilities: c.capabilities || []
  }));
  res.json(envelope({ servers, total: servers.length }, req));
});

app.post("/api/mcp/tool", async (req, res) => {
  const { server, tool, arguments: args } = req.body;

  // Find the connector
  const connector = connectorRegistry.getConnector(server);
  if (!connector) {
    return res.status(404).json(HeadyError.notFound(`server:${server}`));
  }

  // Invoke the tool/capability
  const result = await connectorRegistry.invokeCapability(
    server, tool, args, { traceId: req.headers['x-heady-trace-id'] }
  );

  if (!result.success) {
    return res.status(400).json(envelope(result, req));
  }

  res.json(envelope(result, req));
});

app.get("/api/mcp/status", (req, res) => {
  const connectors = connectorRegistry.listConnectors(req.query);
  const dashboard = connectorRegistry.getDashboard();

  res.json(envelope({
    servers: connectors.length,
    active: connectors.filter(c => c.status === 'active').length,
    dashboard
  }, req));
});

// ─── SoulOrchestrator APIs ────────────────────────────────────────────
app.get("/api/v1/orchestrator/state", (req, res) => {
  res.json(envelope(soulOrchestrator.getState(), req));
});

app.get("/api/v1/orchestrator/history", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  res.json(envelope({ workloads: soulOrchestrator.getHistory(limit) }, req));
});

app.post("/api/v1/orchestrator/execute", async (req, res) => {
  try {
    const goal = req.body;
    if (!goal || (!goal.type && !goal.description)) {
      return res.status(400).json(HeadyError.create("INVALID_GOAL", "Goal must have type or description"));
    }
    const report = await soulOrchestrator.executeGoal(goal);
    res.json(envelope(report, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

app.post("/api/v1/orchestrator/execute-many", async (req, res) => {
  try {
    const goals = req.body.goals;
    if (!goals || !Array.isArray(goals)) {
      return res.status(400).json(HeadyError.create("INVALID_GOALS", "Body must contain goals array"));
    }
    const report = await soulOrchestrator.executeGoals(goals);
    res.json(envelope(report, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

app.post("/api/v1/orchestrator/generate-sites", async (req, res) => {
  try {
    const report = await soulOrchestrator.executeGoal({
      type: 'generate-sites',
      description: 'Generate all 8 branded domain websites',
      priority: 'P0',
      metadata: { user_facing: true }
    });
    res.json(envelope(report, req));
  } catch (error) {
    res.status(500).json(HeadyError.internal(error.message));
  }
});

app.get("/api/v1/sites/status", (req, res) => {
  res.json(envelope(siteGenerator.getGeneratedSites(), req));
});

// System Registry — canonical machine-readable ecosystem map
app.get("/system-registry.json", (req, res) => {
  try {
    const { generateSystemRegistry } = require(path.join(__dirname, "src", "system-registry-generator"));
    res.json(generateSystemRegistry());
  } catch (err) {
    res.status(500).json({ error: "Failed to generate system registry", message: err.message });
  }
});

// ─── Path-based site access (debugging / direct access) ─────────────
const SITE_NAMES = Object.values(BRANDED_DOMAIN_MAP);

// Path-based access: /sites/:siteName serves the site regardless of hostname
app.get('/sites/:siteName', (req, res) => {
  const siteName = req.params.siteName.replace(/\.(com|org)$/, '');
  if (!SITE_NAMES.includes(siteName)) return res.status(404).json({ error: 'Unknown site', available: SITE_NAMES });
  const indexPath = path.join(SITES_DIR, siteName, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.status(404).json({ error: 'Site not generated yet. POST /api/v1/orchestrator/generate-sites to build.' });
});

// Site index: list all available sites with links
app.get('/sites', (req, res) => {
  const sites = SITE_NAMES.map(name => {
    const indexPath = path.join(SITES_DIR, name, 'index.html');
    const exists = fs.existsSync(indexPath);
    return {
      name,
      domain: Object.entries(BRANDED_DOMAIN_MAP).find(([, v]) => v === name)?.[0],
      path: `/sites/${name}`,
      generated: exists,
      sizeBytes: exists ? fs.statSync(indexPath).size : 0
    };
  });
  res.json({ sites, total: sites.length, generated: sites.filter(s => s.generated).length });
});

// MCP domain-specific handling
const mcpRouter = require('./src/mcp/headymcp-router');

// Detect headymcp.com domain and route to MCP router
app.use((req, res, next) => {
  const host = resolveHost(req);
  if (host.includes('headymcp.com')) {
    return mcpRouter(req, res, next);
  }
  next();
});

// ═══════════════════════════════════════════════════════════════════════
// HEADY AI-IDE — MODEL PROVIDER & ARENA MERGE ENGINE
// ═══════════════════════════════════════════════════════════════════════

const headyModelProvider = new HeadyModelProvider({
  baseUrl: "https://headysystems.com",
  defaultModel: "heady-full",
});

const arenaMergeEngine = new ArenaMergeEngine({
  repoRoot: path.join(__dirname),
  baseBranch: "main",
});

// ─── Model Provider Endpoints ────────────────────────────────────────

app.get("/api/ide/models", (req, res) => {
  const filter = {};
  if (req.query.tier) filter.tier = req.query.tier;
  if (req.query.capability) filter.capability = req.query.capability;
  res.json({
    models: headyModelProvider.listModels(filter),
    active: headyModelProvider.activeModel,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/ide/models/:modelId", (req, res) => {
  const model = headyModelProvider.getModel(req.params.modelId);
  if (!model) return res.status(404).json({ error: `Model '${req.params.modelId}' not found` });
  res.json(model);
});

app.post("/api/ide/models/select", (req, res) => {
  const { modelId } = req.body;
  if (!modelId) return res.status(400).json({ error: "modelId required" });
  const result = headyModelProvider.selectModel(modelId);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post("/api/ide/models/route", async (req, res) => {
  const { type, payload } = req.body;
  if (!type) return res.status(400).json({ error: "type required" });
  const result = await headyModelProvider.routeRequest({ type, payload });
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.get("/api/ide/models/capability/:capability", (req, res) => {
  res.json({
    capability: req.params.capability,
    models: headyModelProvider.getModelsForCapability(req.params.capability),
  });
});

app.get("/api/ide/stats", (req, res) => {
  res.json({
    modelProvider: headyModelProvider.getStats(),
    arena: arenaMergeEngine.getStats(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Arena Merge Engine Endpoints ────────────────────────────────────

app.post("/api/ide/arena/create", (req, res) => {
  const { task, models } = req.body;
  if (!task || !task.description) return res.status(400).json({ error: "task.description required" });
  if (!models || !Array.isArray(models) || models.length < 1) {
    return res.status(400).json({ error: "models array required (min 1)" });
  }
  const session = arenaMergeEngine.createSession(task, models);
  res.json({ session: { id: session.id, state: session.state, models: session.models.length } });
});

app.post("/api/ide/arena/:sessionId/setup", async (req, res) => {
  try {
    const result = await arenaMergeEngine.setupBranches(req.params.sessionId);
    if (result.error) return res.status(404).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ide/arena/:sessionId/record", async (req, res) => {
  const { modelId, workResult } = req.body;
  if (!modelId) return res.status(400).json({ error: "modelId required" });
  const result = await arenaMergeEngine.recordModelWork(req.params.sessionId, modelId, workResult || {});
  if (result.error) return res.status(404).json(result);
  res.json(result);
});

app.post("/api/ide/arena/:sessionId/evaluate", async (req, res) => {
  try {
    const result = await arenaMergeEngine.evaluateBranches(req.params.sessionId);
    if (result.error) return res.status(404).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ide/arena/:sessionId/merge", async (req, res) => {
  try {
    const result = await arenaMergeEngine.executeMerge(req.params.sessionId, req.body);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ide/arena/:sessionId/cleanup", async (req, res) => {
  const result = await arenaMergeEngine.cleanup(req.params.sessionId);
  if (result.error) return res.status(404).json(result);
  res.json(result);
});

app.get("/api/ide/arena/:sessionId", (req, res) => {
  const session = arenaMergeEngine.getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
});

app.get("/api/ide/arena", (req, res) => {
  const filter = {};
  if (req.query.state) filter.state = req.query.state;
  res.json({
    sessions: arenaMergeEngine.listSessions(filter),
    stats: arenaMergeEngine.getStats(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/ide/arena/history/all", (req, res) => {
  res.json({ history: arenaMergeEngine.getHistory() });
});

// ═══════════════════════════════════════════════════════════════════════
// SCALING & READINESS
// ═══════════════════════════════════════════════════════════════════════

app.get("/api/scaling/readiness", (req, res) => {
  const mem = process.memoryUsage();
  const heapUsedPct = (mem.heapUsed / mem.heapTotal) * 100;
  const rssBytes = mem.rss;
  const uptimeSec = process.uptime();
  const healthy = heapUsedPct < 90 && rssBytes < 1.5e9;

  res.status(healthy ? 200 : 503).json({
    ready: healthy,
    pid: process.pid,
    uptime: uptimeSec,
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1e6),
      heapTotalMB: Math.round(mem.heapTotal / 1e6),
      rssMB: Math.round(rssBytes / 1e6),
      heapUsedPct: heapUsedPct.toFixed(1) + "%",
    },
    cache: cache.getStats(),
    conductorPool: conductorPool.getStats(),
    scaling: {
      clusterEnabled: process.env.HEADY_CLUSTER !== "false",
      redisConnected: cache.redis !== null,
      workerPid: process.pid,
    },
    timestamp: new Date().toISOString(),
  });
});

// Liveness probe (lightweight, no deps)
app.get("/api/scaling/liveness", (req, res) => {
  res.status(200).json({ alive: true, pid: process.pid });
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
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Orchestrator:${r} ${y}SoulOrchestrator v2.0${r} ${d}┃ DAG ┃ Parallel${r}      ${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Modules:${r}      ${d}Gateway ┃ Sessions ┃ Drift ┃ Chat ┃ MCP${r}  ${c}${b}║${r}`);
  console.log(`${c}${b}  ║${r}  ${g}●${r} ${w}Agents:${r}       ${d}${agentList.substring(0, 46)}${r}${" ".repeat(Math.max(0, 46 - agentList.substring(0, 46).length))}${c}${b}║${r}`);
  console.log(`${c}${b}  ╚══════════════════════════════════════════════════════════════════╝${r}`);
  console.log("");

  // Auto-generate all sites on startup via SoulOrchestrator
  soulOrchestrator.executeGoal({
    type: 'generate-sites',
    description: 'Generate all 8 branded domain websites',
    priority: 'P0',
    metadata: { user_facing: true }
  }).then(report => {
    console.log(`[SoulOrchestrator] Sites generated: ${report.completed}/${report.totalTasks} tasks, ${report.utilization}% utilization`);
  }).catch(err => {
    console.error('[SoulOrchestrator] Site generation error:', err.message);
  });
});

// Graceful shutdown — shared cleanup
async function gracefulShutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);
  mcGlobal.stopAutoRun();
  soulOrchestrator.stop();
  computeCluster.stopHealthChecks();
  driftEngine.stopPeriodicScan?.();
  connectorRegistry.stopHealthChecks?.();
  if (intelligenceEngine) intelligenceEngine.stop();
  await cache.shutdown();
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
  // Force exit after 10s if connections don't close
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
