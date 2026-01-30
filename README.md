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

### Local development
1. Install dependencies:
   ```bash
   npm install
   pip install -r requirements.txt
   ```
2. Set environment variables (see Configuration):
   ```bash
   export HEADY_API_KEY="your-api-key"
   export HF_TOKEN="your-hf-token"
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open the Admin IDE: http://localhost:3300/admin

### Production (Render)
- Deploy via `render.yaml` (uses `heady-shared-secrets` env group for secrets).

## Configuration

### Core
- `PORT` (default: 3300)
- `HEADY_API_KEY` – Required for Admin API and HF endpoints
- `HF_TOKEN` – Hugging Face inference token
- `HEADY_CORS_ORIGINS` – Comma‑separated allowed origins

### Admin UI
- `HEADY_ADMIN_ROOT` – Repository root for file access (default: repo root)
- `HEADY_ADMIN_ALLOWED_PATHS` – Comma‑separated allowlist for additional roots
- `HEADY_ADMIN_MAX_BYTES` – Max file size for editing (default: 512 KB)

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
- **AI assistant panel** (stub; integrates with Copilot/MCP in future)

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
- `POST /api/admin/assistant` – AI assistant (stub)

### Hugging Face (protected by HEADY_API_KEY)
- `POST /api/hf/infer`
- `POST /api/hf/generate`
- `POST /api/hf/embed`

### System
- `GET /api/pulse` – Docker/system info
- `GET /api/health` – Health check

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
