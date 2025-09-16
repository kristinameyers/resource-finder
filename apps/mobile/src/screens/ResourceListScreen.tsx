import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from "@tanstack/react-query";
import { filterSantaBarbaraAndSort } from "src/utils/distanceUtils"; // You may need to move this to a package.
import { useTranslatedText } from "@sb211/components/TranslatedText";

interface Resource {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  location: string;
  zipCode?: string;
  address: string;
  serviceAreas?: string;
  distanceMiles?: number;
}

interface Category { id: string; name: string; }
interface Subcategory { id: string; name: string; categoryId: string; }

function getFavorites() {
  return AsyncStorage.getItem("favorites").then(data => {
    try {
      return data ? JSON.parse(data) as string[] : [];
    } catch {
      return [];
    }
  });
}

function saveFavorites(favs: string[]) {
  AsyncStorage.setItem("favorites", JSON.stringify(favs));
}

export default function ResourcesListScreen() {
  const navigation = useNavigation();
  // Route params to get category/keyword, or use Context/provider for search state.
  const route = useRoute();
  const categoryId = route.params?.categoryId || null;
  const keyword = route.params?.keyword || null;

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"relevance" | "distance">("relevance");
  const [filtersActive, setFiltersActive] = useState(false);

  // Translations
  const { text: sb211Text } = useTranslatedText("Santa Barbara 211");
  const { text: updateLocationText } = useTranslatedText("Update Location");
  const { text: loadingText } = useTranslatedText("Loading...");
  const { text: viewDetailsText } = useTranslatedText("View Details");
  const { text: favoritedText } = useTranslatedText("Favorited");
  const { text: addToFavoritesText } = useTranslatedText("Add to Favorites");
  const { text: allSubcategoriesText } = useTranslatedText("All Subcategories");
  const { text: clearFiltersText } = useTranslatedText("Clear Filters");
  const { text: noResourcesText } = useTranslatedText("No resources found in Santa Barbara County.");
  const { text: resourcesInText } = useTranslatedText("Resources in");
  const { text: searchResultsText } = useTranslatedText("Search Results");

  useEffect(() => {
    // Get user zip code from AsyncStorage
    AsyncStorage.getItem('userZipCode').then(zipCode => {
      if (zipCode) setUserLocation(zipCode);
    });
    getFavorites().then(setFavorites);
  }, []);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  // Fetch categories
  const { data: categoriesResponse } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch('https://api.example.com/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });
  const categories = categoriesResponse || [];

  // Fetch subcategories
  const { data: subcategoriesResponse } = useQuery<Subcategory[]>({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => {
      if (!categoryId) throw new Error('Category ID required');
      const response = await fetch(`https://api.example.com/subcategories?categoryId=${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      return response.json();
    },
    enabled: !!categoryId,
  });
  const subcategories = subcategoriesResponse || [];

  // Build query string for resources
  let queryParams: string[] = [];
  if (categoryId) queryParams.push(`categoryId=${categoryId}`);
  if (selectedSubcategory && selectedSubcategory !== 'all') queryParams.push(`subcategoryId=${selectedSubcategory}`);
  if (keyword) queryParams.push(`keyword=${keyword}`);
  if (userLocation) queryParams.push(`zipCode=${userLocation}`);
  const queryStr = queryParams.join('&');

  // Fetch resources
  const { data: resourcesData, isLoading } = useQuery<Resource[]>({
    queryKey: ["resources", queryStr],
    queryFn: async () => {
      const response = await fetch(`https://api.example.com/resources?${queryStr}`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      const result = await response.json();
      // Save resources for detail screen
      await AsyncStorage.setItem('recentResources', JSON.stringify(result.resources));
      return result.resources || [];
    },
    enabled: !!(categoryId || keyword),
  });

  let processedResources: Resource[] = resourcesData || [];
  const currentCategory = categories.find((cat: Category) => cat.id === categoryId);
  const filteredSubcategories = subcategories.filter((sub: Subcategory) => sub.categoryId === categoryId);

  // Distance sorting if requested
  if (sortBy === "distance" && !!userLocation) {
    processedResources = filterSantaBarbaraAndSort(processedResources, userLocation);
  }

  // Handle favorites using AsyncStorage
  const handleToggleFavorite = async (resource: Resource) => {
    let next: string[];
    if (favorites.includes(resource.id)) {
      next = favorites.filter(id => id !== resource.id);
    } else {
      next = [...favorites, resource.id];
    }
    setFavorites(next);
    saveFavorites(next);
  };

  // Navigation actions
  const handleBack = () => navigation.goBack();
  const handleLocationClick = () => navigation.navigate('UpdateLocation');
  const handleResourceClick = (resourceId: string) => navigation.navigate('ResourceDetail', { id: resourceId });
  const handleSortChange = (value: "relevance" | "distance") => setSortBy(value);
  const handleClearFilters = () => setSelectedSubcategory("all");

  // Dropdown for subcategory selection
  const SubcategoryPicker = () => (
    filteredSubcategories.length > 0 ?
    <View style={styles.pickerContainer}>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => {/* Show picker modal/dialog */}}
      >
        <Text style={styles.pickerText}>{selectedSubcategory === "all" ? allSubcategoriesText : filteredSubcategories.find(s => s.id === selectedSubcategory)?.name || allSubcategoriesText}</Text>
        <Ionicons name="chevron-down" size={16} color="#333" />
      </TouchableOpacity>
      {/* Implement picker modal/dialog here as needed */}
    </View>
    : null
  );

  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => {/* TODO: Hamburger menu */}}>
          <Ionicons name="menu" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleLocationClick}>
          <Ionicons name="location" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{sb211Text}</Text>
      </View>

      {/* Filters and Controls */}
      <View style={styles.filters}>
        <SubcategoryPicker />
        <TouchableOpacity style={styles.locationBtn} onPress={handleLocationClick}>
          <Text style={styles.locationBtnText}>{updateLocationText}</Text>
        </TouchableOpacity>
        {/* Sort options: simple segment control */}
        <View style={styles.sortRow}>
          <TouchableOpacity onPress={() => handleSortChange("relevance")} style={[styles.sortOption, sortBy === "relevance" && styles.sortActive]}>
            <Text style={sortBy === "relevance" ? styles.sortActiveText : styles.sortText}>Relevance</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSortChange("distance")} style={[styles.sortOption, sortBy === "distance" && styles.sortActive]}>
            <Text style={sortBy === "distance" ? styles.sortActiveText : styles.sortText}>Distance</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleClearFilters} style={styles.clearFiltersBtn}>
          <Text style={styles.clearFiltersText}>{clearFiltersText}</Text>
        </TouchableOpacity>
        <Text style={styles.resultsLabel}>
          {isLoading ? loadingText :
            `${processedResources.length} ${resourcesInText} ${(currentCategory?.name || keyword || searchResultsText)}`}
        </Text>
      </View>

      {/* Resources List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {isLoading ? (
          <View style={styles.centerContainer}><Text>{loadingText}</Text></View>
        ) : processedResources.length === 0 ? (
          <View style={styles.centerContainer}><Text>{noResourcesText}</Text></View>
        ) : (
          processedResources.map((resource: Resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceCard}
              onPress={() => handleResourceClick(resource.id)}
            >
              <View style={styles.cardTitleRow}>
                <Text style={styles.resourceTitle}>{resource.name}</Text>
                {resource.distanceMiles && (
                  <Text style={styles.distanceBadge}>{resource.distanceMiles} mi</Text>
                )}
              </View>
              <Text style={styles.resourceDesc}>{resource.description}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.locationText}>{resource.location}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.favoriteBtn}
                  onPress={() => handleToggleFavorite(resource)}
                >
                  <Ionicons name={favorites.includes(resource.id) ? "heart" : "heart-outline"} size={20} color="#D0021B" />
                  <Text style={{ marginLeft: 4, color: favorites.includes(resource.id) ? "#D0021B" : "#333" }}>
                    {favorites.includes(resource.id) ? favoritedText : addToFavoritesText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() => handleResourceClick(resource.id)}
                >
                  <Ionicons name="eye-outline" size={20} color="#005191" />
                  <Text style={{ marginLeft: 4, color: "#005191" }}>{viewDetailsText}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      {/* Add your GlobalNavbar here if you migrate it to mobile */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  navBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  iconBtn: { padding: 8 },
  header: { alignItems: "center", paddingVertical: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", color: "#005191" },
  filters: { padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  pickerContainer: { marginBottom: 8 },
  picker: { flexDirection: "row", alignItems: "center", padding: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 6 },
  pickerText: { fontSize: 15, color: "#222", flex: 1 },
  locationBtn: { marginBottom: 8, padding: 8, backgroundColor: "#e0e7ef", borderRadius: 4, alignItems: "center" },
  locationBtnText: { color: "#005191", fontWeight: "600" },
  sortRow: { flexDirection: "row", marginVertical: 8 },
  sortOption: { flex: 1, alignItems: "center", padding: 8 },
  sortActive: { borderBottomWidth: 2, borderBottomColor: "#005191" },
  sortText: { color: "#222", fontWeight: "500" },
  sortActiveText: { color: "#005191", fontWeight: "700" },
  clearFiltersBtn: { marginTop: 8, alignItems: "center" },
  clearFiltersText: { color: "#007aff", fontWeight: "500" },
  resultsLabel: { marginTop: 12, textAlign: "center", fontSize: 15, fontWeight: "500", color: "#222" },
  listContainer: { padding: 16 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  resourceCard: { backgroundColor: "#fff", marginBottom: 12, borderRadius: 8, padding: 14, elevation: 3 },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resourceTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  distanceBadge: { fontSize: 14, color: "#007aff", fontWeight: "600" },
  resourceDesc: { color: "#555", fontSize: 14, marginVertical: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  locationText: { color: "#666",fontSize: 14, marginLeft: 4 },
  cardActions: { flexDirection: "row", marginTop: 8 },
  favoriteBtn: { flexDirection: "row", alignItems: "center", marginRight: 18 },
  detailsBtn: { flexDirection: "row", alignItems: "center" },
});
