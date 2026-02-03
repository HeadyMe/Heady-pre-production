---
description: Research successful implementations before building any new feature or system
---

# Research Before Build Workflow

## Purpose
Perform comprehensive research on successful implementations before building new features.

## Usage

### Research Phase
```bash
# Start research for new feature
node scripts/research.js --feature "new-feature" --depth comprehensive

# Generate research report
node scripts/research.js --feature "x" --output report.json

# Find similar implementations
node scripts/research.js --search "pattern matching"
```

### Programmatic Usage
```javascript
const ResearchEngine = require('./src/research_engine');

const research = new ResearchEngine({
  query: 'microservices pattern',
  sources: ['github', 'stackoverflow', 'docs'],
  maxResults: 50
});

const results = await research.execute();
const report = research.generateReport(results);
```

## Research Steps
1. **Define Scope**: Identify research objectives and constraints
2. **Gather Data**: Search repositories, documentation, and forums
3. **Analyze Patterns**: Identify successful implementation patterns
4. **Compare Options**: Evaluate alternatives against criteria
5. **Document Findings**: Create comprehensive research report

## Output
- Pattern analysis and recommendations
- Code snippets and examples
- Performance benchmarks
- Risk assessment
