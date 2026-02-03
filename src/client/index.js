import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// Enable hot module replacement for development
if (module.hot) {
  module.hot.accept('./App', () => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
}

// Report web vitals for performance monitoring
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(err => {
      console.warn('[Web Vitals] Failed to load metrics:', err.message);
    });
  }
};

// Enhanced performance logging with timestamps
const logPerformance = (metric) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [Web Vitals] ${metric.name}:`, {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id
  });
};

reportWebVitals(logPerformance);

// Global error boundary for unhandled errors
window.addEventListener('error', (event) => {
  console.error('[Global Error]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', {
    reason: event.reason,
    timestamp: new Date().toISOString()
  });
});
// Beneficial performance and error tracking enhancements
const trackPerformanceMetrics = () => {
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive,
        domComplete: navigation.domComplete,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime || 0,
        timestamp: new Date().toISOString()
      };
      console.log('[Performance Metrics]', metrics);
      
      // Alert if critical metrics exceed thresholds
      if (metrics.ttfb > 1000) console.warn('[Performance] High TTFB:', metrics.ttfb);
      if (metrics.totalLoadTime > 3000) console.warn('[Performance] Slow page load:', metrics.totalLoadTime);
      if (metrics.firstContentfulPaint > 2500) console.warn('[Performance] Slow FCP:', metrics.firstContentfulPaint);
      
      // Store metrics for HeadyEnforcer integration
      window.__headyPerformanceMetrics = metrics;
    }
  }
};

// Track resource loading performance
const trackResourceTiming = () => {
  if ('performance' in window) {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(r => r.duration > 1000);
    const largeResources = resources.filter(r => r.transferSize > 1000000); // > 1MB
    const failedResources = resources.filter(r => r.responseStatus >= 400);
    
    if (slowResources.length > 0) {
      console.warn('[Slow Resources]', slowResources.map(r => ({
        name: r.name,
        duration: r.duration,
        type: r.initiatorType,
        size: r.transferSize
      })));
    }
    
    if (largeResources.length > 0) {
      console.warn('[Large Resources]', largeResources.map(r => ({
        name: r.name,
        size: (r.transferSize / 1024 / 1024).toFixed(2) + 'MB',
        type: r.initiatorType
      })));
    }

    if (failedResources.length > 0) {
      console.error('[Failed Resources]', failedResources.map(r => ({
        name: r.name,
        status: r.responseStatus,
        type: r.initiatorType
      })));
    }

    // Store resource summary for observability
    window.__headyResourceMetrics = {
      total: resources.length,
      slow: slowResources.length,
      large: largeResources.length,
      failed: failedResources.length,
      totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
    };
  }
};

// Enhanced error context capture
const captureErrorContext = (error) => {
  return {
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    memory: performance.memory ? {
      used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
      total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
      limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB',
      usagePercent: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
    } : null,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    } : null,
    deviceMemory: navigator.deviceMemory || null,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    online: navigator.onLine
  };
};

// Track long tasks that block the main thread
const trackLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('[Long Task]', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
            attribution: entry.attribution?.[0]?.name || 'unknown'
          });
          
          // Track for HeadyEnforcer performance violations
          if (entry.duration > 500) {
            window.__headyLongTasks = window.__headyLongTasks || [];
            window.__headyLongTasks.push({
              duration: entry.duration,
              timestamp: new Date().toISOString()
            });
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
      console.debug('[Long Task Observer] Not supported in this browser');
    }
  }
};

// Track layout shifts for visual stability
const trackLayoutShifts = () => {
  if ('PerformanceObserver' in window) {
    try {
      let clsScore = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            if (entry.value > 0.1) {
              console.warn('[Layout Shift]', {
                value: entry.value,
                sources: entry.sources?.map(s => s.node) || [],
                cumulativeScore: clsScore
              });
            }
          }
        }
        window.__headyCLS = clsScore;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.debug('[Layout Shift Observer] Not supported in this browser');
    }
  }
};

// Execute tracking on load
window.addEventListener('load', () => {
  setTimeout(() => {
    trackPerformanceMetrics();
    trackResourceTiming();
    trackLongTasks();
    trackLayoutShifts();
    
    // Emit performance data for HeadyMaid integration
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('heady-performance-ready', {
        detail: {
          metrics: window.__headyPerformanceMetrics,
          resources: window.__headyResourceMetrics,
          cls: window.__headyCLS
        }
      }));
    }
  }, 0);
});

// Enhanced global error handler with context
window.addEventListener('error', (event) => {
  const errorData = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    context: captureErrorContext(event.error),
    timestamp: new Date().toISOString()
  };
  
  console.error('[Global Error]', errorData);
  
  // Store for HeadyEnforcer security enforcement
  window.__headyErrors = window.__headyErrors || [];
  window.__headyErrors.push(errorData);
});

// Enhanced unhandled rejection handler with context
window.addEventListener('unhandledrejection', (event) => {
  const rejectionData = {
    reason: event.reason,
    stack: event.reason?.stack,
    promise: event.promise,
    context: captureErrorContext(event.reason),
    timestamp: new Date().toISOString()
  };
  
  console.error('[Unhandled Promise Rejection]', rejectionData);
  
  // Store for HeadyEnforcer security enforcement
  window.__headyRejections = window.__headyRejections || [];
  window.__headyRejections.push(rejectionData);
});
// Capture detailed error context for debugging
const captureErrorContext = (error) => {
  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    },
    memory: performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
      usagePercent: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2)
    } : null,
    timing: performance.timing ? {
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      ttfb: performance.timing.responseStart - performance.timing.requestStart
    } : null,
    errorType: error?.constructor?.name || typeof error,
    localStorage: (() => {
      try {
        return {
          itemCount: Object.keys(localStorage).length,
          estimatedSize: new Blob(Object.values(localStorage)).size
        };
      } catch (e) {
        return 'unavailable';
      }
    })(),
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    } : null,
    online: navigator.onLine,
    timestamp: new Date().toISOString()
  };
};

// Monitor memory usage and trigger warnings with leak detection
const monitorMemoryUsage = () => {
  if (performance.memory) {
    const memoryThreshold = 0.9; // 90% of heap limit
    const usageRatio = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
    
    // Track memory trend for leak detection
    window.__headyMemoryHistory = window.__headyMemoryHistory || [];
    window.__headyMemoryHistory.push({
      used: performance.memory.usedJSHeapSize,
      timestamp: Date.now()
    });
    
    // Keep only last 10 samples
    if (window.__headyMemoryHistory.length > 10) {
      window.__headyMemoryHistory.shift();
    }
    
    // Detect memory leak (consistent growth over 5 samples)
    if (window.__headyMemoryHistory.length >= 5) {
      const samples = window.__headyMemoryHistory.slice(-5);
      const isGrowing = samples.every((sample, i) => 
        i === 0 || sample.used > samples[i - 1].used
      );
      
      if (isGrowing) {
        const growthRate = (samples[4].used - samples[0].used) / samples[0].used;
        if (growthRate > 0.1) { // 10% growth
          console.warn('[Memory Leak Detected]', {
            growthPercent: (growthRate * 100).toFixed(2),
            samples: samples.length,
            timespan: `${((samples[4].timestamp - samples[0].timestamp) / 1000).toFixed(0)}s`
          });
        }
      }
    }
    
    if (usageRatio > memoryThreshold) {
      console.warn('[Memory Warning]', {
        usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
        limitMB: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
        usagePercent: (usageRatio * 100).toFixed(2),
        recommendation: 'Consider clearing caches or reducing data structures'
      });
      
      // Emit event for HeadyEnforcer intervention
      window.dispatchEvent(new CustomEvent('heady-memory-critical', {
        detail: { usageRatio, usedMB: performance.memory.usedJSHeapSize / 1024 / 1024 }
      }));
    }
  }
};

// Check memory every 30 seconds
setInterval(monitorMemoryUsage, 30000);

// Track user interactions for performance correlation
const trackUserInteractions = () => {
  ['click', 'scroll', 'keypress', 'touchstart', 'input'].forEach(eventType => {
    let interactionCount = 0;
    let lastInteraction = 0;
    
    window.addEventListener(eventType, () => {
      interactionCount++;
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteraction;
      
      window.__headyInteractions = window.__headyInteractions || {};
      window.__headyInteractions[eventType] = {
        count: interactionCount,
        lastTimestamp: now,
        avgInterval: timeSinceLastInteraction > 0 ? timeSinceLastInteraction : null
      };
      
      lastInteraction = now;
      
      // Detect rage clicks (5+ clicks in 2 seconds)
      if (eventType === 'click') {
        window.__headyRecentClicks = window.__headyRecentClicks || [];
        window.__headyRecentClicks.push(now);
        window.__headyRecentClicks = window.__headyRecentClicks.filter(t => now - t < 2000);
        
        if (window.__headyRecentClicks.length >= 5) {
          console.warn('[Rage Click Detected]', {
            clicks: window.__headyRecentClicks.length,
            duration: '2s',
            possibleIssue: 'UI element may be unresponsive'
          });
        }
      }
    }, { passive: true });
  });
};

trackUserInteractions();

// Visibility change tracking for performance context
document.addEventListener('visibilitychange', () => {
  const now = Date.now();
  window.__headyVisibilityHistory = window.__headyVisibilityHistory || [];
  
  const event = {
    hidden: document.hidden,
    timestamp: new Date().toISOString(),
    timestampMs: now
  };
  
  window.__headyVisibilityHistory.push(event);
  
  // Calculate time spent on page
  const visibleTime = window.__headyVisibilityHistory
    .reduce((total, evt, i, arr) => {
      if (i === 0) return 0;
      const prev = arr[i - 1];
      return total + (prev.hidden ? 0 : evt.timestampMs - prev.timestampMs);
    }, 0);
  
  console.log('[Visibility]', {
    ...event,
    totalVisibleTime: `${(visibleTime / 1000).toFixed(0)}s`,
    action: document.hidden ? 'tab_hidden' : 'tab_visible'
  });
  
  // Pause non-critical operations when hidden
  if (document.hidden) {
    window.dispatchEvent(new CustomEvent('heady-tab-hidden'));
  } else {
    window.dispatchEvent(new CustomEvent('heady-tab-visible'));
  }
});

// Network status monitoring
window.addEventListener('online', () => {
  console.log('[Network] Connection restored', {
    timestamp: new Date().toISOString(),
    effectiveType: navigator.connection?.effectiveType
  });
  window.dispatchEvent(new CustomEvent('heady-network-restored'));
});

window.addEventListener('offline', () => {
  console.warn('[Network] Connection lost', {
    timestamp: new Date().toISOString()
  });
  window.dispatchEvent(new CustomEvent('heady-network-lost'));
});
