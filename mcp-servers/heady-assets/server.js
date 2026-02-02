#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const express = require('express');

const server = new Server({
  name: 'heady-assets',
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
                { name: 'list_assets', description: 'List available assets', inputSchema: { type: 'object', properties: { type: { type: 'string' } } } },
                { name: 'generate_sacred_pattern', description: 'Generate SVG pattern', inputSchema: { type: 'object', properties: { type: { type: 'string' } } } }
            ]
        };
    }
    if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        return {
            content: [{ type: 'text', text: `Assets tool ${name} executed` }]
        };
    }
    return null;
});

const app = express();
const PORT = process.env.PORT || 3304;

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'heady-assets' }));

app.listen(PORT, () => {
    console.error(`Heady Assets HTTP listening on port ${PORT}`);
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Heady Assets MCP running on stdio');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
