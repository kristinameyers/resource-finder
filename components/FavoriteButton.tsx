import { Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./ui/Button";
import { useFavorites } from "../hooks/use-favorites";
import { useTranslatedText } from "./TranslatedText";
import { FavoriteResource } from "../contexts/FavoritesContext";

interface FavoriteButtonProps {
  resource: FavoriteResource;
  style?: ViewStyle;
  showText?: boolean;
}

export default function FavoriteButton({
  resource,
  style,
  showText = true,
}: FavoriteButtonProps) {
  // Use the resource.id for checking/toggling
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(resource.id); // Check status using ID

  const { text: addToFavoritesText } = useTranslatedText("Add to Favorites");
  const { text: removeFromFavoritesText } = useTranslatedText("Remove from Favorites");

  const handleToggle = () => {
    // Pass the full resource object to the toggle function
    toggleFavorite(resource);
  };

  const baseStyle = showText ? styles.defaultButton : styles.iconOnlyButton;

  const buttonVariant = showText ? (favorite ? "default" : "outline") : undefined;

  const favoriteOverrideStyle = !showText && favorite ? styles.iconFavoriteOverride : styles.favorite;

  return (
    <Button
      onPress={handleToggle}
      variant={buttonVariant} 
      style={[
        baseStyle,
        // ✅ Use the correct style override based on whether text is shown
        favorite && favoriteOverrideStyle, 
        style,
      ] as ViewStyle[]}
    >
      <Ionicons
        name={favorite ? "heart" : "heart-outline"}
        size={showText ? 18 : 22} // Using 22 for better visibility
        color={favorite ? "#D0021B" : "#333"} //
        style={{ marginRight: showText ? 8 : 0 }}
      />
      // Conditionally render text based on showText prop
      {showText && (
        <Text style={[styles.text, favorite && styles.textActive]}>
          {favorite ? removeFromFavoritesText : addToFavoritesText}
        </Text>
      )}
    </Button>
  );
}

const styles = StyleSheet.create({
  defaultButton: {
    backgroundColor: '#005191',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  iconOnlyButton: {
    backgroundColor: 'transparent', // Make the background disappear
    padding: 0,    // Remove all internal padding
    margin: 0,     // Remove all external margin
    width: 28,     // Set a small fixed width/height for the touch target
    height: 28,    // Set a small fixed width/height for the touch target
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent', 
    borderWidth: 0,
  },
  iconFavoriteOverride: {
    backgroundColor: 'transparent', // The background is handled by the icon color only
    borderWidth: 0,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
