#!/usr/bin/env node
/**
 * HeadySystems Health Check
 * Comprehensive system verification and auto-repair utility
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SystemHealthChecker {
    constructor() {
        this.issues = [];
        this.repairs = [];
        this.rootDir = path.resolve(__dirname, '..');
    }

    checkDirectory(dir, description) {
        const fullPath = path.join(this.rootDir, dir);
        if (!fs.existsSync(fullPath)) {
            this.issues.push(`Missing directory: ${dir} (${description})`);
            try {
                fs.mkdirSync(fullPath, { recursive: true });
                this.repairs.push(`Created directory: ${dir}`);
            } catch (err) {
                this.issues.push(`Failed to create ${dir}: ${err.message}`);
            }
        }
        return fs.existsSync(fullPath);
    }

    checkFile(file, description, defaultContent = null) {
        const fullPath = path.join(this.rootDir, file);
        if (!fs.existsSync(fullPath)) {
            this.issues.push(`Missing file: ${file} (${description})`);
            if (defaultContent !== null) {
                try {
                    const dir = path.dirname(fullPath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    fs.writeFileSync(fullPath, defaultContent);
                    this.repairs.push(`Created file: ${file}`);
                } catch (err) {
                    this.issues.push(`Failed to create ${file}: ${err.message}`);
                }
            }
        }
        return fs.existsSync(fullPath);
    }

    checkNodeModules() {
        const nodeModulesPath = path.join(this.rootDir, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
            this.issues.push('Missing node_modules - dependencies not installed');
            console.log('📦 Installing dependencies...');
            try {
                execSync('npm install', { cwd: this.rootDir, stdio: 'inherit' });
                this.repairs.push('Installed npm dependencies');
            } catch (err) {
                this.issues.push(`Failed to install dependencies: ${err.message}`);
            }
        }
    }

    checkGitStatus() {
        try {
            const status = execSync('git status --porcelain', { cwd: this.rootDir }).toString();
            if (status.trim()) {
                this.issues.push('Uncommitted changes detected');
                return false;
            }
            return true;
        } catch (err) {
            this.issues.push(`Git check failed: ${err.message}`);
            return false;
        }
    }

    async runHealthCheck() {
        console.log('🔍 Running HeadySystems Health Check...\n');

        // Critical directories
        this.checkDirectory('src/.heady-memory', 'HeadyRegistry storage');
        this.checkDirectory('.heady-context', 'Context persistence');
        this.checkDirectory('.heady', 'HeadyConfig storage');
        this.checkDirectory('audit_logs', 'Audit trail storage');
        this.checkDirectory('data', 'Data processing storage');
        this.checkDirectory('scripts', 'System scripts');
        this.checkDirectory('src/client', 'Client components');
        this.checkDirectory('tests', 'Test suite');

        // Critical files with defaults
        const registryDefault = JSON.stringify({
            version: "1.0.0",
            components: {},
            routing: {},
            metadata: {
                lastUpdated: new Date().toISOString(),
                environment: "development"
            }
        }, null, 2);

        const contextDefault = JSON.stringify({
            version: "1.0.0",
            operations: [],
            context: {},
            lastCheckpoint: null
        }, null, 2);

        const codemapDefault = JSON.stringify({
            version: "1.0.0",
            files: {},
            structure: {},
            dependencies: {}
        }, null, 2);

        this.checkFile('src/.heady-memory/heady-registry.json', 'Component registry', registryDefault);
        this.checkFile('.heady-context/project-context.json', 'Project context', contextDefault);
        this.checkFile('.heady-context/codemap.json', 'Codebase map', codemapDefault);
        this.checkFile('mcp_config.json', 'MCP configuration');
        this.checkFile('package.json', 'Package configuration');

        // Check dependencies
        this.checkNodeModules();

        // Check Git status
        const gitClean = this.checkGitStatus();

        // Verify MCP servers
        if (fs.existsSync(path.join(this.rootDir, 'mcp_config.json'))) {
            try {
                const mcpConfig = JSON.parse(fs.readFileSync(path.join(this.rootDir, 'mcp_config.json'), 'utf8'));
                if (!mcpConfig.mcpServers || Object.keys(mcpConfig.mcpServers).length === 0) {
                    this.issues.push('No MCP servers configured');
                }
            } catch (err) {
                this.issues.push(`Invalid MCP configuration: ${err.message}`);
            }
        }

        // Generate report
        console.log('\n📊 Health Check Report');
        console.log('═══════════════════════════════════════\n');

        if (this.repairs.length > 0) {
            console.log('✅ Auto-Repairs Completed:');
            this.repairs.forEach(repair => console.log(`   • ${repair}`));
            console.log('');
        }

        if (this.issues.length > 0) {
            console.log('⚠️  Issues Detected:');
            this.issues.forEach(issue => console.log(`   • ${issue}`));
            console.log('');
        }

        const healthScore = Math.max(0, 100 - (this.issues.length * 10));
        console.log(`🏥 System Health Score: ${healthScore}%`);
        
        if (healthScore === 100) {
            console.log('✨ System is fully healthy and ready for operations!');
        } else if (healthScore >= 80) {
            console.log('👍 System is operational with minor issues');
        } else if (healthScore >= 60) {
            console.log('⚠️  System has issues that should be addressed');
        } else {
            console.log('❌ System has critical issues requiring immediate attention');
        }

        console.log('\n═══════════════════════════════════════');
        
        // Return status for automation
        return {
            healthy: healthScore >= 80,
            score: healthScore,
            issues: this.issues,
            repairs: this.repairs,
            gitClean
        };
    }
}

// Run if executed directly
if (require.main === module) {
    const checker = new SystemHealthChecker();
    checker.runHealthCheck().then(result => {
        process.exit(result.healthy ? 0 : 1);
    });
}

module.exports = SystemHealthChecker;
