/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           HEADY CODE ANALYZER - Pattern Discovery            ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     📂 SCAN          🔍 ANALYZE         📊 EXTRACT         💡 RECOMMEND
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │ Files  │─────▶│ Patterns │─────▶│Concepts  │─────▶│Optimize  │
 *    │& Dirs  │      │& Classes │      │& Arch    │      │& Improve │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 */

const fs = require('fs').promises;
const path = require('path');

class CodeAnalyzer {
  constructor() {
    this.discoveries = {
      classes: [],
      patterns: [],
      architectures: [],
      concepts: [],
      optimizations: []
    };
  }

  /**
   * Analyze Heady codebase
   */
  async analyzeCodebase(rootDir) {
    console.log('[CODE ANALYZER] Scanning Heady codebase...');
    
    const files = await this.getAllFiles(rootDir, ['.js', '.py', '.ts']);
    
    for (const file of files) {
      await this.analyzeFile(file);
    }
    
    return this.discoveries;
  }

  /**
   * Analyze single file
   */
  async analyzeFile(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      
      // Extract classes
      const classMatches = content.matchAll(/class\s+(\w+)/g);
      for (const match of classMatches) {
        this.discoveries.classes.push({
          name: match[1],
          file: filepath,
          type: 'class'
        });
      }
      
      // Extract patterns
      if (content.includes('EventEmitter')) {
        this.discoveries.patterns.push({
          pattern: 'Event-Driven Architecture',
          file: filepath,
          implementation: 'EventEmitter'
        });
      }
      
      if (content.includes('Semaphore') || content.includes('queue')) {
        this.discoveries.patterns.push({
          pattern: 'Concurrency Control',
          file: filepath,
          implementation: 'Semaphore/Queue'
        });
      }
      
      if (content.includes('Circuit') || content.includes('breaker')) {
        this.discoveries.patterns.push({
          pattern: 'Circuit Breaker',
          file: filepath,
          implementation: 'Custom'
        });
      }
      
    } catch (err) {
      // Skip files that can't be read
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
}

module.exports = CodeAnalyzer;
