const MCP_SERVICES = {
  default: require('./services/default-mcp-service')
};

class MCPRouter {
  static async routeTask(task) {
    const service = MCP_SERVICES[task.context.component] || MCP_SERVICES.default;
    return service.handle(task);
  }
}

module.exports = MCPRouter;
