# Secrets Management Quick Reference

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Generate secure API key
npm run secrets:generate

# 3. Edit .env with your values
nano .env

# 4. Validate configuration
npm run secrets:validate

# 5. Start server
npm start
```

## 🔑 Common Commands

### Generate New API Key
```bash
npm run secrets:generate
# or
./tools/generate-api-key
```

### Validate Environment
```bash
npm run secrets:validate
# or
./tools/validate-env
```

### List Current Secrets (Masked)
```bash
npm run secrets:list
# or
./tools/list-secrets
```

### Complete Environment Setup
```bash
npm run env:setup
```

## 📋 Environment Variables

### Required (Minimum)
```env
HEADY_API_KEY=<your-secure-32-char-key>
HF_TOKEN=<your-huggingface-token>
```

### Recommended (Production)
```env
PORT=3300
NODE_ENV=production
HEADY_TRUST_PROXY=true
HEADY_CORS_ORIGINS=https://yourdomain.com
```

## 🔄 Secret Rotation

### Local Development
```bash
# Generate new key
npm run secrets:generate

# Update .env file
nano .env

# Restart server
npm restart
```

### Production (Render.com)
1. Go to https://dashboard.render.com
2. Select service → Environment tab
3. Update `HEADY_API_KEY` value
4. Service auto-redeploys

## 🚨 Emergency: Secret Leaked

### Immediate Actions (< 1 hour)
```bash
# 1. Generate new key NOW
npm run secrets:generate

# 2. Update .env immediately
nano .env

# 3. For production: Update in Render Dashboard

# 4. Restart services
npm restart

# 5. Monitor logs for abuse
tail -f logs/app.log
```

## 🔍 Troubleshooting

### "HEADY_API_KEY is not set"
```bash
# Check if .env exists
ls -la .env

# Validate configuration
npm run secrets:validate

# Generate new key if needed
npm run secrets:generate
```

### "Unauthorized" in Admin UI
```bash
# Verify key matches
npm run secrets:list

# Clear browser storage
# In browser console: localStorage.clear()

# Re-enter API key in Admin UI
```

### Environment not loading
```bash
# Check .env file exists and is readable
cat .env | head -5

# Ensure .env is in project root
pwd
ls -la .env

# Restart with explicit env load
source .env && npm start
```

## 📁 File Locations

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env.example` | Template | ✅ Yes |
| `.env.template` | Legacy template | ✅ Yes |
| `.env` | Your secrets | ❌ No (in .gitignore) |
| `SECRETS_MANAGEMENT.md` | Full guide | ✅ Yes |

## 🛡️ Security Checklist

### Before Deploying
- [ ] Strong API key generated (32+ chars)
- [ ] Different keys for dev/staging/prod
- [ ] .env not committed to git
- [ ] Secrets validated with `npm run secrets:validate`
- [ ] CORS origins configured for production
- [ ] HTTPS enabled in production

### Quarterly Maintenance
- [ ] Rotate all API keys
- [ ] Review who has access
- [ ] Audit logs for suspicious activity
- [ ] Update documentation
- [ ] Test secret rotation procedure

## 🔗 Full Documentation

- [Complete Guide](SECRETS_MANAGEMENT.md) - All procedures and best practices
- [Security Docs](ADMIN_SECURITY.md) - Security implementation
- [Admin Guide](ADMIN_UI.md) - Admin UI usage
- [Connection Guide](ADMIN_CONNECTION_GUIDE.md) - Environment setup

## 💡 Best Practices

### ✅ DO
- Generate keys with `npm run secrets:generate`
- Use 32+ character keys
- Rotate keys quarterly
- Use different keys per environment
- Validate before deploying

### ❌ DON'T
- Commit .env to git
- Share production keys
- Use weak keys (e.g., "password")
- Reuse keys across environments
- Email/Slack secrets

## 📞 Get Help

### Quick Tests
```bash
# Test server starts
npm start

# Test admin API (should require auth)
curl http://localhost:3300/api/admin/roots
# Should return: {"ok":false,"error":"Unauthorized"}

# Test with valid key
curl -H "x-heady-api-key: YOUR_KEY" \
  http://localhost:3300/api/admin/roots
# Should return: {"ok":true,"roots":[...]}
```

### Still Having Issues?
1. Check logs: `npm run admin:dev`
2. Validate env: `npm run secrets:validate`
3. Review: [SECRETS_MANAGEMENT.md](SECRETS_MANAGEMENT.md)
4. Check: [Troubleshooting Guide](ADMIN_UI.md#troubleshooting)

---

**Updated**: 2026-01-30  
**Tools Version**: 1.0.0
