/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           HEADY PATTERN RECOGNIZER - Process Awareness       ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     👁️ OBSERVE       🧠 ANALYZE        📊 DETECT         📢 NOTIFY
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │ Watch  │─────▶│ Extract  │─────▶│ Compare  │─────▶│ Inform   │
 *    │Process │      │ Patterns │      │ Changes  │      │Conductor │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 *        │                  │                  │                  │
 *        └──────────────────┴──────────────────┴──────────────────┘
 *                              │
 *                              ▼
 *                    ┌──────────────────┐
 *                    │  CREATE TASKS    │
 *                    │  If Necessary    │
 *                    └──────────────────┘
 * 
 * Responsibilities:
 * - Monitor all process patterns across the ecosystem
 * - Detect pattern changes (new, modified, deprecated)
 * - Analyze impact of pattern changes
 * - Notify HeadyConductor with recommendations
 * - Create tasks for pattern adaptations
 * - Maintain pattern history and trends
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class HeadyPatternRecognizer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      monitorInterval: config.monitorInterval || 30000, // 30 seconds
      rootDir: config.rootDir || process.cwd(),
      patternHistorySize: config.patternHistorySize || 100,
      ...config
    };
    
    // Integration points
    this.headyMaid = null; // Environmental observer
    this.routingOptimizer = null;
    this.headyEnforcer = null;

    // Known patterns
    this.knownPatterns = new Map();
    
    // Pattern categories
    this.patternCategories = {
      architectural: [],
      behavioral: [],
      data: [],
      security: [],
      performance: []
    };
    
    // Pattern history
    this.patternHistory = [];
    
    // Change detection
    this.lastSnapshot = null;
    this.changes = [];
    
    this.initializeKnownPatterns();
  }

  /**
   * Initialize known patterns
   */
  initializeKnownPatterns() {
    // Architectural Patterns
    this.registerPattern({
      id: 'event-driven',
      name: 'Event-Driven Architecture',
      category: 'architectural',
      signature: ['EventEmitter', '.on(', '.emit('],
      description: 'Components communicate via events',
      benefits: ['Loose coupling', 'Scalability', 'Async processing']
    });

    this.registerPattern({
      id: 'circuit-breaker',
      name: 'Circuit Breaker Pattern',
      category: 'architectural',
      signature: ['circuitBreaker', 'failures', 'threshold', 'half-open'],
      description: 'Prevents cascading failures',
      benefits: ['Resilience', 'Fail-fast', 'Auto-recovery']
    });

    this.registerPattern({
      id: 'mcp-protocol',
      name: 'Model Context Protocol',
      category: 'architectural',
      signature: ['@modelcontextprotocol', 'callTool', 'listTools'],
      description: 'Standardized AI tool integration',
      benefits: ['Interoperability', 'Standardization', 'Extensibility']
    });

    // Behavioral Patterns
    this.registerPattern({
      id: 'priority-queue',
      name: 'Priority Queue System',
      category: 'behavioral',
      signature: ['taskQueues', 'priority', 'high', 'normal', 'low'],
      description: 'Tasks processed by priority',
      benefits: ['Intelligent scheduling', 'Resource optimization']
    });

    this.registerPattern({
      id: 'semaphore',
      name: 'Semaphore/Concurrency Control',
      category: 'behavioral',
      signature: ['semaphore', 'acquire', 'release', 'concurrency'],
      description: 'Controls concurrent operations',
      benefits: ['Resource management', 'Prevents overload']
    });

    // Data Patterns
    this.registerPattern({
      id: 'audit-chain',
      name: 'Immutable Audit Chain',
      category: 'data',
      signature: ['previousHash', 'chainHash', 'audit', 'immutable'],
      description: 'Tamper-proof audit trail',
      benefits: ['Compliance', 'Traceability', 'Integrity']
    });

    this.registerPattern({
      id: 'inventory-tracking',
      name: 'Real-Time Inventory',
      category: 'data',
      signature: ['inventory', 'checksum', 'metadata', 'tracking'],
      description: 'Complete data observability',
      benefits: ['Awareness', 'Optimization', 'Integrity']
    });

    // Security Patterns
    this.registerPattern({
      id: 'encryption-at-rest',
      name: 'Encryption at Rest',
      category: 'security',
      signature: ['AES-256-GCM', 'encrypt', 'decrypt', 'cipher'],
      description: 'Data encrypted in storage',
      benefits: ['Confidentiality', 'Compliance', 'Protection']
    });

    this.registerPattern({
      id: 'authentication',
      name: 'API Key Authentication',
      category: 'security',
      signature: ['authenticate', 'API_KEY', 'x-heady-api-key'],
      description: 'Request authentication',
      benefits: ['Access control', 'Security', 'Audit']
    });

    // Performance Patterns
    this.registerPattern({
      id: 'compression',
      name: 'Response Compression',
      category: 'performance',
      signature: ['compression()', 'gzip', 'compress'],
      description: 'Compresses HTTP responses',
      benefits: ['Faster responses', 'Bandwidth savings']
    });

    this.registerPattern({
      id: 'async-await',
      name: 'Async/Await Pattern',
      category: 'performance',
      signature: ['async ', 'await ', 'Promise'],
      description: 'Non-blocking operations',
      benefits: ['Performance', 'Scalability', 'Responsiveness']
    });
  }

  /**
   * Register a pattern
   */
  registerPattern(pattern) {
    pattern.registeredAt = new Date().toISOString();
    pattern.hash = this.hashPattern(pattern);
    
    this.knownPatterns.set(pattern.id, pattern);
    this.patternCategories[pattern.category].push(pattern.id);
  }

  /**
   * Start pattern monitoring
   */
  async start() {
    console.log('[PATTERN RECOGNIZER] Starting pattern monitoring...');
    
    // Initial scan
    await this.scanAllPatterns();
    
    // Periodic monitoring
    setInterval(async () => {
      await this.scanAllPatterns();
    }, this.config.monitorInterval);
    
    console.log('[PATTERN RECOGNIZER] Active and monitoring');
    this.emit('started');
  }

  /**
   * Scan all patterns in codebase
   */
  async scanAllPatterns() {
    const startTime = Date.now();
    const snapshot = {
      timestamp: new Date().toISOString(),
      patterns: new Map(),
      files: 0
    };

    const files = await this.getAllFiles(this.config.rootDir, ['.js', '.ts', '.py']);
    
    for (const file of files) {
      await this.scanFileForPatterns(file, snapshot);
    }
    
    snapshot.files = files.length;
    
    // Detect changes
    if (this.lastSnapshot) {
      const changes = this.detectChanges(this.lastSnapshot, snapshot);
      
      if (changes.length > 0) {
        console.log(`[PATTERN RECOGNIZER] Detected ${changes.length} pattern changes`);
        
        // Notify HeadyConductor
        await this.notifyHeadyConductor(changes);
        
        // Store changes
        this.changes.push(...changes);
      }
    }
    
    this.lastSnapshot = snapshot;
    
    const duration = Date.now() - startTime;
    console.log(`[PATTERN RECOGNIZER] Scan complete: ${files.length} files in ${duration}ms`);
    
    this.emit('scan-complete', { snapshot, duration });
  }

  /**
   * Scan file for patterns
   */
  async scanFileForPatterns(filepath, snapshot) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      
      for (const [id, pattern] of this.knownPatterns.entries()) {
        let found = false;
        
        // Check if any signature element is present
        for (const sig of pattern.signature) {
          if (content.includes(sig)) {
            found = true;
            break;
          }
        }
        
        if (found) {
          if (!snapshot.patterns.has(id)) {
            snapshot.patterns.set(id, {
              pattern: pattern.name,
              files: [],
              count: 0
            });
          }
          
          const patternData = snapshot.patterns.get(id);
          patternData.files.push(filepath);
          patternData.count++;
        }
      }
    } catch (err) {
      // Skip files that can't be read
    }
  }

  /**
   * Detect changes between snapshots
   */
  detectChanges(oldSnapshot, newSnapshot) {
    const changes = [];
    
    // Check for new patterns
    for (const [id, data] of newSnapshot.patterns.entries()) {
      if (!oldSnapshot.patterns.has(id)) {
        changes.push({
          type: 'NEW_PATTERN',
          patternId: id,
          patternName: this.knownPatterns.get(id).name,
          category: this.knownPatterns.get(id).category,
          files: data.files,
          count: data.count,
          impact: 'MEDIUM',
          recommendation: `New ${this.knownPatterns.get(id).name} pattern detected. Review implementation for consistency.`,
          timestamp: new Date().toISOString()
        });
      } else {
        // Check for significant increase/decrease
        const oldCount = oldSnapshot.patterns.get(id).count;
        const newCount = data.count;
        const change = ((newCount - oldCount) / oldCount) * 100;
        
        if (Math.abs(change) > 20) { // 20% change threshold
          changes.push({
            type: 'PATTERN_CHANGE',
            patternId: id,
            patternName: this.knownPatterns.get(id).name,
            category: this.knownPatterns.get(id).category,
            oldCount,
            newCount,
            changePercent: change.toFixed(1) + '%',
            impact: Math.abs(change) > 50 ? 'HIGH' : 'MEDIUM',
            recommendation: change > 0 
              ? `Pattern usage increased by ${change.toFixed(1)}%. Ensure consistent implementation.`
              : `Pattern usage decreased by ${Math.abs(change).toFixed(1)}%. Verify intentional removal.`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    // Check for removed patterns
    for (const [id] of oldSnapshot.patterns.entries()) {
      if (!newSnapshot.patterns.has(id)) {
        changes.push({
          type: 'PATTERN_REMOVED',
          patternId: id,
          patternName: this.knownPatterns.get(id).name,
          category: this.knownPatterns.get(id).category,
          impact: 'HIGH',
          recommendation: `Pattern ${this.knownPatterns.get(id).name} no longer detected. Verify intentional removal or investigate missing implementation.`,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return changes;
  }

  /**
   * Notify HeadyConductor of pattern changes
   */
  async notifyHeadyConductor(changes) {
    console.log(`[PATTERN RECOGNIZER] Notifying HeadyConductor of ${changes.length} changes...`);
    
    for (const change of changes) {
      // Emit event for HeadyConductor
      this.emit('pattern-change', {
        change,
        advice: this.generateAdvice(change),
        taskRecommendation: this.shouldCreateTask(change)
      });
      
      // Log to audit
      await this.logPatternChange(change);
    }
  }

  /**
   * Generate advice for pattern change
   */
  generateAdvice(change) {
    const advice = {
      change: change.type,
      pattern: change.patternName,
      impact: change.impact,
      actions: []
    };
    
    switch (change.type) {
      case 'NEW_PATTERN':
        advice.actions = [
          `Review ${change.files.length} files implementing ${change.patternName}`,
          'Ensure pattern is used consistently',
          'Update documentation if architectural change',
          'Add pattern to monitoring if beneficial'
        ];
        break;
        
      case 'PATTERN_CHANGE':
        if (change.changePercent.startsWith('-')) {
          advice.actions = [
            'Verify pattern removal was intentional',
            'Check if functionality still works',
            'Update documentation if pattern deprecated',
            'Consider migration guide if pattern replaced'
          ];
        } else {
          advice.actions = [
            'Verify new pattern usage follows best practices',
            'Ensure consistent implementation across files',
            'Update team on pattern adoption',
            'Monitor for performance impact'
          ];
        }
        break;
        
      case 'PATTERN_REMOVED':
        advice.actions = [
          'URGENT: Verify pattern removal was intentional',
          'Check for broken functionality',
          'Review recent commits for accidental deletion',
          'Restore pattern if removed in error',
          'Document deprecation if intentional'
        ];
        break;
    }
    
    return advice;
  }

  /**
   * Determine if task should be created
   */
  shouldCreateTask(change) {
    // High impact changes should create tasks
    if (change.impact === 'HIGH') {
      return {
        shouldCreate: true,
        task: {
          type: 'pattern-change',
          priority: 'high',
          description: `${change.type}: ${change.patternName} - ${change.recommendation}`,
          category: change.category,
          data: change
        }
      };
    }
    
    // Medium impact for new patterns
    if (change.type === 'NEW_PATTERN' && change.count > 3) {
      return {
        shouldCreate: true,
        task: {
          type: 'pattern-review',
          priority: 'normal',
          description: `Review new ${change.patternName} pattern in ${change.files.length} files`,
          category: change.category,
          data: change
        }
      };
    }
    
    return {
      shouldCreate: false,
      reason: 'Low impact change, monitoring only'
    };
  }

  /**
   * Log pattern change to audit
   */
  async logPatternChange(change) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'pattern_change',
      change
    };
    
    const logPath = path.join(this.config.rootDir, 'audit_logs', 'pattern_changes.jsonl');
    
    try {
      await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    } catch (err) {
      console.error('[PATTERN RECOGNIZER] Failed to log change:', err.message);
    }
  }

  /**
   * Get all files recursively
   */
  async getAllFiles(dir, extensions) {
    const files = [];
    
    const scan = async (currentDir) => {
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          
          if (entry.name.includes('node_modules') || entry.name.startsWith('.')) {
            continue;
          }
          
          if (entry.isDirectory()) {
            await scan(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (err) {
        // Skip inaccessible directories
      }
    };
    
    await scan(dir);
    return files;
  }

  /**
   * Hash pattern for change detection
   */
  hashPattern(pattern) {
    const str = JSON.stringify({
      id: pattern.id,
      signature: pattern.signature,
      category: pattern.category
    });
    
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Get pattern statistics
   */
  getStatistics() {
    const stats = {
      totalPatterns: this.knownPatterns.size,
      byCategory: {},
      recentChanges: this.changes.slice(-10),
      lastScan: this.lastSnapshot?.timestamp
    };
    
    for (const [category, patterns] of Object.entries(this.patternCategories)) {
      stats.byCategory[category] = patterns.length;
    }
    
    if (this.lastSnapshot) {
      stats.currentSnapshot = {
        patternsDetected: this.lastSnapshot.patterns.size,
        filesScanned: this.lastSnapshot.files
      };
    }
    
    return stats;
  }

  /**
   * Connect to HeadyMaid (environmental observer)
   */
  connectToHeadyMaid(headyMaid) {
    this.headyMaid = headyMaid;
    
    // Listen to HeadyMaid events for pattern correlation
    headyMaid.on('opportunities-detected', (opportunities) => {
      this.correlateWithFileChanges(opportunities);
    });
    
    headyMaid.on('file-change', (change) => {
      // Trigger immediate pattern check on file change
      this.emit('file-change-detected', change);
    });
    
    console.log('[PATTERN RECOGNIZER] Connected to HeadyMaid (environmental observer)');
  }
  
  /**
   * Connect to RoutingOptimizer
   */
  connectToRoutingOptimizer(routingOptimizer) {
    this.routingOptimizer = routingOptimizer;
    console.log('[PATTERN RECOGNIZER] Connected to RoutingOptimizer');
  }
  
  /**
   * Connect to HeadyEnforcer
   */
  connectToHeadyEnforcer(headyEnforcer) {
    this.headyEnforcer = headyEnforcer;
    
    // Share pattern insights with enforcer
    this.on('pattern-change', (notification) => {
      if (notification.change.impact === 'HIGH') {
        headyEnforcer.emit('pattern-violation', notification);
      }
    });
    
    console.log('[PATTERN RECOGNIZER] Connected to HeadyEnforcer');
  }
  
  /**
   * Correlate pattern changes with file changes from HeadyMaid
   */
  correlateWithFileChanges(opportunities) {
    // If HeadyMaid detects many changes, trigger immediate pattern scan
    const totalChanges = Object.values(opportunities).flat().length;
    
    if (totalChanges > 5) {
      console.log('[PATTERN RECOGNIZER] HeadyMaid detected significant changes, triggering pattern scan...');
      this.scanAllPatterns().catch(err => 
        console.error('[PATTERN RECOGNIZER] Correlation scan failed:', err)
      );
    }
  }
  
  /**
   * Get pattern report
   */
  getReport() {
    const report = {
      summary: {
        knownPatterns: this.knownPatterns.size,
        detectedPatterns: this.lastSnapshot?.patterns.size || 0,
        recentChanges: this.changes.length,
        lastScan: this.lastSnapshot?.timestamp
      },
      patterns: Array.from(this.knownPatterns.values()),
      currentUsage: this.lastSnapshot ? Array.from(this.lastSnapshot.patterns.entries()).map(([id, data]) => ({
        id,
        name: this.knownPatterns.get(id)?.name,
        files: data.files.length,
        occurrences: data.count
      })) : [],
      recentChanges: this.changes.slice(-20),
      timestamp: new Date().toISOString()
    };
    
    return report;
  }
}

module.exports = HeadyPatternRecognizer;
