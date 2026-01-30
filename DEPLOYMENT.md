# Heady Deployment Guide

## Overview

This repository uses Render.com for deployment with Infrastructure-as-Code via the `render.yaml` blueprint. The Heady ecosystem consists of three services and a PostgreSQL database.

### Estimated Monthly Costs

Based on Render.com pricing (as of 2026):

| Service | Type | Plan | Estimated Cost |
|---------|------|------|----------------|
| heady-manager | Web Service | Starter | $7/month |
| heady-backend | Web Service | Starter | $7/month |
| heady-frontend | Static Site | Free | $0/month |
| heady-postgres | PostgreSQL | Starter | $7/month |
| **Total** | | | **~$21/month** |

*Note: Costs may vary based on usage, region, and plan upgrades. Check [Render.com pricing](https://render.com/pricing) for current rates.*

## Architecture

```
┌─────────────────────┐
│  heady-frontend     │  (Static Site - Vite/React)
│  Port: 443 (HTTPS)  │
└─────────────────────┘
          │
          ├──────────────────┐
          │                  │
          ▼                  ▼
┌─────────────────────┐   ┌──────────────────────┐
│  heady-manager      │   │  heady-backend       │
│  Port: 3300         │   │  Port: 4000          │
│  Node.js + Python   │   │  Node.js/Express     │
└─────────────────────┘   └──────────────────────┘
          │                         │
          └────────┬────────────────┘
                   ▼
          ┌─────────────────┐
          │ heady-postgres  │
          │ PostgreSQL DB   │
          └─────────────────┘
```

## Services

### 1. heady-manager (Main Service)
- **Type:** Web Service (Node.js)
- **Port:** 3300
- **Description:** Hybrid Node.js/Python MCP server with Admin UI
- **Build:** `npm install && pip install -r requirements.txt`
- **Start:** `node heady-manager.js`
- **Health Check:** `/api/health`

**Features:**
- MCP (Model Context Protocol) server
- Admin IDE with Monaco editor
- AI-powered code assistance
- GPU inference support (optional)
- GitHub App webhook handler

### 2. heady-backend
- **Type:** Web Service (Node.js)
- **Port:** 4000
- **Description:** Backend API for task/notes management
- **Build:** `npm install`
- **Start:** `npm start`
- **Health Check:** `/api/health`

**Features:**
- RESTful API
- MCP proxy endpoints
- Task queue management
- Database integration

### 3. heady-frontend
- **Type:** Static Site (Vite/React)
- **Description:** Frontend UI for Sonic Workspace
- **Build:** `npm install && npm run build`
- **Output:** `dist/`

**Features:**
- React/TypeScript SPA
- Split-pane interface
- Task queue visualization
- Context dashboard

### 4. heady-postgres
- **Type:** PostgreSQL Database
- **Plan:** Starter
- **Database:** `heady_db`
- **User:** `heady_user`

## Environment Variables

### Shared Secrets (heady-shared-secrets)

Create a Render environment group named `heady-shared-secrets` with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `HEADY_API_KEY` | API authentication key | Yes |
| `HF_TOKEN` | Hugging Face API token | Yes |
| `GITHUB_APP_ID` | GitHub App ID | Optional |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key (base64) | Optional |
| `GITHUB_APP_WEBHOOK_SECRET` | GitHub webhook secret | Optional |
| `COPILOT_MCP_CLOUDFLARE_API_TOKEN` | Cloudflare API token | Optional |
| `COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Optional |
| `REMOTE_GPU_HOST` | Remote GPU server hostname | Optional |
| `REMOTE_GPU_PORT` | Remote GPU server port | Optional |
| `GPU_MEMORY_LIMIT` | GPU memory limit in MB | Optional |
| `ENABLE_GPUDIRECT` | Enable GPUDirect RDMA | Optional |

### Service-Specific Variables

Additional environment variables are configured per-service in `render.yaml`:

- **heady-manager:** 30+ configuration variables for logging, rate limiting, models, etc.
- **heady-backend:** PORT, NODE_ENV, DATABASE_URL, CORS_ORIGINS
- **heady-frontend:** NODE_ENV

## Deployment Steps

### Initial Setup

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/HeadyMe/Heady.git
   cd Heady
   ```

2. **Create Render account**
   - Sign up at [render.com](https://render.com)

3. **Create environment group** (REQUIRED before Blueprint deployment)
   - Go to Render Dashboard → Environment Groups
   - Create new group: `heady-shared-secrets`
   - Add required secret values (see table below)
   - **IMPORTANT:** This must be created BEFORE deploying via Blueprint

4. **Deploy via Blueprint**
   - In Render Dashboard, click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository with `render.yaml`
   - Review and create all services

### Manual Deployment

Alternatively, deploy each service manually:

1. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Name: `heady-postgres`
   - Plan: Starter
   - Note the connection string

2. **Deploy heady-manager**
   - New → Web Service
   - Connect repository
   - Build: `npm install && pip install -r requirements.txt`
   - Start: `node heady-manager.js`
   - Add environment variables

3. **Deploy heady-backend**
   - New → Web Service
   - Connect repository
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`

4. **Deploy heady-frontend**
   - New → Static Site
   - Connect repository
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`

### Environment Variables Setup

After deployment, the database connection is automatically configured:

1. The `heady-postgres` database is created by Render
2. Services automatically receive the database URL via `fromDatabase` configuration
3. No manual DATABASE_URL setup is needed in the shared secrets group for the database connection
4. However, you still need to add other secrets to `heady-shared-secrets` (HF_TOKEN, HEADY_API_KEY, etc.)

## CORS Configuration

Update CORS origins in production to match your deployed URLs:

```yaml
HEADY_CORS_ORIGINS: "https://heady-manager.onrender.com,https://heady-backend.onrender.com,https://heady-frontend.onrender.com"
```

Replace with your actual Render URLs if you use custom service names.

## Health Checks

All web services include health check endpoints:

- **heady-manager:** `https://heady-manager.onrender.com/api/health`
- **heady-backend:** `https://heady-backend.onrender.com/api/health`

## Monitoring

### Logs

Access logs for each service:
- Render Dashboard → Select service → Logs tab

### Metrics

Monitor performance:
- Render Dashboard → Select service → Metrics tab

### Alerts

Configure alerts:
- Render Dashboard → Account Settings → Notifications

## Scaling

### Vertical Scaling

Upgrade service plans:
- Starter: 512 MB RAM
- Standard: 2 GB RAM
- Pro: 4+ GB RAM

### Horizontal Scaling

For high traffic, consider:
- Enabling auto-scaling (Pro plans)
- Adding read replicas for database
- Using CDN for static assets

## Troubleshooting

### Build Failures

**Python dependencies fail:**
```bash
# Ensure requirements.txt is valid
pip install -r requirements.txt --dry-run
```

**Node dependencies fail:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Runtime Errors

**Database connection fails:**
- Verify `DATABASE_URL` in environment variables
- Check PostgreSQL service status
- Ensure database is in same region

**CORS errors:**
- Update `HEADY_CORS_ORIGINS` with deployed URLs
- Verify protocol (http vs https)

**GPU inference not working:**
- Set `REMOTE_GPU_HOST` and `REMOTE_GPU_PORT`
- Or leave unset to disable GPU features

### Performance Issues

**Slow response times:**
- Check service metrics for resource usage
- Increase `HEADY_RATE_LIMIT_MAX` if rate limited
- Consider upgrading service plan

**Memory issues:**
- Reduce `HF_MAX_CONCURRENCY` and `HEADY_PY_MAX_CONCURRENCY`
- Increase `GPU_MEMORY_LIMIT` if using GPU

## Continuous Deployment

Render automatically deploys on:
- Push to main branch (production)
- Manual deploys via dashboard

### Branch Deploys

Create preview environments:
```yaml
services:
  - type: web
    name: heady-manager-preview
    branch: develop
    # ... rest of config
```

## Security

### API Keys

- Generate strong `HEADY_API_KEY`: `openssl rand -base64 32`
- Never commit secrets to repository
- Use Render environment variables

### GitHub App

For webhook security:
- Use random webhook secret
- Validate webhook signatures
- Restrict app permissions to minimum required

### Database

- Use internal database URLs when possible
- Enable SSL connections
- Regular backups (automatic on Render)

## Backup & Recovery

### Database Backups

Render automatically backs up PostgreSQL databases:
- Daily snapshots (retained 7 days)
- Point-in-time recovery (Pro plans)

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Support

- **Documentation:** [README.md](./README.md)
- **Issues:** [GitHub Issues](https://github.com/HeadyMe/Heady/issues)
- **Render Support:** [render.com/support](https://render.com/support)

## Additional Resources

- [Render Blueprint Specification](https://render.com/docs/blueprint-spec)
- [Environment Variables](https://render.com/docs/environment-variables)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Static Sites on Render](https://render.com/docs/static-sites)
