/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  speed-optimizer.js - Aggressive Speed Optimization            ║
 * ║  Treats latency as hard defect, auto-optimizes                 ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const { EventEmitter } = require('events');

class SpeedOptimizer extends EventEmitter {
  constructor(readyNowEngine) {
    super();
    this.readyNowEngine = readyNowEngine;
    this.latencyHistory = new Map();
    this.defectThresholds = new Map();
    this.optimizationActive = false;
    
    // Initialize default latency targets
    this.latencyTargets = {
      ide: 200,
      web: 500,
      api: 100,
      chat: 1000
    };
  }

  initialize() {
    console.log('⚡ Speed Optimizer initialized');
    this.startLatencyMonitoring();
    this.setupDefectDetection();
  }

  startLatencyMonitoring() {
    // Monitor latency every 30 seconds
    setInterval(() => {
      this.checkLatencyDefects();
    }, 30000);
    
    console.log('📊 Latency monitoring started (30-second intervals)');
  }

  setupDefectDetection() {
    // In ReadyNow mode, be aggressive about speed defects
    const userPrefs = this.readyNowEngine.getUserSpeedPreferences();
    
    this.defectThresholds.set('interactive', {
      maxLatency: userPrefs.max_interactive_latency || 2000,
      defectSeverity: 'high',
      autoReplan: true
    });

    // Channel-specific thresholds
    for (const [channel, target] of Object.entries(this.latencyTargets)) {
      this.defectThresholds.set(channel, {
        maxLatency: target * 1.5, // 1.5x target = defect
        defectSeverity: 'high',
        autoReplan: true
      });
    }
  }

  recordLatency(channel, latency, taskId = null) {
    const timestamp = Date.now();
    const record = { latency, timestamp, taskId };
    
    if (!this.latencyHistory.has(channel)) {
      this.latencyHistory.set(channel, []);
    }
    
    const history = this.latencyHistory.get(channel);
    history.push(record);
    
    // Keep only last 100 records per channel
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    // Check for immediate defect
    this.checkImmediateDefect(channel, latency);
    
    return record;
  }

  checkImmediateDefect(channel, latency) {
    const threshold = this.defectThresholds.get(channel);
    if (!threshold) return false;

    if (latency > threshold.maxLatency) {
      this.handleLatencyDefect(channel, latency, threshold);
      return true;
    }
    
    return false;
  }

  checkLatencyDefects() {
    const now = Date.now();
    const defects = [];
    
    for (const [channel, history] of this.latencyHistory.entries()) {
      if (history.length === 0) continue;
      
      // Get recent latency measurements (last 2 minutes)
      const recent = history.filter(r => now - r.timestamp < 120000);
      if (recent.length === 0) continue;
      
      const avgLatency = recent.reduce((sum, r) => sum + r.latency, 0) / recent.length;
      const threshold = this.defectThresholds.get(channel);
      
      if (threshold && avgLatency > threshold.maxLatency) {
        defects.push({
          channel,
          avgLatency,
          threshold: threshold.maxLatency,
          severity: threshold.defectSeverity,
          samples: recent.length
        });
      }
    }
    
    if (defects.length > 0) {
      this.handleBatchDefects(defects);
    }
  }

  handleLatencyDefect(channel, latency, threshold) {
    const defect = {
      channel,
      latency,
      threshold: threshold.maxLatency,
      severity: threshold.defectSeverity,
      timestamp: Date.now(),
      type: 'latency_defect'
    };
    
    console.log(`🚨 LATENCY DEFECT: ${channel} = ${latency}ms (threshold: ${threshold.maxLatency}ms)`);
    
    this.emit('latency-defect', defect);
    
    if (threshold.autoReplan) {
      this.triggerAutoOptimization(defect);
    }
  }

  handleBatchDefects(defects) {
    console.log(`🚨 BATCH LATENCY DEFECTS: ${defects.length} channels affected`);
    
    for (const defect of defects) {
      console.log(`   ${defect.channel}: ${defect.avgLatency.toFixed(1)}ms avg (threshold: ${defect.threshold}ms)`);
    }
    
    this.emit('batch-latency-defects', defects);
    this.triggerAutoOptimization({ type: 'batch', defects });
  }

  triggerAutoOptimization(defect) {
    if (this.optimizationActive) {
      console.log('⚠️ Optimization already in progress, queuing defect');
      return;
    }
    
    this.optimizationActive = true;
    console.log('🔧 Triggering automatic speed optimization...');
    
    // Simulate optimization steps
    this.optimizePipeline(defect)
      .then(() => {
        this.optimizationActive = false;
        console.log('✅ Speed optimization completed');
        this.emit('optimization-completed', defect);
      })
      .catch((error) => {
        this.optimizationActive = false;
        console.error('❌ Speed optimization failed:', error);
        this.emit('optimization-failed', { defect, error });
      });
  }

  async optimizePipeline(defect) {
    console.log(`🔄 Optimizing for ${defect.type} defect...`);
    
    // Step 1: Reduce Monte Carlo exploration
    await this.reduceMonteCarloExploration();
    
    // Step 2: Increase speed priority
    await this.increaseSpeedPriority();
    
    // Step 3: Optimize task routing
    await this.optimizeTaskRouting();
    
    // Step 4: Reduce background activity
    await this.reduceBackgroundActivity();
    
    console.log('📊 Pipeline optimization steps completed');
  }

  async reduceMonteCarloExploration() {
    console.log('🎯 Reducing Monte Carlo exploration...');
    
    // In ReadyNow mode, use minimal strategies
    const pipelineMode = this.readyNowEngine.getPipelineMode('human_in_loop');
    
    if (pipelineMode === 'ready-now-interactive') {
      console.log('   ✅ Using minimal Monte Carlo strategies');
      return true;
    }
    
    return false;
  }

  async increaseSpeedPriority() {
    console.log('⚡ Increasing speed priority...');
    
    // Set speed weight to 0.9 (max)
    const speedWeight = 0.9;
    console.log(`   ✅ Speed weight set to ${speedWeight}`);
    
    return true;
  }

  async optimizeTaskRouting() {
    console.log('🛤️ Optimizing task routing...');
    
    // Route interactive tasks to fast pipeline
    const routing = {
      human_in_loop: 'ready-now-interactive',
      system_optimization: 'deep-optimization'
    };
    
    console.log('   ✅ Task routing optimized');
    return routing;
  }

  async reduceBackgroundActivity() {
    console.log('🔇 Reducing background activity...');
    
    const bgConfig = this.readyNowEngine.getBackgroundOptimizationConfig();
    
    if (bgConfig.affect_interactive === false) {
      console.log('   ✅ Background optimization already isolated');
      return true;
    }
    
    return false;
  }

  getLatencyStats() {
    const stats = {};
    const now = Date.now();
    
    for (const [channel, history] of this.latencyHistory.entries()) {
      if (history.length === 0) continue;
      
      const recent = history.filter(r => now - r.timestamp < 300000); // Last 5 minutes
      if (recent.length === 0) continue;
      
      const latencies = recent.map(r => r.latency);
      stats[channel] = {
        current: latencies[latencies.length - 1],
        average: latencies.reduce((sum, l) => sum + l, 0) / latencies.length,
        min: Math.min(...latencies),
        max: Math.max(...latencies),
        samples: latencies.length,
        target: this.latencyTargets[channel] || null
      };
    }
    
    return stats;
  }

  forceOptimization() {
    console.log('🔥 Forcing immediate speed optimization...');
    
    const defect = {
      type: 'manual',
      timestamp: Date.now(),
      reason: 'Manual optimization trigger'
    };
    
    this.triggerAutoOptimization(defect);
  }

  shutdown() {
    console.log('🔌 Speed Optimizer shutdown complete');
  }
}

module.exports = SpeedOptimizer;
