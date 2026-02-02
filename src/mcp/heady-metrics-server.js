const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { register, performHealthCheck } = require('../utils/monitoring');
const { generateId, sleep } = require('../utils/shared-utils');

const server = new Server(
  {
    name: 'heady-metrics-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Metrics storage
const metricsStore = new Map();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'metrics.record',
        description: 'Record a metric value',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            value: { type: 'number' },
            tags: { type: 'object' },
          },
          required: ['name', 'value'],
        },
      },
      {
        name: 'metrics.current',
        description: 'Get current system metrics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'metrics.health',
        description: 'Get system health status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'metrics.record': {
      const { name: metricName, value, tags = {} } = args;
      const metric = {
        id: generateId(),
        name: metricName,
        value,
        tags,
        timestamp: Date.now(),
      };
      
      if (!metricsStore.has(metricName)) {
        metricsStore.set(metricName, []);
      }
      metricsStore.get(metricName).push(metric);
      
      return {
        content: [{ type: 'text', text: `Recorded metric ${metricName}: ${value}` }],
      };
    }

    case 'metrics.current': {
      const summary = {};
      for (const [key, values] of metricsStore.entries()) {
        const lastValue = values[values.length - 1];
        summary[key] = lastValue ? lastValue.value : null;
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
      };
    }

    case 'metrics.health': {
      const health = await performHealthCheck();
      return {
        content: [{ type: 'text', text: JSON.stringify(health, null, 2) }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Heady Metrics Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error', error);
  process.exit(1);
});
