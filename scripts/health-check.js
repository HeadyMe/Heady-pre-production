#!/usr/bin/env node
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Health Check Service — System Monitoring     ║
// ╚══════════════════════════════════════════════════════════════════╝

const axios = require('axios');

const ports = [8000, 8001, 8002, 8003];
const services = {
    8000: 'HeadySoul GPU',
    8001: 'JULES AI',
    8002: 'OBSERVER Monitor',
    8003: 'ATLAS Knowledge'
};

async function checkHealth() {
    console.log(`\n🔍 Heady Systems Health Check - ${new Date().toISOString()}`);
    console.log('═'.repeat(60));
    
    let healthyCount = 0;
    let totalChecks = 0;
    
    for (const port of ports) {
        totalChecks++;
        try {
            const response = await axios.get(`http://localhost:${port}/health`, { 
                timeout: 5000,
                validateStatus: (status) => status < 500
            });
            
            if (response.status === 200) {
                const data = response.data;
                console.log(`✅ ${services[port]} (${port}): ${data.status.toUpperCase()}`);
                console.log(`   📍 Node ID: ${data.node_id}`);
                console.log(`   🎯 Role: ${data.role}`);
                console.log(`   📊 Registered: ${data.registered ? 'YES' : 'NO'}`);
                
                // Service-specific details
                if (data.faiss_index_size !== undefined) {
                    console.log(`   🧠 FAISS Index: ${data.faiss_index_size} vectors`);
                }
                if (data.monitoring_active !== undefined) {
                    console.log(`   👁️  Monitoring: ${data.monitoring_active ? 'ACTIVE' : 'INACTIVE'}`);
                }
                if (data.knowledge_nodes !== undefined) {
                    console.log(`   🗺️  Knowledge Nodes: ${data.knowledge_nodes}`);
                }
                
                healthyCount++;
            } else {
                console.log(`⚠️  ${services[port]} (${port}): HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${services[port]} (${port}): ${error.code || 'CONNECTION_FAILED'}`);
        }
        console.log('');
    }
    
    // Overall health summary
    const healthPercentage = (healthyCount / totalChecks) * 100;
    console.log('═'.repeat(60));
    console.log(`📊 Overall Health: ${healthPercentage.toFixed(0)}% (${healthyCount}/${totalChecks} services)`);
    
    if (healthPercentage === 100) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL');
    } else if (healthPercentage >= 75) {
        console.log('⚠️  SYSTEMS DEGRADED');
    } else {
        console.log('🚨 CRITICAL SYSTEM FAILURE');
    }
    
    console.log('═'.repeat(60));
    
    return {
        healthyCount,
        totalChecks,
        healthPercentage,
        timestamp: new Date().toISOString()
    };
}

// Circuit Breaker Pattern
class CircuitBreaker {
    constructor(name) {
        this.name = name;
        this.failures = 0;
        this.open = false;
        this.lastFailure = null;
    }
    
    async execute(fn) {
        if (this.open) {
            const timeSinceLastFailure = Date.now() - this.lastFailure;
            if (timeSinceLastFailure > 60000) { // 1 minute timeout
                this.open = false;
                this.failures = 0;
            } else {
                throw new Error(`${this.name} circuit OPEN`);
            }
        }
        
        try {
            const result = await fn();
            this.failures = 0;
            return result;
        } catch (error) {
            this.failures++;
            this.lastFailure = Date.now();
            
            if (this.failures >= 5) {
                this.open = true;
            }
            
            throw error;
        }
    }
}

// Create circuit breakers for each service
const circuitBreakers = {};
for (const port of ports) {
    circuitBreakers[port] = new CircuitBreaker(services[port]);
}

// Enhanced health check with circuit breakers
async function checkHealthWithCircuitBreakers() {
    console.log(`\n🔍 Heady Systems Health Check (with Circuit Breakers) - ${new Date().toISOString()}`);
    console.log('═'.repeat(60));
    
    let healthyCount = 0;
    let totalChecks = 0;
    
    for (const port of ports) {
        totalChecks++;
        try {
            const result = await circuitBreakers[port].execute(async () => {
                return await axios.get(`http://localhost:${port}/health`, { 
                    timeout: 5000,
                    validateStatus: (status) => status < 500
                });
            });
            
            if (result.status === 200) {
                const data = result.data;
                console.log(`✅ ${services[port]} (${port}): ${data.status.toUpperCase()}`);
                console.log(`   📍 Node ID: ${data.node_id}`);
                console.log(`   🎯 Role: ${data.role}`);
                console.log(`   📊 Registered: ${data.registered ? 'YES' : 'NO'}`);
                
                healthyCount++;
            }
        } catch (error) {
            if (error.message.includes('circuit OPEN')) {
                console.log(`🚫 ${services[port]} (${port}): CIRCUIT OPEN`);
            } else {
                console.log(`❌ ${services[port]} (${port}): ${error.code || 'CONNECTION_FAILED'}`);
            }
        }
        console.log('');
    }
    
    const healthPercentage = (healthyCount / totalChecks) * 100;
    console.log('═'.repeat(60));
    console.log(`📊 Overall Health: ${healthPercentage.toFixed(0)}% (${healthyCount}/${totalChecks} services)`);
    console.log('═'.repeat(60));
    
    return {
        healthyCount,
        totalChecks,
        healthPercentage,
        timestamp: new Date().toISOString()
    };
}

// Main execution
if (require.main === module) {
    // Check if circuit breaker mode is enabled
    const useCircuitBreaker = process.argv.includes('--circuit-breaker');
    
    const checkFunction = useCircuitBreaker ? checkHealthWithCircuitBreakers : checkHealth;
    
    // Run health check
    checkFunction().then(result => {
        process.exit(result.healthPercentage === 100 ? 0 : 1);
    }).catch(error => {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
    });
    
    // Set up interval for continuous monitoring
    const interval = process.env.HEALTH_CHECK_INTERVAL || 30000; // 30 seconds default
    
    if (process.argv.includes('--continuous')) {
        console.log(`🔄 Starting continuous health monitoring (interval: ${interval}ms)`);
        setInterval(checkFunction, interval);
    }
}

module.exports = {
    checkHealth,
    checkHealthWithCircuitBreakers,
    CircuitBreaker
};
