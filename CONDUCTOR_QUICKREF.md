<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: CONDUCTOR_QUICKREF.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# HEADY CONDUCTOR - QUICK REFERENCE

## 🎯 What is HeadyConductor?

**HeadyConductor** is the orchestration brain of Heady that:
- Knows ALL system capabilities (nodes, workflows, skills, services, tools)
- Routes requests intelligently to the right components
- Coordinates multi-capability execution
- Tracks system health and status

**HeadyRegistry** is the knowledge base that stores and discovers all capabilities.

---

## 📊 System Capabilities (50 Total)

### 🤖 Nodes (15)
| Node | Role | Trigger Keywords |
|------|------|------------------|
| BRIDGE | The Connector | mcp, connect, warp, network, tunnel |
| MUSE | The Brand Architect | generate_content, whitepaper, marketing |
| SENTINEL | The Guardian | grant_auth, verify_auth, audit_ledger |
| NOVA | The Expander | scan_gaps |
| OBSERVER | The Natural Observer | monitor |
| JANITOR | The Custodian | clean |
| JULES | The Hyper-Surgeon | optimization |
| SOPHIA | The Matriarch | learn_tool |
| CIPHER | The Cryptolinguist | obfuscate |
| ATLAS | The Auto-Archivist | documentation |
| MURPHY | The Inspector | security_audit |
| SASHA | The Dreamer | brainstorming |
| SCOUT | The Hunter | scan_github |
| OCULUS | The Visualizer | visualize |
| BUILDER | The Constructor | new_project |

### ⚡ Workflows (7)
- `/hcautobuild` - Automated checkpoint system
- `/deploy-system` - Deploy Heady System
- `/verify-system` - Health verification
- `/codemap-optimization` - AI node integration
- `/workspace-integration` - Workspace setup
- `/headysync-prep` - Sync preparation
- `/branding-protocol` - Brand consistency

### 🔧 Services (6)
- `heady-manager` - API (port 3300)
- `heady-frontend` - React UI (port 3000)
- `python-worker` - Backend (port 5000)
- `mcp-server` - MCP Protocol
- `postgres` - Database (port 5432)
- `redis` - Cache (port 6379)

---

## 🚀 Quick Commands

### Python CLI
```bash
# Orchestrate natural language request
python HeadyAcademy/HeadyConductor.py --request "deploy the system"

# Execute workflow
python HeadyAcademy/HeadyConductor.py --workflow hcautobuild

# Invoke node
python HeadyAcademy/HeadyConductor.py --node BRIDGE

# Query capabilities
python HeadyAcademy/HeadyConductor.py --query "security"

# System summary
python HeadyAcademy/HeadyConductor.py --summary

# Health check
python HeadyAcademy/HeadyConductor.py --health

# View registry
python HeadyAcademy/HeadyRegistry.py
```

### API Endpoints
```bash
# Orchestrate request
curl -X POST http://localhost:3300/api/conductor/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"request": "scan for gaps"}'

# System summary
curl http://localhost:3300/api/conductor/summary

# Health check
curl http://localhost:3300/api/conductor/health

# Query capabilities
curl http://localhost:3300/api/conductor/query?q=deploy

# Execute workflow
curl -X POST http://localhost:3300/api/conductor/workflow \
  -H "Content-Type: application/json" \
  -d '{"workflow": "hcautobuild"}'

# Invoke node
curl -X POST http://localhost:3300/api/conductor/node \
  -H "Content-Type: application/json" \
  -d '{"node": "SENTINEL"}'
```

### Python API
```python
from HeadyAcademy.HeadyConductor import HeadyConductor

conductor = HeadyConductor()

# Orchestrate
result = conductor.orchestrate("deploy the system")

# Execute workflow
result = conductor.execute_workflow("hcautobuild")

# Invoke node
result = conductor.invoke_node("BRIDGE")

# Query
results = conductor.query_capabilities("security")

# Summary
summary = conductor.get_system_summary()

# Health
health = conductor.check_service_health()
```

---

## 💡 Example Use Cases

### Deploy System
```bash
python HeadyAcademy/HeadyConductor.py --request "deploy heady to production"
# → Finds and executes /deploy-system workflow
```

### Security Audit
```bash
python HeadyAcademy/HeadyConductor.py --request "run security audit"
# → Invokes MURPHY node (Security Inspector)
```

### Gap Analysis
```bash
python HeadyAcademy/HeadyConductor.py --request "scan for gaps"
# → Invokes NOVA node (Gap Scanner)
```

### Documentation
```bash
python HeadyAcademy/HeadyConductor.py --request "generate documentation"
# → Invokes ATLAS node (Auto-Archivist)
```

### MCP Connection
```bash
python HeadyAcademy/HeadyConductor.py --request "connect to mcp server"
# → Invokes BRIDGE node (MCP Connector)
```

---

## 📁 File Locations

```
Heady/
├── HeadyAcademy/
│   ├── HeadyRegistry.py          # Registry implementation
│   ├── HeadyConductor.py         # Conductor implementation
│   └── Node_Registry.yaml        # Node definitions
├── .heady/
│   └── registry.json             # Auto-generated registry data
├── heady-manager.js              # API with conductor endpoints
└── test_conductor.py             # Test suite
```

---

## 🔍 How It Works

1. **Auto-Discovery**: On first run, HeadyRegistry scans:
   - `HeadyAcademy/Node_Registry.yaml` for nodes
   - `.windsurf/workflows/*.md` for workflows
   - `HeadyAcademy/Tools/` for tools
   - Predefined services list

2. **Persistent Storage**: Saves to `.heady/registry.json`

3. **Intelligent Routing**: HeadyConductor analyzes requests and:
   - Matches trigger keywords to nodes
   - Finds slash commands in workflows
   - Identifies required services
   - Generates execution plan

4. **Orchestration**: Executes plan by:
   - Running workflows
   - Invoking nodes
   - Using tools
   - Coordinating services

---

## ✅ Testing

```bash
# Run full test suite
python test_conductor.py

# Expected output:
# ✓ Registry initialized (50 capabilities)
# ✓ Conductor initialized
# ✓ Request analysis working
# ✓ Orchestration successful
# ✓ ALL TESTS PASSED
```

---

## 🎨 Sacred Geometry Principles

- **Centralized Hub**: Single source of truth for all capabilities
- **Organic Discovery**: Self-organizing system mapping
- **Breathing Interfaces**: Dynamic status updates
- **Harmonic Orchestration**: Coordinated multi-capability execution

---

**∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞**

For full documentation, see `README_CONDUCTOR.md`
