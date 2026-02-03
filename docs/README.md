# Heady

![CI](https://github.com/HeadyMe/Heady/workflows/CI/badge.svg)
![Security Scan](https://github.com/HeadyMe/Heady/workflows/Security%20Scan/badge.svg)
![Automated Fixes](https://github.com/HeadyMe/Heady/workflows/Automated%20Build%20and%20Test%20Fixes/badge.svg)

A hybrid Node.js/Python system for the HeadyConnection ecosystem, featuring a web‑based Admin IDE with AI assistance, real‑time build/audit monitoring, and optional remote GPU support.

> **Naming Convention**: This project follows PascalCase naming for all components (e.g., HeadySync, HeadyManager, HeadyConnection). See `.heady-memory/heady-registry.json` for the complete component registry.

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

### Production (Render)
- Deploy via `render.yaml` (uses `heady-shared-secrets` env group for secrets).

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
