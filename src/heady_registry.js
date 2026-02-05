// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: src/heady_registry.js
// LAYER: backend/src
// 
//         _   _  _____    _    ____   __   __
//        | | | || ____|  / \  |  _ \ \ \ / /
//        | |_| ||  _|   / _ \ | | | | \ V / 
//        |  _  || |___ / ___ \| |_| |  | |  
//        |_| |_||_____/_/   \_\____/   |_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

/**
 * HeadyRegistry :: Registry Utility Module
 * Sacred Geometry :: Organic Systems :: Breathing Interfaces
 * Flow: Files → Scan → Analyze → Optimize
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = 'heady-registry.json';

function loadRegistry(registryPath = REGISTRY_PATH) {
  try {
    if (fs.existsSync(registryPath)) {
      return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    }
    return null;
  } catch (error) {
    console.error(`Error loading registry: ${error.message}`);
    return null;
  }
}

function saveRegistry(registry, registryPath = REGISTRY_PATH) {
  try {
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving registry: ${error.message}`);
    return false;
  }
}

function getComponent(registry, componentId) {
  return registry.components.find(c => c.id === componentId);
}

function getWorkflow(registry, workflowId) {
  return registry.workflows.find(w => w.id === workflowId);
}

function getAllComponents(registry) {
  return registry.components;
}

function getAllWorkflows(registry) {
  return registry.workflows;
}

function addComponent(registry, component) {
  const existing = registry.components.find(c => c.id === component.id);
  if (existing) {
    Object.assign(existing, component);
  } else {
    registry.components.push(component);
  }
  return saveRegistry(registry);
}

function addWorkflow(registry, workflow) {
  const existing = registry.workflows.find(w => w.id === workflow.id);
  if (existing) {
    Object.assign(existing, workflow);
  } else {
    registry.workflows.push(workflow);
  }
  return saveRegistry(registry);
}

function updateComponentStatus(registry, componentId, status) {
  const component = registry.components.find(c => c.id === componentId);
  if (component) {
    component.status = status;
    return saveRegistry(registry);
  }
  return false;
}

function findComponentByType(registry, type) {
  return registry.components.filter(c => c.type === type);
}

function findWorkflowByOwner(registry, owner) {
  return registry.workflows.filter(w => w.owner === owner);
}

function getActiveComponents(registry) {
  return registry.components.filter(c => c.status === 'active');
}

function getRegistryStats(registry) {
  return {
    totalComponents: registry.components.length,
    activeComponents: registry.components.filter(c => c.status === 'active').length,
    totalWorkflows: registry.workflows.length,
    componentTypes: [...new Set(registry.components.map(c => c.type))],
    connectivityMethods: Object.keys(registry.connectivity || {}).length,
  };
}

function initializeRegistry() {
  return {
    registryVersion: "1.0.0",
    updatedAt: new Date().toISOString(),
    components: [],
    workflows: [],
    connectivity: {},
    secrets: [],
  };
}

function validateRegistry(registry) {
  const errors = [];
  
  if (!registry.registryVersion) errors.push('Missing registryVersion');
  if (!Array.isArray(registry.components)) errors.push('Components must be an array');
  if (!Array.isArray(registry.workflows)) errors.push('Workflows must be an array');
  
  const componentIds = new Set();
  for (const comp of registry.components || []) {
    if (componentIds.has(comp.id)) {
      errors.push(`Duplicate component ID: ${comp.id}`);
    }
    componentIds.add(comp.id);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  loadRegistry,
  saveRegistry,
  getComponent,
  getWorkflow,
  getAllComponents,
  getAllWorkflows,
  addComponent,
  addWorkflow,
  updateComponentStatus,
  findComponentByType,
  findWorkflowByOwner,
  getActiveComponents,
  getRegistryStats,
  initializeRegistry,
  validateRegistry,
};
