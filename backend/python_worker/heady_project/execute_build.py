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
# ║  FILE: backend/python_worker/heady_project/execute_build.py       ║
# ║  LAYER: backend                                                   ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import argparse
import json
import os
from typing import Dict, Any
from .utils import get_logger, get_version

logger = get_logger(__name__)

def build_manifest(projects_file: str, repo_url: str, version: str) -> Dict[str, Any]:
    """
    Processes projects.json to produce a manifest.
    """
    logger.info(f"Building manifest from {projects_file} for version {version}")

    if not os.path.exists(projects_file):
        logger.error(f"Projects file not found: {projects_file}")
        return {}

    try:
        with open(projects_file, 'r') as f:
            projects = json.load(f)

        manifest = {
            "version": version,
            "repo_url": repo_url,
            "projects": projects,
            "build_status": "success"
        }

        output_file = "heady-manifest.json"
        with open(output_file, 'w') as f:
            json.dump(manifest, f, indent=2)

        logger.info(f"Manifest created at {output_file}")
        return manifest

    except Exception as e:
        logger.error(f"Failed to build manifest: {e}")
        return {}

def main():
    parser = argparse.ArgumentParser(description="Heady Build Executor")
    parser.add_argument("--repo-url", required=True, help="Repository URL")
    parser.add_argument("--zip-file", help="Path to zip file (unused in minimal logic)")
    parser.add_argument("--build-script", help="Custom build script path")
    parser.add_argument("--projects-file", default="projects.json", help="Path to projects.json")
    parser.add_argument("--version", help="Override version")

    args = parser.parse_args()

    current_version = get_version(args.version)
    logger.info(f"Starting build execution [Version: {current_version}]")

    build_manifest(args.projects_file, args.repo_url, current_version)

if __name__ == "__main__":
    main()
