#!/usr/bin/env python3
"""
Heady Dynamic Orchestrator
Implements intelligent orchestration with auto-scaling, health checks, and failover
Based on HeadyConductor and HeadyResonance patents
"""

import os
import sys
import json
import asyncio
import hashlib
import time
import psutil
import aiohttp
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timezone, timedelta
from enum import Enum
import numpy as np
from collections import deque
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Golden Ratio for optimization (HeadyPhi patent)
PHI = 1.618033988749895

class NodeState(Enum):
    """Node operational states"""
    INITIALIZING = "initializing"
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    DRAINING = "draining"
    TERMINATED = "terminated"

class ScalingAction(Enum):
    """Scaling actions"""
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    MAINTAIN = "maintain"

@dataclass
class NodeMetrics:
    """Node performance metrics"""
    node_id: str
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_throughput: float
    request_latency: float
    error_rate: float
    timestamp: datetime
    
    def health_score(self) -> float:
        """Calculate overall health score (0-100)"""
        # Weighted health calculation
        cpu_weight = 0.25
        memory_weight = 0.25
        disk_weight = 0.15
        latency_weight = 0.20
        error_weight = 0.15
        
        # Normalize metrics (inverse for latency and error rate)
        cpu_health = 100 - self.cpu_percent
        memory_health = 100 - self.memory_percent
        disk_health = 100 - self.disk_percent
        latency_health = max(0, 100 - (self.request_latency * 10))  # Assume 10s = 0 health
        error_health = 100 - (self.error_rate * 100)
        
        score = (
            cpu_health * cpu_weight +
            memory_health * memory_weight +
            disk_health * disk_weight +
            latency_health * latency_weight +
            error_health * error_weight
        )
        
        return max(0, min(100, score))

@dataclass
class WorkloadPattern:
    """Workload pattern analysis"""
    pattern_type: str  # periodic, burst, steady, declining
    period_seconds: Optional[float]
    amplitude: float
    trend: float  # positive = increasing, negative = decreasing
    confidence: float

class HeadyNode:
    """Represents a managed node in the orchestration system"""
    
    def __init__(self, node_id: str, node_type: str, config: Dict[str, Any]):
        self.node_id = node_id
        self.node_type = node_type
        self.config = config
        self.state = NodeState.INITIALIZING
        self.created_at = datetime.now(timezone.utc)
        self.last_health_check = None
        self.health_history = deque(maxlen=100)
        self.metrics_history = deque(maxlen=1000)
        
    async def health_check(self) -> NodeMetrics:
        """Perform health check on node"""
        try:
            # Collect system metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Simulate network and application metrics
            # In production, these would come from actual monitoring
            network_throughput = np.random.uniform(100, 1000)  # MB/s
            request_latency = np.random.exponential(0.5)  # seconds
            error_rate = np.random.beta(1, 100)  # error percentage
            
            metrics = NodeMetrics(
                node_id=self.node_id,
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                disk_percent=disk.percent,
                network_throughput=network_throughput,
                request_latency=request_latency,
                error_rate=error_rate,
                timestamp=datetime.now(timezone.utc)
            )
            
            # Update health history
            health_score = metrics.health_score()
            self.health_history.append(health_score)
            self.metrics_history.append(metrics)
            
            # Update node state based on health
            if health_score >= 80:
                self.state = NodeState.HEALTHY
            elif health_score >= 60:
                self.state = NodeState.DEGRADED
            else:
                self.state = NodeState.UNHEALTHY
            
            self.last_health_check = datetime.now(timezone.utc)
            return metrics
            
        except Exception as e:
            logger.error(f"Health check failed for node {self.node_id}: {e}")
            self.state = NodeState.UNHEALTHY
            raise
    
    async def drain(self):
        """Drain node before termination"""
        self.state = NodeState.DRAINING
        # Wait for in-flight requests to complete
        await asyncio.sleep(5)  # Simulated drain time
        
    async def terminate(self):
        """Terminate node"""
        if self.state != NodeState.DRAINING:
            await self.drain()
        self.state = NodeState.TERMINATED

class ResonanceAnalyzer:
    """Implements HeadyResonance pattern - treats system as waveforms"""
    
    def __init__(self, sample_window: int = 100):
        self.sample_window = sample_window
        
    def detect_pattern(self, metrics: List[float]) -> WorkloadPattern:
        """Detect workload patterns using spectral analysis"""
        if len(metrics) < 10:
            return WorkloadPattern(
                pattern_type="unknown",
                period_seconds=None,
                amplitude=0,
                trend=0,
                confidence=0
            )
        
        # Convert to numpy array
        data = np.array(metrics)
        
        # Detrend data
        x = np.arange(len(data))
        trend_coeff = np.polyfit(x, data, 1)[0]
        detrended = data - np.polyval([trend_coeff, 0], x)
        
        # FFT for frequency analysis
        fft = np.fft.fft(detrended)
        frequencies = np.fft.fftfreq(len(detrended))
        
        # Find dominant frequency
        power = np.abs(fft) ** 2
        dominant_freq_idx = np.argmax(power[1:len(power)//2]) + 1
        dominant_freq = frequencies[dominant_freq_idx]
        
        # Calculate pattern characteristics
        if dominant_freq > 0:
            period = 1 / dominant_freq
            pattern_type = "periodic"
        else:
            period = None
            if trend_coeff > 0.5:
                pattern_type = "burst"
            elif abs(trend_coeff) < 0.1:
                pattern_type = "steady"
            else:
                pattern_type = "declining"
        
        amplitude = np.std(detrended)
        confidence = min(1.0, power[dominant_freq_idx] / np.sum(power) * 10)
        
        return WorkloadPattern(
            pattern_type=pattern_type,
            period_seconds=period,
            amplitude=amplitude,
            trend=trend_coeff,
            confidence=confidence
        )
    
    def calculate_phase_shift(self, pattern: WorkloadPattern) -> float:
        """Calculate optimal phase shift to avoid destructive interference"""
        if pattern.pattern_type != "periodic" or not pattern.period_seconds:
            return 0
        
        # Use golden ratio for optimal phase shifting
        return pattern.period_seconds / PHI

class DynamicOrchestrator:
    """Main orchestration engine with auto-scaling and failover"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.nodes: Dict[str, HeadyNode] = {}
        self.resonance_analyzer = ResonanceAnalyzer()
        
        # Scaling parameters
        self.min_nodes = config.get("min_nodes", 1)
        self.max_nodes = config.get("max_nodes", 10)
        self.target_health = config.get("target_health", 75)
        self.scale_up_threshold = config.get("scale_up_threshold", 80)
        self.scale_down_threshold = config.get("scale_down_threshold", 30)
        
        # Metrics tracking
        self.cluster_metrics_history = deque(maxlen=1000)
        self.scaling_history = deque(maxlen=100)
        
    async def provision_node(self, node_type: str = "worker") -> HeadyNode:
        """Provision a new node"""
        node_id = f"{node_type}-{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        node_config = {
            "type": node_type,
            "resources": {
                "cpu": 2,
                "memory": 4096,
                "disk": 20480
            },
            "capabilities": self._get_node_capabilities(node_type)
        }
        
        node = HeadyNode(node_id, node_type, node_config)
        self.nodes[node_id] = node
        
        # Initialize node
        await asyncio.sleep(2)  # Simulated provisioning time
        node.state = NodeState.HEALTHY
        
        logger.info(f"Provisioned new node: {node_id}")
        return node
    
    def _get_node_capabilities(self, node_type: str) -> List[str]:
        """Get capabilities for node type"""
        capabilities_map = {
            "worker": ["compute", "storage"],
            "api": ["http", "websocket"],
            "database": ["storage", "query"],
            "cache": ["memory", "fast_read"],
            "gpu": ["compute", "ml_inference"]
        }
        return capabilities_map.get(node_type, ["compute"])
    
    async def deprovision_node(self, node_id: str):
        """Deprovision a node"""
        if node_id not in self.nodes:
            return
        
        node = self.nodes[node_id]
        await node.terminate()
        del self.nodes[node_id]
        
        logger.info(f"Deprovisioned node: {node_id}")
    
    async def collect_cluster_metrics(self) -> Dict[str, Any]:
        """Collect metrics from all nodes"""
        if not self.nodes:
            return {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "node_count": 0,
                "avg_health": 0,
                "total_cpu": 0,
                "total_memory": 0,
                "total_requests": 0
            }
        
        # Collect metrics from all healthy nodes
        metrics_tasks = []
        for node in self.nodes.values():
            if node.state not in [NodeState.TERMINATED, NodeState.DRAINING]:
                metrics_tasks.append(node.health_check())
        
        node_metrics = await asyncio.gather(*metrics_tasks, return_exceptions=True)
        
        # Filter out exceptions
        valid_metrics = [m for m in node_metrics if isinstance(m, NodeMetrics)]
        
        if not valid_metrics:
            return {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "node_count": len(self.nodes),
                "avg_health": 0,
                "total_cpu": 0,
                "total_memory": 0,
                "total_requests": 0
            }
        
        # Calculate cluster-wide metrics
        avg_health = np.mean([m.health_score() for m in valid_metrics])
        total_cpu = np.sum([m.cpu_percent for m in valid_metrics])
        total_memory = np.sum([m.memory_percent for m in valid_metrics])
        avg_latency = np.mean([m.request_latency for m in valid_metrics])
        
        cluster_metrics = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "node_count": len(self.nodes),
            "healthy_nodes": len(valid_metrics),
            "avg_health": avg_health,
            "total_cpu": total_cpu,
            "total_memory": total_memory,
            "avg_latency": avg_latency,
            "node_metrics": [asdict(m) for m in valid_metrics]
        }
        
        self.cluster_metrics_history.append(cluster_metrics)
        return cluster_metrics
    
    def determine_scaling_action(self, metrics: Dict[str, Any]) -> ScalingAction:
        """Determine if scaling is needed based on metrics"""
        if not metrics or metrics["node_count"] == 0:
            return ScalingAction.SCALE_UP
        
        avg_health = metrics["avg_health"]
        node_count = metrics["node_count"]
        
        # Get recent health scores for pattern analysis
        recent_health = [m["avg_health"] for m in list(self.cluster_metrics_history)[-100:]]
        
        # Detect workload pattern
        pattern = self.resonance_analyzer.detect_pattern(recent_health)
        
        # Predictive scaling based on pattern
        if pattern.pattern_type == "burst" and pattern.trend > 0:
            # Preemptively scale up for increasing burst
            if node_count < self.max_nodes:
                return ScalingAction.SCALE_UP
        
        # Reactive scaling based on thresholds
        if avg_health < self.scale_down_threshold and node_count < self.max_nodes:
            return ScalingAction.SCALE_UP
        elif avg_health > self.scale_up_threshold and node_count > self.min_nodes:
            return ScalingAction.SCALE_DOWN
        
        return ScalingAction.MAINTAIN
    
    async def apply_scaling_action(self, action: ScalingAction):
        """Apply the determined scaling action"""
        if action == ScalingAction.SCALE_UP:
            # Use golden ratio for scaling increments
            scale_factor = int(PHI)
            for _ in range(scale_factor):
                if len(self.nodes) < self.max_nodes:
                    await self.provision_node()
        
        elif action == ScalingAction.SCALE_DOWN:
            # Find least healthy node to remove
            if len(self.nodes) > self.min_nodes:
                unhealthy_nodes = [
                    (node.node_id, np.mean(list(node.health_history)))
                    for node in self.nodes.values()
                    if node.state != NodeState.TERMINATED
                ]
                
                if unhealthy_nodes:
                    unhealthy_nodes.sort(key=lambda x: x[1])
                    await self.deprovision_node(unhealthy_nodes[0][0])
        
        # Log scaling action
        self.scaling_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action.value,
            "node_count": len(self.nodes)
        })
    
    async def handle_node_failure(self, failed_node_id: str):
        """Handle node failure with automatic failover"""
        logger.warning(f"Handling failure for node: {failed_node_id}")
        
        if failed_node_id not in self.nodes:
            return
        
        failed_node = self.nodes[failed_node_id]
        node_type = failed_node.node_type
        
        # Mark node as unhealthy
        failed_node.state = NodeState.UNHEALTHY
        
        # Provision replacement node
        replacement = await self.provision_node(node_type)
        
        # Transfer workload (simulated)
        logger.info(f"Migrating workload from {failed_node_id} to {replacement.node_id}")
        await asyncio.sleep(1)
        
        # Deprovision failed node
        await self.deprovision_node(failed_node_id)
    
    async def optimize_placement(self):
        """Optimize node placement using resonance patterns"""
        if len(self.nodes) < 2:
            return
        
        # Analyze workload patterns across nodes
        node_patterns = {}
        for node in self.nodes.values():
            if len(node.health_history) > 10:
                pattern = self.resonance_analyzer.detect_pattern(list(node.health_history))
                node_patterns[node.node_id] = pattern
        
        # Find nodes with periodic patterns
        periodic_nodes = [
            (node_id, pattern)
            for node_id, pattern in node_patterns.items()
            if pattern.pattern_type == "periodic" and pattern.confidence > 0.7
        ]
        
        # Apply phase shifting to avoid destructive interference
        if len(periodic_nodes) >= 2:
            base_phase = 0
            for i, (node_id, pattern) in enumerate(periodic_nodes):
                phase_shift = self.resonance_analyzer.calculate_phase_shift(pattern)
                # In production, this would adjust actual workload scheduling
                logger.info(f"Applying phase shift of {phase_shift:.2f}s to node {node_id}")
    
    async def run_orchestration_loop(self):
        """Main orchestration loop"""
        logger.info("Starting orchestration loop")
        
        # Ensure minimum nodes
        while len(self.nodes) < self.min_nodes:
            await self.provision_node()
        
        while True:
            try:
                # Collect metrics
                metrics = await self.collect_cluster_metrics()
                
                # Check for failed nodes
                for node in list(self.nodes.values()):
                    if node.state == NodeState.UNHEALTHY:
                        await self.handle_node_failure(node.node_id)
                
                # Determine and apply scaling
                scaling_action = self.determine_scaling_action(metrics)
                await self.apply_scaling_action(scaling_action)
                
                # Optimize placement periodically
                if len(self.cluster_metrics_history) % 10 == 0:
                    await self.optimize_placement()
                
                # Log cluster state
                logger.info(f"Cluster state: {len(self.nodes)} nodes, "
                          f"avg health: {metrics.get('avg_health', 0):.1f}")
                
                # Wait before next iteration
                await asyncio.sleep(10)
                
            except Exception as e:
                logger.error(f"Orchestration loop error: {e}")
                await asyncio.sleep(5)

class TempoOptimizer:
    """Implements HeadyTempo - predictive timing optimization"""
    
    def __init__(self):
        self.energy_prices = deque(maxlen=96)  # 24 hours at 15-min intervals
        self.thermal_load = deque(maxlen=100)
        
    def predict_optimal_time(self, task_duration: float, 
                            priority: float = 0.5) -> datetime:
        """Predict optimal time to run a task"""
        # Simulate energy price prediction
        current_hour = datetime.now(timezone.utc).hour
        
        # Energy is typically cheaper at night
        night_hours = list(range(0, 6)) + list(range(22, 24))
        
        if priority < 0.3:  # Low priority - wait for cheap energy
            if current_hour not in night_hours:
                # Schedule for next cheap period
                if current_hour < 22:
                    optimal_hour = 22
                else:
                    optimal_hour = 0
                
                optimal_time = datetime.now(timezone.utc).replace(
                    hour=optimal_hour, minute=0, second=0, microsecond=0
                )
                
                if optimal_hour == 0:
                    optimal_time += timedelta(days=1)
                
                return optimal_time
        
        # High priority - run immediately
        return datetime.now(timezone.utc)
    
    def calculate_wait_weight(self, wait_time: float, benefit: float) -> float:
        """Calculate wait-to-weight arbitration"""
        # Use golden ratio for weight calculation
        weight = benefit * (1 / (1 + wait_time / PHI))
        return weight

# Export main components
__all__ = [
    'DynamicOrchestrator',
    'HeadyNode',
    'NodeMetrics',
    'NodeState',
    'ResonanceAnalyzer',
    'TempoOptimizer',
    'WorkloadPattern'
]
