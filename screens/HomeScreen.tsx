// ------------------------------------------------------------
// File:  HomeScreen.tsx
// ------------------------------------------------------------
import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useOnboarding } from '../hooks/use-onboarding';
import { useLocation } from '../hooks/use-location';
import { useTranslatedText } from '../components/TranslatedText';
import { fetchCategories, fetchResourcesByMainCategory } from '../api/resourceApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CategoryGrid from '../components/CategoryGrid';
import CategoryGridSkeleton from '../components/CategoryGridSkeleton';

import type { Category } from '../types/shared-schema';
import type { NavigationProp } from '@react-navigation/native';

/* --------------------------------------------------------------
   TAXONOMY HELPERS – NOTE THE IMPORT PATH
   -------------------------------------------------------------- */
import {
  getCategoryIcon,
} from '../taxonomy';

const new211Logo = require('../assets/images/new-211-logo.png');
const SAVED_ZIP = 'saved_zip_code';

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

  const {
    locationState,
    requestCurrentLocation,
    setLocationByZipCode,
    clearLocation,
  } = useLocation?.() || {};

  // Load saved ZIP on mount
  useEffect(() => {
    AsyncStorage.getItem(SAVED_ZIP).then(saved => {
      if (saved) {
        setZipCode(saved);
        setLocationByZipCode?.(saved);
      }
    });
  }, [setLocationByZipCode]);

  // Save current ZIP
  const handleSaveZip = async () => {
    try {
      await AsyncStorage.setItem(SAVED_ZIP, zipCode);
    } catch (e) {
      console.error('Failed saving ZIP', e);
    }
  };

  // 1️⃣ FETCH CATEGORIES
  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // 2️⃣ SORT FAVORITES
  const sortedCategories = useMemo(() => {
    if (!preferences?.favoriteCategories?.length) return categories;

    const fav = categories.filter(c => preferences.favoriteCategories.includes(c.id));
    const other = categories.filter(c => !preferences.favoriteCategories.includes(c.id));

    fav.sort(
      (a, b) =>
        preferences.favoriteCategories.indexOf(a.id) -
        preferences.favoriteCategories.indexOf(b.id)
    );

    return [...fav, ...other];
  }, [categories, preferences]);

  // 3️⃣ CATEGORY PRESS
  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    const icon = getCategoryIcon(categoryId) || undefined;
    setSelectedCategoryId(categoryName);
    navigation.navigate("ResourceList", {
      keyword: categoryName,
      zipCode,
      categoryId,
      categoryName,
      categoryIcon: icon,
    });
  };

  // FETCH MAIN CATEGORY RESOURCES
  const {
    data: mainCategoryResources = { items: [], total: 0, hasMore: false },
    isLoading: loadingMainCategoryResources,
    error: mainCategoryError,
  } = useQuery({
    queryKey: ['main-category-resources', selectedCategoryId, zipCode],
    queryFn: () =>
      selectedCategoryId
        ? fetchResourcesByMainCategory(selectedCategoryId, 0, 20)
        : Promise.resolve({ items: [], total: 0, hasMore: false }),
    enabled: Boolean(selectedCategoryId),
  });

  // 4️⃣ SEARCH
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('ResourceList', {
        keyword: searchQuery.trim(),
        zipCode,
      });
    }
  };

  // 5️⃣ LOCATION
  const handleUseLocation = async () => {
    await requestCurrentLocation?.();
  };

  const handleZipChange = (zip: string) => {
    setZipCode(zip);
    setLocationByZipCode?.(zip);
  };

  const handleClear = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
    clearLocation?.();
    setZipCode('');
  };

  // RENDER
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={new211Logo} style={styles.logo} />
        <View style={styles.header}>
          <Text style={styles.title}>Santa Barbara 211</Text>
          <Text style={styles.subtitle}>{footerSubtext}</Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={24} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Type a keyword..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>

          {/* ZIP + SAVE */}
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
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveZip}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CATEGORY GRID */}
        <View style={styles.categoriesSection}>
          {loadingCategories ? (
            <CategoryGridSkeleton />
          ) : (
            <CategoryGrid
              categories={sortedCategories.map(cat => ({
                ...cat,
                icon: getCategoryIcon(cat.id) || undefined,
              }))}
              onCategorySelect={handleCategoryPress}
              selectedCategoryId={selectedCategoryId}
            />
          )}
        </View>

        {/* FOOTER */}
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
  container: { flex: 1, backgroundColor: '#ffffff' },
  logo: { width: 160, height: 80, margin: 8, resizeMode: 'contain', alignSelf: 'center' },
  header: { backgroundColor: '#005191', padding: 15, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: 'white' },
  searchSection: { padding: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 10, padding: 18, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333333' },
  locationBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 10, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  locationInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333333' },
  saveButton: { marginLeft: 12, backgroundColor: '#005191', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  saveButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  categoriesSection: { padding: 15 },
  footer: { padding: 16, alignItems: 'center' },
});
