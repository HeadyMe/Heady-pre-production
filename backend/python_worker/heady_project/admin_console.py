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
# ║  FILE: backend/python_worker/heady_project/admin_console.py       ║
# ║  LAYER: backend                                                   ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import argparse
import sys
import uvicorn
from .utils import get_logger, get_version
from .economy import mint_coin
from .consolidated_builder import run_consolidated_build
from .audit import full_audit

logger = get_logger(__name__)

def serve_api():
    logger.info("Starting API server on port 8000...")
    from .api import app
    uvicorn.run(app, host="0.0.0.0", port=8000)

def main():
    parser = argparse.ArgumentParser(description="Heady Admin Console")
    parser.add_argument("--action", choices=["builder_build", "full_audit", "serve_api", "mint"], required=True, help="Action to perform")
    parser.add_argument("--version", help="Override version")
    parser.add_argument("--amount", type=int, default=100, help="Amount to mint (if action is mint)")

    args = parser.parse_args()

    current_version = get_version(args.version)
    logger.info(f"Admin Console Initialized [Version: {current_version}]")

    if args.action == "builder_build":
        run_consolidated_build(current_version)
    elif args.action == "full_audit":
        full_audit()
    elif args.action == "serve_api":
        serve_api()
    elif args.action == "mint":
        mint_coin(args.amount)
    else:
        logger.error("Unknown action")
        sys.exit(1)

if __name__ == "__main__":
    main()
