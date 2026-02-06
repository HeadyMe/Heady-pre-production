# HEADY_BRAND:BEGIN
# ╔══════════════════════════════════════════════════════════════════╗
# ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
# ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
# ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
# ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
# ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
# ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
# ║                                                                  ║
# ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
# ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
# ║  FILE: backend/python_worker/heady_project/mcp_service.py         ║
# ║  LAYER: backend                                                   ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import asyncio
import json
import os
import subprocess
import logging
import threading
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

MCP_CONFIG_PATH = ".github/copilot-mcp-config.json"

class MCPServerInstance:
    def __init__(self, name: str, config: Dict):
        self.name = name
        self.config = config
        self.process: Optional[subprocess.Popen] = None
        self.lock = threading.Lock()

    def start(self):
        if self.process and self.process.poll() is None:
            return

        command = self.config.get("command")
        args = self.config.get("args", [])
        env = os.environ.copy()
        env.update(self.config.get("env", {}))

        # Ensure we can find npx/node
        # env['PATH'] should be inherited

        logger.info(f"Starting MCP server {self.name}: {command} {args}")
        try:
            self.process = subprocess.Popen(
                [command] + args,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE, # Capture stderr to avoid pollution
                env=env,
                text=True,
                bufsize=1 # Line buffered
            )
            # We could start a thread to log stderr
        except Exception as e:
            logger.error(f"Failed to start {self.name}: {e}")

    def send_request(self, method: str, params: Any = None) -> Dict:
        with self.lock:
            if not self.process or self.process.poll() is not None:
                self.start()
                if not self.process:
                    return {"error": "Server not running"}

            req_id = os.urandom(4).hex()
            request = {
                "jsonrpc": "2.0",
                "method": method,
                "params": params or {},
                "id": req_id
            }

            try:
                json_str = json.dumps(request)
                logger.debug(f"Sending to {self.name}: {json_str}")
                self.process.stdin.write(json_str + "\n")
                self.process.stdin.flush()

                # Simple blocking read of response
                # We assume the server replies with one JSON line per request
                # This is a simplification of full JSON-RPC
                while True:
                    line = self.process.stdout.readline()
                    if not line:
                        return {"error": "Server connection closed"}

                    try:
                        data = json.loads(line)
                        if data.get("id") == req_id:
                            return data.get("result", data)
                        # If id doesn't match (e.g. notification), ignore or log
                        logger.debug(f"Ignored non-matching response: {line}")
                    except json.JSONDecodeError:
                        logger.debug(f"Ignored non-json output: {line}")
                        pass

            except Exception as e:
                logger.error(f"RPC Error: {e}")
                return {"error": str(e)}

class MCPService:
    def __init__(self):
        self.servers: Dict[str, MCPServerInstance] = {}
        self.load_config()

    def load_config(self):
        if os.path.exists(MCP_CONFIG_PATH):
            try:
                with open(MCP_CONFIG_PATH, "r") as f:
                    data = json.load(f)
                    for name, conf in data.get("mcpServers", {}).items():
                        if conf.get("type") == "local":
                            self.servers[name] = MCPServerInstance(name, conf)
            except Exception as e:
                logger.error(f"Failed to load MCP config: {e}")

    def list_servers(self) -> List[str]:
        return list(self.servers.keys())

    async def execute_tool(self, server_name: str, tool_name: str, arguments: Dict[str, Any]):
        server = self.servers.get(server_name)
        if not server:
            return {"error": "Server not found"}

        loop = asyncio.get_running_loop()
        # "tools/call" is the standard MCP method to execute a tool
        result = await loop.run_in_executor(
            None,
            server.send_request,
            "tools/call",
            {"name": tool_name, "arguments": arguments}
        )
        return result

mcp_service = MCPService()
