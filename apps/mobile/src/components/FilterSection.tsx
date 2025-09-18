import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Category, Subcategory, Location } from "../types/shared-schema";
import { Card } from "./ui/Card";
import { useTranslatedText } from "./TranslatedText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Helper: mobile category icon render
function CategoryIcon({ icon }: { icon?: string }) {
  if (!icon) return <Ionicons name="bookmark" size={18} color="#005191" style={{ marginRight: 6 }} />;
  const iconMap: Record<string, React.ReactNode> = {
    home: <Ionicons name="home" size={18} color="#005191" style={{ marginRight: 6 }} />,
    briefcase: <Ionicons name="briefcase" size={18} color="#005191" style={{ marginRight: 6 }} />,
    utensils: <MaterialCommunityIcons name="food" size={18} color="#005191" style={{ marginRight: 6 }} />,
    bus: <Ionicons name="bus" size={18} color="#005191" style={{ marginRight: 6 }} />,
    brain: <MaterialCommunityIcons name="brain" size={18} color="#005191" style={{ marginRight: 6 }} />,
    pill: <MaterialCommunityIcons name="pill" size={18} color="#005191" style={{ marginRight: 6 }} />,
    people: <Ionicons name="people" size={18} color="#005191" style={{ marginRight: 6 }} />,
    school: <Ionicons name="school" size={18} color="#005191" style={{ marginRight: 6 }} />,
    book: <Ionicons name="book" size={18} color="#005191" style={{ marginRight: 6 }} />,
    water: <MaterialCommunityIcons name="water" size={18} color="#005191" style={{ marginRight: 6 }} />,
    bulb: <Ionicons name="bulb" size={18} color="#005191" style={{ marginRight: 6 }} />,
  };
  return iconMap[icon] || <Ionicons name="bookmark" size={18} color="#005191" style={{ marginRight: 6 }} />;
}

interface FilterSectionProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  subcategories: Subcategory[];
  selectedSubcategoryId: string | null;
  onSubcategoryChange: (subcategoryId: string | null) => void;
  locationState: any;
  onUseMyLocation: () => void;
  onZipCodeChange: (zipCode: string) => void;
  onClearLocation: () => void;
  isLoadingSubcategories: boolean;
  isLoadingLocation: boolean;
}

export default function FilterSection({
  categories,
  selectedCategoryId,
  onCategoryChange,
  subcategories,
  selectedSubcategoryId,
  onSubcategoryChange,
  locationState,
  onUseMyLocation,
  onZipCodeChange,
  onClearLocation,
  isLoadingSubcategories,
  isLoadingLocation,
}: FilterSectionProps) {
  const { text: resourceFiltersText } = useTranslatedText("Resource Filters");
  const { text: findResourcesText } = useTranslatedText("Find resources by category and location");
  const { text: categoryText } = useTranslatedText("Category");
  const { text: allCategoriesText } = useTranslatedText("All Categories");
  const { text: subcategoryText } = useTranslatedText("Subcategory");
  const { text: allSubcategoriesText } = useTranslatedText("All Subcategories");
  const { text: loadingSubcategoriesText } = useTranslatedText("Loading subcategories...");
  const { text: noSubcategoriesText } = useTranslatedText("No subcategories available");
  const { text: selectSubcategoryText } = useTranslatedText("Select a subcategory");
  const { text: clearText } = useTranslatedText("Clear");
  const { text: usingCurrentLocationText } = useTranslatedText("Using your current location");
  const { text: coordinatesDetectedText } = useTranslatedText("Coordinates detected");
  const { text: zipCodeText } = useTranslatedText("Zip code");
  const { text: locationNotFoundText } = useTranslatedText("Location not found for this zip code");
  const { text: useMyLocationText } = useTranslatedText("Use My Location");
  const { text: enterZipCodeText } = useTranslatedText("Enter zip code");
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    if (locationState.type === "zipCode") setZipCode(locationState.zipCode);
    else setZipCode("");
  }, [locationState]);

  // Handlers
  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === "all" ? null : value);
    onSubcategoryChange(null);
  };
  const handleSubcategoryChange = (value: string) =>
    onSubcategoryChange(value === "all" ? null : value);
  const handleZipCodeSubmit = () => {
    if (zipCode.trim()) onZipCodeChange(zipCode);
  };

  return (
    <Card style={{ backgroundColor: "#FFB351", marginBottom: 24 }}>
      <Text style={styles.headerTitle}>{resourceFiltersText}</Text>
      <Text style={styles.headerDesc}>{findResourcesText}</Text>
      <View style={styles.section}>
        {/* Category filter */}
        <Text style={styles.label}>{categoryText}</Text>
        <ScrollView horizontal contentContainerStyle={styles.chipRow}>
          <TouchableOpacity
            style={[
              styles.chip,
              !selectedCategoryId && styles.chipActive,
            ]}
            onPress={() => handleCategoryChange("all")}
          >
            <Text style={styles.chipText}>{allCategoriesText}</Text>
          </TouchableOpacity>
          {categories
            .filter((c) => c.id && c.id.trim() !== "")
            .map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chip,
                  selectedCategoryId === c.id && styles.chipActive,
                ]}
                onPress={() => handleCategoryChange(c.id)}
              >
                <CategoryIcon icon={c.icon} />
                <Text style={styles.chipText}>{c.name}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
      {/* Subcategory filter */}
      {selectedCategoryId && (
        <View style={styles.section}>
          <Text style={styles.label}>{subcategoryText}</Text>
          <ScrollView horizontal contentContainerStyle={styles.chipRow}>
            <TouchableOpacity
              style={[
                styles.chip,
                !selectedSubcategoryId && styles.chipActive,
              ]}
              onPress={() => handleSubcategoryChange("all")}
              disabled={isLoadingSubcategories || subcategories.length === 0}
            >
              <Text style={styles.chipText}>{allSubcategoriesText}</Text>
            </TouchableOpacity>
            {subcategories
              .filter((s) => s.id && s.id.trim() !== "")
              .map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.chip,
                    selectedSubcategoryId === s.id && styles.chipActive,
                  ]}
                  onPress={() => handleSubcategoryChange(s.id)}
                  disabled={isLoadingSubcategories}
                >
                  <Text style={styles.chipText}>{s.name}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
          {isLoadingSubcategories && (
            <View style={styles.loadingRow}>
              <MaterialCommunityIcons name="loading" size={16} color="#256BAE" />
              <Text style={styles.loading}>{loadingSubcategoriesText}</Text>
            </View>
          )}
          {!isLoadingSubcategories && subcategories.length === 0 && (
            <Text style={styles.noSub}>{noSubcategoriesText}</Text>
          )}
        </View>
      )}
      {/* Location filter */}
      <View style={styles.section}>
        <Text style={styles.label}>{useMyLocationText}</Text>
        <View style={styles.locationRow}>
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={onUseMyLocation}
            disabled={isLoadingLocation}
          >
            <Ionicons name="location" size={20} color="#005191" style={{ marginRight: 6 }} />
            <Text style={styles.chipText}>{useMyLocationText}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
            <TextInput
              style={styles.zipInput}
              placeholder={enterZipCodeText}
              value={zipCode}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={setZipCode}
              editable={!isLoadingLocation}
              placeholderTextColor="#888"
              onSubmitEditing={handleZipCodeSubmit}
            />
            <TouchableOpacity
              style={styles.zipSubmitBtn}
              onPress={handleZipCodeSubmit}
              disabled={!zipCode.trim() || isLoadingLocation}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={onClearLocation}>
            <Ionicons name="close" size={16} color="#005191" />
          </TouchableOpacity>
        </View>
        {locationState.type === "coordinates" && (
          <Text style={styles.status}>
            {usingCurrentLocationText} {locationState.location ? locationState.location.name : coordinatesDetectedText}
          </Text>
        )}
        {locationState.type === "zipCode" && (
          <Text style={styles.status}>
            {zipCodeText}: {locationState.zipCode}{" "}
            {locationState.location ? locationState.location.name : locationNotFoundText}
          </Text>
        )}
        {locationState.type === "error" && (
          <Text style={styles.error}>{locationState.message}</Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#005191", marginBottom: 2 },
  headerDesc: { fontSize: 14, color: "#444", marginBottom: 10 },
  section: { marginBottom: 18 },
  label: { fontWeight: "600", color: "#005191", marginBottom: 6, fontSize: 15 },
  chipRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 6 },
  chip: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#256BAE22",
  },
  chipActive: { backgroundColor: "#256BAE22", borderColor: "#256BAE44" },
  chipText: { color: "#222", fontWeight: "500", fontSize: 15 },
  status: { color: "#333", fontSize: 14, marginTop: 6 },
  loadingRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  loading: { color: "#256BAE", fontSize: 13, marginLeft: 5 },
  noSub: { color: "#666", fontSize: 13, marginTop: 6 },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  locationBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#256BAE22",
  },
  zipInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#256BAE22",
    paddingHorizontal: 10,
    height: 40,
    fontSize: 14,
    width: 80,
    marginRight: 4,
    color: "#222"
  },
  zipSubmitBtn: {
    backgroundColor: "#256BAE",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  clearBtn: {
    marginLeft: 10,
    padding: 3,
    backgroundColor: "#fff",
    borderRadius: 6
  },
  error: {
    color: "#d33",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "bold"
  }
});
