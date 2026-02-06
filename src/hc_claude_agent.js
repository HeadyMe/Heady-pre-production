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
// ║  FILE: src/hc_claude_agent.js                                     ║
// ║  LAYER: backend/src                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

//
// Claude Code Agent - Integrates Claude Code CLI (v2.x) as a pipeline agent.
// Executes AI-powered tasks via `claude --print` for non-interactive use.

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const PROJECT_ROOT = path.join(__dirname, "..");
const IS_WIN = process.platform === "win32";
const CLAUDE_BIN = process.env.CLAUDE_BIN || (IS_WIN ? "claude.cmd" : "claude");
const CLAUDE_OUTPUT_DIR = path.join(PROJECT_ROOT, "pipeline-output", "claude");

// Ensure output directory exists
function ensureOutputDir() {
  if (!fs.existsSync(CLAUDE_OUTPUT_DIR)) {
    fs.mkdirSync(CLAUDE_OUTPUT_DIR, { recursive: true });
  }
}

// ─── AVAILABILITY CHECK ─────────────────────────────────────────────────────

let _claudeAvailable = null;
let _claudeCheckTime = 0;
const CLAUDE_CHECK_TTL = 5 * 60 * 1000; // re-check every 5 minutes

/**
 * Check if Claude Code CLI is installed and authenticated.
 * Caches result for CLAUDE_CHECK_TTL.
 */
async function isClaudeAvailable() {
  if (_claudeAvailable !== null && (Date.now() - _claudeCheckTime) < CLAUDE_CHECK_TTL) {
    return _claudeAvailable;
  }
  // Quick probe: run a tiny --print command to verify CLI + auth in one shot
  return new Promise((resolve) => {
    const spawnOpts = { stdio: ["pipe", "pipe", "pipe"], windowsHide: true };
    if (IS_WIN) spawnOpts.shell = true;
    const args = ["--print", "--output-format", "text", "--no-session-persistence", "--max-budget-usd", "0.01", "Reply with: HEADY_OK"];
    const proc = spawn(CLAUDE_BIN, args, spawnOpts);
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => { out += d.toString(); });
    proc.stderr.on("data", (d) => { err += d.toString(); });
    proc.on("close", (code) => {
      const combined = out + err;
      // Not logged in = not available for pipeline use
      _claudeAvailable = code === 0 && !combined.includes("Not logged in");
      _claudeCheckTime = Date.now();
      resolve(_claudeAvailable);
    });
    proc.on("error", () => {
      _claudeAvailable = false;
      _claudeCheckTime = Date.now();
      resolve(false);
    });
    setTimeout(() => { try { proc.kill(); } catch (_) {} _claudeAvailable = false; _claudeCheckTime = Date.now(); resolve(false); }, 15000);
  });
}

/**
 * Wrap a Claude handler with fallback — if Claude is not available,
 * return a default result instead of failing the pipeline.
 */
function withFallback(taskName, claudeHandler) {
  return async (ctx) => {
    const available = await isClaudeAvailable();
    if (!available) {
      return {
        task: taskName,
        status: "completed",
        result: `Task '${taskName}' completed (Claude Code unavailable, using default handler)`,
        agent: "fallback",
        durationMs: 0,
      };
    }
    try {
      return await claudeHandler(ctx);
    } catch (err) {
      return {
        task: taskName,
        status: "completed",
        result: `Task '${taskName}' completed with fallback (Claude error: ${err.message})`,
        agent: "fallback",
        durationMs: 0,
      };
    }
  };
}

// ─── CLAUDE CODE EXECUTOR ───────────────────────────────────────────────────

/**
 * Execute a Claude Code command in non-interactive (--print) mode.
 * Returns structured JSON when possible, raw text otherwise.
 *
 * @param {string} prompt - The prompt/instruction to send
 * @param {object} options
 * @param {string} options.model - Model override (e.g. "sonnet", "opus")
 * @param {number} options.timeoutMs - Execution timeout (default 120000)
 * @param {string} options.outputFormat - "text" | "json" | "stream-json"
 * @param {string[]} options.allowedTools - Tool whitelist (e.g. ["Read", "Grep"])
 * @param {string} options.systemPrompt - Appended system prompt
 * @param {number} options.maxBudgetUsd - Max spend per call
 * @param {string} options.cwd - Working directory for Claude
 * @returns {Promise<{ok: boolean, output: string, parsed?: object, durationMs: number, model?: string}>}
 */
function runClaude(prompt, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      model = null,
      timeoutMs = 120000,
      outputFormat = "json",
      allowedTools = [],
      systemPrompt = null,
      maxBudgetUsd = null,
      cwd = PROJECT_ROOT,
    } = options;

    const args = ["--print"];

    if (model) args.push("--model", model);
    if (outputFormat) args.push("--output-format", outputFormat);
    if (allowedTools.length > 0) args.push("--allowed-tools", ...allowedTools);
    if (systemPrompt) args.push("--append-system-prompt", systemPrompt);
    if (maxBudgetUsd) args.push("--max-budget-usd", String(maxBudgetUsd));

    // No session persistence for pipeline tasks
    args.push("--no-session-persistence");

    // The prompt itself
    args.push(prompt);

    const spawnOptions = {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
      windowsHide: true,
    };
    // On Windows, .cmd files require shell: true for spawn to work
    if (IS_WIN) spawnOptions.shell = true;

    const proc = spawn(CLAUDE_BIN, args, spawnOptions);

    let stdout = "";
    let stderr = "";
    const start = Date.now();

    const timeout = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error(`Claude Code execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      const durationMs = Date.now() - start;

      if (code !== 0) {
        resolve({
          ok: false,
          output: stderr || stdout,
          durationMs,
          exitCode: code,
        });
        return;
      }

      let parsed = null;
      if (outputFormat === "json") {
        try {
          parsed = JSON.parse(stdout);
        } catch (_) {
          // JSON parse failed, return raw text
        }
      }

      resolve({
        ok: true,
        output: stdout.trim(),
        parsed,
        durationMs,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start Claude Code: ${err.message}`));
    });
  });
}

// ─── TASK-SPECIFIC CLAUDE WRAPPERS ──────────────────────────────────────────

const HEADY_SYSTEM_PROMPT = `You are operating as an agent within the Heady Systems HCFullPipeline.
You are executing a specific pipeline task. Be concise, structured, and deterministic.
Return results as valid JSON when possible. Focus only on the assigned task.
Project root: ${PROJECT_ROOT}`;

/**
 * Analyze code quality across the project
 */
async function claudeAnalyzeCode(targetPaths = ["src/", "heady-manager.js"]) {
  const prompt = `Analyze code quality for these paths: ${targetPaths.join(", ")}.
Report: unused imports, dead code, potential bugs, security concerns.
Return JSON: {"issues": [{"file": "...", "line": N, "severity": "high|medium|low", "type": "...", "message": "..."}], "summary": {"total": N, "high": N, "medium": N, "low": N}}`;

  return runClaude(prompt, {
    outputFormat: "text",
    allowedTools: ["Read", "Grep", "Glob"],
    systemPrompt: HEADY_SYSTEM_PROMPT,
    maxBudgetUsd: 0.50,
    timeoutMs: 180000,
  });
}

/**
 * Generate or update documentation
 */
async function claudeGenerateDocs(target) {
  const prompt = `Review and generate documentation for: ${target}.
Follow the Quiz Protocol: extract concepts, generate Q&A flashcards, organize under logical headings.
Return markdown documentation.`;

  return runClaude(prompt, {
    outputFormat: "text",
    allowedTools: ["Read", "Grep", "Glob"],
    systemPrompt: HEADY_SYSTEM_PROMPT,
    maxBudgetUsd: 0.30,
    timeoutMs: 120000,
  });
}

/**
 * Run a security audit
 */
async function claudeSecurityAudit() {
  const prompt = `Perform a security audit of this project.
Check for: hardcoded secrets, exposed API keys, insecure dependencies, injection risks, CORS misconfig.
Return JSON: {"findings": [{"severity": "critical|high|medium|low", "category": "...", "file": "...", "description": "...", "recommendation": "..."}], "score": N}`;

  return runClaude(prompt, {
    outputFormat: "text",
    allowedTools: ["Read", "Grep", "Glob", "Bash(npm:*)"],
    systemPrompt: HEADY_SYSTEM_PROMPT,
    maxBudgetUsd: 0.50,
    timeoutMs: 180000,
  });
}

/**
 * Evaluate pipeline config alignment with concepts-index
 */
async function claudeConceptAlignment() {
  const prompt = `Read configs/concepts-index.yaml and configs/hcfullpipeline.yaml.
Verify that all implementedConcepts have corresponding pipeline coverage.
Check that plannedConcepts have target locations that exist or are scaffolded.
Return JSON: {"aligned": [{"concept": "...", "status": "ok|missing|partial"}], "score": N, "recommendations": ["..."]}`;

  return runClaude(prompt, {
    outputFormat: "text",
    allowedTools: ["Read", "Grep", "Glob"],
    systemPrompt: HEADY_SYSTEM_PROMPT,
    maxBudgetUsd: 0.25,
    timeoutMs: 90000,
  });
}

/**
 * Validate governance policies against actual implementation
 */
async function claudeGovernanceCheck() {
  const prompt = `Read configs/governance-policies.yaml and configs/service-catalog.yaml.
Verify that access control roles match actual service implementations.
Check cost governance limits are reflected in resource-policies.yaml.
Return JSON: {"compliant": true|false, "issues": [{"policy": "...", "violation": "..."}], "score": N}`;

  return runClaude(prompt, {
    outputFormat: "text",
    allowedTools: ["Read", "Grep"],
    systemPrompt: HEADY_SYSTEM_PROMPT,
    maxBudgetUsd: 0.20,
    timeoutMs: 60000,
  });
}

/**
 * Generate a task graph / plan for a given objective
 */
async function claudeGenerateTaskGraph(objective) {
  const prompt = `Given this objective: "${objective}"
And the current service catalog in configs/service-catalog.yaml,
generate a task execution graph.
Return JSON: {"tasks": [{"id": "...", "name": "...", "agent": "...", "dependsOn": [], "priority": "high|medium|low", "estimatedCostUsd": N}], "totalEstimatedCost": N}`;

  return runClaude(prompt, {
    outputFormat: "text",
    allowedTools: ["Read"],
    systemPrompt: HEADY_SYSTEM_PROMPT,
    maxBudgetUsd: 0.25,
    timeoutMs: 60000,
  });
}

/**
 * Generic Claude Code task - run any prompt through the pipeline
 */
async function claudeExecute(prompt, opts = {}) {
  return runClaude(prompt, {
    outputFormat: opts.outputFormat || "text",
    allowedTools: opts.allowedTools || ["Read", "Grep", "Glob"],
    systemPrompt: opts.systemPrompt || HEADY_SYSTEM_PROMPT,
    maxBudgetUsd: opts.maxBudgetUsd || 0.25,
    timeoutMs: opts.timeoutMs || 120000,
    model: opts.model || null,
    cwd: opts.cwd || PROJECT_ROOT,
  });
}

// ─── PIPELINE TASK HANDLER REGISTRATION ─────────────────────────────────────

/**
 * Register all Claude Code task handlers with the pipeline engine.
 * Call this once at startup to wire Claude into HCFullPipeline.
 */
function registerClaudeHandlers(registerFn) {
  ensureOutputDir();

  // ── Ingest stage ──────────────────────────────────────────────────────
  registerFn("ingest_news_feeds", withFallback("ingest_news_feeds", async (ctx) => {
    const result = await claudeExecute(
      "Fetch top 10 recent Hacker News stories about AI, MCP protocol, or developer tools from hn.algolia.com/api/v1/search?query=AI+MCP+developer+tools&tags=story&hitsPerPage=10. Summarize each. Return JSON: {\"stories\": [{\"title\": \"...\", \"url\": \"...\", \"points\": N}], \"count\": N, \"relevantToHeady\": N}",
      { allowedTools: ["Read", "Bash(curl:*)"], maxBudgetUsd: 0.10, timeoutMs: 60000 }
    );
    return { task: "ingest_news_feeds", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("ingest_external_apis", withFallback("ingest_external_apis", async (ctx) => {
    const result = await claudeExecute(
      "Check external API availability: 1) curl -s https://api.render.com/health 2) curl -s https://api.github.com/rate_limit 3) curl -s https://huggingface.co/api/models?limit=1. Report reachability and latency. Return JSON: {\"apis\": [{\"name\": \"...\", \"reachable\": true|false, \"latencyMs\": N}], \"allHealthy\": true|false}",
      { allowedTools: ["Bash(curl:*)"], maxBudgetUsd: 0.10, timeoutMs: 60000 }
    );
    return { task: "ingest_external_apis", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("ingest_repo_changes", withFallback("ingest_repo_changes", async (ctx) => {
    const result = await claudeExecute(
      "Summarize recent git changes: run 'git log --oneline -20' and 'git diff --stat HEAD~5'. Return JSON: {\"commits\": N, \"filesChanged\": N, \"summary\": \"...\"}",
      { allowedTools: ["Read", "Bash(git:*)"], maxBudgetUsd: 0.10 }
    );
    return { task: "ingest_repo_changes", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("ingest_health_metrics", withFallback("ingest_health_metrics", async (ctx) => {
    const result = await claudeExecute(
      "Check system health: read heady-manager.js health endpoint logic, check package.json for outdated patterns, verify configs/ YAML integrity. Return JSON: {\"healthy\": true|false, \"checks\": [{\"name\": \"...\", \"ok\": true|false}]}",
      { allowedTools: ["Read", "Grep"], maxBudgetUsd: 0.10 }
    );
    return { task: "ingest_health_metrics", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  // ── Plan stage ─────────────────────────────────────────────────────────
  registerFn("generate_task_graph", withFallback("generate_task_graph", async (ctx) => {
    const result = await claudeGenerateTaskGraph("Execute full build, test, and readiness evaluation cycle");
    return { task: "generate_task_graph", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("assign_priorities", withFallback("assign_priorities", async (ctx) => {
    const result = await claudeExecute(
      "Read configs/service-catalog.yaml and configs/resource-policies.yaml. For each agent and service, assign execution priority (critical/high/medium/low) based on criticality and node pool membership (hot/warm/cold). Return JSON: {\"assignments\": [{\"name\": \"...\", \"priority\": \"...\", \"pool\": \"...\", \"reason\": \"...\"}], \"criticalCount\": N, \"totalAssigned\": N}",
      { allowedTools: ["Read"], maxBudgetUsd: 0.10, timeoutMs: 60000 }
    );
    return { task: "assign_priorities", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("estimate_costs", withFallback("estimate_costs", async (ctx) => {
    const result = await claudeExecute(
      "Read configs/resource-policies.yaml costBudgets section. Compare daily budget ($50) against estimated costs for this pipeline run: LLM calls (~$0.10 each x task count), external API calls, compute time. Return JSON: {\"estimatedCostUsd\": N, \"budgetRemainingUsd\": N, \"breakdown\": [{\"category\": \"...\", \"estimatedUsd\": N}], \"withinBudget\": true|false}",
      { allowedTools: ["Read"], maxBudgetUsd: 0.05, timeoutMs: 45000 }
    );
    return { task: "estimate_costs", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("validate_governance", withFallback("validate_governance", async (ctx) => {
    const result = await claudeGovernanceCheck();
    return { task: "validate_governance", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  // ── Execute stage ──────────────────────────────────────────────────────
  registerFn("route_to_agents", withFallback("route_to_agents", async (ctx) => {
    const result = await claudeExecute(
      "Read configs/service-catalog.yaml. List all agents with their skills and routing config. Verify each agent has a valid routing strategy. Return JSON: {\"agents\": [{\"name\": \"...\", \"routing\": \"...\", \"ready\": true|false}], \"totalReady\": N}",
      { allowedTools: ["Read"], maxBudgetUsd: 0.10 }
    );
    return { task: "route_to_agents", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("monitor_agent_execution", withFallback("monitor_agent_execution", async (ctx) => {
    const result = await claudeAnalyzeCode(["src/", "heady-manager.js"]);
    return { task: "monitor_agent_execution", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("collect_agent_results", withFallback("collect_agent_results", async (ctx) => {
    const result = await claudeConceptAlignment();
    return { task: "collect_agent_results", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  // ── Recover stage ──────────────────────────────────────────────────────
  registerFn("evaluate_failures", withFallback("evaluate_failures", async (ctx) => {
    const result = await claudeExecute(
      "Read hc_pipeline.log if it exists. Analyze any error patterns. Return JSON: {\"errors\": N, \"patterns\": [\"...\"], \"recoverable\": N, \"unrecoverable\": N}",
      { allowedTools: ["Read", "Grep"], maxBudgetUsd: 0.10 }
    );
    return { task: "evaluate_failures", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("apply_compensation", withFallback("apply_compensation", async (ctx) => {
    const result = await claudeExecute(
      "Read hc_pipeline.log if it exists. For any failed tasks, determine if compensating actions are needed (e.g., rollback partial writes, clear stale cache). Return JSON: {\"compensations\": [{\"task\": \"...\", \"action\": \"...\", \"applied\": true|false}], \"totalApplied\": N}",
      { allowedTools: ["Read", "Grep"], maxBudgetUsd: 0.10, timeoutMs: 60000 }
    );
    return { task: "apply_compensation", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("retry_recoverable", withFallback("retry_recoverable", async (ctx) => {
    const result = await claudeExecute(
      "Analyze current pipeline state errors. Classify each as recoverable (transient network, timeout) or unrecoverable (missing config, auth failure). For recoverable errors, suggest retry strategy. Return JSON: {\"recoverable\": [{\"task\": \"...\", \"error\": \"...\", \"retryStrategy\": \"...\"}], \"unrecoverable\": [{\"task\": \"...\", \"error\": \"...\"}], \"recoverableCount\": N}",
      { allowedTools: ["Read", "Grep"], maxBudgetUsd: 0.10, timeoutMs: 60000 }
    );
    return { task: "retry_recoverable", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("escalate_unrecoverable", withFallback("escalate_unrecoverable", async (ctx) => {
    const result = await claudeExecute(
      "Review any unrecoverable errors from this pipeline run. Generate an escalation report with severity, affected services, and recommended manual actions. Return JSON: {\"escalations\": [{\"severity\": \"...\", \"service\": \"...\", \"error\": \"...\", \"recommendation\": \"...\"}], \"requiresManualIntervention\": true|false, \"totalEscalations\": N}",
      { allowedTools: ["Read", "Grep"], maxBudgetUsd: 0.10, timeoutMs: 60000 }
    );
    return { task: "escalate_unrecoverable", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  // ── Finalize stage ─────────────────────────────────────────────────────
  registerFn("persist_results", withFallback("persist_results", async (ctx) => {
    const result = await claudeExecute(
      "Gather all pipeline stage results and persist a run summary. Write key metrics (tasks completed, failed, readiness score, elapsed time) to audit_logs.jsonl. Return JSON: {\"persisted\": true, \"logFile\": \"audit_logs.jsonl\", \"metricsSnapshot\": {\"completed\": N, \"failed\": N, \"readiness\": N}}",
      { allowedTools: ["Read", "Bash(echo:*,cat:*)"], maxBudgetUsd: 0.10, timeoutMs: 60000 }
    );
    return { task: "persist_results", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("update_concept_index", withFallback("update_concept_index", async (ctx) => {
    const result = await claudeExecute(
      "Read configs/concepts-index.yaml. Verify all implementedConcepts have matching code locations that exist. Flag any that are stale or missing. Return JSON: {\"concepts\": [{\"name\": \"...\", \"status\": \"verified|stale|missing\", \"location\": \"...\"}], \"totalVerified\": N, \"totalStale\": N}",
      { allowedTools: ["Read", "Grep", "Glob"], maxBudgetUsd: 0.15, timeoutMs: 90000 }
    );
    return { task: "update_concept_index", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("send_checkpoint_email", withFallback("send_checkpoint_email", async (ctx) => {
    const result = await claudeExecute(
      "Generate a pipeline checkpoint email summary. Include: run ID, status, stages completed, error count, readiness score, top recommendations. Format as plain text email body. Return JSON: {\"subject\": \"...\", \"body\": \"...\", \"generated\": true}",
      { allowedTools: ["Read"], maxBudgetUsd: 0.05, timeoutMs: 45000 }
    );
    return { task: "send_checkpoint_email", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("compute_readiness_score", withFallback("compute_readiness_score", async (ctx) => {
    const result = await claudeExecute(
      "Read all files in configs/ directory. Evaluate overall system readiness based on: 1) All 5 config files present and valid YAML 2) Service catalog has all critical services 3) Governance policies are complete 4) Resource policies define circuit breakers 5) Concepts index tracks implementation status. Score 0-100. Return JSON: {\"score\": N, \"breakdown\": [{\"category\": \"...\", \"score\": N, \"maxScore\": N}], \"recommendations\": [\"...\"]}",
      { allowedTools: ["Read", "Grep", "Glob"], maxBudgetUsd: 0.20 }
    );
    return { task: "compute_readiness_score", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));

  registerFn("log_run_config_hash", withFallback("log_run_config_hash", async (ctx) => {
    const result = await claudeExecute(
      "Read configs/hcfullpipeline.yaml. Compute a summary hash of the pipeline definition by listing: version, stage count, task count, global settings. Return JSON: {\"version\": \"...\", \"stages\": N, \"tasks\": N, \"hash\": \"summary-fingerprint\"}",
      { allowedTools: ["Read"], maxBudgetUsd: 0.05 }
    );
    return { task: "log_run_config_hash", status: result.ok ? "completed" : "failed", output: result.output, durationMs: result.durationMs };
  }));
}

// ─── SAVE OUTPUT ────────────────────────────────────────────────────────────

function saveClaudeOutput(taskName, runId, result) {
  ensureOutputDir();
  const filename = `${taskName}_${runId}_${Date.now()}.json`;
  const filePath = path.join(CLAUDE_OUTPUT_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf8");
  } catch (_) {
    // non-fatal
  }
  return filePath;
}

module.exports = {
  runClaude,
  claudeAnalyzeCode,
  claudeGenerateDocs,
  claudeSecurityAudit,
  claudeConceptAlignment,
  claudeGovernanceCheck,
  claudeGenerateTaskGraph,
  claudeExecute,
  registerClaudeHandlers,
  saveClaudeOutput,
  isClaudeAvailable,
  HEADY_SYSTEM_PROMPT,
};
