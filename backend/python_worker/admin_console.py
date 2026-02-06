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
# ║  FILE: backend/python_worker/admin_console.py                     ║
# ║  LAYER: backend                                                   ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Admin Console for Heady Project
Implements audit and system health checks
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from datetime import datetime
import psutil
import platform

def log_info(msg):
    print(f"[INFO] {datetime.now().isoformat()} {msg}")

def log_error(msg):
    print(f"[ERROR] {datetime.now().isoformat()} {msg}", file=sys.stderr)

def run_command(cmd, cwd=None, timeout=120):
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

def check_system_health():
    """Check system health and resources"""
    health_info = {
        "timestamp": datetime.now().isoformat(),
        "platform": platform.platform(),
        "python_version": platform.python_version(),
        "cpu_count": psutil.cpu_count(),
        "memory_total": psutil.virtual_memory().total,
        "memory_available": psutil.virtual_memory().available,
        "disk_usage": {
            str(Path.cwd()): psutil.disk_usage(Path.cwd()).percent
        }
    }
    return health_info

def check_project_structure(project_root):
    """Audit project structure and files"""
    structure_info = {
        "project_root": str(project_root),
        "has_package_json": (project_root / "package.json").exists(),
        "has_requirements_txt": (project_root / "requirements.txt").exists(),
        "has_readme": (project_root / "README.md").exists(),
        "has_git": (project_root / ".git").exists(),
        "has_src_dir": (project_root / "src").exists(),
        "has_public_dir": (project_root / "public").exists(),
        "node_modules_size": 0,
        "python_venv": False
    }
    
    # Check node_modules size
    node_modules = project_root / "node_modules"
    if node_modules.exists():
        structure_info["node_modules_size"] = sum(
            f.stat().st_size for f in node_modules.rglob("*") if f.is_file()
        )
    
    # Check for Python virtual environment
    venv_paths = [".venv", "venv", "env"]
    for venv_path in venv_paths:
        if (project_root / venv_path).exists():
            structure_info["python_venv"] = True
            break
    
    return structure_info

def check_dependencies(project_root):
    """Check installed dependencies"""
    deps_info = {
        "node_packages": [],
        "python_packages": []
    }
    
    # Check Node packages
    package_json = project_root / "package.json"
    if package_json.exists():
        try:
            stdout, _ = run_command("npm list --depth=0 --json", cwd=project_root)
            npm_data = json.loads(stdout)
            deps_info["node_packages"] = list(npm_data.get("dependencies", {}).keys())
        except Exception as e:
            log_error(f"Failed to get Node packages: {e}")
    
    # Check Python packages
    requirements_txt = project_root / "requirements.txt"
    if requirements_txt.exists():
        try:
            stdout, _ = run_command("pip list --format=json")
            pip_data = json.loads(stdout)
            installed = {pkg["name"].lower(): pkg["version"] for pkg in pip_data}
            
            with open(requirements_txt) as f:
                required = [line.strip().split("==")[0].lower() 
                           for line in f if line.strip() and not line.startswith("#")]
            
            deps_info["python_packages"] = [
                pkg for pkg in required if pkg in installed
            ]
        except Exception as e:
            log_error(f"Failed to get Python packages: {e}")
    
    return deps_info

def check_security(project_root):
    """Security audit checks"""
    security_info = {
        "has_env_file": (project_root / ".env").exists(),
        "has_env_example": (project_root / ".env.example").exists(),
        "secrets_in_config": [],
        "file_permissions": {}
    }
    
    # Check for hardcoded secrets in config files
    config_files = ["mcp_config.json", "render.yaml", "package.json"]
    for config_file in config_files:
        config_path = project_root / config_file
        if config_path.exists():
            try:
                with open(config_path) as f:
                    content = f.read()
                    if "password" in content.lower() or "token" in content.lower():
                        security_info["secrets_in_config"].append(config_file)
            except Exception as e:
                log_error(f"Failed to check {config_file}: {e}")
    
    return security_info

def audit_project(project_root):
    """Main audit orchestration"""
    log_info(f"Starting audit for project: {project_root}")
    
    audit_info = {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "project_root": str(project_root),
        "system_health": check_system_health(),
        "project_structure": check_project_structure(project_root),
        "dependencies": check_dependencies(project_root),
        "security": check_security(project_root)
    }
    
    log_info("Audit completed successfully")
    return audit_info

def main():
    parser = argparse.ArgumentParser(description="Admin console audit")
    parser.add_argument("--project-root", type=Path, default=Path.cwd(), 
                       help="Project root directory")
    parser.add_argument("--output", type=Path, help="Output audit info to file")
    parser.add_argument("--check", choices=["health", "structure", "deps", "security"], 
                       help="Run specific check only")
    
    args = parser.parse_args()
    
    try:
        if args.check == "health":
            result = check_system_health()
        elif args.check == "structure":
            result = check_project_structure(args.project_root)
        elif args.check == "deps":
            result = check_dependencies(args.project_root)
        elif args.check == "security":
            result = check_security(args.project_root)
        else:
            result = audit_project(args.project_root)
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2)
            log_info(f"Audit info written to {args.output}")
        else:
            print(json.dumps(result, indent=2))
            
        return 0
    except Exception as e:
        log_error(f"Audit failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
