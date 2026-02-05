#!/bin/bash
# Build HeadyBuddy Mobile for Android
# Usage: ./build-android.sh [debug|release|bundle]

set -e

echo "🚀 HeadyBuddy Android Builder"
echo "=============================="

# Check environment
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Install JDK 17"
    exit 1
fi

# Parse argument
BUILD_TYPE=${1:-debug}

echo ""
echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔧 Step 2: Preparing Android build..."
cd android

# Clean previous builds
echo "🧹 Cleaning..."
./gradlew clean

# Build based on type
echo ""
echo "🏗️  Step 3: Building ($BUILD_TYPE)..."

case $BUILD_TYPE in
    debug)
        ./gradlew assembleDebug
        echo ""
        echo "✅ Debug APK built!"
        echo "📁 Location: app/build/outputs/apk/debug/app-debug.apk"
        ;;
    release)
        ./gradlew assembleRelease
        echo ""
        echo "✅ Release APK built!"
        echo "📁 Location: app/build/outputs/apk/release/app-release.apk"
        echo ""
        echo "⚠️  Remember to sign the APK before publishing!"
        ;;
    bundle)
        ./gradlew bundleRelease
        echo ""
        echo "✅ App Bundle built!"
        echo "📁 Location: app/build/outputs/bundle/release/app-release.aab"
        echo ""
        echo "🎉 Ready for Google Play upload!"
        ;;
    *)
        echo "❌ Unknown build type: $BUILD_TYPE"
        echo "Usage: ./build-android.sh [debug|release|bundle]"
        exit 1
        ;;
esac

echo ""
echo "=============================="
echo "✨ Build complete!"
