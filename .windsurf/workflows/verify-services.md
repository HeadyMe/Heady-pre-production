---
description: Verify Services for HeadySystems
---

# Verify Services Workflow

## Purpose
Verify health and status of all HeadySystems services.

## Usage

### Service Verification
```bash
# Verify all services
node scripts/verify-services.js --all

# Verify specific service
node scripts/verify-services.js --service heady-manager

# Check service dependencies
node scripts/verify-services.js --service x --deps

# View service topology
node scripts/verify-services.js --topology
```

### Programmatic Usage
```javascript
const ServiceVerifier = require('./src/service_verifier');

const verifier = new ServiceVerifier({
  registry: 'localhost:3300',
  timeout: 10000
});

const status = await verifier.checkAll();
const report = verifier.generateStatusReport(status);
```

## Service Checks
- **Availability**: Service is running
- **Responsiveness**: Service responds to health checks
- **Dependencies**: All required services available
- **Resources**: CPU, memory within limits
- **Logs**: No critical errors

## Status Indicators
- 🟢 Healthy: All checks pass
- 🟡 Degraded: Some checks failing
- 🔴 Unhealthy: Critical failures detected
- ⚫ Unknown: Cannot determine status
