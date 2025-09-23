# Tamagui Mobile App - Testing Guide

## Quick Start Testing

### 1. Install Dependencies
```bash
cd expo-resource-finder
npm install
```

### 2. Start Development Server
```bash
npm start
```
This will open the Expo CLI with a QR code.

### 3. Test on Your Device
**Option A: Expo Go App (Recommended)**
1. Download "Expo Go" from App Store (iOS) or Google Play (Android)
2. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)
3. The app will load on your device

**Option B: iOS Simulator (Mac only)**
```bash
npm run ios
```

**Option C: Android Emulator**
```bash
npm run android
```

## Testing Checklist

### ✅ UI Components with Tamagui
- [ ] Home screen loads with blue header (#005191)
- [ ] Category grid displays in 3-column layout
- [ ] Category icons (42x42px) show correctly
- [ ] Touch interactions work smoothly
- [ ] Typography uses Inter font from Tamagui

### ✅ Core Functionality
- [ ] Location detection works (allow permissions)
- [ ] ZIP code entry and search function
- [ ] Category selection highlights correctly
- [ ] API calls to backend succeed
- [ ] Resource listings display properly

### ✅ Design Consistency
- [ ] Colors match web app exactly
- [ ] Layout matches 3-column grid specification
- [ ] Touch targets are appropriate size
- [ ] Animations feel smooth and responsive

### ✅ Performance
- [ ] App loads quickly
- [ ] Scrolling is smooth
- [ ] No lag when tapping categories
- [ ] API responses are fast

## Troubleshooting

**If QR code doesn't work:**
- Make sure your phone and computer are on same WiFi
- Try restarting the Expo development server
- Check firewall settings

**If categories don't show:**
- Check console for API connection errors
- Verify backend is running at rest-express.replit.app
- Test individual API endpoints

**If styling looks wrong:**
- Clear Expo cache: `expo start --clear`
- Restart the development server
- Check for TypeScript errors in console

## Expected Behavior

**Home Screen:**
- Blue header with white text
- Location display card
- ZIP code input with blue button
- Category grid with colored category cards
- Smooth scrolling and touch responses

**Category Cards:**
- 42x42px PNG icons
- Exact color matching from web app
- White selection border when tapped
- Slight scale animation on selection

**Navigation:**
- Tapping categories should eventually navigate to category pages
- Back navigation should work correctly
- State should persist between screens

## Performance Notes

Tamagui provides:
- Compile-time optimizations for faster rendering
- Better memory usage than StyleSheet
- Smooth animations with React Native Reanimated
- Consistent design tokens across all components
- Type-safe styling with TypeScript support

The app should feel noticeably faster and more responsive than the previous version.