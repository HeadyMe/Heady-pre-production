const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { main: logger } = require('../utils/logger');

const server = new Server(
  {
    name: 'heady-graph-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Graph state (in-memory for now)
const graph = {
  entities: new Map(),
  relationships: [],
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'entity.create',
        description: 'Create a new entity in the knowledge graph',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            name: { type: 'string' },
            properties: { type: 'object' },
          },
          required: ['type', 'name'],
        },
      },
      {
        name: 'relationship.create',
        description: 'Create a relationship between two entities',
        inputSchema: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
            type: { type: 'string' },
            properties: { type: 'object' },
          },
          required: ['from', 'to', 'type'],
        },
      },
      {
        name: 'graph.query',
        description: 'Query the knowledge graph',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'entity.create': {
        const id = `ent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const entity = { id, ...args, createdAt: new Date().toISOString() };
        graph.entities.set(id, entity);
        logger.info(`Created entity: ${entity.name} (${id})`);
        return {
          content: [{ type: 'text', text: JSON.stringify(entity, null, 2) }],
        };
      }

      case 'relationship.create': {
        const rel = { ...args, createdAt: new Date().toISOString() };
        graph.relationships.push(rel);
        logger.info(`Created relationship: ${rel.from} -> ${rel.type} -> ${rel.to}`);
        return {
          content: [{ type: 'text', text: JSON.stringify(rel, null, 2) }],
        };
      }

      case 'graph.query': {
        // Simple mock query for now
        const entities = Array.from(graph.entities.values());
        const result = {
          entityCount: entities.length,
          relationshipCount: graph.relationships.length,
          entities: entities.slice(0, 10), // Limit result
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error(`Error executing tool ${name}: ${error.message}`);
    throw error;
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Heady Graph Server running on stdio');
}

main().catch((error) => {
  logger.error('Fatal error in main loop', error);
  process.exit(1);
});
