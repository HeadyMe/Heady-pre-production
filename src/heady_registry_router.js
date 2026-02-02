#!/usr/bin/env node
/**
 * HEADY REGISTRY ROUTER v1.0
 * Intelligent routing layer that analyzes requests and delegates to appropriate Heady System components
 * Ensures all AI requests leverage the full Heady infrastructure instead of bypassing it
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class HeadyRegistryRouter {
  constructor(registryPath = null) {
    this.registryPath = registryPath || path.join(__dirname, '../.heady-memory/heady-registry.json');
    this.registry = this.loadRegistry();
    this.capabilities = this.buildCapabilityMap();
  }

  loadRegistry() {
    try {
      const data = fs.readFileSync(this.registryPath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('[HeadyRegistry] Failed to load registry:', e.message);
      return { components: {} };
    }
  }

  /**
   * Build a capability map from registry components
   * Maps request types to appropriate Heady components
   */
  buildCapabilityMap() {
    return {
      // Content Generation
      documentation: {
        component: 'HeadyAcademy',
        agents: ['ATLAS', 'MUSE', 'ORACLE'],
        description: 'Generate comprehensive documentation using story-driven approach',
        trigger_keywords: ['document', 'documentation', '.md file', 'readme', 'guide', 'manual']
      },
      
      // Data Processing & Analysis
      data_processing: {
        component: 'HeadyManager',
        services: ['HuggingFace', 'Python Worker'],
        description: 'Process and analyze data using AI models',
        trigger_keywords: ['analyze', 'process data', 'inference', 'embedding', 'model']
      },

      // Code Generation & Optimization
      code_generation: {
        component: 'HeadyHive',
        agents: ['ARCHITECT', 'JULES', 'BUILDER'],
        description: 'Generate and optimize code through intelligent orchestration',
        trigger_keywords: ['generate code', 'build', 'create function', 'implement', 'refactor']
      },

      // Security & Auditing
      security: {
        component: 'HeadyChain',
        agents: ['SENTINEL', 'MURPHY', 'CIPHER'],
        description: 'Security audits, encryption, authentication',
        trigger_keywords: ['security', 'audit', 'encrypt', 'authenticate', 'vulnerability']
      },

      // Research & Discovery
      research: {
        component: 'HeadyAcademy',
        agents: ['SCOUT', 'SASHA', 'NOVA'],
        description: 'Research topics, scan resources, identify gaps',
        trigger_keywords: ['research', 'find', 'discover', 'scan', 'explore', 'gap analysis']
      },

      // Visualization & Reporting
      visualization: {
        component: 'HeadyAcademy',
        agents: ['OCULUS', 'ATLAS'],
        description: 'Visualize data and generate reports',
        trigger_keywords: ['visualize', 'chart', 'graph', 'diagram', 'report']
      },

      // System Orchestration
      orchestration: {
        component: 'HeadyManager',
        services: ['OrchestrationManager', 'MCP'],
        description: 'Coordinate multiple services and manage workflows',
        trigger_keywords: ['orchestrate', 'coordinate', 'workflow', 'pipeline']
      },

      // File Operations
      file_operations: {
        component: 'HeadyManager',
        services: ['Admin File System'],
        description: 'File system operations with security context',
        trigger_keywords: ['file', 'directory', 'read', 'write', 'move']
      }
    };
  }

  /**
   * Analyze a request and determine which Heady components should handle it
   */
  analyzeRequest(request) {
    const lowerRequest = request.toLowerCase();
    const matches = [];

    for (const [capability, config] of Object.entries(this.capabilities)) {
      const score = config.trigger_keywords.reduce((acc, keyword) => {
        return acc + (lowerRequest.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > 0) {
        matches.push({
          capability,
          component: config.component,
          agents: config.agents || [],
          services: config.services || [],
          score,
          description: config.description
        });
      }
    }

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    return {
      request,
      matches,
      primary: matches[0] || null,
      shouldDelegate: matches.length > 0
    };
  }

  /**
   * Generate routing plan for a request
   */
  generateRoutingPlan(analysis) {
    if (!analysis.shouldDelegate) {
      return {
        route: 'direct',
        reason: 'No matching Heady capabilities detected',
        plan: []
      };
    }

    const plan = [];
    const primary = analysis.primary;

    // Build execution plan based on primary match
    if (primary.component === 'HeadyAcademy' && primary.agents.length > 0) {
      plan.push({
        step: 1,
        action: 'invoke_heady_academy',
        component: 'HeadyAcademy',
        agents: primary.agents,
        command: this.buildHeadyAcademyCommand(primary.agents, analysis.request)
      });
    }

    if (primary.component === 'HeadyManager') {
      plan.push({
        step: 1,
        action: 'invoke_heady_manager',
        component: 'HeadyManager',
        services: primary.services,
        endpoint: this.determineManagerEndpoint(primary.services, analysis.request)
      });
    }

    if (primary.component === 'HeadyHive') {
      plan.push({
        step: 1,
        action: 'submit_to_hive',
        component: 'HeadyHive',
        agents: primary.agents,
        command: `hb task "${analysis.request}"`
      });
    }

    return {
      route: 'heady_systems',
      primary: primary.component,
      capability: primary.capability,
      reason: primary.description,
      plan
    };
  }

  /**
   * Build command for HeadyAcademy invocation
   */
  buildHeadyAcademyCommand(agents, request) {
    // Map agents to their wrapper scripts
    const agentMap = {
      'ATLAS': 'Atlas.ps1',
      'MUSE': 'Muse.ps1',
      'ORACLE': 'Oracle.ps1',
      'SCOUT': 'Scout.ps1',
      'SASHA': 'Sasha.ps1',
      'NOVA': 'Nova.ps1',
      'JULES': 'Jules.ps1',
      'SENTINEL': 'Sentinel.ps1',
      'MURPHY': 'Murphy.ps1',
      'CIPHER': 'Cipher.ps1',
      'OCULUS': 'Oculus.ps1',
      'BUILDER': 'Builder.ps1'
    };

    const primaryAgent = agents[0];
    const wrapper = agentMap[primaryAgent];

    if (!wrapper) {
      return 'Start-HeadyAcademy.ps1 -Mode master';
    }

    return `Students/Wrappers/${wrapper} -Instruction "${request}"`;
  }

  /**
   * Determine HeadyManager API endpoint
   */
  determineManagerEndpoint(services, request) {
    if (services.includes('HuggingFace')) {
      if (request.includes('embed')) return '/api/hf/embed';
      if (request.includes('generate')) return '/api/hf/generate';
      return '/api/hf/infer';
    }

    if (services.includes('Admin File System')) {
      if (request.includes('read')) return '/api/admin/file';
      if (request.includes('write')) return '/api/admin/file';
      if (request.includes('list')) return '/api/admin/files';
      return '/api/admin/roots';
    }

    if (services.includes('MCP')) {
      return '/api/mcp/call';
    }

    return '/api/health';
  }

  /**
   * Execute a routing plan
   */
  async executeRoutingPlan(plan) {
    if (plan.route === 'direct') {
      return {
        success: false,
        message: 'Request should be handled directly (no Heady delegation)',
        plan
      };
    }

    const results = [];

    for (const step of plan.plan) {
      try {
        const result = await this.executeStep(step);
        results.push({
          step: step.step,
          action: step.action,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          step: step.step,
          action: step.action,
          success: false,
          error: error.message
        });
      }
    }

    return {
      success: results.every(r => r.success),
      route: plan.route,
      primary: plan.primary,
      results
    };
  }

  /**
   * Execute a single step in the routing plan
   */
  async executeStep(step) {
    switch (step.action) {
    case 'invoke_heady_academy':
      return await this.invokeHeadyAcademy(step);
      
    case 'invoke_heady_manager':
      return await this.invokeHeadyManager(step);
      
    case 'submit_to_hive':
      return await this.submitToHive(step);
      
    default:
      throw new Error(`Unknown action: ${step.action}`);
    }
  }

  /**
   * Invoke HeadyAcademy agent
   */
  async invokeHeadyAcademy(step) {
    return new Promise((resolve, reject) => {
      const proc = spawn('powershell.exe', ['-Command', step.command], {
        cwd: process.cwd(),
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, exitCode: code });
        } else {
          reject(new Error(`HeadyAcademy invocation failed: ${stderr}`));
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to spawn process: ${err.message}`));
      });
    });
  }

  /**
   * Invoke HeadyManager API
   */
  async invokeHeadyManager(step) {
    const baseUrl = process.env.HEADY_MANAGER_URL || 'http://localhost:3300';
    const apiKey = process.env.HEADY_API_KEY;

    const headers = {
      'Content-Type': 'application/json'
    };

    if (apiKey) {
      headers['x-heady-api-key'] = apiKey;
    }

    const response = await fetch(`${baseUrl}${step.endpoint}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HeadyManager request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Submit task to HeadyHive
   */
  async submitToHive(step) {
    return new Promise((resolve, reject) => {
      const proc = spawn('powershell.exe', ['-Command', step.command], {
        cwd: process.cwd(),
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, exitCode: code, submitted: true });
        } else {
          reject(new Error(`HeadyHive submission failed: ${stderr}`));
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to spawn process: ${err.message}`));
      });
    });
  }

  /**
   * Main routing method - analyzes request and returns routing decision
   */
  route(request) {
    const analysis = this.analyzeRequest(request);
    const plan = this.generateRoutingPlan(analysis);

    return {
      analysis,
      plan,
      recommendation: this.generateRecommendation(analysis, plan)
    };
  }

  /**
   * Generate human-readable recommendation
   */
  generateRecommendation(analysis, plan) {
    if (plan.route === 'direct') {
      return 'This request does not match any Heady System capabilities. Handle directly.';
    }

    const primary = analysis.primary;
    let rec = `Route to ${primary.component} using ${primary.capability} capability.\n`;
    rec += `Reason: ${primary.description}\n\n`;
    rec += 'Execution Plan:\n';

    plan.plan.forEach((step, idx) => {
      rec += `${idx + 1}. ${step.action} - ${step.component}\n`;
      if (step.agents && step.agents.length > 0) {
        rec += `   Agents: ${step.agents.join(', ')}\n`;
      }
      if (step.command) {
        rec += `   Command: ${step.command}\n`;
      }
      if (step.endpoint) {
        rec += `   Endpoint: ${step.endpoint}\n`;
      }
    });

    return rec;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node heady_registry_router.js "<request>"');
    console.log('Example: node heady_registry_router.js "Generate comprehensive documentation for the API"');
    process.exit(1);
  }

  const request = args.join(' ');
  const router = new HeadyRegistryRouter();
  const routing = router.route(request);

  console.log('\n=== HEADY REGISTRY ROUTER ===\n');
  console.log('Request:', request);
  console.log('\n--- Analysis ---');
  console.log('Should Delegate:', routing.analysis.shouldDelegate);
  if (routing.analysis.primary) {
    console.log('Primary Component:', routing.analysis.primary.component);
    console.log('Capability:', routing.plan.capability);
    console.log('Match Score:', routing.analysis.primary.score);
  }
  console.log('\n--- Recommendation ---');
  console.log(routing.recommendation);

  // If --execute flag is present, execute the plan
  if (args.includes('--execute')) {
    console.log('\n--- Executing Plan ---');
    router.executeRoutingPlan(routing.plan)
      .then(result => {
        console.log('Execution Result:', JSON.stringify(result, null, 2));
      })
      .catch(err => {
        console.error('Execution Error:', err.message);
        process.exit(1);
      });
  }
}

module.exports = HeadyRegistryRouter;
