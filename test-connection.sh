#!/bin/bash

# Heady Admin UI Connection Test Script
# This script tests all the documented connection points

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "Heady Connection Test"
echo "================================"
echo ""

# Check if server is running (portable method)
echo -n "1. Checking if server is running on port 3300... "
if timeout 1 bash -c 'cat < /dev/tcp/localhost/3300' 2>/dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
elif command -v nc &> /dev/null && nc -z localhost 3300 2>/dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running${NC}"
    echo "   Start the server with: npm start"
    exit 1
fi

# Test health endpoint
echo -n "2. Testing health endpoint... "
HEALTH_RESPONSE=$(curl -s http://localhost:3300/api/health)
if echo "$HEALTH_RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
    exit 1
fi

# Test pulse endpoint
echo -n "3. Testing pulse endpoint... "
PULSE_RESPONSE=$(curl -s http://localhost:3300/api/pulse)
if [ -n "$PULSE_RESPONSE" ]; then
    echo -e "${GREEN}✓ Pulse endpoint accessible${NC}"
else
    echo -e "${YELLOW}⚠ Pulse endpoint returned empty response${NC}"
fi

# Test Admin UI static files
echo -n "4. Testing Admin UI (admin.html)... "
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3300/admin.html)
if [ "$ADMIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Admin UI accessible${NC}"
else
    echo -e "${RED}✗ Admin UI returned status $ADMIN_STATUS${NC}"
    exit 1
fi

echo -n "5. Testing Admin UI (admin/index.html)... "
ADMIN_ALT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3300/admin/index.html)
if [ "$ADMIN_ALT_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Admin UI (alt path) accessible${NC}"
else
    echo -e "${YELLOW}⚠ Admin UI alt path returned status $ADMIN_ALT_STATUS${NC}"
fi

# Check environment variables
echo ""
echo "6. Checking environment variables..."

if [ -z "$HEADY_API_KEY" ]; then
    echo -e "   ${YELLOW}⚠ HEADY_API_KEY not set${NC}"
    echo "   Admin API endpoints will require this key"
else
    echo -e "   ${GREEN}✓ HEADY_API_KEY is set${NC}"
    
    # Test admin endpoint with API key
    echo -n "   Testing admin API with x-heady-api-key header... "
    ADMIN_API_RESPONSE=$(curl -s -H "x-heady-api-key: $HEADY_API_KEY" http://localhost:3300/api/admin/roots)
    if echo "$ADMIN_API_RESPONSE" | grep -q '"ok":true'; then
        echo -e "${GREEN}✓ Admin API accessible${NC}"
    elif echo "$ADMIN_API_RESPONSE" | grep -q 'Unauthorized'; then
        echo -e "${RED}✗ Authentication failed (check API key)${NC}"
    else
        echo -e "${YELLOW}⚠ Unexpected response: $ADMIN_API_RESPONSE${NC}"
    fi
    
    # Test Bearer token method
    echo -n "   Testing admin API with Bearer token... "
    BEARER_RESPONSE=$(curl -s -H "Authorization: Bearer $HEADY_API_KEY" http://localhost:3300/api/admin/roots)
    if echo "$BEARER_RESPONSE" | grep -q '"ok":true'; then
        echo -e "${GREEN}✓ Bearer authentication works${NC}"
    else
        echo -e "${YELLOW}⚠ Bearer token method returned: ${BEARER_RESPONSE:0:50}...${NC}"
    fi
fi

if [ -z "$HF_TOKEN" ]; then
    echo -e "   ${YELLOW}⚠ HF_TOKEN not set${NC}"
    echo "   AI features will not work without this token"
else
    echo -e "   ${GREEN}✓ HF_TOKEN is set${NC}"
fi

echo ""
echo "================================"
echo "Connection Test Summary"
echo "================================"
echo ""
echo "Access points:"
echo "  • Main UI:       http://localhost:3300/"
echo "  • Admin UI:      http://localhost:3300/admin.html"
echo "  • Alt Admin UI:  http://localhost:3300/admin/index.html"
echo "  • Health check:  http://localhost:3300/api/health"
echo "  • System pulse:  http://localhost:3300/api/pulse"
echo ""

# Show local IP for LAN access (cross-platform)
if command -v hostname &> /dev/null; then
    # Linux
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
elif command -v ipconfig &> /dev/null; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

if [ -n "$LOCAL_IP" ]; then
    echo "LAN Access (from other devices on your network):"
    echo "  http://$LOCAL_IP:3300/admin.html"
    echo ""
fi

echo -e "${GREEN}Connection test completed successfully!${NC}"
