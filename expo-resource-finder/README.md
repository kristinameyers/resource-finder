# Resource Finder Mobile App

React Native app built with Expo for finding community resources in Santa Barbara.

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g @expo/cli`
- Expo account (sign up at expo.dev)
- Apple Developer account ($99/year for iOS)
- Google Play Console account ($25 one-time for Android)

### 2. Install Dependencies
```bash
cd expo-resource-finder
npm install
```

### 3. Add Required Assets

**Fonts** (place in `assets/fonts/`):
- LeagueGothic-Regular.ttf
- Roboto-Regular.ttf
- Roboto-Medium.ttf
- Roboto-Bold.ttf

**Icons** (place in `assets/icons/`):
- Copy PNG icons from your web app's attached_assets folder
- children-family.png
- food.png
- education.png
- etc.

**App Icons** (place in `assets/`):
- icon.png (1024x1024)
- adaptive-icon.png (1024x1024)
- splash.png (1284x2778)
- favicon.png (48x48)

### 4. Configure API Endpoint
Update `constants/api.ts` with your backend URL:
```typescript
export const API_BASE_URL = 'https://your-app-name.replit.app';
```

### 5. Development
```bash
npm start
```

### 6. App Store Deployment

**Initialize EAS:**
```bash
npx eas init
npx eas login
```

**Build for iOS:**
```bash
npx eas build --platform ios
```

**Build for Android:**
```bash
npx eas build --platform android
```

**Submit to Stores:**
```bash
npx eas submit --platform ios
npx eas submit --platform android
```

## Features Ported from Web App

✅ Category grid with custom PNG icons
✅ Location-based resource discovery  
✅ ZIP code search functionality
✅ 211 API integration
✅ Resource details and contact information
✅ Distance calculations
✅ Responsive design for mobile

## Next Steps

1. Copy assets from web app
2. Test on physical devices
3. Configure app store metadata
4. Submit for review