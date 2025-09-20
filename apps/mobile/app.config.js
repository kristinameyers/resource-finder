// apps/mobile/app.config.js
export default {
  expo: {
    name: "Santa Barbara 211",
    slug: "sb211",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/sb211-icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/new-211-logo.png",
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
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "988aaa2e-2fa4-431d-8b6c-36aebc120953"
      }
    }
  }
};
