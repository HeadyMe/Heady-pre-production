#!/usr/bin/env python3
# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: .windsurf/cascade-heady-proxy.py
# LAYER: integration
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
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
        
        log_to_file(f"Hook triggered: {hook_input.get('agent_action_name')}")
        
        # Extract user prompt
        tool_info = hook_input.get("tool_info", {})
        user_prompt = tool_info.get("prompt", "")
        
        if not user_prompt:
            log_to_file("No prompt found, skipping orchestration")
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
            print("∞ HEADY ORCHESTRATION COMPLETE ∞")
            print("="*80)
            print(f"\nConfidence: {result.get('execution_plan', {}).get('confidence', 0):.0%}")
            print(f"Nodes Invoked: {len(result.get('results', {}).get('nodes', []))}")
            print(f"Workflows Executed: {len(result.get('results', {}).get('workflows', []))}")
            print(f"Services Managed: {len(result.get('results', {}).get('services', []))}")
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
