#!/usr/bin/env node
/**
 * HEADY SQUASH MERGE ORCHESTRATOR v1.0
 * Intelligent multi-codebase merger with weighted distribution
 * Leverages HeadyAcademy agents for conflict resolution and optimization
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

class HeadySquashMerge {
  constructor(config = {}) {
    this.config = {
      outputDir: config.outputDir || path.join(process.cwd(), 'heady-merged-output'),
      tempDir: config.tempDir || path.join(process.cwd(), '.heady-merge-temp'),
      validationDir: config.validationDir || path.join(process.cwd(), '.heady-merge-validation'),
      auditLog: config.auditLog || path.join(process.cwd(), 'audit_logs/squash_merge.jsonl'),
      ...config
    };

    this.sources = [];
    this.mergeState = {
      id: crypto.randomBytes(8).toString('hex'),
      timestamp: new Date().toISOString(),
      phase: 'initialized',
      conflicts: [],
      resolutions: [],
      artifacts: {}
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.config.outputDir, this.config.tempDir, this.config.validationDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const auditDir = path.dirname(this.config.auditLog);
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }
  }

  /**
   * Add a source codebase with weight distribution
   */
  addSource(sourcePath, weight = 1.0, metadata = {}) {
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    const source = {
      id: crypto.randomBytes(4).toString('hex'),
      path: path.resolve(sourcePath),
      weight: Math.max(0, Math.min(1, weight)), // Clamp between 0 and 1
      metadata: {
        name: metadata.name || path.basename(sourcePath),
        type: metadata.type || 'unknown',
        priority: metadata.priority || 'normal',
        ...metadata
      },
      analysis: null
    };

    this.sources.push(source);
    this.logAudit('source_added', { source });

    return source.id;
  }

  /**
   * Phase 1: Analyze all source codebases
   */
  async analyzeSourcesPhase() {
    this.mergeState.phase = 'analyzing';
    this.logAudit('phase_start', { phase: 'analyzing', sources: this.sources.length });

    for (const source of this.sources) {
      console.log(`[Analyze] Scanning ${source.metadata.name}...`);
      source.analysis = await this.analyzeCodebase(source.path);
    }

    // Normalize weights
    this.normalizeWeights();

    this.mergeState.phase = 'analyzed';
    this.logAudit('phase_complete', { phase: 'analyzing', results: this.sources.map(s => s.analysis) });

    return this.sources;
  }

  /**
   * Analyze a single codebase structure
   */
  async analyzeCodebase(basePath) {
    const analysis = {
      files: [],
      directories: [],
      languages: {},
      frameworks: [],
      dependencies: {},
      structure: {},
      metrics: {
        totalFiles: 0,
        totalLines: 0,
        codeLines: 0,
        commentLines: 0
      }
    };

    const scanDirectory = (dir, relativePath = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);

        // Skip common ignore patterns
        if (this.shouldIgnore(entry.name)) continue;

        if (entry.isDirectory()) {
          analysis.directories.push(relPath);
          scanDirectory(fullPath, relPath);
        } else if (entry.isFile()) {
          const fileInfo = this.analyzeFile(fullPath, relPath);
          analysis.files.push(fileInfo);
          analysis.metrics.totalFiles++;

          // Track languages
          const ext = path.extname(entry.name);
          analysis.languages[ext] = (analysis.languages[ext] || 0) + 1;
        }
      }
    };

    scanDirectory(basePath);

    // Detect frameworks and dependencies
    analysis.frameworks = this.detectFrameworks(basePath, analysis.files);
    analysis.dependencies = this.extractDependencies(basePath, analysis.files);
    analysis.structure = this.categorizeStructure(analysis.files);

    return analysis;
  }

  /**
   * Analyze individual file
   */
  analyzeFile(fullPath, relativePath) {
    const stats = fs.statSync(fullPath);
    const ext = path.extname(relativePath);
    
    let content = null;
    let lines = 0;
    let hash = null;

    // Only read text files
    if (this.isTextFile(ext)) {
      try {
        content = fs.readFileSync(fullPath, 'utf8');
        lines = content.split('\n').length;
        hash = crypto.createHash('sha256').update(content).digest('hex');
      } catch (e) {
        // Binary or unreadable file
      }
    }

    return {
      path: relativePath,
      fullPath,
      ext,
      size: stats.size,
      lines,
      hash,
      type: this.categorizeFileType(relativePath, ext),
      importance: this.calculateFileImportance(relativePath, ext)
    };
  }

  /**
   * Categorize file type for intelligent merging
   */
  categorizeFileType(filePath, ext) {
    const categories = {
      config: ['.json', '.yaml', '.yml', '.toml', '.ini', '.env'],
      code: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.c', '.cpp'],
      style: ['.css', '.scss', '.sass', '.less'],
      markup: ['.html', '.xml', '.jsx', '.tsx', '.vue'],
      doc: ['.md', '.txt', '.rst', '.adoc'],
      data: ['.sql', '.csv', '.json'],
      script: ['.sh', '.ps1', '.bat', '.cmd']
    };

    for (const [category, extensions] of Object.entries(categories)) {
      if (extensions.includes(ext)) return category;
    }

    // Check by path patterns
    if (filePath.includes('test') || filePath.includes('spec')) return 'test';
    if (filePath.includes('doc')) return 'doc';
    if (filePath.includes('config')) return 'config';

    return 'other';
  }

  /**
   * Calculate file importance for merge prioritization
   */
  calculateFileImportance(filePath, ext) {
    let score = 0.5; // Base score

    // Critical files
    const criticalFiles = ['package.json', 'requirements.txt', 'Dockerfile', 'docker-compose.yml', 
      'README.md', '.env', 'tsconfig.json', 'webpack.config.js'];
    if (criticalFiles.some(f => filePath.endsWith(f))) score += 0.4;

    // Entry points
    if (filePath.includes('index') || filePath.includes('main') || filePath.includes('app')) score += 0.2;

    // Core directories
    if (filePath.startsWith('src/') || filePath.startsWith('lib/')) score += 0.15;

    // Configuration
    if (filePath.startsWith('config/')) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Detect frameworks used in codebase
   */
  detectFrameworks(basePath, files) {
    const frameworks = new Set();

    // Check package.json
    const pkgPath = path.join(basePath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps.react) frameworks.add('React');
        if (deps.vue) frameworks.add('Vue');
        if (deps.angular) frameworks.add('Angular');
        if (deps.express) frameworks.add('Express');
        if (deps.next) frameworks.add('Next.js');
        if (deps.fastify) frameworks.add('Fastify');
      } catch (e) {
        // Invalid package.json
      }
    }

    // Check requirements.txt
    const reqPath = path.join(basePath, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      const content = fs.readFileSync(reqPath, 'utf8');
      if (content.includes('django')) frameworks.add('Django');
      if (content.includes('flask')) frameworks.add('Flask');
      if (content.includes('fastapi')) frameworks.add('FastAPI');
    }

    return Array.from(frameworks);
  }

  /**
   * Extract dependencies from various manifest files
   */
  extractDependencies(basePath, files) {
    const dependencies = {
      npm: {},
      python: {},
      docker: false
    };

    // NPM dependencies
    const pkgPath = path.join(basePath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        dependencies.npm = { ...pkg.dependencies, ...pkg.devDependencies };
      } catch (e) {
        // Invalid package.json
      }
    }

    // Python dependencies
    const reqPath = path.join(basePath, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      const content = fs.readFileSync(reqPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([a-zA-Z0-9-_]+)/);
        if (match) dependencies.python[match[1]] = true;
      });
    }

    // Docker
    dependencies.docker = files.some(f => f.path.includes('Dockerfile'));

    return dependencies;
  }

  /**
   * Categorize codebase structure
   */
  categorizeStructure(files) {
    const structure = {
      frontend: [],
      backend: [],
      config: [],
      docs: [],
      tests: [],
      scripts: [],
      other: []
    };

    files.forEach(file => {
      const p = file.path.toLowerCase();

      if (p.includes('public/') || p.includes('static/') || p.includes('frontend/')) {
        structure.frontend.push(file.path);
      } else if (p.includes('src/') || p.includes('lib/') || p.includes('backend/')) {
        structure.backend.push(file.path);
      } else if (p.includes('config/') || file.type === 'config') {
        structure.config.push(file.path);
      } else if (p.includes('doc') || file.type === 'doc') {
        structure.docs.push(file.path);
      } else if (p.includes('test') || p.includes('spec')) {
        structure.tests.push(file.path);
      } else if (p.includes('script') || file.type === 'script') {
        structure.scripts.push(file.path);
      } else {
        structure.other.push(file.path);
      }
    });

    return structure;
  }

  /**
   * Normalize weights to sum to 1.0
   */
  normalizeWeights() {
    const totalWeight = this.sources.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight > 0) {
      this.sources.forEach(s => {
        s.normalizedWeight = s.weight / totalWeight;
      });
    }
  }

  /**
   * Phase 2: Build merge strategy using HeadyAcademy agents
   */
  async buildMergeStrategyPhase() {
    this.mergeState.phase = 'strategy';
    this.logAudit('phase_start', { phase: 'strategy' });

    console.log('[Strategy] Analyzing conflicts and building merge plan...');

    // Identify file conflicts
    const fileMap = new Map();
    this.sources.forEach(source => {
      source.analysis.files.forEach(file => {
        if (!fileMap.has(file.path)) {
          fileMap.set(file.path, []);
        }
        fileMap.get(file.path).push({ source, file });
      });
    });

    // Find conflicts (same file in multiple sources)
    const conflicts = [];
    fileMap.forEach((sources, filePath) => {
      if (sources.length > 1) {
        conflicts.push({
          path: filePath,
          sources: sources.map(s => ({
            sourceId: s.source.id,
            sourceName: s.source.metadata.name,
            weight: s.source.normalizedWeight,
            hash: s.file.hash,
            size: s.file.size,
            importance: s.file.importance
          }))
        });
      }
    });

    this.mergeState.conflicts = conflicts;

    // Build merge strategy
    const strategy = {
      conflicts: conflicts.length,
      resolutionPlan: await this.buildResolutionPlan(conflicts),
      mergeOrder: this.determineMergeOrder(),
      validation: this.buildValidationPlan()
    };

    this.mergeState.strategy = strategy;
    this.logAudit('phase_complete', { phase: 'strategy', strategy });

    return strategy;
  }

  /**
   * Build conflict resolution plan
   */
  async buildResolutionPlan(conflicts) {
    const plan = [];

    for (const conflict of conflicts) {
      // Determine resolution strategy based on file type and weights
      const resolution = {
        path: conflict.path,
        strategy: this.determineResolutionStrategy(conflict),
        selectedSource: null,
        requiresReview: false
      };

      // Auto-resolve based on strategy
      switch (resolution.strategy) {
      case 'highest_weight':
        resolution.selectedSource = conflict.sources.reduce((max, s) => 
          s.weight > max.weight ? s : max
        );
        break;

      case 'highest_importance':
        resolution.selectedSource = conflict.sources.reduce((max, s) => 
          s.importance > max.importance ? s : max
        );
        break;

      case 'merge_content':
        resolution.requiresReview = true;
        resolution.agent = 'FOREMAN'; // Consolidator agent
        break;

      case 'newest':
        resolution.selectedSource = conflict.sources[conflict.sources.length - 1];
        break;

      default:
        resolution.requiresReview = true;
      }

      plan.push(resolution);
    }

    return plan;
  }

  /**
   * Determine resolution strategy for a conflict
   */
  determineResolutionStrategy(conflict) {
    const fileType = path.extname(conflict.path);

    // Configuration files - merge content
    if (['.json', '.yaml', '.yml', '.env'].includes(fileType)) {
      return 'merge_content';
    }

    // Documentation - use highest weight
    if (['.md', '.txt'].includes(fileType)) {
      return 'highest_weight';
    }

    // Code files - use highest importance or weight
    if (['.js', '.ts', '.py'].includes(fileType)) {
      // If one source has significantly higher weight, use it
      const maxWeight = Math.max(...conflict.sources.map(s => s.weight));
      const minWeight = Math.min(...conflict.sources.map(s => s.weight));
      
      if (maxWeight - minWeight > 0.3) {
        return 'highest_weight';
      }
      
      return 'highest_importance';
    }

    // Default: use highest weight
    return 'highest_weight';
  }

  /**
   * Determine optimal merge order
   */
  determineMergeOrder() {
    // Sort sources by weight (highest first)
    return this.sources
      .sort((a, b) => b.normalizedWeight - a.normalizedWeight)
      .map(s => s.id);
  }

  /**
   * Build validation plan
   */
  buildValidationPlan() {
    return {
      syntaxCheck: true,
      dependencyCheck: true,
      structureValidation: true,
      testExecution: false, // Optional
      agents: ['MURPHY', 'JULES'] // Inspector and Optimizer
    };
  }

  /**
   * Phase 3: Execute merge with HeadyAcademy agents
   */
  async executeMergePhase() {
    this.mergeState.phase = 'merging';
    this.logAudit('phase_start', { phase: 'merging' });

    console.log('[Merge] Executing merge strategy...');

    // Create base structure
    await this.createBaseStructure();

    // Process files in merge order
    for (const sourceId of this.mergeState.strategy.mergeOrder) {
      const source = this.sources.find(s => s.id === sourceId);
      await this.mergeSource(source);
    }

    // Resolve conflicts
    await this.resolveConflicts();

    // Merge dependencies
    await this.mergeDependencies();

    this.mergeState.phase = 'merged';
    this.logAudit('phase_complete', { phase: 'merging' });

    return this.config.outputDir;
  }

  /**
   * Create base directory structure
   */
  async createBaseStructure() {
    const baseStructure = [
      'src',
      'config',
      'public',
      'docs',
      'scripts',
      'tests'
    ];

    baseStructure.forEach(dir => {
      const fullPath = path.join(this.config.outputDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  /**
   * Merge a single source into output
   */
  async mergeSource(source) {
    console.log(`[Merge] Processing ${source.metadata.name} (weight: ${source.normalizedWeight.toFixed(2)})...`);

    for (const file of source.analysis.files) {
      const destPath = path.join(this.config.outputDir, file.path);
      const destDir = path.dirname(destPath);

      // Create directory if needed
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Check if file already exists (conflict)
      if (fs.existsSync(destPath)) {
        // Skip - will be resolved in conflict resolution phase
        continue;
      }

      // Copy file
      fs.copyFileSync(file.fullPath, destPath);
    }
  }

  /**
   * Resolve conflicts using resolution plan
   */
  async resolveConflicts() {
    console.log(`[Resolve] Resolving ${this.mergeState.conflicts.length} conflicts...`);

    for (const resolution of this.mergeState.strategy.resolutionPlan) {
      const destPath = path.join(this.config.outputDir, resolution.path);

      if (resolution.requiresReview) {
        // Invoke HeadyAcademy agent for complex resolution
        await this.invokeAgentForResolution(resolution);
      } else if (resolution.selectedSource) {
        // Simple resolution - use selected source
        const source = this.sources.find(s => s.id === resolution.selectedSource.sourceId);
        const file = source.analysis.files.find(f => f.path === resolution.path);
        
        if (file) {
          fs.copyFileSync(file.fullPath, destPath);
          this.mergeState.resolutions.push({
            path: resolution.path,
            strategy: resolution.strategy,
            source: source.metadata.name
          });
        }
      }
    }
  }

  /**
   * Invoke HeadyAcademy agent for complex conflict resolution
   */
  async invokeAgentForResolution(resolution) {
    // For now, use highest weight as fallback
    // In production, this would call FOREMAN agent
    console.log(`[Agent] FOREMAN would resolve: ${resolution.path}`);
    
    const highestWeight = resolution.sources.reduce((max, s) => 
      s.weight > max.weight ? s : max
    );
    
    const source = this.sources.find(s => s.id === highestWeight.sourceId);
    const file = source.analysis.files.find(f => f.path === resolution.path);
    
    if (file) {
      const destPath = path.join(this.config.outputDir, resolution.path);
      fs.copyFileSync(file.fullPath, destPath);
    }
  }

  /**
   * Merge dependencies from all sources
   */
  async mergeDependencies() {
    console.log('[Merge] Merging dependencies...');

    // Merge package.json
    await this.mergePackageJson();

    // Merge requirements.txt
    await this.mergeRequirementsTxt();

    // Merge docker-compose.yml if present
    await this.mergeDockerCompose();
  }

  /**
   * Merge package.json files with weighted priority
   */
  async mergePackageJson() {
    const merged = {
      name: 'heady-merged-app',
      version: '1.0.0',
      description: 'Heady Squash Merge Output',
      dependencies: {},
      devDependencies: {},
      scripts: {}
    };

    // Collect all dependencies with weights
    const depMap = new Map();
    
    this.sources.forEach(source => {
      if (source.analysis.dependencies.npm) {
        Object.entries(source.analysis.dependencies.npm).forEach(([pkg, version]) => {
          if (!depMap.has(pkg)) {
            depMap.set(pkg, []);
          }
          depMap.get(pkg).push({
            version,
            weight: source.normalizedWeight
          });
        });
      }
    });

    // Select version based on highest weight
    depMap.forEach((versions, pkg) => {
      const selected = versions.reduce((max, v) => v.weight > max.weight ? v : max);
      merged.dependencies[pkg] = selected.version;
    });

    // Write merged package.json
    const outputPath = path.join(this.config.outputDir, 'package.json');
    fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  }

  /**
   * Merge requirements.txt files
   */
  async mergeRequirementsTxt() {
    const requirements = new Set();

    this.sources.forEach(source => {
      if (source.analysis.dependencies.python) {
        Object.keys(source.analysis.dependencies.python).forEach(pkg => {
          requirements.add(pkg);
        });
      }
    });

    if (requirements.size > 0) {
      const outputPath = path.join(this.config.outputDir, 'requirements.txt');
      fs.writeFileSync(outputPath, Array.from(requirements).join('\n'));
    }
  }

  /**
   * Merge docker-compose.yml files
   */
  async mergeDockerCompose() {
    // Simplified - in production would use proper YAML merging
    const dockerSources = this.sources.filter(s => s.analysis.dependencies.docker);
    
    if (dockerSources.length > 0) {
      // Use highest weight source's docker-compose
      const primary = dockerSources.reduce((max, s) => 
        s.normalizedWeight > max.normalizedWeight ? s : max
      );
      
      const srcPath = path.join(primary.path, 'docker-compose.yml');
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(this.config.outputDir, 'docker-compose.yml');
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Phase 4: Validate merged output
   */
  async validateMergePhase() {
    this.mergeState.phase = 'validating';
    this.logAudit('phase_start', { phase: 'validating' });

    console.log('[Validate] Running validation checks...');

    const validation = {
      syntaxCheck: await this.validateSyntax(),
      structureCheck: await this.validateStructure(),
      dependencyCheck: await this.validateDependencies(),
      passed: false
    };

    validation.passed = validation.syntaxCheck.passed && 
                        validation.structureCheck.passed && 
                        validation.dependencyCheck.passed;

    this.mergeState.validation = validation;
    this.mergeState.phase = validation.passed ? 'validated' : 'validation_failed';
    
    this.logAudit('phase_complete', { phase: 'validating', validation });

    return validation;
  }

  /**
   * Validate syntax of merged files
   */
  async validateSyntax() {
    const errors = [];
    const outputFiles = this.getAllFiles(this.config.outputDir);

    for (const file of outputFiles) {
      const ext = path.extname(file);
      
      // Validate JSON files
      if (ext === '.json') {
        try {
          JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
          errors.push({ file, error: e.message });
        }
      }
    }

    return {
      passed: errors.length === 0,
      errors
    };
  }

  /**
   * Validate directory structure
   */
  async validateStructure() {
    const required = ['src', 'package.json'];
    const missing = [];

    required.forEach(item => {
      const fullPath = path.join(this.config.outputDir, item);
      if (!fs.existsSync(fullPath)) {
        missing.push(item);
      }
    });

    return {
      passed: missing.length === 0,
      missing
    };
  }

  /**
   * Validate dependencies
   */
  async validateDependencies() {
    const pkgPath = path.join(this.config.outputDir, 'package.json');
    
    if (!fs.existsSync(pkgPath)) {
      return { passed: false, error: 'package.json not found' };
    }

    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return {
        passed: true,
        dependencies: Object.keys(pkg.dependencies || {}).length,
        devDependencies: Object.keys(pkg.devDependencies || {}).length
      };
    } catch (e) {
      return { passed: false, error: e.message };
    }
  }

  /**
   * Generate comprehensive merge report
   */
  generateReport() {
    const report = {
      mergeId: this.mergeState.id,
      timestamp: this.mergeState.timestamp,
      sources: this.sources.map(s => ({
        name: s.metadata.name,
        weight: s.normalizedWeight,
        files: s.analysis.files.length,
        frameworks: s.analysis.frameworks
      })),
      conflicts: this.mergeState.conflicts.length,
      resolutions: this.mergeState.resolutions.length,
      validation: this.mergeState.validation,
      outputPath: this.config.outputDir,
      artifacts: this.mergeState.artifacts
    };

    const reportPath = path.join(this.config.outputDir, 'MERGE_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  /**
   * Utility: Get all files in directory recursively
   */
  getAllFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this.getAllFiles(fullPath, files);
      } else {
        files.push(fullPath);
      }
    });

    return files;
  }

  /**
   * Utility: Check if file should be ignored
   */
  shouldIgnore(name) {
    const ignorePatterns = [
      'node_modules', '.git', '.venv', '__pycache__', 
      'dist', 'build', '.next', '.cache', 'coverage'
    ];
    return ignorePatterns.some(pattern => name.includes(pattern));
  }

  /**
   * Utility: Check if file is text
   */
  isTextFile(ext) {
    const textExtensions = [
      '.js', '.ts', '.py', '.java', '.go', '.rs', '.c', '.cpp',
      '.json', '.yaml', '.yml', '.toml', '.xml', '.html', '.css',
      '.md', '.txt', '.sh', '.ps1', '.bat', '.env'
    ];
    return textExtensions.includes(ext);
  }

  /**
   * Log audit entry
   */
  logAudit(event, data) {
    const entry = {
      timestamp: new Date().toISOString(),
      mergeId: this.mergeState.id,
      event,
      data
    };

    try {
      fs.appendFileSync(this.config.auditLog, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error('[Audit] Failed to log:', e.message);
    }
  }

  /**
   * Main orchestration method
   */
  async execute() {
    console.log('\n=== HEADY SQUASH MERGE ORCHESTRATOR ===\n');
    console.log(`Merge ID: ${this.mergeState.id}`);
    console.log(`Sources: ${this.sources.length}\n`);

    try {
      // Phase 1: Analyze
      await this.analyzeSourcesPhase();
      console.log(`✓ Analysis complete: ${this.sources.reduce((sum, s) => sum + s.analysis.files.length, 0)} files found\n`);

      // Phase 2: Strategy
      await this.buildMergeStrategyPhase();
      console.log(`✓ Strategy built: ${this.mergeState.conflicts.length} conflicts identified\n`);

      // Phase 3: Merge
      await this.executeMergePhase();
      console.log(`✓ Merge complete: Output at ${this.config.outputDir}\n`);

      // Phase 4: Validate
      const validation = await this.validateMergePhase();
      console.log(`✓ Validation ${validation.passed ? 'PASSED' : 'FAILED'}\n`);

      // Generate report
      const report = this.generateReport();
      console.log('=== MERGE COMPLETE ===\n');
      console.log(`Report: ${path.join(this.config.outputDir, 'MERGE_REPORT.json')}`);
      console.log(`Audit Log: ${this.config.auditLog}\n`);

      return {
        success: validation.passed,
        report,
        outputPath: this.config.outputDir
      };

    } catch (error) {
      console.error('\n✗ Merge failed:', error.message);
      this.logAudit('merge_failed', { error: error.message, stack: error.stack });
      throw error;
    }
  }
}

module.exports = HeadySquashMerge;

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node heady_squash_merge.js <config.json>');
    console.log('Example config.json:');
    console.log(JSON.stringify({
      sources: [
        { path: './source1', weight: 0.6, name: 'Primary Codebase' },
        { path: './source2', weight: 0.3, name: 'Secondary Features' },
        { path: './source3', weight: 0.1, name: 'Utilities' }
      ],
      outputDir: './merged-output'
    }, null, 2));
    process.exit(1);
  }

  const configPath = args[0];
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const merger = new HeadySquashMerge(config);

  config.sources.forEach(src => {
    merger.addSource(src.path, src.weight, { name: src.name });
  });

  merger.execute()
    .then(result => {
      console.log('Success:', result.success);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
