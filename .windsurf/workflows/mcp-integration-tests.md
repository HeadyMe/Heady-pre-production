---
description: MCP Integration Tests (HeadySystems)
---

# MCP Integration Tests Workflow

## Purpose
Comprehensive testing of all MCP server integrations and connectivity.

## Steps

1. **Verify MCP Configuration**
   ```powershell
   # Check mcp_config.json validity
   node -e "console.log(JSON.parse(require('fs').readFileSync('mcp_config.json')))"
   ```

2. **Test Individual MCP Servers**
   ```powershell
   # Test each MCP server
   node scripts/verify-mcp-new.js
   ```

3. **Test Heady Custom Servers**
   ```javascript
   const servers = [
     'heady-assets',
     'heady-autobuild',
     'heady-brain',
     'heady-cleanup',
     'heady-graph',
     'heady-metrics',
     'heady-monorepo',
     'heady-router',
     'heady-windsurf-router',
     'heady-workflow'
   ];
   
   for (const server of servers) {
     await testMCPServer(server);
   }
   ```

4. **Test Standard MCP Servers**
   ```javascript
   const standardServers = [
     'filesystem',
     'sequential-thinking',
     'memory',
     'git',
     'puppeteer',
     'cloudflare',
     'fetch',
     'postgres'
   ];
   
   for (const server of standardServers) {
     await testMCPServer(server);
   }
   ```

5. **Test Governance Integration**
   ```javascript
   // Verify governance controls
   const governance = require('./src/governance/governance_checkpoint');
   await governance.verifyMCPCompliance();
   ```

6. **Generate Test Report**
   ```powershell
   # Create test report
   node scripts/mcp-test-report.js > docs/MCP_TEST_RESULTS.md
   ```

## Success Criteria
- All 18 MCP servers respond
- Governance controls enforced
- Audit logs generated
- No permission errors
