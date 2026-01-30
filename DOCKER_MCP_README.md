# Docker Desktop MCP Integration

This directory contains scripts and configurations to connect Docker Desktop with beneficial MCP (Model Context Protocol) servers for the HeadySystems project.

## Files Overview

### Core Scripts
- **`docker-mcp-setup.ps1`** - Main setup script that configures Docker Desktop MCP integration
- **`start-docker-mcp.ps1`** - Starts all MCP services in Docker containers
- **`stop-docker-mcp.ps1`** - Stops and cleans up MCP services

### Configuration Files
- **`docker-compose.mcp.yml`** - Docker Compose configuration for MCP services
- **`mcp_config.json`** - Updated MCP server configurations optimized for Docker

## Quick Start

### 1. Prerequisites
- Docker Desktop installed and running
- PowerShell (Windows) or compatible shell
- Node.js and npm installed

### 2. Setup MCP Integration
```powershell
# Run the setup script
.\docker-mcp-setup.ps1

# Start MCP services
.\start-docker-mcp.ps1
```

### 3. Verify Services
```powershell
# Check running containers
docker ps

# View service logs
docker-compose -f docker-compose.mcp.yml logs -f

# Check service status
docker-compose -f docker-compose.mcp.yml ps
```

## MCP Servers Configured

### Core Services
| Server | Purpose | Docker Integration |
|--------|---------|-------------------|
| **filesystem** | File operations for container management | Volume-mounted workspace |
| **docker** | Container and image management | Docker socket access |
| **sequential-thinking** | Container orchestration reasoning | Host-based service |
| **memory** | Persistent container state | Volume-based storage |
| **fetch** | Container registry operations | Network-enabled service |

### Database Services
| Server | Purpose | Container |
|--------|---------|----------|
| **postgres** | Database container management | PostgreSQL 15-alpine |
| **redis** | MCP caching and session storage | Redis 7-alpine |

### Development Services
| Server | Purpose | Integration |
|--------|---------|-------------|
| **git** | Version control for containers | Workspace-mounted |
| **puppeteer** | Web application testing | Headless Chrome |
| **cloudflare** | CDN and DNS management | API-based service |

### Advanced Services
| Server | Purpose | Requirements |
|--------|---------|-------------|
| **kubernetes** | Container orchestration | kubectl + kubeconfig |
| **monitoring** | Container health metrics | Docker socket access |

## Environment Variables

### Required for Full Functionality
```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/heady
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=heady
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Cloudflare Integration
COPILOT_MCP_CLOUDFLARE_API_TOKEN=your_cloudflare_token
COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID=your_account_id

# Kubernetes (optional)
KUBECONFIG=/path/to/kubeconfig

# Monitoring Configuration
MONITORING_INTERVAL=30
METRICS_RETENTION=24h
```

## Docker Compose Services

### Service Architecture
```
mcp-network (bridge)
├── mcp-filesystem (Node.js 18-alpine)
├── mcp-postgres (Node.js 18-alpine)
├── mcp-memory (Node.js 18-alpine)
├── mcp-fetch (Node.js 18-alpine)
├── postgres (PostgreSQL 15-alpine)
└── redis (Redis 7-alpine)
```

### Persistent Volumes
- `postgres_data` - PostgreSQL data persistence
- `redis_data` - Redis data persistence
- `./mcp-data` - Host-mounted memory storage

### Port Mappings
- `5432:5432` - PostgreSQL database
- `6379:6379` - Redis cache

## Usage Examples

### File Operations in Containers
```javascript
// Using filesystem MCP server
const files = await mcp.call('filesystem', 'read_file', {
  path: '/workspace/src/process_data.py'
});
```

### Container Management
```javascript
// Using docker MCP server
const containers = await mcp.call('docker', 'list_containers');
const result = await mcp.call('docker', 'run_container', {
  image: 'node:18-alpine',
  command: ['npm', 'start']
});
```

### Database Operations
```javascript
// Using postgres MCP server
const query = await mcp.call('postgres', 'execute_query', {
  sql: 'SELECT * FROM projects WHERE status = $1',
  params: ['active']
});
```

### Container Orchestration
```javascript
// Using sequential-thinking MCP server
const plan = await mcp.call('sequential-thinking', 'create_deployment_plan', {
  services: ['web', 'api', 'database'],
  constraints: ['high-availability', 'cost-effective']
});
```

## Troubleshooting

### Common Issues

#### Docker Desktop Not Running
```powershell
# Start Docker Desktop manually or use:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

#### MCP Services Fail to Start
```powershell
# Check logs for specific service
docker-compose -f docker-compose.mcp.yml logs mcp-filesystem

# Restart specific service
docker-compose -f docker-compose.mcp.yml restart mcp-filesystem
```

#### Permission Issues
```powershell
# Ensure Docker Desktop has proper permissions
# Run PowerShell as Administrator if needed
```

#### Network Connectivity
```powershell
# Check Docker network
docker network ls
docker network inspect heady_mcp-network

# Recreate network if needed
docker network rm mcp-network
docker-compose -f docker-compose.mcp.yml up -d
```

### Service Health Checks
```powershell
# Check all services
.\scripts\check-mcp-health.ps1

# Individual service checks
docker exec heady-mcp-filesystem npm test
docker exec heady-postgres pg_isready
```

## Development Workflow

### Adding New MCP Servers
1. Update `docker-compose.mcp.yml` with new service
2. Add server configuration to `docker-mcp-setup.ps1`
3. Update environment variables as needed
4. Test with `docker-compose -f docker-compose.mcp.yml up new-service`

### Custom Configurations
```powershell
# Custom setup with different parameters
.\docker-mcp-setup.ps1 -McpConfigPath ".\custom-mcp.json" -Force

# Start specific services only
docker-compose -f docker-compose.mcp.yml up -d mcp-filesystem mcp-memory
```

### Production Deployment
```powershell
# Production-ready configuration
docker-compose -f docker-compose.mcp.yml -f docker-compose.prod.yml up -d

# Scale services as needed
docker-compose -f docker-compose.mcp.yml up -d --scale mcp-filesystem=3
```

## Security Considerations

### Docker Socket Access
- Docker MCP server requires socket access for container management
- Ensure proper authentication and authorization
- Consider using Docker contexts for multi-environment safety

### Environment Variables
- Store sensitive tokens in Docker secrets or environment files
- Use `.env` files for local development
- Rotate API keys regularly

### Network Isolation
- MCP services run on isolated bridge network
- Only expose necessary ports
- Use Docker network policies for additional security

## Performance Optimization

### Resource Allocation
```yaml
# In docker-compose.mcp.yml
services:
  mcp-filesystem:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Caching Strategy
- Redis for MCP session caching
- Volume mounts for persistent data
- Container restart policies for availability

### Monitoring
- Built-in MCP monitoring service
- Docker stats for resource usage
- Custom health checks for each service

## Integration with HeadySystems

### Seamless Integration
- MCP servers automatically configured for Heady project structure
- Filesystem server mounted to `/Users/erich/Heady` workspace
- Database pre-configured for Heady applications
- Git integration for version-controlled deployments

### Development Enhancement
- Real-time container management through MCP
- Automated testing with Puppeteer integration
- Cloudflare CDN management for production deployments
- Kubernetes orchestration for scalable applications

This Docker Desktop MCP integration provides a comprehensive development environment for HeadySystems with containerized MCP services, persistent data storage, and seamless workflow integration.
