const express = require("express");
const cors = require("cors");
const Docker = require("dockerode");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

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
const PY_WORKER_SCRIPT = path.join(__dirname, "src", "process_data.py");

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

app.use((err, req, res, next) => {
  const status = typeof err.status === "number" ? err.status : 500;
  const payload = {
    ok: false,
    error: err && err.message ? err.message : "Server error",
  };

  if (err && err.response !== undefined) payload.details = err.response;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json(payload);
});

app.listen(PORT, () => console.log(`∞ Heady System Active on Port ${PORT} ∞`));
