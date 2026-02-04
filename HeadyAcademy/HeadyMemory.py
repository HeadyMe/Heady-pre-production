# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: HeadyAcademy/HeadyMemory.py
# LAYER: core
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
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
║     ∞ MEMORY - THE ETERNAL ARCHIVE ∞                                          ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                         ║
║     Persistent indexed storage with Heady data protocols                      ║
║     Registered in HeadyRegistry for orchestrated knowledge management         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import sqlite3
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict


@dataclass
class MemoryEntry:
    id: str
    category: str  # concept, task, workflow, node_activity, external_source, user_preference
    content: Dict[str, Any]
    tags: List[str]
    timestamp: str
    source: str
    relevance_score: float = 1.0
    access_count: int = 0
    last_accessed: Optional[str] = None


class HeadyMemory:
    """
    MEMORY - The Eternal Archive
    Persistent indexed storage system using Heady data protocols.
    Indexed in HeadyRegistry as a core system node.
    """
    
    def __init__(self, root_path: str = None):
        self.root_path = Path(root_path) if root_path else Path(__file__).parent.parent
        self.db_path = self.root_path / ".heady" / "memory.db"
        
        # Ensure directory exists
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self._init_database()
        
        # In-memory indexes for fast access
        self.category_index: Dict[str, List[str]] = {}
        self.tag_index: Dict[str, List[str]] = {}
        self.source_index: Dict[str, List[str]] = {}
        
        # Build indexes
        self._build_indexes()
        
        print("∞ MEMORY: Initialized - The Eternal Archive is ready")
    
    def _init_database(self):
        """Initialize SQLite database with Heady schema."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        # Main memory table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                category TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                source TEXT NOT NULL,
                relevance_score REAL DEFAULT 1.0,
                access_count INTEGER DEFAULT 0,
                last_accessed TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Indexes for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_category ON memories(category)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON memories(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_source ON memories(source)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_relevance ON memories(relevance_score)")
        
        # External sources table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS external_sources (
                id TEXT PRIMARY KEY,
                source_type TEXT NOT NULL,
                source_url TEXT,
                content TEXT NOT NULL,
                comparative_analysis TEXT,
                integrated_at TEXT NOT NULL,
                relevance_score REAL DEFAULT 1.0
            )
        """)
        
        # User preferences table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                category TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _build_indexes(self):
        """Build in-memory indexes for fast retrieval."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        # Build category index
        cursor.execute("SELECT id, category FROM memories")
        for mem_id, category in cursor.fetchall():
            if category not in self.category_index:
                self.category_index[category] = []
            self.category_index[category].append(mem_id)
        
        # Build tag index
        cursor.execute("SELECT id, tags FROM memories")
        for mem_id, tags_str in cursor.fetchall():
            tags = json.loads(tags_str)
            for tag in tags:
                if tag not in self.tag_index:
                    self.tag_index[tag] = []
                self.tag_index[tag].append(mem_id)
        
        # Build source index
        cursor.execute("SELECT id, source FROM memories")
        for mem_id, source in cursor.fetchall():
            if source not in self.source_index:
                self.source_index[source] = []
            self.source_index[source].append(mem_id)
        
        conn.close()
    
    def store(self, category: str, content: Dict[str, Any], tags: List[str] = None, 
              source: str = "system", relevance_score: float = 1.0) -> str:
        """Store data in persistent memory with indexing."""
        tags = tags or []
        
        # Generate ID
        content_str = json.dumps(content, sort_keys=True)
        mem_id = hashlib.sha256(f"{category}:{content_str}".encode()).hexdigest()[:16]
        
        timestamp = datetime.now().isoformat()
        
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO memories 
            (id, category, content, tags, timestamp, source, relevance_score, access_count, last_accessed)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)
        """, (mem_id, category, json.dumps(content), json.dumps(tags), timestamp, source, relevance_score))
        
        conn.commit()
        conn.close()
        
        # Update indexes
        if category not in self.category_index:
            self.category_index[category] = []
        if mem_id not in self.category_index[category]:
            self.category_index[category].append(mem_id)
        
        for tag in tags:
            if tag not in self.tag_index:
                self.tag_index[tag] = []
            if mem_id not in self.tag_index[tag]:
                self.tag_index[tag].append(mem_id)
        
        if source not in self.source_index:
            self.source_index[source] = []
        if mem_id not in self.source_index[source]:
            self.source_index[source].append(mem_id)
        
        return mem_id
    
    def recall(self, mem_id: str) -> Optional[MemoryEntry]:
        """Recall specific memory by ID."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM memories WHERE id = ?", (mem_id,))
        row = cursor.fetchone()
        
        if row:
            # Update access count
            cursor.execute("""
                UPDATE memories 
                SET access_count = access_count + 1, last_accessed = ?
                WHERE id = ?
            """, (datetime.now().isoformat(), mem_id))
            conn.commit()
            
            entry = MemoryEntry(
                id=row[0],
                category=row[1],
                content=json.loads(row[2]),
                tags=json.loads(row[3]),
                timestamp=row[4],
                source=row[5],
                relevance_score=row[6],
                access_count=row[7] + 1,
                last_accessed=datetime.now().isoformat()
            )
            conn.close()
            return entry
        
        conn.close()
        return None
    
    def query(self, category: Optional[str] = None, tags: Optional[List[str]] = None,
              source: Optional[str] = None, limit: int = 100) -> List[MemoryEntry]:
        """Query memories using indexes for fast retrieval."""
        candidate_ids = set()
        
        # Use indexes for fast filtering
        if category and category in self.category_index:
            candidate_ids = set(self.category_index[category])
        
        if tags:
            tag_ids = set()
            for tag in tags:
                if tag in self.tag_index:
                    tag_ids.update(self.tag_index[tag])
            if candidate_ids:
                candidate_ids &= tag_ids
            else:
                candidate_ids = tag_ids
        
        if source and source in self.source_index:
            source_ids = set(self.source_index[source])
            if candidate_ids:
                candidate_ids &= source_ids
            else:
                candidate_ids = source_ids
        
        # If no filters, get all
        if not candidate_ids and not (category or tags or source):
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM memories LIMIT ?", (limit,))
            candidate_ids = {row[0] for row in cursor.fetchall()}
            conn.close()
        
        # Fetch full entries
        results = []
        for mem_id in list(candidate_ids)[:limit]:
            entry = self.recall(mem_id)
            if entry:
                results.append(entry)
        
        # Sort by relevance and recency
        results.sort(key=lambda x: (x.relevance_score, x.timestamp), reverse=True)
        
        return results
    
    def store_external_source(self, source_type: str, content: Dict[str, Any],
                             source_url: Optional[str] = None,
                             comparative_analysis: Optional[str] = None) -> str:
        """Store external source with comparative analysis."""
        source_id = hashlib.sha256(f"{source_type}:{source_url}".encode()).hexdigest()[:16]
        
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO external_sources
            (id, source_type, source_url, content, comparative_analysis, integrated_at, relevance_score)
            VALUES (?, ?, ?, ?, ?, ?, 1.0)
        """, (source_id, source_type, source_url, json.dumps(content), 
              comparative_analysis, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        return source_id
    
    def get_external_sources(self, source_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve external sources."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        if source_type:
            cursor.execute("SELECT * FROM external_sources WHERE source_type = ?", (source_type,))
        else:
            cursor.execute("SELECT * FROM external_sources")
        
        sources = []
        for row in cursor.fetchall():
            sources.append({
                "id": row[0],
                "source_type": row[1],
                "source_url": row[2],
                "content": json.loads(row[3]),
                "comparative_analysis": row[4],
                "integrated_at": row[5],
                "relevance_score": row[6]
            })
        
        conn.close()
        return sources
    
    def set_preference(self, key: str, value: Any, category: str = "general"):
        """Store user preference."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO user_preferences (key, value, category, updated_at)
            VALUES (?, ?, ?, ?)
        """, (key, json.dumps(value), category, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    def get_preference(self, key: str, default: Any = None) -> Any:
        """Retrieve user preference."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute("SELECT value FROM user_preferences WHERE key = ?", (key,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return json.loads(row[0])
        return default
    
    def get_all_preferences(self, category: Optional[str] = None) -> Dict[str, Any]:
        """Get all user preferences."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        if category:
            cursor.execute("SELECT key, value FROM user_preferences WHERE category = ?", (category,))
        else:
            cursor.execute("SELECT key, value FROM user_preferences")
        
        preferences = {}
        for key, value in cursor.fetchall():
            preferences[key] = json.loads(value)
        
        conn.close()
        return preferences
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get memory statistics."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM memories")
        total_memories = cursor.fetchone()[0]
        
        cursor.execute("SELECT category, COUNT(*) FROM memories GROUP BY category")
        by_category = dict(cursor.fetchall())
        
        cursor.execute("SELECT COUNT(*) FROM external_sources")
        external_sources = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM user_preferences")
        preferences = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(access_count) FROM memories")
        total_accesses = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            "total_memories": total_memories,
            "by_category": by_category,
            "external_sources": external_sources,
            "user_preferences": preferences,
            "total_accesses": total_accesses,
            "categories_indexed": len(self.category_index),
            "tags_indexed": len(self.tag_index),
            "sources_indexed": len(self.source_index)
        }


if __name__ == "__main__":
    memory = HeadyMemory()
    
    print("\n" + "="*80)
    print("∞ MEMORY - THE ETERNAL ARCHIVE ∞")
    print("="*80)
    
    stats = memory.get_statistics()
    print(json.dumps(stats, indent=2))
