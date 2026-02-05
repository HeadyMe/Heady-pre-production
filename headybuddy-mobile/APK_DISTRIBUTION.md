<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: headybuddy-mobile/APK_DISTRIBUTION.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# 📱 HeadyBuddy Mobile - APK Distribution

## 🚀 Download APK from GitHub Releases

Every time you push a tag (like `v1.0.0`), GitHub automatically builds and releases the APK!

### Download Latest APK

**Direct Link:** https://github.com/HeadySystems/Heady/releases

Or scan this QR code on your phone:
```
https://github.com/HeadySystems/Heady/releases/latest
```

### Installation Steps

1. **Download the APK**
   - Go to GitHub Releases page
   - Click on latest release
   - Download `HeadyBuddy-v1.0.0.apk`

2. **Enable Installation**
   - On Android: **Settings → Security → Install unknown apps**
   - Enable for your browser/files app

3. **Install**
   - Open downloaded APK
   - Tap "Install"
   - Grant permissions when prompted

4. **Use**
   - Open HeadyBuddy app
   - Start tracking tasks!

---

## 🔧 For Developers: Build APK Locally

### Prerequisites
- Node.js 18+
- Java 17
- Android Studio (or just Android SDK)

### Quick Build (Windows)
```powershell
cd headybuddy-mobile
.\build-apk.ps1
```

### Quick Build (Mac/Linux)
```bash
cd headybuddy-mobile
./build-apk.sh
```

### Manual Build
```bash
cd headybuddy-mobile
npm install
cd android
./gradlew assembleDebug
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔄 Automatic Builds

The GitHub Actions workflow automatically:
1. Builds Debug APK on every push to `main`
2. Builds Release APK on every version tag (`v*`)
3. Creates GitHub Release with downloadable APK
4. Uploads APK as build artifact

### Create a New Release

```bash
# Tag a new version
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

GitHub Actions will automatically:
- Build the APK
- Create a Release
- Attach the APK file
- Publish it for download

---

## 📤 Share with Others

### Method 1: GitHub Releases (Recommended)
- Share this link: `https://github.com/HeadySystems/Heady/releases`
- They download latest APK
- Install on their Android device

### Method 2: Direct APK Share
- Build APK locally
- Upload to Google Drive/Dropbox
- Share download link
- Or send via Telegram/WhatsApp/Email

### Method 3: QR Code
Generate QR code for your release URL:
```bash
# Install qrencode
# Then:
qrencode -t ANSI "https://github.com/HeadySystems/Heady/releases/latest"
```

---

## 🔐 Security Notes

- Debug APKs are for testing only
- Release APKs should be signed for distribution
- GitHub builds are automatic and trustworthy
- Always verify APK source before installing

---

## 🐛 Troubleshooting

### "App not installed"
- Uninstall previous version first
- Enable "Install unknown apps" in settings

### "Parse error"
- APK may be corrupted, re-download
- Check Android version (requires 5.0+)

### "Blocked by Play Protect"
- Tap "Install anyway"
- This is normal for non-Play Store apps

---

## 📋 System Requirements

| Requirement | Minimum |
|-------------|---------|
| Android Version | 5.0 (API 21) |
| Storage Space | 50MB |
| RAM | 2GB |
| Internet | Optional (for sync) |

---

**∞ Heady Systems :: Sacred Geometry ∞**
