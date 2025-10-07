import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Navigation
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
// Data Fetching
import { useQuery } from '@tanstack/react-query';
import { useOnboarding } from '../hooks/use-onboarding';
// Location Handling
import { useLocation } from '../hooks/use-location';
// Utilities
import { useTranslatedText } from '../components/TranslatedText';
import { fetchCategories, fetchResourcesByMainCategory } from '../api/resourceApi';
import { useFocusEffect } from '@react-navigation/native';
// Components
import CategoryGrid from '../components/CategoryGrid';
import CategoryGridSkeleton from '../components/CategoryGridSkeleton';
// Types
import type { Category, ResourcePage } from '../types/shared-schema';
import type { NavigationProp } from '@react-navigation/native';
import { getCategoryIcon } from '../taxonomy';
import { useAccessibility } from '../contexts/AccessibilityContext'; // 👈 IMPORTED

const new211Logo = require('../assets/images/new-211-logo.png');
const SAVED_ZIP = 'saved_zip_code';
const SAVED_LAT = "userLatitude";
const SAVED_LNG = "userLongitude";

// GEOGRAPHIC VALIDATION
const SANTA_BARBARA_COUNTY_ZIPS = [
  '93101', '93102', '93103', '93105', '93106', '93107', '93108', '93109', '93110',
  '93111', '93116', '93117', '93118', '93120', '93121', '93130', '93140', '93150',
  '93160', '93190', '93199', '93254', '93427', '93429', '93436', '93437', '93441',
  '93454', '93455', '93458', '93460', '93463', '93464', '92092', '93465', '93483',
  '93486', '93487', '93488', '93490'
];

type HomeScreenNavProp = {
  navigation: NavigationProp<any>;
};

// --- START OF COMPONENT ---

export default function HomeScreen({ navigation }: HomeScreenNavProp) {
  // ✅ ACCESS THE CONTEXT
  const { theme, getFontSize, highContrast } = useAccessibility();
  
  const { preferences } = useOnboarding() || {};
  const { text: footerSubtext } = useTranslatedText('Find local resources and services') || { text: 'Find local resources and services' };
  const { text: footerText } = useTranslatedText('Resource Finder') || { text: 'Resource Finder' };

  const [searchQuery, setSearchQuery] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [zipTouched, setZipTouched] = useState(false);

  const {
    locationState,
    refreshLocation,
    requestCurrentLocation,
    setLocationByZipCode,
    clearLocation,
  } = useLocation?.() || {};

  useFocusEffect(
    useCallback(() => {
      setSelectedCategoryId(null);
      refreshLocation?.();
    }, []) 
  );
  
  useEffect(() => {
    if (locationState?.type === 'zipCode') {
      setZipCode(locationState.zipCode);
    } else if (locationState?.type === 'coordinates' || locationState?.type === 'none') {
      setZipCode('');
    }
  }, [locationState]);

  const handleZipChange = useCallback(
    (zip: string) => {
      setZipCode(zip);
      setZipTouched(false);
    },
    []
  );

  const handleSaveZip = useCallback(async () => {
    setZipTouched(true);
    Keyboard.dismiss();

    if (zipCode.length === 5) {
      setLocationByZipCode?.(zipCode);
    }

    try {
      await AsyncStorage.setItem(SAVED_ZIP, zipCode);
      await AsyncStorage.removeItem(SAVED_LAT);
      await AsyncStorage.removeItem(SAVED_LNG);
    } catch (e) {
      console.error('Failed saving ZIP', e);
    }
  }, [zipCode, setLocationByZipCode]);

  const handleClearZip = useCallback(async () => {
    setZipCode('');
    setZipTouched(false);
    Keyboard.dismiss();
    clearLocation?.();

    try {
      await AsyncStorage.removeItem(SAVED_ZIP);
      await AsyncStorage.removeItem(SAVED_LAT); 
      await AsyncStorage.removeItem(SAVED_LNG);
    } catch (e) {
      console.error('Failed clearing ZIP', e);
    }
  }, [clearLocation]);

  const handleStartNewSearch = useCallback(async () => {
    setZipCode('');
    setZipTouched(false);
    await AsyncStorage.removeItem(SAVED_ZIP);
  }, []);

  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  const sortedCategories = useMemo(() => {
    if (!preferences?.favoriteCategories?.length) return categories;
    const favoriteIds = preferences.favoriteCategories.map(String);
    const fav = categories.filter(c => favoriteIds.includes(String(c.id)));
    const other = categories.filter(c => !favoriteIds.includes(String(c.id)));
    fav.sort(
      (a, b) =>
        favoriteIds.indexOf(String(a.id)) -
        favoriteIds.indexOf(String(b.id))
    );
    return [...fav, ...other];
  }, [categories, preferences]);

  const handleCategoryPress = useCallback(
    (categoryIdRaw: string | number, categoryName: string) => {
      const categoryId = String(categoryIdRaw);
      const icon = getCategoryIcon(categoryId) || undefined;
      setSelectedCategoryId(categoryId);
      navigation.navigate("ResourceList", {
        keyword: categoryName,
        zipCode,
        categoryId,
        categoryName,
        categoryIcon: icon,
      });
    },
    [navigation, zipCode]
  );

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigation.navigate('ResourceList', {
        keyword: searchQuery.trim(),
        zipCode,
      });
    }
  }, [navigation, searchQuery, zipCode]);

  // --- ZIP CODE VALIDATION: placed after hooks, before main return ---
  if (zipTouched && zipCode.length === 5 && !SANTA_BARBARA_COUNTY_ZIPS.includes(zipCode)) {
    // 💡 FIX 1: Replace theme.error with a fallback color (#c00) or theme.primary
    const errorColor = highContrast ? theme.primary : '#c00'; // Use primary or a distinct red
    const errorBg = highContrast ? theme.backgroundSecondary : '#ffe5e5'; // Use secondary background for contrast circle

    return (
      // ✅ HC: Apply background color
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        {/* ✅ HC: Apply error colors */}
        <View style={[styles.iconCircle, { 
          backgroundColor: errorBg, 
          shadowColor: highContrast ? theme.border : '#c00', // Use border for shadow in HC
          borderColor: highContrast ? errorColor : 'transparent',
          borderWidth: highContrast ? 2 : 0,
        }]}>
          <MaterialIcons name="error-outline" size={getFontSize(54)} color={errorColor} />
        </View>
        {/* FONT SCALING & HC */}
        <Text style={[styles.errorTitle, { fontSize: getFontSize(20), color: errorColor }]}>Out of Service Area</Text>
        {/* FONT SCALING & HC */}
        <Text style={[styles.error, { fontSize: getFontSize(17), color: errorColor }]}>That zip code is out of our service range</Text>
        {/* ✅ HC: Apply button colors */}
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary, shadowColor: highContrast ? 'transparent' : theme.primary }]} onPress={handleStartNewSearch}>
          {/* FONT SCALING & HC */}
          <Text style={[styles.retryText, { fontSize: getFontSize(16), color: theme.backgroundSecondary }]}>Start New Search</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- MAIN RENDER ---
  return (
    // ✅ HC: Apply background color
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Image source={new211Logo} style={styles.logo} />
        {/* ✅ HC: Apply header background and text colors */}
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          {/* FONT SCALING & HC */}
          <Text style={[styles.title, { fontSize: getFontSize(22), color: theme.backgroundSecondary }]}>Santa Barbara 211</Text>
          {/* FONT SCALING & HC */}
          <Text style={[styles.subtitle, { fontSize: getFontSize(16), color: theme.backgroundSecondary }]}>{footerSubtext}</Text>
        </View>
        <View style={styles.searchSection}>
          {/* Search Bar */}
          <View style={[styles.searchBarWrapper, { 
            backgroundColor: theme.backgroundSecondary, 
            borderColor: theme.border, 
            borderWidth: highContrast ? 1 : 0.5,
            // 💡 FIX 2: Replace theme.shadow with a hardcoded, semi-transparent black
            shadowColor: highContrast ? 'transparent' : '#000', 
          }]}>
            <Ionicons name="search" size={getFontSize(24)} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { 
                fontSize: getFontSize(16), 
                color: theme.text,
              }]}
              placeholder="Type a keyword..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="go"
            />
            {/* Go Button */}
            <TouchableOpacity
              style={[styles.goButton, { backgroundColor: theme.accent }]}
              onPress={handleSearch}
              disabled={!searchQuery.trim()}
            >
              {/* FONT SCALING & HC */}
              <Text style={[styles.goButtonText, { fontSize: getFontSize(16), color: theme.backgroundSecondary }]}>Go</Text>
            </TouchableOpacity>
          </View>
          
          {/* Location Bar */}
          <View style={[styles.locationBar, { 
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border, 
            borderWidth: highContrast ? 1 : 0.5,
            // 💡 FIX 3: Replace theme.shadow with a hardcoded, semi-transparent black
            shadowColor: highContrast ? 'transparent' : '#000', 
          }]}>
            <Ionicons name="location" size={getFontSize(24)} color={theme.textSecondary} />
            <TextInput
              style={[styles.locationInput, { 
                fontSize: getFontSize(16), 
                color: theme.text,
              }]}
              placeholder="Enter a ZIP code"
              placeholderTextColor={theme.textSecondary}
              value={zipCode}
              onChangeText={handleZipChange}
              keyboardType="numeric"
              maxLength={5}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {zipCode ? (
              // Clear Button
              // 💡 FIX 4: Replace theme.error with theme.accent (or another contrasting color like primary)
              <TouchableOpacity style={[styles.clearButton, { backgroundColor: theme.primary }]} onPress={handleClearZip}>
                {/* FONT SCALING & HC */}
                <Text style={[styles.clearButtonText, { fontSize: getFontSize(14), color: theme.backgroundSecondary }]}>Clear</Text>
              </TouchableOpacity>
            ) : null}
            {/* Save Button */}
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.accent }]} onPress={handleSaveZip}>
              {/* FONT SCALING & HC */}
              <Text style={[styles.saveButtonText, { fontSize: getFontSize(15), color: theme.backgroundSecondary }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.categoriesSection}>
          {loadingCategories ? (
            <CategoryGridSkeleton /> 
          ) : (
            <CategoryGrid
              categories={sortedCategories.map((cat: Category) => ({
                ...cat,
                icon: getCategoryIcon(cat.id) || undefined,
              }))}
              onCategorySelect={handleCategoryPress}
              selectedCategoryId={selectedCategoryId}
            />
          )}
        </View>
        
        {/* Footer */}
        {/* ✅ HC: Apply background and text colors */}
        <View style={[styles.footer, { backgroundColor: theme.backgroundSecondary, borderTopWidth: highContrast ? 1 : 0, borderTopColor: theme.border }]}>
          <Text style={{ fontSize: getFontSize(14), color: theme.textSecondary }}>
            {footerText} © {new Date().getFullYear()} | {footerSubtext}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Styles are left largely unchanged as they are overridden inline)
  container: { flex: 1, backgroundColor: '#fdfdfdff' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffe5e5', // Will be overridden
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#c00', // Will be overridden
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  errorTitle: {
    color: "#c00", // Will be overridden
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 9,
  },
  error: {
    color: "#c00", // Will be overridden
    textAlign: "center",
    marginBottom: 10,
  },
  logo: { width: 180, height: 100, margin: 2, resizeMode: 'contain', alignSelf: 'center' },
  header: { backgroundColor: '#005191', padding: 13, alignItems: 'center' },
  title: { fontWeight: 'bold', color: 'white' },
  subtitle: { color: 'white' },
  searchSection: { padding: 14 },

  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ddd',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    height: 60,
  },
  searchIcon: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#333333',
    height: '100%',
    paddingRight: 5,
  },
  goButton: {
    backgroundColor: '#005191',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  goButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  locationBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 10, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  locationInput: { flex: 1, marginLeft: 10, color: '#333333' },
  saveButton: { marginLeft: 12, backgroundColor: '#ffb351', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  saveButtonText: { color: 'black', fontWeight: '600' },
  clearButton: { marginLeft: 8, backgroundColor: '#dc3545', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  clearButtonText: { color: 'white', fontWeight: '600' },
  categoriesSection: { padding: 0 },
  footer: { padding: 16, alignItems: 'center' },
  retryBtn: {
    marginTop: 22,
    backgroundColor: "#005191",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 7,
    shadowColor: '#005191',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 3,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});