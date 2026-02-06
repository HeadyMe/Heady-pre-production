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
# ║  FILE: HeadyAcademy/HeadyConductor_fix.py                         ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# Quick fix script to remove Unicode characters from HeadyConductor.py
import sys
import os

def fix_unicode_in_file(filepath):
    """Remove problematic Unicode characters from Python files."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace infinity symbol with text
    content = content.replace('∞', '')
    content = content.replace('✓', '*')
    content = content.replace('✅', '[OK]')
    content = content.replace('⚠', '[WARN]')
    content = content.replace('🎯', '[TARGET]')
    content = content.replace('📊', '[STATS]')
    content = content.replace('🔄', '[EXEC]')
    content = content.replace('🎭', '[NODE]')
    content = content.replace('🛠️', '[TOOL]')
    content = content.replace('🌐', '[SERVICE]')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed Unicode in {filepath}")

if __name__ == "__main__":
    files_to_fix = [
        "HeadyConductor.py",
        "HeadyRegistry.py",
        "HeadyLens.py",
        "HeadyMemory.py",
        "HeadyBrain.py"
    ]
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for filename in files_to_fix:
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            fix_unicode_in_file(filepath)
        else:
            print(f"File not found: {filepath}")
