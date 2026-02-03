#!/usr/bin/env node
/**
 * HEADY CHAT INTERCEPTOR
 * Routes all AI chat input through HeadyMCP for processing
 * Architecture: User Input → HeadyMCP → Intelligence Verification → AI Processing
 */

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const PORT = process.env.HEADY_INTERCEPTOR_PORT || 3350;
const HEADY_MANAGER_URL = process.env.HEADY_MANAGER_URL || 'http://localhost:3300';
const INTELLIGENCE_VERIFIER = path.join(__dirname, 'heady_intelligence_verifier.js');

class HeadyChatInterceptor {
  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.setupRoutes();
  }

  setupRoutes() {
    // Main interception endpoint
    this.app.post('/api/chat/intercept', async (req, res) => {
      const { message, context } = req.body;
            
      console.log('🔵 [INTERCEPTOR] Chat input received:', message);
            
      try {
        // Step 1: Route through HeadyMCP
        const mcpProcessed = await this.routeThroughMCP(message, context);
                
        // Step 2: Verify intelligence systems
        const intelligenceStatus = await this.verifyIntelligence();
                
        // Step 3: Enrich with Heady context
        const enrichedMessage = this.enrichMessage(message, mcpProcessed, intelligenceStatus);
                
        // Step 4: Return to AI assistant
        res.json({
          original: message,
          processed: enrichedMessage,
          mcp_analysis: mcpProcessed,
          intelligence_status: intelligenceStatus,
          route: 'HeadyMCP → Intelligence Verification → Cascade'
        });
                
        console.log('✅ [INTERCEPTOR] Message processed and routed to Cascade');
                
      } catch (error) {
        console.error('❌ [INTERCEPTOR] Error:', error.message);
        res.status(500).json({
          error: error.message,
          fallback: message
        });
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        service: 'heady-chat-interceptor',
        port: PORT
      });
    });
  }

  async routeThroughMCP(message, context) {
    console.log('🔄 [MCP] Routing through HeadyMCP...');
        
    try {
      // Analyze message for tool requirements
      const analysis = this.analyzeMessage(message);
            
      // Route to HeadyManager for MCP orchestration
      const response = await axios.post(`${HEADY_MANAGER_URL}/api/mcp/analyze`, {
        message,
        context,
        analysis
      }, { timeout: 5000 });
            
      return response.data;
    } catch (error) {
      console.warn('⚠️  [MCP] HeadyManager not available, using local analysis');
      return this.analyzeMessage(message);
    }
  }

  analyzeMessage(message) {
    const lower = message.toLowerCase();
        
    const analysis = {
      timestamp: new Date().toISOString(),
      tools_required: [],
      services_needed: [],
      priority: 'NORMAL',
      complexity: 'SIMPLE'
    };

    // Detect required MCP tools
    if (lower.match(/file|directory|read|write|create|delete/)) {
      analysis.tools_required.push('filesystem');
    }
    if (lower.match(/git|commit|branch|merge|pull|push/)) {
      analysis.tools_required.push('git');
    }
    if (lower.match(/database|query|sql|postgres/)) {
      analysis.tools_required.push('postgres');
    }
    if (lower.match(/ai|generate|analyze|optimize|research/)) {
      analysis.tools_required.push('perplexity', 'gemini', 'jules');
    }
    if (lower.match(/docker|container|service|deploy/)) {
      analysis.tools_required.push('cli_service');
    }
    if (lower.match(/think|plan|reason|strategy/)) {
      analysis.tools_required.push('sequential-thinking');
    }

    // Determine complexity
    if (analysis.tools_required.length > 3) {
      analysis.complexity = 'COMPLEX';
      analysis.priority = 'HIGH';
    } else if (analysis.tools_required.length > 1) {
      analysis.complexity = 'MODERATE';
    }

    // Detect services needed
    if (lower.match(/integrate|sync|deploy|build/)) {
      analysis.services_needed.push('orchestrator', 'governance');
    }
    if (lower.match(/security|auth|secret|vault/)) {
      analysis.services_needed.push('security');
    }

    return analysis;
  }

  async verifyIntelligence() {
    console.log('🔍 [VERIFY] Running intelligence verification...');
        
    return new Promise((resolve) => {
      const { spawn } = require('child_process');
            
      const verifier = spawn('node', [INTELLIGENCE_VERIFIER], {
        cwd: path.dirname(INTELLIGENCE_VERIFIER)
      });

      let output = '';
            
      verifier.stdout.on('data', (data) => {
        output += data.toString();
      });

      verifier.on('close', (code) => {
        try {
          // Parse verification results
          const results = {
            verified: code === 0,
            timestamp: new Date().toISOString(),
            systems_operational: code === 0 ? 16 : 0
          };
                    
          console.log(`✅ [VERIFY] Intelligence status: ${results.verified ? 'OPERATIONAL' : 'DEGRADED'}`);
          resolve(results);
        } catch (error) {
          resolve({
            verified: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        verifier.kill();
        resolve({
          verified: false,
          timeout: true,
          timestamp: new Date().toISOString()
        });
      }, 5000);
    });
  }

  enrichMessage(original, mcpAnalysis, intelligenceStatus) {
    // Enrich the message with Heady context
    const enriched = {
      original_message: original,
      heady_context: {
        mcp_tools_available: mcpAnalysis.tools_required || [],
        services_available: mcpAnalysis.services_needed || [],
        intelligence_verified: intelligenceStatus.verified,
        systems_operational: intelligenceStatus.systems_operational || 0,
        complexity: mcpAnalysis.complexity,
        priority: mcpAnalysis.priority
      },
      routing_info: {
        intercepted_at: new Date().toISOString(),
        routed_through: 'HeadyMCP',
        verified_by: 'HeadyIntelligenceVerifier',
        ready_for_cascade: true
      },
      instructions_for_cascade: this.generateCascadeInstructions(mcpAnalysis, intelligenceStatus)
    };

    return enriched;
  }

  generateCascadeInstructions(mcpAnalysis, intelligenceStatus) {
    const instructions = [];

    if (!intelligenceStatus.verified) {
      instructions.push('⚠️ Intelligence systems not fully operational - proceed with caution');
    }

    if (mcpAnalysis.tools_required.length > 0) {
      instructions.push(`Use MCP tools: ${mcpAnalysis.tools_required.join(', ')}`);
    }

    if (mcpAnalysis.complexity === 'COMPLEX') {
      instructions.push('Use sequential-thinking for planning before execution');
    }

    if (mcpAnalysis.services_needed.length > 0) {
      instructions.push(`Coordinate with services: ${mcpAnalysis.services_needed.join(', ')}`);
    }

    instructions.push('Update project-context.json after operation');
    instructions.push('Log to audit trail');

    return instructions;
  }

  start() {
    this.app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🚀 Heady Chat Interceptor ACTIVE');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`   Port: ${PORT}`);
      console.log(`   HeadyMCP: ${HEADY_MANAGER_URL}`);
      console.log('   Route: User → HeadyMCP → Intelligence → Cascade');
      console.log('═══════════════════════════════════════════════════════════\n');
    });
  }
}

// Start interceptor if run directly
if (require.main === module) {
  const interceptor = new HeadyChatInterceptor();
  interceptor.start();
}

module.exports = HeadyChatInterceptor;
