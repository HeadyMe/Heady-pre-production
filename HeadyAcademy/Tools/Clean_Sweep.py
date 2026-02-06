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
# ║  FILE: HeadyAcademy/Tools/Clean_Sweep.py                          ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Clean_Sweep.py - JANITOR Tool
Cleans temporary files, caches, and maintains directory hygiene.
"""
import sys
import os
import shutil
from pathlib import Path
from datetime import datetime

CLEANUP_PATTERNS = [
    "__pycache__",
    "*.pyc",
    "*.pyo",
    ".pytest_cache",
    ".mypy_cache",
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    "*.tmp",
    "*.bak",
    "node_modules/.cache",
]

PROTECTED_DIRS = {".git", ".env", "venv", "node_modules", "Vault"}

def get_cleanup_targets(target_path):
    """Find files and directories matching cleanup patterns."""
    targets = []
    
    for pattern in CLEANUP_PATTERNS:
        if '*' in pattern:
            for match in target_path.rglob(pattern):
                if not any(p in PROTECTED_DIRS for p in match.parts):
                    targets.append(match)
        else:
            for match in target_path.rglob(pattern):
                if match.is_dir() and not any(p in PROTECTED_DIRS for p in match.parts):
                    targets.append(match)
    
    return targets

def clean_sweep(target, dry_run=False):
    """Clean up a target directory."""
    target_path = Path(target)
    
    if not target_path.exists():
        print(f"Target not found: {target}")
        return 0
    
    targets = get_cleanup_targets(target_path)
    total_size = 0
    cleaned = 0
    
    print(f"[JANITOR] Scanning {target_path}...")
    
    for item in targets:
        try:
            if item.is_file():
                size = item.stat().st_size
                total_size += size
                if not dry_run:
                    item.unlink()
                cleaned += 1
                print(f"  {'[DRY] ' if dry_run else ''}Removed file: {item.name}")
            elif item.is_dir():
                size = sum(f.stat().st_size for f in item.rglob('*') if f.is_file())
                total_size += size
                if not dry_run:
                    shutil.rmtree(item)
                cleaned += 1
                print(f"  {'[DRY] ' if dry_run else ''}Removed dir: {item.name}")
        except Exception as e:
            print(f"  Failed to clean {item}: {e}")
    
    size_mb = total_size / (1024 * 1024)
    print(f"\n[JANITOR] Complete: {cleaned} items, {size_mb:.2f} MB {'would be ' if dry_run else ''}freed")
    return cleaned

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    dry_run = "--dry" in sys.argv
    clean_sweep(target, dry_run)
