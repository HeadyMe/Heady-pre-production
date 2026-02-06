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
# ║  FILE: HeadyAcademy/Tools/Github_Scanner.py                       ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Github_Scanner.py - SCOUT Tool
Searches and analyzes GitHub repositories.
Requires GITHUB_TOKEN in environment for API access.
"""
import sys
import os
import json
from pathlib import Path
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

OUTPUT_DIR = Path(__file__).parent.parent / "Research"
API_BASE = "https://api.github.com"

def search_repos(query, token=None):
    """Search GitHub repositories."""
    url = f"{API_BASE}/search/repositories?q={query}&sort=stars&order=desc&per_page=10"
    
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"token {token}"
    
    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            return data.get("items", [])
    except HTTPError as e:
        if e.code == 403:
            print("[SCOUT] Rate limited. Consider using GITHUB_TOKEN.")
        return []
    except Exception as e:
        print(f"[SCOUT] Search error: {e}")
        return []

def get_repo_details(owner, repo, token=None):
    """Get detailed repository information."""
    url = f"{API_BASE}/repos/{owner}/{repo}"
    
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"token {token}"
    
    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode())
    except Exception:
        return None

def format_repo(repo):
    """Format repository info for display."""
    return {
        "name": repo.get("full_name"),
        "description": repo.get("description", "")[:100],
        "stars": repo.get("stargazers_count", 0),
        "forks": repo.get("forks_count", 0),
        "language": repo.get("language"),
        "url": repo.get("html_url"),
        "updated": repo.get("updated_at", "")[:10]
    }

def scan_github(query):
    """Search GitHub and generate report."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    token = os.environ.get("GITHUB_TOKEN")
    
    print(f"[SCOUT] Searching GitHub for: {query}")
    repos = search_repos(query, token)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = OUTPUT_DIR / f"github_scan_{query.replace(' ', '_')}_{timestamp}.md"
    
    report = [
        f"# GitHub Scan: {query}",
        f"Generated: {datetime.now().isoformat()}",
        f"Results: {len(repos)} repositories",
        ""
    ]
    
    if repos:
        report.append("## Top Repositories")
        report.append("")
        
        for repo in repos:
            info = format_repo(repo)
            report.append(f"### [{info['name']}]({info['url']})")
            report.append(f"⭐ {info['stars']:,} | 🍴 {info['forks']:,} | 📝 {info['language'] or 'N/A'}")
            if info['description']:
                report.append(f"> {info['description']}")
            report.append(f"Last updated: {info['updated']}")
            report.append("")
    else:
        report.append("No repositories found or API error occurred.")
        report.append("")
        report.append("**Troubleshooting:**")
        report.append("- Check internet connection")
        report.append("- Set GITHUB_TOKEN environment variable for higher rate limits")
        report.append("- Try a different search query")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    
    print(f"[SCOUT] Scan complete: {len(repos)} repositories found")
    print(f"  Output: {output_file}")
    return str(output_file)

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "heady systems"
    scan_github(query)
