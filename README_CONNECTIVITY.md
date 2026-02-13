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

## 1. Local Connectivity
The Heady System operates on two primary nodes locally:

| Service | Component | Port | Local URL | Binding |
| :--- | :--- | :--- | :--- | :--- |
| **Heady Manager** | Node.js / Express | `3300` | [https://headysystems.com](https://headysystems.com) | `0.0.0.0` (All Interfaces) |
| **Heady Conductor** | Python / FastAPI | `8000` | [https://headymcp.com](https://headymcp.com) | `0.0.0.0` (All Interfaces) |

### Verification
Run the following to check health locally:
```bash
curl https://headysystems.com/api/health
curl https://headymcp.com/api/health
```

## 2. Remote Connectivity
Both services are configured to bind to `0.0.0.0`, allowing access from other machines on the same network or via tunnels.

### Network Access (LAN/VPN)
- **Manager:** `http://<HOST_IP>:3300`
- **Conductor:** `http://<HOST_IP>:8000`

### Tunnels (Cloudflare/Ngrok)
To expose services securely to the public internet:
```bash
# Example using cloudflared
cloudflared tunnel --url https://headysystems.com
```

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
