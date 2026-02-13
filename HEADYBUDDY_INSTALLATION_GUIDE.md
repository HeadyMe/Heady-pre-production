# 🚀 HeadyBuddy Installation Guide

## 📱 Device Installation Instructions

### 🖥️ Desktop Installation (Windows/Mac/Linux)

#### Prerequisites
- Node.js 18+ and npm installed
- Git for repository access
- API keys for AI services (OpenAI, Anthropic, or local models)

#### Quick Start
```bash
# Clone the repository
git clone https://github.com/HeadyMe/Heady-pre-production.git
cd Heady-pre-production/cloud-deploy/headybuddy

# Install dependencies
npm install

# Start HeadyBuddy
npm start
```

#### Build for Distribution
```bash
# Windows
npm run build:win

# All platforms
npm run build
```

### 📱 Mobile Installation (Android)

#### Prerequisites
- Node.js 18+
- Android Studio + SDK
- Java 17
- React Native CLI

#### Build APK
```bash
cd Heady-pre-production/cloud-deploy/headybuddy-mobile
npm install
cd android
./gradlew clean

# Debug APK
./gradlew assembleDebug

# Release APK (for Google Play)
./gradlew assembleRelease
```

#### APK Location
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

### 🔌 Service Configuration

#### Working URLs (Current)
- **HeadySystems**: https://heady-manager-headysystems.onrender.com
- **HeadyMe**: https://heady-manager-headyme.onrender.com  
- **HeadyConnection**: https://heady-manager-headyconnection.onrender.com

#### API Endpoints
- **Health**: `/api/health`
- **System Status**: `/api/system/status`
- **Intelligence**: `/api/intelligence/state`
- **Chat**: `/api/v1/chat/*`

### ⚙️ Configuration Best Practices

#### Environment Setup
```bash
# Create .env file
HEADY_API_KEY=your-api-key
OPENAI_API_KEY=your-openai-key
HEADY_MANAGER_URL=https://heady-manager-headysystems.onrender.com
```

#### Security
- Store API keys in system keychain
- Never commit keys to version control
- Use HTTPS for all connections
- Enable authentication for production

### 🔗 Integration Features

#### HeadyBuddy Connects To:
- **HeadyManager** (port 3300) - System status and commands
- **MCP Services** - Intelligent task assistance  
- **Colab Notebooks** - GPU-powered AI processing
- **Git Remotes** - Sync operations

#### Automation Features
- **Task Management** - Visual progress tracking
- **AI Companion Chat** - Real-time assistance
- **Quick Actions** - One-click sync, build, deploy
- **System Status** - Real-time monitoring
- **Always On Top** - Stays visible while working

### 🎮 Keyboard Shortcuts
- `Ctrl + Shift + H` - Show/Hide HeadyBuddy
- `Ctrl + Shift + S` - Quick sync
- `Ctrl + Shift + B` - Quick build
- `Ctrl + Shift + D` - Quick deploy

### 📋 Verification Steps

#### Desktop Verification
```bash
# Check service health
curl https://heady-manager-headysystems.onrender.com/api/health

# Test HeadyBuddy connection
# Launch HeadyBuddy and check status indicator
```

#### Mobile Verification
1. Install APK on Android device
2. Connect to same network as HeadyManager
3. Test connection to services
4. Verify automation features work

### 🚨 Troubleshooting

#### Desktop Issues
- **Connection Failed**: Check URL in main.js CONFIG
- **Services Not Responding**: Verify Render services are online
- **Automation Not Working**: Check Puppeteer dependencies

#### Mobile Issues
- **APK Install**: Enable "Install from Unknown Sources"
- **Connection Issues**: Check WiFi network connectivity
- **Performance**: Ensure adequate device resources

### 🌐 Cross-Device Sync

#### Setup
1. Configure cloud sync in settings
2. Enable cross-device state sharing
3. Set up backup preferences
4. Test sync between devices

### 📊 System Requirements

#### Desktop
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Network**: Internet connection for cloud services

#### Mobile
- **OS**: Android 8.0+ (API 26+)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 200MB free space
- **Network**: WiFi or mobile data

### 🔮 Advanced Features

#### Voice Commands (Future)
- Enable voice input in settings
- Configure wake word detection
- Set up custom voice commands

#### Custom Themes
- Modify Sacred Geometry patterns
- Adjust breathing animations
- Create custom color schemes

### 📞 Support

#### Documentation
- **Desktop**: `cloud-deploy/headybuddy/README.md`
- **Mobile**: `cloud-deploy/headybuddy-mobile/BUILD_GUIDE.md`
- **API**: `docs/deep-research/` directory

#### Community
- GitHub Issues: Report bugs and feature requests
- Discord: Real-time community support
- Wiki: Detailed documentation and tutorials

---

**🚀 HeadyBuddy is ready to install on all your devices!**

**Current Status: All services online and ready for connections** ✅
