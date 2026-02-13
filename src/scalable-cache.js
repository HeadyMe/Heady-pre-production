// HEADY_BRAND:BEGIN
// ScalableCache — Drop-in replacement for in-memory Map cache
// Supports: in-memory (default) → Redis (when REDIS_URL is set)
// HEADY_BRAND:END

const EventEmitter = require("events");

class ScalableCache extends EventEmitter {
  constructor(options = {}) {
    super();
    this.maxSize = options.maxSize || 10000;
    this.ttlMs = options.ttlMs || 5 * 60 * 1000;
    this.prefix = options.prefix || "heady:";
    this.redis = null;
    this.local = new Map();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;

    // Try to connect to Redis if URL provided
    if (process.env.REDIS_URL) {
      this._connectRedis(process.env.REDIS_URL);
    }
  }

  async _connectRedis(url) {
    try {
      const { createClient } = require("redis");
      this.redis = createClient({ url });
      this.redis.on("error", (err) => {
        console.error("[ScalableCache] Redis error, falling back to local:", err.message);
        this.redis = null;
      });
      await this.redis.connect();
      console.log("[ScalableCache] Connected to Redis");
    } catch (err) {
      console.warn("[ScalableCache] Redis unavailable, using in-memory cache:", err.message);
      this.redis = null;
    }
  }

  async get(key) {
    const fullKey = this.prefix + key;

    if (this.redis) {
      try {
        const raw = await this.redis.get(fullKey);
        if (raw) {
          this.hits++;
          return JSON.parse(raw);
        }
        this.misses++;
        return null;
      } catch (err) {
        console.error("[ScalableCache] Redis GET error:", err.message);
      }
    }

    // Fallback: local Map
    const item = this.local.get(fullKey);
    if (item && Date.now() - item.timestamp < this.ttlMs) {
      this.hits++;
      return item.data;
    }
    if (item) {
      this.local.delete(fullKey);
    }
    this.misses++;
    return null;
  }

  async set(key, data, ttlMs) {
    const fullKey = this.prefix + key;
    const ttl = ttlMs || this.ttlMs;

    if (this.redis) {
      try {
        await this.redis.setEx(fullKey, Math.ceil(ttl / 1000), JSON.stringify(data));
        return;
      } catch (err) {
        console.error("[ScalableCache] Redis SET error:", err.message);
      }
    }

    // Fallback: local Map with eviction
    this.local.set(fullKey, { data, timestamp: Date.now() });
    if (this.local.size > this.maxSize) {
      this._evictLocal();
    }
  }

  async del(key) {
    const fullKey = this.prefix + key;

    if (this.redis) {
      try {
        await this.redis.del(fullKey);
        return;
      } catch (err) {
        console.error("[ScalableCache] Redis DEL error:", err.message);
      }
    }

    this.local.delete(fullKey);
  }

  _evictLocal() {
    const now = Date.now();
    // First pass: remove expired
    for (const [k, v] of this.local) {
      if (now - v.timestamp >= this.ttlMs) {
        this.local.delete(k);
        this.evictions++;
      }
    }
    // If still over limit, remove oldest 20%
    if (this.local.size > this.maxSize) {
      const toRemove = Math.ceil(this.local.size * 0.2);
      const keys = this.local.keys();
      for (let i = 0; i < toRemove; i++) {
        const { value } = keys.next();
        if (value) {
          this.local.delete(value);
          this.evictions++;
        }
      }
    }
  }

  get size() {
    return this.redis ? -1 : this.local.size;
  }

  getStats() {
    return {
      backend: this.redis ? "redis" : "in-memory",
      localSize: this.local.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: this.hits + this.misses > 0
        ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1) + "%"
        : "0%",
    };
  }

  async shutdown() {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (_) {}
    }
  }
}

module.exports = { ScalableCache };
