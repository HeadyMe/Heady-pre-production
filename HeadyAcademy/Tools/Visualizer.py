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
# ║  FILE: HeadyAcademy/Tools/Visualizer.py                           ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Visualizer.py - OCULUS Tool
Generates visual representations of code structure and dependencies.
"""
import sys
import os
from pathlib import Path
from datetime import datetime
from collections import defaultdict

OUTPUT_DIR = Path(__file__).parent.parent / "Content_Forge" / "Visualizations"

def analyze_imports(file_path):
    """Extract import statements from Python file."""
    imports = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                line = line.strip()
                if line.startswith('import '):
                    module = line.replace('import ', '').split(' as ')[0].split(',')[0].strip()
                    imports.append(module)
                elif line.startswith('from '):
                    parts = line.split(' import ')
                    if len(parts) >= 1:
                        module = parts[0].replace('from ', '').strip()
                        imports.append(module)
    except Exception:
        pass
    return imports

def build_dependency_graph(target_path):
    """Build a dependency graph for the project."""
    graph = defaultdict(list)
    
    for py_file in target_path.rglob("*.py"):
        if '.git' in str(py_file) or '__pycache__' in str(py_file):
            continue
        
        rel_path = py_file.relative_to(target_path) if target_path in py_file.parents else py_file.name
        imports = analyze_imports(py_file)
        graph[str(rel_path)] = imports
    
    return graph

def generate_ascii_tree(target_path, prefix="", is_last=True):
    """Generate ASCII tree representation of directory."""
    lines = []
    connector = "└── " if is_last else "├── "
    
    if target_path.is_file():
        lines.append(f"{prefix}{connector}{target_path.name}")
    else:
        lines.append(f"{prefix}{connector}{target_path.name}/")
        
        items = sorted([p for p in target_path.iterdir() if not p.name.startswith('.')])
        dirs = [p for p in items if p.is_dir() and p.name not in {'__pycache__', 'node_modules', '.git'}]
        files = [p for p in items if p.is_file()]
        
        all_items = dirs + files
        for i, item in enumerate(all_items):
            is_last_item = i == len(all_items) - 1
            new_prefix = prefix + ("    " if is_last else "│   ")
            lines.extend(generate_ascii_tree(item, new_prefix, is_last_item))
    
    return lines

def generate_mermaid_graph(graph):
    """Generate Mermaid diagram syntax for dependencies."""
    lines = ["```mermaid", "graph TD"]
    
    for file, imports in graph.items():
        file_id = file.replace('/', '_').replace('.', '_').replace('\\', '_')
        for imp in imports[:5]:
            imp_id = imp.replace('.', '_')
            lines.append(f"    {file_id}[{file}] --> {imp_id}[{imp}]")
    
    lines.append("```")
    return lines

def visualize(target):
    """Generate visualization for target."""
    target_path = Path(target)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    if not target_path.exists():
        target_path = Path(".")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = OUTPUT_DIR / f"viz_{target_path.name}_{timestamp}.md"
    
    report = [
        f"# Project Visualization: {target_path.name}",
        f"Generated: {datetime.now().isoformat()}",
        "",
        "## Directory Structure",
        "```"
    ]
    
    tree = generate_ascii_tree(target_path)
    report.extend(tree[:100])
    if len(tree) > 100:
        report.append(f"... and {len(tree) - 100} more items")
    report.append("```")
    
    if target_path.is_dir():
        graph = build_dependency_graph(target_path)
        if graph:
            report.append("")
            report.append("## Dependency Graph")
            report.extend(generate_mermaid_graph(graph))
            
            report.append("")
            report.append("## Module Summary")
            for file, imports in list(graph.items())[:20]:
                report.append(f"- **{file}**: {len(imports)} imports")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    
    print(f"[OCULUS] Visualization complete")
    print(f"  Output: {output_file}")
    return str(output_file)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    visualize(target)
