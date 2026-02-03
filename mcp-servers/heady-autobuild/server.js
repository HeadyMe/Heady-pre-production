#!/usr/bin/env node
/**
 * HEADY AUTOBUILD MCP SERVER
 * 
 * Provides automated build orchestration as a convenient MCP service.
 * Integrates with HeadySquashMerge, CheckpointReporter, and WindsurfHeadyBridge.
 * 
 * Tools:
 * - hc_autobuild_execute: Run full autobuild cycle
 * - hc_autobuild_analyze: Analyze repositories and dependencies
 * - hc_autobuild_merge: Execute intelligent merge
 * - hc_autobuild_test: Run test suite
 * - hc_autobuild_deploy: Deploy artifacts
 * - hc_autobuild_status: Get build status
 * - hc_autobuild_checkpoint: Generate checkpoint
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const HCAutoBuild = require('../../src/hc_autobuild');

class HeadyAutoBuildServer {
  constructor() {
    this.server = new Server(
      {
        name: 'heady-autobuild',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.autobuild = null;
    this.currentBuild = null;
    this.buildHistory = [];
    
    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'hc_autobuild_execute',
          description: 'Execute full autobuild cycle with all phases (analyze, extract, merge, test, deploy)',
          inputSchema: {
            type: 'object',
            properties: {
              mode: {
                type: 'string',
                enum: ['auto', 'manual', 'hybrid'],
                description: 'Build mode',
                default: 'auto'
              },
              phases: {
                type: 'array',
                items: { type: 'string' },
                description: 'Phases to execute (default: all)',
                default: ['analyze', 'extract', 'merge', 'test', 'deploy']
              },
              dryRun: {
                type: 'boolean',
                description: 'Preview without executing',
                default: false
              },
              verbose: {
                type: 'boolean',
                description: 'Enable verbose logging',
                default: false
              },
              repositories: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific repositories to include'
              }
            }
          }
        },
        {
          name: 'hc_autobuild_analyze',
          description: 'Analyze repositories, dependencies, and detect conflicts',
          inputSchema: {
            type: 'object',
            properties: {
              repositories: {
                type: 'array',
                items: { type: 'string' },
                description: 'Repositories to analyze'
              },
              includeRecommendations: {
                type: 'boolean',
                description: 'Include MCP-powered recommendations',
                default: true
              }
            }
          }
        },
        {
          name: 'hc_autobuild_merge',
          description: 'Execute intelligent squash merge with weighted distribution',
          inputSchema: {
            type: 'object',
            properties: {
              strategy: {
                type: 'string',
                enum: ['intelligent', 'force', 'safe'],
                description: 'Merge strategy',
                default: 'intelligent'
              },
              conflictResolution: {
                type: 'string',
                enum: ['auto', 'manual', 'skip'],
                description: 'How to handle conflicts',
                default: 'auto'
              },
              validationLevel: {
                type: 'string',
                enum: ['strict', 'moderate', 'loose'],
                description: 'Validation strictness',
                default: 'strict'
              }
            }
          }
        },
        {
          name: 'hc_autobuild_test',
          description: 'Run comprehensive test suite',
          inputSchema: {
            type: 'object',
            properties: {
              suites: {
                type: 'array',
                items: { type: 'string' },
                description: 'Test suites to run',
                default: ['unit', 'integration', 'e2e']
              },
              coverage: {
                type: 'boolean',
                description: 'Calculate code coverage',
                default: true
              },
              strictTesting: {
                type: 'boolean',
                description: 'Fail build on test failures',
                default: true
              }
            }
          }
        },
        {
          name: 'hc_autobuild_deploy',
          description: 'Deploy built artifacts to target environment',
          inputSchema: {
            type: 'object',
            properties: {
              target: {
                type: 'string',
                enum: ['production', 'staging', 'development'],
                description: 'Deployment target',
                default: 'production'
              },
              dryRun: {
                type: 'boolean',
                description: 'Preview deployment without executing',
                default: false
              }
            }
          }
        },
        {
          name: 'hc_autobuild_status',
          description: 'Get current build status and metrics',
          inputSchema: {
            type: 'object',
            properties: {
              includeHistory: {
                type: 'boolean',
                description: 'Include build history',
                default: false
              }
            }
          }
        },
        {
          name: 'hc_autobuild_checkpoint',
          description: 'Generate system checkpoint report',
          inputSchema: {
            type: 'object',
            properties: {
              stage: {
                type: 'string',
                description: 'Checkpoint stage identifier',
                default: 'manual'
              }
            }
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'hc_autobuild_execute':
            return await this.handleExecute(args);
          
          case 'hc_autobuild_analyze':
            return await this.handleAnalyze(args);
          
          case 'hc_autobuild_merge':
            return await this.handleMerge(args);
          
          case 'hc_autobuild_test':
            return await this.handleTest(args);
          
          case 'hc_autobuild_deploy':
            return await this.handleDeploy(args);
          
          case 'hc_autobuild_status':
            return await this.handleStatus(args);
          
          case 'hc_autobuild_checkpoint':
            return await this.handleCheckpoint(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: error.message,
                tool: name,
                timestamp: new Date().toISOString()
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    });
  }

  async handleExecute(args) {
    const config = {
      mode: args.mode || 'auto',
      verbose: args.verbose || false,
      dryRun: args.dryRun || false,
      mcpEnabled: true
    };

    this.autobuild = new HCAutoBuild(config);
    this.currentBuild = {
      id: `build-${Date.now()}`,
      startTime: new Date(),
      status: 'running'
    };

    const options = {
      repositories: args.repositories,
      phases: args.phases
    };

    const summary = await this.autobuild.execute(options);
    
    this.currentBuild.status = 'completed';
    this.currentBuild.endTime = new Date();
    this.currentBuild.summary = summary;
    this.buildHistory.push(this.currentBuild);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            buildId: this.currentBuild.id,
            summary,
            duration: this.currentBuild.endTime - this.currentBuild.startTime,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async handleAnalyze(args) {
    if (!this.autobuild) {
      this.autobuild = new HCAutoBuild({ mcpEnabled: true });
    }

    const analysis = await this.autobuild.phaseAnalyze({
      repositories: args.repositories,
      includeRecommendations: args.includeRecommendations !== false
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            analysis,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async handleMerge(args) {
    if (!this.autobuild) {
      throw new Error('Must run analyze phase first');
    }

    this.autobuild.mergeConfig = {
      strategy: args.strategy || 'intelligent',
      conflictResolution: args.conflictResolution || 'auto',
      validationLevel: args.validationLevel || 'strict',
      preserveHistory: true
    };

    const merge = await this.autobuild.phaseMerge(args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            merge,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async handleTest(args) {
    if (!this.autobuild) {
      throw new Error('Must run merge phase first');
    }

    const testing = await this.autobuild.phaseTest({
      testSuites: args.suites,
      coverage: args.coverage,
      strictTesting: args.strictTesting
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            testing,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async handleDeploy(args) {
    if (!this.autobuild) {
      throw new Error('Must run test phase first');
    }

    const deployment = await this.autobuild.phaseDeploy({
      target: args.target,
      dryRun: args.dryRun
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            deployment,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async handleStatus(args) {
    const status = {
      currentBuild: this.currentBuild,
      autobuildState: this.autobuild ? this.autobuild.state : null,
      buildConfig: this.autobuild ? this.autobuild.buildConfig : null,
      history: args.includeHistory ? this.buildHistory : undefined
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            status,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async handleCheckpoint(args) {
    if (!this.autobuild) {
      this.autobuild = new HCAutoBuild({ mcpEnabled: true });
    }

    await this.autobuild.generateCheckpoint(args.stage || 'manual');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            stage: args.stage || 'manual',
            message: 'Checkpoint generated successfully',
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Heady AutoBuild MCP Server running on stdio');
  }
}

// Start server
const server = new HeadyAutoBuildServer();
server.run().catch(console.error);
