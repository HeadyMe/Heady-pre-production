# Heady Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
- Node.js 18+ & Python 3.11+
- Git installed

### 1. Clone & Install
```bash
git clone https://github.com/HeadyMe/Heady.git
cd Heady
npm install
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.template .env
# Edit .env with your API keys
```

**Minimum required in `.env`:**
```bash
HEADY_API_KEY=heady_live_your_key_here
HF_TOKEN=hf_your_huggingface_token_here
PORT=3300
```

### 3. Start Server
```bash
npm start
```

### 4. Access Admin UI
Open browser to: **http://localhost:3300/admin**

Enter your `HEADY_API_KEY` when prompted.

## 🎯 What You Can Do

- **Dashboard**: Monitor system health and resources
- **File Browser**: Edit code with Monaco editor
- **AI Assistant**: Get help with coding and debugging
- **Operations**: Run builds, audits, and GPU inference
- **Configuration**: Manage settings and deployment

## 🔧 Troubleshooting

**Server won't start?**
```bash
# Check port 3300 is free
netstat -an | findstr :3300

# Verify Node.js version
node --version  # Should be 18+
```

**API key error?**
- Ensure `HEADY_API_KEY` in `.env` matches UI input
- No spaces in API key

**Python worker issues?**
```bash
python src/process_data.py health
```

## 📚 Full Documentation
- [Complete Admin UI Guide](./ADMIN_UI_GUIDE.md)
- [Project README](./README.md)
- [Security Policy](./SECURITY.md)

## 🐳 Docker Option
```bash
docker-compose up -d
# Access: http://localhost:3300/admin
```

---

**Heady Systems** - Sacred Geometry Ecosystem
