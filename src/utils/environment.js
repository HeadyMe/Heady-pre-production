// Unified environment configuration for local and remote operation
const envConfig = {
  // Core services
  manager: {
    local: {
      host: 'localhost',
      port: 3300,
      protocol: 'http'
    },
    remote: {
      host: process.env.REMOTE_MANAGER_HOST || 'api.headysystems.com',
      port: process.env.REMOTE_MANAGER_PORT || 443,
      protocol: 'https'
    }
  },
  
  // GPU processing
  gpu: {
    local: {
      enabled: process.env.ENABLE_LOCAL_GPU === 'true',
      host: 'localhost',
      port: 5000
    },
    remote: {
      enabled: true,
      host: process.env.REMOTE_GPU_HOST || 'gpu.headysystems.com',
      port: process.env.REMOTE_GPU_PORT || 443
    }
  },
  
  // MCP services
  mcp: {
    local: {
      services: ['filesystem', 'git', 'memory']
    },
    remote: {
      services: ['cloudflare', 'perplexity', 'google-maps', 'stripe']
    }
  },
  
  // Environment detection
  get current() {
    return process.env.NODE_ENV === 'production' ? 'remote' : 'local';
  },
  
  // Get endpoint for a service
  getEndpoint(service) {
    const config = this[service][this.current];
    return `${config.protocol || 'http'}://${config.host}:${config.port}`;
  }
};

module.exports = envConfig;
