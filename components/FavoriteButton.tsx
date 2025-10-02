import React, { memo } from "react"; // Import memo from React
import { Text, StyleSheet, ViewStyle, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./ui/Button";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTranslatedText } from "./TranslatedText";
import type { FavoriteResource } from "../contexts/FavoritesContext";

interface FavoriteButtonProps {
  resource: FavoriteResource;
  style?: ViewStyle;
  showText?: boolean;
}

// 1. Define the component as a regular function
function FavoriteButton({
  resource,
  style,
  showText = true,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(resource.id);

  const { text: addToFavoritesText } = useTranslatedText("Add to Favorites");
  const { text: removeFromFavoritesText } = useTranslatedText("Remove from Favorites");

  const handleToggle = () => {
    toggleFavorite(resource);
  };
  
  // --- Start: Icon-Only Logic (List View) ---
  if (!showText) {
    return (
      <TouchableOpacity
        onPress={handleToggle}
        style={[styles.iconOnlyContainer, style]} // Use a simple TouchableOpacity
      >
        <Ionicons
          name={favorite ? "heart" : "heart-outline"}
          size={24} // Use a clearly visible size
          color={favorite ? "#D0021B" : "#333"} // Dark color for outline visibility
        />
      </TouchableOpacity>
    );
  }
  // --- End: Icon-Only Logic ---

  // --- Start: Full Button Logic (Detail View) ---
  return (
    <Button
      onPress={handleToggle}
      // Use the variant system ONLY for the full button view
      variant={favorite ? "default" : "outline"} 
      style={[
        styles.defaultButton,
        favorite && styles.favorite,
        style,
      ] as ViewStyle[]}
    >
      <Ionicons
        name={favorite ? "heart" : "heart-outline"}
        size={18} // Smaller icon for text button
        color={favorite ? "#fff" : "#d33"}
        style={{ marginRight: 8 }}
      />
      {/* Conditionally render text based on showText prop */}
      <Text style={[styles.text, favorite && styles.textActive]}>
        {favorite ? removeFromFavoritesText : addToFavoritesText}
      </Text>
    </Button>
  );
}

// 2. Export the component wrapped in React.memo
export default memo(FavoriteButton);

const styles = StyleSheet.create({
  // ✅ Simple container for the icon in the list view
  iconOnlyContainer: {
    backgroundColor: 'transparent',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  
  // Base style for the full button (when showText is true)
  defaultButton: {
    backgroundColor: '#005191',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  
  // Favorite state for the full button
  favorite: {
    backgroundColor: "#d33",
    borderWidth: 0,
  },
  
  text: {
    color: "#d33",
    fontWeight: "500",
    fontSize: 15,
  },
  textActive: {
    color: "#fff",
  },
});