// screens/HomeScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
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

// Data and hooks
import { useQuery } from '@tanstack/react-query';
import { useResources } from '../hooks/use-resources';
import { useLocation } from '../hooks/use-location';
import { useOnboarding } from '../hooks/use-onboarding';
import { useTranslatedText } from '../components/TranslatedText';
import { fetchCategories } from '../api/api';
// Types
import { Category, Subcategory } from '../types/shared-schema';
import type { NavigationProp } from '@react-navigation/native';

// Consts (adjust imports as needed)
const new211Logo = require('../assets/images/new-211-logo.png');

// Icon mapping for main categories
const categoryIconMap = {
  'housing': { icon: 'home', color: '#4A90E2' },
  'food': { icon: 'restaurant', color: '#F5A623' },
  'healthcare': { icon: 'medkit', color: '#BD10E0' },
  'mental-wellness': { icon: 'heart', color: '#7ED321' },
  'substance-use': { icon: 'medical', color: '#9013FE' },
  'children-family': { icon: 'people', color: '#50E3C2' },
  'young-adults': { icon: 'school', color: '#B8E986' },
  'legal-assistance': { icon: 'briefcase', color: '#417505' },
  'utilities': { icon: 'bulb', color: '#F8E71C' },
  'transportation': { icon: 'car', color: '#D0021B' },
  'hygiene-household': { icon: 'water', color: '#4A4A4A' },
  'finance-employment': { icon: 'cash', color: '#F5A623' },
  'education': { icon: 'book', color: '#002766' },
} as const;

// Navigation prop type
type HomeScreenNavProp = {
  navigation: NavigationProp<any>;
};

// Merged main component
export default function HomeScreen({ navigation }: HomeScreenNavProp) {
  // Onboarding & translation
  const { preferences } = useOnboarding?.() || {};
  const { text: loadingText } = useTranslatedText?.('Loading...') || { text: 'Loading...' };
  const { text: footerText } = useTranslatedText?.('Resource Finder') || { text: 'Resource Finder' };
  const { text: footerSubtext } = useTranslatedText?.('Find local resources and services') || { text: 'Find local resources and services' };

  // Search bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [searchType, setSearchType] = useState<'category' | 'keyword'>('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Location
  const { locationState, requestCurrentLocation, setLocationByZipCode, clearLocation } = useLocation?.() || {};
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Fetch categories (API)
  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Apply favorites sort if set
  const sortedCategories = useMemo(() => {
    if (!preferences?.favoriteCategories?.length) return categories;
    const fav = categories.filter(c => preferences.favoriteCategories.includes(c.id));
    const other = categories.filter(c => !preferences.favoriteCategories.includes(c.id));
    fav.sort((a, b) => preferences.favoriteCategories.indexOf(a.id) - preferences.favoriteCategories.indexOf(b.id));
    return [...fav, ...other];
  }, [categories, preferences]);

  // Fetch subcategories
  const { data: subcategories = [], isLoading: loadingSubcategories } = useQuery<Subcategory[]>({
    queryKey: ['subcategories', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const res = await fetch(`/api/subcategories?categoryId=${selectedCategoryId}`);
      const json = await res.json();
      return (json.subcategories as Subcategory[]) || [];
    },
    enabled: !!selectedCategoryId,
  });

  // Build location param for resource search
  const getLocationParam = () => {
    if (locationState?.type === 'zipCode') {
      return { type: 'zipCode' as const, value: locationState.zipCode };
    }
    if (locationState?.type === 'coordinates') {
      return { type: 'coordinates' as const, latitude: locationState.latitude, longitude: locationState.longitude };
    }
    return zipCode ? { type: 'zipCode' as const, value: zipCode } : null;
  };

  // Resources fetch
  const { resources = [], isLoading: loadingResources } = useResources?.(
    searchType === 'keyword' ? null : selectedCategoryId,
    null,
    getLocationParam(),
    true,
    'relevance',
    searchType === 'keyword' ? searchQuery : undefined
  ) || { resources: [], isLoading: false };

  // Handlers
  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSearchType('category');
    navigation?.navigate?.('ResourceList', {
      categoryId,
      categoryName,
      zipCode,
      use211Api: true,
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchType('keyword');
      navigation?.navigate?.('ResourceList', {
        keyword: searchQuery.trim(),
        zipCode,
        use211Api: true,
      });
    }
  };

  const handleUseLocation = async () => {
    setIsLocationLoading(true);
    await requestCurrentLocation?.().finally(() => setIsLocationLoading(false));
  };

  const handleZipChange = (zip: string) => {
    setIsLocationLoading(true);
    setZipCode(zip);
    setLocationByZipCode?.(zip).finally(() => setIsLocationLoading(false));
  };

  const handleClear = () => {
    setSelectedCategoryId(null);
    setSearchType('category');
    setSearchQuery('');
    clearLocation?.();
    setZipCode('');
  };

  // Render
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

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          {loadingCategories ? (
            <Text>{loadingText}</Text>
          ) : (
            <View style={styles.categoriesGrid}>
              {sortedCategories.map(category => {
                // icon mapping: fallback to 'help' if not defined
                const iconConf = categoryIconMap[category.id as keyof typeof categoryIconMap] || { icon: 'help', color: '#888' };
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryCard, { backgroundColor: iconConf.color + '20' }]}
                    onPress={() => handleCategoryPress(category.id, category.name)}
                  >
                    <Ionicons name={iconConf.icon as any} size={32} color={iconConf.color} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Featured Resources</Text>
          {(loadingResources || loadingSubcategories) ? (
            <Text>{loadingText}</Text>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {resources.map(res => (
                <TouchableOpacity
                  key={res.id}
                  style={styles.item}
                  onPress={() => navigation?.navigate?.('ResourceDetail', { id: res.id })}
                >
                  <Text style={styles.itemText}>{res.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.footer}>
          <Text>{footerText} © {new Date().getFullYear()} | {footerSubtext}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  logo: { width: 120, height: 40, margin: 16, resizeMode: 'contain', alignSelf: 'center' },
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
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: {
    width: '48%', padding: 15, borderRadius: 10, marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  categoryName: {
    marginTop: 10, fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#333',
  },
  resourcesSection: { padding: 15 },
  list: { padding: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  itemText: { fontSize: 16 },
  footer: { padding: 16, alignItems: 'center' },
});
