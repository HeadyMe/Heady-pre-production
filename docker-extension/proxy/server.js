const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

/**
 * HeadyMCP Proxy for Docker Desktop
 * Bridges restricted UI environment to persistent MCP connections
 */
class HeadyMCPProxy {
  constructor() {
    this.clients = new Map();
  }

  async connectToServer(serverId, url) {
    console.log(`[HeadyProxy] Connecting to ${serverId} at ${url}`);
    const transport = new SSEClientTransport(new URL(url));
    const client = new Client({
      name: "heady-docker-proxy",
      version: "1.0.0"
    }, {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {}
      }
    });

    await client.connect(transport);
    this.clients.set(serverId, client);
    return client;
  }

  setupSocketEvents() {
    io.on("connection", (socket) => {
      console.log("[HeadyProxy] UI Client Connected");

      socket.on("mcp:call", async ({ serverId, toolName, args }) => {
        try {
          const client = this.clients.get(serverId);
          if (!client) throw new Error(`Server ${serverId} not connected`);
          
          const result = await client.callTool({
            name: toolName,
            arguments: args
          });
          socket.emit("mcp:result", { serverId, result });
        } catch (error) {
          socket.emit("mcp:error", { serverId, message: error.message });
        }
      });
    });
  }
}

const proxy = new HeadyMCPProxy();
proxy.setupSocketEvents();

const PORT = process.env.PROXY_PORT || 3701;
server.listen(PORT, () => {
  console.log(`[HeadyProxy] Sacred Bridge active on port ${PORT}`);
});
