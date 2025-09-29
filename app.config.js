export default {
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
    
  }
};
