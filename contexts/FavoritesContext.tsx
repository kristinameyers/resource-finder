// contexts/FavoritesContext.tsx
import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext, 
  ReactNode,
  useCallback
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Re-using the FavoriteResource interface from FavoritesScreen
export interface FavoriteResource {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  organization?: string;
  address?: string;
  phone?: string;
  phoneNumbers?: {
    main?: string;
    [key: string]: any;
  };
  zipCode?: string;
  distance?: number;
}

interface FavoritesContextType {
  favorites: FavoriteResource[];
  isLoading: boolean;
  isFavorite: (resourceId: string) => boolean;
  toggleFavorite: (resource: FavoriteResource | string) => void;
  loadFavorites: () => void;
  removeFavorite: (resourceId: string) => void;
  clearAllFavorites: () => void;
}

const FAVORITES_STORAGE_KEY = 'app_favorites_list';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load favorites from AsyncStorage
  const loadFavorites = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites from AsyncStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to save favorites to AsyncStorage
  const saveFavorites = useCallback(async (updatedFavorites: FavoriteResource[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error saving favorites to AsyncStorage:', error);
    }
  }, []);

  // Check if a resource is a favorite
  const isFavorite = useCallback((resourceId: string) => {
    return favorites.some(f => f.id === resourceId);
  }, [favorites]);

  // Add or remove a favorite
  const toggleFavorite = useCallback((resource: FavoriteResource | string) => {
    // If we only pass the ID (for removing), we assume the resource is already in state.
    const resourceId = typeof resource === 'string' ? resource : resource.id;

    if (isFavorite(resourceId)) {
      // Remove favorite
      const updatedFavorites = favorites.filter(f => f.id !== resourceId);
      saveFavorites(updatedFavorites);
    } else if (typeof resource !== 'string') {
      // Add favorite (only if we have the full resource object)
      const updatedFavorites = [...favorites, resource];
      saveFavorites(updatedFavorites);
    }
  }, [favorites, isFavorite, saveFavorites]);

  // Explicitly remove a favorite by ID (used by FavoritesScreen)
  const removeFavorite = useCallback((resourceId: string) => {
    const updatedFavorites = favorites.filter(f => f.id !== resourceId);
    saveFavorites(updatedFavorites);
  }, [favorites, saveFavorites]);

  // Clear all favorites
  const clearAllFavorites = useCallback(async () => {
    await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    setFavorites([]);
  }, []);


  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <FavoritesContext.Provider 
      value={{ 
        favorites, 
        isLoading, 
        isFavorite, 
        toggleFavorite,
        loadFavorites,
        removeFavorite,
        clearAllFavorites 
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use the favorites context
export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
};