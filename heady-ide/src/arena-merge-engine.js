/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY AI-IDE — Arena Merge Engine                            ║
 * ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                             ║
 * ║  Intelligent squash merging of branches and worktrees         ║
 * ║  created by multiple Heady service models working in parallel ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 * Windsurf "Arena Mode" reimagined:
 *   Instead of just comparing model outputs side-by-side,
 *   this engine creates real git branches/worktrees per model,
 *   lets each model produce actual code changes, then
 *   intelligently squash-merges the best results using
 *   SoulOrchestrator evaluation + Monte Carlo confidence.
 *
 * Flow:
 *   1. User submits a task (e.g., "refactor auth module")
 *   2. Engine creates a worktree + branch per selected model
 *   3. Each model works independently on its branch
 *   4. SoulOrchestrator evaluates each branch's output
 *   5. Intelligence Engine scores and ranks branches
 *   6. Arena Merge squash-merges the winning branch (or cherry-picks
 *      the best parts from multiple branches) into the target branch
 *   7. Losing branches are archived for learning
 */

const { execSync, exec } = require("child_process");
const path = require("path");
const crypto = require("crypto");

// Arena session states
const ArenaState = {
  CREATED: "created",
  BRANCHING: "branching",
  WORKING: "working",
  EVALUATING: "evaluating",
  MERGING: "merging",
  COMPLETED: "completed",
  FAILED: "failed",
};

class ArenaMergeEngine {
  constructor(options = {}) {
    this.repoRoot = options.repoRoot || process.cwd();
    this.worktreeBase = options.worktreeBase || path.join(this.repoRoot, ".heady-arena");
    this.sessions = new Map();
    this.history = [];
    this.maxHistory = options.maxHistory || 100;
    this.baseBranch = options.baseBranch || "main";
  }

  /**
   * Create a new arena session
   * Each selected model gets its own branch + worktree
   */
  createSession(task, modelIds = []) {
    const sessionId = `arena-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const branchPrefix = `arena/${sessionId}`;

    const session = {
      id: sessionId,
      task: {
        description: task.description,
        type: task.type || "code",
        files: task.files || [],
        context: task.context || {},
      },
      state: ArenaState.CREATED,
      baseBranch: task.baseBranch || this.baseBranch,
      branchPrefix,
      models: modelIds.map((modelId) => ({
        modelId,
        branch: `${branchPrefix}/${modelId}`,
        worktree: path.join(this.worktreeBase, sessionId, modelId),
        status: "pending",
        score: null,
        evaluation: null,
        changes: [],
        startedAt: null,
        completedAt: null,
      })),
      winner: null,
      mergeStrategy: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Phase 1: Create branches and worktrees for each model
   */
  async setupBranches(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return { error: "Session not found" };

    session.state = ArenaState.BRANCHING;
    const results = [];

    for (const model of session.models) {
      try {
        // Create branch from base
        this._git(`branch ${model.branch} ${session.baseBranch}`);

        // Create worktree
        this._git(`worktree add ${model.worktree} ${model.branch}`);

        model.status = "branched";
        results.push({ modelId: model.modelId, branch: model.branch, status: "ready" });
      } catch (err) {
        model.status = "branch-failed";
        results.push({ modelId: model.modelId, error: err.message });
      }
    }

    session.state = ArenaState.WORKING;
    return { sessionId, branches: results };
  }

  /**
   * Phase 2: Record changes made by a model on its branch
   * (Called after a model finishes its work)
   */
  async recordModelWork(sessionId, modelId, workResult) {
    const session = this.sessions.get(sessionId);
    if (!session) return { error: "Session not found" };

    const model = session.models.find((m) => m.modelId === modelId);
    if (!model) return { error: `Model '${modelId}' not in session` };

    model.startedAt = workResult.startedAt || model.startedAt;
    model.completedAt = new Date().toISOString();
    model.status = "completed";
    model.changes = workResult.changes || [];

    // Collect diff stats from the branch
    try {
      const diffStat = this._git(
        `diff --stat ${session.baseBranch}...${model.branch}`,
        model.worktree
      );
      model.diffSummary = diffStat.trim();

      const diffNumStat = this._git(
        `diff --numstat ${session.baseBranch}...${model.branch}`,
        model.worktree
      );
      model.diffLines = this._parseDiffNumstat(diffNumStat);
    } catch (_) {
      model.diffSummary = "Unable to compute diff";
      model.diffLines = { added: 0, removed: 0, files: 0 };
    }

    return { sessionId, modelId, status: "recorded", changes: model.changes.length };
  }

  /**
   * Phase 3: Evaluate all branches using SoulOrchestrator scoring
   * Returns ranked results with scores and recommended merge strategy
   */
  async evaluateBranches(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return { error: "Session not found" };

    session.state = ArenaState.EVALUATING;
    const evaluations = [];

    for (const model of session.models) {
      if (model.status !== "completed") continue;

      // Score based on multiple dimensions
      const score = this._scoreModelOutput(model, session.task);
      model.score = score.total;
      model.evaluation = score;

      evaluations.push({
        modelId: model.modelId,
        score: score.total,
        breakdown: score,
        diffLines: model.diffLines,
        branch: model.branch,
      });
    }

    // Sort by score descending
    evaluations.sort((a, b) => b.score - a.score);

    // Determine merge strategy
    const strategy = this._determineMergeStrategy(evaluations, session);
    session.mergeStrategy = strategy;

    if (evaluations.length > 0) {
      session.winner = evaluations[0].modelId;
    }

    return {
      sessionId,
      evaluations,
      winner: session.winner,
      mergeStrategy: strategy,
    };
  }

  /**
   * Phase 4: Execute the merge
   * Squash-merge the winning branch (or cherry-pick from multiple)
   */
  async executeMerge(sessionId, options = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) return { error: "Session not found" };

    session.state = ArenaState.MERGING;
    const strategy = options.strategy || session.mergeStrategy;
    let mergeResult;

    try {
      switch (strategy.type) {
        case "squash-winner":
          mergeResult = await this._squashMergeWinner(session);
          break;

        case "cherry-pick-best":
          mergeResult = await this._cherryPickBest(session, strategy.picks);
          break;

        case "composite-merge":
          mergeResult = await this._compositeMerge(session, strategy.composition);
          break;

        default:
          mergeResult = await this._squashMergeWinner(session);
      }

      session.state = ArenaState.COMPLETED;
      session.completedAt = new Date().toISOString();

      // Archive to history
      this._archiveSession(session);

      return {
        sessionId,
        status: "merged",
        strategy: strategy.type,
        winner: session.winner,
        mergeResult,
        completedAt: session.completedAt,
      };
    } catch (err) {
      session.state = ArenaState.FAILED;
      return { sessionId, status: "failed", error: err.message };
    }
  }

  /**
   * Clean up worktrees and arena branches for a session
   */
  async cleanup(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return { error: "Session not found" };

    const cleaned = [];

    for (const model of session.models) {
      try {
        // Remove worktree
        try {
          this._git(`worktree remove ${model.worktree} --force`);
        } catch (_) {}

        // Delete arena branch (only if merged or failed)
        if (session.state === ArenaState.COMPLETED || session.state === ArenaState.FAILED) {
          try {
            this._git(`branch -D ${model.branch}`);
          } catch (_) {}
        }

        cleaned.push(model.modelId);
      } catch (err) {
        // Non-fatal cleanup errors
      }
    }

    return { sessionId, cleaned, state: session.state };
  }

  // ═══════════════════════════════════════════════════════════════
  // MERGE STRATEGIES
  // ═══════════════════════════════════════════════════════════════

  async _squashMergeWinner(session) {
    const winner = session.models.find((m) => m.modelId === session.winner);
    if (!winner) throw new Error("No winner found");

    // Squash merge: all commits from winner branch become one commit
    this._git(`checkout ${session.baseBranch}`);
    this._git(`merge --squash ${winner.branch}`);

    const commitMsg = [
      `[HeadyAI-IDE Arena] ${session.task.description}`,
      "",
      `Winner: ${winner.modelId} (score: ${winner.score})`,
      `Strategy: squash-winner`,
      `Session: ${session.id}`,
      `Models competed: ${session.models.map((m) => m.modelId).join(", ")}`,
      "",
      `Scores:`,
      ...session.models
        .filter((m) => m.score !== null)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map((m) => `  ${m.modelId}: ${m.score}`),
    ].join("\n");

    this._git(`commit -m "${commitMsg.replace(/"/g, '\\"')}"`);

    return {
      type: "squash-winner",
      winner: winner.modelId,
      score: winner.score,
      branch: winner.branch,
      commitMessage: commitMsg,
    };
  }

  async _cherryPickBest(session, picks) {
    // Cherry-pick specific commits from multiple branches
    this._git(`checkout ${session.baseBranch}`);

    const picked = [];
    for (const pick of picks || []) {
      try {
        this._git(`cherry-pick ${pick.commit} --no-commit`);
        picked.push(pick);
      } catch (err) {
        // Skip conflicting cherry-picks
      }
    }

    if (picked.length > 0) {
      const commitMsg = `[HeadyAI-IDE Arena] Cherry-picked best from ${picked.length} branches\n\nSession: ${session.id}`;
      this._git(`commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    }

    return { type: "cherry-pick-best", picked };
  }

  async _compositeMerge(session, composition) {
    // Merge files from different branches selectively
    this._git(`checkout ${session.baseBranch}`);

    const merged = [];
    for (const item of composition || []) {
      try {
        const model = session.models.find((m) => m.modelId === item.modelId);
        if (model) {
          this._git(`checkout ${model.branch} -- ${item.file}`);
          merged.push({ file: item.file, from: item.modelId });
        }
      } catch (err) {
        // Skip files that don't exist on the branch
      }
    }

    if (merged.length > 0) {
      const commitMsg = `[HeadyAI-IDE Arena] Composite merge from ${merged.length} files\n\nSession: ${session.id}`;
      this._git(`commit -am "${commitMsg.replace(/"/g, '\\"')}"`);
    }

    return { type: "composite-merge", merged };
  }

  // ═══════════════════════════════════════════════════════════════
  // SCORING & STRATEGY
  // ═══════════════════════════════════════════════════════════════

  _scoreModelOutput(model, task) {
    const scores = {
      completeness: 0,
      minimality: 0,
      correctness: 0,
      consistency: 0,
      total: 0,
    };

    // Completeness — did the model address all requested files?
    if (task.files && task.files.length > 0) {
      const changedFiles = model.changes.map((c) => c.file);
      const covered = task.files.filter((f) => changedFiles.includes(f)).length;
      scores.completeness = (covered / task.files.length) * 25;
    } else {
      scores.completeness = model.changes.length > 0 ? 20 : 0;
    }

    // Minimality — fewer unnecessary changes is better
    const totalLines = (model.diffLines?.added || 0) + (model.diffLines?.removed || 0);
    if (totalLines === 0) {
      scores.minimality = 0;
    } else if (totalLines < 50) {
      scores.minimality = 25;
    } else if (totalLines < 200) {
      scores.minimality = 20;
    } else if (totalLines < 500) {
      scores.minimality = 15;
    } else {
      scores.minimality = 10;
    }

    // Correctness — based on presence of test results or error indicators
    if (model.changes.some((c) => c.hasTests)) {
      scores.correctness = 25;
    } else if (model.changes.some((c) => c.hasErrors)) {
      scores.correctness = 5;
    } else {
      scores.correctness = 15; // Neutral — no test info
    }

    // Consistency — matches task type expectations
    if (task.type === "refactor" && model.diffLines?.removed > 0) {
      scores.consistency = 25;
    } else if (task.type === "feature" && model.diffLines?.added > 0) {
      scores.consistency = 25;
    } else if (task.type === "fix" && totalLines < 100) {
      scores.consistency = 25;
    } else {
      scores.consistency = 15;
    }

    scores.total = scores.completeness + scores.minimality + scores.correctness + scores.consistency;
    return scores;
  }

  _determineMergeStrategy(evaluations, session) {
    if (evaluations.length === 0) {
      return { type: "none", reason: "No completed evaluations" };
    }

    if (evaluations.length === 1) {
      return { type: "squash-winner", reason: "Single model completed" };
    }

    const topScore = evaluations[0].score;
    const secondScore = evaluations[1]?.score || 0;
    const gap = topScore - secondScore;

    // Clear winner — squash merge
    if (gap > 15) {
      return {
        type: "squash-winner",
        reason: `Clear winner by ${gap} points`,
        winner: evaluations[0].modelId,
      };
    }

    // Close scores — consider composite merge
    if (gap <= 5 && evaluations.length >= 2) {
      return {
        type: "composite-merge",
        reason: `Close scores (gap=${gap}), composite recommended`,
        candidates: evaluations.slice(0, 2).map((e) => e.modelId),
      };
    }

    // Default to squash winner
    return {
      type: "squash-winner",
      reason: "Default strategy",
      winner: evaluations[0].modelId,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  _git(cmd, cwd) {
    return execSync(`git ${cmd}`, {
      cwd: cwd || this.repoRoot,
      encoding: "utf8",
      timeout: 30000,
    });
  }

  _parseDiffNumstat(numstat) {
    const lines = numstat.trim().split("\n").filter(Boolean);
    let added = 0, removed = 0;
    for (const line of lines) {
      const parts = line.split("\t");
      if (parts.length >= 2) {
        added += parseInt(parts[0], 10) || 0;
        removed += parseInt(parts[1], 10) || 0;
      }
    }
    return { added, removed, files: lines.length };
  }

  _archiveSession(session) {
    this.history.push({
      id: session.id,
      task: session.task.description,
      models: session.models.map((m) => ({
        modelId: m.modelId,
        score: m.score,
        status: m.status,
      })),
      winner: session.winner,
      strategy: session.mergeStrategy?.type,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
    });

    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC QUERY METHODS
  // ═══════════════════════════════════════════════════════════════

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  listSessions(filter = {}) {
    let sessions = Array.from(this.sessions.values());
    if (filter.state) {
      sessions = sessions.filter((s) => s.state === filter.state);
    }
    return sessions.map((s) => ({
      id: s.id,
      task: s.task.description,
      state: s.state,
      models: s.models.length,
      winner: s.winner,
      createdAt: s.createdAt,
    }));
  }

  getHistory() {
    return this.history;
  }

  getStats() {
    const allSessions = Array.from(this.sessions.values());
    return {
      activeSessions: allSessions.filter((s) => s.state !== ArenaState.COMPLETED && s.state !== ArenaState.FAILED).length,
      completedSessions: allSessions.filter((s) => s.state === ArenaState.COMPLETED).length,
      failedSessions: allSessions.filter((s) => s.state === ArenaState.FAILED).length,
      totalHistory: this.history.length,
      modelWinRates: this._computeWinRates(),
    };
  }

  _computeWinRates() {
    const wins = {};
    const appearances = {};
    for (const entry of this.history) {
      for (const m of entry.models) {
        appearances[m.modelId] = (appearances[m.modelId] || 0) + 1;
      }
      if (entry.winner) {
        wins[entry.winner] = (wins[entry.winner] || 0) + 1;
      }
    }

    const rates = {};
    for (const modelId of Object.keys(appearances)) {
      rates[modelId] = {
        wins: wins[modelId] || 0,
        total: appearances[modelId],
        rate: appearances[modelId] > 0
          ? ((wins[modelId] || 0) / appearances[modelId] * 100).toFixed(1) + "%"
          : "0%",
      };
    }
    return rates;
  }
}

module.exports = { ArenaMergeEngine, ArenaState };
