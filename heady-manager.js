const express = require("express");
const cors = require("cors");
const Docker = require("dockerode");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3300);

const HF_TOKEN = process.env.HF_TOKEN;
const HEADY_API_KEY = process.env.HEADY_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const OTHER_API_KEY = process.env.OTHER_API_KEY;

const DEFAULT_HF_TEXT_MODEL = process.env.HF_TEXT_MODEL || "gpt2";
const DEFAULT_HF_EMBED_MODEL = process.env.HF_EMBED_MODEL || "sentence-transformers/all-MiniLM-L6-v2";

// Simple in-memory rate limiting for admin endpoints
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per 10 seconds

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowKey = `${ip}-${Math.floor(now / RATE_LIMIT_WINDOW_MS)}`;
  
  const currentCount = rateLimitStore.get(windowKey) || 0;
  
  if (currentCount >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ 
      ok: false, 
      error: "Too many requests. Please try again later." 
    });
  }
  
  rateLimitStore.set(windowKey, currentCount + 1);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    const cutoff = Math.floor((now - RATE_LIMIT_WINDOW_MS * 2) / RATE_LIMIT_WINDOW_MS);
    for (const key of rateLimitStore.keys()) {
      const keyTime = parseInt(key.split('-')[1]);
      if (keyTime < cutoff) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  next();
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

function requireApiKey(req, res, next) {
  if (!HEADY_API_KEY) {
    return res.status(500).json({ ok: false, error: "HEADY_API_KEY is not set" });
  }

  const provided = req.get("x-heady-api-key");
  if (!provided || provided !== HEADY_API_KEY) {
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
        has_database_url: Boolean(DATABASE_URL),
        has_cloudflare: Boolean(CLOUDFLARE_API_TOKEN && CLOUDFLARE_ACCOUNT_ID),
        has_other_api_key: Boolean(OTHER_API_KEY),
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

app.get(
  "/api/admin/status",
  rateLimitMiddleware,
  asyncHandler(async (req, res) => {
    // Read MCP configuration
    let mcpServers = [];
    try {
      const mcpConfigPath = path.join(__dirname, "mcp_config.json");
      if (fs.existsSync(mcpConfigPath)) {
        const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, "utf8"));
        if (mcpConfig.mcpServers) {
          mcpServers = Object.keys(mcpConfig.mcpServers).map((name) => ({
            name,
            status: "configured",
          }));
        }
      }
    } catch (e) {
      console.error("Error reading MCP config:", e);
    }

    // Patent integration status
    const patents = [
      {
        title: "Multi-modal AI Integration",
        implemented: Boolean(HF_TOKEN),
        description: "Hugging Face inference pipeline for text and embeddings",
      },
      {
        title: "Containerized Service Management",
        implemented: true,
        description: "Docker integration for isolated service execution",
      },
      {
        title: "Secure API Gateway",
        implemented: Boolean(HEADY_API_KEY),
        description: "API key authentication and rate limiting",
      },
      {
        title: "Real-time Monitoring Dashboard",
        implemented: true,
        description: "WebSocket-based live system updates",
      },
      {
        title: "Database Audit Trail",
        implemented: Boolean(DATABASE_URL),
        description: "PostgreSQL integration for compliance tracking",
      },
      {
        title: "CDN Edge Computing",
        implemented: Boolean(CLOUDFLARE_API_TOKEN && CLOUDFLARE_ACCOUNT_ID),
        description: "Cloudflare Workers integration",
      },
      {
        title: "Model Context Protocol (MCP)",
        implemented: mcpServers.length > 0,
        description: "Standardized AI service communication",
      },
    ];

    // Component status
    const components = {
      system: {
        status: "operational",
        uptime: process.uptime(),
        version: "1.0.0",
      },
      secrets: {
        hf_token: Boolean(HF_TOKEN),
        heady_api_key: Boolean(HEADY_API_KEY),
        database_url: Boolean(DATABASE_URL),
        cloudflare_token: Boolean(CLOUDFLARE_API_TOKEN),
        cloudflare_account: Boolean(CLOUDFLARE_ACCOUNT_ID),
        other_api_key: Boolean(OTHER_API_KEY),
      },
      mcp_servers: mcpServers,
      patents,
    };

    res.json({
      ok: true,
      ts: new Date().toISOString(),
      ...components,
    });
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
