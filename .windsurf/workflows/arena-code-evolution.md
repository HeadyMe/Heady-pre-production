---
description: Evolve code using competitive Arena Mode
---

# Arena Code Evolution

## Purpose
Use competitive Arena Mode to evolve code implementations through multiple competing solutions.

## Steps

1. **Define Evolution Goal**
   - Specify the code/feature to evolve
   - Set success criteria and metrics
   - Define constraints and requirements

2. **Initialize Arena**
   ```powershell
   # Start Arena Manager
   node packages/task-manager/src/core/arena-manager.js
   ```

3. **Create Competing Solutions**
   - Generate 3-5 alternative implementations
   - Each solution in separate branch/workspace
   - Apply different optimization strategies

4. **Run Competition**
   ```javascript
   const arena = new ArenaManager();
   await arena.compete({
     solutions: ['solution-a', 'solution-b', 'solution-c'],
     metrics: ['performance', 'readability', 'maintainability'],
     rounds: 3
   });
   ```

5. **Evaluate Results**
   - Compare performance metrics
   - Analyze code quality scores
   - Review test coverage

6. **Merge Winner**
   ```powershell
   # Merge winning solution
   hs -Merge -Branch arena-winner
   ```

7. **Document Evolution**
   - Record metrics and decision rationale
   - Update documentation
   - Create checkpoint

## Best Practices
- Use isolated environments for each solution
- Apply consistent testing across all competitors
- Consider multiple quality dimensions
- Keep evolution cycles short (< 2 hours)
