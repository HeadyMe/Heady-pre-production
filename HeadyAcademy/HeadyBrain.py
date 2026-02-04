# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: HeadyAcademy/HeadyBrain.py
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
║     ∞ BRAIN - THE CENTRAL INTELLIGENCE ∞                                      ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                      ║
║     Pre-response processing pipeline with comprehensive awareness             ║
║     Integrates LENS monitoring + MEMORY storage + CONDUCTOR orchestration     ║
║     Registered in HeadyRegistry as the central intelligence coordinator       ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict


@dataclass
class ProcessingContext:
    """Context gathered before response generation."""
    request: str
    timestamp: str
    
    # System awareness (from LENS)
    system_state: Dict[str, Any]
    active_nodes: List[str]
    service_health: Dict[str, str]
    
    # Historical knowledge (from MEMORY)
    relevant_memories: List[Dict[str, Any]]
    user_preferences: Dict[str, Any]
    external_sources: List[Dict[str, Any]]
    
    # Orchestration plan (from CONDUCTOR)
    execution_plan: Dict[str, Any]
    
    # Analysis results
    concepts_identified: List[str]
    tasks_assigned: List[Dict[str, Any]]
    comparative_analysis: Optional[str]


class HeadyBrain:
    """
    BRAIN - The Central Intelligence
    Pre-response processing pipeline that ensures comprehensive awareness
    before any action. Integrates all Heady systems for maximum utility.
    Indexed in HeadyRegistry as a core system node.
    """
    
    def __init__(self, registry=None, lens=None, memory=None, conductor=None):
        self.registry = registry
        self.lens = lens
        self.memory = memory
        self.conductor = conductor
        
        # Default configuration: use all systems
        self.default_config = {
            "use_lens": True,
            "use_memory": True,
            "use_conductor": True,
            "use_all_nodes": True,
            "enable_external_sources": True,
            "enable_comparative_analysis": True
        }
        
        print("∞ BRAIN: Initialized - The Central Intelligence is ready")
    
    def process_request(self, request: str, user_config: Optional[Dict[str, Any]] = None) -> ProcessingContext:
        """
        Main processing pipeline: gather comprehensive context before response.
        
        Pipeline stages:
        1. Gather system awareness (LENS)
        2. Recall relevant knowledge (MEMORY)
        3. Identify concepts and tasks
        4. Integrate external sources
        5. Perform comparative analysis
        6. Generate orchestration plan (CONDUCTOR)
        7. Return complete context
        """
        
        # Merge user config with defaults
        config = {**self.default_config, **(user_config or {})}
        
        timestamp = datetime.now().isoformat()
        
        print(f"\n{'='*80}")
        print("∞ BRAIN - PRE-RESPONSE PROCESSING PIPELINE ∞")
        print(f"{'='*80}")
        print(f"Request: {request}")
        print(f"Timestamp: {timestamp}")
        print(f"Configuration: {json.dumps(config, indent=2)}")
        
        # Stage 1: Gather system awareness from LENS
        system_state = {}
        active_nodes = []
        service_health = {}
        
        if config["use_lens"] and self.lens:
            print("\n[Stage 1] Gathering system awareness from LENS...")
            system_state = self.lens.get_current_state()
            active_nodes = system_state.get("nodes_active", [])
            service_health = system_state.get("services", {})
            print(f"  ✓ System health: {system_state.get('system_health', 'unknown')}")
            print(f"  ✓ Active nodes: {len(active_nodes)}")
            print(f"  ✓ Services monitored: {len(service_health)}")
        
        # Stage 2: Recall relevant knowledge from MEMORY
        relevant_memories = []
        user_preferences = {}
        external_sources = []
        
        if config["use_memory"] and self.memory:
            print("\n[Stage 2] Recalling relevant knowledge from MEMORY...")
            
            # Query memories related to request
            request_keywords = self._extract_keywords(request)
            for keyword in request_keywords[:5]:  # Top 5 keywords
                memories = self.memory.query(tags=[keyword], limit=10)
                # Convert to dict manually to avoid circular references
                for m in memories:
                    relevant_memories.append({
                        "id": m.id,
                        "category": m.category,
                        "content": m.content,
                        "tags": m.tags,
                        "timestamp": m.timestamp,
                        "source": m.source
                    })
            
            # Get user preferences
            user_preferences = self.memory.get_all_preferences()
            
            # Get external sources if enabled
            if config["enable_external_sources"]:
                external_sources = self.memory.get_external_sources()
            
            print(f"  ✓ Relevant memories: {len(relevant_memories)}")
            print(f"  ✓ User preferences: {len(user_preferences)}")
            print(f"  ✓ External sources: {len(external_sources)}")
        
        # Stage 3: Identify concepts and assign tasks
        print("\n[Stage 3] Identifying concepts and assigning tasks...")
        concepts_identified = self._identify_concepts(request, relevant_memories)
        tasks_assigned = self._assign_tasks(request, concepts_identified)
        
        print(f"  ✓ Concepts identified: {len(concepts_identified)}")
        print(f"  ✓ Tasks assigned: {len(tasks_assigned)}")
        
        # Stage 4: Perform comparative analysis with external sources
        comparative_analysis = None
        if config["enable_comparative_analysis"] and external_sources:
            print("\n[Stage 4] Performing comparative analysis...")
            comparative_analysis = self._comparative_analysis(request, external_sources)
            print(f"  ✓ Analysis complete")
        
        # Stage 5: Generate orchestration plan from CONDUCTOR
        execution_plan = {}
        
        if config["use_conductor"] and self.conductor:
            print("\n[Stage 5] Generating orchestration plan from CONDUCTOR...")
            execution_plan = self.conductor.analyze_request(request)
            print(f"  ✓ Confidence: {execution_plan.get('confidence', 0):.0%}")
            print(f"  ✓ Nodes to invoke: {len(execution_plan.get('nodes_to_invoke', []))}")
            print(f"  ✓ Workflows to execute: {len(execution_plan.get('workflows_to_execute', []))}")
        
        # Stage 6: Store processing context in MEMORY for future reference
        if self.memory:
            self.memory.store(
                category="processing_context",
                content={
                    "request": request,
                    "concepts": concepts_identified,
                    "tasks": tasks_assigned,
                    "execution_plan": execution_plan
                },
                tags=self._extract_keywords(request),
                source="brain"
            )
        
        # Create comprehensive context
        context = ProcessingContext(
            request=request,
            timestamp=timestamp,
            system_state=system_state,
            active_nodes=active_nodes,
            service_health=service_health,
            relevant_memories=relevant_memories,
            user_preferences=user_preferences,
            external_sources=external_sources,
            execution_plan=execution_plan,
            concepts_identified=concepts_identified,
            tasks_assigned=tasks_assigned,
            comparative_analysis=comparative_analysis
        )
        
        print(f"\n{'='*80}")
        print("∞ BRAIN - PROCESSING COMPLETE ∞")
        print(f"{'='*80}\n")
        
        return context
    
    def execute_with_context(self, request: str, user_config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process request with full context gathering.
        Returns comprehensive context for conductor to use.
        """
        
        # Process request to gather context
        context = self.process_request(request, user_config)
        
        # Record execution in LENS (without calling conductor to avoid recursion)
        if self.lens:
            for node_info in context.execution_plan.get("nodes_to_invoke", []):
                self.lens.record_node_activity(node_info["name"])
            
            for workflow_info in context.execution_plan.get("workflows_to_execute", []):
                self.lens.record_workflow_execution(workflow_info["name"])
        
        # Return comprehensive context (converted to dict manually)
        return {
            "request": request,
            "context": {
                "request": context.request,
                "timestamp": context.timestamp,
                "system_state": context.system_state,
                "active_nodes": context.active_nodes,
                "service_health": context.service_health,
                "relevant_memories": context.relevant_memories,
                "user_preferences": context.user_preferences,
                "external_sources": context.external_sources,
                "execution_plan": context.execution_plan,
                "concepts_identified": context.concepts_identified,
                "tasks_assigned": context.tasks_assigned,
                "comparative_analysis": context.comparative_analysis
            },
            "timestamp": datetime.now().isoformat(),
            "success": True
        }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text for indexing."""
        # Simple keyword extraction (can be enhanced with NLP)
        words = text.lower().split()
        
        # Filter common words
        stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        keywords = [w for w in words if w not in stop_words and len(w) > 3]
        
        return list(set(keywords))
    
    def _identify_concepts(self, request: str, memories: List[Dict[str, Any]]) -> List[str]:
        """Identify concepts from request and memories."""
        concepts = set()
        
        # Extract from request
        request_lower = request.lower()
        
        # System concepts
        system_concepts = [
            "deployment", "monitoring", "security", "optimization", "documentation",
            "workflow", "node", "service", "database", "api", "frontend",
            "authentication", "encryption", "visualization", "testing"
        ]
        
        for concept in system_concepts:
            if concept in request_lower:
                concepts.add(concept)
        
        # Extract from memories
        for memory in memories[:10]:  # Top 10 memories
            if "tags" in memory:
                concepts.update(memory["tags"])
        
        return list(concepts)
    
    def _assign_tasks(self, request: str, concepts: List[str]) -> List[Dict[str, Any]]:
        """Assign tasks based on request and concepts."""
        tasks = []
        
        # Map concepts to potential tasks
        concept_task_map = {
            "deployment": {"action": "deploy", "target": "system", "priority": "high"},
            "monitoring": {"action": "monitor", "target": "services", "priority": "medium"},
            "security": {"action": "audit", "target": "security", "priority": "high"},
            "optimization": {"action": "optimize", "target": "performance", "priority": "medium"},
            "documentation": {"action": "document", "target": "code", "priority": "low"}
        }
        
        for concept in concepts:
            if concept in concept_task_map:
                task = {
                    **concept_task_map[concept],
                    "concept": concept,
                    "assigned_at": datetime.now().isoformat()
                }
                tasks.append(task)
        
        return tasks
    
    def _comparative_analysis(self, request: str, external_sources: List[Dict[str, Any]]) -> str:
        """Perform comparative analysis with external sources."""
        if not external_sources:
            return "No external sources available for comparison"
        
        analysis_parts = []
        analysis_parts.append(f"Analyzed {len(external_sources)} external sources")
        
        # Group by source type
        by_type = {}
        for source in external_sources:
            source_type = source.get("source_type", "unknown")
            if source_type not in by_type:
                by_type[source_type] = []
            by_type[source_type].append(source)
        
        for source_type, sources in by_type.items():
            analysis_parts.append(f"- {source_type}: {len(sources)} sources")
        
        return " | ".join(analysis_parts)
    
    def get_system_awareness(self) -> Dict[str, Any]:
        """Get comprehensive system awareness summary."""
        awareness = {
            "timestamp": datetime.now().isoformat(),
            "components": {
                "lens": self.lens is not None,
                "memory": self.memory is not None,
                "conductor": self.conductor is not None,
                "registry": self.registry is not None
            }
        }
        
        if self.lens:
            awareness["system_state"] = self.lens.get_health_summary()
        
        if self.memory:
            awareness["memory_stats"] = self.memory.get_statistics()
        
        if self.registry:
            awareness["registry_summary"] = self.registry.get_summary()
        
        # Don't call conductor.get_system_summary() to avoid circular recursion
        if self.conductor:
            awareness["execution_log_size"] = len(self.conductor.execution_log)
        
        return awareness
    
    def configure_user_preferences(self, preferences: Dict[str, Any]):
        """Configure user preferences for service selection."""
        if self.memory:
            for key, value in preferences.items():
                self.memory.set_preference(key, value, category="user_config")
            print(f"∞ BRAIN: Configured {len(preferences)} user preferences")
    
    def get_user_config(self) -> Dict[str, Any]:
        """Get current user configuration."""
        if self.memory:
            return self.memory.get_all_preferences(category="user_config")
        return {}


if __name__ == "__main__":
    brain = HeadyBrain()
    
    print("\n" + "="*80)
    print("∞ BRAIN - THE CENTRAL INTELLIGENCE ∞")
    print("="*80)
    
    awareness = brain.get_system_awareness()
    print(json.dumps(awareness, indent=2))
