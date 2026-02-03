/**
 * MCP ROUTING WRAPPER
 * 
 * Provides a unified interface for routing all operations through HeadyMCP services.
 * This ensures complete observability, governance, and tracking of all system operations.
 */

class MCPRoutingWrapper {
  constructor(mcpManager) {
    this.mcpManager = mcpManager;
    this.routingStats = {
      fileReads: 0,
      fileWrites: 0,
      commands: 0,
      gitOps: 0,
      bypassed: 0
    };
  }

  /**
   * Route file read operation through MCP
   */
  async readFile(filePath, options = {}) {
    this.routingStats.fileReads++;
    
    try {
      return await this.mcpManager.readFileMCP(filePath);
    } catch (err) {
      this.routingStats.bypassed++;
      throw err;
    }
  }

  /**
   * Route file write operation through MCP
   */
  async writeFile(filePath, content, options = {}) {
    this.routingStats.fileWrites++;
    
    try {
      await this.mcpManager.writeFileMCP(filePath, content);
    } catch (err) {
      this.routingStats.bypassed++;
      throw err;
    }
  }

  /**
   * Route command execution through MCP
   */
  async runCommand(command, options = {}) {
    this.routingStats.commands++;
    
    try {
      return await this.mcpManager.runCommandMCP(command, options);
    } catch (err) {
      this.routingStats.bypassed++;
      throw err;
    }
  }

  /**
   * Route Git operation through MCP
   */
  async gitOperation(operation, args = []) {
    this.routingStats.gitOps++;
    
    try {
      if (this.mcpManager.clients.has('heady-windsurf-router')) {
        const result = await this.mcpManager.callTool('heady-windsurf-router', 'heady_git_operation', {
          operation,
          args
        });
        const data = JSON.parse(result.content[0].text);
        return data.output;
      }
      
      // Fallback to git MCP server
      if (this.mcpManager.clients.has('git')) {
        const result = await this.mcpManager.callTool('git', operation, { args });
        return result.content[0].text;
      }
      
      throw new Error('No Git MCP server available');
    } catch (err) {
      this.routingStats.bypassed++;
      throw err;
    }
  }

  /**
   * Get HeadyMaid inventory through MCP
   */
  async getInventory(includeMetadata = true) {
    try {
      if (this.mcpManager.clients.has('heady-windsurf-router')) {
        const result = await this.mcpManager.callTool('heady-windsurf-router', 'heady_get_inventory', {
          include_metadata: includeMetadata
        });
        const data = JSON.parse(result.content[0].text);
        return data.inventory;
      }
      
      // Fallback to direct HeadyMaid access
      if (this.mcpManager.headyMaidInstance) {
        return this.mcpManager.headyMaidInstance.getInventory();
      }
      
      return null;
    } catch (err) {
      console.error('[MCP WRAPPER] Failed to get inventory:', err.message);
      return null;
    }
  }

  /**
   * Get optimization opportunities from HeadyMaid
   */
  async getOpportunities(category = null) {
    try {
      if (this.mcpManager.clients.has('heady-windsurf-router')) {
        const result = await this.mcpManager.callTool('heady-windsurf-router', 'heady_get_opportunities', {
          category
        });
        const data = JSON.parse(result.content[0].text);
        return data.opportunities;
      }
      
      return null;
    } catch (err) {
      console.error('[MCP WRAPPER] Failed to get opportunities:', err.message);
      return null;
    }
  }

  /**
   * Get routing statistics
   */
  getStats() {
    const total = this.routingStats.fileReads + 
                  this.routingStats.fileWrites + 
                  this.routingStats.commands + 
                  this.routingStats.gitOps;
    
    return {
      ...this.routingStats,
      total,
      routingRate: total > 0 ? ((total - this.routingStats.bypassed) / total) * 100 : 0
    };
  }

  /**
   * Verify MCP routing is active
   */
  isRoutingActive() {
    return this.mcpManager.clients.has('heady-windsurf-router') || 
           this.mcpManager.clients.has('filesystem');
  }
}

module.exports = MCPRoutingWrapper;
