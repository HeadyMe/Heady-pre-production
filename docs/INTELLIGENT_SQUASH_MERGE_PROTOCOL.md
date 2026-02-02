# INTELLIGENT SQUASH MERGE PROTOCOL

**Version:** 1.0.0  
**Purpose:** Merge multiple codebases intelligently using Heady orchestration  
**Target:** Chromium + Comet + Canva → Heady AI Companion  
**Status:** Active Protocol

---

## OVERVIEW

This protocol defines how to merge disparate codebases (Chromium, Comet, Canva Desktop) into a unified Heady application using intelligent analysis, automated extraction, and story-driven integration.

---

## CORE PRINCIPLES

### 1. **Respect the Source**
- Understand original architecture before extraction
- Preserve battle-tested patterns
- Document why components were chosen

### 2. **Heady Transformation**
- Every component gets Context Vector logging
- UI follows Sacred Geometry principles
- Integration with MCP protocol mandatory

### 3. **Automated Orchestration**
- Use HeadyHive (Architect → Optimizer → Conductor)
- Story Driver narrates the merge process
- Governance logging for audit trail

---

## PHASE 1: CODEBASE ANALYSIS

### Step 1.1: Source Identification

**Chromium (via Electron)**
```bash
# Repository
git clone https://github.com/electron/electron.git

# Key Components to Extract:
- app/ (Application lifecycle)
- browser/ (Window management, IPC)
- renderer/ (Web content rendering)
- common/ (Shared utilities)
- native/ (OS integration)
```

**Comet (Conceptual - Real-time Sync)**
```bash
# If using existing library:
npm install yjs socket.io

# Key Concepts to Implement:
- CRDT (Conflict-free Replicated Data Types)
- Operational Transforms
- Presence awareness
- Conflict resolution
```

**Canva Desktop (Conceptual - Canvas UI)**
```bash
# Similar open-source alternatives:
- Fabric.js (Canvas manipulation)
- Konva.js (2D canvas framework)
- Paper.js (Vector graphics)

# Key Components:
- Canvas renderer
- Drag-and-drop system
- Visual editor framework
- Export/import handlers
```

### Step 1.2: Dependency Mapping

Create dependency graph for each codebase:

```javascript
// Use HeadyAcademy SCOUT agent
const scout = require('./heady_academy/agents/scout');

const chromiumDeps = await scout.analyzeDependencies({
  repo: 'electron',
  depth: 3,
  outputFormat: 'graph'
});

const cometDeps = await scout.analyzeDependencies({
  repo: 'yjs',
  depth: 2,
  outputFormat: 'graph'
});
```

### Step 1.3: Compatibility Analysis

**Automated Compatibility Check**
```bash
# Submit to HeadyHive Architect
hb task "Analyze compatibility between Electron, YJS, and Fabric.js for Heady Companion merge"

# Architect will:
# 1. Check Node.js version requirements
# 2. Identify conflicting dependencies
# 3. Suggest resolution strategies
# 4. Generate compatibility matrix
```

---

## PHASE 2: COMPONENT EXTRACTION

### Step 2.1: Define Extraction Targets

**From Chromium/Electron:**
```yaml
components:
  window_management:
    files:
      - app/browser/window.ts
      - app/browser/window_list.ts
    purpose: "Multi-window support for Heady Companion"
    
  ipc_system:
    files:
      - common/ipc/ipc_channel.ts
      - renderer/ipc_renderer.ts
    purpose: "Communication between UI and background services"
    
  native_integration:
    files:
      - app/native/screen_capture.ts
      - app/native/clipboard.ts
    purpose: "OS-level context capture"
```

**From Comet/YJS:**
```yaml
components:
  sync_engine:
    files:
      - src/sync/sync_protocol.ts
      - src/sync/awareness.ts
    purpose: "Real-time task board synchronization"
    
  conflict_resolution:
    files:
      - src/conflict/resolver.ts
    purpose: "Handle concurrent task edits"
```

**From Canva/Fabric.js:**
```yaml
components:
  canvas_renderer:
    files:
      - src/canvas/renderer.ts
      - src/canvas/objects.ts
    purpose: "Sacred Geometry task visualization"
    
  drag_drop:
    files:
      - src/interactions/drag.ts
      - src/interactions/drop.ts
    purpose: "Task board interaction"
```

### Step 2.2: Automated Extraction

**Create Extraction Script**
```javascript
// heady_extract.js
const fs = require('fs-extra');
const path = require('path');
const { Architect } = require('./heady_hive/architect');

async function extractComponents(config) {
  const architect = new Architect();
  
  for (const [source, components] of Object.entries(config)) {
    console.log(`Extracting from ${source}...`);
    
    for (const [name, spec] of Object.entries(components)) {
      const extraction = await architect.extractComponent({
        source: source,
        files: spec.files,
        outputDir: `./extracted/${source}/${name}`,
        transform: 'heady' // Apply Heady transformations
      });
      
      // Log to governance
      await logExtraction({
        component: name,
        source: source,
        files: spec.files,
        purpose: spec.purpose,
        status: extraction.success ? 'SUCCESS' : 'FAILED'
      });
    }
  }
}

// Run extraction
extractComponents(require('./extraction_config.yaml'));
```

### Step 2.3: Heady Transformation

**Apply Context Vector Logging**
```javascript
// Transform extracted components
const { HeadyTransformer } = require('./heady_transformer');

async function transformComponent(componentPath) {
  const transformer = new HeadyTransformer();
  
  // Add Context Vector logging to all functions
  await transformer.injectContextVector(componentPath, {
    angles: ['technical', 'business', 'health'],
    logLevel: 'INFO'
  });
  
  // Apply Sacred Geometry styling to UI components
  if (isUIComponent(componentPath)) {
    await transformer.applySacredGeometry(componentPath, {
      theme: 'organic',
      roundness: 0.8,
      breathing: true
    });
  }
  
  // Add MCP integration hooks
  await transformer.addMCPHooks(componentPath, {
    endpoint: 'http://localhost:3300',
    events: ['task_created', 'task_updated', 'task_completed']
  });
}
```

---

## PHASE 3: INTELLIGENT MERGE

### Step 3.1: Conflict Detection

**Automated Conflict Analysis**
```bash
# Use HeadyHive Optimizer (Socratic Protocol)
hb task "Analyze merge conflicts between extracted Electron, YJS, and Fabric components"

# Optimizer will:
# 1. Identify naming conflicts
# 2. Detect API incompatibilities
# 3. Find duplicate functionality
# 4. Suggest resolution strategies
```

**Example Conflict Report:**
```json
{
  "conflicts": [
    {
      "type": "naming",
      "components": ["electron/window", "fabric/window"],
      "severity": "high",
      "suggestion": "Rename fabric/window to fabric/canvas_window"
    },
    {
      "type": "api_incompatibility",
      "components": ["electron/ipc", "yjs/sync"],
      "severity": "medium",
      "suggestion": "Create adapter layer for message passing"
    }
  ]
}
```

### Step 3.2: Merge Strategy

**Three-Layer Architecture**
```
┌─────────────────────────────────────┐
│   HEADY COMPANION SHELL (Electron)  │  ← Window management, OS integration
├─────────────────────────────────────┤
│   HEADY UI LAYER (React + Fabric)   │  ← Sacred Geometry canvas, task board
├─────────────────────────────────────┤
│   HEADY SYNC LAYER (YJS + Socket)   │  ← Real-time collaboration
├─────────────────────────────────────┤
│   HEADY CORE (Story Driver + MCP)   │  ← Narrative engine, orchestration
└─────────────────────────────────────┘
```

**Merge Execution**
```javascript
// heady_merge.js
const { Conductor } = require('./heady_hive/conductor');

async function executeMerge() {
  const conductor = new Conductor();
  
  // Step 1: Create base Electron app
  await conductor.createElectronShell({
    name: 'HeadyCompanion',
    version: '1.0.0',
    extracted: './extracted/electron'
  });
  
  // Step 2: Integrate React + Fabric UI
  await conductor.integrateUI({
    framework: 'react',
    canvas: './extracted/fabric',
    theme: 'sacred-geometry'
  });
  
  // Step 3: Add YJS sync layer
  await conductor.integrateSyncEngine({
    library: 'yjs',
    transport: 'socket.io',
    extracted: './extracted/yjs'
  });
  
  // Step 4: Wire up Heady Core
  await conductor.integrateHeadyCore({
    storyDriver: './src/heady_story_driver.js',
    mcpClient: './src/mcp_client.js',
    checkpointSystem: './src/checkpoint_reporter.js'
  });
  
  // Step 5: Run integration tests
  const testResults = await conductor.runTests({
    suites: ['unit', 'integration', 'e2e'],
    coverage: 80
  });
  
  return testResults;
}
```

### Step 3.3: Dependency Resolution

**Unified package.json**
```json
{
  "name": "heady-companion",
  "version": "1.0.0",
  "main": "src/main.js",
  "dependencies": {
    "electron": "^28.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "fabric": "^5.3.0",
    "yjs": "^13.6.0",
    "socket.io-client": "^4.6.0",
    "playwright": "^1.40.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "electron-builder": "^24.9.0",
    "webpack": "^5.89.0",
    "@types/react": "^18.2.0"
  },
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "test": "jest",
    "extract": "node heady_extract.js",
    "merge": "node heady_merge.js"
  }
}
```

---

## PHASE 4: TESTING & VALIDATION

### Step 4.1: Unit Tests

**Test Extracted Components**
```javascript
// tests/extracted/electron_window.test.js
describe('Electron Window Management', () => {
  test('creates window with Sacred Geometry styling', async () => {
    const window = await createHeadyWindow({
      width: 1200,
      height: 800,
      theme: 'sacred-geometry'
    });
    
    expect(window.borderRadius).toBeGreaterThan(0);
    expect(window.hasContextVector).toBe(true);
  });
});
```

### Step 4.2: Integration Tests

**Test Component Interactions**
```javascript
// tests/integration/sync_canvas.test.js
describe('Sync Engine + Canvas Integration', () => {
  test('task updates sync across clients', async () => {
    const client1 = await createClient();
    const client2 = await createClient();
    
    // Client 1 creates task
    await client1.createTask({ title: 'Test Task' });
    
    // Wait for sync
    await wait(100);
    
    // Client 2 should see it
    const tasks = await client2.getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Test Task');
  });
});
```

### Step 4.3: Story Driver Validation

**Verify Narrative Generation**
```javascript
// tests/story_driver.test.js
describe('Story Driver Integration', () => {
  test('generates multi-angle narratives', async () => {
    const event = {
      type: 'task_created',
      data: { title: 'Build auth system' }
    };
    
    const story = await storyDriver.narrate(event);
    
    expect(story.technical).toContain('task_created');
    expect(story.business).toContain('auth system');
    expect(story.health).toMatch(/CALM|FLOW|STRESS|PANIC/);
  });
});
```

---

## PHASE 5: DEPLOYMENT

### Step 5.1: Build Configuration

**electron-builder.json**
```json
{
  "appId": "com.headysystems.companion",
  "productName": "Heady Companion",
  "directories": {
    "output": "dist"
  },
  "files": [
    "src/**/*",
    "extracted/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "win": {
    "target": ["nsis", "portable"],
    "icon": "assets/icon.ico"
  },
  "mac": {
    "target": ["dmg", "zip"],
    "icon": "assets/icon.icns",
    "category": "public.app-category.productivity"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "icon": "assets/icon.png",
    "category": "Utility"
  }
}
```

### Step 5.2: Automated Build

**Build Script**
```bash
#!/bin/bash
# heady_build.sh

echo "🎯 Starting Heady Companion build..."

# Step 1: Extract components
echo "📦 Extracting components..."
node heady_extract.js

# Step 2: Execute merge
echo "🔀 Merging codebases..."
node heady_merge.js

# Step 3: Run tests
echo "🧪 Running tests..."
npm test

# Step 4: Build for all platforms
echo "🏗️  Building distributables..."
npm run build

# Step 5: Generate story
echo "📖 Generating build story..."
node src/heady_story_driver.js --event build_complete --output build_story.md

echo "✅ Build complete! Artifacts in ./dist/"
```

### Step 5.3: Story-Driven Release Notes

**Auto-Generated from Story Driver**
```markdown
# Heady Companion v1.0.0 - Release Story

## The Technical Angle
Successfully merged Electron 28, YJS 13, and Fabric 5 into unified application.
- 47 components extracted and transformed
- 0 critical conflicts, 3 minor conflicts resolved
- 156 unit tests passing, 89% coverage
- Build time: 4m 32s

## The Business Angle
Heady Companion enables users to manage tasks 3x faster with AI assistance.
- Context-aware task suggestions reduce planning time by 60%
- Automatic documentation saves 2 hours per week
- Real-time collaboration supports distributed teams

## The Health Angle
System performed optimally during build process.
- CPU: Average 45%, peak 78%
- Memory: 2.1GB used, no leaks detected
- Build status: FLOW → CALM (no stress events)

**Next Chapter:** Phase 2 features (advanced automation, predictive AI)
```

---

## GOVERNANCE & AUDIT

### Merge Audit Trail

All merge operations logged to `lens_stream.json`:

```json
{
  "timestamp": "2026-02-02T21:45:00Z",
  "event": "COMPONENT_EXTRACTED",
  "context_vector": {
    "narrative_angles": {
      "technical": "Extracted window management from Electron",
      "business": "Enables multi-window task organization",
      "health": "Extraction completed in 234ms, CALM state"
    }
  },
  "metadata": {
    "source": "electron",
    "component": "window_management",
    "files": 12,
    "loc": 3456
  }
}
```

### Compliance Checklist

- [ ] All extracted code properly attributed (license compliance)
- [ ] Heady transformations applied consistently
- [ ] Context Vector logging on all components
- [ ] MCP integration hooks present
- [ ] Sacred Geometry styling applied to UI
- [ ] Story Driver narratives generated
- [ ] Tests passing (unit + integration)
- [ ] Build artifacts generated for all platforms

---

## SUCCESS METRICS

**Merge Quality**
- Component extraction success rate: Target 100%
- Conflict resolution time: < 2 hours per conflict
- Test coverage: > 80%

**Heady Integration**
- Context Vector completeness: 100% of events
- Story Driver narrative accuracy: > 90%
- MCP protocol success rate: > 95%

**Performance**
- Build time: < 10 minutes
- Application startup: < 3 seconds
- Memory footprint: < 500MB idle

---

**Status:** Ready for execution  
**Next Step:** Begin Phase 1 - Codebase Analysis
