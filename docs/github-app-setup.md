# Heady GitHub App Setup Guide

This guide provides step-by-step instructions for registering and configuring the Heady Governance Bot - a custom GitHub App designed for the HeadyConnection ecosystem.

## Table of Contents

- [Overview](#overview)
- [Registration Steps](#registration-steps)
- [Security Considerations](#security-considerations)
- [Event Handling](#event-handling)
- [Deployment](#deployment)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

## Overview

The Heady Governance Bot is a custom GitHub App that provides:

- **Automated Compliance Checks**: Ensures all repositories follow governance policies
- **Security Monitoring**: Real-time security event tracking and alerts
- **Repository Health**: Automated health checks and recommendations
- **Custom Integrations**: Deep integration with Heady ecosystem tools
- **Governance Enforcement**: Enforces branch protection, review requirements, and security policies

## Registration Steps

### Option 1: Using the App Manifest (Recommended)

1. **Navigate to GitHub App creation page:**
   ```
   https://github.com/organizations/HeadyMe/settings/apps/new
   ```
   Or for personal accounts:
   ```
   https://github.com/settings/apps/new
   ```

2. **Use the manifest file:**
   - Click "From a manifest"
   - Paste the contents of `.github/github-app-manifest.json`
   - Click "Create GitHub App"

3. **Generate Private Key:**
   - After creation, scroll down to "Private keys"
   - Click "Generate a private key"
   - Save the downloaded `.pem` file securely
   - This key is required for authenticating as the app

4. **Note Your App Details:**
   - App ID (shown at the top of the page)
   - Client ID (in the OAuth credentials section)
   - Client Secret (generate one if needed)

### Option 2: Manual Registration

1. **Go to GitHub App Settings:**
   - Navigate to Organization/User Settings → Developer settings → GitHub Apps
   - Click "New GitHub App"

2. **Fill in Basic Information:**
   - **Name**: `Heady Governance Bot`
   - **Description**: `Custom GitHub App for HeadyConnection ecosystem compliance and governance`
   - **Homepage URL**: `https://github.com/HeadyMe/Heady`
   - **Webhook URL**: `https://heady-manager.onrender.com/api/github/webhooks`
   - **Webhook Secret**: Generate a strong secret (save this!)

3. **Set Permissions:**
   - **Repository permissions:**
     - Contents: Read & write
     - Issues: Read & write
     - Pull requests: Read & write
     - Checks: Read & write
     - Commit statuses: Read & write
     - Metadata: Read-only
     - Security events: Read-only
   - **Organization permissions:**
     - Members: Read-only

4. **Subscribe to Events:**
   - push
   - pull_request
   - pull_request_review
   - issues
   - issue_comment
   - check_run
   - check_suite
   - status
   - repository
   - member
   - security_advisory

5. **Configure Settings:**
   - Set "Where can this GitHub App be installed?" to "Only on this account"
   - Uncheck "Active" under Webhook until deployment is ready

6. **Generate Private Key** (as in Option 1, step 3)

## Security Considerations

### Credential Management

1. **Private Key Storage:**
   ```bash
   # Store as environment variable (base64 encoded)
   cat heady-app.pem | base64 -w 0
   # Add to Render secrets as GITHUB_APP_PRIVATE_KEY
   ```

2. **Webhook Secret:**
   ```bash
   # Generate strong secret
   openssl rand -hex 32
   # Add to Render secrets as GITHUB_APP_WEBHOOK_SECRET
   ```

3. **Required Environment Variables:**
   ```bash
   GITHUB_APP_ID=123456              # Your app ID
   GITHUB_APP_PRIVATE_KEY=<base64>   # Base64-encoded private key
   GITHUB_APP_WEBHOOK_SECRET=<hex>   # Webhook signature secret
   GITHUB_APP_CLIENT_ID=<id>         # OAuth client ID (optional)
   GITHUB_APP_CLIENT_SECRET=<secret> # OAuth client secret (optional)
   ```

### Best Practices

1. **Never commit credentials** to the repository
2. **Rotate secrets** regularly (at least quarterly)
3. **Use environment variables** for all sensitive data
4. **Implement rate limiting** on webhook endpoints
5. **Validate webhook signatures** on every request
6. **Log security events** for audit trail
7. **Use least-privilege principle** for permissions

### Webhook Security

The app implements several security measures:

- **Signature Verification**: All webhooks are verified using HMAC-SHA256
- **Replay Protection**: Timestamps are checked to prevent replay attacks
- **IP Allowlisting**: Optional GitHub IP range validation
- **Rate Limiting**: Prevents abuse of webhook endpoints

## Event Handling

The Heady GitHub App handles the following events:

### Pull Request Events

**Event**: `pull_request`
**Actions**: opened, synchronize, reopened, edited, closed

**Automated Checks:**
- Compliance validation (branch naming, commit messages)
- Security scan initiation
- Code quality checks
- Required file validation (CHANGELOG, LICENSE, etc.)

### Push Events

**Event**: `push`

**Actions:**
- Trigger CI/CD pipelines
- Update deployment status
- Scan for secrets or sensitive data
- Validate commit signatures (if required)

### Issue Events

**Event**: `issues`, `issue_comment`

**Actions:**
- Auto-label based on content
- Route to appropriate team members
- Trigger automated responses for common questions
- Link to related PRs or issues

### Security Events

**Event**: `security_advisory`

**Actions:**
- Alert repository maintainers
- Create tracking issue
- Trigger dependency update workflow
- Update security dashboard

### Check Events

**Event**: `check_run`, `check_suite`

**Actions:**
- Aggregate check results
- Update PR status
- Trigger additional validation if checks fail
- Post summary comments

## Deployment

### Render.com Configuration

1. **Update render.yaml:**
   ```yaml
   services:
     - type: web
       name: heady-manager
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: GITHUB_APP_ID
           sync: false
         - key: GITHUB_APP_PRIVATE_KEY
           sync: false
         - key: GITHUB_APP_WEBHOOK_SECRET
           sync: false
   ```

2. **Add Secrets in Render:**
   - Go to your service → Environment
   - Add the secrets from Security Considerations section

3. **Deploy:**
   ```bash
   git push origin main
   # Render will auto-deploy
   ```

### Verify Deployment

1. **Check webhook deliveries:**
   - Go to GitHub App Settings → Advanced → Recent Deliveries
   - Trigger a test event (e.g., create an issue)
   - Verify delivery was successful (200 response)

2. **Monitor logs:**
   ```bash
   # In Render dashboard
   # Logs should show incoming webhook events
   ```

3. **Test functionality:**
   - Create a test PR
   - Verify automated checks run
   - Check issue auto-labeling
   - Confirm status updates appear

## Features

### 1. Compliance Validation

**Branch Naming Enforcement:**
- Validates branch names follow pattern: `feature/`, `bugfix/`, `hotfix/`
- Blocks PRs with invalid branch names
- Provides helpful error messages

**Commit Message Validation:**
- Ensures conventional commit format
- Requires ticket references (if configured)
- Validates commit sign-off

### 2. Security Monitoring

**Automated Security Scans:**
- Triggers CodeQL on every PR
- Runs dependency vulnerability checks
- Scans for exposed secrets
- Validates Docker image security

**Alert Management:**
- Creates issues for security advisories
- Notifies security team via configured channels
- Tracks remediation progress

### 3. Repository Health

**Automated Health Checks:**
- Validates required files exist (README, LICENSE, etc.)
- Checks for outdated dependencies
- Monitors test coverage
- Validates CI/CD configuration

**Health Reports:**
- Weekly repository health summaries
- Trend analysis for key metrics
- Recommendations for improvements

### 4. Custom Integrations

**Heady Ecosystem Integration:**
- Syncs with HeadyConnection services
- Updates Sacred Geometry dashboards
- Triggers remote GPU jobs when needed
- Integrates with MCP servers

### 5. Governance Enforcement

**Policy Checks:**
- Required reviewers based on CODEOWNERS
- Minimum review count enforcement
- Branch protection rule validation
- Status check requirements

**Audit Trail:**
- Logs all governance events
- Generates compliance reports
- Tracks policy violations

## API Endpoints

The app exposes the following endpoints:

### Webhook Endpoint

```
POST /api/github/webhooks
```

Receives GitHub webhook events.

**Headers:**
- `X-GitHub-Event`: Event type
- `X-GitHub-Delivery`: Unique delivery ID
- `X-Hub-Signature-256`: HMAC signature

### Setup Endpoint

```
GET /api/github/setup
```

OAuth setup/installation flow.

### Callback Endpoint

```
GET /api/github/callback
```

OAuth callback for app installation.

### Status Endpoint

```
GET /api/github/app/status
```

Returns app health and statistics.

**Response:**
```json
{
  "status": "healthy",
  "app_id": "123456",
  "installation_count": 5,
  "webhooks_processed": 1234,
  "last_webhook": "2026-01-30T10:00:00Z"
}
```

## Troubleshooting

### Webhooks Not Received

1. **Check webhook URL** in GitHub App settings
2. **Verify deployment** is running and accessible
3. **Check Render logs** for errors
4. **Test webhook** delivery from GitHub App settings
5. **Verify firewall** allows GitHub webhook IPs

### Signature Verification Fails

1. **Check webhook secret** matches in both places
2. **Verify base64 encoding** of private key is correct
3. **Check for whitespace** in environment variables
4. **Review logs** for signature calculation details

### Rate Limiting Issues

1. **Check GitHub API rate limits**: https://api.github.com/rate_limit
2. **Implement exponential backoff** for retries
3. **Use conditional requests** where possible
4. **Consider GitHub App rate limits** vs personal access tokens

### Authentication Errors

1. **Regenerate private key** if compromised
2. **Verify App ID** matches your app
3. **Check JWT expiration** times
4. **Review installation permissions**

### Missing Events

1. **Verify event subscription** in app settings
2. **Check webhook deliveries** for errors
3. **Review app permissions** for the event type
4. **Confirm installation** on the repository

## Monitoring and Maintenance

### Health Checks

Monitor the following metrics:

- Webhook delivery success rate (should be >99%)
- Average response time (<500ms)
- Error rate (<1%)
- API rate limit usage (<80%)

### Regular Maintenance

- **Weekly**: Review webhook delivery logs
- **Monthly**: Rotate webhook secret
- **Quarterly**: Audit app permissions and usage
- **Yearly**: Regenerate private key

### Logging

All GitHub App events are logged with:

- Event type and action
- Repository and organization
- Timestamp
- Processing duration
- Success/failure status
- Error details (if applicable)

## Support

For issues with the Heady GitHub App:

1. Check this documentation
2. Review [GitHub Apps documentation](https://docs.github.com/en/apps)
3. Check application logs in Render
4. Open an issue in the Heady repository
5. Contact the HeadyMe team

## Additional Resources

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [GitHub Webhooks Guide](https://docs.github.com/en/webhooks)
- [Octokit.js Documentation](https://github.com/octokit/octokit.js)
- [Render.com Documentation](https://render.com/docs)
- [Heady Project README](../README.md)
