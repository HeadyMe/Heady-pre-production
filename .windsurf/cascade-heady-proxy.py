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
# ║  FILE: .windsurf/cascade-heady-proxy.py                           ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
CASCADE-HEADY PROXY
Intercepts all Cascade user prompts and routes them through HeadyConductor
for intelligent orchestration before returning to Cascade.

This ensures ALL user interactions are processed by Heady services.
"""

import sys
import json
import requests
from datetime import datetime

HEADY_MANAGER_URL = "http://localhost:3300"
TIMEOUT = 30

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
        
        log_to_file(f"Hook triggered: {hook_input.get('agent_action_name', hook_input.get('action', 'unknown'))}")
        log_to_file(f"Hook input keys: {list(hook_input.keys())}")
        
        # Log tool_info structure for debugging
        tool_info = hook_input.get("tool_info") or {}
        log_to_file(f"tool_info keys: {list(tool_info.keys()) if isinstance(tool_info, dict) else type(tool_info).__name__}")
        log_to_file(f"tool_info content: {json.dumps(tool_info, default=str)[:500]}")
        
        # Extract user prompt - search multiple possible field paths
        user_prompt = None
        
        # UUID pattern to exclude
        import re
        uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.I)
        
        # Try top-level fields first
        top_level_prompt_keys = ["prompt", "user_prompt", "message", "content", "input", "text", "query"]
        for key in top_level_prompt_keys:
            val = hook_input.get(key)
            if val and isinstance(val, str) and len(val.strip()) > 0 and not uuid_pattern.match(val.strip()):
                user_prompt = val.strip()
                log_to_file(f"Found prompt in top-level field '{key}'")
                break
        
        # Try inside tool_info
        if not user_prompt and isinstance(tool_info, dict):
            for key in top_level_prompt_keys + ["description", "args", "command"]:
                val = tool_info.get(key)
                if val and isinstance(val, str) and len(val.strip()) > 0 and not uuid_pattern.match(val.strip()):
                    user_prompt = val.strip()
                    log_to_file(f"Found prompt in tool_info.{key}")
                    break
            # Check nested dicts inside tool_info
            if not user_prompt:
                for key, val in tool_info.items():
                    if isinstance(val, dict):
                        for subkey in top_level_prompt_keys:
                            subval = val.get(subkey)
                            if subval and isinstance(subval, str) and len(subval.strip()) > 0 and not uuid_pattern.match(subval.strip()):
                                user_prompt = subval.strip()
                                log_to_file(f"Found prompt in tool_info.{key}.{subkey}")
                                break
                    if user_prompt:
                        break
        
        # Try inside data/payload/params
        for container_key in ["data", "payload", "params", "args"]:
            if user_prompt:
                break
            container = hook_input.get(container_key)
            if isinstance(container, dict):
                for key in top_level_prompt_keys:
                    val = container.get(key)
                    if val and isinstance(val, str) and len(val.strip()) > 0 and not uuid_pattern.match(val.strip()):
                        user_prompt = val.strip()
                        log_to_file(f"Found prompt in {container_key}.{key}")
                        break
        
        if not user_prompt:
            log_to_file(f"No prompt found. Full input: {json.dumps(hook_input, default=str)[:800]}")
            sys.exit(0)
        
        log_to_file(f"User prompt: {user_prompt[:100]}...")
        
        # Check if heady-manager is running
        try:
            health_response = requests.get(
                f"{HEADY_MANAGER_URL}/api/health",
                timeout=5
            )
            if not health_response.ok:
                log_to_file("Heady Manager not healthy, allowing direct Cascade processing")
                sys.exit(0)
        except requests.exceptions.RequestException:
            log_to_file("Heady Manager not reachable, allowing direct Cascade processing")
            sys.exit(0)
        
        # Route to HeadyConductor for orchestration
        log_to_file("Routing to HeadyConductor...")
        
        orchestration_response = requests.post(
            f"{HEADY_MANAGER_URL}/api/conductor/orchestrate",
            json={"request": user_prompt},
            timeout=TIMEOUT
        )
        
        if orchestration_response.ok:
            result = orchestration_response.json()
            log_to_file(f"HeadyConductor response: {json.dumps(result, indent=2)[:500]}...")
            
            # Output orchestration context for Cascade to use
            print("\n" + "="*80)
            print("[HEADY] ORCHESTRATION COMPLETE")
            print("="*80)
            exec_plan = result.get('execution_plan', result.get('context', {}).get('execution_plan', {}))
            results_data = result.get('results', {})
            print(f"\nConfidence: {exec_plan.get('confidence', 'N/A')}")
            if isinstance(results_data, dict):
                print(f"Nodes Invoked: {len(results_data.get('nodes', []))}")
                print(f"Workflows Executed: {len(results_data.get('workflows', []))}")
                print(f"Services Managed: {len(results_data.get('services', []))}")
            print("\nHeadyConductor has processed your request with optimal execution.")
            print("="*80 + "\n")
            
            # Allow Cascade to continue with enriched context
            sys.exit(0)
        else:
            log_to_file(f"Orchestration failed: {orchestration_response.status_code}")
            # Allow Cascade to continue even if orchestration fails
            sys.exit(0)
            
    except Exception as e:
        log_to_file(f"Error in proxy: {str(e)}")
        # Never block Cascade on errors
        sys.exit(0)

if __name__ == "__main__":
    main()
