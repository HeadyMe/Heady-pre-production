#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const express = require('express');

// MCP Server Setup
const server = new Server({
  name: 'heady-graph',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler((request) => {
    // Handle list_tools
    if (request.method === 'tools/list') {
        return {
            tools: [
                { name: 'get_subgraph', description: 'Get subgraph for a workspace', inputSchema: { type: 'object', properties: { workspaceId: { type: 'string' } } } },
                { name: 'find_tasks', description: 'Find tasks by status', inputSchema: { type: 'object', properties: { status: { type: 'string' } } } },
                { name: 'add_entity', description: 'Add new entity', inputSchema: { type: 'object', properties: { type: { type: 'string' }, name: { type: 'string' } } } }
            ]
        };
    }
    // Handle call_tool
    if (request.method === 'tools/call') {
        const { name, arguments: args } = request.params;
        return {
            content: [{ type: 'text', text: `Graph tool ${name} called with ${JSON.stringify(args)}` }]
        };
    }
    return null; // Let SDK handle default or error
});

// HTTP Transport for Health Checks (Hybrid approach)
const app = express();
const PORT = process.env.PORT || 3301;

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'heady-graph' }));

// Start HTTP
app.listen(PORT, () => {
    console.error(`Heady Graph HTTP listening on port ${PORT}`);
});

// Start MCP Stdio
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Heady Graph MCP running on stdio');
}

main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
