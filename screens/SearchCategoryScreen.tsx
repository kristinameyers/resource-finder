import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslatedText } from "../components/TranslatedText";

// Import the static category data
import { MAIN_CATEGORIES } from "../taxonomy";

// Define the structure of the category map value
interface StaticCategory {
  name: string;
  icon: string | undefined; // Allows undefined to match source data
  keywords: string[];
  taxonomyCode: any;
}

// Define the navigation parameters
type RootStackParamList = {
  ResourceList: { category?: string; keyword: string; isSubcategory: boolean };
  SearchKeyword: undefined;
};

// Convert the object map into an array for easy mapping
const CATEGORIES_ARRAY: (StaticCategory & { id: string })[] = Object.entries(MAIN_CATEGORIES).map(
  ([id, cat]) => ({
    id, // e.g., 'housing'
    name: cat.name,
    icon: cat.icon,
    keywords: cat.keywords,
    taxonomyCode: cat.taxonomyCode,
  })
);

export default function SearchCategoryScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { text: searchCategoryText } = useTranslatedText("Search Category");
  const { text: searchKeywordText } = useTranslatedText("Search Keyword");
  const { text: searchByCategoryText } = useTranslatedText("Search by Category");

  // Removed all useQuery and related logic

  const categories = CATEGORIES_ARRAY;
  const isLoading = false; // Data is local

  const handleCategorySelect = (categoryName: string) => {
    navigation.navigate("ResourceList", {
      category: categoryName,
      keyword: categoryName,
      isSubcategory: false,
    });
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
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryBtn}
            onPress={() => handleCategorySelect(category.name)}
          >
            <View style={styles.iconCircle}>
              <MaterialIcons
                name={(category.icon || "local-offer") as keyof typeof MaterialIcons.glyphMap}
                size={26}
                color="#257"
              />
            </View>
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))
        }
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
  categoryBtn: {
    width: "30%", margin: "1.5%", backgroundColor: "#fff", borderRadius: 10, padding: 12,
    alignItems: "center", elevation: 2, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#e0effc", alignItems: "center", justifyContent: "center", marginBottom: 7 },
  categoryText: { fontSize: 15, color: "#222", textAlign: "center", fontWeight: "500" },
});