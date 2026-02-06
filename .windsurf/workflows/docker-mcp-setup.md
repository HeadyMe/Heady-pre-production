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
<!-- ║  FILE: .windsurf/workflows/docker-mcp-setup.md                    ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: Docker Desktop MCP Setup - Configure and start HeadyMCP services
---

# Docker Desktop MCP Setup Workflow

This workflow sets up Docker Desktop to use HeadyMCP in the toolkit with all necessary services and configurations.

## Prerequisites

- Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- PowerShell 5.0+ on Windows
- Project root directory access

## Steps

### 1. Verify Docker Installation
// turbo
Run the following command to verify Docker is installed and running:

```powershell
docker --version
docker ps
```

If Docker is not running, start Docker Desktop manually or use:
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
Start-Sleep -Seconds 15
```

### 2. Run Docker MCP Setup Script
// turbo
Execute the setup script from the project root:

```powershell
.\scripts\docker-mcp-setup.ps1
```

This script will:
- Verify Docker daemon is running
- Create MCP network bridge
- Initialize data directories (`mcp-data/`)
- Generate `.env` configuration file
- Create `init.sql` for database schema
- Generate `mcp_config.json` with service definitions
- Validate `docker-compose.mcp.yml`

### 3. Review Configuration Files

Check the generated configuration files:

**`.env`** - Environment variables for services
```bash
cat .env
```

**`init.sql`** - PostgreSQL schema initialization
```bash
cat init.sql
```

**`mcp_config.json`** - MCP service definitions
```bash
cat mcp_config.json
```

**`docker-compose.mcp.yml`** - Docker Compose configuration
```bash
cat docker-compose.mcp.yml
```

### 4. Customize Configuration (Optional)

Edit `.env` to customize settings:

```powershell
# Edit environment variables
notepad .env

# Key variables to consider:
# - POSTGRES_PASSWORD: Change from 'password' for production
# - REDIS_HOST/PORT: Adjust if needed
# - NODE_ENV: Set to 'production' or 'development'
```

### 5. Start MCP Services
// turbo
Start all Docker MCP services:

```powershell
.\scripts\start-docker-mcp.ps1
```

Options:
```powershell
# Start with verbose output (follow logs)
.\scripts\start-docker-mcp.ps1 -Detach:$false

# Start specific services only
.\scripts\start-docker-mcp.ps1 -Services @("heady-mcp-filesystem", "heady-postgres")

# Build images before starting
.\scripts\start-docker-mcp.ps1 -BuildImages
```

### 6. Verify Services Are Running
// turbo
Check the health of all MCP services:

```powershell
.\scripts\check-mcp-health.ps1
```

For detailed information including resource usage:
```powershell
.\scripts\check-mcp-health.ps1 -Verbose
```

View detailed status:
```powershell
docker-compose -f docker-compose.mcp.yml ps
```

### 7. View Service Logs

Check logs for any issues:

```powershell
# All services
docker-compose -f docker-compose.mcp.yml logs

# Specific service
docker-compose -f docker-compose.mcp.yml logs heady-postgres

# Follow logs in real-time
docker-compose -f docker-compose.mcp.yml logs -f
```

### 8. Test Database Connection

Verify PostgreSQL is accessible:

```powershell
# Connect to PostgreSQL
docker exec -it heady-postgres psql -U postgres -d heady

# In psql, run:
# \dt                    -- List tables
# SELECT * FROM heady.projects;  -- Query data
# \q                     -- Exit
```

Test Redis:

```powershell
docker exec -it heady-redis redis-cli ping
# Should return: PONG
```

### 9. Integrate with Heady Ecosystem

Start the HeadyManager orchestrator:

```powershell
node heady-manager.js
```

Verify manager can access MCP services:
```powershell
curl http://localhost:3300/api/health
```

### 10. Run HeadySync (Optional)

Synchronize with the full Heady ecosystem:

```powershell
.\scripts\Heady-Sync.ps1
```

## Verification Checklist

- [ ] Docker Desktop is running (`docker ps` returns output)
- [ ] All MCP services are running (`docker-compose -f docker-compose.mcp.yml ps`)
- [ ] Health check passes (`.\scripts\check-mcp-health.ps1`)
- [ ] PostgreSQL is accessible (can connect with psql)
- [ ] Redis is accessible (`redis-cli ping` returns PONG)
- [ ] Database schema is initialized (tables exist in `heady` schema)
- [ ] HeadyManager can access services (health endpoint responds)

## Troubleshooting

### Docker Daemon Not Running
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
Start-Sleep -Seconds 15
docker ps
```

### Port Already in Use
```powershell
# Find process using port 5432
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Container Fails to Start
```powershell
# Check logs
docker-compose -f docker-compose.mcp.yml logs heady-postgres

# Rebuild
docker-compose -f docker-compose.mcp.yml down -v
docker-compose -f docker-compose.mcp.yml up -d --build
```

### Permission Issues
Run PowerShell as Administrator or configure Docker Desktop permissions.

## Common Commands

```powershell
# Stop services
.\scripts\stop-docker-mcp.ps1

# Stop and remove volumes
.\scripts\stop-docker-mcp.ps1 -RemoveVolumes

# Restart specific service
docker-compose -f docker-compose.mcp.yml restart heady-postgres

# View resource usage
docker stats

# Backup database
docker exec heady-postgres pg_dump -U postgres heady > backup.sql

# Restore database
docker exec -i heady-postgres psql -U postgres heady < backup.sql
```

## Next Steps

1. Review `DOCKER_MCP_QUICKSTART.md` for detailed usage guide
2. Explore MCP services in `docker-compose.mcp.yml`
3. Customize `.env` for your environment
4. Integrate with HeadySync for full ecosystem synchronization
5. Monitor services with `docker stats` and `check-mcp-health.ps1`

## Support Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Redis**: https://redis.io/documentation
- **MCP Protocol**: https://modelcontextprotocol.io/

---

**Workflow Version**: 1.0
**Last Updated**: 2024
**Status**: Production Ready
