import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CategoryGrid } from '../components/CategoryGrid';
import { LocationDisplay } from '../components/LocationDisplay';
import { API_BASE_URL } from '../constants/api';

export default function HomePage() {
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);
  const [zipCode, setZipCode] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      return data.categories || [];
    },
  });

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to find nearby resources.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    router.push(`/category/${categoryId}`);
  };

  const handleZipCodeSubmit = async () => {
    if (!zipCode.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/location/zipcode/${zipCode}`);
      if (response.ok) {
        const locationData = await response.json();
        setLocation({
          coords: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          }
        });
      } else {
        Alert.alert('Error', 'Invalid ZIP code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to lookup ZIP code');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#005191" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Santa Barbara Community Resources</Text>
        <Text style={styles.headerSubtitle}>Find local help and support services</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Section */}
        <View style={styles.locationSection}>
          <LocationDisplay location={location} />
          
          <View style={styles.zipCodeContainer}>
            <TextInput
              style={styles.zipCodeInput}
              placeholder="Enter ZIP code"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              maxLength={5}
            />
            <TouchableOpacity style={styles.zipCodeButton} onPress={handleZipCodeSubmit}>
              <Text style={styles.zipCodeButtonText}>✓</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <CategoryGrid
            categories={categories}
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
            isLoading={categoriesLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Roboto-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'Roboto-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  zipCodeContainer: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
  },
  zipCodeInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontFamily: 'Roboto-Regular',
  },
  zipCodeButton: {
    backgroundColor: '#005191',
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  zipCodeButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  categoriesSection: {
    marginBottom: 30,
  },
});