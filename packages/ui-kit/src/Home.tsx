import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useResources } from '@sb211/hooks/use-resources';
import { useLocation } from '@sb211/hooks/use-location';
import { useOnboarding } from '@sb211/hooks/use-onboarding';
import { useTranslatedText } from '@sb211/components/TranslatedText';
import { fetchCategories } from '@sb211/lib/api';
import { Category, Subcategory } from '@sb211/shared-schema';
import new211LogoPng from '@sb211/assets/new-211-logo.png';

const new211Logo = new211LogoPng as ImageSourcePropType;

export interface HomeProps {
  navigateTo: (route: string, params?: Record<string, any>) => void;
}

function Home({ navigateTo }: HomeProps) {
  // Onboarding & translation
  const { preferences } = useOnboarding();
  const { text: loadingText } = useTranslatedText('Loading...');
  const { text: footerText } = useTranslatedText('Resource Finder');
  const { text: footerSubtext } = useTranslatedText('Find local resources and services');

  // Initial URL filters (web only)
  const initFilters = () => {
    if (typeof window === 'undefined') return {};
    const p = new URLSearchParams(window.location.search);
    return {
      categoryId: p.get('category'),
      subcategoryId: p.get('subcategory'),
      zipCode: p.get('zipCode'),
    };
  };
  const { categoryId: urlCat, subcategoryId: urlSub } = initFilters();

  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(urlCat ?? null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(urlSub ?? null);
  const [keywordQuery, setKeywordQuery] = useState('');
  const [searchType, setSearchType] = useState<'category' | 'keyword'>('category');

  // Location
  const { locationState, requestCurrentLocation, setLocationByZipCode, clearLocation } = useLocation();
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Fetch categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Sort favorites
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

  // Resources
  const getLocationParam = () => {
    if (locationState.type === 'zipCode') {
      return { type: 'zipCode' as const, value: locationState.zipCode };
    }
    if (locationState.type === 'coordinates') {
      return { type: 'coordinates' as const, latitude: locationState.latitude, longitude: locationState.longitude };
    }
    return null;
  };
  const { resources = [], isLoading: loadingResources } = useResources(
    searchType === 'keyword' ? null : selectedCategoryId,
    searchType === 'keyword' ? null : selectedSubcategoryId,
    getLocationParam(),
    true,
    'relevance',
    searchType === 'keyword' ? keywordQuery : undefined
  );

  // Handlers
  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
    // Navigate to the "ResourcesList" screen, passing category param
    navigateTo('ResourcesList', { category: id });
  };
  const handleKeywordSearch = () => {
    if (!keywordQuery.trim()) return;
    setSearchType('keyword');
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    // Optionally navigate to ResourcesList based on keyword
    navigateTo('ResourcesList', { keyword: keywordQuery });
  };
  const handleUseLocation = async () => {
    setIsLocationLoading(true);
    await requestCurrentLocation().finally(() => setIsLocationLoading(false));
  };
  const handleZipChange = (zip: string) => {
    setIsLocationLoading(true);
    setLocationByZipCode(zip).finally(() => setIsLocationLoading(false));
  };
  const handleClear = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setKeywordQuery('');
    setSearchType('category');
    clearLocation();
  };

  return (
    <View style={styles.container}>
      <Image source={new211Logo} style={styles.logo} />

      {loadingCategories ? (
        <Text>{loadingText}</Text>
      ) : searchType === 'category' ? (
        <ScrollView contentContainerStyle={styles.list}>
          {sortedCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.item}
              onPress={() => handleCategorySelect(cat.id)}
            >
              <Text style={styles.itemText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.searchSection}>
          <TextInput
            style={styles.input}
            placeholder="Enter keyword"
            value={keywordQuery}
            onChangeText={setKeywordQuery}
            onSubmitEditing={handleKeywordSearch}
          />
          <TouchableOpacity style={styles.button} onPress={handleKeywordSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {(loadingResources || loadingSubcategories) ? (
        <Text>{loadingText}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {resources.map(res => (
            <TouchableOpacity
              key={res.id}
              style={styles.item}
              onPress={() => navigateTo('ResourceDetail', { id: res.id })}
            >
              <Text style={styles.itemText}>{res.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Text>{footerText} © {new Date().getFullYear()} | {footerSubtext}</Text>
      </View>
    </View>
  );
}
export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  logo: { width: 120, height: 40, margin: 16, resizeMode: 'contain' },
  list: { padding: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  itemText: { fontSize: 16 },
  searchSection: { padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginBottom: 8 },
  button: { backgroundColor: '#007aff', padding: 12, borderRadius: 4, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  footer: { padding: 16, alignItems: 'center' },
});
