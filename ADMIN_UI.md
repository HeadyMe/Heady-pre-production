# Heady Admin UI Documentation

## Overview

The Heady Admin UI is a secure, web-based management interface for the HeadySystems platform. It provides administrators with tools for file management, code editing, system monitoring, and AI-assisted development.

## Architecture

- **Frontend**: React-based single-page application with Monaco Editor
- **Backend**: Express.js API endpoints (heady-manager.js)
- **Authentication**: API Key-based (`HEADY_API_KEY`)
- **Security**: Rate limiting, CORS, path validation, secret masking

## Access URLs

### Local Development
```
http://localhost:3300/admin
```

### Staging
```
https://heady-staging.onrender.com/admin
```

### Production
```
https://heady.onrender.com/admin
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Python 3.11+ installed
- Valid `HEADY_API_KEY` configured
- Valid `HF_TOKEN` for Hugging Face integration

### Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   Create a `.env` file from the template:
   ```bash
   cp .env.template .env
   ```

   Edit `.env` and set required variables:
   ```env
   PORT=3300
   HEADY_API_KEY=your-secure-api-key-here
   HF_TOKEN=your-huggingface-token
   NODE_ENV=development
   ```

3. **Start the Server**
   ```bash
   npm run admin:dev
   ```

4. **Open Admin UI**
   Navigate to: http://localhost:3300/admin
   
   Or use the helper script:
   ```bash
   ./tools/admin-open
   ```

### Quick Start Scripts

#### Development Mode
```bash
npm run admin:dev      # Start in development mode with auto-reload
```

#### Production Mode
```bash
npm run admin:build    # Build for production
npm run admin:start    # Start production server
```

#### Helper Tools
```bash
./tools/admin-dev      # Start dev server
./tools/admin-open     # Open admin UI in browser
```

## Features

### 1. File Browser
- Navigate repository file structure
- View files with syntax highlighting
- Edit files with Monaco Editor
- Save with Ctrl+S
- Protected by allowlisted paths

### 2. Code Editor
- Multi-tab editing
- Syntax highlighting for Python, JavaScript, JSON, YAML
- Auto-completion
- Find/Replace
- SHA-based conflict detection

### 3. Build & Audit Tools
- Trigger builds with real-time logs
- System health audits
- SSE streaming for operation logs
- Build status tracking

### 4. AI Assistant
- Hugging Face integration
- Code suggestions
- Context-aware help
- Safety guardrails (no secret exposure)

### 5. Settings Management
- GPU configuration (local only)
- View Render.yaml configuration
- View MCP server configuration
- Secret masking for security

### 6. Code Quality Tools
- Python linting (AST-based)
- Test runner integration
- Syntax validation

## API Endpoints

All Admin API endpoints require authentication via the `x-api-key` header.

### File Operations
```
GET  /api/admin/roots              - List allowed file roots
GET  /api/admin/files?root=X&path=Y - Browse directory
GET  /api/admin/file?root=X&path=Y  - Read file
POST /api/admin/file               - Write file
```

### Build & Audit
```
POST /api/admin/build              - Trigger build
POST /api/admin/audit              - Run system audit
GET  /api/admin/ops                - List operations
GET  /api/admin/ops/:id/status     - Operation status
GET  /api/admin/ops/:id/stream     - SSE log stream
```

### Code Tools
```
POST /api/admin/lint               - Lint Python code
POST /api/admin/test               - Run tests
POST /api/admin/assistant          - AI code assistance
```

### Configuration
```
GET  /api/admin/config/render-yaml - Render configuration
GET  /api/admin/config/mcp         - MCP configuration (secrets masked)
GET  /api/admin/settings/gpu       - GPU settings (credentials masked)
```

## Authentication

### API Key Setup

The Admin UI uses API key authentication for security.

**Local Development:**
```bash
export HEADY_API_KEY="your-secure-random-key"
```

**Staging/Production:**
Set via environment variables in your deployment platform (Render.com env groups).

### Making Authenticated Requests

Include the API key in the `x-heady-api-key` header:

```javascript
fetch('/api/admin/files?root=main&path=/', {
  headers: {
    'x-heady-api-key': localStorage.getItem('heady_api_key')
  }
})
```

The Admin UI automatically stores and includes the API key after initial login.

## Security

### Path Protection
- Only allowlisted directories are accessible
- Path traversal attempts are blocked
- Normalized path validation

### Rate Limiting
- Default: 120 requests per minute per IP
- Configurable via `HEADY_RATE_LIMIT_MAX`

### Secret Masking
- API keys, tokens masked in config endpoints
- No credentials exposed in responses
- SHA-based file conflict detection

### CORS
- Configurable allowed origins
- Default: same-origin only
- Set via `HEADY_CORS_ORIGINS`

## Environment Variables

### Required
```env
HEADY_API_KEY           # API key for admin authentication
HF_TOKEN                # Hugging Face API token
```

### Optional
```env
PORT                    # Server port (default: 3300)
NODE_ENV                # Environment (development/production)
HEADY_ADMIN_ROOT        # File system root (default: repo root)
HEADY_ADMIN_ALLOWED_PATHS # Comma-separated additional paths
HEADY_ADMIN_MAX_BYTES   # Max file size (default: 512000)
HEADY_CORS_ORIGINS      # Allowed CORS origins
HEADY_RATE_LIMIT_MAX    # Max requests per window (default: 120)
```

### GPU Settings (Optional)
```env
HEADY_ADMIN_ENABLE_GPU  # Enable GPU features (true/false)
REMOTE_GPU_HOST         # Remote GPU server hostname
REMOTE_GPU_PORT         # Remote GPU server port
GPU_MEMORY_LIMIT        # Memory limit in MB
ENABLE_GPUDIRECT        # Enable GPUDirect RDMA (true/false)
```

## Troubleshooting

### "Unauthorized" Error
- Verify `HEADY_API_KEY` is set in environment
- Check API key in browser localStorage matches server key
- Clear browser storage and re-enter API key

### File Not Found
- Check file path is correct
- Verify path is within allowed roots
- Check file permissions

### Build/Audit Logs Not Streaming
- Ensure SSE connection is established
- Check browser console for errors
- Verify operation ID is correct

### Monaco Editor Not Loading
- Check internet connection (CDN required)
- Verify CSP allows CDN resources
- Check browser console for errors

## Development

### Adding New Features

1. **Backend**: Add route in `heady-manager.js`
2. **Frontend**: Update `public/admin.html`
3. **Documentation**: Update this file
4. **Testing**: Verify with `npm run admin:dev`

### File Structure
```
Heady/
├── heady-manager.js          # Main server with admin routes
├── public/
│   ├── admin.html            # Admin UI (React SPA)
│   └── admin/
│       └── index.html        # Admin redirect/entry
├── src/
│   ├── process_data.py       # Python worker
│   └── consolidated_builder.py # Build orchestration
├── admin_console.py          # System audit script
├── tools/
│   ├── admin-dev             # Dev server helper
│   └── admin-open            # Browser opener
└── ADMIN_UI.md               # This file
```

### Testing Locally

```bash
# Start server in dev mode
npm run admin:dev

# In another terminal, test API
curl -H "x-api-key: your-key" http://localhost:3300/api/admin/roots

# Open in browser
open http://localhost:3300/admin
```

## Production Deployment

### Render.com Setup

1. **Environment Variables**: Set in `heady-shared-secrets` env group
2. **Deploy**: Push to main branch or deploy manually
3. **Access**: https://heady.onrender.com/admin

### Health Checks

```bash
# Check server health
curl https://heady.onrender.com/api/health

# Check admin API (requires auth)
curl -H "x-api-key: your-key" https://heady.onrender.com/api/admin/roots
```

## Limitations

- Maximum file size: 512KB (configurable)
- Maximum 50 concurrent operations
- Python-only linting (other languages require external tools)
- Single-file React application (no build step)
- CDN dependencies (requires internet)

## Support

For issues or questions:
- Check troubleshooting section above
- Review logs: `npm run admin:dev` for detailed output
- Check GitHub issues
- Contact system administrators

## Changelog

### v1.0.0
- Initial Admin UI with file browser and editor
- Monaco Editor integration
- Real-time build/audit logs
- AI assistant with Hugging Face
- GPU configuration panel
- Security hardening (API key, rate limiting, path validation)
