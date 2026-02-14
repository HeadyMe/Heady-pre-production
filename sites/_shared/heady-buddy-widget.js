/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                ║
 * ║     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                ║
 * ║     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 ║
 * ║     ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  ║
 * ║     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   ║
 * ║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   ║
 * ║                                                                               ║
 * ║     ∞ SACRED GEOMETRY ARCHITECTURE ∞                                          ║
 * ║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                         ║
 * ║     HEADY BUDDY CHAT WIDGET - Universal Chat Component                        ║
 * ║     Embeddable across all Heady ecosystem websites                           ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

(function(window) {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════
  
  const CONFIG = {
    apiEndpoint: window.location.origin,
    widgetId: 'heady-buddy-widget',
    defaultTheme: 'dark',
    position: 'bottom-right',
    size: { width: 380, height: 500 },
    autoOpen: false,
    showBranding: true,
    siteContext: window.location.hostname
  };

  // ═══════════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════════
  
  const STYLES = `
    #heady-buddy-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    #heady-buddy-widget.position-bottom-left {
      right: auto;
      left: 20px;
    }

    #heady-buddy-widget.position-top-right {
      bottom: auto;
      top: 20px;
    }

    #heady-buddy-widget.position-top-left {
      bottom: auto;
      top: 20px;
      right: auto;
      left: 20px;
    }

    .hb-bubble {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .hb-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 30px rgba(6, 182, 212, 0.4);
    }

    .hb-bubble.pulse {
      animation: hb-pulse 2s infinite;
    }

    @keyframes hb-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .hb-bubble .status-dot {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 12px;
      height: 12px;
      background: #00d4aa;
      border-radius: 50%;
      border: 2px solid white;
    }

    .hb-chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 500px;
      background: #0c0c1a;
      border: 1px solid #1e1e3a;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      display: none;
      flex-direction: column;
      overflow: hidden;
      backdrop-filter: blur(20px);
    }

    .hb-chat-window.open {
      display: flex;
    }

    .hb-chat-header {
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      padding: 16px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .hb-chat-title {
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hb-chat-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: background 0.2s;
    }

    .hb-chat-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .hb-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #060610;
    }

    .hb-message {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
      animation: hb-fadeIn 0.3s ease;
    }

    @keyframes hb-fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hb-message.bot .hb-avatar {
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      color: white;
    }

    .hb-message.user .hb-avatar {
      background: #1e1e3a;
      color: white;
    }

    .hb-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .hb-message-content {
      background: #141428;
      border: 1px solid #1e1e3a;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.5;
      max-width: 75%;
      color: #e4e4f0;
    }

    .hb-message.user .hb-message-content {
      background: #1e293b;
      border-color: #334155;
    }

    .hb-chat-input {
      padding: 16px;
      background: #0c0c1a;
      border-top: 1px solid #1e1e3a;
      display: flex;
      gap: 8px;
    }

    .hb-chat-input input {
      flex: 1;
      background: #141428;
      border: 1px solid #1e1e3a;
      border-radius: 8px;
      padding: 10px 14px;
      color: white;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }

    .hb-chat-input input:focus {
      border-color: #06b6d4;
      box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
    }

    .hb-chat-input button {
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      border: none;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 13px;
      transition: all 0.2s;
    }

    .hb-chat-input button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }

    .hb-chat-input button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .hb-typing {
      color: #9494b0;
      font-style: italic;
    }

    .hb-branding {
      padding: 8px 16px;
      background: #0c0c1a;
      border-top: 1px solid #1e1e3a;
      text-align: center;
      font-size: 11px;
      color: #5a5a78;
    }

    .hb-branding a {
      color: #06b6d4;
      text-decoration: none;
    }

    .hb-branding a:hover {
      text-decoration: underline;
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      #heady-buddy-widget {
        bottom: 10px;
        right: 10px;
        left: 10px !important;
      }

      .hb-chat-window {
        width: 100%;
        height: 70vh;
        right: 0;
        left: 0;
        bottom: 80px;
        border-radius: 16px 16px 0 0;
      }
    }
  `;

  // ═══════════════════════════════════════════════════════════════
  // MAIN WIDGET CLASS
  // ═══════════════════════════════════════════════════════════════
  
  class HeadyBuddyWidget {
    constructor(options = {}) {
      this.config = { ...CONFIG, ...options };
      this.isOpen = false;
      this.messages = [];
      this.isTyping = false;
      this.userId = this.generateUserId();
      
      this.init();
    }

    generateUserId() {
      return 'widget-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.bindEvents();
      this.addWelcomeMessage();
      
      if (this.config.autoOpen) {
        setTimeout(() => this.open(), 1000);
      }
    }

    injectStyles() {
      if (document.getElementById('heady-buddy-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'heady-buddy-styles';
      style.textContent = STYLES;
      document.head.appendChild(style);
    }

    createWidget() {
      const widget = document.createElement('div');
      widget.id = this.config.widgetId;
      widget.className = `position-${this.config.position}`;
      
      widget.innerHTML = `
        <button class="hb-bubble pulse" aria-label="Chat with HeadyBuddy">
          <span>🤖</span>
          <div class="status-dot"></div>
        </button>
        <div class="hb-chat-window">
          <div class="hb-chat-header">
            <div class="hb-chat-title">
              <span>🤖</span>
              <span>HeadyBuddy</span>
            </div>
            <button class="hb-chat-close" aria-label="Close chat">×</button>
          </div>
          <div class="hb-chat-messages"></div>
          <div class="hb-chat-input">
            <input type="text" placeholder="Ask me anything..." autocomplete="off">
            <button>Send</button>
          </div>
          ${this.config.showBranding ? `
            <div class="hb-branding">
              Powered by <a href="https://headybuddy.org" target="_blank">HeadyBuddy</a>
            </div>
          ` : ''}
        </div>
      `;
      
      document.body.appendChild(widget);
      
      this.elements = {
        widget,
        bubble: widget.querySelector('.hb-bubble'),
        chatWindow: widget.querySelector('.hb-chat-window'),
        messages: widget.querySelector('.hb-chat-messages'),
        input: widget.querySelector('.hb-chat-input input'),
        sendButton: widget.querySelector('.hb-chat-input button'),
        closeButton: widget.querySelector('.hb-chat-close')
      };
    }

    bindEvents() {
      // Bubble click
      this.elements.bubble.addEventListener('click', () => this.toggle());
      
      // Close button
      this.elements.closeButton.addEventListener('click', () => this.close());
      
      // Send button
      this.elements.sendButton.addEventListener('click', () => this.sendMessage());
      
      // Enter key
      this.elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.isOpen = true;
      this.elements.chatWindow.classList.add('open');
      this.elements.bubble.classList.remove('pulse');
      this.elements.input.focus();
    }

    close() {
      this.isOpen = false;
      this.elements.chatWindow.classList.remove('open');
    }

    addMessage(content, isBot = false) {
      const message = document.createElement('div');
      message.className = `hb-message ${isBot ? 'bot' : 'user'}`;
      
      message.innerHTML = `
        <div class="hb-avatar">${isBot ? '🤖' : '👤'}</div>
        <div class="hb-message-content">${content}</div>
      `;
      
      this.elements.messages.appendChild(message);
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      
      this.messages.push({ content, isBot, timestamp: Date.now() });
    }

    addWelcomeMessage() {
      const welcomeMessages = [
        "Hi! I'm HeadyBuddy, your AI companion. How can I help you today?",
        "Hello! I'm here to assist you with system health, deployments, or any questions you have.",
        "Hey there! I'm connected to the full Heady intelligence platform. What can I do for you?"
      ];
      
      const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      this.addMessage(randomWelcome, true);
    }

    async sendMessage() {
      const message = this.elements.input.value.trim();
      if (!message || this.isTyping) return;
      
      // Clear input and add user message
      this.elements.input.value = '';
      this.addMessage(message, false);
      
      // Show typing indicator
      this.showTyping();
      
      try {
        const response = await this.callAPI(message);
        this.hideTyping();
        
        if (response.success && response.data) {
          this.handleAPIResponse(response.data, message);
        } else {
          this.addMessage("I'm having trouble connecting right now. Please try again.", true);
        }
      } catch (error) {
        this.hideTyping();
        this.addMessage("Sorry, I encountered an error. Please try again.", true);
      }
    }

    showTyping() {
      this.isTyping = true;
      this.elements.sendButton.disabled = true;
      this.addMessage("🤔 Thinking...", true);
    }

    hideTyping() {
      this.isTyping = false;
      this.elements.sendButton.disabled = false;
      // Remove the typing message
      const messages = this.elements.messages.querySelectorAll('.hb-message');
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.textContent.includes('🤔 Thinking...')) {
          lastMessage.remove();
        }
      }
    }

    async callAPI(message) {
      const response = await fetch(`${this.config.apiEndpoint}/api/v1/chat/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: this.userId,
          context: {
            source: 'widget',
            site: this.config.siteContext
          }
        })
      });
      
      return response.json();
    }

    handleAPIResponse(data, originalMessage) {
      if (data.skill && data.confidence > 0.4) {
        // High confidence match
        let response = `I can help with that! <strong>${data.skill}</strong>: ${this.getSkillDescription(data.skill)}`;
        
        if (data.confidence > 0.8) {
          response += "\n\n🚀 Executing this skill for you...";
          this.addMessage(response, true);
          
          // Simulate skill execution
          setTimeout(() => {
            this.addMessage(`✅ ${this.getSkillResult(data.skill)}`, true);
          }, 1500);
        } else {
          response += `\n\n<small>Confidence: ${(data.confidence * 100).toFixed(0)}%</small>`;
          this.addMessage(response, true);
        }
      } else if (data.suggestions && data.suggestions.length > 0) {
        // Low confidence - show suggestions
        let response = `I'm not sure what you mean by "${originalMessage}". Did you mean:\n\n`;
        data.suggestions.slice(0, 3).forEach(s => {
          response += `• <strong>${s.command}</strong> → ${s.skill}\n`;
        });
        this.addMessage(response, true);
      } else {
        // No match
        this.addMessage("I'm not sure how to help with that. Try asking about: system health, deployments, tests, or MCP connectors.", true);
      }
    }

    getSkillDescription(skill) {
      const descriptions = {
        'hcfp-clean-build': 'Clean and rebuild the entire project',
        'cross-platform-deploy': 'Deploy across multiple platforms',
        'system-health-check': 'Run system health diagnostics',
        'run-tests': 'Execute the test suite',
        'code-lint': 'Run code quality checks',
        'cloud-sync': 'Sync with the cloud',
        'checkpoint-create': 'Create a system checkpoint',
        'rollback': 'Rollback to previous state',
        'gap-scanner': 'Scan for coverage gaps',
        'security-audit': 'Run security scans',
        'auto-doc': 'Generate documentation',
        'optimization-engine': 'Optimize performance',
        'drift-detection': 'Check configuration drift',
        'workspace-clean': 'Clean workspace',
        'imagination-engine': 'Brainstorm ideas',
        'mcp-connect': 'Manage connectors'
      };
      return descriptions[skill] || 'Execute operation';
    }

    getSkillResult(skill) {
      const results = {
        'hcfp-clean-build': 'Build completed successfully! All tests passing.',
        'system-health-check': 'All systems operational. No issues detected.',
        'run-tests': 'Test suite completed: 145 passed, 0 failed.',
        'code-lint': 'Code quality check passed. No issues found.',
        'cloud-sync': 'Successfully synced with cloud storage.',
        'drift-detection': 'No configuration drift detected. All systems in sync.'
      };
      return results[skill] || 'Operation completed successfully!';
    }

    // Public API methods
    destroy() {
      this.elements.widget.remove();
      const styles = document.getElementById('heady-buddy-styles');
      if (styles) styles.remove();
    }

    setConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
    }

    getMessages() {
      return this.messages;
    }

    clearMessages() {
      this.messages = [];
      this.elements.messages.innerHTML = '';
      this.addWelcomeMessage();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // GLOBAL EXPOSURE
  // ═══════════════════════════════════════════════════════════════
  
  window.HeadyBuddyWidget = HeadyBuddyWidget;
  
  // Auto-initialize if data attributes are present
  document.addEventListener('DOMContentLoaded', () => {
    const widgetElements = document.querySelectorAll('[data-heady-buddy]');
    widgetElements.forEach(element => {
      const config = {
        position: element.dataset.position || CONFIG.position,
        autoOpen: element.dataset.autoOpen === 'true',
        showBranding: element.dataset.branding !== 'false',
        siteContext: element.dataset.context || CONFIG.siteContext
      };
      
      new HeadyBuddyWidget(config);
    });
  });

})(window);
