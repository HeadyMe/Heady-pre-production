# Secrets Management Guide

## Overview

This guide covers how to implement, update, and rotate secrets for the Heady system across all environments (local, staging, production).

## 🔐 Secret Types

### Required Secrets
1. **HEADY_API_KEY** - Admin UI and API authentication
2. **HF_TOKEN** - Hugging Face API access token

### Optional Secrets
3. **GOOGLE_API_KEY** - Google Gemini API (if using)
4. **GH_TOKEN** - GitHub API token (if using)
5. **DATABASE_URL** - PostgreSQL connection string (if using database)
6. **COPILOT_MCP_CLOUDFLARE_API_TOKEN** - Cloudflare MCP integration
7. **COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID** - Cloudflare account ID

## 📍 Environment-Specific Implementation

### Local Development

#### Initial Setup

1. **Create .env file from template:**
```bash
cp .env.example .env
```

2. **Generate secure API key:**
```bash
# Method 1: Using OpenSSL (recommended)
openssl rand -base64 32

# Method 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Using our generator script
./tools/generate-api-key
```

3. **Edit .env file:**
```bash
nano .env  # or your preferred editor
```

4. **Set required variables:**
```env
HEADY_API_KEY=<generated-key-from-step-2>
HF_TOKEN=<get-from-huggingface>
```

5. **Validate configuration:**
```bash
./tools/validate-env
```

#### Getting Hugging Face Token

1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Give it a name (e.g., "heady-local-dev")
4. Select "read" permissions
5. Copy the token (starts with `hf_`)
6. Add to `.env`: `HF_TOKEN=hf_your_token_here`

#### Local Secret Storage

**Security Notes:**
- ✅ `.env` is in `.gitignore` - never committed
- ✅ Use different keys for local vs. production
- ✅ Don't share your local `.env` file
- ✅ Regenerate if accidentally exposed

### Staging Environment (Render.com)

#### Initial Setup

1. **Navigate to Render Dashboard:**
   - Go to https://dashboard.render.com
   - Select your staging service (e.g., `heady-staging`)

2. **Access Environment Variables:**
   - Click on your service
   - Go to "Environment" tab
   - Click "Add Environment Variable"

3. **Add Required Secrets:**

   **HEADY_API_KEY:**
   ```
   Key: HEADY_API_KEY
   Value: <generate-strong-key>
   ```

   **HF_TOKEN:**
   ```
   Key: HF_TOKEN
   Value: hf_your_staging_token
   ```

4. **Using Environment Groups (Recommended):**

   Create a shared secret group:
   - Go to "Environment Groups" in Render
   - Create group: `heady-staging-secrets`
   - Add secrets to the group
   - Link to your staging service

#### Render Secret Management

**Via Web Interface:**
1. Dashboard → Service → Environment tab
2. Click "Add Environment Variable"
3. Enter key and value
4. Click "Save Changes"
5. Service auto-redeploys

**Via Blueprint (render.yaml):**
```yaml
services:
  - type: web
    name: heady-staging
    env: node
    envVars:
      - key: PORT
        value: 3300
      - key: NODE_ENV
        value: production
      # Secrets come from environment group
      - fromGroup: heady-staging-secrets
```

### Production Environment (Render.com)

#### Initial Setup

Same as staging but use production environment group:

1. **Create Production Secret Group:**
   - Name: `heady-shared-secrets` (or `heady-production-secrets`)
   - Add all required secrets
   - Use STRONG keys (32+ characters)

2. **Generate Production API Key:**
```bash
# Generate ultra-secure key for production
openssl rand -base64 48
```

3. **Link to Production Service:**
   - Go to production service settings
   - Environment tab
   - Link environment group
   - Save changes

4. **Verify Deployment:**
```bash
# Test production health
curl https://heady.onrender.com/api/health

# Test admin API (should require auth)
curl https://heady.onrender.com/api/admin/roots
# Should return: {"ok":false,"error":"Unauthorized"}
```

## 🔄 Secret Rotation

### When to Rotate

- **Immediately:** If secret is exposed/leaked
- **Quarterly:** Scheduled rotation (every 3 months)
- **After Staff Changes:** When team members leave
- **After Security Audit:** If recommended
- **Before Major Release:** Best practice

### Rotation Procedure

#### Local Development

1. **Generate new key:**
```bash
./tools/generate-api-key
```

2. **Update .env:**
```bash
# Edit .env and replace HEADY_API_KEY
nano .env
```

3. **Restart server:**
```bash
npm restart
```

4. **Clear browser storage:**
```javascript
// In browser console
localStorage.removeItem('heady_api_key');
```

5. **Re-authenticate in Admin UI**

#### Staging/Production (Zero-Downtime Rotation)

**Method 1: Gradual Rollover**

1. **Add new key as secondary:**
```bash
# In Render Dashboard
# Add: HEADY_API_KEY_NEW=<new-key>
```

2. **Update code to accept both keys** (temporary):
```javascript
// In heady-manager.js
const validKeys = [
  process.env.HEADY_API_KEY,
  process.env.HEADY_API_KEY_NEW
].filter(Boolean);

function requireApiKey(req, res, next) {
  const provided = getProvidedApiKey(req);
  const isValid = validKeys.some(key => 
    timingSafeEqualString(provided, key)
  );
  if (!isValid) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  return next();
}
```

3. **Deploy with dual-key support**

4. **Update all clients to use new key**

5. **Remove old key:**
```bash
# In Render Dashboard
# Delete: HEADY_API_KEY_NEW
# Update: HEADY_API_KEY=<new-key>
```

6. **Revert code to single-key validation**

**Method 2: Scheduled Maintenance Window**

1. **Schedule maintenance window** (e.g., 2 AM Sunday)

2. **Update secret in Render:**
```bash
# Update HEADY_API_KEY in environment group
```

3. **Redeploy service** (auto-triggers)

4. **Verify new key works:**
```bash
curl -H "x-heady-api-key: NEW_KEY" \
  https://heady.onrender.com/api/admin/roots
```

5. **Notify users** to re-authenticate

## 🛠️ Secret Management Tools

### Generate API Key

```bash
./tools/generate-api-key
```

This script:
- Generates cryptographically secure random key
- Displays in base64 format
- Copies to clipboard (if available)
- Shows usage instructions

### Validate Environment

```bash
./tools/validate-env
```

This script:
- Checks all required secrets are set
- Validates optional configurations
- Shows masked values for security
- Provides fix instructions if issues found

### List Current Secrets

```bash
./tools/list-secrets
```

This script:
- Lists all environment variables (values masked)
- Shows which are set vs. using defaults
- Identifies missing required secrets
- Safe to run in any environment

## 📝 Secret Management Best Practices

### Generation

✅ **DO:**
- Use cryptographically secure random generators
- Minimum 32 characters for API keys
- Use base64 or hex encoding
- Generate unique keys per environment
- Use different keys for different purposes

❌ **DON'T:**
- Use weak keys (e.g., "password123")
- Reuse keys across environments
- Use predictable patterns
- Share production keys

### Storage

✅ **DO:**
- Store in environment variables
- Use secret management services (Render env groups)
- Encrypt at rest when possible
- Backup secrets securely (encrypted vault)
- Document where secrets are stored

❌ **DON'T:**
- Commit secrets to version control
- Store in plaintext files
- Email or Slack secrets
- Store in application code
- Log secret values

### Access Control

✅ **DO:**
- Limit access to production secrets
- Use separate secrets for dev/staging/prod
- Audit who has access
- Revoke access when no longer needed
- Use least privilege principle

❌ **DON'T:**
- Share secrets via insecure channels
- Give everyone access to production
- Use same secrets for all environments
- Leave secrets with former employees

### Rotation

✅ **DO:**
- Rotate quarterly minimum
- Rotate immediately if exposed
- Have rotation procedures documented
- Test rotation in staging first
- Keep rotation logs

❌ **DON'T:**
- Never rotate secrets
- Forget to update clients after rotation
- Rotate without testing
- Lose track of current secrets

## 🚨 Emergency Procedures

### Secret Exposed/Leaked

**Immediate Actions (within 1 hour):**

1. **Confirm the exposure:**
   - Where was it leaked? (Git, Slack, email, logs)
   - Who has access to the exposed location?
   - When did the exposure occur?

2. **Generate new secret immediately:**
```bash
openssl rand -base64 48 > new-key.txt
```

3. **Update in all environments:**
   - Local: Update `.env`
   - Staging: Update Render env vars
   - Production: Update Render env vars

4. **Revoke old secret:**
   - Ensure old key is completely removed
   - Clear from any caches

5. **Monitor for abuse:**
   - Check access logs
   - Look for unauthorized requests
   - Monitor rate limiting violations

6. **Notify stakeholders:**
   - Security team
   - DevOps team
   - Management (if production)

**Follow-up Actions (within 24 hours):**

1. **Investigate root cause**
2. **Update procedures to prevent recurrence**
3. **Document incident**
4. **Review access logs for suspicious activity**

### Secret Rotation Checklist

```markdown
## Secret Rotation Checklist

### Pre-Rotation
- [ ] Schedule maintenance window (if needed)
- [ ] Generate new secrets
- [ ] Test new secrets in dev/staging
- [ ] Notify team members
- [ ] Backup current configuration

### Rotation
- [ ] Update environment variables
- [ ] Redeploy services
- [ ] Verify new secrets work
- [ ] Update documentation
- [ ] Clear old cached values

### Post-Rotation
- [ ] Monitor for errors
- [ ] Verify all services healthy
- [ ] Update runbooks
- [ ] Document rotation date
- [ ] Schedule next rotation (3 months)
```

## 🔍 Auditing Secrets

### Regular Audit (Monthly)

1. **Review who has access:**
```bash
# List team members with Render access
# Review GitHub org members
```

2. **Check for exposed secrets:**
```bash
# Search git history for accidentally committed secrets
git log -p | grep -i "api_key\|token\|secret"

# Use tools like truffleHog, git-secrets
```

3. **Verify rotation schedule:**
```bash
# Check last rotation date
# Schedule next rotation if needed
```

4. **Test secret validation:**
```bash
# Verify invalid keys are rejected
curl -H "x-heady-api-key: invalid" \
  http://localhost:3300/api/admin/roots
# Should return 401 Unauthorized
```

### Compliance Checks

- [ ] Secrets not in version control
- [ ] Secrets not in application logs
- [ ] Secrets encrypted at rest (Render handles this)
- [ ] Access limited to authorized personnel
- [ ] Rotation policy followed (quarterly)
- [ ] Incident response plan documented
- [ ] Audit trail maintained

## 📚 Environment Variable Reference

### Complete List

| Variable | Required | Default | Environment | Description |
|----------|----------|---------|-------------|-------------|
| `HEADY_API_KEY` | ✅ Yes | - | All | Admin API authentication |
| `HF_TOKEN` | ✅ Yes | - | All | Hugging Face API token |
| `PORT` | No | 3300 | All | Server port |
| `NODE_ENV` | No | development | All | Environment mode |
| `HF_TEXT_MODEL` | No | gpt2 | All | Default text model |
| `HF_EMBED_MODEL` | No | sentence-transformers/... | All | Default embedding model |
| `HEADY_CORS_ORIGINS` | No | - | Production | Allowed CORS origins |
| `HEADY_TRUST_PROXY` | No | false | Production | Trust proxy headers |
| `DATABASE_URL` | No | - | Production | Database connection |

See [.env.example](.env.example) for complete list.

## 🔗 Related Documentation

- [Admin UI Security](ADMIN_SECURITY.md) - Security implementation details
- [Admin Connection Guide](ADMIN_CONNECTION_GUIDE.md) - Environment setup
- [.env.example](.env.example) - Complete environment template

## 📞 Support

### Secret Issues

If you encounter issues with secrets:

1. **Validate environment:**
```bash
./tools/validate-env
```

2. **Check application logs:**
```bash
# Local
npm run admin:dev

# Production (Render)
# View logs in Render Dashboard
```

3. **Test authentication:**
```bash
curl -H "x-heady-api-key: YOUR_KEY" \
  http://localhost:3300/api/admin/roots
```

4. **Contact team:**
   - DevOps team for production issues
   - Security team for exposure incidents
   - See SECURITY.md for security contacts

## 🔐 Security Contacts

For security issues related to secrets:

- **Immediate (leaked secrets):** See SECURITY.md
- **General questions:** Team lead or DevOps
- **Audit requests:** Security team

---

**Last Updated:** 2026-01-30  
**Next Review:** 2026-04-30  
**Rotation Schedule:** Quarterly (every 3 months)
