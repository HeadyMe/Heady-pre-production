# Cloudflare Edge Worker Deployment Guide

## Quick Start (5 minutes)

This guide walks you through deploying the Heady Admin UI to Cloudflare's edge network for global performance.

---

## Prerequisites

- Cloudflare account (free tier works)
- Domain added to Cloudflare
- Render.com deployment active
- Node.js 18+ installed locally

---

## Step 1: Install Wrangler CLI

```bash
# Install globally
npm install -g wrangler

# Or install locally in project
npm install --save-dev wrangler

# Verify installation
wrangler --version
```

---

## Step 2: Authenticate with Cloudflare

```bash
# Login to Cloudflare
wrangler login

# This will open a browser window to authenticate
# Grant access to Wrangler
```

---

## Step 3: Get Your Cloudflare IDs

```bash
# Get your account ID
wrangler whoami

# Get your zone ID (for your domain)
wrangler zones list
```

Update `wrangler.toml` with these IDs:
```toml
account_id = "your_account_id_here"
zone_id = "your_zone_id_here"
```

---

## Step 4: Update Configuration

### Edit `wrangler.toml`

```toml
# Update the origin URL to match your Render deployment
[vars]
ORIGIN_URL = "https://your-heady-app.onrender.com"

# Update the route to match your domain
[[routes]]
pattern = "admin.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### Edit `cloudflare-worker.js`

```javascript
// Update the origin URL at the top
const ORIGIN_URL = 'https://your-heady-app.onrender.com'

// Update allowed origins for CORS
const allowedOrigins = [
  'https://yourdomain.com',
  'https://admin.yourdomain.com',
  'http://localhost:3300'
]
```

---

## Step 5: Test Locally

```bash
# Run worker in local dev mode
wrangler dev

# Or with specific port
wrangler dev --port 8787

# Test the worker
curl http://localhost:8787/admin.html
```

You should see the admin UI HTML returned.

---

## Step 6: Deploy to Cloudflare

```bash
# Deploy to development environment
wrangler publish --env development

# Deploy to staging environment
wrangler publish --env staging

# Deploy to production
wrangler publish --env production

# Or just deploy to default
wrangler publish
```

Expected output:
```
✨ Built successfully, built project size is 6 KiB.
✨ Successfully published your script to
   https://heady-admin-edge-worker.your-account.workers.dev
```

---

## Step 7: Configure DNS (Optional)

If you want to use a custom subdomain like `admin.heady.example.com`:

1. Go to Cloudflare Dashboard → DNS
2. Add a CNAME record:
   ```
   Type: CNAME
   Name: admin
   Target: your-heady-app.onrender.com
   Proxy: Enabled (orange cloud)
   ```

3. Go to Workers → Routes
4. Add route: `admin.yourdomain.com/*` → `heady-admin-edge-worker`

---

## Step 8: Test Production Deployment

```bash
# Test the worker
curl https://your-worker.workers.dev/admin.html

# Or with your custom domain
curl https://admin.yourdomain.com/admin.html

# Check cache headers
curl -I https://admin.yourdomain.com/admin.html

# Look for these headers:
# X-Cache-Status: HIT or MISS
# Cache-Control: public, max-age=3600
```

---

## Step 9: Verify Performance

### Test Latency from Different Locations

```bash
# Install speedtest tool
npm install -g speed-test

# Test from your location
time curl https://admin.yourdomain.com/admin.html > /dev/null
```

### Use Online Tools

- [WebPageTest](https://www.webpagetest.org/)
- [Pingdom](https://tools.pingdom.com/)
- [GTmetrix](https://gtmetrix.com/)

Compare before/after:
- **Before**: Loading from Render (Oregon)
- **After**: Loading from nearest Cloudflare edge

Expected improvement: **70-90% reduction** in latency

---

## Step 10: Monitor Performance

### Cloudflare Dashboard

1. Go to Workers → your worker
2. View Metrics tab
3. Monitor:
   - Requests/day
   - Success rate
   - CPU time
   - Errors

### Set Up Alerts (Optional)

```bash
# Install Cloudflare API tool
npm install -g @cloudflare/wrangler

# Create alert rule (via dashboard)
# Alert when:
# - Error rate > 5%
# - CPU time > 40ms average
# - Requests drop to 0 (worker down)
```

---

## Maintenance

### Cache Invalidation

When you update the admin UI, purge the cache:

```bash
# Method 1: Via Cloudflare Dashboard
# Go to Caching → Configuration → Purge Cache → Purge Everything

# Method 2: Via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'

# Method 3: Specific files
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"files":["https://admin.yourdomain.com/admin.html"]}'
```

### Update Worker

```bash
# Make changes to cloudflare-worker.js
# Then redeploy
wrangler publish --env production
```

### Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --version-id <previous-version-id>
```

---

## Troubleshooting

### Issue: "Error 1101: Worker threw exception"

**Cause**: Runtime error in worker code

**Fix**:
```bash
# Check worker logs
wrangler tail

# Test locally
wrangler dev
```

### Issue: "Cache not working (always MISS)"

**Cause**: Cache headers not set correctly

**Fix**:
- Check `Cache-Control` header in response
- Verify `cacheKey` is consistent
- Check Cloudflare cache rules don't override worker

### Issue: "API calls failing with CORS errors"

**Cause**: CORS headers not properly forwarded

**Fix**:
- Verify `allowedOrigins` in `cloudflare-worker.js`
- Check `handleCORS()` function
- Test with: `curl -H "Origin: https://yourdomain.com" ...`

### Issue: "Worker not receiving updates"

**Cause**: Cached old worker version

**Fix**:
```bash
# Purge Cloudflare cache
wrangler publish --env production --no-bundle

# Force new deployment
wrangler publish --env production --compatibility-date $(date +%Y-%m-%d)
```

---

## Security Checklist

- [ ] API key authentication still enforced by origin
- [ ] CORS restricted to allowed origins
- [ ] Secrets not hardcoded in worker
- [ ] Rate limiting configured
- [ ] HTTPS enforced (Cloudflare dashboard → SSL/TLS → Full Strict)
- [ ] DDoS protection enabled (automatic with Cloudflare)
- [ ] Security headers added (X-Frame-Options, etc.)

---

## Performance Optimization Tips

### 1. Increase Cache TTL for Static Assets

```javascript
// In cloudflare-worker.js
const CACHE_TTL = 86400 // 24 hours instead of 1 hour
```

### 2. Enable Argo Smart Routing (Paid)

- Go to Cloudflare Dashboard → Traffic → Argo
- Enable Argo Smart Routing
- Routes traffic through fastest network paths
- $5/month + $0.10/GB

### 3. Use Workers KV for Configuration

```javascript
// Store config in KV instead of hardcoding
const config = await ADMIN_CONFIG.get('settings', { type: 'json' })
```

### 4. Implement Edge-side Analytics

```javascript
// Track requests at edge (no origin impact)
addEventListener('fetch', event => {
  event.waitUntil(logRequest(event.request))
  event.respondWith(handleRequest(event.request))
})
```

---

## Cost Monitoring

### Free Tier Limits
- 100,000 requests/day
- Enough for most admin UI usage

### Paid Tier ($5/month)
- 10 million requests/month included
- $0.50 per additional million

### Monitor Usage
```bash
# Check daily request count
wrangler metrics

# View in dashboard
# Workers → Your Worker → Metrics
```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy-edge-worker.yml`:

```yaml
name: Deploy Edge Worker

on:
  push:
    branches: [main]
    paths:
      - 'cloudflare-worker.js'
      - 'wrangler.toml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          environment: 'production'
```

### Set Secret in GitHub

1. Go to repo Settings → Secrets → Actions
2. Add `CF_API_TOKEN`
3. Get token from Cloudflare Dashboard → API Tokens

---

## Next Steps

1. ✅ Deploy worker to development
2. ✅ Test with `wrangler dev`
3. ✅ Deploy to staging
4. ✅ Test from multiple locations
5. ✅ Deploy to production
6. ✅ Monitor for 24 hours
7. ✅ Set up alerts
8. ✅ Configure CI/CD
9. ✅ Document cache invalidation process
10. ✅ Train team on new deployment workflow

---

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Community Discord](https://discord.gg/cloudflaredev)

---

**Last Updated**: 2026-01-30  
**Heady Systems Team**
