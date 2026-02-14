/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY AI-IDE                                                 ║
 * ║  ━━━━━━━━━━━━                                                 ║
 * ║  Windsurf-next base + Heady services as selectable models     ║
 * ║  Arena mode → Intelligent squash merge of branches/worktrees  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const { HeadyModelProvider, HEADY_MODELS } = require("./model-provider");
const { ArenaMergeEngine, ArenaState } = require("./arena-merge-engine");

module.exports = {
  HeadyModelProvider,
  HEADY_MODELS,
  ArenaMergeEngine,
  ArenaState,
};
