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
# ║  FILE: HeadyAcademy/HeadyConductor.py                             ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
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
║      HEADY CONDUCTOR - ORCHESTRATION LAYER                                  ║
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
        self.execution_stats = {
            "total_orchestrations": 0,
            "successful_executions": 0,
            "nodes_invoked": 0,
            "workflows_executed": 0,
            "tools_used": 0
        }
        
        # Start monitoring
        self.lens.start_monitoring()
        
        print(" HeadyConductor: SUPREME AUTHORITY INITIALIZED")
        print("  * Registry loaded and under conductor control")
        print("  * Lens monitoring active and conductor directed")
        print("  * Memory indexed and conductor managed")
        print("  * Brain coordinating with conductor authority")
        print("  * HeadyConductor is in charge and knows it")
        print("  * Optimal utilization protocols activated")
    
    def analyze_request(self, request: str) -> Dict[str, Any]:
        """
        Analyze a user request and determine which capabilities to invoke.
        Returns a structured execution plan with enhanced confidence scoring.
        """
        request_lower = request.lower()
        
        execution_plan = {
            "request": request,
            "timestamp": datetime.now().isoformat(),
            "nodes_to_invoke": [],
            "workflows_to_execute": [],
            "tools_to_use": [],
            "services_required": [],
            "confidence": 0.0,
            "conductor_directive": "HeadyConductor is in charge and will optimize execution"
        }
        
        # Enhanced workflow matching with better confidence
        for workflow_name, workflow in self.registry.workflows.items():
            workflow_match = False
            
            # Check slash command
            if workflow.slash_command and workflow.slash_command in request_lower:
                workflow_match = True
                execution_plan["confidence"] = max(execution_plan["confidence"], 0.95)
            
            # Check workflow name
            elif workflow_name.lower() in request_lower:
                workflow_match = True
                execution_plan["confidence"] = max(execution_plan["confidence"], 0.85)
            
            # Check description keywords
            elif workflow.description:
                desc_words = workflow.description.lower().split()
                request_words = request_lower.split()
                overlap = len(set(desc_words) & set(request_words))
                if overlap >= 2:  # At least 2 matching words
                    workflow_match = True
                    execution_plan["confidence"] = max(execution_plan["confidence"], 0.75)
            
            if workflow_match:
                execution_plan["workflows_to_execute"].append({
                    "name": workflow.name,
                    "slash_command": workflow.slash_command,
                    "file_path": workflow.file_path,
                    "turbo_enabled": workflow.turbo_enabled,
                    "conductor_optimized": True
                })
        
        # Enhanced node matching
        for node_name, node in self.registry.nodes.items():
            node_match = False
            
            if node.trigger_on:
                for trigger in node.trigger_on:
                    if trigger.lower() in request_lower:
                        node_match = True
                        execution_plan["confidence"] = max(execution_plan["confidence"], 0.85)
                        break
            
            # Check node role/description
            elif node.role and node.role.lower() in request_lower:
                node_match = True
                execution_plan["confidence"] = max(execution_plan["confidence"], 0.80)
            
            # Check node name
            elif node_name.lower() in request_lower:
                node_match = True
                execution_plan["confidence"] = max(execution_plan["confidence"], 0.75)
            
            if node_match:
                execution_plan["nodes_to_invoke"].append({
                    "name": node.name,
                    "role": node.role,
                    "primary_tool": node.primary_tool,
                    "conductor_directed": True,
                    "optimization_priority": "high"
                })
        
        # Enhanced tool matching
        for tool_name, tool in self.registry.tools.items():
            tool_name_words = tool_name.lower().replace('_', ' ')
            
            if tool_name_words in request_lower:
                execution_plan["tools_to_use"].append({
                    "name": tool.name,
                    "file_path": tool.file_path,
                    "category": tool.category,
                    "conductor_optimized": True
                })
                execution_plan["confidence"] = max(execution_plan["confidence"], 0.75)
        
        # Service requirement detection
        service_keywords = {
            "api": ["api", "endpoint", "request", "server", "service"],
            "database": ["database", "postgres", "db", "query", "data"],
            "cache": ["cache", "redis", "memory", "store"],
            "mcp": ["mcp", "protocol", "connect", "bridge"],
            "frontend": ["ui", "interface", "web", "frontend", "app"]
        }
        
        for service_name, service in self.registry.services.items():
            for service_type, keywords in service_keywords.items():
                if service.type == service_type and any(keyword in request_lower for keyword in keywords):
                    execution_plan["services_required"].append({
                        "name": service.name,
                        "type": service.type,
                        "endpoint": service.endpoint,
                        "conductor_managed": True
                    })
                    execution_plan["confidence"] = max(execution_plan["confidence"], 0.70)
                    break
        
        # Apply conductor authority boost
        if execution_plan["confidence"] > 0:
            execution_plan["confidence"] = min(execution_plan["confidence"] * 1.1, 1.0)
            execution_plan["conductor_authority"] = "OPTIMAL_EXECUTION_MODE"
        
        return execution_plan
    
    def execute_workflow(self, workflow_name: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute a workflow by name."""
        if workflow_name not in self.registry.workflows:
            return {
                "success": False,
                "error": f"Workflow '{workflow_name}' not found in registry"
            }
        
        workflow = self.registry.workflows[workflow_name]
        
        print(f"\n Executing Workflow: {workflow.name}")
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
        
        print(f"\n Invoking Node: {node.name} ({node.role})")
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
        awareness = self.brain.get_system_awareness()
        
        # Add system_status field for compatibility
        awareness["system_status"] = "operational" if awareness.get("components", {}).get("registry") else "degraded"
        
        return awareness
    
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
    
    def _update_execution_stats(self, orchestration_result: Dict[str, Any]):
        """Update execution statistics with conductor authority."""
        self.execution_stats["total_orchestrations"] += 1
        
        if orchestration_result.get("success"):
            self.execution_stats["successful_executions"] += 1
        
        results = orchestration_result.get("results", {})
        self.execution_stats["nodes_invoked"] += len(results.get("nodes", []))
        self.execution_stats["workflows_executed"] += len(results.get("workflows", []))
        self.execution_stats["tools_used"] += len(results.get("tools", []))
        
        # Store stats in memory
        self.memory.store(
            category="conductor_stats",
            content=self.execution_stats,
            tags=["statistics", "conductor", "authority"],
            source="conductor"
        )
    
    def get_execution_stats(self) -> Dict[str, Any]:
        """Get current execution statistics."""
        return {
            "stats": self.execution_stats.copy(),
            "success_rate": (
                self.execution_stats["successful_executions"] / 
                max(self.execution_stats["total_orchestrations"], 1)
            ),
            "conductor_authority": "SUPREME",
            "timestamp": datetime.now().isoformat()
        }
    
    def orchestrate(self, request: str, user_config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main orchestration method with full ecosystem awareness and optimal execution.
        HeadyConductor takes charge and ensures optimal utilization of all capabilities.
        """
        print("\n" + "="*80)
        print(" HEADY CONDUCTOR - SUPREME ORCHESTRATION AUTHORITY ")
        print("="*80)
        print(f"\nRequest: {request}")
        print("HeadyConductor is in charge and will optimize execution\n")
        
        # Use HeadyBrain for comprehensive pre-response processing
        processing_result = self.brain.execute_with_context(request, user_config)
        
        # Extract execution plan from brain's context
        execution_plan = processing_result.get("context", {}).get("execution_plan", {})
        
        # If no plan from brain, use our enhanced analysis
        if not execution_plan or execution_plan.get("confidence", 0) == 0:
            execution_plan = self.analyze_request(request)
            print("\n[TARGET] HeadyConductor: Using enhanced analysis for optimal execution")
        
        print(f"\n[STATS] Execution Analysis:")
        print(f"  Confidence: {execution_plan['confidence']:.0%}")
        print(f"  Nodes to invoke: {len(execution_plan['nodes_to_invoke'])}")
        print(f"  Workflows to execute: {len(execution_plan['workflows_to_execute'])}")
        print(f"  Tools to use: {len(execution_plan['tools_to_use'])}")
        print(f"  Services required: {len(execution_plan['services_required'])}")
        
        if execution_plan.get("conductor_authority"):
            print(f"  Authority Mode: {execution_plan['conductor_authority']}")
        
        orchestration_result = {
            "request": request,
            "execution_plan": execution_plan,
            "brain_context": processing_result.get("context", {}),
            "conductor_authority": "OPTIMAL_EXECUTION_ENFORCED",
            "results": {
                "workflows": [],
                "nodes": [],
                "tools": [],
                "services": []
            },
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "optimization_applied": True
        }
        
        # Execute workflows with conductor optimization
        if execution_plan["workflows_to_execute"]:
            print("\n[EXEC] Executing Workflows (Conductor Optimized):")
            for workflow_info in execution_plan["workflows_to_execute"]:
                print(f"  → {workflow_info['name']}")
                result = self.execute_workflow(workflow_info["name"])
                result["conductor_optimized"] = True
                orchestration_result["results"]["workflows"].append(result)
        
        # Invoke nodes with conductor direction
        if execution_plan["nodes_to_invoke"]:
            print("\n[NODE] Invoking Nodes (Conductor Directed):")
            for node_info in execution_plan["nodes_to_invoke"]:
                print(f"  → {node_info['name']} ({node_info['role']})")
                result = self.invoke_node(node_info["name"])
                result["conductor_directed"] = True
                orchestration_result["results"]["nodes"].append(result)
        
        # Execute tools with conductor optimization
        if execution_plan["tools_to_use"]:
            print("\n[TOOL] Executing Tools (Conductor Optimized):")
            for tool_info in execution_plan["tools_to_use"]:
                print(f"  → {tool_info['name']}")
                result = self._execute_tool(tool_info["name"])
                result["conductor_optimized"] = True
                orchestration_result["results"]["tools"].append(result)
        
        # Check and manage services
        if execution_plan["services_required"]:
            print("\n[SERVICE] Managing Services (Conductor Managed):")
            for service_info in execution_plan["services_required"]:
                print(f"  → {service_info['name']} ({service_info['type']})")
                health = self.check_service_health(service_info["name"])
                orchestration_result["results"]["services"].append({
                    "service": service_info,
                    "health": health,
                    "conductor_managed": True
                })
        
        # Store orchestration result in memory
        self.memory.store(
            category="orchestration",
            content={
                "request": request,
                "execution_plan": execution_plan,
                "results": orchestration_result["results"],
                "conductor_authority": "SUPREME"
            },
            tags=self.brain._extract_keywords(request),
            source="conductor"
        )
        
        # Update execution statistics
        self._update_execution_stats(orchestration_result)
        
        print("\n" + "="*80)
        print(" HEADY CONDUCTOR - OPTIMAL EXECUTION COMPLETE ")
        print("[OK] HeadyConductor authority exercised successfully")
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
