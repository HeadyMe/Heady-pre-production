# Heady Admin UI Connection Guide

## Overview

The Heady Admin UI provides a comprehensive web-based interface for managing the Heady Sacred Geometry ecosystem. It features real-time monitoring, file management, AI assistance, and operational controls.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Python 3.11+ installed
- Required environment variables configured
- Git repository cloned

### Step 1: Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HeadyMe/Heady.git
   cd Heady
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.template .env
   # Edit .env with your actual API keys and configuration
   ```

### Required Environment Variables

Edit your `.env` file with these minimum required values:

```bash
# Core Configuration
PORT=3300
NODE_ENV=development

# Required API Keys
HEADY_API_KEY=heady_live_your_secure_key_here
HF_TOKEN=hf_your_huggingface_token_here

# Optional but Recommended
GOOGLE_API_KEY=AIzaSy_your_google_key_here
```

### Step 2: Start the Server

1. **Start the Heady Manager:**
   ```bash
   npm start
   ```

   You should see output like:
   ```
   [2025-01-29T21:15:00.000Z] INFO: Heady System Active on Port 3300 {
     port: 3300,
     nodeEnv: 'development',
     pid: 12345,
     version: '1.0.0'
   }
   ```

2. **Verify server health:**
   ```bash
   curl http://localhost:3300/api/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": 1706565300000,
     "uptime": 1234,
     "version": "1.0.0",
     "environment": "development"
   }
   ```

### Step 3: Access the Admin UI

#### Primary Admin Interface
Open your browser and navigate to:
```
http://localhost:3300/admin
```

#### Alternative Admin IDE
For the Monaco editor-based IDE:
```
http://localhost:3300/admin/index.html
```

## Authentication

### First-Time Setup
1. The Admin UI will prompt for your API key
2. Enter your `HEADY_API_KEY` from the `.env` file
3. The key will be stored in `localStorage` for future sessions

### API Key Format
- Must match exactly what's in your `.env` file
- Default format: `heady_live_your_secure_key_here`
- Minimum 20 characters recommended

## Admin UI Features

### 🎛️ Dashboard
- **System Status**: Real-time health monitoring
- **Resource Usage**: CPU, memory, and disk metrics
- **Active Operations**: Current build/audit processes
- **Service Health**: API endpoints and worker status

### 📁 File Browser
- **Tree Navigation**: Explore project structure
- **File Operations**: Read, write, create, delete files
- **Syntax Highlighting**: Monaco editor with language support
- **Search**: Find files and content quickly

### ⚙️ Configuration Editor
- **render.yaml**: Edit deployment configuration
- **MCP Settings**: Configure Model Context Protocol
- **Environment Variables**: Manage runtime settings
- **GPU Settings**: Configure remote GPU acceleration

### 🤖 AI Assistant
- **Code Generation**: AI-powered code completion
- **Documentation**: Generate docs from code
- **Debugging**: AI assistance for troubleshooting
- **Chat Interface**: Interactive AI conversations

### 📊 Operation Monitoring
- **Build Operations**: Monitor compilation and deployment
- **Audit Logs**: Security and compliance tracking
- **Real-time Logs**: Live stream of system events
- **Performance Metrics**: Response times and throughput

### 🔧 System Controls
- **Start/Stop Services**: Control worker processes
- **Restart Server**: Graceful server restart
- **Cache Management**: Clear system caches
- **Database Operations**: Maintenance and backups

## Advanced Configuration

### GPU Acceleration
Enable GPU features in your `.env`:
```bash
HEADY_ADMIN_ENABLE_GPU=true
REMOTE_GPU_HOST=your-gpu-server.com
REMOTE_GPU_PORT=8080
GPU_MEMORY_LIMIT=8192
ENABLE_GPUDIRECT=true
```

### CORS Configuration
For development with local frontend:
```bash
HEADY_CORS_ORIGINS=http://localhost:3000,http://localhost:3300
```

### Rate Limiting
Adjust API rate limits:
```bash
HEADY_RATE_LIMIT_WINDOW_MS=60000
HEADY_RATE_LIMIT_MAX=120
```

## Troubleshooting

### Common Issues

#### 1. "API Key Required" Error
**Solution**: Ensure `HEADY_API_KEY` is set in `.env` and entered correctly in the UI.

#### 2. "Connection Refused"
**Solution**: Verify the server is running on port 3300:
```bash
netstat -an | findstr :3300
```

#### 3. "Python Worker Not Responding"
**Solution**: Check Python installation and dependencies:
```bash
python --version
python src/process_data.py health
```

#### 4. "Hugging Face API Error"
**Solution**: Verify `HF_TOKEN` is valid and has model access:
```bash
curl -H "Authorization: Bearer $HF_TOKEN" https://api-inference.huggingface.co/models/gpt2
```

### Debug Mode
Enable debug logging:
```bash
HEADY_LOG_LEVEL=debug
npm start
```

### Health Checks
Check all system components:
```bash
# Server health
curl http://localhost:3300/api/health

# Python worker health
python src/process_data.py health

# Docker health (if using containers)
docker ps
```

## Security Best Practices

### API Key Security
- Use strong, unique API keys
- Rotate keys regularly
- Never commit `.env` files to Git
- Use environment variables in production

### Network Security
- Use HTTPS in production
- Configure firewall rules
- Implement VPN access for remote admin
- Monitor access logs

### Access Control
- Limit admin UI access to authorized users
- Use network-level restrictions
- Implement session timeouts
- Regular security audits

## Production Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Render.com Deployment
The `render.yaml` file contains the complete deployment configuration.

### Environment Variables
In production, use Render's environment variable management instead of `.env` files.

## API Reference

### Admin Endpoints
All endpoints require `HEADY_API_KEY` authentication:

- `GET /api/admin/config/render-yaml` - Get Render configuration
- `GET /api/admin/config/mcp` - Get MCP configuration
- `POST /api/admin/gpu/infer` - GPU inference
- `GET /api/admin/files` - Browse files
- `POST /api/admin/file` - Read/write files
- `GET /api/admin/ops` - List operations
- `POST /api/admin/build` - Start build
- `POST /api/admin/audit` - Start audit

### Authentication Headers
```bash
# Method 1: Header
x-heady-api-key: your_api_key_here

# Method 2: Authorization Bearer
Authorization: Bearer your_api_key_here
```

## Support

### Documentation
- [README.md](./README.md) - General project information
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines
- [SECURITY.md](./SECURITY.md) - Security policies

### Community
- GitHub Issues: Report bugs and request features
- Discussions: Community support and questions
- Wiki: Additional documentation and tutorials

### Getting Help
1. Check this guide first
2. Review the troubleshooting section
3. Search existing GitHub issues
4. Create a new issue with detailed information

---

**Heady Admin UI v1.0.0** - Part of the Sacred Geometry Ecosystem
