import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { API_BASE_URL } from '../../constants/api';

export default function CategoryPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Fetch category data
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      return data.categories || [];
    },
  });

  // Fetch subcategories
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery({
    queryKey: ['subcategories', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/subcategories?category=${id}`);
      const data = await response.json();
      return data.subcategories || [];
    },
    enabled: !!id,
  });

  // Fetch resources
  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources', id, selectedSubcategory],
    queryFn: async () => {
      let url = `${API_BASE_URL}/api/resources?category=${id}`;
      if (selectedSubcategory) {
        url += `&subcategory=${selectedSubcategory}`;
      }
      const response = await fetch(url);
      return response.json();
    },
    enabled: !!id,
  });

  const currentCategory = categories.find(cat => cat.id === id);
  const resources = resourcesData?.resources || [];

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#005191" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentCategory?.name || 'Category'}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Subcategories */}
        {subcategoriesLoading ? (
          <ActivityIndicator size="large" color="#005191" style={styles.loader} />
        ) : (
          <View style={styles.subcategoriesSection}>
            <Text style={styles.sectionTitle}>Subcategories</Text>
            <View style={styles.subcategoriesGrid}>
              {subcategories.map((subcategory: any) => (
                <TouchableOpacity
                  key={subcategory.id}
                  style={[
                    styles.subcategoryCard,
                    selectedSubcategory === subcategory.id && styles.selectedSubcategory,
                  ]}
                  onPress={() => {
                    setSelectedSubcategory(
                      selectedSubcategory === subcategory.id ? null : subcategory.id
                    );
                  }}
                >
                  <Text style={styles.subcategoryText}>{subcategory.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>
            Resources ({resources.length})
          </Text>
          
          {resourcesLoading ? (
            <ActivityIndicator size="large" color="#005191" style={styles.loader} />
          ) : (
            <View>
              {resources.map((resource: any) => (
                <TouchableOpacity
                  key={resource.id}
                  style={styles.resourceCard}
                  onPress={() => router.push(`/resource/${resource.id}`)}
                >
                  <Text style={styles.resourceName}>{resource.name}</Text>
                  <Text style={styles.resourceDescription}>{resource.description}</Text>
                  {resource.distance && (
                    <Text style={styles.resourceDistance}>{resource.distance} mi</Text>
                  )}
                </TouchableOpacity>
              ))}
              
              {resources.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No resources found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#005191',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  headerTitle: {
    fontFamily: 'League Gothic',
    fontSize: 24,
    color: 'white',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subcategoriesSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
  },
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subcategoryCard: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSubcategory: {
    backgroundColor: '#005191',
    borderColor: '#005191',
  },
  subcategoryText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#333',
  },
  resourcesSection: {
    marginBottom: 30,
  },
  resourceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resourceName: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  resourceDescription: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resourceDistance: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#005191',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#666',
  },
});