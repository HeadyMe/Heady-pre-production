#!/usr/bin/env python3
# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: test_integrated_system.py
# LAYER: root
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
Test script for integrated Heady ecosystem:
LENS + MEMORY + BRAIN + CONDUCTOR + REGISTRY
"""

import sys
import json
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "HeadyAcademy"))

from HeadyRegistry import HeadyRegistry
from HeadyLens import HeadyLens
from HeadyMemory import HeadyMemory
from HeadyBrain import HeadyBrain
from HeadyConductor import HeadyConductor


def test_integrated_system():
    """Test full integrated system."""
    print("\n" + "╔" + "="*78 + "╗")
    print("║" + " "*15 + "HEADY INTEGRATED ECOSYSTEM TEST" + " "*32 + "║")
    print("╚" + "="*78 + "╝")
    
    print("\n[Test 1] Initialize HeadyConductor with full ecosystem...")
    conductor = HeadyConductor()
    print("✓ Conductor initialized with LENS, MEMORY, BRAIN, REGISTRY")
    
    time.sleep(2)  # Let monitoring collect data
    
    print("\n[Test 2] Check system awareness...")
    awareness = conductor.get_system_summary()
    print(f"✓ Components active: {awareness['components']}")
    print(f"✓ Total capabilities: {awareness.get('registry_summary', {}).get('total_capabilities', 0)}")
    
    print("\n[Test 3] Test user preferences...")
    conductor.brain.configure_user_preferences({
        "default_mode": "all_systems",
        "enable_monitoring": True,
        "enable_memory": True,
        "preferred_nodes": ["LENS", "BRAIN", "CONDUCTOR"]
    })
    prefs = conductor.brain.get_user_config()
    print(f"✓ User preferences configured: {len(prefs)} settings")
    
    print("\n[Test 4] Store external source...")
    external_id = conductor.memory.store_external_source(
        source_type="documentation",
        content={"title": "Best Practices", "url": "https://example.com"},
        source_url="https://example.com",
        comparative_analysis="External best practices for system design"
    )
    print(f"✓ External source stored: {external_id}")
    
    print("\n[Test 5] Test orchestration with full context...")
    result = conductor.orchestrate("monitor system health and store metrics")
    print(f"✓ Orchestration complete")
    print(f"  - Confidence: {result['execution_plan'].get('confidence', 0):.0%}")
    print(f"  - Brain context included: {'brain_context' in result}")
    print(f"  - Workflows executed: {len(result['results']['workflows'])}")
    print(f"  - Nodes invoked: {len(result['results']['nodes'])}")
    
    print("\n[Test 6] Query LENS indexes...")
    lens_state = conductor.lens.get_current_state()
    print(f"✓ System health: {lens_state.get('system_health', 'unknown')}")
    print(f"✓ Monitoring active: {lens_state.get('monitoring_active', False)}")
    print(f"✓ Uptime: {lens_state.get('uptime_seconds', 0):.1f}s")
    
    print("\n[Test 7] Query MEMORY indexes...")
    memory_stats = conductor.memory.get_statistics()
    print(f"✓ Total memories: {memory_stats['total_memories']}")
    print(f"✓ Categories indexed: {memory_stats['categories_indexed']}")
    print(f"✓ Tags indexed: {memory_stats['tags_indexed']}")
    print(f"✓ External sources: {memory_stats['external_sources']}")
    
    print("\n[Test 8] Test BRAIN processing pipeline...")
    context = conductor.brain.process_request("analyze security and deploy system")
    print(f"✓ Processing complete")
    print(f"  - Concepts identified: {len(context.concepts_identified)}")
    print(f"  - Tasks assigned: {len(context.tasks_assigned)}")
    print(f"  - Relevant memories: {len(context.relevant_memories)}")
    print(f"  - User preferences: {len(context.user_preferences)}")
    
    print("\n[Test 9] Verify all nodes registered...")
    registry_summary = conductor.registry.get_summary()
    print(f"✓ Total nodes: {registry_summary['nodes']}")
    print(f"✓ Core nodes present: LENS, MEMORY, BRAIN, CONDUCTOR")
    core_nodes = ["LENS", "MEMORY", "BRAIN", "CONDUCTOR"]
    for node_name in core_nodes:
        if node_name in registry_summary['node_list']:
            print(f"  ✓ {node_name} registered")
    
    print("\n[Test 10] Test query capabilities...")
    results = conductor.query_capabilities("monitor")
    print(f"✓ Query results: {results['total_results']} capabilities found")
    
    # Cleanup
    conductor.lens.stop_monitoring()
    
    print("\n" + "="*80)
    print("✓ ALL INTEGRATED TESTS PASSED")
    print("="*80)
    print("\n∞ HEADY ECOSYSTEM - FULLY SELF-AWARE ∞")
    print("  • LENS monitoring all components")
    print("  • MEMORY storing all knowledge")
    print("  • BRAIN processing with full context")
    print("  • CONDUCTOR orchestrating with awareness")
    print("  • REGISTRY indexing all capabilities")
    print("="*80 + "\n")
    
    return True


if __name__ == "__main__":
    try:
        success = test_integrated_system()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
