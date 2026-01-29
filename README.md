# Heady Project

Official Heady Development Repository - A secure, patent-integrated system management platform with real-time monitoring.

## Overview

The Heady project is a comprehensive system management platform that integrates multiple services including:
- Hugging Face AI inference
- Docker container management
- PostgreSQL database integration
- Cloudflare CDN/Workers integration
- Real-time monitoring and administration

## Required Configuration Secrets

This project requires several environment variables for secure operation. **Never commit these values to source control.**

### Core Secrets

#### `DATABASE_URL`
**Required:** Yes  
**Format:** `postgresql://user:password@host:port/database`  
**Description:** Full PostgreSQL connection string for the audit trail database and MCP server integration.  
**Example:** `postgresql://admin:mypassword@db.example.com:5432/heady_production`

#### `OTHER_API_KEY`
**Required:** Yes  
**Description:** API key for external data processing services used by the data processor.  
**Example:** `sk-1234567890abcdef`

#### `CLOUDFLARE_API_TOKEN`
**Required:** Yes (if using Cloudflare integration)  
**Description:** Your Cloudflare API token for MCP Cloudflare server operations.  
**How to obtain:** 
1. Log in to Cloudflare Dashboard
2. Navigate to My Profile → API Tokens
3. Create a token with appropriate permissions
**Example:** `abcdef1234567890_example_token`

#### `CLOUDFLARE_ACCOUNT_ID`
**Required:** Yes (if using Cloudflare integration)  
**Description:** Your Cloudflare account identifier.  
**How to obtain:** Found in Cloudflare Dashboard → Account Home  
**Example:** `1234567890abcdef1234567890abcdef`

#### `HF_TOKEN`
**Required:** Yes (for AI features)  
**Description:** Hugging Face API token for model inference.  
**How to obtain:**
1. Sign up at https://huggingface.co
2. Navigate to Settings → Access Tokens
3. Create a new token
**Example:** `hf_abcdefghijklmnopqrstuvwxyz123456`

#### `HEADY_API_KEY`
**Required:** Yes  
**Description:** Internal API key for authenticating requests to Heady Manager endpoints.  
**Note:** Generate a secure random string (minimum 32 characters recommended).  
**Example:** `heady_sk_prod_1234567890abcdef1234567890abcdef`

## Setting Up Secrets

### Local Development

Create a `.env` file in the project root (already in `.gitignore`):

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/heady_dev

# API Keys
OTHER_API_KEY=your_api_key_here
HEADY_API_KEY=your_internal_api_key_here
HF_TOKEN=your_huggingface_token_here

# Cloudflare (optional for local dev)
CLOUDFLARE_API_TOKEN=your_cloudflare_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Model Configuration (optional)
HF_TEXT_MODEL=gpt2
HF_EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### GitHub Actions

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value:
   - `DATABASE_URL`
   - `OTHER_API_KEY`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `HF_TOKEN`
   - `HEADY_API_KEY`

### Render Deployment

1. Log in to your Render dashboard
2. Select your service (`heady-manager`)
3. Navigate to **Environment** tab
4. Add environment variables:
   - Click **Add Environment Variable**
   - Enter key and value for each secret
   - Click **Save Changes**

The `render.yaml` file is configured to use the `heady-shared-secrets` environment variable group, which will automatically inject these values into your deployed service.

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for container features)
- PostgreSQL database (for production)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/HeadyMe/Heady.git
cd Heady

# Install dependencies
npm install

# Set up your .env file with required secrets (see above)

# Start the development server
npm start
```

The server will start on port 3300 by default (configurable via `PORT` environment variable).

## API Endpoints

### Health & Monitoring

- `GET /api/health` - System health check with environment status
- `GET /api/pulse` - Docker integration health check
- `GET /api/admin/status` - Real-time system component status (requires admin UI)

### AI Inference (Requires `HEADY_API_KEY` header)

- `POST /api/hf/infer` - General Hugging Face model inference
- `POST /api/hf/generate` - Text generation
- `POST /api/hf/embed` - Text embedding/vectorization

## Admin UI

The Heady project includes a real-time administration interface for monitoring system components. Access the admin dashboard at:

```
http://localhost:3300/admin/
```

The admin UI provides:
- **Real-time Component Status** - Live monitoring of all MCP servers and services
- **Health Metrics** - System uptime, Docker status, API availability
- **Secret Verification** - Visual indicators for properly configured environment variables
- **Patent Integration Status** - Verification of patent-protected features
- **Build & Audit Logs** - Real-time streaming of system operations

## Patent Concepts Integration

This project incorporates patent-protected intellectual property concepts. The following framework ensures proper integration:

### Patent Integration Checklist

- [ ] **Multi-modal AI Integration** - Hugging Face inference pipeline (Text, Embeddings)
- [ ] **Containerized Service Management** - Docker integration for isolated execution
- [ ] **Secure API Gateway** - API key authentication and rate limiting
- [ ] **Real-time Monitoring Dashboard** - WebSocket-based live updates
- [ ] **Database Audit Trail** - PostgreSQL integration for compliance tracking
- [ ] **CDN Edge Computing** - Cloudflare Workers integration
- [ ] **Model Context Protocol (MCP)** - Standardized AI service communication

### Adding New Patent Features

When implementing new patent-protected features:

1. **Document the Patent Reference** - Add to `PATENTS.md` with filing number and description
2. **Update Admin UI** - Add monitoring components for the new feature
3. **Add Health Checks** - Implement status endpoints for real-time verification
4. **Update Tests** - Ensure automated tests cover the patent claims
5. **Update Documentation** - Reflect changes in README and API docs

## Security Best Practices

1. **Never commit secrets** - Always use environment variables
2. **Rotate secrets regularly** - Especially `HEADY_API_KEY` and database passwords
3. **Use least privilege** - Grant only necessary permissions to API tokens
4. **Monitor access logs** - Review admin UI logs for suspicious activity
5. **Enable HTTPS** - In production, always use TLS/SSL
6. **Audit dependencies** - Regularly check for security vulnerabilities

## MCP Server Configuration

The Model Context Protocol (MCP) configuration in `mcp_config.json` integrates multiple AI and infrastructure services:

- **filesystem** - Workspace file access
- **sequential-thinking** - Multi-step reasoning
- **memory** - Persistent context storage
- **fetch** - HTTP request capabilities
- **postgres** - Database operations (uses `DATABASE_URL`)
- **git** - Version control integration
- **puppeteer** - Browser automation
- **cloudflare** - CDN and edge computing (uses Cloudflare secrets)

All MCP servers are configured to use environment variable substitution for secure credential management.

## Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement changes
   - Update admin UI if adding new components
   - Run local tests

2. **Security Review**
   - Check for hardcoded secrets
   - Verify environment variable usage
   - Run security audit tools

3. **Patent Compliance**
   - Review patent integration checklist
   - Update monitoring dashboards
   - Document new patent applications

4. **Deployment**
   - Merge to main branch
   - Verify secrets in Render dashboard
   - Monitor admin UI for successful deployment

## Troubleshooting

### "HF_TOKEN is not set" Error
- Verify `HF_TOKEN` is set in your environment or `.env` file
- Check the admin UI health dashboard for token status

### "HEADY_API_KEY is not set" Error
- Ensure `HEADY_API_KEY` is configured
- Include header `x-heady-api-key` in API requests

### Database Connection Failures
- Verify `DATABASE_URL` format is correct
- Check database server is accessible
- Review firewall/security group settings

### Cloudflare Integration Issues
- Confirm both `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set
- Verify token has necessary permissions
- Check token hasn't expired

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all secrets are externalized
5. Update documentation
6. Submit a pull request

## License

See LICENSE file for details.

## Support

For issues or questions, please open a GitHub issue or contact the development team.
