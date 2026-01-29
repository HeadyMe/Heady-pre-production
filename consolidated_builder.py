#!/usr/bin/env python3
"""
Consolidated Builder - Builds multiple projects from a projects configuration file.

This script manages building multiple related projects with dependency tracking
and parallel execution support.
"""

import argparse
import json
import logging
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, Any, List, Optional
import subprocess

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_projects_config(config_path: str) -> Dict[str, Any]:
    """
    Load projects configuration from JSON file.
    
    Args:
        config_path: Path to projects.json file
        
    Returns:
        Dictionary containing projects configuration
        
    Raises:
        FileNotFoundError: If config file doesn't exist
        json.JSONDecodeError: If config file is invalid JSON
    """
    config_file = Path(config_path)
    
    if not config_file.exists():
        logger.error(f"Projects configuration not found: {config_path}")
        raise FileNotFoundError(f"Projects config not found: {config_path}")
    
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        logger.info(f"Loaded projects configuration from {config_path}")
        return config
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in projects config: {e}")
        raise


def validate_project(project: Dict[str, Any], project_name: str) -> bool:
    """
    Validate that a project has required fields.
    
    Args:
        project: Project configuration dictionary
        project_name: Name of the project
        
    Returns:
        True if valid, False otherwise
    """
    required_fields = ["path", "build_command"]
    
    for field in required_fields:
        if field not in project:
            logger.error(f"Project '{project_name}' missing required field: {field}")
            return False
    
    project_path = Path(project["path"])
    if not project_path.exists():
        logger.error(f"Project path does not exist: {project_path}")
        return False
    
    return True


def build_single_project(
    project_name: str,
    project_config: Dict[str, Any],
    version: Optional[str] = None
) -> bool:
    """
    Build a single project.
    
    Args:
        project_name: Name of the project
        project_config: Project configuration dictionary
        version: Optional version string
        
    Returns:
        True if build succeeds, False otherwise
    """
    logger.info(f"Building project: {project_name}")
    
    if not validate_project(project_config, project_name):
        return False
    
    project_path = Path(project_config["path"])
    build_command = project_config["build_command"]
    
    # Prepare environment
    env = dict(project_config.get("env", {}))
    if version:
        env["HEADY_VERSION"] = version
    
    # Execute build command
    if isinstance(build_command, str):
        build_command = build_command.split()
    
    try:
        logger.info(f"Running: {' '.join(build_command)} in {project_path}")
        
        result = subprocess.run(
            build_command,
            cwd=str(project_path),
            env={**subprocess.os.environ, **env},
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info(f"✓ Successfully built {project_name}")
            return True
        else:
            logger.error(f"✗ Failed to build {project_name}")
            logger.error(f"STDOUT: {result.stdout}")
            logger.error(f"STDERR: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"Exception building {project_name}: {e}")
        return False


def build_projects(
    config: Dict[str, Any],
    parallel: bool = False,
    max_workers: int = 4,
    version: Optional[str] = None,
    project_filter: Optional[List[str]] = None
) -> Dict[str, bool]:
    """
    Build multiple projects.
    
    Args:
        config: Projects configuration dictionary
        parallel: Whether to build projects in parallel
        max_workers: Maximum number of parallel workers
        version: Optional version string
        project_filter: Optional list of project names to build (builds all if None)
        
    Returns:
        Dictionary mapping project names to build success status
    """
    projects = config.get("projects", {})
    
    if not projects:
        logger.warning("No projects found in configuration")
        return {}
    
    # Filter projects if specified
    if project_filter:
        projects = {k: v for k, v in projects.items() if k in project_filter}
        logger.info(f"Building filtered projects: {', '.join(projects.keys())}")
    
    results = {}
    
    if parallel:
        logger.info(f"Building {len(projects)} projects in parallel (max {max_workers} workers)")
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(build_single_project, name, proj, version): name
                for name, proj in projects.items()
            }
            
            for future in as_completed(futures):
                project_name = futures[future]
                try:
                    results[project_name] = future.result()
                except Exception as e:
                    logger.error(f"Exception in {project_name}: {e}")
                    results[project_name] = False
    else:
        logger.info(f"Building {len(projects)} projects sequentially")
        
        for project_name, project_config in projects.items():
            results[project_name] = build_single_project(project_name, project_config, version)
    
    return results


def main() -> int:
    """
    Main entry point for the consolidated builder.
    
    Returns:
        Exit code (0 if all builds succeed, 1 if any fail)
    """
    parser = argparse.ArgumentParser(
        description="Build multiple Heady projects from configuration"
    )
    parser.add_argument(
        "--config",
        default="projects.json",
        help="Path to projects configuration file"
    )
    parser.add_argument(
        "--parallel",
        action="store_true",
        help="Build projects in parallel"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Maximum number of parallel workers"
    )
    parser.add_argument(
        "--version",
        help="Version string to use for builds"
    )
    parser.add_argument(
        "--projects",
        nargs="+",
        help="Specific projects to build (builds all if not specified)"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        config = load_projects_config(args.config)
        results = build_projects(
            config,
            args.parallel,
            args.workers,
            args.version,
            args.projects
        )
        
        # Print summary
        total = len(results)
        succeeded = sum(1 for success in results.values() if success)
        failed = total - succeeded
        
        logger.info("=" * 50)
        logger.info(f"Build Summary: {succeeded}/{total} succeeded, {failed} failed")
        logger.info("=" * 50)
        
        for project_name, success in results.items():
            status = "✓" if success else "✗"
            logger.info(f"{status} {project_name}")
        
        return 0 if failed == 0 else 1
        
    except Exception as e:
        logger.error(f"Consolidated build failed: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
