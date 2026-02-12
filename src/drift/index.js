/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  drift/index.js - Configuration Drift Detection Engine         ║
 * ║  Multi-signal scoring, HCFP-rebuild trigger, auto-remediation  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const manifest = require('../../heady-architecture-manifest.json');

// ═══════════════════════════════════════════════════════════════
// DRIFT SIGNAL DETECTORS
// ═══════════════════════════════════════════════════════════════

class NamingConsistencyDetector {
  constructor(config) {
    this.weight = config.weight || 0.15;
    this.threshold = config.threshold || 0.05;
    this.patterns = {
      files: /^[a-z][a-z0-9_-]*\.(js|ts|py|json|yaml|yml|md)$/,
      directories: /^[a-z][a-z0-9_-]*$/,
      envVars: /^[A-Z][A-Z0-9_]*$/,
      apiEndpoints: /^\/api\/v\d+\/[a-z][a-z0-9/-]*$/,
      cssClasses: /^[a-z][a-z0-9-]*$/
    };
  }

  async detect(projectRoot) {
    const violations = [];
    const totalChecked = { files: 0, dirs: 0, envVars: 0 };

    try {
      const files = this._walkDir(projectRoot, 3);
      for (const file of files) {
        const basename = path.basename(file);
        const isDir = fs.statSync(file).isDirectory();

        if (isDir) {
          totalChecked.dirs++;
          if (!this.patterns.directories.test(basename) && !basename.startsWith('.')) {
            violations.push({ type: 'directory_naming', path: file, expected: 'lowercase-kebab' });
          }
        } else {
          totalChecked.files++;
          if (!this.patterns.files.test(basename) && !basename.startsWith('.') && !basename.startsWith('README')) {
            violations.push({ type: 'file_naming', path: file, expected: 'lowercase with hyphens/underscores' });
          }
        }
      }

      // Check env var naming
      if (fs.existsSync(path.join(projectRoot, '.env.example'))) {
        const envContent = fs.readFileSync(path.join(projectRoot, '.env.example'), 'utf8');
        const envLines = envContent.split('\n').filter(l => l.includes('=') && !l.startsWith('#'));
        for (const line of envLines) {
          totalChecked.envVars++;
          const varName = line.split('=')[0].trim();
          if (!this.patterns.envVars.test(varName)) {
            violations.push({ type: 'env_var_naming', name: varName, expected: 'UPPER_SNAKE_CASE' });
          }
        }
      }
    } catch (e) {
      violations.push({ type: 'scan_error', message: e.message });
    }

    const total = totalChecked.files + totalChecked.dirs + totalChecked.envVars;
    const violationRate = total > 0 ? violations.length / total : 0;

    return {
      signal: 'naming_consistency',
      weight: this.weight,
      severity: violationRate > this.threshold ? Math.min(violationRate * 10, 1.0) : 0,
      violations: violations.slice(0, 20),
      stats: { total, violations: violations.length, rate: violationRate }
    };
  }

  _walkDir(dir, maxDepth, depth = 0) {
    if (depth >= maxDepth) return [];
    const results = [];
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
        const fullPath = path.join(dir, entry);
        results.push(fullPath);
        if (fs.statSync(fullPath).isDirectory()) {
          results.push(...this._walkDir(fullPath, maxDepth, depth + 1));
        }
      }
    } catch (e) { /* skip unreadable dirs */ }
    return results;
  }
}

class DependencySkewDetector {
  constructor(config) {
    this.weight = config.weight || 0.25;
    this.threshold = config.threshold || 3;
  }

  async detect(projectRoot) {
    const lockfiles = [];
    const skewedPackages = [];

    // Find all package-lock.json files
    this._findLockfiles(projectRoot, lockfiles, 3);

    if (lockfiles.length < 2) {
      return {
        signal: 'dependency_skew',
        weight: this.weight,
        severity: 0,
        skewedPackages: [],
        stats: { lockfilesFound: lockfiles.length, skewedCount: 0 }
      };
    }

    // Compare dependency versions across lockfiles
    const depVersions = {};
    for (const lockfile of lockfiles) {
      try {
        const content = JSON.parse(fs.readFileSync(lockfile, 'utf8'));
        const deps = content.dependencies || content.packages || {};
        for (const [name, info] of Object.entries(deps)) {
          const version = typeof info === 'string' ? info : info.version;
          if (!version) continue;
          const cleanName = name.replace(/^node_modules\//, '');
          if (!depVersions[cleanName]) depVersions[cleanName] = new Map();
          depVersions[cleanName].set(lockfile, version);
        }
      } catch (e) { /* skip unparseable */ }
    }

    for (const [pkg, versions] of Object.entries(depVersions)) {
      const uniqueVersions = new Set(versions.values());
      if (uniqueVersions.size > 1) {
        skewedPackages.push({
          package: pkg,
          versions: Object.fromEntries(
            Array.from(versions.entries()).map(([f, v]) => [path.relative(projectRoot, f), v])
          )
        });
      }
    }

    const severity = skewedPackages.length >= this.threshold
      ? Math.min(skewedPackages.length / (this.threshold * 3), 1.0)
      : 0;

    return {
      signal: 'dependency_skew',
      weight: this.weight,
      severity,
      skewedPackages: skewedPackages.slice(0, 20),
      stats: { lockfilesFound: lockfiles.length, skewedCount: skewedPackages.length }
    };
  }

  _findLockfiles(dir, results, maxDepth, depth = 0) {
    if (depth >= maxDepth) return;
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (entry === 'node_modules' || entry === '.git') continue;
        const fullPath = path.join(dir, entry);
        if (entry === 'package-lock.json') {
          results.push(fullPath);
        } else if (fs.statSync(fullPath).isDirectory()) {
          this._findLockfiles(fullPath, results, maxDepth, depth + 1);
        }
      }
    } catch (e) { /* skip */ }
  }
}

class ConfigDriftDetector {
  constructor(config) {
    this.weight = config.weight || 0.20;
  }

  async detect(projectRoot) {
    const drifts = [];

    // Compare .env.example with actual required env vars in code
    const envExample = path.join(projectRoot, '.env.example');
    if (fs.existsSync(envExample)) {
      const declaredVars = new Set();
      const content = fs.readFileSync(envExample, 'utf8');
      for (const line of content.split('\n')) {
        if (line.includes('=') && !line.startsWith('#')) {
          declaredVars.add(line.split('=')[0].trim());
        }
      }

      // Scan JS files for process.env references
      const usedVars = new Set();
      this._scanForEnvVars(projectRoot, usedVars, 4);

      // Find vars used but not declared
      for (const v of usedVars) {
        if (!declaredVars.has(v) && !['NODE_ENV', 'PORT', 'PATH', 'HOME'].includes(v)) {
          drifts.push({ type: 'undeclared_env_var', variable: v, fix: `Add ${v}= to .env.example` });
        }
      }

      // Find vars declared but never used
      for (const v of declaredVars) {
        if (!usedVars.has(v)) {
          drifts.push({ type: 'unused_env_var', variable: v, fix: `Remove ${v} from .env.example or use it` });
        }
      }
    }

    const severity = drifts.length > 0 ? Math.min(drifts.length / 10, 1.0) : 0;

    return {
      signal: 'config_drift',
      weight: this.weight,
      severity,
      drifts: drifts.slice(0, 20),
      stats: { driftCount: drifts.length }
    };
  }

  _scanForEnvVars(dir, results, maxDepth, depth = 0) {
    if (depth >= maxDepth) return;
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (['node_modules', '.git', 'dist', 'build'].includes(entry)) continue;
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          this._scanForEnvVars(fullPath, results, maxDepth, depth + 1);
        } else if (entry.endsWith('.js') || entry.endsWith('.ts')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g);
            for (const m of matches) results.add(m[1]);
          } catch (e) { /* skip */ }
        }
      }
    } catch (e) { /* skip */ }
  }
}

class DockerImageDivergenceDetector {
  constructor(config) {
    this.weight = config.weight || 0.15;
  }

  async detect(projectRoot) {
    const dockerfiles = [];
    this._findDockerfiles(projectRoot, dockerfiles, 3);

    const baseImages = {};
    for (const df of dockerfiles) {
      try {
        const content = fs.readFileSync(df, 'utf8');
        const fromLines = content.match(/^FROM\s+.+$/gm) || [];
        for (const line of fromLines) {
          const image = line.replace(/^FROM\s+/, '').split(/\s+/)[0];
          const baseName = image.split('@')[0].split(':')[0];
          if (!baseImages[baseName]) baseImages[baseName] = [];
          baseImages[baseName].push({ file: path.relative(projectRoot, df), fullRef: image });
        }
      } catch (e) { /* skip */ }
    }

    const divergences = [];
    for (const [base, refs] of Object.entries(baseImages)) {
      const uniqueRefs = new Set(refs.map(r => r.fullRef));
      if (uniqueRefs.size > 1) {
        divergences.push({ baseImage: base, references: refs });
      }
      // Check for unpinned images (no SHA or specific version)
      for (const ref of refs) {
        if (!ref.fullRef.includes('@sha256:') && !ref.fullRef.match(/:\d+\.\d+/)) {
          divergences.push({ type: 'unpinned_image', image: ref.fullRef, file: ref.file, fix: 'Pin to SHA256 digest or exact version' });
        }
      }
    }

    const severity = divergences.length > 0 ? Math.min(divergences.length / 5, 1.0) : 0;

    return {
      signal: 'docker_image_divergence',
      weight: this.weight,
      severity,
      divergences: divergences.slice(0, 10),
      stats: { dockerfilesFound: dockerfiles.length, divergenceCount: divergences.length }
    };
  }

  _findDockerfiles(dir, results, maxDepth, depth = 0) {
    if (depth >= maxDepth) return;
    try {
      for (const entry of fs.readdirSync(dir)) {
        if (['node_modules', '.git'].includes(entry)) continue;
        const fullPath = path.join(dir, entry);
        if (entry === 'Dockerfile' || entry.startsWith('Dockerfile.')) {
          results.push(fullPath);
        } else if (fs.statSync(fullPath).isDirectory()) {
          this._findDockerfiles(fullPath, results, maxDepth, depth + 1);
        }
      }
    } catch (e) { /* skip */ }
  }
}

class ApiSchemaMismatchDetector {
  constructor(config) {
    this.weight = config.weight || 0.15;
  }

  async detect(projectRoot) {
    // Compare declared API routes in manifest vs actual route handlers
    const declaredEndpoints = new Set();
    const implementedEndpoints = new Set();

    // Extract from architecture manifest
    try {
      const m = require(path.join(projectRoot, 'heady-architecture-manifest.json'));
      if (m.services?.['heady-manager']?.modules) {
        for (const [name, mod] of Object.entries(m.services['heady-manager'].modules)) {
          declaredEndpoints.add(`/api/v1/${name}`);
        }
      }
    } catch (e) { /* no manifest */ }

    // Scan for Express route handlers
    this._scanRoutes(projectRoot, implementedEndpoints, 4);

    const missingImplementation = [];
    const undeclaredRoutes = [];

    for (const ep of declaredEndpoints) {
      if (!implementedEndpoints.has(ep)) {
        missingImplementation.push(ep);
      }
    }

    const severity = missingImplementation.length > 0
      ? Math.min(missingImplementation.length / 5, 1.0) : 0;

    return {
      signal: 'api_schema_mismatch',
      weight: this.weight,
      severity,
      missingImplementation,
      undeclaredRoutes: Array.from(undeclaredRoutes).slice(0, 10),
      stats: { declared: declaredEndpoints.size, implemented: implementedEndpoints.size }
    };
  }

  _scanRoutes(dir, results, maxDepth, depth = 0) {
    if (depth >= maxDepth) return;
    try {
      for (const entry of fs.readdirSync(dir)) {
        if (['node_modules', '.git', 'dist'].includes(entry)) continue;
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          this._scanRoutes(fullPath, results, maxDepth, depth + 1);
        } else if (entry.endsWith('.js')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const routeMatches = content.matchAll(/\.(get|post|put|delete|patch|use)\s*\(\s*['"`](\/api\/[^'"`]+)/g);
            for (const m of routeMatches) results.add(m[2]);
          } catch (e) { /* skip */ }
        }
      }
    } catch (e) { /* skip */ }
  }
}

class SoulValueDriftDetector {
  constructor(config) {
    this.weight = config.weight || 0.10;
    this.threshold = config.threshold || 60;
  }

  async detect(projectRoot) {
    // Check if HeadySoul value weights match manifest
    const issues = [];

    try {
      const soulConfigPath = path.join(projectRoot, 'src', 'soul', 'heady-soul.yaml');
      if (fs.existsSync(soulConfigPath)) {
        const content = fs.readFileSync(soulConfigPath, 'utf8');
        const manifestWeights = manifest.soulIntegration?.valueWeights || {};

        for (const [key, expectedWeight] of Object.entries(manifestWeights)) {
          const regex = new RegExp(`${key}:\\s*([\\d.]+)`);
          const match = content.match(regex);
          if (match) {
            const actual = parseFloat(match[1]);
            if (Math.abs(actual - expectedWeight) > 0.01) {
              issues.push({
                type: 'weight_mismatch',
                value: key,
                expected: expectedWeight,
                actual,
                fix: `Update ${key} to ${expectedWeight} in heady-soul.yaml`
              });
            }
          }
        }
      }

      // Check hard vetoes are all implemented
      const hardVetoes = manifest.soulIntegration?.hardVetoes || [];
      const soulJsPath = path.join(projectRoot, 'src', 'soul', 'heady_soul.js');
      if (fs.existsSync(soulJsPath)) {
        const soulContent = fs.readFileSync(soulJsPath, 'utf8');
        for (const veto of hardVetoes) {
          if (!soulContent.includes(veto)) {
            issues.push({
              type: 'missing_hard_veto',
              veto,
              fix: `Add '${veto}' to hard veto list in heady_soul.js`
            });
          }
        }
      }
    } catch (e) {
      issues.push({ type: 'scan_error', message: e.message });
    }

    const severity = issues.length > 0 ? Math.min(issues.length / 3, 1.0) : 0;

    return {
      signal: 'soul_value_drift',
      weight: this.weight,
      severity,
      issues: issues.slice(0, 10),
      stats: { issueCount: issues.length }
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// DRIFT DETECTION ENGINE
// ═══════════════════════════════════════════════════════════════

class DriftDetectionEngine extends EventEmitter {
  constructor(projectRoot, options = {}) {
    super();
    this.projectRoot = projectRoot;
    this.intervalMs = options.intervalMs || 1800000; // 30 minutes
    this.history = [];
    this.maxHistory = 100;
    this._timer = null;

    const driftConfig = manifest.driftDetection || {};
    const signals = driftConfig.signals || {};

    this.detectors = [
      new NamingConsistencyDetector(signals.namingInconsistency || {}),
      new DependencySkewDetector(signals.dependencySkew || {}),
      new ConfigDriftDetector(signals.configDrift || {}),
      new DockerImageDivergenceDetector(signals.dockerImageDivergence || {}),
      new ApiSchemaMismatchDetector(signals.apiSchemaMismatch || {}),
      new SoulValueDriftDetector(signals.soulValueDrift || {}),
    ];

    this.thresholds = driftConfig.thresholds || {
      autoTriggerRebuild: 0.7,
      warnAndQueue: 0.4,
      healthy: 0.4
    };
  }

  async runFullScan() {
    const startTime = Date.now();
    const results = await Promise.all(
      this.detectors.map(d => d.detect(this.projectRoot).catch(e => ({
        signal: d.constructor.name,
        weight: d.weight || 0,
        severity: 0,
        error: e.message
      })))
    );

    // Compute composite score
    const compositeScore = results.reduce((sum, r) => sum + (r.weight * r.severity), 0);
    const maxPossible = results.reduce((sum, r) => sum + r.weight, 0);
    const normalizedScore = maxPossible > 0 ? compositeScore / maxPossible : 0;

    let status, recommendation;
    if (normalizedScore >= this.thresholds.autoTriggerRebuild) {
      status = 'REBUILD_RECOMMENDED';
      recommendation = 'Significant drift detected. HCFP-rebuild recommended.';
    } else if (normalizedScore >= this.thresholds.warnAndQueue) {
      status = 'WARNING';
      recommendation = 'Moderate drift detected. Queue for next maintenance window.';
    } else {
      status = 'HEALTHY';
      recommendation = 'System configuration is consistent.';
    }

    const report = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      compositeScore: Math.round(normalizedScore * 100) / 100,
      status,
      recommendation,
      signals: results,
      thresholds: this.thresholds,
      rebuildProposal: status === 'REBUILD_RECOMMENDED' ? this._generateRebuildProposal(results) : null
    };

    this.history.push(report);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    this.emit('scan:complete', report);

    if (status === 'REBUILD_RECOMMENDED') {
      this.emit('rebuild:recommended', report);
    } else if (status === 'WARNING') {
      this.emit('drift:warning', report);
    }

    return report;
  }

  _generateRebuildProposal(signals) {
    const criticalSignals = signals
      .filter(s => s.severity > 0.5)
      .sort((a, b) => (b.weight * b.severity) - (a.weight * a.severity));

    return {
      priority: 'P0',
      estimatedEffort: this._estimateEffort(criticalSignals),
      affectedAreas: criticalSignals.map(s => s.signal),
      phases: [
        {
          phase: 1,
          name: 'Fix critical drift',
          actions: criticalSignals.map(s => ({
            signal: s.signal,
            fixes: (s.violations || s.skewedPackages || s.drifts || s.divergences || s.issues || [])
              .slice(0, 3)
              .map(v => v.fix || v.type || 'Review and fix')
          }))
        },
        {
          phase: 2,
          name: 'Verify determinism',
          actions: ['Run dual-build comparison', 'Verify lockfile integrity', 'Check Docker image reproducibility']
        },
        {
          phase: 3,
          name: 'Deploy and validate',
          actions: ['Deploy to dev', 'Run full test suite', 'Canary to staging', 'Promote to production']
        }
      ],
      rollbackPlan: {
        method: 'git-revert',
        lastKnownGood: this._getLastGoodCommit()
      }
    };
  }

  _estimateEffort(signals) {
    const baseHours = signals.length * 2;
    const complexityMultiplier = signals.some(s => s.signal === 'dependency_skew') ? 1.5 : 1.0;
    const hours = Math.ceil(baseHours * complexityMultiplier);
    return `${hours} hours estimated`;
  }

  _getLastGoodCommit() {
    try {
      return execSync('git log --oneline -1', { cwd: this.projectRoot, encoding: 'utf8' }).trim();
    } catch (e) {
      return 'unknown';
    }
  }

  startPeriodicScan() {
    this._timer = setInterval(() => {
      this.runFullScan().catch(e => this.emit('scan:error', e));
    }, this.intervalMs);
    // Run immediately on start
    this.runFullScan().catch(e => this.emit('scan:error', e));
    return this;
  }

  stopPeriodicScan() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    return this;
  }

  getHistory() {
    return this.history;
  }

  getLatestReport() {
    return this.history[this.history.length - 1] || null;
  }

  getTrend() {
    if (this.history.length < 2) return { trend: 'insufficient_data', dataPoints: this.history.length };
    const recent = this.history.slice(-5);
    const scores = recent.map(r => r.compositeScore);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const latest = scores[scores.length - 1];
    return {
      trend: latest > avg * 1.1 ? 'degrading' : latest < avg * 0.9 ? 'improving' : 'stable',
      latestScore: latest,
      averageScore: Math.round(avg * 100) / 100,
      dataPoints: recent.length
    };
  }
}

module.exports = {
  DriftDetectionEngine,
  NamingConsistencyDetector,
  DependencySkewDetector,
  ConfigDriftDetector,
  DockerImageDivergenceDetector,
  ApiSchemaMismatchDetector,
  SoulValueDriftDetector
};
