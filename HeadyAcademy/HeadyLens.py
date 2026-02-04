# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: HeadyAcademy/HeadyLens.py
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
║     ∞ LENS - THE ALL-SEEING EYE ∞                                             ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                            ║
║     Real-time comprehensive system awareness                                  ║
║     Registered in HeadyRegistry for orchestrated monitoring                   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import time
import threading
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict
from collections import deque

try:
    import psutil
    import requests
    MONITORING_AVAILABLE = True
except ImportError:
    MONITORING_AVAILABLE = False
    print("⚠ HeadyLens: psutil/requests not available, limited monitoring mode")


@dataclass
class SystemSnapshot:
    timestamp: str
    services: Dict[str, str]  # name -> status
    resources: Dict[str, float]  # metric -> value
    nodes_active: List[str]
    workflows_available: List[str]
    events_count: int
    system_health: str  # healthy, degraded, critical


class HeadyLens:
    """
    LENS - The All-Seeing Eye
    Real-time comprehensive monitoring of all Heady system components.
    Indexed in HeadyRegistry as a core system node.
    """
    
    def __init__(self, registry=None):
        self.registry = registry
        self.monitoring_active = False
        self.monitor_thread = None
        
        # Real-time data stores (indexed for performance)
        self.service_status_index: Dict[str, Dict[str, Any]] = {}
        self.resource_metrics_index: Dict[str, Any] = {}
        self.event_stream = deque(maxlen=5000)
        self.snapshot_history = deque(maxlen=100)
        
        # Performance indexes
        self.node_activity_index: Dict[str, List[str]] = {}  # node -> [timestamps]
        self.workflow_execution_index: Dict[str, List[str]] = {}  # workflow -> [timestamps]
        
        # Configuration
        self.check_interval = 5
        self.start_time = datetime.now()
        
        print("∞ LENS: Initialized - The All-Seeing Eye is ready")
    
    def start_monitoring(self):
        """Start real-time monitoring."""
        if self.monitoring_active:
            return {"status": "already_active"}
        
        self.monitoring_active = True
        self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitor_thread.start()
        
        self._log_event("info", "LENS started monitoring")
        return {"status": "started", "timestamp": datetime.now().isoformat()}
    
    def stop_monitoring(self):
        """Stop monitoring."""
        self.monitoring_active = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        
        self._log_event("info", "LENS stopped monitoring")
        return {"status": "stopped", "timestamp": datetime.now().isoformat()}
    
    def _monitoring_loop(self):
        """Background monitoring loop."""
        while self.monitoring_active:
            try:
                self._update_indexes()
                time.sleep(self.check_interval)
            except Exception as e:
                self._log_event("error", f"Monitoring error: {e}")
                time.sleep(self.check_interval)
    
    def _update_indexes(self):
        """Update all performance indexes."""
        timestamp = datetime.now().isoformat()
        
        # Update service status index
        if self.registry:
            for service_name, service in self.registry.services.items():
                self.service_status_index[service_name] = {
                    "status": service.status,
                    "last_check": timestamp,
                    "endpoint": service.endpoint
                }
        
        # Update resource metrics index
        if MONITORING_AVAILABLE:
            self.resource_metrics_index = {
                "cpu_percent": psutil.cpu_percent(interval=0.1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_percent": psutil.disk_usage('/').percent,
                "timestamp": timestamp
            }
        
        # Create snapshot
        snapshot = self._create_snapshot()
        self.snapshot_history.append(snapshot)
    
    def _create_snapshot(self) -> SystemSnapshot:
        """Create comprehensive system snapshot."""
        services = {}
        nodes_active = []
        workflows_available = []
        
        if self.registry:
            services = {name: svc.status for name, svc in self.registry.services.items()}
            nodes_active = [name for name, node in self.registry.nodes.items() if node.status == "active"]
            workflows_available = list(self.registry.workflows.keys())
        
        # Determine system health
        service_statuses = list(services.values())
        if all(s == "healthy" for s in service_statuses):
            system_health = "healthy"
        elif any(s == "down" for s in service_statuses):
            system_health = "critical"
        else:
            system_health = "degraded"
        
        return SystemSnapshot(
            timestamp=datetime.now().isoformat(),
            services=services,
            resources=self.resource_metrics_index.copy(),
            nodes_active=nodes_active,
            workflows_available=workflows_available,
            events_count=len(self.event_stream),
            system_health=system_health
        )
    
    def get_current_state(self) -> Dict[str, Any]:
        """Get current system state (indexed for fast access)."""
        snapshot = self._create_snapshot()
        
        return {
            "timestamp": snapshot.timestamp,
            "system_health": snapshot.system_health,
            "services": snapshot.services,
            "resources": snapshot.resources,
            "nodes_active": snapshot.nodes_active,
            "workflows_available": snapshot.workflows_available,
            "events_recent": list(self.event_stream)[-10:],
            "uptime_seconds": (datetime.now() - self.start_time).total_seconds(),
            "monitoring_active": self.monitoring_active
        }
    
    def query_index(self, query_type: str, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Query indexed data for fast retrieval."""
        filters = filters or {}
        
        if query_type == "services":
            return self.service_status_index
        
        elif query_type == "resources":
            return self.resource_metrics_index
        
        elif query_type == "node_activity":
            node_name = filters.get("node")
            if node_name:
                return {node_name: self.node_activity_index.get(node_name, [])}
            return self.node_activity_index
        
        elif query_type == "workflow_executions":
            workflow_name = filters.get("workflow")
            if workflow_name:
                return {workflow_name: self.workflow_execution_index.get(workflow_name, [])}
            return self.workflow_execution_index
        
        elif query_type == "events":
            limit = filters.get("limit", 100)
            return {"events": list(self.event_stream)[-limit:]}
        
        elif query_type == "snapshots":
            limit = filters.get("limit", 10)
            return {"snapshots": [asdict(s) for s in list(self.snapshot_history)[-limit:]]}
        
        return {"error": "Unknown query type"}
    
    def record_node_activity(self, node_name: str):
        """Record node activity in index."""
        timestamp = datetime.now().isoformat()
        if node_name not in self.node_activity_index:
            self.node_activity_index[node_name] = []
        self.node_activity_index[node_name].append(timestamp)
        
        # Keep last 1000 activities per node
        if len(self.node_activity_index[node_name]) > 1000:
            self.node_activity_index[node_name] = self.node_activity_index[node_name][-1000:]
    
    def record_workflow_execution(self, workflow_name: str):
        """Record workflow execution in index."""
        timestamp = datetime.now().isoformat()
        if workflow_name not in self.workflow_execution_index:
            self.workflow_execution_index[workflow_name] = []
        self.workflow_execution_index[workflow_name].append(timestamp)
        
        # Keep last 1000 executions per workflow
        if len(self.workflow_execution_index[workflow_name]) > 1000:
            self.workflow_execution_index[workflow_name] = self.workflow_execution_index[workflow_name][-1000:]
    
    def _log_event(self, event_type: str, message: str):
        """Log event to stream."""
        event = {
            "timestamp": datetime.now().isoformat(),
            "type": event_type,
            "message": message
        }
        self.event_stream.append(event)
    
    def get_health_summary(self) -> Dict[str, Any]:
        """Get quick health summary."""
        snapshot = self._create_snapshot()
        
        return {
            "system_health": snapshot.system_health,
            "services_up": sum(1 for s in snapshot.services.values() if s in ["healthy", "available"]),
            "services_total": len(snapshot.services),
            "nodes_active": len(snapshot.nodes_active),
            "workflows_available": len(snapshot.workflows_available),
            "uptime_seconds": (datetime.now() - self.start_time).total_seconds(),
            "timestamp": snapshot.timestamp
        }


if __name__ == "__main__":
    lens = HeadyLens()
    lens.start_monitoring()
    
    print("\n" + "="*80)
    print("∞ LENS - THE ALL-SEEING EYE ∞")
    print("="*80)
    
    time.sleep(2)
    
    state = lens.get_current_state()
    print(json.dumps(state, indent=2))
    
    lens.stop_monitoring()
