# Heady

A hybrid Node.js/Python system for the HeadyConnection ecosystem, featuring a web‑based Admin IDE with AI assistance, real‑time build/audit monitoring, and optional remote GPU support.

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

### Production (Render)
- Deploy via `render.yaml` (uses `heady-shared-secrets` env group for secrets).

## Configuration

### Core Environment Variables
- `PORT` (default: 3300)
- `HEADY_API_KEY` – Required for Admin API and HF endpoints
- `HF_TOKEN` – Hugging Face inference token
- `HEADY_CORS_ORIGINS` – Comma‑separated allowed origins
- `NODE_ENV` – Set to 'production' for production logging

### GitHub App Configuration (Optional)
- `GITHUB_APP_ID` – GitHub App ID for automated governance
- `GITHUB_APP_PRIVATE_KEY` – Base64-encoded private key
- `GITHUB_APP_WEBHOOK_SECRET` – Webhook signature secret

See [GitHub App Setup Guide](docs/github-app-setup.md) for details on configuring the Heady Governance Bot.

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

### GitHub App (Webhook Signature Verification)
- `POST /api/github/webhooks` – GitHub App webhook receiver
- `GET /api/github/setup` – GitHub App installation setup
- `GET /api/github/callback` – OAuth callback endpoint
- `GET /api/github/app/status` – App health and statistics

## GitHub App Integration

Heady includes an optional GitHub App integration that provides automated compliance checks, security monitoring, and repository governance for the HeadyConnection ecosystem.

### Features
- **Automated Compliance Validation**: Branch naming, commit message validation, required files
- **Security Monitoring**: Real-time security event tracking and automated alerts
- **Repository Health Checks**: Automated health assessments and recommendations
- **Governance Enforcement**: Branch protection, review requirements, status checks

### Setup
See the [GitHub App Setup Guide](docs/github-app-setup.md) for complete registration and configuration instructions.

### Quick Start
1. Register the GitHub App using the manifest in `.github/github-app-manifest.json`
2. Generate and securely store the private key
3. Set environment variables: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_WEBHOOK_SECRET`
4. Deploy to Render or your hosting platform
5. Install the app on your repositories

### Webhook Events
The app handles: pull requests, pushes, issues, comments, security advisories, check runs, and more. All events are logged and can trigger custom automation workflows.

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

## Copilot Customization

- `.github/copilot-instructions.md` – Project overview and Quiz Protocol for documentation
- `.github/copilot-mcp-config.json` – MCP server definitions
- `.github/workflows/copilot-setup-steps.yml` – Setup workflow for Copilot

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

## Commit Guidelines

1. Use descriptive commit messages.
2. Follow conventional commits format (e.g., feat:, fix:, docs:).
3. Ensure atomicity of commits.
