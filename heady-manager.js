// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: heady-manager.js
// LAYER: root
// 
//         _   _  _____    _    ____   __   __
//        | | | || ____|  / \  |  _ \ \ \ / /
//        | |_| ||  _|   / _ \ | | | | \ V / 
//        |  _  || |___ / ___ \| |_| |  | |  
//        |_| |_||_____/_/   \_\____/   |_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
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
app.use(express.json({ limit: "50mb" }));
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
  // Limit cache size
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
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

function readJsonFileSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
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
  res.json({ 
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
  });
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

app.get("/api/maid/config", (req, res) => {
  res.json(HEADY_MAID_CONFIG);
});

app.get("/api/maid/inventory", (req, res) => {
  const inventoryPath = path.join(__dirname, ".heady-memory", "inventory", "inventory.json");
  const inventory = readJsonFileSafe(inventoryPath);
  if (!inventory) {
    return res.status(404).json({ error: "Inventory not found or invalid" });
  }
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
    endpoints: ["/api/health", "/api/registry", "/api/maid/*", "/api/conductor/*", "/api/layer"]
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
  
  res.json({
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
  });
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
  console.log(`∞ Heady System Active on Port ${PORT} ∞`);
  console.log(`∞ Enhanced with security, caching, and performance optimizations ∞`);
  console.log(`∞ Environment: ${process.env.NODE_ENV || 'development'} ∞`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
