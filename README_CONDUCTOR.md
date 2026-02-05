<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: README_CONDUCTOR.md -->
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

# HEADY CONDUCTOR & REGISTRY

## Overview

The **HeadyRegistry** and **HeadyConductor** form the central nervous system of Heady, providing comprehensive capability tracking and intelligent orchestration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     HEADY CONDUCTOR                          │
│                  (Orchestration Layer)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     HEADY REGISTRY                           │
│              (Capability Tracking System)                    │
├─────────────────────────────────────────────────────────────┤
│  • Nodes (14)      - BRIDGE, MUSE, SENTINEL, etc.           │
│  • Workflows (7)   - /hcautobuild, /deploy-system, etc.     │
│  • Skills (1+)     - hc, custom skills                       │
│  • Services (6)    - API, Frontend, Database, etc.          │
│  • Tools (15+)     - Auto_Doc, Gap_Scanner, etc.            │
└─────────────────────────────────────────────────────────────┘
```

## HeadyRegistry

### Purpose
Centralized tracking of all Heady system capabilities with auto-discovery.

### Features
- **Auto-Discovery**: Scans system on initialization
- **Persistent Storage**: Saves to `.heady/registry.json`
- **Query Interface**: Search capabilities by keyword
- **Status Tracking**: Monitor node and service health

### Capabilities Tracked

#### 1. Nodes (14 Total)
- **BRIDGE** - The Connector (MCP Server)
- **MUSE** - The Brand Architect (Content Generator)
- **SENTINEL** - The Guardian (Auth & Security)
- **NOVA** - The Expander (Gap Scanner)
- **OBSERVER** - The Natural Observer (Monitoring)
- **JANITOR** - The Custodian (Cleanup)
- **JULES** - The Hyper-Surgeon (Optimization)
- **SOPHIA** - The Matriarch (Hardware Sentience)
- **CIPHER** - The Cryptolinguist (Encryption)
- **ATLAS** - The Auto-Archivist (Documentation)
- **MURPHY** - The Inspector (Security Audit)
- **SASHA** - The Dreamer (Brainstorming)
- **SCOUT** - The Hunter (GitHub Scanner)
- **OCULUS** - The Visualizer (Gource)
- **BUILDER** - The Constructor (Project Hydrator)

#### 2. Workflows (7 Total)
- `/hcautobuild` - Automated checkpoint system
- `/deploy-system` - Deploy Heady System
- `/verify-system` - Health verification
- `/codemap-optimization` - AI node integration
- `/workspace-integration` - Workspace setup
- `/headysync-prep` - Sync preparation
- `/branding-protocol` - Brand consistency

#### 3. Services (6 Total)
- **heady-manager** - Node.js API (port 3300)
- **heady-frontend** - React UI (port 3000)
- **python-worker** - Backend worker (port 5000)
- **mcp-server** - MCP Protocol (stdio)
- **postgres** - Database (port 5432)
- **redis** - Cache (port 6379)

#### 4. Tools (15+ Total)
Categories: MCP, Security, Network, Daemons, General

### Usage

#### Python API
```python
from HeadyRegistry import HeadyRegistry

# Initialize (auto-discovers on first run)
registry = HeadyRegistry()

# Get summary
summary = registry.get_summary()
print(f"Total capabilities: {summary['total_capabilities']}")

# Query capabilities
results = registry.query("deploy")
print(f"Found {results['total_results']} results")

# Update node status
registry.update_node_status("BRIDGE", "active", "2024-01-01T12:00:00Z")

# Save changes
registry.save()
```

#### CLI
```bash
# View registry summary
python HeadyAcademy/HeadyRegistry.py
```

## HeadyConductor

### Purpose
Intelligent orchestration layer that routes requests to appropriate capabilities.

### Features
- **Request Analysis**: Natural language understanding
- **Execution Planning**: Multi-capability coordination
- **Workflow Execution**: Automated workflow running
- **Node Invocation**: Smart node routing
- **Health Monitoring**: Service status tracking

### Orchestration Flow

```
User Request
    ↓
Analyze Request
    ↓
Generate Execution Plan
    ├─→ Workflows to Execute
    ├─→ Nodes to Invoke
    ├─→ Tools to Use
    └─→ Services Required
    ↓
Execute Plan
    ↓
Return Results
```

### Usage

#### Python API
```python
from HeadyConductor import HeadyConductor

# Initialize
conductor = HeadyConductor()

# Orchestrate a request
result = conductor.orchestrate("deploy the system")

# Execute specific workflow
result = conductor.execute_workflow("hcautobuild")

# Invoke specific node
result = conductor.invoke_node("BRIDGE")

# Check service health
health = conductor.check_service_health()

# Query capabilities
results = conductor.query_capabilities("security")

# Get system summary
summary = conductor.get_system_summary()
```

#### CLI
```bash
# Orchestrate a request
python HeadyAcademy/HeadyConductor.py --request "scan for security issues"

# Execute workflow
python HeadyAcademy/HeadyConductor.py --workflow hcautobuild

# Invoke node
python HeadyAcademy/HeadyConductor.py --node SENTINEL

# Query capabilities
python HeadyAcademy/HeadyConductor.py --query "deploy"

# System summary
python HeadyAcademy/HeadyConductor.py --summary

# Health check
python HeadyAcademy/HeadyConductor.py --health
```

## API Endpoints

The HeadyConductor is integrated into `heady-manager.js` with the following endpoints:

### POST `/api/conductor/orchestrate`
Orchestrate a natural language request.

**Request:**
```json
{
  "request": "deploy the system to production"
}
```

**Response:**
```json
{
  "request": "deploy the system to production",
  "execution_plan": { ... },
  "results": {
    "workflows": [...],
    "nodes": [...],
    "tools": [...]
  },
  "success": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### GET `/api/conductor/summary`
Get comprehensive system summary.

**Response:**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "registry": {
    "total_capabilities": 42,
    "nodes": 14,
    "workflows": 7,
    "skills": 1,
    "services": 6,
    "tools": 15
  },
  "system_status": "operational"
}
```

### GET `/api/conductor/health`
Check health of all services.

**Response:**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "heady-manager": {
      "name": "heady-manager",
      "type": "api",
      "status": "healthy",
      "endpoint": "http://localhost:3300"
    }
  }
}
```

### GET `/api/conductor/query?q=<query>`
Query capabilities by keyword.

**Response:**
```json
{
  "query": "security",
  "category": null,
  "total_results": 5,
  "results": {
    "nodes": [...],
    "workflows": [...],
    "tools": [...]
  }
}
```

### POST `/api/conductor/workflow`
Execute a specific workflow.

**Request:**
```json
{
  "workflow": "hcautobuild"
}
```

### POST `/api/conductor/node`
Invoke a specific node.

**Request:**
```json
{
  "node": "BRIDGE"
}
```

## Testing

Run the test suite:

```bash
python test_conductor.py
```

Tests include:
- Registry initialization and discovery
- Capability querying
- Request analysis
- Orchestration execution
- Service health checks

## Integration Examples

### Example 1: Deploy System
```python
conductor = HeadyConductor()
result = conductor.orchestrate("deploy the heady system")
# Automatically finds and executes /deploy-system workflow
```

### Example 2: Security Audit
```python
conductor = HeadyConductor()
result = conductor.orchestrate("run security audit")
# Invokes MURPHY node (Security Inspector)
```

### Example 3: Gap Analysis
```python
conductor = HeadyConductor()
result = conductor.orchestrate("scan for gaps in the codebase")
# Invokes NOVA node (Gap Scanner)
```

### Example 4: Documentation
```python
conductor = HeadyConductor()
result = conductor.orchestrate("generate documentation")
# Invokes ATLAS node (Auto-Archivist)
```

## File Structure

```
Heady/
├── HeadyAcademy/
│   ├── HeadyRegistry.py          # Registry implementation
│   ├── HeadyConductor.py         # Conductor implementation
│   └── Node_Registry.yaml        # Node definitions
├── .heady/
│   └── registry.json             # Persistent registry data
├── .windsurf/
│   └── workflows/                # Workflow definitions
├── heady-manager.js              # API integration
└── test_conductor.py             # Test suite
```

## Environment Variables

```bash
# Python binary for conductor execution
HEADY_PYTHON_BIN=python

# Custom conductor script path (optional)
HEADY_ADMIN_SCRIPT=/path/to/HeadyConductor.py
```

## Best Practices

1. **Auto-Discovery**: Let the registry auto-discover on first run
2. **Query First**: Use query to find capabilities before orchestrating
3. **Health Checks**: Monitor service health regularly
4. **Status Updates**: Update node/service status after operations
5. **Logging**: Review execution logs for audit trail

## Future Enhancements

- [ ] Real-time service health monitoring
- [ ] Advanced NLP for request analysis
- [ ] Parallel capability execution
- [ ] Capability dependency resolution
- [ ] Performance metrics collection
- [ ] Visual dashboard integration
- [ ] Webhook support for external triggers
- [ ] Machine learning for orchestration optimization

## Sacred Geometry Principles

The HeadyConductor embodies Sacred Geometry through:
- **Centralized Hub**: Single source of truth
- **Organic Discovery**: Self-organizing capability mapping
- **Breathing Interfaces**: Dynamic status updates
- **Harmonic Orchestration**: Coordinated multi-capability execution

---

**∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞**
