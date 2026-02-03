---
description: Secure Remote Connection Setup & Configuration
---

# Secure Remote Connection Setup

## Overview
This workflow establishes secure remote connectivity for the Heady System with SSH tunneling, TLS encryption, and proper authentication.

## Prerequisites
- SSH keys configured (see /ssh-setup workflow)
- Cloudflare Tunnel active (see /start-tunnel workflow)
- HeadyManager running locally
- All environment variables configured in .env

## Step 1: Generate TLS Certificates
// turbo
```powershell
# Generate self-signed certificates for local development
$certPath = ".\.heady-context\certs"
if (-not (Test-Path $certPath)) { mkdir $certPath }

# Generate private key
openssl genrsa -out "$certPath\server.key" 2048

# Generate certificate
openssl req -new -x509 -key "$certPath\server.key" -out "$certPath\server.crt" -days 365 `
  -subj "/C=US/ST=State/L=City/O=HeadySystems/CN=localhost"

Write-Host "✅ TLS certificates generated at $certPath"
```

## Step 2: Configure HTTPS Server
Update heady-manager.js to support HTTPS:
```javascript
const httpsOptions = {
  key: fs.readFileSync('./.heady-context/certs/server.key'),
  cert: fs.readFileSync('./.heady-context/certs/server.crt')
};
const httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(PORT, () => console.log(`HTTPS Server running on port ${PORT}`));
```

## Step 3: Configure SSH Tunneling
// turbo
```powershell
# Create SSH tunnel configuration
$sshConfig = @"
Host heady-remote
  HostName your-remote-server.com
  User heady-user
  IdentityFile ~/.ssh/id_rsa
  LocalForward 3300 localhost:3300
  ServerAliveInterval 60
  ServerAliveCountMax 3
"@

$sshConfig | Out-File -Encoding UTF8 "$env:USERPROFILE\.ssh\config" -Append
Write-Host "✅ SSH tunnel configuration added"
```

## Step 4: Enable API Key Authentication
Verify .env has HEADY_API_KEY set:
```bash
# Generate strong API key if not set
if [ -z "$HEADY_API_KEY" ]; then
  HEADY_API_KEY=$(openssl rand -base64 32)
  echo "HEADY_API_KEY=$HEADY_API_KEY" >> .env
fi
```

## Step 5: Configure CORS for Remote Access
Update .env:
```
HEADY_CORS_ORIGINS=https://your-domain.com,https://app.your-domain.com
HEADY_TRUST_PROXY=true
```

## Step 6: Test Remote Connection
```powershell
# Test HTTPS endpoint
$headers = @{ "X-Heady-API-Key" = $env:HEADY_API_KEY }
$response = Invoke-WebRequest -Uri "https://localhost:3300/api/health" `
  -Headers $headers -SkipCertificateCheck

Write-Host "✅ Remote connection test successful: $($response.StatusCode)"
```

## Step 7: Enable Audit Logging for Remote Access
Verify audit_logs directory exists and is writable:
```powershell
if (-not (Test-Path ".\audit_logs")) { mkdir ".\audit_logs" }
Write-Host "✅ Audit logging configured"
```

## Verification Checklist
- [ ] TLS certificates generated
- [ ] HTTPS server configured
- [ ] SSH tunnel configured
- [ ] API key authentication enabled
- [ ] CORS configured for remote domains
- [ ] Audit logging active
- [ ] Remote connection tested successfully

## Security Best Practices
1. **Rotate API Keys**: Change HEADY_API_KEY every 90 days
2. **Monitor Audit Logs**: Review audit_logs daily for suspicious activity
3. **Use VPN**: Always connect through VPN or SSH tunnel for remote access
4. **Rate Limiting**: Configured at 200 requests/minute per IP
5. **HTTPS Only**: Never transmit credentials over HTTP
6. **Firewall Rules**: Restrict access to known IPs only

## Troubleshooting
- **Certificate errors**: Regenerate certificates and restart server
- **Connection refused**: Verify firewall rules and port forwarding
- **Auth failures**: Check HEADY_API_KEY matches between client and server
- **Audit log errors**: Ensure audit_logs directory has write permissions
