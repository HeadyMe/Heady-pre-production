const request = require('supertest');

// Set env vars BEFORE requiring the app
process.env.HEADY_API_KEY = 'test-key';
process.env.HEADY_ADMIN_ENABLE_GPU = 'true'; // Enable GPU for testing if needed

const { app, mcpManager, orchestrator } = require('../heady-manager-unified');

describe('Heady Unified Manager Integration', () => {
    // Wait for MCP initialization (mock or real)
    beforeAll(async () => {
        // Initialize MCP Manager explicitly for tests
        await mcpManager.initialize();
    });

    afterAll(async () => {
        // Cleanup MCP connections to prevent open handles
        await mcpManager.closeAll();
        // Stop orchestrator monitoring interval
        if (orchestrator && typeof orchestrator.stopMonitoring === 'function') {
            orchestrator.stopMonitoring();
        }
    });

    describe('Health & Pulse', () => {
        it('GET /api/health should return healthy status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('healthy');
            expect(res.body.service).toBe('heady-manager-unified');
        });

        it('GET /api/pulse should return docker status', async () => {
            const res = await request(app).get('/api/pulse');
            expect(res.statusCode).toBe(200);
            expect(res.body.ok).toBe(true);
        });
    });

    describe('Orchestration API', () => {
        let nodeId;

        it('POST /api/orchestration/provision should create a node', async () => {
            const res = await request(app)
                .post('/api/orchestration/provision')
                .set('x-heady-api-key', 'test-key')
                .send({ nodeType: 'worker' });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.ok).toBe(true);
            expect(res.body.node).toBeDefined();
            nodeId = res.body.node.id;
        });
    });

    describe('MCP API', () => {
        it('GET /api/mcp/tools should list available tools', async () => {
             const res = await request(app)
                .get('/api/mcp/tools')
                .set('x-heady-api-key', 'test-key');
             
             expect(res.statusCode).toBe(200);
             expect(res.body.ok).toBe(true);
             expect(Array.isArray(res.body.tools)).toBe(true);
        });
    });
});
