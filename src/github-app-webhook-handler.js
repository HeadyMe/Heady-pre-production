const crypto = require('crypto');
const { EventEmitter } = require('events');

// GitHub App Configuration
const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY 
  ? Buffer.from(process.env.GITHUB_APP_PRIVATE_KEY, 'base64').toString('utf8')
  : null;
const GITHUB_APP_WEBHOOK_SECRET = process.env.GITHUB_APP_WEBHOOK_SECRET;

class GitHubAppWebhookHandler extends EventEmitter {
  constructor(options = {}) {
    super();
    this.appId = options.appId || GITHUB_APP_ID;
    this.webhookSecret = options.webhookSecret || GITHUB_APP_WEBHOOK_SECRET;
    this.privateKey = options.privateKey || GITHUB_APP_PRIVATE_KEY;
    
    // Statistics
    this.stats = {
      webhooksReceived: 0,
      webhooksProcessed: 0,
      webhooksFailed: 0,
      lastWebhook: null,
      eventCounts: {}
    };
  }

  /**
   * Verify GitHub webhook signature
   */
  verifySignature(payload, signature) {
    if (!this.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );

    return isValid;
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(req, res) {
    this.stats.webhooksReceived++;

    try {
      // Get headers
      const event = req.headers['x-github-event'];
      const deliveryId = req.headers['x-github-delivery'];
      const signature = req.headers['x-hub-signature-256'];

      if (!event || !deliveryId || !signature) {
        return res.status(400).json({
          ok: false,
          error: 'Missing required headers'
        });
      }

      // Verify signature
      const payload = JSON.stringify(req.body);
      if (!this.verifySignature(payload, signature)) {
        this.stats.webhooksFailed++;
        return res.status(401).json({
          ok: false,
          error: 'Invalid signature'
        });
      }

      // Update stats
      this.stats.lastWebhook = new Date().toISOString();
      this.stats.eventCounts[event] = (this.stats.eventCounts[event] || 0) + 1;

      // Process event
      await this.processEvent(event, req.body, deliveryId);

      this.stats.webhooksProcessed++;
      
      res.status(200).json({
        ok: true,
        event,
        deliveryId
      });

    } catch (error) {
      this.stats.webhooksFailed++;
      console.error('Webhook processing error:', error);
      
      res.status(500).json({
        ok: false,
        error: 'Webhook processing failed'
      });
    }
  }

  /**
   * Process different webhook events
   */
  async processEvent(event, payload, deliveryId) {
    const context = {
      event,
      deliveryId,
      payload,
      timestamp: new Date().toISOString()
    };

    // Emit event for external handlers
    this.emit('webhook', context);
    this.emit(event, context);

    // Handle specific events
    switch (event) {
    case 'pull_request':
      await this.handlePullRequest(context);
      break;
    case 'push':
      await this.handlePush(context);
      break;
    case 'issues':
      await this.handleIssues(context);
      break;
    case 'issue_comment':
      await this.handleIssueComment(context);
      break;
    case 'check_run':
      await this.handleCheckRun(context);
      break;
    case 'check_suite':
      await this.handleCheckSuite(context);
      break;
    case 'security_advisory':
      await this.handleSecurityAdvisory(context);
      break;
    case 'repository':
      await this.handleRepository(context);
      break;
    default:
      // Log unhandled events
      console.log(`Unhandled GitHub event: ${event}`);
    }
  }

  /**
   * Handle pull_request events
   */
  async handlePullRequest(context) {
    const { payload } = context;
    const action = payload.action;
    const pr = payload.pull_request;

    console.log(`PR ${action}: #${pr.number} - ${pr.title}`);

    if (['opened', 'synchronize', 'reopened'].includes(action)) {
      // Validate branch name
      await this.validateBranchName(context);
      
      // Check for required files
      await this.checkRequiredFiles(context);
      
      // Validate PR compliance
      await this.validatePRCompliance(context);
    }

    this.emit('pull_request_processed', context);
  }

  /**
   * Handle push events
   */
  async handlePush(context) {
    const { payload } = context;
    const ref = payload.ref;
    const commits = payload.commits || [];

    console.log(`Push to ${ref}: ${commits.length} commit(s)`);

    // Check for sensitive data in commits
    await this.scanCommitsForSecrets(context);

    this.emit('push_processed', context);
  }

  /**
   * Handle issues events
   */
  async handleIssues(context) {
    const { payload } = context;
    const action = payload.action;
    const issue = payload.issue;

    console.log(`Issue ${action}: #${issue.number} - ${issue.title}`);

    if (action === 'opened') {
      // Auto-label based on content
      await this.autoLabelIssue(context);
    }

    this.emit('issues_processed', context);
  }

  /**
   * Handle issue_comment events
   */
  async handleIssueComment(context) {
    const { payload } = context;
    const comment = payload.comment;

    console.log(`Comment on #${payload.issue.number}: ${comment.body.substring(0, 50)}...`);

    this.emit('issue_comment_processed', context);
  }

  /**
   * Handle check_run events
   */
  async handleCheckRun(context) {
    const { payload } = context;
    const checkRun = payload.check_run;

    console.log(`Check run ${checkRun.name}: ${checkRun.status} - ${checkRun.conclusion || 'pending'}`);

    this.emit('check_run_processed', context);
  }

  /**
   * Handle check_suite events
   */
  async handleCheckSuite(context) {
    const { payload } = context;
    const checkSuite = payload.check_suite;

    console.log(`Check suite ${checkSuite.id}: ${checkSuite.status} - ${checkSuite.conclusion || 'pending'}`);

    this.emit('check_suite_processed', context);
  }

  /**
   * Handle security_advisory events
   */
  async handleSecurityAdvisory(context) {
    const { payload } = context;
    const advisory = payload.security_advisory;

    console.log(`Security advisory ${payload.action}: ${advisory.summary}`);

    // Alert on new security advisories
    if (payload.action === 'published') {
      await this.alertSecurityTeam(context);
    }

    this.emit('security_advisory_processed', context);
  }

  /**
   * Handle repository events
   */
  async handleRepository(context) {
    const { payload } = context;
    const action = payload.action;
    const repo = payload.repository;

    console.log(`Repository ${action}: ${repo.full_name}`);

    this.emit('repository_processed', context);
  }

  /**
   * Validate branch naming conventions
   */
  async validateBranchName(context) {
    const { payload } = context;
    const branchName = payload.pull_request.head.ref;
    
    const validPrefixes = ['feature/', 'bugfix/', 'hotfix/', 'release/', 'copilot/'];
    const isValid = validPrefixes.some(prefix => branchName.startsWith(prefix));

    if (!isValid) {
      console.warn(`Invalid branch name: ${branchName}`);
      // Could post a comment or create a check here
    }

    return isValid;
  }

  /**
   * Check for required files in repository
   */
  async checkRequiredFiles(_context) {
    // This would use GitHub API to check for files
    // For now, just log
    console.log('Checking required files...');
    return true;
  }

  /**
   * Validate PR compliance
   */
  async validatePRCompliance(context) {
    const { payload } = context;
    const pr = payload.pull_request;
    
    // Check PR description length
    const hasDescription = pr.body && pr.body.length > 20;
    
    if (!hasDescription) {
      console.warn(`PR #${pr.number} has insufficient description`);
    }

    return hasDescription;
  }

  /**
   * Scan commits for potential secrets
   */
  async scanCommitsForSecrets(context) {
    const { payload } = context;
    const commits = payload.commits || [];

    // Simple pattern matching for common secrets
    const secretPatterns = [
      /api[_-]?key/i,
      /password/i,
      /secret/i,
      /token/i,
      /private[_-]?key/i,
      /-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----/
    ];

    for (const commit of commits) {
      const message = commit.message || '';
      
      for (const pattern of secretPatterns) {
        if (pattern.test(message)) {
          console.warn(`Potential secret in commit ${commit.id}: matches ${pattern}`);
        }
      }
    }
  }

  /**
   * Auto-label issues based on content
   */
  async autoLabelIssue(context) {
    const { payload } = context;
    const issue = payload.issue;
    const title = (issue.title || '').toLowerCase();
    const body = (issue.body || '').toLowerCase();
    const content = title + ' ' + body;

    const labels = [];

    if (content.includes('bug') || content.includes('error') || content.includes('issue')) {
      labels.push('bug');
    }
    if (content.includes('feature') || content.includes('enhancement')) {
      labels.push('enhancement');
    }
    if (content.includes('documentation') || content.includes('docs')) {
      labels.push('documentation');
    }
    if (content.includes('security') || content.includes('vulnerability')) {
      labels.push('security');
    }

    if (labels.length > 0) {
      console.log(`Auto-labeling issue #${issue.number} with: ${labels.join(', ')}`);
      // Would use GitHub API to apply labels
    }

    return labels;
  }

  /**
   * Alert security team
   */
  async alertSecurityTeam(context) {
    const { payload } = context;
    const advisory = payload.security_advisory;

    console.log(`🚨 SECURITY ALERT: ${advisory.summary}`);
    console.log(`   Severity: ${advisory.severity}`);
    console.log(`   Package: ${advisory.package?.name || 'N/A'}`);
    
    // In production, this would send notifications via email, Slack, etc.
  }

  /**
   * Get handler statistics
   */
  getStats() {
    return {
      ...this.stats,
      uptime: process.uptime(),
      isConfigured: !!(this.appId && this.webhookSecret && this.privateKey)
    };
  }
}

module.exports = GitHubAppWebhookHandler;
