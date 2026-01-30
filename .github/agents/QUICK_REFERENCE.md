# Custom Agents Quick Reference

Quick reference for choosing and using the right custom GitHub Copilot agent.

## Agent Selection Guide

| Task Type | Agent | Example Usage |
|-----------|-------|---------------|
| Add/Fix Python code | `python-nodejs-specialist` | `@python-nodejs-specialist add error handling to process_data.py` |
| Add/Fix Node.js code | `python-nodejs-specialist` | `@python-nodejs-specialist create new API endpoint for user auth` |
| Create docs | `documentation-specialist` | `@documentation-specialist document the Admin API endpoints` |
| Update README | `documentation-specialist` | `@documentation-specialist create setup guide using Quiz methodology` |
| Fix build errors | `build-deployment-specialist` | `@build-deployment-specialist fix the consolidated_builder.py errors` |
| Update Dockerfile | `build-deployment-specialist` | `@build-deployment-specialist optimize Docker image size` |
| Deploy to Render | `build-deployment-specialist` | `@build-deployment-specialist update render.yaml for new worker` |
| Security scan | `security-audit-specialist` | `@security-audit-specialist run security audit and fix vulnerabilities` |
| Fix npm vulnerabilities | `security-audit-specialist` | `@security-audit-specialist fix all npm audit issues` |
| Add UI component | `admin-ui-specialist` | `@admin-ui-specialist add new settings panel to Admin UI` |
| Update Monaco editor | `admin-ui-specialist` | `@admin-ui-specialist configure syntax highlighting for YAML` |
| Sacred Geometry design | `admin-ui-specialist` | `@admin-ui-specialist apply Sacred Geometry theme to dashboard` |
| Configure MCP server | `mcp-integration-specialist` | `@mcp-integration-specialist add new MCP server for Sentry` |
| MCP troubleshooting | `mcp-integration-specialist` | `@mcp-integration-specialist debug postgres MCP connection` |
| Learn architecture | `heady-copilot-instructor` | `@heady-copilot-instructor explain the hybrid Node.js/Python architecture` |
| Find code patterns | `heady-copilot-instructor` | `@heady-copilot-instructor show me how to add new API endpoints` |

## Agent Capabilities

### 🐍 Python & Node.js Specialist
**Tools**: read, edit, search, execute  
**Best for**: Code development in Python and Node.js  
**Expertise**:
- Python workers (src/*.py)
- Node.js API endpoints (heady-manager.js)
- Hugging Face integrations
- PostgreSQL database operations
- Code optimization

### 📚 Documentation Specialist
**Tools**: read, edit, search  
**Best for**: Creating documentation  
**Expertise**:
- Quiz & Flashcard methodology (CRITICAL)
- API documentation
- Setup guides
- Architecture docs
- Code comments

### 🚀 Build & Deployment Specialist
**Tools**: read, edit, search, execute  
**Best for**: Build and deployment tasks  
**Expertise**:
- consolidated_builder.py
- Docker configuration
- render.yaml deployment
- CI/CD workflows
- Environment variables

### 🔒 Security & Audit Specialist
**Tools**: read, edit, search, execute  
**Best for**: Security and compliance  
**Expertise**:
- npm audit / pip security scans
- CodeQL analysis
- Vulnerability fixes
- Secrets management
- Security best practices

### 🎨 Admin UI Specialist
**Tools**: read, edit, search, execute  
**Best for**: Frontend development  
**Expertise**:
- React components
- Monaco Editor
- Sacred Geometry design
- SSE real-time updates
- AI assistant panel

### 🔌 MCP Integration Specialist
**Tools**: read, edit, search, execute  
**Best for**: MCP server configuration  
**Expertise**:
- mcp_config.json
- copilot-mcp-config.json
- MCP server setup
- Secret management (COPILOT_MCP_*)
- Tool configuration

### 🎓 HeadySystems Copilot Instructor
**Tools**: read, search  
**Best for**: Learning and guidance  
**Expertise**:
- Architecture overview
- Code conventions
- Best practices
- Finding the right agent
- Project orientation

## Usage Patterns

### In GitHub Issues/PRs
```
@github-copilot please use the security-audit-specialist to fix npm vulnerabilities
```

### In IDE Copilot Chat
```
@python-nodejs-specialist add input validation to the /api/admin/file endpoint
```

### Chaining Agents
```
@documentation-specialist create docs for the new feature that 
@python-nodejs-specialist just implemented
```

## Agent Files Location

All agent definitions are in `.github/agents/`:
- `python-nodejs-specialist.agent.md`
- `documentation-specialist.agent.md`
- `build-deployment-specialist.agent.md`
- `security-audit-specialist.agent.md`
- `admin-ui-specialist.agent.md`
- `mcp-integration-specialist.agent.md`
- `heady-copilot-instructor.agent.md`

## Tips

1. **Be Specific**: Tell the agent exactly what you want
2. **Use Context**: Provide relevant file paths and details
3. **One Task**: Keep requests focused on one task per agent
4. **Chain When Needed**: Use multiple agents for complex workflows
5. **Review Changes**: Always review what the agent produces

## Documentation

For detailed information about each agent, see:
- [.github/agents/README.md](.github/agents/README.md) - Full agent documentation
- [.github/COPILOT_SETUP.md](.github/COPILOT_SETUP.md) - Copilot setup guide
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - Project overview

---
**Last Updated**: 2026-01-30  
**Repository**: HeadyMe/Heady
