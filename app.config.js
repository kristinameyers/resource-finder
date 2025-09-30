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
      icon: "./assets/images/sb211-icon.png",
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
        versionCode: 1,
        "permissions": [
          "ACCESS_FINE_LOCATION"
        ],
        adaptiveIcon: {
          foregroundImage: "./assets/images/react-logo.png",
          backgroundColor: "#FFFFFF"
        }
      },
      web: {
        favicon: "./assets/images/favicon.png"
      },
      plugins: [
        "expo-font"
      ],
      
      // ✅ CONSOLIDATED 'extra' BLOCK
      extra: {
        // 1. KEEP: The API URL (public information)
        EXPO_PUBLIC_NATIONAL_211_API_URL: process.env.EXPO_PUBLIC_NATIONAL_211_API_URL,

        // 2. REMOVE: EXPO_PUBLIC_NATIONAL_211_API_KEY (it's now handled securely via EAS Secrets and eas.json)
        
        // 3. KEEP: The EAS project ID configuration
        eas: {
          projectId: "b75ac5b2-6971-45ec-859f-ad0b65644a77" 
        }
      }
    }
  };
};