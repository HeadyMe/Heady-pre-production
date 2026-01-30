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
- `JULES_API_KEY` – Jules AI service API key (required for Jules integration)
- `CLOUDFLARE_SECRET` – Cloudflare API token (required for Cloudflare integration)
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

### Jules AI (protected by HEADY_API_KEY)
- `POST /api/jules/chat` – Jules chat completion
- `POST /api/jules/complete` – Jules text completion

### Cloudflare (protected by HEADY_API_KEY)
- `GET /api/cloudflare/zones` – List Cloudflare zones
- `POST /api/cloudflare/dns` – Manage DNS records (create, update, delete)

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

3. **"JULES_API_KEY is not configured" error**
   - Set JULES_API_KEY in your environment
   - Get a token from your Jules AI account settings

4. **"CLOUDFLARE_SECRET is not configured" error**
   - Set CLOUDFLARE_SECRET in your environment
   - Get an API token from https://dash.cloudflare.com/profile/api-tokens
   - Create a token with appropriate permissions for DNS/zone management

5. **Python worker not responding**
   - Check that Python dependencies are installed: `pip install -r requirements.txt`
   - Verify HEADY_PYTHON_BIN points to correct Python executable

6. **Port already in use**
   - Change PORT environment variable
   - Kill existing process: `lsof -ti:3300 | xargs kill`

7. **CORS issues**
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
