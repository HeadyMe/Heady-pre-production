#!/usr/bin/env node
/**
 * HEADY INTELLIGENCE VERIFIER v1.0
 * Pre-response verification system for data processing and storage protocols
 * Ensures all intelligence systems are connected and operational before AI responses
 */

const fs = require('fs');
const path = require('path');
const extendedVerifiers = require('./heady_intelligence_verifier_extended');

class HeadyIntelligenceVerifier {
  constructor(config = {}) {
    this.rootDir = config.rootDir || process.cwd();
    this.verbose = config.verbose || false;
    
    // Critical paths for intelligence
    this.paths = {
      registry: path.join(this.rootDir, '.heady-memory/heady-registry.json'),
      validations: path.join(this.rootDir, '.heady-memory/validations'),
      patterns: path.join(this.rootDir, '.heady-memory/patterns'),
      checkpoints: path.join(this.rootDir, 'audit_logs'),
      masterReference: path.join(this.rootDir, 'audit_logs/MASTER_REFERENCE.md'),
      codeMap: path.join(this.rootDir, '.heady-context/codemap.json'),
      projectContext: path.join(this.rootDir, '.heady-context/project-context.json')
    };
    
    this.verificationResults = {
      timestamp: new Date().toISOString(),
      passed: false,
      checks: {},
      errors: [],
      warnings: []
    };
  }

  /**
   * Main verification entry point
   * Verifies ALL operations, processes, and live connections
   */
  async verify() {
    this.log('🔍 Heady Intelligence Verification Starting...', 'info');
    this.log('   Verifying all operations, processes, and connections...', 'info');
    
    const checks = [
      // Core Intelligence Systems
      { name: 'registry', fn: () => this.verifyRegistry(), critical: true },
      { name: 'memory_storage', fn: () => this.verifyMemoryStorage(), critical: true },
      { name: 'checkpoint_system', fn: () => this.verifyCheckpointSystem(), critical: true },
      { name: 'context_persistence', fn: () => this.verifyContextPersistence(), critical: true },
      { name: 'data_schema', fn: () => this.verifyDataSchema(), critical: true },
      { name: 'codemap_access', fn: () => this.verifyCodemapAccess(), critical: true },
      
      // Live Service Connections
      { name: 'heady_manager', fn: () => this.verifyHeadyManager(), critical: false },
      { name: 'mcp_servers', fn: () => this.verifyMCPServers(), critical: false },
      { name: 'orchestrator', fn: () => this.verifyOrchestrator(), critical: false },
      
      // Operational Processes
      { name: 'squash_merge_ready', fn: () => this.verifySquashMergeReady(), critical: true },
      { name: 'routing_system', fn: () => this.verifyRoutingSystem(), critical: true },
      { name: 'governance', fn: () => this.verifyGovernance(), critical: false },
      
      // Data Processing Pipelines
      { name: 'audit_logging', fn: () => this.verifyAuditLogging(), critical: true },
      { name: 'validation_pipeline', fn: () => this.verifyValidationPipeline(), critical: false },
      
      // System Health
      { name: 'file_system_access', fn: () => this.verifyFileSystemAccess(), critical: true },
      { name: 'git_operations', fn: () => this.verifyGitOperations(), critical: false }
    ];

    let allPassed = true;

    for (const check of checks) {
      try {
        const result = await check.fn();
        this.verificationResults.checks[check.name] = result;
        
        if (!result.passed) {
          allPassed = false;
          this.log(`  ✗ ${check.name}: ${result.message}`, 'error');
        } else {
          this.log(`  ✓ ${check.name}`, 'success');
        }
      } catch (error) {
        allPassed = false;
        this.verificationResults.checks[check.name] = {
          passed: false,
          error: error.message
        };
        this.log(`  ✗ ${check.name}: ${error.message}`, 'error');
      }
    }

    this.verificationResults.passed = allPassed;

    if (allPassed) {
      this.log('\n✅ All intelligence systems verified and operational', 'success');
    } else {
      this.log('\n⚠️ Some intelligence systems require attention', 'warn');
    }

    return this.verificationResults;
  }

  /**
   * Verify HeadyRegistry is accessible and valid
   */
  async verifyRegistry() {
    if (!fs.existsSync(this.paths.registry)) {
      return {
        passed: false,
        message: 'HeadyRegistry not found',
        action: 'Create .heady-memory/heady-registry.json'
      };
    }

    try {
      const registry = JSON.parse(fs.readFileSync(this.paths.registry, 'utf8'));
      
      if (!registry.routing || !registry.components) {
        return {
          passed: false,
          message: 'Registry missing required sections',
          action: 'Update registry with routing and components'
        };
      }

      return {
        passed: true,
        message: 'Registry valid',
        data: {
          version: registry.version,
          components: Object.keys(registry.components).length,
          routing: registry.routing ? 'configured' : 'missing'
        }
      };
    } catch (error) {
      return {
        passed: false,
        message: `Registry parse error: ${error.message}`,
        action: 'Fix JSON syntax in registry'
      };
    }
  }

  /**
   * Verify memory storage directories and files
   */
  async verifyMemoryStorage() {
    const memoryDir = path.join(this.rootDir, '.heady-memory');
    
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
      this.verificationResults.warnings.push('Created .heady-memory directory');
    }

    const requiredDirs = ['validations', 'patterns'];
    const missing = [];

    for (const dir of requiredDirs) {
      const dirPath = path.join(memoryDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        missing.push(dir);
      }
    }

    return {
      passed: true,
      message: 'Memory storage accessible',
      data: {
        created: missing.length > 0 ? missing : null,
        validations: this.countFiles(this.paths.validations),
        patterns: this.countFiles(this.paths.patterns)
      }
    };
  }

  /**
   * Verify checkpoint system is operational
   */
  async verifyCheckpointSystem() {
    if (!fs.existsSync(this.paths.checkpoints)) {
      return {
        passed: false,
        message: 'Checkpoint directory not found',
        action: 'Run checkpoint generation: .\\scripts\\Invoke-Checkpoint.ps1'
      };
    }

    const checkpoints = fs.readdirSync(this.paths.checkpoints)
      .filter(f => f.startsWith('checkpoint_') && f.endsWith('.json'));

    if (checkpoints.length === 0) {
      return {
        passed: false,
        message: 'No checkpoints found',
        action: 'Generate initial checkpoint'
      };
    }

    // Check for master reference
    const hasMasterRef = fs.existsSync(this.paths.masterReference);

    return {
      passed: true,
      message: 'Checkpoint system operational',
      data: {
        checkpoints: checkpoints.length,
        latest: checkpoints[checkpoints.length - 1],
        masterReference: hasMasterRef
      }
    };
  }

  /**
   * Verify context persistence system
   */
  async verifyContextPersistence() {
    const contextDir = path.join(this.rootDir, '.heady-context');
    
    if (!fs.existsSync(contextDir)) {
      fs.mkdirSync(contextDir, { recursive: true });
      
      // Initialize context files
      await this.initializeContextFiles(contextDir);
      
      return {
        passed: true,
        message: 'Context persistence initialized',
        data: { created: true }
      };
    }

    return {
      passed: true,
      message: 'Context persistence accessible',
      data: {
        codemap: fs.existsSync(this.paths.codeMap),
        projectContext: fs.existsSync(this.paths.projectContext)
      }
    };
  }

  /**
   * Verify data schema and protocols
   */
  async verifyDataSchema() {
    const schemaFiles = [
      path.join(this.rootDir, 'src/heady_squash_merge.js'),
      path.join(this.rootDir, 'src/checkpoint_reporter.js'),
      path.join(this.rootDir, 'src/heady_registry_router.js')
    ];

    const missing = schemaFiles.filter(f => !fs.existsSync(f));

    if (missing.length > 0) {
      return {
        passed: false,
        message: 'Data processing modules missing',
        action: `Missing: ${missing.map(f => path.basename(f)).join(', ')}`,
        data: { missing }
      };
    }

    return {
      passed: true,
      message: 'Data schema modules present',
      data: {
        modules: schemaFiles.length,
        protocols: ['squash_merge', 'checkpoint', 'routing']
      }
    };
  }

  /**
   * Verify HeadyManager service (delegated to extended verifier)
   */
  async verifyHeadyManager() {
    return await extendedVerifiers.verifyHeadyManager();
  }

  /**
   * Verify MCP servers (delegated to extended verifier)
   */
  async verifyMCPServers() {
    return await extendedVerifiers.verifyMCPServers();
  }

  /**
   * Verify Orchestrator (delegated to extended verifier)
   */
  async verifyOrchestrator() {
    return await extendedVerifiers.verifyOrchestrator();
  }

  /**
   * Verify SquashMerge system (delegated to extended verifier)
   */
  async verifySquashMergeReady() {
    return await extendedVerifiers.verifySquashMergeReady();
  }

  /**
   * Verify Routing system (delegated to extended verifier)
   */
  async verifyRoutingSystem() {
    return await extendedVerifiers.verifyRoutingSystem();
  }

  /**
   * Verify Governance (delegated to extended verifier)
   */
  async verifyGovernance() {
    return await extendedVerifiers.verifyGovernance();
  }

  /**
   * Verify Audit Logging (delegated to extended verifier)
   */
  async verifyAuditLogging() {
    return await extendedVerifiers.verifyAuditLogging();
  }

  /**
   * Verify Validation Pipeline (delegated to extended verifier)
   */
  async verifyValidationPipeline() {
    return await extendedVerifiers.verifyValidationPipeline();
  }

  /**
   * Verify File System Access (delegated to extended verifier)
   */
  async verifyFileSystemAccess() {
    return await extendedVerifiers.verifyFileSystemAccess();
  }

  /**
   * Verify Git Operations (delegated to extended verifier)
   */
  async verifyGitOperations() {
    return await extendedVerifiers.verifyGitOperations();
  }

  /**
   * Verify codemap access and generation
   */
  async verifyCodemapAccess() {
    if (!fs.existsSync(this.paths.codeMap)) {
      // Generate initial codemap
      await this.generateCodemap();
      
      return {
        passed: true,
        message: 'Codemap generated',
        data: { generated: true }
      };
    }

    try {
      const codemap = JSON.parse(fs.readFileSync(this.paths.codeMap, 'utf8'));
      
      return {
        passed: true,
        message: 'Codemap accessible',
        data: {
          files: codemap.files?.length || 0,
          lastUpdated: codemap.timestamp
        }
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Codemap corrupted',
        action: 'Regenerate codemap'
      };
    }
  }

  /**
   * Initialize context files
   */
  async initializeContextFiles(contextDir) {
    // Create codemap
    const codemap = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      rootDir: this.rootDir,
      files: [],
      directories: [],
      dependencies: {},
      metadata: {}
    };

    fs.writeFileSync(
      path.join(contextDir, 'codemap.json'),
      JSON.stringify(codemap, null, 2)
    );

    // Create project context
    const projectContext = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      project: {
        name: 'Heady',
        type: 'hybrid',
        languages: ['javascript', 'python'],
        frameworks: ['express', 'react']
      },
      intelligence: {
        registry: true,
        checkpoints: true,
        routing: true,
        squashMerge: true
      },
      lastOperation: null,
      operationHistory: []
    };

    fs.writeFileSync(
      path.join(contextDir, 'project-context.json'),
      JSON.stringify(projectContext, null, 2)
    );
  }

  /**
   * Generate codemap from current codebase
   */
  async generateCodemap() {
    const codemap = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      rootDir: this.rootDir,
      files: [],
      directories: [],
      dependencies: {},
      metadata: {
        generated: true,
        scanDepth: 3
      }
    };

    // Scan critical directories
    const scanDirs = ['src', 'scripts', 'docs', '.heady-memory'];
    
    for (const dir of scanDirs) {
      const dirPath = path.join(this.rootDir, dir);
      if (fs.existsSync(dirPath)) {
        this.scanDirectory(dirPath, codemap, 0, 3);
      }
    }

    // Save codemap
    const contextDir = path.join(this.rootDir, '.heady-context');
    if (!fs.existsSync(contextDir)) {
      fs.mkdirSync(contextDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(contextDir, 'codemap.json'),
      JSON.stringify(codemap, null, 2)
    );

    return codemap;
  }

  /**
   * Recursively scan directory
   */
  scanDirectory(dirPath, codemap, depth, maxDepth) {
    if (depth >= maxDepth) return;

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.rootDir, fullPath);

        if (entry.isDirectory()) {
          if (!this.shouldIgnore(entry.name)) {
            codemap.directories.push(relativePath);
            this.scanDirectory(fullPath, codemap, depth + 1, maxDepth);
          }
        } else {
          codemap.files.push({
            path: relativePath,
            name: entry.name,
            ext: path.extname(entry.name),
            size: fs.statSync(fullPath).size
          });
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }

  /**
   * Check if directory should be ignored
   */
  shouldIgnore(name) {
    const ignorePatterns = [
      'node_modules', '.git', '.venv', '__pycache__',
      'dist', 'build', '.next', '.cache', 'coverage'
    ];
    return ignorePatterns.includes(name);
  }

  /**
   * Count files in directory
   */
  countFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;
    
    try {
      return fs.readdirSync(dirPath).length;
    } catch {
      return 0;
    }
  }

  /**
   * Update project context after operation
   */
  async updateProjectContext(operation) {
    const contextPath = this.paths.projectContext;
    
    let context;
    if (fs.existsSync(contextPath)) {
      context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
    } else {
      context = {
        version: '1.0.0',
        project: { name: 'Heady' },
        intelligence: {},
        operationHistory: []
      };
    }

    context.timestamp = new Date().toISOString();
    context.lastOperation = {
      type: operation.type,
      timestamp: operation.timestamp,
      success: operation.success,
      details: operation.details
    };

    context.operationHistory.push(context.lastOperation);

    // Keep only last 50 operations
    if (context.operationHistory.length > 50) {
      context.operationHistory = context.operationHistory.slice(-50);
    }

    fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
  }

  /**
   * Get verification summary for display
   */
  getSummary() {
    const passed = Object.values(this.verificationResults.checks)
      .filter(c => c.passed).length;
    const total = Object.keys(this.verificationResults.checks).length;

    return {
      status: this.verificationResults.passed ? 'OPERATIONAL' : 'DEGRADED',
      checks: `${passed}/${total}`,
      timestamp: this.verificationResults.timestamp,
      details: this.verificationResults.checks
    };
  }

  /**
   * Logging utility
   */
  log(message, level = 'info') {
    if (!this.verbose && level === 'info') return;
    
    const prefix = {
      info: 'ℹ',
      success: '✓',
      warn: '⚠',
      error: '✗'
    }[level] || 'ℹ';

    console.log(`${prefix} ${message}`);
  }
}

// CLI execution
if (require.main === module) {
  const verifier = new HeadyIntelligenceVerifier({ verbose: true });
  
  verifier.verify()
    .then(results => {
      console.log('\n📊 Verification Summary:');
      console.log(JSON.stringify(verifier.getSummary(), null, 2));
      process.exit(results.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = HeadyIntelligenceVerifier;
