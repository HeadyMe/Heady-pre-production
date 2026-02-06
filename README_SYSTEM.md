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
<!-- ║  FILE: README_SYSTEM.md                                           ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

# ∞ HEADY SYSTEMS | THE SACRED MONOREPO ∞

## I. ARCHITECTURAL OVERVIEW
Heady Systems is a self-contained, optimized ecosystem designed for "Sacred Geometry" data processing and orchestration. It utilizes a hybrid Node.js/Python architecture to bridge high-speed management with deep data processing.

### The Trinity Structure
- **Manager (Node.js):** The central nervous system (`backend/index.js`) handling MCP protocols, API routing, and orchestration.
- **Worker (Python):** The computational engine (`backend/python_worker/`) performing pattern recognition, NLP, and heavy lifting.
- **Interface (React):** The breathing UI (`frontend/`) providing a sacred aesthetic for system management.

---

## II. SYSTEM UTILIZATION

### 1. Local Development Cycle
To develop and build the system locally:
```powershell
# Initiate the Local Build & Commit Cycle
.\commit_and_build.ps1
```
This script:
- Stages and commits changes.
- Installs Node dependencies and builds the React frontend.
- Installs Python dependencies in the local environment.

### 2. The Nexus Distribution
To distribute the system across the remote nexus:
```powershell
# Align and Push to all 4 Pillars
.\nexus_deploy.ps1
```
This script synchronizes the local monorepo with:
- `HeadySystems/Heady` (Primary)
- `HeadyMe/Heady` (Secondary)
- `HeadySystems/sandbox` (Testing)

### 3. Integrated Pattern Recognition
HeadyRegistry maintains system integrity by identifying functional duplicates.
- **Scan Endpoint:** `POST /api/admin/scan-patterns`
- **Registry Endpoint:** `GET /api/admin/registry`
- **Mechanism:** Strips whitespace/comments to generate a unique `similarityHash`.

---

## III. THE QUIZ PROTOCOL (Knowledge Integration)

### Concept: Monorepo Optimization
**Question:** Why does Heady move Python logic into `backend/python_worker/`?
**Answer:** To isolate the computational worker from the management logic, ensuring a self-contained, deployable package on platforms like Render.com.

**Flashcard:**
- **Front:** Heady Monorepo Structure
- **Back:** `backend/` (Logic), `frontend/` (UI), `root` (Orchestration).

### Concept: Similarity Detection
**Question:** How does the system recognize two files as "similar" despite different formatting?
**Answer:** By normalizing the content (removing whitespace/comments) before hashing via the `extract_patterns` protocol.

**Flashcard:**
- **Front:** Heady `similarityHash`
- **Back:** Generated from normalized code (no spaces/comments) to detect functional identity.

### Concept: Nexus Deployment
**Question:** What are the "4 Pillars" of the Heady distribution?
**Answer:** The four verified GitHub repositories (`origin`, `heady-me`, `heady-sys`, `sandbox`) synchronized via `nexus_deploy.ps1`.

**Flashcard:**
- **Front:** Nexus Distribution Command
- **Back:** `.\nexus_deploy.ps1`

---

## IV. PROJECT METADATA
- **Manager Port:** 3300
- **Primary Tech:** Node.js (Express), Python (FastAPI/Transformers), React (Vite)
- **Deployment:** Render.com Blueprint (`render.yaml`)
- **Persistence:** `backend/heady_registry.json`
- **Security:** Timing-safe API Key validation, SSH-based Nexus pushes.

---
∞ SYSTEM OPTIMIZED | KNOWLEDGE INTEGRATED ∞
