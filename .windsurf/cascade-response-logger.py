#!/usr/bin/env python3
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
# ║  FILE: .windsurf/cascade-response-logger.py                       ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
CASCADE RESPONSE LOGGER
Logs Cascade responses to HeadyMemory for learning and context preservation.
"""

import sys
import json
import requests
from datetime import datetime

HEADY_MANAGER_URL = "http://localhost:3300"

def log_to_file(message):
    """Log to file for debugging."""
    try:
        with open("C:/Users/erich/Heady/.windsurf/cascade-proxy.log", "a") as f:
            f.write(f"[{datetime.now().isoformat()}] {message}\n")
    except:
        pass

def main():
    try:
        # Read hook input from stdin
        hook_input = json.loads(sys.stdin.read())
        
        tool_info = hook_input.get("tool_info", {})
        response_text = tool_info.get("response", "")
        
        if not response_text:
            sys.exit(0)
        
        log_to_file(f"Logging Cascade response: {response_text[:100]}...")
        
        # Store in HeadyMemory via conductor
        try:
            requests.post(
                f"{HEADY_MANAGER_URL}/api/conductor/orchestrate",
                json={
                    "request": f"store_cascade_response: {response_text[:500]}"
                },
                timeout=5
            )
        except:
            pass
        
        sys.exit(0)
            
    except Exception as e:
        log_to_file(f"Error in response logger: {str(e)}")
        sys.exit(0)

if __name__ == "__main__":
    main()
