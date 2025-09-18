import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./ui/Button";
import { useFavorites } from "../hooks/use-favorites";
import { useTranslatedText } from "./TranslatedText";

interface FavoriteButtonProps {
  resourceId: string;
  style?: ViewStyle;
  showText?: boolean;
}

export default function FavoriteButton({
  resourceId,
  style,
  showText = true,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(resourceId);
  const { text: addToFavoritesText } = useTranslatedText("Add to Favorites");
  const { text: removeFromFavoritesText } = useTranslatedText("Remove from Favorites");

  const handleToggle = () => {
    toggleFavorite(resourceId);
  };

  return (
    <Button
      onPress={handleToggle}
      variant={favorite ? "default" : "outline"}
      style={[
        styles.button,
        ...(favorite ? [styles.favorite] : []),
        ...(style ? [style] : []),
      ]}
    >
      <Ionicons
        name={favorite ? "heart" : "heart-outline"}
        size={18}
        color={favorite ? "#fff" : "#d33"}
        style={{ marginRight: showText ? 8 : 0 }}
      />
      {showText && (
        <Text style={[styles.text, favorite && styles.textActive]}>
          {favorite ? removeFromFavoritesText : addToFavoritesText}
        </Text>
      )}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
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
