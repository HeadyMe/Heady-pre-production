# HEADY AI COMPANION - Desktop Application Specification

**Version:** 1.0.0  
**Status:** Design Phase  
**Target Platforms:** Windows, macOS, Linux  
**Core Technologies:** Electron, React, Playwright, MCP Protocol

---

## EXECUTIVE SUMMARY

The Heady AI Companion is a **headless browser-based AI task management overlay** that sits on top of your desktop, intelligently tracking work across all applications, providing context-aware assistance, and managing tasks using the Heady Story Driver Protocol.

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│              HEADY AI COMPANION SHELL                    │
│  (Electron - Chromium Engine + Node.js Runtime)         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │  Sacred Geometry │  │   Heady Story Driver         │ │
│  │  UI Layer        │  │   (Narrative Engine)         │ │
│  │  (React+Canvas)  │  │                              │ │
│  └─────────────────┘  └──────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │  Headless        │  │   MCP Client                 │ │
│  │  Browser Engine  │  │   (HeadyManager Integration) │ │
│  │  (Playwright)    │  │                              │ │
│  └─────────────────┘  └──────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │  Real-time Sync  │  │   Context Vector Engine      │ │
│  │  (Socket.io)     │  │   (Multi-angle Logging)      │ │
│  └─────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## CORE FEATURES

### 1. INTELLIGENT BROWSER OVERLAY

**Transparent Always-On-Top Layer**
- Sits above all applications without blocking interaction
- Configurable opacity (10-90%)
- Sacred Geometry visual design (rounded, organic shapes)

**Context Detection**
- Monitors active window/application
- Detects URLs in browsers
- Reads clipboard for context clues
- Analyzes file paths in editors

**Smart Capture**
- Auto-screenshot on significant events
- Text selection → automatic task creation
- Form data extraction for documentation
- Code snippet capture with syntax highlighting

**Headless Automation**
- Background browser runs checks without UI
- Automated scraping of dashboards/portals
- Regression testing of web workflows
- Change detection and alerting

### 2. AI TASK HELPER

**Natural Language Task Creation**
```
User: "Build the user auth flow"
AI: Created task with subtasks:
  ├─ Design login UI
  ├─ Implement OAuth2 backend
  ├─ Add session management
  └─ Write integration tests
```

**Context-Aware Suggestions**
- Sees current work (file, URL, clipboard)
- Suggests next logical steps
- Identifies blockers and dependencies
- Recommends relevant documentation

**Automatic Documentation**
- Generates protocol entries from actions
- Creates changelog from commits
- Builds API docs from code
- Produces user guides from workflows

**Story Narration**
- Describes work session in three angles:
  - **Technical:** "Implemented OAuth2 flow, fixed 3 bugs"
  - **Business:** "User login 40% faster, reducing churn"
  - **Health:** "System stable, CPU 45%, no errors"

### 3. VISUAL TASK MANAGEMENT

**Canvas-Based Board**
- Infinite canvas (zoom/pan)
- Drag-and-drop task organization
- Visual connections between related tasks
- Sacred Geometry node representation

**Fractal Task Hierarchy**
```
Project
├─ Epic
│  ├─ Feature
│  │  ├─ Task
│  │  │  ├─ Subtask
│  │  │  │  └─ Micro-task (infinite depth)
```

**Real-Time Collaboration**
- Multi-user editing
- Cursor presence indicators
- Live updates across devices
- Conflict resolution

**Sacred Geometry Nodes**
- Tasks as organic, breathing shapes
- Color indicates health/status
- Size reflects complexity/priority
- Connections show dependencies

### 4. HEADY ECOSYSTEM INTEGRATION

**MCP Protocol Connection**
```javascript
// Connect to HeadyManager
const mcp = new MCPClient('http://localhost:3300');

// Submit task to HeadyHive
await mcp.submitTask({
  instruction: "Implement user authentication",
  priority: "high",
  context: currentContext
});

// Query HeadyAcademy agents
const docs = await mcp.queryAgent('ATLAS', {
  topic: 'OAuth2 best practices'
});
```

**Governance Logging**
- All actions → `lens_stream.json`
- Context Vector for every event
- Audit trail with narrative angles
- Compliance-ready documentation

**Smart Cache**
- Balances precision vs. performance
- Adapts based on system health
- Context-aware caching strategy
- Automatic cache invalidation

**Checkpoint System**
- Auto-saves state every 15 minutes
- Generates story summaries
- Enables session resume
- Tracks progress over time

---

## TECHNICAL SPECIFICATIONS

### Technology Stack

**Frontend**
- Electron 28+ (Chromium 120+)
- React 18+ with Hooks
- Canvas API for visual rendering
- TailwindCSS for Sacred Geometry styling

**Backend Services**
- Node.js 20+ LTS
- Playwright for headless browser
- Socket.io for real-time sync
- SQLite for local data storage

**Integration**
- MCP Protocol client
- HeadyManager REST API
- Git integration (libgit2)
- File system watchers

### Data Structures

**Context Vector**
```typescript
interface ContextVector {
  event_id: string;
  timestamp: string;
  source_component: string;
  raw_data: {
    log_level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    payload?: any;
  };
  narrative_angles: {
    technical: TechnicalAngle;
    business: BusinessAngle;
    health: HealthAngle;
  };
  story_meta: {
    chapter: string;
    role: 'PROTAGONIST' | 'ANTAGONIST' | 'SUPPORT';
    narrative_beat: 'INCITING_INCIDENT' | 'RISING_ACTION' | 'CLIMAX' | 'RESOLUTION';
  };
}
```

**Task Node**
```typescript
interface TaskNode {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: ContextVector[];
  children: TaskNode[];
  position: { x: number; y: number };
  geometry: SacredGeometry;
}
```

---

## USER EXPERIENCE FLOWS

### Morning Startup

1. **App launches** → Sacred Geometry dashboard appears
2. **AI reads checkpoint:** "You were building auth. System was stressed (CPU 85%). Continue?"
3. **User clicks "Yes"** → Restores browser tabs, editor state, task board
4. **Overlay activates** → Transparent layer ready for context capture

### During Work

1. **User opens GitHub** → Overlay detects, shows relevant tasks
2. **User selects code** → AI: "This is the login handler. Create error handling task?"
3. **User says "Yes"** → Task auto-created with context (file, line, screenshot)
4. **Background automation** → Headless browser checks CI/CD every 30 min

### Evening Wrap-Up

1. **App generates story:**
   - Technical: "Implemented OAuth2, fixed 3 bugs, deployed staging"
   - Business: "Login 40% faster, churn risk reduced"
   - Health: "System stable, CPU 45%, no critical errors"
2. **Checkpoint saved** → `checkpoints/2026-02-02.json`
3. **Tomorrow's plan** → AI suggests next tasks based on patterns

---

## INTELLIGENT SQUASH MERGE STRATEGY

### Source Codebases

1. **Chromium (via Electron)**
   - Desktop shell and window management
   - IPC (Inter-Process Communication)
   - Native OS integration
   - Hardware acceleration

2. **Comet (Conceptual)**
   - Real-time sync engine
   - Conflict resolution algorithms
   - Operational transforms
   - Presence awareness

3. **Canva Desktop (Conceptual)**
   - Canvas-based rendering
   - Drag-and-drop interactions
   - Visual editor framework
   - Export/import workflows

### Merge Process

**Phase 1: Component Extraction**
```bash
# Extract reusable modules
hb extract --source chromium --components "window-management,ipc,native-apis"
hb extract --source comet --components "sync-engine,conflict-resolution"
hb extract --source canva --components "canvas-renderer,drag-drop,visual-editor"
```

**Phase 2: Heady Transformation**
- Replace rectangular UI → Sacred Geometry (organic shapes)
- Wrap rendering → Story Driver (log every action)
- Extend sync → MCP protocol integration
- Add Context Vector to all events

**Phase 3: Automated Build**
```bash
# Heady Hybrid Build
hb build --mode hybrid \
  --sources chromium,comet,canva \
  --output HeadyCompanion \
  --features story-driver,mcp-integration,sacred-geometry
```

**Build Process:**
1. **Architect** analyzes codebases, identifies modules
2. **Optimizer** suggests merge strategy via Socratic Protocol
3. **Conductor** orchestrates Docker builds, runs tests
4. **Story Driver** narrates build process in real-time

---

## DEVELOPMENT ROADMAP

### Phase 1: Foundation (Weeks 1-4)
- [ ] Electron shell with basic window management
- [ ] React UI with Sacred Geometry components
- [ ] Playwright headless browser integration
- [ ] Basic MCP client connection

### Phase 2: Core Features (Weeks 5-8)
- [ ] Context detection and capture
- [ ] Task management canvas
- [ ] Story Driver narrative engine
- [ ] Checkpoint system integration

### Phase 3: Intelligence (Weeks 9-12)
- [ ] AI task suggestions
- [ ] Automated documentation generation
- [ ] Smart cache implementation
- [ ] Real-time collaboration

### Phase 4: Polish (Weeks 13-16)
- [ ] Performance optimization
- [ ] Sacred Geometry animations
- [ ] Advanced automation workflows
- [ ] User testing and refinement

---

## CONFIGURATION

### Environment Variables

```bash
# HeadyManager Connection
HEADY_MANAGER_URL=http://localhost:3300
HEADY_API_KEY=your-api-key

# MCP Configuration
MCP_ORCHESTRATOR_URL=http://localhost:3100
MCP_TIMEOUT=30000

# Story Driver
STORY_DRIVER_ENABLED=true
NARRATIVE_ANGLES=technical,business,health

# Headless Browser
HEADLESS_BROWSER_ENABLED=true
AUTOMATION_INTERVAL=1800000  # 30 minutes

# UI Preferences
SACRED_GEOMETRY_THEME=organic
OVERLAY_OPACITY=0.85
CANVAS_ZOOM_LEVEL=1.0
```

### User Preferences

```json
{
  "ui": {
    "theme": "sacred-geometry-dark",
    "overlayOpacity": 0.85,
    "alwaysOnTop": true,
    "hotkey": "Ctrl+Shift+H"
  },
  "ai": {
    "autoSuggest": true,
    "narrativeStyle": "balanced",
    "contextDepth": "deep"
  },
  "automation": {
    "headlessBrowser": true,
    "checkInterval": 1800000,
    "autoCapture": true
  }
}
```

---

## SECURITY & PRIVACY

**Data Storage**
- All data encrypted at rest (AES-256)
- Local-first architecture
- Optional cloud sync (end-to-end encrypted)

**Permissions**
- Screen capture requires explicit user consent
- Clipboard access opt-in
- Network requests logged and auditable

**Compliance**
- GDPR-compliant data handling
- User data deletion on request
- Audit trail for all actions

---

## SUCCESS METRICS

**User Productivity**
- Time to complete tasks (baseline vs. with Companion)
- Number of context switches reduced
- Documentation generation time saved

**System Health**
- Story Driver narrative accuracy
- Context Vector completeness
- Checkpoint reliability

**Integration Quality**
- MCP protocol success rate
- HeadyManager API response times
- Real-time sync latency

---

**Status:** Ready for implementation  
**Next Step:** Begin Phase 1 development with Electron shell
