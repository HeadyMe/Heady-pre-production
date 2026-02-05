<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: headybuddy-mobile/BUILD_GUIDE.md -->
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

# HeadyBuddy Mobile - Android Build Instructions

## 🚀 Quick Build for Google Play

### Prerequisites
- Node.js 18+
- Android Studio + SDK
- Java 17
- React Native CLI

### 1. Install Dependencies

```bash
cd headybuddy-mobile
npm install
cd android
./gradlew clean
```

### 2. Build Debug APK

```bash
cd android
./gradlew assembleDebug
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Build Release APK (for Google Play)

```bash
cd android
./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### 4. Build Android App Bundle (AAB) - REQUIRED for Google Play

```bash
cd android
./gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

> **Note:** Google Play requires AAB format, not APK!

---

## 📋 Google Play Submission Checklist

### Required Assets
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (minimum 2, recommended 8)
  - Phone: 1080x1920 or 1920x1080
  - Tablet (optional): 2048x2732
- [ ] Privacy policy URL
- [ ] App description (short + full)

### App Information
```
Title: HeadyBuddy - AI Task Companion
Short description: Your intelligent mobile companion for staying productive
Full description: 
  HeadyBuddy is your AI-powered task companion that helps you stay focused 
  and complete your goals. With smart task management, focus timers, and 
  encouraging AI chat, HeadyBuddy makes productivity feel effortless.
  
  Features:
  ✓ Smart task tracking with natural language input
  ✓ AI companion chat for motivation
  ✓ Focus timer with streak system
  ✓ Integration with HeadyManager
  ✓ Beautiful Sacred Geometry design
  
  Powered by Heady Systems.
```

### Store Listing
- Category: Productivity
- Content rating: Everyone
- Pricing: Free

---

## 🔐 Signing for Release

### 1. Generate Keystore

```bash
keytool -genkey -v \
  -keystore headybuddy-release.keystore \
  -alias headybuddy \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 2. Configure Signing

Create `android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=headybuddy-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=headybuddy
MYAPP_UPLOAD_STORE_PASSWORD=your-password
MYAPP_UPLOAD_KEY_PASSWORD=your-password
```

### 3. Update Build Config

In `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

---

## 🧪 Testing

### Install on Device
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Run on Emulator
```bash
npx react-native run-android
```

---

## 📦 Build Scripts

### Windows (PowerShell)
```powershell
.\build-android.ps1
```

### Linux/Mac
```bash
./build-android.sh
```

---

## 🎯 Features Implemented

Based on best practices from successful apps:

| Feature | Inspired By | Implementation |
|---------|------------|----------------|
| Natural language task input | Todoist | Smart parsing with priority detection |
| Focus timer with streaks | Forest | 25min Pomodoro with tree growth |
| Gamification (karma/streaks) | Duolingo | Points system + streak protection |
| Contextual AI responses | ChatGPT | Time-based greetings + memory |
| Breathing animations | Headspace | Calming Sacred Geometry design |
| Quick capture | Any.do | Fast task entry from anywhere |

---

## 🚀 Publishing Steps

1. **Build AAB**: `./gradlew bundleRelease`
2. **Create Play Console account**: https://play.google.com/console
3. **Pay $25 one-time fee**
4. **Create new app**: Fill in store listing
5. **Upload AAB**: Internal testing track first
6. **Test**: Install on device from Play Store
7. **Release**: Promote to production

---

## 📱 System Requirements

- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)
- **Permissions**: Internet, notifications

---

**∞ Heady Systems :: Sacred Geometry ∞**
