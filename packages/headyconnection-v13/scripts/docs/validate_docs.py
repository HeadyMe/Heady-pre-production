#!/usr/bin/env python3
# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: packages/headyconnection-v13/scripts/docs/validate_docs.py
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

import os
import sys
from pathlib import Path

REQUIRED_FILES = [
    "docs/INDEX.md",
    "docs/ops/IMPROVEMENTS_500.md",
    "docs/ops/IP_INTEGRATION.md",
    "docs/ops/POST_GENERATION_NOTES.md",
    "docs/security/identity/SPIFFE_SPIRE.md",
    "mkdocs.yml"
]

ROOT = Path(__file__).resolve().parents[2]

def main() -> int:
    missing = [path for path in REQUIRED_FILES if not (ROOT / path).exists()]
    if missing:
        print("Missing required docs:", missing)
        return 1
    print("Docs validation passed")
    return 0

if __name__ == "__main__":
    sys.exit(main())
