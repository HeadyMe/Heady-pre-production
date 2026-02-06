# HEADY_BRAND:BEGIN
# ╔══════════════════════════════════════════════════════════════════╗
# ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
# ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
# ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
# ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
# ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
# ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
# ║                                                                  ║
# ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
# ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
# ║  FILE: Dockerfile                                                 ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# Multi-stage build for HeadyMCP
FROM node:18-alpine AS node-base

# Install Python and build dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    git \
    bash \
    curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install Node.js dependencies
RUN npm install --production

# Python stage
FROM node-base AS python-stage

# Copy Python requirements (if exists)
COPY src/requirements.txt* ./src/

# Install Python dependencies (if requirements.txt exists)
RUN if [ -f src/requirements.txt ]; then pip3 install --no-cache-dir -r src/requirements.txt; fi

# Final stage
FROM python-stage

# Set environment variables
ENV NODE_ENV=production \
    PORT=3300 \
    HEADY_PYTHON_BIN=python3 \
    PYTHONUNBUFFERED=1

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p \
    .heady-memory/inventory \
    .heady-memory/checkpoints \
    .heady-memory/logs \
    mcp-data \
    frontend/build

# Expose ports
EXPOSE 3300

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3300/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start HeadyManager
CMD ["node", "heady-manager.js"]
