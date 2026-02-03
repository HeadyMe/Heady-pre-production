const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const fetch = require('node-fetch');
const { createLogger, format, transports } = require('winston');

/**
 * HeadyCLI - Main CLI implementation
 */
class HeadyCLI {
  constructor() {
    this.projectRoot = this.findProjectRoot();
    this.wisdomPath = path.join(this.projectRoot, 'data', 'memory', 'wisdom.json');
    this.orchestratorBases = [
      'http://localhost:3100',
      'http://localhost:3000'
    ];
    
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
      transports: [new transports.Console()]
    });

    // All available MCP and AI services
    this.allServices = {
      mcp: [
        'filesystem',
        'git',
        'github-mcp-server',
        'sequential-thinking',
        'postgresql',
        'memory',
        'mcp-playwright',
        'puppeteer',
        'figma-remote-mcp-server',
        'snyk',
        'terraform',
        'cloudflare-docs',
        'deepwiki',
        'exa',
        'prisma-mcp-server',
        'stripe',
        'google-maps'
      ],
      ai: [
        'perplexity-ask',
        'google_mcp',
        'huggingface',
        'jules_mcp',
        'yandex'
      ]
    };
  }

  findProjectRoot() {
    let currentDir = __dirname;
    while (currentDir !== path.parse(currentDir).root) {
      if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return process.cwd();
  }

  /**
   * Generate all beneficial service combinations
   */
  async generateServiceCombinations(options) {
    const spinner = ora('Generating service combinations...').start();
    
    try {
      const allServices = [...this.allServices.mcp, ...this.allServices.ai];
      const maxCombinations = parseInt(options.max) || 100;
      const combinations = [];

      // Generate power set of all services (2^n combinations)
      const powerSet = this.generatePowerSet(allServices);
      
      // Filter and score combinations
      for (const combo of powerSet.slice(0, maxCombinations)) {
        if (combo.length === 0) continue;
        
        const score = this.scoreServiceCombination(combo);
        const category = this.categorizeServices(combo);
        
        combinations.push({
          services: combo,
          count: combo.length,
          score: score,
          category: category,
          use_cases: this.suggestUseCases(combo)
        });
      }

      // Sort by score (highest first)
      combinations.sort((a, b) => b.score - a.score);

      spinner.succeed(`Generated ${combinations.length} service combinations`);

      // Output results
      if (options.output) {
        fs.writeFileSync(
          options.output,
          JSON.stringify(combinations, null, 2)
        );
        console.log(chalk.green(`✓ Saved to ${options.output}`));
      } else {
        this.displayCombinations(combinations, options.format);
      }

      return combinations;
    } catch (error) {
      spinner.fail('Failed to generate combinations');
      this.logger.error(error.message);
      throw error;
    }
  }

  generatePowerSet(array) {
    const result = [[]];
    for (const element of array) {
      const length = result.length;
      for (let i = 0; i < length; i++) {
        result.push([...result[i], element]);
      }
    }
    return result;
  }

  scoreServiceCombination(services) {
    let score = 0;
    
    // Base score: number of services
    score += services.length * 10;
    
    // Bonus for AI services
    const aiCount = services.filter(s => this.allServices.ai.includes(s)).length;
    score += aiCount * 20;
    
    // Bonus for essential services
    const essential = ['filesystem', 'git', 'sequential-thinking'];
    const essentialCount = services.filter(s => essential.includes(s)).length;
    score += essentialCount * 15;
    
    // Bonus for complementary pairs
    if (services.includes('perplexity-ask') && services.includes('deepwiki')) score += 25;
    if (services.includes('mcp-playwright') && services.includes('puppeteer')) score += 20;
    if (services.includes('github-mcp-server') && services.includes('git')) score += 30;
    
    // Penalty for redundancy
    if (services.includes('mcp-playwright') && services.includes('puppeteer')) score -= 10;
    
    return score;
  }

  categorizeServices(services) {
    const categories = [];
    
    if (services.some(s => ['perplexity-ask', 'deepwiki', 'exa'].includes(s))) {
      categories.push('research');
    }
    if (services.some(s => ['snyk', 'terraform'].includes(s))) {
      categories.push('security');
    }
    if (services.some(s => this.allServices.ai.includes(s))) {
      categories.push('ai');
    }
    if (services.some(s => ['mcp-playwright', 'puppeteer'].includes(s))) {
      categories.push('testing');
    }
    if (services.some(s => ['git', 'github-mcp-server'].includes(s))) {
      categories.push('development');
    }
    if (services.some(s => ['postgresql', 'memory'].includes(s))) {
      categories.push('data');
    }
    
    return categories.length > 0 ? categories : ['general'];
  }

  suggestUseCases(services) {
    const useCases = [];
    const serviceSet = new Set(services);
    
    if (serviceSet.has('perplexity-ask') && serviceSet.has('sequential-thinking')) {
      useCases.push('Complex research with multi-step reasoning');
    }
    if (serviceSet.has('snyk') && serviceSet.has('github-mcp-server')) {
      useCases.push('Security-focused code review and deployment');
    }
    if (serviceSet.has('huggingface') && serviceSet.has('google_mcp')) {
      useCases.push('Multi-model AI inference and generation');
    }
    if (serviceSet.has('mcp-playwright') && serviceSet.has('figma-remote-mcp-server')) {
      useCases.push('UI/UX testing and design validation');
    }
    if (serviceSet.has('postgresql') && serviceSet.has('memory')) {
      useCases.push('Data persistence with intelligent caching');
    }
    
    return useCases.length > 0 ? useCases : ['General-purpose task execution'];
  }

  displayCombinations(combinations, format) {
    if (format === 'json') {
      console.log(JSON.stringify(combinations, null, 2));
      return;
    }

    console.log(chalk.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║         Top Service Combinations (by score)              ║'));
    console.log(chalk.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

    combinations.slice(0, 20).forEach((combo, index) => {
      console.log(chalk.yellow(`${index + 1}. Score: ${combo.score} | Services: ${combo.count}`));
      console.log(chalk.gray(`   Categories: ${combo.category.join(', ')}`));
      console.log(chalk.white(`   Services: ${combo.services.join(', ')}`));
      if (combo.use_cases.length > 0) {
        console.log(chalk.green(`   Use Cases: ${combo.use_cases[0]}`));
      }
      console.log('');
    });
  }

  /**
   * Monitor wisdom.json for changes
   */
  async monitorWisdom(options) {
    if (!fs.existsSync(this.wisdomPath)) {
      this.logger.error(`Wisdom file not found: ${this.wisdomPath}`);
      return;
    }

    let previousContent = fs.readFileSync(this.wisdomPath, 'utf8');
    let previousData = JSON.parse(previousContent);

    console.log(chalk.cyan(`\n🔍 Monitoring wisdom.json for changes...`));
    console.log(chalk.gray(`   Path: ${this.wisdomPath}`));
    console.log(chalk.gray(`   Patterns: ${previousData.length}\n`));

    if (options.watch) {
      const watcher = chokidar.watch(this.wisdomPath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100
        }
      });

      watcher.on('change', async (filePath) => {
        try {
          const newContent = fs.readFileSync(filePath, 'utf8');
          const newData = JSON.parse(newContent);

          console.log(chalk.yellow(`\n⚡ Change detected at ${new Date().toISOString()}`));
          
          const changes = this.detectWisdomChanges(previousData, newData);
          this.displayWisdomChanges(changes, options.diff);

          if (options.notify) {
            await this.notifyWisdomChange(changes);
          }

          previousData = newData;
          previousContent = newContent;
        } catch (error) {
          this.logger.error(`Error processing wisdom change: ${error.message}`);
        }
      });

      console.log(chalk.green('✓ Watching for changes... (Press Ctrl+C to stop)'));
      
      // Keep process alive
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n\n👋 Stopping wisdom monitor...'));
        watcher.close();
        process.exit(0);
      });
    } else {
      // One-time check
      const currentContent = fs.readFileSync(this.wisdomPath, 'utf8');
      const currentData = JSON.parse(currentContent);
      
      if (currentContent !== previousContent) {
        const changes = this.detectWisdomChanges(previousData, currentData);
        this.displayWisdomChanges(changes, options.diff);
      } else {
        console.log(chalk.green('✓ No changes detected'));
      }
    }
  }

  detectWisdomChanges(oldData, newData) {
    const changes = {
      added: [],
      removed: [],
      modified: [],
      total: newData.length - oldData.length
    };

    const oldMap = new Map(oldData.map(p => [p.pattern_id, p]));
    const newMap = new Map(newData.map(p => [p.pattern_id, p]));

    // Detect added patterns
    for (const [id, pattern] of newMap) {
      if (!oldMap.has(id)) {
        changes.added.push(pattern);
      }
    }

    // Detect removed patterns
    for (const [id, pattern] of oldMap) {
      if (!newMap.has(id)) {
        changes.removed.push(pattern);
      }
    }

    // Detect modified patterns
    for (const [id, newPattern] of newMap) {
      const oldPattern = oldMap.get(id);
      if (oldPattern && JSON.stringify(oldPattern) !== JSON.stringify(newPattern)) {
        changes.modified.push({
          old: oldPattern,
          new: newPattern
        });
      }
    }

    return changes;
  }

  displayWisdomChanges(changes, showDiff) {
    console.log(chalk.cyan('\n📊 Wisdom Changes Summary:'));
    console.log(chalk.green(`   ✓ Added: ${changes.added.length}`));
    console.log(chalk.red(`   ✗ Removed: ${changes.removed.length}`));
    console.log(chalk.yellow(`   ⚡ Modified: ${changes.modified.length}`));
    console.log(chalk.white(`   Δ Total: ${changes.total > 0 ? '+' : ''}${changes.total}\n`));

    if (changes.added.length > 0) {
      console.log(chalk.green('➕ Added Patterns:'));
      changes.added.forEach(p => {
        console.log(chalk.white(`   • ${p.pattern_id} (trigger: ${p.trigger})`));
        if (showDiff) {
          console.log(chalk.gray(`     ${p.strategy.substring(0, 100)}...`));
        }
      });
      console.log('');
    }

    if (changes.removed.length > 0) {
      console.log(chalk.red('➖ Removed Patterns:'));
      changes.removed.forEach(p => {
        console.log(chalk.white(`   • ${p.pattern_id}`));
      });
      console.log('');
    }

    if (changes.modified.length > 0) {
      console.log(chalk.yellow('⚡ Modified Patterns:'));
      changes.modified.forEach(({ old, new: newPattern }) => {
        console.log(chalk.white(`   • ${newPattern.pattern_id}`));
        if (showDiff && old.strategy !== newPattern.strategy) {
          console.log(chalk.gray(`     OLD: ${old.strategy.substring(0, 80)}...`));
          console.log(chalk.cyan(`     NEW: ${newPattern.strategy.substring(0, 80)}...`));
        }
      });
      console.log('');
    }
  }

  async notifyWisdomChange(changes) {
    // Send notification to orchestrator
    try {
      await this.invokeOrchestrator('/api/wisdom/notify', 'POST', {
        timestamp: new Date().toISOString(),
        changes: changes
      });
      console.log(chalk.green('✓ Notification sent to orchestrator'));
    } catch (error) {
      this.logger.warn('Could not notify orchestrator');
    }
  }

  async invokeOrchestrator(path, method = 'GET', body = null) {
    // Try routing through HeadyMCP first
    try {
      const mcpUrl = 'http://localhost:3300/api/mcp/orchestrator';
      const mcpBody = {
        method,
        path,
        body
      };
      
      const headers = { 'Content-Type': 'application/json' };
      if (process.env.HEADY_API_KEY) {
        headers['x-heady-api-key'] = process.env.HEADY_API_KEY;
      }
      
      const response = await fetch(mcpUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(mcpBody),
        timeout: 5000
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Fallback to direct orchestrator call
      this.logger.warn('HeadyMCP unavailable, using direct orchestrator');
    }
    
    // Fallback: Direct orchestrator call
    let lastError;
    for (const base of this.orchestratorBases) {
      try {
        const url = `${base}${path}`;
        const options = {
          method,
          headers: { 'Content-Type': 'application/json' }
        };
        
        if (body) {
          options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        return await response.json();
      } catch (error) {
        lastError = error;
      }
    }
    
    throw lastError;
  }

  async submitTask(instruction, options) {
    const spinner = ora('Submitting task...').start();
    
    try {
      const body = {
        instruction,
        priority: options.priority || 'NORMAL'
      };

      if (options.all) {
        body.use_all_mcp = true;
        body.enable_services = this.buildAllServicesConfig();
      } else if (options.services) {
        body.detected_tools = options.services.split(',');
      }

      const response = await this.invokeOrchestrator('/api/tasks', 'POST', body);
      
      spinner.succeed('Task submitted');
      console.log(chalk.green(`✓ Task ID: ${response.task.id}`));
      console.log(chalk.gray(`  Status: ${response.task.status}`));
    } catch (error) {
      spinner.fail('Failed to submit task');
      this.logger.error(error.message);
    }
  }

  buildAllServicesConfig() {
    const config = {};
    [...this.allServices.mcp, ...this.allServices.ai].forEach(service => {
      config[service.replace(/-/g, '_')] = true;
    });
    return config;
  }

  async executeWithAllTools(instruction, options) {
    console.log(chalk.magenta(`\n[HC] ${instruction}`));
    console.log(chalk.cyan('[*] Activating ALL beneficial tools...\n'));

    // Submit task with all services enabled
    await this.submitTask(instruction, { all: true });

    if (options.stream) {
      // Stream governance output
      await this.monitor({ follow: true, lines: 50 });
    }
  }

  async build(options) {
    const spinner = ora(`Building (phase: ${options.phase})...`).start();
    
    try {
      const body = {
        phase: options.phase,
        scenario: options.scenario,
        dry_run: options.dryRun || false,
        verbose: options.verbose || false,
        parallel_build: options.parallel || false
      };

      const response = await this.invokeOrchestrator('/api/build/execute', 'POST', body);
      
      spinner.succeed('Build complete');
      console.log(chalk.green(`✓ Task ID: ${response.build_task.id}`));
    } catch (error) {
      spinner.fail('Build failed');
      this.logger.error(error.message);
    }
  }

  async monitor(options) {
    console.log(chalk.cyan('\n📡 Monitoring governance stream...\n'));
    
    const lensPath = path.join(this.projectRoot, 'shared', 'state', 'lens_stream.json');
    
    if (!fs.existsSync(lensPath)) {
      this.logger.error(`Lens stream not found: ${lensPath}`);
      return;
    }

    const content = fs.readFileSync(lensPath, 'utf8');
    const data = JSON.parse(content);
    const events = data.events || data;
    
    const lines = parseInt(options.lines) || 50;
    const displayEvents = events.slice(-lines);

    displayEvents.forEach(event => {
      const source = event.source || event.source_container || 'system';
      const message = event.message || event.operation_type || 'event';
      const type = event.type || event.security_level || 'info';
      
      let color = 'white';
      if (type === 'SECURITY' || type === 'critical') color = 'red';
      else if (type === 'ADVICE' || type === 'warning') color = 'yellow';
      else if (type === 'ALLOCATION' || type === 'info') color = 'cyan';
      else if (type === 'CREATIVITY') color = 'magenta';
      else if (type === 'ARTIFACT') color = 'green';
      
      console.log(chalk[color](`[${source}] ${message}`));
    });
  }

  async admin(options) {
    if (options.generateKey) {
      const crypto = require('crypto');
      const key = crypto.randomBytes(32).toString('hex');
      console.log(chalk.green('\n✓ Generated API Key:'));
      console.log(chalk.white(`  ${key}\n`));
      console.log(chalk.gray('  Add to .env: HEADY_API_KEY=' + key));
    } else if (options.open) {
      const { exec } = require('child_process');
      exec('start http://localhost:3300/admin');
      console.log(chalk.green('✓ Opening admin UI...'));
    } else {
      console.log(chalk.cyan('Admin UI: http://localhost:3300/admin'));
    }
  }

  async secrets(options) {
    const binPath = path.join(this.projectRoot, 'scripts', 'bin');
    const { spawn } = require('child_process');
    
    if (options.list) {
      spawn('node', [path.join(binPath, 'list-secrets')], { stdio: 'inherit' });
    } else if (options.validate) {
      spawn('node', [path.join(binPath, 'validate-env')], { stdio: 'inherit' });
    } else if (options.generate) {
      spawn('node', [path.join(binPath, 'generate-api-key')], { stdio: 'inherit' });
    }
  }

  async status(options) {
    const { exec } = require('child_process');
    
    exec('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"', (error, stdout) => {
      if (error) {
        this.logger.error('Docker not available');
        return;
      }
      
      console.log(chalk.cyan('\n📊 System Status:\n'));
      console.log(stdout);
    });
  }

  async swarm(action, options) {
    const { spawn } = require('child_process');
    const composePath = path.join(this.projectRoot, '..', 'docker-compose.yml');
    
    const args = ['-f', composePath];
    
    switch (action) {
      case 'up':
        args.push('up', '-d');
        if (options.build) args.push('--build');
        break;
      case 'down':
        args.push('down');
        break;
      case 'logs':
        args.push('logs', '-f');
        break;
      case 'restart':
        args.push('restart');
        break;
      default:
        this.logger.error(`Unknown swarm action: ${action}`);
        return;
    }
    
    console.log(chalk.cyan(`\n🐝 Swarm: ${action}...\n`));
    spawn('docker-compose', args, { stdio: 'inherit' });
  }

  async qa(subcommand, options) {
    // Delegate to hb qa implementation
    const { spawn } = require('child_process');
    const hbPath = path.join(this.projectRoot, '..', 'scripts', 'hb.ps1');
    
    const args = ['qa', subcommand];
    if (options.task) args.push('--task', options.task);
    if (options.status) args.push(options.status);
    
    spawn('pwsh', [hbPath, ...args], { stdio: 'inherit' });
  }

  async sync(options) {
    console.log(chalk.cyan('\n🔄 Synchronizing...\n'));
    // Implementation for sync functionality
    this.logger.info('Sync functionality coming soon');
  }

  async interactive() {
    const inquirer = require('inquirer');
    
    console.log(chalk.cyan('\n🎯 Heady CLI - Interactive Mode\n'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'Generate service combinations',
          'Monitor wisdom.json',
          'Submit a task',
          'Execute with all tools',
          'Build system',
          'Monitor logs',
          'Manage swarm',
          'Exit'
        ]
      }
    ]);
    
    // Handle selected action
    this.logger.info(`Selected: ${action}`);
  }

  async discover(options) {
    console.log(chalk.cyan('\n🔍 Discovering MCP services...\n'));
    
    console.log(chalk.yellow('MCP Services:'));
    this.allServices.mcp.forEach(service => {
      console.log(chalk.white(`  • ${service}`));
    });
    
    console.log(chalk.yellow('\nAI Services:'));
    this.allServices.ai.forEach(service => {
      console.log(chalk.white(`  • ${service}`));
    });
    
    console.log(chalk.gray(`\nTotal: ${this.allServices.mcp.length + this.allServices.ai.length} services`));
  }
}

module.exports = HeadyCLI;
