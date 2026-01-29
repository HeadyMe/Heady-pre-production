#!/usr/bin/env python3
"""
Execute Build Script - Automates the build process for Heady projects.

This script orchestrates the build pipeline including dependency installation,
compilation, testing, and packaging.
"""

import argparse
import json
import logging
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import subprocess

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_config(config_path: str) -> Dict[str, Any]:
    """
    Load build configuration from JSON file.
    
    Args:
        config_path: Path to the configuration file
        
    Returns:
        Dictionary containing build configuration
        
    Raises:
        FileNotFoundError: If config file doesn't exist
        json.JSONDecodeError: If config file is invalid JSON
    """
    config_file = Path(config_path)
    
    if not config_file.exists():
        logger.error(f"Configuration file not found: {config_path}")
        raise FileNotFoundError(f"Config file not found: {config_path}")
    
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        logger.info(f"Loaded configuration from {config_path}")
        return config
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in config file: {e}")
        raise


def run_command(
    command: List[str],
    cwd: Optional[str] = None,
    env: Optional[Dict[str, str]] = None
) -> int:
    """
    Execute a shell command and stream output.
    
    Args:
        command: List of command parts
        cwd: Optional working directory
        env: Optional environment variables
        
    Returns:
        Command exit code
    """
    logger.info(f"Running command: {' '.join(command)}")
    
    try:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        
        for line in process.stdout:
            print(line, end='')
        
        return_code = process.wait()
        
        if return_code == 0:
            logger.info(f"Command completed successfully: {' '.join(command)}")
        else:
            logger.error(f"Command failed with code {return_code}: {' '.join(command)}")
        
        return return_code
        
    except Exception as e:
        logger.error(f"Failed to execute command: {e}")
        return 1


def install_dependencies(project_path: Path, requirements_file: str = "requirements.txt") -> bool:
    """
    Install Python dependencies.
    
    Args:
        project_path: Path to project directory
        requirements_file: Name of requirements file
        
    Returns:
        True if successful, False otherwise
    """
    req_path = project_path / requirements_file
    
    if not req_path.exists():
        logger.warning(f"No {requirements_file} found, skipping dependency installation")
        return True
    
    logger.info("Installing dependencies...")
    return run_command(["pip", "install", "-r", str(req_path)]) == 0


def run_tests(project_path: Path, test_dir: str = "tests") -> bool:
    """
    Run project tests using pytest.
    
    Args:
        project_path: Path to project directory
        test_dir: Name of test directory
        
    Returns:
        True if tests pass, False otherwise
    """
    test_path = project_path / test_dir
    
    if not test_path.exists():
        logger.warning(f"No {test_dir} directory found, skipping tests")
        return True
    
    logger.info("Running tests...")
    return run_command(["pytest", str(test_path), "-v"]) == 0


def build_project(
    config: Dict[str, Any],
    skip_tests: bool = False,
    version: Optional[str] = None
) -> bool:
    """
    Execute the complete build process.
    
    Args:
        config: Build configuration dictionary
        skip_tests: Whether to skip running tests
        version: Optional version string to use
        
    Returns:
        True if build succeeds, False otherwise
    """
    project_path = Path(config.get("project_path", "."))
    
    if version:
        os.environ["HEADY_VERSION"] = version
        logger.info(f"Set build version to {version}")
    
    logger.info(f"Building project at {project_path}")
    
    # Install dependencies
    if not install_dependencies(project_path):
        logger.error("Dependency installation failed")
        return False
    
    # Run tests unless skipped
    if not skip_tests:
        if not run_tests(project_path):
            logger.error("Tests failed")
            return False
    
    # Run custom build commands if specified
    build_commands = config.get("build_commands", [])
    for cmd in build_commands:
        if isinstance(cmd, str):
            cmd = cmd.split()
        
        if run_command(cmd, cwd=str(project_path)) != 0:
            logger.error(f"Build command failed: {' '.join(cmd)}")
            return False
    
    logger.info("Build completed successfully!")
    return True


def main() -> int:
    """
    Main entry point for the build script.
    
    Returns:
        Exit code (0 for success, 1 for failure)
    """
    parser = argparse.ArgumentParser(
        description="Execute build process for Heady projects"
    )
    parser.add_argument(
        "--config",
        default="build_config.json",
        help="Path to build configuration file"
    )
    parser.add_argument(
        "--skip-tests",
        action="store_true",
        help="Skip running tests during build"
    )
    parser.add_argument(
        "--version",
        help="Version string to use for this build"
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
        config = load_config(args.config)
        success = build_project(config, args.skip_tests, args.version)
        return 0 if success else 1
        
    except Exception as e:
        logger.error(f"Build failed with error: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
