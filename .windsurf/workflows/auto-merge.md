---
description: Intelligent code merging using the Auto-Merge tool
---

# Auto-Merge Workflow

## Purpose
Automatically merge code changes across repositories using intelligent conflict resolution.

## Steps

1. **Pre-Merge Validation**
   ```powershell
   node scripts/validate-merge-readiness.js
   ```
   - Check all repositories are clean
   - Verify no uncommitted changes
   - Validate branch states

2. **Execute Auto-Merge**
   ```powershell
   node scripts/auto-merge.js --source <branch> --target <branch>
   ```

3. **Conflict Detection**
   - Scan for merge conflicts
   - Classify conflicts (trivial, complex, critical)
   - Route to appropriate resolver

4. **Intelligent Resolution**
   - Trivial: Auto-resolve using patterns
   - Complex: Use HeadyBrain for analysis
   - Critical: Flag for manual review

5. **Validation**
   - Run test suites
   - Verify build success
   - Check governance compliance

6. **Commit & Push**
   - Generate merge commit with metadata
   - Update audit logs
   - Push to all remotes

## Integration Points
- **HeadyBrain**: Conflict resolution intelligence
- **Governance**: Merge approval workflow
- **SquashMerge**: Clean history maintenance
