/**
 * Heady User Dashboard & Billing UI
 * 
 * Provides:
 * - User profile management
 * - Subscription management
 * - Usage metrics
 * - Billing history
 * - Payment methods
 */

class HeadyUserDashboard {
  constructor() {
    this.routes = new Map();
    this.setupRoutes();
  }

  setupRoutes() {
    // Dashboard home
    this.routes.set('GET /dashboard', this.renderDashboard.bind(this));
    
    // Profile management
    this.routes.set('GET /dashboard/profile', this.renderProfile.bind(this));
    this.routes.set('POST /dashboard/profile', this.updateProfile.bind(this));
    
    // Billing & subscription
    this.routes.set('GET /dashboard/billing', this.renderBilling.bind(this));
    this.routes.set('POST /dashboard/subscribe', this.createSubscription.bind(this));
    this.routes.set('POST /dashboard/cancel', this.cancelSubscription.bind(this));
    
    // Usage metrics
    this.routes.set('GET /dashboard/usage', this.renderUsage.bind(this));
    
    // API keys
    this.routes.set('GET /dashboard/api-keys', this.renderApiKeys.bind(this));
    this.routes.set('POST /dashboard/api-keys', this.createApiKey.bind(this));
    this.routes.set('DELETE /dashboard/api-keys/:id', this.deleteApiKey.bind(this));
  }

  // Render dashboard HTML
  renderDashboard(req, res) {
    const user = req.user;
    const auth = req.app.locals.auth;
    const payments = req.app.locals.payments;

    const subscriptionInfo = auth.getSubscriptionInfo(user);
    const usageMetrics = payments.getUsageMetrics(user.id);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heady Dashboard - ${user.metadata.name}</title>
  <meta name="theme-color" content="#00e5cc">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x221e;</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #060610; --surface: #0c0c1a; --surface2: #141428;
      --border: #1e1e3a; --accent: #00e5cc; --accent2: #0099ff;
      --text: #e4e4f0; --text2: #9494b0; --text3: #5a5a78;
      --success: #10b981; --warning: #f59e0b; --error: #ef4444;
    }
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg); color: var(--text);
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem 0; border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    .logo {
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 1.5rem; font-weight: 700; color: var(--accent);
    }
    .user-menu {
      display: flex; align-items: center; gap: 1rem;
    }
    .avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; color: white;
    }
    .nav-tabs {
      display: flex; gap: 1rem; margin-bottom: 2rem;
      border-bottom: 1px solid var(--border);
    }
    .nav-tab {
      padding: 1rem 1.5rem; background: none; border: none;
      color: var(--text2); cursor: pointer; border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .nav-tab:hover { color: var(--text); }
    .nav-tab.active {
      color: var(--accent); border-bottom-color: var(--accent);
    }
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;
    }
    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem;
    }
    .card-title { font-size: 1.25rem; font-weight: 600; }
    .badge {
      padding: 0.25rem 0.75rem; border-radius: 100px;
      font-size: 0.875rem; font-weight: 500;
    }
    .badge-pro { background: #3b82f620; color: #60a5fa; }
    .badge-enterprise { background: #8b5cf620; color: #a78bfa; }
    .badge-free { background: #6b728020; color: #9ca3af; }
    .usage-bar {
      height: 8px; background: var(--surface2); border-radius: 4px;
      margin: 0.5rem 0; overflow: hidden;
    }
    .usage-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2));
      transition: width 0.3s;
    }
    .btn {
      padding: 0.75rem 1.5rem; border: none; border-radius: 8px;
      font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: white;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px var(--accent)40; }
    .btn-secondary {
      background: var(--surface2); color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { background: var(--border); }
    .grid {
      display: grid; gap: 1.5rem;
    }
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    .stat {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 0; border-bottom: 1px solid var(--border);
    }
    .stat:last-child { border-bottom: none; }
    .stat-label { color: var(--text2); }
    .stat-value { font-weight: 600; }
    .progress-ring {
      width: 120px; height: 120px; margin: 0 auto;
    }
    .progress-ring-circle {
      transition: stroke-dashoffset 0.3s;
      transform: rotate(-90deg); transform-origin: 50% 50%;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="logo">
        <svg width="32" height="32" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="23" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.6"/>
          <text x="24" y="28" text-anchor="middle" fill="currentColor" font-size="16" font-weight="700">∞</text>
        </svg>
        Heady Dashboard
      </div>
      <div class="user-menu">
        <span>Welcome, ${user.metadata.name}</span>
        <div class="avatar">${user.metadata.name.charAt(0).toUpperCase()}</div>
      </div>
    </header>

    <div class="nav-tabs">
      <button class="nav-tab active" onclick="showTab('overview')">Overview</button>
      <button class="nav-tab" onclick="showTab('billing')">Billing</button>
      <button class="nav-tab" onclick="showTab('usage')">Usage</button>
      <button class="nav-tab" onclick="showTab('profile')">Profile</button>
      <button class="nav-tab" onclick="showTab('api-keys')">API Keys</button>
    </div>

    <div id="tab-content">
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Subscription</h2>
            <span class="badge badge-${subscriptionInfo.tier}">${subscriptionInfo.name}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Current Plan</span>
            <span class="stat-value">${subscriptionInfo.name}</span>
          </div>
          <div class="stat">
            <span class="stat-label">API Calls</span>
            <span class="stat-value">${usageMetrics.current.apiCalls.toLocaleString()} / ${usageMetrics.limits.apiCalls.toLocaleString()}</span>
          </div>
          <div class="usage-bar">
            <div class="usage-fill" style="width: ${usageMetrics.percentages.apiCalls}%"></div>
          </div>
          <div class="stat">
            <span class="stat-label">Storage</span>
            <span class="stat-value">${usageMetrics.current.storage}MB / ${usageMetrics.limits.storage}MB</span>
          </div>
          <div class="usage-bar">
            <div class="usage-fill" style="width: ${usageMetrics.percentages.storage}%"></div>
          </div>
          <div style="margin-top: 1.5rem;">
            <button class="btn btn-primary" onclick="upgradePlan()">Upgrade Plan</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Quick Stats</h2>
          </div>
          <div class="stat">
            <span class="stat-label">Member Since</span>
            <span class="stat-value">${new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Last Login</span>
            <span class="stat-value">${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Account Type</span>
            <span class="stat-value">${user.roles.join(', ')}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Available Features</span>
            <span class="stat-value">${subscriptionInfo.features.length} features</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Available Features</h2>
        </div>
        <div class="grid grid-3">
          ${subscriptionInfo.features.map(feature => `
            <div style="padding: 1rem; background: var(--surface2); border-radius: 8px; text-align: center;">
              <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">✓</div>
              <div style="font-weight: 500;">${feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>

  <script>
    function showTab(tab) {
      // Tab switching logic would go here
      console.log('Switching to tab:', tab);
    }
    
    function upgradePlan() {
      window.location.href = '/dashboard/billing';
    }
  </script>
</body>
</html>`;

    res.send(html);
  }

  // Render billing page
  renderBilling(req, res) {
    const user = req.user;
    // Implementation for billing page
    res.send('<h1>Billing Page - Coming Soon</h1>');
  }

  // Create subscription
  async createSubscription(req, res) {
    try {
      const { plan, interval } = req.body;
      const payments = req.app.locals.payments;
      
      const session = await payments.createSubscriptionCheckout(user.id, plan, interval);
      res.json({ checkoutUrl: session.url });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const payments = req.app.locals.payments;
      await payments.cancelSubscription(req.user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Render usage metrics
  renderUsage(req, res) {
    const user = req.user;
    const payments = req.app.locals.payments;
    const metrics = payments.getUsageMetrics(user.id);
    
    res.json(metrics);
  }

  // Render profile
  renderProfile(req, res) {
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      name: user.metadata.name,
      createdAt: user.createdAt,
      roles: user.roles
    });
  }

  // Update profile
  updateProfile(req, res) {
    const user = req.user;
    const { name } = req.body;
    
    user.metadata.name = name;
    res.json({ success: true, user: { name } });
  }

  // Render API keys
  renderApiKeys(req, res) {
    res.send('<h1>API Keys - Coming Soon</h1>');
  }

  // Create API key
  createApiKey(req, res) {
    res.json({ error: 'Not implemented yet' });
  }

  // Delete API key
  deleteApiKey(req, res) {
    res.json({ error: 'Not implemented yet' });
  }
}

module.exports = { HeadyUserDashboard };
