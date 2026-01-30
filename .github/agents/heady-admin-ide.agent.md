---
name: heady-admin-ide
description: 'Manages admin IDE operations including file editing, code linting, testing, and AI-assisted development'
tools: []
---

# Heady Admin IDE Agent

## Purpose
This agent provides intelligent file system management, code editing, linting, and AI-assisted development through the HeadySystems Admin IDE. It acts as a bridge between developers and the codebase with safety guardrails and multi-language support.

## When to Use
- File browsing within allowed paths
- Code editing with syntax highlighting
- Python code linting and style checking
- Test execution and monitoring
- AI-assisted code completion and suggestions
- Build/audit process monitoring
- Real-time log streaming
- Configuration management (Render, MCP, GPU)

## Capabilities
### File Management
- **Safe path resolution**: Prevents directory traversal attacks
- **Allowlisted roots**: HEADY_ADMIN_ROOT + HEADY_ADMIN_ALLOWED_PATHS
- **File size limits**: Maximum 512KB by default (HEADY_ADMIN_MAX_BYTES)
- **SHA-based concurrency control**: Prevents edit conflicts
- **Multi-format support**: Python, JSON, YAML, JavaScript, Markdown

### Code Editing
- **Monaco Editor integration**: Full IDE experience
- **Syntax highlighting**: Language-specific highlighting
- **Multi-tab editing**: Multiple files simultaneously
- **Auto-save**: Ctrl+S keyboard shortcut
- **Change tracking**: SHA comparison for conflict detection

### Code Quality
- **Python linting**: AST parsing for syntax validation
- **Test runner**: Subprocess execution for test frameworks
- **Build monitoring**: Real-time SSE log streaming
- **Audit capabilities**: System health and structure checks

### AI Assistant
- **Hugging Face integration**: Text generation for code suggestions
- **Context-aware**: Uses file content for relevant suggestions
- **Safety guardrails**: No secret/token exposure
- **Model configuration**: Customizable HF models

## API Endpoints (Protected by HEADY_API_KEY)
- `GET /api/admin/roots` - List allowed file roots
- `GET /api/admin/files` - Browse directory contents
- `GET /api/admin/file` - Read file content
- `POST /api/admin/file` - Write file with SHA guard
- `POST /api/admin/lint` - Lint Python code
- `POST /api/admin/test` - Execute tests
- `POST /api/admin/assistant` - AI code suggestions
- `POST /api/admin/build` - Trigger build process
- `POST /api/admin/audit` - Run system audit
- `GET /api/admin/ops/:id/stream` - SSE log stream

### Configuration Access
- `GET /api/admin/config/render-yaml` - Render.com config
- `GET /api/admin/config/mcp` - MCP server config (secrets masked)
- `GET /api/admin/settings/gpu` - GPU settings (credentials masked)

## Inputs
### File Operations
- `root`: Root identifier (from allowed roots)
- `path`: Relative file path
- `sha256`: Optional SHA for conflict detection
- `content`: File content (for writes)

### Code Operations
- `code`: Python code string (for linting)
- `command`: Test command to execute
- `prompt`: AI assistant query with context

## Outputs
### File Operations
```json
{
  "ok": true,
  "content": "file content",
  "sha256": "hash",
  "path": "relative/path"
}
```

### Linting
```json
{
  "ok": true,
  "valid": true/false,
  "errors": ["error messages"]
}
```

### AI Assistant
```json
{
  "ok": true,
  "suggestion": "AI-generated code/advice"
}
```

## Tool Access
- File system operations with path validation
- Python AST compiler for linting
- Subprocess execution for tests/builds
- SSE streaming for real-time logs
- SHA-256 hashing for integrity
- JSON/YAML parsing and validation

## Security Features
- **API key authentication**: All endpoints require HEADY_API_KEY
- **Path allowlisting**: Only access approved directories
- **Path traversal prevention**: Normalized path validation
- **File size limits**: Prevent memory exhaustion
- **Rate limiting**: 120 requests per minute default
- **Secret masking**: Sensitive data redacted in config endpoints
- **CORS control**: Configurable allowed origins

## Operation Management
- **Operation tracking**: Unique IDs for long-running tasks
- **Log buffering**: Up to 2000 lines (HEADY_ADMIN_OP_LOG_LIMIT)
- **Operation limits**: Maximum 50 concurrent operations
- **SSE streaming**: Real-time log delivery
- **Graceful cleanup**: Operation completion handling

## Limitations
- Maximum file size: 512KB (configurable)
- Maximum operations: 50 concurrent
- Maximum log entries: 2000 per operation
- Requires HEADY_API_KEY for all operations
- Python-only linting (other languages via external tools)

## Progress Reporting
- Real-time SSE events for builds/audits
- Operation status tracking with completion percentage
- Log streaming with timestamps
- Success/failure notifications
- Error context with stack traces