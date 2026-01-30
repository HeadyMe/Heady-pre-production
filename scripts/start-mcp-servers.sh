#!/bin/bash
# Start all MCP servers locally
# This script launches all MCP servers defined in mcp_config.json

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source environment setup
source "$SCRIPT_DIR/setup-mcp-env.sh"

# PID file directory
PID_DIR="$PROJECT_ROOT/tmp/mcp-pids"
mkdir -p "$PID_DIR"

# Log directory
LOG_DIR="$MCP_SERVER_LOG_DIR"
mkdir -p "$LOG_DIR"

echo ""
echo "🚀 Starting MCP Servers..."
echo "=========================="

# Function to start an MCP server
start_mcp_server() {
    local server_name=$1
    local command=$2
    shift 2
    local args=("$@")
    
    local pid_file="$PID_DIR/${server_name}.pid"
    local log_file="$LOG_DIR/${server_name}.log"
    
    # Check if already running
    if [ -f "$pid_file" ]; then
        local old_pid=$(cat "$pid_file")
        if ps -p "$old_pid" > /dev/null 2>&1; then
            echo "⚠️  $server_name is already running (PID: $old_pid)"
            return 0
        else
            echo "  Removing stale PID file for $server_name"
            rm -f "$pid_file"
        fi
    fi
    
    echo "  Starting $server_name..."
    
    # Start the server in background
    nohup $command "${args[@]}" > "$log_file" 2>&1 &
    local pid=$!
    
    # Save PID
    echo $pid > "$pid_file"
    
    # Wait a moment to see if it crashes immediately
    sleep 2
    
    if ps -p $pid > /dev/null 2>&1; then
        echo "  ✓ $server_name started (PID: $pid)"
        echo "    Log: $log_file"
        return 0
    else
        echo "  ✗ $server_name failed to start"
        echo "    Check log: $log_file"
        rm -f "$pid_file"
        return 1
    fi
}

# Start filesystem server
echo ""
echo "1. Filesystem Server"
echo "--------------------"
start_mcp_server "filesystem" "npx" "-y" "@modelcontextprotocol/server-filesystem" "$PROJECT_ROOT" "/tmp"

# Start sequential-thinking server
echo ""
echo "2. Sequential-Thinking Server"
echo "------------------------------"
start_mcp_server "sequential-thinking" "npx" "-y" "@modelcontextprotocol/server-sequential-thinking"

# Start memory server  
echo ""
echo "3. Memory Server"
echo "----------------"
start_mcp_server "memory" "npx" "-y" "@modelcontextprotocol/server-memory"

# Start fetch server
echo ""
echo "4. Fetch Server"
echo "---------------"
# Note: @modelcontextprotocol/server-fetch doesn't exist
# Using brave-search as an alternative for web fetching capabilities
start_mcp_server "brave-search" "npx" "-y" "@modelcontextprotocol/server-brave-search"

# Start postgres server (if DATABASE_URL is set)
echo ""
echo "5. Postgres Server"
echo "------------------"
if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgresql://user:pass@localhost:5432/heady" ]; then
    start_mcp_server "postgres" "npx" "-y" "@modelcontextprotocol/server-postgres" "$DATABASE_URL"
else
    echo "  ⚠️  Skipping postgres server (DATABASE_URL not properly configured)"
    echo "    Set DATABASE_URL to enable postgres MCP server"
fi

# Start git server
echo ""
echo "6. Git Server"
echo "-------------"
# Note: @modelcontextprotocol/server-git doesn't exist as a separate package
# Git functionality is often built into other tools or available via filesystem operations
echo "  ⚠️  Skipping git server (no standalone package available)"
echo "    Git operations can be performed via filesystem server or shell commands"

# Start puppeteer server
echo ""
echo "7. Puppeteer Server"
echo "-------------------"
start_mcp_server "puppeteer" "npx" "-y" "@modelcontextprotocol/server-puppeteer"

# Start cloudflare server (if credentials are set)
echo ""
echo "8. Cloudflare Server"
echo "--------------------"
if [ -n "$COPILOT_MCP_CLOUDFLARE_API_TOKEN" ] && [ -n "$COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID" ]; then
    # Export for subprocess
    export CLOUDFLARE_API_TOKEN="$COPILOT_MCP_CLOUDFLARE_API_TOKEN"
    export CLOUDFLARE_ACCOUNT_ID="$COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID"
    start_mcp_server "cloudflare" "npx" "-y" "@cloudflare/mcp-server-cloudflare"
else
    echo "  ⚠️  Skipping cloudflare server (credentials not set)"
    echo "    Set COPILOT_MCP_CLOUDFLARE_API_TOKEN and COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID"
fi

echo ""
echo "=========================="
echo "✅ MCP Server Launch Complete"
echo ""
echo "Running servers:"
ls -1 "$PID_DIR"/*.pid 2>/dev/null | while read pid_file; do
    server_name=$(basename "$pid_file" .pid)
    pid=$(cat "$pid_file")
    if ps -p $pid > /dev/null 2>&1; then
        echo "  ✓ $server_name (PID: $pid)"
    fi
done

echo ""
echo "To view logs: tail -f $LOG_DIR/<server-name>.log"
echo "To stop all servers: $SCRIPT_DIR/stop-mcp-servers.sh"
echo "To check status: $SCRIPT_DIR/check-mcp-status.sh"
