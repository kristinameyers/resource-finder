import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface Resource {
  id: string;
  name: string;
  organization: string;
  description: string;
  address: string;
  phone: string;
  distance?: number;
}

const API_URL = 'http://localhost:5000';

export default function ResourceListScreen({ route, navigation }: any) {
  const { categoryId, categoryName, keyword, zipCode, use211Api } = route.params;
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, [categoryId, keyword, zipCode]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      if (categoryId) params.categoryId = categoryId;
      if (keyword) params.keyword = keyword;
      if (zipCode) params.zipCode = zipCode;
      if (use211Api) params.use211Api = 'true';

      const response = await axios.get(`${API_URL}/api/resources`, { params });
      setResources(response.data.resources || []);
    } catch (err) {
      setError('Failed to load resources');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderResource = ({ item }: { item: Resource }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
    >
      <View style={styles.resourceHeader}>
        <Text style={styles.resourceName} numberOfLines={2}>{item.name}</Text>
        {item.distance && (
          <Text style={styles.distance}>{item.distance.toFixed(1)} mi</Text>
        )}
      </View>
      <Text style={styles.organization} numberOfLines={1}>{item.organization}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.resourceInfo}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#005191" />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={48} color="#D0021B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchResources}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {categoryName || keyword || 'Resources'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {resources.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={48} color="#999" />
          <Text style={styles.noResultsText}>No resources found</Text>
          <Text style={styles.noResultsSubtext}>
            Try adjusting your search or location
          </Text>
        </View>
      ) : (
        <FlatList
          data={resources}
          renderItem={renderResource}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#005191',
    padding: 15,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#D0021B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#005191',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noResultsText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  noResultsSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 10,
  },
  resourceCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  resourceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  distance: {
    fontSize: 14,
    color: '#005191',
    fontWeight: '600',
  },
  organization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  separator: {
    height: 10,
  },
});