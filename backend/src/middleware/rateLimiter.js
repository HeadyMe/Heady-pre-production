// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: backend/src/middleware/rateLimiter.js
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

const { HEADY_RATE_LIMIT_WINDOW_MS, HEADY_RATE_LIMIT_MAX } = require("../utils/config");

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

module.exports = {
  createRateLimiter,
  rateLimitApi
};
