---
description: Deploy the Heady System to production or staging environments
---

# Deploy System Workflow

## Purpose
Deploy the complete Heady System to production or staging environments.

## Pre-Deployment Checklist

1. **Verify System Health**
   ```bash
   node src/client/heady_intelligence_verifier.js
   ```

2. **Run Tests**
   ```bash
   npm test
   pytest tests/
   ```

3. **Build Assets**
   ```bash
   npm run build
   ```

## Deployment Steps

### 1. **Deploy to Render.com**
```powershell
.\scripts\Deploy-HeadyUnified.ps1 -Environment production
```

### 2. **Deploy Cloudflare Workers**
```powershell
.\scripts\deploy-cloudflare-worker.ps1
```

### 3. **Verify Deployment**
```powershell
# Check service health
curl https://api.headysystems.com/health

# Verify MCP services
.\scripts\verify-services.ps1
```

### 4. **Update DNS (if needed)**
```powershell
.\scripts\update-hosts.ps1
```

## Post-Deployment

1. **Monitor Logs**
   - Check Render.com dashboard
   - Monitor Cloudflare analytics

2. **Verify Functionality**
   - Test critical endpoints
   - Verify MCP connectivity
   - Check database connections

3. **Update Documentation**
   - Record deployment timestamp
   - Update CHANGELOG.md
   - Create checkpoint

## Rollback Procedure

```powershell
# Rollback to previous version
.\scripts\rollback-deployment.ps1 -Version <previous>
```

## Integration Points
- **Render.com**: Primary hosting platform
- **Cloudflare**: Edge routing and workers
- **GitHub Actions**: CI/CD pipeline
