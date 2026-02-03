/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              ROUTING OPTIMIZER - Smart Task Routing          ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📥 TASK IN          🎯 PRIORITIZE        🔀 ROUTE          ✅ EXECUTE
 *        │                    │                  │                  │
 *        ▼                    ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────────┐    ┌──────────┐      ┌──────────┐
 *    │ Queue  │─────▶│Priority Queue│───▶│ Service  │─────▶│ Execute  │
 *    │ Task   │      │ H │ N │ L   │    │Selector  │      │ via MCP  │
 *    └────────┘      └──────────────┘    └──────────┘      └──────────┘
 *        │                    │                  │                  │
 *        │            ┌───────▼───────┐          │                  │
 *        │            │Circuit Breaker│          │                  │
 *        │            │Health Monitor │          │                  │
 *        │            └───────────────┘          │                  │
 *        └────────────────────┬──────────────────┴──────────────────┘
 *                             │
 *                             ▼
 *                    ┌─────────────────┐
 *                    │   ANALYTICS     │
 *                    │ Track & Learn   │
 *                    └─────────────────┘
 * 
 * Features:
 * - Priority queue management (high/normal/low)
 * - Circuit breaker pattern (prevents cascading failures)
 * - Service health monitoring (30s intervals)
 * - Adaptive routing based on performance
 * - Load balancing (score-based selection)
 * - Analytics and metrics (complete tracking)
 */

const EventEmitter = require('events');

class RoutingOptimizer extends EventEmitter {
  constructor(mcpManager, serviceSelector) {
    super();
    this.mcpManager = mcpManager;
    this.serviceSelector = serviceSelector;
    
    // Priority queue (high, normal, low)
    this.taskQueues = {
      high: [],
      normal: [],
      low: []
    };
    
    // Circuit breaker state
    this.circuitBreakers = new Map(); // service -> {state, failures, lastFailure}
    this.circuitBreakerThreshold = 5; // failures before opening
    this.circuitBreakerTimeout = 60000; // 60s before retry
    
    // Service health tracking
    this.serviceHealth = new Map(); // service -> {healthy, lastCheck, responseTime}
    
    // Performance metrics
    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      avgResponseTime: 0,
      tasksByPriority: { high: 0, normal: 0, low: 0 },
      tasksByService: new Map(),
      routingDecisions: []
    };
    
    // Adaptive routing history
    this.routingHistory = [];
    this.maxHistorySize = 1000;
    
    // Start background workers
    this.startHealthMonitoring();
    this.startQueueProcessor();
  }

  /**
   * Route a task with optimization
   * @param {Object} task - Task to route
   * @returns {Promise<Object>} Routing result
   */
  async routeTask(task) {
    const {
      description,
      priority = 'normal',
      timeout = 30000,
      retries = 3,
      context = {}
    } = task;

    this.metrics.totalTasks++;
    this.metrics.tasksByPriority[priority]++;

    const startTime = Date.now();
    
    try {
      // Get recommended services
      const recommendation = this.serviceSelector.recommendServices(description, context);
      
      // Apply circuit breaker filtering
      const availableServices = this.filterByCircuitBreaker(recommendation.services);
      
      // Apply health-based filtering
      const healthyServices = await this.filterByHealth(availableServices);
      
      // Select optimal service based on load and performance
      const selectedService = this.selectOptimalService(healthyServices, priority);
      
      // Record routing decision
      const decision = {
        timestamp: new Date().toISOString(),
        task: description,
        priority,
        recommended: recommendation.services,
        available: availableServices,
        healthy: healthyServices,
        selected: selectedService,
        reasoning: recommendation.reasoning,
        allocation: recommendation.allocation
      };
      
      this.recordRoutingDecision(decision);
      
      // Execute with timeout and retry
      const result = await this.executeWithRetry(
        selectedService,
        task,
        timeout,
        retries
      );
      
      const responseTime = Date.now() - startTime;
      
      // Update metrics
      this.metrics.completedTasks++;
      this.updateResponseTime(responseTime);
      this.recordSuccess(selectedService, responseTime);
      
      return {
        success: true,
        service: selectedService,
        result,
        responseTime,
        decision
      };
      
    } catch (error) {
      this.metrics.failedTasks++;
      this.recordFailure(task.service || 'unknown', error);
      
      throw error;
    }
  }

  /**
   * Add task to priority queue
   * @param {Object} task - Task to queue
   */
  queueTask(task) {
    const priority = task.priority || 'normal';
    this.taskQueues[priority].push({
      ...task,
      queuedAt: Date.now()
    });
    
    this.emit('task-queued', { priority, queueSize: this.taskQueues[priority].length });
  }

  /**
   * Filter services by circuit breaker state
   */
  filterByCircuitBreaker(services) {
    return services.filter(service => {
      const breaker = this.circuitBreakers.get(service);
      
      if (!breaker) return true; // No breaker = available
      
      if (breaker.state === 'closed') return true; // Closed = available
      
      if (breaker.state === 'open') {
        // Check if timeout has passed
        const timeSinceFailure = Date.now() - breaker.lastFailure;
        if (timeSinceFailure > this.circuitBreakerTimeout) {
          // Move to half-open state
          breaker.state = 'half-open';
          return true;
        }
        return false; // Still open
      }
      
      if (breaker.state === 'half-open') return true; // Allow test request
      
      return false;
    });
  }

  /**
   * Filter services by health status
   */
  async filterByHealth(services) {
    const healthy = [];
    
    for (const service of services) {
      const health = this.serviceHealth.get(service);
      
      if (!health) {
        // Unknown health, check now
        const isHealthy = await this.checkServiceHealth(service);
        if (isHealthy) healthy.push(service);
      } else if (health.healthy) {
        healthy.push(service);
      }
    }
    
    return healthy.length > 0 ? healthy : services; // Fallback to all if none healthy
  }

  /**
   * Select optimal service based on load and performance
   */
  selectOptimalService(services, priority) {
    if (services.length === 0) return null;
    if (services.length === 1) return services[0];
    
    // Score each service based on:
    // - Recent response times
    // - Current load
    // - Success rate
    // - Priority match
    
    const scores = services.map(service => {
      const history = this.getServiceHistory(service);
      const load = this.getServiceLoad(service);
      
      let score = 100;
      
      // Penalize high response times
      if (history.avgResponseTime > 5000) score -= 30;
      else if (history.avgResponseTime > 2000) score -= 15;
      
      // Penalize high load
      if (load > 0.8) score -= 25;
      else if (load > 0.5) score -= 10;
      
      // Penalize low success rate
      if (history.successRate < 0.9) score -= 20;
      else if (history.successRate < 0.95) score -= 10;
      
      // Boost for priority tasks if service supports it
      if (priority === 'high' && service === 'heady-windsurf-router') {
        score += 15;
      }
      
      return { service, score };
    });
    
    // Select highest scoring service
    scores.sort((a, b) => b.score - a.score);
    return scores[0].service;
  }

  /**
   * Execute task with timeout and retry logic
   */
  async executeWithRetry(service, task, timeout, maxRetries) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeWithTimeout(service, task, timeout);
        
        // Success - close circuit breaker if open
        this.closeCircuitBreaker(service);
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Record failure
        this.recordServiceFailure(service);
        
        // Don't retry on certain errors
        if (error.code === 'VALIDATION_ERROR' || error.code === 'AUTH_ERROR') {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await this.sleep(Math.min(1000 * Math.pow(2, attempt - 1), 10000));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Execute task with timeout
   */
  async executeWithTimeout(service, task, timeout) {
    return Promise.race([
      this.executeTask(service, task),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Task timeout')), timeout)
      )
    ]);
  }

  /**
   * Execute task on service
   */
  async executeTask(service, task) {
    // Route through MCP manager
    if (!this.mcpManager.clients.has(service)) {
      throw new Error(`Service ${service} not available`);
    }
    
    // Execute via MCP
    const result = await this.mcpManager.callTool(service, task.tool || 'execute', task.args || {});
    
    return result;
  }

  /**
   * Check service health
   */
  async checkServiceHealth(service) {
    try {
      const startTime = Date.now();
      
      // Simple health check - try to list tools
      if (this.mcpManager.clients.has(service)) {
        await this.mcpManager.clients.get(service).client.listTools();
        
        const responseTime = Date.now() - startTime;
        
        this.serviceHealth.set(service, {
          healthy: true,
          lastCheck: Date.now(),
          responseTime
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      this.serviceHealth.set(service, {
        healthy: false,
        lastCheck: Date.now(),
        error: error.message
      });
      
      return false;
    }
  }

  /**
   * Record service failure for circuit breaker
   */
  recordServiceFailure(service) {
    let breaker = this.circuitBreakers.get(service);
    
    if (!breaker) {
      breaker = { state: 'closed', failures: 0, lastFailure: null };
      this.circuitBreakers.set(service, breaker);
    }
    
    breaker.failures++;
    breaker.lastFailure = Date.now();
    
    // Open circuit if threshold exceeded
    if (breaker.failures >= this.circuitBreakerThreshold) {
      breaker.state = 'open';
      this.emit('circuit-breaker-opened', { service, failures: breaker.failures });
    }
  }

  /**
   * Close circuit breaker on success
   */
  closeCircuitBreaker(service) {
    const breaker = this.circuitBreakers.get(service);
    
    if (breaker && breaker.state !== 'closed') {
      breaker.state = 'closed';
      breaker.failures = 0;
      this.emit('circuit-breaker-closed', { service });
    }
  }

  /**
   * Record routing decision for analytics
   */
  recordRoutingDecision(decision) {
    this.routingHistory.push(decision);
    
    // Keep history size manageable
    if (this.routingHistory.length > this.maxHistorySize) {
      this.routingHistory.shift();
    }
    
    this.metrics.routingDecisions.push({
      timestamp: decision.timestamp,
      service: decision.selected,
      priority: decision.priority
    });
  }

  /**
   * Record successful execution
   */
  recordSuccess(service, responseTime) {
    if (!this.metrics.tasksByService.has(service)) {
      this.metrics.tasksByService.set(service, {
        total: 0,
        successful: 0,
        failed: 0,
        totalResponseTime: 0
      });
    }
    
    const stats = this.metrics.tasksByService.get(service);
    stats.total++;
    stats.successful++;
    stats.totalResponseTime += responseTime;
  }

  /**
   * Record failure
   */
  recordFailure(service, _error) {
    if (!this.metrics.tasksByService.has(service)) {
      this.metrics.tasksByService.set(service, {
        total: 0,
        successful: 0,
        failed: 0,
        totalResponseTime: 0
      });
    }
    
    const stats = this.metrics.tasksByService.get(service);
    stats.total++;
    stats.failed++;
  }

  /**
   * Update average response time
   */
  updateResponseTime(responseTime) {
    const total = this.metrics.completedTasks;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (total - 1) + responseTime) / total;
  }

  /**
   * Get service history
   */
  getServiceHistory(service) {
    const stats = this.metrics.tasksByService.get(service) || {
      total: 0,
      successful: 0,
      failed: 0,
      totalResponseTime: 0
    };
    
    return {
      total: stats.total,
      successRate: stats.total > 0 ? stats.successful / stats.total : 1,
      avgResponseTime: stats.successful > 0 ? stats.totalResponseTime / stats.successful : 0
    };
  }

  /**
   * Get service load (simulated - would integrate with actual metrics)
   */
  getServiceLoad(_service) {
    // For now, return random load
    // In production, this would query actual service metrics
    return Math.random() * 0.7; // 0-70% load
  }

  /**
   * Start health monitoring background worker
   */
  startHealthMonitoring() {
    setInterval(async () => {
      const services = this.serviceSelector ? 
        Object.keys(this.serviceSelector.availableServices) : 
        [];
      
      for (const service of services) {
        await this.checkServiceHealth(service);
      }
    }, 30000); // Check every 30s
  }

  /**
   * Start queue processor
   */
  startQueueProcessor() {
    setInterval(async () => {
      // Process high priority first
      for (const priority of ['high', 'normal', 'low']) {
        const queue = this.taskQueues[priority];
        
        while (queue.length > 0) {
          const task = queue.shift();
          
          try {
            await this.routeTask(task);
          } catch (error) {
            console.error('[ROUTING] Task failed:', error.message);
          }
        }
      }
    }, 1000); // Process every second
  }

  /**
   * Get routing analytics
   */
  getAnalytics() {
    const serviceStats = {};
    for (const [service, stats] of this.metrics.tasksByService.entries()) {
      serviceStats[service] = {
        ...stats,
        successRate: stats.total > 0 ? (stats.successful / stats.total * 100).toFixed(2) + '%' : 'N/A',
        avgResponseTime: stats.successful > 0 ? 
          (stats.totalResponseTime / stats.successful).toFixed(0) + 'ms' : 'N/A'
      };
    }
    
    const circuitBreakerStatus = {};
    for (const [service, breaker] of this.circuitBreakers.entries()) {
      circuitBreakerStatus[service] = {
        state: breaker.state,
        failures: breaker.failures
      };
    }
    
    const healthStatus = {};
    for (const [service, health] of this.serviceHealth.entries()) {
      healthStatus[service] = {
        healthy: health.healthy,
        responseTime: health.responseTime ? health.responseTime + 'ms' : 'N/A',
        lastCheck: new Date(health.lastCheck).toISOString()
      };
    }
    
    return {
      overview: {
        totalTasks: this.metrics.totalTasks,
        completed: this.metrics.completedTasks,
        failed: this.metrics.failedTasks,
        successRate: this.metrics.totalTasks > 0 ? 
          ((this.metrics.completedTasks / this.metrics.totalTasks) * 100).toFixed(2) + '%' : 'N/A',
        avgResponseTime: this.metrics.avgResponseTime.toFixed(0) + 'ms'
      },
      byPriority: this.metrics.tasksByPriority,
      byService: serviceStats,
      circuitBreakers: circuitBreakerStatus,
      serviceHealth: healthStatus,
      queueSizes: {
        high: this.taskQueues.high.length,
        normal: this.taskQueues.normal.length,
        low: this.taskQueues.low.length
      }
    };
  }

  /**
   * Get recent routing decisions
   */
  getRecentDecisions(limit = 10) {
    return this.routingHistory.slice(-limit);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = RoutingOptimizer;
