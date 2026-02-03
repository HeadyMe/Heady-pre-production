---
description: Run and develop the Heady Mobile App
---

# Mobile Development Workflow

## Purpose
Develop and run the Heady Mobile application with cross-platform support.

## Usage

### Development
```bash
# Start development server
npm run mobile:dev

# Build for iOS
npm run mobile:build:ios

# Build for Android
npm run mobile:build:android

# Run on simulator
npm run mobile:simulator:ios

# Run on device
npm run mobile:device
```

### Programmatic Usage
```javascript
const MobileDev = require('./src/mobile_dev');

const mobile = new MobileDev({
  platform: 'ios',
  environment: 'development',
  hotReload: true
});

await mobile.start();
```

## Project Structure
- `apps/mobile/` - React Native application
- `packages/mobile-ui/` - Shared UI components
- `packages/mobile-core/` - Core logic and services

## Available Commands
- `mobile:dev`: Start development server with hot reload
- `mobile:build:ios`: Build iOS IPA
- `mobile:build:android`: Build Android APK
- `mobile:test`: Run unit tests
- `mobile:lint`: Run linting
- `mobile:publish`: Publish to app stores
