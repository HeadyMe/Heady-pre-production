#!/bin/bash
# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: headybuddy/build-msstore.sh
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

# Build HeadyBuddy for Microsoft Store (MSIX)
# Run from headybuddy directory

echo "🚀 Building HeadyBuddy for Microsoft Store..."

# Check prerequisites
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Install Node.js first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build MSIX package
echo "📦 Building MSIX package..."
npx electron-builder --win msix

echo "✅ Build complete!"
echo ""
echo "📁 Output: dist/HeadyBuddy-1.0.0.msix"
echo ""
echo "Next steps:"
echo "1. Get code signing certificate"
echo "2. Sign the MSIX: signtool sign /fd SHA256 /a dist/HeadyBuddy-1.0.0.msix"
echo "3. Submit to Microsoft Store via Partner Center"
