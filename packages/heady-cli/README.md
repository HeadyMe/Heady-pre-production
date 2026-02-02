# @heady/cli

Production-grade CLI for Heady Systems with service combination generation and wisdom monitoring.

## Features

- **Service Combination Generator**: Generate all beneficial MCP/AI service combinations with intelligent scoring
- **Wisdom Monitor**: Real-time monitoring of wisdom.json with change detection and diff display
- **Unified Interface**: All hb, hc, and bin scripts in one cohesive CLI
- **Global Installation**: Install once, use anywhere
- **Interactive Mode**: Guided CLI experience

## Installation

```bash
cd packages/heady-cli
npm install
npm link
```

## Commands

### Service Combinations

Generate and analyze all possible service combinations:

```bash
# Generate top 100 combinations (default)
heady combinations

# Generate with custom limit
heady combinations --max 50

# Save to file
heady combinations --output combos.json --format json

# Filter by pattern
heady combinations --filter "research"
```

### Wisdom Monitoring

Monitor wisdom.json for changes:

```bash
# Watch for changes in real-time
heady wisdom --watch

# Show diffs when changes detected
heady wisdom --watch --diff

# Send notifications to orchestrator
heady wisdom --watch --notify

# One-time check
heady wisdom
```

### Task Management

```bash
# Submit task to swarm
heady task "Deploy security module"

# With priority
heady task "Critical fix" --priority HIGH

# With specific services
heady task "Build feature" --services "git,filesystem,sequential-thinking"

# With all services enabled
heady task "Complex analysis" --all
```

### Execute with All Tools

```bash
# Execute with all beneficial tools
heady exec "Research AI security best practices"
heady hc "Analyze system performance"

# Execute custom script
heady exec --action auto-merge.js
```

### Build System

```bash
# Full build
heady build

# Specific phase
heady build --phase infrastructure

# Dry run
heady build --dry-run --verbose

# Parallel build
heady build --parallel --scenario microservices_mesh
```

### Monitoring

```bash
# Monitor governance logs
heady monitor

# Follow log stream
heady monitor --follow

# Show specific number of lines
heady monitor --lines 100

# Filter by event type
heady monitor --filter SECURITY
```

### Admin Operations

```bash
# Generate API key
heady admin --generate-key

# Open admin UI
heady admin --open

# Start in dev mode
heady admin --dev
```

### Secrets Management

```bash
# List secrets (masked)
heady secrets --list

# Validate environment
heady secrets --validate

# Generate new API key
heady secrets --generate
```

### System Status

```bash
# Show service status
heady status

# Show all services
heady status --all

# JSON output
heady status --json
```

### Swarm Management

```bash
# Start swarm
heady swarm up

# Stop swarm
heady swarm down

# View logs
heady swarm logs

# Restart swarm
heady swarm restart

# Rebuild containers
heady swarm up --build
```

### Q&A Operations

```bash
# List pending questions
heady qa list

# List answered questions
heady qa list ANSWERED

# Ask question
heady qa ask "What is the deployment strategy?"

# Ask question for specific task
heady qa ask --task TASK-123 "Should we use caching?"

# Answer question
heady qa answer Q-456 "Yes, implement Redis caching"
```

### Sync Operations

```bash
# Sync repositories
heady sync --repos

# Sync state files
heady sync --state

# Sync everything
heady sync --all
```

### Service Discovery

```bash
# Discover available services
heady discover

# Refresh service cache
heady discover --refresh

# Test service connectivity
heady discover --test
```

### Interactive Mode

```bash
# Start interactive CLI
heady interactive
heady i
```

## Service Combinations

The CLI can generate combinations from:

### MCP Services (17)
- filesystem
- git
- github-mcp-server
- sequential-thinking
- postgresql
- memory
- mcp-playwright
- puppeteer
- figma-remote-mcp-server
- snyk
- terraform
- cloudflare-docs
- deepwiki
- exa
- prisma-mcp-server
- stripe
- google-maps

### AI Services (5)
- perplexity-ask
- google_mcp (Gemini)
- huggingface
- jules_mcp
- yandex

### Combination Scoring

Combinations are scored based on:
- **Base score**: 10 points per service
- **AI bonus**: +20 points per AI service
- **Essential bonus**: +15 points for filesystem, git, sequential-thinking
- **Complementary pairs**:
  - perplexity-ask + deepwiki: +25
  - mcp-playwright + puppeteer: +20
  - github-mcp-server + git: +30
- **Redundancy penalty**: -10 for overlapping tools

### Use Case Categories

- **research**: perplexity-ask, deepwiki, exa
- **security**: snyk, terraform
- **ai**: All AI services
- **testing**: mcp-playwright, puppeteer
- **development**: git, github-mcp-server
- **data**: postgresql, memory

## Wisdom Monitoring

Monitors `data/memory/wisdom.json` for:

- **Added patterns**: New wisdom entries
- **Removed patterns**: Deleted entries
- **Modified patterns**: Changed triggers or strategies
- **Real-time notifications**: Optional orchestrator integration

### Change Detection

The monitor detects:
1. Pattern additions (new pattern_id)
2. Pattern removals (missing pattern_id)
3. Pattern modifications (changed content)

### Diff Display

When `--diff` is enabled, shows:
- Old strategy vs new strategy
- Trigger changes
- Full pattern details

## Environment Variables

- `HEADY_API_KEY`: API key for orchestrator
- `HEADY_WISDOM_PATH`: Custom path to wisdom.json
- `HEADY_ORCHESTRATOR_URL`: Orchestrator base URL

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Make bin executable
npm run prepare
```

## Architecture

```
heady-cli/
├── bin/
│   └── heady.js          # CLI entry point
├── lib/
│   └── index.js          # Main implementation
├── package.json
└── README.md
```

## License

MIT
