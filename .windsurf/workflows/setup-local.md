---
description: Setup Local Dev (HeadySystems)
---

# Setup Local Development Environment

## Prerequisites
- Node.js 18+
- pnpm or npm
- Git

## Steps

### 1. Install Dependencies
```powershell
pnpm install
```

### 2. Configure Environment
```powershell
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start MCP Services
```powershell
node heady-manager.js
```

### 4. Verify System Health
```powershell
pnpm verify
```

## Available Commands
- `pnpm dev` - Start development server
- `pnpm build:prod` - Build for production
- `pnpm test` - Run tests
- `pnpm cleanup` - Clean unnecessary files

## Troubleshooting
- Ensure port 3300 is available
- Check `.env` configuration
- Run `pnpm verify` to diagnose issues
