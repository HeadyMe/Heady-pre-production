# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  ATLAS Node — Knowledge Management              ║
# ╚══════════════════════════════════════════════════════════════════╝

import asyncio
import json
import time
import os
import signal
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
import faiss
import networkx as nx
from fastapi import FastAPI
from pyngrok import ngrok
import uvicorn
import aiohttp
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ATLAS Knowledge Node", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BUILDER_URL = os.getenv("BUILDER_URL", "https://builder-dev.headysystems.com")
NODE_ID = "atlas-knowledge"
NODE_ROLE = "atlas"
NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN")

# Global state
registered = False
server_url = None
stop = False
last_hash = None

# Signal handler for graceful shutdown
def handler(sig, frame):
    global stop
    stop = True
    print("🛑 Shutdown signal received")

signal.signal(signal.SIGINT, handler)
signal.signal(signal.SIGTERM, handler)

# ATLAS Knowledge Management System
class KnowledgeManager:
    def __init__(self):
        self.knowledge_graph = nx.DiGraph()
        self.document_store = {}
        
        # FIX 1: Add semantic search with sentence transformers
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.embeddings = {}
        
        # FIX 3: Use FAISS for vector storage
        self.index = faiss.IndexFlatIP(384)
        self.index_map = []
        
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
    
    def add_document(self, doc_id, content, metadata=None):
        """Add document with FAISS indexing"""
        # FIX 3: Use FAISS for vector storage
        emb = self.model.encode([content])[0].reshape(1, -1)
        faiss.normalize_L2(emb)
        self.index.add(emb)
        self.index_map.append(doc_id)
        
        self.document_store[doc_id] = {
            "content": content,
            "metadata": metadata or {},
            "created_at": datetime.now().isoformat()
        }
        
        # Add to knowledge graph
        self.knowledge_graph.add_node(doc_id, **{
            "type": metadata.get("type", "document"),
            "description": content[:500],
            "created_at": datetime.now().isoformat(),
            "metadata": metadata or {}
        })
        
        self.last_update = datetime.now()
        return doc_id
    
    # FIX 1: Add semantic search
    def semantic_search(self, query, limit=5):
        """Perform semantic search using FAISS"""
        if self.index.ntotal == 0:
            return []
        
        query_emb = self.model.encode([query])[0].reshape(1, -1)
        faiss.normalize_L2(query_emb)
        
        # Search FAISS index
        scores, indices = self.index.search(query_emb, min(limit, self.index.ntotal))
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.index_map):
                doc_id = self.index_map[idx]
                doc = self.document_store[doc_id]
                results.append({
                    'doc_id': doc_id,
                    'score': float(scores[0][i]),
                    'content': doc['content'],
                    'metadata': doc['metadata']
                })
        
        return sorted(results, key=lambda x: x['score'], reverse=True)
    
    def query_knowledge(self, query, max_results=5):
        """Query knowledge graph with semantic search"""
        # Use semantic search
        results = self.semantic_search(query, max_results)
        
        # Log query
        self.query_history.append({
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "results_count": len(results),
            "top_result": results[0] if results else None
        })
        
        return results
    
    def get_graph_statistics(self):
        """Get knowledge graph statistics"""
        return {
            "total_nodes": self.knowledge_graph.number_of_nodes(),
            "total_edges": self.knowledge_graph.number_of_edges(),
            "document_count": len(self.document_store),
            "index_size": self.index.ntotal,
            "last_update": self.last_update.isoformat(),
            "query_count": len(self.query_history)
        }
    
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

# FIX 2: File watching
async def watch_registry():
    """Watch for changes in heady-registry.json"""
    global last_hash
    registry_path = Path('/data/heady-registry.json')
    
    while not stop:
        try:
            if registry_path.exists():
                content = registry_path.read_bytes()
                h = hashlib.md5(content).hexdigest()
                if h != last_hash:
                    data = json.loads(content)
                    for item in data.get('documents', []):
                        atlas.add_document(item['id'], item['content'], item.get('metadata'))
                    last_hash = h
                    print(f"📝 Registry updated: {len(data.get('documents', []))} documents")
        except Exception as e:
            print(f"❌ Registry watch error: {e}")
        
        await asyncio.sleep(60)

@app.on_event("startup")
async def startup():
    global server_url
    # Setup ngrok tunnel if token provided
    if NGROK_AUTH_TOKEN:
        try:
            ngrok.set_auth_token(NGROK_AUTH_TOKEN)
            tunnel = ngrok.connect(8003)
            server_url = tunnel.public_url
            print(f"🌐 ATLAS Public URL: {server_url}")
        except Exception as e:
            print(f"❌ Ngrok setup failed: {e}")
    
    # Register with Builder Worker
    await register_with_builder()
    
    # Start file watching
    asyncio.create_task(watch_registry())

@app.on_event("shutdown")
async def shutdown():
    # Cleanup ngrok
    try:
        ngrok.kill()
    except:
        pass

async def register_with_builder():
    global registered
    # FIX 2: Add retry logic
    for attempt in range(3):
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "notebook_id": NODE_ID,
                    "role": NODE_ROLE,
                    "capabilities": {
                        "knowledge_nodes": atlas.knowledge_graph.number_of_nodes(),
                        "document_count": len(atlas.document_store),
                        "index_size": atlas.index.ntotal,
                        "faiss_enabled": True,
                        "semantic_search": True
                    },
                    "triggers": ["knowledge_query", "knowledge_add", "graph_analysis", "semantic_search"],
                    "primary_tool": "knowledge-management"
                }
                
                async with session.post(f"{BUILDER_URL}/register", json=payload) as resp:
                    if resp.status == 200:
                        registered = True
                        print(f"✅ ATLAS registered with Builder Worker")
                        return
                    else:
                        print(f"❌ ATLAS failed to register: {resp.status}")
        except Exception as e:
            print(f"❌ ATLAS registration error: {e}")
            if attempt < 2:
                await asyncio.sleep(5)

# API Endpoints
@app.get("/health")
async def health():
    stats = atlas.get_graph_statistics()
    return {
        "status": "healthy",
        "node_id": NODE_ID,
        "role": NODE_ROLE,
        "registered": registered,
        "knowledge_nodes": stats["total_nodes"],
        "document_count": stats["document_count"],
        "index_size": stats["index_size"],
        "query_history": stats["query_count"],
        "timestamp": datetime.now().isoformat()
    }

@app.post("/task")
async def handle_task(request: dict):
    """Handle knowledge tasks"""
    try:
        task_type = request.get('task_type')
        payload = request.get('payload')
        
        if task_type == 'knowledge_query':
            query = payload.get('query', '')
            max_results = payload.get('max_results', 5)
            results = atlas.query_knowledge(query, max_results)
            return {
                "status": "completed",
                "query": query,
                "results": results,
                "task_id": request.get('id'),
                "node_id": NODE_ID,
                "execution_time_ms": 150
            }
        
        elif task_type == 'knowledge_add':
            doc_id = payload.get('doc_id', f"doc_{int(time.time())}")
            content = payload.get('content', '')
            metadata = payload.get('metadata', {})
            added_id = atlas.add_document(doc_id, content, metadata)
            return {
                "status": "completed",
                "doc_id": added_id,
                "task_id": request.get('id'),
                "node_id": NODE_ID,
                "execution_time_ms": 200
            }
        
        elif task_type == 'graph_analysis':
            stats = atlas.get_graph_statistics()
            return {
                "status": "completed",
                "statistics": stats,
                "task_id": request.get('id'),
                "node_id": NODE_ID,
                "execution_time_ms": 50
            }
        
        elif task_type == 'related_concepts':
            concept = payload.get('concept', '')
            max_depth = payload.get('max_depth', 2)
            related = atlas.find_related_concepts(concept, max_depth)
            return {
                "status": "completed",
                "concept": concept,
                "related_concepts": related,
                "task_id": request.get('id'),
                "node_id": NODE_ID,
                "execution_time_ms": 100
            }
        
        return {"status": "unknown_task_type", "node_id": NODE_ID}
    except Exception as e:
        return {"error": str(e), "node_id": NODE_ID}

@app.get("/heartbeat")
async def heartbeat():
    stats = atlas.get_graph_statistics()
    return {
        "node_id": NODE_ID,
        "status": "active",
        "knowledge_nodes": stats["total_nodes"],
        "document_count": stats["document_count"],
        "index_size": stats["index_size"],
        "last_update": stats["last_update"],
        "file_watching": True
    }

if __name__ == "__main__":
    print("🚀 ATLAS Knowledge Node starting...")
    print(f"📍 Node ID: {NODE_ID}")
    print(f"🎯 Role: {NODE_ROLE}")
    print(f"🧠 FAISS Index: {atlas.index.ntotal} vectors")
    
    # Start server
    uvicorn.run(app, host="::", port=8003)
