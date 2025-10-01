// hooks/use-favorites.ts
import { useFavoritesContext } from "../contexts/FavoritesContext";

/**
 * Hook to access and manage the user's favorite resources.
 * This simplifies usage of the FavoritesContext.
 */
export function useFavorites() {
  const { 
    favorites, 
    isLoading, // 💡 Added loading state from context
    isFavorite, 
    toggleFavorite, 
    removeFavorite,
    loadFavorites,
    clearAllFavorites
  } = useFavoritesContext();

  return { 
    favorites, 
    isLoading, // 💡 Expose loading state
    isFavorite, 
    toggleFavorite,
    removeFavorite,
    loadFavorites,
    clearAllFavorites 
  };
}