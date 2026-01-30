# GitHub Repository Configuration Guide

This document outlines the required repository settings for the Copilot Coding Agent to function properly.

## GitHub Actions Settings

Navigate to: **Settings → Actions → General**

### Workflow Permissions

Set the following in the "Workflow permissions" section:

```
✓ Read and write permissions
✓ Allow GitHub Actions to create and approve pull requests
```

### Actions Permissions

```
✓ Allow all actions and reusable workflows
```

Or if using allowlist:
```
✓ Allow actions created by GitHub
✓ Allow actions by Marketplace verified creators
```

## Branch Protection Rules

Navigate to: **Settings → Branches → Branch protection rules**

### Main Branch Protection (Recommended)

Create a rule for `main` branch with:

```
✓ Require a pull request before merging
  ✓ Require approvals: 1
  □ Dismiss stale pull request approvals when new commits are pushed
  ✓ Require review from Code Owners

✓ Require status checks to pass before merging
  ✓ Require branches to be up to date before merging
  Required status checks:
    - build (from CI workflow)

✓ Require conversation resolution before merging

□ Require signed commits (optional)

✓ Require linear history

□ Include administrators (optional - allows admins to bypass rules)

□ Allow force pushes: Nobody

□ Allow deletions
```

## Copilot Settings

Navigate to: **Organization Settings → Copilot → Policies**

### Enable Copilot Coding Agent

```
✓ Enable Copilot coding agent for the organization

Repository Access:
✓ All repositories
  OR
✓ Select repositories:
  - HeadyMe/Heady ✓
  - HeadyMe/main ✓
  - HeadySystems/sandbox ✓
  - HeadySystems/Heady ✓
  - HeadySystems/HeadyConnection ✓
```

### Agent Permissions

Ensure the Copilot Coding Agent app has:

```
Repository permissions:
✓ Actions: Read and write
✓ Checks: Write
✓ Contents: Read and write
✓ Issues: Read and write
✓ Pull requests: Read and write
✓ Workflows: Read and write
```

## Secrets Configuration

Navigate to: **Settings → Secrets and variables → Actions**

### Required Repository Secrets

Create the following secrets:

```
HEADY_API_KEY
  Description: API authentication key for Heady services
  Value: <generate-secure-key>

DATABASE_URL
  Description: PostgreSQL connection string
  Value: postgresql://user:pass@host:port/database

HF_TOKEN
  Description: Hugging Face API token
  Value: <your-hf-token>

COPILOT_MCP_CLOUDFLARE_API_TOKEN
  Description: Cloudflare API token for MCP
  Value: <your-cloudflare-token>

COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID
  Description: Cloudflare account ID
  Value: <your-cloudflare-account-id>

RENDER_DEPLOY_HOOK_URL (optional)
  Description: Render.com deployment webhook URL
  Value: <your-render-deploy-hook>
```

### Environment Secrets (Alternative)

For better organization, you can use **Environments**:

Navigate to: **Settings → Environments**

Create environments:
- `production`
- `staging` (optional)

Add the same secrets to each environment.

## Repository Settings

Navigate to: **Settings → General**

### Features

Enable the following:

```
✓ Issues
✓ Projects (optional)
✓ Allow squash merging
✓ Allow auto-merge
✓ Automatically delete head branches
```

### Pull Requests

```
✓ Allow squash merging
  ✓ Default to pull request title
✓ Allow auto-merge
✓ Automatically delete head branches
```

### GitHub Pages (optional)

If you want to host documentation:

```
Source: Deploy from a branch
Branch: gh-pages / (root)
```

## Code Security and Analysis

Navigate to: **Settings → Code security and analysis**

### Recommended Settings

```
✓ Dependency graph: Enable
✓ Dependabot alerts: Enable
✓ Dependabot security updates: Enable
✓ Grouped security updates: Enable

Code scanning:
✓ CodeQL analysis: Enable (via workflow)
✓ Default setup OR Advanced (use workflow)

Secret scanning:
✓ Secret scanning: Enable
✓ Push protection: Enable
```

## Collaborators and Teams

Navigate to: **Settings → Collaborators and teams**

### Team Access

```
@HeadyMe: Admin
@HeadySystems: Write or Admin (as needed)
```

### Outside Collaborators

Add as needed with appropriate permissions.

## Webhooks (Optional)

Navigate to: **Settings → Webhooks**

Add webhooks for external integrations if needed:

```
Payload URL: <your-webhook-url>
Content type: application/json
Events: Choose events based on needs
✓ Active
```

## Deploy Keys (Optional)

Navigate to: **Settings → Deploy keys**

Add deploy keys for CI/CD systems that need read access:

```
Title: CI/CD System Name
Key: <ssh-public-key>
✓ Allow write access (if needed)
```

## Verification Checklist

After configuring all settings, verify:

- [ ] GitHub Actions are enabled
- [ ] Workflow permissions are set to "Read and write"
- [ ] "Allow GitHub Actions to create and approve pull requests" is enabled
- [ ] Branch protection rules are configured for `main`
- [ ] Copilot Coding Agent is enabled for the repository
- [ ] All required secrets are configured
- [ ] Code security features are enabled
- [ ] Team/collaborator access is configured
- [ ] CODEOWNERS file is present and valid
- [ ] Issue templates are configured
- [ ] PR template is configured

## Testing the Configuration

1. **Create a test branch:**
   ```bash
   git checkout -b test/copilot-config
   git push -u origin test/copilot-config
   ```

2. **Open a test PR:**
   - Create a PR from `test/copilot-config` to `main`
   - Verify that automated workflows run
   - Check that the PR template is used
   - Confirm that Code Owners are automatically assigned

3. **Test Copilot integration:**
   - Comment on the PR: `@github-copilot Can you help review this PR?`
   - Verify that Copilot responds

4. **Verify security scanning:**
   - Push a commit with a test secret (e.g., API key)
   - Verify that push protection catches it
   - Remove the secret and push again

5. **Check workflow permissions:**
   - Verify that workflows can comment on PRs
   - Check that workflow runs show in the PR checks

## Troubleshooting

### Workflows Not Running

- Check that Actions are enabled in repository settings
- Verify workflow files are in `.github/workflows/`
- Check workflow syntax with `yamllint`
- Review Actions tab for error messages

### Permission Errors

- Verify workflow permissions in Settings → Actions → General
- Check individual workflow permissions in YAML files
- Ensure GITHUB_TOKEN has necessary scopes

### Copilot Not Responding

- Verify Copilot is enabled in organization settings
- Check that repository is in the allowlist
- Ensure the Copilot app is installed
- Verify app permissions

### Secret Scanning Issues

- Ensure secret scanning is enabled
- Check that patterns match your secrets
- Verify push protection is configured
- Review secret scanning alerts

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Workflow Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [Code Scanning](https://docs.github.com/en/code-security/code-scanning)
- [Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

## Support

For issues with this configuration:
1. Check the repository's Actions tab for workflow logs
2. Review this configuration guide
3. Open an issue using the bug report template
4. Contact @HeadyMe for assistance
