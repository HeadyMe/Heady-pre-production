# HeadyWeb

AI-powered browser shell with HeadyBuddy as your persistent sidebar companion.

## What is HeadyWeb?

HeadyWeb merges the browser experience with HeadyBuddy AI. It provides:

- **Browser Shell** — Tab management, URL bar, navigation
- **Buddy Sidebar** — Chat, Tasks, Code, Research modes
- **Ecosystem Integration** — Quick links to all Heady domains
- **Context Awareness** — Buddy knows what page you're viewing
- **Cross-Device Sync** — Same session across desktop, mobile, browser

## Architecture

```
HeadyWeb (browser shell UI)
  ├── Viewport — iframe-based page rendering
  ├── Tab Manager — multi-tab browsing
  ├── HeadyBuddy Sidebar — 4 modes (Chat/Tasks/Code/Research)
  └── HeadySystems API — intent resolution, health, orchestration
```

## Quick Start

```bash
# Local development
npm install
npm start
# → http://localhost:3400

# Cloudflare Worker deployment
npm run worker:deploy
```

## Deployment Options

1. **Cloudflare Worker** — Edge deployment via `wrangler.toml`
2. **Static hosting** — Serve `public/` from any CDN
3. **heady-manager** — Served as part of the main Heady platform

## Buddy Modes

| Mode | Purpose |
|------|---------|
| Chat | Natural conversation, Q&A, planning |
| Tasks | Run workflows, manage deployments, call MCP tools |
| Code | Generate, explain, refactor code |
| Research | Summarize pages, compare sources, multi-tab sessions |

## Ecosystem

HeadyWeb connects to the full Heady ecosystem:

- [headysystems.com](https://headysystems.com) — Platform API
- [headybuddy.org](https://headybuddy.org) — Buddy product page
- [headyconnection.org](https://headyconnection.org) — Nonprofit mission
- [headybot.com](https://headybot.com) — Web chat interface
- [headycheck.com](https://headycheck.com) — Health monitoring
- [headyio.com](https://headyio.com) — Developer docs
- [headymcp.com](https://headymcp.com) — MCP connectors
- [headycloud.com](https://headycloud.com) — Cloud orchestration
