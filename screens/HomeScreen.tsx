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

export default function HomeScreen({ navigation }: HomeScreenNavProp) {
  const { preferences } = useOnboarding() || {};
  const { text: loadingText } = useTranslatedText('Loading...') || { text: 'Loading...' };
  const { text: footerText } = useTranslatedText('Resource Finder') || { text: 'Resource Finder' };
  const { text: footerSubtext } = useTranslatedText('Find local resources and services') || { text: 'Find local resources and services' };

  const [searchQuery, setSearchQuery] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [zipTouched, setZipTouched] = useState(false); // Track user-initiated zip validation

  const {
    locationState,
    refreshLocation,
    requestCurrentLocation,
    setLocationByZipCode,
    clearLocation,
  } = useLocation?.() || {};

  // Whenever locationState changes, update AsyncStorage
  useFocusEffect(
    useCallback(() => {
      // 1. Clear any existing selected category ID every time the screen is focused
      setSelectedCategoryId(null);

      // 2. Trigger the global location hook to check AsyncStorage and update its state.
      refreshLocation?.();

      // Cleanup function is NOT strictly necessary for this logic but is good practice,
      // and having an empty dependency array ensures the callback is stable.
    }, []) 
  );
  
  // HOOK: Update local ZIP state when locationState changes (e.g., after refreshLocation runs)
  useEffect(() => {
    if (locationState?.type === 'zipCode') {
      // If hook has ZIP, sync it to local input field
      setZipCode(locationState.zipCode);
    } else if (locationState?.type === 'coordinates' || locationState?.type === 'none') {
      // If hook has GPS or no location, clear local input field
      setZipCode('');
    }
    // We only depend on locationState to avoid endless re-runs if other vars change
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
      // 1. Update the central location hook (triggers search updates, updates locationState)
      setLocationByZipCode?.(zipCode);
    }

    try {
      // Save ZIP and clear GPS keys to ensure precedence
      await AsyncStorage.setItem(SAVED_ZIP, zipCode);
      await AsyncStorage.removeItem(SAVED_LAT);
      await AsyncStorage.removeItem(SAVED_LNG);
    } catch (e) {
      console.error('Failed saving ZIP', e);
    }
  }, [zipCode, setLocationByZipCode]);

  const handleClearZip = useCallback(async () => {
    // 1. Clears local state
    setZipCode('');
    setZipTouched(false);
    Keyboard.dismiss();
    clearLocation?.();

    try {
      // 2. CLEARS SAVED ZIP (CRITICAL for ResourceListScreen HOOK 2)
      await AsyncStorage.removeItem(SAVED_ZIP);
      await AsyncStorage.removeItem(SAVED_LAT); 
      await AsyncStorage.removeItem(SAVED_LNG);
      console.log('✅ Cleared saved zip code and storage.');

      // OPTIONAL: If the list is directly visible after this, you may need a local refetch trigger,
      // but relying on HOOK 2/7 in ResourceListScreen is usually sufficient if navigating back/forth.

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

  const {
    data: mainCategoryResources = { items: [], total: 0, hasMore: false },
    isLoading: loadingMainCategoryResources,
    error: mainCategoryError,
  } = useQuery<ResourcePage>({
    queryKey: ['main-category-resources', selectedCategoryId, zipCode],
    queryFn: () => {
      if (!selectedCategoryId) return Promise.resolve({ items: [], total: 0, hasMore: false });
      return fetchResourcesByMainCategory(
        selectedCategoryId,
        zipCode,
        0,
        20
      );
    },
    enabled: Boolean(selectedCategoryId),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  });

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigation.navigate('ResourceList', {
        keyword: searchQuery.trim(),
        zipCode,
      });
    }
  }, [navigation, searchQuery, zipCode]);

  const handleUseLocation = useCallback(async () => {
    await requestCurrentLocation?.();
  }, [requestCurrentLocation]);

  // --- ZIP CODE VALIDATION: placed after hooks, before main return ---
  if (zipTouched && zipCode.length === 5 && !SANTA_BARBARA_COUNTY_ZIPS.includes(zipCode)) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="error-outline" size={54} color="#c00" />
        </View>
        <Text style={styles.errorTitle}>Out of Service Area</Text>
        <Text style={styles.error}>That zip code is out of our service range</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleStartNewSearch}>
          <Text style={styles.retryText}>Start New Search</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Image source={new211Logo} style={styles.logo} />
        <View style={styles.header}>
          <Text style={styles.title}>Santa Barbara 211</Text>
          <Text style={styles.subtitle}>{footerSubtext}</Text>
        </View>
        <View style={styles.searchSection}>
          <View style={styles.searchBarWrapper}>
            <Ionicons name="search" size={24} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Type a keyword..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="go" // Change return key to 'go'
            />
            <TouchableOpacity
              style={styles.goButton}
              onPress={handleSearch}
              disabled={!searchQuery.trim()} // Disable if input is empty
            >
              <Text style={styles.goButtonText}>Go</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationBar}>
            <Ionicons name="location" size={24} color="#666666" />
            <TextInput
              style={styles.locationInput}
              placeholder="Enter a ZIP code"
              placeholderTextColor="#666666"
              value={zipCode}
              onChangeText={handleZipChange}
              keyboardType="numeric"
              maxLength={5}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {zipCode ? (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearZip}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveZip}>
              <Text style={styles.saveButtonText}>Save</Text>
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
        <View style={styles.footer}>
          <Text>
            {footerText} © {new Date().getFullYear()} | {footerSubtext}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#ffe5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#c00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 20,
    color: "#c00",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 9,
  },
  error: {
    color: "#c00",
    fontSize: 17,
    textAlign: "center",
    marginBottom: 10,
  },
  logo: { width: 180, height: 100, margin: 2, resizeMode: 'contain', alignSelf: 'center' },
  header: { backgroundColor: '#005191', padding: 13, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: 'white' },
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
    overflow: 'hidden', // Crucial to clip the button's corners
    height: 60, // Give it a fixed height
  },
  searchIcon: {
    paddingLeft: 20,
    paddingRight: 10,
    color: '#666666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    height: '100%',
    paddingRight: 5, // Small padding before the button
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
    fontSize: 16,
    fontWeight: '600',
  },

  locationBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 10, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  locationInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333333' },
  saveButton: { marginLeft: 12, backgroundColor: '#ffb351', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  saveButtonText: { color: 'black', fontSize: 15, fontWeight: '600' },
  clearButton: { marginLeft: 8, backgroundColor: '#dc3545', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  clearButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
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
  retryText: { color: "#fff", fontWeight: "600", fontSize: 16, letterSpacing: 0.2 },
});
