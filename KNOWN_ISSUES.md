# Known Issues

## 1. Missing Dependencies
- **Symptoms:** Module not found errors (e.g., 'helmet', 'ws', 'winston', 'dockerode', '@grpc/grpc-js')
- **Solution:** Run `npm install` to install all dependencies

## 2. Port Conflicts
- **Symptoms:** `EADDRINUSE` errors
- **Solution:** Ensure no other processes are using ports 3300, 3304, 4000

## 3. MCP Server Errors
- **Symptoms:** "Schema is missing a method literal"
- **Cause:** Incorrect configuration in MCP server scripts
- **Solution:** Review and fix server initialization code

## 4. HeadyManager Entry Point
- **Symptoms:** Cannot find local modules (e.g., './src/mcp_input_interceptor')
- **Cause:** Incorrect relative paths
- **Solution:** Adjust paths or move files

## Next Steps
1. Fix dependency issues
2. Resolve port conflicts
3. Debug MCP servers
4. Verify HeadyManager startup
