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
# ║  FILE: HeadyAcademy/Tools/Network/Warp_Manager.py                 ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import sys
import shutil
import subprocess

# Controls Cloudflare WARP Client
# This is "On Deck" - it checks availability and manages connection state.

def check_warp():
    if not shutil.which("warp-cli"):
        print("[BRIDGE] WARP Client not found.")
        print(">> To install: curl https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg")
        print(">> Then: sudo apt-get update && sudo apt-get install cloudflare-warp")
        return False
    return True

def manage_warp(action):
    if not check_warp(): return

    print(f"[BRIDGE] Executing WARP action: {action}")
    try:
        if action == "status":
            subprocess.run(["warp-cli", "status"])
        elif action == "connect":
            subprocess.run(["warp-cli", "connect"])
        elif action == "disconnect":
            subprocess.run(["warp-cli", "disconnect"])
        elif action == "register":
            subprocess.run(["warp-cli", "register"])
    except Exception as e:
        print(f"[BRIDGE] Error managing WARP: {e}")

if __name__ == "__main__":
    act = sys.argv[1] if len(sys.argv) > 1 else "status"
    manage_warp(act)
