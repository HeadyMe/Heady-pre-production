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
# ║  FILE: HeadyAcademy/HeadyBrain.py                                 ║
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
║      BRAIN - THE CENTRAL INTELLIGENCE                                       ║
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
    print("[WARN] HeadyBrain: psutil/requests not available, limited functionality")


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
        
        # Enhanced learning and intelligence configuration
        self.learning_metrics = {
            "total_processed": 0,
            "patterns_identified": 0,
            "knowledge_synthesized": 0,
            "predictions_made": 0,
            "adaptive_adjustments": 0
        }
        
        # Pattern recognition cache
        self.pattern_cache = {}
        self.knowledge_graph = {}
        
        print("BRAIN: Initialized - The Central Intelligence is ready")
        print(f"  * Performance optimizations enabled")
        print(f"  * Cache directory: {self.cache_dir}")
        print(f"  * Parallel processing: {self.executor._max_workers} workers")
    
    @performance_monitor
    def process_request(self, request: str, user_config: Optional[Dict[str, Any]] = None) -> ProcessingContext:
        """
        Enhanced processing pipeline with intelligent learning and optimization.
        
        Pipeline stages:
        1. Gather system awareness (LENS)
        2. Recall relevant knowledge (MEMORY)
        3. Pattern recognition and adaptive learning
        4. Identify concepts and tasks
        5. Integrate external sources
        6. Knowledge synthesis and predictive analysis
        7. Generate orchestration plan (CONDUCTOR)
        8. Store learning insights
        9. Return complete context
        """
        
        # Update learning metrics
        self.learning_metrics["total_processed"] += 1
        
        # Merge user config with defaults
        config = {**self.default_config, **(user_config or {})}
        
        timestamp = datetime.now().isoformat()
        
        print(f"\n{'='*80}")
        print("BRAIN - ENHANCED INTELLIGENCE PROCESSING PIPELINE")
        print(f"{'='*80}")
        print(f"Request: {request}")
        print(f"Timestamp: {timestamp}")
        print(f"Configuration: Enhanced learning mode active")
        
        # Check cache first if enabled
        cache_key = None
        if config["enable_caching"]:
            cache_key = self._get_cache_key(request, config)
            cached_context = self._load_from_cache(cache_key, config["cache_ttl_minutes"])
            if cached_context:
                self.metrics["cache_hits"] += 1
                cached_context.cache_hit = True
                print("  Cache hit - returning cached context")
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
        print("BRAIN - ENHANCED INTELLIGENCE PROCESSING COMPLETE")
        print(f"Learning metrics updated: {self.learning_metrics}")
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
                "comparative_analysis": context.comparative_analysis,
                "patterns_identified": getattr(context, 'patterns_identified', []),
                "synthesized_knowledge": getattr(context, 'synthesized_knowledge', {}),
                "predictions": getattr(context, 'predictions', []),
                "learning_metrics": getattr(context, 'learning_metrics', {})
            },
            "timestamp": datetime.now().isoformat(),
            "learning_enabled": True
        }
    
    def _get_cache_key(self, request: str, config: Dict[str, Any]) -> str:
        """Generate cache key for request."""
        cache_data = f"{request}:{json.dumps(config, sort_keys=True)}"
        return hashlib.md5(cache_data.encode()).hexdigest()
    
    def _load_from_cache(self, cache_key: str, ttl_minutes: int) -> Optional[ProcessingContext]:
        """Load cached context if available and not expired."""
        cache_file = self.cache_dir / f"{cache_key}.pkl"
        if cache_file.exists():
            try:
                with open(cache_file, 'rb') as f:
                    cached_data = pickle.load(f)
                
                cached_time = datetime.fromisoformat(cached_data['timestamp'])
                if datetime.now() - cached_time < timedelta(minutes=ttl_minutes):
                    return cached_data['context']
            except Exception as e:
                self.logger.warning(f"Cache load failed: {e}")
        return None
    
    def _save_to_cache(self, cache_key: str, context: ProcessingContext):
        """Save context to cache."""
        cache_file = self.cache_dir / f"{cache_key}.pkl"
        try:
            with open(cache_file, 'wb') as f:
                pickle.dump({
                    'timestamp': datetime.now().isoformat(),
                    'context': context
                }, f)
        except Exception as e:
            self.logger.warning(f"Cache save failed: {e}")
    
    def _update_metrics(self, processing_time: float):
        """Update performance metrics."""
        self.metrics["requests_processed"] += 1
        self.metrics["total_processing_time"] += processing_time
        self.metrics["average_processing_time"] = (
            self.metrics["total_processing_time"] / self.metrics["requests_processed"]
        )
    
    def _get_default_result(self, key: str) -> Tuple:
        """Get default result for failed parallel tasks."""
        if key == "system":
            return {}, [], {}
        elif key == "memory":
            return [], {}, []
        return None
    
    def _gather_system_awareness(self, config: Dict[str, Any]) -> Tuple[Dict, List, Dict]:
        """Gather system awareness from LENS."""
        if config["use_lens"] and self.lens:
            state = self.lens.get_current_state()
            return state, state.get("nodes_active", []), state.get("services", {})
        return {}, [], {}
    
    def _recall_knowledge(self, request: str, config: Dict[str, Any]) -> Tuple[List, Dict, List]:
        """Recall knowledge from MEMORY."""
        if config["use_memory"] and self.memory:
            keywords = self._extract_keywords(request)
            memories = self.memory.search(keywords[:5], max_results=10)
            preferences = self.memory.get_all_preferences()
            external = []
            return memories, preferences, external
        return [], {}, []
    
    def _analyze_and_assign(self, request: str, memories: List[Dict]) -> Tuple[List, List]:
        """Analyze request and assign tasks."""
        concepts = self._identify_concepts(request, memories)
        tasks = self._assign_tasks(request, concepts)
        return concepts, tasks
    
    def _perform_comparative_analysis(self, request: str, sources: List[Dict], config: Dict) -> str:
        """Perform comparative analysis."""
        if config["enable_comparative_analysis"]:
            return self._comparative_analysis(request, sources)
        return "Comparative analysis disabled"
    
    def _generate_execution_plan(self, request: str, config: Dict) -> Dict[str, Any]:
        """Generate execution plan."""
        if config["use_conductor"] and self.conductor:
            return self.conductor.analyze_request(request)
        return {"confidence": 0.0, "nodes_to_invoke": [], "workflows_to_execute": [], "tools_to_use": [], "services_required": []}
    
    def _store_processing_context(self, request: str, concepts: List[str], tasks: List[Dict], plan: Dict):
        """Store processing context in memory."""
        if self.memory:
            self.memory.store(
                category="processing_context",
                content={"request": request, "concepts": concepts, "tasks": tasks, "plan": plan},
                tags=concepts[:5],
                source="brain"
            )
    
    def _create_context(self, request, timestamp, system_state, active_nodes, service_health,
                       relevant_memories, user_preferences, external_sources,
                       execution_plan, concepts_identified, tasks_assigned, comparative_analysis) -> ProcessingContext:
        """Create ProcessingContext object."""
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
            comparative_analysis=comparative_analysis,
            confidence_score=execution_plan.get("confidence", 0.0)
        )
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text for indexing."""
        # Simple keyword extraction (can be enhanced with NLP)
        words = text.lower().split()
        
        # Filter common words
        stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        keywords = [w for w in words if w not in stop_words and len(w) > 3]
        
        return list(set(keywords))
    
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
                "comparative_analysis": context.comparative_analysis,
                "patterns_identified": getattr(context, 'patterns_identified', []),
                "synthesized_knowledge": getattr(context, 'synthesized_knowledge', {}),
                "predictions": getattr(context, 'predictions', []),
                "learning_metrics": getattr(context, 'learning_metrics', {})
            },
            "timestamp": datetime.now().isoformat(),
            "learning_enabled": True,
            "success": True
        }
    
    def _recognize_patterns(self, request: str, memories: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Recognize patterns in request and historical data."""
        patterns = []
        request_lower = request.lower()
        
        # Check for common request patterns
        pattern_indicators = {
            "deployment_request": ["deploy", "deployment", "release", "publish"],
            "security_request": ["security", "audit", "scan", "vulnerability"],
            "monitoring_request": ["monitor", "check", "status", "health"],
            "optimization_request": ["optimize", "improve", "enhance", "boost"],
            "troubleshooting_request": ["fix", "error", "issue", "problem", "debug"]
        }
        
        for pattern_type, indicators in pattern_indicators.items():
            if any(indicator in request_lower for indicator in indicators):
                patterns.append({
                    "type": pattern_type,
                    "confidence": 0.8,
                    "indicators": [i for i in indicators if i in request_lower],
                    "timestamp": datetime.now().isoformat()
                })
        
        # Analyze memory patterns
        memory_categories = [m.get("category", "") for m in memories]
        if memory_categories:
            from collections import Counter
            category_counts = Counter(memory_categories)
            if category_counts.most_common(1)[0][1] >= 2:  # At least 2 memories of same type
                patterns.append({
                    "type": "memory_pattern",
                    "confidence": 0.7,
                    "dominant_category": category_counts.most_common(1)[0][0],
                    "count": category_counts.most_common(1)[0][1],
                    "timestamp": datetime.now().isoformat()
                })
        
        return patterns
    
    def _identify_concepts_intelligent(self, request: str, memories: List[Dict[str, Any]], patterns: List[Dict[str, Any]]) -> List[str]:
        """Enhanced concept identification using patterns and context."""
        concepts = self._extract_keywords(request)
        
        # Add pattern-based concepts
        for pattern in patterns:
            if pattern["type"] == "deployment_request":
                concepts.extend(["deployment", "release", "production"])
            elif pattern["type"] == "security_request":
                concepts.extend(["security", "audit", "compliance"])
            elif pattern["type"] == "monitoring_request":
                concepts.extend(["monitoring", "observability", "health"])
        
        # Add memory-based concepts
        for memory in memories[:5]:  # Top 5 memories
            if "tags" in memory:
                concepts.extend(memory["tags"][:3])  # Top 3 tags
        
        return list(set(concepts))  # Remove duplicates
    
    def _assign_tasks_intelligent(self, request: str, concepts: List[str], patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enhanced task assignment using patterns and concepts."""
        tasks = self._assign_tasks(request, concepts)  # Use base method first
        
        # Add pattern-based tasks
        for pattern in patterns:
            if pattern["type"] == "deployment_request":
                tasks.append({
                    "action": "deploy",
                    "target": "system",
                    "priority": "high",
                    "pattern_based": True,
                    "confidence": pattern["confidence"]
                })
            elif pattern["type"] == "security_request":
                tasks.append({
                    "action": "audit",
                    "target": "security",
                    "priority": "high",
                    "pattern_based": True,
                    "confidence": pattern["confidence"]
                })
        
        return tasks
    
    def _integrate_external_sources_intelligent(self, request: str, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enhanced external source integration."""
        # For now, return sources as-is (could be enhanced with web search, API calls, etc.)
        return sources
    
    def _synthesize_knowledge(self, concepts: List[str], memories: List[Dict[str, Any]], patterns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Synthesize knowledge from concepts, memories, and patterns."""
        synthesis = {
            "primary_concepts": concepts[:5],  # Top 5 concepts
            "memory_insights": len(memories),
            "pattern_insights": len(patterns),
            "synthesis_timestamp": datetime.now().isoformat()
        }
        
        # Add pattern-based insights
        if patterns:
            synthesis["dominant_pattern"] = patterns[0]["type"]
            synthesis["pattern_confidence"] = patterns[0]["confidence"]
        
        return synthesis
    
    def _predictive_analysis(self, request: str, concepts: List[str], patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate predictions based on patterns and context."""
        predictions = []
        
        # Predict likely next actions based on patterns
        for pattern in patterns:
            if pattern["type"] == "deployment_request":
                predictions.append({
                    "prediction": "post_deployment_verification_needed",
                    "confidence": 0.8,
                    "reasoning": "Deployments typically require verification"
                })
            elif pattern["type"] == "security_request":
                predictions.append({
                    "prediction": "security_findings_likely",
                    "confidence": 0.7,
                    "reasoning": "Security audits often reveal issues"
                })
        
        return predictions
    
    def _enhance_execution_plan_with_learning(self, execution_plan: Dict[str, Any], patterns: List[Dict[str, Any]], predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Enhance execution plan with learning insights."""
        # Add learning-based confidence boost
        if patterns:
            max_pattern_confidence = max(p.get("confidence", 0) for p in patterns)
            execution_plan["confidence"] = min(execution_plan.get("confidence", 0) + (max_pattern_confidence * 0.1), 1.0)
        
        # Add learning insights
        execution_plan["learning_insights"] = {
            "patterns_count": len(patterns),
            "predictions_count": len(predictions),
            "enhanced_by_learning": True
        }
        
        return execution_plan
    
    def _store_learning_insights(self, request: str, concepts: List[str], patterns: List[Dict[str, Any]], predictions: List[Dict[str, Any]], execution_plan: Dict[str, Any]):
        """Store learning insights in memory for future reference."""
        if self.memory:
            self.memory.store(
                category="learning_insights",
                content={
                    "request": request,
                    "concepts": concepts,
                    "patterns": patterns,
                    "predictions": predictions,
                    "execution_confidence": execution_plan.get("confidence", 0),
                    "learning_timestamp": datetime.now().isoformat()
                },
                tags=["learning", "insights"] + concepts[:3],
                source="brain_learning"
            )
    
    def get_learning_metrics(self) -> Dict[str, Any]:
        """Get current learning metrics."""
        return {
            "metrics": self.learning_metrics.copy(),
            "patterns_cached": len(self.pattern_cache),
            "knowledge_graph_size": len(self.knowledge_graph),
            "learning_efficiency": (
                self.learning_metrics["knowledge_synthesized"] / 
                max(self.learning_metrics["total_processed"], 1)
            )
        }
    
    def _identify_concepts(self, request: str, memories: List[Dict[str, Any]]) -> List[str]:
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
            print(f"BRAIN: Configured {len(preferences)} user preferences")
    
    def get_user_config(self) -> Dict[str, Any]:
        """Get current user configuration."""
        if self.memory:
            return self.memory.get_all_preferences(category="user_config")
        return {}


if __name__ == "__main__":
    brain = HeadyBrain()
    
    print("\n" + "="*80)
    print(" BRAIN - THE CENTRAL INTELLIGENCE ")
    print("="*80)
    
    awareness = brain.get_system_awareness()
    print(json.dumps(awareness, indent=2))
