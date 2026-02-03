const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class MasterReferenceGenerator {
  constructor(config = {}) {
    this.rootDir = config.rootDir || process.cwd();
    this.reconData = config.reconData || {};
    this.timestamp = new Date().toISOString();
  }

  async generate() {
    const sections = [];

    sections.push(this.buildHeader());
    sections.push(this.buildTableOfContents());
    sections.push(this.buildQuickReference());
    sections.push(this.buildCommandsAndScripts());
    sections.push(this.buildServicesAndTools());
    sections.push(this.buildMCPServers());
    sections.push(this.buildProtocolsAndWorkflows());
    sections.push(this.buildShortcutsAndAliases());
    sections.push(this.buildArchitectureOverview());
    sections.push(this.buildOperationalStatus());
    sections.push(this.buildConfigurationReference());
    sections.push(this.buildEnvironmentVariables());
    sections.push(this.buildAPIEndpoints());
    sections.push(this.buildFileStructure());
    sections.push(this.buildConceptRegistry());
    sections.push(this.buildTroubleshooting());
    sections.push(this.buildFooter());

    return sections.join('\n');
  }

  buildHeader() {
    return `# HEADY SYSTEMS - MASTER REFERENCE
**Generated:** ${this.timestamp}  
**Version:** 1.0.0  
**Status:** Real-Time Operational Overview

---

> **This document is automatically generated at each checkpoint and contains:**
> - All available commands, scripts, and shortcuts
> - Complete service and tool inventory
> - MCP server configurations
> - Protocols and workflows
> - Real-time operational status
> - Architecture overview
> - Configuration reference

---
`;
  }

  buildTableOfContents() {
    return `## 📑 TABLE OF CONTENTS

1. [Quick Reference](#-quick-reference)
2. [Commands & Scripts](#-commands--scripts)
3. [Services & Tools](#-services--tools)
4. [MCP Servers](#-mcp-servers)
5. [Protocols & Workflows](#-protocols--workflows)
6. [Shortcuts & Aliases](#-shortcuts--aliases)
7. [Architecture Overview](#-architecture-overview)
8. [Operational Status](#-operational-status)
9. [Configuration Reference](#-configuration-reference)
10. [Environment Variables](#-environment-variables)
11. [API Endpoints](#-api-endpoints)
12. [File Structure](#-file-structure)
13. [Concept Registry](#-concept-registry)
14. [Troubleshooting](#-troubleshooting)

---
`;
  }

  buildQuickReference() {
    return `## ⚡ QUICK REFERENCE

### Most Common Commands

| Command | Description | Example |
|---------|-------------|---------|
| \`hs\` | Heady Systems control (pause, catch, fix, sync) | \`hs -Restart\` |
| \`hs -Checkpoint\` | Generate system checkpoint report | \`hs -Checkpoint\` |
| \`hs checkpoint\` | Alternative checkpoint command | \`hs checkpoint\` |
| \`node heady-manager.js\` | Start Heady Manager service | \`npm start\` |
| \`docker compose up\` | Start all Docker services | \`docker compose up -d\` |
| \`git fetch --all\` | Fetch all remotes | \`git fetch --all --prune\` |

### Emergency Commands

| Command | Purpose |
|---------|---------|
| \`hs -Force\` | Force sync with conflict resolution |
| \`docker compose down\` | Stop all services |
| \`docker compose restart\` | Restart all services |
| \`git worktree prune\` | Clean stale worktrees |
| \`npm run lint -- --fix\` | Auto-fix linting issues |

### Quick Navigation

- **Admin UI**: http://localhost:3300/admin
- **Health Check**: http://localhost:3300/api/health
- **MCP Gateway**: http://localhost:3301
- **Audit Logs**: \`./audit_logs/\`
- **Memory Patterns**: \`./.heady-memory/patterns/\`

---
`;
  }

  buildCommandsAndScripts() {
    return `## 🔧 COMMANDS & SCRIPTS

### PowerShell Scripts (\`./scripts/\`)

#### Core Control Scripts

| Script | Purpose | Parameters | Example |
|--------|---------|------------|---------|
| \`hs.ps1\` | Master orchestration command | \`-Action\`, \`-Restart\`, \`-Force\`, \`-Checkpoint\` | \`hs -Checkpoint\` |
| \`Invoke-Checkpoint.ps1\` | Checkpoint generation | \`-Action [generate\\|view\\|list\\|help]\` | \`.\scripts\Invoke-Checkpoint.ps1 -Action view\` |
| \`start-heady-system.ps1\` | Start all services | None | \`.\scripts\start-heady-system.ps1\` |
| \`stop-heady-system.ps1\` | Stop all services | None | \`.\scripts\stop-heady-system.ps1\` |
| \`Heady-Sync.ps1\` | Git synchronization | \`-Branch\`, \`-Force\` | \`.\scripts\Heady-Sync.ps1 -Branch main\` |
| \`optimize_repos.ps1\` | Repository optimization | None | \`.\scripts\optimize_repos.ps1\` |

#### Deployment & Build Scripts

| Script | Purpose | Parameters |
|--------|---------|------------|
| \`Deploy-HeadyUnified.ps1\` | Unified deployment | \`-Environment\` |
| \`Build-HeadyEcosystem.ps1\` | Build ecosystem | None |
| \`Create-HeadyShortcuts.ps1\` | Create desktop shortcuts | None |
| \`Demo-HeadySystem.ps1\` | Run system demo | None |

#### Utility Scripts

| Script | Purpose |
|--------|---------|
| \`organize_secrets.ps1\` | Organize secrets and env vars |
| \`Start-MCPServices.ps1\` | Start MCP services |
| \`Audit-HeadySystem.ps1\` | System audit |

### Node.js Scripts (\`./scripts/\`)

| Script | Purpose | Usage |
|--------|---------|-------|
| \`checkpoint.js\` | Checkpoint CLI | \`node scripts/checkpoint.js generate\` |
| \`bin/admin-dev\` | Start admin UI dev server | \`npm run admin:dev\` |
| \`bin/admin-open\` | Open admin UI | \`npm run admin:open\` |
| \`bin/generate-api-key\` | Generate API key | \`npm run generate-key\` |

### Batch Files

| File | Purpose | Usage |
|------|---------|-------|
| \`hs.bat\` | Windows wrapper for hs.ps1 | \`hs -Checkpoint\` |

### NPM Scripts (\`package.json\`)

| Command | Purpose |
|---------|---------|
| \`npm start\` | Start Heady Manager |
| \`npm run dev\` | Development mode |
| \`npm run lint\` | Run ESLint |
| \`npm run lint -- --fix\` | Auto-fix linting |
| \`npm test\` | Run tests |
| \`npm run admin:dev\` | Start admin UI dev |
| \`npm run admin:open\` | Open admin UI |
| \`npm run generate-key\` | Generate API key |

---
`;
  }

  buildServicesAndTools() {
    const dockerContainers = Array.isArray(this.reconData.docker) ? this.reconData.docker : [];
    
    let dockerTable = '';
    if (dockerContainers.length > 0) {
      dockerTable = '\n**Currently Running:**\n\n| Container | Status | Ports |\n|-----------|--------|-------|\n';
      for (const container of dockerContainers) {
        dockerTable += `| ${container.name} | ${container.status} | ${container.ports || 'N/A'} |\n`;
      }
    } else {
      dockerTable = '\n*No Docker containers currently running*\n';
    }

    return `## 🛠️ SERVICES & TOOLS

### Core Services

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| **Heady Manager** | 3300 | Main Express server, MCP gateway, API | http://localhost:3300/api/health |
| **MCP Gateway** | 3301 | Model Context Protocol gateway | http://localhost:3301/health |
| **Admin UI** | 3300 | Web-based admin interface | http://localhost:3300/admin |

### Docker Services
${dockerTable}

### MCP Servers (Model Context Protocol)

See [MCP Servers](#-mcp-servers) section for detailed configuration.

### Python Tools (\`./src/\`)

| Tool | Purpose | Usage |
|------|---------|-------|
| \`process_data.py\` | Data processing worker | \`python src/process_data.py\` |
| \`codex_builder_v13.py\` | Codex builder | \`python src/codex_builder_v13.py\` |
| \`consolidated_builder.py\` | Consolidated builder | \`python src/consolidated_builder.py\` |
| \`heady_core_security.py\` | Security core | Module import |
| \`heady_orchestrator.py\` | Orchestration engine | \`python src/heady_orchestrator.py\` |

### JavaScript Modules (\`./src/\`)

| Module | Purpose |
|--------|---------|
| \`checkpoint_reporter.js\` | Checkpoint report generation |
| \`governance_checkpoint.js\` | Governance integration |
| \`mcp/heady-graph-server.js\` | Graph MCP server |
| \`mcp/heady-mcp-orchestrator.js\` | MCP orchestrator |
| \`utils/cache.js\` | Caching utilities |
| \`utils/logger.js\` | Logging utilities |
| \`utils/monitoring.js\` | Monitoring utilities |

### Frontend Tools (\`./frontend/\`)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Admin UI | React + Vite | Web-based administration |
| Sacred Geometry UI | Custom CSS | Aesthetic framework |

---
`;
  }

  buildMCPServers() {
    const mcpServers = this.reconData.mcpServers || [];
    
    let serversTable = '';
    if (mcpServers.length > 0) {
      serversTable = '| Server | Command | Args | Governance Rules |\n|--------|---------|------|------------------|\n';
      for (const server of mcpServers) {
        const args = Array.isArray(server.args) ? server.args.join(', ') : 'N/A';
        const govRules = server.governance ? Object.keys(server.governance).length : 0;
        serversTable += `| **${server.name}** | \`${server.command}\` | ${args} | ${govRules} rules |\n`;
      }
    } else {
      serversTable = '*No MCP servers configured*\n';
    }

    return `## 🔌 MCP SERVERS

### Configured Servers

${serversTable}

### MCP Server Details

#### filesystem
- **Purpose**: File system operations
- **Governance**: Requires confirmation for write/delete/move operations
- **Allowed Paths**: ./src, ./public, ./backend
- **Denied Paths**: .env files, *.key, *.pem

#### sequential-thinking
- **Purpose**: Multi-step reasoning and problem-solving
- **Governance**: None
- **Use Case**: Complex task breakdown

#### memory
- **Purpose**: Persistent memory and knowledge graph
- **Governance**: None
- **Use Case**: Context retention across sessions

#### fetch
- **Purpose**: HTTP requests and web scraping
- **Governance**: Requires confirmation, domain whitelist
- **Allowed Domains**: headysystems.com, api.headysystems.com, localhost

#### postgres
- **Purpose**: PostgreSQL database operations
- **Governance**: Requires confirmation for queries and schema changes
- **Connection**: Via DATABASE_URL environment variable

#### git
- **Purpose**: Git repository operations
- **Governance**: Requires confirmation for commit/push/merge
- **Allowed Branches**: main, develop, feature/*

#### puppeteer
- **Purpose**: Browser automation and testing
- **Governance**: None
- **Use Case**: Web scraping, testing, screenshots

#### cloudflare
- **Purpose**: Cloudflare API integration
- **Governance**: None
- **Authentication**: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

### Custom MCP Servers (\`./mcp-servers/\`)

| Server | Purpose | Port |
|--------|---------|------|
| heady-assets | Asset management | TBD |
| heady-context | Context management | TBD |
| heady-governance | Governance rules | TBD |
| heady-graph | Knowledge graph | TBD |

---
`;
  }

  buildProtocolsAndWorkflows() {
    return `## 📋 PROTOCOLS & WORKFLOWS

### Heady Control (hs) Protocol

**Purpose**: Master orchestration command for system maintenance

**Workflow Steps**:
1. **Pause** - Stop services gracefully
2. **Catch** - Fetch all remotes, prune worktrees
3. **Fix** - Run ESLint auto-fix
4. **Improve** - Run optimization scripts
5. **Sync** - Squash and push changes
6. **Restart** - Resume services (optional)

**Usage**:
\`\`\`powershell
hs                    # Run full cycle (paused at end)
hs -Restart           # Run full cycle and restart
hs -Force             # Force sync with conflict resolution
hs -Checkpoint        # Generate checkpoint before cycle
hs -Action <script>   # Execute custom action
\`\`\`

### Checkpoint Protocol

**Purpose**: Generate comprehensive system status reports

**Triggers**:
- Manual: \`hs -Checkpoint\`
- Scheduled: Every N hours (configurable)
- Event-driven: Deployments, errors, major changes

**Output**:
- \`checkpoint_<timestamp>.md\` - Human-readable report
- \`checkpoint_<timestamp>.json\` - Machine-readable data

**Sections**:
- Executive Summary
- Environment & Configuration
- Docker Services
- MCP Servers
- Health Status
- Git Repository
- File System
- Processes
- Metrics
- Memory Usage

### Deployment Protocol

**Purpose**: Deploy Heady System to production/staging

**Steps**:
1. Generate pre-deployment checkpoint
2. Run tests and linting
3. Build Docker images
4. Push to registry
5. Deploy to environment
6. Run health checks
7. Generate post-deployment checkpoint

**Usage**:
\`\`\`powershell
.\scripts\Deploy-HeadyUnified.ps1 -Environment production
\`\`\`

### Governance Protocol

**Mode**: Locked (v1.2.0)
**Repository**: HeadyConnection-Org/governance
**Audit**: Enabled

**Destructive Patterns** (require confirmation):
- write, delete, rm, exec, shell, edit_file

**Trust Domain**: headysystems.com
**App Domain**: app.headysystems.com

### Git Synchronization Protocol

**Purpose**: Intelligent git operations with conflict resolution

**Features**:
- Fetch all remotes
- Prune stale worktrees
- Auto-merge strategies
- Conflict detection
- Force push with safety checks

**Usage**:
\`\`\`powershell
.\scripts\Heady-Sync.ps1 -Branch main
.\scripts\Heady-Sync.ps1 -Branch main -Force
\`\`\`

### Quiz Protocol (Documentation)

**Purpose**: Convert documentation into flashcards

**Steps**:
1. Review & Extract concepts
2. Generate quiz questions
3. Formulate flashcards (one idea per card)
4. Iterate until complete
5. Integrate & organize
6. Verify accuracy

---
`;
  }

  buildShortcutsAndAliases() {
    return `## ⌨️ SHORTCUTS & ALIASES

### Command Aliases

| Alias | Full Command | Purpose |
|-------|--------------|---------|
| \`hs\` | \`powershell -ExecutionPolicy Bypass -File scripts\\hs.ps1\` | Heady Systems control |
| \`hs -Checkpoint\` | Checkpoint generation | Quick checkpoint |
| \`hs checkpoint\` | Alternative checkpoint | Same as above |

### NPM Script Shortcuts

| Shortcut | Full Command |
|----------|--------------|
| \`npm start\` | \`node heady-manager.js\` |
| \`npm run dev\` | Development mode |
| \`npm run lint\` | \`eslint .\` |
| \`npm test\` | \`jest\` or test runner |

### PowerShell Parameter Aliases

| Parameter | Alias | Example |
|-----------|-------|---------|
| \`-Action\` | \`-a\` | \`hs -a checkpoint\` |

### Desktop Shortcuts

Create desktop shortcuts with:
\`\`\`powershell
.\scripts\Create-HeadyShortcuts.ps1
\`\`\`

This creates:
- Heady Manager (start service)
- Heady Admin UI (open browser)
- Heady Checkpoint (generate report)

### Browser Bookmarks

- Admin UI: http://localhost:3300/admin
- Health Check: http://localhost:3300/api/health
- API Docs: http://localhost:3300/api/docs (if available)

---
`;
  }

  buildArchitectureOverview() {
    return `## 🏗️ ARCHITECTURE OVERVIEW

### System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     HEADY ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   Admin UI   │◄────►│    Heady     │                   │
│  │  (React)     │      │   Manager    │                   │
│  │  Port 3300   │      │  (Express)   │                   │
│  └──────────────┘      │  Port 3300   │                   │
│                        └──────┬───────┘                   │
│                               │                            │
│                        ┌──────▼───────┐                   │
│                        │  MCP Gateway │                   │
│                        │  Port 3301   │                   │
│                        └──────┬───────┘                   │
│                               │                            │
│         ┌─────────────────────┼─────────────────────┐     │
│         │                     │                     │     │
│    ┌────▼────┐          ┌────▼────┐          ┌────▼────┐│
│    │   MCP   │          │   MCP   │          │   MCP   ││
│    │ Servers │          │ Servers │          │ Servers ││
│    │(8 total)│          │(Custom) │          │(Tools)  ││
│    └─────────┘          └─────────┘          └─────────┘│
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Docker Services                      │   │
│  │  - heady-manager                                  │   │
│  │  - postgres (optional)                            │   │
│  │  - redis (optional)                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         File System & Storage                     │   │
│  │  - ./src (source code)                            │   │
│  │  - ./public (static files)                        │   │
│  │  - ./audit_logs (checkpoints)                     │   │
│  │  - ./.heady-memory (patterns, validations)        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Technology Stack

**Backend**:
- Node.js (v18+) - Runtime
- Express - Web framework
- MCP Protocol - AI integration
- Docker - Containerization

**Frontend**:
- React - UI framework
- Vite - Build tool
- Sacred Geometry CSS - Styling

**Database**:
- PostgreSQL - Primary database (optional)
- Redis - Caching (optional)
- JSON files - Configuration and state

**DevOps**:
- Docker Compose - Orchestration
- Git - Version control
- GitHub Actions - CI/CD
- Render.com - Deployment

### Data Flow

1. **Request** → Admin UI or API endpoint
2. **Processing** → Heady Manager (Express)
3. **MCP Integration** → MCP Gateway routes to appropriate server
4. **Execution** → MCP server executes tool/operation
5. **Response** → Results returned through chain
6. **Logging** → Audit logs and governance events
7. **Checkpoint** → Periodic system snapshots

### Security Architecture

- **API Key Authentication**: HEADY_API_KEY for admin endpoints
- **JWT Tokens**: MCP Gateway authentication
- **CORS**: Configured origins and hosts
- **Rate Limiting**: Per-minute request limits
- **Governance**: Locked mode with audit trail
- **Secrets Management**: Environment variables, masked in logs

---
`;
  }

  buildOperationalStatus() {
    const health = this.reconData.health || {};
    const git = this.reconData.git || {};
    const env = this.reconData.environment || {};
    const metrics = this.reconData.metrics || {};
    const dockerContainers = Array.isArray(this.reconData.docker) ? this.reconData.docker : [];

    let healthStatus = '';
    if (Object.keys(health).length > 0) {
      healthStatus = '| Service | Status | Response Time |\n|---------|--------|---------------|\n';
      for (const [name, status] of Object.entries(health)) {
        const statusIcon = status.status === 'healthy' ? '✅' : '❌';
        const time = status.responseTime ? `${status.responseTime}ms` : 'N/A';
        healthStatus += `| ${name} | ${statusIcon} ${status.status} | ${time} |\n`;
      }
    } else {
      healthStatus = '*Health status not available*\n';
    }

    const gitStatus = git.clean ? '✅ Clean' : '⚠️ Modified';
    const dockerStatus = dockerContainers.length > 0 ? `✅ ${dockerContainers.length} running` : '⚠️ None running';

    return `## 📊 OPERATIONAL STATUS

### Real-Time System Status

**Timestamp**: ${this.timestamp}

| Component | Status | Details |
|-----------|--------|---------|
| **Docker** | ${dockerStatus} | ${dockerContainers.length} containers |
| **Git** | ${gitStatus} | Branch: ${git.branch || 'unknown'} |
| **Node.js** | ✅ Running | ${env.nodeVersion || 'unknown'} |
| **Platform** | ✅ Active | ${env.platform || 'unknown'} |
| **Uptime** | ✅ ${Math.floor((env.uptime || 0) / 60)}m | ${Math.floor(env.uptime || 0)}s total |

### Service Health

${healthStatus}

### Git Repository Status

| Metric | Value |
|--------|-------|
| Branch | \`${git.branch || 'unknown'}\` |
| Commit | \`${git.commit || 'unknown'}\` |
| Modified Files | ${git.modified || 0} |
| Added Files | ${git.added || 0} |
| Deleted Files | ${git.deleted || 0} |
| Untracked Files | ${git.untracked || 0} |
| Remotes | ${git.remotes || 0} |
| Status | ${gitStatus} |

### System Metrics

| Metric | Value |
|--------|-------|
| Audit Logs | ${metrics.auditLogs || 0} |
| Memory Patterns | ${metrics.memoryPatterns || 0} |
| Validations | ${metrics.validations || 0} |

### Memory Usage

| Type | Usage |
|------|-------|
| RSS | ${env.memoryUsage ? (env.memoryUsage.rss / 1024 / 1024).toFixed(2) : 'N/A'} MB |
| Heap Total | ${env.memoryUsage ? (env.memoryUsage.heapTotal / 1024 / 1024).toFixed(2) : 'N/A'} MB |
| Heap Used | ${env.memoryUsage ? (env.memoryUsage.heapUsed / 1024 / 1024).toFixed(2) : 'N/A'} MB |
| External | ${env.memoryUsage ? (env.memoryUsage.external / 1024 / 1024).toFixed(2) : 'N/A'} MB |

### Active Processes

${Array.isArray(this.reconData.processes) && this.reconData.processes.length > 0 
    ? `${this.reconData.processes.length} Node.js processes detected`
    : 'Process information not available'}

---
`;
  }

  buildConfigurationReference() {
    const mcpConfig = this.reconData.environment?.mcpConfig || {};

    return `## ⚙️ CONFIGURATION REFERENCE

### MCP Configuration (\`mcp_config.json\`)

| Setting | Value |
|---------|-------|
| Server Count | ${mcpConfig.serverCount || 0} |
| Gateway Port | ${mcpConfig.gatewayPort || 3301} |
| Governance Mode | ${mcpConfig.governanceMode || 'locked'} |
| Governance Version | ${mcpConfig.governanceVersion || 'v1.2.0'} |

### Docker Configuration (\`docker-compose.yml\`)

**Services**:
- heady-manager (port 3300)
- Network: heady-network

**Volumes**:
- ./public:/app/public
- ./src:/app/src

**Environment**:
- NODE_ENV=production
- PORT=3300
- HEADY_TRUST_PROXY=true

### Package Configuration (\`package.json\`)

**Main Dependencies**:
- express
- dockerode
- @huggingface/inference
- cors
- helmet
- rate-limiter-flexible

**Dev Dependencies**:
- eslint
- prettier
- jest (if configured)

### Render Configuration (\`render.yaml\`)

**Service**: heady-manager
**Type**: web
**Environment**: node
**Build Command**: npm install
**Start Command**: npm start

### ESLint Configuration (\`.eslintrc.js\`)

**Rules**: Standard JavaScript style
**Environments**: Node.js, ES2021

---
`;
  }

  buildEnvironmentVariables() {
    const envVars = this.reconData.environment?.envVars || {};

    return `## 🔐 ENVIRONMENT VARIABLES

### Required Variables

| Variable | Status | Purpose |
|----------|--------|---------|
| \`NODE_ENV\` | ${envVars.NODE_ENV || 'development'} | Environment mode |
| \`PORT\` | ${envVars.PORT || '3300'} | Server port |
| \`HEADY_API_KEY\` | ${envVars.HEADY_API_KEY || '✗ NOT SET'} | Admin authentication |

### Optional Variables

| Variable | Status | Purpose |
|----------|--------|---------|
| \`DATABASE_URL\` | ${envVars.DATABASE_URL || '✗ NOT SET'} | PostgreSQL connection |
| \`HF_TOKEN\` | ${envVars.HF_TOKEN || '✗ NOT SET'} | Hugging Face API |
| \`CLOUDFLARE_API_TOKEN\` | ${envVars.CLOUDFLARE_API_TOKEN || '✗ NOT SET'} | Cloudflare API |

### MCP Gateway Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| \`MCP_GATEWAY_JWT_SECRET\` | (required) | JWT signing |
| \`HEADY_CORS_ORIGINS\` | localhost | Allowed origins |
| \`HEADY_RATE_LIMIT_MAX\` | 60 | Requests per window |
| \`HEADY_RATE_LIMIT_WINDOW_MS\` | 60000 | Rate limit window |

### Hugging Face Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| \`HF_TOKEN\` | (required) | API authentication |
| \`HF_TEXT_MODEL\` | gpt2 | Text generation model |
| \`HF_EMBED_MODEL\` | all-MiniLM-L6-v2 | Embedding model |
| \`HF_MAX_CONCURRENCY\` | 5 | Concurrent requests |

### Configuration Files

- \`.env\` - Local development
- \`.env.production\` - Production settings
- \`.env.example\` - Template with all variables
- \`.env.template\` - Alternative template

---
`;
  }

  buildAPIEndpoints() {
    return `## 🌐 API ENDPOINTS

### Health & Status

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| \`/api/health\` | GET | Service health check | None |
| \`/api/pulse\` | GET | Docker version check | None |

### Hugging Face Integration

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| \`/api/hf/infer\` | POST | Text inference | API Key |
| \`/api/hf/generate\` | POST | Text generation | API Key |
| \`/api/hf/embed\` | POST | Text embedding | API Key |

**Authentication**: \`x-heady-api-key\` header or \`Authorization: Bearer <token>\`

**Rate Limiting**: 60 requests per minute (configurable)

### Admin Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| \`/api/admin/config/render-yaml\` | GET | Get render.yaml | API Key |
| \`/api/admin/config/mcp\` | GET | Get MCP config | API Key |
| \`/api/admin/settings/gpu\` | GET | GPU settings | API Key |
| \`/api/admin/gpu/infer\` | POST | GPU inference | API Key |
| \`/api/admin/assistant\` | POST | AI assistant | API Key |
| \`/api/admin/lint\` | POST | Code linting | API Key |
| \`/api/admin/test\` | POST | Run tests | API Key |
| \`/api/admin/roots\` | GET | Admin roots | API Key |
| \`/api/admin/files\` | GET | Browse files | API Key |
| \`/api/admin/file\` | GET/POST | Read/write file | API Key |
| \`/api/admin/ops\` | GET | List operations | API Key |
| \`/api/admin/ops/:id/status\` | GET | Operation status | API Key |
| \`/api/admin/ops/:id/stream\` | GET | Stream logs (SSE) | API Key |
| \`/api/admin/build\` | POST | Start build | API Key |
| \`/api/admin/audit\` | POST | Start audit | API Key |

### Static Files

| Path | Purpose |
|------|---------|
| \`/\` | Serves \`public/index.html\` |
| \`/admin\` | Admin UI |
| \`/public/*\` | Static assets |

### CORS Configuration

**Allowed Origins**: Configured via \`HEADY_CORS_ORIGINS\`
**Default**: http://localhost, http://127.0.0.1

---
`;
  }

  buildFileStructure() {
    const files = this.reconData.files || [];

    let fileTable = '';
    if (files.length > 0) {
      fileTable = '| Path | Status | Files | Last Modified |\n|------|--------|-------|---------------|\n';
      for (const file of files) {
        if (file.exists) {
          const modified = file.modified ? new Date(file.modified).toISOString().split('T')[0] : 'N/A';
          fileTable += `| \`${file.path}\` | ✅ Exists | ${file.fileCount || 0} | ${modified} |\n`;
        } else {
          fileTable += `| \`${file.path}\` | ❌ Missing | - | - |\n`;
        }
      }
    } else {
      fileTable = '*File structure information not available*\n';
    }

    return `## 📁 FILE STRUCTURE

### Critical Directories

${fileTable}

### Directory Purpose

| Directory | Purpose |
|-----------|---------|
| \`./src/\` | Source code (Node.js, Python) |
| \`./public/\` | Static files, Admin UI |
| \`./scripts/\` | PowerShell and Node.js scripts |
| \`./mcp-servers/\` | Custom MCP server implementations |
| \`./backend/\` | Backend services |
| \`./frontend/\` | Frontend React application |
| \`./docs/\` | Documentation |
| \`./.heady-memory/\` | Memory patterns and validations |
| \`./audit_logs/\` | Checkpoint reports and audit logs |
| \`./tests/\` | Test files |
| \`./.github/\` | GitHub Actions workflows |
| \`./.vscode/\` | VS Code configuration |

### Key Files

| File | Purpose |
|------|---------|
| \`heady-manager.js\` | Main Express server |
| \`package.json\` | Node.js dependencies |
| \`docker-compose.yml\` | Docker orchestration |
| \`render.yaml\` | Render.com deployment |
| \`mcp_config.json\` | MCP server configuration |
| \`.env\` | Environment variables |
| \`.eslintrc.js\` | ESLint configuration |
| \`README.md\` | Project documentation |
| \`hs.bat\` | Heady Systems control wrapper |

---
`;
  }

  buildConceptRegistry() {
    return `## 💡 CONCEPT REGISTRY

### Active Concepts

| Concept | Status | Description |
|---------|--------|-------------|
| **Checkpoint System** | ✅ Active | Comprehensive system status reporting |
| **MCP Integration** | ✅ Active | Model Context Protocol servers |
| **Governance** | ✅ Active | Locked governance mode with audit |
| **Admin UI** | ✅ Active | Web-based administration interface |
| **Sacred Geometry** | ✅ Active | Aesthetic design framework |
| **Heady Control (hs)** | ✅ Active | Master orchestration command |

### Implementation Patterns

**Checkpoint Pattern**:
- Automated system scanning
- Markdown + JSON output
- Governance integration
- Historical comparison

**MCP Pattern**:
- Standard protocol compliance
- Governance rules per server
- JWT authentication
- Rate limiting

**Admin Pattern**:
- API key authentication
- File browser with safety checks
- Operation streaming
- Real-time logs

### Memory Patterns

Location: \`./.heady-memory/patterns/\`

- \`merge_strategy_001.json\`
- \`naming_convention_001.json\`

### Validations

Location: \`./.heady-memory/validations/\`

Recent validations tracked with timestamps and results.

---
`;
  }

  buildTroubleshooting() {
    return `## 🔍 TROUBLESHOOTING

### Common Issues

#### Docker Not Running

**Symptom**: \`docker ps\` fails or checkpoint shows no containers

**Solution**:
\`\`\`powershell
# Start Docker Desktop
# Or start Docker service
docker compose up -d
\`\`\`

#### Services Not Responding

**Symptom**: Health checks fail, 500 errors

**Solution**:
\`\`\`powershell
# Restart services
hs -Restart

# Or manually
docker compose restart
npm start
\`\`\`

#### Git Conflicts

**Symptom**: Merge conflicts, sync failures

**Solution**:
\`\`\`powershell
# Use force sync
hs -Force

# Or manual resolution
git fetch --all
git status
# Resolve conflicts manually
\`\`\`

#### Missing API Key

**Symptom**: 401 Unauthorized on admin endpoints

**Solution**:
\`\`\`powershell
# Generate new API key
npm run generate-key

# Set in .env
# HEADY_API_KEY=<generated-key>
\`\`\`

#### Port Already in Use

**Symptom**: EADDRINUSE error on port 3300 or 3301

**Solution**:
\`\`\`powershell
# Find and kill process
netstat -ano | findstr :3300
taskkill /PID <pid> /F

# Or change port in .env
# PORT=3400
\`\`\`

#### Checkpoint Generation Fails

**Symptom**: Error during checkpoint generation

**Solution**:
\`\`\`powershell
# Check permissions
# Ensure audit_logs directory exists
mkdir audit_logs

# Run with verbose output
node scripts/checkpoint.js generate
\`\`\`

#### MCP Servers Not Starting

**Symptom**: MCP gateway errors, server timeouts

**Solution**:
\`\`\`powershell
# Check mcp_config.json syntax
# Verify npx is available
npx --version

# Restart MCP services
.\scripts\Start-MCPServices.ps1
\`\`\`

### Diagnostic Commands

\`\`\`powershell
# System health
hs -Checkpoint

# Docker status
docker ps -a
docker compose logs

# Git status
git status
git log --oneline -10

# Node.js processes
tasklist | findstr node

# Port usage
netstat -ano | findstr :3300
netstat -ano | findstr :3301

# Environment check
node -v
npm -v
docker --version
git --version
\`\`\`

### Log Locations

| Log | Location |
|-----|----------|
| Checkpoint Reports | \`./audit_logs/checkpoint_*.md\` |
| Audit Logs | \`./audit_logs/audit_*.jsonl\` |
| Docker Logs | \`docker compose logs\` |
| Application Logs | Console output |
| Memory Validations | \`./.heady-memory/validations/\` |

### Getting Help

1. Check this master reference document
2. Review checkpoint reports in \`./audit_logs/\`
3. Check \`docs/\` directory for detailed documentation
4. Run \`hs -Checkpoint\` for current system status
5. Review GitHub issues and discussions

---
`;
  }

  buildFooter() {
    return `## 📞 SUPPORT & RESOURCES

### Documentation

- **Checkpoint System**: \`docs/CHECKPOINT_SYSTEM.md\`
- **Quick Start**: \`docs/CHECKPOINT_QUICK_START.md\`
- **Admin UI**: \`docs/admin/ADMIN_UI.md\`
- **Security**: \`SECURITY.md\`
- **Contributing**: \`CONTRIBUTING.md\`

### Quick Commands Reference

\`\`\`powershell
# Generate checkpoint
hs -Checkpoint

# View latest checkpoint
.\scripts\Invoke-Checkpoint.ps1 -Action view

# Full maintenance cycle
hs -Restart

# Force sync
hs -Force

# Start services
npm start

# Docker services
docker compose up -d
\`\`\`

### System Status

**Last Checkpoint**: ${this.timestamp}  
**System Version**: 1.0.0  
**Node.js**: ${this.reconData.environment?.nodeVersion || 'unknown'}  
**Platform**: ${this.reconData.environment?.platform || 'unknown'}

---

*This master reference document is automatically generated at each checkpoint.*  
*For the most up-to-date information, generate a new checkpoint: \`hs -Checkpoint\`*

**Generated by**: Heady Checkpoint Story Driver  
**Timestamp**: ${this.timestamp}  
**Format**: Markdown v1.0
`;
  }
}

module.exports = MasterReferenceGenerator;
