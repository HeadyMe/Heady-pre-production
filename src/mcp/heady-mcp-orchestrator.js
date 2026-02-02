const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3304;

app.use(cors());
app.use(bodyParser.json());

const clients = new Map();

// Helper to create MCP client
const createClient = async (name, scriptPath) => {
  const transport = new StdioClientTransport({
    command: 'node',
    args: [scriptPath],
  });

  const client = new Client(
    {
      name: `orchestrator-${name}`,
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  return client;
};

// Initialize clients
const initClients = async () => {
  try {
    clients.set('graph', await createClient('graph', path.join(__dirname, 'heady-graph-server.js')));
    clients.set('metrics', await createClient('metrics', path.join(__dirname, 'heady-metrics-server.js')));
    clients.set('workflow', await createClient('workflow', path.join(__dirname, 'heady-workflow-server.js')));
    console.log('MCP Clients initialized');
  } catch (error) {
    console.error('Failed to initialize MCP clients:', error);
  }
};

// List tools from a specific server
app.get('/tools/:server', async (req, res) => {
  const { server } = req.params;
  const client = clients.get(server);
  
  if (!client) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    const tools = await client.listTools();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Call a tool
app.post('/tools/:server', async (req, res) => {
  const { server } = req.params;
  const { name, args } = req.body;
  const client = clients.get(server);

  if (!client) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    const result = await client.callTool({
      name,
      arguments: args,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`MCP Orchestrator running on port ${PORT}`);
  await initClients();
});
