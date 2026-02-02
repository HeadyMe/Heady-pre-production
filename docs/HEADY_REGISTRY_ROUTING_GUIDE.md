# Heady Registry Routing System

## Overview

The **HeadyRegistry Router** is an intelligent routing layer that ensures all AI requests leverage the full Heady Systems infrastructure instead of bypassing it. When you make requests through Windsurf or other AI interfaces, the router analyzes the request and automatically delegates to the appropriate Heady components.

## Problem Solved

**Before:** When you requested something like "Generate a comprehensive .md file", the AI would generate it directly without utilizing:
- HeadyAcademy agents (ATLAS, MUSE, ORACLE)
- HeadyManager services (HuggingFace, data processing)
- HeadyHive orchestration (task management, optimization)
- Story-driven content generation
- Sacred Geometry aesthetics
- Audit trails and governance

**After:** The router intercepts requests, analyzes them, and routes them through the appropriate Heady Systems components, ensuring your infrastructure is fully utilized.

## Architecture

```
User Request (Windsurf/CLI)
    ↓
WindsurfHeadyBridge
    ↓
HeadyRegistryRouter
    ↓
Capability Analysis
    ↓
Routing Decision
    ↓
┌─────────────┬──────────────┬─────────────┐
│ HeadyAcademy│ HeadyManager │  HeadyHive  │
│   Agents    │   Services   │Orchestration│
└─────────────┴──────────────┴─────────────┘
```

## Capabilities Mapped

### 1. Documentation Generation
- **Component:** HeadyAcademy
- **Agents:** ATLAS (Auto-Archivist), MUSE (Brand Architect), ORACLE (Truth Keeper)
- **Triggers:** "document", "documentation", ".md file", "readme", "guide", "manual"
- **Use Case:** Comprehensive documentation with story-driven narrative

### 2. Data Processing & Analysis
- **Component:** HeadyManager
- **Services:** HuggingFace API, Python Worker
- **Triggers:** "analyze", "process data", "inference", "embedding", "model"
- **Use Case:** AI model inference, embeddings, data transformation

### 3. Code Generation & Optimization
- **Component:** HeadyHive
- **Agents:** ARCHITECT, JULES (Hyper-Surgeon), BUILDER
- **Triggers:** "generate code", "build", "create function", "implement", "refactor"
- **Use Case:** Intelligent code generation with optimization

### 4. Security & Auditing
- **Component:** HeadyChain
- **Agents:** SENTINEL (Guardian), MURPHY (Inspector), CIPHER (Cryptolinguist)
- **Triggers:** "security", "audit", "encrypt", "authenticate", "vulnerability"
- **Use Case:** Security audits, encryption, authentication

### 5. Research & Discovery
- **Component:** HeadyAcademy
- **Agents:** SCOUT (Hunter), SASHA (Dreamer), NOVA (Expander)
- **Triggers:** "research", "find", "discover", "scan", "explore", "gap analysis"
- **Use Case:** Research topics, scan resources, identify gaps

### 6. Visualization & Reporting
- **Component:** HeadyAcademy
- **Agents:** OCULUS (Visualizer), ATLAS
- **Triggers:** "visualize", "chart", "graph", "diagram", "report"
- **Use Case:** Data visualization, project structure visualization

### 7. System Orchestration
- **Component:** HeadyManager
- **Services:** OrchestrationManager, MCP
- **Triggers:** "orchestrate", "coordinate", "workflow", "pipeline"
- **Use Case:** Multi-service coordination, workflow management

### 8. File Operations
- **Component:** HeadyManager
- **Services:** Admin File System
- **Triggers:** "file", "directory", "read", "write", "move"
- **Use Case:** Secure file system operations with audit trail

## Usage

### CLI Usage

#### Analyze a Request
```powershell
node src/heady_registry_router.js "Generate comprehensive API documentation"
```

#### Execute via Bridge
```powershell
node src/windsurf_heady_bridge.js "Generate comprehensive API documentation" --execute
```

### Programmatic Usage

```javascript
const WindsurfHeadyBridge = require('./src/windsurf_heady_bridge');

const bridge = new WindsurfHeadyBridge();

// Analyze request
const interception = await bridge.interceptRequest(
  "Generate comprehensive API documentation for the Heady Manager"
);

console.log('Should delegate:', interception.shouldDelegate);
console.log('Recommendation:', interception.getGuidance().recommendation);

// Execute if appropriate
if (interception.shouldDelegate) {
  const result = await interception.execute();
  console.log('Result:', result);
}
```

### Integration with HeadyManager

Add to `heady-manager.js`:

```javascript
const WindsurfHeadyBridge = require('./src/windsurf_heady_bridge');
const bridge = new WindsurfHeadyBridge();

// New endpoint for intelligent routing
app.post('/api/route', authenticate, asyncHandler(async (req, res) => {
  const { request } = req.body;
  if (!request) throw { status: 400, message: 'Request required' };
  
  const interception = await bridge.interceptRequest(request, {
    user: req.securityContext.userId,
    session: req.securityContext.sessionId
  });
  
  res.json({
    ok: true,
    shouldDelegate: interception.shouldDelegate,
    guidance: interception.getGuidance()
  });
}));
```

## Example Scenarios

### Scenario 1: Documentation Request

**Request:** "Create a comprehensive markdown file documenting the Heady MCP architecture"

**Routing Decision:**
- **Capability:** documentation
- **Component:** HeadyAcademy
- **Agents:** ATLAS, MUSE, ORACLE
- **Command:** `Students/Wrappers/Atlas.ps1 -Instruction "Create a comprehensive markdown file documenting the Heady MCP architecture"`

**Result:** Documentation generated using:
- ATLAS for structure and organization
- MUSE for narrative and branding
- ORACLE for accuracy verification
- Story-driven approach with Sacred Geometry aesthetics

### Scenario 2: Code Generation Request

**Request:** "Build a new API endpoint for user authentication"

**Routing Decision:**
- **Capability:** code_generation
- **Component:** HeadyHive
- **Agents:** ARCHITECT, JULES, BUILDER
- **Command:** `hb task "Build a new API endpoint for user authentication"`

**Result:** Code generated through:
- ARCHITECT drafts the solution
- Optimizer analyzes complexity
- JULES optimizes the code
- BUILDER constructs the implementation
- Full governance logging and audit trail

### Scenario 3: Security Audit Request

**Request:** "Perform security audit on the authentication system"

**Routing Decision:**
- **Capability:** security
- **Component:** HeadyChain
- **Agents:** SENTINEL, MURPHY
- **Command:** `Students/Wrappers/Murphy.ps1 -Instruction "Perform security audit on the authentication system"`

**Result:** Security audit using:
- MURPHY runs Semgrep analysis
- SENTINEL checks authentication flows
- Audit trail logged to HeadyChain
- Evidence-based reporting

## Configuration

### Environment Variables

```bash
# HeadyManager URL (default: http://localhost:3300)
HEADY_MANAGER_URL=http://localhost:3300

# HeadyManager API Key
HEADY_API_KEY=your-api-key-here

# HeadyAcademy Root Path
HEADY_ACADEMY_ROOT=c:/Users/erich/CascadeProjects/HeadySystems/Heady/HeadyAcademy
```

### Registry Configuration

The router reads from `.heady-memory/heady-registry.json` to understand available components and their capabilities. Update this file to add new components or modify routing behavior.

## Audit Trail

All routing decisions are logged to `audit_logs/windsurf_routing.jsonl` in JSONL format:

```json
{
  "timestamp": "2026-02-02T20:30:00Z",
  "request": "Generate API documentation",
  "context": { "user": "erich", "session": "abc123" },
  "routing": {
    "shouldDelegate": true,
    "route": "heady_systems",
    "primary": "HeadyAcademy",
    "capability": "documentation"
  }
}
```

## Benefits

1. **Automatic Infrastructure Utilization:** No more bypassing your sophisticated Heady Systems
2. **Intelligent Routing:** Requests automatically go to the right component
3. **Full Audit Trail:** Every routing decision is logged
4. **Governance Integration:** All actions flow through HeadyChain
5. **Story-Driven Output:** Content generated with narrative and branding
6. **Sacred Geometry:** UI/UX follows your design principles
7. **Agent Specialization:** Each agent handles what it does best
8. **Optimization:** JULES ensures code quality
9. **Security:** SENTINEL and MURPHY maintain security posture
10. **Transparency:** Glass Box monitoring shows all activity

## Next Steps

### For Immediate Use

1. **Test the Router:**
   ```powershell
   node src/heady_registry_router.js "Generate API documentation"
   ```

2. **Test the Bridge:**
   ```powershell
   node src/windsurf_heady_bridge.js "Generate API documentation"
   ```

3. **Execute a Real Request:**
   ```powershell
   node src/windsurf_heady_bridge.js "Generate comprehensive documentation for HeadyManager" --execute
   ```

### For Integration

1. **Add Endpoint to HeadyManager:** Integrate the bridge into your Express server
2. **Create MCP Server:** Expose routing as an MCP tool
3. **Windsurf Integration:** Configure Windsurf to call the routing endpoint before generating responses
4. **Update Registry:** Add new components and capabilities as your system grows

## Troubleshooting

### Router Not Finding Components

**Issue:** Router returns `shouldDelegate: false` for requests that should be delegated.

**Solution:** 
- Check `.heady-memory/heady-registry.json` exists
- Verify trigger keywords in `buildCapabilityMap()`
- Add more specific keywords for your use case

### Execution Fails

**Issue:** Execution returns errors when running commands.

**Solution:**
- Verify HeadyAcademy path is correct
- Check that PowerShell scripts have execution permissions
- Ensure HeadyManager is running (port 3300)
- Verify API key is set in environment

### No Audit Logs

**Issue:** Routing decisions aren't being logged.

**Solution:**
- Check `audit_logs/` directory exists
- Verify write permissions
- Check disk space

## Future Enhancements

1. **Machine Learning:** Train model on routing decisions to improve accuracy
2. **Multi-Agent Coordination:** Route complex requests to multiple agents in sequence
3. **Feedback Loop:** Learn from execution results to refine routing
4. **Cost Optimization:** Route to most efficient component based on resource usage
5. **Priority Queuing:** High-priority requests get faster routing
6. **Caching:** Cache routing decisions for similar requests
7. **A/B Testing:** Compare direct vs. delegated execution quality

## Conclusion

The HeadyRegistry Router ensures that your sophisticated Heady Systems infrastructure is fully utilized for every request. No more bypassing your agents, services, and orchestration—every request is intelligently analyzed and routed to the optimal component.

**Your infrastructure is now the primary execution engine, not a secondary option.**
