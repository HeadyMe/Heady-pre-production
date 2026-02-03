const TaskCollector = require('./task-collector');
const MCPRouter = require('./mcp-router');
const AuditLogger = require('./audit-logger');
const ErrorHandler = require('./error-handler');

class HeadyConductor {
  static async execute(task) {
    try {
      // Step 1: Add task to collector
      TaskCollector.addTask(task);
      
      // Step 2: Route through MCP system
      const result = await MCPRouter.routeTask(task);
      
      // Step 3: Update audit logs
      AuditLogger.log(task, result);
      
      return result;
    } catch (error) {
      ErrorHandler.handleConductorError(error, task);
      throw error;
    }
  }
}

module.exports = HeadyConductor;
