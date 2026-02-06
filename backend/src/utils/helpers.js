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
// ║  FILE: backend/src/utils/helpers.js                               ║
// ║  LAYER: backend                                                   ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

const crypto = require("crypto");
const path = require("path");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  sleep,
  truncateString,
  createHttpError,
  toPosixPath,
  toRelativePath,
  hashBuffer,
  classifyLogLine,
  asyncHandler
};
