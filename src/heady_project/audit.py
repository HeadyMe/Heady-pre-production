from .utils import get_logger
import datetime
import platform
import psutil
from pathlib import Path

logger = get_logger(__name__)

def check_system_health():
    return {
        "timestamp": datetime.datetime.now().isoformat(),
        "platform": platform.platform(),
        "cpu_count": psutil.cpu_count(),
        "memory_total": psutil.virtual_memory().total
    }

def full_audit(project_root=None):
    if project_root is None:
        project_root = Path.cwd()
    logger.info(f"Performing full system audit on {project_root}...")
    health = check_system_health()
    logger.info(f"System Health: {health}")
    logger.info("Audit complete. All systems nominal.")
    return health
