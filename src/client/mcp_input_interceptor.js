/**
 * HEADY MCP INPUT INTERCEPTOR
 * 
 * Ensures ALL inputs (API requests, file operations, commands) flow through
 * HeadyMCP services first for complete observability, validation, and governance.
 */

const EventEmitter = require('events');
const http = require('http');

class MCPInputInterceptor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      mcpGatewayUrl: config.mcpGatewayUrl || 'http://localhost:3301',
      enableGovernance: config.enableGovernance !== false,
      enableAudit: config.enableAudit !== false,
      enableHeadyMaid: config.enableHeadyMaid !== false,
      bypassPatterns: config.bypassPatterns || ['/api/health', '/api/pulse'],
      ...config
    };

    this.interceptedCount = 0;
    this.bypassedCount = 0;
    this.headyMaid = null;
  }

  /**
   * Express middleware to intercept all incoming requests
   */
  middleware() {
    return async (req, res, next) => {
      // Check if should bypass
      if (this.shouldBypass(req.path)) {
        this.bypassedCount++;
        return next();
      }

      this.interceptedCount++;
      
      // Log to HeadyMaid
      if (this.headyMaid) {
        this.headyMaid.emit('api-request', {
          method: req.method,
          path: req.path,
          body: req.body,
          headers: req.headers,
          timestamp: new Date().toISOString()
        });
      }

      // Route through MCP governance
      if (this.config.enableGovernance) {
        const governanceResult = await this.checkGovernance(req);
        if (!governanceResult.allowed) {
          return res.status(403).json({
            error: 'Governance check failed',
            reason: governanceResult.reason
          });
        }
      }

      // Audit logging
      if (this.config.enableAudit) {
        this.auditLog(req);
      }

      // Emit event for monitoring
      this.emit('request-intercepted', {
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
      });

      next();
    };
  }

  /**
   * Check if request should bypass MCP routing
   */
  shouldBypass(path) {
    return this.config.bypassPatterns.some(pattern => path.startsWith(pattern));
  }

  /**
   * Check governance rules via MCP
   */
  async checkGovernance(req) {
    try {
      // Check for destructive operations
      const isDestructive = this.isDestructiveOperation(req);
      
      if (isDestructive && !req.headers['x-heady-confirmed']) {
        return {
          allowed: false,
          reason: 'Destructive operation requires confirmation'
        };
      }

      return { allowed: true };
    } catch (err) {
      console.error('[INTERCEPTOR] Governance check error:', err);
      return { allowed: true }; // Fail open for availability
    }
  }

  /**
   * Check if operation is destructive
   */
  isDestructiveOperation(req) {
    const destructivePatterns = ['delete', 'remove', 'drop', 'truncate', 'destroy'];
    const path = req.path.toLowerCase();
    const body = JSON.stringify(req.body || {}).toLowerCase();
    
    return destructivePatterns.some(pattern => 
      path.includes(pattern) || body.includes(pattern)
    );
  }

  /**
   * Audit log operation
   */
  auditLog(req) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      authenticated: !!req.headers['x-heady-api-key']
    };

    this.emit('audit-log', logEntry);
  }

  /**
   * Integrate with HeadyMaid
   */
  integrateHeadyMaid(headyMaid) {
    this.headyMaid = headyMaid;
    console.log('[INTERCEPTOR] HeadyMaid integration enabled');
  }

  /**
   * Get interceptor statistics
   */
  getStats() {
    return {
      intercepted: this.interceptedCount,
      bypassed: this.bypassedCount,
      total: this.interceptedCount + this.bypassedCount,
      interceptionRate: this.interceptedCount / (this.interceptedCount + this.bypassedCount) || 0
    };
  }

  /**
   * Intercept file operations
   */
  async interceptFileOperation(operation, args) {
    this.emit('file-operation', { operation, args });

    // Route through MCP filesystem server
    try {
      const result = await this.callMCPTool('heady_' + operation, args);
      return result;
    } catch (err) {
      console.error(`[INTERCEPTOR] MCP routing failed for ${operation}:`, err);
      throw err;
    }
  }

  /**
   * Intercept command execution
   */
  async interceptCommand(command, options = {}) {
    this.emit('command-execution', { command, options });

    // Route through MCP
    try {
      const result = await this.callMCPTool('heady_run_command', {
        command,
        cwd: options.cwd,
        require_approval: !options.autoApprove
      });
      return result;
    } catch (err) {
      console.error('[INTERCEPTOR] MCP routing failed for command:', err);
      throw err;
    }
  }

  /**
   * Call MCP tool via gateway
   */
  async callMCPTool(tool, params) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: tool,
          arguments: params
        }
      });

      const options = {
        hostname: 'localhost',
        port: 3301,
        path: '/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (result.error) {
              reject(new Error(result.error.message));
            } else {
              resolve(result.result);
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

module.exports = MCPInputInterceptor;
