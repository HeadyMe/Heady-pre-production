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
// ║  FILE: backend/index.js                                           ║
// ║  LAYER: backend                                                   ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

const express = require("express");
const cors = require("cors");
const Docker = require("dockerode");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { EventEmitter } = require("events");

const fsp = fs.promises;

const PORT = Number(process.env.PORT || 3300);

const HF_TOKEN = process.env.HF_TOKEN;
const HEADY_API_KEY = process.env.HEADY_API_KEY;

const HEADY_TRUST_PROXY = process.env.HEADY_TRUST_PROXY === "true";
const HEADY_CORS_ORIGINS = (process.env.HEADY_CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const HEADY_RATE_LIMIT_WINDOW_MS = Number(process.env.HEADY_RATE_LIMIT_WINDOW_MS) || 60_000;
const HEADY_RATE_LIMIT_MAX = Number(process.env.HEADY_RATE_LIMIT_MAX) || 120;
const HF_MAX_CONCURRENCY = Number(process.env.HF_MAX_CONCURRENCY) || 4;

const HEADY_QA_BACKEND = process.env.HEADY_QA_BACKEND || "auto";
const HEADY_PYTHON_BIN = process.env.HEADY_PYTHON_BIN || "python";
const HEADY_PY_WORKER_TIMEOUT_MS = Number(process.env.HEADY_PY_WORKER_TIMEOUT_MS) || 90_000;
const HEADY_PY_MAX_CONCURRENCY = Number(process.env.HEADY_PY_MAX_CONCURRENCY) || 2;
const HEADY_QA_MAX_NEW_TOKENS = Number(process.env.HEADY_QA_MAX_NEW_TOKENS) || 256;
const HEADY_QA_MODEL = process.env.HEADY_QA_MODEL;
const HEADY_QA_MAX_QUESTION_CHARS = Number(process.env.HEADY_QA_MAX_QUESTION_CHARS) || 4000;
const HEADY_QA_MAX_CONTEXT_CHARS = Number(process.env.HEADY_QA_MAX_CONTEXT_CHARS) || 12000;

const DEFAULT_HF_TEXT_MODEL = process.env.HF_TEXT_MODEL || "gpt2";
const DEFAULT_HF_EMBED_MODEL = process.env.HF_EMBED_MODEL || "sentence-transformers/all-MiniLM-L6-v2";

const HEADY_ADMIN_ROOT = process.env.HEADY_ADMIN_ROOT || path.resolve(__dirname);
const HEADY_ADMIN_ALLOWED_PATHS = (process.env.HEADY_ADMIN_ALLOWED_PATHS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const HEADY_ADMIN_MAX_BYTES = Number(process.env.HEADY_ADMIN_MAX_BYTES) || 512_000;
const HEADY_ADMIN_OP_LOG_LIMIT = Number(process.env.HEADY_ADMIN_OP_LOG_LIMIT) || 2000;
const HEADY_ADMIN_OP_LIMIT = Number(process.env.HEADY_ADMIN_OP_LIMIT) || 50;
const HEADY_ADMIN_BUILD_SCRIPT =
  process.env.HEADY_ADMIN_BUILD_SCRIPT || path.join(__dirname, "src", "consolidated_builder.py");
const HEADY_ADMIN_AUDIT_SCRIPT = process.env.HEADY_ADMIN_AUDIT_SCRIPT || path.join(__dirname, "admin_console.py");

const HEADY_ADMIN_ENABLE_GPU = process.env.HEADY_ADMIN_ENABLE_GPU === "true";
const REMOTE_GPU_HOST = process.env.REMOTE_GPU_HOST || "";
const REMOTE_GPU_PORT = process.env.REMOTE_GPU_PORT || "";
const GPU_MEMORY_LIMIT = process.env.GPU_MEMORY_LIMIT || "";
const ENABLE_GPUDIRECT = process.env.ENABLE_GPUDIRECT === "true";

function getClientIp(req) {
  if (typeof req.ip === "string" && req.ip) return req.ip;
  if (req.socket && typeof req.socket.remoteAddress === "string" && req.socket.remoteAddress) return req.socket.remoteAddress;
  return "unknown";
}

function createRateLimiter({ windowMs, max }) {
  const usedWindowMs = typeof windowMs === "number" && windowMs > 0 ? windowMs : 60_000;
  const usedMax = typeof max === "number" && max > 0 ? max : 120;
  const hits = new Map();

  return (req, res, next) => {
    if (req.method === "OPTIONS") return next();
    if (req.path === "/health") return next();

    const now = Date.now();
    const ip = getClientIp(req);
    const existing = hits.get(ip);
    const entry = existing && now < existing.resetAt ? existing : { count: 0, resetAt: now + usedWindowMs };
    entry.count += 1;
    hits.set(ip, entry);

    res.setHeader("X-RateLimit-Limit", String(usedMax));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, usedMax - entry.count)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > usedMax) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ ok: false, error: "Rate limit exceeded", request_id: req.requestId });
    }

    if (hits.size > 10000) {
      for (const [key, value] of hits.entries()) {
        if (value && typeof value.resetAt === "number" && now >= value.resetAt) hits.delete(key);
      }
    }

    return next();
  };
}

const rateLimitApi = createRateLimiter({ windowMs: HEADY_RATE_LIMIT_WINDOW_MS, max: HEADY_RATE_LIMIT_MAX });

function createSemaphore(max) {
  const usedMax = typeof max === "number" && max > 0 ? Math.floor(max) : 1;
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
const pySemaphore = createSemaphore(HEADY_PY_MAX_CONCURRENCY);
const PY_WORKER_SCRIPT = path.join(__dirname, "python_worker", "process_data.py");
const HEADY_REGISTRY_PATH = path.join(__dirname, "heady_registry.json");

async function loadRegistry() {
  try {
    if (fs.existsSync(HEADY_REGISTRY_PATH)) {
      const data = await fsp.readFile(HEADY_REGISTRY_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load registry:", err);
  }
  return { files: {}, patterns: {}, tasks: [] };
}

async function saveRegistry(registry) {
  try {
    await fsp.writeFile(HEADY_REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save registry:", err);
  }
}

async function logFilePattern(filePath, patternData) {
  const registry = await loadRegistry();
  const fileHash = crypto.createHash("sha256").update(filePath).digest("hex");
  
  registry.files[fileHash] = {
    path: filePath,
    lastSeen: new Date().toISOString(),
    patternId: patternData.patternId,
    similarityHash: patternData.similarityHash
  };

  if (!registry.patterns[patternData.patternId]) {
    registry.patterns[patternData.patternId] = {
      description: patternData.description,
      files: []
    };
  }
  
  if (!registry.patterns[patternData.patternId].files.includes(filePath)) {
    registry.patterns[patternData.patternId].files.push(filePath);
  }

  // Similarity Check & Task Generation
  const similarFiles = Object.values(registry.files).filter(f => 
    f.path !== filePath && f.similarityHash === patternData.similarityHash
  );

  if (similarFiles.length > 0) {
    const taskId = `merge_${Date.now()}`;
    const taskExists = registry.tasks.some(t => 
      t.type === "merge_suggestion" && 
      t.files.includes(filePath) && 
      similarFiles.some(sf => t.files.includes(sf.path))
    );

    if (!taskExists) {
      registry.tasks.push({
        id: taskId,
        type: "merge_suggestion",
        status: "pending",
        files: [filePath, ...similarFiles.map(f => f.path)],
        reason: "High similarity detected in file patterns",
        createdAt: new Date().toISOString()
      });
    }
  }

  await saveRegistry(registry);
}

const app = express();
app.disable("x-powered-by");
if (HEADY_TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use((req, res, next) => {
  const id = crypto.randomUUID();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (HEADY_CORS_ORIGINS.includes("*")) return callback(null, true);
      if (HEADY_CORS_ORIGINS.length === 0) {
        if (process.env.NODE_ENV !== "production") return callback(null, true);
        return callback(null, false);
      }
      if (HEADY_CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Heady-Api-Key", "Authorization"],
    maxAge: 600,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use("/api", rateLimitApi);
app.use(express.static("public"));

function timingSafeEqualString(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function getProvidedApiKey(req) {
  const direct = req.get("x-heady-api-key");
  if (typeof direct === "string" && direct) return direct;

  const auth = req.get("authorization");
  if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (token) return token;
  }

  return undefined;
}

function requireApiKey(req, res, next) {
  if (!HEADY_API_KEY) {
    return res.status(500).json({ ok: false, error: "HEADY_API_KEY is not set" });
  }

  const provided = getProvidedApiKey(req);
  if (!provided || !timingSafeEqualString(provided, HEADY_API_KEY)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  return next();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hfInfer({ model, inputs, parameters, options, timeoutMs = 60000, maxRetries = 2 }) {
  if (!HF_TOKEN) {
    const err = new Error("HF_TOKEN is not set");
    err.code = "HF_TOKEN_MISSING";
    throw err;
  }

  return hfSemaphore.run(async () => {
    const usedModel = model || DEFAULT_HF_TEXT_MODEL;
    const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(usedModel)}`;

    const payload = { inputs };
    if (parameters !== undefined) payload.parameters = parameters;
    if (options !== undefined) payload.options = options;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      let status;
      let data;
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
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
      } finally {
        clearTimeout(timeout);
      }

      if (status === 503 && attempt <= maxRetries) {
        const estimated = data && typeof data === "object" ? data.estimated_time : undefined;
        const waitMs = typeof estimated === "number" ? Math.ceil(estimated * 1000) + 250 : 1500;
        await sleep(waitMs);
        continue;
      }

      if (status < 200 || status >= 300) {
        const message =
          data && typeof data === "object" && typeof data.error === "string" && data.error.trim()
            ? data.error
            : "Hugging Face inference failed";

        const err = new Error(message);
        err.status = status;
        err.response = data;
        throw err;
      }

      return { model: usedModel, data };
    }

    throw new Error("Hugging Face inference failed");
  });
}

function meanPool2d(matrix) {
  const rows = matrix.length;
  if (rows === 0) return [];

  const firstRow = matrix[0];
  if (!Array.isArray(firstRow) || firstRow.length === 0) return [];

  const cols = firstRow.length;
  const out = new Array(cols).fill(0);

  for (const row of matrix) {
    if (!Array.isArray(row)) continue;
    for (let i = 0; i < cols; i += 1) {
      const v = row[i];
      out[i] += typeof v === "number" ? v : 0;
    }
  }

  for (let i = 0; i < cols; i += 1) {
    out[i] = out[i] / rows;
  }

  return out;
}

function poolFeatureExtractionOutput(output) {
  if (!Array.isArray(output)) return output;
  if (output.length === 0) return output;

  if (!Array.isArray(output[0])) return output;
  if (!Array.isArray(output[0][0])) return meanPool2d(output);

  return output.map((item) => {
    if (!Array.isArray(item) || item.length === 0) return item;
    if (!Array.isArray(item[0])) return item;
    return meanPool2d(item);
  });
}

function truncateString(value, maxChars) {
  if (typeof value !== "string") return "";
  if (!Number.isFinite(maxChars) || maxChars <= 0) return value;
  if (value.length <= maxChars) return value;
  return value.slice(0, maxChars);
}

function createHttpError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  if (details !== undefined) err.details = details;
  return err;
}

function buildAdminRoots() {
  const roots = [];
  const seen = new Set();
  const candidates = [HEADY_ADMIN_ROOT, ...HEADY_ADMIN_ALLOWED_PATHS];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const resolved = path.resolve(candidate);
    const key = process.platform === "win32" ? resolved.toLowerCase() : resolved;
    if (seen.has(key)) continue;
    seen.add(key);

    const label = path.basename(resolved) || resolved;
    roots.push({
      id: `root-${roots.length + 1}`,
      path: resolved,
      label,
      exists: fs.existsSync(resolved),
    });
  }

  return roots;
}

const ADMIN_ROOTS = buildAdminRoots();
const adminOps = new Map();
let adminOpCounter = 0;

function getAdminRoot(rootParam) {
  if (!ADMIN_ROOTS.length) return null;
  if (!rootParam) return ADMIN_ROOTS[0];
  return ADMIN_ROOTS.find((root) => root.id === rootParam || root.path === rootParam) || null;
}

function assertAdminRoot(rootParam) {
  const root = getAdminRoot(rootParam);
  if (!root) {
    throw createHttpError(400, "Invalid root");
  }
  if (!root.exists) {
    throw createHttpError(404, "Root not found");
  }
  return root;
}

function resolveAdminPath(rootPath, relPath = "") {
  if (typeof relPath !== "string") {
    throw createHttpError(400, "path must be a string");
  }
  if (relPath.includes("\0")) {
    throw createHttpError(400, "Invalid path");
  }

  const resolvedRoot = path.resolve(rootPath);
  const resolved = path.resolve(resolvedRoot, relPath);
  const rootWithSep = resolvedRoot.endsWith(path.sep) ? resolvedRoot : `${resolvedRoot}${path.sep}`;

  if (resolved !== resolvedRoot && !resolved.startsWith(rootWithSep)) {
    throw createHttpError(403, "Path is outside allowed root");
  }

  return resolved;
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function toRelativePath(rootPath, targetPath) {
  const rel = path.relative(rootPath, targetPath);
  return rel ? toPosixPath(rel) : "";
}

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function classifyLogLine(line) {
  const text = line.trim();
  if (!text) return { level: "info", status: "running" };
  if (/(\bERROR\b|\bFAIL\b|✖|❌|fatal)/i.test(text)) return { level: "error", status: "error" };
  if (/(✓|✅|\bSUCCESS\b|\bOK\b)/i.test(text)) return { level: "success", status: "success" };
  if (/(warn|warning)/i.test(text)) return { level: "warn", status: "running" };
  return { level: "info", status: "running" };
}

function pushAdminLog(op, line, stream) {
  const { level, status } = classifyLogLine(line);
  const entry = {
    ts: new Date().toISOString(),
    level,
    status,
    stream,
    line,
  };
  op.logs.push(entry);
  if (op.logs.length > HEADY_ADMIN_OP_LOG_LIMIT) op.logs.shift();
  op.emitter.emit("log", entry);
  if (status === "error") op.lastError = line;
}

function finalizeAdminOp(op, status, exitCode) {
  op.status = status;
  op.exitCode = exitCode;
  op.endedAt = new Date().toISOString();
  op.emitter.emit("status", { status: op.status, exitCode });
  op.emitter.emit("end");
}

function pruneAdminOps() {
  if (adminOps.size <= HEADY_ADMIN_OP_LIMIT) return;
  const entries = Array.from(adminOps.values()).sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  while (adminOps.size > HEADY_ADMIN_OP_LIMIT) {
    const next = entries.shift();
    if (!next) break;
    if (next.status === "running") {
      entries.push(next);
      break;
    }
    adminOps.delete(next.id);
  }
}

function serializeAdminOp(op) {
  return {
    id: op.id,
    type: op.type,
    status: op.status,
    startedAt: op.startedAt,
    endedAt: op.endedAt,
    exitCode: op.exitCode,
    pid: op.pid,
    script: op.script,
    args: op.args,
    cwd: op.cwd,
    lastError: op.lastError,
  };
}

function startAdminOperation({ type, script, args, cwd }) {
  if (!fs.existsSync(script)) {
    throw createHttpError(404, `Script not found: ${script}`);
  }

  const id = `op_${Date.now()}_${++adminOpCounter}`;
  const emitter = new EventEmitter();
  emitter.setMaxListeners(0);

  const op = {
    id,
    type,
    script,
    args,
    cwd,
    status: "running",
    startedAt: new Date().toISOString(),
    endedAt: null,
    exitCode: null,
    pid: null,
    logs: [],
    emitter,
    lastError: null,
  };

  adminOps.set(id, op);
  pruneAdminOps();

  const child = spawn(HEADY_PYTHON_BIN, [script, ...args], {
    cwd,
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
    windowsHide: true,
  });

  op.pid = child.pid;

  const attachStream = (stream, streamName) => {
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();
      lines.forEach((line) => {
        if (line !== "") pushAdminLog(op, line, streamName);
      });
    });
    stream.on("end", () => {
      if (buffer.trim()) pushAdminLog(op, buffer.trim(), streamName);
    });
  };

  attachStream(child.stdout, "stdout");
  attachStream(child.stderr, "stderr");

  child.on("error", (err) => {
    pushAdminLog(op, err && err.message ? err.message : String(err), "stderr");
    finalizeAdminOp(op, "error", null);
  });

  child.on("close", (code) => {
    const status = code === 0 ? "success" : "error";
    finalizeAdminOp(op, status, code);
  });

  return op;
}

function computeRiskAnalysis({ question, context }) {
  const text = `${question || ""}\n${context || ""}`;

  const patterns = [
    { re: /\b(rm\s+-rf|del\s+\/f|format\s+c:|wipe|erase)\b/i, level: "high", title: "Destructive file operations" },
    { re: /\b(drop\s+database|drop\s+table|truncate\s+table)\b/i, level: "high", title: "Destructive database operations" },
    { re: /\b(ssh|private\s+key|api\s+key|password|secret|token)\b/i, level: "medium", title: "Credential or secret handling" },
    { re: /\b(ssn|social\s+security|credit\s+card|passport|driver'?s\s+license)\b/i, level: "high", title: "Potential PII handling" },
    { re: /\b(sql\s+injection|xss|csrf|rce|command\s+injection)\b/i, level: "medium", title: "Security vulnerability context" },
    { re: /\b(powershell|cmd\.exe|bash|shell\s+command|execute\s+command)\b/i, level: "medium", title: "Command execution context" },
  ];

  const items = [];
  let maxLevel = "low";
  const rank = { low: 0, medium: 1, high: 2 };

  for (const p of patterns) {
    if (p.re.test(text)) {
      items.push({ level: p.level, title: p.title });
      if (rank[p.level] > rank[maxLevel]) maxLevel = p.level;
    }
  }

  return {
    level: maxLevel,
    items,
    notes: items.length
      ? "Risk analysis is heuristic-based. Validate before acting on any destructive or security-sensitive advice."
      : "No obvious risk signals detected by heuristics.",
  };
}

function buildQaPrompt({ question, context }) {
  const safeContext = context ? `Context:\n${context}\n\n` : "";
  return (
    "You are Heady Systems Q&A. Provide a clear, safe, and concise answer. " +
    "Do not reveal secrets, API keys, tokens, or private data.\n\n" +
    safeContext +
    `Question:\n${question}\n\nAnswer:\n`
  );
}

function extractGeneratedText(hfData) {
  if (Array.isArray(hfData) && hfData.length > 0 && hfData[0] && typeof hfData[0] === "object") {
    if (typeof hfData[0].generated_text === "string") return hfData[0].generated_text;
  }
  return undefined;
}

function stripPromptEcho(output, prompt) {
  if (typeof output !== "string") return output;
  if (typeof prompt === "string" && prompt && output.startsWith(prompt)) return output.slice(prompt.length);
  return output;
}

async function runPythonQa({ question, context, model, parameters, requestId }) {
  const scriptExists = fs.existsSync(PY_WORKER_SCRIPT);
  if (!scriptExists) {
    const err = new Error("Python worker script not found");
    err.code = "PY_WORKER_MISSING";
    throw err;
  }

  return pySemaphore.run(
    () =>
      new Promise((resolve, reject) => {
        const child = spawn(HEADY_PYTHON_BIN, [PY_WORKER_SCRIPT, "qa"], {
          stdio: ["pipe", "pipe", "pipe"],
          env: { ...process.env, PYTHONUNBUFFERED: "1" },
          windowsHide: true,
        });

        const maxBytes = 1024 * 1024;
        let stdout = "";
        let stderr = "";
        let settled = false;

        const timer = setTimeout(() => {
          if (settled) return;
          settled = true;
          try {
            child.kill("SIGKILL");
          } catch {}
          const err = new Error("Python worker timed out");
          err.code = "PY_WORKER_TIMEOUT";
          reject(err);
        }, HEADY_PY_WORKER_TIMEOUT_MS);

        child.stdout.on("data", (chunk) => {
          if (settled) return;
          stdout += chunk.toString("utf8");
          if (stdout.length > maxBytes) stdout = stdout.slice(-maxBytes);
        });

        child.stderr.on("data", (chunk) => {
          if (settled) return;
          stderr += chunk.toString("utf8");
          if (stderr.length > maxBytes) stderr = stderr.slice(-maxBytes);
        });

        child.on("error", (e) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(e);
        });

        child.on("close", (code) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);

          if (code !== 0) {
            const err = new Error("Python worker failed");
            err.code = "PY_WORKER_FAILED";
            err.details = { code, stderr: stderr.trim() };
            return reject(err);
          }

          try {
            const parsed = JSON.parse(stdout);
            return resolve(parsed);
          } catch (e) {
            const err = new Error("Python worker returned invalid JSON");
            err.code = "PY_WORKER_BAD_JSON";
            err.details = { stdout: stdout.trim().slice(0, 2000), stderr: stderr.trim().slice(0, 2000) };
            return reject(err);
          }
        });

        const payload = {
          question,
          context,
          model,
          parameters,
          max_new_tokens: HEADY_QA_MAX_NEW_TOKENS,
          request_id: requestId,
        };

        try {
          child.stdin.end(JSON.stringify(payload));
        } catch (e) {
          clearTimeout(timer);
          reject(e);
        }
      }),
  );
}

async function runNodeQa({ question, context, model, parameters }) {
  const prompt = buildQaPrompt({ question, context });
  const usedModel = model || HEADY_QA_MODEL || DEFAULT_HF_TEXT_MODEL;

  const mergedParameters = {
    max_new_tokens: HEADY_QA_MAX_NEW_TOKENS,
    temperature: 0.2,
    return_full_text: false,
    ...(parameters && typeof parameters === "object" ? parameters : {}),
  };

  const result = await hfInfer({
    model: usedModel,
    inputs: prompt,
    parameters: mergedParameters,
    options: { wait_for_model: true },
  });

  const rawOutput = extractGeneratedText(result.data);
  const answer = stripPromptEcho(rawOutput, prompt);

  return { ok: true, backend: "node-hf", model: result.model, answer, raw: result.data };
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.use("/api/admin", requireApiKey);

async function runPatternScan(filePath, content) {
  return pySemaphore.run(() => new Promise((resolve, reject) => {
    const child = spawn(HEADY_PYTHON_BIN, [PY_WORKER_SCRIPT, "scan"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { child.kill("SIGKILL"); } catch {}
      reject(new Error("Pattern scan timed out"));
    }, 30000);

    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`Scan failed: ${stderr}`));
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error("Invalid JSON from scan"));
      }
    });

    child.stdin.end(JSON.stringify({ file_path: filePath, content }));
  }));
}

app.post(
  "/api/admin/scan-patterns",
  asyncHandler(async (req, res) => {
    const root = assertAdminRoot(req.body.root);
    const relPath = req.body.path;
    if (!relPath) throw createHttpError(400, "path is required");
    
    const targetPath = resolveAdminPath(root.path, relPath);
    const content = await fsp.readFile(targetPath, "utf8");
    
    const result = await runPatternScan(relPath, content);
    if (result.ok) {
      await logFilePattern(relPath, result.patterns);
    }
    
    res.json(result);
  })
);

app.get(
  "/api/admin/registry",
  asyncHandler(async (req, res) => {
    const registry = await loadRegistry();
    res.json({ ok: true, registry });
  })
);

app.get(
  "/api/admin/config/render-yaml",
  asyncHandler(async (req, res) => {
    const renderPath = path.join(__dirname, "render.yaml");
    if (!fs.existsSync(renderPath)) {
      throw createHttpError(404, "render.yaml not found");
    }
    const content = await fsp.readFile(renderPath, "utf8");
    res.json({ ok: true, content });
  }),
);

app.get(
  "/api/admin/config/mcp",
  asyncHandler(async (req, res) => {
    const mcpPath = path.join(__dirname, "mcp_config.json");
    if (!fs.existsSync(mcpPath)) {
      throw createHttpError(404, "mcp_config.json not found");
    }
    const raw = await fsp.readFile(mcpPath, "utf8");
    const parsed = JSON.parse(raw);
    // Mask secrets in known fields
    const masked = JSON.parse(JSON.stringify(parsed, (k, v) => {
      if (typeof v === "string" && (k.toLowerCase().includes("token") || k.toLowerCase().includes("password") || k.toLowerCase().includes("secret"))) {
        return v ? "***MASKED***" : v;
      }
      return v;
    }));
    res.json({ ok: true, config: masked });
  }),
);

app.get(
  "/api/admin/settings/gpu",
  asyncHandler(async (req, res) => {
    res.json({
      ok: true,
      enabled: HEADY_ADMIN_ENABLE_GPU,
      remoteHost: REMOTE_GPU_HOST ? "***MASKED***" : "",
      remotePort: REMOTE_GPU_PORT ? "***MASKED***" : "",
      memoryLimit: GPU_MEMORY_LIMIT,
      enableGpuDirect: ENABLE_GPUDIRECT,
    });
  }),
);

app.post(
  "/api/admin/gpu/infer",
  asyncHandler(async (req, res) => {
    if (!HEADY_ADMIN_ENABLE_GPU) {
      throw createHttpError(503, "GPU features are disabled");
    }
    const { inputs, model, parameters } = req.body || {};
    if (!inputs) throw createHttpError(400, "inputs is required");
    // Stub: echo back with GPU flag; real integration would call remote GPU worker
    res.json({
      ok: true,
      backend: "remote-gpu-stub",
      model: model || "gpu-stub",
      result: { outputs: inputs, gpu: true, rdma: ENABLE_GPUDIRECT },
    });
  }),
);

app.post(
  "/api/admin/assistant",
  asyncHandler(async (req, res) => {
    const { context, filePath, instruction } = req.body || {};
    if (!instruction || typeof instruction !== "string") {
      throw createHttpError(400, "instruction is required");
    }
    // Simple proxy: forward to Hugging Face QA for now (MCP tool proxy later)
    try {
      const qaResult = await runPythonQa({
        question: instruction,
        context: context || "",
        model: HEADY_QA_MODEL,
        parameters: { max_new_tokens: HEADY_QA_MAX_NEW_TOKENS },
        requestId: `assistant-${Date.now()}`,
      });
      res.json({
        ok: true,
        response: qaResult.answer || "No response",
        model: qaResult.model,
        backend: "python-hf",
      });
    } catch (err) {
      // Fallback stub
      res.json({
        ok: true,
        response: `Assistant stub: received instruction "${instruction}" for ${filePath || "(no file)"}. Context length: ${context ? context.length : 0}.`,
        error: err.message,
      });
    }
  }),
);

app.post(
  "/api/admin/lint",
  asyncHandler(async (req, res) => {
    const { root: rootParam, path: relPath, content } = req.body || {};
    if (typeof relPath !== "string" || !relPath) {
      throw createHttpError(400, "path is required");
    }
    if (typeof content !== "string") {
      throw createHttpError(400, "content is required");
    }
    const root = assertAdminRoot(rootParam);
    const targetPath = resolveAdminPath(root.path, relPath);

    // Simple stub: detect Python syntax errors via compile
    let errors = [];
    if (targetPath.endsWith('.py')) {
      try {
        const PythonShell = require('python-shell').PythonShell;
        await PythonShell.runString(content, { mode: 'json' });
      } catch (e) {
        errors = [e.message || 'Syntax error'];
      }
    }
    res.json({ ok: true, errors, fixed: false });
  }),
);

app.post(
  "/api/admin/test",
  asyncHandler(async (req, res) => {
    const { root: rootParam, path: relPath, testType } = req.body || {};
    const root = assertAdminRoot(rootParam);
    const targetPath = resolveAdminPath(root.path, relPath || ".");
    const op = startAdminOperation({
      type: "test",
      script: path.join(__dirname, "src", "process_data.py"),
      args: ["test", targetPath],
      cwd: root.path,
    });
    res.json({
      ok: true,
      op: serializeAdminOp(op),
      streamUrl: `/api/admin/ops/${op.id}/stream`,
    });
  }),
);

app.get(
  "/api/admin/roots",
  asyncHandler(async (req, res) => {
    res.json({ ok: true, roots: ADMIN_ROOTS });
  }),
);

app.get(
  "/api/admin/files",
  asyncHandler(async (req, res) => {
    const root = assertAdminRoot(req.query.root);
    const relPath = typeof req.query.path === "string" ? req.query.path : "";
    const targetPath = resolveAdminPath(root.path, relPath || ".");
    const stat = await fsp.stat(targetPath);

    if (!stat.isDirectory()) {
      throw createHttpError(400, "Path is not a directory");
    }

    const entries = await fsp.readdir(targetPath, { withFileTypes: true });
    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(targetPath, entry.name);
        const entryStat = await fsp.stat(fullPath);
        return {
          name: entry.name,
          path: toRelativePath(root.path, fullPath),
          type: entry.isDirectory() ? "directory" : "file",
          size: entryStat.size,
          mtime: entryStat.mtime.toISOString(),
        };
      }),
    );

    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    res.json({
      ok: true,
      root,
      path: toRelativePath(root.path, targetPath),
      entries: items,
    });
  }),
);

app.get(
  "/api/admin/file",
  asyncHandler(async (req, res) => {
    const relPath = req.query.path;
    if (typeof relPath !== "string" || !relPath) {
      throw createHttpError(400, "path is required");
    }

    const root = assertAdminRoot(req.query.root);
    const targetPath = resolveAdminPath(root.path, relPath);
    const stat = await fsp.stat(targetPath);

    if (!stat.isFile()) {
      throw createHttpError(400, "Path is not a file");
    }

    if (stat.size > HEADY_ADMIN_MAX_BYTES) {
      throw createHttpError(413, "File exceeds size limit", {
        maxBytes: HEADY_ADMIN_MAX_BYTES,
        bytes: stat.size,
      });
    }

    const buffer = await fsp.readFile(targetPath);
    if (buffer.includes(0)) {
      throw createHttpError(415, "Binary files are not supported");
    }

    res.json({
      ok: true,
      root,
      path: toRelativePath(root.path, targetPath),
      bytes: stat.size,
      mtime: stat.mtime.toISOString(),
      sha: hashBuffer(buffer),
      encoding: "utf8",
      content: buffer.toString("utf8"),
    });
  }),
);

app.post(
  "/api/admin/file",
  asyncHandler(async (req, res) => {
    const { root: rootParam, path: relPath, content, expectedSha } = req.body || {};
    if (typeof relPath !== "string" || !relPath) {
      throw createHttpError(400, "path is required");
    }
    if (typeof content !== "string") {
      throw createHttpError(400, "content must be a string");
    }

    const root = assertAdminRoot(rootParam);
    const targetPath = resolveAdminPath(root.path, relPath);
    const bytes = Buffer.from(content, "utf8");

    if (bytes.length > HEADY_ADMIN_MAX_BYTES) {
      throw createHttpError(413, "File exceeds size limit", {
        maxBytes: HEADY_ADMIN_MAX_BYTES,
        bytes: bytes.length,
      });
    }

    if (fs.existsSync(targetPath)) {
      const existingBuffer = await fsp.readFile(targetPath);
      const existingSha = hashBuffer(existingBuffer);
      if (expectedSha && existingSha !== expectedSha) {
        throw createHttpError(409, "File has changed", {
          expectedSha,
          actualSha: existingSha,
        });
      }
    }

    await fsp.mkdir(path.dirname(targetPath), { recursive: true });
    await fsp.writeFile(targetPath, content, "utf8");

    res.json({
      ok: true,
      root,
      path: toRelativePath(root.path, targetPath),
      bytes: bytes.length,
      sha: hashBuffer(bytes),
    });
  }),
);

app.get(
  "/api/admin/ops",
  asyncHandler(async (req, res) => {
    const ops = Array.from(adminOps.values()).map(serializeAdminOp);
    res.json({ ok: true, ops });
  }),
);

app.get(
  "/api/admin/ops/:id/status",
  asyncHandler(async (req, res) => {
    const op = adminOps.get(req.params.id);
    if (!op) {
      throw createHttpError(404, "Operation not found");
    }
    res.json({ ok: true, op: serializeAdminOp(op), logs: op.logs.slice(-200) });
  }),
);

app.get(
  "/api/admin/ops/:id/stream",
  asyncHandler(async (req, res) => {
    const op = adminOps.get(req.params.id);
    if (!op) {
      throw createHttpError(404, "Operation not found");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent("snapshot", { op: serializeAdminOp(op), logs: op.logs });

    const onLog = (entry) => sendEvent("log", entry);
    const onStatus = (status) => sendEvent("status", status);
    const onEnd = () => {
      sendEvent("end", { ok: true });
      res.end();
    };

    op.emitter.on("log", onLog);
    op.emitter.on("status", onStatus);
    op.emitter.once("end", onEnd);

    req.on("close", () => {
      op.emitter.off("log", onLog);
      op.emitter.off("status", onStatus);
      op.emitter.off("end", onEnd);
    });
  }),
);

app.post(
  "/api/admin/build",
  asyncHandler(async (req, res) => {
    const { root: rootParam, path: relPath, mode, args } = req.body || {};
    const root = assertAdminRoot(rootParam);
    const targetPath = resolveAdminPath(root.path, relPath || ".");

    const scriptArgs = [];
    if (mode) scriptArgs.push(String(mode));
    scriptArgs.push(targetPath);

    if (Array.isArray(args)) {
      args.forEach((arg) => {
        if (arg !== undefined && arg !== null) scriptArgs.push(String(arg));
      });
    }

    const op = startAdminOperation({
      type: "build",
      script: HEADY_ADMIN_BUILD_SCRIPT,
      args: scriptArgs,
      cwd: root.path,
    });

    res.json({
      ok: true,
      op: serializeAdminOp(op),
      streamUrl: `/api/admin/ops/${op.id}/stream`,
    });
  }),
);

app.post(
  "/api/admin/audit",
  asyncHandler(async (req, res) => {
    const { root: rootParam, path: relPath, mode, args } = req.body || {};
    const root = assertAdminRoot(rootParam);
    const targetPath = resolveAdminPath(root.path, relPath || ".");

    const scriptArgs = [];
    if (mode) scriptArgs.push(String(mode));
    scriptArgs.push(targetPath);

    if (Array.isArray(args)) {
      args.forEach((arg) => {
        if (arg !== undefined && arg !== null) scriptArgs.push(String(arg));
      });
    }

    const op = startAdminOperation({
      type: "audit",
      script: HEADY_ADMIN_AUDIT_SCRIPT,
      args: scriptArgs,
      cwd: root.path,
    });

    res.json({
      ok: true,
      op: serializeAdminOp(op),
      streamUrl: `/api/admin/ops/${op.id}/stream`,
    });
  }),
);

app.get(
  "/api/health",
  asyncHandler(async (req, res) => {
    res.json({
      ok: true,
      service: "heady-manager",
      ts: new Date().toISOString(),
      uptime_s: Math.round(process.uptime()),
      env: {
        has_hf_token: Boolean(HF_TOKEN),
        has_heady_api_key: Boolean(HEADY_API_KEY),
      },
    });
  }),
);

app.get(
  "/api/pulse",
  asyncHandler(async (req, res) => {
    const docker = new Docker();
    let dockerInfo;

    try {
      const version = await docker.version();
      dockerInfo = { ok: true, version };
    } catch (e) {
      dockerInfo = { ok: false, error: e && e.message ? e.message : String(e) };
    }

    res.json({ ok: true, ts: new Date().toISOString(), docker: dockerInfo });
  }),
);

app.post(
  "/api/hf/infer",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const { model, inputs, parameters, options } = req.body || {};
    if (!model || inputs === undefined) {
      return res.status(400).json({ ok: false, error: "model and inputs are required" });
    }

    const mergedOptions = {
      wait_for_model: true,
      ...(options && typeof options === "object" ? options : {}),
    };

    const result = await hfInfer({ model, inputs, parameters, options: mergedOptions });
    return res.json({ ok: true, model: result.model, result: result.data });
  }),
);

app.post(
  "/api/hf/generate",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const { prompt, model, parameters, options } = req.body || {};
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ ok: false, error: "prompt is required" });
    }

    const mergedOptions = {
      wait_for_model: true,
      ...(options && typeof options === "object" ? options : {}),
    };

    const usedModel = model || DEFAULT_HF_TEXT_MODEL;
    const result = await hfInfer({ model: usedModel, inputs: prompt, parameters, options: mergedOptions });

    let output;
    const data = result.data;
    if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === "object") {
      if (typeof data[0].generated_text === "string") output = data[0].generated_text;
    }

    return res.json({ ok: true, model: result.model, output, raw: data });
  }),
);

app.post(
  "/api/hf/embed",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const { text, model, options } = req.body || {};
    if (text === undefined || text === null || (typeof text !== "string" && !Array.isArray(text))) {
      return res.status(400).json({ ok: false, error: "text must be a string or string[]" });
    }

    const mergedOptions = {
      wait_for_model: true,
      ...(options && typeof options === "object" ? options : {}),
    };

    const usedModel = model || DEFAULT_HF_EMBED_MODEL;
    const result = await hfInfer({ model: usedModel, inputs: text, options: mergedOptions });

    const embeddings = poolFeatureExtractionOutput(result.data);
    return res.json({ ok: true, model: result.model, embeddings, raw: result.data });
  }),
);

app.get(
  "/",
  asyncHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }),
);

app.get(
  "/admin",
  asyncHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
  }),
);

app.use((err, req, res, next) => {
  const status = typeof err.status === "number" ? err.status : 500;
  const payload = {
    ok: false,
    error: err && err.message ? err.message : "Server error",
  };

  if (err && err.response !== undefined) payload.details = err.response;
  if (err && err.details !== undefined) payload.details = err.details;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json(payload);
});

app.listen(PORT, () => console.log(`∞ Heady System Active on Port ${PORT} ∞`));
