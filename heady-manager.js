#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              HEADY MANAGER UNIFIED v14.3                     ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Architecture:
 * 
 *     📥 INPUT          🔐 AUTH          🔧 PROCESS        📤 OUTPUT
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │ MCP    │─────▶│ Security │─────▶│ Route &  │─────▶│ Response │
 *    │ Request│      │ Context  │      │ Execute  │      │ + Track  │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 * 
 * Unified System:
 *  - Security, Orchestration, Auditing
 *  - File System Operations, Hugging Face Inference
 *  - MCP Protocol, Task Management, Secrets Management
 *  - Performance Monitoring & Health Tracking
 */

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const https = require('https');
// Express validator and JWT available if needed in future
const crypto = require('crypto');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
// const { spawn } = require('child_process'); // Disabled with TerminalManager
const WebSocket = require('ws');
const EventEmitter = require('events');
const Docker = require('dockerode');
const MCPInputInterceptor = require('./src/mcp_input_interceptor');
const HeadyMaid = require('./src/heady_maid');
const MCPServiceSelector = require('./src/mcp_service_selector');
const RoutingOptimizer = require('./src/routing_optimizer');
const TaskCollector = require('./src/task_collector');
const SecretsManager = require('./src/secrets_manager');
const HeadyBranding = require('./src/branding');
const HeadyEnforcer = require('./src/heady_enforcer');
const HeadyPatternRecognizer = require('./src/heady_pattern_recognizer');
const HeadyConductor = require('./src/heady_conductor');
const HeadyWorkflowDiscovery = require('./src/heady_workflow_discovery');
const HeadyLayerOrchestrator = require('./src/heady_layer_orchestrator');

// --- Environment Configuration ---
const PORT = Number(process.env.PORT || 3300);
const HEADY_API_KEY = process.env.HEADY_API_KEY || crypto.randomBytes(32).toString('hex');
// const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
// const TRUST_DOMAIN = 'headysystems.com';
// const APP_DOMAIN = 'app.headysystems.com';

// HF / AI Config
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MAX_CONCURRENCY = Number(process.env.HF_MAX_CONCURRENCY) || 4;
const DEFAULT_HF_TEXT_MODEL = process.env.HF_TEXT_MODEL || 'gpt2';
const DEFAULT_HF_EMBED_MODEL = process.env.HF_EMBED_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

// Admin / File System Config
const HEADY_ADMIN_ROOT = process.env.HEADY_ADMIN_ROOT || path.resolve(__dirname);
const HEADY_ADMIN_ALLOWED_PATHS = (process.env.HEADY_ADMIN_ALLOWED_PATHS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const HEADY_ADMIN_MAX_BYTES = Number(process.env.HEADY_ADMIN_MAX_BYTES) || 512_000;
// const HEADY_ADMIN_OP_LOG_LIMIT = Number(process.env.HEADY_ADMIN_OP_LOG_LIMIT) || 2000;
// const HEADY_ADMIN_OP_LIMIT = Number(process.env.HEADY_ADMIN_OP_LIMIT) || 50;
const HEADY_ADMIN_ENABLE_GPU = process.env.HEADY_ADMIN_ENABLE_GPU === 'true';

// GPU Config
const REMOTE_GPU_HOST = process.env.REMOTE_GPU_HOST;
const REMOTE_GPU_PORT = Number(process.env.REMOTE_GPU_PORT) || 8080;
const ENABLE_GPUDIRECT = process.env.ENABLE_GPUDIRECT === 'true';

// Security Constants
const DESTRUCTIVE_PATTERNS = ['delete', 'rm', 'drop', 'truncate', 'exec', 'shell', 'format'];
// const PHI = 1.618033988749895;

// --- Helpers from Original ---

function createSemaphore(max) {
  const usedMax = typeof max === 'number' && max > 0 ? Math.floor(max) : 1;
  let inUse = 0;
  const queue = [];

  function release() {
    inUse = Math.max(0, inUse - 1);
    const next = queue.shift();
    if (next) next();
  }

  async function acquire() {
    if (inUse < usedMax) {
      inUse += 1;
      return;
    }
    await new Promise((resolve) => queue.push(resolve));
    inUse += 1;
  }

  async function run(fn) {
    await acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }
  return { run };
}

const hfSemaphore = createSemaphore(HF_MAX_CONCURRENCY);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Hugging Face Inference (Original Logic)
async function hfInfer({ model, inputs, parameters, options, timeoutMs = 60000, maxRetries = 2 }) {
  if (!HF_TOKEN) {
    const err = new Error('HF_TOKEN is not set');
    err.code = 'HF_TOKEN_MISSING';
    throw err;
  }

  return hfSemaphore.run(async () => {
    const usedModel = model || DEFAULT_HF_TEXT_MODEL;
    const baseUrls = [
      `https://router.huggingface.co/models/${encodeURIComponent(usedModel)}`,
      `https://api-inference.huggingface.co/models/${encodeURIComponent(usedModel)}`
    ];

    const payload = { inputs };
    if (parameters !== undefined) payload.parameters = parameters;
    if (options !== undefined) payload.options = options;

    for (const baseUrl of baseUrls) {
      for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        let status;
        let data;
        try {
          const resp = await fetch(baseUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          status = resp.status;
          const text = await resp.text();
          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = text;
          }
        } catch (e) {
          // Network error or abort
          if (attempt > maxRetries) throw e;
          continue;
        } finally {
          clearTimeout(timeout);
        }

        if (status === 503 && attempt <= maxRetries) {
          const estimated = data && typeof data === 'object' ? data.estimated_time : undefined;
          const waitMs = typeof estimated === 'number' ? Math.ceil(estimated * 1000) + 250 : 1500;
          await sleep(waitMs);
          continue;
        }

        if (status < 200 || status >= 300) {
          if (status === 404 && baseUrl === baseUrls[0]) break; // Try next URL
          const message = data && typeof data === 'object' && data.error ? data.error : 'HF Inference Failed';
          const err = new Error(message);
          err.status = status;
          throw err;
        }

        return { model: usedModel, data };
      }
    }
    throw new Error('Hugging Face inference failed - all endpoints exhausted');
  });
}

function meanPool2d(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return [];
  if (!Array.isArray(matrix[0])) return []; // Already 1D?
  const rows = matrix.length;
  const cols = matrix[0].length;
  const out = new Array(cols).fill(0);
  for (const row of matrix) {
    if (!Array.isArray(row)) continue;
    for (let i = 0; i < cols; i++) out[i] += (typeof row[i] === 'number' ? row[i] : 0);
  }
  for (let i = 0; i < cols; i++) out[i] = out[i] / rows;
  return out;
}

function poolFeatureExtractionOutput(output) {
  if (!Array.isArray(output)) return output;
  if (output.length === 0) return output;
  if (!Array.isArray(output[0])) return output;
  if (!Array.isArray(output[0][0])) return meanPool2d(output);
  return output.map(item => (!Array.isArray(item) || item.length === 0 || !Array.isArray(item[0])) ? item : meanPool2d(item));
}

// File System Helpers (Original Logic)
function buildAdminRoots() {
  const roots = [];
  const seen = new Set();
  const candidates = [HEADY_ADMIN_ROOT, ...HEADY_ADMIN_ALLOWED_PATHS];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const resolved = path.resolve(candidate);
    const key = process.platform === 'win32' ? resolved.toLowerCase() : resolved;
    if (seen.has(key)) continue;
    seen.add(key);
    roots.push({
      id: `root-${roots.length + 1}`,
      path: resolved,
      label: path.basename(resolved) || resolved,
      exists: fs.existsSync(resolved),
    });
  }
  return roots;
}

const ADMIN_ROOTS = buildAdminRoots();

function assertAdminRoot(rootParam) {
  if (!ADMIN_ROOTS.length) throw { status: 500, message: 'No admin roots configured' };
  const root = rootParam ? (ADMIN_ROOTS.find(r => r.id === rootParam || r.path === rootParam)) : ADMIN_ROOTS[0];
  if (!root) throw { status: 400, message: 'Invalid root' };
  if (!root.exists) throw { status: 404, message: 'Root not found' };
  return root;
}

function resolveAdminPath(rootPath, relPath = '') {
  if (typeof relPath !== 'string') throw { status: 400, message: 'Path must be string' };
  if (relPath.includes('\0')) throw { status: 400, message: 'Invalid path' };
    
  const resolvedRoot = path.resolve(rootPath);
  const resolved = path.resolve(resolvedRoot, relPath);
    
  // Security check: prevent directory traversal outside root
  const rootWithSep = resolvedRoot.endsWith(path.sep) ? resolvedRoot : `${resolvedRoot}${path.sep}`;
  if (!resolved.startsWith(rootWithSep)) {
    throw { status: 403, message: 'Path traversal denied' };
  }
  return resolved;
}

function toRelativePath(rootPath, targetPath) {
  const rel = path.relative(rootPath, targetPath);
  return rel ? rel.split(path.sep).join('/') : '';
}

function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// --- Managers from Enhanced ---

// MCP Client Manager
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

class McpClientManager {
  constructor() {
    this.clients = new Map();
    this.configPath = path.join(__dirname, 'mcp_config.json');
  }

  async loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      console.warn('[MCP] No config found at', this.configPath);
      return {};
    }
    const raw = await fsp.readFile(this.configPath, 'utf8');
    // Simple env var substitution
    const substituted = raw.replace(/\$\{([^}]+)\}/g, (_, key) => process.env[key] || '');
    return JSON.parse(substituted);
  }

  async connectToServer(name, config) {
    try {
      console.log(`[MCP] Connecting to ${name}...`);
            
      // Handle Windows npx quirk
      let command = config.command;
      if (process.platform === 'win32' && command === 'npx') {
        command = 'npx.cmd';
      }

      const transport = new StdioClientTransport({
        command: command,
        args: config.args || [],
        env: { ...process.env, ...config.env }
      });

      const client = new Client({
        name: 'heady-manager-client',
        version: '1.0.0',
      }, {
        capabilities: {}
      });

      await client.connect(transport);
      this.clients.set(name, { client, transport, config });
      console.log(`[MCP] Connected to ${name}`);
      return true;
    } catch (error) {
      console.error(`[MCP] Failed to connect to ${name}:`, error.message);
      return false;
    }
  }

  async initialize() {
    const config = await this.loadConfig();
    const servers = config.mcpServers || {};
        
    for (const [name, serverConfig] of Object.entries(servers)) {
      // Connect to core MCP servers including heady-router, cleanup, and monorepo services
      if (['heady-router', 'filesystem', 'memory', 'sequential-thinking', 'git', 'heady-cleanup', 'heady-monorepo', 'heady-brain'].includes(name)) {
        // Fix filesystem args for this environment if needed
        if (name === 'filesystem') {
          // Update args to point to current dir if generic /workspaces is used
          const newArgs = serverConfig.args.map(arg => 
            arg === '/workspaces' || arg === '/shared' ? process.cwd() : arg
          );
          serverConfig.args = newArgs;
        }
        await this.connectToServer(name, serverConfig);
      }
    }
  }

  async listTools() {
    const allTools = [];
    for (const [name, { client }] of this.clients.entries()) {
      try {
        const result = await client.listTools();
        const tools = result.tools.map(t => ({ ...t, server: name }));
        allTools.push(...tools);
      } catch (e) {
        console.error(`[MCP] Error listing tools for ${name}:`, e.message);
      }
    }
    return allTools;
  }

  async callTool(serverName, toolName, args) {
    const server = this.clients.get(serverName);
    if (!server) throw new Error(`Server ${serverName} not found`);
    return await server.client.callTool({
      name: toolName,
      arguments: args
    });
  }

  /**
   * Route file read through MCP
   */
  async readFileMCP(filePath) {
    try {
      // Try heady-windsurf-router first for full observability
      if (this.clients.has('heady-windsurf-router')) {
        const result = await this.callTool('heady-windsurf-router', 'heady_read_file', { file_path: filePath });
        const data = JSON.parse(result.content[0].text);
        return data.content;
      }
      // Fallback to filesystem server
      if (this.clients.has('filesystem')) {
        const result = await this.callTool('filesystem', 'read_file', { path: filePath });
        return result.content[0].text;
      }
      // Last resort: direct fs
      return await fsp.readFile(filePath, 'utf8');
    } catch (err) {
      console.warn(`[MCP] File read routing failed, using direct: ${err.message}`);
      return await fsp.readFile(filePath, 'utf8');
    }
  }

  /**
   * Route file write through MCP
   */
  async writeFileMCP(filePath, content) {
    try {
      // Try heady-windsurf-router first for full observability
      if (this.clients.has('heady-windsurf-router')) {
        await this.callTool('heady-windsurf-router', 'heady_write_file', { 
          file_path: filePath, 
          content 
        });
        return;
      }
      // Fallback to filesystem server
      if (this.clients.has('filesystem')) {
        await this.callTool('filesystem', 'write_file', { path: filePath, content });
        return;
      }
      // Last resort: direct fs
      await fsp.writeFile(filePath, content, 'utf8');
    } catch (err) {
      console.warn(`[MCP] File write routing failed, using direct: ${err.message}`);
      await fsp.writeFile(filePath, content, 'utf8');
    }
  }

  /**
   * Route command execution through MCP
   */
  async runCommandMCP(command, options = {}) {
    try {
      // Route through heady-windsurf-router for governance
      if (this.clients.has('heady-windsurf-router')) {
        const result = await this.callTool('heady-windsurf-router', 'heady_run_command', {
          command,
          cwd: options.cwd || process.cwd(),
          require_approval: options.requireApproval !== false
        });
        const data = JSON.parse(result.content[0].text);
        return data.output;
      }
      // Fallback: direct execution (not recommended)
      console.warn('[MCP] Command routing unavailable, executing directly');
      const { execSync } = require('child_process');
      return execSync(command, {
        cwd: options.cwd || process.cwd(),
        encoding: 'utf8'
      });
    } catch (err) {
      throw new Error(`Command execution failed: ${err.message}`);
    }
  }

  async closeAll() {
    for (const [name, { client, transport }] of this.clients.entries()) {
      try {
        console.log(`[MCP] Closing connection to ${name}...`);
        await client.close();
        await transport.close();
      } catch (e) {
        console.error(`[MCP] Error closing ${name}:`, e.message);
      }
    }
    this.clients.clear();
  }
}

class SecurityContextManager {
  constructor() {
    this.contexts = new Map();
    this.nonces = new Map();
    this.attestations = new Map();
  }

  generateNonce() {
    const nonce = crypto.randomBytes(32).toString('hex');
    this.nonces.set(nonce, Date.now() + 60000);
    return nonce;
  }

  verifyNonce(nonce) {
    if (!this.nonces.has(nonce)) return false;
    if (Date.now() > this.nonces.get(nonce)) {
      this.nonces.delete(nonce);
      return false;
    }
    this.nonces.delete(nonce);
    return true;
  }

  createContext(userId, sessionId, hardwareToken = null) {
    const context = {
      userId,
      sessionId,
      hardwareToken,
      attestationState: hardwareToken ? 'verified' : 'unverified',
      timestamp: new Date().toISOString(),
      nonce: this.generateNonce()
    };
    this.contexts.set(sessionId, context);
    return context;
  }

  calculateRiskScore(operation, resource) {
    let score = 0;
    for (const pattern of DESTRUCTIVE_PATTERNS) {
      if (operation.toLowerCase().includes(pattern)) score += 30;
    }
    if (resource.includes('system') || resource.includes('admin')) score += 25;
    if (resource.includes('config') || resource.includes('secret')) score += 20;
    return Math.min(score, 100);
  }

  async authorizeOperation(context, operation, resource) {
    const riskScore = this.calculateRiskScore(operation, resource);
    // Simple authorization policy for now
    return { authorized: true, riskScore };
  }

  cleanupExpiredNonces() {
    const now = Date.now();
    for (const [nonce, expiry] of this.nonces.entries()) {
      if (now > expiry) this.nonces.delete(nonce);
    }
  }
}

class OrchestrationManager extends EventEmitter {
  constructor() {
    super();
    this.nodes = new Map();
    this.metrics = [];
    this.scalingHistory = [];
    this.minNodes = parseInt(process.env.MIN_NODES || '1');
    this.maxNodes = parseInt(process.env.MAX_NODES || '10');
        
    this.startMonitoring();
  }

  async provisionNode(nodeType = 'worker') {
    const nodeId = `${nodeType}-${crypto.randomBytes(4).toString('hex')}`;
    const node = {
      id: nodeId,
      type: nodeType,
      state: 'initializing',
      createdAt: new Date().toISOString(),
      health: 100,
      metrics: { cpu: 0, memory: 0, requests: 0, errors: 0 }
    };
    this.nodes.set(nodeId, node);
    setTimeout(() => {
      node.state = 'healthy';
      this.emit('nodeProvisioned', node);
    }, 2000);
    return node;
  }

  async deprovisionNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    node.state = 'draining';
    setTimeout(() => {
      this.nodes.delete(nodeId);
      this.emit('nodeDeprovisioned', nodeId);
    }, 5000);
  }

  async performHealthCheck(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return;
        
    // Simulating metrics update
    node.health = Math.max(0, Math.min(100, node.health + (Math.random() > 0.5 ? 1 : -1)));
    if (node.health < 30) node.state = 'unhealthy';
    else if (node.health < 60) node.state = 'degraded';
    else node.state = 'healthy';
  }

  getClusterStatus() {
    const nodes = Array.from(this.nodes.values());
    const totalHealth = nodes.reduce((acc, n) => acc + n.health, 0);
    return {
      nodeCount: nodes.length,
      avgHealth: nodes.length ? totalHealth / nodes.length : 0,
      nodes: nodes.map(n => ({ ...n })),
      scalingHistory: this.scalingHistory.slice(-10)
    };
  }

  startMonitoring() {
    this.monitorInterval = setInterval(async () => {
      for (const nodeId of this.nodes.keys()) await this.performHealthCheck(nodeId);
    }, 10000);
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }
}

class AuditLogger {
  constructor() {
    this.logPath = path.join(__dirname, 'audit_logs');
    this.chainHash = null;
    fs.mkdirSync(this.logPath, { recursive: true });
  }

  createEvidenceEntry(event) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      previousHash: this.chainHash || 'genesis'
    };
    const entryJson = JSON.stringify(entry);
    const entryHash = crypto.createHash('sha256').update(entryJson).digest('hex');
    entry.hash = entryHash;
    this.chainHash = entryHash;
    return entry;
  }

  async logSecurityEvent(eventType, context, details) {
    const event = { type: eventType, context, details };
    const entry = this.createEvidenceEntry(event);
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logPath, `audit_${date}.jsonl`);
    try {
      await fsp.appendFile(logFile, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error('Audit Log Error:', e);
    }
    return entry.hash;
  }
}

/* Disabled - not currently used
class TerminalManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(ws, id) {
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
    const pty = spawn(shell, [], {
      env: process.env,
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'] // stdin, stdout, stderr
    });

    const session = { id, pty, ws };
    this.sessions.set(id, session);

    // Handle output
    pty.stdout.on('data', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'term_out', id, data: data.toString() }));
      }
    });

    pty.stderr.on('data', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'term_out', id, data: data.toString() }));
      }
    });

    pty.on('exit', (code) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'term_exit', id, code }));
      }
      this.sessions.delete(id);
    });

    return session;
  }

  handleInput(id, data) {
    const session = this.sessions.get(id);
    if (session && session.pty) {
      try {
        session.pty.stdin.write(data);
      } catch (e) {
        console.error(`[Terminal] Write error: ${e.message}`);
      }
    }
  }

  resize(_id, _cols, _rows) {
    // Without node-pty, true resizing is limited, but we stub it here
    // to support the interface.
  }

  close(id) {
    const session = this.sessions.get(id);
    if (session && session.pty) {
      session.pty.kill();
      this.sessions.delete(id);
    }
  }
}
*/

// --- App Initialization ---

const app = express();
const securityManager = new SecurityContextManager();
const headyOrchestrator = new OrchestrationManager();
const auditLogger = new AuditLogger();
const mcpManager = new McpClientManager();
// const terminalManager = new TerminalManager();
const serviceSelector = new MCPServiceSelector(mcpManager);
const routingOptimizer = new RoutingOptimizer(mcpManager, serviceSelector);
const taskCollector = new TaskCollector({ rootDirs: [__dirname] });
const secretsManager = new SecretsManager();
const branding = new HeadyBranding();
const headyEnforcer = new HeadyEnforcer({ rootDir: __dirname, autoFix: true });
const headyPatternRecognizer = new HeadyPatternRecognizer({ rootDir: __dirname });
const headyConductor = new HeadyConductor({ rootDir: __dirname, autoCreateTasks: true });
const headyWorkflowDiscovery = new HeadyWorkflowDiscovery({ autoIntegrate: false });
const layerOrchestrator = new HeadyLayerOrchestrator();

// Initialize MCP (Async) - Moved to startServer or main execution
// mcpManager.initialize().catch(err => console.error('[MCP] Init failed:', err));

// Performance Optimization: Gzip Compression
app.use(compression());

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for local dev/inline scripts ease
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow all for dev, or restrict based on env
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 60000,
  max: 200,
  message: { error: 'Too many requests' }
});
app.use('/api/', generalLimiter);

// Auth Middleware
const authenticate = async (req, res, next) => {
  // For now, allow if HEADY_API_KEY matches or if in dev mode with no key set
  const apiKey = req.headers['x-heady-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
  // Strict check if env var is set
  if (HEADY_API_KEY && apiKey !== HEADY_API_KEY) {
    await auditLogger.logSecurityEvent('auth_failure', { ip: req.ip }, { reason: 'Invalid API key' });
    return res.status(401).json({ error: 'Unauthorized' });
  }
    
  const sessionId = crypto.randomBytes(16).toString('hex');
  req.securityContext = securityManager.createContext(
    req.headers['x-user-id'] || 'anonymous',
    sessionId
  );
  next();
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// HTTP error helper
function createHttpError(status, message, details = {}) {
  const error = new Error(message);
  error.status = status;
  Object.assign(error, details);
  return error;
}

// HTTP request helper for environments without native fetch
function httpRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const httpModule = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = httpModule.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: async () => JSON.parse(data)
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// --- API Routes ---

// Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'heady-manager-unified',
    version: '14.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    orchestration: headyOrchestrator.getClusterStatus(),
    env: {
      has_hf_token: !!HF_TOKEN,
      has_api_key: !!HEADY_API_KEY
    }
  });
});

app.get('/api/pulse', async (req, res) => {
  const docker = new Docker();
  let dockerInfo = { ok: false };
  try {
    const version = await docker.version();
    dockerInfo = { ok: true, version };
  } catch (e) {
    dockerInfo = { ok: false, error: e.message };
  }
  res.json({ ok: true, timestamp: new Date().toISOString(), docker: dockerInfo });
});

// Admin File System Operations (Restored)
app.use('/api/admin', authenticate);

app.get('/api/admin/roots', asyncHandler(async (req, res) => {
  res.json({ ok: true, roots: ADMIN_ROOTS });
}));

app.get('/api/admin/files', asyncHandler(async (req, res) => {
  const root = assertAdminRoot(req.query.root);
  const relPath = req.query.path || '';
  const targetPath = resolveAdminPath(root.path, relPath);
    
  const stat = await fsp.stat(targetPath);
  if (!stat.isDirectory()) throw { status: 400, message: 'Not a directory' };
    
  const entries = await fsp.readdir(targetPath, { withFileTypes: true });
  const items = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(targetPath, entry.name);
    const entryStat = await fsp.stat(fullPath);
    return {
      name: entry.name,
      path: toRelativePath(root.path, fullPath),
      type: entry.isDirectory() ? 'directory' : 'file',
      size: entryStat.size,
      mtime: entryStat.mtime.toISOString()
    };
  }));
    
  items.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1));
    
  res.json({ ok: true, root, path: toRelativePath(root.path, targetPath), entries: items });
}));

app.get('/api/admin/file', asyncHandler(async (req, res) => {
  const relPath = req.query.path;
  if (!relPath) throw { status: 400, message: 'Path required' };
    
  const root = assertAdminRoot(req.query.root);
  const targetPath = resolveAdminPath(root.path, relPath);
  const stat = await fsp.stat(targetPath);
    
  if (!stat.isFile()) throw { status: 400, message: 'Not a file' };
  if (stat.size > HEADY_ADMIN_MAX_BYTES) throw { status: 413, message: 'File too large' };
    
  // Route through MCP for observability
  const content = await mcpManager.readFileMCP(targetPath);
  const buffer = Buffer.from(content, 'utf8');
  if (buffer.includes(0)) throw { status: 415, message: 'Binary files not supported' };
    
  res.json({
    ok: true,
    root,
    path: toRelativePath(root.path, targetPath),
    bytes: stat.size,
    mtime: stat.mtime.toISOString(),
    sha: hashBuffer(buffer),
    content,
    routed_via: 'mcp'
  });
}));

app.post('/api/admin/file', asyncHandler(async (req, res) => {
  const { root: rootParam, path: relPath, content } = req.body;
  if (!relPath || typeof content !== 'string') throw { status: 400, message: 'Path and content required' };
    
  const root = assertAdminRoot(rootParam);
  const targetPath = resolveAdminPath(root.path, relPath);
    
  // Route through MCP for observability and governance
  await mcpManager.writeFileMCP(targetPath, content);
  await auditLogger.logSecurityEvent('file_write', req.securityContext, { path: targetPath });
    
  res.json({ ok: true, path: relPath, size: content.length, routed_via: 'mcp' });
}));

app.delete('/api/admin/file', asyncHandler(async (req, res) => {
  const { root: rootParam, path: relPath } = req.body;
  if (!relPath) throw { status: 400, message: 'Path required' };
    
  const root = assertAdminRoot(rootParam);
  const targetPath = resolveAdminPath(root.path, relPath);
    
  await fsp.rm(targetPath, { recursive: true, force: true });
  await auditLogger.logSecurityEvent('file_delete', req.securityContext, { path: targetPath });
    
  res.json({ ok: true, path: relPath });
}));

app.post('/api/admin/file/move', asyncHandler(async (req, res) => {
  const { root: rootParam, oldPath, newPath } = req.body;
  if (!oldPath || !newPath) throw { status: 400, message: 'Both oldPath and newPath required' };
    
  const root = assertAdminRoot(rootParam);
  const sourcePath = resolveAdminPath(root.path, oldPath);
  const destPath = resolveAdminPath(root.path, newPath);
    
  await fsp.rename(sourcePath, destPath);
  await auditLogger.logSecurityEvent('file_move', req.securityContext, { from: sourcePath, to: destPath });
    
  res.json({ ok: true, oldPath, newPath });
}));

// Admin Ops (Mocked for safety/simplicity in Unified)
app.post('/api/admin/build', asyncHandler(async (req, res) => {
  // In a real scenario, spawn the build script. Here we mock success for the UI demo.
  await auditLogger.logSecurityEvent('build_triggered', req.securityContext, {});
  res.json({ ok: true, op: { id: 'op_build_mock', status: 'success' }, streamUrl: null });
}));

// Orchestration Endpoints
app.post('/api/orchestration/provision', authenticate, asyncHandler(async (req, res) => {
  const { nodeType } = req.body;
  const node = await headyOrchestrator.provisionNode(nodeType || 'worker');
  await auditLogger.logSecurityEvent('node_provisioned', req.securityContext, { nodeId: node.id, type: node.type });
  res.json({ ok: true, node });
}));

app.post('/api/orchestration/deprovision', authenticate, asyncHandler(async (req, res) => {
  const { nodeId } = req.body;
  if (!nodeId) throw { status: 400, message: 'nodeId required' };
  await headyOrchestrator.deprovisionNode(nodeId);
  await auditLogger.logSecurityEvent('node_deprovisioned', req.securityContext, { nodeId });
  res.json({ ok: true, nodeId });
}));

app.post('/api/admin/audit', asyncHandler(async (req, res) => {
  await auditLogger.logSecurityEvent('audit_triggered', req.securityContext, {});
  res.json({ ok: true, op: { id: 'op_audit_mock', status: 'success' }, streamUrl: null });
}));

// AI / Hugging Face Endpoints
app.post('/api/admin/gpu/infer', asyncHandler(async (req, res) => {
  if (!HEADY_ADMIN_ENABLE_GPU) {
    throw createHttpError(503, 'GPU features are disabled');
  }
  const { inputs, model, parameters } = req.body || {};
  if (!inputs) throw createHttpError(400, 'inputs is required');

  // If REMOTE_GPU_HOST is configured, proxy the request
  if (REMOTE_GPU_HOST) {
    const port = REMOTE_GPU_PORT ? `:${REMOTE_GPU_PORT}` : '';
    const protocol = REMOTE_GPU_HOST.startsWith('http') ? '' : 'http://';
    const url = `${protocol}${REMOTE_GPU_HOST}${port}/infer`;
        
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout
            
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || ''
        },
        body: JSON.stringify({ inputs, model, parameters }),
        signal: controller.signal
      });
      clearTimeout(timeout);
            
      if (!resp.ok) {
        const text = await resp.text();
        throw createHttpError(resp.status, `Remote GPU error: ${text}`);
      }
            
      const data = await resp.json();
      res.json({ ok: true, backend: 'remote-gpu', ...data });
    } catch (e) {
      console.error('[GPU] Remote inference failed:', e);
      throw createHttpError(502, `GPU Inference Failed: ${e.message}`);
    }
  } else {
    // Fallback Stub
    res.json({
      ok: true,
      backend: 'remote-gpu-stub',
      model: model || 'gpu-stub',
      result: { outputs: inputs, gpu: true, rdma: ENABLE_GPUDIRECT, note: 'Configure REMOTE_GPU_HOST for actual inference' },
    });
  }
}));

app.post('/api/hf/generate', authenticate, asyncHandler(async (req, res) => {
  const { prompt, model, parameters, options } = req.body;
  if (!prompt) throw { status: 400, message: 'Prompt required' };
    
  const result = await hfInfer({ model: model || DEFAULT_HF_TEXT_MODEL, inputs: prompt, parameters, options });
  let output;
  const data = result.data;
  if (Array.isArray(data) && data[0]?.generated_text) output = data[0].generated_text;
    
  res.json({ ok: true, model: result.model, output, raw: data });
}));

app.post('/api/hf/embed', authenticate, asyncHandler(async (req, res) => {
  const { text, model, options } = req.body;
  if (!text) throw { status: 400, message: 'Text required' };
    
  const result = await hfInfer({ model: model || DEFAULT_HF_EMBED_MODEL, inputs: text, options });
  const embeddings = poolFeatureExtractionOutput(result.data);
  res.json({ ok: true, model: result.model, embeddings, raw: result.data });
}));

// MCP Endpoints
app.get('/api/mcp/servers', authenticate, asyncHandler(async (req, res) => {
  const servers = Array.from(mcpManager.clients.keys()).map(name => ({
    name,
    status: 'connected'
  }));
  res.json({ ok: true, servers });
}));

app.get('/api/mcp/tools', authenticate, asyncHandler(async (req, res) => {
  const tools = await mcpManager.listTools();
  res.json({ ok: true, tools });
}));

app.post('/api/mcp/call', authenticate, asyncHandler(async (req, res) => {
  const { server, tool, args } = req.body;
  if (!server || !tool) throw { status: 400, message: 'Server and tool name required' };
    
  const result = await mcpManager.callTool(server, tool, args || {});
  await auditLogger.logSecurityEvent('mcp_tool_call', req.securityContext, { server, tool });
    
  res.json({ ok: true, result });
}));

app.get('/api/mcp/routing-stats', authenticate, asyncHandler(async (req, res) => {
  // Get MCP server status
  const servers = Array.from(mcpManager.clients.keys()).map(name => ({
    name,
    status: 'connected',
    hasHeadyMaid: name === 'heady-windsurf-router' && !!mcpManager.headyMaidInstance
  }));
  
  // Get routing optimizer analytics
  const analytics = routingOptimizer.getAnalytics();
  const recentDecisions = routingOptimizer.getRecentDecisions(10);
  
  res.json({
    ok: true,
    routing: {
      servers,
      headyMaidIntegrated: !!mcpManager.headyMaidInstance,
      routingActive: servers.length > 0,
      optimizer: analytics,
      recentDecisions,
      taskManagement: {
        queuedTasks: analytics.queueSizes,
        totalQueued: analytics.queueSizes.high + analytics.queueSizes.normal + analytics.queueSizes.low
      }
    },
    timestamp: new Date().toISOString()
  });
}));

app.get('/api/tasks/queued', authenticate, asyncHandler(async (req, res) => {
  const analytics = routingOptimizer.getAnalytics();
  
  res.json({
    ok: true,
    tasks: {
      high: routingOptimizer.taskQueues.high,
      normal: routingOptimizer.taskQueues.normal,
      low: routingOptimizer.taskQueues.low,
      summary: analytics.queueSizes
    },
    timestamp: new Date().toISOString()
  });
}));

app.get('/api/tasks/collected', authenticate, asyncHandler(async (req, res) => {
  const tasks = taskCollector.getAllTasks();
  const metrics = taskCollector.getMetrics();
  
  res.json({
    ok: true,
    tasks,
    metrics,
    sources: Array.from(taskCollector.taskSources.keys())
  });
}));

// Secrets Management Endpoints
app.post('/api/secrets/ingest', authenticate, asyncHandler(async (req, res) => {
  const { name, value, source } = req.body;
  
  if (!name || !value) {
    throw { status: 400, message: 'Name and value required' };
  }
  
  await secretsManager.storeSecret(name, value);
  await auditLogger.logSecurityEvent('secret_ingested', req.securityContext, { secretName: name, source });
  
  res.json({ ok: true, message: `Secret '${name}' stored securely` });
}));

app.post('/api/secrets/ingest-env', authenticate, asyncHandler(async (req, res) => {
  const { filepath } = req.body;
  
  if (!filepath) {
    throw { status: 400, message: 'Filepath required' };
  }
  
  const count = await secretsManager.ingestFromEnvFile(filepath);
  await auditLogger.logSecurityEvent('secrets_bulk_ingested', req.securityContext, { filepath, count });
  
  res.json({ ok: true, count, message: `Ingested ${count} secrets` });
}));

app.get('/api/secrets/list', authenticate, asyncHandler(async (req, res) => {
  const secrets = await secretsManager.listSecrets();
  
  res.json({ ok: true, secrets, count: secrets.length });
}));

app.post('/api/secrets/inject', authenticate, asyncHandler(async (req, res) => {
  const count = await secretsManager.injectIntoEnvironment();
  await auditLogger.logSecurityEvent('secrets_injected_to_env', req.securityContext, { count });
  
  res.json({ ok: true, count, message: `Injected ${count} secrets into environment` });
}));

// HeadyEnforcer Endpoints
app.get('/api/enforcer/status', authenticate, asyncHandler(async (req, res) => {
  const status = headyEnforcer.getStatus();
  res.json({ ok: true, status });
}));

app.get('/api/enforcer/report', authenticate, asyncHandler(async (req, res) => {
  const report = headyEnforcer.generateReport();
  res.json({ ok: true, report });
}));

app.post('/api/enforcer/heal', authenticate, asyncHandler(async (req, res) => {
  const fixed = await headyEnforcer.autoHeal();
  await auditLogger.logSecurityEvent('auto_heal_executed', req.securityContext, { fixed });
  
  res.json({ ok: true, fixed, message: `Auto-healed ${fixed} violations` });
}));

app.post('/api/enforcer/enforce', authenticate, asyncHandler(async (req, res) => {
  const result = await headyEnforcer.performFullEnforcement();
  res.json({ ok: true, result });
}));

// HeadyPatternRecognizer Endpoints
app.get('/api/patterns/statistics', authenticate, asyncHandler(async (req, res) => {
  const stats = headyPatternRecognizer.getStatistics();
  res.json({ ok: true, stats });
}));

app.get('/api/patterns/report', authenticate, asyncHandler(async (req, res) => {
  const report = headyPatternRecognizer.getReport();
  res.json({ ok: true, report });
}));

// HeadyConductor Endpoints
app.get('/api/conductor/status', authenticate, asyncHandler(async (req, res) => {
  const status = headyConductor.getStatus();
  res.json({ ok: true, status });
}));

app.get('/api/conductor/report', authenticate, asyncHandler(async (req, res) => {
  const report = headyConductor.getReport();
  res.json({ ok: true, report });
}));

// HeadyWorkflowDiscovery Endpoints
app.get('/api/workflows/report', authenticate, asyncHandler(async (req, res) => {
  const report = headyWorkflowDiscovery.getReport();
  res.json({ ok: true, report });
}));

app.get('/api/workflows/recommendations', authenticate, asyncHandler(async (req, res) => {
  const recommendations = headyWorkflowDiscovery.getTopRecommendations(10);
  res.json({ ok: true, recommendations });
}));

// Layer Orchestrator Endpoints
app.get('/api/ui/:uiName/layers', authenticate, asyncHandler(async (req, res) => {
  const { uiName } = req.params;
  const result = await layerOrchestrator.loadLayersForUI(uiName);
  
  res.json({
    ok: true,
    ui: uiName,
    layers: result.loaded || result.layers,
    loadTime: result.results ? result.results.reduce((sum, r) => sum + (r.loadTime || 0), 0) : 0,
    alreadyLoaded: result.alreadyLoaded || false
  });
}));

app.get('/api/layers/status', authenticate, asyncHandler(async (req, res) => {
  const status = layerOrchestrator.getLayerStatus();
  res.json({ ok: true, status });
}));

app.get('/api/layers/map', authenticate, asyncHandler(async (req, res) => {
  const map = layerOrchestrator.getUILayerMap();
  res.json({ ok: true, map });
}));

// MCP Service Selection Endpoints
app.get('/api/mcp/services', authenticate, asyncHandler(async (req, res) => {
  const services = serviceSelector.listServices();
  res.json({ ok: true, services });
}));

app.get('/api/mcp/presets', authenticate, asyncHandler(async (req, res) => {
  const presets = serviceSelector.listPresets();
  res.json({ ok: true, presets });
}));

app.post('/api/mcp/recommend', authenticate, asyncHandler(async (req, res) => {
  const { task } = req.body;
  if (!task) throw { status: 400, message: 'Task description required' };
  
  const recommendation = serviceSelector.recommendServices(task);
  res.json({ ok: true, recommendation });
}));

app.post('/api/mcp/validate', authenticate, asyncHandler(async (req, res) => {
  const { services } = req.body;
  if (!services || !Array.isArray(services)) {
    throw { status: 400, message: 'Services array required' };
  }
  
  const validation = serviceSelector.validateCombination(services);
  res.json({ ok: true, validation });
}));

app.post('/api/mcp/select', authenticate, asyncHandler(async (req, res) => {
  const { preset, services, task } = req.body;
  
  const combination = serviceSelector.getCombination({
    preset,
    services,
    task,
    includeRecommendations: true
  });
  
  res.json({ ok: true, combination });
}));

app.post('/api/mcp/orchestrator', authenticate, asyncHandler(async (req, res) => {
  const { method, path, body, services, preset } = req.body;
  
  // Select services for this operation
  const combination = serviceSelector.getCombination({ services, preset });
  
  // Validate services are available
  if (!combination.validation.canProceed) {
    throw { 
      status: 503, 
      message: 'Required MCP services unavailable',
      missing: combination.validation.missing
    };
  }
  
  // Log service selection
  await auditLogger.logSecurityEvent('mcp_service_selection', req.securityContext, {
    selected: combination.services,
    source: combination.source,
    operation: `${method} ${path}`
  });
  
  // Route through selected services
  // For now, forward to orchestrator (future: use selected services)
  const orchestratorBases = ['http://localhost:3100', 'http://localhost:3000'];
  
  for (const base of orchestratorBases) {
    try {
      const url = `${base}${path}`;
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      // Use native fetch (Node 18+) or http module
      const response = typeof fetch !== 'undefined' ? await fetch(url, options) : await httpRequest(url, options);
      const data = await response.json();
      
      // Add routing metadata
      data._routing = {
        via: 'HeadyMCP',
        services: combination.services,
        source: combination.source
      };
      
      return res.json(data);
    } catch (error) {
      continue;
    }
  }
  
  throw { status: 503, message: 'Orchestrator unavailable' };
}));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback Error Handler
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Server Error';
  console.error(`[Error] ${status} - ${message}`, err);
  res.status(status).json({ ok: false, error: message });
});

// --- Server Start ---
let server;
let wss;
if (require.main === module) {
  // Initialize MCP Input Interceptor
  const mcpInterceptor = new MCPInputInterceptor({
    mcpGatewayUrl: 'http://localhost:3301',
    enableGovernance: true,
    enableAudit: true,
    enableHeadyMaid: true
  });

  // Initialize HeadyMaid
  const headyMaid = new HeadyMaid({
    scanInterval: 30000,
    deepScanInterval: 300000,
    rootDirs: [__dirname],
    enableRealtime: true
  });

  // Integrate HeadyMaid with interceptor
  mcpInterceptor.integrateHeadyMaid(headyMaid);

  // Apply MCP interceptor middleware FIRST (before all routes)
  app.use(mcpInterceptor.middleware());

  // Initialize HeadyMaid
  headyMaid.initialize().catch(err => console.error('[HEADY MAID] Init failed:', err));

  // Initialize MCP
  mcpManager.initialize().then(() => {
    // Integrate HeadyMaid with HeadyWindsurf Router
    const router = mcpManager.clients.get('heady-windsurf-router');
    if (router && router.client) {
      console.log('[INTEGRATION] Connecting HeadyMaid to HeadyWindsurf Router...');
      // Store HeadyMaid reference for router access
      mcpManager.headyMaidInstance = headyMaid;
      console.log('[INTEGRATION] HeadyMaid <-> HeadyWindsurf Router connected');
    }
    
    // Connect HeadyMaid tasks to RoutingOptimizer
    headyMaid.on('task-detected', (task) => {
      console.log(`[TASK ROUTING] HeadyMaid detected task: ${task.description}`);
      routingOptimizer.queueTask(task);
    });
    
    headyMaid.on('opportunities-detected', (opportunities) => {
      console.log(`[TASK ROUTING] ${Object.values(opportunities).flat().length} optimization opportunities queued`);
    });
    
    console.log('[INTEGRATION] HeadyMaid tasks connected to RoutingOptimizer');
    
    // Initialize TaskCollector
    taskCollector.start().catch(err => console.error('[TASK COLLECTOR] Init failed:', err));
    
    // Connect TaskCollector to RoutingOptimizer
    taskCollector.on('tasks-collected', (data) => {
      console.log(`[TASK ROUTING] Collected ${data.tasks.length} tasks from all nodes`);
      data.tasks.forEach(task => routingOptimizer.queueTask(task));
    });
    
    console.log('[INTEGRATION] TaskCollector connected to RoutingOptimizer');
    
    // Initialize SecretsManager
    secretsManager.initialize().catch(err => console.error('[SECRETS] Init failed:', err));
    
    // Initialize HeadyEnforcer
    headyEnforcer.start().catch(err => console.error('[ENFORCER] Init failed:', err));
    
    // Listen to enforcement events and create tasks
    headyEnforcer.on('enforcement-complete', (data) => {
      const totalViolations = Object.values(data.violations).flat().length;
      
      if (totalViolations > 0) {
        console.log(`[ENFORCER] Found ${totalViolations} violations`);
        
        // Create tasks for violations via HeadyConductor
        if (data.violations.naming.length > 0) {
          headyConductor.handlePatternChange({
            change: {
              type: 'NAMING_VIOLATIONS',
              patternName: 'Naming Conventions',
              category: 'naming',
              impact: 'HIGH',
              recommendation: `Fix ${data.violations.naming.length} naming violations`
            },
            advice: {
              actions: [
                'Run HeadyEnforcer auto-heal',
                'Review naming conventions',
                'Update documentation',
                'Commit fixes with hs'
              ]
            },
            taskRecommendation: {
              shouldCreate: true,
              task: {
                type: 'naming-fix',
                priority: 'high',
                description: `Fix ${data.violations.naming.length} naming convention violations`,
                category: 'naming',
                data: data.violations.naming.slice(0, 10) // First 10 violations
              }
            }
          });
        }
        
        if (data.violations.security.length > 0) {
          headyConductor.handlePatternChange({
            change: {
              type: 'SECURITY_VIOLATIONS',
              patternName: 'Security Standards',
              category: 'security',
              impact: 'CRITICAL',
              recommendation: `Address ${data.violations.security.length} security violations`
            },
            advice: {
              actions: [
                'Review security violations immediately',
                'Fix hardcoded secrets',
                'Add authentication where missing',
                'Update security documentation'
              ]
            },
            taskRecommendation: {
              shouldCreate: true,
              task: {
                type: 'security-fix',
                priority: 'critical',
                description: `URGENT: Fix ${data.violations.security.length} security violations`,
                category: 'security',
                data: data.violations.security
              }
            }
          });
        }
      }
    });
    
    console.log('[INTEGRATION] HeadyEnforcer active and monitoring');
    
    // Initialize HeadyPatternRecognizer
    headyPatternRecognizer.start().catch(err => console.error('[PATTERN RECOGNIZER] Init failed:', err));
    
    // Connect PatternRecognizer to Conductor
    headyPatternRecognizer.on('pattern-change', (notification) => {
      headyConductor.handlePatternChange(notification);
    });
    
    // Connect Conductor to RoutingOptimizer
    headyConductor.on('task-created', (task) => {
      console.log(`[CONDUCTOR] Created task: ${task.description}`);
      routingOptimizer.queueTask(task);
    });
    
    console.log('[INTEGRATION] HeadyPatternRecognizer → HeadyConductor → RoutingOptimizer connected');
    
    // Connect PatternRecognizer to optimization components
    headyPatternRecognizer.connectToHeadyMaid(headyMaid);
    headyPatternRecognizer.connectToRoutingOptimizer(routingOptimizer);
    headyPatternRecognizer.connectToHeadyEnforcer(headyEnforcer);
    
    console.log('[INTEGRATION] HeadyPatternRecognizer connected to all optimization components');
    
    // Initialize HeadyWorkflowDiscovery
    headyWorkflowDiscovery.start().catch(err => console.error('[WORKFLOW DISCOVERY] Init failed:', err));
    
    // Connect WorkflowDiscovery to Conductor
    headyWorkflowDiscovery.on('workflow-discovered', (notification) => {
      console.log(`[WORKFLOW DISCOVERY] Found: ${notification.workflow.name} (score: ${notification.workflow.score})`);
      
      // Create task for high-scoring workflows
      if (notification.workflow.score >= 80) {
        headyConductor.handlePatternChange({
          change: {
            type: 'NEW_WORKFLOW',
            patternName: notification.workflow.name,
            category: notification.workflow.category,
            impact: 'HIGH',
            recommendation: `Integrate ${notification.workflow.name}: ${notification.workflow.benefits.join(', ')}`
          },
          advice: {
            actions: notification.recommendation.steps
          },
          taskRecommendation: {
            shouldCreate: true,
            task: {
              type: 'workflow-integration',
              priority: 'high',
              description: `Integrate ${notification.workflow.name}`,
              category: notification.workflow.category,
              data: notification.workflow
            }
          }
        });
      }
    });
    
    console.log('[INTEGRATION] HeadyWorkflowDiscovery → HeadyConductor connected');
  }).catch(err => console.error('[MCP] Init failed:', err));

  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(branding.getHeadyBanner());
    console.log(`
    ║  Port: ${String(PORT).padEnd(54)}║
    ║  Nodes: ${String(headyOrchestrator.nodes.size).padEnd(53)}║
    ║  MCP Services: ${String(mcpManager.clients.size).padEnd(45)}║
    ║  Task Collector: ACTIVE${' '.padEnd(40)}║
    ║  Secrets Manager: READY${' '.padEnd(40)}║
    ╚══════════════════════════════════════════════════════════════╝
    `);
    console.log(branding.getMadeWithLove());
        
    // Init min nodes
    (async () => {
      while (headyOrchestrator.nodes.size < headyOrchestrator.minNodes) await headyOrchestrator.provisionNode();
    })();
  });

  // Initialize WebSocket server
  wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});

module.exports = { app, headyOrchestrator, securityManager, mcpManager };
