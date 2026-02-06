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
# ║  FILE: HeadyAcademy/Tools/Auto_Doc.py                             ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Auto_Doc.py - ATLAS Tool
Generates documentation for files or directories.
"""
import sys
import os
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path(__file__).parent.parent / "Content_Forge" / "Docs"

def extract_docstrings(file_path):
    """Extract docstrings and function signatures from Python files."""
    docs = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        lines = content.split('\n')
        in_docstring = False
        current_doc = []
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            
            if stripped.startswith('def ') or stripped.startswith('class '):
                docs.append(f"### {stripped.split('(')[0].replace('def ', '').replace('class ', '')}")
            
            if '"""' in stripped or "'''" in stripped:
                if in_docstring:
                    current_doc.append(stripped.replace('"""', '').replace("'''", ''))
                    docs.append(' '.join(current_doc))
                    current_doc = []
                    in_docstring = False
                else:
                    in_docstring = True
                    current_doc.append(stripped.replace('"""', '').replace("'''", ''))
            elif in_docstring:
                current_doc.append(stripped)
    except Exception as e:
        docs.append(f"Error reading file: {e}")
    
    return docs

def generate_doc(target):
    """Generate documentation for a target file or directory."""
    target_path = Path(target)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = OUTPUT_DIR / f"doc_{target_path.stem}_{timestamp}.md"
    
    content = [f"# Documentation: {target_path.name}", f"Generated: {datetime.now().isoformat()}", ""]
    
    if target_path.is_file():
        content.append(f"## {target_path.name}")
        if target_path.suffix == '.py':
            docs = extract_docstrings(target_path)
            content.extend(docs)
        else:
            content.append(f"File type: {target_path.suffix}")
            content.append(f"Size: {target_path.stat().st_size} bytes")
    elif target_path.is_dir():
        content.append("## Directory Contents")
        for item in sorted(target_path.rglob('*')):
            if item.is_file() and not any(p.startswith('.') for p in item.parts):
                rel = item.relative_to(target_path)
                content.append(f"- `{rel}`")
    else:
        content.append(f"Target not found: {target}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(content))
    
    print(f"Documentation generated: {output_file}")
    return str(output_file)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    generate_doc(target)
