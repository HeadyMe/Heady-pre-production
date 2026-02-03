#!/usr/bin/env node
/**
 * HEADY SOCRATIC ENGINE v1.0
 * Advanced reasoning engine utilizing multiple cognitive techniques
 * Provides optimal problem-solving pathways for coding and complex tasks
 */

const fs = require('fs');
const path = require('path');
const HeadyRegistryRouter = require('./heady_registry_router');

class HeadySocraticEngine {
  constructor(config = {}) {
    this.router = new HeadyRegistryRouter();
    this.logPath = path.join(__dirname, '../../audit_logs/socratic_reasoning.jsonl');
    this.ensureLogDirectory();
    
    // Reasoning techniques registry
    this.techniques = {
      // Sequential step-by-step reasoning
      sequential_thinking: {
        name: 'Sequential Thinking',
        description: 'Break down complex problems into ordered steps',
        bestFor: ['algorithms', 'refactoring', 'debugging', 'implementation'],
        mcpTool: 'sequential-thinking',
        priority: 1
      },
      
      // First principles reasoning
      first_principles: {
        name: 'First Principles',
        description: 'Deconstruct to fundamental truths and rebuild',
        bestFor: ['architecture', 'design', 'optimization', 'innovation'],
        priority: 2
      },
      
      // Analogical reasoning
      analogical: {
        name: 'Analogical Reasoning',
        description: 'Draw parallels from known solutions',
        bestFor: ['pattern_recognition', 'code_reuse', 'best_practices'],
        priority: 3
      },
      
      // Socratic questioning
      socratic_questioning: {
        name: 'Socratic Questioning',
        description: 'Question assumptions to reveal deeper understanding',
        bestFor: ['requirements', 'edge_cases', 'validation', 'testing'],
        priority: 4
      },
      
      // Inductive reasoning
      inductive: {
        name: 'Inductive Reasoning',
        description: 'Generalize from specific examples',
        bestFor: ['pattern_detection', 'api_design', 'abstraction'],
        priority: 5
      },
      
      // Deductive reasoning
      deductive: {
        name: 'Deductive Reasoning',
        description: 'Apply general rules to specific cases',
        bestFor: ['type_checking', 'validation', 'contracts', 'specifications'],
        priority: 6
      },
      
      // Abductive reasoning
      abductive: {
        name: 'Abductive Reasoning',
        description: 'Infer most likely explanation',
        bestFor: ['debugging', 'root_cause', 'diagnostics', 'troubleshooting'],
        priority: 7
      },
      
      // Systems thinking
      systems_thinking: {
        name: 'Systems Thinking',
        description: 'Understand interconnections and feedback loops',
        bestFor: ['integration', 'dependencies', 'scalability', 'architecture'],
        priority: 8
      },
      
      // Constraint-based reasoning
      constraint_based: {
        name: 'Constraint-Based Reasoning',
        description: 'Work within defined boundaries to find solutions',
        bestFor: ['optimization', 'resource_management', 'performance'],
        priority: 9
      },
      
      // Lateral thinking
      lateral: {
        name: 'Lateral Thinking',
        description: 'Approach from unconventional angles',
        bestFor: ['innovation', 'creative_solutions', 'workarounds'],
        priority: 10
      }
    };
  }

  ensureLogDirectory() {
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Analyze task and select optimal reasoning techniques
   */
  analyzeTask(task, context = {}) {
    const taskLower = task.toLowerCase();
    const selectedTechniques = [];
    
    // Score each technique based on task keywords
    for (const [key, technique] of Object.entries(this.techniques)) {
      let score = 0;
      
      // Check if task matches technique's best use cases
      for (const useCase of technique.bestFor) {
        if (taskLower.includes(useCase.replace(/_/g, ' '))) {
          score += 10;
        }
      }
      
      // Additional keyword matching
      const keywords = this.getKeywordsForTechnique(key);
      for (const keyword of keywords) {
        if (taskLower.includes(keyword)) {
          score += 5;
        }
      }
      
      if (score > 0) {
        selectedTechniques.push({
          key,
          ...technique,
          score,
          applicability: this.calculateApplicability(task, technique)
        });
      }
    }
    
    // Sort by score (highest first), then by priority
    selectedTechniques.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.priority - b.priority;
    });
    
    // Always include at least one technique
    if (selectedTechniques.length === 0) {
      selectedTechniques.push({
        key: 'sequential_thinking',
        ...this.techniques.sequential_thinking,
        score: 1,
        applicability: 'default'
      });
    }
    
    return {
      task,
      context,
      selectedTechniques,
      primary: selectedTechniques[0],
      secondary: selectedTechniques.slice(1, 3),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get keywords associated with each technique
   */
  getKeywordsForTechnique(techniqueKey) {
    const keywordMap = {
      sequential_thinking: ['step', 'process', 'procedure', 'implement', 'build', 'create'],
      first_principles: ['why', 'fundamental', 'core', 'essential', 'base', 'foundation'],
      analogical: ['similar', 'like', 'pattern', 'example', 'template'],
      socratic_questioning: ['question', 'clarify', 'understand', 'validate', 'verify'],
      inductive: ['generalize', 'abstract', 'common', 'pattern', 'trend'],
      deductive: ['apply', 'rule', 'contract', 'type', 'specification'],
      abductive: ['debug', 'error', 'issue', 'problem', 'fix', 'diagnose'],
      systems_thinking: ['integrate', 'connect', 'system', 'architecture', 'dependency'],
      constraint_based: ['optimize', 'performance', 'limit', 'resource', 'efficient'],
      lateral: ['creative', 'alternative', 'innovative', 'different', 'novel']
    };
    
    return keywordMap[techniqueKey] || [];
  }

  /**
   * Calculate applicability percentage
   */
  calculateApplicability(task, technique) {
    const taskWords = task.toLowerCase().split(/\s+/);
    const relevantWords = technique.bestFor.flatMap(bf => bf.split('_'));
    
    const matches = taskWords.filter(word => 
      relevantWords.some(rw => word.includes(rw) || rw.includes(word))
    );
    
    const percentage = Math.min(100, Math.round((matches.length / taskWords.length) * 100));
    return `${percentage}%`;
  }

  /**
   * Generate reasoning plan using selected techniques
   */
  generateReasoningPlan(analysis) {
    const plan = {
      task: analysis.task,
      timestamp: new Date().toISOString(),
      techniques: analysis.selectedTechniques.map(t => t.key),
      phases: []
    };
    
    const primary = analysis.primary;
    
    // Phase 1: Problem Understanding (using Socratic questioning)
    plan.phases.push({
      phase: 1,
      name: 'Problem Understanding',
      technique: 'socratic_questioning',
      questions: this.generateSocraticQuestions(analysis.task),
      objective: 'Clarify requirements and constraints'
    });
    
    // Phase 2: Primary Analysis (using selected primary technique)
    plan.phases.push({
      phase: 2,
      name: 'Primary Analysis',
      technique: primary.key,
      approach: this.getTechniqueApproach(primary.key, analysis.task),
      objective: `Apply ${primary.name} to decompose the problem`
    });
    
    // Phase 3: Solution Design (using systems thinking or first principles)
    const designTechnique = analysis.selectedTechniques.find(
      t => t.key === 'systems_thinking' || t.key === 'first_principles'
    ) || primary;
    
    plan.phases.push({
      phase: 3,
      name: 'Solution Design',
      technique: designTechnique.key,
      approach: this.getTechniqueApproach(designTechnique.key, analysis.task),
      objective: 'Design comprehensive solution architecture'
    });
    
    // Phase 4: Implementation Strategy (using sequential thinking)
    plan.phases.push({
      phase: 4,
      name: 'Implementation Strategy',
      technique: 'sequential_thinking',
      steps: this.generateImplementationSteps(analysis.task),
      objective: 'Create actionable implementation plan',
      mcpIntegration: this.shouldUseMCP(analysis.task)
    });
    
    // Phase 5: Validation (using deductive reasoning)
    plan.phases.push({
      phase: 5,
      name: 'Validation & Verification',
      technique: 'deductive',
      checks: this.generateValidationChecks(analysis.task),
      objective: 'Ensure solution meets requirements'
    });
    
    return plan;
  }

  /**
   * Generate Socratic questions for problem understanding
   */
  generateSocraticQuestions(task) {
    return [
      {
        category: 'Clarification',
        questions: [
          'What exactly are we trying to achieve?',
          'What are the core requirements?',
          'What constraints must we work within?'
        ]
      },
      {
        category: 'Assumptions',
        questions: [
          'What assumptions are we making?',
          'Are these assumptions valid?',
          'What happens if these assumptions are wrong?'
        ]
      },
      {
        category: 'Implications',
        questions: [
          'What are the consequences of this approach?',
          'How does this affect other parts of the system?',
          'What edge cases should we consider?'
        ]
      },
      {
        category: 'Alternatives',
        questions: [
          'What other approaches could we take?',
          'What are the trade-offs?',
          'Why is this approach better than alternatives?'
        ]
      }
    ];
  }

  /**
   * Get specific approach for each technique
   */
  getTechniqueApproach(techniqueKey, task) {
    const approaches = {
      sequential_thinking: {
        method: 'Break down into sequential steps',
        steps: [
          'Identify inputs and outputs',
          'Define intermediate states',
          'Order operations logically',
          'Handle dependencies',
          'Plan error handling'
        ]
      },
      first_principles: {
        method: 'Deconstruct to fundamentals',
        steps: [
          'Strip away assumptions',
          'Identify core truths',
          'Rebuild from basics',
          'Validate each layer',
          'Optimize structure'
        ]
      },
      systems_thinking: {
        method: 'Map system interactions',
        steps: [
          'Identify components',
          'Map relationships',
          'Trace data flow',
          'Identify feedback loops',
          'Optimize integration points'
        ]
      },
      abductive: {
        method: 'Infer most likely cause',
        steps: [
          'Observe symptoms',
          'Generate hypotheses',
          'Test hypotheses',
          'Eliminate unlikely causes',
          'Verify root cause'
        ]
      }
    };
    
    return approaches[techniqueKey] || {
      method: `Apply ${techniqueKey} reasoning`,
      steps: ['Analyze', 'Design', 'Implement', 'Verify']
    };
  }

  /**
   * Generate implementation steps
   */
  generateImplementationSteps(task) {
    const taskLower = task.toLowerCase();
    const steps = [];
    
    // Determine task type and generate appropriate steps
    if (taskLower.includes('debug') || taskLower.includes('fix')) {
      steps.push(
        'Reproduce the issue',
        'Isolate the problematic code',
        'Identify root cause',
        'Implement fix',
        'Test fix thoroughly',
        'Verify no regressions'
      );
    } else if (taskLower.includes('refactor')) {
      steps.push(
        'Analyze current implementation',
        'Identify improvement opportunities',
        'Design refactored structure',
        'Implement changes incrementally',
        'Maintain test coverage',
        'Verify functionality preserved'
      );
    } else if (taskLower.includes('implement') || taskLower.includes('create')) {
      steps.push(
        'Define clear requirements',
        'Design solution architecture',
        'Set up necessary infrastructure',
        'Implement core functionality',
        'Add error handling',
        'Write tests',
        'Document implementation'
      );
    } else {
      steps.push(
        'Understand requirements',
        'Design solution',
        'Implement solution',
        'Test solution',
        'Document solution'
      );
    }
    
    return steps;
  }

  /**
   * Generate validation checks
   */
  generateValidationChecks(task) {
    return [
      {
        category: 'Functional',
        checks: [
          'Does it meet all requirements?',
          'Does it handle edge cases?',
          'Does it handle errors gracefully?'
        ]
      },
      {
        category: 'Technical',
        checks: [
          'Is the code maintainable?',
          'Does it follow best practices?',
          'Is it properly documented?',
          'Are there adequate tests?'
        ]
      },
      {
        category: 'Integration',
        checks: [
          'Does it integrate properly?',
          'Are dependencies managed correctly?',
          'Does it affect other systems?'
        ]
      },
      {
        category: 'Performance',
        checks: [
          'Is it performant enough?',
          'Are there optimization opportunities?',
          'Does it scale appropriately?'
        ]
      }
    ];
  }

  /**
   * Determine if MCP sequential-thinking tool should be used
   */
  shouldUseMCP(task) {
    const taskLower = task.toLowerCase();
    const mcpTriggers = [
      'complex', 'multi-step', 'algorithm', 'architecture',
      'design pattern', 'optimization', 'refactor'
    ];
    
    const shouldUse = mcpTriggers.some(trigger => taskLower.includes(trigger));
    
    return {
      recommended: shouldUse,
      tool: 'mcp24_sequentialthinking',
      reason: shouldUse 
        ? 'Task complexity warrants structured sequential reasoning'
        : 'Task can be handled with standard reasoning'
    };
  }

  /**
   * Execute reasoning plan
   */
  async executeReasoningPlan(plan, options = {}) {
    const execution = {
      plan,
      startTime: new Date().toISOString(),
      phases: [],
      insights: [],
      recommendations: []
    };
    
    // Execute each phase
    for (const phase of plan.phases) {
      const phaseResult = await this.executePhase(phase, execution);
      execution.phases.push(phaseResult);
      
      // Collect insights
      if (phaseResult.insights) {
        execution.insights.push(...phaseResult.insights);
      }
    }
    
    // Generate final recommendations
    execution.recommendations = this.generateRecommendations(execution);
    execution.endTime = new Date().toISOString();
    
    // Log execution
    this.logReasoningExecution(execution);
    
    return execution;
  }

  /**
   * Execute a single phase
   */
  async executePhase(phase, context) {
    const result = {
      phase: phase.phase,
      name: phase.name,
      technique: phase.technique,
      startTime: new Date().toISOString(),
      insights: []
    };
    
    // Phase-specific execution logic
    switch (phase.phase) {
      case 1: // Problem Understanding
        result.insights.push({
          type: 'clarification',
          content: 'Requirements and constraints identified',
          questions: phase.questions
        });
        break;
        
      case 2: // Primary Analysis
        result.insights.push({
          type: 'analysis',
          content: `Applied ${phase.technique} to decompose problem`,
          approach: phase.approach
        });
        break;
        
      case 3: // Solution Design
        result.insights.push({
          type: 'design',
          content: 'Solution architecture designed',
          approach: phase.approach
        });
        break;
        
      case 4: // Implementation Strategy
        result.insights.push({
          type: 'implementation',
          content: 'Implementation plan created',
          steps: phase.steps,
          mcpIntegration: phase.mcpIntegration
        });
        break;
        
      case 5: // Validation
        result.insights.push({
          type: 'validation',
          content: 'Validation criteria established',
          checks: phase.checks
        });
        break;
    }
    
    result.endTime = new Date().toISOString();
    return result;
  }

  /**
   * Generate final recommendations
   */
  generateRecommendations(execution) {
    const recommendations = [];
    
    // Check if MCP integration is recommended
    const implPhase = execution.phases.find(p => p.phase === 4);
    if (implPhase?.insights?.[0]?.mcpIntegration?.recommended) {
      recommendations.push({
        priority: 'high',
        category: 'tooling',
        recommendation: 'Use MCP sequential-thinking tool for structured reasoning',
        tool: implPhase.insights[0].mcpIntegration.tool,
        reason: implPhase.insights[0].mcpIntegration.reason
      });
    }
    
    // Check if HeadyRegistry routing is applicable
    const routing = this.router.route(execution.plan.task);
    if (routing.analysis.shouldDelegate) {
      recommendations.push({
        priority: 'high',
        category: 'delegation',
        recommendation: `Route to ${routing.plan.primary} via HeadyRegistry`,
        component: routing.plan.primary,
        reason: routing.plan.reason
      });
    }
    
    // Add technique-specific recommendations
    const primaryTechnique = execution.plan.techniques[0];
    recommendations.push({
      priority: 'medium',
      category: 'methodology',
      recommendation: `Primary technique: ${this.techniques[primaryTechnique].name}`,
      reason: this.techniques[primaryTechnique].description
    });
    
    return recommendations;
  }

  /**
   * Log reasoning execution
   */
  logReasoningExecution(execution) {
    try {
      const logEntry = {
        timestamp: execution.startTime,
        task: execution.plan.task,
        techniques: execution.plan.techniques,
        phases: execution.phases.length,
        insights: execution.insights.length,
        recommendations: execution.recommendations.length,
        duration: new Date(execution.endTime) - new Date(execution.startTime)
      };
      
      fs.appendFileSync(this.logPath, JSON.stringify(logEntry) + '\n');
    } catch (e) {
      console.error('[SocraticEngine] Failed to log execution:', e.message);
    }
  }

  /**
   * Main entry point: analyze task and generate reasoning plan
   */
  reason(task, context = {}) {
    const analysis = this.analyzeTask(task, context);
    const plan = this.generateReasoningPlan(analysis);
    
    return {
      analysis,
      plan,
      summary: this.generateSummary(analysis, plan)
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary(analysis, plan) {
    const primary = analysis.primary;
    
    let summary = `# Socratic Reasoning Analysis\n\n`;
    summary += `**Task:** ${analysis.task}\n\n`;
    summary += `## Selected Techniques\n\n`;
    summary += `**Primary:** ${primary.name} (${primary.applicability} applicable)\n`;
    summary += `- ${primary.description}\n`;
    summary += `- Best for: ${primary.bestFor.join(', ')}\n\n`;
    
    if (analysis.secondary.length > 0) {
      summary += `**Secondary Techniques:**\n`;
      analysis.secondary.forEach(tech => {
        summary += `- ${tech.name}: ${tech.description}\n`;
      });
      summary += `\n`;
    }
    
    summary += `## Reasoning Plan (${plan.phases.length} phases)\n\n`;
    plan.phases.forEach(phase => {
      summary += `### Phase ${phase.phase}: ${phase.name}\n`;
      summary += `- Technique: ${this.techniques[phase.technique].name}\n`;
      summary += `- Objective: ${phase.objective}\n\n`;
    });
    
    return summary;
  }
}

// Export for use in other modules
module.exports = HeadySocraticEngine;

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node heady_socratic_engine.js "<task>" [--execute]');
    console.log('Example: node heady_socratic_engine.js "Implement a binary search algorithm" --execute');
    process.exit(1);
  }

  const executeFlag = args.includes('--execute');
  const task = args.filter(a => a !== '--execute').join(' ');
  
  const engine = new HeadySocraticEngine();
  const reasoning = engine.reason(task);
  
  console.log('\n' + reasoning.summary);
  
  if (executeFlag) {
    console.log('\n--- Executing Reasoning Plan ---\n');
    engine.executeReasoningPlan(reasoning.plan)
      .then(execution => {
        console.log('✓ Execution Complete\n');
        console.log('Insights:', execution.insights.length);
        console.log('Recommendations:', execution.recommendations.length);
        console.log('\nRecommendations:');
        execution.recommendations.forEach(rec => {
          console.log(`- [${rec.priority}] ${rec.recommendation}`);
          console.log(`  Reason: ${rec.reason}\n`);
        });
      })
      .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
      });
  }
}
