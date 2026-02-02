/**
 * Heady Graph MCP Server
 * Manages entities, relationships, and workspace knowledge graphs
 */

const express = require('express');
const { sendSuccess, sendError, generateId } = require('../utils/shared-utils');
const logger = require('../utils/logger');
const { PORTS } = require('../../lib/constants');

const app = express();
app.use(express.json());

// In-memory graph storage
const entities = new Map();
const relationships = new Map();
const workspaces = new Map();

/**
 * Create entity
 */
app.post('/api/graph/entities', (req, res) => {
  try {
    const { name, type, properties = {}, workspace = 'default' } = req.body;
    
    if (!name || !type) {
      return sendError(res, 'Name and type are required', 400);
    }
    
    const entity = {
      id: generateId('entity'),
      name,
      type,
      properties,
      workspace,
      createdAt: new Date().toISOString()
    };
    
    entities.set(entity.id, entity);
    
    // Track in workspace
    if (!workspaces.has(workspace)) {
      workspaces.set(workspace, { entities: [], relationships: [] });
    }
    workspaces.get(workspace).entities.push(entity.id);
    
    sendSuccess(res, entity, 201);
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Get entity
 */
app.get('/api/graph/entities/:id', (req, res) => {
  try {
    const entity = entities.get(req.params.id);
    
    if (!entity) {
      return sendError(res, 'Entity not found', 404);
    }
    
    sendSuccess(res, entity);
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Create relationship
 */
app.post('/api/graph/relationships', (req, res) => {
  try {
    const { from, to, type, properties = {}, workspace = 'default' } = req.body;
    
    if (!from || !to || !type) {
      return sendError(res, 'From, to, and type are required', 400);
    }
    
    if (!entities.has(from) || !entities.has(to)) {
      return sendError(res, 'Source or target entity not found', 404);
    }
    
    const relationship = {
      id: generateId('rel'),
      from,
      to,
      type,
      properties,
      workspace,
      createdAt: new Date().toISOString()
    };
    
    relationships.set(relationship.id, relationship);
    
    // Track in workspace
    if (!workspaces.has(workspace)) {
      workspaces.set(workspace, { entities: [], relationships: [] });
    }
    workspaces.get(workspace).relationships.push(relationship.id);
    
    sendSuccess(res, relationship, 201);
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Query subgraph
 */
app.post('/api/graph/query', (req, res) => {
  try {
    const { entityIds, depth = 1, workspace } = req.body;
    
    if (!entityIds || !Array.isArray(entityIds)) {
      return sendError(res, 'entityIds array required', 400);
    }
    
    const subgraphEntities = new Set(entityIds);
    const subgraphRelationships = new Set();
    
    // BFS to specified depth
    let currentLevel = new Set(entityIds);
    
    for (let d = 0; d < depth; d++) {
      const nextLevel = new Set();
      
      for (const rel of relationships.values()) {
        if (workspace && rel.workspace !== workspace) continue;
        
        if (currentLevel.has(rel.from)) {
          subgraphRelationships.add(rel.id);
          subgraphEntities.add(rel.to);
          nextLevel.add(rel.to);
        }
        
        if (currentLevel.has(rel.to)) {
          subgraphRelationships.add(rel.id);
          subgraphEntities.add(rel.from);
          nextLevel.add(rel.from);
        }
      }
      
      currentLevel = nextLevel;
    }
    
    const result = {
      entities: Array.from(subgraphEntities).map(id => entities.get(id)).filter(Boolean),
      relationships: Array.from(subgraphRelationships).map(id => relationships.get(id)).filter(Boolean)
    };
    
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Get workspace graph
 */
app.get('/api/graph/workspace/:workspace', (req, res) => {
  try {
    const { workspace } = req.params;
    const ws = workspaces.get(workspace);
    
    if (!ws) {
      return sendError(res, 'Workspace not found', 404);
    }
    
    const result = {
      workspace,
      entities: ws.entities.map(id => entities.get(id)).filter(Boolean),
      relationships: ws.relationships.map(id => relationships.get(id)).filter(Boolean),
      stats: {
        entityCount: ws.entities.length,
        relationshipCount: ws.relationships.length
      }
    };
    
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Graph metrics
 */
app.get('/api/graph/metrics', (req, res) => {
  try {
    const metrics = {
      totalEntities: entities.size,
      totalRelationships: relationships.size,
      totalWorkspaces: workspaces.size,
      workspaces: Array.from(workspaces.keys())
    };
    
    sendSuccess(res, metrics);
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  sendSuccess(res, { 
    status: 'healthy',
    service: 'heady-graph-server',
    entities: entities.size,
    relationships: relationships.size
  });
});

const PORT = process.env.PORT || PORTS.GRAPH_SERVER;

app.listen(PORT, () => {
  console.log(`✅ Heady Graph Server running on port ${PORT}`);
});

module.exports = app;
