/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  mcp/connector-registry.js - MCP Connector Registry            ║
 * ║  Registration, discovery, health, lifecycle, invocation        ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

class ConnectorRegistry extends EventEmitter {
  constructor(options = {}) {
    super();
    this.connectors = new Map();
    this.healthHistory = new Map();
    this.invocationLog = [];
    this.maxLogSize = 10000;
    this.healthCheckInterval = options.healthCheckInterval || 30000;
    this.unhealthyThreshold = options.unhealthyThreshold || 3;
    this.autoDisableErrorRate = options.autoDisableErrorRate || 0.05;
    this._healthTimer = null;
  }

  register(manifest) {
    const errors = this._validateManifest(manifest);
    if (errors.length > 0) {
      return { success: false, errors };
    }

    const connectorId = crypto.randomUUID();
    const connector = {
      id: connectorId,
      name: manifest.name,
      version: manifest.version,
      vendor: manifest.vendor,
      description: manifest.description || '',
      capabilities: (manifest.capabilities || []).map(c => ({
        ...c,
        invocationCount: 0,
        errorCount: 0,
        totalLatencyMs: 0
      })),
      auth: manifest.auth || { type: 'none' },
      health: {
        config: manifest.health || { endpoint: '/health', interval: 30, timeout: 5000 },
        status: 'unknown',
        lastCheck: null,
        consecutiveFailures: 0,
        uptime: 0,
        checks: 0,
        latencyP99Ms: 0
      },
      soulTier: manifest.soulTier || 'tier2',
      tags: manifest.tags || [],
      rateLimit: manifest.rateLimit || { requestsPerMinute: 60, burstSize: 10 },
      registeredAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      status: 'active',
      errorRate: 0,
      totalInvocations: 0,
      metadata: {}
    };

    this.connectors.set(connectorId, connector);
    this.healthHistory.set(connectorId, []);
    this.emit('connector:registered', { connectorId, name: manifest.name });

    return {
      success: true,
      connectorId,
      apiKey: this._generateConnectorApiKey(connectorId),
      endpoints: {
        heartbeat: `https://headymcp.com/api/v1/connectors/${connectorId}/heartbeat`,
        capabilities: `https://headymcp.com/api/v1/connectors/${connectorId}/capabilities`,
        deregister: `https://headymcp.com/api/v1/connectors/${connectorId}`
      }
    };
  }

  deregister(connectorId) {
    const connector = this.connectors.get(connectorId);
    if (!connector) return { success: false, error: 'Connector not found' };

    connector.status = 'offline';
    connector.deregisteredAt = new Date().toISOString();

    // Keep in registry for 24h for graceful handling of pending requests
    setTimeout(() => this.connectors.delete(connectorId), 86400000);

    this.emit('connector:deregistered', { connectorId, name: connector.name });
    return { success: true };
  }

  heartbeat(connectorId) {
    const connector = this.connectors.get(connectorId);
    if (!connector) return { success: false, error: 'Connector not found' };

    connector.lastHeartbeat = new Date().toISOString();
    if (connector.status === 'stale') {
      connector.status = 'active';
      this.emit('connector:recovered', { connectorId, name: connector.name });
    }

    return { success: true, status: connector.status };
  }

  getConnector(connectorId) {
    return this.connectors.get(connectorId) || null;
  }

  listConnectors(filters = {}) {
    let results = Array.from(this.connectors.values());

    if (filters.status) {
      results = results.filter(c => c.status === filters.status);
    }
    if (filters.vendor) {
      results = results.filter(c => c.vendor === filters.vendor);
    }
    if (filters.tag) {
      results = results.filter(c => c.tags.includes(filters.tag));
    }
    if (filters.healthStatus) {
      results = results.filter(c => c.health.status === filters.healthStatus);
    }

    return results.map(c => ({
      id: c.id,
      name: c.name,
      version: c.version,
      vendor: c.vendor,
      status: c.status,
      health: c.health.status,
      capabilities: c.capabilities.length,
      uptime: c.health.uptime > 0 && c.health.checks > 0
        ? `${Math.round((c.health.uptime / c.health.checks) * 100)}%` : 'N/A',
      errorRate: `${Math.round(c.errorRate * 10000) / 100}%`,
      registeredAt: c.registeredAt,
      tags: c.tags
    }));
  }

  getCapabilities(connectorId) {
    const connector = this.connectors.get(connectorId);
    if (!connector) return null;

    return connector.capabilities.map(c => ({
      name: c.name,
      description: c.description,
      method: c.method,
      path: c.path,
      authRequired: c.auth?.required !== false,
      confirmationRequired: c.confirmationRequired || false,
      rollbackCapable: c.rollbackCapable || false,
      cacheable: c.cacheable || false,
      available: connector.status === 'active' && connector.health.status !== 'unhealthy',
      stats: {
        invocations: c.invocationCount,
        errors: c.errorCount,
        avgLatencyMs: c.invocationCount > 0 ? Math.round(c.totalLatencyMs / c.invocationCount) : 0
      }
    }));
  }

  async invokeCapability(connectorId, capabilityName, params = {}, context = {}) {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      return { success: false, error: 'CONNECTOR_NOT_FOUND' };
    }
    if (connector.status !== 'active') {
      return { success: false, error: 'CONNECTOR_INACTIVE', status: connector.status };
    }
    if (connector.health.status === 'unhealthy') {
      return { success: false, error: 'CONNECTOR_UNHEALTHY', suggestion: 'Connector is currently unhealthy. Try again later.' };
    }

    const capability = connector.capabilities.find(c => c.name === capabilityName);
    if (!capability) {
      return { success: false, error: 'CAPABILITY_NOT_FOUND', available: connector.capabilities.map(c => c.name) };
    }

    const startTime = Date.now();
    const invocationId = crypto.randomUUID();

    try {
      // Record invocation
      capability.invocationCount++;
      connector.totalInvocations++;

      const result = {
        success: true,
        invocationId,
        connectorId,
        capability: capabilityName,
        params,
        result: { message: `Capability ${capabilityName} invoked successfully`, data: params },
        durationMs: Date.now() - startTime,
        traceId: context.traceId || null
      };

      capability.totalLatencyMs += result.durationMs;
      this._updateErrorRate(connector);

      this._logInvocation(invocationId, connectorId, capabilityName, true, result.durationMs);
      this.emit('capability:invoked', { connectorId, capability: capabilityName, durationMs: result.durationMs });

      return result;

    } catch (error) {
      capability.errorCount++;
      const durationMs = Date.now() - startTime;
      this._updateErrorRate(connector);
      this._logInvocation(invocationId, connectorId, capabilityName, false, durationMs);

      // Auto-disable if error rate too high
      if (connector.errorRate > this.autoDisableErrorRate && connector.vendor === 'community') {
        connector.status = 'disabled';
        connector.disabledReason = `Error rate ${Math.round(connector.errorRate * 100)}% exceeded threshold ${this.autoDisableErrorRate * 100}%`;
        this.emit('connector:auto-disabled', { connectorId, reason: connector.disabledReason });
      }

      return {
        success: false,
        invocationId,
        error: error.message,
        durationMs,
        retryable: true
      };
    }
  }

  performHealthChecks() {
    for (const [id, connector] of this.connectors) {
      if (connector.status === 'offline') continue;

      // Check heartbeat staleness
      const heartbeatAge = Date.now() - new Date(connector.lastHeartbeat).getTime();
      if (heartbeatAge > this.healthCheckInterval * 3) {
        if (connector.status === 'active') {
          connector.status = 'stale';
          this.emit('connector:stale', { connectorId: id, name: connector.name });
        }
      }

      // Simulate health check (in production, would HTTP GET the health endpoint)
      connector.health.checks++;
      const isHealthy = connector.status === 'active' && connector.errorRate < this.autoDisableErrorRate;

      if (isHealthy) {
        connector.health.uptime++;
        connector.health.consecutiveFailures = 0;
        connector.health.status = 'healthy';
      } else {
        connector.health.consecutiveFailures++;
        if (connector.health.consecutiveFailures >= this.unhealthyThreshold) {
          connector.health.status = 'unhealthy';
          this.emit('connector:unhealthy', { connectorId: id, name: connector.name, failures: connector.health.consecutiveFailures });
        } else {
          connector.health.status = 'degraded';
        }
      }

      connector.health.lastCheck = new Date().toISOString();

      // Store health history
      const history = this.healthHistory.get(id) || [];
      history.push({ timestamp: connector.health.lastCheck, status: connector.health.status });
      if (history.length > 100) history.splice(0, history.length - 100);
      this.healthHistory.set(id, history);
    }
  }

  startHealthChecks() {
    this._healthTimer = setInterval(() => this.performHealthChecks(), this.healthCheckInterval);
    return this;
  }

  stopHealthChecks() {
    if (this._healthTimer) clearInterval(this._healthTimer);
    return this;
  }

  getDashboard() {
    const connectors = Array.from(this.connectors.values());
    const active = connectors.filter(c => c.status === 'active');
    const healthy = connectors.filter(c => c.health.status === 'healthy');
    const degraded = connectors.filter(c => c.health.status === 'degraded');
    const unhealthy = connectors.filter(c => c.health.status === 'unhealthy');

    return {
      summary: {
        total: connectors.length,
        active: active.length,
        healthy: healthy.length,
        degraded: degraded.length,
        unhealthy: unhealthy.length,
        totalInvocations: connectors.reduce((s, c) => s + c.totalInvocations, 0)
      },
      connectors: connectors.map(c => ({
        name: c.name,
        status: c.status,
        health: c.health.status,
        uptime: c.health.checks > 0 ? `${Math.round((c.health.uptime / c.health.checks) * 100)}%` : 'N/A',
        p99ms: c.health.latencyP99Ms,
        errorRate: `${Math.round(c.errorRate * 10000) / 100}%`,
        vendor: c.vendor
      })),
      recentInvocations: this.invocationLog.slice(-20)
    };
  }

  _validateManifest(manifest) {
    const errors = [];
    if (!manifest.name || !/^[a-z][a-z0-9-]{2,48}$/.test(manifest.name)) {
      errors.push('name: required, lowercase with hyphens, 3-49 chars');
    }
    if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      errors.push('version: required, semver format (e.g., 1.0.0)');
    }
    if (!manifest.vendor || !['heady-official', 'heady-reviewed', 'community'].includes(manifest.vendor)) {
      errors.push('vendor: must be heady-official, heady-reviewed, or community');
    }
    if (!manifest.capabilities || !Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
      errors.push('capabilities: at least one capability required');
    }
    return errors;
  }

  _generateConnectorApiKey(connectorId) {
    return `mcp_${crypto.randomBytes(32).toString('hex')}`;
  }

  _updateErrorRate(connector) {
    if (connector.totalInvocations === 0) {
      connector.errorRate = 0;
      return;
    }
    const totalErrors = connector.capabilities.reduce((s, c) => s + c.errorCount, 0);
    connector.errorRate = totalErrors / connector.totalInvocations;
  }

  _logInvocation(id, connectorId, capability, success, durationMs) {
    this.invocationLog.push({
      id, connectorId, capability, success, durationMs,
      timestamp: new Date().toISOString()
    });
    if (this.invocationLog.length > this.maxLogSize) {
      this.invocationLog = this.invocationLog.slice(-this.maxLogSize / 2);
    }
  }
}

module.exports = { ConnectorRegistry };
