// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  BUILDER WORKER: Coordinates 4 Colab Notebooks + This Worker    ║
// ╚══════════════════════════════════════════════════════════════════╝

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      if (url.pathname === '/execute') {
        return handleNotebookExecution(request, env, corsHeaders);
      }
      
      if (url.pathname === '/status') {
        return handleStatus(request, env, corsHeaders);
      }
      
      if (url.pathname === '/register') {
        return handleRegister(request, env, corsHeaders);
      }
      
      if (url.pathname === '/tasks') {
        return handleTasks(request, env, corsHeaders);
      }
      
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          worker: 'builder',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      return new Response('Builder Worker Active - Heady Systems', { 
        status: 200,
        headers: corsHeaders 
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message,
        status: 'error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

// Notebook registration and management
const registeredNotebooks = new Map();
const taskQueue = [];

async function handleRegister(request, env, corsHeaders) {
  const data = await request.json();
  const { notebook_id, role, capabilities } = data;
  
  registeredNotebooks.set(notebook_id, {
    id: notebook_id,
    role,
    capabilities: capabilities || [],
    registered_at: new Date().toISOString(),
    last_heartbeat: new Date().toISOString(),
    status: 'active',
    task_count: 0
  });
  
  console.log(`✅ Notebook registered: ${notebook_id} (${role})`);
  
  return new Response(JSON.stringify({ 
    success: true,
    notebook_id,
    registered_notebooks: registeredNotebooks.size,
    message: `Registered ${role} notebook`
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function handleStatus(request, env, corsHeaders) {
  const activeNotebooks = Array.from(registeredNotebooks.values())
    .filter(nb => nb.status === 'active');
  
  return new Response(JSON.stringify({ 
    status: 'active',
    worker_capacity: 'available',
    registered_notebooks: registeredNotebooks.size,
    active_notebooks: activeNotebooks.length,
    max_colab_notebooks: 4,
    queue_size: taskQueue.length,
    notebooks: Array.from(registeredNotebooks.values()),
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function handleNotebookExecution(request, env, corsHeaders) {
  const payload = await request.json();
  
  // Select optimal notebook (load balancing)
  const assignedNotebook = selectOptimalNotebook(payload);
  
  // Add task to queue
  const task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    notebook_id: assignedNotebook,
    payload,
    created_at: new Date().toISOString(),
    status: 'queued'
  };
  
  taskQueue.push(task);
  
  // Update notebook task count
  if (registeredNotebooks.has(assignedNotebook)) {
    const notebook = registeredNotebooks.get(assignedNotebook);
    notebook.task_count++;
    notebook.last_heartbeat = new Date().toISOString();
  }
  
  console.log(`📋 Task assigned to ${assignedNotebook}: ${task.id}`);
  
  return new Response(JSON.stringify({ 
    success: true,
    task_id: task.id,
    assigned_notebook: assignedNotebook,
    worker_handled: true,
    queue_position: taskQueue.length,
    estimated_wait: taskQueue.length * 2 // seconds
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function handleTasks(request, env, corsHeaders) {
  const url = new URL(request.url);
  const notebookId = url.searchParams.get('notebook_id');
  
  if (!notebookId) {
    return new Response(JSON.stringify({ 
      error: 'notebook_id parameter required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Find tasks for this notebook
  const notebookTasks = taskQueue.filter(task => 
    task.notebook_id === notebookId && task.status === 'queued'
  );
  
  // Mark tasks as assigned
  notebookTasks.forEach(task => {
    task.status = 'assigned';
    task.assigned_at = new Date().toISOString();
  });
  
  // Update heartbeat
  if (registeredNotebooks.has(notebookId)) {
    registeredNotebooks.get(notebookId).last_heartbeat = new Date().toISOString();
  }
  
  return new Response(JSON.stringify({ 
    tasks: notebookTasks,
    notebook_id: notebookId,
    total_tasks: taskQueue.length
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

function selectOptimalNotebook(payload) {
  const activeNotebooks = Array.from(registeredNotebooks.entries())
    .filter(([id, nb]) => nb.status === 'active');
  
  if (activeNotebooks.length === 0) {
    return 'notebook-1'; // fallback
  }
  
  // Load balancing: select notebook with least tasks
  const sorted = activeNotebooks.sort(([,a], [,b]) => a.task_count - b.task_count);
  return sorted[0][0];
}

// Durable Object for persistent state (optional enhancement)
export class BuilderState {
  constructor(state, env) {
    this.state = state;
  }
  
  async fetch(request) {
    // Persistent state management
    return new Response('Builder State DO');
  }
}
