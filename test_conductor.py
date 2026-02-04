#!/usr/bin/env python3
"""
Test script for HeadyRegistry and HeadyConductor
"""

import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "HeadyAcademy"))

from HeadyRegistry import HeadyRegistry
from HeadyConductor import HeadyConductor


def test_registry():
    """Test HeadyRegistry functionality."""
    print("\n" + "="*80)
    print("TESTING HEADY REGISTRY")
    print("="*80 + "\n")
    
    registry = HeadyRegistry()
    
    print("✓ Registry initialized")
    
    summary = registry.get_summary()
    print(f"\n✓ Total capabilities: {summary['total_capabilities']}")
    print(f"  - Nodes: {summary['nodes']}")
    print(f"  - Workflows: {summary['workflows']}")
    print(f"  - Skills: {summary['skills']}")
    print(f"  - Services: {summary['services']}")
    print(f"  - Tools: {summary['tools']}")
    
    print("\n✓ Query test: 'mcp'")
    results = registry.query("mcp")
    total = sum(len(v) for v in results.values())
    print(f"  Found {total} results")
    
    print("\n✓ Query test: 'deploy'")
    results = registry.query("deploy")
    total = sum(len(v) for v in results.values())
    print(f"  Found {total} results")
    
    return True


def test_conductor():
    """Test HeadyConductor functionality."""
    print("\n" + "="*80)
    print("TESTING HEADY CONDUCTOR")
    print("="*80 + "\n")
    
    conductor = HeadyConductor()
    
    print("✓ Conductor initialized")
    
    print("\n✓ Test: Analyze request 'deploy the system'")
    plan = conductor.analyze_request("deploy the system")
    print(f"  Confidence: {plan['confidence']:.0%}")
    print(f"  Workflows found: {len(plan['workflows_to_execute'])}")
    
    print("\n✓ Test: Analyze request 'scan for gaps'")
    plan = conductor.analyze_request("scan for gaps")
    print(f"  Confidence: {plan['confidence']:.0%}")
    print(f"  Nodes to invoke: {len(plan['nodes_to_invoke'])}")
    
    print("\n✓ Test: Query capabilities 'security'")
    results = conductor.query_capabilities("security")
    print(f"  Total results: {results['total_results']}")
    
    print("\n✓ Test: Get system summary")
    summary = conductor.get_system_summary()
    print(f"  System status: {summary['system_status']}")
    print(f"  Total capabilities: {summary['registry']['total_capabilities']}")
    
    return True


def test_orchestration():
    """Test full orchestration."""
    print("\n" + "="*80)
    print("TESTING ORCHESTRATION")
    print("="*80 + "\n")
    
    conductor = HeadyConductor()
    
    print("✓ Test: Orchestrate 'run hcautobuild workflow'")
    result = conductor.orchestrate("run hcautobuild workflow")
    print(f"  Success: {result['success']}")
    print(f"  Workflows executed: {len(result['results']['workflows'])}")
    
    print("\n✓ Test: Orchestrate 'connect to mcp server'")
    result = conductor.orchestrate("connect to mcp server")
    print(f"  Success: {result['success']}")
    print(f"  Nodes invoked: {len(result['results']['nodes'])}")
    
    return True


def main():
    """Run all tests."""
    print("\n" + "╔" + "="*78 + "╗")
    print("║" + " "*20 + "HEADY CONDUCTOR TEST SUITE" + " "*32 + "║")
    print("╚" + "="*78 + "╝")
    
    try:
        test_registry()
        test_conductor()
        test_orchestration()
        
        print("\n" + "="*80)
        print("✓ ALL TESTS PASSED")
        print("="*80 + "\n")
        
        return 0
    
    except Exception as e:
        print(f"\n✗ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
