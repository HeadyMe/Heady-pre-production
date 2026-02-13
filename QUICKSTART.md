<!-- HEADY_BRAND:BEGIN -->
<!-- ╔══════════════════════════════════════════════════════════════════╗ -->
<!-- ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║ -->
<!-- ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║ -->
<!-- ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║ -->
<!-- ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║ -->
<!-- ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║ -->
<!-- ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║ -->
<!-- ║                                                                  ║ -->
<!-- ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║ -->
<!-- ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║ -->
<!-- ║  FILE: QUICKSTART.md                                              ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

# HEADY SERVICES - COMPREHENSIVE QUICKSTART

> One-stop guide to every service, CLI shortcut, cloud layer, and orchestration tool in the Heady ecosystem.

---

## 1. Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 18+ | Manager runtime |
| **Python** | 3.10+ | Worker / HeadyAcademy |
| **Git** | 2.30+ | Multi-remote sync |
| **PowerShell** | 5.1+ / 7+ | Scripts & automation |

### Install Dependencies

```powershell
# Node dependencies (from repo root)
npm install

# Python dependencies
pip install -r requirements.txt
```

---

## 2. Environment Variables

Copy `.env.example` to `.env` and populate:

```bash
# Required
HEADY_API_KEY=your-api-key          # Protects all admin/HF endpoints
PORT=3300                            # Manager port (default 3300)

# Optional
HF_TOKEN=your-huggingface-token     # Hugging Face inference
DATABASE_URL=postgresql://...        # Postgres connection
NODE_ENV=development                 # development | production
HEADY_CORS_ORIGINS=https://headysystems.com,https://headysystems.com

# Admin IDE
HEADY_ADMIN_ROOT=.                   # Repo root for file access
HEADY_ADMIN_MAX_BYTES=524288         # Max file size (512 KB)

# GPU (optional)
HEADY_ADMIN_ENABLE_GPU=false
REMOTE_GPU_HOST=
REMOTE_GPU_PORT=
```

---

## 3. Services & Ports

| Service | Tech | Port | Start Command | Health Check |
|---------|------|------|---------------|-------------|
| **Heady Manager** | Node.js/Express | `3300` | `npm start` | `GET /api/health` |
| **Heady Conductor** | Python/FastAPI | `8000` | `python src/heady_project/api.py` | `GET /api/health` |
| **Frontend** | React/Vite | `3000` | `npm start --prefix frontend` | Browser |
| **Postgres** | PostgreSQL | `5432` | System service | `pg_isready` |
| **Redis** | Redis | `6379` | System service | `redis-cli ping` |
| **MCP Server** | Node.js | stdio | Via IDE config | N/A |

### Start Everything (Local Dev)

```powershell
# Option A: Just the Manager (most common)
npm start
# → https://headysystems.com       (Main UI)
# → https://headysystems.com/admin (Admin IDE)

# Option B: Manager + Frontend dev server
npm run start          # Terminal 1 - Manager on :3300
npm run frontend       # Terminal 2 - React on :3000

# Option C: Use the unified CLI
hc                     # Runs HCAutoBuild cycle (builds + validates)
```

### Verify Health

```powershell
curl https://headysystems.com/api/health
# → {"ok":true,"service":"heady-manager","ts":"..."}

curl https://headysystems.com/api/pulse
# → Full system status with Docker info and active layer
```

---

## 4. CLI Shortcuts (`.bat` files in repo root)

All shortcuts run from the repo root directory:

| Command | Script | Purpose |
|---------|--------|---------|
| `hc` | `hcautobuild.ps1` | Full HCAutoBuild cycle (build, validate, checkpoint) |
| `hc-status` | Status check | Show all workspace functionality scores |
| `hc-checkpoint` | Force checkpoint | Create checkpoint regardless of score |
| `hc-monitor` | Continuous monitor | Watch for changes, auto-checkpoint |
| `hs` | `Heady-Sync.ps1` | Push to all git remotes (origin, heady-me, sandbox) |
| `hsync` | `heady_sync.ps1` | Full sync: stage → commit → checkpoint → push → verify |
| `hl` | `heady-layer.ps1` | Layer switcher (local, cloud-me, cloud-sys, hybrid) |
| `hb` | `hcautobuild.ps1` | Build shortcut |
| `hr` | | Registry/report shortcut |

### npm Scripts

```powershell
npm run hs                    # HeadySync
npm run hb                    # HCAutoBuild
npm run brand:check           # Check brand headers
npm run brand:fix             # Fix brand headers
npm run pipeline              # Run HC pipeline
npm run deploy:all            # Deploy to all cloud targets
npm run verify:all            # Verify all deployments
```

---

## 5. Cloud Layers

Heady runs across multiple cloud instances managed by the **Layer Switcher**.

| Layer | Name | Endpoint | Color |
|-------|------|----------|-------|
| `local` | Local Dev | `https://headysystems.com` | Green |
| `cloud-me` | Cloud HeadyMe | `https://headycloud.com` | Cyan |
| `cloud-sys` | Cloud HeadySystems | `https://headysystems.com` | Magenta |
| `cloud-conn` | Cloud HeadyConnection | `https://headyconnection.com` | Yellow |
| `hybrid` | Local + Cloud | `https://headysystems.com` (w/ `.env.hybrid`) | White |

### Layer Commands

```powershell
hl                     # Show active layer + health
hl list                # Show all layers with health status
hl switch cloud-me     # Switch to HeadyMe cloud
hl switch local        # Switch back to local
hl health              # Health check all layers
```

### Layer API

```bash
GET  /api/layer             # Get active layer info
POST /api/layer/switch      # Switch layer (body: {"layer":"cloud-me"})
GET  /api/pulse             # Includes active_layer and layer_name
```

### Production Deployment (Render)

All cloud instances deploy via `render.yaml` using `heady-shared-secrets` env group.

```powershell
npm run deploy:headyme           # Deploy to HeadyMe
npm run deploy:headysystems      # Deploy to HeadySystems
npm run deploy:headyconnection   # Deploy to HeadyConnection
npm run deploy:all               # Deploy everywhere
```

---

## 6. Git Remotes & Sync

| Remote | URL | Purpose |
|--------|-----|---------|
| `origin` | `git@github.com:HeadySystems/Heady.git` | Primary |
| `heady-me` | `git@github.com:HeadyMe/Heady.git` | Personal |
| `sandbox` | `git@github.com:HeadySystems/sandbox.git` | Testing |
| `connection` | `https://github.com/HeadySystems/HeadyConnection.git` | CMS (requires verified signatures) |

### Sync Workflow

```powershell
# Quick push to all remotes
hs

# Full workflow: stage → commit → checkpoint → push → verify
hsync "Feature: your commit message"

# Nexus deploy (legacy)
.\nexus_deploy.ps1
```

---

## 7. API Reference (Quick)

All admin endpoints require `x-api-key: <HEADY_API_KEY>` header.

### System

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Simple health check |
| `GET` | `/api/pulse` | Full system status + layer info |

### Admin IDE

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/admin/roots` | List allowed file roots |
| `GET` | `/api/admin/files?root=&path=` | Browse directory |
| `GET` | `/api/admin/file?root=&path=` | Read file |
| `POST` | `/api/admin/file` | Write file (SHA-256 conflict detection) |
| `POST` | `/api/admin/build` | Trigger build |
| `POST` | `/api/admin/audit` | Trigger audit |
| `GET` | `/api/admin/ops/:id/stream` | SSE log stream |
| `POST` | `/api/admin/assistant` | AI code assistant |

### Conductor / Orchestration

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/conductor/orchestrate` | Natural language orchestration |
| `GET` | `/api/conductor/summary` | System summary (50 capabilities) |
| `GET` | `/api/conductor/health` | All service health |
| `GET` | `/api/conductor/query?q=` | Search capabilities |
| `POST` | `/api/conductor/workflow` | Execute workflow |
| `POST` | `/api/conductor/node` | Invoke specific node |

### Hugging Face

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/hf/infer` | Generic HF inference |
| `POST` | `/api/hf/generate` | Text generation |
| `POST` | `/api/hf/embed` | Text embeddings |

---

## 8. Orchestration System

### The Trinity

```
BRAIN (Intelligence) → CONDUCTOR (Orchestration) → REGISTRY (Capabilities)
       ↕                        ↕                          ↕
    LENS (Monitor)         MEMORY (Storage)          19 Nodes + 7 Workflows
```

### AI Nodes (19 Total)

| Node | Role | Trigger Keywords |
|------|------|------------------|
| **BRIDGE** | The Connector | mcp, connect, network, tunnel |
| **MUSE** | The Brand Architect | generate_content, whitepaper, marketing |
| **SENTINEL** | The Guardian | grant_auth, verify_auth, audit_ledger |
| **NOVA** | The Expander | scan_gaps |
| **OBSERVER** | The Natural Observer | monitor |
| **JANITOR** | The Custodian | clean |
| **JULES** | The Hyper-Surgeon | optimization |
| **SOPHIA** | The Matriarch | learn_tool |
| **CIPHER** | The Cryptolinguist | obfuscate |
| **ATLAS** | The Auto-Archivist | documentation |
| **MURPHY** | The Inspector | security_audit |
| **SASHA** | The Dreamer | brainstorming |
| **SCOUT** | The Hunter | scan_github |
| **OCULUS** | The Visualizer | visualize |
| **BUILDER** | The Constructor | new_project |
| **PYTHIA** | The Oracle | huggingface, predict, ask_oracle |
| **LENS** | The All-Seeing Eye | monitor, status, health, metrics |
| **MEMORY** | The Eternal Archive | remember, store, recall, retrieve |
| **BRAIN** | The Central Intelligence | think, analyze, decide, process |

### Workflows (7 Total)

| Workflow | Purpose |
|----------|---------|
| `/hcautobuild` | Automated checkpoint system |
| `/deploy-system` | Deploy Heady to production |
| `/verify-system` | Health verification |
| `/codemap-optimization` | AI node integration & scoring |
| `/workspace-integration` | Workspace setup |
| `/headysync-prep` | Pre-sync preparation |
| `/branding-protocol` | Brand header consistency |

### Quick Orchestration

```powershell
# CLI
python HeadyAcademy/HeadyConductor.py --request "deploy the system"
python HeadyAcademy/HeadyConductor.py --workflow hcautobuild
python HeadyAcademy/HeadyConductor.py --node SENTINEL
python HeadyAcademy/HeadyConductor.py --summary
python HeadyAcademy/HeadyConductor.py --health

# API
curl -X POST https://headysystems.com/api/conductor/orchestrate -H "Content-Type: application/json" -d "{\"request\":\"scan for security issues\"}"
```

---

## 9. HCAutoBuild (Checkpoint System)

Automatically monitors functionality and creates checkpoints at 100%.

### Scoring Breakdown

| Factor | Weight | What It Checks |
|--------|--------|----------------|
| Health | 40% | Git status, dependencies, build artifacts |
| Build | 30% | Successful build and test execution |
| Git Cleanliness | 15% | Working directory status |
| Recent Activity | 15% | Commit recency |

### Commands

```powershell
hc                          # Full cycle
hc-status                   # Check all workspaces
hc-checkpoint               # Force checkpoint
hc-monitor                  # Continuous monitoring

# Advanced
.\hcautobuild.ps1 -verbose
.\hcautobuild.ps1 -workspace Heady
.\hcautobuild_optimizer.ps1 -optimize    # With AI node scoring (max 140)
.\hcautobuild_enhanced.ps1 -monitor      # Enhanced monitoring
```

### Config

Location: `.heady/hcautobuild_config.json`

---

## 10. Project Structure

```
Heady/
├── heady-manager.js              # Node.js MCP server (port 3300)
├── package.json                  # npm scripts & dependencies
├── render.yaml                   # Render.com deployment blueprint
├── .env.example                  # Environment template
│
├── backend/
│   ├── index.js                  # Backend entry
│   ├── python_worker/            # Python computational engine
│   └── src/                      # Controllers, middleware, routes
│
├── frontend/
│   ├── src/                      # React components
│   └── public/                   # Admin IDE (admin.html)
│
├── HeadyAcademy/
│   ├── HeadyBrain.py             # Central intelligence
│   ├── HeadyConductor.py         # Orchestration
│   ├── HeadyRegistry.py          # Capability index (auto-discovery)
│   ├── HeadyLens.py              # Real-time monitoring
│   ├── HeadyMemory.py            # Persistent storage (SQLite)
│   ├── Node_Registry.yaml        # 19 node definitions
│   └── Tools/                    # HuggingFace_Tool, Auto_Doc, etc.
│
├── src/
│   ├── heady_project/            # Python core (api.py, audit.py, etc.)
│   ├── agents/                   # Claude code agent, pipeline handlers
│   └── hc_pipeline.js            # HC pipeline runner
│
├── scripts/
│   ├── Heady-Sync.ps1            # Multi-remote sync
│   ├── heady-layer.ps1           # Layer switcher
│   ├── heady-layers.json         # Layer definitions
│   └── ...                       # Various ops scripts
│
├── .heady/
│   ├── memory.db                 # SQLite persistent storage
│   ├── registry.json             # Auto-generated capability index
│   └── hcautobuild_config.json   # Checkpoint config
│
├── .windsurf/
│   └── workflows/                # 7+ workflow definitions (.md)
│
├── configs/                      # YAML configs (schema, governance, etc.)
├── mcp-servers/                  # Custom MCP servers
├── packages/                     # hc-brain, hc-health, hc-checkpoint, etc.
│
├── # CLI Shortcuts (.bat)
├── hc.bat                        # HCAutoBuild
├── hs.bat                        # HeadySync (push all)
├── hsync.bat                     # Full sync workflow
├── hl.bat                        # Layer switcher
├── hb.bat                        # Build
├── hr.bat                        # Registry/report
├── hc-status.bat                 # Status check
├── hc-checkpoint.bat             # Force checkpoint
└── hc-monitor.bat                # Continuous monitor
```

---

## 11. Common Workflows

### "I just cloned the repo"

```powershell
npm install
cp .env.example .env              # Edit with your keys
npm start                         # Manager on :3300
# Visit https://headysystems.com
```

### "I want to develop and auto-checkpoint"

```powershell
npm run dev                       # Manager with nodemon (auto-restart)
hc-monitor                        # Background: auto-checkpoint at 100%
```

### "I want to deploy to all clouds"

```powershell
hsync "Release: v2.1 feature update"   # Commit + push all remotes
npm run deploy:all                      # Trigger Render deployments
npm run verify:all                      # Verify all endpoints
```

### "I want to check what layer I'm on"

```powershell
hl                                # Show active layer
hl list                           # All layers + health
hl switch cloud-sys               # Switch to production
```

### "I want to run a security audit"

```powershell
python HeadyAcademy/HeadyConductor.py --request "run security audit"
# or
python admin_console.py --check security
```

### "I want the full system summary"

```powershell
python HeadyAcademy/HeadyConductor.py --summary
# or
curl https://headysystems.com/api/conductor/summary
```

---

## 12. Detailed Documentation Index

| Document | Purpose |
|----------|---------|
| [`README.md`](README.md) | Main project overview, API reference, config |
| [`README_SYSTEM.md`](README_SYSTEM.md) | Architecture (Trinity Structure), Quiz Protocol |
| [`README_ECOSYSTEM.md`](README_ECOSYSTEM.md) | Full ecosystem: BRAIN, LENS, MEMORY, CONDUCTOR |
| [`README_CONDUCTOR.md`](README_CONDUCTOR.md) | Conductor & Registry deep-dive |
| [`CONDUCTOR_QUICKREF.md`](CONDUCTOR_QUICKREF.md) | Conductor quick reference card |
| [`README_CONNECTIVITY.md`](README_CONNECTIVITY.md) | Ports, network, tunnels |
| [`README_HCAutoBuild.md`](README_HCAutoBuild.md) | Checkpoint system docs |
| [`HEADY_SYNC_README.md`](HEADY_SYNC_README.md) | Sync workflow + HeadyMemory integration |
| [`DOCKER_QUICKSTART.md`](DOCKER_QUICKSTART.md) | Docker deployment |
| [`DOCKER_MCP_QUICKSTART.md`](DOCKER_MCP_QUICKSTART.md) | Docker + MCP servers |
| [`COLAB_PROTOCOL.md`](COLAB_PROTOCOL.md) | Google Colab GPU execution |
| [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md) | Full architecture docs |
| [`EMAIL_SETUP_GUIDE.md`](EMAIL_SETUP_GUIDE.md) | Email integration |

---

**∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞**
