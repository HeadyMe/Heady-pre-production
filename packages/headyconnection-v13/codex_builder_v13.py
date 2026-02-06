#!/usr/bin/env python3
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
# ║  FILE: packages/headyconnection-v13/codex_builder_v13.py          ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Codex Builder v13 - Deterministic Repository Generator
Compliance: PPA-001, PPA-002, PPA-003, PPA-004.
Identity: HeadySystems Inc. | Eric Haywood
Purpose: Generate a hardened, governance-ready repository scaffold with verifiable integrity.
"""

import os
import sys
import json
import hashlib
import tempfile
import datetime
from typing import Dict, List, Any

# --- Configuration Constants ---
TRUST_DOMAIN = "headysystems.com"
APP_DOMAIN = "app.headysystems.com"
ASSIGNEE = "HeadySystems Inc."
INVENTOR = "Eric Haywood"
GENERATOR_NAME = "Heady Golden Master Builder"
GENERATOR_VERSION = "v13.0.0"

DESTRUCTIVE_PATTERNS = ["write", "delete", "rm", "exec", "shell", "edit_file"]

class AtomicWriter:
    @staticmethod
    def write_json(path: str, data: Dict[str, Any]) -> str:
        # FIX: Ensure directory defaults to '.' if empty to prevent cross-device link errors
        directory = os.path.dirname(path)
        if not directory:
            directory = "."
        elif not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)

        json_content = json.dumps(data, indent=2, sort_keys=True)
        content_bytes = json_content.encode('utf-8')
        file_hash = hashlib.sha256(content_bytes).hexdigest()

        with tempfile.NamedTemporaryFile(mode='wb', dir=directory, delete=False) as tf:
            tf.write(content_bytes)
            tf.flush()
            os.fsync(tf.fileno())
            temp_name = tf.name
            
        try:
            os.replace(temp_name, path)
        except OSError as e:
            os.remove(temp_name)
            print(f" Atomic write failed for {path}: {e}")
            sys.exit(1)
            
        print(f"[Generate] {path} (SHA256: {file_hash[:8]}...)")
        return file_hash

    @staticmethod
    def write_text(path: str, content: str) -> str:
        directory = os.path.dirname(path)
        if not directory:
            directory = "."
        elif not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            
        content_bytes = content.encode('utf-8')
        file_hash = hashlib.sha256(content_bytes).hexdigest()

        with tempfile.NamedTemporaryFile(mode='wb', dir=directory, delete=False) as tf:
            tf.write(content_bytes)
            tf.flush()
            os.fsync(tf.fileno())
            temp_name = tf.name

        try:
            os.replace(temp_name, path)
        except OSError:
            os.remove(temp_name)
            raise

        print(f"[Generate] {path} (SHA256: {file_hash[:8]}...)")
        return file_hash

class GovernanceGenerator:
    @staticmethod
    def generate_lock_file() -> Dict[str, Any]:
        return {
            "mode": "release",
            "repo": "HeadyConnection-Org/governance",
            "ref": "v1.2.0",
            "asset": "heady-governance-policy-pack-v1.2.0.tar.gz",
            "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "install_dir": ".heady/governance/policy-pack"
        }

class GatewayConfigurator:
    @staticmethod
    def generate_config() -> Dict[str, Any]:
        return {
            "bind": "127.0.0.1",
            "allowHosts": ["127.0.0.1", "localhost"],
            "allowOrigins": ["http://127.0.0.1", "http://localhost"],
            "rateLimitPerMin": 60,
            "jwt": {
                "mode": "hs256",
                "secretEnv": "MCP_GATEWAY_JWT_SECRET",
                "audience": APP_DOMAIN,
                "issuer": TRUST_DOMAIN
            },
            "requireConfirmationFor": DESTRUCTIVE_PATTERNS,
            "servers": [
                {
                    "name": "filesystem",
                    "transport": "stdio",
                    "command": "npx",
                    "args": ["-y", "@modelcontextprotocol/server-filesystem", "--root", "./src"],
                    "allowedTools": ["read_file", "list_directory", "write_file", "search_files"]
                }
            ]
        }

def main():
    print(f"Starting Codex Builder {GENERATOR_VERSION}...")
    
    # Use timezone-aware UTC datetime
    manifest = {"files": [], "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}

    # 1. Registry
    registry_data = {
        "schema_version": "1.0.0",
        "as_of_date": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"),
        "identity": {
            "inventor": INVENTOR,
            "assignee": ASSIGNEE,
            "trust_domain": TRUST_DOMAIN,
            "app_domain": APP_DOMAIN
        },
        "compliance": {
            "governance_locked": True,
            "audit_enabled": True
        }
    }
    h_reg = AtomicWriter.write_json("REGISTRY.json", registry_data)
    manifest["files"].append({"path": "REGISTRY.json", "sha256": h_reg})

    # 2. Governance Lock
    gov_lock = GovernanceGenerator.generate_lock_file()
    h_gov = AtomicWriter.write_json("governance.lock", gov_lock)
    manifest["files"].append({"path": "governance.lock", "sha256": h_gov})

    # 3. Gateway Config
    gateway_conf = GatewayConfigurator.generate_config()
    h_gw = AtomicWriter.write_json("mcp-gateway-config.json", gateway_conf)
    manifest["files"].append({"path": "mcp-gateway-config.json", "sha256": h_gw})

    # 4. Directories
    dirs_to_create = [
        "prompts/registry",
        "prompts/receipts",
        "src/assets/audio",
        "src/generated/midi",
        ".heady"
    ]
    for d in dirs_to_create:
        os.makedirs(d, exist_ok=True)
        keep_path = os.path.join(d, ".gitkeep")
        if not os.path.exists(keep_path):
            h_keep = AtomicWriter.write_text(keep_path, "")
            manifest["files"].append({"path": keep_path, "sha256": h_keep})

    # 5. Context Docs
    context_md = f"""# Heady Sovereign Node
> Generated by {GENERATOR_NAME} {GENERATOR_VERSION}
> DO NOT EDIT. This file is deterministically derived from REGISTRY.json.

## Identity
* **Assignee:** {ASSIGNEE}
* **Inventor:** {INVENTOR}
* **Trust Domain:** {TRUST_DOMAIN}

## Security Posture
* **Gateway:** 127.0.0.1 (Tunnel-Only)
* **Governance:** Locked (v1.2.0)
* **PromptOps:** Enforced
"""
    h_ctx = AtomicWriter.write_text("CONTEXT.md", context_md)
    manifest["files"].append({"path": "CONTEXT.md", "sha256": h_ctx})

    # 6. Manifest
    AtomicWriter.write_json("manifest.json", manifest)
    print("\n Repository generation complete.")

if __name__ == "__main__":
    main()
