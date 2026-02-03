#!/usr/bin/env node
/**
 * HEADY AI BRIDGE v1.0
 * Integration layer between AI assistants and Heady Systems
 * Intercepts requests and routes them through Heady infrastructure when appropriate
 */

const HeadyRegistryRouter = require('./heady_registry_router');
const HeadyReasoningIntegrator = require('./heady_reasoning_integrator');
const fs = require('fs');
const path = require('path');

class HeadyAIBridge {
  constructor() {
    this.router = new HeadyRegistryRouter();
    this.reasoningIntegrator = new HeadyReasoningIntegrator();
    this.logPath = path.join(__dirname, '../../audit_logs/ai_routing.jsonl');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Main interception point for Windsurf requests
   * Now enhanced with Socratic reasoning
   */
  async interceptRequest(request, context = {}) {
    const timestamp = new Date().toISOString();
    
    // Apply Socratic reasoning and Heady integration
    const reasoningResult = await this.reasoningIntegrator.processTask(request, context);
    
    if (!reasoningResult.success) {
      return {
        timestamp,
        request,
        success: false,
        error: reasoningResult.error,
        recommendation: reasoningResult.recommendation,
        execute: async () => ({ success: false, error: reasoningResult.error }),
        getGuidance: () => `Error: ${reasoningResult.error}\nRecommendation: ${reasoningResult.recommendation}`,
        getReasoningSummary: () => `Processing failed: ${reasoningResult.error}`
      };
    }

    // Log the enhanced routing decision
    this.logRoutingDecision({
      timestamp,
      request,
      context,
      reasoning: {
        primary: reasoningResult.reasoning.analysis.primary.key,
        techniques: reasoningResult.reasoning.analysis.selectedTechniques.length
      },
      routing: {
        shouldDelegate: reasoningResult.routing.analysis.shouldDelegate,
        route: reasoningResult.routing.plan.route,
        primary: reasoningResult.routing.plan.primary,
        capability: reasoningResult.routing.plan.capability
      },
      strategy: {
        approach: reasoningResult.strategy.approach,
        steps: reasoningResult.strategy.steps.length
      }
    });

    // Return enhanced decision with reasoning and execution capability
    return {
      timestamp,
      request,
      success: true,
      shouldDelegate: reasoningResult.routing.analysis.shouldDelegate,
      reasoning: reasoningResult.reasoning,
      routing: reasoningResult.routing,
      strategy: reasoningResult.strategy,
      
      // Provide execution method
      execute: async () => {
        const result = await reasoningResult.execute();
        
        // Log execution result
        this.logRoutingDecision({
          timestamp: new Date().toISOString(),
          request,
          execution: result
        });

        return result;
      },

      // Provide comprehensive guidance
      getGuidance: () => {
        return reasoningResult.getGuidance();
      },
      
      // Provide reasoning summary
      getReasoningSummary: () => {
        return reasoningResult.reasoning.summary;
      }
    };
  }

  /**
   * Generate manual execution steps for the user
   */
  generateManualSteps(plan) {
    if (plan.route === 'direct') {
      return ['No Heady System delegation required - handle request directly'];
    }

    const steps = [];
    
    plan.plan.forEach((step, idx) => {
      let stepText = `Step ${idx + 1}: `;
      
      switch (step.action) {
      case 'invoke_heady_academy':
        stepText += 'Run HeadyAcademy agent\n';
        stepText += `   Command: ${step.command}\n`;
        stepText += `   Agents: ${step.agents.join(', ')}`;
        break;
          
      case 'invoke_heady_manager':
        stepText += 'Call HeadyManager API\n';
        stepText += `   Endpoint: ${step.endpoint}\n`;
        stepText += `   Services: ${step.services.join(', ')}`;
        break;
          
      case 'submit_to_hive':
        stepText += 'Submit to HeadyHive\n';
        stepText += `   Command: ${step.command}`;
        break;
      }
      
      steps.push(stepText);
    });

    return steps;
  }

  /**
   * Log routing decisions for audit trail
   */
  logRoutingDecision(entry) {
    try {
      fs.appendFileSync(this.logPath, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error('[AIBridge] Failed to log routing decision:', e.message);
    }
  }

  /**
   * Analyze if a request should use Heady Systems
   */
  shouldUseHeadySystems(request) {
    const routing = this.router.route(request);
    return routing.analysis.shouldDelegate;
  }

  /**
   * Get routing recommendation without execution
   */
  getRoutingRecommendation(request) {
    const routing = this.router.route(request);
    return {
      shouldDelegate: routing.analysis.shouldDelegate,
      recommendation: routing.recommendation,
      plan: routing.plan,
      matches: routing.analysis.matches
    };
  }
}

// Export for use in other modules
module.exports = HeadyAIBridge;

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node heady_ai_bridge.js "<request>" [--execute]');
    console.log('Example: node heady_ai_bridge.js "Generate comprehensive API documentation" --execute');
    process.exit(1);
  }

  const executeFlag = args.includes('--execute');
  const request = args.filter(a => a !== '--execute').join(' ');
  
  const bridge = new HeadyAIBridge();
  
  bridge.interceptRequest(request).then(async (interception) => {
    console.log('\n=== HEADY AI BRIDGE ===\n');
    console.log('Request:', interception.request);
    console.log('Should Delegate:', interception.shouldDelegate);
    console.log('\n--- Guidance ---');
    const guidance = interception.getGuidance();
    console.log(guidance.recommendation);
    
    if (guidance.manual_steps.length > 0) {
      console.log('\n--- Manual Execution Steps ---');
      guidance.manual_steps.forEach(step => console.log(step));
    }

    if (executeFlag && interception.shouldDelegate) {
      console.log('\n--- Executing via Heady Systems ---');
      const result = await interception.execute();
      console.log('Result:', JSON.stringify(result, null, 2));
    }
  }).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
