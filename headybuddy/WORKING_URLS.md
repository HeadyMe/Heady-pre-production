# 🌐 Working Heady Services URLs

## ⚠️ Important Notice

The custom domains (headysystems.com, headycloud.com, etc.) are **not currently configured**. Use the direct Render URLs below.

## ✅ Working Services

| Service | Direct URL | Status |
|---------|------------|--------|
| **HeadySystems** | https://heady-manager-headysystems.onrender.com | ✅ ONLINE |
| **HeadyMe** | https://heady-manager-headyme.onrender.com | ✅ ONLINE |
| **HeadyConnection** | https://heady-manager-headyconnection.onrender.com | ✅ ONLINE |

## 🚀 Quick Access

### Primary API (HeadySystems)
```bash
# System Status
curl https://heady-manager-headysystems.onrender.com/api/system/status

# Health Check
curl https://heady-manager-headysystems.onrender.com/api/health

# Intelligence Engine
curl https://heady-manager-headysystems.onrender.com/api/intelligence/state
```

### HeadyBuddy Integration
HeadyBuddy is now configured to use the working Render URL:
- **Config URL**: `https://heady-manager-headysystems.onrender.com`
- **Status**: ✅ Connected and functional

## 🤖 Automation Features

The HeadyBuddy automation engine works with the live services:

1. **Launch HeadyBuddy**: `npm start`
2. **Upload Colab Notebooks**: Click "Upload to Colab" button
3. **Monitor Services**: Real-time status in chat

## 📋 Service Endpoints

### HeadySystems (Primary)
- **API**: `/api/*`
- **Intelligence**: `/api/intelligence/*`
- **Sessions**: `/api/v1/sessions`
- **Chat**: `/api/v1/chat/*`
- **Health**: `/api/health`

### HeadyMe (Cloud Layer)
- Same API structure as HeadySystems
- Focused on cloud orchestration

### HeadyConnection (Connection Layer)
- Same API structure as HeadySystems
- Focused on AI node mesh

## 🔧 Testing Services

```bash
# Check all services
./scripts/check-services.sh

# Test specific service
curl -I https://heady-manager-headysystems.onrender.com

# Get system info
curl https://heady-manager-headysystems.onrender.com/api/system/status | jq .
```

## 🌍 Domain Configuration (Future)

To enable the custom domains, you would need to:

1. **Register Domains**: headysystems.com, headycloud.com, etc.
2. **DNS Setup**: Point to Render services
3. **SSL Certificates**: Configure HTTPS
4. **Update Configuration**: Use custom domains in code

For now, the direct Render URLs provide full functionality.

## 📞 Troubleshooting

### Services Not Responding
```bash
# Check service status
curl -I https://heady-manager-headysystems.onrender.com

# Check logs (if you have access)
# Render dashboard -> Service -> Logs
```

### HeadyBuddy Connection Issues
1. Check the URL in `main.js` CONFIG
2. Verify service is accessible via browser
3. Restart HeadyBuddy: `npm start`

### Automation Not Working
1. Test automation engine: `node test-automation.js`
2. Check notebook files exist in `heady-colab-nodes/`
3. Verify Puppeteer dependencies installed

---

**All services are fully functional via the direct Render URLs!** 🚀
