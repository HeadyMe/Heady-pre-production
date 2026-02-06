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
# ║  FILE: test_hf_integration.py                                     ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import sys
import os
from pathlib import Path
import json

# Add project root to path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from HeadyAcademy.HeadyRegistry import HeadyRegistry
from HeadyAcademy.Tools.HuggingFace_Tool import run_inference

def test_registry_update():
    print("Testing Registry Update...")
    registry = HeadyRegistry(str(project_root))
    
    # Force discovery to ensure we pick up changes
    print("Forcing discovery...")
    registry.discover_all()
    registry.save()
    
    # Check for PYTHIA node
    if "PYTHIA" in registry.nodes:
        print("[PASS] PYTHIA node found in registry")
        node = registry.nodes["PYTHIA"]
        print(f"  Role: {node.role}")
        print(f"  Tool: {node.primary_tool}")
    else:
        print("[FAIL] PYTHIA node NOT found in registry")
        
    # Check for HuggingFace tool
    # The tool name is derived from filename stem: HuggingFace_Tool
    tool_name = "HuggingFace_Tool"
    if tool_name in registry.tools:
        print(f"[PASS] {tool_name} found in registry")
    else:
        print(f"[FAIL] {tool_name} NOT found in registry. Tools list: {list(registry.tools.keys())}")

def test_tool_execution():
    print("\nTesting HuggingFace Tool Execution...")
    
    # Simple sentiment analysis test (fast, no heavy download usually)
    print("Running sentiment analysis...")
    result = run_inference(
        task="sentiment-analysis",
        input_text="Heady Systems is an amazing project with sacred geometry architecture."
    )
    
    if result["success"]:
        print("[PASS] Inference successful")
        print(f"  Result: {result['result']}")
    else:
        print(f"[FAIL] Inference failed: {result.get('error')}")

if __name__ == "__main__":
    test_registry_update()
    test_tool_execution()
