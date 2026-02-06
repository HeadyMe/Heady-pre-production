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
// ║  FILE: packages/hc-supervisor/src/router.js                       ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Router - Skill-based and type-based agent routing.
 *
 * PROTOCOL:
 *   - Match tasks to agents by skill tags and health, not hard-coded names.
 *   - Prefer "long-radius elbows" → fewer sharp redirects.
 *   - Go orchestrator → target service directly when possible.
 *   - Primary → backup routing when primary is degraded.
 */

class Router {
  constructor(serviceCatalog = {}) {
    this.catalog = serviceCatalog;
    this.healthOverrides = new Map(); // agentId → "healthy" | "degraded" | "down"
  }

  /**
   * Resolve which agent IDs should handle a request.
   * @param {Object} request - { type, skills, targets }
   * @param {Map} agents - Map of agentId → Agent
   * @returns {string[]} Ordered list of agent IDs
   */
  resolve(request, agents) {
    // If request explicitly specifies targets, use them (direct routing)
    if (request.targets && request.targets.length > 0) {
      return request.targets.filter((id) => {
        const health = this.getAgentHealth(id);
        return health !== "down";
      });
    }

    // Skill-based routing: match request skills to agent skills
    if (request.skills && request.skills.length > 0) {
      return this._matchBySkills(request.skills, agents);
    }

    // Type-based routing: map request type to known agent roles
    if (request.type) {
      return this._matchByType(request.type, agents);
    }

    // Fallback: all healthy agents
    return Array.from(agents.keys()).filter(
      (id) => this.getAgentHealth(id) !== "down"
    );
  }

  _matchBySkills(requiredSkills, agents) {
    const scored = [];
    for (const [id, agent] of agents) {
      if (this.getAgentHealth(id) === "down") continue;
      const agentSkills = agent.skills || [];
      const matchCount = requiredSkills.filter((s) => agentSkills.includes(s)).length;
      if (matchCount > 0) {
        scored.push({ id, score: matchCount, degraded: this.getAgentHealth(id) === "degraded" });
      }
    }
    // Sort: highest skill match first, non-degraded preferred
    scored.sort((a, b) => {
      if (a.degraded !== b.degraded) return a.degraded ? 1 : -1;
      return b.score - a.score;
    });
    return scored.map((s) => s.id);
  }

  _matchByType(type, agents) {
    const TYPE_MAP = {
      build: ["builder"],
      deploy: ["deployer"],
      research: ["researcher"],
      audit: ["auditor"],
      observe: ["observer"],
      "full-pipeline": ["builder", "researcher", "deployer"],
    };
    const candidates = TYPE_MAP[type] || [];
    return candidates.filter((id) => {
      if (!agents.has(id)) return false;
      return this.getAgentHealth(id) !== "down";
    });
  }

  setAgentHealth(agentId, status) {
    this.healthOverrides.set(agentId, status);
  }

  getAgentHealth(agentId) {
    return this.healthOverrides.get(agentId) || "healthy";
  }
}

module.exports = { Router };
