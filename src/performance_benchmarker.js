/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              HEADY PERFORMANCE BENCHMARKER                   ║
 * ║                                                              ║
 * ║  Measures load times and performance across all components  ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Art Flow:
 * 
 *     ┌─────────┐
 *     │  START  │
 *     └────┬────┘
 *          │
 *     ┌────▼────┐
 *     │ MEASURE │ ⏱️  Record start time
 *     └────┬────┘
 *          │
 *     ┌────▼────┐
 *     │ EXECUTE │ 🚀  Run component
 *     └────┬────┘
 *          │
 *     ┌────▼────┐
 *     │  TRACK  │ 📊  Calculate duration
 *     └────┬────┘
 *          │
 *     ┌────▼────┐
 *     │ ANALYZE │ 🔍  Compare & optimize
 *     └────┬────┘
 *          │
 *     ┌────▼────┐
 *     │  REPORT │ 📈  Generate insights
 *     └─────────┘
 */

const { performance } = require('perf_hooks');
const http = require('http');
const https = require('https');

class PerformanceBenchmarker {
  constructor() {
    this.benchmarks = new Map();
    this.history = [];
    this.thresholds = {
      excellent: 100,   // < 100ms
      good: 500,        // < 500ms
      acceptable: 2000, // < 2s
      slow: 5000        // < 5s
      // > 5s = critical
    };
    
    this.components = {
      'heady-manager': { url: 'http://localhost:3300/api/health', type: 'http' },
      'orchestrator': { url: 'http://localhost:3100/api/health', type: 'http' },
      'mcp-router': { path: './mcp-servers/heady-windsurf-router/server.js', type: 'module' },
      'heady-maid': { path: './src/heady_maid.js', type: 'module' },
      'routing-optimizer': { path: './src/routing_optimizer.js', type: 'module' },
      'task-collector': { path: './src/task_collector.js', type: 'module' },
      'secrets-manager': { path: './src/secrets_manager.js', type: 'module' }
    };
  }

  /**
   * Benchmark all components
   */
  async benchmarkAll() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          🚀 HEADY PERFORMANCE BENCHMARKING 🚀               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    const results = {};
    
    for (const [name, config] of Object.entries(this.components)) {
      console.log(`⏱️  Benchmarking: ${name}...`);
      
      const result = await this.benchmarkComponent(name, config);
      results[name] = result;
      
      const status = this.getStatusIndicator(result.duration);
      console.log(`   ${status} ${result.duration.toFixed(2)}ms - ${result.rating}\n`);
    }
    
    // Store results
    this.benchmarks.set(Date.now(), results);
    this.history.push({
      timestamp: new Date().toISOString(),
      results
    });
    
    // Generate report
    return this.generateReport(results);
  }

  /**
   * Benchmark single component
   */
  async benchmarkComponent(name, config) {
    const startTime = performance.now();
    let success = false;
    let error = null;
    
    try {
      if (config.type === 'http') {
        await this.benchmarkHTTP(config.url);
        success = true;
      } else if (config.type === 'module') {
        await this.benchmarkModule(config.path);
        success = true;
      }
    } catch (err) {
      error = err.message;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      name,
      duration,
      success,
      error,
      rating: this.ratePerformance(duration),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Benchmark HTTP endpoint
   */
  async benchmarkHTTP(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const httpModule = urlObj.protocol === 'https:' ? https : http;
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 10000);
      
      const req = httpModule.get(url, (res) => {
        clearTimeout(timeout);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /**
   * Benchmark module load time
   */
  async benchmarkModule(modulePath) {
    return new Promise((resolve, reject) => {
      try {
        // Clear require cache
        const fullPath = require.resolve(modulePath);
        delete require.cache[fullPath];
        
        // Load module
        require(modulePath);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Rate performance
   */
  ratePerformance(duration) {
    if (duration < this.thresholds.excellent) return '⚡ EXCELLENT';
    if (duration < this.thresholds.good) return '✅ GOOD';
    if (duration < this.thresholds.acceptable) return '👍 ACCEPTABLE';
    if (duration < this.thresholds.slow) return '⚠️ SLOW';
    return '🔴 CRITICAL';
  }

  /**
   * Get status indicator
   */
  getStatusIndicator(duration) {
    if (duration < this.thresholds.excellent) return '⚡';
    if (duration < this.thresholds.good) return '✅';
    if (duration < this.thresholds.acceptable) return '👍';
    if (duration < this.thresholds.slow) return '⚠️';
    return '🔴';
  }

  /**
   * Generate performance report
   */
  generateReport(results) {
    const components = Object.values(results);
    const successful = components.filter(c => c.success);
    const failed = components.filter(c => !c.success);
    
    const avgDuration = successful.length > 0
      ? successful.reduce((sum, c) => sum + c.duration, 0) / successful.length
      : 0;
    
    const report = {
      summary: {
        total: components.length,
        successful: successful.length,
        failed: failed.length,
        avgDuration: avgDuration.toFixed(2) + 'ms',
        overallRating: this.ratePerformance(avgDuration)
      },
      components: results,
      recommendations: this.generateRecommendations(results),
      timestamp: new Date().toISOString()
    };
    
    this.printReport(report);
    
    return report;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];
    
    for (const [name, result] of Object.entries(results)) {
      if (!result.success) {
        recommendations.push({
          component: name,
          priority: 'critical',
          issue: `Component failed to load: ${result.error}`,
          suggestion: 'Investigate and fix component initialization'
        });
      } else if (result.duration > this.thresholds.slow) {
        recommendations.push({
          component: name,
          priority: 'high',
          issue: `Slow load time: ${result.duration.toFixed(2)}ms`,
          suggestion: 'Optimize initialization, reduce dependencies, implement lazy loading'
        });
      } else if (result.duration > this.thresholds.acceptable) {
        recommendations.push({
          component: name,
          priority: 'medium',
          issue: `Moderate load time: ${result.duration.toFixed(2)}ms`,
          suggestion: 'Consider caching, reduce I/O operations'
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Print formatted report
   */
  printReport(report) {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              📊 PERFORMANCE BENCHMARK REPORT 📊             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log(`Total Components: ${report.summary.total}`);
    console.log(`✅ Successful: ${report.summary.successful}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏱️  Average Duration: ${report.summary.avgDuration}`);
    console.log(`📈 Overall Rating: ${report.summary.overallRating}\n`);
    
    console.log('Component Details:');
    console.log('─'.repeat(64));
    
    for (const [name, result] of Object.entries(report.components)) {
      const status = result.success ? '✅' : '❌';
      const duration = result.success ? `${result.duration.toFixed(2)}ms` : 'FAILED';
      const rating = result.success ? result.rating : result.error;
      
      console.log(`${status} ${name.padEnd(25)} ${duration.padEnd(15)} ${rating}`);
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      console.log('─'.repeat(64));
      
      report.recommendations.forEach((rec, idx) => {
        const icon = rec.priority === 'critical' ? '🔴' : rec.priority === 'high' ? '⚠️' : 'ℹ️';
        console.log(`${icon} ${rec.component}: ${rec.suggestion}`);
      });
    }
    
    console.log('\n' + '═'.repeat(64));
    console.log('  💖 Made with Love by HeadyConnection & HeadySystems Team 💖');
    console.log('═'.repeat(64) + '\n');
  }

  /**
   * Compare with industry benchmarks
   */
  async compareWithIndustry(results) {
    const industryBenchmarks = {
      'api-response': { excellent: 100, good: 500, acceptable: 2000 },
      'module-load': { excellent: 50, good: 200, acceptable: 1000 },
      'database-query': { excellent: 10, good: 100, acceptable: 500 },
      'file-operation': { excellent: 5, good: 50, acceptable: 200 }
    };
    
    const comparison = {};
    
    for (const [name, result] of Object.entries(results)) {
      let benchmarkType = 'api-response';
      if (name.includes('mcp') || name.includes('module')) benchmarkType = 'module-load';
      
      const benchmark = industryBenchmarks[benchmarkType];
      const performance = result.duration;
      
      let rating = 'below-average';
      if (performance < benchmark.excellent) rating = 'excellent';
      else if (performance < benchmark.good) rating = 'above-average';
      else if (performance < benchmark.acceptable) rating = 'average';
      
      comparison[name] = {
        actual: performance,
        benchmark: benchmark.good,
        rating,
        percentile: this.calculatePercentile(performance, benchmark)
      };
    }
    
    return comparison;
  }

  /**
   * Calculate performance percentile
   */
  calculatePercentile(actual, benchmark) {
    const ratio = actual / benchmark.good;
    if (ratio <= 0.5) return 'Top 10%';
    if (ratio <= 1.0) return 'Top 25%';
    if (ratio <= 2.0) return 'Top 50%';
    return 'Bottom 50%';
  }

  /**
   * Get historical trends
   */
  getHistoricalTrends(componentName, limit = 10) {
    const recent = this.history.slice(-limit);
    const durations = recent
      .map(h => h.results[componentName]?.duration)
      .filter(d => d !== undefined);
    
    if (durations.length === 0) return null;
    
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    return {
      average: avg.toFixed(2) + 'ms',
      min: min.toFixed(2) + 'ms',
      max: max.toFixed(2) + 'ms',
      trend: durations.length > 1 ? this.calculateTrend(durations) : 'stable'
    };
  }

  /**
   * Calculate trend (improving/degrading/stable)
   */
  calculateTrend(durations) {
    if (durations.length < 2) return 'stable';
    
    const recent = durations.slice(-3);
    const older = durations.slice(0, -3);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, d) => sum + d, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change < -10) return '📈 improving';
    if (change > 10) return '📉 degrading';
    return '➡️ stable';
  }
}

module.exports = PerformanceBenchmarker;
