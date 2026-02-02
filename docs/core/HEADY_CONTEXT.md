# HeadySystem CONTEXT & GOLDEN MASTER PROTOCOL

## 1. System Identity & Mission
**Heady** is a living, breathing ecosystem designed to model global consciousness through "Sacred Geometry" and interconnected intelligence.
**Mission**: To squash, merge, and structure data into a unified, fractal, and visually responsive ecosystem utilizing HeadyMCP services.

## 2. Architecture: The HeadyMCP Cluster
The system utilizes the Model Context Protocol (MCP) as first-class infrastructure.

### Core Services
- **HeadyManager (Integration Layer)**
  - **Port**: 3300
  - **Role**: Entry point, UI hosting, Auth, API Gateway.
  - **Tech**: Node.js/Express.
  - **Key Routes**: `/admin`, `/monitoring`, `/api/health`.

- **Heady Backend (Service Layer)**
  - **Port**: 4000
  - **Role**: Business logic, data persistence, MCP Proxy.
  - **Tech**: Node.js/Express.
  - **Key Routes**: `/api/mcp/proxy`, `/api/tasks`.

- **Heady Graph (Knowledge Layer)**
  - **Port**: 3301
  - **Role**: Global knowledge graph, dependency tracking, relationship modeling.
  - **Tools**: `create_node`, `create_edge`, `get_subgraph`.

- **Heady Metrics (Observability Layer)**
  - **Port**: 3302
  - **Role**: Real-time system pulse, heartbeat, WebSocket streaming.
  - **Tools**: `record_metric`, `get_metrics`.
  - **Stream**: `ws://localhost:3302`.

- **Heady Workflow (Orchestration Layer)**
  - **Port**: 3303
  - **Role**: Task management, distributed locking, multi-agent coordination.
  - **Tools**: `create_task`, `update_task`, `acquire_lock`.

- **Heady Assets (Presentation Layer)**
  - **Port**: 3304
  - **Role**: Sacred geometry generation, media management, theme enforcement.
  - **Tools**: `get_asset`, `generate_sacred_pattern`.

## 3. "Sacred Geometry" Design System
- **Visual Language**: Fractals, Waves, Breathing animations, Golden Ratio.
- **Implementation**: 
  - CSS Variables in `public/css/sacred-geometry.css`.
  - SVG & Canvas visualizations in `public/monitoring.html`.
  - Monaco Editor themed for "Code as Consciousness" in `public/admin-sacred.html`.
- **Behavior**: UIs must feel "alive", pulsing with real-time data from `Heady Metrics`.

## 4. Automation & Workflows
- **Startup**: `start-heady-system.ps1` (Builds, Launches Cluster, Opens UIs).
- **Shutdown**: `stop-heady-system.ps1` (Graceful termination).
- **Validation**: `demo-heady-functionality.ps1` (End-to-end verification).
- **Deployment**: `Build-HeadyEcosystem.ps1` (Restructuring, Merge Prep).

## 5. Golden Master Plan Alignment
- **Phase 1 (Complete)**: Unfinished tasks scanned and resolved.
- **Phase 2 (Complete)**: HeadyMCP services integrated and active.
- **Phase 3 (Complete)**: UI/UX redesigned with Sacred Geometry.
- **Phase 4 (Ready)**: Intelligent squash-merge strategy prepared.
- **Phase 5 (In Progress)**: Automated verification and demonstration.

## 6. Repository Structure (Optimal Data Source)
The system is structured to allow clean separation and intelligent merging:
- `/mcp-servers/`: Independent MCP microservices.
- `/backend/`: dedicated backend logic.
- `/public/`: Frontend assets and React apps.
- `/src/`: Legacy Python workers (Hugging Face).
- `/scripts/`: PowerShell automation.

## 7. Next Steps for Agents
1. **Consult `Heady Graph`** to understand dependencies.
2. **Stream `Heady Metrics`** to drive UI animations.
3. **Register tasks** in `Heady Workflow` before execution.
4. **Use `Heady Assets`** for all visual elements.
5. **Follow `SQUASH_MERGE_PLAN.md`** for final integration.
