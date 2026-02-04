#!/usr/bin/env python3
"""Iteration 3 scaffold."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "heady_iterations" / "it3"

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "iteration": 3,
        "version": "1.0.0",
        "stage_name": "stage-3",
        "description": "Iteration 3 scaffold."
    }
    (OUTPUT_DIR / "manifest.json").write_text(json.dumps(payload, indent=2) + "
", encoding="utf-8")
    print(f"Iteration 3 output written to {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
