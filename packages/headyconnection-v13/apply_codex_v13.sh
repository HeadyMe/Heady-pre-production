#!/bin/bash
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
# ║  FILE: packages/headyconnection-v13/apply_codex_v13.sh            ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# Codex v13 Automation Script
set -e

echo ">>> 🦁 Initiating Heady Golden Master Protocol..."

# --- 1. Environment Audit ---
echo "[1/4] Auditing Environment..."
if ! command -v python3 &> /dev/null; then echo "Error: python3 missing"; exit 1; fi

# --- 2. Run Builder ---
echo "[2/4] Executing Codex Builder v13..."
python3 codex_builder_v13.py

# --- 3. Git Operations ---
echo "[3/4] Staging Artifacts..."
if [ ! -d ".git" ]; then
    git init
    echo "      Initialized new git repository."
fi

# Configure .gitattributes
echo "*.wav filter=lfs diff=lfs merge=lfs -text" > .gitattributes

git add REGISTRY.json governance.lock mcp-gateway-config.json CONTEXT.md manifest.json
git add src prompts .gitattributes

if git diff --staged --quiet; then
    echo "      No changes detected."
else
    git config user.email "codex@headysystems.com"
    git config user.name "Codex Builder"
    git commit -m "Codex v13: Deterministic baseline generation"
    echo "      Committed v13 baseline."
fi

echo ">>> Codex v13 Sequence Complete."
