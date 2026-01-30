# Heady Admin UI - Multiple Connection Methods Guide

## Overview

The Heady system provides **TWO** distinct admin interfaces, each optimized for different use cases. This guide explains how to access and use both interfaces through multiple connection methods.

---

## Available Admin Interfaces

### 1. **Admin Dashboard** (Recommended for General Use)
- **URL**: `http://localhost:3300/admin.html`
- **Best For**: System monitoring, configuration management, operation control
- **Features**: Tab-based interface with Dashboard, File Browser, Configuration Editor, AI Assistant, Operation Monitoring, and System Controls

### 2. **Admin IDE** (For Development)
- **URL**: `http://localhost:3300/admin/` or `http://localhost:3300/admin/index.html`
- **Best For**: Code editing, file management, development tasks
- **Features**: Monaco editor with syntax highlighting, file tree navigation, integrated terminal, GPU settings

---

## Quick Start - Local Development

### Prerequisites
```bash
# Verify requirements
node --version    # Should be >= 18.0.0
python3 --version # Should be >= 3.11.0
git --version     # Any recent version
```

### Step 1: Clone and Navigate
```bash
git clone https://github.com/HeadyMe/Heady.git
cd Heady
```

### Step 2: Install Dependencies
```bash
# Install Node.js packages
npm install

# Install Python packages
pip3 install -r requirements.txt
# or on some systems:
pip install -r requirements.txt
```

### Step 3: Configure Environment
```bash
# Copy template to .env
cp .env.template .env

# Edit .env with your editor of choice
nano .env
# or
vim .env
# or
code .env  # if using VS Code
```

**Minimum Required Configuration:**
```env
# Required API Keys
HEADY_API_KEY=heady_live_your_secure_key_here_minimum_20_characters
HF_TOKEN=hf_your_huggingface_token_here

# Server Configuration
PORT=3300
NODE_ENV=development

# Optional but recommended
GOOGLE_API_KEY=AIzaSy_your_google_api_key_here
```

### Step 4: Start the Server
```bash
# Standard start
npm start

# Or directly with node
node heady-manager.js

# Or with development watch mode (if you have nodemon installed)
npm run dev
```

You should see output like:
```
[2026-01-30T15:40:00.000Z] INFO: Heady System Active on Port 3300 {
  port: 3300,
  nodeEnv: 'development',
  pid: 12345,
  version: '1.0.0'
}
```

### Step 5: Verify Server Health
```bash
curl http://localhost:3300/api/health
```

Expected response:
```json
{
  "ok": true,
  "service": "heady-manager",
  "ts": "2026-01-30T15:40:00.000Z",
  "uptime_s": 10,
  "env": {
    "has_hf_token": true,
    "has_heady_api_key": true
  }
}
```

---

## Connection Method 1: Web Browser (Recommended)

### Access Admin Dashboard
```
http://localhost:3300/admin.html
```

### Access Admin IDE
```
http://localhost:3300/admin/
```

### Supported Browsers
- ✅ Google Chrome (Recommended)
- ✅ Microsoft Edge
- ✅ Firefox
- ✅ Safari
- ✅ Brave

### First-Time Authentication
1. Open either admin interface in your browser
2. You'll be prompted to enter your API key
3. Enter the `HEADY_API_KEY` value from your `.env` file
4. Click "Save" or "Connect"
5. The key is stored in browser `localStorage` for future sessions

### Troubleshooting Browser Access
```bash
# If page doesn't load, check server is running
curl http://localhost:3300/api/health

# Check for port conflicts
lsof -i :3300
# or on Windows:
netstat -ano | findstr :3300

# Clear browser cache if UI appears broken
# Chrome: Ctrl+Shift+Del (Cmd+Shift+Del on Mac)
# Then select "Cached images and files"
```

---

## Connection Method 2: curl / API Access

### Authentication
All admin API endpoints require authentication via one of two methods:

**Method 1: Custom Header (Recommended)**
```bash
curl -H "x-heady-api-key: your_api_key_here" \
     http://localhost:3300/api/admin/config/render-yaml
```

**Method 2: Bearer Token**
```bash
curl -H "Authorization: Bearer your_api_key_here" \
     http://localhost:3300/api/admin/files?path=/
```

### Common API Endpoints

#### System Health & Status
```bash
# Basic health check (no auth required)
curl http://localhost:3300/api/health

# Detailed system pulse with Docker info (no auth required)
curl http://localhost:3300/api/pulse
```

#### Configuration Management
```bash
# Get render.yaml configuration
curl -H "x-heady-api-key: your_key" \
     http://localhost:3300/api/admin/config/render-yaml

# Get MCP configuration
curl -H "x-heady-api-key: your_key" \
     http://localhost:3300/api/admin/config/mcp

# Get GPU settings
curl -H "x-heady-api-key: your_key" \
     http://localhost:3300/api/admin/settings/gpu
```

#### File Operations
```bash
# List files in a directory
curl -H "x-heady-api-key: your_key" \
     "http://localhost:3300/api/admin/files?path=/home/runner/work/Heady/Heady"

# Read a file
curl -H "x-heady-api-key: your_key" \
     "http://localhost:3300/api/admin/file?path=/home/runner/work/Heady/Heady/README.md"

# Write/update a file
curl -X POST \
     -H "x-heady-api-key: your_key" \
     -H "Content-Type: application/json" \
     -d '{"path":"/home/runner/work/Heady/Heady/test.txt","content":"Hello World"}' \
     http://localhost:3300/api/admin/file
```

#### Build & Audit Operations
```bash
# Trigger a build
curl -X POST \
     -H "x-heady-api-key: your_key" \
     -H "Content-Type: application/json" \
     -d '{"args":["--verbose"]}' \
     http://localhost:3300/api/admin/build

# Trigger an audit
curl -X POST \
     -H "x-heady-api-key: your_key" \
     http://localhost:3300/api/admin/audit

# List all operations
curl -H "x-heady-api-key: your_key" \
     http://localhost:3300/api/admin/ops

# Get operation status
curl -H "x-heady-api-key: your_key" \
     http://localhost:3300/api/admin/ops/operation-id-here/status

# Stream operation logs (Server-Sent Events)
curl -H "x-heady-api-key: your_key" \
     -N \
     http://localhost:3300/api/admin/ops/operation-id-here/stream
```

#### AI & GPU Operations
```bash
# GPU inference
curl -X POST \
     -H "x-heady-api-key: your_key" \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Generate a function to sort an array","max_tokens":100}' \
     http://localhost:3300/api/admin/gpu/infer

# AI Assistant for code help
curl -X POST \
     -H "x-heady-api-key: your_key" \
     -H "Content-Type: application/json" \
     -d '{"message":"How do I implement error handling in this code?","code":"function test() { ... }"}' \
     http://localhost:3300/api/admin/assistant
```

---

## Connection Method 3: Docker Container Access

### If Running in Docker
```bash
# Build and run with docker-compose
docker-compose up -d

# Access from host machine
http://localhost:3300/admin.html

# Access logs
docker-compose logs -f heady-manager

# Execute commands inside container
docker-compose exec heady-manager curl http://localhost:3300/api/health
```

### Docker Network Access
```bash
# From another container in the same network
curl http://heady-manager:3300/api/health

# From host to container
curl http://localhost:3300/api/health
```

---

## Connection Method 4: Remote/Production Access

### SSH Tunnel (Secure Remote Access)
```bash
# Create SSH tunnel from remote server
ssh -L 3300:localhost:3300 user@your-remote-server.com

# Now access locally
http://localhost:3300/admin.html
```

### Reverse Proxy (Nginx Example)
```nginx
server {
    listen 80;
    server_name admin.heady.example.com;

    location / {
        proxy_pass http://localhost:3300;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Cloudflare Tunnel (Zero-Trust Access)
```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared

# Create tunnel
./cloudflared tunnel --url http://localhost:3300
```

### Environment Configuration for Production
```env
# Update .env for production
NODE_ENV=production
HEADY_TRUST_PROXY=true
HEADY_CORS_ORIGINS=https://your-domain.com
```

---

## Connection Method 5: VS Code Remote Development

### Using VS Code Remote-SSH
1. Install "Remote - SSH" extension
2. Connect to your server
3. Open integrated terminal
4. Navigate to project: `cd ~/Heady`
5. Start server: `npm start`
6. Use VS Code's port forwarding (automatically detects port 3300)
7. Click the forwarded port link to open Admin UI

### Using VS Code Tunnel
```bash
# On the server
code tunnel

# On your local machine
# Open VS Code and connect to the tunnel
# Access http://localhost:3300/admin.html
```

---

## Connection Method 6: Mobile/Tablet Access

### Local Network Access
```bash
# Find your server's IP address
# On Linux/Mac:
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows:
ipconfig | findstr IPv4

# Access from mobile device on same network
http://192.168.1.xxx:3300/admin.html
```

### Update CORS Settings
```env
# In .env file, add your local network
HEADY_CORS_ORIGINS=http://localhost:3300,http://192.168.1.xxx:3300
```

---

## Authentication & Security

### API Key Management
```bash
# Generate a secure API key
node -e "console.log('heady_live_' + require('crypto').randomBytes(32).toString('hex'))"

# Update .env
HEADY_API_KEY=heady_live_your_generated_key_here
```

### Viewing Stored Credentials (Browser)
```javascript
// Open browser console (F12) on admin page
localStorage.getItem('headyApiKey')

// Clear stored credentials
localStorage.removeItem('headyApiKey')
```

### Rate Limiting
```bash
# Check rate limit headers
curl -I -H "x-heady-api-key: your_key" \
     http://localhost:3300/api/admin/files

# Look for these headers:
# X-RateLimit-Limit: 120
# X-RateLimit-Remaining: 119
# X-RateLimit-Reset: 1706565360
```

---

## Troubleshooting Connection Issues

### Issue: "Connection Refused"
```bash
# Check if server is running
ps aux | grep heady-manager

# Check if port is in use
lsof -i :3300

# Restart server
npm start
```

### Issue: "API Key Required"
```bash
# Verify API key is set in .env
grep HEADY_API_KEY .env

# Test with curl
curl -H "x-heady-api-key: $(grep HEADY_API_KEY .env | cut -d '=' -f 2)" \
     http://localhost:3300/api/admin/files?path=/
```

### Issue: "CORS Error in Browser"
```bash
# Update HEADY_CORS_ORIGINS in .env
HEADY_CORS_ORIGINS=http://localhost:3300,http://localhost:3000

# Restart server
npm start
```

### Issue: "Page Loads But UI Doesn't Render"
```bash
# Clear browser cache
# Chrome: Ctrl+Shift+Del -> Clear cached images and files

# Check browser console for errors (F12)

# Try accessing with different browser

# Check CDN resources are loading:
curl https://unpkg.com/react@18/umd/react.production.min.js
```

### Issue: "Slow Performance"
```bash
# Check server resources
htop
# or
top

# Check Docker resources (if using Docker)
docker stats

# Increase concurrency limits in .env
HF_MAX_CONCURRENCY=8
HEADY_PY_MAX_CONCURRENCY=4
```

---

## Admin UI Features Quick Reference

### Admin Dashboard (`/admin.html`)
- **Dashboard Tab**: System status, resource usage, health monitoring
- **File Browser Tab**: Tree navigation, file CRUD, search
- **Configuration Tab**: Edit render.yaml, MCP settings, env vars
- **AI Assistant Tab**: Code generation, documentation, debugging
- **Operations Tab**: Build/audit monitoring, log streaming
- **System Tab**: Service controls, cache management, DB ops

### Admin IDE (`/admin/`)
- **File Tree**: Navigate project structure
- **Monaco Editor**: Code editing with syntax highlighting
- **Terminal Panel**: Integrated command execution
- **Settings Panel**: GPU configuration, preferences
- **Operations Monitor**: Real-time build/audit logs
- **Status Bar**: Connection status, file info, cursor position

---

## Getting API Key & Tokens

### Hugging Face Token
1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "Read" access
3. Copy token and add to .env: `HF_TOKEN=hf_xxx...`

### Google API Key (Optional)
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy key and add to .env: `GOOGLE_API_KEY=AIzaSy...`

### Heady API Key
```bash
# Generate your own secure key
openssl rand -hex 32
# Then prefix with "heady_live_"
# Result: heady_live_a1b2c3d4e5f6...

# Or use Node.js
node -e "console.log('heady_live_' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## Support & Resources

### Documentation
- [README.md](./README.md) - Project overview
- [ADMIN_UI_GUIDE.md](./ADMIN_UI_GUIDE.md) - Detailed feature guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines
- [SECURITY.md](./SECURITY.md) - Security policies

### Health Check Endpoints
```bash
# Basic health
curl http://localhost:3300/api/health

# System pulse with Docker info
curl http://localhost:3300/api/pulse

# Check environment variables are loaded
curl http://localhost:3300/api/health | jq '.env'
```

### Debug Mode
```bash
# Enable verbose logging
export HEADY_LOG_LEVEL=debug
npm start

# Watch logs
tail -f logs/heady-*.log
```

---

## Quick Connection Checklist

- [ ] Repository cloned
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created and configured
- [ ] `HEADY_API_KEY` set (minimum 20 characters)
- [ ] `HF_TOKEN` set (if using HuggingFace features)
- [ ] Server started (`npm start`)
- [ ] Health check passes (`curl http://localhost:3300/api/health`)
- [ ] Admin Dashboard accessible at `http://localhost:3300/admin.html`
- [ ] Admin IDE accessible at `http://localhost:3300/admin/`
- [ ] API key entered and saved in browser

---

**Heady Admin UI v1.0.0** - Part of the Sacred Geometry Ecosystem

For additional help, visit GitHub Issues or Discussions.
