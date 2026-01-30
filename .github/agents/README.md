# Custom GitHub Copilot Agents for HeadySystems

This directory contains custom GitHub Copilot agents that provide specialized expertise for the HeadyMe/Heady repository.

## Available Agents

### 1. Python & Node.js Code Specialist
**File**: `python-nodejs-specialist.agent.md`  
**Name**: `python-nodejs-specialist`  
**Purpose**: Expert in Python and Node.js development for the hybrid HeadySystems architecture

**Use when you need to**:
- Add or modify Python worker code
- Update Node.js API endpoints
- Implement features in the hybrid architecture
- Fix bugs in Python or Node.js code
- Optimize performance
- Integrate new libraries or services

**Tools**: read, edit, search, execute

---

### 2. Documentation Specialist
**File**: `documentation-specialist.agent.md`  
**Name**: `documentation-specialist`  
**Purpose**: Expert in creating documentation using the Quiz & Flashcard methodology

**Use when you need to**:
- Document new features or APIs
- Create setup guides or tutorials
- Generate architecture documentation
- Write user guides or admin manuals
- Update documentation to Quiz & Flashcard format
- Explain complex concepts in digestible chunks

**Tools**: read, edit, search

**Special Feature**: Uses the critical Quiz & Flashcard methodology for all documentation

---

### 3. Build & Deployment Specialist
**File**: `build-deployment-specialist.agent.md`  
**Name**: `build-deployment-specialist`  
**Purpose**: Expert in build processes, Docker, and Render.com deployment

**Use when you need to**:
- Update build processes or scripts
- Modify Docker configurations
- Change Render.com deployment settings
- Add or update environment variables
- Fix build or deployment failures
- Configure new MCP servers
- Update CI/CD workflows

**Tools**: read, edit, search, execute

---

### 4. Security & Audit Specialist
**File**: `security-audit-specialist.agent.md`  
**Name**: `security-audit-specialist`  
**Purpose**: Expert in security auditing, vulnerability fixes, and compliance

**Use when you need to**:
- Run security audits on the codebase
- Fix npm or pip security vulnerabilities
- Review code for security issues
- Implement security best practices
- Configure security scanning workflows
- Respond to security vulnerability reports
- Set up secrets management
- Harden API endpoints or database access

**Tools**: read, edit, search, execute

**Specialty**: Comprehensive security scanning and vulnerability remediation

---

### 5. Admin UI Specialist
**File**: `admin-ui-specialist.agent.md`  
**Name**: `admin-ui-specialist`  
**Purpose**: Expert in React admin UI, Monaco editor, and Sacred Geometry design

**Use when you need to**:
- Add or modify React components in the Admin UI
- Integrate features with Monaco Editor
- Implement Sacred Geometry design patterns
- Create new admin panels or settings
- Fix UI bugs or improve UX
- Add real-time features with SSE
- Improve accessibility

**Tools**: read, edit, search, execute

**Special Feature**: Maintains Sacred Geometry aesthetic principles

---

### 6. MCP Integration Specialist
**File**: `mcp-integration-specialist.agent.md` (formerly my-agent.agent.md)  
**Name**: `mcp-integration-specialist`  
**Purpose**: Expert in Model Context Protocol (MCP) server configuration

**Use when you need to**:
- Add new MCP servers to the project
- Configure MCP server tools for custom agents
- Troubleshoot MCP connectivity issues
- Update MCP server configurations
- Manage MCP secrets and environment variables
- Migrate MCP configs between environments

**Tools**: read, edit, search, execute

---

### 7. HeadySystems Copilot Instructor
**File**: `heady-copilot-instructor.agent.md` (formerly copilot-insturctions.agent.md)  
**Name**: `heady-copilot-instructor`  
**Purpose**: Expert instructor that teaches about HeadySystems architecture

**Use when you need to**:
- Understand the HeadySystems architecture
- Learn project conventions and patterns
- Get oriented in the codebase
- Find the right specialist agent for a task
- Learn the documentation methodology

**Tools**: read, search

---

## How to Use These Agents

### In GitHub Copilot Chat

When working in your IDE with GitHub Copilot, you can invoke these agents by name:

```
@python-nodejs-specialist Please add a new API endpoint for user authentication
```

```
@documentation-specialist Create API documentation for the /api/admin endpoints
```

```
@build-deployment-specialist Update the Dockerfile to use Node 20
```

### In GitHub Issues and Pull Requests

You can mention agents in comments to get specialized help:

```
@github-copilot please use the security-audit-specialist to fix all vulnerabilities
```

### Choosing the Right Agent

1. **Code Changes** → `python-nodejs-specialist`
2. **Documentation** → `documentation-specialist`
3. **Build/Deploy** → `build-deployment-specialist`
4. **Security** → `security-audit-specialist`
5. **UI/Frontend** → `admin-ui-specialist`
6. **MCP Config** → `mcp-integration-specialist`
7. **Learning** → `heady-copilot-instructor`

## Agent File Format

All agents follow the GitHub Copilot custom agent format:

```markdown
---
name: agent-name
description: Brief description
tools: ["read", "edit", "search", "execute"]
---

# Agent Title

Agent instructions and expertise...
```

### YAML Frontmatter Properties

- **name**: Unique identifier for the agent (kebab-case)
- **description**: One-line summary of agent's purpose
- **tools**: Array of tool names the agent can use
  - `read`: View files and directories
  - `edit`: Modify file contents
  - `search`: Search code and files (grep, glob)
  - `execute`: Run shell commands
  - `*`: All available tools

## Adding New Agents

To create a new custom agent:

1. Create a new file: `.github/agents/my-new-agent.agent.md`
2. Add YAML frontmatter with name, description, and tools
3. Write detailed instructions for the agent
4. Commit to the main branch to make it available
5. Update this README with the new agent

## Tool Aliases

Agents can use these tool aliases:
- `read` → View files
- `edit` → Modify files
- `search` → Grep and Glob
- `execute` → Bash, PowerShell
- `agent` → Invoke other custom agents

## Best Practices

1. **Be Specific**: Give agents clear, focused expertise areas
2. **Provide Context**: Include relevant technical details and constraints
3. **Set Boundaries**: Define what the agent should and shouldn't do
4. **Use Examples**: Show common use cases and outputs
5. **Keep Updated**: Update agents as the codebase evolves

## Documentation

For more information about custom agents:
- [GitHub Copilot Custom Agents Documentation](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/custom-agents-configuration)
- [Extending Coding Agent with MCP](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)
- [Copilot Setup Guide](../.github/COPILOT_SETUP.md)
- [Copilot Instructions](../.github/copilot-instructions.md)

## Testing Agents

To test agents locally, you can use the GitHub Copilot CLI (if available):

```bash
# Test agent configuration
gh copilot agent test .github/agents/python-nodejs-specialist.agent.md
```

Or test by invoking them in Copilot Chat within your IDE.

## Troubleshooting

### Agent Not Appearing
- Ensure the file has `.agent.md` extension
- Verify YAML frontmatter is properly formatted
- Commit changes to the main/default branch
- Wait a few minutes for GitHub to process

### Agent Not Working as Expected
- Review the agent's instructions for clarity
- Check that tools are properly specified
- Ensure the agent has access to needed MCP servers
- Update the agent's knowledge with current codebase info

## Contributing

To improve existing agents or add new ones:
1. Create a feature branch
2. Modify or create agent files
3. Test the agent configuration
4. Submit a pull request
5. Update this README

---

**Last Updated**: 2026-01-30  
**Maintainer**: HeadyMe  
**Repository**: HeadyMe/Heady
