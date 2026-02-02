#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const express = require('express');

const server = new Server({
  name: 'heady-workflow',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler((request) => {
    if (request.method === 'tools/list') {
        return {
            tools: [
                { name: 'create_workflow', description: 'Create a new workflow', inputSchema: { type: 'object', properties: { definition: { type: 'object' } } } },
                { name: 'execute_workflow', description: 'Execute a workflow', inputSchema: { type: 'object', properties: { id: { type: 'string' } } } }
            ]
        };
    }
    if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        return {
            content: [{ type: 'text', text: `Workflow tool ${name} executed` }]
        };
    }
    return null;
});

const app = express();
const PORT = process.env.PORT || 3303;

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'heady-workflow' }));

app.listen(PORT, () => {
    console.error(`Heady Workflow HTTP listening on port ${PORT}`);
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Heady Workflow MCP running on stdio');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
