import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useTranslatedText } from "@sb211/components/TranslatedText";
import { useAccessibility } from "@sb211/contexts/AccessibilityContext";

// Add appropriate icons from Expo vector icons
const navItems = [
  {
    id: "search",
    labelKey: "Search",
    icon: <Ionicons name="search" size={22} color="#fff" style={styles.icon} />,
    route: "Home",
    action: null,
  },
  {
    id: "favorites",
    labelKey: "Favorites",
    icon: <Ionicons name="heart" size={22} color="#fff" style={styles.icon} />,
    route: "Favorites",
    action: null,
  },
  {
    id: "call",
    labelKey: "Call",
    icon: <MaterialIcons name="call" size={22} color="#fff" style={styles.icon} />,
    route: null,
    action: () => Linking.openURL("tel:18004001572"),
  },
  {
    id: "about",
    labelKey: "About Us",
    icon: <UsersIcon />,
    route: "About",
    action: null,
  },
  {
    id: "settings",
    labelKey: "Settings",
    icon: <Ionicons name="settings-outline" size={22} color="#fff" style={styles.icon} />,
    route: "Settings",
    action: null,
  },
];

// Fallback custom icon for "about"
function UsersIcon() {
  return <FontAwesome name="users" size={22} color="#fff" style={styles.icon} />;
}

export function BottomNavigation() {
  const navigation = useNavigation();
  const route = useRoute();
  const { triggerHaptic, reduceMotion } = useAccessibility();

  // Translated labels
  const { text: searchText } = useTranslatedText("Search");
  const { text: favoritesText } = useTranslatedText("Favorites");
  const { text: callText } = useTranslatedText("Call");
  const { text: aboutText } = useTranslatedText("About Us");
  const { text: settingsText } = useTranslatedText("Settings");

  const labels = {
    search: searchText,
    favorites: favoritesText,
    call: callText,
    about: aboutText,
    settings: settingsText,
  };

  return (
    <View style={styles.navBar}>
      {navItems.map(item => {
        const isActive =
          (item.route && route.name === item.route) ||
          (item.id === "search" && route.name === "Home");
        const btnStyle = [
          styles.navBtn,
          isActive && styles.navBtnActive,
          reduceMotion && { transform: [{ scale: 1 }] }
        ];
        if (item.action) {
          return (
            <TouchableOpacity
              key={item.id}
              accessibilityLabel={labels[item.id] + " button"}
              style={btnStyle}
              onPress={() => {
                triggerHaptic?.("medium");
                item.action();
              }}
              activeOpacity={0.7}
            >
              {item.icon}
              <Text style={styles.label}>{labels[item.id]}</Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity
            key={item.id}
            accessibilityLabel={"Navigate to " + labels[item.id]}
            style={btnStyle}
            onPress={() => {
              triggerHaptic?.("light");
              item.route && navigation.navigate(item.route as never);
            }}
            activeOpacity={0.7}
          >
            {item.icon}
            <Text style={styles.label}>{labels[item.id]}</Text>
          </TouchableOpacity>
        );
      })}
      {/* Safe bottom area for iOS/Android */}
      <View style={Platform.OS === "ios" ? styles.safeBottomIOS : styles.safeBottomAndroid} />
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#66A8DD",
    paddingTop: 5,
    paddingBottom: 9,
    borderTopWidth: 1,
    borderColor: "#152941",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
  },
  navBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#152941",
    borderRadius: 20,
    width: 68,
    height: 58,
    marginHorizontal: 3,
    shadowColor: "#152941",
    shadowOpacity: 0.19,
    shadowRadius: 6,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  navBtnActive: {
    backgroundColor: "#387ba6",
    shadowOpacity: 0.3,
    borderWidth: 1,
    borderColor: "#FFB351",
    transform: [{ scale: 1.09 }]
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
    textAlign: "center",
  },
  safeBottomIOS: {
    height: 20,
    backgroundColor: "#66A8DD",
  },
  safeBottomAndroid: {
    height: 0,
  },
});
