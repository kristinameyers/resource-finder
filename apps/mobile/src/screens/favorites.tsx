import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Phone, ExternalLink, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchSubcategories } from "@/lib/api";
import { type Category, type Subcategory } from "@shared/schema";
import { useTranslatedText } from "@/components/TranslatedText";

interface FavoriteResource {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  address?: string;
  phoneNumbers?: {
    main?: string;
    [key: string]: any;
  };
  zipCode?: string;
  distance?: number;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteResource[]>([]);
  
  // Translation hooks
  const { text: favoritesText } = useTranslatedText("My Favorites");
  const { text: noFavoritesText } = useTranslatedText("No favorites yet");
  const { text: noFavoritesDescText } = useTranslatedText("Start by adding resources to your favorites when browsing.");
  const { text: removeText } = useTranslatedText("Remove from favorites");
  const { text: callText } = useTranslatedText("Call");
  const { text: viewDetailsText } = useTranslatedText("View Details");

  // Fetch categories and subcategories for display
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: fetchCategories
  });

  const { data: subcategoriesData } = useQuery({
    queryKey: ['/api/subcategories'],
    queryFn: () => fetchSubcategories('all')
  });

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];

  useEffect(() => {
    // Load favorites from localStorage
    const loadFavorites = () => {
      try {
        const storedFavorites = localStorage.getItem('favoriteResources');
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites);
          setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      }
    };

    loadFavorites();

    // Listen for favorite changes
    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const removeFavorite = (resourceId: string) => {
    try {
      const updatedFavorites = favorites.filter(fav => fav.id !== resourceId);
      setFavorites(updatedFavorites);
      localStorage.setItem('favoriteResources', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c: Category) => c.id === categoryId)?.name || 'Unknown Category';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    return subcategories.find((s: Subcategory) => s.id === subcategoryId)?.name || '';
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{favoritesText}</h1>
            <p className="text-lg text-gray-600 mb-8">
              {noFavoritesText}
            </p>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                {noFavoritesDescText}
              </p>
              <Button asChild>
                <Link href="/">
                  Browse Resources
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{favoritesText}</h1>
          <p className="text-lg text-gray-600">
            {favorites.length} saved resource{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Favorites List */}
        <div className="space-y-4">
          {favorites.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {resource.name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="bg-primary/10">
                        {getCategoryName(resource.categoryId)}
                      </Badge>
                      {resource.subcategoryId && (
                        <Badge variant="outline" className="bg-secondary/10">
                          {getSubcategoryName(resource.subcategoryId)}
                        </Badge>
                      )}
                      {resource.distance !== undefined && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {resource.distance.toFixed(1)} mi
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {resource.address && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {resource.address}
                        </div>
                      )}
                      {resource.phoneNumbers?.main && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {resource.phoneNumbers.main}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFavorite(resource.id)}
                    className="ml-4 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/resources/${resource.id}`}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clear All Button */}
        {favorites.length > 0 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => {
                setFavorites([]);
                localStorage.removeItem('favoriteResources');
              }}
              className="text-red-600 hover:bg-red-50"
            >
              Clear All Favorites
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}