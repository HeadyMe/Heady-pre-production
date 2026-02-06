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
// ║  FILE: test_pipeline_claude.js                                    ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

// Full end-to-end test for HCFullPipeline + Claude Code + Performance
const { HCFullPipeline, registerTaskHandler, invalidateCache } = require("./src/hc_pipeline");
const { registerClaudeHandlers, isClaudeAvailable } = require("./src/hc_claude_agent");

// Register Claude handlers (with fallback if not authenticated)
registerClaudeHandlers(registerTaskHandler);

async function runPipeline(label) {
  const p = new HCFullPipeline();
  p.on("stage:start", (e) => process.stdout.write("  [" + e.stageId + "] "));
  p.on("stage:end", (e) => console.log(e.status));

  const state = await p.run();

  console.log("  Status:", state.status,
    "| Tasks:", state.metrics.completedTasks + "/" + state.metrics.totalTasks,
    "| Cached:", state.metrics.cachedTasks,
    "| Failed:", state.metrics.failedTasks,
    "| Elapsed:", state.metrics.elapsedMs + "ms");
  return state;
}

async function main() {
  console.log("=== HCFullPipeline Performance Test ===\n");

  const config = new HCFullPipeline();
  config.load();
  const summary = config.getConfigSummary();
  console.log("Pipeline:", summary.name, "v" + summary.version);
  console.log("Stages:", summary.stages, "| Tasks:", summary.totalTasks, "\n");

  const claudeOk = await isClaudeAvailable();
  console.log("Claude Code available:", claudeOk);
  if (!claudeOk) console.log("  (Using fallback handlers)\n");

  // Run 1: Cold — no cache, populates cache
  invalidateCache();
  console.log("--- Run 1 (cold, no cache) ---");
  const r1 = await runPipeline("cold");

  // Run 2: Warm — should serve all tasks from cache
  console.log("\n--- Run 2 (warm, cached) ---");
  const r2 = await runPipeline("warm");

  console.log("\n--- Performance Summary ---");
  console.log("Cold run:", r1.metrics.elapsedMs + "ms | cached:", r1.metrics.cachedTasks + "/" + r1.metrics.totalTasks);
  console.log("Warm run:", r2.metrics.elapsedMs + "ms | cached:", r2.metrics.cachedTasks + "/" + r2.metrics.totalTasks);
  if (r1.metrics.elapsedMs > 0) {
    const speedup = (r1.metrics.elapsedMs / Math.max(r2.metrics.elapsedMs, 1)).toFixed(1);
    console.log("Speedup:", speedup + "x from cache");
  }
  console.log("\n=== Test Complete ===");
}

main().catch(console.error);
