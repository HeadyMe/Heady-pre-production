# Heady Systems - Official Local Development Repository

**Heady** is a hybrid Node.js/Python data-processing framework designed for the HeadyConnection ecosystem. It provides a unified platform for AI-powered data processing, MCP (Model Context Protocol) integration, and real-time system monitoring with Sacred Geometry aesthetics.

## 🌟 Features

- **Hybrid Architecture**: Node.js manager layer + Python data processing workers
- **MCP Integration**: Full Model Context Protocol server support
- **AI-Powered**: Hugging Face Inference API integration for text generation and embeddings
- **Real-Time Monitoring**: Docker integration and system pulse monitoring
- **Sacred Geometry UI**: Beautiful single-file React dashboard
- **Secure by Default**: Rate limiting, CORS, API key authentication
- **Production Ready**: Render.com blueprint for one-click deployment

## 🏗️ Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| `heady-manager.js` | Node.js/Express | MCP server, API endpoints, static file serving |
| `src/process_data.py` | Python 3.11+ | Background data processing worker |
| `public/index.html` | React (CDN) | Sacred Geometry UI dashboard |
| `render.yaml` | Render Blueprint | Infrastructure-as-code deployment |

### System Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Client     │──────▶│ heady-manager│──────▶│ Python Worker│
│  (Browser)   │      │  (Express)   │      │ (process_data)│
└──────────────┘      └──────────────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Hugging Face │
                      │     API      │
                      └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Python** 3.11+
- **npm** or **yarn**
- **Docker** (optional, for containerization)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HeadyMe/Heady.git
   cd Heady
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the project root:
   ```bash
   # Required
   HEADY_API_KEY=your-secure-random-key-here
   HF_TOKEN=your-huggingface-token
   
   # Optional
   PORT=3300
   DATABASE_URL=postgresql://user:pass@localhost:5432/heady
   NODE_ENV=development
   
   # Rate Limiting
   HEADY_RATE_LIMIT_WINDOW_MS=60000
   HEADY_RATE_LIMIT_MAX=120
   
   # CORS
   HEADY_CORS_ORIGINS=http://localhost:3000,http://localhost:3300
   HEADY_TRUST_PROXY=false
   
   # Hugging Face Models
   HF_TEXT_MODEL=gpt2
   HF_EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
   HF_MAX_CONCURRENCY=4
   
   # Python Worker
   HEADY_PYTHON_BIN=python
   HEADY_PY_MAX_CONCURRENCY=2
   HEADY_PY_WORKER_TIMEOUT_MS=90000
   ```

### Running the Application

**Development Mode:**
```bash
npm start
```

The server will start on `http://localhost:3300` (or the port specified in `.env`).

**Python Worker:**
```bash
python src/process_data.py
```

### Running Tests

```bash
# Python syntax check
python -m compileall src

# Run CI checks locally
npm run test  # (when tests are added)
```

## 📚 API Endpoints

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves Sacred Geometry UI |
| `/api/health` | GET | Health check and service status |
| `/api/pulse` | GET | System status with Docker info |

### Protected Endpoints (Require API Key)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hf/infer` | POST | Raw Hugging Face model inference |
| `/api/hf/generate` | POST | Text generation with HF models |
| `/api/hf/embed` | POST | Generate embeddings for text |

**Authentication:**
Use header `X-Heady-Api-Key: your-api-key` or `Authorization: Bearer your-api-key`

## 🔧 Configuration

### Environment Variables

See the `.env` example above for all available configuration options.

### MCP Configuration

The `mcp_config.json` file configures Model Context Protocol servers. Use environment variables for sensitive data:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"]
    }
  }
}
```

### Render Deployment

The `render.yaml` blueprint defines infrastructure. Environment variables are managed through Render's `heady-shared-secrets` group.

## 🧪 Development

### Project Structure

```
Heady/
├── .github/
│   ├── copilot-instructions.md    # GitHub Copilot guidance
│   ├── copilot-mcp-config.json    # MCP server config for Copilot
│   └── workflows/                 # GitHub Actions CI/CD
├── docs/                          # Additional documentation
├── public/                        # Static frontend files
│   └── index.html                # Sacred Geometry UI
├── src/                          # Source code
│   └── process_data.py           # Python data processing worker
├── heady-manager.js              # Main Node.js server
├── package.json                  # Node.js dependencies
├── requirements.txt              # Python dependencies
├── render.yaml                   # Render.com deployment config
└── mcp_config.json              # MCP server configuration
```

### Code Style

- **Node.js**: ES6+, async/await, Express middleware patterns
- **Python**: PEP 8, type hints encouraged, descriptive variable names
- **React**: Functional components, hooks, inline styles for single-file apps
- **Comments**: Minimal but meaningful; code should be self-documenting

### Adding Dependencies

**Node.js:**
```bash
npm install package-name
```

**Python:**
```bash
pip install package-name
pip freeze > requirements.txt  # Update requirements
```

## 🤖 GitHub Copilot Customization

This repository is optimized for GitHub Copilot with custom instructions in `.github/copilot-instructions.md`.

### Key Features:

- **Quiz & Flashcard Methodology**: All documentation follows a structured Q&A approach
- **MCP Integration**: Custom MCP servers for enhanced code intelligence
- **Workflow Automation**: Automated setup via `.github/workflows/copilot-setup-steps.yml`

### Setup:

1. Review `.github/copilot-instructions.md` for coding patterns
2. Configure environment variables in `.github/copilot-mcp-config.json`
3. Run the setup workflow: `gh workflow run copilot-setup-steps.yml`

## 🔒 Security

- **API Key Authentication**: All protected endpoints require valid API keys
- **Rate Limiting**: Configurable rate limits per IP address
- **CORS Protection**: Strict origin validation
- **Security Headers**: Content Security Policy, X-Frame-Options, etc.
- **Secrets Management**: Never commit `.env` files; use Render's secret groups

### Generating a Secure API Key

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

## 🌐 Deployment

### Render.com (Recommended)

1. Fork this repository
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`
5. Configure environment variables in the Render dashboard
6. Deploy!

### Manual Deployment

```bash
# Build (if needed)
npm install --production

# Start server
NODE_ENV=production node heady-manager.js
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change PORT in .env or kill existing process
lsof -ti:3300 | xargs kill
```

**Python dependencies not found:**
```bash
# Activate virtual environment first
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**Docker connection failed:**
- Ensure Docker daemon is running
- Check Docker permissions for your user

## 📖 Non-Obvious Dependencies

- **Docker**: Optional but recommended for `/api/pulse` endpoint
- **Hugging Face Account**: Required for AI features (get token at huggingface.co)
- **PostgreSQL**: Optional, for advanced MCP features

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📜 License

See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Hugging Face for AI inference API
- Render.com for deployment platform
- Model Context Protocol community

---

**∞ Heady Systems - Where Code Meets Consciousness ∞**
