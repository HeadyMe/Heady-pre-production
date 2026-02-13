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
<!-- ║  FILE: README_CONNECTIVITY.md                                     ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

# Heady System Connectivity Protocol

## 1. Cloud Connectivity
The Heady System operates as three cloud layers behind branded domains:

| Service | Component | Domain | Purpose |
| :--- | :--- | :--- | :--- |
| **HeadySystems** | Node.js / Express | [https://headysystems.com](https://headysystems.com) | Primary API, pipeline, status |
| **HeadyCloud** | Node.js / Express | [https://headycloud.com](https://headycloud.com) | Cloud layer management, HeadyMe |
| **HeadyConnection** | Node.js / Express | [https://headyconnection.com](https://headyconnection.com) | Connection layer, AI nodes |

### Verification
Run the following to check cloud health:
```bash
curl https://headysystems.com/api/health
curl https://headycloud.com/api/health
curl https://headyconnection.com/api/health
```

## 2. Additional Branded Domains
All services are accessible via custom branded domains through Cloudflare DNS:

- **HeadyMCP:** `https://headymcp.com` — MCP protocol server
- **HeadyBuddy:** `https://headybuddy.org` — HeadyBuddy AI portal
- **HeadyBot:** `https://headybot.com` — HeadyBuddy AI chat
- **HeadyCheck:** `https://headycheck.com` — Health/status monitoring
- **HeadyIO:** `https://headyio.com` — Developer docs, API reference

## 3. Heady Service Structure (Monorepo Compatible)
The system is designed to be modular within a monorepo structure.

```text
/
├── heady-manager.js       # [Manager Node] Orchestrates frontend & MCP
├── src/
│   └── heady_project/     # [Conductor Node] Python Intelligence Core
│       ├── heady_conductor.py  # Entry Point
│       ├── api.py              # FastAPI Interface
│       └── ...
├── frontend/              # [UI Node] React Application
└── hc.cmd                 # [CLI] Unified Command Interface
```

## 4. Execution
Start the entire system using the Heady Conductor wrapper:
```bash
# Start System (Serve)
./hc.cmd -a hs

# Build System
./hc.cmd -a hb
```
