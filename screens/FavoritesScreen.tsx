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
// Import useFavorites and FavoriteResource from the unified context file
import { useFavorites, FavoriteResource } from '../contexts/FavoritesContext'; 
import { Ionicons } from '@expo/vector-icons';
import { useTranslatedText } from '../components/TranslatedText';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchSubcategories } from '../api/archive/api';
import { Category, Subcategory } from '../types/shared-schema';

// Optionally typed navigation
export default function FavoritesScreen({ navigation }: any) {
  // 👇 Hook to access state and functions
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
  const { text: removeText } = useTranslatedText("Remove from favorites");
  const { text: viewDetailsText } = useTranslatedText("View Details");

  // Fetch categories/subcategories for display
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  const { data: subcategories = [] } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => fetchSubcategories('all'),
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    loadFavorites();
    });
    return unsubscribe;
  }, [navigation, loadFavorites]);

  const getCategoryName = (categoryId: string) =>
    categories.find((c: Category) => c.id === categoryId)?.name || 'Unknown Category';

  const getSubcategoryName = (subcategoryId?: string) =>
    subcategories.find((s: Subcategory) => s.id === subcategoryId)?.name || '';

  const renderFavorite = ({ item }: { item: FavoriteResource }) => {
    
    // 🌟 FIX: Format the address object into a string to prevent the crash
    // Assumes item.address is an object { streetAddress, city, stateProvince, ...}
    const formattedAddress = item.address && typeof item.address === 'object'
        ? [
            item.address.streetAddress,
            item.address.city,
            item.address.stateProvince,
          ]
          .filter(Boolean)
          .join(", ")
        : item.address; // Fallback if it was already a string
        
    // Also ensuring item.phone is only the main number if it is an object
    const displayPhone = item.phone && typeof item.phone === 'object' ? item.phone.main : item.phone;


    return (
      <TouchableOpacity
        style={styles.favoriteCard}
        onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
      >
        <View style={styles.favoriteContent}>
          <Text style={styles.favoriteName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryTag}>{getCategoryName(item.categoryId)}</Text>
            {item.subcategoryId && (
              <Text style={styles.subcategoryTag}> | {getSubcategoryName(item.subcategoryId)}</Text>
            )}
            {item.distance !== undefined && (
              <Text style={styles.distanceTag}> | {item.distance.toFixed(1)} mi</Text>
            )}
          </View>
          <Text style={styles.favoriteDescription} numberOfLines={2}>{item.description}</Text>
          
          {/* 🌟 FIX: Render the formatted string */}
          {formattedAddress && (
            <Text style={styles.favoriteAddress} numberOfLines={1}>
              <Ionicons name="location-outline" size={14} color="#888" /> {formattedAddress}
            </Text>
          )}
          
          {/* FIX: Ensure item.phone is a string if it's an object */}
          {displayPhone && (
            <Text style={styles.favoritePhone} numberOfLines={1}>
              <Ionicons name="call-outline" size={14} color="#888" /> {displayPhone}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(item.id)}
        >
          <Ionicons name="heart-dislike" size={24} color="#D0021B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }; // <-- This closing bracket was previously missing, ensure it's here.

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
        <>
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
        </>
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
    paddingTop: 40,
    alignItems: 'center',
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