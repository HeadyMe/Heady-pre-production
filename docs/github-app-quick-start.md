# GitHub App Quick Integration Guide

This guide walks you through integrating the Heady Governance Bot with your repository in 10 minutes.

## Prerequisites

- GitHub organization admin access (for HeadyMe or HeadySystems)
- Access to Render.com deployment dashboard
- Basic understanding of environment variables

## Step 1: Register the GitHub App (5 minutes)

1. **Navigate to GitHub App creation:**
   ```
   https://github.com/organizations/HeadyMe/settings/apps/new
   ```

2. **Click "From a manifest"**

3. **Paste the manifest from `.github/github-app-manifest.json`:**
   - Open the file in your repository
   - Copy the entire JSON content
   - Paste into the manifest text area
   - Click "Create GitHub App"

4. **Generate a private key:**
   - Scroll down to "Private keys" section
   - Click "Generate a private key"
   - Save the downloaded `heady-governance-bot.pem` file securely
   - **IMPORTANT**: Keep this file safe - you'll need it in the next step

5. **Note your credentials:**
   - App ID (shown at top of page)
   - Webhook secret (auto-generated from manifest)

## Step 2: Configure Environment Variables (3 minutes)

1. **Encode the private key:**
   ```bash
   # On Linux/Mac:
   cat heady-governance-bot.pem | base64 -w 0 > private-key-base64.txt
   
   # On Windows (PowerShell):
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("heady-governance-bot.pem")) > private-key-base64.txt
   ```

2. **Add secrets to Render:**
   - Go to Render dashboard → Your service
   - Navigate to Environment tab
   - Add these secrets to `heady-shared-secrets` group:
     ```
     GITHUB_APP_ID=<your-app-id>
     GITHUB_APP_PRIVATE_KEY=<contents-of-private-key-base64.txt>
     GITHUB_APP_WEBHOOK_SECRET=<webhook-secret-from-github>
     ```

3. **Trigger a redeploy:**
   - Go to Manual Deploy tab
   - Click "Deploy latest commit"
   - Wait for deployment to complete (~2 minutes)

## Step 3: Install the App (2 minutes)

1. **Install on repositories:**
   - Go back to your GitHub App settings
   - Click "Install App" in the left sidebar
   - Select your organization
   - Choose repositories:
     - Install on "All repositories", OR
     - Select specific repositories (recommended):
       - HeadyMe/Heady
       - HeadySystems/HeadyConnection
       - (Add others as needed)
   - Click "Install"

2. **Verify installation:**
   - Go to any selected repository
   - Navigate to Settings → Integrations → Applications
   - You should see "Heady Governance Bot" listed

## Step 4: Test the Integration (2 minutes)

1. **Check app status:**
   ```bash
   curl https://heady-manager.onrender.com/api/github/app/status
   ```
   
   Expected response:
   ```json
   {
     "ok": true,
     "webhooksReceived": 0,
     "webhooksProcessed": 0,
     "isConfigured": true
   }
   ```

2. **Create a test PR:**
   - In a test repository, create a new branch:
     ```bash
     git checkout -b feature/test-github-app
     echo "Testing GitHub App" > test-file.txt
     git add test-file.txt
     git commit -m "test: GitHub App integration"
     git push origin feature/test-github-app
     ```
   - Open a Pull Request on GitHub
   - The app should automatically process the webhook

3. **Verify webhook delivery:**
   - Go to GitHub App settings → Advanced → Recent Deliveries
   - You should see a `pull_request` event with a green checkmark
   - Click to view details - should show 200 OK response

4. **Check app logs:**
   - Go to Render dashboard → Logs
   - You should see log entries like:
     ```
     PR opened: #<number> - <title>
     Checking required files...
     ```

## Troubleshooting

### Webhook not received
- Verify webhook URL is set to: `https://heady-manager.onrender.com/api/github/webhooks`
- Check Render service is running and accessible
- Review GitHub webhook delivery details for errors

### 401 Unauthorized on webhook
- Verify `GITHUB_APP_WEBHOOK_SECRET` matches in both GitHub and Render
- Check for extra whitespace in environment variable
- Regenerate webhook secret if needed

### Private key errors
- Ensure private key is base64 encoded correctly
- Verify no line breaks in the base64 string
- Try regenerating the private key

### App not appearing in repository
- Check app installation settings
- Verify app has access to the organization
- Ensure you selected the correct repositories during installation

## What Happens Next?

Once installed, the Heady Governance Bot will automatically:

- ✅ Validate branch names on PRs (must start with `feature/`, `bugfix/`, `hotfix/`)
- ✅ Check for required repository files
- ✅ Monitor security advisories and create alerts
- ✅ Track PR compliance (description length, etc.)
- ✅ Scan commits for potential secrets
- ✅ Auto-label issues based on content

All events are logged and can be viewed in:
- Render dashboard logs
- GitHub App webhook deliveries
- App status endpoint: `/api/github/app/status`

## Advanced Configuration

### Custom Event Handlers

To add custom logic for specific events, edit `src/github-app-webhook-handler.js`:

```javascript
// Example: Custom handler for new issues
async handleIssues(context) {
  const { payload } = context;
  const action = payload.action;
  const issue = payload.issue;

  if (action === 'opened') {
    // Your custom logic here
    console.log(`New issue: ${issue.title}`);
    
    // Could integrate with external services
    // Could create automatic responses
    // Could trigger workflows
  }

  this.emit('issues_processed', context);
}
```

### Adding New Features

The webhook handler is extensible. Common additions:

1. **Slack/Discord notifications**: Send alerts to team channels
2. **Automated PR reviews**: Integrate with code analysis tools
3. **Custom compliance checks**: Add organization-specific rules
4. **Metrics collection**: Track team productivity and code quality

See [GitHub App Setup Guide](github-app-setup.md) for detailed documentation.

## Security Best Practices

1. **Rotate secrets regularly** - Update webhook secret and private key quarterly
2. **Monitor webhook deliveries** - Review for suspicious activity
3. **Use least privilege** - Only grant necessary permissions
4. **Audit logs** - Regularly review app activity logs
5. **Test in staging** - Always test changes in a non-production repository first

## Support

- Documentation: [docs/github-app-setup.md](github-app-setup.md)
- Issues: [github.com/HeadyMe/Heady/issues](https://github.com/HeadyMe/Heady/issues)
- Tests: Run `node tests/test-github-app-webhook.js`

---

**Time to complete**: ~10 minutes  
**Difficulty**: Beginner  
**Prerequisites**: GitHub admin access, Render deployment access
