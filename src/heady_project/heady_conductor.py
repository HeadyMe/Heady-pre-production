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
# ║  FILE: src/heady_project/heady_conductor.py                       ║
# ║  LAYER: backend/src                                               ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import argparse
import sys
import uvicorn
from pathlib import Path
import os

project_root = Path(__file__).resolve().parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.heady_project.utils import get_logger, get_version
from src.heady_project.economy import mint_coin
from src.heady_project.consolidated_builder import run_consolidated_build
from src.heady_project.audit import full_audit

logger = get_logger(__name__)

def serve_api():
    logger.info("Starting Heady Conductor API server on port 8000...")
    from src.heady_project.api import app
    uvicorn.run(app, host="0.0.0.0", port=8000)

def main():
    parser = argparse.ArgumentParser(description="Heady Conductor (hc)")
    parser.add_argument("-a", "--action", choices=["builder_build", "full_audit", "serve_api", "mint", "hs", "hb"], required=True, help="Action to perform")
    parser.add_argument("--version", help="Override version")
    parser.add_argument("--amount", type=int, default=100, help="Amount to mint (if action is mint)")
    parser.add_argument("--project-root", type=Path, default=Path.cwd(), help="Target project root directory")

    args = parser.parse_args()

    current_version = get_version(args.version)
    logger.info(f"Heady Conductor Initialized [Version: {current_version}]")

    action = args.action
    if action == "hs":
        action = "serve_api"
    elif action == "hb":
        action = "builder_build"

    if action == "builder_build":
        run_consolidated_build(current_version, args.project_root)
    elif action == "full_audit":
        full_audit(args.project_root)
    elif action == "serve_api":
        serve_api()
    elif action == "mint":
        mint_coin(args.amount)
    else:
        logger.error(f"Unknown action: {action}")
        sys.exit(1)

if __name__ == "__main__":
    main()
