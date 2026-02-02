# Build & Setup Guide - Heady Systems Arena

## ⚡ Quick Start (Arena Mode)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Unified Manager**
   ```bash
   npm start
   ```
   *Runs on port 3300 by default.*

3. **Access Interfaces**
   - **Health Dashboard**: [http://localhost:3300/health-dashboard.html](http://localhost:3300/health-dashboard.html)
   - **HeadyIDE**: [http://localhost:3300/admin/index.html](http://localhost:3300/admin/index.html)
   - **Auto Demo**: [http://localhost:3300/demo.html](http://localhost:3300/demo.html)

## 🔧 MCP Configuration

The system uses `mcp_config.json` to define Model Context Protocol servers.
Ensure the paths in this file match your environment.

**Example `mcp_config.json`:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\erich\\Heady"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

## 🏗️ Architecture

- **Entry Point**: `heady-manager-unified.js`
  - Express Server (Security, Rate Limiting, CSP)
  - Orchestrator (Node simulation, Auto-scaling logic)
  - MCP Client (Connects to local MCP servers)
  - File System Admin API (Protected by API Key)
  - Hugging Face Proxy (Inference & Generation)

## 🎨 Design System

- **Theme**: `public/css/heady-theme.css`
- **Visuals**: Sacred Geometry SVG backgrounds, "Breathing" animations, Glassmorphism cards.
- **Colors**: Cyan (`#00d4ff`) & Indigo (`#6366f1`) gradients on dark backgrounds.

## 🧪 Verification

Run the **Auto Demo** (`/demo.html`) to verify:
1. Orchestrator can provision nodes.
2. File System API can write/read files.
3. AI Proxy works (requires `HF_TOKEN` in `.env`).
4. MCP Client can list tools from connected servers.
