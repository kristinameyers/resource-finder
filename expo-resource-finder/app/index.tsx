import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { View, Text, ScrollView, Button, Input, XStack, YStack } from 'tamagui';
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
    <View flex={1} backgroundColor="$background">
      <StatusBar style="light" backgroundColor="#005191" />
      
      {/* Header */}
      <View backgroundColor="#005191" paddingTop={60} paddingBottom={20} paddingHorizontal={20} alignItems="center">
        <Text fontSize={28} color="white" textAlign="center" marginBottom={5} fontFamily="$heading">
          Santa Barbara Community Resources
        </Text>
        <Text fontSize={16} color="white" textAlign="center" opacity={0.9} fontFamily="$body">
          Find local help and support services
        </Text>
      </View>

      <ScrollView flex={1} paddingHorizontal={20} showsVerticalScrollIndicator={false}>
        {/* Location Section */}
        <YStack marginTop={20} marginBottom={20}>
          <LocationDisplay location={location} />
          
          <XStack marginTop={15} alignItems="center" gap={10}>
            <Input
              flex={1}
              placeholder="Enter ZIP code"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              maxLength={5}
              backgroundColor="white"
              borderColor="$borderColor"
              paddingHorizontal={15}
              paddingVertical={12}
              fontSize={16}
            />
            <Button 
              backgroundColor="#005191" 
              color="white"
              paddingHorizontal={20}
              onPress={handleZipCodeSubmit}
            >
              ✓
            </Button>
          </XStack>
        </YStack>

        {/* Categories Section */}
        <YStack marginBottom={30}>
          <CategoryGrid
            categories={categories}
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
            isLoading={categoriesLoading}
          />
        </YStack>
      </ScrollView>
    </View>
  );
}

// Styles removed - now using Tamagui components