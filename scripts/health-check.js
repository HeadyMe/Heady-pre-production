#!/usr/bin/env node
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Health Check Service — System Monitoring     ║
// ╚══════════════════════════════════════════════════════════════════╝

const axios = require('axios');

const HEADY_SERVICES = [
    { name: 'HeadySystems', url: 'https://headysystems.com/api/health' },
    { name: 'HeadyCloud', url: 'https://headycloud.com/api/health' },
    { name: 'HeadyConnection', url: 'https://headyconnection.com/api/health' },
    { name: 'HeadyCheck', url: 'https://headycheck.com/api/health' }
];

async function checkHealth() {
    console.log(`\n🔍 Heady Systems Health Check - ${new Date().toISOString()}`);
    console.log('═'.repeat(60));

    let healthyCount = 0;
    let totalChecks = 0;

    for (const svc of HEADY_SERVICES) {
        totalChecks++;
        try {
            const response = await axios.get(svc.url, {
                timeout: 10000,
                validateStatus: (status) => status < 500
            });

            if (response.status === 200) {
                const data = response.data;
                console.log(`✅ ${svc.name}: ${data.ok ? 'HEALTHY' : 'DEGRADED'}`);
                console.log(`   📍 Service: ${data.service || svc.name}`);
                console.log(`   🎯 Version: ${data.version || 'unknown'}`);
                if (data.monteCarlo) {
                    console.log(`   � Monte Carlo: ${data.monteCarlo.grade} (${data.monteCarlo.compositeScore?.toFixed(1)})`);
                }
                healthyCount++;
            } else {
                console.log(`⚠️  ${svc.name}: HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${svc.name}: ${error.code || 'CONNECTION_FAILED'}`);
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
for (const svc of HEADY_SERVICES) {
    circuitBreakers[svc.name] = new CircuitBreaker(svc.name);
}

// Enhanced health check with circuit breakers
async function checkHealthWithCircuitBreakers() {
    console.log(`\n🔍 Heady Systems Health Check (with Circuit Breakers) - ${new Date().toISOString()}`);
    console.log('═'.repeat(60));

    let healthyCount = 0;
    let totalChecks = 0;

    for (const svc of HEADY_SERVICES) {
        totalChecks++;
        try {
            const result = await circuitBreakers[svc.name].execute(async () => {
                return await axios.get(svc.url, {
                    timeout: 10000,
                    validateStatus: (status) => status < 500
                });
            });

            if (result.status === 200) {
                const data = result.data;
                console.log(`✅ ${svc.name}: ${data.ok ? 'HEALTHY' : 'DEGRADED'}`);
                console.log(`   📍 Service: ${data.service || svc.name}`);
                console.log(`   🎯 Version: ${data.version || 'unknown'}`);

                healthyCount++;
            }
        } catch (error) {
            if (error.message.includes('circuit OPEN')) {
                console.log(`🚫 ${svc.name}: CIRCUIT OPEN`);
            } else {
                console.log(`❌ ${svc.name}: ${error.code || 'CONNECTION_FAILED'}`);
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
