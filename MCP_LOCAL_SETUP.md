# MCP Local Server Setup Guide

This guide explains how to set up and run local Model Context Protocol (MCP) servers for the Heady environment.

## Overview

The Heady MCP infrastructure consists of 8 servers that provide different capabilities:

| Server | Purpose | Tools Provided |
|--------|---------|----------------|
| **filesystem** | File operations | Read/write files, list directories |
| **sequential-thinking** | Reasoning chains | Container deployment reasoning |
| **memory** | State persistence | Store and retrieve persistent data |
| **fetch** | HTTP requests | Remote fetches, API calls |
| **postgres** | Database operations | SQL queries, database management |
| **git** | Version control | Git commands, repository operations |
| **puppeteer** | Browser automation | Headless browser testing, web scraping |
| **cloudflare** | CDN/DNS management | Cloudflare API operations |

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (optional, for postgres server)
- Git

### 1. Complete Setup and Test

Run the all-in-one script:

```bash
bash scripts/setup-and-test-mcp.sh
```

This script will:
1. Set up environment variables
2. Start all MCP servers
3. Verify server status
4. Test gateway connectivity
5. Run comprehensive server tests

### 2. Manual Setup

If you prefer to run steps individually:

#### Step 1: Setup Environment

```bash
bash scripts/setup-mcp-env.sh
```

This creates necessary directories and sets up environment variables.

#### Step 2: Start Servers

```bash
bash scripts/start-mcp-servers.sh
```

This starts all MCP servers in the background.

#### Step 3: Check Status

```bash
bash scripts/check-mcp-status.sh
```

Shows the status of all running servers.

#### Step 4: Test Servers

```bash
node scripts/test-mcp-servers.js
```

Runs comprehensive tests to verify server functionality.

#### Step 5: Connect Gateway

```bash
node scripts/mcp-gateway.js
```

Starts the MCP gateway sidecar that connects to all servers.

## Environment Variables

### Required Variables

```bash
# Database connection (for postgres server)
DATABASE_URL=postgresql://user:password@localhost:5432/heady

# Cloudflare API credentials (for cloudflare server)
COPILOT_MCP_CLOUDFLARE_API_TOKEN=your_token_here
COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# HuggingFace token (for model inference)
HF_TOKEN=hf_your_token_here

# Heady API key (auto-generated if not set)
HEADY_API_KEY=heady_dev_xxxxx
```

### Optional Variables

```bash
# Server configuration
PORT=3300
NODE_ENV=development

# MCP directories
MCP_SERVER_LOG_DIR=./logs/mcp
MCP_SERVER_DATA_DIR=./data/mcp
```

## File Locations

```
Heady/
├── scripts/
│   ├── setup-mcp-env.sh          # Environment setup
│   ├── start-mcp-servers.sh      # Start all servers
│   ├── stop-mcp-servers.sh       # Stop all servers
│   ├── check-mcp-status.sh       # Check server status
│   ├── mcp-gateway.js            # Gateway sidecar
│   ├── test-mcp-servers.js       # Server tests
│   └── setup-and-test-mcp.sh     # Complete setup
├── logs/
│   └── mcp/                      # Server log files
├── data/
│   └── mcp/                      # Server data files
└── tmp/
    ├── mcp-pids/                 # Server PID files
    └── mcp-env.sh                # Exported environment variables
```

## Server Details

### Filesystem Server

**Capabilities:**
- Read and write files
- List directory contents
- File system operations

**Test Command:**
```bash
# The server uses the project root and /tmp as allowed paths
cat package.json  # Accessible via server
```

### Postgres Server

**Capabilities:**
- Execute SQL queries
- Database management
- Transaction support

**Requirements:**
- PostgreSQL must be running
- DATABASE_URL must be configured

**Test Command:**
```bash
psql "$DATABASE_URL" -c "SELECT version();"
```

### Sequential-Thinking Server

**Capabilities:**
- Reasoning about deployment strategies
- Container orchestration logic
- Multi-step planning

### Memory Server

**Capabilities:**
- Persistent key-value storage
- State management
- Session persistence

### Fetch Server

**Capabilities:**
- HTTP/HTTPS requests
- API interactions
- Web content retrieval

### Git Server

**Capabilities:**
- Git repository operations
- Commit history access
- Branch management

**Test Command:**
```bash
git status
git log -n 5
```

### Puppeteer Server

**Capabilities:**
- Headless browser automation
- Web page testing
- Screenshot capture
- Form automation

### Cloudflare Server

**Capabilities:**
- DNS management
- CDN operations
- Zone configuration
- Analytics access

**Requirements:**
- COPILOT_MCP_CLOUDFLARE_API_TOKEN
- COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID

## Usage Examples

### Starting Servers

```bash
# Start all servers
bash scripts/start-mcp-servers.sh

# Check what's running
bash scripts/check-mcp-status.sh

# View logs for a specific server
tail -f logs/mcp/filesystem.log
```

### Stopping Servers

```bash
# Stop all servers gracefully
bash scripts/stop-mcp-servers.sh
```

### Gateway Connection

```bash
# Start the gateway (connects to all servers)
node scripts/mcp-gateway.js

# The gateway will:
# - Connect to all running MCP servers
# - Monitor connection health
# - Provide unified client interface
# Press Ctrl+C to stop the gateway
```

### Testing

```bash
# Run all tests
node scripts/test-mcp-servers.js

# The test suite verifies:
# - Server connectivity
# - Tool availability
# - Basic operations for each server
```

## Troubleshooting

### Server Won't Start

1. Check if the port is already in use
2. Review server logs: `tail -f logs/mcp/<server-name>.log`
3. Ensure all dependencies are installed: `npm install`
4. Check environment variables are set correctly

### Connection Failures

1. Verify server is running: `bash scripts/check-mcp-status.sh`
2. Check PID files exist: `ls -la tmp/mcp-pids/`
3. Review server logs for errors

### Postgres Server Issues

1. Ensure PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL is correct
3. Test connection: `psql "$DATABASE_URL" -c "SELECT 1;"`

### Cloudflare Server Issues

1. Verify API credentials are set
2. Check token permissions
3. Review Cloudflare API status

### Memory Issues

If servers crash due to memory:

1. Stop all servers: `bash scripts/stop-mcp-servers.sh`
2. Clear logs and data: `rm -rf logs/mcp/* data/mcp/*`
3. Restart: `bash scripts/start-mcp-servers.sh`

## Development

### Adding a New MCP Server

1. Add server configuration to `mcp_config.json`:
```json
{
  "mcpServers": {
    "new-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-new"]
    }
  }
}
```

2. Update `start-mcp-servers.sh` to include the new server
3. Add tests in `test-mcp-servers.js`
4. Update this documentation

### Debugging

Enable verbose logging:

```bash
# Set log level
export HEADY_LOG_LEVEL=debug

# Start servers
bash scripts/start-mcp-servers.sh

# Monitor all logs
tail -f logs/mcp/*.log
```

## Integration with Heady Manager

The MCP servers integrate with the main Heady manager (`heady-manager.js`):

```javascript
// In your application code
const { MCPGateway } = require('./scripts/mcp-gateway.js');

const gateway = new MCPGateway();
await gateway.loadConfig();
await gateway.connectAll();

// Use a specific server
const fsClient = gateway.getClient('filesystem');
// ... perform operations
```

## Security Considerations

1. **Never commit secrets** - Keep `.env` file out of version control
2. **Use strong API keys** - Especially for production deployments
3. **Limit filesystem access** - Filesystem server only accesses specified paths
4. **Database credentials** - Use secure passwords and limit access
5. **API tokens** - Rotate regularly and use minimal required permissions

## Performance

- **Concurrent Requests**: Up to 10 concurrent MCP requests by default
- **Timeout**: 30 seconds per request (configurable)
- **Resource Usage**: Each server runs as a separate Node.js process
- **Scaling**: Consider Docker deployment for production

## Production Deployment

For production, consider using Docker:

```bash
# Use docker-compose for MCP servers
docker-compose -f docker-compose.mcp.yml up -d

# Or use Render.com deployment (configured in render.yaml)
```

See `DOCKER_MCP_README.md` for Docker-specific documentation.

## Additional Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Heady Documentation](./README.md)
- [Docker MCP Guide](./DOCKER_MCP_README.md)
- [Admin UI Guide](./ADMIN_UI_GUIDE.md)

## Support

For issues or questions:
1. Check server logs: `tail -f logs/mcp/*.log`
2. Run diagnostics: `bash scripts/check-mcp-status.sh`
3. Review this documentation
4. Check GitHub issues: https://github.com/HeadyMe/Heady/issues
