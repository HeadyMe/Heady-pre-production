#!/usr/bin/env node
/**
 * SOCRATIC REASONING SYSTEM TESTS
 * Comprehensive test suite for Heady Socratic Engine and integration
 */

const HeadySocraticEngine = require('../src/client/heady_socratic_engine');
const HeadyReasoningIntegrator = require('../src/client/heady_reasoning_integrator');
const HeadyAIBridge = require('../src/client/heady_ai_bridge');

class SocraticReasoningTests {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * Test runner
   */
  async runAll() {
    console.log('🧪 Heady Socratic Reasoning System Tests\n');
    console.log('='.repeat(60));

    // Test 1: Socratic Engine Initialization
    await this.test('Socratic Engine Initialization', async () => {
      const engine = new HeadySocraticEngine();
      this.assert(engine !== null, 'Engine should be initialized');
      this.assert(Object.keys(engine.techniques).length === 10, 'Should have 10 techniques');
      return true;
    });

    // Test 2: Technique Selection for Implementation Task
    await this.test('Technique Selection - Implementation', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Implement a binary search algorithm';
      const analysis = engine.analyzeTask(task);
      
      this.assert(analysis.selectedTechniques.length > 0, 'Should select techniques');
      this.assert(analysis.primary.key === 'sequential_thinking', 'Should select sequential thinking for implementation');
      return true;
    });

    // Test 3: Technique Selection for Debugging Task
    await this.test('Technique Selection - Debugging', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Debug memory leak in application';
      const analysis = engine.analyzeTask(task);
      
      this.assert(analysis.primary.key === 'abductive', 'Should select abductive reasoning for debugging');
      return true;
    });

    // Test 4: Technique Selection for Architecture Task
    await this.test('Technique Selection - Architecture', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Design microservices architecture';
      const analysis = engine.analyzeTask(task);
      
      const validTechniques = ['systems_thinking', 'first_principles'];
      this.assert(
        validTechniques.includes(analysis.primary.key),
        'Should select systems thinking or first principles for architecture'
      );
      return true;
    });

    // Test 5: Reasoning Plan Generation
    await this.test('Reasoning Plan Generation', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Implement authentication system';
      const reasoning = engine.reason(task);
      
      this.assert(reasoning.plan.phases.length === 5, 'Should have 5 phases');
      this.assert(reasoning.plan.phases[0].name === 'Problem Understanding', 'First phase should be Problem Understanding');
      this.assert(reasoning.plan.phases[4].name === 'Validation & Verification', 'Last phase should be Validation');
      return true;
    });

    // Test 6: Socratic Questions Generation
    await this.test('Socratic Questions Generation', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Create REST API';
      const reasoning = engine.reason(task);
      
      const questions = reasoning.plan.phases[0].questions;
      this.assert(questions.length === 4, 'Should have 4 question categories');
      this.assert(questions[0].category === 'Clarification', 'First category should be Clarification');
      return true;
    });

    // Test 7: Implementation Steps Generation
    await this.test('Implementation Steps - Implementation Task', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Implement user registration';
      const reasoning = engine.reason(task);
      
      const implPhase = reasoning.plan.phases.find(p => p.name === 'Implementation Strategy');
      this.assert(implPhase !== undefined, 'Should have Implementation Strategy phase');
      this.assert(implPhase.steps.length > 0, 'Should have implementation steps');
      return true;
    });

    // Test 8: Implementation Steps - Debugging Task
    await this.test('Implementation Steps - Debugging Task', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Fix database connection error';
      const reasoning = engine.reason(task);
      
      const implPhase = reasoning.plan.phases.find(p => p.name === 'Implementation Strategy');
      this.assert(implPhase.steps.includes('Reproduce the issue'), 'Should include reproduce step for debugging');
      this.assert(implPhase.steps.includes('Identify root cause'), 'Should include root cause step');
      return true;
    });

    // Test 9: MCP Integration Detection
    await this.test('MCP Integration Detection', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Design complex algorithm for data processing';
      const reasoning = engine.reason(task);
      
      const implPhase = reasoning.plan.phases.find(p => p.name === 'Implementation Strategy');
      this.assert(implPhase.mcpIntegration !== undefined, 'Should have MCP integration info');
      this.assert(implPhase.mcpIntegration.recommended === true, 'Should recommend MCP for complex task');
      return true;
    });

    // Test 10: Validation Checks Generation
    await this.test('Validation Checks Generation', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Build payment processing module';
      const reasoning = engine.reason(task);
      
      const validationPhase = reasoning.plan.phases.find(p => p.name === 'Validation & Verification');
      this.assert(validationPhase.checks.length === 4, 'Should have 4 validation categories');
      this.assert(validationPhase.checks[0].category === 'Functional', 'First category should be Functional');
      return true;
    });

    // Test 11: Reasoning Integrator Initialization
    await this.test('Reasoning Integrator Initialization', async () => {
      const integrator = new HeadyReasoningIntegrator();
      this.assert(integrator.socraticEngine !== null, 'Should have Socratic Engine');
      this.assert(integrator.router !== null, 'Should have Router');
      this.assert(integrator.verifier !== null, 'Should have Verifier');
      return true;
    });

    // Test 12: Task Processing with Integration
    await this.test('Task Processing with Integration', async () => {
      const integrator = new HeadyReasoningIntegrator();
      const task = 'Implement caching layer';
      const result = await integrator.processTask(task);
      
      this.assert(result.success === true, 'Processing should succeed');
      this.assert(result.reasoning !== undefined, 'Should have reasoning');
      this.assert(result.routing !== undefined, 'Should have routing');
      this.assert(result.strategy !== undefined, 'Should have strategy');
      return true;
    });

    // Test 13: Strategy Approach Determination
    await this.test('Strategy Approach Determination', async () => {
      const integrator = new HeadyReasoningIntegrator();
      const task = 'Generate comprehensive documentation';
      const result = await integrator.processTask(task);
      
      const validApproaches = ['heady_integrated', 'heady_delegated', 'direct_reasoning'];
      this.assert(
        validApproaches.includes(result.strategy.approach),
        'Should have valid approach'
      );
      return true;
    });

    // Test 14: Execution Steps Generation
    await this.test('Execution Steps Generation', async () => {
      const integrator = new HeadyReasoningIntegrator();
      const task = 'Refactor authentication module';
      const result = await integrator.processTask(task);
      
      this.assert(result.strategy.steps.length > 0, 'Should have execution steps');
      this.assert(result.strategy.steps[0].step === 1, 'Steps should be numbered');
      return true;
    });

    // Test 15: Tools Identification
    await this.test('Tools Identification', async () => {
      const integrator = new HeadyReasoningIntegrator();
      const task = 'Optimize database queries';
      const result = await integrator.processTask(task);
      
      this.assert(result.strategy.tools.length > 0, 'Should identify required tools');
      const hasReasoningTool = result.strategy.tools.some(t => t.type === 'reasoning_technique');
      this.assert(hasReasoningTool, 'Should include reasoning techniques as tools');
      return true;
    });

    // Test 16: AI Bridge Initialization
    await this.test('AI Bridge Initialization', async () => {
      const bridge = new HeadyAIBridge();
      this.assert(bridge.router !== null, 'Should have Router');
      this.assert(bridge.reasoningIntegrator !== null, 'Should have Reasoning Integrator');
      return true;
    });

    // Test 17: AI Bridge Request Interception
    await this.test('AI Bridge Request Interception', async () => {
      const bridge = new HeadyAIBridge();
      const request = 'Create user authentication API';
      const result = await bridge.interceptRequest(request);
      
      this.assert(result.success === true, 'Interception should succeed');
      this.assert(result.reasoning !== undefined, 'Should have reasoning');
      this.assert(result.strategy !== undefined, 'Should have strategy');
      return true;
    });

    // Test 18: Guidance Generation
    await this.test('Guidance Generation', async () => {
      const bridge = new HeadyAIBridge();
      const request = 'Implement rate limiting';
      const result = await bridge.interceptRequest(request);
      
      const guidance = result.getGuidance();
      this.assert(typeof guidance === 'string', 'Guidance should be a string');
      this.assert(guidance.includes('Execution Guidance'), 'Should include guidance header');
      return true;
    });

    // Test 19: Reasoning Summary Generation
    await this.test('Reasoning Summary Generation', async () => {
      const bridge = new HeadyAIBridge();
      const request = 'Debug performance bottleneck';
      const result = await bridge.interceptRequest(request);
      
      const summary = result.getReasoningSummary();
      this.assert(typeof summary === 'string', 'Summary should be a string');
      this.assert(summary.includes('Socratic Reasoning Analysis'), 'Should include summary header');
      return true;
    });

    // Test 20: Multiple Technique Selection
    await this.test('Multiple Technique Selection', async () => {
      const engine = new HeadySocraticEngine();
      const task = 'Design and implement scalable microservices architecture with caching';
      const analysis = engine.analyzeTask(task);
      
      this.assert(analysis.selectedTechniques.length >= 3, 'Should select multiple techniques for complex task');
      return true;
    });

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Test Summary:`);
    console.log(`   ✓ Passed: ${this.passed}`);
    console.log(`   ✗ Failed: ${this.failed}`);
    console.log(`   Total:  ${this.tests.length}`);
    console.log(`   Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%\n`);

    return this.failed === 0;
  }

  /**
   * Run a single test
   */
  async test(name, fn) {
    try {
      await fn();
      this.passed++;
      console.log(`✓ ${name}`);
    } catch (error) {
      this.failed++;
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error.message}`);
    }
    this.tests.push(name);
  }

  /**
   * Assertion helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tests = new SocraticReasoningTests();
  tests.runAll()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

module.exports = SocraticReasoningTests;
