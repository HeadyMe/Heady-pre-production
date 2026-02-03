---
description: Audit and rotate security credentials
---

# Secrets Management Workflow

## Purpose
Audit, rotate, and manage security credentials across the Heady ecosystem.

## Usage

### Audit Credentials
```bash
# Run security audit
node scripts/secrets-audit.js --full

# Check for expired credentials
node scripts/secrets-audit.js --check-expiry

# Generate audit report
node scripts/secrets-audit.js --report --output audit.json
```

### Rotate Secrets
```bash
# Rotate specific secret
node scripts/secrets-rotate.js --secret API_KEY --rotate

# Rotate all expiring secrets
node scripts/secrets-rotate.js --all-expiring

# Verify rotation
node scripts/secrets-rotate.js --verify
```

### Programmatic Usage
```javascript
const SecretsManager = require('./src/secrets_manager');

const manager = new SecretsManager({
  vault: process.env.VAULT_URL,
  rotationPolicy: '90-days',
  auditEnabled: true
});

const audit = await manager.runAudit();
const rotated = await manager.rotateExpiring();
```

## Security Checks
- Expiration date validation
- Access pattern analysis
- Compliance verification
- Anomaly detection

## Rotation Policies
- API Keys: 90 days
- Database Credentials: 30 days
- Service Accounts: 180 days
- Certificates: 365 days
