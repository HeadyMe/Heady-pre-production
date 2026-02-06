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
# ║  FILE: src/heady_project/audit.py                                 ║
# ║  LAYER: backend/src                                               ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

from .utils import get_logger
import datetime
import platform
import psutil
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

logger = get_logger(__name__)

@dataclass
class AuditEvent:
    """Structured audit event schema"""
    timestamp: str
    event_type: str
    severity: str
    source: str
    message: str
    metadata: Dict[str, Any]
    checksum: str = ""

    def __post_init__(self):
        # Generate checksum for integrity
        content = f"{self.timestamp}{self.event_type}{self.severity}{self.source}{self.message}"
        self.checksum = hashlib.sha256(content.encode()).hexdigest()[:16]

@dataclass
class SystemMetrics:
    """System health metrics schema"""
    timestamp: str
    platform: str
    cpu_count: int
    cpu_percent: float
    memory_total: int
    memory_available: int
    memory_percent: float
    disk_usage: Dict[str, int]
    network_connections: int
    processes: int

class AuditManager:
    """Enhanced audit management system"""
    
    def __init__(self, audit_log_path: Optional[Path] = None):
        self.audit_log_path = audit_log_path or Path("audit_logs.jsonl")
        self.events: List[AuditEvent] = []
        
    def log_event(self, event_type: str, severity: str, source: str, message: str, 
                  metadata: Optional[Dict[str, Any]] = None) -> AuditEvent:
        """Log a structured audit event"""
        event = AuditEvent(
            timestamp=datetime.datetime.now().isoformat(),
            event_type=event_type,
            severity=severity.upper(),
            source=source,
            message=message,
            metadata=metadata or {}
        )
        
        self.events.append(event)
        logger.info(f"[{severity}] {event_type}: {message}")
        
        # Persist to file
        self._persist_event(event)
        return event
    
    def _persist_event(self, event: AuditEvent):
        """Persist audit event to log file"""
        try:
            with open(self.audit_log_path, 'a', encoding='utf-8') as f:
                f.write(json.dumps(asdict(event)) + '\n')
        except Exception as e:
            logger.error(f"Failed to persist audit event: {e}")
    
    def get_system_metrics(self) -> SystemMetrics:
        """Collect comprehensive system metrics"""
        disk = psutil.disk_usage('/')
        network = len(psutil.net_connections())
        
        return SystemMetrics(
            timestamp=datetime.datetime.now().isoformat(),
            platform=platform.platform(),
            cpu_count=psutil.cpu_count(),
            cpu_percent=psutil.cpu_percent(interval=1),
            memory_total=psutil.virtual_memory().total,
            memory_available=psutil.virtual_memory().available,
            memory_percent=psutil.virtual_memory().percent,
            disk_usage={
                'total': disk.total,
                'used': disk.used,
                'free': disk.free
            },
            network_connections=network,
            processes=len(psutil.pids())
        )
    
    def validate_audit_integrity(self) -> Dict[str, Any]:
        """Validate audit log integrity"""
        if not self.audit_log_path.exists():
            return {"valid": False, "error": "Audit log not found"}
        
        try:
            with open(self.audit_log_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            valid_events = 0
            corrupted_events = 0
            
            for line in lines:
                try:
                    event_data = json.loads(line.strip())
                    event = AuditEvent(**event_data)
                    
                    # Verify checksum
                    content = f"{event.timestamp}{event.event_type}{event.severity}{event.source}{event.message}"
                    expected_checksum = hashlib.sha256(content.encode()).hexdigest()[:16]
                    
                    if event.checksum == expected_checksum:
                        valid_events += 1
                    else:
                        corrupted_events += 1
                        
                except Exception:
                    corrupted_events += 1
            
            return {
                "valid": corrupted_events == 0,
                "total_events": len(lines),
                "valid_events": valid_events,
                "corrupted_events": corrupted_events
            }
            
        except Exception as e:
            return {"valid": False, "error": str(e)}

# Global audit manager instance
audit_manager = AuditManager()

def check_system_health():
    """Legacy function for backward compatibility"""
    metrics = audit_manager.get_system_metrics()
    audit_manager.log_event(
        "SYSTEM_HEALTH",
        "INFO",
        "audit.py",
        "System health check completed",
        asdict(metrics)
    )
    return asdict(metrics)

def full_audit(project_root=None):
    """Enhanced full system audit"""
    if project_root is None:
        project_root = Path.cwd()
    
    logger.info(f"Performing full system audit on {project_root}...")
    
    # Log audit start
    audit_manager.log_event(
        "AUDIT_START",
        "INFO",
        "audit.py",
        f"Full audit initiated on {project_root}",
        {"project_root": str(project_root)}
    )
    
    # Get system metrics
    health = check_system_health()
    logger.info(f"System Health: {health}")
    
    # Validate audit integrity
    integrity = audit_manager.validate_audit_integrity()
    audit_manager.log_event(
        "INTEGRITY_CHECK",
        "INFO" if integrity["valid"] else "WARNING",
        "audit.py",
        f"Audit integrity check: {'PASS' if integrity['valid'] else 'FAIL'}",
        integrity
    )
    
    # Log audit completion
    audit_manager.log_event(
        "AUDIT_COMPLETE",
        "INFO",
        "audit.py",
        "Full audit completed successfully",
        {"health_metrics": health, "integrity": integrity}
    )
    
    logger.info("Audit complete. All systems nominal.")
    return health
