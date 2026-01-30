#!/bin/bash
# Check status of MCP servers
# This script shows the status of all MCP servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PID_DIR="$PROJECT_ROOT/tmp/mcp-pids"
LOG_DIR="$PROJECT_ROOT/logs/mcp"

echo "📊 MCP Server Status"
echo "===================="
echo ""

if [ ! -d "$PID_DIR" ]; then
    echo "No MCP servers have been started yet."
    echo "Run: $SCRIPT_DIR/start-mcp-servers.sh"
    exit 0
fi

running_count=0
stopped_count=0

for pid_file in "$PID_DIR"/*.pid; do
    if [ -f "$pid_file" ]; then
        server_name=$(basename "$pid_file" .pid)
        pid=$(cat "$pid_file")
        
        if ps -p $pid > /dev/null 2>&1; then
            echo "✓ $server_name"
            echo "  Status: RUNNING"
            echo "  PID: $pid"
            echo "  Log: $LOG_DIR/${server_name}.log"
            
            # Show last few log lines
            if [ -f "$LOG_DIR/${server_name}.log" ]; then
                echo "  Recent log:"
                tail -n 2 "$LOG_DIR/${server_name}.log" 2>/dev/null | sed 's/^/    /'
            fi
            echo ""
            running_count=$((running_count + 1))
        else
            echo "✗ $server_name"
            echo "  Status: STOPPED"
            echo "  Last PID: $pid"
            if [ -f "$LOG_DIR/${server_name}.log" ]; then
                echo "  Log: $LOG_DIR/${server_name}.log"
                echo "  Last error:"
                tail -n 3 "$LOG_DIR/${server_name}.log" 2>/dev/null | sed 's/^/    /'
            fi
            echo ""
            stopped_count=$((stopped_count + 1))
        fi
    fi
done

echo "===================="
echo "Summary: $running_count running, $stopped_count stopped"
echo ""

if [ $running_count -eq 0 ]; then
    echo "No servers are currently running."
    echo "Start servers with: $SCRIPT_DIR/start-mcp-servers.sh"
fi
