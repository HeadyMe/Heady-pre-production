/**
 * Heady MCP Services Test Suite
 * Using Jest for comprehensive testing
 */

const request = require('supertest');
const { generateId, timestampedObject } = require('../src/utils/shared-utils');
const { CacheManager } = require('../src/utils/cache');
const { schemas, validateAsync } = require('../src/utils/validation');

describe('Shared Utilities', () => {
  test('generateId creates unique IDs with prefix', () => {
    const id1 = generateId('test');
    const id2 = generateId('test');
    
    expect(id1).toMatch(/^test-[0-9a-f-]+$/);
    expect(id2).toMatch(/^test-[0-9a-f-]+$/);
    expect(id1).not.toBe(id2);
  });
  
  test('timestampedObject adds timestamps', () => {
    const obj = timestampedObject({ name: 'test' });
    
    expect(obj).toHaveProperty('name', 'test');
    expect(obj).toHaveProperty('createdAt');
    expect(obj).toHaveProperty('updatedAt');
    expect(obj.createdAt).toBe(obj.updatedAt);
  });
});

describe('Cache Manager', () => {
  let cache;
  
  beforeEach(() => {
    cache = new CacheManager({ ttl: 1 });
  });
  
  test('set and get values', async () => {
    await cache.set('key1', 'value1');
    const value = await cache.get('key1');
    
    expect(value).toBe('value1');
  });
  
  test('returns null for missing keys', async () => {
    const value = await cache.get('nonexistent');
    
    expect(value).toBeNull();
  });
  
  test('respects TTL', async () => {
    await cache.set('key2', 'value2', 1);
    await new Promise(resolve => setTimeout(resolve, 1100));
    const value = await cache.get('key2');
    
    expect(value).toBeNull();
  });
  
  test('mget retrieves multiple keys', async () => {
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.set('c', 3);
    
    const results = await cache.mget(['a', 'b', 'c', 'd']);
    
    expect(results).toEqual({
      a: 1,
      b: 2,
      c: 3
    });
  });
});

describe('Validation', () => {
  test('validates entity schema', async () => {
    const validEntity = {
      name: 'TestEntity',
      type: 'test',
      attributes: { key: 'value' }
    };
    
    const result = await validateAsync(schemas.entity, validEntity);
    expect(result).toEqual(validEntity);
  });
  
  test('rejects invalid entity', async () => {
    const invalidEntity = {
      type: 'test'
      // missing required 'name'
    };
    
    await expect(validateAsync(schemas.entity, invalidEntity))
      .rejects.toThrow('Validation failed');
  });
  
  test('validates workflow schema', async () => {
    const validWorkflow = {
      name: 'TestWorkflow',
      description: 'Test description',
      steps: [
        { name: 'step1', type: 'process', config: {} },
        { name: 'step2', type: 'validate' }
      ]
    };
    
    const result = await validateAsync(schemas.workflow, validWorkflow);
    expect(result.steps).toHaveLength(2);
  });
  
  test('validates sacred transform schema', async () => {
    const validTransform = {
      type: 'fractal',
      parameters: {
        depth: 5
      },
      dimension: '3D'
    };
    
    const result = await validateAsync(schemas.sacredTransform, validTransform);
    expect(result.parameters.depth).toBe(5);
    expect(result.dimension).toBe('3D');
  });
});

describe('Graph Server Integration', () => {
  let server;
  
  beforeAll(() => {
    const HeadyGraphServer = require('../src/mcp/heady-graph-server');
    const graphServer = new HeadyGraphServer();
    server = graphServer.app;
  });
  
  test('creates entity', async () => {
    const response = await request(server)
      .post('/api/graph/entity')
      .send({
        name: 'TestEntity',
        type: 'test',
        attributes: { key: 'value' }
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('TestEntity');
  });
  
  test('retrieves entity', async () => {
    const createResponse = await request(server)
      .post('/api/graph/entity')
      .send({
        name: 'GetTestEntity',
        type: 'test'
      });
    
    const entityId = createResponse.body.id;
    
    const getResponse = await request(server)
      .get(`/api/graph/entity/${entityId}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(entityId);
  });
  
  test('returns 404 for missing entity', async () => {
    const response = await request(server)
      .get('/api/graph/entity/nonexistent');
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Entity not found');
  });
});

describe('Workflow Server Integration', () => {
  let server;
  
  beforeAll(() => {
    const HeadyWorkflowServer = require('../src/mcp/heady-workflow-server');
    const workflowServer = new HeadyWorkflowServer();
    server = workflowServer.app;
  });
  
  test('creates workflow', async () => {
    const response = await request(server)
      .post('/api/workflow/create')
      .send({
        name: 'TestWorkflow',
        description: 'Test workflow',
        steps: [
          { name: 'step1', type: 'process' },
          { name: 'step2', type: 'validate' }
        ]
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.steps).toHaveLength(2);
  });
  
  test('creates task', async () => {
    const response = await request(server)
      .post('/api/task/create')
      .send({
        title: 'Test Task',
        description: 'Test description',
        priority: 'high',
        workspaceId: 'test-workspace'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.priority).toBe('high');
  });
  
  test('updates task status', async () => {
    const createResponse = await request(server)
      .post('/api/task/create')
      .send({
        title: 'Status Test Task'
      });
    
    const taskId = createResponse.body.id;
    
    const updateResponse = await request(server)
      .put(`/api/task/${taskId}/status`)
      .send({
        status: 'running'
      });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe('running');
  });
});

describe('Metrics Server Integration', () => {
  let server;
  
  beforeAll(() => {
    const HeadyMetricsServer = require('../src/mcp/heady-metrics-server');
    const metricsServer = new HeadyMetricsServer();
    server = metricsServer.app;
  });
  
  test('retrieves current metrics', async () => {
    const response = await request(server)
      .get('/api/metrics/current');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('system.cpu');
    expect(response.body).toHaveProperty('system.memory');
  });
  
  test('records custom metric', async () => {
    const response = await request(server)
      .post('/api/metrics/record')
      .send({
        name: 'custom.metric',
        value: 42,
        type: 'gauge',
        tags: { source: 'test' }
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
  
  test('retrieves health status', async () => {
    const response = await request(server)
      .get('/api/metrics/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('checks');
    expect(response.body).toHaveProperty('healthScore');
  });
});
