import React from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { Resource, Category, Subcategory } from "../types/shared-schema";
import ResourceCard from "./ResourceCard";
import ResourceCardSkeleton from "./ResourceCardSkeleton";
import SortControl from "./SortControl";
import { Button } from "./ui/Button";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTranslatedText } from "./TranslatedText";

interface ResultsSectionProps {
  resources: Resource[];
  totalCount: number;
  categories: Category[];
  subcategories: Subcategory[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onClearFilters: () => void;
  selectedCategoryId?: string | null;
  sortBy: 'relevance' | 'distance' | 'name';
  onSortChange: (value: 'relevance' | 'distance' | 'name') => void;
  hasLocation: boolean;
}

export default function ResultsSection({
  resources,
  totalCount,
  categories,
  subcategories,
  isLoading,
  error,
  onRetry,
  onClearFilters,
  selectedCategoryId,
  sortBy,
  onSortChange,
  hasLocation
}: ResultsSectionProps) {
  const { text: loadingResourcesText } = useTranslatedText("Loading resources...");
  const { text: noResourcesText } = useTranslatedText("No resources found");
  const { text: errorLoadingDetailsText } = useTranslatedText("There was an error loading the resources. Please try again.");
  const { text: retryText } = useTranslatedText("Retry");
  const { text: clearFiltersText } = useTranslatedText("Clear Filters");
  const { text: foundText } = useTranslatedText("Found");
  const { text: liveDataText } = useTranslatedText("Live 211 Data");

  const getCategoryForResource = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const getSubcategoryForResource = (subcategoryId?: string) => {
    if (!subcategoryId) return undefined;
    return subcategories.find(s => s.id === subcategoryId);
  };

  // Loading state - show skeleton cards
  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.loadingRow}>
          <Feather name="loader" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.loadingText}>{loadingResourcesText}</Text>
        </View>
        <View style={styles.grid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <ResourceCardSkeleton key={index} />
          ))}
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.sectionCentered}>
        <Ionicons name="alert-circle" size={44} color="#f87171" style={{ marginBottom: 14 }} />
        <Text style={styles.errorTitle}>{noResourcesText}</Text>
        <Text style={styles.errorDesc}>{errorLoadingDetailsText}</Text>
        <View style={styles.buttonRow}>
          <Button onPress={onRetry} style={styles.errorBtn}>{retryText}</Button>
          <Button onPress={onClearFilters} variant="outline">{clearFiltersText}</Button>
        </View>
      </View>
    );
  }

  // Empty state
  if (resources.length === 0) {
    return (
      <View style={styles.sectionCentered}>
        <Text style={styles.errorTitle}>{noResourcesText}</Text>
        <Text style={styles.errorDesc}>
          No resources match your current filters. Try changing your filters or clearing them.
        </Text>
        <Button onPress={onClearFilters}>{clearFiltersText}</Button>
      </View>
    );
  }

  // Get the selected category if there is one
  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;

  // Display results
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          {totalCount} Resource{totalCount !== 1 && "s"}
          {selectedCategory ? ` in ${selectedCategory.name}` : " Found"}
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.liveData}>{liveDataText}</Text>
          <SortControl
            value={sortBy}
            onValueChange={onSortChange}
            hasLocation={hasLocation}
          />
          {selectedCategoryId && (
            <Button variant="outline" onPress={onClearFilters}>
              {clearFiltersText}
            </Button>
          )}
        </View>
      </View>
      <FlatList
        data={resources}
        keyExtractor={(item) => `${item.id}-${item.categoryId}`}
        renderItem={({ item }) => (
          <ResourceCard
            resource={item}
            category={getCategoryForResource(item.categoryId)}
            subcategory={item.subcategoryId ? getSubcategoryForResource(item.subcategoryId) : undefined}
          />
        )}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: "#005191", borderRadius: 16, padding: 18, marginBottom: 18 },
  sectionCentered: {
    backgroundColor: "#005191",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 240,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  liveData: {
    backgroundColor: "#bbf7d0",
    color: "#166534",
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 10,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  loadingText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  grid: { gap: 14, marginTop: 6 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 10 },
  errorDesc: { fontSize: 15, color: "#e0e0e0", marginBottom: 12, textAlign: "center" },
  buttonRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  errorBtn: { backgroundColor: "#fff", color: "#005191" },
});
