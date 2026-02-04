<!--
╭───────────────────────────────────────────────────────────────────────────────╮
│                                                                               │
│     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                │
│     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                │
│     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 │
│     ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  │
│     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   │
│     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   │
│                                                                               │
│     ∞ SACRED GEOMETRY ARCHITECTURE ∞                                          │
│     Data Processing Pipeline & Agent Configuration Framework                  │
│                                                                               │
╰───────────────────────────────────────────────────────────────────────────────╯
-->

# Heady Systems

A hybrid Node.js/Python system for the HeadyConnection ecosystem with patented Sacred Geometry architecture, featuring a web-based Admin IDE with AI assistance, real-time build/audit monitoring, and optional remote GPU support.

## Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| `heady-manager.js` | Node.js/Express | MCP server, Admin API, static file serving |
| `src/process_data.py` | Python | Hugging Face inference worker |
| `src/consolidated_builder.py` | Python | Build orchestration with multi-agent coordination |
| `admin_console.py` | Python | System audit and health checks |
| `public/index.html` | React (CDN) | Sacred Geometry UI dashboard |
| `public/admin.html` | React + Monaco | Admin IDE (file tree, editor, logs, AI panel) |
| `render.yaml` | Render Blueprint | Infrastructure-as-code deployment |

## Quick Start

### Local Development
1. **Install dependencies**:
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Set environment variables**:
   ```bash
   export HEADY_API_KEY="your-api-key"
   export HF_TOKEN="your-hf-token"
   export DATABASE_URL="postgresql://..."  # Optional
   ```

3. **Start the server**:
   ```bash
   npm start
   # or
   node heady-manager.js
   ```

4. **Access interfaces**:
   - Main UI: http://localhost:3300
   - Admin IDE: http://localhost:3300/admin

### Production (Render)
Deploy via `render.yaml` which uses `heady-shared-secrets` env group for secrets management.

## Configuration

### Core Environment Variables
- `PORT` – Server port (default: 3300)
- `NODE_ENV` – Environment (development/production)
- `HEADY_API_KEY` – **Required** for Admin API and HF endpoints
- `HF_TOKEN` – Hugging Face API token
- `DATABASE_URL` – Postgres connection string (optional)
- `HEADY_CORS_ORIGINS` – Comma-separated allowed origins

### Admin IDE Configuration
- `HEADY_ADMIN_ROOT` – Repository root for file access (default: repo root)
- `HEADY_ADMIN_ALLOWED_PATHS` – Comma-separated allowlist for additional roots
- `HEADY_ADMIN_MAX_BYTES` – Max file size for editing (default: 512 KB)
- `HEADY_ADMIN_BUILD_SCRIPT` – Path to build script (default: `src/consolidated_builder.py`)
- `HEADY_ADMIN_AUDIT_SCRIPT` – Path to audit script (default: `admin_console.py`)

### Remote GPU Configuration (Optional)
- `HEADY_ADMIN_ENABLE_GPU` – Enable GPU features (true/false)
- `REMOTE_GPU_HOST` – Remote GPU server host
- `REMOTE_GPU_PORT` – Remote GPU server port
- `GPU_MEMORY_LIMIT` – GPU memory limit in MB
- `ENABLE_GPUDIRECT` – Enable GPUDirect RDMA (true/false)

## Admin IDE Features

The Admin IDE (`/admin`) provides a complete web-based development environment:

- **File Browser** – Navigate project files with allowlisted roots and safe path resolution
- **Monaco Editor** – Full-featured code editor with syntax highlighting (Python, JSON, YAML, JS)
- **Multi-Tab Editing** – Work on multiple files simultaneously with Ctrl+S save
- **Real-Time Logs** – Build/audit logs streamed via Server-Sent Events
- **Settings Panel** – Configure GPU and system settings (local development only)
- **AI Assistant** – Integrated AI code assistance (MCP/Copilot integration)

## API Endpoints

### Admin Endpoints (Protected by HEADY_API_KEY)
- `GET /api/admin/roots` – List allowed file system roots
- `GET /api/admin/files?root=&path=` – Browse directory contents
- `GET /api/admin/file?root=&path=` – Read file content
- `POST /api/admin/file` – Write file (with SHA-256 conflict detection)
- `POST /api/admin/build` – Trigger build script
- `POST /api/admin/audit` – Trigger audit script
- `GET /api/admin/ops` – List operations
- `GET /api/admin/ops/:id/status` – Get operation status
- `GET /api/admin/ops/:id/stream` – SSE log stream for operation
- `GET /api/admin/config/render-yaml` – Get render.yaml configuration
- `GET /api/admin/config/mcp` – Get MCP configuration (secrets masked)
- `GET /api/admin/settings/gpu` – Get GPU settings (secrets masked)
- `POST /api/admin/assistant` – AI assistant for code editing
- `POST /api/admin/lint` – Code linting
- `POST /api/admin/test` – Run tests

### Hugging Face Endpoints (Protected by HEADY_API_KEY)
- `POST /api/hf/infer` – Generic HF inference
- `POST /api/hf/generate` – Text generation
- `POST /api/hf/embed` – Text embeddings

### System Endpoints
- `GET /api/pulse` – System status and Docker info
- `GET /api/health` – Simple health check

## CLI Tools

### Build Script
```bash
python src/consolidated_builder.py --project-root /path/to/project --output build-info.json
```

### Admin Console
```bash
# Full audit
python admin_console.py --project-root /path/to/project

# Specific checks
python admin_console.py --check health
python admin_console.py --check structure
python admin_console.py --check deps
python admin_console.py --check security
```

## Testing
```bash
# Python tests
pytest

# Node.js tests (when implemented)
npm test
```

## Cloud / GPU Execution
To run this project on Google Colab and utilize free GPU resources:
1. See [COLAB_PROTOCOL.md](COLAB_PROTOCOL.md) for detailed instructions
2. Use the `notebooks/Heady_Colab_Protocol.ipynb` notebook

## GitHub Copilot Customization

This project is optimized for GitHub Copilot with MCP integration:
- `.github/copilot-instructions.md` – Project overview and Quiz Protocol for documentation
- `.github/copilot-mcp-config.json` – MCP server definitions
- `.github/workflows/copilot-setup-steps.yml` – Setup workflow
- `mcp_config.json` – Local development MCP servers

### Available MCP Servers
- **filesystem** – File system operations
- **sequential-thinking** – Reasoning chains
- **memory** – Persistent memory storage
- **fetch** – Web requests
- **postgres** – Database operations
- **git** – Git operations
- **puppeteer** – Web automation
- **cloudflare** – Cloudflare API

## Documentation Protocol

All documentation follows the **Quiz & Flashcard Methodology** (see `.github/copilot-instructions.md`).

## Security

- All admin endpoints require `HEADY_API_KEY` authentication
- Secrets managed via environment variables, never hardcoded
- Rate limiting enabled on API endpoints (120 req/min default)
- CORS configured for allowed origins
- File operations restricted to allowlisted roots
- SHA-256 conflict detection for file writes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the code style guidelines in `.github/copilot-instructions.md`
4. Ensure all tests pass
5. Submit a pull request

## License

See LICENSE file.
