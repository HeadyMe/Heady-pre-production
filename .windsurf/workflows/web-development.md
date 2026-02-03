---
description: Develop and deploy the Heady Web Frontends (Next.js)
---

# Web Development Workflow

## Purpose
Develop and deploy Heady web frontends using Next.js framework.

## Usage

### Development
```bash
# Start development server
npm run web:dev

# Build for development
npm run web:build:dev

# Build for production
npm run web:build:prod

# Start production server
npm run web:start
```

### Deployment
```bash
# Deploy to staging
npm run web:deploy --env staging

# Deploy to production
npm run web:deploy --env production

# Rollback deployment
npm run web:rollback --version v1.2.3
```

### Programmatic Usage
```javascript
const WebDeployer = require('./src/web_deployer');

const deployer = new WebDeployer({
  framework: 'nextjs',
  environment: 'production',
  cloudProvider: 'cloudflare'
});

await deployer.build();
await deployer.deploy();
const url = await deployer.getUrl();
```

## Project Structure
- `apps/web/` - Next.js application
- `packages/ui/` - Shared UI components
- `packages/web-core/` - Web-specific logic

## Deployment Targets
- **Staging**: Preview deployments
- **Production**: Live user-facing
- **Edge**: Cloudflare Workers deployment

## Performance Targets
- First Contentful Paint: < 1s
- Time to Interactive: < 2.5s
- Lighthouse Score: > 90
