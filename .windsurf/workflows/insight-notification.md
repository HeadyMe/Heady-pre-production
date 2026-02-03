---
description: Protocol for handling high-level architectural insights and notifying the system for evolution
---

# Insight Notification Protocol

## Purpose
Capture architectural insights and trigger system evolution when patterns converge.

## Trigger Conditions
1. **Deterministic Vitality Moment**: Logic + Visualization convergence
2. **Pattern Recognition**: New successful pattern detected
3. **Optimization Opportunity**: Better implementation discovered
4. **Architectural Evolution**: Major system design insight

## Steps

1. **Capture Insight**
   ```javascript
   const InsightCapture = require('./src/client/heady_reasoning_integrator');
   
   InsightCapture.recordInsight({
     type: 'architectural_evolution',
     description: 'Convergence of determinism and organic vitality',
     impact: 'high',
     components: ['HeadyConductor', 'SacredGeometry'],
     timestamp: new Date().toISOString()
   });
   ```

2. **Notify HeadyConductor**
   ```javascript
   const HeadyConductor = require('./src/heady-conductor');
   
   HeadyConductor.notifyInsight({
     insight: insightData,
     actionRequired: true,
     priority: 'high'
   });
   ```

3. **Pattern Analysis**
   ```javascript
   const PatternRecognizer = require('./src/client/heady_pattern_recognizer');
   
   const analysis = await PatternRecognizer.analyzeInsight(insightData);
   ```

4. **Create Evolution Task**
   ```javascript
   const TaskCollector = require('./src/task-collector');
   
   TaskCollector.createTask({
     type: 'system_evolution',
     insight: insightData,
     analysis: analysis,
     priority: 'critical'
   });
   ```

5. **Update Registry**
   ```javascript
   // Add to HeadyRegistry concept registry
   const Registry = require('./src/heady-registry');
   Registry.registerConcept(insightData);
   ```

6. **Checkpoint Creation**
   ```powershell
   # Create checkpoint before evolution
   hs -Checkpoint -Message "Pre-evolution: ${insightData.description}"
   ```

## Integration Points
- HeadyPatternRecognizer: Monitors for patterns
- HeadyConductor: Receives notifications
- HeadyRegistry: Stores concepts
- Checkpoint System: Versions changes
