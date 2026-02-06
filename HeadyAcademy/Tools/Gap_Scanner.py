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
# ║  FILE: HeadyAcademy/Tools/Gap_Scanner.py                          ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Gap_Scanner.py - NOVA Tool
Scans repositories for missing documentation, tests, and best practices.
"""
import sys
import os
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path(__file__).parent.parent / "Logs" / "Gap_Reports"

def scan_for_gaps(target_path):
    """Scan a directory for common gaps."""
    gaps = {
        "missing_readme": [],
        "missing_tests": [],
        "missing_docstrings": [],
        "missing_gitignore": [],
        "large_files": [],
        "no_requirements": False
    }
    
    if not (target_path / "README.md").exists() and not (target_path / "readme.md").exists():
        gaps["missing_readme"].append(target_path)
    
    if not (target_path / ".gitignore").exists():
        gaps["missing_gitignore"].append(target_path)
    
    has_python = any(target_path.rglob("*.py"))
    if has_python and not (target_path / "requirements.txt").exists() and not (target_path / "pyproject.toml").exists():
        gaps["no_requirements"] = True
    
    test_dirs = list(target_path.rglob("test*")) + list(target_path.rglob("*test*"))
    if not test_dirs and has_python:
        gaps["missing_tests"].append(target_path)
    
    for py_file in target_path.rglob("*.py"):
        if "__pycache__" in str(py_file):
            continue
        try:
            with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read(500)
            if '"""' not in content and "'''" not in content:
                gaps["missing_docstrings"].append(py_file)
        except Exception:
            pass
    
    for file in target_path.rglob("*"):
        if file.is_file():
            try:
                size = file.stat().st_size
                if size > 10 * 1024 * 1024:
                    gaps["large_files"].append((file, size))
            except Exception:
                pass
    
    return gaps

def generate_report(target, gaps):
    """Generate a gap report."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = OUTPUT_DIR / f"gap_report_{timestamp}.md"
    
    total_gaps = sum(len(v) if isinstance(v, list) else (1 if v else 0) for v in gaps.values())
    
    report = [
        f"# Gap Analysis Report",
        f"Target: {target}",
        f"Generated: {datetime.now().isoformat()}",
        f"Total Gaps: {total_gaps}",
        ""
    ]
    
    if gaps["missing_readme"]:
        report.append("## 📄 Missing README")
        report.append("- Project lacks a README.md file")
        report.append("")
    
    if gaps["missing_gitignore"]:
        report.append("## 🚫 Missing .gitignore")
        report.append("- No .gitignore file found")
        report.append("")
    
    if gaps["no_requirements"]:
        report.append("## 📦 Missing Dependencies File")
        report.append("- Python project lacks requirements.txt or pyproject.toml")
        report.append("")
    
    if gaps["missing_tests"]:
        report.append("## 🧪 Missing Tests")
        report.append("- No test directory or test files found")
        report.append("")
    
    if gaps["missing_docstrings"]:
        report.append("## 📝 Missing Docstrings")
        for f in gaps["missing_docstrings"][:10]:
            report.append(f"- `{f.name}`")
        if len(gaps["missing_docstrings"]) > 10:
            report.append(f"- ... and {len(gaps['missing_docstrings']) - 10} more")
        report.append("")
    
    if gaps["large_files"]:
        report.append("## 📦 Large Files")
        for f, size in gaps["large_files"]:
            report.append(f"- `{f.name}` ({size / 1024 / 1024:.1f} MB)")
        report.append("")
    
    if total_gaps == 0:
        report.append("## ✅ No Gaps Found!")
        report.append("Project follows best practices.")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    
    return output_file, total_gaps

def scan(target):
    """Main scan entry point."""
    target_path = Path(target).resolve()
    
    if not target_path.exists():
        print(f"[NOVA] Target not found: {target}")
        return
    
    print(f"[NOVA] Scanning {target_path}...")
    gaps = scan_for_gaps(target_path)
    output_file, total = generate_report(target_path, gaps)
    
    print(f"[NOVA] Scan complete: {total} gaps found")
    print(f"  Report: {output_file}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    scan(target)
