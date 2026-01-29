# Heady - Data Processing Framework

## Overview

**Heady** is a comprehensive data-processing framework that combines Node.js API services with Python-based data processing capabilities. It provides a unified platform for building, deploying, and monitoring data-driven applications with built-in support for Hugging Face models, PostgreSQL persistence, and Model Context Protocol (MCP) integration.

## Architecture

The Heady ecosystem consists of three main components:

### 1. Heady Manager (Node.js)
- **Location**: `heady-manager.js`
- **Purpose**: API Gateway and MCP Server
- **Port**: 3300
- **Features**:
  - RESTful API endpoints for Hugging Face inference
  - Text generation via `/api/hf/generate`
  - Embeddings via `/api/hf/embed`
  - Generic inference via `/api/hf/infer`
  - Health monitoring at `/api/health` and `/api/pulse`
  - Docker integration for container management

### 2. Heady Project (Python)
- **Location**: `heady_project/`
- **Purpose**: Core data processing library
- **Features**:
  - Data tokenization with `mint_coin()`
  - Archive management with `HeadyArchive`
  - Structured logging throughout
  - Type-hinted APIs for better IDE support

### 3. Admin Console (Python)
- **Location**: `admin_console.py`
- **Purpose**: Administration and monitoring
- **Features**:
  - System health checks
  - Audit logging (JSONL format)
  - Real-time monitoring with configurable intervals
  - API integration for remote management

## Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+
- **PostgreSQL** (optional, for persistence)
- **Docker** (optional, for containerized workflows)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/HeadyMe/Heady.git
   cd Heady
   ```

2. **Install dependencies**:
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   pip install -r requirements.txt
   # Or use modern Python tooling:
   pip install -e .
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root:
   ```env
   # Required
   HEADY_API_KEY=your-secret-api-key
   HF_TOKEN=your-huggingface-token
   
   # Optional
   DATABASE_URL=postgresql://user:pass@localhost:5432/heady_db
   CLOUDFLARE_API_TOKEN=your-cloudflare-token
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   HF_TEXT_MODEL=gpt2
   HF_EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
   ```

4. **Start the Heady Manager**:
   ```bash
   npm start
   # Or directly:
   node heady-manager.js
   ```

5. **Verify installation**:
   ```bash
   curl http://localhost:3300/api/health
   ```

## Development Workflow

### Building Projects

Use the build scripts to automate compilation and testing:

```bash
# Single project build
python execute_build.py --config build_config.json

# Build with custom version
python execute_build.py --version 1.2.3

# Build multiple projects
python consolidated_builder.py --config projects.json

# Parallel builds
python consolidated_builder.py --parallel --workers 4
```

### Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=heady_project --cov-report=html

# Run specific test file
pytest tests/test_core.py -v
```

### Admin Console Operations

```bash
# Check system health
python admin_console.py health

# View audit logs
python admin_console.py audit --limit 50

# Filter logs by event type
python admin_console.py audit --event system_monitor

# Monitor in real-time (30-second intervals)
python admin_console.py monitor --interval 30

# Monitor for specific duration
python admin_console.py monitor --interval 15 --duration 300
```

### Using the Python API

```python
from heady_project import mint_coin, HeadyArchive

# Create a data coin
coin = mint_coin(100.0, "USD", metadata={"source": "payment"})
print(coin["id"])  # coin_1234567890.123

# Archive data
archive = HeadyArchive(archive_path="./data/archive")
identifier = archive.preserve({"user": "alice", "action": "login"})

# Retrieve archived data
data = archive.retrieve(identifier)
print(data)  # {"user": "alice", "action": "login"}
```

## API Reference

### Heady Manager Endpoints

#### `GET /api/health`
Returns service health status.

**Response**:
```json
{
  "ok": true,
  "service": "heady-manager",
  "ts": "2026-01-29T22:00:00.000Z",
  "uptime_s": 3600,
  "env": {
    "has_hf_token": true,
    "has_heady_api_key": true
  }
}
```

#### `POST /api/hf/generate`
Generate text using Hugging Face models.

**Headers**: `x-heady-api-key: your-api-key`

**Request**:
```json
{
  "prompt": "Once upon a time",
  "model": "gpt2",
  "parameters": {
    "max_length": 50,
    "temperature": 0.7
  }
}
```

**Response**:
```json
{
  "ok": true,
  "model": "gpt2",
  "output": "Once upon a time, in a land far away..."
}
```

#### `POST /api/hf/embed`
Generate embeddings for text.

**Headers**: `x-heady-api-key: your-api-key`

**Request**:
```json
{
  "text": "Hello, world!",
  "model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

**Response**:
```json
{
  "ok": true,
  "model": "sentence-transformers/all-MiniLM-L6-v2",
  "embeddings": [0.123, -0.456, 0.789, ...]
}
```

## Deployment

### Render.com

The project includes a `render.yaml` blueprint for one-click deployment:

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically:
   - Deploy the Heady Manager as a web service
   - Provision a PostgreSQL database
   - Set up environment variables
   - Configure health checks

### Environment Variables on Render

The following environment variables are automatically configured:
- `HEADY_API_KEY` - Auto-generated secure key
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Service port (3300)

You need to manually add:
- `HF_TOKEN` - Your Hugging Face API token
- `CLOUDFLARE_API_TOKEN` (if using Cloudflare)
- `CLOUDFLARE_ACCOUNT_ID` (if using Cloudflare)

## GitHub Copilot Customization

Heady is optimized for GitHub Copilot with several enhancements:

### 1. Custom Instructions
Located in `.github/copilot-instructions.md`, these provide Copilot with:
- Project structure and architecture
- Coding conventions and patterns
- Build and test commands
- Common development tasks

### 2. Pre-installation Steps
The `.github/workflows/copilot-setup-steps.yml` workflow ensures:
- Dependencies are installed before Copilot runs
- Environment variables are properly configured
- Development tools are available

### 3. MCP Servers
The `.github/copilot-mcp-config.json` enables Copilot to:
- Access local filesystem for code navigation
- Query PostgreSQL database
- Fetch external resources
- Perform Git operations
- Integrate with Cloudflare APIs

These enhancements make Copilot context-aware and significantly more helpful when working with Heady code.

## Project Structure

```
Heady/
├── heady_project/          # Python package
│   ├── __init__.py
│   └── core.py             # Core functionality
├── tests/                  # Test suite
│   ├── test_core.py
│   ├── test_build.py
│   └── test_admin.py
├── .github/
│   ├── workflows/
│   │   ├── ci.yml          # CI/CD pipeline
│   │   └── copilot-setup-steps.yml
│   ├── agents/
│   │   └── copilot-insturctions.agent.md
│   ├── copilot-instructions.md
│   └── copilot-mcp-config.json
├── heady-manager.js        # Node.js API server
├── admin_console.py        # Admin CLI
├── execute_build.py        # Build automation
├── consolidated_builder.py # Multi-project builder
├── render.yaml             # Render deployment config
├── mcp_config.json         # MCP server configuration
├── pyproject.toml          # Python project metadata
├── requirements.txt        # Python dependencies
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run linters and tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/HeadyMe/Heady/issues)
- **Documentation**: This README and inline code documentation
- **Community**: GitHub Discussions (coming soon)

---

**Built with ♾️ by Heady Systems**
