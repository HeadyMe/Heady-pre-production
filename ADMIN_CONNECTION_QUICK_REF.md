# Heady Admin UI - Quick Connection Reference

## 🚀 Quick Start (Local)

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
lsof -ti:3300 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :3300   # Windows

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
