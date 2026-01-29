# Heady_local
Official Local Heady Dev Repo

## Configuration

This project requires several environment variables to be configured for secure operation. These secrets should **never** be committed to source control.

### Required Environment Variables

#### Database Configuration
- **DATABASE_URL** - The full Postgres connection string (e.g., `postgres://user:password@host:5432/database`)
  - Used by: Render services, MCP Postgres server
  - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

#### API Keys
- **OTHER_API_KEY** - API key for external service integrations
  - Used by: Data processor services
  
- **HF_TOKEN** - Hugging Face API token for AI model inference
  - Used by: heady-manager.js for text generation and embeddings
  - Get yours at: https://huggingface.co/settings/tokens

- **HEADY_API_KEY** - Internal API key for securing Heady Manager endpoints
  - Used by: heady-manager.js for API authentication
  - Generate a secure random string

#### Cloudflare Configuration
- **CLOUDFLARE_API_TOKEN** - Your Cloudflare API token
  - Used by: MCP Cloudflare server
  - Get yours at: https://dash.cloudflare.com/profile/api-tokens

- **CLOUDFLARE_ACCOUNT_ID** - Your Cloudflare account identifier
  - Used by: MCP Cloudflare server
  - Find it in your Cloudflare dashboard

### Setting Up Secrets

#### For Local Development
Create a `.env` file in the project root (it's already in `.gitignore`):

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/heady_db
OTHER_API_KEY=your_api_key_here
HF_TOKEN=your_huggingface_token
HEADY_API_KEY=your_secure_random_key
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

#### For GitHub Actions
1. Go to your repository settings
2. Navigate to **Settings → Secrets and variables → Actions**
3. Add each secret as a **Repository secret**:
   - DATABASE_URL
   - OTHER_API_KEY
   - HF_TOKEN
   - HEADY_API_KEY
   - CLOUDFLARE_API_TOKEN
   - CLOUDFLARE_ACCOUNT_ID

#### For Render Deployment
1. Go to your Render dashboard
2. Select your service
3. Navigate to **Environment** tab
4. Add each environment variable with its corresponding value

### Security Best Practices

- **Never commit secrets** to version control
- Use different secrets for development, staging, and production
- Rotate API keys and tokens regularly
- Use strong, randomly generated keys where possible
- Monitor access logs for unauthorized usage

## Running the Project

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Postgres database (for full functionality)

### Installation
```bash
npm install
```

### Starting the Server
```bash
npm start
```

The Heady Manager will start on port 3300 (or the port specified in the PORT environment variable).

### Admin Dashboard
Access the real-time admin dashboard at:
```
http://localhost:3300/admin
```

The admin dashboard provides:
- Real-time system component monitoring
- Service health status
- Build process tracking
- Docker integration status
- Environment configuration overview

## API Endpoints

- `GET /api/health` - Service health check
- `GET /api/pulse` - Docker and system status
- `POST /api/hf/infer` - Hugging Face model inference (requires API key)
- `POST /api/hf/generate` - Text generation (requires API key)
- `POST /api/hf/embed` - Text embeddings (requires API key)
