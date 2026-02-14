/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY AI-IDE — Model Provider                                ║
 * ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                               ║
 * ║  Exposes Heady services as selectable AI models               ║
 * ║  Windsurf-next compatible model interface                     ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 * Each Heady service is registered as a "model" with capabilities,
 * routing rules, and API bindings. When a user selects "Heady" as
 * their model in the IDE, requests route through the full Heady
 * intelligence stack instead of a third-party LLM.
 */

const HEADY_MODELS = {
  // ─── Primary composite model (recommended default) ───────────
  "heady-full": {
    id: "heady-full",
    name: "Heady (Full Stack)",
    provider: "heady",
    description: "Full Heady intelligence stack — SoulOrchestrator + Intelligence Engine + HeadyBuddy",
    capabilities: ["code", "chat", "tasks", "research", "orchestration", "evaluation"],
    routing: {
      primary: "soul-orchestrator",
      fallback: "heady-buddy",
      parallel: ["intelligence-engine", "hc-brain"],
    },
    endpoints: {
      chat: "/api/buddy/chat",
      evaluate: "/api/soul/evaluate",
      orchestrate: "/api/v1/orchestrator/execute",
      tasks: "/api/intelligence/tasks",
    },
    default: true,
    tier: "full",
  },

  // ─── Individual service models ────────────────────────────────
  "heady-soul": {
    id: "heady-soul",
    name: "HeadySoul",
    provider: "heady",
    description: "Value-driven decision engine — evaluates tasks against mission, ethics, and fairness",
    capabilities: ["evaluation", "governance", "strategy-filtering"],
    routing: { primary: "soul-orchestrator" },
    endpoints: {
      evaluate: "/api/soul/evaluate",
      filter: "/api/soul/filter-strategies",
      audit: "/api/soul/audit",
    },
    tier: "specialist",
  },

  "heady-intelligence": {
    id: "heady-intelligence",
    name: "Intelligence Engine",
    provider: "heady",
    description: "DAG scheduler, priority queue, critical-path optimization, parallel execution",
    capabilities: ["scheduling", "dag", "critical-path", "parallel-allocation"],
    routing: { primary: "intelligence-engine" },
    endpoints: {
      submit: "/api/intelligence/tasks",
      ready: "/api/intelligence/tasks/ready",
      criticalPath: "/api/intelligence/critical-path",
      allocator: "/api/intelligence/allocator/run",
    },
    tier: "specialist",
  },

  "heady-buddy": {
    id: "heady-buddy",
    name: "HeadyBuddy",
    provider: "heady",
    description: "Conversational AI companion — chat, code, research, tasks",
    capabilities: ["chat", "code", "research", "summarization"],
    routing: { primary: "heady-buddy" },
    endpoints: {
      chat: "/api/buddy/chat",
      suggest: "/api/buddy/suggest",
      research: "/api/research/session",
    },
    tier: "companion",
  },

  "heady-conductor": {
    id: "heady-conductor",
    name: "HeadyConductor",
    provider: "heady",
    description: "Python-based orchestration for data processing, ML inference, and batch operations",
    capabilities: ["python", "data-processing", "ml-inference", "batch"],
    routing: { primary: "conductor-pool" },
    endpoints: {
      orchestrate: "/api/conductor/orchestrate",
      status: "/api/conductor/status",
      nodes: "/api/conductor/nodes",
    },
    tier: "specialist",
  },

  "heady-pipeline": {
    id: "heady-pipeline",
    name: "HCFullPipeline",
    provider: "heady",
    description: "9-stage build/deploy/verify pipeline with Monte Carlo confidence scoring",
    capabilities: ["build", "deploy", "verify", "monte-carlo"],
    routing: { primary: "hc-pipeline" },
    endpoints: {
      run: "/api/pipeline/run",
      state: "/api/pipeline/state",
      history: "/api/pipeline/history",
    },
    tier: "infrastructure",
  },

  "heady-mcp": {
    id: "heady-mcp",
    name: "HeadyMCP",
    provider: "heady",
    description: "Model Context Protocol — tool/resource discovery and execution across the ecosystem",
    capabilities: ["tool-use", "resource-discovery", "protocol"],
    routing: { primary: "mcp-router" },
    endpoints: {
      servers: "/api/mcp/servers",
      tools: "/api/mcp/tool",
      status: "/api/mcp/status",
    },
    tier: "protocol",
  },
};

/**
 * HeadyModelProvider — Windsurf-next compatible model registry
 *
 * Implements the model selection interface so Heady services
 * appear alongside external models (Claude, GPT, etc.) in the
 * IDE model picker.
 */
class HeadyModelProvider {
  constructor(options = {}) {
    this.models = { ...HEADY_MODELS };
    this.baseUrl = options.baseUrl || "https://headysystems.com";
    this.activeModel = options.defaultModel || "heady-full";
    this.requestLog = [];
    this.totalRequests = 0;
    this.totalErrors = 0;
  }

  /**
   * List all available Heady models (Windsurf model-list compatible)
   */
  listModels(filter = {}) {
    let models = Object.values(this.models);

    if (filter.tier) {
      models = models.filter((m) => m.tier === filter.tier);
    }
    if (filter.capability) {
      models = models.filter((m) => m.capabilities.includes(filter.capability));
    }

    return models.map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      description: m.description,
      capabilities: m.capabilities,
      tier: m.tier,
      default: m.default || false,
    }));
  }

  /**
   * Get a single model definition
   */
  getModel(modelId) {
    return this.models[modelId] || null;
  }

  /**
   * Select active model
   */
  selectModel(modelId) {
    if (!this.models[modelId]) {
      return { error: `Model '${modelId}' not found`, available: Object.keys(this.models) };
    }
    this.activeModel = modelId;
    return { selected: modelId, model: this.models[modelId] };
  }

  /**
   * Route a request to the appropriate Heady service endpoint
   * This is the core method — translates IDE model calls into
   * Heady service API calls.
   */
  async routeRequest(request) {
    const model = this.models[this.activeModel];
    if (!model) {
      return { error: "No active model selected" };
    }

    this.totalRequests++;
    const startTime = Date.now();

    try {
      // Determine which endpoint to call based on request type
      const endpointKey = this._resolveEndpoint(request.type, model);
      const endpoint = model.endpoints[endpointKey];

      if (!endpoint) {
        return {
          error: `Model '${model.id}' does not support request type '${request.type}'`,
          supported: Object.keys(model.endpoints),
        };
      }

      const result = {
        model: model.id,
        endpoint,
        url: `${this.baseUrl}${endpoint}`,
        routing: model.routing,
        request: {
          type: request.type,
          payload: request.payload,
        },
        resolvedAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      };

      this.requestLog.push({
        model: model.id,
        type: request.type,
        endpoint,
        timestamp: result.resolvedAt,
        latencyMs: result.latencyMs,
      });

      // Keep log bounded
      if (this.requestLog.length > 1000) {
        this.requestLog = this.requestLog.slice(-500);
      }

      return result;
    } catch (err) {
      this.totalErrors++;
      return { error: err.message, model: model.id };
    }
  }

  /**
   * Resolve which endpoint key to use for a given request type
   */
  _resolveEndpoint(requestType, model) {
    const typeMap = {
      chat: "chat",
      code: "chat",
      evaluate: "evaluate",
      orchestrate: "orchestrate",
      schedule: "submit",
      deploy: "run",
      tools: "tools",
      research: "research",
      suggest: "suggest",
      status: "status",
      filter: "filter",
    };

    return typeMap[requestType] || Object.keys(model.endpoints)[0];
  }

  /**
   * Get models that can handle a specific capability
   */
  getModelsForCapability(capability) {
    return Object.values(this.models)
      .filter((m) => m.capabilities.includes(capability))
      .map((m) => ({ id: m.id, name: m.name, tier: m.tier }));
  }

  /**
   * Provider stats
   */
  getStats() {
    return {
      totalModels: Object.keys(this.models).length,
      activeModel: this.activeModel,
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRate:
        this.totalRequests > 0
          ? ((this.totalErrors / this.totalRequests) * 100).toFixed(1) + "%"
          : "0%",
      recentRequests: this.requestLog.slice(-10),
    };
  }
}

module.exports = { HeadyModelProvider, HEADY_MODELS };
