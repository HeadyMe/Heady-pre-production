"use strict";

const fs = require("fs");
const path = require("path");

/**
 * HeadyServiceManifest — Single source of truth for ALL Heady services.
 *
 * Loads from config/services.json AND introspects live runtime modules.
 * Provides deterministic grouping, health probes, and full enumeration.
 *
 * Groups:
 *   A. Internal Nodes (20)         — AI agent nodes (BRAIN, CONDUCTOR, etc.)
 *   B. Internal Engines (6)        — Core engines (sacredGeometry, monteCarlo, etc.)
 *   C. Internal Services (7+)      — Domain-mapped services (headyBuddy, systemCore, etc.)
 *   D. External Services (14)      — Third-party integrations (claude, cloudflare, etc.)
 *   E. Runtime Modules (variable)  — Live instantiated modules (SoulOrchestrator, IntelligenceEngine, etc.)
 *   F. Branded Domains (9)         — Cloud-hosted domain endpoints
 */

const BRANDED_DOMAINS = [
  { key: "headysystems", domain: "headysystems.com", role: "Primary API & Platform" },
  { key: "headycloud", domain: "headycloud.com", role: "Cloud Orchestration" },
  { key: "headyconnection", domain: "headyconnection.com", role: "Nonprofit Mission" },
  { key: "headybot", domain: "headybot.com", role: "HeadyBuddy Chat" },
  { key: "headymcp", domain: "headymcp.com", role: "MCP Marketplace" },
  { key: "headycheck", domain: "headycheck.com", role: "Health Dashboard" },
  { key: "headyio", domain: "headyio.com", role: "Developer Docs" },
  { key: "headybuddy", domain: "headybuddy.org", role: "HeadyBuddy Portal" },
  { key: "headyos", domain: "headyos.com", role: "HeadyAI-IDE" },
];

class HeadyServiceManifest {
  constructor(opts = {}) {
    this.configPath = opts.configPath || path.join(__dirname, "..", "configs", "services.json");
    this.config = null;
    this.runtimeModules = new Map();
    this.domainHealth = new Map();
    this.lastFullScan = null;
    this.scanHistory = [];
    this.bootTime = Date.now();
    this._load();
  }

  _load() {
    try {
      const raw = fs.readFileSync(this.configPath, "utf8");
      this.config = JSON.parse(raw);
    } catch (err) {
      console.error(`[ServiceManifest] Failed to load ${this.configPath}: ${err.message}`);
      this.config = { internal: { nodes: {}, engines: {}, services: {} }, external: {} };
    }
  }

  // ─── Registration ───────────────────────────────────────────────────

  /**
   * Register a live runtime module (called from heady-manager at boot)
   */
  registerModule(name, instance, meta = {}) {
    this.runtimeModules.set(name, {
      instance,
      name,
      type: meta.type || "module",
      group: meta.group || "runtime",
      description: meta.description || "",
      startedAt: Date.now(),
      healthy: true,
      lastCheck: null,
      checkCount: 0,
    });
  }

  // ─── Enumeration ────────────────────────────────────────────────────

  getInternalNodes() {
    const nodes = this.config?.internal?.nodes || {};
    return Object.entries(nodes).map(([id, def]) => ({
      id,
      group: "internal_nodes",
      role: def.role,
      enabled: def.enabled,
      removable: def.removable,
      category: def.category,
      gpu: def.gpu || null,
    }));
  }

  getInternalEngines() {
    const engines = this.config?.internal?.engines || {};
    return Object.entries(engines).map(([id, def]) => ({
      id,
      group: "internal_engines",
      description: def.description,
      enabled: def.enabled,
      removable: def.removable,
    }));
  }

  getInternalServices() {
    const services = this.config?.internal?.services || {};
    return Object.entries(services).map(([id, def]) => ({
      id,
      group: "internal_services",
      description: def.description,
      domain: def.domain,
      enabled: def.enabled,
      removable: def.removable,
    }));
  }

  getExternalServices() {
    const ext = this.config?.external || {};
    const result = [];
    for (const [category, group] of Object.entries(ext)) {
      if (category === "_description") continue;
      for (const [id, def] of Object.entries(group)) {
        result.push({
          id,
          group: "external",
          category,
          provider: def.provider || category,
          description: def.description,
          enabled: def.enabled,
          removable: def.removable,
          capabilities: def.capabilities || [],
        });
      }
    }
    return result;
  }

  getRuntimeModules() {
    return Array.from(this.runtimeModules.entries()).map(([name, mod]) => ({
      id: name,
      group: "runtime_modules",
      type: mod.type,
      subgroup: mod.group,
      description: mod.description,
      healthy: mod.healthy,
      uptimeMs: Date.now() - mod.startedAt,
      lastCheck: mod.lastCheck,
      checkCount: mod.checkCount,
    }));
  }

  getBrandedDomains() {
    return BRANDED_DOMAINS.map(d => ({
      ...d,
      group: "branded_domains",
      health: this.domainHealth.get(d.key) || { status: "unknown", lastCheck: null },
    }));
  }

  // ─── Full Manifest ──────────────────────────────────────────────────

  getFullManifest() {
    const nodes = this.getInternalNodes();
    const engines = this.getInternalEngines();
    const internalServices = this.getInternalServices();
    const externalServices = this.getExternalServices();
    const runtimeModules = this.getRuntimeModules();
    const domains = this.getBrandedDomains();

    const totalCount = nodes.length + engines.length + internalServices.length +
      externalServices.length + runtimeModules.length + domains.length;

    const enabledCount = [
      ...nodes.filter(n => n.enabled),
      ...engines.filter(e => e.enabled),
      ...internalServices.filter(s => s.enabled),
      ...externalServices.filter(s => s.enabled),
    ].length + runtimeModules.length + domains.length;

    return {
      version: this.config?.version || "3.0.0",
      profile: this.config?.defaultProfile || "full",
      uptimeMs: Date.now() - this.bootTime,
      counts: {
        total: totalCount,
        enabled: enabledCount,
        nodes: nodes.length,
        engines: engines.length,
        internalServices: internalServices.length,
        externalServices: externalServices.length,
        runtimeModules: runtimeModules.length,
        brandedDomains: domains.length,
      },
      groups: {
        internal_nodes: nodes,
        internal_engines: engines,
        internal_services: internalServices,
        external_services: externalServices,
        runtime_modules: runtimeModules,
        branded_domains: domains,
      },
      orchestration: this.config?.orchestration || null,
      lastFullScan: this.lastFullScan,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Health Probing ─────────────────────────────────────────────────

  /**
   * Probe a runtime module for health
   */
  probeModule(name) {
    const mod = this.runtimeModules.get(name);
    if (!mod) return { name, status: "not_registered" };

    mod.checkCount++;
    mod.lastCheck = Date.now();

    try {
      const inst = mod.instance;
      // Check common health indicators
      if (typeof inst.isHealthy === "function") {
        mod.healthy = inst.isHealthy();
      } else if (typeof inst.getState === "function") {
        const state = inst.getState();
        mod.healthy = state && state.status !== "error";
      } else if (typeof inst.getSnapshot === "function") {
        mod.healthy = true; // Has data = alive
      } else {
        mod.healthy = inst != null; // Exists = alive
      }
    } catch (err) {
      mod.healthy = false;
    }

    return { name, healthy: mod.healthy, checkCount: mod.checkCount };
  }

  /**
   * Probe all runtime modules
   */
  probeAllModules() {
    const results = {};
    for (const name of this.runtimeModules.keys()) {
      results[name] = this.probeModule(name);
    }
    return results;
  }

  /**
   * Record domain health (called externally after HTTP checks)
   */
  recordDomainHealth(key, status, latencyMs = null) {
    this.domainHealth.set(key, {
      status,
      latencyMs,
      lastCheck: Date.now(),
    });
  }

  /**
   * Full scan — probe all modules, return complete state
   */
  fullScan() {
    const moduleProbes = this.probeAllModules();
    const manifest = this.getFullManifest();

    const scan = {
      scannedAt: new Date().toISOString(),
      moduleProbes,
      manifest,
      summary: {
        totalServices: manifest.counts.total,
        enabledServices: manifest.counts.enabled,
        healthyModules: Object.values(moduleProbes).filter(p => p.healthy).length,
        unhealthyModules: Object.values(moduleProbes).filter(p => !p.healthy).length,
        domainsChecked: Array.from(this.domainHealth.values()).filter(d => d.status === 200).length,
        domainsTotal: BRANDED_DOMAINS.length,
      },
    };

    this.lastFullScan = scan.scannedAt;
    this.scanHistory.push({ at: scan.scannedAt, summary: scan.summary });
    if (this.scanHistory.length > 100) this.scanHistory.shift();

    return scan;
  }

  // ─── Summary for HCAutoFlow ─────────────────────────────────────────

  getHCAutoFlowSummary() {
    const nodes = this.getInternalNodes();
    const engines = this.getInternalEngines();
    const intSvc = this.getInternalServices();
    const extSvc = this.getExternalServices();
    const rtMods = this.getRuntimeModules();
    const domains = this.getBrandedDomains();

    return {
      internal_nodes: {
        total: nodes.length,
        enabled: nodes.filter(n => n.enabled).length,
        byCategory: nodes.reduce((acc, n) => { acc[n.category] = (acc[n.category] || 0) + 1; return acc; }, {}),
        ids: nodes.map(n => n.id),
      },
      internal_engines: {
        total: engines.length,
        enabled: engines.filter(e => e.enabled).length,
        ids: engines.map(e => e.id),
      },
      internal_services: {
        total: intSvc.length,
        enabled: intSvc.filter(s => s.enabled).length,
        items: intSvc.map(s => ({ id: s.id, domain: s.domain })),
      },
      external_services: {
        total: extSvc.length,
        enabled: extSvc.filter(s => s.enabled).length,
        byCategory: extSvc.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc; }, {}),
        ids: extSvc.map(s => s.id),
      },
      runtime_modules: {
        total: rtMods.length,
        healthy: rtMods.filter(m => m.healthy).length,
        ids: rtMods.map(m => m.id),
      },
      branded_domains: {
        total: domains.length,
        healthy: domains.filter(d => d.health.status === 200).length,
        items: domains.map(d => ({ domain: d.domain, role: d.role, status: d.health.status })),
      },
      grandTotal: nodes.length + engines.length + intSvc.length + extSvc.length + rtMods.length + domains.length,
    };
  }
}

module.exports = { HeadyServiceManifest, BRANDED_DOMAINS };
