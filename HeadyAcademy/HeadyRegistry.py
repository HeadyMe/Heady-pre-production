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
# ║  FILE: HeadyAcademy/HeadyRegistry.py                              ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                ║
║     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                ║
║     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 ║
║     ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  ║
║     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   ║
║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   ║
║                                                                               ║
║      HEADY REGISTRY - CAPABILITY TRACKING SYSTEM                            ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                            ║
║     Centralized registry for all Heady capabilities:                          ║
║     - Nodes (BRIDGE, MUSE, SENTINEL, etc.)                                    ║
║     - Workflows (.windsurf/workflows/*.md)                                    ║
║     - Skills (Cascade AI skills)                                              ║
║     - Services (MCP, API, Frontend)                                           ║
║     - Tools (HeadyAcademy/Tools/*)                                            ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import json
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict, fields
from datetime import datetime
import glob


@dataclass
class Node:
    name: str
    role: str
    primary_tool: str
    behavior_profile: Optional[str] = None
    trigger_on: Optional[List[str]] = None
    status: str = "available"
    last_invoked: Optional[str] = None


@dataclass
class Workflow:
    name: str
    description: str
    file_path: str
    slash_command: str
    turbo_enabled: bool = False
    status: str = "available"


@dataclass
class Skill:
    name: str
    description: str
    category: str
    status: str = "available"


@dataclass
class Service:
    name: str
    type: str
    endpoint: Optional[str] = None
    port: Optional[int] = None
    status: str = "unknown"
    health_check_url: Optional[str] = None


@dataclass
class Tool:
    name: str
    file_path: str
    category: str
    description: Optional[str] = None
    dependencies: Optional[List[str]] = None
    status: str = "available"


class HeadyRegistry:
    """
    Central registry for all Heady system capabilities.
    Tracks nodes, workflows, skills, services, and tools.
    """
    
    def __init__(self, root_path: str = None):
        self.root_path = Path(root_path) if root_path else Path(__file__).parent.parent
        self.registry_file = self.root_path / ".heady" / "registry.json"
        
        self.nodes: Dict[str, Node] = {}
        self.workflows: Dict[str, Workflow] = {}
        self.skills: Dict[str, Skill] = {}
        self.services: Dict[str, Service] = {}
        self.tools: Dict[str, Tool] = {}
        
        self._ensure_registry_dir()
        self._load_or_discover()
    
    def _ensure_registry_dir(self):
        """Ensure .heady directory exists."""
        registry_dir = self.registry_file.parent
        registry_dir.mkdir(parents=True, exist_ok=True)
    
    def _load_or_discover(self):
        """Load existing registry or perform auto-discovery."""
        if self.registry_file.exists():
            self.load()
        else:
            self.discover_all()
            self.save()
    
    def discover_all(self):
        """Auto-discover all system capabilities."""
        print(" HeadyRegistry: Discovering system capabilities...")
        self.discover_nodes()
        self.discover_workflows()
        self.discover_skills()
        self.discover_services()
        self.discover_tools()
        print(f" HeadyRegistry: Discovery complete. Found {self.get_total_count()} capabilities.")
    
    def discover_nodes(self):
        """Discover nodes from Node_Registry.yaml."""
        node_registry_path = self.root_path / "HeadyAcademy" / "Node_Registry.yaml"
        
        if not node_registry_path.exists():
            print(f"[WARN] Node registry not found at {node_registry_path}")
            return
        
        with open(node_registry_path, 'r') as f:
            data = yaml.safe_load(f)
        
        if 'nodes' in data:
            for node_data in data['nodes']:
                node = Node(
                    name=node_data['name'],
                    role=node_data['role'],
                    primary_tool=node_data['primary_tool'],
                    behavior_profile=node_data.get('behavior_profile'),
                    trigger_on=node_data.get('trigger_on', [])
                )
                self.nodes[node.name] = node
        
        print(f"  * Discovered {len(self.nodes)} nodes")
    
    def discover_workflows(self):
        """Discover workflows from .windsurf/workflows/*.md."""
        workflows_dir = self.root_path / ".windsurf" / "workflows"
        
        if not workflows_dir.exists():
            print(f"[WARN] Workflows directory not found at {workflows_dir}")
            return
        
        for workflow_file in workflows_dir.glob("*.md"):
            try:
                with open(workflow_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                description = "No description"
                turbo_enabled = False
                
                if content.startswith('---'):
                    parts = content.split('---', 2)
                    if len(parts) >= 3:
                        frontmatter = yaml.safe_load(parts[1])
                        description = frontmatter.get('description', 'No description')
                
                if '// turbo' in content:
                    turbo_enabled = True
                
                slash_command = f"/{workflow_file.stem}"
                
                workflow = Workflow(
                    name=workflow_file.stem,
                    description=description,
                    file_path=str(workflow_file),
                    slash_command=slash_command,
                    turbo_enabled=turbo_enabled
                )
                self.workflows[workflow.name] = workflow
            
            except Exception as e:
                print(f"  [WARN] Error parsing workflow {workflow_file.name}: {e}")
        
        print(f"  * Discovered {len(self.workflows)} workflows")
    
    def discover_skills(self):
        """Discover Cascade AI skills."""
        skills_data = [
            {"name": "hc", "description": "Heady Conductor orchestration", "category": "orchestration"}
        ]
        
        for skill_data in skills_data:
            skill = Skill(**skill_data)
            self.skills[skill.name] = skill
        
        print(f"  * Discovered {len(self.skills)} skills")
    
    def discover_services(self):
        """Discover running services."""
        services_data = [
            {"name": "heady-manager", "type": "api", "endpoint": "https://headysystems.com", "port": 443, "health_check_url": "https://headysystems.com/api/health"},
            {"name": "heady-cloud", "type": "web", "endpoint": "https://headycloud.com", "port": 443},
            {"name": "heady-connection", "type": "api", "endpoint": "https://headyconnection.com", "port": 443},
            {"name": "mcp-server", "type": "mcp", "endpoint": "stdio", "port": None},
            {"name": "postgres", "type": "database", "endpoint": None, "port": 5432},
            {"name": "redis", "type": "cache", "endpoint": None, "port": 6379}
        ]
        
        for service_data in services_data:
            service = Service(**service_data)
            self.services[service.name] = service
        
        print(f"  * Discovered {len(self.services)} services")
    
    def discover_tools(self):
        """Discover tools from HeadyAcademy/Tools/."""
        tools_dir = self.root_path / "HeadyAcademy" / "Tools"
        
        if not tools_dir.exists():
            print(f"[WARN] Tools directory not found at {tools_dir}")
            return
        
        for tool_file in tools_dir.rglob("*.py"):
            if tool_file.name.startswith('__'):
                continue
            
            relative_path = tool_file.relative_to(tools_dir)
            category = relative_path.parts[0] if len(relative_path.parts) > 1 else "general"
            
            tool = Tool(
                name=tool_file.stem,
                file_path=str(tool_file),
                category=category
            )
            self.tools[tool.name] = tool
        
        print(f"  * Discovered {len(self.tools)} tools")
    
    def save(self):
        """Save registry to JSON file."""
        data = {
            "metadata": {
                "last_updated": datetime.now().isoformat(),
                "version": "1.0.0"
            },
            "nodes": {k: asdict(v) for k, v in self.nodes.items()},
            "workflows": {k: asdict(v) for k, v in self.workflows.items()},
            "skills": {k: asdict(v) for k, v in self.skills.items()},
            "services": {k: asdict(v) for k, v in self.services.items()},
            "tools": {k: asdict(v) for k, v in self.tools.items()}
        }
        
        with open(self.registry_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f" HeadyRegistry: Saved to {self.registry_file}")
    
    @staticmethod
    def _safe_init(cls, data_dict):
        """Construct a dataclass instance, ignoring unknown fields."""
        valid = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data_dict.items() if k in valid})

    def load(self):
        """Load registry from JSON file."""
        with open(self.registry_file, 'r') as f:
            data = json.load(f)
        
        self.nodes = {k: self._safe_init(Node, v) for k, v in data.get('nodes', {}).items()}
        self.workflows = {k: self._safe_init(Workflow, v) for k, v in data.get('workflows', {}).items()}
        self.skills = {k: self._safe_init(Skill, v) for k, v in data.get('skills', {}).items()}
        self.services = {k: self._safe_init(Service, v) for k, v in data.get('services', {}).items()}
        self.tools = {k: self._safe_init(Tool, v) for k, v in data.get('tools', {}).items()}
        
        print(f"HeadyRegistry: Loaded {self.get_total_count()} capabilities from {self.registry_file}")
    
    def get_total_count(self) -> int:
        """Get total count of all capabilities."""
        return len(self.nodes) + len(self.workflows) + len(self.skills) + len(self.services) + len(self.tools)
    
    def query(self, query: str, category: Optional[str] = None) -> Dict[str, List[Any]]:
        """Query registry for capabilities matching search term."""
        results = {
            "nodes": [],
            "workflows": [],
            "skills": [],
            "services": [],
            "tools": []
        }
        
        query_lower = query.lower()
        
        if not category or category == "nodes":
            for node in self.nodes.values():
                if (query_lower in node.name.lower() or 
                    query_lower in node.role.lower() or
                    any(query_lower in trigger.lower() for trigger in (node.trigger_on or []))):
                    results["nodes"].append(asdict(node))
        
        if not category or category == "workflows":
            for workflow in self.workflows.values():
                if (query_lower in workflow.name.lower() or 
                    query_lower in workflow.description.lower() or
                    query_lower in workflow.slash_command.lower()):
                    results["workflows"].append(asdict(workflow))
        
        if not category or category == "skills":
            for skill in self.skills.values():
                if query_lower in skill.name.lower() or query_lower in skill.description.lower():
                    results["skills"].append(asdict(skill))
        
        if not category or category == "services":
            for service in self.services.values():
                if query_lower in service.name.lower() or query_lower in service.type.lower():
                    results["services"].append(asdict(service))
        
        if not category or category == "tools":
            for tool in self.tools.values():
                if query_lower in tool.name.lower() or query_lower in tool.category.lower():
                    results["tools"].append(asdict(tool))
        
        return results
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of all capabilities."""
        return {
            "total_capabilities": self.get_total_count(),
            "nodes": len(self.nodes),
            "workflows": len(self.workflows),
            "skills": len(self.skills),
            "services": len(self.services),
            "tools": len(self.tools),
            "node_list": list(self.nodes.keys()),
            "workflow_list": list(self.workflows.keys()),
            "skill_list": list(self.skills.keys()),
            "service_list": list(self.services.keys()),
            "tool_categories": list(set(tool.category for tool in self.tools.values()))
        }
    
    def update_node_status(self, node_name: str, status: str, last_invoked: str = None):
        """Update node status and last invoked time."""
        if node_name in self.nodes:
            self.nodes[node_name].status = status
            if last_invoked:
                self.nodes[node_name].last_invoked = last_invoked
            self.save()
    
    def update_service_status(self, service_name: str, status: str):
        """Update service status."""
        if service_name in self.services:
            self.services[service_name].status = status
            self.save()


if __name__ == "__main__":
    registry = HeadyRegistry()
    summary = registry.get_summary()
    
    print("\n" + "="*80)
    print(" HEADY REGISTRY SUMMARY ")
    print("="*80)
    print(f"\nTotal Capabilities: {summary['total_capabilities']}")
    print(f"\n📦 Nodes: {summary['nodes']}")
    print(f"   {', '.join(summary['node_list'])}")
    print(f"\n⚡ Workflows: {summary['workflows']}")
    print(f"   {', '.join(summary['workflow_list'])}")
    print(f"\n[TARGET] Skills: {summary['skills']}")
    print(f"   {', '.join(summary['skill_list'])}")
    print(f"\n🔧 Services: {summary['services']}")
    print(f"   {', '.join(summary['service_list'])}")
    print(f"\n[TOOL]  Tools: {len(registry.tools)}")
    print(f"   Categories: {', '.join(summary['tool_categories'])}")
    print("\n" + "="*80)
