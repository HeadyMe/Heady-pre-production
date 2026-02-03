/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    HEADY BRANDING SYSTEM                     ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ║                                                              ║
 * ║     Sacred Geometry • AI Sovereignty • Data Harmony         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const fs = require('fs').promises;
const path = require('path');

class HeadyBranding {
  constructor() {
    this.brandElements = {
      logo: this.getHeadyLogo(),
      banner: this.getHeadyBanner(),
      footer: this.getHeadyFooter(),
      divider: this.getDivider(),
      madeWithLove: this.getMadeWithLove()
    };
  }

  /**
   * Heady ASCII Logo
   */
  getHeadyLogo() {
    return `
    ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗
    ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝
    ███████║█████╗  ███████║██║  ██║ ╚████╔╝ 
    ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝  
    ██║  ██║███████╗██║  ██║██████╔╝   ██║   
    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝   
    `;
  }

  /**
   * Heady Banner (Full)
   */
  getHeadyBanner() {
    return `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗               ║
║    ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝               ║
║    ███████║█████╗  ███████║██║  ██║ ╚████╔╝                ║
║    ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                 ║
║    ██║  ██║███████╗██║  ██║██████╔╝   ██║                  ║
║    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                  ║
║                                                              ║
║              🌟 AI Sovereignty • Data Harmony 🌟             ║
║                                                              ║
║                 Sacred Geometry Architecture                 ║
║                  Squash • Merge • Harmonize                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
  }

  /**
   * Compact Banner
   */
  getCompactBanner() {
    return `
╔══════════════════════════════════════════════════════════════╗
║  🌟 HEADY SYSTEMS • Made with Love by the Team 🌟           ║
╚══════════════════════════════════════════════════════════════╝
`;
  }

  /**
   * Made with Love Footer
   */
  getMadeWithLove() {
    return `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    💖 Made with Love 💖                      ║
║                                                              ║
║           by HeadyConnection & HeadySystems Team             ║
║                                                              ║
║              Crafted with Care • Built with Passion          ║
║                                                              ║
║    🌟 Sacred Geometry • AI Sovereignty • Data Harmony 🌟    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
  }

  /**
   * Heady Footer (Compact)
   */
  getHeadyFooter() {
    return `
────────────────────────────────────────────────────────────────
  💖 Made with Love by HeadyConnection & HeadySystems Team 💖
  🌟 Sacred Geometry Architecture • AI Sovereignty 🌟
────────────────────────────────────────────────────────────────
`;
  }

  /**
   * Divider
   */
  getDivider() {
    return '════════════════════════════════════════════════════════════════';
  }

  /**
   * Sacred Geometry Pattern
   */
  getSacredGeometry() {
    return `
           ✧･ﾟ: *✧･ﾟ:* SACRED GEOMETRY *:･ﾟ✧*:･ﾟ✧
                        
                    ◇ ◆ ◇
                  ◇   ◈   ◇
                ◇     ◉     ◇
              ◇       ◈       ◇
            ◇         ◉         ◇
              ◇       ◈       ◇
                ◇     ◉     ◇
                  ◇   ◈   ◇
                    ◇ ◆ ◇
                        
           ✧･ﾟ: *✧･ﾟ:* PHI: 1.618 *:･ﾟ✧*:･ﾟ✧
`;
  }

  /**
   * Progress Bar
   */
  getProgressBar(percent, width = 50) {
    const filled = Math.floor(width * percent / 100);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent}%`;
  }

  /**
   * Status Indicator
   */
  getStatusIndicator(status) {
    const indicators = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      running: '🔄',
      stopped: '⏸️',
      healthy: '💚',
      degraded: '💛',
      critical: '🔴'
    };
    
    return indicators[status] || '•';
  }

  /**
   * Add branding to file
   */
  async brandFile(filepath, options = {}) {
    const {
      addHeader = true,
      addFooter = true,
      preserveContent = true
    } = options;

    try {
      let content = '';
      
      if (preserveContent) {
        content = await fs.readFile(filepath, 'utf8');
      }
      
      const ext = path.extname(filepath);
      const commentStyle = this.getCommentStyle(ext);
      
      let branded = '';
      
      if (addHeader) {
        branded += this.wrapInComments(this.getCompactBanner(), commentStyle);
        branded += '\n';
      }
      
      branded += content;
      
      if (addFooter) {
        branded += '\n';
        branded += this.wrapInComments(this.getMadeWithLove(), commentStyle);
      }
      
      await fs.writeFile(filepath, branded, 'utf8');
      console.log(`✅ Branded: ${filepath}`);
      
      return true;
    } catch (err) {
      console.error(`❌ Failed to brand ${filepath}:`, err.message);
      return false;
    }
  }

  /**
   * Get comment style for file type
   */
  getCommentStyle(ext) {
    const styles = {
      '.js': { start: '/**', line: ' * ', end: ' */' },
      '.ts': { start: '/**', line: ' * ', end: ' */' },
      '.py': { start: '"""', line: '', end: '"""' },
      '.ps1': { start: '<#', line: '', end: '#>' },
      '.md': { start: '<!--', line: '', end: '-->' },
      '.html': { start: '<!--', line: '', end: '-->' },
      '.css': { start: '/**', line: ' * ', end: ' */' }
    };
    
    return styles[ext] || { start: '#', line: '# ', end: '' };
  }

  /**
   * Wrap text in comments
   */
  wrapInComments(text, style) {
    const lines = text.split('\n');
    let result = style.start + '\n';
    
    lines.forEach(line => {
      result += style.line + line + '\n';
    });
    
    result += style.end;
    return result;
  }

  /**
   * Brand all project files
   */
  async brandAllFiles(directory, options = {}) {
    const {
      extensions = ['.js', '.py', '.ps1'],
      excludePatterns = ['node_modules', '.git', '.venv', 'dist', 'build'],
      dryRun = false
    } = options;

    let brandedCount = 0;
    
    const scanDir = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip excluded patterns
          if (excludePatterns.some(pattern => entry.name.includes(pattern))) {
            continue;
          }
          
          if (entry.isDirectory()) {
            await scanDir(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              if (!dryRun) {
                const success = await this.brandFile(fullPath, options);
                if (success) brandedCount++;
              } else {
                console.log(`Would brand: ${fullPath}`);
                brandedCount++;
              }
            }
          }
        }
      } catch (err) {
        // Skip directories we can't access
      }
    };
    
    await scanDir(directory);
    
    console.log(`\n${this.getStatusIndicator('success')} Branding complete: ${brandedCount} files ${dryRun ? '(dry run)' : 'branded'}`);
    
    return brandedCount;
  }
}

module.exports = HeadyBranding;
