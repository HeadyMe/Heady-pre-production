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
# ║  FILE: HeadyAcademy/Tools/Tool_Learner.py                         ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Tool_Learner.py - SOPHIA Tool
Learns about tools and generates usage documentation.
"""
import sys
import os
import subprocess
import shutil
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path(__file__).parent.parent / "Library" / "Tool_Docs"

KNOWN_TOOLS = {
    "python": {
        "check": ["python", "--version"],
        "help": ["python", "-h"],
        "description": "Python programming language interpreter"
    },
    "git": {
        "check": ["git", "--version"],
        "help": ["git", "--help"],
        "description": "Distributed version control system"
    },
    "node": {
        "check": ["node", "--version"],
        "help": ["node", "--help"],
        "description": "JavaScript runtime built on Chrome's V8 engine"
    },
    "npm": {
        "check": ["npm", "--version"],
        "help": ["npm", "help"],
        "description": "Node package manager"
    },
    "docker": {
        "check": ["docker", "--version"],
        "help": ["docker", "--help"],
        "description": "Container platform for building and running applications"
    },
    "pip": {
        "check": ["pip", "--version"],
        "help": ["pip", "--help"],
        "description": "Python package installer"
    }
}

def check_tool_available(tool_name):
    """Check if a tool is available on the system."""
    return shutil.which(tool_name) is not None

def get_tool_info(tool_name):
    """Get information about a tool."""
    info = {
        "name": tool_name,
        "available": False,
        "version": None,
        "path": None,
        "help_output": None
    }
    
    info["path"] = shutil.which(tool_name)
    info["available"] = info["path"] is not None
    
    if not info["available"]:
        return info
    
    tool_config = KNOWN_TOOLS.get(tool_name.lower(), {
        "check": [tool_name, "--version"],
        "help": [tool_name, "--help"],
        "description": f"Tool: {tool_name}"
    })
    
    try:
        result = subprocess.run(
            tool_config["check"],
            capture_output=True,
            text=True,
            timeout=5
        )
        info["version"] = (result.stdout or result.stderr).strip().split('\n')[0]
    except Exception:
        pass
    
    try:
        result = subprocess.run(
            tool_config["help"],
            capture_output=True,
            text=True,
            timeout=5
        )
        info["help_output"] = (result.stdout or result.stderr)[:2000]
    except Exception:
        pass
    
    info["description"] = tool_config.get("description", "")
    
    return info

def learn_tool(tool_name):
    """Learn about a tool and document it."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"[SOPHIA] Learning about: {tool_name}")
    info = get_tool_info(tool_name)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = OUTPUT_DIR / f"tool_{tool_name}_{timestamp}.md"
    
    report = [
        f"# Tool Documentation: {tool_name}",
        f"Generated: {datetime.now().isoformat()}",
        ""
    ]
    
    if info["available"]:
        report.extend([
            "## Status: ✅ Available",
            "",
            f"**Path:** `{info['path']}`",
            f"**Version:** {info['version'] or 'Unknown'}",
            "",
        ])
        
        if info.get("description"):
            report.append(f"**Description:** {info['description']}")
            report.append("")
        
        if info["help_output"]:
            report.extend([
                "## Help Output",
                "```",
                info["help_output"],
                "```"
            ])
    else:
        report.extend([
            "## Status: ❌ Not Found",
            "",
            f"The tool `{tool_name}` was not found on this system.",
            "",
            "### Installation Suggestions",
            f"- Check if `{tool_name}` is in your PATH",
            f"- Try installing via package manager",
            "- Visit the tool's official website for installation instructions"
        ])
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    
    status = "available" if info["available"] else "not found"
    print(f"[SOPHIA] Tool '{tool_name}' is {status}")
    print(f"  Documentation: {output_file}")
    return str(output_file)

if __name__ == "__main__":
    tool = sys.argv[1] if len(sys.argv) > 1 else "python"
    learn_tool(tool)
