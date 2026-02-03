#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              MCP SERVICE TEMPLATE                            ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📥 REQUEST       🔧 PROCESS        📤 RESPONSE
 *        │                  │                  │
 *        ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐
 *    │ Receive│─────▶│ Execute  │─────▶│  Return  │
 *    │  Tool  │      │  Logic   │      │  Result  │
 *    └────────┘      └──────────┘      └──────────┘
 * 
 * Template for creating new MCP services in the Heady ecosystem.
 * Replace [SERVICE_NAME] with your service name (e.g., HeadyAnalytics)
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

class [SERVICE_NAME]Server {
  constructor() {
    this.server = new Server(
      {
        name: '[service-name]',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: '[service_name]_example_tool',
          description: 'Example tool - replace with your tool',
          inputSchema: {
            type: 'object',
            properties: {
              input: { type: 'string', description: 'Input parameter' }
            },
            required: ['input']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case '[service_name]_example_tool':
            return await this.handleExampleTool(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error in ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async handleExampleTool(args) {
    const { input } = args;
    
    // Your logic here
    const result = `Processed: ${input}`;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            result
          }, null, 2)
        }
      ]
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[ERROR]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[SERVICE_NAME] MCP Server running on stdio');
  }
}

// Start server
const server = new [SERVICE_NAME]Server();
server.run().catch(console.error);

module.exports = [SERVICE_NAME]Server;
