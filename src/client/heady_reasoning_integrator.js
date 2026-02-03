#!/usr/bin/env node
/**
 * HEADY REASONING INTEGRATOR v1.0
 * Integration layer between Socratic Engine and Heady Systems
 * Routes reasoning tasks through appropriate Heady components
 */

const HeadySocraticEngine = require('./heady_socratic_engine');
const HeadyRegistryRouter = require('./heady_registry_router');
const HeadyIntelligenceVerifier = require('./heady_intelligence_verifier');
const fs = require('fs');
const path = require('path');

class HeadyReasoningIntegrator {
  constructor(config = {}) {
    this.socraticEngine = new HeadySocraticEngine();
    this.router = new HeadyRegistryRouter();
    this.verifier = new HeadyIntelligenceVerifier({ verbose: false });
    this.logPath = path.join(__dirname, '../../audit_logs/reasoning_integration.jsonl');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Main integration point: analyze task with Socratic reasoning and route appropriately
   */
  async processTask(task, context = {}) {
    const timestamp = new Date().toISOString();
    
    // Step 1: Verify intelligence systems are operational
    const verification = await this.verifier.verify();
    if (!verification.passed) {
      return {
        success: false,
        error: 'Intelligence systems not fully operational',
        verification: verification.checks,
        recommendation: 'Run intelligence verifier to diagnose issues'
      };
    }

    // Step 2: Apply Socratic reasoning to understand the task
    const reasoning = this.socraticEngine.reason(task, context);
    
    // Step 3: Determine if task should be routed through Heady Systems
    const routing = this.router.route(task);
    
    // Step 4: Integrate reasoning with routing
    const integration = this.integrateReasoningWithRouting(reasoning, routing);
    
    // Step 5: Generate comprehensive execution strategy
    const strategy = this.generateExecutionStrategy(reasoning, routing, integration);
    
    // Log the integration
    this.logIntegration({
      timestamp,
      task,
      reasoning: {
        primary: reasoning.analysis.primary.key,
        techniques: reasoning.analysis.selectedTechniques.length,
        phases: reasoning.plan.phases.length
      },
      routing: {
        shouldDelegate: routing.analysis.shouldDelegate,
        component: routing.plan.primary
      },
      strategy: {
        approach: strategy.approach,
        steps: strategy.steps.length
      }
    });

    return {
      success: true,
      timestamp,
      task,
      reasoning,
      routing,
      integration,
      strategy,
      
      // Provide execution method
      execute: async () => {
        return await this.executeStrategy(strategy, reasoning, routing);
      },
      
      // Provide guidance
      getGuidance: () => {
        return this.generateGuidance(reasoning, routing, strategy);
      }
    };
  }

  /**
   * Integrate Socratic reasoning with Heady routing
   */
  integrateReasoningWithRouting(reasoning, routing) {
    const integration = {
      timestamp: new Date().toISOString(),
      approach: 'hybrid',
      reasoning_techniques: reasoning.analysis.selectedTechniques.map(t => t.key),
      heady_components: [],
      synergies: []
    };

    // Identify synergies between reasoning techniques and Heady components
    if (routing.analysis.shouldDelegate) {
      const primary = routing.analysis.primary;
      
      integration.heady_components.push({
        component: primary.component,
        capability: primary.capability,
        agents: primary.agents || [],
        services: primary.services || []
      });

      // Map reasoning techniques to Heady capabilities
      const primaryReasoning = reasoning.analysis.primary;
      
      if (primaryReasoning.key === 'sequential_thinking' && primary.component === 'HeadyHive') {
        integration.synergies.push({
          type: 'technique_component_match',
          reasoning: 'sequential_thinking',
          component: 'HeadyHive',
          benefit: 'HeadyHive agents can execute sequential reasoning steps'
        });
      }

      if (primaryReasoning.key === 'first_principles' && primary.component === 'HeadyAcademy') {
        integration.synergies.push({
          type: 'technique_component_match',
          reasoning: 'first_principles',
          component: 'HeadyAcademy',
          benefit: 'HeadyAcademy excels at fundamental analysis and documentation'
        });
      }

      if (primaryReasoning.key === 'systems_thinking' && primary.component === 'HeadyManager') {
        integration.synergies.push({
          type: 'technique_component_match',
          reasoning: 'systems_thinking',
          component: 'HeadyManager',
          benefit: 'HeadyManager orchestrates complex system interactions'
        });
      }

      // Check for MCP tool integration
      if (primaryReasoning.mcpTool) {
        integration.synergies.push({
          type: 'mcp_integration',
          reasoning: primaryReasoning.key,
          tool: primaryReasoning.mcpTool,
          benefit: 'MCP tool provides structured reasoning support'
        });
      }
    }

    return integration;
  }

  /**
   * Generate comprehensive execution strategy
   */
  generateExecutionStrategy(reasoning, routing, integration) {
    const strategy = {
      timestamp: new Date().toISOString(),
      approach: this.determineApproach(reasoning, routing),
      phases: [],
      steps: [],
      tools: [],
      expectedOutcome: ''
    };

    // Determine execution approach
    if (routing.analysis.shouldDelegate && integration.synergies.length > 0) {
      strategy.approach = 'heady_integrated';
      strategy.description = 'Execute through Heady Systems with Socratic reasoning guidance';
    } else if (routing.analysis.shouldDelegate) {
      strategy.approach = 'heady_delegated';
      strategy.description = 'Delegate to Heady Systems';
    } else {
      strategy.approach = 'direct_reasoning';
      strategy.description = 'Execute directly with Socratic reasoning';
    }

    // Build execution phases from reasoning plan
    reasoning.plan.phases.forEach(phase => {
      strategy.phases.push({
        phase: phase.phase,
        name: phase.name,
        technique: phase.technique,
        objective: phase.objective
      });
    });

    // Build execution steps
    if (strategy.approach === 'heady_integrated') {
      strategy.steps = this.buildIntegratedSteps(reasoning, routing, integration);
    } else if (strategy.approach === 'heady_delegated') {
      strategy.steps = this.buildDelegatedSteps(routing);
    } else {
      strategy.steps = this.buildDirectSteps(reasoning);
    }

    // Identify required tools
    strategy.tools = this.identifyRequiredTools(reasoning, routing, integration);

    // Define expected outcome
    strategy.expectedOutcome = this.defineExpectedOutcome(reasoning, routing);

    return strategy;
  }

  /**
   * Determine optimal execution approach
   */
  determineApproach(reasoning, routing) {
    if (routing.analysis.shouldDelegate) {
      const hasStrongSynergy = routing.analysis.primary.score >= 2;
      return hasStrongSynergy ? 'heady_integrated' : 'heady_delegated';
    }
    return 'direct_reasoning';
  }

  /**
   * Build integrated execution steps (Heady + Reasoning)
   */
  buildIntegratedSteps(reasoning, routing, integration) {
    const steps = [];
    
    // Step 1: Apply Socratic questioning
    steps.push({
      step: 1,
      action: 'socratic_analysis',
      description: 'Apply Socratic questioning to clarify requirements',
      technique: 'socratic_questioning',
      questions: reasoning.plan.phases[0].questions
    });

    // Step 2: Route to appropriate Heady component
    const primary = routing.analysis.primary;
    steps.push({
      step: 2,
      action: 'heady_delegation',
      description: `Delegate to ${primary.component}`,
      component: primary.component,
      agents: primary.agents || [],
      services: primary.services || [],
      routing_plan: routing.plan.plan
    });

    // Step 3: Apply primary reasoning technique
    steps.push({
      step: 3,
      action: 'apply_reasoning',
      description: `Apply ${reasoning.analysis.primary.name}`,
      technique: reasoning.analysis.primary.key,
      approach: reasoning.plan.phases[1].approach
    });

    // Step 4: Validate with deductive reasoning
    steps.push({
      step: 4,
      action: 'validation',
      description: 'Validate solution against requirements',
      technique: 'deductive',
      checks: reasoning.plan.phases[4].checks
    });

    return steps;
  }

  /**
   * Build delegated execution steps (Heady only)
   */
  buildDelegatedSteps(routing) {
    const steps = [];
    
    routing.plan.plan.forEach((planStep, idx) => {
      steps.push({
        step: idx + 1,
        action: planStep.action,
        description: `Execute ${planStep.action}`,
        component: planStep.component,
        command: planStep.command,
        endpoint: planStep.endpoint
      });
    });

    return steps;
  }

  /**
   * Build direct execution steps (Reasoning only)
   */
  buildDirectSteps(reasoning) {
    const steps = [];
    
    reasoning.plan.phases.forEach((phase, idx) => {
      steps.push({
        step: idx + 1,
        action: 'reasoning_phase',
        description: phase.name,
        technique: phase.technique,
        objective: phase.objective
      });
    });

    return steps;
  }

  /**
   * Identify required tools for execution
   */
  identifyRequiredTools(reasoning, routing, integration) {
    const tools = [];

    // Check for MCP tools
    const mcpSynergy = integration.synergies.find(s => s.type === 'mcp_integration');
    if (mcpSynergy) {
      tools.push({
        type: 'mcp',
        name: mcpSynergy.tool,
        purpose: 'Structured reasoning support'
      });
    }

    // Check for Heady components
    if (routing.analysis.shouldDelegate) {
      const primary = routing.analysis.primary;
      
      if (primary.component === 'HeadyAcademy') {
        tools.push({
          type: 'heady_component',
          name: 'HeadyAcademy',
          agents: primary.agents,
          purpose: 'Documentation and analysis'
        });
      }

      if (primary.component === 'HeadyManager') {
        tools.push({
          type: 'heady_component',
          name: 'HeadyManager',
          services: primary.services,
          purpose: 'Data processing and orchestration'
        });
      }

      if (primary.component === 'HeadyHive') {
        tools.push({
          type: 'heady_component',
          name: 'HeadyHive',
          agents: primary.agents,
          purpose: 'Code generation and optimization'
        });
      }
    }

    // Add reasoning techniques as tools
    reasoning.analysis.selectedTechniques.slice(0, 3).forEach(tech => {
      tools.push({
        type: 'reasoning_technique',
        name: tech.name,
        key: tech.key,
        purpose: tech.description
      });
    });

    return tools;
  }

  /**
   * Define expected outcome
   */
  defineExpectedOutcome(reasoning, routing) {
    const taskType = this.classifyTaskType(reasoning.analysis.task);
    
    const outcomes = {
      implementation: 'Fully functional code implementation with tests and documentation',
      debugging: 'Root cause identified and fix implemented with verification',
      refactoring: 'Improved code structure maintaining functionality with tests',
      documentation: 'Comprehensive documentation following best practices',
      architecture: 'Well-designed system architecture with clear component boundaries',
      optimization: 'Optimized solution with measurable performance improvements'
    };

    return outcomes[taskType] || 'Task completed successfully with validation';
  }

  /**
   * Classify task type
   */
  classifyTaskType(task) {
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('implement') || taskLower.includes('create') || taskLower.includes('build')) {
      return 'implementation';
    }
    if (taskLower.includes('debug') || taskLower.includes('fix') || taskLower.includes('error')) {
      return 'debugging';
    }
    if (taskLower.includes('refactor') || taskLower.includes('improve')) {
      return 'refactoring';
    }
    if (taskLower.includes('document') || taskLower.includes('documentation')) {
      return 'documentation';
    }
    if (taskLower.includes('architect') || taskLower.includes('design')) {
      return 'architecture';
    }
    if (taskLower.includes('optimize') || taskLower.includes('performance')) {
      return 'optimization';
    }
    
    return 'general';
  }

  /**
   * Execute the strategy
   */
  async executeStrategy(strategy, reasoning, routing) {
    const execution = {
      strategy: strategy.approach,
      startTime: new Date().toISOString(),
      steps: [],
      results: []
    };

    // Execute based on approach
    if (strategy.approach === 'heady_integrated' || strategy.approach === 'heady_delegated') {
      // Execute through Heady Systems
      const routingResult = await this.router.executeRoutingPlan(routing.plan);
      execution.results.push({
        type: 'heady_execution',
        success: routingResult.success,
        results: routingResult.results
      });
    }

    // Execute reasoning plan
    const reasoningResult = await this.socraticEngine.executeReasoningPlan(reasoning.plan);
    execution.results.push({
      type: 'reasoning_execution',
      insights: reasoningResult.insights,
      recommendations: reasoningResult.recommendations
    });

    execution.endTime = new Date().toISOString();
    execution.success = execution.results.every(r => r.success !== false);

    return execution;
  }

  /**
   * Generate guidance for manual execution
   */
  generateGuidance(reasoning, routing, strategy) {
    let guidance = `# Execution Guidance\n\n`;
    guidance += `**Approach:** ${strategy.approach}\n`;
    guidance += `**Description:** ${strategy.description}\n\n`;
    
    guidance += `## Reasoning Techniques\n\n`;
    guidance += `**Primary:** ${reasoning.analysis.primary.name}\n`;
    guidance += `- ${reasoning.analysis.primary.description}\n`;
    guidance += `- Applicability: ${reasoning.analysis.primary.applicability}\n\n`;
    
    if (reasoning.analysis.secondary.length > 0) {
      guidance += `**Secondary Techniques:**\n`;
      reasoning.analysis.secondary.forEach(tech => {
        guidance += `- ${tech.name}: ${tech.description}\n`;
      });
      guidance += `\n`;
    }
    
    guidance += `## Execution Steps\n\n`;
    strategy.steps.forEach(step => {
      guidance += `### Step ${step.step}: ${step.description}\n`;
      guidance += `- Action: ${step.action}\n`;
      if (step.technique) {
        guidance += `- Technique: ${step.technique}\n`;
      }
      if (step.component) {
        guidance += `- Component: ${step.component}\n`;
      }
      guidance += `\n`;
    });
    
    guidance += `## Required Tools\n\n`;
    strategy.tools.forEach(tool => {
      guidance += `- **${tool.name}** (${tool.type})\n`;
      guidance += `  Purpose: ${tool.purpose}\n`;
    });
    guidance += `\n`;
    
    guidance += `## Expected Outcome\n\n`;
    guidance += strategy.expectedOutcome + `\n`;
    
    return guidance;
  }

  /**
   * Log integration activity
   */
  logIntegration(entry) {
    try {
      fs.appendFileSync(this.logPath, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error('[ReasoningIntegrator] Failed to log:', e.message);
    }
  }
}

// Export for use in other modules
module.exports = HeadyReasoningIntegrator;

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node heady_reasoning_integrator.js "<task>" [--execute]');
    console.log('Example: node heady_reasoning_integrator.js "Implement authentication system" --execute');
    process.exit(1);
  }

  const executeFlag = args.includes('--execute');
  const task = args.filter(a => a !== '--execute').join(' ');
  
  const integrator = new HeadyReasoningIntegrator();
  
  integrator.processTask(task).then(async (result) => {
    if (!result.success) {
      console.error('❌ Processing failed:', result.error);
      process.exit(1);
    }

    console.log('\n=== HEADY REASONING INTEGRATOR ===\n');
    console.log('Task:', result.task);
    console.log('\n--- Strategy ---');
    console.log('Approach:', result.strategy.approach);
    console.log('Description:', result.strategy.description);
    console.log('Steps:', result.strategy.steps.length);
    console.log('Tools:', result.strategy.tools.length);
    
    console.log('\n--- Guidance ---');
    console.log(result.getGuidance());

    if (executeFlag) {
      console.log('\n--- Executing Strategy ---');
      const execution = await result.execute();
      console.log('✓ Execution Complete');
      console.log('Success:', execution.success);
      console.log('Results:', execution.results.length);
    }
  }).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
