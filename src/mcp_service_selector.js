/**
 * MCP SERVICE SELECTOR
 * 
 * Allows selection of specific MCP service combinations for each operation.
 * Each service is independent and can be combined in any configuration.
 */

class MCPServiceSelector {
  constructor(mcpManager) {
    this.mcpManager = mcpManager;
    
    // All available MCP services
    this.availableServices = {
      // Core routing
      'heady-windsurf-router': {
        category: 'routing',
        capabilities: ['file_ops', 'commands', 'git', 'inventory', 'optimization'],
        priority: 1
      },
      
      // File operations
      'filesystem': {
        category: 'files',
        capabilities: ['read', 'write', 'list', 'move', 'delete'],
        priority: 2
      },
      
      // Version control
      'git': {
        category: 'vcs',
        capabilities: ['commit', 'push', 'pull', 'branch', 'status'],
        priority: 2
      },
      
      // Reasoning
      'sequential-thinking': {
        category: 'ai',
        capabilities: ['planning', 'reasoning', 'analysis'],
        priority: 3
      },
      
      // Memory & persistence
      'memory': {
        category: 'data',
        capabilities: ['store', 'retrieve', 'knowledge_graph'],
        priority: 3
      },
      
      // Database
      'postgres': {
        category: 'data',
        capabilities: ['query', 'schema', 'transactions'],
        priority: 3
      },
      
      // HTTP requests
      'fetch': {
        category: 'network',
        capabilities: ['http_get', 'http_post', 'api_calls'],
        priority: 3
      },
      
      // Browser automation
      'puppeteer': {
        category: 'automation',
        capabilities: ['browser', 'scraping', 'testing'],
        priority: 4
      },
      
      // Cloud services
      'cloudflare': {
        category: 'cloud',
        capabilities: ['dns', 'workers', 'kv'],
        priority: 4
      }
    };

    // Predefined service combinations for common tasks
    this.presets = {
      'minimal': ['filesystem'],
      
      'basic': ['filesystem', 'git'],
      
      'development': ['heady-windsurf-router', 'filesystem', 'git', 'memory'],
      
      'ai-enhanced': ['heady-windsurf-router', 'filesystem', 'sequential-thinking', 'memory'],
      
      'full-stack': ['heady-windsurf-router', 'filesystem', 'git', 'sequential-thinking', 'memory', 'postgres'],
      
      'research': ['heady-windsurf-router', 'fetch', 'sequential-thinking', 'memory'],
      
      'automation': ['heady-windsurf-router', 'filesystem', 'puppeteer', 'memory'],
      
      'cloud-deploy': ['heady-windsurf-router', 'filesystem', 'git', 'cloudflare'],
      
      'all': Object.keys(this.availableServices)
    };
  }

  /**
   * Select services for an operation
   * @param {string|string[]} selection - Preset name or array of service names
   * @returns {string[]} Array of selected service names
   */
  selectServices(selection) {
    if (typeof selection === 'string') {
      // Check if it's a preset
      if (this.presets[selection]) {
        return this.presets[selection];
      }
      // Single service
      return [selection];
    }
    
    if (Array.isArray(selection)) {
      // Validate all services exist
      const invalid = selection.filter(s => !this.availableServices[s]);
      if (invalid.length > 0) {
        console.warn(`[SERVICE SELECTOR] Invalid services: ${invalid.join(', ')}`);
      }
      return selection.filter(s => this.availableServices[s]);
    }
    
    // Default to development preset
    return this.presets.development;
  }

  /**
   * Get services by capability
   * @param {string} capability - Required capability
   * @returns {string[]} Services that provide this capability
   */
  getServicesByCapability(capability) {
    return Object.entries(this.availableServices)
      .filter(([_, config]) => config.capabilities.includes(capability))
      .map(([name, _]) => name);
  }

  /**
   * Get services by category
   * @param {string} category - Service category
   * @returns {string[]} Services in this category
   */
  getServicesByCategory(category) {
    return Object.entries(this.availableServices)
      .filter(([_, config]) => config.category === category)
      .map(([name, _]) => name);
  }

  /**
   * Recommend services for a task with dynamic resource allocation
   * @param {string} taskDescription - Description of the task
   * @param {Object} context - Optional context for allocation
   * @returns {Object} Recommended services with reasoning and allocation
   */
  recommendServices(taskDescription, context = {}) {
    const lower = taskDescription.toLowerCase();
    const recommended = new Set();
    const reasoning = [];
    const allocation = {
      complexity: 'low',
      priority: 'normal',
      resources: { cpu: 'low', memory: 'low' }
    };

    // Always include heady-windsurf-router for observability
    recommended.add('heady-windsurf-router');
    reasoning.push('heady-windsurf-router: Full observability and HeadyMaid integration');

    // Analyze task complexity
    if (lower.match(/complex|analyze|optimize|architect|heavy|large|build|compile/)) {
      allocation.complexity = 'high';
      allocation.resources.cpu = 'high';
      allocation.resources.memory = 'high';
      recommended.add('sequential-thinking');
      reasoning.push('sequential-thinking: High complexity task requires reasoning');
    }

    // Determine priority
    if (lower.match(/urgent|critical|security|fix|bug|error|fail/)) {
      allocation.priority = 'high';
      recommended.add('heady-windsurf-router'); // Ensure router priority
    }

    // File operations
    if (lower.match(/file|read|write|directory|folder|scan|search/)) {
      recommended.add('filesystem');
      reasoning.push('filesystem: File operations detected');
      if (allocation.complexity === 'high') {
        allocation.resources.memory = 'medium'; // File scans need memory
      }
    }

    // Git operations
    if (lower.match(/git|commit|branch|merge|push|pull|clone|repo/)) {
      recommended.add('git');
      reasoning.push('git: Version control operations detected');
    }

    // Data persistence
    if (lower.match(/remember|store|save|persist|recall|memory|context/)) {
      recommended.add('memory');
      reasoning.push('memory: Data persistence needed');
    }

    // Database operations
    if (lower.match(/database|query|sql|postgres|table|schema|migration/)) {
      recommended.add('postgres');
      reasoning.push('postgres: Database operations detected');
      allocation.resources.memory = 'medium';
    }

    // HTTP/API calls
    if (lower.match(/api|http|fetch|request|endpoint|rest|download/)) {
      recommended.add('fetch');
      reasoning.push('fetch: HTTP/API operations detected');
    }

    // Browser automation
    if (lower.match(/browser|web|scrape|screenshot|automate|test.*ui|e2e/)) {
      recommended.add('puppeteer');
      reasoning.push('puppeteer: Browser automation needed');
      allocation.resources.memory = 'high'; // Browser needs high memory
      allocation.resources.cpu = 'medium';
    }

    // Cloud operations
    if (lower.match(/cloudflare|deploy|dns|worker|edge|serverless/)) {
      recommended.add('cloudflare');
      reasoning.push('cloudflare: Cloud operations detected');
    }

    // Auto-trigger intelligent actions based on context
    if (context.history && context.history.length > 0) {
      recommended.add('memory'); // Always use memory for context
      reasoning.push('memory: Maintaining conversation context');
    }

    // HCAutoBuild integration
    if (lower.match(/build|autobuild|pipeline|ci|cd/)) {
      recommended.add('heady-autobuild');
      reasoning.push('heady-autobuild: Build orchestration needed');
      allocation.complexity = 'high';
    }

    return {
      services: Array.from(recommended),
      reasoning,
      preset: this.findMatchingPreset(Array.from(recommended)),
      allocation
    };
  }

  /**
   * Find preset that matches service list
   * @param {string[]} services - List of services
   * @returns {string|null} Matching preset name or null
   */
  findMatchingPreset(services) {
    const serviceSet = new Set(services);
    
    for (const [presetName, presetServices] of Object.entries(this.presets)) {
      const presetSet = new Set(presetServices);
      if (this.setsEqual(serviceSet, presetSet)) {
        return presetName;
      }
    }
    
    return null;
  }

  /**
   * Check if two sets are equal
   */
  setsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  /**
   * Get available services that are currently connected
   * @returns {string[]} Connected service names
   */
  getConnectedServices() {
    if (!this.mcpManager || !this.mcpManager.clients) {
      return [];
    }
    
    return Array.from(this.mcpManager.clients.keys());
  }

  /**
   * Validate service combination
   * @param {string[]} services - Services to validate
   * @returns {Object} Validation result
   */
  validateCombination(services) {
    const connected = this.getConnectedServices();
    const missing = services.filter(s => !connected.includes(s));
    const available = services.filter(s => connected.includes(s));
    
    return {
      valid: missing.length === 0,
      available,
      missing,
      canProceed: available.length > 0,
      warnings: missing.length > 0 ? [`Missing services: ${missing.join(', ')}`] : []
    };
  }

  /**
   * Get service combination for operation
   * @param {Object} options - Selection options
   * @returns {Object} Selected services with metadata
   */
  getCombination(options = {}) {
    const {
      preset = null,
      services = null,
      task = null,
      includeRecommendations = true
    } = options;

    let selected = [];
    let source = 'default';
    let recommendations = null;

    // Priority: explicit services > preset > task-based recommendation > default
    if (services) {
      selected = this.selectServices(services);
      source = 'explicit';
    } else if (preset) {
      selected = this.selectServices(preset);
      source = 'preset';
    } else if (task && includeRecommendations) {
      const recommendation = this.recommendServices(task);
      selected = recommendation.services;
      recommendations = recommendation;
      source = 'recommended';
    } else {
      selected = this.presets.development;
      source = 'default';
    }

    const validation = this.validateCombination(selected);

    return {
      services: selected,
      source,
      validation,
      recommendations,
      metadata: {
        count: selected.length,
        categories: this.getCategories(selected),
        capabilities: this.getCapabilities(selected)
      }
    };
  }

  /**
   * Get categories for service list
   */
  getCategories(services) {
    const categories = new Set();
    services.forEach(service => {
      if (this.availableServices[service]) {
        categories.add(this.availableServices[service].category);
      }
    });
    return Array.from(categories);
  }

  /**
   * Get capabilities for service list
   */
  getCapabilities(services) {
    const capabilities = new Set();
    services.forEach(service => {
      if (this.availableServices[service]) {
        this.availableServices[service].capabilities.forEach(cap => {
          capabilities.add(cap);
        });
      }
    });
    return Array.from(capabilities);
  }

  /**
   * List all available presets
   * @returns {Object} Preset information
   */
  listPresets() {
    return Object.entries(this.presets).map(([name, services]) => ({
      name,
      services,
      count: services.length,
      categories: this.getCategories(services),
      capabilities: this.getCapabilities(services)
    }));
  }

  /**
   * List all available services
   * @returns {Object} Service information
   */
  listServices() {
    return Object.entries(this.availableServices).map(([name, config]) => ({
      name,
      ...config,
      connected: this.getConnectedServices().includes(name)
    }));
  }
}

module.exports = MCPServiceSelector;
