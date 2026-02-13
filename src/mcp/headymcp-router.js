/**
 * HeadyMCP Protocol Router
 * Handles all requests for headymcp.com domain
 */

const express = require('express');
const router = express.Router();

function getConnectorRegistry(req) {
  return req?.app?.locals?.connectorRegistry || null;
}

// MCP Status endpoint
router.get('/api/mcp/status', (req, res) => {
  const registry = getConnectorRegistry(req);
  if (registry) {
    const connectors = registry.listConnectors(req.query || {});
    return res.json({
      servers: connectors.length,
      active: connectors.filter((c) => c.status === 'active').length,
      dashboard: registry.getDashboard(),
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    status: 'active',
    version: '2.0.0',
    protocol: 'MCP/1.1',
    servers: 0,
    active: 0,
    dashboard: {
      summary: {
        total: 0,
        active: 0,
        healthy: 0,
        degraded: 0,
        unhealthy: 0,
        totalInvocations: 0,
      },
      connectors: [],
      recentInvocations: [],
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

router.get('/api/mcp/servers', (req, res) => {
  const registry = getConnectorRegistry(req);
  if (!registry) {
    return res.json({ servers: [], total: 0 });
  }

  const servers = registry.listConnectors(req.query || {}).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    status: c.status || 'active',
    capabilitiesCount: c.capabilities || 0,
  }));

  res.json({ servers, total: servers.length });
});

router.post('/api/mcp/tool', async (req, res) => {
  const { server, tool, arguments: args } = req.body || {};
  if (!server || !tool) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_REQUEST',
      message: 'Both server and tool are required',
    });
  }

  const registry = getConnectorRegistry(req);
  if (!registry) {
    return res.status(503).json({
      success: false,
      error: 'MCP_REGISTRY_UNAVAILABLE',
      message: 'Connector registry is not initialized',
    });
  }

  const connector = registry.getConnector(server);
  if (!connector) {
    return res.status(404).json({
      success: false,
      error: 'CONNECTOR_NOT_FOUND',
      message: `Resource not found: server:${server}`,
    });
  }

  const result = await registry.invokeCapability(
    server,
    tool,
    args || {},
    { traceId: req.headers['x-heady-trace-id'] || null }
  );

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Root endpoint for headymcp.com
router.get('/', (req, res) => {
  const host = req.get('host') || '';
  if (host.includes('headymcp.com')) {
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      name: "Heady MCP Protocol Server",
      version: "2.0.0",
      status: "active",
      endpoints: [
        "/api/mcp/status",
        "/api/mcp/servers",
        "/api/mcp/tool"
      ],
      documentation: "https://headyio.com/docs/mcp"
    });
  }
  res.status(404).send('Not found');
});

module.exports = router;
