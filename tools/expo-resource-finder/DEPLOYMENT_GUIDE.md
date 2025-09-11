# Resource Finder Mobile App - Deployment Guide

## ✅ Assets Setup Complete

Your category icons have been successfully copied:
- ✅ children-family.png
- ✅ food.png  
- ✅ education.png
- ✅ housing.png
- ✅ healthcare.png
- ✅ finance-employment.png
- ✅ substance-use.png
- ✅ young-adults.png
- ✅ legal-assistance.png
- ✅ hygiene-household.png

## 🚀 Next Steps for App Store Deployment

### 1. Install Dependencies
```bash
cd expo-resource-finder
npm install
```

### 2. Create Required App Icons
You need to create these files in `assets/`:
- `icon.png` (1024x1024) - Main app icon
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `splash.png` (1284x2778) - Launch screen
- `favicon.png` (48x48) - Web favicon

**Design Specs:**
- Use your brand colors (#005191 blue background)
- Include "Resource Finder" or "RF" text
- Keep design simple and recognizable at small sizes

### 3. Test Locally
```bash
npm start
```
Then scan QR code with Expo Go app on your phone.

### 4. Configure Bundle Identifiers
Update `app.json`:
- iOS: `"bundleIdentifier": "com.yourcompany.resourcefinder"`
- Android: `"package": "com.yourcompany.resourcefinder"`

Replace `yourcompany` with your actual company/organization name.

### 5. App Store Deployment Commands

**Initialize EAS (one time):**
```bash
npx eas login
npx eas build:configure
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
npx eas submit --platform ios    # Requires Apple Developer account
npx eas submit --platform android # Requires Google Play Console
```

### 6. Store Listing Information

**App Name:** Resource Finder
**Description:** Find local community resources and support services in Santa Barbara. Access food assistance, housing, healthcare, education, and more with real-time data from 211 providers.

**Keywords:** community resources, 211, Santa Barbara, assistance, support services, food, housing, healthcare

**Category:** Medical or Social Networking

### 7. Testing Checklist Before Submission

- [ ] App loads successfully on iOS and Android
- [ ] Location permission works correctly
- [ ] Category navigation functions properly
- [ ] Resource search returns results
- [ ] Contact buttons (call, website) work
- [ ] App doesn't crash during normal usage
- [ ] Icons and branding look correct

## 📱 API Connection

The app is configured to connect to: `https://rest-express.replit.app`

Make sure this URL is accessible and your backend is deployed on Replit.

## 🔧 Troubleshooting

**Build Errors:**
- Ensure all required icons are present in `assets/`
- Check bundle identifiers are unique and properly formatted
- Verify Apple Developer/Google Play accounts are properly linked

**API Issues:**
- Test your backend API endpoints directly
- Check CORS settings allow mobile app requests
- Verify all environment variables are set correctly

## 📞 Support

If you encounter issues during deployment:
1. Check Expo documentation: https://docs.expo.dev/
2. Review build logs in Expo dashboard
3. Test thoroughly with Expo Go before building standalone apps