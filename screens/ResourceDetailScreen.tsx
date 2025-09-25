import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Add more icons as needed
import { useTranslatedText } from '../components/TranslatedText';
import { fetchResourceById, fetchResourceDetails, fetchCategories, fetchSubcategories } from '../api/archive/api';
import { Category, Subcategory } from '../types/shared-schema';

// Replace PhoneDetails type with actual type
interface Resource {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  subcategoryId?: string;
  address?: string;
  phone?: string;
  phoneNumbers?: {
    main?: string;
    [key: string]: any;
  };
  url?: string;
  eligibility?: string;
  accessibility?: string;
  languages?: string[];
  hoursOfOperation?: string;
  organization?: string;
  serviceId?: string;
  // ...Add any other needed fields
}

// get id from navigation params
export default function ResourceDetailScreen({ route, navigation }: any) {
  const { id } = route.params;

  // Translation hooks (add more as needed)
  const { text: resourceDetailText } = useTranslatedText('Resource Details');
  const { text: callText } = useTranslatedText('Call');
  const { text: websiteText } = useTranslatedText('Visit Website');
  const { text: categoryText } = useTranslatedText('Category');
  const { text: subcategoryText } = useTranslatedText('Subcategory');
  const { text: descriptionText } = useTranslatedText('Description');
  const { text: phoneText } = useTranslatedText('Phone');
  const { text: eligibilityText } = useTranslatedText('Eligibility');
  const { text: accessibilityText } = useTranslatedText('Accessibility');
  const { text: languagesText } = useTranslatedText('Languages');
  const { text: addressText } = useTranslatedText('Address');
  const { text: hoursText } = useTranslatedText('Hours');
  const { text: loadingText } = useTranslatedText('Loading...');
  const { text: noDataText } = useTranslatedText('No data available');

  // Data loading
  const [resource, setResource] = useState<Resource | null>(null);

  const resourceQuery = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      // Try AsyncStorage first (recent results)
      const storedResources = await AsyncStorage.getItem('recentResources');
      if (storedResources) {
        const resourcesArr = JSON.parse(storedResources);
        const foundResource = resourcesArr.find((r: any) => r.id === id);
        if (foundResource) return foundResource;
      }
      // Fallback to API call
      return await fetchResourceById(id, true);
    },
    enabled: !!id
  });

  // Categories/subcategories
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });
  const subcategoriesQuery = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => fetchSubcategories('all')
  });

  useEffect(() => {
    if (resourceQuery.data) {
      setResource(resourceQuery.data);
    }
  }, [resourceQuery.data]);

  if (resourceQuery.isLoading || categoriesQuery.isLoading || subcategoriesQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#005191" />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>{noDataText}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <MaterialIcons name="arrow-back" size={20} color="#005191" />
          <Text style={{ color: '#005191', marginLeft: 8 }}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get category/subcategory info
  const category = categoriesQuery.data?.find((c: Category) => c.id === resource.categoryId);
  const subcategory = subcategoriesQuery.data?.find((sc: Subcategory) => sc.id === resource.subcategoryId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {/* Title */}
        <Text style={styles.title}>{resource.name}</Text>
        {/* Category and Subcategory */}
        <View style={styles.badgeRow}>
          {category && <Text style={styles.categoryBadge}>{category.name}</Text>}
          {subcategory && <Text style={styles.subcategoryBadge}>{subcategory.name}</Text>}
        </View>
        {/* Description */}
        {resource.description && (
          <Text style={styles.label}>{descriptionText}</Text>
        )}
        <Text style={styles.text}>{resource.description || noDataText}</Text>
      </View>

      {/* Contact, Website, Address */}
      <View style={styles.section}>
  {resource.phone && (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={() =>
        Linking.openURL(`tel:${(resource.phone ?? '').replace(/[^\d]/g, '')}`)
      }
    >
      <Ionicons name="call-outline" size={20} color="#005191" />
      <Text style={styles.actionLabel}>{callText}: {resource.phone}</Text>
    </TouchableOpacity>
  )}
  {resource.url && (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={() => Linking.openURL(resource.url ?? "")}
    >
      <Ionicons name="globe-outline" size={20} color="#005191" />
      <Text style={styles.actionLabel}>{websiteText}</Text>
    </TouchableOpacity>
  )}
  {resource.address && (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={() =>
        Linking.openURL(
          `https://maps.apple.com/?q=${encodeURIComponent(resource.address ?? '')}`
        )
      }
    >
      <Ionicons name="location-outline" size={20} color="#005191" />
      <Text style={styles.actionLabel}>{addressText}: {resource.address}</Text>
    </TouchableOpacity>
  )}
</View>


      {/* Extra Info */}
      <View style={styles.section}>
        {resource.hoursOfOperation && (
          <>
            <Text style={styles.label}>{hoursText}</Text>
            <Text style={styles.text}>{resource.hoursOfOperation}</Text>
          </>
        )}
        {resource.eligibility && (
          <>
            <Text style={styles.label}>{eligibilityText}</Text>
            <Text style={styles.text}>{resource.eligibility}</Text>
          </>
        )}
        {resource.accessibility && (
          <>
            <Text style={styles.label}>{accessibilityText}</Text>
            <Text style={styles.text}>{resource.accessibility}</Text>
          </>
        )}
        {resource.languages && (
          <>
            <Text style={styles.label}>{languagesText}</Text>
            <View style={styles.badgeRow}>
              {resource.languages.map(lang => (
                <Text key={lang} style={styles.languageBadge}>{lang}</Text>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  noDataText: { fontSize: 18, color: '#333', marginBottom: 16 },
  loadingText: { fontSize: 16, color: '#005191', marginTop: 10 },
  section: { margin: 16, padding: 16, backgroundColor: 'white', borderRadius: 8, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#005191' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8, gap: 6 },
  categoryBadge: { padding: 4, backgroundColor: '#e0e7ef', borderRadius: 4, color: '#005191', marginRight: 8 },
  subcategoryBadge: { padding: 4, backgroundColor: '#e9eef4', borderRadius: 4, color: '#007aff' },
  languageBadge: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#eef', borderRadius: 4, marginRight: 6 },
  label: { fontSize: 15, fontWeight: '600', marginTop: 12, color: '#222' },
  text: { fontSize: 14, color: '#333', marginTop: 4, marginBottom: 6 },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  actionLabel: { fontSize: 15, marginLeft: 8, color: '#007aff' },
  goBackButton: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
});