/**
 * HC AUTOBUILD - Heady Connection Automated Build System
 * 
 * Combines intelligent autobuild orchestration with hybrid squash merge protocol
 * Integrates with HeadyHive, MCP services, and Story Driver for complete automation
 * 
 * @version 1.0.0
 * @module HCAutoBuild
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const CheckpointReporter = require('./checkpoint_reporter');
const HeadySquashMerge = require('./heady_squash_merge');
const WindsurfHeadyBridge = require('./windsurf_heady_bridge');

class HCAutoBuild {
  constructor(config = {}) {
    this.rootDir = config.rootDir || process.cwd();
    this.mode = config.mode || 'auto'; // auto, manual, hybrid
    this.verbose = config.verbose || false;
    this.dryRun = config.dryRun || false;
    
    // Build configuration
    this.buildConfig = {
      phases: ['analyze', 'extract', 'merge', 'test', 'deploy'],
      currentPhase: null,
      phaseResults: {},
      startTime: null,
      endTime: null
    };
    
    // Merge configuration
    this.mergeConfig = {
      strategy: 'intelligent', // intelligent, force, safe
      conflictResolution: 'auto', // auto, manual, skip
      validationLevel: 'strict', // strict, moderate, loose
      preserveHistory: true
    };
    
    // State tracking
    this.state = {
      status: 'idle', // idle, running, paused, completed, failed
      currentTask: null,
      errors: [],
      warnings: [],
      metrics: {}
    };
    
    // MCP integration
    this.mcpEnabled = config.mcpEnabled !== false;
    this.mcpEndpoint = config.mcpEndpoint || 'http://localhost:3100';
    
    // Story Driver integration
    this.storyDriver = config.storyDriver !== false;
    this.checkpointReporter = new CheckpointReporter({
      rootDir: this.rootDir,
      outputDir: path.join(this.rootDir, 'audit_logs', 'autobuild')
    });
    
    // HeadyRegistry Router integration
    this.bridge = new WindsurfHeadyBridge();
    
    // HeadySquashMerge integration
    this.squashMerger = null; // Initialized during merge phase
  }

  /**
   * Main entry point - Execute full autobuild cycle
   */
  async execute(options = {}) {
    this.log('🚀 HC AutoBuild Starting...', 'info');
    this.state.status = 'running';
    this.buildConfig.startTime = new Date();
    
    try {
      // Pre-flight checks
      await this.preflightChecks();
      
      // Generate initial checkpoint
      if (this.storyDriver) {
        await this.generateCheckpoint('pre-build');
      }
      
      // Execute build phases
      for (const phase of this.buildConfig.phases) {
        await this.executePhase(phase, options);
      }
      
      // Generate final checkpoint
      if (this.storyDriver) {
        await this.generateCheckpoint('post-build');
      }
      
      this.buildConfig.endTime = new Date();
      this.state.status = 'completed';
      
      await this.generateBuildReport();
      
      this.log('✅ HC AutoBuild Completed Successfully', 'success');
      return this.getBuildSummary();
      
    } catch (error) {
      this.state.status = 'failed';
      this.state.errors.push(error);
      this.log(`❌ HC AutoBuild Failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Execute individual build phase
   */
  async executePhase(phase, options = {}) {
    this.buildConfig.currentPhase = phase;
    this.log(`\n📍 Phase: ${phase.toUpperCase()}`, 'phase');
    
    const phaseStart = Date.now();
    
    try {
      let result;
      
      switch (phase) {
      case 'analyze':
        result = await this.phaseAnalyze(options);
        break;
      case 'extract':
        result = await this.phaseExtract(options);
        break;
      case 'merge':
        result = await this.phaseMerge(options);
        break;
      case 'test':
        result = await this.phaseTest(options);
        break;
      case 'deploy':
        result = await this.phaseDeploy(options);
        break;
      default:
        throw new Error(`Unknown phase: ${phase}`);
      }
      
      const phaseEnd = Date.now();
      const duration = phaseEnd - phaseStart;
      
      this.buildConfig.phaseResults[phase] = {
        status: 'success',
        duration,
        result,
        timestamp: new Date().toISOString()
      };
      
      this.log(`✓ Phase ${phase} completed in ${duration}ms`, 'success');
      
    } catch (error) {
      this.buildConfig.phaseResults[phase] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.log(`✗ Phase ${phase} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * PHASE 1: ANALYZE
   * Analyze codebase, dependencies, and compatibility
   */
  async phaseAnalyze(options = {}) {
    this.log('Analyzing codebase structure...', 'info');
    
    const analysis = {
      repositories: [],
      dependencies: {},
      conflicts: [],
      compatibility: {},
      recommendations: []
    };
    
    // Scan for repositories to merge
    const repos = options.repositories || await this.detectRepositories();
    
    for (const repo of repos) {
      this.log(`  Scanning repository: ${repo.name}`, 'info');
      
      const repoAnalysis = await this.analyzeRepository(repo);
      analysis.repositories.push(repoAnalysis);
      
      // Merge dependencies
      Object.assign(analysis.dependencies, repoAnalysis.dependencies);
    }
    
    // Detect conflicts
    analysis.conflicts = await this.detectConflicts(analysis.repositories);
    
    // Check compatibility
    analysis.compatibility = await this.checkCompatibility(analysis.dependencies);
    
    // Generate recommendations
    if (this.mcpEnabled) {
      analysis.recommendations = await this.getMCPRecommendations(analysis);
    }
    
    // Save analysis report
    await this.saveAnalysisReport(analysis);
    
    return analysis;
  }

  /**
   * PHASE 2: EXTRACT
   * Extract components from source repositories
   */
  async phaseExtract(options = {}) {
    this.log('Extracting components from sources...', 'info');
    
    const extraction = {
      components: [],
      transformations: [],
      errors: []
    };
    
    const analysisResult = this.buildConfig.phaseResults.analyze?.result;
    if (!analysisResult) {
      throw new Error('Analysis phase must complete before extraction');
    }
    
    // Load extraction configuration
    const extractionConfig = options.extractionConfig || 
      await this.loadExtractionConfig();
    
    for (const [source, components] of Object.entries(extractionConfig)) {
      this.log(`  Extracting from ${source}...`, 'info');
      
      for (const [name, spec] of Object.entries(components)) {
        try {
          const extracted = await this.extractComponent({
            source,
            name,
            files: spec.files,
            purpose: spec.purpose,
            transform: spec.transform || 'heady'
          });
          
          extraction.components.push(extracted);
          
          // Apply Heady transformations
          if (spec.transform === 'heady') {
            const transformed = await this.applyHeadyTransformations(extracted);
            extraction.transformations.push(transformed);
          }
          
        } catch (error) {
          extraction.errors.push({
            source,
            component: name,
            error: error.message
          });
          this.log(`  ⚠ Failed to extract ${name}: ${error.message}`, 'warn');
        }
      }
    }
    
    await this.saveExtractionReport(extraction);
    
    return extraction;
  }

  /**
   * PHASE 3: MERGE
   * Intelligent merge using hybrid squash protocol
   */
  async phaseMerge(options = {}) {
    this.log('Executing intelligent merge protocol...', 'info');
    
    const merge = {
      strategy: this.mergeConfig.strategy,
      conflicts: [],
      resolutions: [],
      commits: [],
      status: 'pending'
    };
    
    // Pre-merge validation
    this.log('  Running pre-merge validation...', 'info');
    const validation = await this.validateMergeReadiness();
    
    if (!validation.passed) {
      if (this.mergeConfig.validationLevel === 'strict') {
        throw new Error(`Merge validation failed: ${validation.errors.join(', ')}`);
      } else {
        this.log('  ⚠ Validation warnings detected, proceeding...', 'warn');
        merge.warnings = validation.warnings;
      }
    }
    
    // Detect and resolve conflicts
    this.log('  Detecting conflicts...', 'info');
    merge.conflicts = await this.detectMergeConflicts();
    
    if (merge.conflicts.length > 0) {
      this.log(`  Found ${merge.conflicts.length} conflicts`, 'warn');
      
      if (this.mergeConfig.conflictResolution === 'auto') {
        merge.resolutions = await this.autoResolveConflicts(merge.conflicts);
      } else if (this.mergeConfig.conflictResolution === 'manual') {
        throw new Error('Manual conflict resolution required');
      }
    }
    
    // Execute merge strategy
    this.log('  Executing merge strategy...', 'info');
    
    switch (this.mergeConfig.strategy) {
    case 'intelligent':
      merge.commits = await this.intelligentSquashMerge(options);
      break;
    case 'force':
      merge.commits = await this.forceMerge(options);
      break;
    case 'safe':
      merge.commits = await this.safeMerge(options);
      break;
    }
    
    merge.status = 'completed';
    
    await this.saveMergeReport(merge);
    
    return merge;
  }

  /**
   * PHASE 4: TEST
   * Run comprehensive test suite
   */
  async phaseTest(options = {}) {
    this.log('Running test suite...', 'info');
    
    const testing = {
      suites: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      coverage: 0
    };
    
    const testSuites = options.testSuites || ['unit', 'integration', 'e2e'];
    
    for (const suite of testSuites) {
      this.log(`  Running ${suite} tests...`, 'info');
      
      try {
        const result = await this.runTestSuite(suite);
        testing.suites.push(result);
        testing.passed += result.passed;
        testing.failed += result.failed;
        testing.skipped += result.skipped;
        
      } catch (error) {
        this.log(`  ✗ ${suite} tests failed: ${error.message}`, 'error');
        testing.suites.push({
          name: suite,
          status: 'error',
          error: error.message
        });
      }
    }
    
    // Calculate coverage
    if (options.coverage !== false) {
      testing.coverage = await this.calculateCoverage();
    }
    
    await this.saveTestReport(testing);
    
    // Fail if tests failed and strict mode
    if (testing.failed > 0 && options.strictTesting !== false) {
      throw new Error(`${testing.failed} tests failed`);
    }
    
    return testing;
  }

  /**
   * PHASE 5: DEPLOY
   * Deploy merged application
   */
  async phaseDeploy(options = {}) {
    this.log('Deploying application...', 'info');
    
    const deployment = {
      target: options.target || 'production',
      artifacts: [],
      status: 'pending'
    };
    
    // Build artifacts
    this.log('  Building artifacts...', 'info');
    deployment.artifacts = await this.buildArtifacts(options);
    
    // Deploy to target
    this.log(`  Deploying to ${deployment.target}...`, 'info');
    
    if (!this.dryRun) {
      await this.deployToTarget(deployment.target, deployment.artifacts);
      deployment.status = 'deployed';
    } else {
      this.log('  (Dry run - skipping actual deployment)', 'info');
      deployment.status = 'dry-run';
    }
    
    await this.saveDeploymentReport(deployment);
    
    return deployment;
  }

  /**
   * Intelligent Squash Merge Implementation
   * Integrates HeadySquashMerge for advanced multi-codebase merging
   */
  async intelligentSquashMerge(_options = {}) {
    this.log('  Executing intelligent squash merge via HeadySquashMerge...', 'info');
    
    // Route through HeadyRegistry Router
    const routing = await this.bridge.interceptRequest(
      'Execute intelligent squash merge with weighted distribution',
      { phase: 'merge', buildId: this.buildConfig.startTime }
    );
    
    this.log(`  Routing: ${routing.shouldDelegate ? 'Heady Systems' : 'Direct'}`, 'info');
    
    // Prepare sources from analysis and extraction phases
    const sources = await this.prepareMergeSources(options);
    
    if (sources.length === 0) {
      this.log('  No sources to merge, using legacy merge...', 'warn');
      return await this.legacySquashMerge(options);
    }
    
    // Initialize HeadySquashMerge
    this.squashMerger = new HeadySquashMerge({
      outputDir: options.outputDir || path.join(this.rootDir, 'merged-output'),
      tempDir: path.join(this.rootDir, '.heady-merge-temp'),
      auditLog: path.join(this.rootDir, 'audit_logs', 'squash_merge.jsonl')
    });
    
    // Add sources with weights
    sources.forEach(source => {
      this.log(`    Adding source: ${source.name} (weight: ${source.weight})`, 'info');
      this.squashMerger.addSource(source.path, source.weight, source.metadata);
    });
    
    // Execute merge
    const mergeResult = await this.squashMerger.execute();
    
    if (!mergeResult.success) {
      throw new Error('HeadySquashMerge failed validation');
    }
    
    this.log(`  ✓ Merge complete: ${mergeResult.report.conflicts} conflicts resolved`, 'success');
    
    // Convert merge result to commits format
    const commits = mergeResult.report.resolutions.map(resolution => ({
      component: resolution.path,
      message: `Merged ${resolution.path} from ${resolution.source}`,
      strategy: resolution.strategy,
      timestamp: new Date().toISOString()
    }));
    
    return commits;
  }
  
  /**
   * Prepare merge sources from analysis and extraction results
   */
  async prepareMergeSources(options) {
    const sources = [];
    
    // Get analysis results
    const analysis = this.buildConfig.phaseResults.analyze?.result;
    if (!analysis || !analysis.repositories) {
      return sources;
    }
    
    // Convert repositories to merge sources with weights
    for (const repo of analysis.repositories) {
      // Calculate weight based on repository characteristics
      const weight = this.calculateRepositoryWeight(repo, analysis);
      
      sources.push({
        path: repo.path,
        weight,
        name: repo.name,
        metadata: {
          type: this.detectRepositoryType(repo),
          priority: this.calculatePriority(repo),
          frameworks: repo.metadata?.frameworks || [],
          dependencies: Object.keys(repo.dependencies || {}).length
        }
      });
    }
    
    return sources;
  }
  
  /**
   * Calculate repository weight for merge prioritization
   */
  calculateRepositoryWeight(repo, analysis) {
    let weight = 0.5; // Base weight
    
    // Increase weight for larger codebases
    const fileCount = Object.keys(repo.structure || {}).length;
    if (fileCount > 100) weight += 0.2;
    else if (fileCount > 50) weight += 0.1;
    
    // Increase weight for more dependencies (indicates maturity)
    const depCount = Object.keys(repo.dependencies || {}).length;
    if (depCount > 50) weight += 0.15;
    else if (depCount > 20) weight += 0.1;
    
    // Decrease weight if many conflicts
    const repoConflicts = analysis.conflicts.filter(c => 
      c.repos && c.repos.includes(repo.name)
    ).length;
    if (repoConflicts > 10) weight -= 0.2;
    else if (repoConflicts > 5) weight -= 0.1;
    
    // Normalize to 0-1 range
    return Math.max(0.1, Math.min(1.0, weight));
  }
  
  /**
   * Detect repository type
   */
  detectRepositoryType(repo) {
    const name = repo.name.toLowerCase();
    
    if (name.includes('core') || name.includes('main')) return 'core';
    if (name.includes('service') || name.includes('api')) return 'service';
    if (name.includes('ui') || name.includes('frontend')) return 'frontend';
    if (name.includes('util') || name.includes('lib')) return 'library';
    
    return 'unknown';
  }
  
  /**
   * Calculate repository priority
   */
  calculatePriority(repo) {
    const type = this.detectRepositoryType(repo);
    
    const priorityMap = {
      'core': 'critical',
      'service': 'high',
      'frontend': 'high',
      'library': 'medium',
      'unknown': 'low'
    };
    
    return priorityMap[type] || 'medium';
  }
  
  /**
   * Legacy squash merge (fallback)
   */
  async legacySquashMerge(options = {}) {
    this.log('  Using legacy merge implementation...', 'info');
    
    const commits = [];
    
    // Get extraction results
    const extraction = this.buildConfig.phaseResults.extract?.result;
    if (!extraction) {
      throw new Error('Extraction phase required for merge');
    }
    
    // Create merge branches
    const baseBranch = options.baseBranch || 'main';
    const mergeBranch = `autobuild-merge-${Date.now()}`;
    
    if (!this.dryRun) {
      execSync(`git checkout -b ${mergeBranch}`, { cwd: this.rootDir });
    }
    
    // Merge extracted components
    for (const component of extraction.components) {
      this.log(`    Merging component: ${component.name}`, 'info');
      
      if (!this.dryRun) {
        await this.copyComponentFiles(component);
        execSync('git add .', { cwd: this.rootDir });
        
        const commitMsg = this.generateCommitMessage(component);
        execSync(`git commit -m "${commitMsg}"`, { cwd: this.rootDir });
        
        commits.push({
          component: component.name,
          message: commitMsg,
          timestamp: new Date().toISOString()
        });
      } else {
        commits.push({
          component: component.name,
          message: `[DRY RUN] Would merge ${component.name}`,
          dryRun: true
        });
      }
    }
    
    // Squash commits if requested
    if (options.squash !== false && !this.dryRun) {
      this.log('  Squashing commits...', 'info');
      const squashMsg = this.generateSquashMessage(commits);
      execSync(`git reset --soft ${baseBranch}`, { cwd: this.rootDir });
      execSync(`git commit -m "${squashMsg}"`, { cwd: this.rootDir });
    }
    
    return commits;
  }

  /**
   * Analyze repository structure and dependencies
   */
  async analyzeRepository(repo) {
    const analysis = {
      name: repo.name,
      path: repo.path,
      dependencies: {},
      structure: {},
      metadata: {}
    };
    
    // Read package.json if exists
    try {
      const pkgPath = path.join(repo.path, 'package.json');
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
      analysis.dependencies = {
        ...pkg.dependencies,
        ...pkg.devDependencies
      };
      analysis.metadata = {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description
      };
    } catch (error) {
      // No package.json or error reading
    }
    
    // Scan directory structure
    analysis.structure = await this.scanDirectoryStructure(repo.path);
    
    return analysis;
  }

  /**
   * Detect repositories in workspace
   */
  async detectRepositories() {
    const repos = [];
    
    // Check for git repositories in common locations
    const searchPaths = [
      this.rootDir,
      path.join(this.rootDir, '..'),
      'c:\\Users\\erich\\Projects',
      'c:\\Users\\erich\\CascadeProjects'
    ];
    
    for (const searchPath of searchPaths) {
      try {
        const entries = await fs.readdir(searchPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const repoPath = path.join(searchPath, entry.name);
            const gitPath = path.join(repoPath, '.git');
            
            try {
              await fs.access(gitPath);
              repos.push({
                name: entry.name,
                path: repoPath
              });
            } catch {
              // Not a git repo
            }
          }
        }
      } catch {
        // Path doesn't exist or not accessible
      }
    }
    
    return repos;
  }

  /**
   * Detect conflicts between repositories
   */
  async detectConflicts(repositories) {
    const conflicts = [];
    
    // Check for naming conflicts
    const fileMap = new Map();
    
    for (const repo of repositories) {
      for (const file of Object.keys(repo.structure)) {
        if (fileMap.has(file)) {
          conflicts.push({
            type: 'naming',
            file,
            repos: [fileMap.get(file), repo.name],
            severity: 'high'
          });
        } else {
          fileMap.set(file, repo.name);
        }
      }
    }
    
    // Check for dependency conflicts
    const depMap = new Map();
    
    for (const repo of repositories) {
      for (const [dep, version] of Object.entries(repo.dependencies)) {
        if (depMap.has(dep)) {
          const existing = depMap.get(dep);
          if (existing.version !== version) {
            conflicts.push({
              type: 'dependency',
              package: dep,
              versions: [existing.version, version],
              repos: [existing.repo, repo.name],
              severity: 'medium'
            });
          }
        } else {
          depMap.set(dep, { version, repo: repo.name });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Check compatibility between dependencies
   */
  async checkCompatibility(dependencies) {
    const compatibility = {
      compatible: true,
      issues: [],
      recommendations: []
    };
    
    // Check Node.js version requirements
    const nodeVersions = new Set();
    
    for (const [pkg, version] of Object.entries(dependencies)) {
      // Simplified compatibility check
      if (pkg === 'node' || pkg === 'nodejs') {
        nodeVersions.add(version);
      }
    }
    
    if (nodeVersions.size > 1) {
      compatibility.compatible = false;
      compatibility.issues.push({
        type: 'node_version',
        message: 'Multiple Node.js versions detected',
        versions: Array.from(nodeVersions)
      });
    }
    
    return compatibility;
  }

  /**
   * Get MCP-powered recommendations
   */
  async getMCPRecommendations(analysis) {
    if (!this.mcpEnabled) return [];
    
    const recommendations = [];
    
    try {
      // Submit analysis to MCP orchestrator
      const response = await this.submitToMCP({
        instruction: 'Analyze build compatibility and provide recommendations',
        context: {
          repositories: analysis.repositories.length,
          conflicts: analysis.conflicts.length,
          dependencies: Object.keys(analysis.dependencies).length
        }
      });
      
      if (response.recommendations) {
        recommendations.push(...response.recommendations);
      }
      
    } catch (error) {
      this.log(`  ⚠ MCP recommendations unavailable: ${error.message}`, 'warn');
    }
    
    return recommendations;
  }

  /**
   * Submit task to MCP orchestrator
   */
  async submitToMCP(task) {
    const http = require('http');
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(task);
      
      const options = {
        hostname: 'localhost',
        port: 3100,
        path: '/api/tasks',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ status: 'submitted' });
          }
        });
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /**
   * Preflight checks before build
   */
  async preflightChecks() {
    this.log('Running preflight checks...', 'info');
    
    const checks = [
      { name: 'Git available', test: () => execSync('git --version') },
      { name: 'Node.js available', test: () => execSync('node --version') },
      { name: 'Working directory clean', test: () => this.checkGitClean() }
    ];
    
    for (const check of checks) {
      try {
        check.test();
        this.log(`  ✓ ${check.name}`, 'success');
      } catch (error) {
        this.log(`  ✗ ${check.name}`, 'error');
        throw new Error(`Preflight check failed: ${check.name}`);
      }
    }
  }

  /**
   * Check if git working directory is clean
   */
  checkGitClean() {
    const status = execSync('git status --porcelain', { 
      cwd: this.rootDir,
      encoding: 'utf8' 
    });
    
    if (status.trim() && this.mergeConfig.validationLevel === 'strict') {
      throw new Error('Working directory has uncommitted changes');
    }
    
    return true;
  }

  /**
   * Generate checkpoint report
   */
  async generateCheckpoint(stage) {
    this.log(`Generating ${stage} checkpoint...`, 'info');
    
    try {
      await this.checkpointReporter.generateReport();
    } catch (error) {
      this.log(`  ⚠ Checkpoint generation failed: ${error.message}`, 'warn');
    }
  }

  /**
   * Generate build report
   */
  async generateBuildReport() {
    const report = {
      buildId: `autobuild-${Date.now()}`,
      timestamp: new Date().toISOString(),
      duration: this.buildConfig.endTime - this.buildConfig.startTime,
      status: this.state.status,
      phases: this.buildConfig.phaseResults,
      errors: this.state.errors,
      warnings: this.state.warnings,
      metrics: this.state.metrics
    };
    
    const reportPath = path.join(
      this.rootDir, 
      'audit_logs', 
      'autobuild',
      `${report.buildId}.json`
    );
    
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    this.log(`Build report saved: ${reportPath}`, 'info');
  }

  /**
   * Get build summary
   */
  getBuildSummary() {
    return {
      status: this.state.status,
      duration: this.buildConfig.endTime - this.buildConfig.startTime,
      phases: Object.keys(this.buildConfig.phaseResults).length,
      errors: this.state.errors.length,
      warnings: this.state.warnings.length
    };
  }

  /**
   * Logging utility
   */
  log(message, level = 'info') {
    const prefix = {
      info: 'ℹ',
      success: '✓',
      warn: '⚠',
      error: '✗',
      phase: '📍'
    }[level] || 'ℹ';
    
    console.log(`${prefix} ${message}`);
    
    if (level === 'error') {
      this.state.errors.push(message);
    } else if (level === 'warn') {
      this.state.warnings.push(message);
    }
  }

  // Stub methods for phase implementations
  async loadExtractionConfig() { return {}; }
  async extractComponent(spec) { return { name: spec.name, files: spec.files }; }
  async applyHeadyTransformations(component) { return { component: component.name, transformed: true }; }
  async saveAnalysisReport(_analysis) { }
  async saveExtractionReport(_extraction) { }
  async saveMergeReport(_merge) { }
  async saveTestReport(_testing) { }
  async saveDeploymentReport(_deployment) { }
  async validateMergeReadiness() { return { passed: true, errors: [], warnings: [] }; }
  async detectMergeConflicts() { return []; }
  async autoResolveConflicts(_conflicts) { return []; }
  async forceMerge(_options) { return []; }
  async safeMerge(_options) { return []; }
  async runTestSuite(suite) { return { name: suite, passed: 0, failed: 0, skipped: 0 }; }
  async calculateCoverage() { return 0; }
  async buildArtifacts(_options) { return []; }
  async deployToTarget(_target, _artifacts) { }
  async copyComponentFiles(_component) { }
  async scanDirectoryStructure(_dirPath) { return {}; }
  
  generateCommitMessage(component) {
    return `feat: Add ${component.name} component\n\nExtracted from ${component.source}\nPurpose: ${component.purpose}`;
  }
  
  generateSquashMessage(commits) {
    return `feat: Intelligent merge of ${commits.length} components\n\nAuto-generated by HC AutoBuild\nComponents: ${commits.map(c => c.component).join(', ')}`;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    dryRun: args.includes('--dry-run'),
    mode: args.includes('--manual') ? 'manual' : 'auto'
  };
  
  const autobuild = new HCAutoBuild(options);
  
  autobuild.execute(options)
    .then(summary => {
      console.log('\n📊 Build Summary:');
      console.log(JSON.stringify(summary, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Build Failed:', error.message);
      process.exit(1);
    });
}

module.exports = HCAutoBuild;
