/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  ready-now-integration.js - Integration with HeadyManager       ║
 * ║  Plugs ReadyNow system into main HeadyManager                   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const { getReadyNowManager } = require('./ready-now-manager');

class ReadyNowIntegration {
  constructor(headyManager) {
    this.headyManager = headyManager;
    this.readyNowManager = null;
    this.integrationActive = false;
  }

  async initialize() {
    try {
      console.log('🔗 Initializing ReadyNow integration with HeadyManager...');

      // Initialize ReadyNow Manager
      this.readyNowManager = getReadyNowManager();
      await this.readyNowManager.initialize();

      // Set up integration endpoints
      this.setupAPIEndpoints();

      // Set up middleware
      this.setupMiddleware();

      // Set up event handlers
      this.setupEventHandlers();

      this.integrationActive = true;
      console.log('✅ ReadyNow integration active');

      // Announce to HeadyManager
      this.announceIntegration();

    } catch (error) {
      console.error('❌ ReadyNow integration failed:', error);
      throw error;
    }
  }

  setupAPIEndpoints() {
    if (!this.headyManager.app) {
      console.log('⚠️ HeadyManager app not available, skipping API endpoints');
      return;
    }

    const app = this.headyManager.app;

    // ReadyNow status endpoint
    app.get('/api/ready-now/status', (req, res) => {
      const status = this.readyNowManager.getSystemStatus();
      res.json(status);
    });

    // Ask the intelligent system
    app.post('/api/ready-now/ask', (req, res) => {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Question required' });
      }

      const answer = this.readyNowManager.askSystem(question);
      res.json(answer);
    });

    // Record interaction latency
    app.post('/api/ready-now/interaction', (req, res) => {
      const { channel, latency, taskId } = req.body;
      if (!channel || !latency) {
        return res.status(400).json({ error: 'Channel and latency required' });
      }

      const record = this.readyNowManager.recordInteraction(channel, latency, taskId);
      res.json(record);
    });

    // Force optimization
    app.post('/api/ready-now/optimize', (req, res) => {
      const result = this.readyNowManager.forceOptimization();
      res.json(result);
    });

    // Get pipeline mode
    app.get('/api/ready-now/pipeline-mode', (req, res) => {
      const { taskType } = req.query;
      const mode = this.readyNowManager.getPipelineMode(taskType);
      res.json({ mode, taskType });
    });

    // System assertions
    app.get('/api/ready-now/assertions', (req, res) => {
      const assertions = this.readyNowManager.getSystemAssertions();
      res.json(assertions);
    });

    // Health check
    app.get('/api/ready-now/health', async (req, res) => {
      const health = await this.readyNowManager.healthCheck();
      res.json(health);
    });

    console.log('🔌 ReadyNow API endpoints registered');
  }

  setupMiddleware() {
    if (!this.headyManager.app) {
      console.log('⚠️ HeadyManager app not available, skipping middleware');
      return;
    }

    const app = this.headyManager.app;

    // ReadyNow middleware - adds system intelligence to requests
    app.use((req, res, next) => {
      // Add ReadyNow context to request
      req.readyNow = {
        active: this.integrationActive,
        systemStatus: this.readyNowManager.getSystemStatus(),
        pipelineMode: this.readyNowManager.getPipelineMode('interactive')
      };

      next();
    });

    // Latency tracking middleware
    app.use((req, res, next) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const latency = Date.now() - startTime;
        const channel = this.getChannelFromRequest(req);

        // Record latency for optimization
        if (this.readyNowManager) {
          this.readyNowManager.recordInteraction(channel, latency, req.id);
        }
      });

      next();
    });

    console.log('🔧 ReadyNow middleware installed');
  }

  setupEventHandlers() {
    // Listen to HeadyManager events
    if (this.headyManager.on) {
      this.headyManager.on('task-started', (task) => {
        this.handleTaskStarted(task);
      });

      this.headyManager.on('task-completed', (task) => {
        this.handleTaskCompleted(task);
      });

      this.headyManager.on('error', (error) => {
        this.handleError(error);
      });
    }

    console.log('👂 ReadyNow event handlers installed');
  }

  getChannelFromRequest(req) {
    // Determine channel from request
    if (req.path.startsWith('/api/')) {
      return 'api';
    } else if (req.path.startsWith('/chat')) {
      return 'chat';
    } else if (req.path.startsWith('/ide')) {
      return 'ide';
    } else {
      return 'web';
    }
  }

  handleTaskStarted(task) {
    console.log(`📋 Task started: ${task.id} - ${task.type}`);

    // Intelligent system can make decisions about task routing
    if (this.readyNowManager && this.readyNowManager.intelligentSystem) {
      const decision = this.readyNowManager.intelligentSystem.makeDecision(
        `task_${task.type}`,
        ['fast_execution', 'thorough_analysis', 'balanced_approach']
      );

      console.log(`🧠 AI Decision for task ${task.id}: ${decision.selected_option}`);
    }
  }

  handleTaskCompleted(task) {
    console.log(`✅ Task completed: ${task.id} in ${task.duration || 'unknown'}ms`);

    // Record task completion for learning
    if (task.duration && this.readyNowManager) {
      this.readyNowManager.recordInteraction('task_completion', task.duration, task.id);
    }
  }

  handleError(error) {
    console.log('❌ Error in HeadyManager, ReadyNow handling...');

    // Intelligent system can decide on error handling strategy
    if (this.readyNowManager && this.readyNowManager.intelligentSystem) {
      const decision = this.readyNowManager.intelligentSystem.makeDecision(
        `error_handling`,
        ['retry_with_backoff', 'escalate_to_human', 'auto_recovery', 'ignore_if_minor']
      );

      console.log(`🧠 AI Error Handling Decision: ${decision.selected_option}`);
    }
  }

  announceIntegration() {
    console.log('📢 ReadyNow Integration Announcement:');
    console.log('   🎯 HeadyManager now has ReadyNow intelligence');
    console.log('   🧠 System knows it is 100% functional');
    console.log('   ⚡ Interactive speed optimization active');
    console.log('   🔄 Background optimization continues');
    console.log('   🎛️  API endpoints available at /api/ready-now/*');

    // Emit integration event
    if (this.headyManager.emit) {
      this.headyManager.emit('ready-now-integrated', {
        timestamp: new Date().toISOString(),
        systemStatus: this.readyNowManager.getSystemStatus()
      });
    }
  }

  // Integration methods for HeadyManager to call

  enhanceTaskWithIntelligence(task) {
    if (!this.integrationActive || !this.readyNowManager) {
      return task;
    }

    // Add intelligent routing to task
    const pipelineMode = this.readyNowManager.getPipelineMode(task.type);
    task.readyNowMode = pipelineMode;

    // Add system assertions
    task.systemAssertions = this.readyNowManager.getSystemAssertions();

    // Add optimization suggestions
    if (task.type === 'human_in_loop') {
      task.optimization = 'speed_priority_max';
    }

    return task;
  }

  getSystemIntelligenceForResponse(response) {
    if (!this.integrationActive || !this.readyNowManager) {
      return response;
    }

    // Add system intelligence metadata to response
    response.systemIntelligence = {
      readyNow: this.readyNowManager.readyNowEngine.state.readyNow,
      repoFunctional: this.readyNowManager.readyNowEngine.state.repoFunctional,
      projectStage: this.readyNowManager.readyNowEngine.config.projectStage.current_stage,
      capabilities: Array.from(this.readyNowManager.intelligentSystem.capabilities.keys()),
      timestamp: new Date().toISOString()
    };

    return response;
  }

  async shutdown() {
    if (!this.integrationActive) {
      return;
    }

    console.log('🔌 Shutting down ReadyNow integration...');

    try {
      if (this.readyNowManager) {
        await this.readyNowManager.shutdown();
      }

      this.integrationActive = false;
      console.log('✅ ReadyNow integration shutdown complete');

    } catch (error) {
      console.error('❌ Error during integration shutdown:', error);
      throw error;
    }
  }
}

module.exports = ReadyNowIntegration;
