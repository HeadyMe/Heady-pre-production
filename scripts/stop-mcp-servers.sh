#!/bin/bash
# Stop all MCP servers
# This script stops all running MCP servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PID_DIR="$PROJECT_ROOT/tmp/mcp-pids"

echo "🛑 Stopping MCP Servers..."
echo "=========================="

if [ ! -d "$PID_DIR" ]; then
    echo "No PID directory found. No servers running."
    exit 0
fi

# Stop each server
for pid_file in "$PID_DIR"/*.pid; do
    if [ -f "$pid_file" ]; then
        server_name=$(basename "$pid_file" .pid)
        pid=$(cat "$pid_file")
        
        echo "  Stopping $server_name (PID: $pid)..."
        
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null || true
            
            # Wait for graceful shutdown
            for i in {1..5}; do
                if ! ps -p $pid > /dev/null 2>&1; then
                    echo "  ✓ $server_name stopped"
                    break
                fi
                sleep 1
            done
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                echo "  Force killing $server_name..."
                kill -9 $pid 2>/dev/null || true
                echo "  ✓ $server_name force stopped"
            fi
        else
            echo "  ⚠️  $server_name was not running"
        fi
        
        rm -f "$pid_file"
    fi
done

echo ""
echo "✅ All MCP servers stopped"
