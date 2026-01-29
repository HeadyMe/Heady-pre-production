# GitHub Copilot Instructions for Heady Project

## Project Overview

Heady is a hybrid Node.js/Python data-processing framework with integrated Hugging Face model support, PostgreSQL persistence, and Model Context Protocol (MCP) capabilities. The project follows a "Sacred Geometry" design philosophy emphasizing harmony, structure, and intelligent data flow.

## Technology Stack

### Backend
- **Node.js (Express)**: API gateway and MCP server (`heady-manager.js`)
- **Python 3.8+**: Data processing core (`heady_project/`)
- **PostgreSQL**: Persistence layer for audit trails and data storage
- **Docker**: Optional containerization support

### Key Libraries
- **Python**: `psycopg2-binary`, `requests`, `transformers`, `huggingface-hub`
- **Node.js**: `express`, `cors`, `dockerode`, `@modelcontextprotocol/sdk`

### Testing & Quality
- **pytest**: Python testing framework
- **pytest-cov**: Coverage reporting
- **black**: Python code formatting (100 char line length)
- **mypy**: Static type checking

## Project Structure

```
heady_project/          # Python core library
  ├── __init__.py      # Package initialization
  └── core.py          # Core functions: mint_coin(), HeadyArchive

heady-manager.js        # Node.js API server (port 3300)
admin_console.py        # CLI for admin operations
execute_build.py        # Single project build automation
consolidated_builder.py # Multi-project builder
tests/                  # Test suite
```

## Build & Run Instructions

### Development Setup
```bash
# Install all dependencies
npm install
pip install -r requirements.txt

# Or use modern Python packaging
pip install -e ".[dev]"
```

### Running the Server
```bash
# Start the Heady Manager API
node heady-manager.js
# Service runs on http://localhost:3300
```

### Running Tests
```bash
# Run all tests with coverage
pytest tests/ -v --cov=heady_project

# Run specific test file
pytest tests/test_core.py -v

# Run integration tests
pytest tests/test_integration.py -v
```

### Build Commands
```bash
# Build single project
python execute_build.py --config build_config.json

# Build all projects (sequential)
python consolidated_builder.py --config projects.json

# Build all projects (parallel)
python consolidated_builder.py --config projects.json --parallel --workers 4

# Build with specific version
python execute_build.py --version 1.2.3
```

### Admin Console
```bash
# Check health
python admin_console.py health

# View audit logs
python admin_console.py audit --limit 50

# Real-time monitoring
python admin_console.py monitor --interval 30
```

## Code Conventions

### Python
- **Type Hints**: All functions must have type hints for parameters and return values
- **Docstrings**: Use Google-style docstrings with Args, Returns, Raises sections
- **Logging**: Use `logging` module, never `print()` for operational messages
- **Line Length**: 100 characters (configured in pyproject.toml)
- **Formatting**: Use `black` for consistent formatting

Example:
```python
def mint_coin(
    value: float,
    currency: str = "USD",
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create a new coin (data token) with specified value.
    
    Args:
        value: The numerical value of the coin
        currency: The currency type (default: USD)
        metadata: Optional metadata dictionary
    
    Returns:
        Dictionary containing coin details with timestamp and unique ID
    """
    logger.info(f"Minting coin: {value} {currency}")
    # Implementation...
```

### JavaScript/Node.js
- **Async/Await**: Prefer async/await over callbacks or raw promises
- **Error Handling**: Use try/catch with proper error middleware
- **Express Patterns**: Use `asyncHandler` wrapper for async route handlers
- **Environment Variables**: Always provide defaults and validation

## Important Architectural Elements

### 1. Parameterization
- **Never hardcode** version strings, URLs, or configuration values
- Use environment variables with sensible defaults
- Version information flows from `HEADY_VERSION` env var or package version
- Example: `version = os.getenv("HEADY_VERSION", "1.0.0")`

### 2. Structured Logging
- All modules use Python `logging` or console logging in Node.js
- Include context in log messages (IDs, counts, timestamps)
- Log levels: DEBUG for development, INFO for operations, ERROR for failures
- Include structured extra data where possible

### 3. Hugging Face Integration
- Default text model: `gpt2` (configurable via `HF_TEXT_MODEL`)
- Default embedding model: `sentence-transformers/all-MiniLM-L6-v2` (via `HF_EMBED_MODEL`)
- Always include `wait_for_model: true` option for reliability
- Handle 503 responses with retry logic (model loading)

### 4. Security
- API key authentication via `x-heady-api-key` header
- Secrets via environment variables, never hardcoded
- Database credentials via `DATABASE_URL`
- MCP config uses `${VAR}` substitution for secrets

### 5. Error Handling
- Python: Raise specific exceptions with clear messages
- Node.js: Use error middleware, return proper HTTP status codes
- Always log errors before raising/throwing
- Include error context in responses

## Configuration Files

### render.yaml
- Defines Render.com deployment
- Environment variables reference secrets via `sync: false` or `generateValue: true`
- Database provisioned automatically
- Health checks at `/api/health`

### mcp_config.json
- Configures Model Context Protocol servers
- Each server has description and allowedTools
- Secrets via `${ENV_VAR}` syntax
- Postgres connection uses `${DATABASE_URL}`

### pyproject.toml
- Modern Python packaging
- Scripts: `heady-build`, `heady-builder`, `heady-admin`
- Test configuration in `[tool.pytest.ini_options]`
- Development dependencies in `[project.optional-dependencies]`

## Common Tasks

### Adding a New API Endpoint
1. Add route handler in `heady-manager.js`
2. Use `asyncHandler` wrapper
3. Add `requireApiKey` middleware if needed
4. Document in README API Reference section
5. Add integration test

### Adding Python Functionality
1. Add function to `heady_project/core.py`
2. Include type hints and docstring
3. Export in `heady_project/__init__.py`
4. Add unit tests in `tests/test_core.py`
5. Update README with usage example

### Environment Variable Changes
1. Update `render.yaml` if needed for deployment
2. Update `.env.example` (if it exists)
3. Update README Quick Start section
4. Add validation in code with clear error messages

## Testing Philosophy

- **Unit tests**: Test individual functions in isolation
- **Integration tests**: Test complete workflows (build, admin operations)
- **Mock external services**: Don't hit real Hugging Face API in tests
- **Fixtures**: Use pytest fixtures for common setup
- **Coverage goal**: >80% for core modules

## Deployment Considerations

- Service runs on Render.com via `render.yaml` blueprint
- Auto-scaling based on health checks
- PostgreSQL database auto-provisioned
- Environment secrets managed via Render dashboard
- Build command installs both npm and pip dependencies

---

**Remember**: Heady emphasizes clean architecture, type safety, structured logging, and parameterized configuration. When in doubt, follow the existing patterns in the codebase.