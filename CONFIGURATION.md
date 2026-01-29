# Configuration Guide

This guide helps you configure the Heady system securely.

## Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your secrets in `.env`:**
   Edit the `.env` file and replace placeholder values with your actual credentials.

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the Admin Dashboard:**
   Open http://localhost:3300/admin.html in your browser

## Environment Variables Explained

### Required for Basic Operation
- `HEADY_API_KEY` - Secures your API endpoints
- `HF_TOKEN` - Enables AI model features via Hugging Face

### Required for Full Functionality
- `DATABASE_URL` - Connects to PostgreSQL database
- `CLOUDFLARE_API_TOKEN` - Enables Cloudflare MCP server
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account identifier
- `OTHER_API_KEY` - External service integrations

## Obtaining API Keys

### Hugging Face Token
1. Visit https://huggingface.co/settings/tokens
2. Create a new token with read access
3. Copy the token to `HF_TOKEN` in your `.env` file

### Cloudflare Credentials
1. Visit https://dash.cloudflare.com/profile/api-tokens
2. Create a new API token
3. Copy the token to `CLOUDFLARE_API_TOKEN`
4. Find your Account ID in the Cloudflare dashboard
5. Copy it to `CLOUDFLARE_ACCOUNT_ID`

### Database URL
Format: `postgresql://username:password@host:port/database`

Example: `postgresql://admin:mypassword@localhost:5432/heady_db`

## Deployment

### GitHub Actions
1. Go to your repository Settings → Secrets and variables → Actions
2. Add each environment variable as a Repository secret
3. Reference them in workflows using `${{ secrets.VARIABLE_NAME }}`
4. See `.github/workflows/deploy.example.yml` for a complete example

### Render
1. Go to your Render dashboard
2. Select your service
3. Navigate to Environment tab
4. Add each variable with its value
5. The `render.yaml` file already references these variables

## Security Checklist

- [ ] All secrets are in environment variables, not hardcoded
- [ ] `.env` file is in `.gitignore` (already configured)
- [ ] Different secrets for dev, staging, and production
- [ ] Secrets are stored in GitHub/Render secret management
- [ ] Regular secret rotation schedule established
- [ ] Access to production secrets is restricted

## Monitoring

The Admin Dashboard provides real-time monitoring:

- **System Health**: Service status, uptime, and last check time
- **Environment Configuration**: Which secrets are configured
- **Docker Integration**: Container runtime status
- **MCP Servers**: All configured Model Context Protocol servers
- **System Activity Log**: Real-time event tracking

Access it at: http://localhost:3300/admin.html

## Troubleshooting

### Server won't start
- Check that all required environment variables are set
- Verify `.env` file exists and has correct format
- Check Node.js version (18+ required)

### Admin Dashboard shows missing configuration
- Ensure environment variables are exported before starting
- For `npm start`, variables should be in `.env` file
- For manual start, prefix command with variables:
  ```bash
  HF_TOKEN=xxx HEADY_API_KEY=yyy node heady-manager.js
  ```

### API endpoints return 500 errors
- Check the server logs for specific errors
- Verify `HEADY_API_KEY` is set
- For API calls, include header: `x-heady-api-key: YOUR_KEY`

## Support

For security issues, see SECURITY.md
For general help, see README.md
