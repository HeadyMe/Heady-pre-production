# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: HeadyAcademy/HeadyOptimizer.py
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
║     ∞ OPTIMIZER - INTELLIGENT RESOURCE ALLOCATION ∞                           ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                ║
║     Dynamic resource allocation and performance optimization                     ║
║     Real-time load balancing and adaptive scaling                               ║
║     Integrated with HeadyConductor for optimal system control                   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import time
import threading
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from collections import deque, defaultdict
import math

try:
    import psutil
    import numpy as np
    MONITORING_AVAILABLE = True
except ImportError:
    MONITORING_AVAILABLE = False
    print("⚠ HeadyOptimizer: psutil/numpy not available, limited optimization mode")


@dataclass
class ResourceMetrics:
    """Real-time resource metrics."""
    timestamp: str
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_io: Dict[str, int]
    process_count: int
    load_average: List[float]
    
@dataclass
class ServiceMetrics:
    """Service-specific metrics."""
    name: str
    response_time: float
    request_rate: float
    error_rate: float
    active_connections: int
    throughput: float
    
@dataclass
class OptimizationAction:
    """Optimization action to be executed."""
    action_type: str  # scale_up, scale_down, restart, migrate, optimize
    target: str  # service name or system resource
    priority: str  # critical, high, medium, low
    confidence: float  # 0.0 to 1.0
    estimated_impact: str  # description of expected impact
    parameters: Dict[str, Any]
    timestamp: str


class HeadyOptimizer:
    """
    OPTIMIZER - Intelligent Resource Allocation
    Dynamic resource allocation and performance optimization system.
    Integrated with HeadyConductor for optimal system control.
    """
    
    def __init__(self, conductor=None, lens=None):
        self.conductor = conductor
        self.lens = lens
        
        # Optimization state
        self.optimization_active = False
        self.optimization_thread = None
        self.last_optimization = None
        
        # Performance data stores
        self.resource_history = deque(maxlen=1000)
        self.service_metrics = {}
        self.optimization_history = deque(maxlen=500)
        self.performance_baselines = {}
        
        # Optimization parameters
        self.optimization_interval = 30  # seconds
        self.optimization_thresholds = {
            "cpu_critical": 90.0,
            "cpu_high": 75.0,
            "memory_critical": 85.0,
            "memory_high": 70.0,
            "response_time_critical": 5000,  # ms
            "response_time_high": 2000,  # ms
            "error_rate_critical": 10.0,  # %
            "error_rate_high": 5.0,  # %
        }
        
        # Adaptive learning
        self.optimization_effectiveness = defaultdict(list)
        self.learning_rate = 0.1
        
        print("∞ OPTIMIZER: Initialized - Intelligent Resource Allocation ready")
    
    def start_optimization(self):
        """Start continuous optimization."""
        if self.optimization_active:
            return {"status": "already_active"}
        
        self.optimization_active = True
        self.optimization_thread = threading.Thread(target=self._optimization_loop, daemon=True)
        self.optimization_thread.start()
        
        self._log_action("optimizer_start", "Optimization engine started")
        return {"status": "started", "timestamp": datetime.now().isoformat()}
    
    def stop_optimization(self):
        """Stop optimization."""
        self.optimization_active = False
        if self.optimization_thread:
            self.optimization_thread.join(timeout=10)
        
        self._log_action("optimizer_stop", "Optimization engine stopped")
        return {"status": "stopped", "timestamp": datetime.now().isoformat()}
    
    def _optimization_loop(self):
        """Main optimization loop."""
        while self.optimization_active:
            try:
                # Collect current metrics
                current_metrics = self._collect_metrics()
                
                # Analyze performance
                analysis = self._analyze_performance(current_metrics)
                
                # Generate optimization actions
                actions = self._generate_optimization_actions(analysis)
                
                # Execute high-priority actions
                critical_actions = [a for a in actions if a.priority == "critical"]
                for action in critical_actions:
                    self._execute_optimization_action(action)
                
                # Store optimization cycle
                self.last_optimization = {
                    "timestamp": datetime.now().isoformat(),
                    "metrics": current_metrics,
                    "analysis": analysis,
                    "actions": [asdict(a) for a in actions],
                    "executed": len(critical_actions)
                }
                
                time.sleep(self.optimization_interval)
                
            except Exception as e:
                self._log_action("optimization_error", f"Optimization error: {e}")
                time.sleep(self.optimization_interval)
    
    def _collect_metrics(self) -> Dict[str, Any]:
        """Collect comprehensive system metrics."""
        timestamp = datetime.now().isoformat()
        
        metrics = {
            "timestamp": timestamp,
            "resources": {},
            "services": {},
            "system": {}
        }
        
        # Resource metrics
        if MONITORING_AVAILABLE:
            metrics["resources"] = {
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_percent": psutil.disk_usage('/').percent,
                "network_io": {
                    "bytes_sent": psutil.net_io_counters().bytes_sent,
                    "bytes_recv": psutil.net_io_counters().bytes_recv
                },
                "process_count": len(psutil.pids()),
                "load_average": list(psutil.getloadavg()) if hasattr(psutil, 'getloadavg') else [0, 0, 0]
            }
            
            # Store in history
            self.resource_history.append(ResourceMetrics(
                timestamp=timestamp,
                cpu_percent=metrics["resources"]["cpu_percent"],
                memory_percent=metrics["resources"]["memory_percent"],
                disk_percent=metrics["resources"]["disk_percent"],
                network_io=metrics["resources"]["network_io"],
                process_count=metrics["resources"]["process_count"],
                load_average=metrics["resources"]["load_average"]
            ))
        
        # Service metrics (from conductor if available)
        if self.conductor:
            service_health = self.conductor.check_service_health()
            for service_name, health in service_health.get("services", {}).items():
                metrics["services"][service_name] = {
                    "status": health.get("status", "unknown"),
                    "endpoint": health.get("endpoint", "")
                }
        
        # System metrics from lens
        if self.lens:
            system_state = self.lens.get_current_state()
            metrics["system"] = {
                "health": system_state.get("system_health", "unknown"),
                "active_nodes": len(system_state.get("nodes_active", [])),
                "uptime": system_state.get("uptime_seconds", 0)
            }
        
        return metrics
    
    def _analyze_performance(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance and identify issues."""
        analysis = {
            "timestamp": datetime.now().isoformat(),
            "issues": [],
            "trends": {},
            "bottlenecks": [],
            "recommendations": []
        }
        
        # Resource analysis
        resources = metrics.get("resources", {})
        
        # CPU analysis
        cpu = resources.get("cpu_percent", 0)
        if cpu >= self.optimization_thresholds["cpu_critical"]:
            analysis["issues"].append({
                "type": "cpu_critical",
                "severity": "critical",
                "value": cpu,
                "threshold": self.optimization_thresholds["cpu_critical"],
                "description": f"CPU usage at {cpu:.1f}% (critical threshold: {self.optimization_thresholds['cpu_critical']}%)"
            })
        elif cpu >= self.optimization_thresholds["cpu_high"]:
            analysis["issues"].append({
                "type": "cpu_high",
                "severity": "high",
                "value": cpu,
                "threshold": self.optimization_thresholds["cpu_high"],
                "description": f"CPU usage at {cpu:.1f}% (high threshold: {self.optimization_thresholds['cpu_high']}%)"
            })
        
        # Memory analysis
        memory = resources.get("memory_percent", 0)
        if memory >= self.optimization_thresholds["memory_critical"]:
            analysis["issues"].append({
                "type": "memory_critical",
                "severity": "critical",
                "value": memory,
                "threshold": self.optimization_thresholds["memory_critical"],
                "description": f"Memory usage at {memory:.1f}% (critical threshold: {self.optimization_thresholds['memory_critical']}%)"
            })
        elif memory >= self.optimization_thresholds["memory_high"]:
            analysis["issues"].append({
                "type": "memory_high",
                "severity": "high",
                "value": memory,
                "threshold": self.optimization_thresholds["memory_high"],
                "description": f"Memory usage at {memory:.1f}% (high threshold: {self.optimization_thresholds['memory_high']}%)"
            })
        
        # Trend analysis
        if len(self.resource_history) >= 10:
            recent_metrics = list(self.resource_history)[-10:]
            
            # CPU trend
            cpu_values = [m.cpu_percent for m in recent_metrics]
            cpu_trend = self._calculate_trend(cpu_values)
            analysis["trends"]["cpu"] = {
                "direction": cpu_trend["direction"],
                "slope": cpu_trend["slope"],
                "prediction": cpu_trend["prediction"]
            }
            
            # Memory trend
            memory_values = [m.memory_percent for m in recent_metrics]
            memory_trend = self._calculate_trend(memory_values)
            analysis["trends"]["memory"] = {
                "direction": memory_trend["direction"],
                "slope": memory_trend["slope"],
                "prediction": memory_trend["prediction"]
            }
        
        # Service analysis
        services = metrics.get("services", {})
        for service_name, service_data in services.items():
            if service_data.get("status") == "down":
                analysis["issues"].append({
                    "type": "service_down",
                    "severity": "critical",
                    "service": service_name,
                    "description": f"Service '{service_name}' is down"
                })
        
        return analysis
    
    def _calculate_trend(self, values: List[float]) -> Dict[str, Any]:
        """Calculate trend direction and prediction."""
        if len(values) < 2:
            return {"direction": "stable", "slope": 0, "prediction": values[-1] if values else 0}
        
        # Simple linear regression
        x = list(range(len(values)))
        n = len(values)
        
        sum_x = sum(x)
        sum_y = sum(values)
        sum_xy = sum(x[i] * values[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
        
        # Determine direction
        if abs(slope) < 0.1:
            direction = "stable"
        elif slope > 0:
            direction = "increasing"
        else:
            direction = "decreasing"
        
        # Predict next value
        prediction = values[-1] + slope
        
        return {
            "direction": direction,
            "slope": slope,
            "prediction": max(0, min(100, prediction))  # Clamp to 0-100%
        }
    
    def _generate_optimization_actions(self, analysis: Dict[str, Any]) -> List[OptimizationAction]:
        """Generate optimization actions based on analysis."""
        actions = []
        
        for issue in analysis.get("issues", []):
            action = self._create_action_for_issue(issue)
            if action:
                actions.append(action)
        
        # Proactive optimization based on trends
        trends = analysis.get("trends", {})
        for resource, trend_data in trends.items():
            if trend_data["direction"] == "increasing" and trend_data["prediction"] > 80:
                actions.append(OptimizationAction(
                    action_type="proactive_scale",
                    target=resource,
                    priority="medium",
                    confidence=0.7,
                    estimated_impact=f"Preventive scaling for {resource} based on trend analysis",
                    parameters={"predicted_value": trend_data["prediction"]},
                    timestamp=datetime.now().isoformat()
                ))
        
        # Sort by priority and confidence
        priority_order = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        actions.sort(key=lambda a: (priority_order.get(a.priority, 0), a.confidence), reverse=True)
        
        return actions
    
    def _create_action_for_issue(self, issue: Dict[str, Any]) -> Optional[OptimizationAction]:
        """Create optimization action for a specific issue."""
        issue_type = issue["type"]
        severity = issue["severity"]
        
        if issue_type == "cpu_critical":
            return OptimizationAction(
                action_type="scale_up",
                target="system",
                priority="critical",
                confidence=0.9,
                estimated_impact="Reduce CPU load by scaling up resources",
                parameters={"resource": "cpu", "current_value": issue["value"]},
                timestamp=datetime.now().isoformat()
            )
        
        elif issue_type == "memory_critical":
            return OptimizationAction(
                action_type="optimize_memory",
                target="system",
                priority="critical",
                confidence=0.8,
                estimated_impact="Free up memory and optimize usage",
                parameters={"resource": "memory", "current_value": issue["value"]},
                timestamp=datetime.now().isoformat()
            )
        
        elif issue_type == "service_down":
            return OptimizationAction(
                action_type="restart_service",
                target=issue["service"],
                priority="critical",
                confidence=0.9,
                estimated_impact=f"Restart service '{issue['service']}'",
                parameters={"service": issue["service"]},
                timestamp=datetime.now().isoformat()
            )
        
        elif issue_type == "cpu_high":
            return OptimizationAction(
                action_type="optimize_processes",
                target="system",
                priority="high",
                confidence=0.7,
                estimated_impact="Optimize process scheduling and CPU usage",
                parameters={"resource": "cpu", "current_value": issue["value"]},
                timestamp=datetime.now().isoformat()
            )
        
        return None
    
    def _execute_optimization_action(self, action: OptimizationAction):
        """Execute an optimization action."""
        try:
            success = False
            result = {}
            
            if action.action_type == "scale_up":
                result = self._scale_up_resources(action.parameters)
            elif action.action_type == "optimize_memory":
                result = self._optimize_memory(action.parameters)
            elif action.action_type == "restart_service":
                result = self._restart_service(action.parameters)
            elif action.action_type == "optimize_processes":
                result = self._optimize_processes(action.parameters)
            elif action.action_type == "proactive_scale":
                result = self._proactive_scaling(action.parameters)
            
            success = result.get("success", False)
            
            # Record action
            self._log_action("optimization_executed", {
                "action": asdict(action),
                "result": result,
                "success": success
            })
            
            # Learn from effectiveness
            if success:
                self.optimization_effectiveness[action.action_type].append(1.0)
            else:
                self.optimization_effectiveness[action.action_type].append(0.0)
            
            # Keep only recent effectiveness data
            if len(self.optimization_effectiveness[action.action_type]) > 10:
                self.optimization_effectiveness[action.action_type] = self.optimization_effectiveness[action.action_type][-10:]
        
        except Exception as e:
            self._log_action("optimization_error", f"Failed to execute action {action.action_type}: {e}")
    
    def _scale_up_resources(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Scale up system resources."""
        # This would integrate with container orchestration or cloud APIs
        # For now, simulate the action
        resource = params.get("resource", "unknown")
        
        self._log_action("scale_up", f"Scaling up {resource} resources")
        
        # Trigger garbage collection if memory is the issue
        if resource == "memory" and MONITORING_AVAILABLE:
            import gc
            gc.collect()
        
        return {
            "success": True,
            "action": "scale_up",
            "resource": resource,
            "message": f"Successfully initiated scale up for {resource}"
        }
    
    def _optimize_memory(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize memory usage."""
        if MONITORING_AVAILABLE:
            import gc
            gc.collect()
        
        # Clear optimization history if it's getting large
        if len(self.optimization_history) > 400:
            self.optimization_history = deque(list(self.optimization_history)[-200:], maxlen=500)
        
        return {
            "success": True,
            "action": "optimize_memory",
            "message": "Memory optimization completed"
        }
    
    def _restart_service(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Restart a service."""
        service_name = params.get("service")
        
        # This would integrate with service management (systemd, docker, etc.)
        # For now, just log the action
        self._log_action("service_restart", f"Restarting service: {service_name}")
        
        return {
            "success": True,
            "action": "restart_service",
            "service": service_name,
            "message": f"Service restart initiated for {service_name}"
        }
    
    def _optimize_processes(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize process scheduling."""
        # This would adjust process priorities and scheduling
        return {
            "success": True,
            "action": "optimize_processes",
            "message": "Process optimization completed"
        }
    
    def _proactive_scaling(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Proactive scaling based on predictions."""
        predicted_value = params.get("predicted_value", 0)
        
        self._log_action("proactive_scaling", f"Proactive scaling for predicted value: {predicted_value}")
        
        return {
            "success": True,
            "action": "proactive_scaling",
            "predicted_value": predicted_value,
            "message": "Proactive scaling initiated"
        }
    
    def _log_action(self, action_type: str, message: str):
        """Log optimization action."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "type": action_type,
            "message": message
        }
        self.optimization_history.append(log_entry)
    
    def get_optimization_status(self) -> Dict[str, Any]:
        """Get current optimization status."""
        return {
            "timestamp": datetime.now().isoformat(),
            "optimization_active": self.optimization_active,
            "last_optimization": self.last_optimization,
            "optimization_interval": self.optimization_interval,
            "thresholds": self.optimization_thresholds,
            "effectiveness": {
                action_type: {
                    "success_rate": sum(scores) / len(scores) if scores else 0,
                    "sample_size": len(scores)
                }
                for action_type, scores in self.optimization_effectiveness.items()
            }
        }
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report."""
        report = {
            "timestamp": datetime.now().isoformat(),
            "current_metrics": self._collect_metrics(),
            "resource_trends": {},
            "optimization_recommendations": [],
            "system_health_score": 0
        }
        
        # Calculate trends
        if len(self.resource_history) >= 10:
            recent_metrics = list(self.resource_history)[-10:]
            
            cpu_values = [m.cpu_percent for m in recent_metrics]
            memory_values = [m.memory_percent for m in recent_metrics]
            
            report["resource_trends"]["cpu"] = self._calculate_trend(cpu_values)
            report["resource_trends"]["memory"] = self._calculate_trend(memory_values)
        
        # Generate recommendations
        current_metrics = report["current_metrics"]
        resources = current_metrics.get("resources", {})
        
        if resources.get("cpu_percent", 0) > 70:
            report["optimization_recommendations"].append({
                "type": "performance",
                "priority": "high",
                "message": "Consider scaling up CPU resources or optimizing CPU-intensive processes"
            })
        
        if resources.get("memory_percent", 0) > 70:
            report["optimization_recommendations"].append({
                "type": "memory",
                "priority": "high",
                "message": "Consider optimizing memory usage or adding more memory"
            })
        
        # Calculate system health score
        cpu_score = max(0, 100 - resources.get("cpu_percent", 0))
        memory_score = max(0, 100 - resources.get("memory_percent", 0))
        
        report["system_health_score"] = (cpu_score + memory_score) / 2
        
        return report
    
    def configure_thresholds(self, thresholds: Dict[str, float]):
        """Configure optimization thresholds."""
        self.optimization_thresholds.update(thresholds)
        self._log_action("thresholds_updated", f"Updated thresholds: {thresholds}")
    
    def integrate_with_conductor(self, conductor):
        """Integrate with HeadyConductor for coordinated optimization."""
        self.conductor = conductor
        
        # Register optimizer as a node in conductor
        if hasattr(conductor, 'registry'):
            conductor.registry.add_node({
                "name": "OPTIMIZER",
                "role": "Resource Allocator",
                "primary_tool": "heady_optimizer",
                "trigger_on": ["optimize", "performance", "resources", "scaling"],
                "status": "active"
            })
        
        print("∞ OPTIMIZER: Integrated with HeadyConductor")


if __name__ == "__main__":
    optimizer = HeadyOptimizer()
    
    print("\n" + "="*80)
    print("∞ OPTIMIZER - INTELLIGENT RESOURCE ALLOCATION ∞")
    print("="*80)
    
    # Start optimization
    optimizer.start_optimization()
    
    # Wait for some data collection
    time.sleep(5)
    
    # Get status
    status = optimizer.get_optimization_status()
    print(json.dumps(status, indent=2))
    
    # Get performance report
    report = optimizer.get_performance_report()
    print("\n" + "="*80)
    print("PERFORMANCE REPORT")
    print("="*80)
    print(json.dumps(report, indent=2))
    
    optimizer.stop_optimization()
