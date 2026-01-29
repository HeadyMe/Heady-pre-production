# Security Policy

## Secure Configuration

The Heady system requires several sensitive environment variables to operate. This document outlines the security best practices for managing these secrets.

## Required Environment Variables

### Critical Secrets

The following environment variables contain sensitive information and must be protected:

- **DATABASE_URL** - Contains database credentials
- **HEADY_API_KEY** - Internal API authentication key
- **HF_TOKEN** - Hugging Face API token
- **OTHER_API_KEY** - External service API key
- **CLOUDFLARE_API_TOKEN** - Cloudflare API authentication
- **CLOUDFLARE_ACCOUNT_ID** - Cloudflare account identifier

## Security Best Practices

### 1. Never Commit Secrets to Version Control

- All sensitive values must be stored in environment variables
- Use `.env` files for local development (already in `.gitignore`)
- Never hardcode secrets in source files
- Review commits before pushing to ensure no secrets are included

### 2. Use Secure Secret Management

#### For Local Development
- Copy `.env.example` to `.env` and fill in your values
- Keep `.env` file permissions restricted (chmod 600)
- Never share your `.env` file

#### For GitHub Actions
- Store secrets in **Settings → Secrets and variables → Actions**
- Use repository secrets for sensitive values
- Reference secrets in workflows using `${{ secrets.SECRET_NAME }}`

#### For Render Deployment
- Add environment variables in the Render dashboard
- Use Render's environment variable management
- Enable "sync: false" to prevent variables from being synced to blueprint

### 3. Secret Rotation

- Rotate API keys and tokens regularly (recommended: every 90 days)
- Immediately rotate any secret that may have been compromised
- Update all deployment environments when rotating secrets

### 4. Access Control

- Limit access to production secrets to essential team members only
- Use separate secrets for development, staging, and production
- Never use production credentials in development environments

### 5. Monitoring and Auditing

- Monitor the system activity logs in the Admin Dashboard
- Review API access logs regularly
- Set up alerts for suspicious activity
- Track which services have access to which secrets

## Environment Variable Validation

The Heady system validates environment variables on startup:

- Access `/api/health` to check which environment variables are configured
- Access `/api/config` to see the full configuration status
- Use the Admin Dashboard at `/admin.html` for visual status monitoring

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Contact the repository maintainers privately
3. Provide details about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Compliance

- All secrets must be managed according to your organization's security policies
- Ensure compliance with relevant data protection regulations (GDPR, CCPA, etc.)
- Maintain audit logs of secret access and modifications

## Additional Resources

- [GitHub Encrypted Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Render Environment Variables Guide](https://render.com/docs/environment-variables)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
