/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              HEADY NAMING ENFORCER                           ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📝 DETECT        🔍 VALIDATE       ✏️ CORRECT        ✅ ENFORCE
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │ Scan   │─────▶│ Check    │─────▶│ Fix      │─────▶│ Validate │
 *    │ Files  │      │ Registry │      │ Names    │      │ & Report │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 * 
 * Enforces canonical naming conventions across the Heady ecosystem.
 * Eliminates discrepancies like "Heady Systems" vs "HeadySystems".
 */

const fs = require('fs').promises;
const path = require('path');

class NamingEnforcer {
  constructor() {
    // Canonical names (PascalCase, no spaces/hyphens)
    this.canonicalNames = {
      'HeadySystem': {
        canonical: 'HeadySystem',
        incorrect: ['Heady System', 'Heady-System', 'heady-system', 'heady system'],
        type: 'core'
      },
      'HeadySystems': {
        canonical: 'HeadySystems',
        incorrect: ['Heady Systems', 'Heady-Systems', 'heady-systems', 'heady systems'],
        type: 'organization'
      },
      'HeadyManager': {
        canonical: 'HeadyManager',
        incorrect: ['Heady Manager', 'Heady-Manager', 'heady-manager', 'heady manager'],
        type: 'service'
      },
      'HeadyMaid': {
        canonical: 'HeadyMaid',
        incorrect: ['Heady Maid', 'Heady-Maid', 'heady-maid', 'heady maid'],
        type: 'service'
      },
      'HeadySync': {
        canonical: 'HeadySync',
        incorrect: ['Heady Sync', 'Heady-Sync', 'heady-sync', 'heady sync'],
        type: 'tool'
      },
      'HeadyConnection': {
        canonical: 'HeadyConnection',
        incorrect: ['Heady Connection', 'Heady-Connection', 'heady-connection', 'heady connection'],
        type: 'entity'
      },
      'HeadyProtocol': {
        canonical: 'HeadyProtocol',
        incorrect: ['Heady Protocol', 'Heady-Protocol', 'heady-protocol', 'heady protocol'],
        type: 'protocol'
      },
      'HeadyOrchestrator': {
        canonical: 'HeadyOrchestrator',
        incorrect: ['Heady Orchestrator', 'Heady-Orchestrator', 'orchestrator', 'Orchestrator'],
        type: 'service',
        note: 'Always use HeadyOrchestrator, not just "orchestrator"'
      },
      'HeadyRouter': {
        canonical: 'HeadyRouter',
        incorrect: ['Heady Router', 'Heady-Router', 'heady-router', 'heady router', 'heady-windsurf-router'],
        type: 'service'
      },
      'HeadyMCP': {
        canonical: 'HeadyMCP',
        incorrect: ['Heady MCP', 'Heady-MCP', 'heady-mcp', 'heady mcp'],
        type: 'protocol'
      },
      'HeadyHive': {
        canonical: 'HeadyHive',
        incorrect: ['Heady Hive', 'Heady-Hive', 'heady-hive', 'heady hive'],
        type: 'network'
      },
      'HeadyAcademy': {
        canonical: 'HeadyAcademy',
        incorrect: ['Heady Academy', 'Heady-Academy', 'heady-academy', 'heady academy'],
        type: 'tooling'
      },
      'HeadyChain': {
        canonical: 'HeadyChain',
        incorrect: ['Heady Chain', 'Heady-Chain', 'heady-chain', 'heady chain'],
        type: 'security'
      },
      'HeadyCrypt': {
        canonical: 'HeadyCrypt',
        incorrect: ['Heady Crypt', 'Heady-Crypt', 'heady-crypt', 'heady crypt'],
        type: 'security'
      },
      'HeadyGraph': {
        canonical: 'HeadyGraph',
        incorrect: ['Heady Graph', 'Heady-Graph', 'heady-graph', 'heady graph'],
        type: 'service'
      },
      'HeadyMetrics': {
        canonical: 'HeadyMetrics',
        incorrect: ['Heady Metrics', 'Heady-Metrics', 'heady-metrics', 'heady metrics'],
        type: 'service'
      },
      'HeadyWorkflow': {
        canonical: 'HeadyWorkflow',
        incorrect: ['Heady Workflow', 'Heady-Workflow', 'heady-workflow', 'heady workflow'],
        type: 'service'
      },
      'HeadyAdmin': {
        canonical: 'HeadyAdmin',
        incorrect: ['Heady Admin', 'Heady-Admin', 'heady-admin', 'heady admin'],
        type: 'interface'
      },
      'HeadyIDE': {
        canonical: 'HeadyIDE',
        incorrect: ['Heady IDE', 'Heady-IDE', 'heady-ide', 'heady ide'],
        type: 'interface'
      }
    };

    this.exceptions = {
      // File/directory names can use kebab-case
      fileNames: ['heady-manager.js', 'mcp-servers', 'heady-router'],
      // Environment variables can use SCREAMING_SNAKE_CASE
      envVars: ['HEADY_API_KEY', 'HEADY_MANAGER_URL'],
      // npm package names use kebab-case
      packages: ['@heady/core', 'heady-systems-core']
    };

    this.violations = [];
  }

  /**
   * Scan file for naming violations
   */
  async scanFile(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const violations = [];

      for (const [canonical, config] of Object.entries(this.canonicalNames)) {
        for (const incorrect of config.incorrect) {
          // Skip if it's an allowed exception
          if (this.isException(incorrect, filepath)) continue;

          const regex = new RegExp(incorrect, 'gi');
          const matches = content.match(regex);

          if (matches) {
            violations.push({
              file: filepath,
              canonical,
              found: incorrect,
              occurrences: matches.length,
              type: config.type,
              note: config.note
            });
          }
        }
      }

      return violations;
    } catch (err) {
      return [];
    }
  }

  /**
   * Check if usage is an allowed exception
   */
  isException(name, filepath) {
    // File names can use kebab-case
    if (filepath.includes(name.toLowerCase().replace(/ /g, '-'))) {
      return true;
    }

    // Check if it's in exceptions list
    return this.exceptions.fileNames.some(ex => filepath.includes(ex));
  }

  /**
   * Scan entire codebase
   */
  async scanCodebase(rootDir) {
    console.log('[NAMING ENFORCER] Scanning for naming violations...');

    const files = await this.getAllFiles(rootDir, ['.js', '.md', '.json', '.ps1']);
    const allViolations = [];

    for (const file of files) {
      const violations = await this.scanFile(file);
      allViolations.push(...violations);
    }

    this.violations = allViolations;

    return {
      total: allViolations.length,
      violations: allViolations,
      byType: this.groupByType(allViolations),
      byFile: this.groupByFile(allViolations)
    };
  }

  /**
   * Get all files recursively
   */
  async getAllFiles(dir, extensions) {
    const files = [];

    const scan = async (currentDir) => {
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);

          if (entry.name.includes('node_modules') || entry.name.startsWith('.')) {
            continue;
          }

          if (entry.isDirectory()) {
            await scan(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (err) {
        // Skip inaccessible directories
      }
    };

    await scan(dir);
    return files;
  }

  /**
   * Group violations by type
   */
  groupByType(violations) {
    const grouped = {};

    for (const v of violations) {
      if (!grouped[v.type]) grouped[v.type] = [];
      grouped[v.type].push(v);
    }

    return grouped;
  }

  /**
   * Group violations by file
   */
  groupByFile(violations) {
    const grouped = {};

    for (const v of violations) {
      if (!grouped[v.file]) grouped[v.file] = [];
      grouped[v.file].push(v);
    }

    return grouped;
  }

  /**
   * Generate fix recommendations
   */
  generateFixRecommendations() {
    const recommendations = [];

    for (const [canonical, config] of Object.entries(this.canonicalNames)) {
      const violations = this.violations.filter(v => v.canonical === canonical);

      if (violations.length > 0) {
        recommendations.push({
          canonical,
          violations: violations.length,
          files: [...new Set(violations.map(v => v.file))].length,
          action: `Replace all instances with "${canonical}"`,
          priority: violations.length > 10 ? 'HIGH' : 'MEDIUM',
          note: config.note
        });
      }
    }

    return recommendations.sort((a, b) => b.violations - a.violations);
  }

  /**
   * Auto-fix naming violations
   */
  async autoFix(filepath, dryRun = false) {
    try {
      let content = await fs.readFile(filepath, 'utf8');
      let fixed = 0;

      for (const [canonical, config] of Object.entries(this.canonicalNames)) {
        for (const incorrect of config.incorrect) {
          if (this.isException(incorrect, filepath)) continue;

          const regex = new RegExp(incorrect, 'g');
          const matches = content.match(regex);

          if (matches) {
            content = content.replace(regex, canonical);
            fixed += matches.length;
          }
        }
      }

      if (fixed > 0 && !dryRun) {
        await fs.writeFile(filepath, content, 'utf8');
      }

      return { file: filepath, fixed, dryRun };
    } catch (err) {
      return { file: filepath, fixed: 0, error: err.message };
    }
  }

  /**
   * Generate naming report
   */
  generateReport() {
    const report = {
      summary: {
        totalViolations: this.violations.length,
        affectedFiles: [...new Set(this.violations.map(v => v.file))].length,
        canonicalNames: Object.keys(this.canonicalNames).length
      },
      violations: this.violations,
      recommendations: this.generateFixRecommendations(),
      timestamp: new Date().toISOString()
    };

    return report;
  }
}

module.exports = NamingEnforcer;
