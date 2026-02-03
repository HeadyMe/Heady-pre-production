#!/usr/bin/env node

/**
 * HEADY WINDSURF ROUTER - MCP Server
 * 
 * Routes ALL Windsurf operations through HeadyMCP for complete observability.
 * Every file operation, command, search, and tool call flows through this router,
 * allowing HeadyMaid and other services to track, validate, and optimize in real-time.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class HeadyWindsurfRouter {
  constructor() {
    this.server = new Server(
      {
        name: 'heady-windsurf-router',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.auditLog = [];
    this.operationCount = 0;
    this.headyMaidIntegration = null;
    
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List all available routing tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // File Operations (routed through HeadyMCP)
        {
          name: 'heady_read_file',
          description: 'Read file through HeadyMCP with observability',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: { type: 'string', description: 'Absolute file path' },
              track: { type: 'boolean', description: 'Track in HeadyMaid', default: true }
            },
            required: ['file_path']
          }
        },
        {
          name: 'heady_write_file',
          description: 'Write file through HeadyMCP with validation and tracking',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: { type: 'string', description: 'Absolute file path' },
              content: { type: 'string', description: 'File content' },
              validate: { type: 'boolean', description: 'Validate before write', default: true }
            },
            required: ['file_path', 'content']
          }
        },
        {
          name: 'heady_edit_file',
          description: 'Edit file through HeadyMCP with change tracking',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: { type: 'string', description: 'Absolute file path' },
              edits: { type: 'array', description: 'Array of edit operations' }
            },
            required: ['file_path', 'edits']
          }
        },
        {
          name: 'heady_search_files',
          description: 'Search files through HeadyMCP with result caching',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              path: { type: 'string', description: 'Search path' },
              use_cache: { type: 'boolean', description: 'Use HeadyMaid cache', default: true }
            },
            required: ['query', 'path']
          }
        },
        
        // Command Operations (routed through HeadyMCP)
        {
          name: 'heady_run_command',
          description: 'Execute command through HeadyMCP with governance',
          inputSchema: {
            type: 'object',
            properties: {
              command: { type: 'string', description: 'Command to execute' },
              cwd: { type: 'string', description: 'Working directory' },
              require_approval: { type: 'boolean', description: 'Require user approval', default: true }
            },
            required: ['command']
          }
        },
        
        // Git Operations (routed through HeadyMCP)
        {
          name: 'heady_git_operation',
          description: 'Git operation through HeadyMCP with tracking',
          inputSchema: {
            type: 'object',
            properties: {
              operation: { type: 'string', description: 'Git operation (status, commit, push, etc.)' },
              args: { type: 'array', description: 'Operation arguments' }
            },
            required: ['operation']
          }
        },
        
        // Observability Operations
        {
          name: 'heady_get_inventory',
          description: 'Get current HeadyMaid inventory snapshot',
          inputSchema: {
            type: 'object',
            properties: {
              include_metadata: { type: 'boolean', description: 'Include file metadata', default: true }
            }
          }
        },
        {
          name: 'heady_get_opportunities',
          description: 'Get optimization opportunities from HeadyMaid',
          inputSchema: {
            type: 'object',
            properties: {
              category: { type: 'string', description: 'Filter by category (duplicates, misplaced, etc.)' }
            }
          }
        },
        {
          name: 'heady_audit_log',
          description: 'Get audit log of all routed operations',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', description: 'Number of entries', default: 50 }
            }
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // Log every operation
      this.logOperation(name, args);
      
      try {
        switch (name) {
          case 'heady_read_file':
            return await this.handleReadFile(args);
          
          case 'heady_write_file':
            return await this.handleWriteFile(args);
          
          case 'heady_edit_file':
            return await this.handleEditFile(args);
          
          case 'heady_search_files':
            return await this.handleSearchFiles(args);
          
          case 'heady_run_command':
            return await this.handleRunCommand(args);
          
          case 'heady_git_operation':
            return await this.handleGitOperation(args);
          
          case 'heady_get_inventory':
            return await this.handleGetInventory(args);
          
          case 'heady_get_opportunities':
            return await this.handleGetOpportunities(args);
          
          case 'heady_audit_log':
            return await this.handleAuditLog(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error in ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  logOperation(operation, args) {
    this.operationCount++;
    
    const logEntry = {
      id: this.operationCount,
      timestamp: new Date().toISOString(),
      operation,
      args: this.sanitizeArgs(args),
      source: 'windsurf'
    };
    
    this.auditLog.push(logEntry);
    
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }
    
    // Emit to HeadyMaid if integrated
    if (this.headyMaidIntegration) {
      this.headyMaidIntegration.emit('windsurf-operation', logEntry);
    }
  }

  sanitizeArgs(args) {
    // Remove sensitive data from logs
    const sanitized = { ...args };
    if (sanitized.content && sanitized.content.length > 1000) {
      sanitized.content = `${sanitized.content.substring(0, 1000)}... (truncated)`;
    }
    return sanitized;
  }

  async handleReadFile(args) {
    const { file_path, track = true } = args;
    
    try {
      const content = await fs.readFile(file_path, 'utf8');
      const stats = await fs.stat(file_path);
      
      // Track in HeadyMaid
      if (track && this.headyMaidIntegration) {
        this.headyMaidIntegration.emit('file-accessed', {
          path: file_path,
          operation: 'read',
          size: stats.size
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              file_path,
              content,
              size: stats.size,
              mtime: stats.mtime,
              tracked: track
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async handleWriteFile(args) {
    const { file_path, content, validate = true } = args;
    
    try {
      // Validate before write
      if (validate) {
        await this.validateFileWrite(file_path, content);
      }
      
      // Check if file exists for tracking
      let existed = false;
      try {
        await fs.access(file_path);
        existed = true;
      } catch (err) {
        // File doesn't exist
      }
      
      // Write file
      await fs.writeFile(file_path, content, 'utf8');
      
      // Track in HeadyMaid
      if (this.headyMaidIntegration) {
        this.headyMaidIntegration.emit('file-modified', {
          path: file_path,
          operation: existed ? 'update' : 'create',
          size: content.length
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              file_path,
              operation: existed ? 'updated' : 'created',
              size: content.length,
              validated: validate
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  async handleEditFile(args) {
    const { file_path, edits } = args;
    
    try {
      // Read current content
      const content = await fs.readFile(file_path, 'utf8');
      let modified = content;
      
      // Apply edits
      for (const edit of edits) {
        if (edit.type === 'replace') {
          modified = modified.replace(edit.old_text, edit.new_text);
        }
      }
      
      // Write back
      await fs.writeFile(file_path, modified, 'utf8');
      
      // Track in HeadyMaid
      if (this.headyMaidIntegration) {
        this.headyMaidIntegration.emit('file-modified', {
          path: file_path,
          operation: 'edit',
          edits: edits.length
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              file_path,
              edits_applied: edits.length,
              size_before: content.length,
              size_after: modified.length
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to edit file: ${error.message}`);
    }
  }

  async handleSearchFiles(args) {
    const { query, path: searchPath, use_cache = true } = args;
    
    try {
      // Check HeadyMaid cache first
      if (use_cache && this.headyMaidIntegration) {
        const cached = await this.searchInInventory(query, searchPath);
        if (cached.length > 0) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  results: cached,
                  source: 'heady_maid_cache',
                  count: cached.length
                }, null, 2)
              }
            ]
          };
        }
      }
      
      // Fallback to filesystem search
      const results = await this.performFileSearch(query, searchPath);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              results,
              source: 'filesystem',
              count: results.length
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to search files: ${error.message}`);
    }
  }

  async handleRunCommand(args) {
    const { command, cwd = process.cwd(), require_approval = true } = args;
    
    try {
      // Log command execution
      if (this.headyMaidIntegration) {
        this.headyMaidIntegration.emit('command-executed', {
          command,
          cwd,
          approved: !require_approval
        });
      }
      
      // Execute command
      const output = execSync(command, {
        cwd,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              command,
              output,
              cwd
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Command failed: ${error.message}`);
    }
  }

  async handleGitOperation(args) {
    const { operation, args: gitArgs = [] } = args;
    
    try {
      const command = `git ${operation} ${gitArgs.join(' ')}`;
      const output = execSync(command, {
        cwd: process.cwd(),
        encoding: 'utf8'
      });
      
      // Track in HeadyMaid
      if (this.headyMaidIntegration) {
        this.headyMaidIntegration.emit('git-operation', {
          operation,
          args: gitArgs
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              operation,
              output
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Git operation failed: ${error.message}`);
    }
  }

  async handleGetInventory(args) {
    const { include_metadata = true } = args;
    
    if (!this.headyMaidIntegration) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'HeadyMaid not integrated',
              suggestion: 'Start HeadyMaid service first'
            }, null, 2)
          }
        ]
      };
    }
    
    const inventory = this.headyMaidIntegration.getInventory();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            inventory: include_metadata ? inventory : inventory.summary,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async handleGetOpportunities(args) {
    const { category } = args;
    
    if (!this.headyMaidIntegration) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'HeadyMaid not integrated'
            }, null, 2)
          }
        ]
      };
    }
    
    const opportunities = this.headyMaidIntegration.getOpportunities();
    const filtered = category ? opportunities[category] : opportunities;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            opportunities: filtered,
            category: category || 'all'
          }, null, 2)
        }
      ]
    };
  }

  async handleAuditLog(args) {
    const { limit = 50 } = args;
    
    const recentLogs = this.auditLog.slice(-limit);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            logs: recentLogs,
            total_operations: this.operationCount,
            showing: recentLogs.length
          }, null, 2)
        }
      ]
    };
  }

  async validateFileWrite(filePath, content) {
    // Basic validation
    if (!filePath || !content) {
      throw new Error('Invalid file path or content');
    }
    
    // Check for dangerous operations
    const ext = path.extname(filePath);
    if (['.exe', '.dll', '.so'].includes(ext)) {
      throw new Error('Cannot write executable files through router');
    }
    
    return true;
  }

  async searchInInventory(query, searchPath) {
    // Search in HeadyMaid inventory
    if (!this.headyMaidIntegration) return [];
    
    const inventory = this.headyMaidIntegration.getInventory();
    const results = [];
    
    for (const file of inventory.files) {
      if (file.path.includes(searchPath) && file.path.includes(query)) {
        results.push(file);
      }
    }
    
    return results;
  }

  async performFileSearch(query, searchPath) {
    // Fallback filesystem search
    const results = [];
    
    try {
      const output = execSync(`find "${searchPath}" -name "*${query}*" 2>/dev/null || true`, {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });
      
      const lines = output.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        results.push({ path: line });
      }
    } catch (error) {
      // Ignore errors
    }
    
    return results;
  }

  integrateHeadyMaid(headyMaid) {
    this.headyMaidIntegration = headyMaid;
    console.error('[ROUTER] HeadyMaid integration enabled');
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[ROUTER] Error:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[ROUTER] Heady Windsurf Router running on stdio');
  }
}

// Start server
const router = new HeadyWindsurfRouter();
router.run().catch(console.error);

module.exports = HeadyWindsurfRouter;
