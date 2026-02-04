<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: DOCKER_MCP_QUICKSTART.md -->
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

# Docker Desktop MCP Quick Start Guide

## Overview

This guide walks you through setting up Docker Desktop to use HeadyMCP in the toolkit. The setup provides containerized MCP (Model Context Protocol) servers for enhanced development capabilities.

## Prerequisites

- **Docker Desktop** installed and running
- **PowerShell 5.0+** (Windows)
- **Git** for version control
- **Node.js 18+** (for local development)

## Installation Steps

### Step 1: Verify Docker Desktop Installation

```powershell
# Check Docker version
docker --version

# Check Docker Compose
docker-compose --version

# Verify Docker daemon is running
docker ps
```

If Docker is not installed, download from: https://www.docker.com/products/docker-desktop

### Step 2: Run Docker MCP Setup

Navigate to the project root and execute the setup script:

```powershell
# From project root
.\scripts\docker-mcp-setup.ps1
```

This script will:
- Verify Docker installation and daemon status
- Create MCP network bridge
- Initialize data directories
- Generate `.env` configuration file
- Create database initialization script (`init.sql`)
- Generate MCP configuration (`mcp_config.json`)
- Validate `docker-compose.mcp.yml`

### Step 3: Review Configuration Files

The setup creates several configuration files:

#### `.env` - Environment Variables
```bash
DATABASE_URL=postgresql://postgres:password@postgres:5432/heady
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
NODE_ENV=production
```

**Optional configurations:**
- Cloudflare API token (for CDN management)
- Kubernetes kubeconfig (for orchestration)
- Custom monitoring intervals

#### `init.sql` - Database Schema
Initializes PostgreSQL with:
- UUID extensions
- `heady` schema for application data
- `mcp` schema for MCP state and logs
- Automatic indexes and permissions

#### `mcp_config.json` - MCP Services Configuration
Defines all containerized MCP services and their configurations.

### Step 4: Start MCP Services

```powershell
# Start all services in detached mode
.\scripts\start-docker-mcp.ps1

# Or with verbose output (attach to logs)
.\scripts\start-docker-mcp.ps1 -Detach:$false

# Start specific services only
.\scripts\start-docker-mcp.ps1 -Services @("heady-mcp-filesystem", "heady-postgres")

# Build images before starting
.\scripts\start-docker-mcp.ps1 -BuildImages
```

### Step 5: Verify Services

```powershell
# Check health status
.\scripts\check-mcp-health.ps1

# Verbose health check with resource stats
.\scripts\check-mcp-health.ps1 -Verbose

# View detailed service status
docker-compose -f docker-compose.mcp.yml ps

# View service logs
docker-compose -f docker-compose.mcp.yml logs -f

# View specific service logs
docker-compose -f docker-compose.mcp.yml logs -f heady-mcp-filesystem
```

## MCP Services

### Core MCP Servers

| Service | Container | Purpose | Port |
|---------|-----------|---------|------|
| **filesystem** | heady-mcp-filesystem | File operations | Internal |
| **postgres** | heady-mcp-postgres | Database operations | Internal |
| **memory** | heady-mcp-memory | State persistence | Internal |
| **fetch** | heady-mcp-fetch | HTTP requests | Internal |

### Infrastructure Services

| Service | Container | Purpose | Port |
|---------|-----------|---------|------|
| **PostgreSQL** | heady-postgres | Data persistence | 5432 |
| **Redis** | heady-redis | Caching/sessions | 6379 |

## Common Operations

### View Running Containers

```powershell
docker ps

# Filter by name
docker ps --filter "name=heady"
```

### Check Container Logs

```powershell
# All services
docker-compose -f docker-compose.mcp.yml logs

# Specific service
docker-compose -f docker-compose.mcp.yml logs heady-postgres

# Follow logs in real-time
docker-compose -f docker-compose.mcp.yml logs -f

# Last 50 lines
docker-compose -f docker-compose.mcp.yml logs --tail=50
```

### Execute Commands in Container

```powershell
# PostgreSQL client
docker exec -it heady-postgres psql -U postgres -d heady

# Check Redis
docker exec -it heady-redis redis-cli ping

# Node.js shell in MCP container
docker exec -it heady-mcp-filesystem node
```

### Restart Services

```powershell
# Restart all services
docker-compose -f docker-compose.mcp.yml restart

# Restart specific service
docker-compose -f docker-compose.mcp.yml restart heady-postgres

# Restart with rebuild
docker-compose -f docker-compose.mcp.yml up -d --build heady-mcp-filesystem
```

### Stop Services

```powershell
# Stop all services (keep volumes)
.\scripts\stop-docker-mcp.ps1

# Stop and remove volumes
.\scripts\stop-docker-mcp.ps1 -RemoveVolumes

# Stop and remove images
.\scripts\stop-docker-mcp.ps1 -RemoveImages

# Manual stop
docker-compose -f docker-compose.mcp.yml down
```

## Database Access

### Connect to PostgreSQL

```powershell
# Via Docker
docker exec -it heady-postgres psql -U postgres -d heady

# Via local connection (if port 5432 exposed)
psql -h localhost -U postgres -d heady
```

### Common Database Commands

```sql
-- List all tables
\dt

-- Show schema
\dn

-- View table structure
\d heady.projects

-- Query data
SELECT * FROM heady.projects;
SELECT * FROM mcp.logs ORDER BY created_at DESC LIMIT 10;

-- Check indexes
\di
```

## Troubleshooting

### Docker Daemon Not Running

```powershell
# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for daemon to start
Start-Sleep -Seconds 15

# Verify
docker ps
```

### Port Already in Use

```powershell
# Find process using port 5432
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.mcp.yml
# Change "5432:5432" to "5433:5432"
```

### Container Fails to Start

```powershell
# Check logs
docker-compose -f docker-compose.mcp.yml logs heady-postgres

# Validate compose file
docker-compose -f docker-compose.mcp.yml config

# Rebuild from scratch
docker-compose -f docker-compose.mcp.yml down -v
docker-compose -f docker-compose.mcp.yml up -d --build
```

### Network Issues

```powershell
# List networks
docker network ls

# Inspect MCP network
docker network inspect mcp-network

# Recreate network
docker network rm mcp-network
docker network create mcp-network --driver bridge
```

### Permission Denied Errors

```powershell
# Run PowerShell as Administrator
# Right-click PowerShell > Run as Administrator

# Or use Docker context
docker context ls
docker context use default
```

## Integration with Heady Ecosystem

### HeadySync Integration

The Docker MCP setup integrates with HeadySync for unified synchronization:

```powershell
# Run full HeadySync with Docker MCP
.\scripts\Heady-Sync.ps1

# Or start Docker MCP first, then sync
.\scripts\start-docker-mcp.ps1
.\scripts\Heady-Sync.ps1
```

### HeadyManager Integration

The `heady-manager.js` orchestrator can interact with Docker MCP services:

```powershell
# Start heady-manager
node heady-manager.js

# Manager will detect and register MCP services
# Check health endpoint
curl http://localhost:3300/api/health
```

## Performance Optimization

### Resource Limits

Edit `docker-compose.mcp.yml` to set resource limits:

```yaml
services:
  heady-mcp-filesystem:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Caching Strategy

Redis is configured for MCP session caching:

```powershell
# Check Redis memory usage
docker exec heady-redis redis-cli info memory

# Clear cache if needed
docker exec heady-redis redis-cli FLUSHALL
```

## Security Considerations

### Credentials Management

- **Database Password**: Change in `.env` before production
- **API Tokens**: Store in environment variables, not in code
- **Docker Socket**: Only expose when necessary

### Network Isolation

MCP services run on isolated `mcp-network` bridge:
- Services communicate internally
- Only expose necessary ports (5432, 6379)
- Use firewall rules for external access

### Volume Permissions

```powershell
# Check volume permissions
docker volume ls
docker volume inspect postgres_data

# Backup volumes
docker run --rm -v postgres_data:/data -v C:\backups:/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Monitoring and Logging

### View Real-time Metrics

```powershell
# Docker stats
docker stats --no-stream

# Specific container
docker stats heady-postgres --no-stream
```

### Centralized Logging

Logs are stored in PostgreSQL `mcp.logs` table:

```sql
-- View recent logs
SELECT service, level, message, created_at 
FROM mcp.logs 
ORDER BY created_at DESC 
LIMIT 20;

-- Filter by service
SELECT * FROM mcp.logs 
WHERE service = 'heady-mcp-filesystem' 
ORDER BY created_at DESC;
```

## Advanced Usage

### Custom MCP Servers

To add custom MCP servers:

1. Create service in `docker-compose.mcp.yml`
2. Update `mcp_config.json`
3. Restart services: `docker-compose -f docker-compose.mcp.yml up -d`

### Multi-Environment Setup

```powershell
# Development
docker-compose -f docker-compose.mcp.yml up -d

# Production (with additional config)
docker-compose -f docker-compose.mcp.yml -f docker-compose.prod.yml up -d

# Staging
docker-compose -f docker-compose.mcp.yml -f docker-compose.staging.yml up -d
```

### Backup and Restore

```powershell
# Backup database
docker exec heady-postgres pg_dump -U postgres heady > backup.sql

# Restore database
docker exec -i heady-postgres psql -U postgres heady < backup.sql

# Backup volumes
docker run --rm -v postgres_data:/data -v C:\backups:/backup alpine tar czf /backup/postgres.tar.gz -C /data .
```

## Next Steps

1. **Verify Setup**: Run `.\scripts\check-mcp-health.ps1`
2. **Review Logs**: `docker-compose -f docker-compose.mcp.yml logs`
3. **Test Services**: Connect to PostgreSQL and Redis
4. **Integrate with Heady**: Run `.\scripts\Heady-Sync.ps1`
5. **Monitor**: Use `docker stats` and MCP logs table

## Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.mcp.yml logs`
- Review configuration: `.env`, `docker-compose.mcp.yml`, `mcp_config.json`
- Verify Docker: `docker ps`, `docker network ls`
- Run health check: `.\scripts\check-mcp-health.ps1 -Verbose`

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready
