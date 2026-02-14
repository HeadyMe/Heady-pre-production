#!/bin/bash
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
# ║  FILE: headybuddy-mobile/build-apk.sh                             ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

# One-Click APK Builder for HeadyBuddy Mobile
# This script builds a signed APK ready for installation

set -e

echo "🚀 HeadyBuddy APK Builder"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
check_prereq() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 not found${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ $1 found${NC}"
    return 0
}

echo "🔍 Checking prerequisites..."
echo ""

MISSING=0

if ! check_prereq "node"; then
    echo "   Install from: https://nodejs.org"
    MISSING=1
fi

if ! check_prereq "java"; then
    echo "   Install JDK 17: https://adoptium.net"
    MISSING=1
fi

if [ ! -d "$ANDROID_HOME" ] && [ ! -d "$ANDROID_SDK_ROOT" ]; then
    echo -e "${YELLOW}⚠️  Android SDK not found${NC}"
    echo "   Install Android Studio: https://developer.android.com/studio"
    echo "   Or set ANDROID_HOME environment variable"
    MISSING=1
else
    echo -e "${GREEN}✅ Android SDK found${NC}"
fi

if [ $MISSING -eq 1 ]; then
    echo ""
    echo -e "${RED}❌ Please install missing prerequisites and try again${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Step 1: Installing Node dependencies...${NC}"
npm install

echo ""
echo -e "${BLUE}🔧 Step 2: Setting up Android project...${NC}"

# Check if android directory exists, if not create it
if [ ! -d "android" ]; then
    echo "Creating Android project structure..."
    npx react-native@latest init HeadyBuddyMobile --directory android --template react-native-template-typescript --skip-install
fi

cd android

echo ""
echo -e "${BLUE}🧹 Step 3: Cleaning previous builds...${NC}"
./gradlew clean 2>/dev/null || ./gradlew.bat clean 2>/dev/null || echo "Clean skipped"

echo ""
echo -e "${BLUE}🏗️  Step 4: Building APK...${NC}"

# Try gradlew with different methods
if [ -f "./gradlew" ]; then
    ./gradlew assembleRelease
elif [ -f "./gradlew.bat" ]; then
    ./gradlew.bat assembleRelease
else
    echo -e "${RED}❌ Gradle wrapper not found${NC}"
    echo "   Run: npx react-native@latest init HeadyBuddyMobile"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ APK Built Successfully!${NC}"
echo ""
echo -e "${YELLOW}📁 APK Location:${NC}"
echo "   android/app/build/outputs/apk/release/app-release-unsigned.apk"
echo ""

# Check if keystore exists for signing
KEYSTORE_FILE="../headybuddy-release.keystore"
if [ -f "$KEYSTORE_FILE" ]; then
    echo -e "${BLUE}🔐 Signing APK with existing keystore...${NC}"
    
    jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
        -keystore $KEYSTORE_FILE \
        -storepass headybuddy123 \
        app/build/outputs/apk/release/app-release-unsigned.apk \
        headybuddy
    
    # Align the APK
    $ANDROID_HOME/build-tools/34.0.0/zipalign -v 4 \
        app/build/outputs/apk/release/app-release-unsigned.apk \
        app/build/outputs/apk/release/HeadyBuddy-v1.0.0.apk
    
    echo ""
    echo -e "${GREEN}✅ Signed APK created!${NC}"
    echo -e "${YELLOW}📁 Signed APK:${NC}"
    echo "   android/app/build/outputs/apk/release/HeadyBuddy-v1.0.0.apk"
else
    echo -e "${YELLOW}⚠️  APK is unsigned${NC}"
    echo ""
    echo -e "${BLUE}To create a signed APK for distribution:${NC}"
    echo "   Run: ./create-keystore.sh"
    echo "   Then: ./build-and-sign.sh"
fi

echo ""
echo "=========================="
echo -e "${GREEN}🎉 Build Complete!${NC}"
echo ""
echo -e "${BLUE}To install on your phone:${NC}"
echo "   1. Enable Developer Options & USB Debugging on your phone"
echo "   2. Connect phone via USB"
echo "   3. Run: adb install android/app/build/outputs/apk/release/*.apk"
echo ""
echo -e "${BLUE}To share with others:${NC}"
echo "   Send the APK file via:"
echo "   - Email"
echo "   - Google Drive"
echo "   - Telegram/WhatsApp"
echo "   - Direct download"
echo ""
echo -e "${YELLOW}Note: Users need to allow 'Install from Unknown Sources'${NC}"
