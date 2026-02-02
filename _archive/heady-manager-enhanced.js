#!/usr/bin/env node
/**
 * Heady Manager Enhanced - Secure, Deterministic, Orchestrated
 * Integrates security (PTACA, RAA), orchestration, and patent portfolio features
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const EventEmitter = require('events');

// Environment configuration
const PORT = process.env.PORT || 3300;
const HEADY_API_KEY = process.env.HEADY_API_KEY || crypto.randomBytes(32).toString('hex');
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const TRUST_DOMAIN = 'headysystems.com';
const APP_DOMAIN = 'app.headysystems.com';

// Security constants
const DESTRUCTIVE_PATTERNS = ['delete', 'rm', 'drop', 'truncate', 'exec', 'shell'];
const PHI = 1.618033988749895; // Golden ratio for optimization

// Initialize Express app with security
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

app.use(cors({
    origin: process.env.HEADY_CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced rate limiting with golden ratio backoff
const createRateLimiter = (windowMs, max) => rateLimit({
    windowMs,
    max,
    handler: (req, res) => {
        const retryAfter = Math.floor(windowMs * PHI / 1000);
        res.status(429).json({
            error: 'Too many requests',
            retryAfter,
            message: `Please retry after ${retryAfter} seconds`
        });
    }
});

// Apply rate limiting
app.use('/api/', createRateLimiter(
    parseInt(process.env.HEADY_RATE_LIMIT_WINDOW_MS || '60000'),
    parseInt(process.env.HEADY_RATE_LIMIT_MAX || '100')
));

// Critical operations rate limiter
app.use('/api/admin/', createRateLimiter(30000, 10));

/**
 * Security Context Manager
 */
class SecurityContextManager {
    constructor() {
        this.contexts = new Map();
        this.nonces = new Map();
        this.attestations = new Map();
    }

    generateNonce() {
        const nonce = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 60000; // 60 seconds
        this.nonces.set(nonce, expiry);
        return nonce;
    }

    verifyNonce(nonce) {
        if (!this.nonces.has(nonce)) return false;
        
        const expiry = this.nonces.get(nonce);
        if (Date.now() > expiry) {
            this.nonces.delete(nonce);
            return false;
        }
        
        this.nonces.delete(nonce);
        return true;
    }

    createContext(userId, sessionId, hardwareToken = null) {
        const context = {
            userId,
            sessionId,
            hardwareToken,
            attestationState: hardwareToken ? 'verified' : 'unverified',
            timestamp: new Date().toISOString(),
            nonce: this.generateNonce()
        };
        
        this.contexts.set(sessionId, context);
        return context;
    }

    calculateRiskScore(operation, resource) {
        let score = 0;
        
        // Check for destructive patterns
        for (const pattern of DESTRUCTIVE_PATTERNS) {
            if (operation.toLowerCase().includes(pattern)) {
                score += 30;
            }
        }
        
        // Check resource sensitivity
        if (resource.includes('system') || resource.includes('admin')) {
            score += 25;
        }
        
        if (resource.includes('config') || resource.includes('secret')) {
            score += 20;
        }
        
        return Math.min(score, 100);
    }

    async authorizeOperation(context, operation, resource) {
        const riskScore = this.calculateRiskScore(operation, resource);
        
        // High risk operations require hardware attestation
        if (riskScore > 75 && context.attestationState !== 'verified') {
            return {
                authorized: false,
                reason: 'Hardware attestation required for high-risk operation',
                riskScore
            };
        }
        
        // Critical operations require additional verification
        if (riskScore > 90) {
            // Would implement biometric verification here
            return {
                authorized: false,
                reason: 'Additional verification required for critical operation',
                riskScore
            };
        }
        
        return {
            authorized: true,
            riskScore
        };
    }

    cleanupExpiredNonces() {
        const now = Date.now();
        for (const [nonce, expiry] of this.nonces.entries()) {
            if (now > expiry) {
                this.nonces.delete(nonce);
            }
        }
    }
}

/**
 * Orchestration Manager
 */
class OrchestrationManager extends EventEmitter {
    constructor() {
        super();
        this.nodes = new Map();
        this.metrics = [];
        this.healthChecks = new Map();
        this.scalingHistory = [];
        
        // Configuration
        this.minNodes = parseInt(process.env.MIN_NODES || '1');
        this.maxNodes = parseInt(process.env.MAX_NODES || '10');
        this.targetHealth = 75;
        
        // Start monitoring
        this.startMonitoring();
    }

    async provisionNode(nodeType = 'worker') {
        const nodeId = `${nodeType}-${crypto.randomBytes(4).toString('hex')}`;
        
        const node = {
            id: nodeId,
            type: nodeType,
            state: 'initializing',
            createdAt: new Date().toISOString(),
            health: 100,
            metrics: {
                cpu: 0,
                memory: 0,
                requests: 0,
                errors: 0
            }
        };
        
        this.nodes.set(nodeId, node);
        
        // Simulate provisioning
        setTimeout(() => {
            node.state = 'healthy';
            this.emit('nodeProvisioned', node);
        }, 2000);
        
        console.log(`[Orchestrator] Provisioned node: ${nodeId}`);
        return node;
    }

    async deprovisionNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
        node.state = 'draining';
        
        // Wait for drain
        setTimeout(() => {
            this.nodes.delete(nodeId);
            this.emit('nodeDeprovisioned', nodeId);
            console.log(`[Orchestrator] Deprovisioned node: ${nodeId}`);
        }, 5000);
    }

    async performHealthCheck(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return null;
        
        // Simulate health metrics
        const health = {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            latency: Math.random() * 1000,
            errorRate: Math.random() * 0.1
        };
        
        // Calculate health score
        const healthScore = 100 - (
            (health.cpu * 0.25) +
            (health.memory * 0.25) +
            (health.latency / 10 * 0.25) +
            (health.errorRate * 100 * 0.25)
        );
        
        node.health = healthScore;
        node.metrics = health;
        
        // Update state based on health
        if (healthScore < 30) {
            node.state = 'unhealthy';
        } else if (healthScore < 60) {
            node.state = 'degraded';
        } else {
            node.state = 'healthy';
        }
        
        this.healthChecks.set(nodeId, {
            timestamp: new Date().toISOString(),
            health: healthScore,
            metrics: health
        });
        
        return healthScore;
    }

    async checkScaling() {
        const nodeCount = this.nodes.size;
        const avgHealth = this.calculateAverageHealth();
        
        let action = 'maintain';
        
        if (avgHealth < 50 && nodeCount < this.maxNodes) {
            action = 'scale_up';
            const scaleCount = Math.floor(PHI); // Use golden ratio for scaling
            for (let i = 0; i < scaleCount; i++) {
                await this.provisionNode();
            }
        } else if (avgHealth > 80 && nodeCount > this.minNodes) {
            action = 'scale_down';
            // Find least healthy node
            let worstNode = null;
            let worstHealth = 100;
            
            for (const [id, node] of this.nodes) {
                if (node.health < worstHealth) {
                    worstHealth = node.health;
                    worstNode = id;
                }
            }
            
            if (worstNode) {
                await this.deprovisionNode(worstNode);
            }
        }
        
        this.scalingHistory.push({
            timestamp: new Date().toISOString(),
            action,
            nodeCount: this.nodes.size,
            avgHealth
        });
        
        return action;
    }

    calculateAverageHealth() {
        if (this.nodes.size === 0) return 0;
        
        let totalHealth = 0;
        for (const node of this.nodes.values()) {
            totalHealth += node.health;
        }
        
        return totalHealth / this.nodes.size;
    }

    async handleNodeFailure(nodeId) {
        console.log(`[Orchestrator] Handling failure for node: ${nodeId}`);
        
        const node = this.nodes.get(nodeId);
        if (!node) return;
        
        // Provision replacement
        const replacement = await this.provisionNode(node.type);
        
        // Migrate workload (simulated)
        console.log(`[Orchestrator] Migrating workload from ${nodeId} to ${replacement.id}`);
        
        // Deprovision failed node
        await this.deprovisionNode(nodeId);
    }

    startMonitoring() {
        // Health check interval
        setInterval(async () => {
            for (const nodeId of this.nodes.keys()) {
                await this.performHealthCheck(nodeId);
            }
            
            // Check for failures
            for (const [nodeId, node] of this.nodes) {
                if (node.state === 'unhealthy') {
                    await this.handleNodeFailure(nodeId);
                }
            }
            
            // Check scaling
            await this.checkScaling();
        }, 10000); // Every 10 seconds
        
        // Cleanup old health checks
        setInterval(() => {
            const cutoff = Date.now() - 3600000; // 1 hour
            for (const [nodeId, check] of this.healthChecks) {
                if (new Date(check.timestamp).getTime() < cutoff) {
                    this.healthChecks.delete(nodeId);
                }
            }
        }, 60000); // Every minute
    }

    getClusterStatus() {
        const nodes = Array.from(this.nodes.values());
        return {
            nodeCount: nodes.length,
            avgHealth: this.calculateAverageHealth(),
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.type,
                state: n.state,
                health: n.health,
                createdAt: n.createdAt
            })),
            scalingHistory: this.scalingHistory.slice(-10)
        };
    }
}

/**
 * Audit Logger
 */
class AuditLogger {
    constructor() {
        this.logPath = path.join(__dirname, 'audit_logs');
        this.chainHash = null;
        this.initializeLogDirectory();
    }

    async initializeLogDirectory() {
        try {
            await fs.mkdir(this.logPath, { recursive: true });
        } catch (error) {
            console.error('Failed to create audit log directory:', error);
        }
    }

    createEvidenceEntry(event) {
        const entry = {
            timestamp: new Date().toISOString(),
            event,
            previousHash: this.chainHash || 'genesis'
        };
        
        // Create entry hash
        const entryJson = JSON.stringify(entry);
        const entryHash = crypto.createHash('sha256').update(entryJson).digest('hex');
        
        entry.hash = entryHash;
        this.chainHash = entryHash;
        
        return entry;
    }

    async logSecurityEvent(eventType, context, details) {
        const event = {
            type: eventType,
            context,
            details
        };
        
        const entry = this.createEvidenceEntry(event);
        
        // Write to audit log
        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logPath, `audit_${date}.jsonl`);
        
        try {
            await fs.appendFile(logFile, JSON.stringify(entry) + '\n');
        } catch (error) {
            console.error('Failed to write audit log:', error);
        }
        
        return entry.hash;
    }

    async verifyChainIntegrity(date) {
        const logFile = path.join(this.logPath, `audit_${date}.jsonl`);
        
        try {
            const content = await fs.readFile(logFile, 'utf-8');
            const lines = content.trim().split('\n');
            
            let previousHash = 'genesis';
            
            for (const line of lines) {
                const entry = JSON.parse(line);
                
                // Verify previous hash
                if (entry.previousHash !== previousHash) {
                    return false;
                }
                
                // Verify entry hash
                const entryCopy = { ...entry };
                const storedHash = entryCopy.hash;
                delete entryCopy.hash;
                
                const calculatedHash = crypto.createHash('sha256')
                    .update(JSON.stringify(entryCopy))
                    .digest('hex');
                
                if (storedHash !== calculatedHash) {
                    return false;
                }
                
                previousHash = storedHash;
            }
            
            return true;
        } catch (error) {
            console.error('Failed to verify chain integrity:', error);
            return false;
        }
    }
}

// Initialize managers
const securityManager = new SecurityContextManager();
const orchestrator = new OrchestrationManager();
const auditLogger = new AuditLogger();

// Cleanup interval for nonces
setInterval(() => {
    securityManager.cleanupExpiredNonces();
}, 60000);

/**
 * Authentication middleware
 */
const authenticate = async (req, res, next) => {
    const apiKey = req.headers['x-heady-api-key'] || 
                   req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey || apiKey !== HEADY_API_KEY) {
        await auditLogger.logSecurityEvent('auth_failure', {
            ip: req.ip,
            path: req.path
        }, {
            reason: 'Invalid API key'
        });
        
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Create security context
    const sessionId = crypto.randomBytes(16).toString('hex');
    const hardwareToken = req.headers['x-hardware-token'];
    
    req.securityContext = securityManager.createContext(
        req.headers['x-user-id'] || 'anonymous',
        sessionId,
        hardwareToken
    );
    
    next();
};

/**
 * Risk assessment middleware
 */
const assessRisk = (operation) => {
    return async (req, res, next) => {
        const resource = req.path;
        const auth = await securityManager.authorizeOperation(
            req.securityContext,
            operation,
            resource
        );
        
        if (!auth.authorized) {
            await auditLogger.logSecurityEvent('operation_denied', 
                req.securityContext, {
                    operation,
                    resource,
                    reason: auth.reason,
                    riskScore: auth.riskScore
                });
            
            return res.status(403).json({
                error: 'Operation not authorized',
                reason: auth.reason,
                riskScore: auth.riskScore
            });
        }
        
        req.riskScore = auth.riskScore;
        next();
    };
};

/**
 * API Routes
 */

// Health check endpoint
app.get('/api/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '13.0.0',
        trustDomain: TRUST_DOMAIN,
        appDomain: APP_DOMAIN,
        orchestration: orchestrator.getClusterStatus()
    };
    
    res.json(health);
});

// Security endpoints
app.post('/api/security/nonce', authenticate, (req, res) => {
    const nonce = securityManager.generateNonce();
    res.json({ nonce });
});

app.post('/api/security/attest', authenticate, 
    body('nonce').notEmpty(),
    body('signature').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { nonce, signature } = req.body;
        
        if (!securityManager.verifyNonce(nonce)) {
            return res.status(400).json({ error: 'Invalid or expired nonce' });
        }
        
        // Verify signature (simplified)
        const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
            .update(nonce)
            .digest('hex');
        
        if (signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }
        
        // Create attestation
        const attestation = {
            id: crypto.randomBytes(16).toString('hex'),
            timestamp: new Date().toISOString(),
            validUntil: new Date(Date.now() + 300000).toISOString() // 5 minutes
        };
        
        securityManager.attestations.set(attestation.id, attestation);
        
        await auditLogger.logSecurityEvent('attestation_created', 
            req.securityContext, attestation);
        
        res.json({ attestation });
    });

// Orchestration endpoints
app.get('/api/orchestration/status', authenticate, (req, res) => {
    res.json(orchestrator.getClusterStatus());
});

app.post('/api/orchestration/provision', authenticate, 
    assessRisk('provision_node'),
    async (req, res) => {
        const { nodeType = 'worker' } = req.body;
        const node = await orchestrator.provisionNode(nodeType);
        
        await auditLogger.logSecurityEvent('node_provisioned', 
            req.securityContext, { node });
        
        res.json({ node });
    });

app.delete('/api/orchestration/node/:nodeId', authenticate,
    assessRisk('deprovision_node'),
    async (req, res) => {
        const { nodeId } = req.params;
        await orchestrator.deprovisionNode(nodeId);
        
        await auditLogger.logSecurityEvent('node_deprovisioned', 
            req.securityContext, { nodeId });
        
        res.json({ success: true });
    });

// Audit endpoints
app.get('/api/audit/verify/:date', authenticate,
    assessRisk('verify_audit'),
    async (req, res) => {
        const { date } = req.params;
        const valid = await auditLogger.verifyChainIntegrity(date);
        
        res.json({ date, valid });
    });

// Admin endpoints with enhanced security
app.use('/api/admin/*', authenticate, assessRisk('admin_operation'));

app.get('/api/admin/config', async (req, res) => {
    const config = {
        trustDomain: TRUST_DOMAIN,
        appDomain: APP_DOMAIN,
        minNodes: orchestrator.minNodes,
        maxNodes: orchestrator.maxNodes,
        goldenRatio: PHI
    };
    
    await auditLogger.logSecurityEvent('config_accessed', 
        req.securityContext, {});
    
    res.json(config);
});

// Codex builder endpoint
app.post('/api/codex/build', authenticate,
    assessRisk('codex_build'),
    async (req, res) => {
        const { config = {} } = req.body;
        
        // Run codex builder
        const codexProcess = spawn('python', [
            path.join(__dirname, 'src', 'codex_builder_v13.py')
        ], {
            env: { ...process.env, ...config }
        });
        
        let output = '';
        let error = '';
        
        codexProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        codexProcess.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        codexProcess.on('close', async (code) => {
            if (code !== 0) {
                await auditLogger.logSecurityEvent('codex_build_failed', 
                    req.securityContext, { error });
                
                return res.status(500).json({ error: 'Codex build failed', details: error });
            }
            
            await auditLogger.logSecurityEvent('codex_build_success', 
                req.securityContext, { output });
            
            res.json({ success: true, output });
        });
    });

// Static file serving with security headers
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
    }
}));

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
    console.log('[WebSocket] Client connected');
    
    // Send initial status
    ws.send(JSON.stringify({
        type: 'status',
        data: orchestrator.getClusterStatus()
    }));
    
    // Subscribe to orchestrator events
    const handleNodeEvent = (data) => {
        ws.send(JSON.stringify({
            type: 'node_event',
            data
        }));
    };
    
    orchestrator.on('nodeProvisioned', handleNodeEvent);
    orchestrator.on('nodeDeprovisioned', handleNodeEvent);
    
    ws.on('close', () => {
        orchestrator.removeListener('nodeProvisioned', handleNodeEvent);
        orchestrator.removeListener('nodeDeprovisioned', handleNodeEvent);
        console.log('[WebSocket] Client disconnected');
    });
});

// HTTP server with WebSocket upgrade
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  HEADY MANAGER ENHANCED v13                  ║
║                    Secure • Deterministic                    ║
║                      Orchestrated • RAA                      ║
╠══════════════════════════════════════════════════════════════╣
║  Trust Domain: ${TRUST_DOMAIN.padEnd(45)}║
║  App Domain:   ${APP_DOMAIN.padEnd(45)}║
║  Port:         ${String(PORT).padEnd(45)}║
║  API Key:      ${(HEADY_API_KEY.substring(0, 8) + '...').padEnd(45)}║
║  Nodes:        ${String(orchestrator.nodes.size).padEnd(45)}║
╚══════════════════════════════════════════════════════════════╝
    `);
    
    // Initialize with minimum nodes
    (async () => {
        while (orchestrator.nodes.size < orchestrator.minNodes) {
            await orchestrator.provisionNode();
        }
    })();
});

server.on('upgrade', (request, socket, head) => {
    // Verify authentication for WebSocket
    const apiKey = request.headers['x-heady-api-key'];
    
    if (apiKey !== HEADY_API_KEY) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }
    
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[Manager] Shutting down gracefully...');
    
    // Drain all nodes
    for (const nodeId of orchestrator.nodes.keys()) {
        await orchestrator.deprovisionNode(nodeId);
    }
    
    server.close(() => {
        console.log('[Manager] Server closed');
        process.exit(0);
    });
});

module.exports = { app, orchestrator, securityManager, auditLogger };
