# Heady Squash Merge System - Quick Start

## What It Does

The Heady Squash Merge System intelligently combines multiple codebases with weighted distribution into a single, functional Heady application. It automatically:

- **Analyzes** all source codebases (structure, dependencies, frameworks)
- **Identifies** conflicts between sources
- **Resolves** conflicts using weight-based prioritization
- **Invokes** HeadyAcademy agents for complex merges
- **Validates** the merged output
- **Generates** comprehensive reports and audit logs

## Quick Start

### Option 1: Interactive Mode (Recommended for First Use)

```powershell
cd c:\Users\erich\Heady
.\scripts\heady-merge.ps1 -Interactive
```

Follow the prompts to add your source codebases and specify weights.

### Option 2: Configuration File

1. **Create configuration** (or use the example):
```powershell
cp examples\merge-example-config.json my-merge-config.json
```

2. **Edit configuration** with your sources and weights:
```json
{
  "sources": [
    { "path": "./source1", "weight": 0.6, "name": "Primary" },
    { "path": "./source2", "weight": 0.4, "name": "Secondary" }
  ],
  "outputDir": "./merged-output"
}
```

3. **Execute merge**:
```powershell
.\scripts\heady-merge.ps1 -ConfigFile my-merge-config.json
```

### Option 3: Programmatic

```javascript
const HeadySquashMerge = require('./src/heady_squash_merge');

const merger = new HeadySquashMerge({
  outputDir: './merged-app'
});

merger.addSource('./source1', 0.6, { name: 'Primary' });
merger.addSource('./source2', 0.4, { name: 'Secondary' });

const result = await merger.execute();
console.log('Success:', result.success);
```

## Understanding Weights

Weights determine priority during conflicts:

- **0.6 (60%)** - Primary codebase, highest priority
- **0.3 (30%)** - Secondary features, medium priority  
- **0.1 (10%)** - Utilities/docs, lowest priority

Weights are automatically normalized to sum to 1.0.

## Example Scenarios

### Scenario 1: Merge Main Branch with Feature Branch
```json
{
  "sources": [
    { "path": "./main", "weight": 0.7, "name": "Main Branch" },
    { "path": "./feature", "weight": 0.3, "name": "New Features" }
  ]
}
```

### Scenario 2: Combine Multiple Heady Repositories
```json
{
  "sources": [
    { "path": "c:/Users/erich/Heady", "weight": 0.5 },
    { "path": "c:/Users/erich/Projects/HeadySystems", "weight": 0.3 },
    { "path": "c:/Users/erich/Projects/apps/hive", "weight": 0.2 }
  ]
}
```

### Scenario 3: Equal Merge (Let Importance Decide)
```json
{
  "sources": [
    { "path": "./codebase-a", "weight": 0.5 },
    { "path": "./codebase-b", "weight": 0.5 }
  ]
}
```

## Output

After merge completes, you'll find:

```
merged-output/
├── src/                    # Merged source code
├── config/                 # Merged configurations
├── public/                 # Merged static assets
├── package.json            # Merged dependencies
├── MERGE_REPORT.json       # Detailed merge report
└── README.md               # Generated README
```

Plus audit log at: `audit_logs/squash_merge.jsonl`

## Conflict Resolution

The system automatically resolves conflicts using:

1. **Highest Weight** - File from source with highest weight
2. **Highest Importance** - File with highest calculated importance score
3. **Merge Content** - Intelligently merge configuration files
4. **Agent Resolution** - HeadyAcademy agents for complex cases

### HeadyAcademy Agents Used

- **FOREMAN** - Consolidates complex code conflicts
- **JULES** - Optimizes merged code
- **MURPHY** - Validates security

## Validation

Every merge is validated for:

- ✅ **Syntax** - JSON, YAML, code files
- ✅ **Structure** - Required files and directories
- ✅ **Dependencies** - Valid package.json, requirements.txt
- ✅ **Security** - MURPHY agent audit

## Troubleshooting

### "Source path does not exist"
Verify all paths are absolute and accessible.

### "Merge validation failed"
Check `MERGE_REPORT.json` for specific errors.

### "Too many conflicts"
Adjust weights to give clearer priority.

## Full Documentation

For complete details, see:
- **Protocol Guide:** `docs/HEADY_SQUASH_MERGE_PROTOCOL.md`
- **Source Code:** `src/heady_squash_merge.js`
- **Example Config:** `examples/merge-example-config.json`

## Integration with Heady Systems

The merge system integrates with:

- **HeadyRegistry Router** - Intelligent request routing
- **HeadyAcademy Agents** - Conflict resolution and optimization
- **HeadyChain** - Audit logging and governance
- **HeadyManager** - MCP and orchestration services

## Next Steps

1. **Test with example config:**
   ```powershell
   .\scripts\heady-merge.ps1 -ConfigFile examples\merge-example-config.json -Analyze
   ```

2. **Review the protocol guide** for advanced features

3. **Create your own merge configuration** for your specific needs

4. **Execute your first merge** and review the results

## Support

For issues or questions:
- Check audit log: `audit_logs/squash_merge.jsonl`
- Review merge report: `MERGE_REPORT.json` in output directory
- See troubleshooting section in protocol guide
