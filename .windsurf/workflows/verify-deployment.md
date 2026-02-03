---
description: Verify Deployment for HeadyEcosystem
---

# Verify Deployment Workflow

## Purpose
Verify deployment integrity and functionality across the Heady Ecosystem.

## Usage

### Verify Deployment
```bash
# Verify all services
node scripts/verify-deployment.js --all

# Verify specific service
node scripts/verify-deployment.js --service web-api

# Verify with detailed output
node scripts/verify-deployment.js --verbose

# Generate verification report
node scripts/verify-deployment.js --report --output verification.json
```

### Programmatic Usage
```javascript
const DeploymentVerifier = require('./src/deployment_verifier');

const verifier = new DeploymentVerifier({
  environment: 'production',
  checks: ['health', 'connectivity', 'functionality'],
  timeout: 30000
});

const results = await verifier.verifyAll();
const report = verifier.generateReport(results);
```

## Verification Checks
1. **Health Check**: Service is responding
2. **Connectivity**: Can reach dependent services
3. **Functionality**: Core features working
4. **Performance**: Response times within SLA
5. **Security**: No vulnerabilities detected

## Pass Criteria
- All health checks pass
- 95%+ functionality tests pass
- Response time < 500ms
- Zero critical vulnerabilities
