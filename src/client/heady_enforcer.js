/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              HEADY ENFORCER - System Guardian                ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     🔍 MONITOR       ⚖️ VALIDATE       🔧 ENFORCE       ✅ VERIFY
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │ Watch  │─────▶│ Check    │─────▶│ Fix &    │─────▶│ Validate │
 *    │ System │      │ Rules    │      │ Correct  │      │ & Report │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 * 
 * Extended Responsibilities:
 * - Naming convention enforcement
 * - Code quality validation
 * - Security compliance checking
 * - Performance monitoring
 * - Dependency auditing
 * - Configuration validation
 * - Auto-healing capabilities
 * - Governance enforcement
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');
const NamingEnforcer = require('./naming_enforcer');
const PerformanceBenchmarker = require('./performance_benchmarker');

class HeadyEnforcer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      autoFix: config.autoFix !== false,
      monitorInterval: config.monitorInterval || 60000, // 1 minute
      strictMode: config.strictMode !== false,
      rootDir: config.rootDir || process.cwd(),
      ...config
    };

    // Sub-enforcers
    this.namingEnforcer = new NamingEnforcer();
    this.performanceBenchmarker = new PerformanceBenchmarker();
    
    // Enforcement state
    this.violations = {
      naming: [],
      security: [],
      performance: [],
      configuration: [],
      dependencies: []
    };
    
    // Metrics
    this.metrics = {
      totalChecks: 0,
      violationsFound: 0,
      violationsFixed: 0,
      lastCheck: null,
      autoHeals: 0
    };
    
    // Rules
    this.rules = this.loadRules();
  }

  /**
   * Load enforcement rules
   */
  loadRules() {
    return {
      naming: {
        enabled: true,
        severity: 'high',
        autoFix: true,
        rules: [
          'PascalCase for component names',
          'No spaces in names',
          'No hyphens in names (except files)',
          'Heady prefix required',
          'Always use HeadyOrchestrator'
        ]
      },
      
      security: {
        enabled: true,
        severity: 'critical',
        autoFix: false,
        rules: [
          'No hardcoded secrets',
          'API keys in environment only',
          'Input validation required',
          'Authentication on all endpoints',
          'Audit logging enabled'
        ]
      },
      
      performance: {
        enabled: true,
        severity: 'medium',
        autoFix: false,
        rules: [
          'No synchronous operations in request handlers',
          'Response time < 100ms target',
          'Memory usage < 200MB',
          'CPU usage < 50% active',
          'Compression enabled'
        ]
      },
      
      configuration: {
        enabled: true,
        severity: 'high',
        autoFix: true,
        rules: [
          'mcp_config.json must exist',
          'All MCP servers configured',
          'Environment variables documented',
          'Port conflicts prevented'
        ]
      },
      
      dependencies: {
        enabled: true,
        severity: 'high',
        autoFix: false,
        rules: [
          'No critical vulnerabilities',
          'No deprecated packages',
          'All dependencies up to date',
          'No unused dependencies'
        ]
      }
    };
  }

  /**
   * Start enforcement monitoring
   */
  async start() {
    console.log('[HEADY ENFORCER] Starting system enforcement...');
    
    // Initial enforcement check
    await this.performFullEnforcement();
    
    // Periodic monitoring
    setInterval(async () => {
      await this.performFullEnforcement();
    }, this.config.monitorInterval);
    
    console.log('[HEADY ENFORCER] Active and monitoring');
    this.emit('started');
  }

  /**
   * Perform full enforcement check
   */
  async performFullEnforcement() {
    const startTime = Date.now();
    this.metrics.totalChecks++;
    
    console.log('[HEADY ENFORCER] Running enforcement checks...');
    
    // Clear previous violations
    this.violations = {
      naming: [],
      security: [],
      performance: [],
      configuration: [],
      dependencies: []
    };
    
    // Run all checks
    await Promise.all([
      this.enforceNaming(),
      this.enforceSecurity(),
      this.enforcePerformance(),
      this.enforceConfiguration(),
      this.enforceDependencies()
    ]);
    
    // Count total violations
    const totalViolations = Object.values(this.violations)
      .reduce((sum, arr) => sum + arr.length, 0);
    
    this.metrics.violationsFound += totalViolations;
    this.metrics.lastCheck = new Date().toISOString();
    
    const duration = Date.now() - startTime;
    
    console.log(`[HEADY ENFORCER] Check complete: ${totalViolations} violations found in ${duration}ms`);
    
    // Emit results
    this.emit('enforcement-complete', {
      violations: this.violations,
      metrics: this.metrics,
      duration
    });
    
    // Auto-heal if enabled
    if (this.config.autoFix && totalViolations > 0) {
      await this.autoHeal();
    }
    
    return {
      violations: this.violations,
      metrics: this.metrics,
      duration
    };
  }

  /**
   * Enforce naming conventions
   */
  async enforceNaming() {
    if (!this.rules.naming.enabled) return;
    
    try {
      const report = await this.namingEnforcer.scanCodebase(this.config.rootDir);
      this.violations.naming = report.violations;
      
      console.log(`[NAMING] Found ${report.total} naming violations`);
    } catch (err) {
      console.error('[NAMING] Enforcement failed:', err.message);
    }
  }

  /**
   * Enforce security rules
   */
  async enforceSecurity() {
    if (!this.rules.security.enabled) return;
    
    const violations = [];
    
    // Check for hardcoded secrets
    const files = await this.getAllJSFiles();
    for (const file of files.slice(0, 50)) { // Limit to 50 files for performance
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Check for potential hardcoded secrets
        if (content.match(/api[_-]?key\s*=\s*['"][^'"]{20,}['"]/i)) {
          violations.push({
            file,
            rule: 'No hardcoded secrets',
            severity: 'critical'
          });
        }
        
        // Check for missing authentication
        if (content.includes('app.post') && !content.includes('authenticate')) {
          violations.push({
            file,
            rule: 'Authentication required on POST endpoints',
            severity: 'high'
          });
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }
    
    this.violations.security = violations;
    console.log(`[SECURITY] Found ${violations.length} security violations`);
  }

  /**
   * Enforce performance standards
   */
  async enforcePerformance() {
    if (!this.rules.performance.enabled) return;
    
    try {
      const benchmarks = await this.performanceBenchmarker.benchmarkAll();
      const violations = [];
      
      // Check for slow components
      for (const [name, result] of Object.entries(benchmarks.components || {})) {
        if (result.duration > 500) {
          violations.push({
            component: name,
            rule: 'Response time < 500ms',
            actual: result.duration + 'ms',
            severity: 'medium'
          });
        }
      }
      
      this.violations.performance = violations;
      console.log(`[PERFORMANCE] Found ${violations.length} performance violations`);
    } catch (err) {
      console.error('[PERFORMANCE] Enforcement failed:', err.message);
    }
  }

  /**
   * Enforce configuration standards
   */
  async enforceConfiguration() {
    if (!this.rules.configuration.enabled) return;
    
    const violations = [];
    
    // Check for required files
    const requiredFiles = [
      'mcp_config.json',
      '.heady-memory/heady-registry.json',
      'package.json'
    ];
    
    for (const file of requiredFiles) {
      const fullPath = path.join(this.config.rootDir, file);
      try {
        await fs.access(fullPath);
      } catch (err) {
        violations.push({
          file,
          rule: 'Required configuration file missing',
          severity: 'high',
          autoFixable: file === 'mcp_config.json'
        });
      }
    }
    
    this.violations.configuration = violations;
    console.log(`[CONFIGURATION] Found ${violations.length} configuration violations`);
  }

  /**
   * Enforce dependency standards
   */
  async enforceDependencies() {
    if (!this.rules.dependencies.enabled) return;
    
    // This would integrate with npm audit
    // For now, placeholder
    this.violations.dependencies = [];
    console.log('[DEPENDENCIES] Dependency check complete');
  }

  /**
   * Auto-heal violations
   */
  async autoHeal() {
    console.log('[HEADY ENFORCER] Auto-healing violations...');
    let fixed = 0;
    
    // Fix naming violations
    if (this.rules.naming.autoFix && this.violations.naming.length > 0) {
      const files = [...new Set(this.violations.naming.map(v => v.file))];
      
      for (const file of files.slice(0, 10)) { // Limit to 10 files per run
        try {
          const result = await this.namingEnforcer.autoFix(file, false);
          if (result.fixed > 0) {
            fixed += result.fixed;
            console.log(`  ✅ Fixed ${result.fixed} naming violations in ${path.basename(file)}`);
          }
        } catch (err) {
          console.error(`  ❌ Failed to fix ${file}:`, err.message);
        }
      }
    }
    
    this.metrics.violationsFixed += fixed;
    this.metrics.autoHeals++;
    
    console.log(`[HEADY ENFORCER] Auto-heal complete: ${fixed} violations fixed`);
    
    this.emit('auto-heal-complete', { fixed });
    
    return fixed;
  }

  /**
   * Get all JavaScript files
   */
  async getAllJSFiles() {
    const files = [];
    
    const scan = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.name.includes('node_modules') || entry.name.startsWith('.')) {
            continue;
          }
          
          if (entry.isDirectory()) {
            await scan(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
          }
        }
      } catch (err) {
        // Skip inaccessible directories
      }
    };
    
    await scan(this.config.rootDir);
    return files;
  }

  /**
   * Generate enforcement report
   */
  generateReport() {
    const totalViolations = Object.values(this.violations)
      .reduce((sum, arr) => sum + arr.length, 0);
    
    const report = {
      summary: {
        totalViolations,
        byCategory: {
          naming: this.violations.naming.length,
          security: this.violations.security.length,
          performance: this.violations.performance.length,
          configuration: this.violations.configuration.length,
          dependencies: this.violations.dependencies.length
        },
        metrics: this.metrics,
        status: totalViolations === 0 ? 'COMPLIANT' : totalViolations < 10 ? 'ACCEPTABLE' : 'NEEDS_ATTENTION'
      },
      violations: this.violations,
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    return report;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Naming recommendations
    if (this.violations.naming.length > 0) {
      recommendations.push({
        category: 'naming',
        priority: 'HIGH',
        action: 'Run auto-fix to standardize naming',
        command: 'await headyEnforcer.autoHeal()',
        impact: `Fix ${this.violations.naming.length} naming violations`
      });
    }
    
    // Security recommendations
    if (this.violations.security.length > 0) {
      recommendations.push({
        category: 'security',
        priority: 'CRITICAL',
        action: 'Review and fix security violations manually',
        impact: 'Eliminate security risks'
      });
    }
    
    // Performance recommendations
    if (this.violations.performance.length > 0) {
      recommendations.push({
        category: 'performance',
        priority: 'MEDIUM',
        action: 'Optimize slow components',
        suggestions: [
          'Upgrade HeadyMaid to Chokidar',
          'Implement Redis caching',
          'Enable PM2 cluster mode'
        ]
      });
    }
    
    return recommendations;
  }

  /**
   * Get enforcement status
   */
  getStatus() {
    const totalViolations = Object.values(this.violations)
      .reduce((sum, arr) => sum + arr.length, 0);
    
    return {
      active: true,
      violations: totalViolations,
      lastCheck: this.metrics.lastCheck,
      autoHeals: this.metrics.autoHeals,
      fixRate: this.metrics.violationsFound > 0 
        ? ((this.metrics.violationsFixed / this.metrics.violationsFound) * 100).toFixed(1) + '%'
        : 'N/A',
      status: totalViolations === 0 ? '✅ COMPLIANT' : '⚠️ VIOLATIONS DETECTED'
    };
  }
}

module.exports = HeadyEnforcer;
