import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites, FavoriteResource } from '../contexts/FavoritesContext'; 
import { Ionicons } from '@expo/vector-icons';
import { useTranslatedText } from '../components/TranslatedText';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchSubcategories } from '../api/archive/api'; // Note: check path
import { Category, Subcategory } from '../types/shared-schema';

export default function FavoritesScreen({ navigation }: any) {
  const { 
    favorites, 
    isLoading,
    loadFavorites,
    removeFavorite,
    clearAllFavorites
  } = useFavorites();

  // Translations
  const { text: favoritesText } = useTranslatedText("My Favorites");
  const { text: noFavoritesText } = useTranslatedText("No favorites yet");
  const { text: noFavoritesDescText } = useTranslatedText("Start by adding resources to your favorites when browsing.");
  const { text: viewDetailsText } = useTranslatedText("View Details"); // Added back
  
  // Fetch categories/subcategories for display
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity,
  });
  const { data: subcategories = [] } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => fetchSubcategories('all'),
    staleTime: Infinity,
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });
    return unsubscribe;
  }, [navigation, loadFavorites]);

  // Removed unused category functions for brevity

  const renderFavorite = ({ item }: { item: FavoriteResource }) => {
    
    // Format the address properly - item.address is an object { streetAddress, city, stateProvince, ...}
    const formattedAddress = item.address
    ? [
        item.address.streetAddress,
        item.address.city,
        item.address.stateProvince,
      ]
      .filter(Boolean)
      .join(", ")
    : null;
        
    // Also ensuring item.phone is only the main number if it is an object
    const displayPhone = item.phone?.main || item.phone?.mobile || item.phone?.default || item.phone;

    // Determine the main title (Service Name or Organization Name)
    const mainTitle = item.name || item.organization || "Service Name Not Available";

    // Determine the subtitle (Organization Name, only if it's different from the title)
    let subTitle = '';
    if (item.organization && item.organization !== mainTitle) {
      subTitle = item.organization;
    }

    return (
      // 🛑 FIX: This is the ONLY TouchableOpacity that returns the content.
      // Ensure it passes the ID using the key expected by ResourceDetailScreen (usually 'resourceId').
      <TouchableOpacity
        style={styles.favoriteCard}
        onPress={() => {
          console.log(`Navigating to ResourceDetail with ID: ${item.id}`);
          navigation.navigate('ResourceDetail', { 
            // 🚨 CRITICAL FIX: Use the key expected by the destination screen
            resourceId: item.id, 
            // We pass the partial item data as a fallback, though resourceId is primary
            initialResourceData: item, 
          });
        }}
      >
        <View style={styles.favoriteContent}>
          {/* 1. Resource Name (Service Name or Organization fallback) */}
          <Text style={styles.favoriteName} numberOfLines={2}>{mainTitle}</Text>

          {/* 2. Organization Name (as subtitle, only if different from main title) */}
          {subTitle.length > 0 && (
            <Text style={styles.favoriteDescription} numberOfLines={1}>{subTitle}</Text>
          )}
          
          {/* 3. Address */}
          {formattedAddress && (
            <Text style={styles.favoriteAddress} numberOfLines={1}>
              <Ionicons name="location-outline" size={14} color="#888" /> {formattedAddress}
            </Text>
          )}
          
          {/* 4. Phone Number (NEW REQUIREMENT) */}
          {displayPhone && (
            <Text style={styles.favoritePhone} numberOfLines={1}>
              <Ionicons name="call-outline" size={14} color="#888" /> {displayPhone}
            </Text>
          )}
        </View>
        
        {/* Heart Dislike Icon (Remove Button) */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(item.id)}
        >
          {/* Required: heart-dislike icon */}
          <Ionicons name="heart-dislike" size={24} color="#D0021B" /> 
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }; 
  
  // <-- This closing bracket was previously missing, ensure it's here.

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{favoritesText}</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#005191" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{favoritesText}</Text>
      </View>
      {favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>{noFavoritesText}</Text>
          <Text style={styles.emptySubtext}>{noFavoritesDescText}</Text>
        </View>
      ) : (
        <View key="favorites-list-content" style={{ flex: 1 }}>
          <FlatList
            data={favorites}
            renderItem={renderFavorite}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <View style={styles.clearAllContainer}>
            <TouchableOpacity onPress={clearAllFavorites} style={styles.clearAllButton}>
              <Text style={styles.clearAllButtonText}>Clear All Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Styles remain the same) ...
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#005191',
    padding: 15,
    paddingTop: 20,
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
  favoriteCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteContent: {
    flex: 1,
    marginRight: 10,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#e0e7ef',
    color: '#005191',
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 12,
  },
  subcategoryTag: {
    backgroundColor: '#e9eef4',
    color: '#007aff',
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 12,
  },
  distanceTag: {
    fontSize: 12,
    color: '#222',
    marginLeft: 4,
  },
  favoriteDescription: {
    fontSize: 13,
    color: '#333',
    marginVertical: 3,
  },
  favoriteAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  favoritePhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 5,
  },
  separator: {
    height: 10,
  },
  clearAllContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  clearAllButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D0021B',
  },
  clearAllButtonText: {
    color: '#D0021B',
    fontWeight: '600',
  },
});