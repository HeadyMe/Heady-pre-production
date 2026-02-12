/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  chat/intent-resolver.js - 3-Stage Intent Resolution Engine   ║
 * ║  Keyword → Fuzzy → LLM ranking with preference learning       ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

// ═══════════════════════════════════════════════════════════════
// SKILL REGISTRY ADAPTER
// ═══════════════════════════════════════════════════════════════

const DEFAULT_SKILL_MAP = {
  'build': { skill: 'hcfp-clean-build', triggers: ['build', 'compile', 'make', 'construct', 'assemble'] },
  'deploy': { skill: 'cross-platform-deploy', triggers: ['deploy', 'ship', 'release', 'publish', 'push live'] },
  'deploy staging': { skill: 'cross-platform-deploy', triggers: ['deploy staging', 'stage', 'staging deploy'], params: { env: 'staging' } },
  'deploy prod': { skill: 'cross-platform-deploy', triggers: ['deploy prod', 'deploy production', 'go live'], params: { env: 'production' }, confirmation: 'double' },
  'health': { skill: 'system-health-check', triggers: ['health', 'check health', 'status', 'is everything ok', 'system status'] },
  'test': { skill: 'run-tests', triggers: ['test', 'run tests', 'testing', 'check tests', 'unit test'] },
  'lint': { skill: 'code-lint', triggers: ['lint', 'linting', 'check style', 'code quality'] },
  'sync': { skill: 'cloud-sync', triggers: ['sync', 'synchronize', 'pull', 'fetch', 'update from cloud'] },
  'checkpoint': { skill: 'checkpoint-create', triggers: ['checkpoint', 'save state', 'snapshot', 'backup state'] },
  'rollback': { skill: 'rollback', triggers: ['rollback', 'undo', 'revert', 'go back', 'restore'] },
  'scan': { skill: 'gap-scanner', triggers: ['scan', 'find gaps', 'coverage', 'gap analysis'] },
  'security': { skill: 'security-audit', triggers: ['security', 'audit', 'security scan', 'vulnerability', 'pentest'] },
  'docs': { skill: 'auto-doc', triggers: ['docs', 'document', 'generate docs', 'documentation', 'readme'] },
  'optimize': { skill: 'optimization-engine', triggers: ['optimize', 'performance', 'speed up', 'make faster', 'improve'] },
  'drift': { skill: 'drift-detection', triggers: ['drift', 'check drift', 'config drift', 'consistency check'] },
  'clean': { skill: 'workspace-clean', triggers: ['clean', 'cleanup', 'tidy', 'remove artifacts', 'clear cache'] },
  'imagine': { skill: 'imagination-engine', triggers: ['imagine', 'brainstorm', 'ideate', 'what if', 'explore'] },
  'connect': { skill: 'mcp-connect', triggers: ['connect', 'add connector', 'integrate', 'plug in'] },
};

// ═══════════════════════════════════════════════════════════════
// LEVENSHTEIN DISTANCE (for fuzzy matching)
// ═══════════════════════════════════════════════════════════════

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function similarityScore(input, target) {
  const maxLen = Math.max(input.length, target.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(input.toLowerCase(), target.toLowerCase()) / maxLen;
}

// ═══════════════════════════════════════════════════════════════
// N-GRAM SIMILARITY (for multi-word matching)
// ═══════════════════════════════════════════════════════════════

function ngramSimilarity(input, target, n = 2) {
  const inputGrams = new Set();
  const targetGrams = new Set();
  const a = input.toLowerCase(), b = target.toLowerCase();

  for (let i = 0; i <= a.length - n; i++) inputGrams.add(a.slice(i, i + n));
  for (let i = 0; i <= b.length - n; i++) targetGrams.add(b.slice(i, i + n));

  if (inputGrams.size === 0 || targetGrams.size === 0) return 0;

  let intersection = 0;
  for (const g of inputGrams) {
    if (targetGrams.has(g)) intersection++;
  }

  return (2 * intersection) / (inputGrams.size + targetGrams.size);
}

// ═══════════════════════════════════════════════════════════════
// INTENT RESOLVER ENGINE
// ═══════════════════════════════════════════════════════════════

class IntentResolver extends EventEmitter {
  constructor(options = {}) {
    super();
    this.skillMap = options.skillMap || DEFAULT_SKILL_MAP;
    this.preferences = new Map(); // userId → { intent → skill } learned preferences
    this.resolutionLog = [];
    this.maxLogSize = 5000;
    this.fuzzyThreshold = options.fuzzyThreshold || 0.65;
    this.exactBoost = options.exactBoost || 0.3;
  }

  /**
   * Resolve user intent to a skill invocation
   * Returns: { stage, skill, confidence, params, confirmation, alternatives }
   */
  async resolve(userMessage, context = {}) {
    const input = userMessage.trim().toLowerCase();
    const userId = context.userId || 'anonymous';
    const startTime = Date.now();

    // Stage 0: Check user preference overrides
    const prefResult = this._checkPreferences(userId, input);
    if (prefResult && prefResult.confidence > 0.9) {
      return this._logAndReturn(prefResult, startTime, userId, input);
    }

    // Stage 1: Exact keyword match
    const exactResult = this._exactMatch(input);
    if (exactResult) {
      return this._logAndReturn(exactResult, startTime, userId, input);
    }

    // Stage 2: Fuzzy match with combined scoring
    const fuzzyResult = this._fuzzyMatch(input);
    if (fuzzyResult && fuzzyResult.confidence >= this.fuzzyThreshold) {
      return this._logAndReturn(fuzzyResult, startTime, userId, input);
    }

    // Stage 3: Multi-signal ranking (combines all methods)
    const rankedResults = this._rankAll(input);
    if (rankedResults.length > 0 && rankedResults[0].confidence >= 0.4) {
      const top = rankedResults[0];
      top.alternatives = rankedResults.slice(1, 4);
      top.stage = 3;
      top.requiresSelection = rankedResults[0].confidence < 0.7;
      return this._logAndReturn(top, startTime, userId, input);
    }

    // Stage 4: No match — return suggestions
    return this._logAndReturn({
      stage: 4,
      skill: null,
      confidence: 0,
      message: `I'm not sure what you mean by "${userMessage}". Here are available skills:`,
      suggestions: Object.entries(this.skillMap)
        .map(([key, val]) => ({ command: key, skill: val.skill }))
        .slice(0, 10),
      requiresSelection: true
    }, startTime, userId, input);
  }

  // ── Stage 0: Preference override ────────────────────────────

  _checkPreferences(userId, input) {
    const userPrefs = this.preferences.get(userId);
    if (!userPrefs) return null;

    for (const [pattern, skillConfig] of userPrefs) {
      if (input.includes(pattern) || similarityScore(input, pattern) > 0.85) {
        return {
          stage: 0,
          skill: skillConfig.skill,
          confidence: 0.95,
          params: skillConfig.params || {},
          confirmation: skillConfig.confirmation || 'none',
          source: 'user_preference',
          learnedFrom: skillConfig.learnedFrom
        };
      }
    }
    return null;
  }

  // ── Stage 1: Exact keyword match ────────────────────────────

  _exactMatch(input) {
    // Direct key match
    if (this.skillMap[input]) {
      const entry = this.skillMap[input];
      return {
        stage: 1,
        skill: entry.skill,
        confidence: 1.0,
        params: entry.params || {},
        confirmation: entry.confirmation || 'none',
        source: 'exact_key'
      };
    }

    // Trigger word match
    for (const [key, entry] of Object.entries(this.skillMap)) {
      for (const trigger of entry.triggers) {
        if (input === trigger || input === trigger.toLowerCase()) {
          return {
            stage: 1,
            skill: entry.skill,
            confidence: 0.95,
            params: entry.params || {},
            confirmation: entry.confirmation || 'none',
            source: 'exact_trigger',
            matchedTrigger: trigger
          };
        }
      }
    }

    // Substring containment (input contains a trigger)
    for (const [key, entry] of Object.entries(this.skillMap)) {
      for (const trigger of entry.triggers) {
        if (input.includes(trigger) && trigger.length >= 4) {
          return {
            stage: 1,
            skill: entry.skill,
            confidence: 0.85,
            params: entry.params || {},
            confirmation: entry.confirmation || 'none',
            source: 'substring_trigger',
            matchedTrigger: trigger
          };
        }
      }
    }

    return null;
  }

  // ── Stage 2: Fuzzy match ────────────────────────────────────

  _fuzzyMatch(input) {
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, entry] of Object.entries(this.skillMap)) {
      // Score against key
      const keyScore = similarityScore(input, key);
      if (keyScore > bestScore) {
        bestScore = keyScore;
        bestMatch = { key, entry, matchedAgainst: key };
      }

      // Score against each trigger
      for (const trigger of entry.triggers) {
        const triggerScore = similarityScore(input, trigger);
        const ngramScore = ngramSimilarity(input, trigger);
        const combined = triggerScore * 0.6 + ngramScore * 0.4;

        if (combined > bestScore) {
          bestScore = combined;
          bestMatch = { key, entry, matchedAgainst: trigger };
        }
      }
    }

    if (bestMatch && bestScore >= this.fuzzyThreshold) {
      return {
        stage: 2,
        skill: bestMatch.entry.skill,
        confidence: Math.round(bestScore * 100) / 100,
        params: bestMatch.entry.params || {},
        confirmation: bestScore < 0.8 ? 'single' : (bestMatch.entry.confirmation || 'none'),
        source: 'fuzzy_match',
        matchedAgainst: bestMatch.matchedAgainst,
        requiresConfirmation: bestScore < 0.8
      };
    }

    return null;
  }

  // ── Stage 3: Multi-signal ranking ───────────────────────────

  _rankAll(input) {
    const scores = [];
    const inputWords = new Set(input.split(/\s+/));

    for (const [key, entry] of Object.entries(this.skillMap)) {
      let maxScore = 0;
      let bestSource = key;

      // Levenshtein against key and triggers
      const allTargets = [key, ...entry.triggers];
      for (const target of allTargets) {
        const levScore = similarityScore(input, target);
        const ngramScore = ngramSimilarity(input, target);

        // Word overlap bonus
        const targetWords = new Set(target.split(/\s+/));
        let wordOverlap = 0;
        for (const w of inputWords) {
          if (targetWords.has(w)) wordOverlap++;
        }
        const overlapScore = targetWords.size > 0 ? wordOverlap / targetWords.size : 0;

        const combined = levScore * 0.4 + ngramScore * 0.3 + overlapScore * 0.3;

        if (combined > maxScore) {
          maxScore = combined;
          bestSource = target;
        }
      }

      if (maxScore > 0.2) {
        scores.push({
          skill: entry.skill,
          confidence: Math.round(maxScore * 100) / 100,
          params: entry.params || {},
          confirmation: entry.confirmation || 'single',
          source: 'ranked',
          matchedAgainst: bestSource
        });
      }
    }

    return scores.sort((a, b) => b.confidence - a.confidence);
  }

  // ── Learning: Record user choice ────────────────────────────

  learnPreference(userId, input, chosenSkill, params = {}) {
    if (!this.preferences.has(userId)) {
      this.preferences.set(userId, new Map());
    }
    this.preferences.get(userId).set(input.toLowerCase(), {
      skill: chosenSkill,
      params,
      learnedFrom: new Date().toISOString(),
      usageCount: 1
    });
    this.emit('preference:learned', { userId, input, skill: chosenSkill });
  }

  // ── Logging ─────────────────────────────────────────────────

  _logAndReturn(result, startTime, userId, input) {
    const entry = {
      timestamp: new Date().toISOString(),
      userId: crypto.createHash('sha256').update(userId).digest('hex').slice(0, 16),
      input: input.slice(0, 100),
      resolvedSkill: result.skill,
      stage: result.stage,
      confidence: result.confidence,
      durationMs: Date.now() - startTime
    };

    this.resolutionLog.push(entry);
    if (this.resolutionLog.length > this.maxLogSize) {
      this.resolutionLog = this.resolutionLog.slice(-this.maxLogSize / 2);
    }

    this.emit('intent:resolved', entry);
    return result;
  }

  // ── Stats ───────────────────────────────────────────────────

  getStats() {
    const log = this.resolutionLog;
    const stageDistribution = {};
    const skillDistribution = {};
    let totalConfidence = 0;

    for (const entry of log) {
      stageDistribution[entry.stage] = (stageDistribution[entry.stage] || 0) + 1;
      if (entry.resolvedSkill) {
        skillDistribution[entry.resolvedSkill] = (skillDistribution[entry.resolvedSkill] || 0) + 1;
      }
      totalConfidence += entry.confidence;
    }

    return {
      totalResolutions: log.length,
      averageConfidence: log.length > 0 ? Math.round((totalConfidence / log.length) * 100) / 100 : 0,
      stageDistribution,
      topSkills: Object.entries(skillDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count })),
      userPreferencesCount: this.preferences.size,
      averageDurationMs: log.length > 0
        ? Math.round(log.reduce((s, e) => s + e.durationMs, 0) / log.length)
        : 0
    };
  }

  // ── Bulk skill registration ─────────────────────────────────

  registerSkill(key, config) {
    this.skillMap[key] = config;
  }

  registerSkills(skills) {
    for (const [key, config] of Object.entries(skills)) {
      this.skillMap[key] = config;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CONFIRMATION POLICY ENGINE
// ═══════════════════════════════════════════════════════════════

class ConfirmationPolicy {
  constructor() {
    this.policies = {
      'dev-build':       { require: false },
      'staging-deploy':  { require: true,  preApprovable: true,  level: 'single' },
      'prod-deploy':     { require: true,  preApprovable: false, level: 'double' },
      'file-delete':     { require: true,  preApprovable: false, level: 'single' },
      'file-edit':       { require: true,  preApprovable: true,  level: 'single' },
      'secret-rotate':   { require: true,  preApprovable: false, level: 'double' },
      'git-force-push':  { require: true,  preApprovable: false, level: 'double' },
      'rollback':        { require: true,  preApprovable: false, level: 'single' },
      'connector-install': { require: true, preApprovable: true, level: 'single' },
    };
    this.preApprovals = new Map(); // userId → Set of pre-approved categories
  }

  getPolicy(category) {
    return this.policies[category] || { require: true, preApprovable: false, level: 'single' };
  }

  needsConfirmation(category, userId) {
    const policy = this.getPolicy(category);
    if (!policy.require) return { needed: false };

    // Check pre-approvals
    const userApprovals = this.preApprovals.get(userId);
    if (userApprovals && userApprovals.has(category) && policy.preApprovable) {
      return { needed: false, reason: 'pre-approved' };
    }

    return { needed: true, level: policy.level };
  }

  preApprove(userId, category) {
    const policy = this.getPolicy(category);
    if (!policy.preApprovable) return { success: false, reason: 'Category cannot be pre-approved' };

    if (!this.preApprovals.has(userId)) {
      this.preApprovals.set(userId, new Set());
    }
    this.preApprovals.get(userId).add(category);
    return { success: true };
  }

  revokePreApproval(userId, category) {
    const userApprovals = this.preApprovals.get(userId);
    if (userApprovals) userApprovals.delete(category);
    return { success: true };
  }
}

module.exports = { IntentResolver, ConfirmationPolicy, levenshtein, similarityScore, ngramSimilarity };
