// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
// ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
// ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
// ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
// ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
// ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
// ║                                                                  ║
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
// ║  FILE: mcp-servers/render-mcp-server.js                           ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

#!/usr/bin/env node
/**
 * Render MCP Server - Direct API Integration
 * Provides deployment and service management via Render API
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const RENDER_API_BASE = 'https://api.render.com/v1';

class RenderMCPServer {
  constructor() {
    this.apiKey = process.env.RENDER_API_KEY;
    this.server = new Server(
      {
        name: 'render-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'render_list_services',
          description: 'List all Render services for the authenticated account',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of services to return',
                default: 20
              }
            }
          }
        },
        {
          name: 'render_deploy_service',
          description: 'Trigger a deploy for a specific Render service',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: {
                type: 'string',
                description: 'The Render service ID'
              },
              clearCache: {
                type: 'boolean',
                description: 'Clear build cache before deploying',
                default: false
              }
            },
            required: ['serviceId']
          }
        },
        {
          name: 'render_get_service',
          description: 'Get details for a specific Render service',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: {
                type: 'string',
                description: 'The Render service ID'
              }
            },
            required: ['serviceId']
          }
        },
        {
          name: 'render_deploy_latest_commit',
          description: 'Deploy the latest commit for a service by name',
          inputSchema: {
            type: 'object',
            properties: {
              serviceName: {
                type: 'string',
                description: 'Name of the Render service (e.g., heady-manager-headyme)'
              }
            },
            required: ['serviceName']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'render_list_services':
            return await this.listServices(args?.limit || 20);
          case 'render_deploy_service':
            return await this.deployService(args.serviceId, args.clearCache);
          case 'render_get_service':
            return await this.getService(args.serviceId);
          case 'render_deploy_latest_commit':
            return await this.deployLatestCommit(args.serviceName);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    });
  }

  async makeRequest(endpoint, options = {}) {
    if (!this.apiKey) {
      throw new Error('RENDER_API_KEY environment variable not set');
    }

    const url = `${RENDER_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async listServices(limit = 20) {
    const data = await this.makeRequest(`/services?limit=${limit}`);
    const services = data.map(s => ({
      id: s.service.id,
      name: s.service.name,
      type: s.service.type,
      status: s.service.serviceDetails?.suspenders?.status || 'unknown'
    }));

    return {
      content: [{
        type: 'text',
        text: `Found ${services.length} services:\n${JSON.stringify(services, null, 2)}`
      }]
    };
  }

  async deployService(serviceId, clearCache = false) {
    const deployData = { clearCache };
    const data = await this.makeRequest(`/services/${serviceId}/deploys`, {
      method: 'POST',
      body: JSON.stringify(deployData)
    });

    return {
      content: [{
        type: 'text',
        text: `Deploy triggered for service ${serviceId}:\n${JSON.stringify(data, null, 2)}`
      }]
    };
  }

  async getService(serviceId) {
    const data = await this.makeRequest(`/services/${serviceId}`);
    
    return {
      content: [{
        type: 'text',
        text: `Service details:\n${JSON.stringify(data, null, 2)}`
      }]
    };
  }

  async deployLatestCommit(serviceName) {
    // First find the service by name
    const services = await this.makeRequest('/services?limit=50');
    const service = services.find(s => s.service.name === serviceName);
    
    if (!service) {
      throw new Error(`Service "${serviceName}" not found`);
    }

    // Trigger deploy
    const deployData = { clearCache: false };
    const data = await this.makeRequest(`/services/${service.service.id}/deploys`, {
      method: 'POST',
      body: JSON.stringify(deployData)
    });

    return {
      content: [{
        type: 'text',
        text: `Deploy triggered for "${serviceName}" (ID: ${service.service.id}):\n${JSON.stringify(data, null, 2)}`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Render MCP Server running on stdio');
  }
}

const server = new RenderMCPServer();
server.run().catch(console.error);
