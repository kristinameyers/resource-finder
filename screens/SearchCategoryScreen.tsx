import React from "react";
import { useQuery } from "@tanstack/react-query";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslatedText } from "../components/TranslatedText";

// Use API base URL from Env
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

interface Category {
  id: string;
  name: string;
  icon: string;
  taxonomyCode: string;
}

type RootStackParamList = {
  ResourceList: { categoryId: string; useApi: boolean };
  SearchKeyword: undefined;
};

export default function SearchCategoryScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { text: searchCategoryText } = useTranslatedText("Search Category");
  const { text: searchKeywordText } = useTranslatedText("Search Keyword");
  const { text: searchByCategoryText } = useTranslatedText("Search by Category");
  const { text: loadingCategoriesText } = useTranslatedText("Loading categories...");

  // Fetch categories using .env API base
  const { data: categoriesResponse, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const url = `${API_BASE_URL}/categories`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const json = await response.json();
      return json.categories ?? [];
    },
  });
  const categories = categoriesResponse || [];

  const handleCategorySelect = (categoryId: string) => {
    navigation.navigate("ResourceList", { categoryId, useApi: true });
  };
  const handleSearchKeyword = () => {
    navigation.navigate("SearchKeyword");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, styles.toggleActive]}>
          <Text style={styles.toggleText}>{searchCategoryText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleBtn} onPress={handleSearchKeyword}>
          <Text style={styles.toggleText}>{searchKeywordText}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{searchByCategoryText}</Text>
      <View style={styles.grid}>
        {isLoading ? (
          <View style={styles.fullRow}>
            <Text style={styles.loadingText}>{loadingCategoriesText}</Text>
          </View>
        ) : (
          categories.map((category: Category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryBtn}
              onPress={() => handleCategorySelect(category.id)}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name={category.icon as keyof typeof MaterialIcons.glyphMap} size={26} color="#257" />

              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f9fa" },
  content: { padding: 16 },
  toggleRow: { flexDirection: "row", marginBottom: 14 },
  toggleBtn: { flex: 1, padding: 12, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  toggleActive: { backgroundColor: "#fbbf24" },
  toggleText: { fontWeight: "bold", color: "#222" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginVertical: 18, color: "#222" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", minHeight: 220 },
  fullRow: { flex: 1, alignItems: "center", justifyContent: "center", width: "100%", paddingVertical: 50 },
  loadingText: { fontSize: 17, color: "#666", textAlign: "center" },
  categoryBtn: {
    width: "30%", margin: "1.5%", backgroundColor: "#fff", borderRadius: 10, padding: 12,
    alignItems: "center", elevation: 2, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#e0effc", alignItems: "center", justifyContent: "center", marginBottom: 7 },
  categoryText: { fontSize: 15, color: "#222", textAlign: "center", fontWeight: "500" },
});
