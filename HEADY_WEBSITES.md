# Heady Ecosystem — Website Directory

> All 9 branded domains are live and serving via Cloudflare + Render.
> Last verified: 2026-02-13 — all HTTP 200.

---

## Active Branded Websites

### headysystems.com — Platform & Primary API
- **What it is:** The core Heady Systems platform. Central API gateway, system status, pipeline execution, architecture overview.
- **Audience:** Developers, enterprises, technical users
- **Key endpoints:** `/api/health`, `/api/system/status`, `/api/nodes`, `/api/services/summary`, `/api/config/deterministic`
- **Organization:** Heady Systems

### headycloud.com — Cloud Orchestration
- **What it is:** Cloud layer management, deployment orchestration, infrastructure control. This is the HeadyMe cloud layer.
- **Audience:** Operators, developers
- **Key endpoints:** `/api/health`, `/api/config/env`, `/api/system/status`
- **Organization:** Heady Systems

### headyconnection.com / headyconnection.org — Nonprofit Mission
- **What it is:** The nonprofit behind Heady. Impact reports, governance, community programs (HeadyAcademy, PPP pricing, community grants). 100% of nonprofit funds go to programs.
- **Audience:** Donors, partners, beneficiaries, community
- **Organization:** HeadyConnection (501c3)

### headybuddy.org — HeadyBuddy Companion Portal
- **What it is:** The home of HeadyBuddy, the cross-device AI companion. Learn about Buddy, download the desktop app, explore the philosophy behind the companion.
- **Audience:** Everyone
- **Organization:** HeadyBuddy (a program of HeadyConnection)

### headybot.com — AI Chat Interface
- **What it is:** Direct line to HeadyBuddy AI. Full-featured web chat interface — ask questions, run tasks, get help.
- **Audience:** Everyone
- **Organization:** HeadyBuddy

### headymcp.com — MCP Connector Marketplace
- **What it is:** Model Context Protocol connectors. Browse, register, and invoke tools that extend Heady with any external service.
- **Audience:** Developers, tool builders
- **Key endpoints:** `/api/mcp/servers`, `/api/mcp/tool`
- **Organization:** Heady Systems

### headycheck.com — Health & Monitoring Dashboard
- **What it is:** Real-time health and observability across the entire Heady ecosystem. Monte Carlo scoring, drift detection, subsystem probes.
- **Audience:** Operators, developers
- **Key endpoints:** `/api/health`, `/api/monte-carlo/status`, `/api/drift/latest`
- **Organization:** Heady Systems

### headyio.com — Developer Documentation
- **What it is:** Complete API reference, architecture guides, and integration documentation for the Heady platform.
- **Audience:** Developers, integrators
- **Organization:** Heady Systems

### headyos.com — HeadyAI-IDE
- **What it is:** HeadyAI-IDE — choose Heady as your AI model, arena-merge branches intelligently, and build with the full Heady intelligence stack. This is the IDE surface of the ecosystem.
- **Audience:** Developers, creators, teams
- **Key endpoints:** `/api/ide/models`, `/api/ide/arena`
- **Organization:** Heady Systems

---

## How to Connect with HeadyAI-IDE

HeadyAI-IDE (headyos.com) lets you select Heady as an AI model inside any Windsurf-style IDE. Here's how to connect:

### Option 1: Via Windsurf Settings (Recommended)
Your `.vscode/settings.json` is already configured. The key settings:
```json
{
  "heady.endpoint": "https://headysystems.com",
  "heady.cloudLayer": "cloud",
  "heady.autoConnect": true,
  "heady.activeProfile": "cloud-me"
}
```
Windsurf automatically connects to the Heady cloud when you open the workspace.

### Option 2: Via API
```bash
# List available Heady AI models
curl https://headysystems.com/api/ide/models

# Run arena-merge (evaluate branches in parallel, pick best)
curl -X POST https://headysystems.com/api/ide/arena \
  -H "Content-Type: application/json" \
  -d '{"branches": ["feature-a", "feature-b"], "strategy": "best-of"}'

# Check IDE state
curl https://headysystems.com/api/ide/state
```

### Option 3: Via HeadyBuddy Desktop App
1. Launch HeadyBuddy from your desktop
2. Buddy connects to `headybot.com` for chat and `headysystems.com` for the full intelligence stack
3. Use Buddy as a sidebar companion inside HeadyAI-IDE

---

## How to Connect with HeadyWeb (HeadyOS)

HeadyOS at headyos.com serves as the web-based IDE surface. To use it:

### Direct Browser Access
Navigate to **https://headyos.com** — the site serves the HeadyAI-IDE interface directly.

### Via Cloud Orchestrator
```bash
# Trigger site generation (rebuilds all 9 branded sites)
curl -X POST https://headysystems.com/api/v1/orchestrator/generate-sites \
  -H "Authorization: Bearer $HEADY_API_KEY"

# Check all sites
curl https://headysystems.com/sites
```

### Via SoulOrchestrator Goals
```bash
# Execute a goal through the full intelligence stack
curl -X POST https://headysystems.com/api/soul/evaluate \
  -H "Content-Type: application/json" \
  -d '{"task": "deploy-headyos", "priority": "P0", "category": "deployment"}'
```

---

## Ecosystem Relationships

```
HeadyConnection.org (Nonprofit — mission & governance)
  │
  ├── funds ──► Heady Systems (headysystems.com) ◄── core platform
  │                 │
  │                 ├── headycloud.com ── cloud orchestration
  │                 ├── headycheck.com ── health monitoring
  │                 ├── headyio.com ──── developer docs
  │                 ├── headymcp.com ──── MCP connectors
  │                 └── headyos.com ──── HeadyAI-IDE
  │
  └── created ──► HeadyBuddy (headybuddy.org) ◄── AI companion
                      │
                      └── headybot.com ── web chat interface
```

---

## Quick Reference

| Domain | Role | URL |
|--------|------|-----|
| headysystems.com | Platform & API | https://headysystems.com |
| headycloud.com | Cloud Orchestration | https://headycloud.com |
| headyconnection.org | Nonprofit Mission | https://headyconnection.org |
| headyconnection.com | Nonprofit (alt) | https://headyconnection.com |
| headybuddy.org | Companion Portal | https://headybuddy.org |
| headybot.com | AI Chat | https://headybot.com |
| headymcp.com | MCP Connectors | https://headymcp.com |
| headycheck.com | Health Dashboard | https://headycheck.com |
| headyio.com | Developer Docs | https://headyio.com |
| headyos.com | HeadyAI-IDE | https://headyos.com |

---

## Domains NOT Owned (Do Not Reference)
- headybuddy.com
- heady.ai
- headyweb.com
- headylearn.org
- headymentor.org

## 40+ Unassigned Domains Available
See `CLOUDFLARE_DOMAINS.json` for the full list of owned but unassigned domains ready for future services.
