# Admin UI Security Documentation

## Security Overview

The Heady Admin UI implements multiple layers of security to protect sensitive data and prevent unauthorized access. This document details all security measures and best practices.

## Authentication & Authorization

### API Key Authentication
- **Method**: Custom API key-based authentication
- **Header**: `x-heady-api-key` or `Authorization: Bearer <key>`
- **Implementation**: Timing-safe string comparison using `crypto.timingSafeEqual`
- **Scope**: All `/api/admin/*` endpoints require authentication

### Key Security Features
1. **Timing-Safe Comparison**: Prevents timing attacks by using constant-time comparison
2. **Multi-Header Support**: Accepts both custom header and Bearer token format
3. **Environment-Based**: API key loaded from secure environment variables
4. **No Hardcoding**: Keys never stored in source code

### Generating Secure API Keys
```bash
# Generate a strong random key (32 bytes)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Security Headers

All responses include comprehensive security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking attacks |
| `Referrer-Policy` | `no-referrer` | Protects referrer information |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates browsing context |
| `Cross-Origin-Resource-Policy` | `same-site` | Restricts resource loading |
| `X-DNS-Prefetch-Control` | `off` | Prevents DNS prefetch |
| `Strict-Transport-Security` | `max-age=15552000` | Forces HTTPS (production only) |

### HSTS (HTTP Strict Transport Security)
- **Enabled**: Production only (`NODE_ENV=production`)
- **Duration**: 180 days (15552000 seconds)
- **Scope**: Includes subdomains
- **Purpose**: Forces HTTPS connections

## CORS (Cross-Origin Resource Sharing)

### Configuration
```env
HEADY_CORS_ORIGINS=https://trusted-domain.com,https://another-domain.com
```

### Behavior
- **Default**: Same-origin only
- **Configured Origins**: Allows specified domains
- **Credentials**: Not supported
- **Preflight**: Handled automatically

### Security Features
1. Origin validation against allowlist
2. No credentials support (cookies disabled for CORS)
3. Strict mode by default
4. Production-ready configuration

## Rate Limiting

### Configuration
```env
HEADY_RATE_LIMIT_WINDOW_MS=60000  # 1 minute
HEADY_RATE_LIMIT_MAX=120           # 120 requests per window
```

### Implementation
- **Scope**: All API endpoints except `/health` and OPTIONS requests
- **Method**: IP-based tracking with sliding window
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response**: HTTP 429 with `Retry-After` header

### Memory Management
- Automatic cleanup of expired entries
- Maximum 10,000 IPs tracked simultaneously
- Garbage collection every request

## Path Traversal Protection

### Validation Rules
1. **Normalization**: All paths normalized using `path.normalize()`
2. **Boundary Checks**: Paths must stay within allowed roots
3. **Relative Path Blocking**: `..` sequences rejected if outside root
4. **Absolute Path Rejection**: Only relative paths accepted

### Examples
```javascript
// ✅ ALLOWED
/api/admin/file?root=root-1&path=README.md
/api/admin/file?root=root-1&path=src/index.js

// ❌ BLOCKED
/api/admin/file?root=root-1&path=../../../etc/passwd
/api/admin/file?root=root-1&path=/etc/passwd
```

### Test Results
```bash
$ curl -H "x-heady-api-key: $KEY" \
  'http://localhost:3300/api/admin/files?root=root-1&path=../../etc/passwd'
HTTP/1.1 400 Bad Request
{"ok":false,"error":"Path is outside allowed root"}
```

## Secret Masking

### Configuration Endpoints
Configuration endpoints automatically mask sensitive data:

#### MCP Configuration (`/api/admin/config/mcp`)
- Environment variables masked with `***`
- Tokens replaced with `REDACTED`
- API keys hidden

#### GPU Settings (`/api/admin/settings/gpu`)
- Credentials masked
- Hostnames partially hidden
- Sensitive settings redacted

### Implementation
```javascript
// Example masking function
function maskSecrets(config) {
  if (config.env) {
    for (const key in config.env) {
      if (key.includes('TOKEN') || key.includes('KEY') || key.includes('SECRET')) {
        config.env[key] = '***';
      }
    }
  }
  return config;
}
```

## File Operations Security

### SHA-256 Integrity Checking
- Every file read includes SHA-256 hash
- Write operations verify hash before save
- Prevents concurrent modification conflicts

### File Size Limits
```env
HEADY_ADMIN_MAX_BYTES=512000  # 512 KB default
```

- **Purpose**: Prevents memory exhaustion
- **Scope**: File editor operations
- **Response**: HTTP 413 for oversized files

### Allowed Paths
```env
HEADY_ADMIN_ROOT=/path/to/repo
HEADY_ADMIN_ALLOWED_PATHS=/additional/path1,/additional/path2
```

- **Principle**: Explicit allowlist, deny by default
- **Validation**: Path must start with allowed root
- **Traversal Check**: Normalized path verified

## Network Security

### HTTPS/TLS
- **Local Dev**: HTTP acceptable
- **Staging**: HTTPS required
- **Production**: HTTPS enforced via HSTS
- **Certificates**: Managed by Render.com

### Proxy Trust
```env
HEADY_TRUST_PROXY=true  # Production only
```

- **Purpose**: Correct IP detection behind proxies
- **Scope**: Cloudflare, AWS ELB, Nginx, etc.
- **Security**: Only enable in production with verified proxies

## Input Validation

### Request Validation
1. **Path Parameters**: Validated against allowed roots
2. **Query Strings**: Sanitized and normalized
3. **JSON Payloads**: Parsed and validated
4. **File Uploads**: Size and type checked

### Sanitization
- All user input sanitized before processing
- No eval() or dynamic code execution
- Path injection prevented
- SQL injection N/A (no database queries from user input)

## Session Management

### Current Implementation
- **Stateless**: No server-side sessions
- **Authentication**: Per-request API key
- **Storage**: Client-side (localStorage)
- **Expiration**: No automatic expiration (key rotation recommended)

### Future Enhancements
- JWT tokens with expiration
- Refresh token mechanism
- Session revocation
- Multi-factor authentication

## Security Testing

### Automated Tests
Run the security test suite:
```bash
export HEADY_API_KEY="your-test-key"
./tools/test-admin-security
```

### Test Coverage
- ✅ Authentication bypass attempts
- ✅ Invalid API key rejection
- ✅ Security headers presence
- ✅ Rate limiting enforcement
- ✅ Path traversal prevention
- ✅ CORS policy validation
- ✅ Secret masking verification

### Test Results (2026-01-30)
```
Total Tests: 16
Passed: 16
Failed: 0
Success Rate: 100%
```

## Security Audit Checklist

### Pre-Deployment
- [ ] Strong API key generated and stored securely
- [ ] CORS origins configured for production domains
- [ ] HTTPS enforced (HSTS enabled)
- [ ] Rate limits appropriate for expected traffic
- [ ] File size limits configured
- [ ] Allowed paths properly restricted
- [ ] Security headers verified
- [ ] Secret masking tested
- [ ] Path traversal protection tested

### Runtime Monitoring
- [ ] Monitor for failed authentication attempts
- [ ] Track rate limit violations
- [ ] Review access logs for suspicious patterns
- [ ] Verify HTTPS usage in production
- [ ] Check for exposed secrets in responses
- [ ] Audit file access patterns

### Periodic Reviews
- [ ] Rotate API keys quarterly
- [ ] Review and update CORS origins
- [ ] Audit allowed file paths
- [ ] Update dependencies for security patches
- [ ] Review rate limit effectiveness
- [ ] Test security controls

## Vulnerability Reporting

### Disclosure Policy
If you discover a security vulnerability:

1. **Do Not** create public GitHub issues
2. **Email** security contact (see SECURITY.md)
3. **Include** detailed reproduction steps
4. **Wait** for acknowledgment before disclosure

### Response Timeline
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Fix Development**: 2-4 weeks (severity dependent)
- **Disclosure**: After fix deployed and verified

## Security Best Practices

### For Administrators
1. **Use strong, unique API keys** (32+ characters, random)
2. **Rotate keys regularly** (quarterly minimum)
3. **Enable HTTPS** in production (enforced by HSTS)
4. **Configure CORS** restrictively
5. **Monitor access logs** for anomalies
6. **Keep dependencies updated** for security patches
7. **Use environment variables** for all secrets
8. **Never commit secrets** to version control

### For Developers
1. **Validate all input** before processing
2. **Use timing-safe comparisons** for secrets
3. **Implement rate limiting** on all endpoints
4. **Add security headers** to all responses
5. **Sanitize output** to prevent XSS
6. **Use parameterized queries** (if adding database)
7. **Follow principle of least privilege**
8. **Review code for security issues**

### For DevOps
1. **Use secret management services** (AWS Secrets Manager, etc.)
2. **Separate dev/staging/prod** environments
3. **Monitor for security events**
4. **Implement logging and alerting**
5. **Use TLS 1.2+** for all connections
6. **Regular security scanning**
7. **Automate security testing** in CI/CD
8. **Incident response plan** documented

## Compliance

### Data Protection
- **Personal Data**: Not collected or stored
- **Credentials**: Environment-based, never logged
- **File Contents**: Access controlled by authentication
- **Logs**: No sensitive data in application logs

### Standards Alignment
- **OWASP Top 10**: Addressed
  - A01: Broken Access Control ✅ Mitigated
  - A02: Cryptographic Failures ✅ Using timing-safe comparison
  - A03: Injection ✅ Input validation and sanitization
  - A04: Insecure Design ✅ Security by design
  - A05: Security Misconfiguration ✅ Secure defaults
  - A06: Vulnerable Components ✅ Dependency monitoring
  - A07: Auth Failures ✅ Strong authentication
  - A08: Data Integrity ✅ SHA-256 hashing
  - A09: Logging Failures ✅ Structured logging
  - A10: SSRF ✅ No external requests from user input

## Security Updates

### Current Version: 1.0.0
- Initial security implementation
- Timing-safe authentication
- Comprehensive security headers
- Path traversal protection
- Rate limiting
- Secret masking

### Planned Enhancements
- JWT-based authentication
- Multi-factor authentication
- Session management
- Audit logging
- Intrusion detection
- Advanced rate limiting (by endpoint)
- Content Security Policy (CSP)
- API versioning with security controls

## Contact

For security questions or concerns:
- See SECURITY.md in repository
- Review GitHub security advisories
- Check for CVEs in dependencies

**Last Updated**: 2026-01-30  
**Security Review**: Passed  
**Next Review**: 2026-04-30
