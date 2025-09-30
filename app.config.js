// app.config.js - CORRECT VERSION

module.exports = ({ config }) => {
  return {
    ...config,
    // The main 'expo' object contains all your static configuration
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
      
      // ✅ Insert the 'extra' block here, inside the main 'expo' object
      extra: {
        // You can safely use 'eas' here, as the spread operator isn't needed
        // when defining the whole 'extra' block.
        eas: {
          projectId: "b75ac5b2-6971-45ec-859f-ad0b65644a77" 
        }
      }
    }
  };
};