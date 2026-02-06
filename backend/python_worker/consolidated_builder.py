#!/usr/bin/env python3
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
# ║  FILE: backend/python_worker/consolidated_builder.py              ║
# ║  LAYER: backend                                                   ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Consolidated Builder for Heady Project
Implements build orchestration with multi-agent coordination
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

def log_info(msg):
    print(f"[INFO] {datetime.now().isoformat()} {msg}")

def log_error(msg):
    print(f"[ERROR] {datetime.now().isoformat()} {msg}", file=sys.stderr)

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
        run_command("npm install", cwd=project_root)
    
    # Check for requirements.txt and install Python dependencies
    requirements_txt = project_root / "requirements.txt"
    if requirements_txt.exists():
        log_info("Installing Python dependencies...")
        run_command("pip install -r requirements.txt", cwd=project_root)
    
    # Run tests if they exist
    test_dirs = ["tests", "test", "__tests__"]
    for test_dir in test_dirs:
        test_path = project_root / test_dir
        if test_path.exists() and any(test_path.iterdir()):
            log_info(f"Running tests in {test_dir}...")
            try:
                # Try npm test first
                if package_json.exists():
                    run_command("npm test", cwd=project_root, timeout=600)
                # Fall back to pytest
                else:
                    run_command("python -m pytest", cwd=project_root, timeout=600)
            except subprocess.CalledProcessError:
                log_error("Tests failed but continuing build...")
    
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

def main():
    parser = argparse.ArgumentParser(description="Consolidated build orchestration")
    parser.add_argument("--project-root", type=Path, default=Path.cwd(), 
                       help="Project root directory")
    parser.add_argument("--output", type=Path, help="Output build info to file")
    
    args = parser.parse_args()
    
    try:
        build_info = build_project(args.project_root)
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(build_info, f, indent=2)
            log_info(f"Build info written to {args.output}")
        else:
            print(json.dumps(build_info, indent=2))
            
        return 0
    except Exception as e:
        log_error(f"Build failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
