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
<!-- ║  FILE: DOCKER_QUICKSTART.md                                       ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

# HEADY SYSTEMS :: Docker Desktop MCP Quick Start

## 🚀 Quick Setup (3 Steps)

### 1. Setup Docker Environment
```powershell
.\docker-mcp-setup.ps1
```

### 2. Start All Services
```powershell
.\start-docker-mcp.ps1
```

### 3. Verify Services
```powershell
docker-compose -f docker-compose.mcp.yml ps
```

## 📊 Service Status

Check HeadyManager health:
```powershell
curl https://headysystems.com/api/health
```

Expected response:
```json
{
  "ok": true,
  "service": "heady-manager",
  "ts": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0"
}
```

## 🛠️ Common Commands

### View Logs
```powershell
# All services
docker-compose -f docker-compose.mcp.yml logs -f

# Specific service
docker-compose -f docker-compose.mcp.yml logs -f heady-mcp-manager
```

### Restart Services
```powershell
docker-compose -f docker-compose.mcp.yml restart
```

### Stop Services
```powershell
.\stop-docker-mcp.ps1
```

### Clean Restart
```powershell
.\stop-docker-mcp.ps1 -Clean
.\docker-mcp-setup.ps1 -Force
.\start-docker-mcp.ps1
```

## 🔌 Available Endpoints

| Service | Endpoint | Purpose |
|---------|----------|---------|
| **HeadyManager** | `https://headysystems.com` | Main API |
| **Health Check** | `https://headysystems.com/api/health` | Service status |
| **Registry** | `https://headysystems.com/api/registry` | Component registry |
| **PostgreSQL** | `heady-postgres:5432` | Database |
| **Redis** | `heady-redis:6379` | Cache |

## 🐳 Docker Services

### Core Services
- **heady-mcp-manager** - Main HeadyMCP orchestrator (port 3300)
- **heady-postgres** - PostgreSQL database (port 5432)
- **heady-redis** - Redis cache (port 6379)

### MCP Servers
- **heady-mcp-filesystem** - File operations
- **heady-mcp-postgres** - Database MCP interface
- **heady-mcp-memory** - Persistent memory storage
- **heady-mcp-fetch** - HTTP fetch operations

## 🔧 Troubleshooting

### Docker Desktop Not Running
```powershell
# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Services Won't Start
```powershell
# Check Docker logs
docker-compose -f docker-compose.mcp.yml logs

# Rebuild containers
.\docker-mcp-setup.ps1 -Force
```

### Port Conflicts
If port 3300, 5432, or 6379 are in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.mcp.yml`

### Database Connection Issues
```powershell
# Check PostgreSQL is running
docker exec heady-postgres pg_isready

# Connect to database
docker exec -it heady-postgres psql -U postgres -d heady
```

## 📁 File Structure

```
Heady/
├── Dockerfile                    # HeadyMCP container definition
├── .dockerignore                 # Docker build exclusions
├── docker-compose.mcp.yml        # Service orchestration
├── docker-mcp-setup.ps1          # Setup script
├── start-docker-mcp.ps1          # Start script
├── stop-docker-mcp.ps1           # Stop script
├── init.sql                      # Database initialization
├── mcp-data/                     # MCP persistent data
└── .heady-memory/                # Heady memory storage
```

## 🔐 Environment Variables

Create or update `.env` file:
```bash
# Database
DATABASE_URL=postgresql://postgres:password@heady-postgres:5432/heady
POSTGRES_PASSWORD=your_secure_password

# Cloudflare (optional)
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Node Environment
NODE_ENV=production
PORT=3300
```

## 🎯 Integration with HeadySync

HeadyMCP Docker services integrate seamlessly with HeadySync:

```powershell
# Start Docker services first
.\start-docker-mcp.ps1

# Then run HeadySync
.\scripts\hs.ps1
```

## ∞ Sacred Geometry :: Organic Systems ∞
