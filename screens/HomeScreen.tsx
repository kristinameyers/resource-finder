import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useOnboarding } from '../hooks/use-onboarding';
import { useLocation } from '../hooks/use-location';
import { useTranslatedText } from '../components/TranslatedText';
// Use the UNIFIED api location!
import { fetchCategories } from '../api/resourceApi';

import CategoryGrid from '../components/CategoryGrid';
import CategoryGridSkeleton from '../components/CategoryGridSkeleton';

import type { Category } from '../types/shared-schema';
import type { NavigationProp } from '@react-navigation/native';

const new211Logo = require('../assets/images/new-211-logo.png');

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

  const { locationState, requestCurrentLocation, setLocationByZipCode, clearLocation } = useLocation?.() || {};

  // Fetch categories (API) from the new resourceApi
  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Sort favorites first if preferred
  const sortedCategories = useMemo(() => {
    if (!preferences?.favoriteCategories?.length) return categories;
    const fav = categories.filter(c => preferences.favoriteCategories.includes(c.id));
    const other = categories.filter(c => !preferences.favoriteCategories.includes(c.id));
    fav.sort((a, b) => preferences.favoriteCategories.indexOf(a.id) - preferences.favoriteCategories.indexOf(b.id));
    return [...fav, ...other];
  }, [categories, preferences]);

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    navigation?.navigate?.('ResourceList', {
      categoryId,
      categoryName,
      zipCode,
      // No need for use211Api: true under the unified API; remove if not needed.
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation?.navigate?.('ResourceList', {
        keyword: searchQuery.trim(),
        zipCode,
      });
    }
  };

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

  console.log('categories length:', categories.length, 'sorted length:', sortedCategories.length);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={new211Logo} style={styles.logo} />
        <View style={styles.header}>
          <Text style={styles.title}>Santa Barbara 211</Text>
          <Text style={styles.subtitle}>{footerSubtext}</Text>
        </View>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for resources..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <View style={styles.locationBar}>
            <Ionicons name="location" size={20} color="#666" />
            <TextInput
              style={styles.locationInput}
              placeholder="Enter ZIP code"
              value={zipCode}
              onChangeText={handleZipChange}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>

        {/* Remove duplicate section header, let CategoryGrid handle its own label */}
        <View style={styles.categoriesSection}>
          {loadingCategories ? (
            <CategoryGridSkeleton />
          ) : (
            <CategoryGrid
              categories={sortedCategories} // Use sorted!
              onCategorySelect={handleCategoryPress}
              selectedCategoryId={selectedCategoryId}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text>{footerText} © {new Date().getFullYear()} | {footerSubtext}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ...styles unchanged...

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  logo: { width: 140, height: 60, margin: 16, resizeMode: 'contain', alignSelf: 'center' },
  header: { backgroundColor: '#005191', padding: 20, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: 'white', marginTop: 5 },
  searchSection: { padding: 15 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 10, padding: 10, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  locationBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 10, padding: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  locationInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  categoriesSection: { padding: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  footer: { padding: 16, alignItems: 'center' },
});
