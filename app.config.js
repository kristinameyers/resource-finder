// app.config.js - CORRECTED VERSION

module.exports = ({ config }) => {
  return {
    ...config,
    expo: {
      name: "Santa Barbara 211",
      slug: "resource-finder",
      version: "1.0.0",
      owner: "sb211",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/images/new-211-logo.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      assetBundlePatterns: [
        "**/*"
      ],
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.appbundle.sb211",
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false
        }
      },
      android: {
        package: "com.appbundle.sb211",
        versionCode: 3,
        "permissions": [
          "ACCESS_FINE_LOCATION"
        ],
        adaptiveIcon: {
          foregroundImage: "./assets/images/icon.png",
          backgroundColor: "#FFFFFF"
        }
      },
      web: {
        favicon: "./assets/images/icon.png"
      },
      plugins: [
        "expo-font"
      ],
      
      // ✅ API KEY
      extra: {
        // 1. The API URL (public information)
        EXPO_PUBLIC_NATIONAL_211_API_URL: process.env.EXPO_PUBLIC_NATIONAL_211_API_URL,

        // 2. Inject the private key value into the app's manifest
        // The value of NATIONAL_211_API_KEY is read during the build
        // and is copied into the app's static manifest for runtime access.
        national211ApiKey: process.env.NATIONAL_211_API_KEY, 
        
        // 3. EAS project ID configuration
        eas: {
          projectId: "b75ac5b2-6971-45ec-859f-ad0b65644a77" 
        }
      }
    }
  };
};