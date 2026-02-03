#!/usr/bin/env node
/**
 * HEADY INTELLIGENCE VERIFIER - EXTENDED OPERATIONS v1.0
 * Additional verification methods for live connections and operational processes
 * This extends the base verifier with comprehensive system checks
 */

const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Verify HeadyManager service is running and accessible
 */
async function verifyHeadyManager() {
  const ports = [3300, 3100];
  
  for (const port of ports) {
    try {
      const result = await checkHttpEndpoint(`http://localhost:${port}/api/health`, 3000);
      if (result.success) {
        return {
          passed: true,
          message: 'HeadyManager operational',
          data: {
            port,
            status: result.data?.status,
            uptime: result.data?.uptime
          }
        };
      }
    } catch (error) {
      // Try next port
    }
  }
  
  return {
    passed: false,
    message: 'HeadyManager not accessible',
    action: 'Start HeadyManager: npm start',
    data: { attempted_ports: ports }
  };
}

/**
 * Verify MCP servers are configured and accessible
 */
async function verifyMCPServers() {
  const mcpConfigPath = path.join(process.cwd(), 'mcp_config.json');
  
  if (!fs.existsSync(mcpConfigPath)) {
    return {
      passed: false,
      message: 'MCP configuration not found',
      action: 'Create mcp_config.json'
    };
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    const servers = config.mcpServers || {};
    const serverCount = Object.keys(servers).length;
    
    return {
      passed: serverCount > 0,
      message: serverCount > 0 ? 'MCP servers configured' : 'No MCP servers configured',
      data: {
        servers: serverCount,
        configured: Object.keys(servers)
      }
    };
  } catch (error) {
    return {
      passed: false,
      message: `MCP config error: ${error.message}`,
      action: 'Fix mcp_config.json syntax'
    };
  }
}

/**
 * Verify Orchestrator service
 */
async function verifyOrchestrator() {
  try {
    const result = await checkHttpEndpoint('http://localhost:3100/api/health', 2000);
    
    if (result.success) {
      return {
        passed: true,
        message: 'Orchestrator operational',
        data: result.data
      };
    }
  } catch (error) {
    // Orchestrator not running
  }
  
  return {
    passed: false,
    message: 'Orchestrator not running',
    action: 'Optional: Start orchestrator service',
    data: { optional: true }
  };
}

/**
 * Verify HeadySquashMerge system is ready
 */
async function verifySquashMergeReady() {
  const requiredFiles = [
    'src/heady_squash_merge.js',
    'scripts/heady-merge.ps1',
    'examples/merge-example-config.json'
  ];
  
  const missing = requiredFiles.filter(f => !fs.existsSync(path.join(process.cwd(), f)));
  
  if (missing.length > 0) {
    return {
      passed: false,
      message: 'SquashMerge system incomplete',
      action: `Missing: ${missing.join(', ')}`,
      data: { missing }
    };
  }
  
  return {
    passed: true,
    message: 'SquashMerge system ready',
    data: { files: requiredFiles.length }
  };
}

/**
 * Verify HeadyRegistry routing system
 */
async function verifyRoutingSystem() {
  const requiredFiles = [
    'src/heady_registry_router.js',
    'src/heady_ai_bridge.js'
  ];
  
  const missing = requiredFiles.filter(f => !fs.existsSync(path.join(process.cwd(), f)));
  
  if (missing.length > 0) {
    return {
      passed: false,
      message: 'Routing system incomplete',
      action: `Missing: ${missing.join(', ')}`,
      data: { missing }
    };
  }
  
  // Check registry has routing configuration
  const registryPath = path.join(process.cwd(), '.heady-memory/heady-registry.json');
  if (fs.existsSync(registryPath)) {
    try {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      if (!registry.routing) {
        return {
          passed: false,
          message: 'Registry missing routing configuration',
          action: 'Update registry with routing section'
        };
      }
    } catch (error) {
      // Registry parse error handled elsewhere
    }
  }
  
  return {
    passed: true,
    message: 'Routing system operational',
    data: { modules: requiredFiles.length }
  };
}

/**
 * Verify Governance system
 */
async function verifyGovernance() {
  const governanceFile = path.join(process.cwd(), 'src/governance_checkpoint.js');
  
  if (!fs.existsSync(governanceFile)) {
    return {
      passed: false,
      message: 'Governance module not found',
      action: 'Create governance_checkpoint.js'
    };
  }
  
  return {
    passed: true,
    message: 'Governance system present',
    data: { module: 'governance_checkpoint.js' }
  };
}

/**
 * Verify audit logging is functional
 */
async function verifyAuditLogging() {
  const auditDir = path.join(process.cwd(), 'audit_logs');
  
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
    return {
      passed: true,
      message: 'Audit directory created',
      data: { created: true }
    };
  }
  
  // Check if writable
  const testFile = path.join(auditDir, '.write_test');
  try {
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    
    const logFiles = fs.readdirSync(auditDir).filter(f => 
      f.endsWith('.jsonl') || f.endsWith('.json') || f.endsWith('.md')
    );
    
    return {
      passed: true,
      message: 'Audit logging operational',
      data: {
        writable: true,
        logFiles: logFiles.length
      }
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Audit directory not writable',
      action: 'Check permissions on audit_logs directory'
    };
  }
}

/**
 * Verify validation pipeline
 */
async function verifyValidationPipeline() {
  const validationsDir = path.join(process.cwd(), '.heady-memory/validations');
  
  if (!fs.existsSync(validationsDir)) {
    fs.mkdirSync(validationsDir, { recursive: true });
  }
  
  const validations = fs.readdirSync(validationsDir).filter(f => f.endsWith('.json'));
  
  return {
    passed: true,
    message: 'Validation pipeline accessible',
    data: {
      validations: validations.length,
      directory: validationsDir
    }
  };
}

/**
 * Verify file system access
 */
async function verifyFileSystemAccess() {
  const criticalDirs = [
    'src',
    'scripts',
    'docs',
    '.heady-memory',
    'audit_logs'
  ];
  
  const issues = [];
  
  for (const dir of criticalDirs) {
    const dirPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(dirPath)) {
      issues.push(`${dir} missing`);
      continue;
    }
    
    // Check read access
    try {
      fs.readdirSync(dirPath);
    } catch (error) {
      issues.push(`${dir} not readable`);
    }
    
    // Check write access
    const testFile = path.join(dirPath, '.write_test');
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (error) {
      issues.push(`${dir} not writable`);
    }
  }
  
  if (issues.length > 0) {
    return {
      passed: false,
      message: 'File system access issues',
      action: `Fix: ${issues.join(', ')}`,
      data: { issues }
    };
  }
  
  return {
    passed: true,
    message: 'File system access verified',
    data: { directories: criticalDirs.length }
  };
}

/**
 * Verify Git operations are available
 */
async function verifyGitOperations() {
  try {
    execSync('git --version', { encoding: 'utf8', stdio: 'pipe' });
    
    // Check if in a git repository
    try {
      const branch = execSync('git branch --show-current', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: process.cwd()
      }).trim();
      
      return {
        passed: true,
        message: 'Git operations available',
        data: {
          available: true,
          branch,
          repository: true
        }
      };
    } catch (error) {
      return {
        passed: true,
        message: 'Git available (not in repository)',
        data: {
          available: true,
          repository: false
        }
      };
    }
  } catch (error) {
    return {
      passed: false,
      message: 'Git not available',
      action: 'Install Git',
      data: { available: false }
    };
  }
}

/**
 * Check HTTP endpoint with timeout
 */
function checkHttpEndpoint(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            data: parsed
          });
        } catch {
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            data: null
          });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

module.exports = {
  verifyHeadyManager,
  verifyMCPServers,
  verifyOrchestrator,
  verifySquashMergeReady,
  verifyRoutingSystem,
  verifyGovernance,
  verifyAuditLogging,
  verifyValidationPipeline,
  verifyFileSystemAccess,
  verifyGitOperations,
  checkHttpEndpoint
};
