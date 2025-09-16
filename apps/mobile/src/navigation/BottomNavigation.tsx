import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useTranslatedText } from "../components/TranslatedText";
import { useAccessibility } from "../contexts/AccessibilityContext";

function UsersIcon() {
  return <FontAwesome name="users" size={22} color="#fff" style={styles.icon} />;
}

// Define styles FIRST
const styles = StyleSheet.create({
  navBar: { /* ... */ },
  navBtn: { /* ... */ },
  navBtnActive: { /* ... */ },
  icon: { marginBottom: 2 },
  label: { /* ... */ },
  safeBottomIOS: { /* ... */ },
  safeBottomAndroid: { /* ... */ },
});

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

  // Define navItems **inside component**, so styles and labels are in scope
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
              accessibilityLabel={labels[item.id as keyof typeof labels] + " button"}
              style={btnStyle}
              onPress={() => {
                triggerHaptic?.("medium");
                item.action();
              }}
              activeOpacity={0.7}
            >
              {item.icon}
              <Text style={styles.label}>{labels[item.id as keyof typeof labels]}</Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity
            key={item.id}
            accessibilityLabel={"Navigate to " + labels[item.id as keyof typeof labels]}
            style={btnStyle}
            onPress={() => {
              triggerHaptic?.("light");
              item.route && navigation.navigate(item.route as never);
            }}
            activeOpacity={0.7}
          >
            {item.icon}
            <Text style={styles.label}>{labels[item.id as keyof typeof labels]}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={
        Platform.OS === "ios"
          ? styles.safeBottomIOS
          : styles.safeBottomAndroid
      } />
    </View>
  );
}
