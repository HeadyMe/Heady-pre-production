/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              HEADY MAID - Data Observability                 ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📁 FILES          🔍 SCAN          📊 ANALYZE          ✨ OPTIMIZE
 *        │                │                  │                  │
 *        ▼                ▼                  ▼                  ▼
 *    ┌────────┐      ┌────────┐      ┌──────────┐      ┌──────────┐
 *    │ Watch  │─────▶│Checksum│─────▶│ Detect   │─────▶│  Emit    │
 *    │ Dirs   │      │& Index │      │Issues    │      │  Tasks   │
 *    └────────┘      └────────┘      └──────────┘      └──────────┘
 *        │                │                  │                  │
 *        └────────────────┴──────────────────┴──────────────────┘
 *                              │
 *                              ▼
 *                    ┌──────────────────┐
 *                    │  TASK ROUTING    │
 *                    │  RoutingOptimizer│
 *                    └──────────────────┘
 * 
 * Core Responsibilities:
 * - Real-time inventory of all files, data, and configurations
 * - Continuous validation of data placement and integrity
 * - Detection of optimization opportunities (duplicates, misplaced, outdated)
 * - Integration guidance across local and remote sources
 * - Automated data quality monitoring
 * - System-wide observability reporting
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

class HeadyMaid extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      scanInterval: config.scanInterval || 30000, // 30 seconds default
      deepScanInterval: config.deepScanInterval || 300000, // 5 minutes
      maxConcurrentScans: config.maxConcurrentScans || 3,
      enableRealtime: config.enableRealtime !== false,
      rootDirs: config.rootDirs || [process.cwd()],
      excludePatterns: config.excludePatterns || [
        'node_modules',
        '.git',
        '.venv',
        '__pycache__',
        'dist',
        'build',
        '.next'
      ],
      inventoryPath: config.inventoryPath || path.join(process.cwd(), '.heady-memory', 'inventory'),
      ...config
    };

    // Data inventory tracking
    this.inventory = {
      files: new Map(),
      directories: new Map(),
      checksums: new Map(),
      metadata: new Map(),
      lastScan: null,
      totalBytes: 0,
      totalFiles: 0,
      totalDirectories: 0
    };

    // Optimization opportunities
    this.opportunities = {
      duplicates: [],
      misplaced: [],
      outdated: [],
      fragmented: [],
      unoptimized: []
    };

    // Real-time monitoring
    this.watchers = new Map();
    this.scanQueue = [];
    this.isScanning = false;
    this.activeScanners = 0;

    // Performance metrics
    this.metrics = {
      scansCompleted: 0,
      bytesScanned: 0,
      issuesDetected: 0,
      optimizationsApplied: 0,
      averageScanTime: 0,
      lastScanDuration: 0
    };

    // System awareness flags
    this.systemAware = {
      mcp: false,
      docker: false,
      git: false,
      database: false,
      remote: false
    };
  }

  /**
   * Initialize HeadyMaid service
   */
  async initialize() {
    console.log('[HEADY MAID] Initializing complete data observability...');
    
    await this.ensureInventoryDirectory();
    await this.loadInventory();
    await this.detectSystemCapabilities();
    
    // Emit initialization complete event for task routing
    this.emit('initialized', {
      inventory: this.getInventorySummary(),
      capabilities: this.systemAware
    });
    
    if (this.config.enableRealtime) {
      await this.startRealtimeMonitoring();
    }
    
    this.startPeriodicScanning();
    
    console.log('[HEADY MAID] Initialized and ready');
    this.emit('initialized', { inventory: this.inventory, metrics: this.metrics });
  }

  /**
   * Ensure inventory directory exists
   */
  async ensureInventoryDirectory() {
    try {
      await fs.mkdir(this.config.inventoryPath, { recursive: true });
    } catch (err) {
      console.error('[HEADY MAID] Error creating inventory directory:', err);
    }
  }

  /**
   * Load existing inventory from disk
   */
  async loadInventory() {
    try {
      const inventoryFile = path.join(this.config.inventoryPath, 'inventory.json');
      const data = await fs.readFile(inventoryFile, 'utf8');
      const loaded = JSON.parse(data);
      
      // Restore Maps from JSON
      this.inventory.files = new Map(loaded.files || []);
      this.inventory.directories = new Map(loaded.directories || []);
      this.inventory.checksums = new Map(loaded.checksums || []);
      this.inventory.metadata = new Map(loaded.metadata || []);
      this.inventory.lastScan = loaded.lastScan;
      this.inventory.totalBytes = loaded.totalBytes || 0;
      this.inventory.totalFiles = loaded.totalFiles || 0;
      this.inventory.totalDirectories = loaded.totalDirectories || 0;
      
      console.log(`[HEADY MAID] Loaded inventory: ${this.inventory.totalFiles} files, ${this.inventory.totalDirectories} directories`);
    } catch (err) {
      console.log('[HEADY MAID] No existing inventory found, starting fresh');
    }
  }

  /**
   * Save inventory to disk
   */
  async saveInventory() {
    try {
      const inventoryFile = path.join(this.config.inventoryPath, 'inventory.json');
      
      const data = {
        files: Array.from(this.inventory.files.entries()),
        directories: Array.from(this.inventory.directories.entries()),
        checksums: Array.from(this.inventory.checksums.entries()),
        metadata: Array.from(this.inventory.metadata.entries()),
        lastScan: this.inventory.lastScan,
        totalBytes: this.inventory.totalBytes,
        totalFiles: this.inventory.totalFiles,
        totalDirectories: this.inventory.totalDirectories
      };
      
      await fs.writeFile(inventoryFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[HEADY MAID] Error saving inventory:', err);
    }
  }

  /**
   * Detect system capabilities
   */
  async detectSystemCapabilities() {
    // Check for MCP servers
    try {
      const mcpConfig = path.join(process.cwd(), 'mcp_config.json');
      await fs.access(mcpConfig);
      this.systemAware.mcp = true;
    } catch (err) {
      this.systemAware.mcp = false;
    }

    // Check for Docker
    try {
      const { execSync } = require('child_process');
      execSync('docker --version', { stdio: 'ignore' });
      this.systemAware.docker = true;
    } catch (err) {
      this.systemAware.docker = false;
    }

    // Check for Git
    try {
      const { execSync } = require('child_process');
      execSync('git --version', { stdio: 'ignore' });
      this.systemAware.git = true;
    } catch (err) {
      this.systemAware.git = false;
    }

    console.log('[HEADY MAID] System capabilities:', this.systemAware);
  }

  /**
   * Start periodic scanning
   */
  startPeriodicScanning() {
    // Quick scan interval
    setInterval(async () => {
      if (!this.isScanning) {
        await this.performQuickScan();
      }
    }, this.config.scanInterval);

    // Deep scan interval
    setInterval(async () => {
      if (!this.isScanning) {
        await this.performDeepScan();
      }
    }, this.config.deepScanInterval);

    console.log('[HEADY MAID] Periodic scanning started');
  }

  /**
   * Start real-time monitoring with file watchers
   */
  async startRealtimeMonitoring() {
    for (const rootDir of this.config.rootDirs) {
      try {
        const watcher = fs.watch(rootDir, { recursive: true }, (eventType, filename) => {
          if (filename && !this.shouldExclude(filename)) {
            this.handleFileChange(eventType, path.join(rootDir, filename));
          }
        });
        
        this.watchers.set(rootDir, watcher);
        console.log(`[HEADY MAID] Real-time monitoring enabled for: ${rootDir}`);
      } catch (err) {
        console.warn(`[HEADY MAID] Could not watch ${rootDir}:`, err.message);
      }
    }
  }

  /**
   * Handle file change events
   */
  async handleFileChange(eventType, filepath) {
    this.emit('file-change', { eventType, filepath });
    
    // Queue for scanning
    if (!this.scanQueue.includes(filepath)) {
      this.scanQueue.push(filepath);
    }
    
    // Process queue if not at max capacity
    if (this.activeScanners < this.config.maxConcurrentScans) {
      this.processScanQueue();
    }
  }

  /**
   * Process scan queue
   */
  async processScanQueue() {
    while (this.scanQueue.length > 0 && this.activeScanners < this.config.maxConcurrentScans) {
      const filepath = this.scanQueue.shift();
      this.activeScanners++;
      
      this.scanFile(filepath)
        .catch(err => console.error(`[HEADY MAID] Error scanning ${filepath}:`, err))
        .finally(() => {
          this.activeScanners--;
          if (this.scanQueue.length > 0) {
            this.processScanQueue();
          }
        });
    }
  }

  /**
   * Perform quick scan (changed files only)
   */
  async performQuickScan() {
    const startTime = Date.now();
    console.log('[HEADY MAID] Starting quick scan...');
    
    this.isScanning = true;
    let scannedFiles = 0;
    
    try {
      for (const rootDir of this.config.rootDirs) {
        scannedFiles += await this.scanDirectoryQuick(rootDir);
      }
      
      const duration = Date.now() - startTime;
      this.metrics.scansCompleted++;
      this.metrics.lastScanDuration = duration;
      this.metrics.averageScanTime = 
        (this.metrics.averageScanTime * (this.metrics.scansCompleted - 1) + duration) / 
        this.metrics.scansCompleted;
      
      console.log(`[HEADY MAID] Quick scan complete: ${scannedFiles} files in ${duration}ms`);
      this.emit('scan-complete', { type: 'quick', files: scannedFiles, duration });
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Perform deep scan (all files)
   */
  async performDeepScan() {
    const startTime = Date.now();
    console.log('[HEADY MAID] Starting deep scan...');
    
    this.isScanning = true;
    this.inventory.totalFiles = 0;
    this.inventory.totalDirectories = 0;
    this.inventory.totalBytes = 0;
    
    try {
      for (const rootDir of this.config.rootDirs) {
        await this.scanDirectoryDeep(rootDir);
      }
      
      this.inventory.lastScan = new Date().toISOString();
      await this.saveInventory();
      await this.detectOptimizationOpportunities();
      
      const duration = Date.now() - startTime;
      this.metrics.scansCompleted++;
      this.metrics.lastScanDuration = duration;
      
      console.log(`[HEADY MAID] Deep scan complete: ${this.inventory.totalFiles} files, ${this.inventory.totalDirectories} directories in ${duration}ms`);
      this.emit('deep-scan-complete', { 
        inventory: this.inventory, 
        opportunities: this.opportunities,
        duration 
      });
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Quick scan directory (check modified times)
   */
  async scanDirectoryQuick(dirPath) {
    let scannedFiles = 0;
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (this.shouldExclude(entry.name)) continue;
        
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          scannedFiles += await this.scanDirectoryQuick(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          const existing = this.inventory.files.get(fullPath);
          
          // Only scan if modified or new
          if (!existing || existing.mtime !== stats.mtime.toISOString()) {
            await this.scanFile(fullPath);
            scannedFiles++;
          }
        }
      }
    } catch (err) {
      // Directory may have been deleted or inaccessible
    }
    
    return scannedFiles;
  }

  /**
   * Deep scan directory (all files)
   */
  async scanDirectoryDeep(dirPath, depth = 0) {
    if (depth > 10) return; // Prevent infinite recursion
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      this.inventory.directories.set(dirPath, {
        path: dirPath,
        scannedAt: new Date().toISOString(),
        fileCount: entries.filter(e => e.isFile()).length,
        dirCount: entries.filter(e => e.isDirectory()).length
      });
      
      this.inventory.totalDirectories++;
      
      for (const entry of entries) {
        if (this.shouldExclude(entry.name)) continue;
        
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          await this.scanDirectoryDeep(fullPath, depth + 1);
        } else if (entry.isFile()) {
          await this.scanFile(fullPath);
        }
      }
    } catch (err) {
      console.warn(`[HEADY MAID] Cannot scan ${dirPath}:`, err.message);
    }
  }

  /**
   * Scan individual file
   */
  async scanFile(filepath) {
    try {
      const stats = await fs.stat(filepath);
      
      if (!stats.isFile()) return;
      
      const fileInfo = {
        path: filepath,
        size: stats.size,
        mtime: stats.mtime.toISOString(),
        ctime: stats.ctime.toISOString(),
        extension: path.extname(filepath),
        basename: path.basename(filepath),
        dirname: path.dirname(filepath)
      };
      
      // Calculate checksum for integrity
      if (stats.size < 10 * 1024 * 1024) { // Only checksum files < 10MB
        try {
          const content = await fs.readFile(filepath);
          const checksum = crypto.createHash('sha256').update(content).digest('hex');
          fileInfo.checksum = checksum;
          this.inventory.checksums.set(filepath, checksum);
        } catch (err) {
          // File may be locked or unreadable
        }
      }
      
      this.inventory.files.set(filepath, fileInfo);
      this.inventory.totalFiles++;
      this.inventory.totalBytes += stats.size;
      this.metrics.bytesScanned += stats.size;
      
      // Detect file type and extract metadata
      await this.extractMetadata(filepath, fileInfo);
      
      this.emit('file-scanned', fileInfo);
    } catch (err) {
      // File may have been deleted or is inaccessible
    }
  }

  /**
   * Extract metadata from files
   */
  async extractMetadata(filepath, fileInfo) {
    const ext = fileInfo.extension.toLowerCase();
    const metadata = {
      type: this.detectFileType(ext),
      category: this.categorizeFile(ext),
      importance: this.assessImportance(filepath, fileInfo)
    };
    
    // Extract specific metadata based on file type
    if (ext === '.json') {
      try {
        const content = await fs.readFile(filepath, 'utf8');
        const json = JSON.parse(content);
        metadata.jsonKeys = Object.keys(json);
        metadata.jsonDepth = this.getObjectDepth(json);
      } catch (err) {
        metadata.parseError = true;
      }
    } else if (ext === '.md') {
      try {
        const content = await fs.readFile(filepath, 'utf8');
        metadata.lineCount = content.split('\n').length;
        metadata.wordCount = content.split(/\s+/).length;
        metadata.hasCodeBlocks = content.includes('```');
      } catch (err) {
        // Ignore
      }
    } else if (['.js', '.ts', '.py'].includes(ext)) {
      try {
        const content = await fs.readFile(filepath, 'utf8');
        metadata.lineCount = content.split('\n').length;
        metadata.hasImports = /^(import|from|require)/m.test(content);
        metadata.hasExports = /^(export|module\.exports)/m.test(content);
      } catch (err) {
        // Ignore
      }
    }
    
    this.inventory.metadata.set(filepath, metadata);
  }

  /**
   * Detect file type
   */
  detectFileType(ext) {
    const types = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.json': 'json',
      '.md': 'markdown',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.txt': 'text',
      '.log': 'log',
      '.env': 'environment',
      '.ps1': 'powershell',
      '.sh': 'shell',
      '.bat': 'batch',
      '.html': 'html',
      '.css': 'css',
      '.jsx': 'react',
      '.tsx': 'react-typescript'
    };
    
    return types[ext] || 'unknown';
  }

  /**
   * Categorize file
   */
  categorizeFile(ext) {
    if (['.js', '.ts', '.py', '.jsx', '.tsx'].includes(ext)) return 'code';
    if (['.json', '.yml', '.yaml', '.env'].includes(ext)) return 'config';
    if (['.md', '.txt'].includes(ext)) return 'documentation';
    if (['.log'].includes(ext)) return 'logs';
    if (['.ps1', '.sh', '.bat'].includes(ext)) return 'scripts';
    if (['.html', '.css'].includes(ext)) return 'web';
    return 'other';
  }

  /**
   * Assess file importance
   */
  assessImportance(filepath, fileInfo) {
    const basename = fileInfo.basename.toLowerCase();
    const dirname = fileInfo.dirname.toLowerCase();
    
    // Critical files
    if (['package.json', 'docker-compose.yml', 'mcp_config.json', '.env'].includes(basename)) {
      return 'critical';
    }
    
    // Important directories
    if (dirname.includes('src') || dirname.includes('scripts') || dirname.includes('mcp-servers')) {
      return 'high';
    }
    
    // Documentation
    if (fileInfo.extension === '.md') {
      return 'medium';
    }
    
    return 'normal';
  }

  /**
   * Get object depth
   */
  getObjectDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) return depth;
    
    const depths = Object.values(obj).map(v => this.getObjectDepth(v, depth + 1));
    return Math.max(depth, ...depths);
  }

  /**
   * Detect optimization opportunities
   */
  async detectOptimizationOpportunities() {
    console.log('[HEADY MAID] Detecting optimization opportunities...');
    
    this.opportunities = {
      duplicates: [],
      misplaced: [],
      outdated: [],
      fragmented: [],
      unoptimized: []
    };
    
    // Detect duplicate files by checksum
    const checksumMap = new Map();
    for (const [filepath, checksum] of this.inventory.checksums.entries()) {
      if (!checksumMap.has(checksum)) {
        checksumMap.set(checksum, []);
      }
      checksumMap.get(checksum).push(filepath);
    }
    
    for (const [checksum, files] of checksumMap.entries()) {
      if (files.length > 1) {
        this.opportunities.duplicates.push({
          checksum,
          files,
          size: this.inventory.files.get(files[0])?.size || 0,
          potentialSavings: (this.inventory.files.get(files[0])?.size || 0) * (files.length - 1)
        });
      }
    }
    
    // Detect misplaced files
    for (const [filepath] of this.inventory.files.entries()) {
      const metadata = this.inventory.metadata.get(filepath);
      if (!metadata) continue;
      
      // Check if code files are in proper directories
      if (metadata.category === 'code' && !filepath.includes('src') && !filepath.includes('scripts')) {
        this.opportunities.misplaced.push({
          filepath,
          reason: 'Code file not in src/ or scripts/',
          suggestion: 'Move to src/ directory'
        });
      }
      
      // Check if config files are in root or config/
      if (metadata.category === 'config' && filepath.split(path.sep).length > 3) {
        this.opportunities.misplaced.push({
          filepath,
          reason: 'Config file deeply nested',
          suggestion: 'Move to root or config/ directory'
        });
      }
    }
    
    // Detect outdated files (not modified in 90+ days)
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    for (const [filepath, fileInfo] of this.inventory.files.entries()) {
      const mtime = new Date(fileInfo.mtime).getTime();
      if (mtime < ninetyDaysAgo) {
        const metadata = this.inventory.metadata.get(filepath);
        if (metadata?.category === 'code') {
          this.opportunities.outdated.push({
            filepath,
            lastModified: fileInfo.mtime,
            daysSinceModified: Math.floor((Date.now() - mtime) / (24 * 60 * 60 * 1000))
          });
        }
      }
    }
    
    this.metrics.issuesDetected = 
      this.opportunities.duplicates.length +
      this.opportunities.misplaced.length +
      this.opportunities.outdated.length;
    
    console.log(`[HEADY MAID] Found ${this.metrics.issuesDetected} optimization opportunities`);
    this.emit('opportunities-detected', this.opportunities);
    
    // Emit tasks to routing system for each opportunity
    if (this.opportunities.duplicates.length > 0) {
      this.emit('task-detected', {
        type: 'optimization',
        priority: 'low',
        description: `Remove ${this.opportunities.duplicates.length} duplicate files`,
        category: 'duplicates',
        data: this.opportunities.duplicates
      });
    }
    
    if (this.opportunities.misplaced.length > 0) {
      this.emit('task-detected', {
        type: 'optimization',
        priority: 'normal',
        description: `Reorganize ${this.opportunities.misplaced.length} misplaced files`,
        category: 'misplaced',
        data: this.opportunities.misplaced
      });
    }
    
    if (this.opportunities.outdated.length > 0) {
      this.emit('task-detected', {
        type: 'review',
        priority: 'low',
        description: `Review ${this.opportunities.outdated.length} outdated files`,
        category: 'outdated',
        data: this.opportunities.outdated
      });
    }
  }

  /**
   * Check if path should be excluded
   */
  shouldExclude(filename) {
    return this.config.excludePatterns.some(pattern => 
      filename.includes(pattern) || filename.startsWith('.')
    );
  }

  /**
   * Get current inventory snapshot
   */
  getInventory() {
    return {
      summary: {
        totalFiles: this.inventory.totalFiles,
        totalDirectories: this.inventory.totalDirectories,
        totalBytes: this.inventory.totalBytes,
        lastScan: this.inventory.lastScan
      },
      files: Array.from(this.inventory.files.values()),
      directories: Array.from(this.inventory.directories.values()),
      metadata: Array.from(this.inventory.metadata.entries()).map(([path, meta]) => ({
        path,
        ...meta
      }))
    };
  }

  /**
   * Get optimization opportunities
   */
  getOpportunities() {
    return this.opportunities;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      systemAware: this.systemAware,
      activeWatchers: this.watchers.size,
      queuedScans: this.scanQueue.length,
      activeScanners: this.activeScanners
    };
  }

  /**
   * Generate observability report
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      inventory: this.getInventory(),
      opportunities: this.getOpportunities(),
      metrics: this.getMetrics(),
      systemAware: this.systemAware
    };
    
    // Save report
    const reportPath = path.join(
      this.config.inventoryPath,
      `report_${Date.now()}.json`
    );
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    return report;
  }

  /**
   * Shutdown HeadyMaid
   */
  async shutdown() {
    console.log('[HEADY MAID] Shutting down...');
    
    // Close all watchers
    for (const [rootDir, watcher] of this.watchers.entries()) {
      watcher.close();
      console.log(`[HEADY MAID] Stopped watching ${rootDir}`);
    }
    
    // Save final inventory
    await this.saveInventory();
    
    console.log('[HEADY MAID] Shutdown complete');
    this.emit('shutdown');
  }
}

module.exports = HeadyMaid;
