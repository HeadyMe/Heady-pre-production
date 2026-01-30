#!/bin/bash
# Complete MCP Server Setup and Test
# This script sets up, starts, and verifies all MCP servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       Heady MCP Server - Complete Setup & Test            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Setup environment
echo "Step 1: Setting up environment..."
echo "─────────────────────────────────────────────────────────────"
bash "$SCRIPT_DIR/setup-mcp-env.sh"

# Step 2: Start all MCP servers
echo ""
echo "Step 2: Starting MCP servers..."
echo "─────────────────────────────────────────────────────────────"
bash "$SCRIPT_DIR/start-mcp-servers.sh"

# Wait for servers to stabilize
echo ""
echo "Waiting for servers to stabilize..."
sleep 5

# Step 3: Check server status
echo ""
echo "Step 3: Checking server status..."
echo "─────────────────────────────────────────────────────────────"
bash "$SCRIPT_DIR/check-mcp-status.sh"

# Step 4: Connect gateway
echo ""
echo "Step 4: Testing MCP Gateway connection..."
echo "─────────────────────────────────────────────────────────────"
node "$SCRIPT_DIR/mcp-gateway.js" &
GATEWAY_PID=$!

# Wait for gateway to connect
sleep 3

# Kill the gateway (it's just for testing connectivity)
if ps -p $GATEWAY_PID > /dev/null 2>&1; then
    kill $GATEWAY_PID 2>/dev/null || true
    echo "✓ Gateway connectivity test complete"
fi

# Step 5: Run comprehensive tests
echo ""
echo "Step 5: Running comprehensive server tests..."
echo "─────────────────────────────────────────────────────────────"
node "$SCRIPT_DIR/test-mcp-servers.js"

TEST_EXIT_CODE=$?

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Your MCP servers are now running!"
echo ""
echo "Next steps:"
echo "  • View server status: bash $SCRIPT_DIR/check-mcp-status.sh"
echo "  • View logs: tail -f logs/mcp/<server-name>.log"
echo "  • Stop servers: bash $SCRIPT_DIR/stop-mcp-servers.sh"
echo "  • Connect gateway: node $SCRIPT_DIR/mcp-gateway.js"
echo ""

exit $TEST_EXIT_CODE
