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
// ║  FILE: packages/hc-supervisor/src/index.js                        ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * HC Supervisor - Multi-Agent Direct Routing
 *
 * PROTOCOL:
 *   - Supervisor manages a team of agents exposed as tools/APIs.
 *   - For each request, it decides which agents to call, sends context,
 *     receives responses, and synthesizes a final output.
 *   - Routing is DIRECT: supervisor → agent, agent → supervisor.
 *     No indirect chains. Minimal "head loss" (extra hops/latency).
 *   - Agents are called in parallel where dependencies allow.
 *   - "Long-radius elbows": prefer gentle routing, no sharp redirects.
 *   - "True wye": branch traffic to multiple agents in parallel from
 *     the orchestrator, not serial fan-out/fan-in.
 *
 * Public-domain pattern: Multi-Agent Supervisor (LangGraph / Bedrock style).
 */

const { Router } = require("./router");
const { Scheduler } = require("./scheduler");

class Supervisor {
  /**
   * @param {Object} options
   * @param {Agent[]} options.agents - Array of Agent instances
   * @param {Object} options.resourcePolicies - From configs/resource-policies.yaml
   * @param {Object} options.serviceCatalog - From configs/service-catalog.yaml
   */
  constructor(options = {}) {
    this.agents = new Map();
    this.router = new Router(options.serviceCatalog || {});
    this.scheduler = new Scheduler(options.resourcePolicies || {});
    this.runLog = [];

    if (options.agents) {
      options.agents.forEach((agent) => this.registerAgent(agent));
    }
  }

  registerAgent(agent) {
    if (!agent.id || !agent.handle) {
      throw new Error(`Agent must have 'id' and 'handle' method`);
    }
    this.agents.set(agent.id, agent);
  }

  unregisterAgent(agentId) {
    this.agents.delete(agentId);
  }

  /**
   * Route a request to appropriate agents and aggregate results.
   * This is the core HCFullPipeline execute-major-phase entry point.
   *
   * @param {SupervisorRequest} request
   * @returns {SupervisorResponse}
   */
  async route(request) {
    const startTime = Date.now();
    const runId = request.id || `run-${Date.now()}`;

    // 1. Plan: decide which agents to call and in what groups
    const plan = this.plan(request);

    // 2. Validate all target agents exist
    for (const group of plan.groups) {
      for (const agentId of group.targets) {
        if (!this.agents.has(agentId)) {
          throw new SupervisorError(`Unknown agent: ${agentId}`, runId);
        }
      }
    }

    // 3. Execute groups in sequence; within each group, agents run in parallel
    const allResults = [];
    for (const group of plan.groups) {
      const groupResults = await this._executeGroup(group, request, plan.metadata);
      allResults.push(...groupResults);

      // Check for fatal errors that should stop further groups
      const fatals = groupResults.filter((r) => r.error && r.fatal);
      if (fatals.length > 0) {
        break;
      }
    }

    // 4. Aggregate
    const response = this.aggregate(request, allResults);
    response.runId = runId;
    response.latencyMs = Date.now() - startTime;
    response.agentCount = allResults.length;

    // 5. Log
    this.runLog.push({
      runId,
      request: { id: request.id, type: request.type },
      plan: plan.groups.map((g) => g.targets),
      resultCount: allResults.length,
      latencyMs: response.latencyMs,
      timestamp: new Date().toISOString(),
    });

    return response;
  }

  /**
   * Plan which agents to call and in what order.
   * Override this for custom routing logic (e.g., skill-based routing).
   */
  plan(request) {
    // Default: use Router for skill-based or type-based routing
    const targets = this.router.resolve(request, this.agents);

    // Group into parallel batches respecting maxParallelAgents
    const maxParallel = this.scheduler.maxParallelAgents;
    const groups = [];
    for (let i = 0; i < targets.length; i += maxParallel) {
      groups.push({
        targets: targets.slice(i, i + maxParallel),
        parallel: true,
      });
    }

    return { groups, metadata: { requestType: request.type } };
  }

  /**
   * Execute a group of agents in parallel.
   */
  async _executeGroup(group, request, metadata) {
    const tasks = group.targets.map((agentId) => {
      const agent = this.agents.get(agentId);
      return this._executeAgent(agent, { request, metadata });
    });

    if (group.parallel) {
      return Promise.allSettled(tasks).then((settled) =>
        settled.map((s, i) => ({
          agentId: group.targets[i],
          ...(s.status === "fulfilled"
            ? { result: s.value, error: null }
            : { result: null, error: s.reason?.message || String(s.reason), fatal: false }),
        }))
      );
    }

    // Sequential (for dependency chains)
    const results = [];
    for (let i = 0; i < tasks.length; i++) {
      try {
        const result = await tasks[i];
        results.push({ agentId: group.targets[i], result, error: null });
      } catch (err) {
        results.push({
          agentId: group.targets[i],
          result: null,
          error: err.message,
          fatal: false,
        });
      }
    }
    return results;
  }

  /**
   * Execute a single agent with timeout enforcement.
   */
  async _executeAgent(agent, input) {
    const timeout = this.scheduler.agentTimeoutMs;
    return Promise.race([
      agent.handle(input),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Agent [${agent.id}] timed out after ${timeout}ms`)),
          timeout
        )
      ),
    ]);
  }

  /**
   * Aggregate results from all agents into a coherent response.
   * Override for custom aggregation logic.
   */
  aggregate(request, results) {
    const successes = results.filter((r) => !r.error);
    const failures = results.filter((r) => r.error);

    return {
      requestId: request.id,
      status: failures.length === 0 ? "success" : successes.length > 0 ? "partial" : "failed",
      results: successes.map((r) => ({ agentId: r.agentId, data: r.result })),
      errors: failures.map((r) => ({ agentId: r.agentId, error: r.error })),
    };
  }

  getStatus() {
    return {
      agentCount: this.agents.size,
      agents: Array.from(this.agents.keys()),
      recentRuns: this.runLog.slice(-10),
      scheduler: this.scheduler.getStatus(),
    };
  }
}

class SupervisorError extends Error {
  constructor(message, runId) {
    super(message);
    this.name = "SupervisorError";
    this.runId = runId;
  }
}

module.exports = { Supervisor, SupervisorError };
