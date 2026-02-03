/**
 * HEADY CHECKPOINT STORY DRIVER
 * Generates comprehensive system status reports at each checkpoint
 * Tracks all services, MCP servers, infrastructure, and operational metrics
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');
const MasterReferenceGenerator = require('./master_reference_generator');

class CheckpointReporter {
  constructor(config = {}) {
    this.timestamp = new Date().toISOString();
    this.checkpointId = `checkpoint_${Date.now()}`;
    this.rootDir = config.rootDir || process.cwd();
    this.outputDir = config.outputDir || path.join(this.rootDir, 'audit_logs');
    this.reconData = {
      services: [],
      mcpServers: [],
      infrastructure: [],
      docker: [],
      processes: [],
      files: [],
      git: {},
      environment: {},
      health: {},
      metrics: {}
    };
  }

  /**
   * Main entry point - generates complete checkpoint report
   */
  async generateReport() {
    console.log(`[STORY DRIVER] Generating checkpoint report: ${this.checkpointId}`);
    
    await this.scanEnvironment();
    await this.scanDockerServices();
    await this.scanMCPServers();
    await this.scanFileSystem();
    await this.scanGitStatus();
    await this.scanProcesses();
    await this.checkHealthEndpoints();
    await this.collectMetrics();
    
    const markdown = this.buildMarkdownReport();
    await this.saveReport(markdown);
    
    await this.generateMasterReference();
    
    console.log(`[STORY DRIVER] Report saved: ${this.checkpointId}.md`);
    return markdown;
  }

  /**
   * Scan environment variables and configuration
   */
  async scanEnvironment() {
    console.log('[RECON] Scanning environment...');
    
    this.reconData.environment = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      envVars: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || '3300',
        HEADY_API_KEY: process.env.HEADY_API_KEY ? '✓ SET' : '✗ NOT SET',
        DATABASE_URL: process.env.DATABASE_URL ? '✓ SET' : '✗ NOT SET',
        HF_TOKEN: process.env.HF_TOKEN ? '✓ SET' : '✗ NOT SET',
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN ? '✓ SET' : '✗ NOT SET'
      }
    };

    // Load MCP config
    try {
      const mcpConfigPath = path.join(this.rootDir, 'mcp_config.json');
      const mcpConfig = JSON.parse(await fs.readFile(mcpConfigPath, 'utf8'));
      this.reconData.environment.mcpConfig = {
        serverCount: Object.keys(mcpConfig.mcpServers || {}).length,
        gatewayPort: mcpConfig.gateway?.port,
        governanceMode: mcpConfig.governance?.mode,
        governanceVersion: mcpConfig.governance?.version
      };
    } catch (err) {
      this.reconData.environment.mcpConfig = { error: err.message };
    }
  }

  /**
   * Scan Docker containers and services
   */
  async scanDockerServices() {
    console.log('[RECON] Scanning Docker services...');
    
    try {
      const psOutput = execSync('docker ps --format "{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}"', 
        { encoding: 'utf8', timeout: 5000 });
      
      const containers = psOutput.trim().split('\n').filter(Boolean).map(line => {
        const [id, name, status, ports] = line.split('|');
        return { id, name, status, ports };
      });
      
      this.reconData.docker = containers;
      
      // Get compose services
      try {
        const composeOutput = execSync('docker compose ps --format json', 
          { encoding: 'utf8', timeout: 5000, cwd: this.rootDir });
        this.reconData.composeServices = JSON.parse(`[${composeOutput.trim().split('\n').join(',')}]`);
      } catch (err) {
        this.reconData.composeServices = [];
      }
    } catch (err) {
      this.reconData.docker = { error: err.message };
    }
  }

  /**
   * Scan MCP server status
   */
  async scanMCPServers() {
    console.log('[RECON] Scanning MCP servers...');
    
    try {
      const mcpConfigPath = path.join(this.rootDir, 'mcp_config.json');
      const mcpConfig = JSON.parse(await fs.readFile(mcpConfigPath, 'utf8'));
      
      for (const [name, config] of Object.entries(mcpConfig.mcpServers || {})) {
        this.reconData.mcpServers.push({
          name,
          command: config.command,
          args: config.args,
          governance: config.governance || {},
          status: 'configured'
        });
      }
    } catch (err) {
      this.reconData.mcpServers = [{ error: err.message }];
    }
  }

  /**
   * Scan file system structure
   */
  async scanFileSystem() {
    console.log('[RECON] Scanning file system...');
    
    const criticalPaths = [
      'src',
      'public',
      'scripts',
      'mcp-servers',
      'backend',
      'frontend',
      'docs',
      '.heady-memory',
      'audit_logs'
    ];
    
    for (const dirName of criticalPaths) {
      const dirPath = path.join(this.rootDir, dirName);
      try {
        const stats = await fs.stat(dirPath);
        const files = await this.countFiles(dirPath);
        this.reconData.files.push({
          path: dirName,
          exists: true,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          fileCount: files.count,
          modified: stats.mtime
        });
      } catch (err) {
        this.reconData.files.push({
          path: dirName,
          exists: false,
          error: err.code
        });
      }
    }
  }

  /**
   * Count files recursively
   */
  async countFiles(dirPath, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return { count: 0 };
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      let count = 0;
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.heady-memory') continue;
        if (entry.name === 'node_modules') continue;
        
        if (entry.isFile()) {
          count++;
        } else if (entry.isDirectory()) {
          const subResult = await this.countFiles(
            path.join(dirPath, entry.name), 
            depth + 1, 
            maxDepth
          );
          count += subResult.count;
        }
      }
      
      return { count };
    } catch (err) {
      return { count: 0, error: err.message };
    }
  }

  /**
   * Scan Git repository status
   */
  async scanGitStatus() {
    console.log('[RECON] Scanning Git status...');
    
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', 
        { encoding: 'utf8', cwd: this.rootDir }).trim();
      const commit = execSync('git rev-parse HEAD', 
        { encoding: 'utf8', cwd: this.rootDir }).trim();
      const status = execSync('git status --porcelain', 
        { encoding: 'utf8', cwd: this.rootDir });
      const remotes = execSync('git remote -v', 
        { encoding: 'utf8', cwd: this.rootDir });
      
      const statusLines = status.trim().split('\n').filter(Boolean);
      
      this.reconData.git = {
        branch,
        commit: commit.substring(0, 8),
        fullCommit: commit,
        modified: statusLines.filter(l => l.startsWith(' M')).length,
        added: statusLines.filter(l => l.startsWith('A')).length,
        deleted: statusLines.filter(l => l.startsWith('D')).length,
        untracked: statusLines.filter(l => l.startsWith('??')).length,
        remotes: remotes.trim().split('\n').length / 2,
        clean: statusLines.length === 0
      };
    } catch (err) {
      this.reconData.git = { error: err.message };
    }
  }

  /**
   * Scan running processes
   */
  async scanProcesses() {
    console.log('[RECON] Scanning processes...');
    
    try {
      if (process.platform === 'win32') {
        const output = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', 
          { encoding: 'utf8', timeout: 5000 });
        const lines = output.split('\n').slice(1).filter(Boolean);
        this.reconData.processes = lines.map(line => {
          const parts = line.split(',').map(p => p.replace(/"/g, ''));
          return { name: parts[0], pid: parts[1], memory: parts[4] };
        });
      } else {
        const output = execSync('ps aux | grep node', 
          { encoding: 'utf8', timeout: 5000 });
        this.reconData.processes = output.split('\n').filter(l => !l.includes('grep')).length;
      }
    } catch (err) {
      this.reconData.processes = { error: err.message };
    }
  }

  /**
   * Check health endpoints
   */
  async checkHealthEndpoints() {
    console.log('[RECON] Checking health endpoints...');
    
    const endpoints = [
      { name: 'Heady Manager', url: 'http://localhost:3300/api/health' },
      { name: 'MCP Gateway', url: 'http://localhost:3301/health' },
      { name: 'Admin UI', url: 'http://localhost:3300/admin' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const result = await this.httpGet(endpoint.url, 2000);
        this.reconData.health[endpoint.name] = {
          status: 'healthy',
          statusCode: result.statusCode,
          responseTime: result.responseTime
        };
      } catch (err) {
        this.reconData.health[endpoint.name] = {
          status: 'unhealthy',
          error: err.message
        };
      }
    }
  }

  /**
   * HTTP GET helper with timeout
   */
  httpGet(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data,
            responseTime: Date.now() - start
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(timeout, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  }

  /**
   * Collect operational metrics
   */
  async collectMetrics() {
    console.log('[RECON] Collecting metrics...');
    
    // Check for audit logs
    try {
      const auditDir = path.join(this.rootDir, 'audit_logs');
      const files = await fs.readdir(auditDir);
      this.reconData.metrics.auditLogs = files.length;
    } catch (err) {
      this.reconData.metrics.auditLogs = 0;
    }
    
    // Check memory patterns
    try {
      const memoryDir = path.join(this.rootDir, '.heady-memory');
      const patterns = await fs.readdir(path.join(memoryDir, 'patterns'));
      const validations = await fs.readdir(path.join(memoryDir, 'validations'));
      this.reconData.metrics.memoryPatterns = patterns.length;
      this.reconData.metrics.validations = validations.length;
    } catch (err) {
      this.reconData.metrics.memoryPatterns = 0;
      this.reconData.metrics.validations = 0;
    }
  }

  /**
   * Build comprehensive markdown report
   */
  buildMarkdownReport() {
    const sections = [];
    
    // Header
    sections.push('# HEADY SYSTEM CHECKPOINT REPORT');
    sections.push(`**Checkpoint ID:** ${this.checkpointId}`);
    sections.push(`**Timestamp:** ${this.timestamp}`);
    sections.push('**Generated By:** Story Driver v1.0');
    sections.push('');
    sections.push('---');
    sections.push('');

    // Executive Summary
    sections.push('## 📊 EXECUTIVE SUMMARY');
    sections.push('');
    const dockerHealthy = Array.isArray(this.reconData.docker) ? this.reconData.docker.length : 0;
    const healthyServices = Object.values(this.reconData.health).filter(h => h.status === 'healthy').length;
    const totalServices = Object.keys(this.reconData.health).length;
    
    sections.push(`- **Docker Containers:** ${dockerHealthy} running`);
    sections.push(`- **Health Status:** ${healthyServices}/${totalServices} services healthy`);
    sections.push(`- **MCP Servers:** ${this.reconData.mcpServers.length} configured`);
    sections.push(`- **Git Status:** ${this.reconData.git.clean ? '✓ Clean' : '⚠ Modified'}`);
    sections.push(`- **Memory Patterns:** ${this.reconData.metrics.memoryPatterns || 0}`);
    sections.push(`- **Validations:** ${this.reconData.metrics.validations || 0}`);
    sections.push('');

    // Environment
    sections.push('## 🌍 ENVIRONMENT');
    sections.push('');
    sections.push('### System Information');
    sections.push(`- **Node Version:** ${this.reconData.environment.nodeVersion}`);
    sections.push(`- **Platform:** ${this.reconData.environment.platform}`);
    sections.push(`- **Architecture:** ${this.reconData.environment.arch}`);
    sections.push(`- **Working Directory:** \`${this.reconData.environment.cwd}\``);
    sections.push(`- **Uptime:** ${Math.floor(this.reconData.environment.uptime)}s`);
    sections.push('');
    
    sections.push('### Environment Variables');
    for (const [key, value] of Object.entries(this.reconData.environment.envVars)) {
      sections.push(`- **${key}:** ${value}`);
    }
    sections.push('');
    
    if (this.reconData.environment.mcpConfig) {
      sections.push('### MCP Configuration');
      sections.push(`- **Server Count:** ${this.reconData.environment.mcpConfig.serverCount || 0}`);
      sections.push(`- **Gateway Port:** ${this.reconData.environment.mcpConfig.gatewayPort || 'N/A'}`);
      sections.push(`- **Governance Mode:** ${this.reconData.environment.mcpConfig.governanceMode || 'N/A'}`);
      sections.push(`- **Governance Version:** ${this.reconData.environment.mcpConfig.governanceVersion || 'N/A'}`);
      sections.push('');
    }

    // Docker Services
    sections.push('## 🐳 DOCKER SERVICES');
    sections.push('');
    if (Array.isArray(this.reconData.docker)) {
      if (this.reconData.docker.length === 0) {
        sections.push('*No Docker containers running*');
      } else {
        sections.push('| Container ID | Name | Status | Ports |');
        sections.push('|--------------|------|--------|-------|');
        for (const container of this.reconData.docker) {
          sections.push(`| \`${container.id.substring(0, 12)}\` | ${container.name} | ${container.status} | ${container.ports || 'N/A'} |`);
        }
      }
    } else {
      sections.push(`*Error: ${this.reconData.docker.error}*`);
    }
    sections.push('');

    // MCP Servers
    sections.push('## 🔌 MCP SERVERS');
    sections.push('');
    if (this.reconData.mcpServers.length === 0) {
      sections.push('*No MCP servers configured*');
    } else {
      sections.push('| Server | Command | Governance |');
      sections.push('|--------|---------|------------|');
      for (const server of this.reconData.mcpServers) {
        const govRules = server.governance ? Object.keys(server.governance).length : 0;
        sections.push(`| **${server.name}** | \`${server.command}\` | ${govRules} rules |`);
      }
    }
    sections.push('');

    // Health Status
    sections.push('## 💚 HEALTH STATUS');
    sections.push('');
    sections.push('| Service | Status | Response Time |');
    sections.push('|---------|--------|---------------|');
    for (const [name, health] of Object.entries(this.reconData.health)) {
      const status = health.status === 'healthy' ? '✓ Healthy' : '✗ Unhealthy';
      const time = health.responseTime ? `${health.responseTime}ms` : 'N/A';
      sections.push(`| ${name} | ${status} | ${time} |`);
    }
    sections.push('');

    // Git Status
    sections.push('## 📦 GIT REPOSITORY');
    sections.push('');
    if (!this.reconData.git.error) {
      sections.push(`- **Branch:** \`${this.reconData.git.branch}\``);
      sections.push(`- **Commit:** \`${this.reconData.git.commit}\``);
      sections.push(`- **Status:** ${this.reconData.git.clean ? '✓ Clean' : '⚠ Modified'}`);
      sections.push(`- **Modified Files:** ${this.reconData.git.modified}`);
      sections.push(`- **Added Files:** ${this.reconData.git.added}`);
      sections.push(`- **Deleted Files:** ${this.reconData.git.deleted}`);
      sections.push(`- **Untracked Files:** ${this.reconData.git.untracked}`);
      sections.push(`- **Remotes:** ${this.reconData.git.remotes}`);
    } else {
      sections.push(`*Error: ${this.reconData.git.error}*`);
    }
    sections.push('');

    // File System
    sections.push('## 📁 FILE SYSTEM');
    sections.push('');
    sections.push('| Path | Status | Files | Last Modified |');
    sections.push('|------|--------|-------|---------------|');
    for (const file of this.reconData.files) {
      if (file.exists) {
        const modified = new Date(file.modified).toISOString().split('T')[0];
        sections.push(`| \`${file.path}\` | ✓ Exists | ${file.fileCount || 0} | ${modified} |`);
      } else {
        sections.push(`| \`${file.path}\` | ✗ Missing | - | - |`);
      }
    }
    sections.push('');

    // Processes
    sections.push('## ⚙️ PROCESSES');
    sections.push('');
    if (Array.isArray(this.reconData.processes)) {
      if (this.reconData.processes.length === 0) {
        sections.push('*No Node.js processes detected*');
      } else {
        sections.push('| Process | PID | Memory |');
        sections.push('|---------|-----|--------|');
        for (const proc of this.reconData.processes) {
          sections.push(`| ${proc.name} | ${proc.pid} | ${proc.memory} |`);
        }
      }
    } else {
      sections.push(`*${this.reconData.processes} Node.js processes running*`);
    }
    sections.push('');

    // Metrics
    sections.push('## 📈 METRICS');
    sections.push('');
    sections.push(`- **Audit Logs:** ${this.reconData.metrics.auditLogs || 0}`);
    sections.push(`- **Memory Patterns:** ${this.reconData.metrics.memoryPatterns || 0}`);
    sections.push(`- **Validations:** ${this.reconData.metrics.validations || 0}`);
    sections.push('');

    // Memory Usage
    sections.push('## 💾 MEMORY USAGE');
    sections.push('');
    const mem = this.reconData.environment.memoryUsage;
    sections.push(`- **RSS:** ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
    sections.push(`- **Heap Total:** ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    sections.push(`- **Heap Used:** ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    sections.push(`- **External:** ${(mem.external / 1024 / 1024).toFixed(2)} MB`);
    sections.push('');

    // Footer
    sections.push('---');
    sections.push('');
    sections.push('*Report generated by Heady Story Driver*');
    sections.push('*Next checkpoint scheduled based on governance rules*');
    
    return sections.join('\n');
  }

  /**
   * Save report to file
   */
  async saveReport(markdown) {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      const filename = `${this.checkpointId}.md`;
      const filepath = path.join(this.outputDir, filename);
      await fs.writeFile(filepath, markdown, 'utf8');
      
      const jsonPath = path.join(this.outputDir, `${this.checkpointId}.json`);
      await fs.writeFile(jsonPath, JSON.stringify(this.reconData, null, 2), 'utf8');
      
      console.log(`[STORY DRIVER] Saved markdown: ${filepath}`);
      console.log(`[STORY DRIVER] Saved JSON: ${jsonPath}`);
    } catch (err) {
      console.error('[STORY DRIVER] Error saving report:', err);
      throw err;
    }
  }

  async generateMasterReference() {
    console.log('[STORY DRIVER] Generating master reference document...');
    
    try {
      const generator = new MasterReferenceGenerator({
        rootDir: this.rootDir,
        reconData: this.reconData
      });
      
      const masterRef = await generator.generate();
      
      const masterRefPath = path.join(this.outputDir, 'MASTER_REFERENCE.md');
      await fs.writeFile(masterRefPath, masterRef, 'utf8');
      
      const timestampedPath = path.join(this.outputDir, `${this.checkpointId}_MASTER_REFERENCE.md`);
      await fs.writeFile(timestampedPath, masterRef, 'utf8');
      
      console.log(`[STORY DRIVER] Saved master reference: ${masterRefPath}`);
      console.log(`[STORY DRIVER] Saved timestamped copy: ${timestampedPath}`);
    } catch (err) {
      console.error('[STORY DRIVER] Error generating master reference:', err);
    }
  }
}

// CLI execution
if (require.main === module) {
  const reporter = new CheckpointReporter();
  reporter.generateReport()
    .then(() => {
      console.log('[STORY DRIVER] Checkpoint report complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('[STORY DRIVER] Error:', err);
      process.exit(1);
    });
}

module.exports = CheckpointReporter;
