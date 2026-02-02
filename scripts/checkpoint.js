#!/usr/bin/env node

/**
 * HEADY CHECKPOINT CLI
 * Command-line interface for generating checkpoint reports
 */

const CheckpointReporter = require('../src/checkpoint_reporter');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'generate':
    case 'report':
      await generateReport();
      break;
    
    case 'view':
      await viewLatest();
      break;
    
    case 'list':
      await listCheckpoints();
      break;
    
    case 'help':
    default:
      showHelp();
      break;
  }
}

async function generateReport() {
  console.log('🚀 Generating checkpoint report...\n');
  
  const reporter = new CheckpointReporter({
    rootDir: path.resolve(__dirname, '..'),
    outputDir: path.resolve(__dirname, '../audit_logs')
  });
  
  try {
    const markdown = await reporter.generateReport();
    console.log('\n✅ Checkpoint report generated successfully!');
    console.log(`📄 Location: audit_logs/${reporter.checkpointId}.md`);
  } catch (err) {
    console.error('❌ Error generating report:', err.message);
    process.exit(1);
  }
}

async function viewLatest() {
  const fs = require('fs').promises;
  const auditDir = path.resolve(__dirname, '../audit_logs');
  
  try {
    const files = await fs.readdir(auditDir);
    const mdFiles = files.filter(f => f.endsWith('.md')).sort().reverse();
    
    if (mdFiles.length === 0) {
      console.log('No checkpoint reports found. Run "checkpoint generate" first.');
      return;
    }
    
    const latest = mdFiles[0];
    const content = await fs.readFile(path.join(auditDir, latest), 'utf8');
    console.log(content);
  } catch (err) {
    console.error('Error viewing report:', err.message);
    process.exit(1);
  }
}

async function listCheckpoints() {
  const fs = require('fs').promises;
  const auditDir = path.resolve(__dirname, '../audit_logs');
  
  try {
    const files = await fs.readdir(auditDir);
    const mdFiles = files.filter(f => f.endsWith('.md')).sort().reverse();
    
    if (mdFiles.length === 0) {
      console.log('No checkpoint reports found.');
      return;
    }
    
    console.log(`\n📋 Found ${mdFiles.length} checkpoint reports:\n`);
    
    for (const file of mdFiles) {
      const stats = await fs.stat(path.join(auditDir, file));
      const date = stats.mtime.toISOString().split('T')[0];
      const time = stats.mtime.toTimeString().split(' ')[0];
      console.log(`  • ${file.replace('.md', '')} - ${date} ${time}`);
    }
    
    console.log('');
  } catch (err) {
    console.error('Error listing checkpoints:', err.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           HEADY CHECKPOINT STORY DRIVER                   ║
╚═══════════════════════════════════════════════════════════╝

Generate comprehensive system status reports at checkpoints.

USAGE:
  node scripts/checkpoint.js <command>

COMMANDS:
  generate, report    Generate a new checkpoint report
  view                View the latest checkpoint report
  list                List all checkpoint reports
  help                Show this help message

EXAMPLES:
  node scripts/checkpoint.js generate
  node scripts/checkpoint.js view
  node scripts/checkpoint.js list

REPORT CONTENTS:
  • Executive Summary
  • Environment & Configuration
  • Docker Services Status
  • MCP Server Status
  • Health Checks
  • Git Repository Status
  • File System Structure
  • Running Processes
  • Operational Metrics
  • Memory Usage

Reports are saved to: audit_logs/checkpoint_<timestamp>.md
  `);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
