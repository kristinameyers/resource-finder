import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Modal, Text } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { TranslatedText } from '../components/TranslatedText';
// <Image source={require('../assets/new-211-logo.png')} ... />
import { Linking } from "react-native";
import type { NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  UpdateLocation: undefined;
  // ...Add other routes as needed
};

interface GlobalNavbarProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  active?: string;
}

const menuItems = [
  { key: 'home', route: 'Home', text: 'Home' },
  { key: 'about', route: 'About', text: 'About' },
  { key: 'category', route: 'SearchCategory', text: 'Search by Category' },
  { key: 'keyword', route: 'SearchKeyword', text: 'Search by Keyword' },
  { key: 'location', route: 'UpdateLocation', text: 'Update Location' },
  { key: 'favorites', route: 'Favorites', text: 'Favorites' },
  { key: 'call', action: () => Linking.openURL('tel:211'), text: 'Call 211' },
  { key: 'settings', route: 'Settings', text: 'Settings' }
];

export default function GlobalNavbar({ showBackButton = false, onBackClick, active }: GlobalNavbarProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  const goBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigation.goBack();
    }
  };

  const goToLocation = () => {
    navigation.navigate('UpdateLocation');
    closeMenu();
  };

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    if (item.action) {
      item.action();
    } else if (item.route) {
      navigation.navigate(item.route as never);
    }
    closeMenu();
  };

  return (
    <View style={styles.globalNavbar}>
      <View style={styles.navLeft}>
        <TouchableOpacity style={styles.navIcon} onPress={openMenu}>
          <Ionicons name="menu" size={28} color="#005191" />
        </TouchableOpacity>
        {showBackButton ? (
          <TouchableOpacity style={styles.navIcon} onPress={goBack}>
            <Ionicons name="chevron-back" size={28} color="#005191" />
          </TouchableOpacity>
        ) : (
          <View style={styles.navIconPlaceholder} />
        )}
      </View>
      <View style={styles.navCenter}>
        <Image source={require('../assets/new-211-logo.png')} style={styles.navLogo} resizeMode="contain" />
      </View>
      <View style={styles.navRight}>
        <TouchableOpacity style={styles.navIcon} onPress={goToLocation}>
          <Ionicons name="location" size={28} color="#005191" />
        </TouchableOpacity>
      </View>
      <Modal visible={isMenuOpen} transparent animationType="slide">
        <TouchableOpacity style={styles.menuOverlay} onPress={closeMenu} />
        <View style={styles.slideMenu}>
          <TouchableOpacity style={styles.menuCloseBtn} onPress={closeMenu}>
            <Ionicons name="close" size={28} color="#222" />
          </TouchableOpacity>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuListItem}
              onPress={() => handleMenuItemClick(item)}
            >
              <TranslatedText text={item.text} />
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  globalNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    elevation: 3,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  navRight: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  navCenter: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  navIcon: { marginHorizontal: 6, padding: 4 },
  navIconPlaceholder: { width: 28, height: 28 },
  navLogo: { width: 48, height: 38 },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', opacity: 0.3, zIndex: 1 },
  slideMenu: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 240,
    backgroundColor: '#fff', zIndex: 2, paddingTop: 35,
    shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 14, elevation: 6,
  },
  menuCloseBtn: { alignSelf: 'flex-end', marginRight: 10, marginBottom: 16 },
  menuListItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }
});
