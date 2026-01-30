# Admin UI Connection Guide

This guide provides detailed instructions for connecting to the Heady Admin UI across different environments.

## Quick Reference

| Environment | URL | Auth Method | Config Source |
|-------------|-----|-------------|---------------|
| **Local Dev** | `http://localhost:3300/admin` | API Key | `.env` file |
| **Staging** | `https://heady-staging.onrender.com/admin` | API Key | Render env group |
| **Production** | `https://heady.onrender.com/admin` | API Key | Render env group |

## Local Development Connection

### Method 1: Using Helper Scripts (Recommended)

```bash
# Start the admin UI server
./tools/admin-dev

# In another terminal, open the UI
./tools/admin-open
```

### Method 2: Using npm Scripts

```bash
# Start in development mode
npm run admin:dev

# Open your browser to:
# http://localhost:3300/admin
```

### Method 3: Manual Setup

1. **Set environment variables:**
   ```bash
   export HEADY_API_KEY="your-secure-api-key"
   export HF_TOKEN="your-hf-token"
   export PORT=3300
   ```

2. **Start the server:**
   ```bash
   node heady-manager.js
   ```

3. **Access the UI:**
   - Open browser to: `http://localhost:3300/admin`
   - Enter your API key when prompted
   - API key is stored in browser localStorage

### Local Environment Variables

Required variables in `.env`:

```env
# Required
HEADY_API_KEY=your-secure-random-key-here
HF_TOKEN=your-huggingface-token

# Optional (with defaults)
PORT=3300
NODE_ENV=development
HEADY_ADMIN_ROOT=/path/to/repo
```

## Staging Environment Connection

### Access URL
```
https://heady-staging.onrender.com/admin
```

### Authentication
1. Navigate to the staging URL
2. Enter the staging API key (from Render environment)
3. Key is stored in browser localStorage

### Environment Configuration

Staging environment variables are managed in Render.com:

1. Go to Render Dashboard
2. Select the `heady-staging` service
3. Navigate to **Environment** tab
4. Variables are in the `heady-shared-secrets` group

Key variables:
- `HEADY_API_KEY` - Staging admin API key
- `HF_TOKEN` - Hugging Face token
- `DATABASE_URL` - Staging database connection

### Staging Features
- Connected to staging database
- Uses staging Hugging Face quota
- Isolated from production data
- Safe for testing new features

## Production Environment Connection

### Access URL
```
https://heady.onrender.com/admin
```

### Authentication
1. Navigate to the production URL
2. Enter the production API key (from Render environment)
3. Key is stored in browser localStorage

### Environment Configuration

Production environment variables are managed in Render.com:

1. Go to Render Dashboard
2. Select the `heady` service (production)
3. Navigate to **Environment** tab
4. Variables are in the `heady-shared-secrets` group

Key variables:
- `HEADY_API_KEY` - Production admin API key (SECURE!)
- `HF_TOKEN` - Hugging Face token
- `DATABASE_URL` - Production database connection

### Production Security
- Use strong, unique API keys
- Rotate keys regularly
- Monitor access logs
- Enable rate limiting
- Use HTTPS only

## Connection Troubleshooting

### Cannot Access Admin UI

**Symptom:** Page doesn't load

**Solutions:**
- Check server is running: `curl http://localhost:3300/api/health`
- Verify PORT environment variable
- Check firewall/network settings
- Review server logs

### Unauthorized Error

**Symptom:** "Unauthorized" message

**Solutions:**
- Verify `HEADY_API_KEY` is set in environment
- Check API key in browser matches server key
- Clear browser localStorage and re-enter key
- Check for typos in API key

### API Key Not Persisting

**Symptom:** Need to re-enter API key on every reload

**Solutions:**
- Check browser allows localStorage
- Try different browser
- Disable strict privacy/tracking prevention
- Check browser console for errors

### Monaco Editor Not Loading

**Symptom:** Code editor doesn't appear

**Solutions:**
- Check internet connection (CDN required)
- Verify Content Security Policy allows CDN
- Try clearing browser cache
- Check browser console for errors

### Build/Audit Logs Not Streaming

**Symptom:** Operations start but no logs appear

**Solutions:**
- Ensure browser supports SSE (Server-Sent Events)
- Check network tab for SSE connection
- Verify operation ID in URL
- Try different browser

## Developer Workflows

### Daily Development Workflow

```bash
# Morning: Start development server
./tools/admin-dev

# Open admin UI
./tools/admin-open

# Work on features...

# Afternoon: Test changes
npm run lint
python -m compileall src

# Evening: Commit changes
git add .
git commit -m "feat: your changes"
git push
```

### Testing New Features

```bash
# 1. Start local server
npm run admin:dev

# 2. Test feature in browser
open http://localhost:3300/admin

# 3. Check API responses
curl -H "x-api-key: your-key" http://localhost:3300/api/admin/roots

# 4. Review logs
# Server logs appear in terminal
```

### Deploying to Staging

```bash
# 1. Commit and push changes
git push origin feature-branch

# 2. Merge to staging branch
git checkout staging
git merge feature-branch
git push origin staging

# 3. Render auto-deploys
# Watch deployment: https://dashboard.render.com

# 4. Test on staging
open https://heady-staging.onrender.com/admin
```

### Promoting to Production

```bash
# 1. Ensure staging is stable
# Test all features on staging

# 2. Merge to main branch
git checkout main
git merge staging
git push origin main

# 3. Render auto-deploys to production
# Monitor deployment carefully

# 4. Verify production
open https://heady.onrender.com/admin

# 5. Monitor logs and metrics
```

## API Client Configuration

For programmatic access to the Admin API:

### JavaScript/Node.js

```javascript
const ADMIN_BASE_URL = process.env.ADMIN_API_BASE_URL || 'http://localhost:3300';
const API_KEY = process.env.HEADY_API_KEY;

async function listFiles(root, path) {
  const response = await fetch(
    `${ADMIN_BASE_URL}/api/admin/files?root=${root}&path=${path}`,
    {
      headers: {
        'x-heady-api-key': API_KEY
      }
    }
  );
  return response.json();
}
```

### Python

```python
import os
import requests

ADMIN_BASE_URL = os.getenv('ADMIN_API_BASE_URL', 'http://localhost:3300')
API_KEY = os.getenv('HEADY_API_KEY')

def list_files(root, path):
    response = requests.get(
        f'{ADMIN_BASE_URL}/api/admin/files',
        params={'root': root, 'path': path},
        headers={'x-heady-api-key': API_KEY}
    )
    return response.json()
```

### cURL

```bash
# List roots
curl -H "x-heady-api-key: $HEADY_API_KEY" \
  http://localhost:3300/api/admin/roots

# Read file
curl -H "x-heady-api-key: $HEADY_API_KEY" \
  "http://localhost:3300/api/admin/file?root=main&path=README.md"

# Trigger build
curl -X POST -H "x-heady-api-key: $HEADY_API_KEY" \
  http://localhost:3300/api/admin/build
```

## Environment-Specific URLs

### Full URL Matrix

| Service | Local | Staging | Production |
|---------|-------|---------|------------|
| Admin UI | `localhost:3300/admin` | `heady-staging.onrender.com/admin` | `heady.onrender.com/admin` |
| API Base | `localhost:3300/api` | `heady-staging.onrender.com/api` | `heady.onrender.com/api` |
| Health Check | `localhost:3300/api/health` | `heady-staging.onrender.com/api/health` | `heady.onrender.com/api/health` |
| Pulse | `localhost:3300/api/pulse` | `heady-staging.onrender.com/api/pulse` | `heady.onrender.com/api/pulse` |

## Reverse Proxy Configuration

If using a reverse proxy (Nginx, Traefik, etc.):

### Nginx Example

```nginx
# Admin UI proxy
location /admin {
    proxy_pass http://localhost:3300/admin;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# SSE endpoints need special handling
location ~ ^/api/admin/ops/.*/stream$ {
    proxy_pass http://localhost:3300;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 86400s;
}
```

### Environment Variable for Proxy

```env
HEADY_TRUST_PROXY=true
```

## Security Best Practices

### API Key Management

1. **Generate Strong Keys:**
   ```bash
   openssl rand -base64 32
   ```

2. **Rotate Regularly:**
   - Development: Monthly
   - Staging: Quarterly
   - Production: Quarterly or on breach

3. **Never Commit Keys:**
   - Use `.env` (gitignored)
   - Use environment variables
   - Use secret management services

### Access Control

1. **Limit Origins:**
   ```env
   HEADY_CORS_ORIGINS=https://your-domain.com
   ```

2. **Enable Rate Limiting:**
   ```env
   HEADY_RATE_LIMIT_MAX=120
   ```

3. **Monitor Access:**
   - Review server logs regularly
   - Track API usage patterns
   - Alert on unusual activity

## Additional Resources

- Main Documentation: [README.md](README.md)
- Admin UI Guide: [ADMIN_UI.md](ADMIN_UI.md)
- API Reference: See inline documentation in `heady-manager.js`
- Copilot Setup: [.github/COPILOT_SETUP.md](.github/COPILOT_SETUP.md)
