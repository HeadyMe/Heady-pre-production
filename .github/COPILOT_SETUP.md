# Copilot Coding Agent Setup Guide

This repository is configured to work with GitHub Copilot's Coding Agent for automated fixes, builds, and testing.

## Prerequisites

Before the Copilot Coding Agent can work with this repository, you need to complete the following setup steps:

### 1. Organization/Repository Settings

For each relevant organization (HeadyMe and HeadySystems):

1. **Enable Copilot Coding Agent:**
   - Navigate to Organization Settings → Copilot → Policies
   - Enable the "Copilot coding agent" feature
   - Add the following repositories to the allowlist:
     - `HeadyMe/Heady`
     - `HeadyMe/main`
     - `HeadySystems/sandbox`
     - `HeadySystems/Heady`
     - `HeadySystems/HeadyConnection`

2. **Configure Repository Access:**
   - Go to each repository's Settings
   - Navigate to Actions → General
   - Ensure GitHub Actions are **enabled**
   - Set workflow permissions to "Read and write permissions"
   - Enable "Allow GitHub Actions to create and approve pull requests"

### 2. Install the GitHub Copilot Coding Agent App

1. If prompted, install the **Copilot Coding Agent GitHub App** for your organization
2. Grant it access to the repositories listed above
3. Ensure it has the following permissions:
   - **Code**: Read and write
   - **Pull requests**: Read and write
   - **Issues**: Read
   - **Actions**: Read and write
   - **Checks**: Write

### 3. Repository Permissions

Verify the following for each repository:

- **GitHub Actions are enabled**: Settings → Actions → General
- **Workflow permissions**: "Read and write permissions"
- **User access**: Your user account has Write access
- **App access**: Copilot Coding Agent app has Write access

### 4. Required Secrets

Ensure the following secrets are configured in your repository or organization:

**Repository Secrets** (Settings → Secrets and variables → Actions):
- `HEADY_API_KEY` - API authentication key for Heady services
- `DATABASE_URL` - PostgreSQL connection string
- `HF_TOKEN` - Hugging Face API token
- `COPILOT_MCP_CLOUDFLARE_API_TOKEN` - Cloudflare API token for MCP
- `COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `RENDER_DEPLOY_HOOK_URL` - Render.com deployment hook (for deployment workflow)

**Note:** The `GITHUB_TOKEN` is automatically provided by GitHub Actions.

## Automated Workflows

This repository includes the following automated workflows:

### 1. Automated Build and Test Fixes (`automated-fixes.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened
- Manual workflow dispatch

**What it does:**
- Runs linting on Node.js code
- Checks Python and Node.js syntax
- Executes build process
- Runs tests (if available)
- Performs security audits (npm and Python)
- Comments on PR with summary

### 2. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**What it does:**
- Sets up Node.js and Python environments
- Installs dependencies
- Runs Python syntax checks

### 3. Security Scan (`security.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Weekly schedule (Mondays at 2 AM UTC)

**What it does:**
- Runs npm audit
- Runs Python security scans (safety, bandit)
- Executes CodeQL analysis
- Uploads security reports

### 4. Copilot Setup Steps (`copilot-setup-steps.yml`)

**Triggers:**
- Manual workflow dispatch
- Push to `main` branch

**What it does:**
- Verifies environment setup
- Tests MCP configuration
- Validates Node.js and Python syntax

## Testing the Copilot Coding Agent

Once you've completed the setup steps above, you can test if the agent is enabled:

1. **Create a Test Issue:**
   ```
   Title: Test Copilot Coding Agent
   Body: @github-copilot please create a PR to fix linting errors in this repository
   ```

2. **Monitor the Response:**
   - The Copilot Coding Agent should respond and create a PR
   - If it doesn't respond, verify the setup steps above

3. **Check Workflow Runs:**
   - Go to Actions tab
   - Verify that workflows are running on PRs
   - Check that automated checks are completing

## Usage Examples

### Asking Copilot to Fix Build Errors

In an issue or PR comment:
```
@github-copilot Please fix all build errors in this repository
```

### Asking Copilot to Fix Linting Issues

In an issue or PR comment:
```
@github-copilot Please fix all ESLint errors in heady-manager.js
```

### Asking Copilot to Fix Security Vulnerabilities

In an issue or PR comment:
```
@github-copilot Please fix all security vulnerabilities found in npm audit
```

### Asking Copilot to Update Dependencies

In an issue or PR comment:
```
@github-copilot Please update all outdated npm packages to their latest versions
```

## Automated Fix Workflow

When the Copilot Coding Agent is enabled and a PR is created:

1. **Automated Checks Run:**
   - The `automated-fixes.yml` workflow executes
   - All checks are performed (lint, build, test, security)
   - Results are posted as a comment on the PR

2. **Review the Results:**
   - Check the automated comment for the status of each check
   - Review any failures that need attention

3. **Request Fixes:**
   - Comment on the PR with `@github-copilot` to request specific fixes
   - The agent will analyze the issues and propose solutions

4. **Approve and Merge:**
   - Once all checks pass, review the changes
   - Approve and merge the PR

## Repository Structure for Copilot

The repository is organized to support Copilot Coding Agent:

```
.github/
  ├── workflows/              # GitHub Actions workflows
  │   ├── automated-fixes.yml # Main automated checks and fixes
  │   ├── ci.yml              # Continuous integration
  │   ├── security.yml        # Security scanning
  │   └── copilot-setup-steps.yml
  ├── CODEOWNERS              # Code review assignments
  ├── PULL_REQUEST_TEMPLATE.md # PR template with checklist
  ├── copilot-instructions.md  # Instructions for Copilot
  └── copilot-mcp-config.json  # MCP server configuration

src/                          # Python source code
  ├── process_data.py         # Data processing worker
  └── consolidated_builder.py # Build orchestration

heady-manager.js              # Main Node.js server
package.json                  # Node.js dependencies and scripts
requirements.txt              # Python dependencies
render.yaml                   # Render.com deployment config
mcp_config.json              # Local MCP configuration
```

## Build, Test, and Lint Commands

The following npm scripts are available:

```bash
npm start                     # Start the server
npm run dev                   # Start with nodemon (auto-reload)
npm test                      # Run tests (to be implemented)
npm run build                 # Run build process
npm run lint                  # Run ESLint on JavaScript files
npm run docker:build          # Build Docker image
npm run docker:run            # Run Docker container
```

Python commands:
```bash
python -m compileall src      # Check Python syntax
python -m pytest tests/       # Run Python tests (when available)
```

## Troubleshooting

### Copilot Coding Agent Not Responding

1. Verify organization/repo settings are correct
2. Check that the GitHub App is installed
3. Ensure repository has Actions enabled
4. Verify your user has appropriate permissions

### Workflow Failures

1. Check the Actions tab for detailed logs
2. Verify all required secrets are configured
3. Ensure dependencies are up to date
4. Review the automated checks summary

### Permission Errors

1. Go to Settings → Actions → General
2. Set workflow permissions to "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"
4. Verify the Copilot Coding Agent app has correct permissions

## Best Practices

1. **Keep PRs Small:** Smaller PRs are easier for the agent to analyze and fix
2. **Descriptive Titles:** Use clear, descriptive titles for issues and PRs
3. **Specific Requests:** Be specific when asking Copilot to fix issues
4. **Review Changes:** Always review automated fixes before merging
5. **Incremental Fixes:** Fix issues incrementally rather than all at once

## Support

For issues with the Copilot Coding Agent:
- Check the [GitHub Copilot documentation](https://docs.github.com/en/copilot)
- Review workflow logs in the Actions tab
- Contact GitHub Support if the agent is not working as expected

For issues with this repository:
- Open an issue in the repository
- Tag @HeadyMe for assistance
- Check existing issues for similar problems

## Status Badges

Add these to your README.md to show workflow status:

```markdown
![CI](https://github.com/HeadyMe/Heady/workflows/CI/badge.svg)
![Security Scan](https://github.com/HeadyMe/Heady/workflows/Security%20Scan/badge.svg)
![Automated Fixes](https://github.com/HeadyMe/Heady/workflows/Automated%20Build%20and%20Test%20Fixes/badge.svg)
```

## Next Steps

After completing the setup:

1. Test the configuration by creating a test PR
2. Verify all workflows run successfully
3. Request the Copilot Coding Agent to fix any existing issues
4. Monitor workflow runs and adjust as needed
5. Document any custom fixes or processes in this file
