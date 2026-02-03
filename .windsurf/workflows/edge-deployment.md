---
description: Deploy and manage Cloudflare Edge Router
---

# Edge Deployment Workflow

## Purpose
Deploy and manage Cloudflare Workers for edge routing and governance.

## Steps

1. **Configure Cloudflare**
   ```powershell
   # Set environment variables
   $env:CLOUDFLARE_API_TOKEN = "your-token"
   $env:CLOUDFLARE_ACCOUNT_ID = "your-account-id"
   ```

2. **Deploy Governance Worker**
   ```powershell
   cd apps/governance-worker
   npm run deploy
   ```

3. **Configure Edge Router**
   ```javascript
   // Update wrangler.toml
   name = "heady-edge-router"
   main = "src/index.ts"
   compatibility_date = "2024-01-01"
   
   [env.production]
   route = "api.headysystems.com/*"
   ```

4. **Deploy Edge Router**
   ```powershell
   wrangler deploy --env production
   ```

5. **Verify Edge Deployment**
   ```powershell
   # Test edge endpoint
   curl https://api.headysystems.com/health
   
   # Check worker logs
   wrangler tail
   ```

6. **Configure KV Storage**
   ```powershell
   # Create KV namespace
   wrangler kv:namespace create "HEADY_GOVERNANCE"
   
   # Bind to worker
   wrangler kv:key put --binding=HEADY_GOVERNANCE "test" "value"
   ```

## Monitoring
- Cloudflare Analytics Dashboard
- Worker logs via `wrangler tail`
- Custom metrics via HeadyMetrics MCP server
