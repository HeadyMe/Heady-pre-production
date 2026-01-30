#!/bin/bash
# Setup MCP Environment Variables
# This script validates and sets up required environment variables for MCP servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

echo "🔧 Setting up MCP Environment Variables..."

# Create .env file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating .env file from template..."
    cp "$PROJECT_ROOT/.env.template" "$ENV_FILE"
fi

# Source existing .env
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

# Function to check and set environment variable
check_or_set_env() {
    local var_name=$1
    local default_value=$2
    local description=$3
    
    if [ -z "${!var_name}" ]; then
        if [ -n "$default_value" ]; then
            export $var_name="$default_value"
            echo "✓ $var_name set to default: $default_value"
        else
            echo "⚠️  WARNING: $var_name is not set - $description"
        fi
    else
        echo "✓ $var_name is already set"
    fi
    return 0
}

# Check critical environment variables
echo ""
echo "Checking required environment variables..."
echo "----------------------------------------"

# Database URL - use local postgres if not set
if [ -z "$DATABASE_URL" ]; then
    # Check if postgres is running locally
    if command -v psql &> /dev/null; then
        # Use default local postgres
        export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/heady"
        echo "✓ DATABASE_URL set to local postgres: $DATABASE_URL"
        echo "  Note: Ensure PostgreSQL is running locally on port 5432"
    else
        export DATABASE_URL="postgresql://user:pass@localhost:5432/heady"
        echo "⚠️  WARNING: DATABASE_URL set to placeholder (postgres not detected)"
        echo "  You may need to start a postgres container or update this value"
    fi
fi

# Cloudflare tokens
check_or_set_env "COPILOT_MCP_CLOUDFLARE_API_TOKEN" "" "Required for Cloudflare MCP server"
check_or_set_env "COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID" "" "Required for Cloudflare MCP server"

# HuggingFace token
check_or_set_env "HF_TOKEN" "" "Required for model inference"

# Heady API key
if [ -z "$HEADY_API_KEY" ]; then
    # Generate a random API key if not set
    HEADY_API_KEY="heady_dev_$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)"
    export HEADY_API_KEY
    echo "✓ HEADY_API_KEY generated: $HEADY_API_KEY"
fi

# Port configuration
check_or_set_env "PORT" "3300" "Server port"
check_or_set_env "NODE_ENV" "development" "Node environment"

# MCP specific configurations
check_or_set_env "MCP_SERVER_LOG_DIR" "$PROJECT_ROOT/logs/mcp" "MCP server log directory"
check_or_set_env "MCP_SERVER_DATA_DIR" "$PROJECT_ROOT/data/mcp" "MCP server data directory"

# Create necessary directories
mkdir -p "$MCP_SERVER_LOG_DIR"
mkdir -p "$MCP_SERVER_DATA_DIR"
mkdir -p "$PROJECT_ROOT/tmp"

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "Critical variables status:"
echo "  DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "  COPILOT_MCP_CLOUDFLARE_API_TOKEN: ${COPILOT_MCP_CLOUDFLARE_API_TOKEN:+[SET]}${COPILOT_MCP_CLOUDFLARE_API_TOKEN:-[NOT SET]}"
echo "  COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID: ${COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID:+[SET]}${COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID:-[NOT SET]}"
echo "  HF_TOKEN: ${HF_TOKEN:+[SET]}${HF_TOKEN:-[NOT SET]}"
echo "  HEADY_API_KEY: ${HEADY_API_KEY:0:20}..."
echo ""

# Export all environment variables to a file for sourcing
cat > "$PROJECT_ROOT/tmp/mcp-env.sh" <<EOF
# Auto-generated MCP environment variables
export DATABASE_URL="$DATABASE_URL"
export COPILOT_MCP_CLOUDFLARE_API_TOKEN="$COPILOT_MCP_CLOUDFLARE_API_TOKEN"
export COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID="$COPILOT_MCP_CLOUDFLARE_ACCOUNT_ID"
export HF_TOKEN="$HF_TOKEN"
export HEADY_API_KEY="$HEADY_API_KEY"
export PORT="$PORT"
export NODE_ENV="$NODE_ENV"
export MCP_SERVER_LOG_DIR="$MCP_SERVER_LOG_DIR"
export MCP_SERVER_DATA_DIR="$MCP_SERVER_DATA_DIR"
EOF

echo "Environment variables exported to: $PROJECT_ROOT/tmp/mcp-env.sh"
echo "Source this file in other scripts with: source tmp/mcp-env.sh"
