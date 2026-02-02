const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

console.log('Starting Heady Backend...');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

console.log(`Configured to listen on port ${PORT}`);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Heady Sonic Workspace Backend' });
});

// MCP Proxy endpoint
app.post('/api/mcp/proxy', async (req, res) => {
  try {
    const { server, tool, args = {} } = req.body;
    
    if (!server || !tool) {
      return res.status(400).json({ error: 'Server and tool are required' });
    }

    // Map server names to endpoints
    const serverEndpoints = {
      'heady-graph': 'http://localhost:3301',
      'heady-metrics': 'http://localhost:3302',
      'heady-workflow': 'http://localhost:3303',
      // Allow mapping for generic names if running locally on known ports
      'graph': 'http://localhost:3301',
      'metrics': 'http://localhost:3302',
      'workflow': 'http://localhost:3303',
      'assets': 'http://localhost:3304',
      'heady-assets': 'http://localhost:3304'
    };
    
    const endpoint = serverEndpoints[server];
    if (!endpoint) {
      return res.status(400).json({ error: `Unknown MCP server: ${server}` });
    }
    
    // Map tool names to API paths
    const toolPaths = {
      // Graph server tools
      'entity.create': '/api/graph/entity',
      'entity.get': `/api/graph/entity/${args.id}`,
      'relationship.create': '/api/graph/relationship',
      'graph.query': '/api/graph/query',
      'graph.metrics': '/api/graph/metrics',
      
      // Metrics server tools
      'metrics.current': '/api/metrics/current',
      'metrics.record': '/api/metrics/record',
      'metrics.history': `/api/metrics/${args.name}/history`,
      'metrics.health': '/api/metrics/health',
      
      // Workflow server tools
      'workflow.create': '/api/workflow/create',
      'workflow.execute': `/api/workflow/${args.id}/execute`,
      'workflow.status': `/api/workflow/${args.id}/status`,
      'task.create': '/api/task/create',
      'task.status': `/api/task/${args.id}/status`,
      'tasks.active': '/api/tasks/active'
    };
    
    // Fallback: If tool not explicitly mapped, try to construct path or pass through
    // For now, require explicit mapping or update this logic
    const path = toolPaths[tool];
    if (!path) {
      return res.status(400).json({ error: `Unknown tool or unmapped path: ${tool}` });
    }
    
    // Determine HTTP method
    const method = tool.includes('.create') || tool.includes('.execute') || tool.includes('.record') 
      ? 'POST' 
      : tool.includes('.status') && args.status 
      ? 'PUT'
      : 'GET';
    
    // Make request to MCP server
    const fetch = (await import('node-fetch')).default;
    
    // Construct URL
    const targetUrl = `${endpoint}${path}`;
    console.log(`Proxying to: ${method} ${targetUrl}`);

    const mcpResponse = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(args) : undefined
    });
    
    const result = await mcpResponse.json();
    
    if (!mcpResponse.ok) {
      return res.status(mcpResponse.status).json({ error: result.error || 'MCP server error', details: result });
    }
    
    res.json(result);

  } catch (error) {
    console.error('MCP Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Task management endpoints
const tasks = [];
let taskIdCounter = 1;

app.get('/api/tasks', (req, res) => {
  res.json({ tasks });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority = 'medium', status = 'pending' } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const task = {
    id: taskIdCounter++,
    title,
    description,
    priority,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(task);
  res.status(201).json({ task });
});

app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { title, description, priority, status } = req.body;
  const task = tasks[taskIndex];
  
  if (title) task.title = title;
  if (description) task.description = description;
  if (priority) task.priority = priority;
  if (status) task.status = status;
  task.updatedAt = new Date().toISOString();
  
  res.json({ task });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  res.json({ success: true });
});

// Notes endpoints
const notes = [];
let noteIdCounter = 1;

app.get('/api/notes', (req, res) => {
  res.json({ notes });
});

app.post('/api/notes', (req, res) => {
  const { title, content, tags = [] } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const note = {
    id: noteIdCounter++,
    title,
    content,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  notes.push(note);
  res.status(201).json({ note });
});

app.put('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const noteIndex = notes.findIndex(n => n.id === noteId);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  const { title, content, tags } = req.body;
  const note = notes[noteIndex];
  
  if (title) note.title = title;
  if (content) note.content = content;
  if (tags) note.tags = tags;
  note.updatedAt = new Date().toISOString();
  
  res.json({ note });
});

app.delete('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const noteIndex = notes.findIndex(n => n.id === noteId);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  notes.splice(noteIndex, 1);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log('✓ MCP proxy endpoint: POST /api/mcp/proxy');
  console.log('✓ Task endpoints: GET/POST/PUT/DELETE /api/tasks');
  console.log('✓ Notes endpoints: GET/POST/PUT/DELETE /api/notes');
});
