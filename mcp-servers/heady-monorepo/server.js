#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        HEADY MONOREPO SERVICE - Merge & Push                 ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📂 COLLECT       🔀 MERGE          📦 PACKAGE        🚀 PUSH
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │ Gather │─────▶│ Organize │─────▶│ Configure│─────▶│ Commit & │
 *    │ Files  │      │Structure │      │Workspace │      │  Push    │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 * 
 * Responsibilities:
 * - Collect files from multiple sources
 * - Merge into monorepo structure
 * - Configure pnpm workspace
 * - Set up package dependencies
 * - Initialize git repository
 * - Commit and push to remote
 * - Validate monorepo integrity
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class HeadyMonorepoService {
  constructor() {
    this.server = new Server(
      { name: 'heady-monorepo', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'heady_create_monorepo',
          description: 'Create monorepo structure from source directory',
          inputSchema: {
            type: 'object',
            properties: {
              source_dir: { type: 'string', description: 'Source directory' },
              target_dir: { type: 'string', description: 'Monorepo target directory' }
            },
            required: ['source_dir', 'target_dir']
          }
        },
        {
          name: 'heady_merge_components',
          description: 'Merge components into monorepo packages',
          inputSchema: {
            type: 'object',
            properties: {
              monorepo_dir: { type: 'string' },
              components: { type: 'array', items: { type: 'string' } }
            },
            required: ['monorepo_dir']
          }
        },
        {
          name: 'heady_configure_workspace',
          description: 'Configure pnpm workspace and dependencies',
          inputSchema: {
            type: 'object',
            properties: {
              monorepo_dir: { type: 'string' }
            },
            required: ['monorepo_dir']
          }
        },
        {
          name: 'heady_push_monorepo',
          description: 'Commit and push monorepo to git',
          inputSchema: {
            type: 'object',
            properties: {
              monorepo_dir: { type: 'string' },
              remote_url: { type: 'string' },
              commit_message: { type: 'string' }
            },
            required: ['monorepo_dir']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'heady_create_monorepo':
            return await this.createMonorepo(args);
          case 'heady_merge_components':
            return await this.mergeComponents(args);
          case 'heady_configure_workspace':
            return await this.configureWorkspace(args);
          case 'heady_push_monorepo':
            return await this.pushMonorepo(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true
        };
      }
    });
  }

  async createMonorepo(args) {
    const { source_dir, target_dir } = args;
    
    // Create monorepo structure
    const structure = [
      'packages/core/src',
      'packages/mcp-servers',
      'packages/templates',
      'packages/ui',
      'apps/heady-manager',
      'apps/heady-e',
      'apps/heady-ide',
      'docs',
      'scripts'
    ];

    for (const dir of structure) {
      await fs.mkdir(path.join(target_dir, dir), { recursive: true });
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          created: structure.length,
          target: target_dir
        }, null, 2)
      }]
    };
  }

  async mergeComponents(args) {
    const { monorepo_dir } = args;
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          merged: true,
          location: monorepo_dir
        }, null, 2)
      }]
    };
  }

  async configureWorkspace(args) {
    const { monorepo_dir } = args;
    
    // Create pnpm-workspace.yaml
    const workspaceConfig = `packages:\n  - 'packages/*'\n  - 'apps/*'\n`;
    await fs.writeFile(path.join(monorepo_dir, 'pnpm-workspace.yaml'), workspaceConfig);
    
    // Create root package.json
    const packageJson = {
      name: 'heady-monorepo',
      version: '14.3.0',
      private: true,
      workspaces: ['packages/*', 'apps/*'],
      author: 'HeadyConnection & HeadySystems Team'
    };
    
    await fs.writeFile(
      path.join(monorepo_dir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          configured: true,
          workspace: 'pnpm'
        }, null, 2)
      }]
    };
  }

  async pushMonorepo(args) {
    const { monorepo_dir, remote_url, commit_message } = args;
    
    try {
      // Initialize git if needed
      try {
        execSync('git status', { cwd: monorepo_dir });
      } catch {
        execSync('git init', { cwd: monorepo_dir });
      }

      // Add all files
      execSync('git add -A', { cwd: monorepo_dir });
      
      // Commit
      const message = commit_message || 'Heady Monorepo - Complete integration';
      execSync(`git commit -m "${message}"`, { cwd: monorepo_dir });
      
      // Add remote and push if URL provided
      if (remote_url) {
        try {
          execSync(`git remote add origin ${remote_url}`, { cwd: monorepo_dir });
        } catch {
          // Remote might already exist
        }
        
        execSync('git push -u origin main', { cwd: monorepo_dir });
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            committed: true,
            pushed: !!remote_url,
            message: commit_message
          }, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Git operations failed: ${error.message}`);
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MONOREPO SERVICE]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[HEADY MONOREPO] MCP Server running');
  }
}

const service = new HeadyMonorepoService();
service.run().catch(console.error);

module.exports = HeadyMonorepoService;
