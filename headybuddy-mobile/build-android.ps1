# Build HeadyBuddy Mobile for Android
# Usage: .\build-android.ps1 [debug|release|bundle]

param(
    [string]$BuildType = "debug"
)

Write-Host "🚀 HeadyBuddy Android Builder" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Check environment
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

$java = Get-Command java -ErrorAction SilentlyContinue
if (-not $java) {
    Write-Host "❌ Java not found. Install JDK 17" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🔧 Step 2: Preparing Android build..." -ForegroundColor Yellow
Set-Location android

# Clean previous builds
Write-Host "🧹 Cleaning..." -ForegroundColor Gray
.\gradlew.bat clean

Write-Host ""
Write-Host "🏗️  Step 3: Building ($BuildType)..." -ForegroundColor Yellow

switch ($BuildType) {
    "debug" {
        .\gradlew.bat assembleDebug
        Write-Host ""
        Write-Host "✅ Debug APK built!" -ForegroundColor Green
        Write-Host "📁 Location: app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Gray
    }
    "release" {
        .\gradlew.bat assembleRelease
        Write-Host ""
        Write-Host "✅ Release APK built!" -ForegroundColor Green
        Write-Host "📁 Location: app\build\outputs\apk\release\app-release.apk" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⚠️  Remember to sign the APK before publishing!" -ForegroundColor Yellow
    }
    "bundle" {
        .\gradlew.bat bundleRelease
        Write-Host ""
        Write-Host "✅ App Bundle built!" -ForegroundColor Green
        Write-Host "📁 Location: app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎉 Ready for Google Play upload!" -ForegroundColor Green
    }
    default {
        Write-Host "❌ Unknown build type: $BuildType" -ForegroundColor Red
        Write-Host "Usage: .\build-android.ps1 [debug|release|bundle]" -ForegroundColor Yellow
        exit 1
    }
}

Set-Location ..

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "✨ Build complete!" -ForegroundColor Green
