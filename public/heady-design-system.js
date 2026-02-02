/**
 * Heady Sacred Geometry Design System
 * Global design tokens, utilities, and visual components
 */

const HeadyDesignSystem = {
  colors: {
    primary: {
      base: '#00d4ff',
      light: '#33ddff',
      dark: '#0099cc',
      glow: 'rgba(0, 212, 255, 0.5)'
    },
    secondary: {
      base: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      glow: 'rgba(99, 102, 241, 0.5)'
    },
    accent: {
      purple: '#a855f7',
      pink: '#ec4899',
      teal: '#14b8a6',
      gold: '#f59e0b'
    },
    background: {
      darkest: '#020208',
      dark: '#0a0e27',
      medium: '#1a1e3e',
      light: '#2a2e4e',
      overlay: 'rgba(0, 0, 0, 0.7)'
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#888888',
      tertiary: '#666666',
      inverse: '#020208'
    },
    status: {
      online: '#00ff64',
      offline: '#ff4444',
      warning: '#ffa500',
      info: '#00d4ff',
      success: '#10b981',
      error: '#ef4444'
    },
    border: {
      base: 'rgba(255, 255, 255, 0.1)',
      active: 'rgba(0, 212, 255, 0.5)',
      focus: 'rgba(99, 102, 241, 0.5)'
    }
  },

  typography: {
    fonts: {
      primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'Monaco', 'Menlo', 'Courier New', monospace",
      display: "'Inter', -apple-system, sans-serif"
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px'
  },

  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.2)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.3)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(0, 212, 255, 0.5)',
    glowPurple: '0 0 20px rgba(99, 102, 241, 0.5)'
  },

  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '1000ms'
    },
    easings: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  sacredGeometry: {
    flowerOfLife: {
      circles: 7,
      radius: 200,
      centerX: 500,
      centerY: 500
    },
    metatronsCube: {
      vertices: 13,
      radius: 250
    },
    fibonacci: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144],
    goldenRatio: 1.618033988749895
  }
};

class HeadyVisualEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.animationFrame = null;
    this.particles = [];
    this.waves = [];
    this.nodes = [];
    this.time = 0;
    this.metrics = {
      activity: 0,
      health: 1,
      load: 0
    };
  }

  init() {
    if (!this.canvas || !this.ctx) return;
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.createParticles(50);
    this.createWaves(3);
    this.animate();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  createParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  createWaves(count) {
    this.waves = [];
    for (let i = 0; i < count; i++) {
      this.waves.push({
        amplitude: 20 + i * 10,
        frequency: 0.01 + i * 0.005,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + i * 0.01,
        yOffset: this.canvas.height / 2 + i * 30
      });
    }
  }

  updateMetrics(metrics) {
    this.metrics = { ...this.metrics, ...metrics };
  }

  drawSacredGeometry() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const baseRadius = Math.min(this.canvas.width, this.canvas.height) * 0.15;

    ctx.save();
    ctx.globalAlpha = 0.1 + this.metrics.activity * 0.1;
    ctx.strokeStyle = HeadyDesignSystem.colors.primary.base;
    ctx.lineWidth = 1;

    const positions = [
      { x: 0, y: 0 },
      { x: 0, y: -baseRadius },
      { x: baseRadius * Math.cos(Math.PI / 6), y: -baseRadius * Math.sin(Math.PI / 6) },
      { x: baseRadius * Math.cos(Math.PI / 6), y: baseRadius * Math.sin(Math.PI / 6) },
      { x: 0, y: baseRadius },
      { x: -baseRadius * Math.cos(Math.PI / 6), y: baseRadius * Math.sin(Math.PI / 6) },
      { x: -baseRadius * Math.cos(Math.PI / 6), y: -baseRadius * Math.sin(Math.PI / 6) }
    ];

    positions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(centerX + pos.x, centerY + pos.y, baseRadius, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;
    
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = HeadyDesignSystem.colors.primary.base;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - distance / 100) * 0.2;
          ctx.strokeStyle = HeadyDesignSystem.colors.primary.base;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  drawWaves() {
    const ctx = this.ctx;
    
    this.waves.forEach((wave, index) => {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = index === 0 ? HeadyDesignSystem.colors.primary.base : HeadyDesignSystem.colors.secondary.base;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < this.canvas.width; x += 5) {
        const y = wave.yOffset + 
                  Math.sin(x * wave.frequency + this.time * wave.speed + wave.phase) * wave.amplitude * this.metrics.activity;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.restore();
    });
  }

  drawNodes() {
    const ctx = this.ctx;
    
    this.nodes.forEach(node => {
      const pulse = Math.sin(this.time * 0.05 + node.phase) * 0.3 + 0.7;
      const radius = node.radius * pulse * (node.active ? 1.2 : 1);

      ctx.save();
      ctx.globalAlpha = node.active ? 0.8 : 0.4;
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = node.status === 'online' 
        ? HeadyDesignSystem.colors.status.online 
        : HeadyDesignSystem.colors.status.offline;
      
      ctx.fillStyle = node.status === 'online' 
        ? HeadyDesignSystem.colors.status.online 
        : HeadyDesignSystem.colors.status.offline;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = HeadyDesignSystem.colors.text.primary;
      ctx.font = '12px ' + HeadyDesignSystem.typography.fonts.primary;
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + radius + 15);
      
      ctx.restore();
    });
  }

  addNode(node) {
    this.nodes.push({
      ...node,
      phase: Math.random() * Math.PI * 2,
      radius: node.radius || 8,
      active: node.active !== undefined ? node.active : false,
      status: node.status || 'online'
    });
  }

  updateNode(id, updates) {
    const node = this.nodes.find(n => n.id === id);
    if (node) {
      Object.assign(node, updates);
    }
  }

  animate() {
    if (!this.ctx) return;

    this.ctx.fillStyle = HeadyDesignSystem.colors.background.darkest;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawSacredGeometry();
    this.drawWaves();
    this.drawParticles();
    this.drawNodes();

    this.time += 1;
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

function createHeadyStyles() {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --heady-primary: ${HeadyDesignSystem.colors.primary.base};
      --heady-primary-light: ${HeadyDesignSystem.colors.primary.light};
      --heady-primary-dark: ${HeadyDesignSystem.colors.primary.dark};
      --heady-secondary: ${HeadyDesignSystem.colors.secondary.base};
      --heady-bg-darkest: ${HeadyDesignSystem.colors.background.darkest};
      --heady-bg-dark: ${HeadyDesignSystem.colors.background.dark};
      --heady-bg-medium: ${HeadyDesignSystem.colors.background.medium};
      --heady-text-primary: ${HeadyDesignSystem.colors.text.primary};
      --heady-text-secondary: ${HeadyDesignSystem.colors.text.secondary};
      --heady-border: ${HeadyDesignSystem.colors.border.base};
      --heady-radius: ${HeadyDesignSystem.borderRadius.lg};
    }

    .heady-card {
      background: ${HeadyDesignSystem.colors.background.medium};
      border: 1px solid ${HeadyDesignSystem.colors.border.base};
      border-radius: ${HeadyDesignSystem.borderRadius.xl};
      padding: ${HeadyDesignSystem.spacing.lg};
      transition: all ${HeadyDesignSystem.animations.durations.normal} ${HeadyDesignSystem.animations.easings.default};
    }

    .heady-card:hover {
      transform: translateY(-4px);
      box-shadow: ${HeadyDesignSystem.shadows.glow};
      border-color: ${HeadyDesignSystem.colors.border.active};
    }

    .heady-btn {
      background: linear-gradient(135deg, ${HeadyDesignSystem.colors.primary.base}, ${HeadyDesignSystem.colors.primary.dark});
      color: white;
      border: none;
      border-radius: ${HeadyDesignSystem.borderRadius.lg};
      padding: ${HeadyDesignSystem.spacing.md} ${HeadyDesignSystem.spacing.xl};
      font-weight: ${HeadyDesignSystem.typography.weights.semibold};
      cursor: pointer;
      transition: all ${HeadyDesignSystem.animations.durations.normal} ${HeadyDesignSystem.animations.easings.default};
    }

    .heady-btn:hover {
      transform: scale(1.05);
      box-shadow: ${HeadyDesignSystem.shadows.glow};
    }

    .heady-pulse {
      animation: heady-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes heady-pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .heady-glow {
      text-shadow: ${HeadyDesignSystem.shadows.glow};
    }

    .heady-gradient-text {
      background: linear-gradient(135deg, ${HeadyDesignSystem.colors.primary.base}, ${HeadyDesignSystem.colors.secondary.base});
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `;
  document.head.appendChild(style);
}

if (typeof window !== 'undefined') {
  window.HeadyDesignSystem = HeadyDesignSystem;
  window.HeadyVisualEngine = HeadyVisualEngine;
  window.createHeadyStyles = createHeadyStyles;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HeadyDesignSystem, HeadyVisualEngine, createHeadyStyles };
}
