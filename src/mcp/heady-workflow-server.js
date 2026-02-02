const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { getQueue } = require('../utils/queue');
const { generateId } = require('../utils/shared-utils');

const server = new Server(
  {
    name: 'heady-workflow-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const workflows = new Map();
const workflowQueue = getQueue('workflow-execution');

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'workflow.create',
        description: 'Create a new workflow definition',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            steps: { type: 'array' },
          },
          required: ['name', 'steps'],
        },
      },
      {
        name: 'workflow.execute',
        description: 'Execute a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            params: { type: 'object' },
          },
          required: ['id'],
        },
      },
      {
        name: 'task.create',
        description: 'Create a standalone task',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            payload: { type: 'object' },
          },
          required: ['type', 'payload'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'workflow.create': {
      const id = generateId();
      const workflow = { id, ...args, createdAt: new Date().toISOString() };
      workflows.set(id, workflow);
      return {
        content: [{ type: 'text', text: JSON.stringify(workflow, null, 2) }],
      };
    }

    case 'workflow.execute': {
      const { id, params } = args;
      const workflow = workflows.get(id);
      if (!workflow) {
        throw new Error(`Workflow ${id} not found`);
      }
      
      const jobId = await workflowQueue.add({
        type: 'workflow',
        workflowId: id,
        params,
      });

      return {
        content: [{ type: 'text', text: `Workflow execution started. Job ID: ${jobId.id}` }],
      };
    }

    case 'task.create': {
      const jobId = await workflowQueue.add({
        type: 'task',
        ...args,
      });
      return {
        content: [{ type: 'text', text: `Task created. Job ID: ${jobId.id}` }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Heady Workflow Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error', error);
  process.exit(1);
});
