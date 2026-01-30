# Heady Admin UI - Quick Connection Reference

## 🏗️ Two Architecture Options

This project supports two deployment architectures:

### Option 1: Node.js/Express (Primary)
- Port: **3300**
- Auth: `HEADY_API_KEY`
- Start: `npm start`

### Option 2: FastAPI/Python (Alternative)
- Port: **8000**
- Auth: `ADMIN_TOKEN`
- Start: `python -m src.heady_project.admin_console --action serve_api`

---

## 🚀 Quick Start (Node.js - Option 1)

```bash
# 1. Install dependencies
npm install && pip install -r requirements.txt

# 2. Set environment variables
export HEADY_API_KEY="your-secure-api-key-here"
export HF_TOKEN="your-huggingface-token-here"

# 3. Start server
npm start

# 4. Open browser
http://localhost:3300/admin.html
```

## 📍 Access URLs

| Environment | URL | Notes |
|-------------|-----|-------|
| **Local** | `http://localhost:3300/admin.html` | Default local development |
| **LAN** | `http://<your-ip>:3300/admin.html` | Access from other devices on network |
| **Production** | `https://<service>.onrender.com/admin.html` | Deployed on Render |

## 🔑 Authentication

The Admin UI requires your API key for authentication.

### Method 1: HTTP Header
```
x-heady-api-key: your-api-key-here
```

### Method 2: Bearer Token
```
Authorization: Bearer your-api-key-here
```

The Admin UI will prompt for the key and store it in browser localStorage.

## 🌐 Required Environment Variables

| Variable | Required | Where to Get |
|----------|----------|--------------|
| `HEADY_API_KEY` | ✅ Yes | Generate a secure random key (32+ chars) |
| `HF_TOKEN` | ✅ Yes | https://huggingface.co/settings/tokens |
| `PORT` | ❌ No | Default: 3300 |

## 🛠️ Testing Connection

Run the connection test script:
```bash
./test-connection.sh
```

Or manually test endpoints:
```bash
# Health check (no auth)
curl http://localhost:3300/api/health

# Admin API (requires auth)
curl -H "x-heady-api-key: $HEADY_API_KEY" \
     http://localhost:3300/api/admin/roots
```

## 🔧 Common Issues

### Server won't start
```bash
# Check if port is already in use
# Linux/macOS
lsof -i:3300
# Windows
netstat -ano | findstr :3300

# Stop the process gracefully (use PID from above)
kill <PID>       # Try graceful shutdown first
# If that doesn't work after a few seconds:
kill -9 <PID>    # Force kill (use with caution)

# Or use a different port
PORT=3301 npm start
```

### Can't connect from another device
```bash
# Add to .env file:
HEADY_CORS_ORIGINS=http://localhost:3300,http://192.168.1.100:3300

# Open firewall port
sudo ufw allow 3300/tcp  # Linux
```

### "Unauthorized" error
- Check `HEADY_API_KEY` is set: `echo $HEADY_API_KEY`
- Ensure key in UI matches exactly (no extra spaces)
- Try clearing browser localStorage and re-entering key

### Admin UI shows 404
- Verify files exist: `ls -la public/admin.html`
- Try full path: `http://localhost:3300/admin.html`

---

## 🐍 Quick Start (FastAPI - Option 2)

```bash
# 1. Install dependencies
pip install -r requirements.txt
cd frontend && npm install && npm run build && cd ..

# 2. Set environment variable
export ADMIN_TOKEN="your-secure-admin-token-here"

# 3. Start FastAPI server
python -m src.heady_project.admin_console --action serve_api

# 4. Open browser (use 127.0.0.1, not localhost!)
http://127.0.0.1:8000
```

## 🔑 Authentication (FastAPI)

### HTTP Header
```
X-Admin-Token: your-admin-token-here
```

**Required for:**
- All API requests to `/api/*`
- WebSocket connections to `/ws/logs`

### Testing FastAPI Connection

```bash
# Health check (replace with actual endpoint)
curl -H "X-Admin-Token: $ADMIN_TOKEN" \
     http://127.0.0.1:8000/api/health

# Run system audit
python -m src.heady_project.admin_console --action full_audit
```

## 🆚 Quick Comparison

| Feature | Node.js (Option 1) | FastAPI (Option 2) |
|---------|-------------------|-------------------|
| **Port** | 3300 | 8000 |
| **Auth Env Var** | `HEADY_API_KEY` | `ADMIN_TOKEN` |
| **Auth Header** | `x-heady-api-key` | `X-Admin-Token` |
| **Start Command** | `npm start` | `python -m src.heady_project.admin_console --action serve_api` |
| **URL** | `http://localhost:3300/admin.html` | `http://127.0.0.1:8000` |
| **Frontend** | `public/admin.html` | `frontend/build/` |

## 🔧 Common Issues (FastAPI)

### "Missing Admin Token" error
```bash
# Ensure ADMIN_TOKEN is set
echo $ADMIN_TOKEN

# Include header in requests
curl -H "X-Admin-Token: $ADMIN_TOKEN" http://127.0.0.1:8000/api/endpoint
```

### Frontend not loading
```bash
# Rebuild frontend
cd frontend && npm run build && cd ..

# Verify build directory exists
ls -la frontend/build
```

### Port 8000 in use
```bash
# Find process
lsof -i:8000

# Kill process (use actual PID)
kill <PID>
```

### Cannot connect
- Use `http://127.0.0.1:8000`, **not** `localhost` or `0.0.0.0`
- Security rules require local-only access

## 📚 More Information

- Full documentation: `README.md`
- Admin UI guide: `ADMIN_UI_GUIDE.md`
- Quick start: `QUICK_START.md`

## 🔗 Key Endpoints

| Path | Auth Required | Description |
|------|---------------|-------------|
| `/admin.html` | No (for UI) | Admin IDE interface |
| `/api/health` | No | Health check |
| `/api/pulse` | No | System status |
| `/api/admin/*` | Yes | Admin API operations |

---

**Pro Tip**: Bookmark `http://localhost:3300/admin.html` for quick access during development!
