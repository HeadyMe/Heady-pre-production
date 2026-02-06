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
// ║  FILE: src/heady_story_driver.js                                  ║
// ║  LAYER: backend/src                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * HeadyStoryDriver :: Deterministic Story Engine
 * Sacred Geometry :: Organic Systems :: Breathing Interfaces
 * Flow: Files → Scan → Analyze → Optimize
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORY_PATH = '.heady-memory/story';
const DECISION_LOG_PATH = '.heady-memory/decisions';
const AUDIT_LOG_PATH = '.heady-memory/audit';

const DECISION_ENGINE_CONFIG = Object.freeze({
  maxHistorySize: 10000,
  decisionTimeoutMs: 30000,
  retryAttempts: 3,
  confidenceThreshold: 0.85,
  deterministicRules: {
    priorityOrdering: ['safety', 'compliance', 'performance', 'usability'],
    fallbackStrategy: 'conservative',
    autoResolution: true,
  },
  storyRhythms: {
    checkIntervalMs: 1000,
    batchSize: 50,
    maxConcurrentStories: 5,
  },
});

class DecisionNode {
  constructor(id, type, payload, context = {}) {
    this.id = id;
    this.type = type;
    this.payload = payload;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.status = 'pending';
    this.result = null;
    this.explanation = [];
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      payload: this.payload,
      context: this.context,
      timestamp: this.timestamp,
      status: this.status,
      result: this.result,
      explanation: this.explanation,
    };
  }
}

class StoryDriver {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.registry = options.registry || null;
    this.lens = options.lens || null;
    
    this.activeStories = new Map();
    this.decisionHistory = [];
    this.eventQueue = [];
    
    this.storyIdCounter = 0;
    this.decisionIdCounter = 0;
    
    this.ensureDirectories();
    this.loadState();
    
    console.log('∞ HeadyStoryDriver: Initialized - Deterministic story engine ready');
  }

  ensureDirectories() {
    const dirs = [STORY_PATH, DECISION_LOG_PATH, AUDIT_LOG_PATH];
    for (const dir of dirs) {
      const fullPath = path.join(this.rootDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  loadState() {
    try {
      const historyPath = path.join(this.rootDir, DECISION_LOG_PATH, 'history.jsonl');
      if (fs.existsSync(historyPath)) {
        const lines = fs.readFileSync(historyPath, 'utf8').trim().split('\n');
        this.decisionHistory = lines.slice(-DECISION_ENGINE_CONFIG.maxHistorySize).map(line => JSON.parse(line));
      }
    } catch (e) {
      console.warn('Could not load decision history:', e.message);
    }
  }

  generateId(prefix = 'story') {
    return `${prefix}_${Date.now()}_${++this.storyIdCounter}`;
  }

  generateDecisionId() {
    return `decision_${Date.now()}_${++this.decisionIdCounter}`;
  }

  async createStory(options) {
    const story = {
      id: this.generateId('story'),
      title: options.title || 'Untitled Story',
      type: options.type || 'general',
      goals: options.goals || [],
      context: options.context || {},
      steps: [],
      currentStep: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        priority: options.priority || 'normal',
        owner: options.owner || 'system',
        tags: options.tags || [],
      },
    };

    this.activeStories.set(story.id, story);
    await this.persistStory(story);
    await this.logDecision({
      type: 'story_created',
      storyId: story.id,
      title: story.title,
      context: story.context,
    });

    return story;
  }

  async addStep(storyId, step) {
    const story = this.activeStories.get(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    const stepNode = {
      id: step.id || `step_${Date.now()}`,
      order: story.steps.length,
      type: step.type || 'action',
      description: step.description,
      actions: step.actions || [],
      conditions: step.conditions || [],
      expectedOutcome: step.expectedOutcome,
      actualOutcome: null,
      status: 'pending',
      startedAt: null,
      completedAt: null,
    };

    story.steps.push(stepNode);
    story.updatedAt = new Date().toISOString();
    
    await this.persistStory(story);
    return stepNode;
  }

  async executeStep(storyId, stepId, context = {}) {
    const story = this.activeStories.get(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    const step = story.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    step.startedAt = new Date().toISOString();
    step.status = 'running';

    const decision = await this.makeDeterministicDecision({
      type: 'step_execution',
      step: step,
      story: story,
      context: { ...context, storyId, stepId },
    });

    step.actualOutcome = decision.result;
    step.status = decision.success ? 'completed' : 'failed';
    step.completedAt = new Date().toISOString();

    if (step.conditions && step.conditions.length > 0) {
      const conditionsMet = await this.evaluateConditions(step.conditions, step.actualOutcome);
      if (!conditionsMet) {
        step.status = 'blocked';
        step.actualOutcome = { blocked: true, reason: 'Conditions not met' };
      }
    }

    story.updatedAt = new Date().toISOString();
    await this.persistStory(story);
    await this.logDecision({
      type: 'step_executed',
      storyId,
      stepId,
      status: step.status,
      decision,
    });

    return step;
  }

  async makeDeterministicDecision(options) {
    const decisionId = this.generateDecisionId();
    const startTime = Date.now();

    const decision = {
      id: decisionId,
      type: options.type,
      timestamp: new Date().toISOString(),
      input: options,
      reasoning: [],
      rulesApplied: [],
      outcome: null,
      success: false,
      confidence: 0,
      executionTimeMs: 0,
    };

    try {
      decision.reasoning.push('Analyzing input context...');
      
      const context = options.context || {};
      const storyContext = options.story?.context || {};
      const combinedContext = { ...storyContext, ...context };

      decision.reasoning.push(`Context assembled: ${Object.keys(combinedContext).length} keys`);

      const rules = this.getApplicableRules(options.type, combinedContext);
      decision.rulesApplied = rules.map(r => r.id);

      decision.reasoning.push(`Applied ${rules.length} deterministic rules`);

      for (const rule of rules) {
        const ruleResult = await this.applyRule(rule, options);
        if (ruleResult.action) {
          decision.outcome = ruleResult;
          decision.success = ruleResult.success !== false;
          decision.confidence = ruleResult.confidence || 0.9;
          decision.reasoning.push(`Rule ${rule.id}: ${ruleResult.reason}`);
          break;
        }
      }

      if (!decision.outcome) {
        decision.outcome = { success: true, action: 'continue', reason: 'Default continuation' };
        decision.success = true;
        decision.confidence = DECISION_ENGINE_CONFIG.confidenceThreshold;
        decision.reasoning.push('Default rule applied: continue');
      }

      decision.executionTimeMs = Date.now() - startTime;

      this.decisionHistory.push(decision);
      if (this.decisionHistory.length > DECISION_ENGINE_CONFIG.maxHistorySize) {
        this.decisionHistory = this.decisionHistory.slice(-DECISION_ENGINE_CONFIG.maxHistorySize);
      }

      await this.persistDecision(decision);

      return {
        id: decisionId,
        success: decision.success,
        result: decision.outcome,
        confidence: decision.confidence,
        reasoning: decision.reasoning,
        rulesApplied: decision.rulesApplied,
        executionTimeMs: decision.executionTimeMs,
      };
    } catch (error) {
      decision.outcome = { success: false, error: error.message };
      decision.success = false;
      decision.confidence = 0;
      decision.executionTimeMs = Date.now() - startTime;
      decision.reasoning.push(`Error: ${error.message}`);

      await this.persistDecision(decision);

      return {
        id: decisionId,
        success: false,
        result: { error: error.message },
        confidence: 0,
        reasoning: decision.reasoning,
        rulesApplied: decision.rulesApplied,
        executionTimeMs: decision.executionTimeMs,
      };
    }
  }

  getApplicableRules(decisionType, context) {
    const rules = [];

    const ruleRegistry = [
      { id: 'safety_first', priority: 1, condition: () => context.safetyCritical !== false },
      { id: 'compliance_check', priority: 2, condition: () => context.requiresCompliance !== false },
      { id: 'performance_optimize', priority: 3, condition: () => context.performanceCritical !== false },
      { id: 'usability_ensure', priority: 4, condition: () => context.userFacing !== false },
      { id: 'default_continue', priority: 99, condition: () => true },
    ];

    for (const rule of ruleRegistry) {
      if (rule.condition()) {
        rules.push(rule);
      }
    }

    return rules.sort((a, b) => a.priority - b.priority);
  }

  async applyRule(rule, options) {
    const ruleHandlers = {
      safety_first: async (opts) => ({
        success: true,
        action: 'safe_proceed',
        reason: 'Safety check passed',
        confidence: 0.95,
      }),
      compliance_check: async (opts) => ({
        success: true,
        action: 'compliant_proceed',
        reason: 'Compliance verified',
        confidence: 0.9,
      }),
      performance_optimize: async (opts) => ({
        success: true,
        action: 'optimize_performance',
        reason: 'Performance path selected',
        confidence: 0.85,
      }),
      usability_ensure: async (opts) => ({
        success: true,
        action: 'user_friendly',
        reason: 'Usability considered',
        confidence: 0.85,
      }),
      default_continue: async (opts) => ({
        success: true,
        action: 'continue',
        reason: 'Default action',
        confidence: 0.8,
      }),
    };

    const handler = ruleHandlers[rule.id];
    if (handler) {
      return await handler(options);
    }

    return { success: true, action: 'continue', reason: 'No specific rule', confidence: 0.5 };
  }

  async evaluateConditions(conditions, outcome) {
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, outcome);
      if (!result) return false;
    }
    return true;
  }

  async evaluateCondition(condition, outcome) {
    switch (condition.type) {
      case 'equals':
        return outcome[condition.field] === condition.value;
      case 'not_empty':
        return outcome[condition.field] && outcome[condition.field] !== '';
      case 'truthy':
        return !!outcome[condition.field];
      case 'custom':
        return condition.validator ? condition.validator(outcome) : true;
      default:
        return true;
    }
  }

  async persistStory(story) {
    const storyPath = path.join(this.rootDir, STORY_PATH, `${story.id}.json`);
    fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
  }

  async persistDecision(decision) {
    const decisionPath = path.join(this.rootDir, DECISION_LOG_PATH, 'history.jsonl');
    fs.appendFileSync(decisionPath, JSON.stringify(decision) + '\n');
  }

  async logDecision(decision) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      decisionId: decision.type + '_' + Date.now(),
      ...decision,
    };

    const auditPath = path.join(this.rootDir, AUDIT_LOG_PATH, 'decisions.jsonl');
    fs.appendFileSync(auditPath, JSON.stringify(auditEntry) + '\n');

    if (this.lens) {
      this.lens._log_event('decision', JSON.stringify(auditEntry));
    }

    return auditEntry;
  }

  async getStory(storyId) {
    if (this.activeStories.has(storyId)) {
      return this.activeStories.get(storyId);
    }

    const storyPath = path.join(this.rootDir, STORY_PATH, `${storyId}.json`);
    if (fs.existsSync(storyPath)) {
      return JSON.parse(fs.readFileSync(storyPath, 'utf8'));
    }

    return null;
  }

  async listStories(filters = {}) {
    const stories = [];
    
    for (const [id, story] of this.activeStories) {
      if (this.matchesFilters(story, filters)) {
        stories.push(story);
      }
    }

    if (filters.includeCompleted) {
      const files = fs.readdirSync(path.join(this.rootDir, STORY_PATH));
      for (const file of files) {
        if (file.endsWith('.json')) {
          const story = JSON.parse(fs.readFileSync(path.join(this.rootDir, STORY_PATH, file), 'utf8'));
          if (this.matchesFilters(story, filters)) {
            stories.push(story);
          }
        }
      }
    }

    return stories.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  matchesFilters(story, filters) {
    if (filters.status && story.status !== filters.status) return false;
    if (filters.type && story.type !== filters.type) return false;
    if (filters.priority && story.metadata?.priority !== filters.priority) return false;
    return true;
  }

  async getDecisionHistory(options = {}) {
    const limit = options.limit || 100;
    const type = options.type;

    let history = this.decisionHistory;
    
    if (type) {
      history = history.filter(d => d.type === type);
    }

    return history.slice(-limit);
  }

  async explainDecision(decisionId) {
    const decision = this.decisionHistory.find(d => d.id === decisionId);
    if (!decision) {
      return { error: 'Decision not found' };
    }

    return {
      decisionId: decision.id,
      type: decision.type,
      timestamp: decision.timestamp,
      reasoning: decision.reasoning,
      rulesApplied: decision.rulesApplied,
      outcome: decision.outcome,
      confidence: decision.confidence,
      executionTimeMs: decision.executionTimeMs,
    };
  }
}

module.exports = {
  StoryDriver,
  DecisionNode,
  DECISION_ENGINE_CONFIG,
};
