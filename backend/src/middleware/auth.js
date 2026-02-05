// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: backend/src/middleware/auth.js
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

const crypto = require("crypto");
const { HEADY_API_KEY } = require("../utils/config");

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

module.exports = {
  requireApiKey,
  getProvidedApiKey
};
