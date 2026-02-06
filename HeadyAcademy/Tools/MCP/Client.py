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
# ║  FILE: HeadyAcademy/Tools/MCP/Client.py                           ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import sys
import json
import subprocess
from pathlib import Path

# Simple Client to test local MCP Server connection

SERVER_SCRIPT = Path(__file__).parent / "Server.py"

def run_client(command):
    # Launch Server
    process = subprocess.Popen(
        [sys.executable, str(SERVER_SCRIPT)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    
    # Send Initialize
    init_req = {"jsonrpc": "2.0", "method": "initialize", "id": 1}
    process.stdin.write(json.dumps(init_req) + "\n")
    process.stdin.flush()
    print(f"Server Init: {process.stdout.readline().strip()}")
    
    # Send Command
    if command == "list":
        req = {"jsonrpc": "2.0", "method": "tools/list", "id": 2}
    else:
        # Assume command is tool call: scan_gaps:./ or verify_auth:User:ADMIN
        parts = command.split(":") if ":" in command else [command]
        tool = parts[0]
        arguments = {}
        if tool == "verify_auth":
            arguments = {
                "user": parts[1] if len(parts) > 1 else "",
                "role": parts[2] if len(parts) > 2 else ""
            }
        else:
            arguments = {"path": parts[1] if len(parts) > 1 else "."}

        req = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "id": 2,
            "params": {"name": tool, "arguments": arguments}
        }

    process.stdin.write(json.dumps(req) + "\n")
    process.stdin.flush()
    
    # Read Result
    print(f"Response: {process.stdout.readline().strip()}")
    process.terminate()

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "list"
    run_client(cmd)
