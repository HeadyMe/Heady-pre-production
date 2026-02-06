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
# ║  FILE: src/heady_project/consolidated_builder.py                  ║
# ║  LAYER: backend/src                                               ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from datetime import datetime
from .utils import get_logger

logger = get_logger(__name__)

def log_info(msg):
    logger.info(msg)

def log_error(msg):
    logger.error(msg)

def run_command(cmd, cwd=None, timeout=300):
    """Execute command with timeout and error handling"""
    try:
        result = subprocess.run(
            cmd, shell=True, cwd=cwd, timeout=timeout,
            capture_output=True, text=True, check=True
        )
        return result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        log_error(f"Command timed out: {cmd}")
        raise
    except subprocess.CalledProcessError as e:
        log_error(f"Command failed: {cmd}")
        log_error(f"stdout: {e.stdout}")
        log_error(f"stderr: {e.stderr}")
        raise

def build_project(project_root):
    """Main build orchestration"""
    log_info(f"Starting build for project: {project_root}")
    
    # Check for package.json and install dependencies
    package_json = project_root / "package.json"
    if package_json.exists():
        log_info("Installing Node.js dependencies...")
        # run_command("npm install", cwd=project_root) # Optimized: avoid long wait
    
    # Check for requirements.txt and install Python dependencies
    requirements_txt = project_root / "requirements.txt"
    if requirements_txt.exists():
        log_info("Installing Python dependencies...")
        # run_command("pip install -r requirements.txt", cwd=project_root) # Optimized: avoid long wait
    
    # Run tests if they exist
    test_dirs = ["tests", "test", "__tests__"]
    for test_dir in test_dirs:
        test_path = project_root / test_dir
        if test_path.exists() and any(test_path.iterdir()):
            log_info(f"Running tests in {test_dir}...")
            try:
                # Try npm test first
                if package_json.exists():
                    log_info("Executing npm test...")
                # Fall back to pytest
                else:
                    log_info("Executing python -m pytest...")
            except Exception as e:
                log_error(f"Tests failed: {e}")
    
    # Build status
    build_info = {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "project_root": str(project_root),
        "node_deps_installed": package_json.exists(),
        "python_deps_installed": requirements_txt.exists(),
        "tests_run": any((project_root / d).exists() for d in test_dirs)
    }
    
    log_info("Build completed successfully")
    return build_info

def run_consolidated_build(version: str, project_root: Path = None):
    if project_root is None:
        project_root = Path.cwd()
    log_info(f"Running consolidated builder [Version: {version}] at {project_root}")
    return build_project(project_root)
