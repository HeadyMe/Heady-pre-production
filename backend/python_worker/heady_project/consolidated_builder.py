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
# ║  FILE: backend/python_worker/heady_project/consolidated_builder.py║
# ║  LAYER: backend                                                   ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import argparse
from .utils import get_logger, get_version
from .archive import HeadyArchive

logger = get_logger(__name__)

def run_consolidated_build(version: str):
    """
    Runs the consolidated builder logic.
    """
    logger.info(f"Running consolidated builder [Version: {version}]")

    # Simulate a build process that might involve archiving
    build_data = {"component": "core", "status": "built"}
    success = HeadyArchive.preserve(build_data, "build_archive_location")

    if success:
        logger.info("Consolidated build completed successfully.")
    else:
        logger.error("Consolidated build failed during archiving.")

def main():
    parser = argparse.ArgumentParser(description="Heady Consolidated Builder")
    parser.add_argument("--version", help="Override version")
    args = parser.parse_args()

    current_version = get_version(args.version)
    run_consolidated_build(current_version)

if __name__ == "__main__":
    main()
