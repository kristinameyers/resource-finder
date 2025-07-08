import { useState, useEffect } from 'react';

const FAVORITES_STORAGE_KEY = 'resource-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const favoriteIds = JSON.parse(stored) as string[];
        setFavorites(new Set(favoriteIds));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  const saveFavorites = (newFavorites: Set<string>) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(newFavorites)));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addToFavorites = (resourceId: string) => {
    const newFavorites = new Set(favorites);
    newFavorites.add(resourceId);
    saveFavorites(newFavorites);
  };

  const removeFromFavorites = (resourceId: string) => {
    const newFavorites = new Set(favorites);
    newFavorites.delete(resourceId);
    saveFavorites(newFavorites);
  };

  const toggleFavorite = (resourceId: string) => {
    if (favorites.has(resourceId)) {
      removeFromFavorites(resourceId);
    } else {
      addToFavorites(resourceId);
    }
  };

  const isFavorite = (resourceId: string) => {
    return favorites.has(resourceId);
  };

  const getFavoritesList = () => {
    return Array.from(favorites);
  };

  return {
    favorites: Array.from(favorites),
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesList
  };
}