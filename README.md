# Heady

![CI](https://github.com/HeadyMe/Heady/workflows/CI/badge.svg)
![Security Scan](https://github.com/HeadyMe/Heady/workflows/Security%20Scan/badge.svg)
![Automated Fixes](https://github.com/HeadyMe/Heady/workflows/Automated%20Build%20and%20Test%20Fixes/badge.svg)

A hybrid Node.js/Python system for the HeadyConnection ecosystem, featuring a web‑based Admin IDE with AI assistance, real‑time build/audit monitoring, and optional remote GPU support.

**🤖 GitHub Copilot Coding Agent Enabled** - This repository is configured to work with GitHub Copilot's Coding Agent for automated fixes and improvements. See [Copilot Setup Guide](.github/COPILOT_SETUP.md) for details.

## Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| `heady-manager.js` | Node.js/Express | MCP server, Admin API, static file serving |
| `src/process_data.py` | Python | Hugging Face inference worker |
| `public/admin/index.html` | React + Monaco | Admin IDE (file tree, editor, logs, AI panel) |
| `render.yaml` | Render Blueprint | Infrastructure-as-code deployment |

## Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Git

### Local development
1. **Clone and setup:**
   ```bash
   git clone https://github.com/HeadyMe/Heady.git
   cd Heady
   ```

2. **Install dependencies:**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.template .env
   # Edit .env with your API keys and configuration
   ```

4. **Set required environment variables:**
   ```bash
   export HEADY_API_KEY="your-api-key"
   export HF_TOKEN="your-hf-token"
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Access the Admin IDE:** http://localhost:3300/admin

> 💡 **Quick Reference**: For a printable connection guide, see [ADMIN_CONNECTION_QUICK_REF.md](./ADMIN_CONNECTION_QUICK_REF.md)

### Production (Render)
- Deploy via `render.yaml` (uses `heady-shared-secrets` env group for secrets).

## Connecting to Admin UI

### Overview
The Admin UI is a web-based interface accessible via browser at `/admin` endpoint. It requires authentication via `HEADY_API_KEY` and provides file management, build monitoring, AI assistance, and system configuration.

> 📄 **TL;DR**: See the [Quick Connection Reference](./ADMIN_CONNECTION_QUICK_REF.md) for a condensed guide, or run `./test-connection.sh` to verify your setup.

> ℹ️ **Architecture Note**: This project supports two deployment architectures:
> - **Primary (Node.js/Express)**: Single server on port 3300 serving both API and UI (documented below)
> - **Alternative (FastAPI/React)**: Separate Python backend and React frontend (see [Alternative FastAPI Setup](#alternative-fastapi-setup))

### Local Development Access

#### 1. Start the Server
```bash
npm start
```

Expected output:
```
[2026-01-30T09:00:00.000Z] INFO: Heady System Active on Port 3300
```

#### 2. Access Admin UI
Open your browser and navigate to:
- **Primary Admin UI**: `http://localhost:3300/admin.html`
- **Alternative path**: `http://localhost:3300/admin/index.html`

Both paths serve the Monaco editor-based Admin IDE.

#### 3. Authentication
When the Admin UI loads, you'll be prompted to enter your API key:
- **Header name**: `x-heady-api-key`
- **Header value**: Use the value from your `HEADY_API_KEY` environment variable
- **Alternative**: Set `Authorization: Bearer <your-api-key>` header

The Admin UI stores your API key in browser localStorage for convenience.

### LAN (Network) Access

To access the Admin UI from other devices on your local network:

1. **Find your local IP address**:
   ```bash
   # On Linux
   hostname -I | awk '{print $1}'
   
   # On macOS
   ipconfig getifaddr en0
   
   # On Windows
   ipconfig | findstr IPv4
   ```

2. **Configure CORS** in `.env`:
   ```bash
   HEADY_CORS_ORIGINS=http://localhost:3300,http://192.168.1.100:3300
   ```
   Replace `192.168.1.100` with your actual IP address.

3. **Access from LAN devices**:
   ```
   http://<your-ip-address>:3300/admin.html
   ```

4. **Firewall configuration**:
   Ensure port 3300 is open in your firewall:
   ```bash
   # Linux (ufw)
   sudo ufw allow 3300/tcp
   
   # Windows Firewall
   New-NetFirewallRule -DisplayName "Heady Admin" -Direction Inbound -LocalPort 3300 -Protocol TCP -Action Allow
   ```

### Production (Render) Access

#### Deployed URL
When deployed to Render.com, the Admin UI is available at:
```
https://<your-service-name>.onrender.com/admin.html
```

For example, if your service is named `heady-manager`:
```
https://heady-manager.onrender.com/admin.html
```

#### Authentication
Production deployments use the same API key mechanism:
- API key is stored in Render's `heady-shared-secrets` environment group
- Access the `HEADY_API_KEY` value from Render Dashboard → Environment → Secret Files
- Enter this key when prompted by the Admin UI

#### HTTPS
All production traffic is automatically secured with HTTPS by Render.

### URL Structure

| Path | Description |
|------|-------------|
| `/admin.html` | Full-featured Admin IDE (Monaco editor) |
| `/admin/index.html` | Alternative path to Admin IDE |
| `/` | Main Sacred Geometry UI dashboard |
| `/api/health` | Health check endpoint (no auth required) |
| `/api/pulse` | System status and Docker info (no auth required) |
| `/api/admin/*` | Admin API endpoints (requires `HEADY_API_KEY`) |

### Required Environment Variables

For the Admin UI to function properly:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `HEADY_API_KEY` | **Yes** | API key for authentication | None |
| `HF_TOKEN` | **Yes** | Hugging Face API token for AI features | None |
| `PORT` | No | Server port | 3300 |
| `NODE_ENV` | No | Environment (development/production) | development |
| `HEADY_ADMIN_ROOT` | No | File browser root directory | Repository root |
| `HEADY_CORS_ORIGINS` | No | Allowed CORS origins (comma-separated) | None |

### Troubleshooting Connection Issues

#### 1. "Cannot connect to server"
**Symptoms**: Browser shows "Failed to fetch" or connection refused errors.

**Solutions**:
- Verify server is running: `curl http://localhost:3300/api/health`
- Check if port 3300 is in use:
  - Linux/macOS: `lsof -i:3300`
  - Windows: `netstat -ano | findstr :3300`
- Ensure no other process is using port 3300
- Try changing the port: `PORT=3301 npm start`

#### 2. "Unauthorized" or "API key required"
**Symptoms**: Admin UI loads but shows "Unauthorized" error.

**Solutions**:
- Verify `HEADY_API_KEY` is set: `echo $HEADY_API_KEY`
- Ensure the key entered in the UI exactly matches the environment variable
- Check for extra spaces or newline characters
- Try re-entering the API key in the browser

#### 3. "CORS error" when accessing from another device
**Symptoms**: Console shows "Access-Control-Allow-Origin" errors.

**Solutions**:
- Add your client URL to `HEADY_CORS_ORIGINS`:
  ```bash
  HEADY_CORS_ORIGINS=http://192.168.1.100:3300,http://localhost:3300
  ```
- Restart the server after changing CORS settings
- Verify the CORS origin includes the protocol (http:// or https://)

#### 4. "404 Not Found" for /admin
**Symptoms**: Browser shows 404 error for admin paths.

**Solutions**:
- Verify static files exist: `ls -la public/admin.html`
- Check server logs for file serving errors
- Try accessing `/admin.html` directly instead of `/admin`
- Ensure `public/` directory is in the correct location relative to `heady-manager.js`

#### 5. Server starts but immediately crashes
**Symptoms**: Server logs show startup then exits.

**Solutions**:
- Check for missing dependencies: `npm install && pip install -r requirements.txt`
- Verify Node.js version: `node --version` (requires 18+)
- Verify Python version: `python --version` (requires 3.11+)
- Check environment variables are set: `echo $HEADY_API_KEY $HF_TOKEN`
- Review server logs for specific error messages

#### 6. Admin UI loads but features don't work
**Symptoms**: UI appears but operations fail or buttons don't respond.

**Solutions**:
- Check browser console for JavaScript errors (F12 → Console)
- Verify `HF_TOKEN` is set for AI features
- Check Python worker status: `python src/process_data.py health`
- Review network tab in browser DevTools to see which API calls are failing
- Ensure your API key has proper permissions

### Testing Connection

A comprehensive connection test script is provided to verify all endpoints:

```bash
./test-connection.sh
```

This script will:
- Check if the server is running on port 3300
- Test the health and pulse endpoints
- Verify Admin UI static files are accessible
- Test API authentication with both header methods
- Display local and LAN access URLs
- Check required environment variables

Expected output when everything is working:
```
================================
Heady Connection Test
================================

1. Checking if server is running on port 3300... ✓ Server is running
2. Testing health endpoint... ✓ Health check passed
3. Testing pulse endpoint... ✓ Pulse endpoint accessible
4. Testing Admin UI (admin.html)... ✓ Admin UI accessible
5. Testing Admin UI (admin/index.html)... ✓ Admin UI (alt path) accessible

6. Checking environment variables...
   ✓ HEADY_API_KEY is set
   Testing admin API with x-heady-api-key header... ✓ Admin API accessible
   Testing admin API with Bearer token... ✓ Bearer authentication works
   ✓ HF_TOKEN is set

================================
Connection Test Summary
================================

Access points:
  • Main UI:       http://localhost:3300/
  • Admin UI:      http://localhost:3300/admin.html
  • Alt Admin UI:  http://localhost:3300/admin/index.html
  • Health check:  http://localhost:3300/api/health
  • System pulse:  http://localhost:3300/api/pulse

LAN Access (from other devices on your network):
  http://192.168.1.100:3300/admin.html

Connection test completed successfully!
```

### Security Considerations

- **Never share your `HEADY_API_KEY`** publicly or commit it to version control
- **Use HTTPS** in production (automatically provided by Render)
- **Restrict network access** using firewalls and security groups
- **Rotate API keys** regularly
- **Use strong, unique keys** with minimum 32 characters for production
- **Monitor access logs** for suspicious activity

### Alternative FastAPI Setup

This project also supports an alternative architecture using a FastAPI backend with a separate React frontend.

#### Architecture Overview

| Component | Technology | Location | Port |
|-----------|------------|----------|------|
| **Backend** | FastAPI/Python | `src/heady_project/` | 8000 |
| **Frontend** | React/Vite | `frontend/` | Built & served by backend |
| **API Module** | FastAPI routes | `src/heady_project/api.py` | - |

#### Setup Instructions

##### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install and build frontend (if Node.js is available)
cd frontend
npm install
npm run build
cd ..
```

If Node.js is not available, the system will fall back to a placeholder HTML file.

##### 2. Set Environment Variables

```bash
# Required for FastAPI setup
export ADMIN_TOKEN="your-secure-admin-token-here"

# Optional but recommended
export DATABASE_URL="postgresql://..."
export CLOUDFLARE_API_TOKEN="your-cloudflare-token"
```

##### 3. Start the FastAPI Server

```bash
# Start the API server
python -m src.heady_project.admin_console --action serve_api
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345]
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

##### 4. Access the Admin UI

Open your browser to:
```
http://127.0.0.1:8000
```

**Important**: Due to security rules, only local access (`127.0.0.1`) is permitted, not `0.0.0.0` or `localhost`.

#### Authentication (FastAPI)

All API requests require authentication via the `X-Admin-Token` header:

```bash
# Example API request
curl -H "X-Admin-Token: your-admin-token-here" \
     http://127.0.0.1:8000/api/some-endpoint
```

**WebSocket connections** also require the `X-Admin-Token` header for log streaming and real-time updates.

#### Verification Commands

```bash
# Run a full system audit
python -m src.heady_project.admin_console --action full_audit

# Expected output:
# Audit complete. All systems nominal.
```

#### FastAPI Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/` | GET | No | Serves React frontend |
| `/api/*` | Various | Yes | API routes defined in `api.py` |
| `/ws/logs` | WebSocket | Yes | Real-time log streaming |

#### Scanning for Issues (FastAPI Setup)

To scan the FastAPI backend and React frontend for runtime errors:

```bash
# Example prompt for AI-assisted scanning:
# "I have a project called Heady Admin UI that consists of a FastAPI backend 
#  and a React-based frontend. Please review the backend (src/heady_project) 
#  and frontend (frontend) code to identify any runtime errors, missing 
#  functionality or other issues. In particular, check that the API routes 
#  defined in src/heady_project/api.py work correctly and that the front-end 
#  components use them properly. After your scan, summarize any problems and 
#  suggest fixes. Finally, explain how to run the admin UI locally, including 
#  how to build the frontend, start the API server and authenticate using the 
#  ADMIN_TOKEN."
```

#### Troubleshooting (FastAPI)

**1. "Missing Admin Token" error**
- Ensure `ADMIN_TOKEN` environment variable is set
- Include `X-Admin-Token` header in all API requests
- For WebSocket connections, pass token in connection parameters

**2. Frontend not loading**
- Verify `frontend/build` directory exists: `ls -la frontend/build`
- Rebuild frontend: `cd frontend && npm run build`
- Check FastAPI logs for static file mounting errors

**3. Port 8000 already in use**
- Check for running processes: `lsof -i:8000`
- Kill existing process or use a different port
- Modify the port in admin_console.py if needed

**4. Cannot connect from browser**
- Use `http://127.0.0.1:8000`, not `http://0.0.0.0:8000` or `http://localhost:8000`
- Check firewall rules for port 8000
- Verify FastAPI server is running: check console output

#### Comparison: Node.js vs FastAPI Setup

| Feature | Node.js/Express | FastAPI/Python |
|---------|----------------|----------------|
| **Port** | 3300 | 8000 |
| **Auth Header** | `x-heady-api-key` or `Authorization: Bearer` | `X-Admin-Token` |
| **Auth Variable** | `HEADY_API_KEY` | `ADMIN_TOKEN` |
| **Start Command** | `npm start` | `python -m src.heady_project.admin_console --action serve_api` |
| **Frontend Location** | `public/admin.html` | `frontend/build/` |
| **Use Case** | Primary deployment, MCP integration | Alternative setup, separate frontend/backend |

## Configuration

### Core Environment Variables
- `PORT` (default: 3300)
- `HEADY_API_KEY` – Required for Admin API and HF endpoints
- `HF_TOKEN` – Hugging Face inference token
- `HEADY_CORS_ORIGINS` – Comma‑separated allowed origins
- `NODE_ENV` – Set to 'production' for production logging

### Model Configuration
- `HF_TEXT_MODEL` – Default text model (default: gpt2)
- `HF_EMBED_MODEL` – Default embedding model (default: sentence-transformers/all-MiniLM-L6-v2)

### Performance Tuning
- `HEADY_RATE_LIMIT_WINDOW_MS` – Rate limit window (default: 60000)
- `HEADY_RATE_LIMIT_MAX` – Max requests per window (default: 120)
- `HF_MAX_CONCURRENCY` – Max concurrent HF requests (default: 4)
- `HEADY_PY_MAX_CONCURRENCY` – Max Python worker concurrency (default: 2)

### Admin UI Configuration
- `HEADY_ADMIN_ROOT` – Repository root for file access (default: repo root)
- `HEADY_ADMIN_ALLOWED_PATHS` – Comma‑separated allowlist for additional roots
- `HEADY_ADMIN_MAX_BYTES` – Max file size for editing (default: 512 KB)
- `HEADY_ADMIN_OP_LOG_LIMIT` – Max operation log entries (default: 2000)

### Build/Audit scripts
- `HEADY_ADMIN_BUILD_SCRIPT` – Path to build script (default: `src/consolidated_builder.py`)
- `HEADY_ADMIN_AUDIT_SCRIPT` – Path to audit script (default: `admin_console.py`)

### Remote GPU (optional)
- `HEADY_ADMIN_ENABLE_GPU` – Enable GPU features (true/false)
- `REMOTE_GPU_HOST` – GPU host
- `REMOTE_GPU_PORT` – GPU port
- `GPU_MEMORY_LIMIT` – Memory limit in MB
- `ENABLE_GPUDIRECT` – Enable GPUDirect RDMA (true/false)

## Admin IDE Features

- **File browser** with allowlisted roots and safe path resolution
- **Monaco editor** with syntax highlighting for Python, JSON, YAML
- **Multi‑tab editing** with Ctrl+S save
- **Real‑time build/audit logs** via Server‑Sent Events
- **Settings panel** for GPU configuration (local only)
- **AI assistant panel** with Hugging Face integration
- **Code linting** for Python files
- **Test runner** integration

## API Endpoints

### Admin (protected by HEADY_API_KEY)
- `GET /api/admin/roots` – List allowed roots
- `GET /api/admin/files` – Browse directory
- `GET /api/admin/file` – Read file
- `POST /api/admin/file` – Write file (with SHA guard)
- `POST /api/admin/build` – Trigger build
- `POST /api/admin/audit` – Trigger audit
- `GET /api/admin/ops/:id/stream` – SSE log stream
- `GET /api/admin/config/render-yaml` – Render config
- `GET /api/admin/config/mcp` – MCP config (secrets masked)
- `GET /api/admin/settings/gpu` – GPU settings (masked)
- `POST /api/admin/assistant` – AI assistant
- `POST /api/admin/lint` – Code linting
- `POST /api/admin/test` – Run tests

### Hugging Face (protected by HEADY_API_KEY)
- `POST /api/hf/infer`
- `POST /api/hf/generate`
- `POST /api/hf/embed`

### System
- `GET /api/pulse` – Docker/system info
- `GET /api/health` – Health check

## Troubleshooting

### Common Issues

1. **"HF_TOKEN is not set" error**
   - Ensure HF_TOKEN is set in your environment
   - Get a token from https://huggingface.co/settings/tokens

2. **"HEADY_API_KEY is not set" error**
   - Set HEADY_API_KEY in your environment
   - Use a strong, unique key for security

3. **Python worker not responding**
   - Check that Python dependencies are installed: `pip install -r requirements.txt`
   - Verify HEADY_PYTHON_BIN points to correct Python executable

4. **Port already in use**
   - Change PORT environment variable
   - Kill existing process: `lsof -ti:3300 | xargs kill`

5. **CORS issues**
   - Set HEADY_CORS_ORIGINS to include your frontend URL
   - For development: `HEADY_CORS_ORIGINS=http://localhost:3000,http://localhost:3300`

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed console output with timestamps and structured logging.

## Development Scripts

### Available Scripts
- `npm start` – Start the server
- `python src/process_data.py` – Run Python worker standalone
- `python admin_console.py` – Run system audit
- `python src/process_data.py qa` – Test QA interface

### Testing
```bash
# Test Python worker QA functionality
echo '{"question":"What is Heady?","context":"Heady is a system"}' | python src/process_data.py qa

# Run system audit
python admin_console.py --output audit.json
```

## GitHub Copilot Integration

This repository is fully integrated with GitHub Copilot's Coding Agent for automated assistance:

- **Automated Workflows**: Continuous integration, security scanning, and automated fix suggestions
- **Issue Templates**: Pre-configured templates for requesting automated fixes
- **Code Owners**: Automatic review assignment for PRs
- **MCP Servers**: Custom MCP server configuration for enhanced Copilot capabilities

### Quick Start with Copilot

1. **Enable the Copilot Coding Agent** - See [.github/COPILOT_SETUP.md](.github/COPILOT_SETUP.md) for step-by-step instructions
2. **Request automated fixes** - Use issue templates or mention `@github-copilot` in issues/PRs
3. **Monitor CI/CD** - All PRs automatically run checks and provide feedback

### Copilot Configuration Files

- `.github/COPILOT_SETUP.md` – Complete setup guide for enabling Copilot Coding Agent
- `.github/copilot-instructions.md` – Project overview and Quiz Protocol for documentation
- `.github/copilot-mcp-config.json` – MCP server definitions
- `.github/workflows/automated-fixes.yml` – Automated checks and fix workflow
- `.github/workflows/copilot-setup-steps.yml` – Setup workflow for Copilot
- `.github/CODEOWNERS` – Code review assignments
- `.github/PULL_REQUEST_TEMPLATE.md` – PR checklist template
- `.github/ISSUE_TEMPLATE/` – Issue templates for bugs, features, and fix requests

## Documentation Protocol

All documentation follows the **Quiz & Flashcard Methodology** (see `.github/copilot-instructions.md`).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the code style guidelines in `.github/copilot-instructions.md`
4. Ensure all tests pass
5. Submit a pull request

## License

See LICENSE file.
