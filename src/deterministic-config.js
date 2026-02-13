"use strict";

/**
 * HeadyDeterministicConfig — Forces deterministic, reproducible execution
 * across all AI services, pipelines, and orchestration layers.
 *
 * Principles:
 *   1. Same input → same output (seed pinning, temperature=0)
 *   2. Ordered execution (topological sort, no race conditions)
 *   3. Checksummed artifacts (SHA-256 content hashing)
 *   4. Auditable decisions (every branch logged with reason)
 *   5. High speed (parallel where safe, cached where possible)
 */

const crypto = require("crypto");

const DETERMINISTIC_DEFAULTS = {
  // AI model parameters — force reproducibility
  ai: {
    temperature: 0,
    top_p: 1,
    seed: 42,
    max_tokens: 4096,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: null,
    n: 1, // single completion only
    stream: false, // no streaming for deterministic verification
  },

  // Pipeline execution — ordered, verified
  pipeline: {
    concurrency: 8,              // max parallel tasks
    retryPolicy: "exponential",  // exponential backoff
    maxRetries: 3,
    retryBaseMs: 1000,
    retryMaxMs: 30000,
    timeoutMs: 60000,
    checksumArtifacts: true,     // SHA-256 every output
    deterministicOrder: true,    // topological sort enforced
    idempotent: true,            // re-running produces same result
  },

  // Cache — content-addressed for determinism
  cache: {
    strategy: "content-addressed", // key = hash(input)
    ttlMs: 15 * 60 * 1000,        // 15 min default
    maxEntries: 10000,
    evictionPolicy: "lru",
    checksumValues: true,          // verify stored values on read
  },

  // Orchestration — DAG-enforced ordering
  orchestration: {
    dagEnforced: true,            // dependencies block execution
    criticalPathSpeed: "MAX",     // auto-escalate critical path
    zeroIdle: true,               // backfill with lower-priority
    fairAccessMinimum: 0.20,      // 20% wealth redistribution
    stagnationTimeoutMs: 300000,  // 5 min stagnation limit
    reprioritizeOnCompletion: true,
  },

  // Monte Carlo — high-iteration for accuracy
  monteCarlo: {
    defaultIterations: 10000,
    pipelineIterations: 10000,
    deploymentIterations: 5000,
    readinessIterations: 8000,
    confidenceThreshold: 0.85,
    alwaysOn: true,
    enrichAllResponses: true,
  },

  // HeadySoul — strict governance
  soul: {
    vetoThreshold: 40,
    escalateThreshold: 60,
    autoApproveThreshold: 75,
    hardVetoes: [
      "dark_pattern",
      "vendor_lock_in",
      "surveillance",
      "paywall_essential",
      "exploit_vulnerable",
    ],
    auditAllDecisions: true,
    logOverrides: true,
  },

  // Cloudflare Worker edge optimization
  edge: {
    cacheStaticTtlSec: 86400,    // 24h for static sites
    cacheApiTtlSec: 30,          // 30s for API responses
    cacheHealthTtlSec: 10,       // 10s for health endpoints
    staleWhileRevalidate: true,
    earlyHints: true,             // 103 Early Hints for static
    minifyCss: true,
    minifyJs: true,
    minifyHtml: true,
    brotliCompress: true,
    tieredCaching: true,
  },

  // Colab GPU — reproducible inference
  gpu: {
    torchDeterministic: true,     // torch.use_deterministic_algorithms(True)
    cudnnBenchmark: false,        // disable cuDNN auto-tuner for reproducibility
    seed: 42,
    numpySeed: 42,
    randomSeed: 42,
    fp32ForReduction: true,       // avoid FP16 accumulation drift
    gradientCheckpointing: false, // inference only, no training
  },
};

class DeterministicConfig {
  constructor(overrides = {}) {
    this.config = this._deepMerge(DETERMINISTIC_DEFAULTS, overrides);
    this.checksumCache = new Map();
  }

  get(section) {
    return this.config[section] || null;
  }

  getAll() {
    return { ...this.config };
  }

  getAIParams(overrides = {}) {
    return { ...this.config.ai, ...overrides };
  }

  getPipelineConfig() {
    return { ...this.config.pipeline };
  }

  getEdgeConfig() {
    return { ...this.config.edge };
  }

  getGPUConfig() {
    return { ...this.config.gpu };
  }

  checksum(data) {
    const str = typeof data === "string" ? data : JSON.stringify(data);
    return crypto.createHash("sha256").update(str).digest("hex").slice(0, 16);
  }

  verifyChecksum(data, expected) {
    return this.checksum(data) === expected;
  }

  contentAddressedKey(input) {
    return `ca:${this.checksum(input)}`;
  }

  _deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = this._deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
}

module.exports = { DeterministicConfig, DETERMINISTIC_DEFAULTS };
