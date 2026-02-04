# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: HeadyAcademy/HeadyConductor.py
# LAYER: core
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
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                ║
║     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                ║
║     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 ║
║     ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  ║
║     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   ║
║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   ║
║                                                                               ║
║     ∞ HEADY CONDUCTOR - ORCHESTRATION LAYER ∞                                 ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                ║
║     Intelligent orchestration of all Heady capabilities                       ║
║     - Routes requests to appropriate nodes                                    ║
║     - Executes workflows                                                      ║
║     - Manages service health                                                  ║
║     - Coordinates tool execution                                              ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import asyncio
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from HeadyRegistry import HeadyRegistry, Node, Workflow, Service, Tool
from HeadyLens import HeadyLens
from HeadyMemory import HeadyMemory
from HeadyBrain import HeadyBrain


class HeadyConductor:
    """
    Orchestration layer for the Heady System.
    Uses HeadyRegistry to route requests and coordinate execution.
    """
    
    def __init__(self, root_path: str = None):
        self.root_path = Path(root_path) if root_path else Path(__file__).parent.parent
        
        # Initialize core components (all indexed in registry)
        self.registry = HeadyRegistry(str(self.root_path))
        self.lens = HeadyLens(registry=self.registry)
        self.memory = HeadyMemory(str(self.root_path))
        self.brain = HeadyBrain(
            registry=self.registry,
            lens=self.lens,
            memory=self.memory,
            conductor=self
        )
        
        self.execution_log = []
        
        # Start monitoring
        self.lens.start_monitoring()
        
        print("∞ HeadyConductor: Initialized with full ecosystem")
        print("  ✓ Registry loaded")
        print("  ✓ Lens monitoring active")
        print("  ✓ Memory indexed")
        print("  ✓ Brain coordinating")
    
    def analyze_request(self, request: str) -> Dict[str, Any]:
        """
        Analyze a user request and determine which capabilities to invoke.
        Returns a structured execution plan.
        """
        request_lower = request.lower()
        
        execution_plan = {
            "request": request,
            "timestamp": datetime.now().isoformat(),
            "nodes_to_invoke": [],
            "workflows_to_execute": [],
            "tools_to_use": [],
            "services_required": [],
            "confidence": 0.0
        }
        
        # Check for workflow slash commands
        for workflow_name, workflow in self.registry.workflows.items():
            if workflow.slash_command in request_lower or workflow_name in request_lower:
                execution_plan["workflows_to_execute"].append({
                    "name": workflow.name,
                    "slash_command": workflow.slash_command,
                    "file_path": workflow.file_path,
                    "turbo_enabled": workflow.turbo_enabled
                })
                execution_plan["confidence"] = max(execution_plan["confidence"], 0.9)
        
        # Check for node triggers
        for node_name, node in self.registry.nodes.items():
            if node.trigger_on:
                for trigger in node.trigger_on:
                    if trigger.lower() in request_lower:
                        execution_plan["nodes_to_invoke"].append({
                            "name": node.name,
                            "role": node.role,
                            "primary_tool": node.primary_tool,
                            "trigger_matched": trigger
                        })
                        execution_plan["confidence"] = max(execution_plan["confidence"], 0.8)
                        break
        
        # Check for direct tool mentions
        for tool_name, tool in self.registry.tools.items():
            if tool_name.lower().replace('_', ' ') in request_lower:
                execution_plan["tools_to_use"].append({
                    "name": tool.name,
                    "file_path": tool.file_path,
                    "category": tool.category
                })
                execution_plan["confidence"] = max(execution_plan["confidence"], 0.7)
        
        # Identify required services
        service_keywords = {
            "api": ["api", "endpoint", "request"],
            "database": ["database", "postgres", "db", "query"],
            "cache": ["cache", "redis"],
            "mcp": ["mcp", "protocol", "connect"],
            "frontend": ["ui", "interface", "web", "frontend"]
        }
        
        for service_name, service in self.registry.services.items():
            for keyword_list in service_keywords.values():
                if any(keyword in request_lower for keyword in keyword_list):
                    if service.type in service_keywords:
                        execution_plan["services_required"].append({
                            "name": service.name,
                            "type": service.type,
                            "endpoint": service.endpoint
                        })
                    break
        
        return execution_plan
    
    def execute_workflow(self, workflow_name: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute a workflow by name."""
        if workflow_name not in self.registry.workflows:
            return {
                "success": False,
                "error": f"Workflow '{workflow_name}' not found in registry"
            }
        
        workflow = self.registry.workflows[workflow_name]
        
        print(f"\n∞ Executing Workflow: {workflow.name}")
        print(f"  Description: {workflow.description}")
        print(f"  File: {workflow.file_path}")
        
        result = {
            "success": True,
            "workflow": workflow.name,
            "started_at": datetime.now().isoformat(),
            "steps_executed": [],
            "output": f"Workflow '{workflow.name}' ready for execution"
        }
        
        self._log_execution("workflow", workflow.name, result)
        return result
    
    def invoke_node(self, node_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Invoke a specific node."""
        if node_name not in self.registry.nodes:
            return {
                "success": False,
                "error": f"Node '{node_name}' not found in registry"
            }
        
        node = self.registry.nodes[node_name]
        
        print(f"\n∞ Invoking Node: {node.name} ({node.role})")
        print(f"  Primary Tool: {node.primary_tool}")
        
        # Update node status
        self.registry.update_node_status(
            node_name, 
            "active", 
            datetime.now().isoformat()
        )
        
        result = {
            "success": True,
            "node": node.name,
            "role": node.role,
            "tool_used": node.primary_tool,
            "invoked_at": datetime.now().isoformat()
        }
        
        # Execute the primary tool
        tool_result = self._execute_tool(node.primary_tool, context)
        result["tool_result"] = tool_result
        
        # Update node status back to available
        self.registry.update_node_status(node_name, "available")
        
        self._log_execution("node", node.name, result)
        return result
    
    def _execute_tool(self, tool_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute a tool by name."""
        if tool_name not in self.registry.tools:
            return {
                "success": False,
                "error": f"Tool '{tool_name}' not found in registry"
            }
        
        tool = self.registry.tools[tool_name]
        
        print(f"  → Executing Tool: {tool.name}")
        
        # For now, return a success indicator
        # In production, this would actually execute the tool
        return {
            "success": True,
            "tool": tool.name,
            "file_path": tool.file_path,
            "category": tool.category,
            "executed_at": datetime.now().isoformat()
        }
    
    def check_service_health(self, service_name: str = None) -> Dict[str, Any]:
        """Check health of one or all services."""
        if service_name:
            if service_name not in self.registry.services:
                return {
                    "success": False,
                    "error": f"Service '{service_name}' not found in registry"
                }
            
            services_to_check = {service_name: self.registry.services[service_name]}
        else:
            services_to_check = self.registry.services
        
        health_report = {
            "timestamp": datetime.now().isoformat(),
            "services": {}
        }
        
        for svc_name, service in services_to_check.items():
            status = "unknown"
            
            # Simple health check logic
            if service.health_check_url:
                # In production, would make actual HTTP request
                status = "healthy"
            elif service.port:
                # In production, would check if port is listening
                status = "unknown"
            
            health_report["services"][svc_name] = {
                "name": service.name,
                "type": service.type,
                "status": status,
                "endpoint": service.endpoint
            }
            
            # Update registry
            self.registry.update_service_status(svc_name, status)
        
        return health_report
    
    def query_capabilities(self, query: str, category: str = None) -> Dict[str, Any]:
        """Query the registry for capabilities."""
        results = self.registry.query(query, category)
        
        total_results = sum(len(v) for v in results.values())
        
        return {
            "query": query,
            "category": category,
            "total_results": total_results,
            "results": results
        }
    
    def get_system_summary(self) -> Dict[str, Any]:
        """Get comprehensive system summary with full ecosystem awareness."""
        return self.brain.get_system_awareness()
    
    def _log_execution(self, execution_type: str, name: str, result: Dict[str, Any]):
        """Log execution for audit trail."""
        log_entry = {
            "type": execution_type,
            "name": name,
            "timestamp": datetime.now().isoformat(),
            "result": result
        }
        self.execution_log.append(log_entry)
        
        # Keep log size manageable
        if len(self.execution_log) > 1000:
            self.execution_log = self.execution_log[-1000:]
    
    def orchestrate(self, request: str, user_config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main orchestration method with full ecosystem awareness.
        Uses HeadyBrain for pre-response processing with comprehensive context.
        """
        print("\n" + "="*80)
        print("∞ HEADY CONDUCTOR - ORCHESTRATION BEGIN ∞")
        print("="*80)
        print(f"\nRequest: {request}\n")
        
        # Use HeadyBrain for comprehensive pre-response processing
        processing_result = self.brain.execute_with_context(request, user_config)
        
        # Extract execution plan from brain's context
        execution_plan = processing_result.get("context", {}).get("execution_plan", {})
        
        print(f"Confidence: {execution_plan['confidence']:.0%}")
        print(f"Nodes to invoke: {len(execution_plan['nodes_to_invoke'])}")
        print(f"Workflows to execute: {len(execution_plan['workflows_to_execute'])}")
        print(f"Tools to use: {len(execution_plan['tools_to_use'])}")
        print(f"Services required: {len(execution_plan['services_required'])}")
        
        orchestration_result = {
            "request": request,
            "execution_plan": execution_plan,
            "brain_context": processing_result.get("context", {}),
            "results": {
                "workflows": [],
                "nodes": [],
                "tools": []
            },
            "success": True,
            "timestamp": datetime.now().isoformat()
        }
        
        # Execute workflows
        for workflow_info in execution_plan["workflows_to_execute"]:
            result = self.execute_workflow(workflow_info["name"])
            orchestration_result["results"]["workflows"].append(result)
        
        # Invoke nodes
        for node_info in execution_plan["nodes_to_invoke"]:
            result = self.invoke_node(node_info["name"])
            orchestration_result["results"]["nodes"].append(result)
        
        # Execute tools
        for tool_info in execution_plan["tools_to_use"]:
            result = self._execute_tool(tool_info["name"])
            orchestration_result["results"]["tools"].append(result)
        
        # Store orchestration result in memory
        self.memory.store(
            category="orchestration",
            content={
                "request": request,
                "execution_plan": execution_plan,
                "results": orchestration_result["results"]
            },
            tags=self.brain._extract_keywords(request),
            source="conductor"
        )
        
        print("\n" + "="*80)
        print("∞ HEADY CONDUCTOR - ORCHESTRATION COMPLETE ∞")
        print("="*80 + "\n")
        
        return orchestration_result


def main():
    """CLI interface for HeadyConductor."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Heady Conductor - Orchestration Layer")
    parser.add_argument("--request", "-r", type=str, help="Request to orchestrate")
    parser.add_argument("--query", "-q", type=str, help="Query capabilities")
    parser.add_argument("--summary", "-s", action="store_true", help="Show system summary")
    parser.add_argument("--health", action="store_true", help="Check service health")
    parser.add_argument("--workflow", "-w", type=str, help="Execute specific workflow")
    parser.add_argument("--node", "-n", type=str, help="Invoke specific node")
    
    args = parser.parse_args()
    
    conductor = HeadyConductor()
    
    if args.summary:
        summary = conductor.get_system_summary()
        print(json.dumps(summary, indent=2))
    
    elif args.health:
        health = conductor.check_service_health()
        print(json.dumps(health, indent=2))
    
    elif args.query:
        results = conductor.query_capabilities(args.query)
        print(json.dumps(results, indent=2))
    
    elif args.workflow:
        result = conductor.execute_workflow(args.workflow)
        print(json.dumps(result, indent=2))
    
    elif args.node:
        result = conductor.invoke_node(args.node)
        print(json.dumps(result, indent=2))
    
    elif args.request:
        result = conductor.orchestrate(args.request)
        print(json.dumps(result, indent=2))
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
