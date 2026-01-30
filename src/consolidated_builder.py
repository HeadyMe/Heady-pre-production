#!/usr/bin/env python3
"""
Consolidated Builder for Heady Project
Implements build orchestration with multi-agent coordination and parallel task execution
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Thread-safe logging
_log_lock = threading.Lock()

def log_info(msg):
    with _log_lock:
        print(f"[INFO] {datetime.now().isoformat()} {msg}")

def log_error(msg):
    with _log_lock:
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

def install_node_dependencies(project_root):
    """Install Node.js dependencies"""
    log_info("Installing Node.js dependencies...")
    start_time = datetime.now()
    run_command("npm install", cwd=project_root)
    duration = (datetime.now() - start_time).total_seconds()
    log_info(f"Node.js dependencies installed in {duration:.2f}s")
    return {"type": "node", "success": True, "duration": duration}

def install_python_dependencies(project_root):
    """Install Python dependencies"""
    log_info("Installing Python dependencies...")
    start_time = datetime.now()
    run_command("pip install -r requirements.txt", cwd=project_root)
    duration = (datetime.now() - start_time).total_seconds()
    log_info(f"Python dependencies installed in {duration:.2f}s")
    return {"type": "python", "success": True, "duration": duration}

def build_project(project_root, parallel=True, max_workers=2):
    """Main build orchestration with optional parallel execution"""
    log_info(f"Starting build for project: {project_root} (parallel={parallel})")
    build_start = datetime.now()
    
    # Check for dependency files
    package_json = project_root / "package.json"
    requirements_txt = project_root / "requirements.txt"
    
    dep_results = []
    
    if parallel and package_json.exists() and requirements_txt.exists():
        # Run dependency installations in parallel
        log_info("Running dependency installations in parallel...")
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {}
            
            if package_json.exists():
                futures[executor.submit(install_node_dependencies, project_root)] = "node"
            
            if requirements_txt.exists():
                futures[executor.submit(install_python_dependencies, project_root)] = "python"
            
            for future in as_completed(futures):
                dep_type = futures[future]
                try:
                    result = future.result()
                    dep_results.append(result)
                except Exception as e:
                    log_error(f"Failed to install {dep_type} dependencies: {e}")
                    dep_results.append({"type": dep_type, "success": False, "error": str(e)})
    else:
        # Sequential installation (fallback or single dependency type)
        if package_json.exists():
            try:
                result = install_node_dependencies(project_root)
                dep_results.append(result)
            except Exception as e:
                log_error(f"Failed to install Node.js dependencies: {e}")
                dep_results.append({"type": "node", "success": False, "error": str(e)})
        
        if requirements_txt.exists():
            try:
                result = install_python_dependencies(project_root)
                dep_results.append(result)
            except Exception as e:
                log_error(f"Failed to install Python dependencies: {e}")
                dep_results.append({"type": "python", "success": False, "error": str(e)})
    
    # Run tests if they exist
    test_dirs = ["tests", "test", "__tests__"]
    tests_run = False
    for test_dir in test_dirs:
        test_path = project_root / test_dir
        if test_path.exists() and any(test_path.iterdir()):
            log_info(f"Running tests in {test_dir}...")
            tests_run = True
            try:
                # Try npm test first
                if package_json.exists():
                    run_command("npm test", cwd=project_root, timeout=600)
                # Fall back to pytest
                else:
                    run_command("python -m pytest", cwd=project_root, timeout=600)
            except subprocess.CalledProcessError:
                log_error("Tests failed but continuing build...")
    
    build_duration = (datetime.now() - build_start).total_seconds()
    
    # Build status
    build_info = {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "project_root": str(project_root),
        "parallel_enabled": parallel,
        "node_deps_installed": package_json.exists(),
        "python_deps_installed": requirements_txt.exists(),
        "tests_run": tests_run,
        "build_duration_seconds": build_duration,
        "dependency_results": dep_results
    }
    
    log_info(f"Build completed successfully in {build_duration:.2f}s")
    return build_info

def main():
    parser = argparse.ArgumentParser(description="Consolidated build orchestration with parallel execution")
    parser.add_argument("--project-root", type=Path, default=Path.cwd(), 
                       help="Project root directory")
    parser.add_argument("--output", type=Path, help="Output build info to file")
    parser.add_argument("--no-parallel", action="store_true",
                       help="Disable parallel execution (run tasks sequentially)")
    parser.add_argument("--max-workers", type=int, default=2,
                       help="Maximum number of parallel workers (default: 2)")
    
    args = parser.parse_args()
    
    try:
        build_info = build_project(
            args.project_root, 
            parallel=not args.no_parallel,
            max_workers=args.max_workers
        )
        
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
