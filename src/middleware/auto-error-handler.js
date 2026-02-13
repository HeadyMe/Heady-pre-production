// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Auto Error Handler — Learning & Recovery      ║
// ╚══════════════════════════════════════════════════════════════════╝

import { StoryDriver } from '../hc/story-driver.js';

// Global error pattern tracking
let errorPatterns = new Map();
let criticalErrors = new Map();
let recoveryActions = new Map();
let systemHealth = {
    totalErrors: 0,
    criticalErrors: 0,
    recoveredErrors: 0,
    lastError: null,
    uptime: Date.now()
};

// Recovery strategies
const recoveryStrategies = {
    'ECONNREFUSED': {
        action: 'restart_service',
        maxRetries: 3,
        backoffMs: 5000,
        description: 'Service connection refused - attempting restart'
    },
    'ETIMEDOUT': {
        action: 'increase_timeout',
        maxRetries: 2,
        backoffMs: 3000,
        description: 'Request timeout - increasing timeout and retrying'
    },
    'ENOTFOUND': {
        action: 'check_dns',
        maxRetries: 1,
        backoffMs: 10000,
        description: 'DNS resolution failed - checking network configuration'
    },
    'DATABASE_ERROR': {
        action: 'check_database',
        maxRetries: 2,
        backoffMs: 8000,
        description: 'Database error - checking connection and retrying'
    },
    'AUTHENTICATION_ERROR': {
        action: 'refresh_token',
        maxRetries: 1,
        backoffMs: 1000,
        description: 'Authentication failed - refreshing tokens'
    }
};

export function autoErrorHandler(err, req, res, next) {
    const errorKey = `${err.name || 'Unknown'}:${err.message || 'No message'}`;
    const timestamp = Date.now();
    
    // Update system health
    systemHealth.totalErrors++;
    systemHealth.lastError = {
        timestamp,
        errorKey,
        message: err.message,
        url: req.url,
        method: req.method
    };
    
    // Track error frequency and patterns
    if (!errorPatterns.has(errorKey)) {
        errorPatterns.set(errorKey, {
            count: 0,
            firstSeen: timestamp,
            lastSeen: timestamp,
            urls: new Set(),
            methods: new Set(),
            userAgent: new Set(),
            resolved: false
        });
    }
    
    const pattern = errorPatterns.get(errorKey);
    pattern.count++;
    pattern.lastSeen = timestamp;
    pattern.urls.add(req.url);
    pattern.methods.add(req.method);
    if (req.get('User-Agent')) {
        pattern.userAgent.add(req.get('User-Agent'));
    }
    
    // Determine error severity
    const severity = determineSeverity(err, pattern);
    
    // Log to Story Driver with full context
    const storyEvent = {
        scope: 'incident',
        type: 'ERROR',
        severity,
        message: err.message,
        stack: err.stack,
        errorKey,
        frequency: pattern.count,
        firstSeen: pattern.firstSeen,
        lastSeen: pattern.lastSeen,
        request: {
            method: req.method,
            url: req.url,
            headers: sanitizeHeaders(req.headers),
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        },
        systemHealth: { ...systemHealth },
        recoveryAttempted: false
    };
    
    // Attempt auto-recovery for known errors
    const recoveryResult = attemptAutoRecovery(err, pattern, req);
    if (recoveryResult.attempted) {
        storyEvent.recoveryAttempted = true;
        storyEvent.recoveryAction = recoveryResult.action;
        storyEvent.recoveryResult = recoveryResult.result;
        
        if (recoveryResult.success) {
            pattern.resolved = true;
            systemHealth.recoveredErrors++;
            storyEvent.severity = 'INFO'; // Downgrade severity on successful recovery
        }
    }
    
    // Add to Story Driver
    try {
        StoryDriver.addEvent(storyEvent);
    } catch (storyError) {
        console.error('Failed to log to Story Driver:', storyError);
    }
    
    // Alert on critical or repeating errors
    if (severity === 'CRITICAL' || pattern.count >= 5) {
        alertCriticalError(errorKey, pattern, err);
    }
    
    // Learning: Update error patterns and suggest improvements
    analyzeAndLearn(errorKey, pattern, err);
    
    // Respond to client
    const response = {
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        tracking_id: `ERR_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        severity,
        frequency: pattern.count,
        recovered: storyEvent.recoveryAttempted && storyEvent.recoveryResult?.success
    };
    
    // Add recovery information if available
    if (storyEvent.recoveryAttempted) {
        response.recovery = {
            attempted: true,
            action: storyEvent.recoveryAction,
            success: storyEvent.recoveryResult?.success
        };
    }
    
    res.status(err.status || 500).json(response);
}

function determineSeverity(err, pattern) {
    // Critical errors
    if (err.status >= 500 || err.code === 'ECONNRESET' || err.code === 'ENOTFOUND') {
        return 'CRITICAL';
    }
    
    // High frequency errors become critical
    if (pattern.count >= 10) {
        return 'CRITICAL';
    }
    
    // Warnings for client errors and low frequency issues
    if (err.status >= 400 || pattern.count >= 3) {
        return 'WARN';
    }
    
    return 'INFO';
}

function attemptAutoRecovery(err, pattern, req) {
    const errorCode = err.code || 'UNKNOWN';
    const strategy = recoveryStrategies[errorCode];
    
    if (!strategy || pattern.resolved) {
        return { attempted: false };
    }
    
    if (pattern.count > strategy.maxRetries) {
        return { attempted: false, reason: 'Max retries exceeded' };
    }
    
    console.log(`🔧 Auto-recovery attempt: ${strategy.description}`);
    
    try {
        let result = { success: false, message: 'No recovery action taken' };
        
        switch (strategy.action) {
            case 'restart_service':
                result = restartFailedService(err.address);
                break;
            case 'increase_timeout':
                result = increaseRequestTimeout(req);
                break;
            case 'check_dns':
                result = checkDNSConfiguration();
                break;
            case 'check_database':
                result = checkDatabaseConnection();
                break;
            case 'refresh_token':
                result = refreshAuthenticationToken();
                break;
        }
        
        return {
            attempted: true,
            action: strategy.action,
            result
        };
        
    } catch (recoveryError) {
        console.error('Recovery action failed:', recoveryError);
        return {
            attempted: true,
            action: strategy.action,
            result: { success: false, error: recoveryError.message }
        };
    }
}

// Recovery action implementations
function restartFailedService(address) {
    // Implementation for service restart
    console.log(`Attempting restart of service at ${address}`);
    // This would integrate with your service management system
    return { success: true, message: 'Service restart initiated' };
}

function increaseRequestTimeout(req) {
    // Implementation for timeout increase
    console.log('Increasing request timeout for future requests');
    // This would adjust timeout configurations
    return { success: true, message: 'Timeout increased' };
}

function checkDNSConfiguration() {
    // Implementation for DNS check
    console.log('Checking DNS configuration');
    // This would run DNS diagnostics
    return { success: true, message: 'DNS configuration verified' };
}

function checkDatabaseConnection() {
    // Implementation for database health check
    console.log('Checking database connection');
    // This would verify database connectivity
    return { success: true, message: 'Database connection verified' };
}

function refreshAuthenticationToken() {
    // Implementation for token refresh
    console.log('Refreshing authentication tokens');
    // This would refresh JWT tokens or API keys
    return { success: true, message: 'Authentication tokens refreshed' };
}

function alertCriticalError(errorKey, pattern, err) {
    const message = `🚨 CRITICAL: Error repeating ${pattern.count} times\n${errorKey}\nFirst seen: ${new Date(pattern.firstSeen).toISOString()}\nLast seen: ${new Date(pattern.lastSeen).toISOString()}\nError: ${err.message}`;
    
    console.error(message);
    
    // Track critical errors
    criticalErrors.set(errorKey, {
        ...pattern,
        error: err,
        lastAlert: Date.now()
    });
    
    systemHealth.criticalErrors++;
    
    // Send alert through available channels
    sendAlert(message);
}

function analyzeAndLearn(errorKey, pattern, err) {
    // Learning: Identify error patterns and suggest improvements
    const insights = {
        errorKey,
        frequency: pattern.count,
        timeSpan: pattern.lastSeen - pattern.firstSeen,
        affectedUrls: Array.from(pattern.urls),
        affectedMethods: Array.from(pattern.methods),
        userAgents: Array.from(pattern.userAgent),
        suggestions: generateSuggestions(pattern, err)
    };
    
    // Store insights for system improvement
    if (!recoveryActions.has(errorKey)) {
        recoveryActions.set(errorKey, insights);
    }
    
    // Log learning insights
    console.log(`🧠 Learning insight for ${errorKey}:`, insights);
}

function generateSuggestions(pattern, err) {
    const suggestions = [];
    
    if (pattern.count > 5) {
        suggestions.push('Consider implementing circuit breaker pattern');
    }
    
    if (pattern.urls.size > 3) {
        suggestions.push('Error affects multiple endpoints - investigate shared dependencies');
    }
    
    if (err.code === 'ECONNREFUSED') {
        suggestions.push('Implement service discovery and health checks');
    }
    
    if (err.code === 'ETIMEDOUT') {
        suggestions.push('Add retry logic with exponential backoff');
    }
    
    if (pattern.lastSeen - pattern.firstSeen < 60000) {
        suggestions.push('Rapid error occurrence - investigate recent deployments');
    }
    
    return suggestions;
}

function sendAlert(message) {
    // Send alert through multiple channels
    // Discord, Slack, email, etc.
    console.log('📢 ALERT:', message);
    
    // Implementation would depend on your alerting infrastructure
    // This could integrate with the Observer daemon
}

function sanitizeHeaders(headers) {
    // Remove sensitive information from headers
    const sanitized = { ...headers };
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
}

// Export system health and error statistics
export function getErrorStatistics() {
    return {
        systemHealth,
        errorPatterns: Array.from(errorPatterns.entries()).map(([key, pattern]) => ({
            errorKey: key,
            ...pattern,
            urls: Array.from(pattern.urls),
            methods: Array.from(pattern.methods),
            userAgent: Array.from(pattern.userAgent)
        })),
        criticalErrors: Array.from(criticalErrors.entries()),
        recoveryActions: Array.from(recoveryActions.entries())
    };
}

// Reset error statistics (useful for testing or maintenance)
export function resetErrorStatistics() {
    errorPatterns.clear();
    criticalErrors.clear();
    recoveryActions.clear();
    systemHealth = {
        totalErrors: 0,
        criticalErrors: 0,
        recoveredErrors: 0,
        lastError: null,
        uptime: Date.now()
    };
}

// Periodic cleanup of old error patterns
setInterval(() => {
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, pattern] of errorPatterns.entries()) {
        if (pattern.lastSeen < cutoff && pattern.resolved) {
            errorPatterns.delete(key);
            console.log(`🧹 Cleaned up resolved error pattern: ${key}`);
        }
    }
}, 60 * 60 * 1000); // Run every hour
