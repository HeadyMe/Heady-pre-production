---
description: Manage the PostgreSQL database and Redis cache
---

# Database Management Workflow

## Purpose
Manage PostgreSQL database and Redis cache for the Heady System.

## Database Operations

### 1. **Connect to Database**
```bash
# Via MCP postgres server
npx @modelcontextprotocol/server-postgres $DATABASE_URL
```

### 2. **Run Migrations**
```bash
# Apply pending migrations
node scripts/db-migrate.js up

# Rollback last migration
node scripts/db-migrate.js down
```

### 3. **Backup Database**
```powershell
# Create backup
.\scripts\backup-database.ps1

# Restore from backup
.\scripts\restore-database.ps1 -BackupFile <path>
```

### 4. **Monitor Performance**
```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Redis Cache Management

### 1. **Connect to Redis**
```bash
redis-cli -h localhost -p 6379
```

### 2. **Cache Operations**
```bash
# Clear all cache
redis-cli FLUSHALL

# Check memory usage
redis-cli INFO memory
```

## Integration Points
- **MCP Postgres**: Database operations via MCP
- **Governance**: All schema changes audited
- **Monitoring**: Performance metrics tracked
