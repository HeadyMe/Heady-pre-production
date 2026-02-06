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
<!-- ║  FILE: .windsurf/CASCADE_HEADY_INTEGRATION.md                     ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

# CASCADE-HEADY INTEGRATION

## Overview

All Cascade interactions are now automatically routed through Heady services using **Cascade Hooks** - Windsurf's native interception mechanism.

## Architecture

```
User Input
    ↓
Cascade (Windsurf AI)
    ↓
[pre_user_prompt Hook]
    ↓
cascade-heady-proxy.py
    ↓
heady-manager.js (localhost:3300)
    ↓
HeadyConductor.orchestrate()
    ↓
HeadyBrain.execute_with_context()
    ↓
AI Nodes (JULES, OBSERVER, PYTHIA, etc.)
    ↓
[Response enriched with Heady intelligence]
    ↓
Cascade continues with context
    ↓
[post_cascade_response Hook]
    ↓
cascade-response-logger.py
    ↓
HeadyMemory (stores for learning)
```

## Components

### 1. Cascade Hooks Configuration
**File:** `.windsurf/hooks.json`

Configures two hooks:
- `pre_user_prompt`: Intercepts every user message BEFORE Cascade processes it
- `post_cascade_response`: Logs Cascade responses to HeadyMemory for learning

### 2. Proxy Script
**File:** `.windsurf/cascade-heady-proxy.py`

- Reads user prompt from hook input (JSON via stdin)
- Checks if heady-manager is healthy
- Routes to `/api/conductor/orchestrate` endpoint
- Returns orchestration summary to Cascade
- **Graceful degradation**: If Heady services are down, allows Cascade to continue

### 3. Response Logger
**File:** `.windsurf/cascade-response-logger.py`

- Captures Cascade responses
- Stores in HeadyMemory for context preservation
- Enables learning from conversation patterns

## How It Works

### Based on Research

This implementation follows best practices from:

1. **Windsurf Cascade Hooks** (Official Documentation)
   - Native interception mechanism
   - Pre/post action hooks
   - JSON-based context passing

2. **MCP Proxy Patterns** (TrueFoundry, Enterprise MCP)
   - Centralized orchestration gateway
   - Authentication/authorization layer
   - Tool namespace management
   - Graceful fallback handling

3. **HeadyConductor Architecture** (Existing Heady System)
   - Already designed for request orchestration
   - HeadyBrain.execute_with_context() provides full context
   - AI Node invocation and workflow execution

### Execution Flow

1. **User sends message** → Cascade receives it
2. **pre_user_prompt hook fires** → Python script executes
3. **Script reads JSON from stdin** → Extracts user prompt
4. **Health check** → Verifies heady-manager:3300 is running
5. **POST to /api/conductor/orchestrate** → Routes to HeadyConductor
6. **HeadyConductor.orchestrate()** → Processes with HeadyBrain
7. **HeadyBrain.execute_with_context()** → Gathers full system context
8. **AI Nodes execute** → JULES, OBSERVER, PYTHIA analyze request
9. **Orchestration result returned** → Displayed in Cascade UI
10. **Hook exits with code 0** → Cascade continues with enriched context
11. **Cascade generates response** → Using Heady intelligence
12. **post_cascade_response hook fires** → Logs to HeadyMemory

## Configuration

### Prerequisites

1. **heady-manager must be running:**
   ```powershell
   node C:\Users\erich\Heady\heady-manager.js
   ```

2. **Python 3 with requests library:**
   ```powershell
   pip install requests
   ```

### Activation

Hooks are automatically loaded from `.windsurf/hooks.json` when Cascade starts.

**To verify hooks are active:**
- Send any message to Cascade
- Check `C:\Users\erich\Heady\.windsurf\cascade-proxy.log`
- You should see orchestration logs

### Logs

**Location:** `C:\Users\erich\Heady\.windsurf\cascade-proxy.log`

Contains:
- Hook trigger timestamps
- User prompts (truncated)
- HeadyConductor responses
- Health check status
- Error messages (if any)

## Testing

### 1. Verify heady-manager is running
```powershell
curl http://localhost:3300/api/health
```

Expected response:
```json
{"ok":true,"service":"heady-manager","version":"2.0.0"}
```

### 2. Send a test message to Cascade
Example: "What is the current system status?"

### 3. Check the log file
```powershell
Get-Content C:\Users\erich\Heady\.windsurf\cascade-proxy.log -Tail 20
```

You should see:
- Hook triggered: pre_user_prompt
- User prompt logged
- Routing to HeadyConductor
- HeadyConductor response with confidence scores

### 4. Verify orchestration in Cascade UI
Cascade should display:
```
================================================================================
∞ HEADY ORCHESTRATION COMPLETE ∞
================================================================================

Confidence: 85%
Nodes Invoked: 2
Workflows Executed: 1
Services Managed: 3

HeadyConductor has processed your request with optimal execution.
================================================================================
```

## Graceful Degradation

If heady-manager is not running:
- Health check fails
- Script logs "allowing direct Cascade processing"
- Hook exits with code 0 (success)
- Cascade continues normally without Heady orchestration

**This ensures Cascade is never blocked by Heady service issues.**

## Advantages Over MCP Server Approach

1. **Native Integration**: Uses Windsurf's built-in Cascade Hooks
2. **No MCP Protocol Overhead**: Direct HTTP API calls
3. **Transparent to Cascade**: Hooks are invisible to the AI
4. **Workspace-Specific**: Configuration travels with the project
5. **Graceful Fallback**: Never blocks Cascade functionality
6. **Full Observability**: Complete logging of all interactions
7. **Bidirectional**: Captures both prompts AND responses

## Maintenance

### Disable Integration
Rename or delete `.windsurf/hooks.json`

### Update Proxy Logic
Edit `.windsurf/cascade-heady-proxy.py`

### Change Heady Manager URL
Update `HEADY_MANAGER_URL` in both Python scripts

## Future Enhancements

1. **Async Processing**: Queue requests for background orchestration
2. **Caching Layer**: Cache orchestration results for similar prompts
3. **Multi-Model Routing**: Route to different AI nodes based on prompt type
4. **Context Injection**: Inject HeadyMemory context directly into Cascade prompts
5. **Workflow Automation**: Auto-execute workflows based on prompt patterns

## Troubleshooting

### Hook not firing
- Check `.windsurf/hooks.json` syntax
- Verify Python path in command
- Restart Windsurf IDE

### Health check failing
- Ensure heady-manager is running: `node heady-manager.js`
- Check port 3300 is not blocked
- Verify no firewall issues

### Orchestration timeout
- Increase `TIMEOUT` in cascade-heady-proxy.py
- Check HeadyConductor performance
- Review heady-manager logs

### Python errors
- Install requests: `pip install requests`
- Check Python 3 is in PATH
- Review cascade-proxy.log for stack traces

## Related Documentation

- **HeadyConductor**: `HeadyAcademy/HeadyConductor.py`
- **HeadyBrain**: `HeadyAcademy/HeadyBrain.py`
- **heady-manager API**: `heady-manager.js`
- **Cascade Hooks**: https://docs.windsurf.com/windsurf/cascade/hooks

---

**Status:** ✅ ACTIVE - All user interactions are now routed through Heady services
