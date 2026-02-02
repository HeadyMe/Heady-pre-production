/**
 * Heady Workflow MCP Server
 * Workflow creation, execution, task management with status transitions
 */

const express = require('express');
const { sendSuccess, sendError, generateId, isValidTransition, initSSE, sendSSE, EventManager } = require('../utils/shared-utils');
const queue = require('../utils/queue');
const { PORTS, STATUS, PRIORITY } = require('../../lib/constants');

const app = express();
app.use(express.json());

// Workflow storage
const workflows = new Map();
const tasks = new Map();
const eventManager = new EventManager();

/**
 * Create workflow
 */
app.post('/api/workflows', (req, res) => {
  try {
    const { name, description, steps = [], workspace = 'default' } = req.body;
    
    if (!name) {
      return sendError(res, 'Name required', 400);
    }
    
    const workflow = {
      id: generateId('workflow'),
      name,
      description,
      steps,
      workspace,
      status: STATUS.PENDING,
      createdAt: new Date().toISOString()
    };
    
    workflows.set(workflow.id, workflow);
    
    sendSuccess(res, workflow, 201);
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Create task
 */
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, priority = PRIORITY.MEDIUM, workspace = 'default', workflowId } = req.body;
    
    if (!title) {
      return sendError(res, 'Title required', 400);
    }
    
    const task = {
      id: generateId('task'),
      title,
      description,
      priority,
      workspace,
      workflowId,
      status: STATUS.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.set(task.id, task);
    
    // Emit event
    eventManager.emit('task:created', task);
    
    sendSuccess(res, task, 201);
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Update task status
 */
app.patch('/api/tasks/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const task = tasks.get(id);
    if (!task) {
      return sendError(res, 'Task not found', 404);
    }
    
    // Validate status transition
    if (!isValidTransition(task.status, status)) {
      return sendError(res, `Invalid transition from ${task.status} to ${status}`, 400);
    }
    
    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    
    // Emit event
    eventManager.emit('task:status_changed', { task, oldStatus, newStatus: status });
    
    sendSuccess(res, task);
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Get tasks
 */
app.get('/api/tasks', (req, res) => {
  try {
    const { workspace, status, workflowId } = req.query;
    
    let filteredTasks = Array.from(tasks.values());
    
    if (workspace) {
      filteredTasks = filteredTasks.filter(t => t.workspace === workspace);
    }
    
    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status);
    }
    
    if (workflowId) {
      filteredTasks = filteredTasks.filter(t => t.workflowId === workflowId);
    }
    
    sendSuccess(res, {
      tasks: filteredTasks,
      count: filteredTasks.length
    });
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Get active tasks (in_progress)
 */
app.get('/api/tasks/active', (req, res) => {
  try {
    const activeTasks = Array.from(tasks.values())
      .filter(t => t.status === STATUS.IN_PROGRESS);
    
    sendSuccess(res, {
      tasks: activeTasks,
      count: activeTasks.length
    });
  } catch (error) {
    sendError(res, error.message);
  }
});

/**
 * Event stream
 */
app.get('/api/events/stream', (req, res) => {
  initSSE(res);
  
  const handlers = {
    'task:created': (task) => sendSSE(res, 'task:created', task),
    'task:status_changed': (data) => sendSSE(res, 'task:status_changed', data),
    'workflow:started': (workflow) => sendSSE(res, 'workflow:started', workflow)
  };
  
  // Register handlers
  Object.entries(handlers).forEach(([event, handler]) => {
    eventManager.on(event, handler);
  });
  
  // Cleanup on disconnect
  req.on('close', () => {
    Object.keys(handlers).forEach(event => {
      eventManager.removeAll(event);
    });
  });
});

/**
 * Execute workflow
 */
app.post('/api/workflows/:id/execute', (req, res) => {
  try {
    const { id } = req.params;
    const workflow = workflows.get(id);
    
    if (!workflow) {
      return sendError(res, 'Workflow not found', 404);
    }
    
    workflow.status = STATUS.IN_PROGRESS;
    workflow.startedAt = new Date().toISOString();
    
    eventManager.emit('workflow:started', workflow);
    
    sendSuccess(res, workflow);
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
    service: 'heady-workflow-server',
    workflows: workflows.size,
    tasks: tasks.size
  });
});

const PORT = process.env.PORT || PORTS.WORKFLOW_SERVER;

app.listen(PORT, () => {
  console.log(`✅ Heady Workflow Server running on port ${PORT}`);
});

module.exports = app;
