import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslatedText } from "../components/TranslatedText";

// Type for your navigator stack
type RootStackParamList = {
  ResourceList: { keyword: string; useApi: boolean };
  SearchCategory: undefined;
};

export default function SearchKeywordScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [keyword, setKeyword] = useState<string>("");
  const { text: searchCategoryText } = useTranslatedText("Search Category");
  const { text: searchKeywordText } = useTranslatedText("Search Keyword");
  const { text: searchWithKeywordText } = useTranslatedText("Search with Keyword");

    // Actions
  const handleSearch = () => {
    if (keyword.trim()) {
      navigation.navigate("ResourceList", {
        keyword: keyword.trim(),
        useApi: true,
      });
      Keyboard.dismiss();
    }
  };

  const handleSearchCategory = () => {
    navigation.navigate("SearchCategory");
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <TouchableOpacity style={styles.toggleBtn} onPress={handleSearchCategory}>
          <Text style={styles.toggleText}>{searchCategoryText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, styles.toggleActive]}>
          <Text style={styles.toggleText}>{searchKeywordText}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{searchWithKeywordText}</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Keyword"
          value={keyword}
          onChangeText={setKeyword}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.searchBtn, !keyword.trim() && styles.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={!keyword.trim()}
        >
          <Ionicons name="search" size={22} color={keyword.trim() ? "#fff" : "#ccc"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f7", padding: 18 },
  toggleRow: { flexDirection: "row", marginBottom: 14 },
  toggleBtn: {
    flex: 1, padding: 12, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: "#fff"
  },
  toggleActive: { backgroundColor: "#fbbf24" },
  toggleText: { fontWeight: "700", color: "#222" },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center", marginVertical: 18, color: "#222" },
  searchRow: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  searchInput: {
    flex: 1, backgroundColor: "#fff", paddingVertical: 11, paddingHorizontal: 14,
    fontSize: 16, borderRadius: 10, marginRight: 10,
    borderWidth: 1, borderColor: "#e0e0e0"
  },
  searchBtn: {
    backgroundColor: "#fbbf24", padding: 13, borderRadius: 10,
    justifyContent: "center", alignItems: "center"
  },
  searchBtnDisabled: {
    backgroundColor: "#ffe9b5",
  },
});
