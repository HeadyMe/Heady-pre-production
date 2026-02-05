// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: backend/src/utils/ai.js
// LAYER: backend
// 
//         _   _  _____    _    ____   __   __
//        | | | || ____|  / \  |  _ \ \ \ / /
//        | |_| ||  _|   / _ \ | | | | \ V / 
//        |  _  || |___ / ___ \| |_| |  | |  
//        |_| |_||_____/_/   \_\____/   |_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { 
  HF_TOKEN, 
  DEFAULT_HF_TEXT_MODEL, 
  DEFAULT_HF_EMBED_MODEL, 
  HF_MAX_CONCURRENCY,
  HEADY_PY_MAX_CONCURRENCY,
  HEADY_PYTHON_BIN,
  HEADY_PY_WORKER_TIMEOUT_MS,
  HEADY_QA_MAX_NEW_TOKENS,
  HEADY_QA_MODEL
} = require("./config");
const { sleep } = require("./helpers");

const fsp = fs.promises;

// Use relative path from src/utils/ai.js to backend/python_worker/process_data.py
const PY_WORKER_SCRIPT = path.join(__dirname, "../../python_worker/process_data.py");

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

async function runPythonQa({ question, context, model, parameters, requestId }) {
  const scriptExists = fs.existsSync(PY_WORKER_SCRIPT);
  if (!scriptExists) {
    const err = new Error("Python worker script not found at " + PY_WORKER_SCRIPT);
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

function buildQaPrompt({ question, context }) {
  const safeContext = context ? `Context:\n${context}\n\n` : "";
  return (
    "You are Heady Systems Q&A. Provide a clear, safe, and concise answer. " +
    "Do not reveal secrets, API keys, tokens, or private data.\n\n" +
    safeContext +
    `Question:\n${question}\n\nAnswer:\n`
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

module.exports = {
  hfInfer,
  poolFeatureExtractionOutput,
  runPythonQa,
  runNodeQa,
  runPatternScan
};
