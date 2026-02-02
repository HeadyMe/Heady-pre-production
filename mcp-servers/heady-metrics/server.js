#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const express = require('express');

const server = new Server({
  name: 'heady-metrics',
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
                { name: 'record_metric', description: 'Record a metric value', inputSchema: { type: 'object', properties: { name: { type: 'string' }, value: { type: 'number' } } } },
                { name: 'get_metrics', description: 'Get metrics', inputSchema: { type: 'object', properties: { names: { type: 'array', items: { type: 'string' } } } } }
            ]
        };
    }
    if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        return {
            content: [{ type: 'text', text: `Metrics tool ${name} executed` }]
        };
    }
    return null;
});

const app = express();
const PORT = process.env.PORT || 3302;

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'heady-metrics' }));

app.listen(PORT, () => {
    console.error(`Heady Metrics HTTP listening on port ${PORT}`);
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Heady Metrics MCP running on stdio');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
