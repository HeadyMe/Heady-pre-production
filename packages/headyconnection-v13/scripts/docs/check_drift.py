#!/usr/bin/env python3
# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: packages/headyconnection-v13/scripts/docs/check_drift.py
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

import argparse
import subprocess
import sys

WATCH_PATHS = ["ops/", "ai/", "docs/", "web/modules/custom/"]

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    args = parser.parse_args()

    try:
        diff = subprocess.check_output(["git", "diff", "--name-only", f"{args.base}..{args.head}"], text=True)
    except subprocess.CalledProcessError as exc:
        print("Unable to compute git diff", exc)
        return 1

    changed = [line.strip() for line in diff.splitlines() if line.strip()]
    watched_changes = [path for path in changed if any(path.startswith(prefix) for prefix in WATCH_PATHS)]
    if watched_changes and "docs/" not in " ".join(changed):
        print("Docs drift detected: operational changes without docs updates.")
        return 1

    print("Docs drift check passed")
    return 0

if __name__ == "__main__":
    sys.exit(main())
