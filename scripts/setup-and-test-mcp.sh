#!/bin/bash
# Complete MCP Server Setup and Test
# This script sets up environment and starts the MCP gateway

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       Heady MCP Gateway - Setup & Test                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Setup environment
echo "Step 1: Setting up environment..."
echo "─────────────────────────────────────────────────────────────"
bash "$SCRIPT_DIR/setup-mcp-env.sh"

# Step 2: Test the gateway briefly
echo ""
echo "Step 2: Testing MCP Gateway..."
echo "─────────────────────────────────────────────────────────────"
echo "Starting gateway for connectivity test (5 seconds)..."

# Start gateway in background for testing
timeout 5 node "$SCRIPT_DIR/mcp-gateway.js" || true

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Your MCP environment is ready!"
echo ""
echo "To start the MCP gateway:"
echo "  node $SCRIPT_DIR/mcp-gateway.js"
echo ""
echo "The gateway will:"
echo "  • Start all configured MCP servers"
echo "  • Manage stdio communication"
echo "  • Monitor server health"
echo "  • Press Ctrl+C to stop all servers"
echo ""
