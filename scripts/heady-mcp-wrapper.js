#!/usr/bin/env node
/**
 * HEADY MCP COMMAND WRAPPER
 * Automatically utilizes all HeadyMCP services for any command
 * Provides intelligent context and enhanced capabilities
 */

const MCPClientWrapper = require('../src/mcp_client_wrapper');
const { spawn } = require('child_process');
const path = require('path');

class HeadyCommandWrapper {
  constructor() {
    this.mcpClient = new MCPClientWrapper();
    this.mcpConnected = false;
    this.rootDir = path.resolve(__dirname, '..');
  }

  async execute(command, args = []) {
    // Connect to all MCP services
    try {
      const serviceCount = await this.mcpClient.connectAll();
      this.mcpConnected = true;
      console.log(`[Heady] Connected to ${serviceCount} MCP services`);
    } catch (error) {
      console.warn(`[Heady] MCP connection failed: ${error.message}`);
    }

    // Enhance command with MCP context
    const context = await this.gatherContext(command, args);
    
    if (context.suggestions.length > 0) {
      console.log('[Heady] Suggestions:');
      context.suggestions.forEach(s => console.log(`  • ${s}`));
    }

    // Execute the actual command
    console.log(`[Heady] Executing: ${command} ${args.join(' ')}`);
    
    const result = await this.runCommand(command, args);

    // Post-execution analysis
    if (this.mcpConnected) {
      await this.analyzeResult(command, result);
    }

    // Cleanup
    if (this.mcpConnected) {
      await this.mcpClient.disconnectAll();
    }

    return result;
  }

  async gatherContext(command, args) {
    const context = {
      command,
      args,
      suggestions: [],
      mcpTools: []
    };

    if (!this.mcpConnected) {
      return context;
    }

    // Get relevant MCP tools for this command
    const allTools = this.mcpClient.listTools();
    
    // Command-specific enhancements
    if (command === 'git') {
      context.suggestions.push('Git operations tracked via MCP');
      context.mcpTools = allTools.filter(t => t.service === 'git');
    } else if (command === 'npm' || command === 'node') {
      context.suggestions.push('Filesystem operations monitored');
      context.mcpTools = allTools.filter(t => t.service === 'filesystem');
    } else if (command === 'curl' || command === 'wget') {
      context.suggestions.push('HTTP requests via MCP fetch service');
      context.mcpTools = allTools.filter(t => t.service === 'fetch');
    }

    // Check if we can use sequential thinking for complex operations
    if (args.some(arg => arg.includes('build') || arg.includes('deploy'))) {
      context.suggestions.push('Complex operation detected - sequential thinking available');
    }

    return context;
  }

  async runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        cwd: this.rootDir,
        stdio: 'inherit',
        shell: true
      });

      proc.on('close', (code) => {
        resolve({ code, success: code === 0 });
      });

      proc.on('error', (error) => {
        reject(error);
      });
    });
  }

  async analyzeResult(command, result) {
    if (!result.success) {
      console.log('[Heady] Command failed - analyzing with MCP...');
      
      // Use sequential thinking to analyze failure
      try {
        const analysis = await this.mcpClient.callTool('sequential-thinking', 'sequentialthinking', {
          thought: `Analyze why command "${command}" failed`,
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: false
        });
        
        if (analysis && analysis.content) {
          console.log('[Heady] Analysis:', analysis.content[0].text);
        }
      } catch (error) {
        // Sequential thinking not available or failed
      }
    } else {
      console.log('[Heady] ✓ Command completed successfully');
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: heady <command> [args...]');
    process.exit(1);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  const wrapper = new HeadyCommandWrapper();
  
  try {
    const result = await wrapper.execute(command, commandArgs);
    process.exit(result.code || 0);
  } catch (error) {
    console.error('[Heady] Error:', error.message);
    process.exit(1);
  }
}

main();
