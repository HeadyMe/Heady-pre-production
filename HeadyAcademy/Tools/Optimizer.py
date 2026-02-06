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
# ║  FILE: HeadyAcademy/Tools/Optimizer.py                            ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Optimizer.py - JULES Tool
Analyzes and suggests optimizations for code.
"""
import sys
import os
import re
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path(__file__).parent.parent / "Logs" / "Optimization_Reports"

OPTIMIZATION_RULES = [
    {
        "name": "Unused imports",
        "pattern": r"^import\s+(\w+)",
        "check": lambda match, content: match.group(1) not in content.replace(match.group(0), ""),
        "suggestion": "Remove unused import"
    },
    {
        "name": "Long lines",
        "pattern": r".{120,}",
        "check": lambda match, content: True,
        "suggestion": "Line exceeds 120 characters, consider breaking"
    },
    {
        "name": "TODO comments",
        "pattern": r"#\s*TODO:?\s*(.+)",
        "check": lambda match, content: True,
        "suggestion": "Unresolved TODO"
    },
    {
        "name": "Magic numbers",
        "pattern": r"(?<!['\"\w])(?:0x[0-9a-fA-F]+|\d{4,})(?!['\"\w])",
        "check": lambda match, content: True,
        "suggestion": "Consider using named constant"
    },
    {
        "name": "Bare except",
        "pattern": r"except\s*:",
        "check": lambda match, content: True,
        "suggestion": "Avoid bare except, specify exception type"
    }
]

def analyze_file(file_path):
    """Analyze a file for optimization opportunities."""
    issues = []
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            for rule in OPTIMIZATION_RULES:
                matches = re.finditer(rule["pattern"], line)
                for match in matches:
                    if rule["check"](match, content):
                        issues.append({
                            "line": i,
                            "rule": rule["name"],
                            "suggestion": rule["suggestion"],
                            "snippet": line.strip()[:60]
                        })
    except Exception as e:
        issues.append({"line": 0, "rule": "Error", "suggestion": str(e), "snippet": ""})
    
    return issues

def optimize(target):
    """Analyze target and generate optimization report."""
    target_path = Path(target)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    all_issues = []
    
    if target_path.is_file():
        all_issues.extend([(target_path, issue) for issue in analyze_file(target_path)])
    elif target_path.is_dir():
        for py_file in target_path.rglob("*.py"):
            issues = analyze_file(py_file)
            all_issues.extend([(py_file, issue) for issue in issues])
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = OUTPUT_DIR / f"opt_report_{timestamp}.md"
    
    report = [f"# Optimization Report", f"Target: {target_path}", f"Generated: {datetime.now().isoformat()}", ""]
    
    if all_issues:
        report.append(f"## Issues Found: {len(all_issues)}")
        current_file = None
        for file_path, issue in all_issues:
            if file_path != current_file:
                current_file = file_path
                report.append(f"\n### {file_path.name}")
            report.append(f"- Line {issue['line']}: **{issue['rule']}** - {issue['suggestion']}")
            if issue['snippet']:
                report.append(f"  ```{issue['snippet']}```")
    else:
        report.append("## No issues found!")
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    
    print(f"[JULES] Analysis complete: {len(all_issues)} suggestions")
    print(f"  Report: {report_file}")
    return str(report_file)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    optimize(target)
