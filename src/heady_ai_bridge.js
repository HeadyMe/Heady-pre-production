#!/usr/bin/env node
/**
 * HEADY AI BRIDGE v1.0
 * Integration layer between AI assistants and Heady Systems
 * Intercepts requests and routes them through Heady infrastructure when appropriate
 */

const HeadyRegistryRouter = require('./heady_registry_router');
const fs = require('fs');
const path = require('path');

class HeadyAIBridge {
  constructor() {
    this.router = new HeadyRegistryRouter();
    this.logPath = path.join(__dirname, '../audit_logs/ai_routing.jsonl');
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
   */
  async interceptRequest(request, context = {}) {
    const timestamp = new Date().toISOString();
    const routing = this.router.route(request);

    // Log the routing decision
    this.logRoutingDecision({
      timestamp,
      request,
      context,
      routing: {
        shouldDelegate: routing.analysis.shouldDelegate,
        route: routing.plan.route,
        primary: routing.plan.primary,
        capability: routing.plan.capability
      }
    });

    // Return routing decision with execution capability
    return {
      timestamp,
      request,
      shouldDelegate: routing.analysis.shouldDelegate,
      routing,
      
      // Provide execution method
      execute: async () => {
        if (!routing.analysis.shouldDelegate) {
          return {
            delegated: false,
            message: 'Request handled directly by AI assistant'
          };
        }

        const result = await this.router.executeRoutingPlan(routing.plan);
        
        // Log execution result
        this.logRoutingDecision({
          timestamp: new Date().toISOString(),
          request,
          execution: result
        });

        return {
          delegated: true,
          result
        };
      },

      // Provide guidance for manual execution
      getGuidance: () => {
        return {
          recommendation: routing.recommendation,
          plan: routing.plan,
          manual_steps: this.generateManualSteps(routing.plan)
        };
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
