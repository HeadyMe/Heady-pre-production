#!/usr/bin/env node
/**
 * Validate Merge Readiness
 * Checks all requirements from SQUASH_MERGE_PLAN.md
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class MergeValidator {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
  }
  
  async validate() {
    console.log('🔍 Validating Merge Readiness\n');
    console.log('═══════════════════════════════════════════════');
    
    // Check core infrastructure
    await this.checkCoreInfrastructure();
    
    // Check MCP services
    await this.checkMCPServices();
    
    // Check enterprise packages
    await this.checkEnterprisePackages();
    
    // Check UI enhancements
    await this.checkUIEnhancements();
    
    // Check utilities
    await this.checkUtilities();
    
    // Check Git status
    await this.checkGitStatus();
    
    // Print summary
    this.printSummary();
  }
  
  async checkCoreInfrastructure() {
    console.log('\n📦 Core Infrastructure:');
    
    const files = [
      'src/mcp/heady-graph-server.js',
      'src/mcp/heady-metrics-server.js',
      'src/mcp/heady-workflow-server.js',
      'src/mcp/heady-mcp-orchestrator.js',
      'SQUASH_MERGE_PLAN.md',
      '.heady-memory/patterns/merge_strategy_001.json'
    ];
    
    for (const file of files) {
      await this.checkFile(file);
    }
  }
  
  async checkMCPServices() {
    console.log('\n🔧 MCP Services:');
    
    // Check if services have logging integration
    const services = [
      { file: 'src/mcp/heady-graph-server.js', integration: 'logger' },
      { file: 'src/mcp/heady-metrics-server.js', integration: 'shared-utils' },
      { file: 'src/mcp/heady-workflow-server.js', integration: 'queue' }
    ];
    
    for (const service of services) {
      try {
        const content = await fs.readFile(service.file, 'utf8');
        if (content.includes(service.integration)) {
          this.results.push(`✓ ${path.basename(service.file)} has ${service.integration} integration`);
        } else {
          this.warnings.push(`⚠ ${path.basename(service.file)} missing ${service.integration} integration`);
        }
      } catch (error) {
        this.errors.push(`✗ Cannot check ${service.file}: ${error.message}`);
      }
    }
  }
  
  async checkEnterprisePackages() {
    console.log('\n📚 Enterprise Packages:');
    
    const requiredPackages = [
      'winston',
      'bull',
      'prom-client',
      'socket.io',
      'ioredis',
      'joi',
      'compression',
      'bcryptjs',
      'node-cache'
    ];
    
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const pkg of requiredPackages) {
        if (dependencies[pkg]) {
          this.results.push(`✓ ${pkg} installed (${dependencies[pkg]})`);
        } else {
          this.warnings.push(`⚠ ${pkg} not found in package.json`);
        }
      }
    } catch (error) {
      this.errors.push(`✗ Cannot read package.json: ${error.message}`);
    }
  }
  
  async checkUIEnhancements() {
    console.log('\n🎨 UI Enhancements:');
    
    const uiFiles = [
      'public/sacred-geometry.html',
      'public/admin.html',
      'public/monitoring.html'
    ];
    
    for (const file of uiFiles) {
      await this.checkFile(file);
    }
  }
  
  async checkUtilities() {
    console.log('\n🛠 Utility Modules:');
    
    const utilities = [
      'src/utils/shared-utils.js',
      'src/utils/logger.js',
      'src/utils/queue.js',
      'src/utils/monitoring.js',
      'src/utils/realtime.js',
      'src/utils/cache.js',
      'src/utils/validation.js'
    ];
    
    for (const util of utilities) {
      await this.checkFile(util);
    }
  }
  
  async checkGitStatus() {
    console.log('\n📝 Git Status:');
    
    try {
      // Check for uncommitted changes
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        const files = status.trim().split('\n').length;
        this.warnings.push(`⚠ ${files} uncommitted files in workspace`);
      } else {
        this.results.push('✓ No uncommitted changes');
      }
      
      // Check current branch
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      this.results.push(`✓ Current branch: ${branch}`);
      
      // Check if ahead of main
      try {
        const ahead = execSync('git rev-list --count main..HEAD', { encoding: 'utf8' }).trim();
        if (ahead > 0) {
          this.results.push(`✓ ${ahead} commits ahead of main`);
        }
      } catch {
        // Branch might not have main as upstream
      }
      
    } catch (error) {
      this.errors.push(`✗ Git status check failed: ${error.message}`);
    }
  }
  
  async checkFile(filepath) {
    try {
      await fs.access(filepath);
      const stats = await fs.stat(filepath);
      const size = (stats.size / 1024).toFixed(2);
      this.results.push(`✓ ${path.basename(filepath)} exists (${size} KB)`);
      return true;
    } catch (error) {
      this.errors.push(`✗ Missing: ${filepath}`);
      return false;
    }
  }
  
  printSummary() {
    console.log('\n═══════════════════════════════════════════════');
    console.log('                VALIDATION SUMMARY');
    console.log('═══════════════════════════════════════════════\n');
    
    // Print results
    if (this.results.length > 0) {
      console.log('✅ Passed Checks:');
      this.results.forEach(r => console.log(`  ${r}`));
    }
    
    // Print warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(w => console.log(`  ${w}`));
    }
    
    // Print errors
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(e => console.log(`  ${e}`));
    }
    
    // Overall status
    console.log('\n───────────────────────────────────────────────');
    const total = this.results.length + this.warnings.length + this.errors.length;
    const passRate = Math.round((this.results.length / total) * 100);
    
    console.log(`  Total Checks: ${total}`);
    console.log(`  ✓ Passed: ${this.results.length}`);
    console.log(`  ⚠ Warnings: ${this.warnings.length}`);
    console.log(`  ✗ Failed: ${this.errors.length}`);
    console.log(`  Pass Rate: ${passRate}%`);
    console.log('═══════════════════════════════════════════════\n');
    
    if (this.errors.length === 0) {
      console.log('🎉 Workspace is READY for squash merge!');
      console.log('✨ All critical requirements met');
      console.log('\nNext steps:');
      console.log('  1. Review warnings (if any)');
      console.log('  2. Run: git add .');
      console.log('  3. Run: git commit -m "feat: Production-ready HeadyMCP"');
      console.log('  4. Execute squash merge to main\n');
    } else {
      console.log('⚠️  Workspace has issues that need resolution');
      console.log('Please fix the errors above before merging\n');
    }
    
    // Store validation result in persistent memory
    this.storeValidationResult(passRate);
  }
  
  async storeValidationResult(passRate) {
    const result = {
      id: `validation_${Date.now()}`,
      type: 'merge_validation',
      timestamp: new Date().toISOString(),
      passRate,
      results: this.results.length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      ready: this.errors.length === 0
    };
    
    const memoryDir = path.join('.heady-memory', 'validations');
    await fs.mkdir(memoryDir, { recursive: true });
    
    const filepath = path.join(memoryDir, `${result.id}.json`);
    await fs.writeFile(filepath, JSON.stringify(result, null, 2));
    
    console.log(`📝 Validation result stored: ${filepath}`);
  }
}

// Run validation
if (require.main === module) {
  const validator = new MergeValidator();
  validator.validate().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = { MergeValidator };
