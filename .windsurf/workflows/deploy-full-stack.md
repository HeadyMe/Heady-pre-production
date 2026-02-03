---
description: Deploy Full Stack (HeadySystems)
---

# Deploy Full Stack (HeadySystems)

## Deployment Targets
- **Render.com**: Primary deployment platform
- **Cloudflare**: Edge services and Workers
- **Local**: Development and testing

## Steps

### 1. Pre-Deployment Checks
```powershell
pnpm verify
pnpm build:prod
```

### 2. Render Deployment
```powershell
# Push to Git repository
git add .
git commit -m "deploy: $(date -Iseconds)"
git push origin main

# Render will auto-deploy from blueprint
```

### 3. Verify Deployment
```powershell
# Check deployment status
hs -Verify
```

## Configuration
- `render.yaml` - Render blueprint configuration
- `.env.production` - Production environment variables
- `Dockerfile` - Container definition
