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
# ║  FILE: HeadyAcademy/HeadyBrain_optimized.py                       ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                ║
║     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                ║
║     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 ║
║     ██║  ██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  ║
║     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   ║
║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   ║
║                                                                               ║
║     ∞ BRAIN - THE CENTRAL INTELLIGENCE ∞                                      ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                      ║
║     Enhanced pre-response processing with performance optimizations           ║
║     Integrates LENS monitoring + MEMORY storage + CONDUCTOR orchestration     ║
║     Registered in HeadyRegistry as the central intelligence coordinator       ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import time
import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache, wraps
import hashlib
import pickle

try:
    import psutil
    import requests
    MONITORING_AVAILABLE = True
except ImportError:
    MONITORING_AVAILABLE = False
    print("⚠ HeadyBrain: psutil/requests not available, limited functionality")


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
    
    # Performance metrics
    processing_time: float = 0.0
    cache_hit: bool = False
    confidence_score: float = 0.0


def performance_monitor(func):
    """Decorator to monitor function performance."""
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        start_time = time.time()
        try:
            result = func(self, *args, **kwargs)
            processing_time = time.time() - start_time
            
            # Log performance if available
            if hasattr(self, 'logger'):
                self.logger.info(f"{func.__name__} completed in {processing_time:.3f}s")
            
            # Add timing to result if it's a ProcessingContext
            if hasattr(result, 'processing_time'):
                result.processing_time = processing_time
            
            return result
        except Exception as e:
            processing_time = time.time() - start_time
            if hasattr(self, 'logger'):
                self.logger.error(f"{func.__name__} failed after {processing_time:.3f}s: {e}")
            raise
    return wrapper


class HeadyBrainOptimized:
    """
    ENHANCED BRAIN - The Central Intelligence with Performance Optimizations
    Pre-response processing pipeline that ensures comprehensive awareness
    before any action. Integrates all Heady systems for maximum utility.
    Features caching, parallel processing, and performance monitoring.
    """
    
    def __init__(self, registry=None, lens=None, memory=None, conductor=None):
        self.registry = registry
        self.lens = lens
        self.memory = memory
        self.conductor = conductor
        
        # Performance optimization components
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.cache_dir = Path(".heady_cache")
        self.cache_dir.mkdir(exist_ok=True)
        
        # Setup logging
        self.logger = logging.getLogger("HeadyBrain")
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
        
        # Default configuration: use all systems
        self.default_config = {
            "use_lens": True,
            "use_memory": True,
            "use_conductor": True,
            "use_all_nodes": True,
            "enable_external_sources": True,
            "enable_comparative_analysis": True,
            "enable_caching": True,
            "enable_parallel_processing": True,
            "cache_ttl_minutes": 30
        }
        
        # Performance metrics
        self.metrics = {
            "requests_processed": 0,
            "cache_hits": 0,
            "average_processing_time": 0.0,
            "total_processing_time": 0.0
        }
        
        print("∞ BRAIN OPTIMIZED: Initialized - Enhanced Central Intelligence is ready")
        print(f"  ✓ Performance optimizations enabled")
        print(f"  ✓ Cache directory: {self.cache_dir}")
        print(f"  ✓ Parallel processing: {self.executor._max_workers} workers")
    
    @performance_monitor
    def process_request(self, request: str, user_config: Optional[Dict[str, Any]] = None) -> ProcessingContext:
        """
        Enhanced processing pipeline with caching and parallel processing.
        
        Pipeline stages:
        1. Check cache for existing results
        2. Gather system awareness (LENS) - parallel with step 3
        3. Recall relevant knowledge (MEMORY) - parallel with step 2
        4. Identify concepts and assign tasks
        5. Integrate external sources
        6. Perform comparative analysis
        7. Generate orchestration plan (CONDUCTOR)
        8. Cache results for future use
        9. Return complete context
        """
        
        # Merge user config with defaults
        config = {**self.default_config, **(user_config or {})}
        
        timestamp = datetime.now().isoformat()
        
        print(f"\n{'='*80}")
        print("∞ BRAIN OPTIMIZED - ENHANCED PROCESSING PIPELINE ∞")
        print(f"{'='*80}")
        print(f"Request: {request}")
        print(f"Timestamp: {timestamp}")
        print(f"Configuration: {json.dumps(config, indent=2)}")
        
        # Check cache first if enabled
        cache_key = None
        if config["enable_caching"]:
            cache_key = self._get_cache_key(request, config)
            cached_context = self._load_from_cache(cache_key, config["cache_ttl_minutes"])
            if cached_context:
                self.metrics["cache_hits"] += 1
                cached_context.cache_hit = True
                print("  ✓ Cache hit - returning cached context")
                return cached_context
        
        # Parallel processing of stages
        if config["enable_parallel_processing"]:
            context = self._process_request_parallel(request, config, timestamp)
        else:
            context = self._process_request_sequential(request, config, timestamp)
        
        # Cache the result if enabled
        if config["enable_caching"] and cache_key:
            self._save_to_cache(cache_key, context)
        
        # Update metrics
        self._update_metrics(context.processing_time)
        
        print(f"\n{'='*80}")
        print("∞ BRAIN OPTIMIZED - PROCESSING COMPLETE ∞")
        print(f"{'='*80}\n")
        
        return context
    
    def _process_request_sequential(self, request: str, config: Dict[str, Any], timestamp: str) -> ProcessingContext:
        """Process request sequentially (original method)."""
        # Stage 1: Gather system awareness from LENS
        system_state, active_nodes, service_health = self._gather_system_awareness(config)
        
        # Stage 2: Recall relevant knowledge from MEMORY
        relevant_memories, user_preferences, external_sources = self._recall_knowledge(request, config)
        
        # Stage 3: Identify concepts and assign tasks
        concepts_identified, tasks_assigned = self._analyze_and_assign(request, relevant_memories)
        
        # Stage 4: Perform comparative analysis
        comparative_analysis = self._perform_comparative_analysis(request, external_sources, config)
        
        # Stage 5: Generate orchestration plan from CONDUCTOR
        execution_plan = self._generate_execution_plan(request, config)
        
        # Stage 6: Store processing context in MEMORY
        self._store_processing_context(request, concepts_identified, tasks_assigned, execution_plan)
        
        return self._create_context(
            request, timestamp, system_state, active_nodes, service_health,
            relevant_memories, user_preferences, external_sources,
            execution_plan, concepts_identified, tasks_assigned, comparative_analysis
        )
    
    def _process_request_parallel(self, request: str, config: Dict[str, Any], timestamp: str) -> ProcessingContext:
        """Process request with parallel execution where possible."""
        futures = {}
        
        # Submit parallel tasks
        with ThreadPoolExecutor(max_workers=3) as executor:
            # System awareness can run in parallel with memory recall
            if config["use_lens"] and self.lens:
                futures["system"] = executor.submit(self._gather_system_awareness, config)
            
            if config["use_memory"] and self.memory:
                futures["memory"] = executor.submit(self._recall_knowledge, request, config)
            
            # Wait for parallel tasks
            results = {}
            for key, future in futures.items():
                try:
                    results[key] = future.result(timeout=10)
                except Exception as e:
                    self.logger.warning(f"Parallel task {key} failed: {e}")
                    results[key] = self._get_default_result(key)
        
        # Extract results
        system_state, active_nodes, service_health = results.get("system", self._get_default_result("system"))
        relevant_memories, user_preferences, external_sources = results.get("memory", self._get_default_result("memory"))
        
        # Sequential tasks that depend on above results
        concepts_identified, tasks_assigned = self._analyze_and_assign(request, relevant_memories)
        comparative_analysis = self._perform_comparative_analysis(request, external_sources, config)
        execution_plan = self._generate_execution_plan(request, config)
        
        # Store processing context
        self._store_processing_context(request, concepts_identified, tasks_assigned, execution_plan)
        
        return self._create_context(
            request, timestamp, system_state, active_nodes, service_health,
            relevant_memories, user_preferences, external_sources,
            execution_plan, concepts_identified, tasks_assigned, comparative_analysis
        )
    
    def _gather_system_awareness(self, config: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str], Dict[str, str]]:
        """Gather system awareness from LENS."""
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
        
        return system_state, active_nodes, service_health
    
    def _recall_knowledge(self, request: str, config: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any], List[Dict[str, Any]]]:
        """Recall relevant knowledge from MEMORY."""
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
        
        return relevant_memories, user_preferences, external_sources
    
    def _analyze_and_assign(self, request: str, memories: List[Dict[str, Any]]) -> Tuple[List[str], List[Dict[str, Any]]]:
        """Identify concepts and assign tasks."""
        print("\n[Stage 3] Identifying concepts and assigning tasks...")
        concepts_identified = self._identify_concepts(request, memories)
        tasks_assigned = self._assign_tasks(request, concepts_identified)
        
        print(f"  ✓ Concepts identified: {len(concepts_identified)}")
        print(f"  ✓ Tasks assigned: {len(tasks_assigned)}")
        
        return concepts_identified, tasks_assigned
    
    def _perform_comparative_analysis(self, request: str, external_sources: List[Dict[str, Any]], config: Dict[str, Any]) -> Optional[str]:
        """Perform comparative analysis with external sources."""
        comparative_analysis = None
        if config["enable_comparative_analysis"] and external_sources:
            print("\n[Stage 4] Performing comparative analysis...")
            comparative_analysis = self._comparative_analysis(request, external_sources)
            print(f"  ✓ Analysis complete")
        
        return comparative_analysis
    
    def _generate_execution_plan(self, request: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate orchestration plan from CONDUCTOR."""
        execution_plan = {}
        
        if config["use_conductor"] and self.conductor:
            print("\n[Stage 5] Generating orchestration plan from CONDUCTOR...")
            execution_plan = self.conductor.analyze_request(request)
            print(f"  ✓ Confidence: {execution_plan.get('confidence', 0):.0%}")
            print(f"  ✓ Nodes to invoke: {len(execution_plan.get('nodes_to_invoke', []))}")
            print(f"  ✓ Workflows to execute: {len(execution_plan.get('workflows_to_execute', []))}")
        
        return execution_plan
    
    def _store_processing_context(self, request: str, concepts: List[str], tasks: List[Dict[str, Any]], execution_plan: Dict[str, Any]):
        """Store processing context in MEMORY for future reference."""
        if self.memory:
            self.memory.store(
                category="processing_context",
                content={
                    "request": request,
                    "concepts": concepts,
                    "tasks": tasks,
                    "execution_plan": execution_plan
                },
                tags=self._extract_keywords(request),
                source="brain_optimized"
            )
    
    def _create_context(self, request: str, timestamp: str, system_state: Dict[str, Any], 
                       active_nodes: List[str], service_health: Dict[str, str],
                       relevant_memories: List[Dict[str, Any]], user_preferences: Dict[str, Any],
                       external_sources: List[Dict[str, Any]], execution_plan: Dict[str, Any],
                       concepts_identified: List[str], tasks_assigned: List[Dict[str, Any]],
                       comparative_analysis: Optional[str]) -> ProcessingContext:
        """Create comprehensive ProcessingContext."""
        return ProcessingContext(
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
    
    def _get_default_result(self, result_type: str) -> Tuple:
        """Get default result for failed parallel tasks."""
        defaults = {
            "system": ({}, [], {}),
            "memory": ([], {}, [])
        }
        return defaults.get(result_type, ({}, [], {}))
    
    def _get_cache_key(self, request: str, config: Dict[str, Any]) -> str:
        """Generate cache key for request."""
        content = f"{request}_{json.dumps(config, sort_keys=True)}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def _load_from_cache(self, cache_key: str, ttl_minutes: int) -> Optional[ProcessingContext]:
        """Load cached context if valid."""
        cache_file = self.cache_dir / f"{cache_key}.pkl"
        
        if not cache_file.exists():
            return None
        
        try:
            # Check if cache is expired
            file_time = datetime.fromtimestamp(cache_file.stat().st_mtime)
            if datetime.now() - file_time > timedelta(minutes=ttl_minutes):
                cache_file.unlink()  # Remove expired cache
                return None
            
            with open(cache_file, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            self.logger.warning(f"Cache load failed: {e}")
            if cache_file.exists():
                cache_file.unlink()
            return None
    
    def _save_to_cache(self, cache_key: str, context: ProcessingContext):
        """Save context to cache."""
        cache_file = self.cache_dir / f"{cache_key}.pkl"
        
        try:
            with open(cache_file, 'wb') as f:
                pickle.dump(context, f)
        except Exception as e:
            self.logger.warning(f"Cache save failed: {e}")
    
    def _update_metrics(self, processing_time: float):
        """Update performance metrics."""
        self.metrics["requests_processed"] += 1
        self.metrics["total_processing_time"] += processing_time
        self.metrics["average_processing_time"] = (
            self.metrics["total_processing_time"] / self.metrics["requests_processed"]
        )
    
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
            },
            "performance_metrics": self.metrics,
            "cache_stats": self._get_cache_stats()
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
    
    def _get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        cache_files = list(self.cache_dir.glob("*.pkl"))
        total_size = sum(f.stat().st_size for f in cache_files)
        
        return {
            "cache_files": len(cache_files),
            "total_size_bytes": total_size,
            "cache_directory": str(self.cache_dir)
        }
    
    def configure_user_preferences(self, preferences: Dict[str, Any]):
        """Configure user preferences for service selection."""
        if self.memory:
            for key, value in preferences.items():
                self.memory.set_preference(key, value, category="user_config")
            print(f"∞ BRAIN OPTIMIZED: Configured {len(preferences)} user preferences")
    
    def get_user_config(self) -> Dict[str, Any]:
        """Get current user configuration."""
        if self.memory:
            return self.memory.get_all_preferences(category="user_config")
        return {}
    
    def clear_cache(self):
        """Clear all cached contexts."""
        cache_files = list(self.cache_dir.glob("*.pkl"))
        for cache_file in cache_files:
            cache_file.unlink()
        print(f"∞ BRAIN OPTIMIZED: Cleared {len(cache_files)} cached files")
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get detailed performance metrics."""
        return {
            **self.metrics,
            "cache_hit_rate": (
                self.metrics["cache_hits"] / max(self.metrics["requests_processed"], 1)
            ),
            "cache_stats": self._get_cache_stats()
        }


if __name__ == "__main__":
    brain = HeadyBrainOptimized()
    
    print("\n" + "="*80)
    print("∞ BRAIN OPTIMIZED - THE ENHANCED CENTRAL INTELLIGENCE ∞")
    print("="*80)
    
    awareness = brain.get_system_awareness()
    print(json.dumps(awareness, indent=2))
    
    # Test processing
    print("\n" + "="*80)
    print("TESTING ENHANCED PROCESSING")
    print("="*80)
    
    test_request = "optimize system performance and monitor security"
    context = brain.process_request(test_request)
    
    print(f"\nProcessing completed in {context.processing_time:.3f}s")
    print(f"Cache hit: {context.cache_hit}")
    print(f"Concepts identified: {len(context.concepts_identified)}")
    print(f"Tasks assigned: {len(context.tasks_assigned)}")
