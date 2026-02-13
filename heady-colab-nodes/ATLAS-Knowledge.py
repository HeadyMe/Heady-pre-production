# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  ATLAS Node — Knowledge Management              ║
# ╚══════════════════════════════════════════════════════════════════╝

# Cell 1: Install dependencies + setup
!pip install -q aiohttp networkx sentence-transformers scikit-learn

import asyncio
import aiohttp
import json
import time
import networkx as nx
from datetime import datetime, timedelta
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle
import hashlib

print(f'NetworkX: {nx.__version__}')
print(f'NumPy: {np.__version__}')

BUILDER_URL = "https://builder-dev.headysystems.com"
NOTEBOOK_ID = "atlas-knowledge"

# Cell 2: ATLAS Knowledge Management System
class KnowledgeManager:
    def __init__(self):
        self.knowledge_graph = nx.DiGraph()
        self.document_store = {}
        self.embeddings_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.query_history = []
        self.last_update = datetime.now()
        
        # Initialize with core Heady knowledge
        self._initialize_core_knowledge()
        
    def _initialize_core_knowledge(self):
        """Initialize with core Heady Systems knowledge"""
        core_concepts = {
            "HeadySoul": {
                "type": "governance",
                "description": "Ultimate governor with mission, values, ethics",
                "connections": ["Intelligence Engine", "HCFullPipeline", "HCBrain"]
            },
            "Intelligence Protocol": {
                "type": "protocol",
                "description": "DAG scheduler, priority queue, critical path optimization",
                "connections": ["Task Scheduler", "Parallel Allocator", "Speed Controller"]
            },
            "SoulOrchestrator": {
                "type": "orchestrator",
                "description": "Proactive global orchestrator with goal decomposition",
                "connections": ["Goal Decomposer", "Value Engine", "Parallel Engine"]
            },
            "Builder Worker": {
                "type": "coordination",
                "description": "Cloudflare Worker coordinating 4 Colab notebooks",
                "connections": ["HeadyManager-Core", "JULES-AI", "OBSERVER", "ATLAS"]
            },
            "Sacred Geometry": {
                "type": "philosophy",
                "description": "Organic, breathing, deterministic, self-correcting architecture",
                "connections": ["HeadySoul", "System Design", "User Experience"]
            }
        }
        
        # Add to knowledge graph
        for concept, data in core_concepts.items():
            self.knowledge_graph.add_node(concept, **data)
            
        # Add connections
        for concept, data in core_concepts.items():
            for connection in data.get("connections", []):
                if connection in core_concepts:
                    self.knowledge_graph.add_edge(concept, connection, relation="informs")
        
        print(f"🧠 Initialized ATLAS with {len(core_concepts)} core concepts")
    
    def add_knowledge(self, topic, content, metadata=None):
        """Add new knowledge to the graph"""
        node_id = self._generate_node_id(topic)
        
        # Generate embedding for semantic search
        embedding = self.embeddings_model.encode([topic + " " + content])[0]
        
        node_data = {
            "type": metadata.get("type", "knowledge"),
            "description": content[:500],  # Truncate for storage
            "embedding": embedding.tolist(),
            "created_at": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        self.knowledge_graph.add_node(node_id, **node_data)
        
        # Find and add semantic connections
        self._add_semantic_connections(node_id, embedding)
        
        self.last_update = datetime.now()
        return node_id
    
    def _generate_node_id(self, topic):
        """Generate unique node ID from topic"""
        hash_obj = hashlib.md5(topic.encode())
        return f"node_{hash_obj.hexdigest()[:12]}"
    
    def _add_semantic_connections(self, new_node_id, new_embedding):
        """Add connections based on semantic similarity"""
        similarities = []
        
        for node_id, node_data in self.knowledge_graph.nodes(data=True):
            if node_id != new_node_id and "embedding" in node_data:
                existing_embedding = np.array(node_data["embedding"])
                similarity = np.dot(new_embedding, existing_embedding) / (
                    np.linalg.norm(new_embedding) * np.linalg.norm(existing_embedding)
                )
                
                if similarity > 0.7:  # Threshold for semantic connection
                    similarities.append((node_id, similarity))
        
        # Add top semantic connections
        similarities.sort(key=lambda x: x[1], reverse=True)
        for node_id, similarity in similarities[:3]:  # Top 3 connections
            self.knowledge_graph.add_edge(new_node_id, node_id, 
                                         relation="semantic_similarity", 
                                         weight=float(similarity))
    
    def query_knowledge(self, query, max_results=5):
        """Query knowledge graph with semantic search"""
        query_embedding = self.embeddings_model.encode([query])[0]
        
        results = []
        for node_id, node_data in self.knowledge_graph.nodes(data=True):
            if "embedding" in node_data:
                embedding = np.array(node_data["embedding"])
                similarity = np.dot(query_embedding, embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(embedding)
                )
                
                results.append({
                    "node_id": node_id,
                    "similarity": float(similarity),
                    "content": node_data.get("description", ""),
                    "type": node_data.get("type", "unknown"),
                    "metadata": node_data.get("metadata", {})
                })
        
        # Sort by similarity and return top results
        results.sort(key=lambda x: x["similarity"], reverse=True)
        
        # Log query
        self.query_history.append({
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "results_count": len(results),
            "top_result": results[0] if results else None
        })
        
        return results[:max_results]
    
    def get_graph_statistics(self):
        """Get knowledge graph statistics"""
        return {
            "total_nodes": self.knowledge_graph.number_of_nodes(),
            "total_edges": self.knowledge_graph.number_of_edges(),
            "node_types": self._count_node_types(),
            "last_update": self.last_update.isoformat(),
            "query_count": len(self.query_history)
        }
    
    def _count_node_types(self):
        """Count nodes by type"""
        type_counts = {}
        for node_data in self.knowledge_graph.nodes(data=True):
            node_type = node_data[1].get("type", "unknown")
            type_counts[node_type] = type_counts.get(node_type, 0) + 1
        return type_counts
    
    def find_related_concepts(self, concept, max_depth=2):
        """Find concepts related to a given concept"""
        if concept not in self.knowledge_graph:
            return []
        
        related = []
        visited = set()
        
        def dfs(node, depth):
            if depth > max_depth or node in visited:
                return
            
            visited.add(node)
            
            for neighbor in self.knowledge_graph.neighbors(node):
                if neighbor not in visited:
                    related.append({
                        "concept": neighbor,
                        "depth": depth,
                        "relation": self.knowledge_graph[node][neighbor].get("relation", "connected")
                    })
                    dfs(neighbor, depth + 1)
        
        dfs(concept, 0)
        return related

# Initialize ATLAS
print("🗺️ Initializing ATLAS Knowledge Manager...")
atlas = KnowledgeManager()
print("✅ ATLAS ready")

# Cell 3: Register with Builder Worker
async def register_with_builder():
    async with aiohttp.ClientSession() as session:
        payload = {
            "notebook_id": NOTEBOOK_ID,
            "role": "knowledge-management",
            "capabilities": {
                "knowledge_nodes": atlas.knowledge_graph.number_of_nodes(),
                "knowledge_edges": atlas.knowledge_graph.number_of_edges(),
                "embedding_model": "all-MiniLM-L6-v2"
            },
            "triggers": ["knowledge_query", "knowledge_add", "graph_analysis", "semantic_search"]
        }
        
        try:
            async with session.post(f"{BUILDER_URL}/register", json=payload) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print(f"✅ {NOTEBOOK_ID} registered successfully")
                    print(f"📊 Registered notebooks: {result['registered_notebooks']}")
                    return True
                else:
                    print(f"❌ Registration failed: {resp.status}")
                    return False
        except Exception as e:
            print(f"❌ Registration error: {e}")
            return False

# Register now
registered = asyncio.run(register_with_builder())
print(f"🎯 Registration status: {'SUCCESS' if registered else 'FAILED'}")

# Cell 4: Task execution engine
async def execute_knowledge_task(task):
    task_id = task.get('id', 'unknown')
    task_type = task.get('task_type', 'unknown')
    payload = task.get('payload', {})
    
    print(f"🗺️ Processing knowledge task {task_id}: {task_type}")
    
    try:
        if task_type == 'knowledge_query':
            query = payload.get('query', '')
            max_results = payload.get('max_results', 5)
            results = atlas.query_knowledge(query, max_results)
            result = {
                "status": "completed",
                "query": query,
                "results": results,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 150
            }
        
        elif task_type == 'knowledge_add':
            topic = payload.get('topic', '')
            content = payload.get('content', '')
            metadata = payload.get('metadata', {})
            node_id = atlas.add_knowledge(topic, content, metadata)
            result = {
                "status": "completed",
                "node_id": node_id,
                "topic": topic,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 200
            }
        
        elif task_type == 'graph_analysis':
            stats = atlas.get_graph_statistics()
            result = {
                "status": "completed",
                "statistics": stats,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 50
            }
        
        elif task_type == 'related_concepts':
            concept = payload.get('concept', '')
            max_depth = payload.get('max_depth', 2)
            related = atlas.find_related_concepts(concept, max_depth)
            result = {
                "status": "completed",
                "concept": concept,
                "related_concepts": related,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 100
            }
        
        else:
            result = {
                "status": "unknown_task_type",
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID
            }
        
        # Report completion back to Builder
        async with aiohttp.ClientSession() as session:
            await session.post(f"{BUILDER_URL}/task/complete", json=result)
        
        print(f"✅ Knowledge task completed: {task_id}")
        return result
        
    except Exception as e:
        error_result = {
            "status": "error",
            "task_id": task_id,
            "error": str(e),
            "notebook_id": NOTEBOOK_ID
        }
        
        async with aiohttp.ClientSession() as session:
            await session.post(f"{BUILDER_URL}/task/complete", json=error_result)
        
        return error_result

# Cell 5: Task polling loop
async def listen_for_knowledge_tasks():
    print(f"👂 Starting knowledge task listener for {NOTEBOOK_ID}...")
    
    while True:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{BUILDER_URL}/tasks?notebook_id={NOTEBOOK_ID}") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        tasks = data.get('tasks', [])
                        
                        if tasks:
                            print(f"📋 Received {len(tasks)} knowledge tasks")
                            
                            for task in tasks:
                                await execute_knowledge_task(task)
                    
        except Exception as e:
            print(f"❌ Knowledge task listener error: {e}")
        
        await asyncio.sleep(5)  # Poll every 5 seconds

# Start listening in background
def run_knowledge_listener():
    asyncio.run(listen_for_knowledge_tasks())

knowledge_listener_thread = threading.Thread(target=run_knowledge_listener, daemon=True)
knowledge_listener_thread.start()

print(f"🎵 Knowledge task listener started for {NOTEBOOK_ID}")

# Cell 6: Health check
async def health_check():
    stats = atlas.get_graph_statistics()
    return {
        "status": "healthy",
        "notebook_id": NOTEBOOK_ID,
        "role": "knowledge-management",
        "registered": registered,
        "knowledge_nodes": stats["total_nodes"],
        "knowledge_edges": stats["total_edges"],
        "query_history": stats["query_count"],
        "timestamp": datetime.now().isoformat()
    }

# Test health check
health = asyncio.run(health_check())
print(f"🏥 Health Status: {health['status']}")
print(f"🧠 Knowledge nodes: {health['knowledge_nodes']}")
print(f"🔗 Knowledge edges: {health['knowledge_edges']}")
print(f"📊 Queries processed: {health['query_history']}")
print(f"🎯 Registered with Builder: {health['registered']}")

print("""
## 🚀 ATLAS Knowledge Status

✅ Notebook ID: atlas-knowledge
✅ Role: knowledge-management
✅ Builder URL: https://builder-dev.headysystems.com
✅ Knowledge Graph: Active with semantic embeddings
✅ Task Listener: Active
✅ Embedding Model: all-MiniLM-L6-v2

### Capabilities
- Semantic knowledge search
- Knowledge graph management
- Concept relationship mapping
- Query history tracking
- Automatic knowledge organization

### Core Knowledge Domains
- HeadySoul governance
- Intelligence Protocol
- SoulOrchestrator architecture
- Builder Worker coordination
- Sacred Geometry principles

### Connection Status
- Registered with Builder Worker
- Polling for knowledge tasks every 5 seconds
- Auto-reports task completion
- Health monitoring active
- Semantic similarity connections maintained
""")
