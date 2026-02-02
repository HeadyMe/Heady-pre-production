#!/usr/bin/env node

/**
 * Heady CLI - Production-grade command-line interface
 * Features:
 * - Service combination generation (all beneficial MCP/AI services)
 * - Wisdom.json file monitoring with change detection
 * - Unified interface for hb, hc, and bin scripts
 * - Global npm installation support
 */

const { program } = require('commander');
const HeadyCLI = require('../lib/index');

const cli = new HeadyCLI();

program
  .name('heady')
  .description('Production-grade CLI for Heady Systems')
  .version('1.0.0');

// Service Combinations Command
program
  .command('combinations')
  .description('Generate all beneficial service combinations')
  .option('-o, --output <file>', 'Output file for combinations')
  .option('-f, --format <type>', 'Output format (json|yaml|table)', 'table')
  .option('--filter <pattern>', 'Filter services by pattern')
  .option('--max <number>', 'Maximum combinations to generate', '100')
  .action(async (options) => {
    await cli.generateServiceCombinations(options);
  });

// Wisdom Monitor Command
program
  .command('wisdom')
  .description('Monitor wisdom.json for changes')
  .option('-w, --watch', 'Watch for changes in real-time')
  .option('-d, --diff', 'Show diff when changes detected')
  .option('-n, --notify', 'Send notifications on changes')
  .option('-i, --interval <ms>', 'Polling interval in ms', '1000')
  .action(async (options) => {
    await cli.monitorWisdom(options);
  });

// Task Command (from hb)
program
  .command('task <instruction>')
  .description('Submit a task to the Intelligent Swarm')
  .option('-p, --priority <level>', 'Task priority (HIGH|NORMAL|LOW)', 'NORMAL')
  .option('-s, --services <list>', 'Comma-separated service list')
  .option('--all', 'Enable all beneficial services')
  .action(async (instruction, options) => {
    await cli.submitTask(instruction, options);
  });

// Execute Command (from hc)
program
  .command('exec <instruction>')
  .alias('hc')
  .description('Execute with ALL beneficial tools')
  .option('-a, --action <script>', 'Execute custom script')
  .option('--stream', 'Stream governance output', true)
  .action(async (instruction, options) => {
    await cli.executeWithAllTools(instruction, options);
  });

// Build Command
program
  .command('build')
  .description('Run build system with MCP and AI optimization')
  .option('--phase <phase>', 'Build phase (scaffold|infrastructure|all)', 'all')
  .option('--scenario <scenario>', 'Build scenario', 'heady_default')
  .option('--parallel', 'Enable parallel builds')
  .option('--dry-run', 'Preview without executing')
  .option('--verbose', 'Detailed logging')
  .action(async (options) => {
    await cli.build(options);
  });

// Monitor Command
program
  .command('monitor')
  .description('Monitor real-time governance logs')
  .option('-f, --follow', 'Follow log stream', true)
  .option('-n, --lines <count>', 'Number of lines to show', '50')
  .option('--filter <type>', 'Filter by event type')
  .action(async (options) => {
    await cli.monitor(options);
  });

// Admin Commands
program
  .command('admin')
  .description('Admin UI operations')
  .option('--open', 'Open admin UI in browser')
  .option('--dev', 'Start in development mode')
  .option('--generate-key', 'Generate new API key')
  .action(async (options) => {
    await cli.admin(options);
  });

// Secrets Management
program
  .command('secrets')
  .description('Manage secrets and environment variables')
  .option('-l, --list', 'List all secrets (masked)')
  .option('-v, --validate', 'Validate environment')
  .option('-g, --generate', 'Generate new API key')
  .action(async (options) => {
    await cli.secrets(options);
  });

// Service Status
program
  .command('status')
  .description('Show system and service status')
  .option('-a, --all', 'Show all services')
  .option('-j, --json', 'Output as JSON')
  .action(async (options) => {
    await cli.status(options);
  });

// Swarm Management
program
  .command('swarm <action>')
  .description('Manage Intelligent Swarm (up|down|logs|restart)')
  .option('-d, --detach', 'Run in detached mode', true)
  .option('--build', 'Rebuild containers')
  .action(async (action, options) => {
    await cli.swarm(action, options);
  });

// QA Commands
program
  .command('qa <subcommand>')
  .description('Question & Answer operations (list|ask|answer)')
  .option('--task <id>', 'Task ID for question')
  .option('--status <status>', 'Filter by status', 'PENDING')
  .action(async (subcommand, options) => {
    await cli.qa(subcommand, options);
  });

// Sync Command
program
  .command('sync')
  .description('Synchronize repositories and state')
  .option('--repos', 'Sync all repositories')
  .option('--state', 'Sync state files')
  .option('--all', 'Sync everything')
  .action(async (options) => {
    await cli.sync(options);
  });

// Interactive Mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive CLI mode')
  .action(async () => {
    await cli.interactive();
  });

// Service Discovery
program
  .command('discover')
  .description('Discover available MCP services and tools')
  .option('--refresh', 'Refresh service cache')
  .option('--test', 'Test service connectivity')
  .action(async (options) => {
    await cli.discover(options);
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
