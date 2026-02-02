/**
 * Heady System Constants
 * Centralized configuration values for MCP services
 */

module.exports = {
  PORTS: {
    GRAPH_SERVER: 3301,
    METRICS_SERVER: 3302,
    WORKFLOW_SERVER: 3303,
    ORCHESTRATOR: 3304
  },

  STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },

  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  METRICS: {
    MAX_SAMPLES: 1000,
    COLLECTION_INTERVAL: 1000,
    WAVE_FREQUENCY: 0.001,
    FRACTAL_DEPTH: 5
  }
};
