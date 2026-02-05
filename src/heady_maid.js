// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: src/heady_maid.js
// LAYER: backend/src
// 
//         _   _  _____    _    ____   __   __
//        | | | || ____|  / \  |  _ \ \ \ / /
//        | |_| ||  _|   / _ \ | | | | \ V / 
//        |  _  || |___ / ___ \| |_| |  | |  
//        |_| |_||_____/_/   \_\____/   |_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

/**
 * HeadyMaid :: Observability Single Source of Truth
 * Sacred Geometry :: Organic Systems :: Breathing Interfaces
 * Flow: Files → Scan → Analyze → Optimize
 */

const HEADY_MAID_CONFIG = Object.freeze({
  scanRhythmsMs: {
    quickScan: 30000,
    deepScan: 300000,
  },
  concurrencyLimit: 3,
  exclusionPatterns: [
    "node_modules",
    ".git",
    ".venv",
    "__pycache__",
    "dist",
    "build",
    ".next",
  ],
  memoryPersistencePath: ".heady-memory/inventory/",
  primaryArtifact: "inventory.json",
  optimizationLogic: {
    duplicateDetection: {
      algorithm: "sha256",
      maxFileSizeBytes: 10 * 1024 * 1024,
    },
    misplacedFileRules: {
      codeExtensions: [".js", ".ts", ".py", ".jsx", ".tsx"],
      codeAllowedRoots: ["src", "scripts"],
      configExtensions: [".json", ".yml", ".env"],
      configAllowedRoots: [".", "config"],
      maxConfigDepth: 3,
    },
    outdatedFile: {
      thresholdDays: 90,
      action: "review-priority-low",
    },
  },
  eventRouting: {
    taskDetected: {
      optimization: {
        priorities: {
          duplicates: "low",
          misplaced: "normal",
        },
        requiredPayloadFields: ["checksum", "potentialSavings", "suggestion"],
      },
      review: {
        priorities: {
          outdated: "low",
        },
        requiredPayloadFields: ["daysSinceModified"],
      },
    },
  },
});

module.exports = {
  HEADY_MAID_CONFIG,
};
