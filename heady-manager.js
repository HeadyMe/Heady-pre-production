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
