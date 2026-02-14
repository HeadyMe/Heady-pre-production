/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  soul/soul-orchestrator.js                                     ║
 * ║  HeadySoul v2.0 — Proactive Global Orchestrator                ║
 * ║                                                                ║
 * ║  Upgrades HeadySoul from reactive evaluator to:                ║
 * ║  - DAG composer (decomposes goals into task graphs)            ║
 * ║  - Priority driver (value weights drive execution order)       ║
 * ║  - Resource allocator (zero-idle, intelligent parallelism)     ║
 * ║  - Continuous optimizer (learns, adapts, self-improves)        ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
// GOAL → DAG DECOMPOSER
// ═══════════════════════════════════════════════════════════════

class GoalDecomposer {
  constructor(valueWeights) {
    this.valueWeights = valueWeights;
    this.templates = new Map();
    this._registerBuiltinTemplates();
  }

  /**
   * Decompose a high-level goal into a DAG of tasks
   * Each task has: id, type, dependencies, priority, estimated_duration_ms, metadata
   */
  decompose(goal) {
    const template = this._findTemplate(goal);
    if (template) {
      return this._applyTemplate(template, goal);
    }
    // No template — create single-task DAG
    return {
      id: `dag-${crypto.randomUUID().slice(0, 8)}`,
      goal: goal.description || goal.id,
      tasks: [{
        id: `task-${crypto.randomUUID().slice(0, 8)}`,
        type: goal.type || 'general',
        description: goal.description || 'Execute goal',
        dependencies: [],
        priority: goal.priority || 'P1',
        estimated_duration_ms: goal.estimated_duration_ms || 5000,
        metadata: { ...(goal.metadata || {}), source: 'direct' }
      }],
      edges: [],
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Compose multiple DAGs into a unified execution graph
   * Resolves cross-DAG dependencies and optimizes parallelism
   */
  compose(dags) {
    const unified = {
      id: `unified-${crypto.randomUUID().slice(0, 8)}`,
      goal: `Composed: ${dags.map(d => d.goal).join(' + ')}`,
      tasks: [],
      edges: [],
      createdAt: new Date().toISOString()
    };

    for (const dag of dags) {
      unified.tasks.push(...dag.tasks);
      unified.edges.push(...dag.edges);
    }

    // Detect implicit dependencies (same resource, conflicting writes)
    const resourceMap = new Map();
    for (const task of unified.tasks) {
      const resources = task.metadata?.resources || [];
      for (const r of resources) {
        if (!resourceMap.has(r)) resourceMap.set(r, []);
        resourceMap.get(r).push(task.id);
      }
    }

    // Add implicit edges for resource conflicts
    for (const [resource, taskIds] of resourceMap) {
      for (let i = 1; i < taskIds.length; i++) {
        const existing = unified.edges.find(e => e.from === taskIds[i - 1] && e.to === taskIds[i]);
        if (!existing) {
          unified.edges.push({
            from: taskIds[i - 1],
            to: taskIds[i],
            type: 'resource_conflict',
            resource
          });
        }
      }
    }

    return unified;
  }

  _findTemplate(goal) {
    const type = goal.type || '';
    const desc = (goal.description || '').toLowerCase();
    for (const [key, template] of this.templates) {
      if (type === key || desc.includes(key)) return template;
    }
    return null;
  }

  _applyTemplate(template, goal) {
    const dagId = `dag-${crypto.randomUUID().slice(0, 8)}`;
    const tasks = template.tasks.map(t => ({
      ...t,
      id: `${dagId}-${t.id}`,
      dependencies: t.dependencies.map(d => `${dagId}-${d}`),
      metadata: { ...t.metadata, ...(goal.metadata || {}), template: template.name }
    }));

    const edges = [];
    for (const task of tasks) {
      for (const dep of task.dependencies) {
        edges.push({ from: dep, to: task.id, type: 'dependency' });
      }
    }

    return { id: dagId, goal: goal.description || template.name, tasks, edges, createdAt: new Date().toISOString() };
  }

  _registerBuiltinTemplates() {
    // Build + Deploy template
    this.templates.set('deploy', {
      name: 'build-and-deploy',
      tasks: [
        { id: 'lint', type: 'lint', description: 'Code quality check', dependencies: [], priority: 'P1', estimated_duration_ms: 3000, metadata: {} },
        { id: 'test', type: 'test', description: 'Run test suite', dependencies: [], priority: 'P1', estimated_duration_ms: 10000, metadata: {} },
        { id: 'security', type: 'security', description: 'Security audit', dependencies: [], priority: 'P0', estimated_duration_ms: 5000, metadata: {} },
        { id: 'build', type: 'build', description: 'Build artifacts', dependencies: ['lint', 'test', 'security'], priority: 'P0', estimated_duration_ms: 15000, metadata: {} },
        { id: 'drift-check', type: 'drift', description: 'Configuration drift check', dependencies: ['build'], priority: 'P1', estimated_duration_ms: 5000, metadata: {} },
        { id: 'deploy-staging', type: 'deployment', description: 'Deploy to staging', dependencies: ['build', 'drift-check'], priority: 'P0', estimated_duration_ms: 30000, metadata: { env: 'staging' } },
        { id: 'verify-staging', type: 'verify', description: 'Verify staging health', dependencies: ['deploy-staging'], priority: 'P0', estimated_duration_ms: 10000, metadata: {} },
        { id: 'deploy-prod', type: 'deployment', description: 'Deploy to production', dependencies: ['verify-staging'], priority: 'P0', estimated_duration_ms: 30000, metadata: { env: 'production', user_facing: true } }
      ]
    });

    // Site generation template
    this.templates.set('generate-sites', {
      name: 'generate-all-sites',
      tasks: [
        { id: 'shared-assets', type: 'build', description: 'Generate shared CSS/JS assets', dependencies: [], priority: 'P1', estimated_duration_ms: 2000, metadata: { resources: ['sites/shared'] } },
        { id: 'site-headysystems', type: 'site-gen', description: 'Build headysystems.com', dependencies: ['shared-assets'], priority: 'P0', estimated_duration_ms: 3000, metadata: { domain: 'headysystems.com', user_facing: true } },
        { id: 'site-headybuddy', type: 'site-gen', description: 'Build headybuddy.org', dependencies: ['shared-assets'], priority: 'P0', estimated_duration_ms: 3000, metadata: { domain: 'headybuddy.org', user_facing: true } },
        { id: 'site-headycheck', type: 'site-gen', description: 'Build headycheck.com', dependencies: ['shared-assets'], priority: 'P1', estimated_duration_ms: 3000, metadata: { domain: 'headycheck.com', user_facing: true } },
        { id: 'site-headyio', type: 'site-gen', description: 'Build headyio.com', dependencies: ['shared-assets'], priority: 'P1', estimated_duration_ms: 3000, metadata: { domain: 'headyio.com', user_facing: true } },
        { id: 'site-headymcp', type: 'site-gen', description: 'Build headymcp.com', dependencies: ['shared-assets'], priority: 'P1', estimated_duration_ms: 3000, metadata: { domain: 'headymcp.com', user_facing: true } },
        { id: 'site-headybot', type: 'site-gen', description: 'Build headybot.com', dependencies: ['shared-assets'], priority: 'P1', estimated_duration_ms: 3000, metadata: { domain: 'headybot.com', user_facing: true } },
        { id: 'site-headycloud', type: 'site-gen', description: 'Build headycloud.com', dependencies: ['shared-assets'], priority: 'P1', estimated_duration_ms: 3000, metadata: { domain: 'headycloud.com', user_facing: true } },
        { id: 'site-headyconnection', type: 'site-gen', description: 'Build headyconnection.com', dependencies: ['shared-assets'], priority: 'P1', estimated_duration_ms: 3000, metadata: { domain: 'headyconnection.com', user_facing: true } },
        { id: 'verify-sites', type: 'verify', description: 'Verify all sites render', dependencies: ['site-headysystems', 'site-headybuddy', 'site-headycheck', 'site-headyio', 'site-headymcp', 'site-headybot', 'site-headycloud', 'site-headyconnection'], priority: 'P0', estimated_duration_ms: 5000, metadata: {} }
      ]
    });

    // HCFP rebuild template
    this.templates.set('rebuild', {
      name: 'hcfp-rebuild',
      tasks: [
        { id: 'snapshot', type: 'checkpoint', description: 'Create pre-rebuild checkpoint', dependencies: [], priority: 'P0', estimated_duration_ms: 5000, metadata: {} },
        { id: 'drift-scan', type: 'drift', description: 'Full drift detection scan', dependencies: ['snapshot'], priority: 'P0', estimated_duration_ms: 10000, metadata: {} },
        { id: 'dep-update', type: 'build', description: 'Update and lock dependencies', dependencies: ['drift-scan'], priority: 'P1', estimated_duration_ms: 15000, metadata: { resources: ['package-lock.json'] } },
        { id: 'build-verify', type: 'build', description: 'Deterministic build + verify', dependencies: ['dep-update'], priority: 'P0', estimated_duration_ms: 30000, metadata: {} },
        { id: 'test-full', type: 'test', description: 'Full test suite', dependencies: ['build-verify'], priority: 'P0', estimated_duration_ms: 20000, metadata: {} },
        { id: 'deploy-canary', type: 'deployment', description: 'Canary deployment', dependencies: ['test-full'], priority: 'P0', estimated_duration_ms: 30000, metadata: { env: 'staging', canary: true } },
        { id: 'promote', type: 'deployment', description: 'Promote to production', dependencies: ['deploy-canary'], priority: 'P0', estimated_duration_ms: 30000, metadata: { env: 'production', user_facing: true } }
      ]
    });

    // Public Domain Deep Scan template
    this.templates.set('public_domain_deep_scan', {
      name: 'public-domain-scan',
      tasks: [
        { id: 'scan-patterns', type: 'scan', description: 'Scan public domain pattern registry', dependencies: [], priority: 'P0', estimated_duration_ms: 8000, metadata: { source: 'public-domain-patterns.md' } },
        { id: 'analyze-implementations', type: 'analysis', description: 'Analyze current Heady implementations', dependencies: [], priority: 'P0', estimated_duration_ms: 12000, metadata: {} },
        { id: 'compare-performance', type: 'comparison', description: 'Compare performance metrics', dependencies: ['scan-patterns', 'analyze-implementations'], priority: 'P0', estimated_duration_ms: 10000, metadata: {} },
        { id: 'evaluate-complexity', type: 'evaluation', description: 'Evaluate implementation complexity', dependencies: ['scan-patterns', 'analyze-implementations'], priority: 'P1', estimated_duration_ms: 6000, metadata: {} },
        { id: 'generate-report', type: 'report', description: 'Generate comparison report', dependencies: ['compare-performance', 'evaluate-complexity'], priority: 'P0', estimated_duration_ms: 5000, metadata: { user_facing: true } },
        { id: 'store-results', type: 'storage', description: 'Store results for future reference', dependencies: ['generate-report'], priority: 'P1', estimated_duration_ms: 3000, metadata: {} }
      ]
    });
  }

  registerTemplate(key, template) {
    this.templates.set(key, template);
  }
}

// ═══════════════════════════════════════════════════════════════
// VALUE-DRIVEN PRIORITY ENGINE
// ═══════════════════════════════════════════════════════════════

class ValueDrivenPriorityEngine {
  constructor(soul) {
    this.soul = soul;
    this.weights = (soul && soul.valueWeights && typeof soul.valueWeights.getWeights === 'function')
      ? soul.valueWeights.getWeights()
      : { access: 0.30, fairness: 0.25, intelligence: 0.20, happiness: 0.15, redistribution: 0.10 };
  }

  /**
   * Score and sort tasks by value-driven priority
   * Returns tasks in execution order
   */
  async prioritize(tasks) {
    const scored = [];

    for (const task of tasks) {
      const baseScore = this._basePriorityScore(task);
      const valueScore = this._valueAlignmentScore(task);
      const urgencyScore = this._urgencyScore(task);
      const impactScore = this._impactScore(task);

      const compositeScore =
        baseScore * 0.25 +
        valueScore * 0.35 +
        urgencyScore * 0.20 +
        impactScore * 0.20;

      scored.push({
        ...task,
        _scores: {
          base: Math.round(baseScore * 100) / 100,
          value: Math.round(valueScore * 100) / 100,
          urgency: Math.round(urgencyScore * 100) / 100,
          impact: Math.round(impactScore * 100) / 100,
          composite: Math.round(compositeScore * 100) / 100
        },
        _executionPriority: compositeScore
      });
    }

    // Sort by composite score descending, then by dependency depth ascending
    return scored.sort((a, b) => {
      // Tasks with no dependencies run first within same priority tier
      const depDiff = (a.dependencies?.length || 0) - (b.dependencies?.length || 0);
      const scoreDiff = b._executionPriority - a._executionPriority;
      return scoreDiff !== 0 ? scoreDiff : depDiff;
    });
  }

  _basePriorityScore(task) {
    const map = { P0: 1.0, P1: 0.75, P2: 0.5, P3: 0.25 };
    return map[task.priority] || 0.5;
  }

  _valueAlignmentScore(task) {
    let score = 0.5; // Neutral default
    const meta = task.metadata || {};
    const type = task.type || '';

    // Access: tasks that increase user access score higher
    if (meta.user_facing) score += this.weights.access * 0.5;
    if (type === 'site-gen') score += this.weights.access * 0.4;

    // Fairness: nonprofits, PPP pricing, free tier
    if (meta.nonprofit) score += this.weights.fairness * 0.5;
    if (meta.ppp) score += this.weights.fairness * 0.3;

    // Intelligence: deterministic builds, tests, drift detection
    if (type === 'test') score += this.weights.intelligence * 0.4;
    if (type === 'drift') score += this.weights.intelligence * 0.5;
    if (type === 'build') score += this.weights.intelligence * 0.3;

    // Happiness: UX improvements, bug fixes
    if (meta.ux) score += this.weights.happiness * 0.5;
    if (type === 'fix') score += this.weights.happiness * 0.4;

    // Redistribution: open source, community features
    if (meta.open_source) score += this.weights.redistribution * 0.5;
    if (meta.community) score += this.weights.redistribution * 0.4;

    return Math.min(score, 1.0);
  }

  _urgencyScore(task) {
    if (task.priority === 'P0') return 1.0;
    if (task.metadata?.deadline) {
      const remaining = new Date(task.metadata.deadline).getTime() - Date.now();
      if (remaining < 3600000) return 1.0;  // < 1 hour
      if (remaining < 86400000) return 0.8; // < 1 day
      return 0.5;
    }
    return 0.5;
  }

  _impactScore(task) {
    let score = 0.5;
    const meta = task.metadata || {};
    // Tasks that unblock many others score higher
    if (meta.blocks && meta.blocks > 3) score += 0.3;
    if (meta.user_facing) score += 0.2;
    if (task.type === 'deployment') score += 0.2;
    return Math.min(score, 1.0);
  }
}

// ═══════════════════════════════════════════════════════════════
// PARALLEL EXECUTION ENGINE
// ═══════════════════════════════════════════════════════════════

class ParallelExecutionEngine extends EventEmitter {
  constructor(options = {}) {
    super();
    this.maxConcurrent = options.maxConcurrent || 8;
    this.running = new Map();
    this.completed = new Map();
    this.failed = new Map();
    this.taskHandlers = new Map();
    this.fairAccessMinimum = options.fairAccessMinimum || 0.20;
    this.metrics = {
      totalExecuted: 0,
      totalDuration: 0,
      maxConcurrentReached: 0,
      idleTimeMs: 0,
      lastIdleStart: null
    };
  }

  registerHandler(taskType, handler) {
    this.taskHandlers.set(taskType, handler);
  }

  /**
   * Execute a DAG with maximum parallelism respecting dependencies
   */
  async executeDag(dag, soulRef) {
    const startTime = Date.now();
    const remaining = new Set(dag.tasks.map(t => t.id));
    const taskMap = new Map(dag.tasks.map(t => [t.id, t]));
    const results = new Map();

    this.emit('dag:start', { dagId: dag.id, goal: dag.goal, taskCount: dag.tasks.length });

    while (remaining.size > 0) {
      // Find ready tasks (all dependencies completed)
      const ready = [];
      for (const id of remaining) {
        const task = taskMap.get(id);
        if (this.running.has(id)) continue;
        const depsComplete = (task.dependencies || []).every(d => this.completed.has(d));
        const depsFailed = (task.dependencies || []).some(d => this.failed.has(d));

        if (depsFailed) {
          // Dependency failed — skip this task
          remaining.delete(id);
          this.failed.set(id, { error: 'dependency_failed', task });
          this.emit('task:skipped', { taskId: id, reason: 'dependency_failed' });
          continue;
        }

        if (depsComplete) {
          ready.push(task);
        }
      }

      if (ready.length === 0 && this.running.size === 0) {
        // Deadlock or all done
        break;
      }

      // Fill available slots with ready tasks
      const slots = this.maxConcurrent - this.running.size;
      const toRun = ready.slice(0, slots);

      if (toRun.length > 0 && this.metrics.lastIdleStart) {
        this.metrics.idleTimeMs += Date.now() - this.metrics.lastIdleStart;
        this.metrics.lastIdleStart = null;
      }

      // Launch tasks in parallel
      const promises = toRun.map(task => {
        remaining.delete(task.id);
        return this._executeTask(task, soulRef).then(result => {
          this.completed.set(task.id, result);
          results.set(task.id, result);
          this.running.delete(task.id);
        }).catch(err => {
          this.failed.set(task.id, { error: err.message, task });
          results.set(task.id, { error: err.message });
          this.running.delete(task.id);
        });
      });

      if (promises.length === 0) {
        // Wait for running tasks to complete
        await Promise.race(Array.from(this.running.values()));
      } else {
        // Wait for at least one to complete before next cycle
        await Promise.race([...promises, ...Array.from(this.running.values())].filter(Boolean));
      }

      // Track max concurrent
      if (this.running.size > this.metrics.maxConcurrentReached) {
        this.metrics.maxConcurrentReached = this.running.size;
      }

      // Zero-idle check
      if (this.running.size === 0 && remaining.size > 0) {
        this.metrics.lastIdleStart = Date.now();
      }
    }

    const totalDuration = Date.now() - startTime;
    this.metrics.totalDuration += totalDuration;

    const report = {
      dagId: dag.id,
      goal: dag.goal,
      totalTasks: dag.tasks.length,
      completed: this.completed.size,
      failed: this.failed.size,
      skipped: dag.tasks.length - this.completed.size - this.failed.size,
      totalDurationMs: totalDuration,
      maxConcurrent: this.metrics.maxConcurrentReached,
      idleTimeMs: this.metrics.idleTimeMs,
      utilization: totalDuration > 0 ? Math.round((1 - this.metrics.idleTimeMs / totalDuration) * 100) : 100,
      results: Object.fromEntries(results),
      timestamp: new Date().toISOString()
    };

    this.emit('dag:complete', report);

    // Reset for next DAG
    this.running.clear();
    this.completed.clear();
    this.failed.clear();
    this.metrics.maxConcurrentReached = 0;
    this.metrics.idleTimeMs = 0;
    this.metrics.lastIdleStart = null;

    return report;
  }

  async _executeTask(task, soulRef) {
    const startTime = Date.now();
    this.metrics.totalExecuted++;

    // Soul evaluation before execution
    let soulDecision = { auto_approve: true, score: 75 };
    if (soulRef && typeof soulRef.evaluateTask === 'function') {
      try {
        soulDecision = await soulRef.evaluateTask(task);
        if (soulDecision.veto) {
          this.emit('task:vetoed', { taskId: task.id, reason: soulDecision.reason });
          return { status: 'vetoed', reason: soulDecision.reason, soulScore: soulDecision.score };
        }
      } catch (e) {
        // Soul eval failure is non-fatal — proceed with caution
        soulDecision = { auto_approve: true, score: 50, error: e.message };
      }
    }

    this.emit('task:start', { taskId: task.id, type: task.type, description: task.description });

    try {
      const handler = this.taskHandlers.get(task.type);
      let result;

      if (handler) {
        result = await handler(task);
      } else {
        // Default handler — simulate execution
        await new Promise(r => setTimeout(r, Math.min(task.estimated_duration_ms || 1000, 5000)));
        result = { status: 'completed', simulated: true };
      }

      const duration = Date.now() - startTime;
      this.emit('task:complete', {
        taskId: task.id, type: task.type,
        durationMs: duration, soulScore: soulDecision.score, result
      });

      return { ...result, durationMs: duration, soulScore: soulDecision.score };
    } catch (err) {
      const duration = Date.now() - startTime;
      this.emit('task:error', { taskId: task.id, error: err.message, durationMs: duration });
      throw err;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SOUL ORCHESTRATOR — THE UNIFIED DECISION AUTHORITY
// ═══════════════════════════════════════════════════════════════

class SoulOrchestrator extends EventEmitter {
  constructor(soul, intelligenceEngine) {
    super();
    this.soul = soul;
    this.intelligenceEngine = intelligenceEngine;
    this.decomposer = new GoalDecomposer(soul?.valueWeights);
    this.priorityEngine = new ValueDrivenPriorityEngine(soul);
    this.executor = new ParallelExecutionEngine({ maxConcurrent: 8 });
    this.activeWorkloads = new Map();
    this.completedWorkloads = [];
    this.maxHistory = 200;
    this.started = false;

    // Wire executor events to soul
    this.executor.on('dag:start', (e) => this.emit('workload:start', e));
    this.executor.on('dag:complete', (e) => {
      this.completedWorkloads.push(e);
      if (this.completedWorkloads.length > this.maxHistory) {
        this.completedWorkloads = this.completedWorkloads.slice(-this.maxHistory);
      }
      this.emit('workload:complete', e);
    });
    this.executor.on('task:vetoed', (e) => this.emit('task:vetoed', e));
    this.executor.on('task:start', (e) => this.emit('task:start', e));
    this.executor.on('task:complete', (e) => this.emit('task:complete', e));
    this.executor.on('task:error', (e) => this.emit('task:error', e));
  }

  start() {
    if (this.started) return;
    this.started = true;
    console.log('[SoulOrchestrator] Global orchestrator ACTIVE — HeadySoul drives all execution');
    this.emit('orchestrator:started');
  }

  stop() {
    this.started = false;
    this.emit('orchestrator:stopped');
  }

  /**
   * THE main entry point: submit a goal, get back a fully executed result
   *
   * Goal → Decompose → Prioritize → Soul-evaluate → Execute parallel → Report
   */
  async executeGoal(goal) {
    if (!this.started) this.start();

    const workloadId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[SoulOrchestrator] Goal received: "${goal.description || goal.type}"`);

    // 1. DECOMPOSE: Goal → DAG
    const dag = this.decomposer.decompose(goal);
    console.log(`[SoulOrchestrator] Decomposed into ${dag.tasks.length} tasks`);

    // 2. PRIORITIZE: Sort tasks by value-driven priority
    dag.tasks = await this.priorityEngine.prioritize(dag.tasks);
    console.log(`[SoulOrchestrator] Prioritized — top task: ${dag.tasks[0]?.description} (score: ${dag.tasks[0]?._scores?.composite})`);

    // 3. EXECUTE: Run DAG with maximum parallelism, soul-governed
    this.activeWorkloads.set(workloadId, {
      goal, dag, startedAt: new Date().toISOString(), status: 'running'
    });

    const report = await this.executor.executeDag(dag, this.soul);

    // 4. REPORT: Package results
    report.workloadId = workloadId;
    report.totalDurationMs = Date.now() - startTime;

    this.activeWorkloads.delete(workloadId);

    // 5. LEARN: Feed results back to intelligence engine
    if (this.intelligenceEngine?.repoIndexer) {
      for (const task of dag.tasks) {
        const result = report.results?.[task.id];
        if (result?.durationMs) {
          this.intelligenceEngine.repoIndexer.recordTaskDuration(
            task.type, task.estimated_duration_ms, result.durationMs
          );
        }
      }
    }

    // 6. AUDIT: Soul audits the completed workload
    if (this.soul?.auditPipelineRun) {
      try { this.soul.auditPipelineRun(workloadId); } catch (e) { /* non-fatal */ }
    }

    console.log(`[SoulOrchestrator] Goal complete: ${report.completed}/${report.totalTasks} tasks, ${report.utilization}% utilization, ${report.totalDurationMs}ms`);

    return report;
  }

  /**
   * Execute multiple goals with intelligent ordering
   * Goals are composed into a unified DAG for maximum parallelism
   */
  async executeGoals(goals) {
    const dags = goals.map(g => this.decomposer.decompose(g));
    const unified = this.decomposer.compose(dags);
    unified.tasks = await this.priorityEngine.prioritize(unified.tasks);
    return this.executor.executeDag(unified, this.soul);
  }

  /**
   * Register a task handler for a specific task type
   */
  registerHandler(taskType, handler) {
    this.executor.registerHandler(taskType, handler);
  }

  /**
   * Register a DAG template for a goal type
   */
  registerTemplate(key, template) {
    this.decomposer.registerTemplate(key, template);
  }

  getState() {
    return {
      protocol: 'SoulOrchestrator v2.0 — Proactive Global Orchestrator',
      status: this.started ? 'active' : 'stopped',
      activeWorkloads: this.activeWorkloads.size,
      completedWorkloads: this.completedWorkloads.length,
      registeredTemplates: this.decomposer.templates.size,
      registeredHandlers: this.executor.taskHandlers.size,
      executionMetrics: {
        totalExecuted: this.executor.metrics.totalExecuted,
        totalDurationMs: this.executor.metrics.totalDuration
      },
      soulStatus: this.soul?.started ? 'active' : 'stopped',
      timestamp: new Date().toISOString()
    };
  }

  getHistory(limit = 20) {
    return this.completedWorkloads.slice(-limit);
  }
}

module.exports = { SoulOrchestrator, GoalDecomposer, ValueDrivenPriorityEngine, ParallelExecutionEngine };
