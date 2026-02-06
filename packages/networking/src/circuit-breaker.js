// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
// ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
// ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
// ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
// ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
// ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
// ║                                                                  ║
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
// ║  FILE: packages/networking/src/circuit-breaker.js                 ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Circuit Breaker implementation.
 *
 * States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing) → CLOSED
 *
 * Public-domain pattern (Nygard, Netflix Hystrix).
 * Stop calling failing services after threshold; periodically test recovery.
 */

const STATES = {
  CLOSED: "CLOSED",
  OPEN: "OPEN",
  HALF_OPEN: "HALF_OPEN",
};

class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || "default";
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;
    this.halfOpenMaxRequests = options.halfOpenMaxRequests || 2;

    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenAttempts = 0;
    this.lastFailureTime = null;
    this.lastStateChange = Date.now();

    this._listeners = { stateChange: [] };
  }

  /**
   * Execute a function through the circuit breaker.
   * @param {Function} fn - Async function to execute
   * @returns {Promise} Result of fn()
   */
  async execute(fn) {
    if (this.state === STATES.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
        this._transition(STATES.HALF_OPEN);
      } else {
        throw new CircuitBreakerOpenError(
          `Circuit breaker [${this.name}] is OPEN. Retry after ${this.resetTimeoutMs}ms.`
        );
      }
    }

    if (this.state === STATES.HALF_OPEN && this.halfOpenAttempts >= this.halfOpenMaxRequests) {
      throw new CircuitBreakerOpenError(
        `Circuit breaker [${this.name}] is HALF_OPEN and at max test requests.`
      );
    }

    try {
      if (this.state === STATES.HALF_OPEN) {
        this.halfOpenAttempts++;
      }
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure();
      throw error;
    }
  }

  _onSuccess() {
    this.failureCount = 0;
    if (this.state === STATES.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenMaxRequests) {
        this._transition(STATES.CLOSED);
      }
    }
  }

  _onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.state === STATES.HALF_OPEN) {
      this._transition(STATES.OPEN);
    } else if (this.failureCount >= this.failureThreshold) {
      this._transition(STATES.OPEN);
    }
  }

  _transition(newState) {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = Date.now();

    if (newState === STATES.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
      this.halfOpenAttempts = 0;
    } else if (newState === STATES.HALF_OPEN) {
      this.halfOpenAttempts = 0;
      this.successCount = 0;
    }

    this._emit("stateChange", { name: this.name, from: oldState, to: newState });
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
    };
  }

  reset() {
    this._transition(STATES.CLOSED);
  }

  on(event, listener) {
    if (this._listeners[event]) {
      this._listeners[event].push(listener);
    }
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach((fn) => fn(data));
  }
}

class CircuitBreakerOpenError extends Error {
  constructor(message) {
    super(message);
    this.name = "CircuitBreakerOpenError";
    this.isCircuitBreakerOpen = true;
  }
}

module.exports = { CircuitBreaker, CircuitBreakerOpenError, STATES };
