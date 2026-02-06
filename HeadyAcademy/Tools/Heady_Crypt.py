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
# ║  FILE: HeadyAcademy/Tools/Heady_Crypt.py                          ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Heady_Crypt.py - CIPHER Tool
Obfuscates and encrypts sensitive content.
"""
import sys
import os
import base64
import hashlib
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path(__file__).parent.parent / "Content_Forge" / "Encrypted"

def simple_obfuscate(content):
    """Simple reversible obfuscation using base64 and character shifting."""
    encoded = base64.b64encode(content.encode('utf-8')).decode('utf-8')
    shifted = ''.join(chr((ord(c) + 13) % 256) for c in encoded)
    return shifted

def simple_deobfuscate(content):
    """Reverse the obfuscation."""
    unshifted = ''.join(chr((ord(c) - 13) % 256) for c in content)
    decoded = base64.b64decode(unshifted.encode('utf-8')).decode('utf-8')
    return decoded

def hash_content(content):
    """Generate SHA-256 hash of content."""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def obfuscate_file(target):
    """Obfuscate a file's contents."""
    target_path = Path(target)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    if not target_path.exists():
        print(f"Target not found: {target}")
        return None
    
    try:
        with open(target_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        original_hash = hash_content(content)
        obfuscated = simple_obfuscate(content)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = OUTPUT_DIR / f"{target_path.stem}_{timestamp}.hcrypt"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"# HeadyCrypt v1.0\n")
            f.write(f"# Original: {target_path.name}\n")
            f.write(f"# Hash: {original_hash}\n")
            f.write(f"# Timestamp: {datetime.now().isoformat()}\n")
            f.write("---\n")
            f.write(obfuscated)
        
        print(f"Obfuscated: {target_path.name}")
        print(f"  Output: {output_file}")
        print(f"  Original Hash: {original_hash[:16]}...")
        return str(output_file)
    
    except Exception as e:
        print(f"Obfuscation failed: {e}")
        return None

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    if target:
        obfuscate_file(target)
    else:
        print("Usage: Heady_Crypt.py <target_file>")
