# HeadyMCP Docker Desktop Integration

## Architecture: The "Limb" Extension

To integrate HeadyMCP into Docker Desktop, we use a **Distributed Node (Limb)** pattern. This allows HeadyMCP to live within the Docker ecosystem while remaining connected to the Heady Brain.

### 1. Component: Docker Desktop Extension
The extension acts as a **Visual Cortex (HeadyLens)** within Docker Desktop, providing:
- **Real-time MCP Server Monitoring**: View health and tool availability.
- **Direct Tool Execution**: Run MCP tools against containerized environments.
- **Resource Visualization**: See how MCP servers interact with your volumes and networks.

### 2. The Bridge: MCP Proxy
Since Docker Desktop extensions run in a restricted browser environment, a sidecar container (the **HeadyConductor Proxy**) handles the persistent WebSocket/SSE connections to the MCP servers.

### 3. Setup Protocol

#### Phase A: Metadata Definition
Create the `metadata.json` for the Docker Extension:
```json
{
  "icon": "public/sacred-geometry-logo.svg",
  "title": "HeadyMCP",
  "description": "Sacred Geometry AI Orchestration for Docker",
  "publisher": "HeadySystems",
  "vm": {
    "image": "headysystems/mcp-proxy:latest"
  },
  "ui": {
    "dashboard-tab": {
      "title": "HeadyLimb",
      "src": "index.html"
    }
  }
}
```

#### Phase B: Service Configuration
Integrate with existing `docker-compose.mcp.yml` by adding the extension labels:
```yaml
services:
  mcp-extension-proxy:
    image: headysystems/mcp-proxy:latest
    labels:
      - "com.docker.desktop.extension.api.version=>=0.3.0"
    networks:
      - heady-apps-network
```

## Implementation Strategy

1.  **Local Development**: Run `scripts/setup-docker-mcp.ps1` to prepare the environment.
2.  **Extension Build**: Use `docker extension build` to package the Heady UI.
3.  **Governance**: All actions performed through the Docker Desktop UI are logged to the immutable SHA-256 audit chain.

## Benefits
- **Deterministic Vitality**: Combining Docker's strict isolation with Heady's organic orchestration.
- **Zero-Config Discovery**: MCP servers in the same Docker network are automatically registered by the HeadyWindsurfRouter.
