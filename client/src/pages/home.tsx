import { useState, useEffect } from "react";
import { useLocation as useRouter } from "wouter";
import FilterSection from "@/components/filter-section";
import FilterSectionSkeleton from "@/components/filter-section-skeleton";
import CategoryGrid from "@/components/category-grid";
import CategoryGridSkeleton from "@/components/category-grid-skeleton";
import ResultsSection from "@/components/results-section";
import { useResources } from "@/hooks/use-resources";
import { useSubcategories } from "@/hooks/use-subcategories";
import { useLocation, LocationState } from "@/hooks/use-location";
import { useQuery } from "@tanstack/react-query";
import { type Category, type Subcategory } from "@shared/schema";
import { Loader2, ChevronLeft, Database, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchCategories } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useTranslatedText, TranslatedText } from "@/components/TranslatedText";
import new211Logo from "@/assets/new-211-logo.png";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function Home() {
  const { preferences } = useOnboarding();
  const [, setRouterLocation] = useRouter();
  
  // Translation hooks for all text content
  const { text: loadingText } = useTranslatedText("Loading...");
  const { text: localDataText } = useTranslatedText("Local Data");
  const { text: api211Text } = useTranslatedText("211 API");
  const { text: searchPlaceholderText } = useTranslatedText("Enter keyword (e.g., childcare, food help, housing)");
  const { text: keywordSearchText } = useTranslatedText("Keyword search");
  const { text: clearText } = useTranslatedText("Clear");
  const { text: backToSearchText } = useTranslatedText("Back to Search");
  const { text: backToCategoriesText } = useTranslatedText("Back to Categories");
  const { text: footerText } = useTranslatedText("Resource Finder");
  const { text: footerSubtext } = useTranslatedText("Find local resources and services");

  // Initialize state from URL parameters or localStorage
  const initializeFiltersFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      categoryId: urlParams.get('category') || null,
      subcategoryId: urlParams.get('subcategory') || null,
      zipCode: urlParams.get('zipCode') || null,
      lat: urlParams.get('lat') ? parseFloat(urlParams.get('lat')!) : null,
      lng: urlParams.get('lng') ? parseFloat(urlParams.get('lng')!) : null
    };
  };

  const urlFilters = initializeFiltersFromUrl();

  // State for selected filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(urlFilters.categoryId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(urlFilters.subcategoryId);
  
  // State for keyword search
  const [keywordQuery, setKeywordQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'category' | 'keyword'>('category');
  
  // Category & location hooks
  const { locationState, requestCurrentLocation, setLocationByZipCode, clearLocation } = useLocation();
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Initialize location from URL parameters
  useEffect(() => {
    if (urlFilters.zipCode) {
      setLocationByZipCode(urlFilters.zipCode);
    } else if (urlFilters.lat && urlFilters.lng) {
      // Note: This would require a setLocationByCoordinates method in useLocation hook
      // For now, we'll handle zip codes primarily
    }
  }, []); // Empty dependency array - only run once on mount
  
  // No default location - user must enter their own location
  
  // State for API data source
  const [useNational211Api, setUseNational211Api] = useState<boolean>(true);
  
  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery<{categories: Category[]}, Error, Category[]>({ 
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const categoriesData = await fetchCategories();
      return { categories: categoriesData };
    },
    select: (data) => data.categories
  });

  // Sort categories based on onboarding preferences
  const sortedCategories = categories ? (() => {
    if (!preferences?.favoriteCategories?.length) return categories;
    
    const favoriteIds = preferences.favoriteCategories;
    const favoriteCategories = categories.filter(cat => favoriteIds.includes(cat.id));
    const otherCategories = categories.filter(cat => !favoriteIds.includes(cat.id));
    
    // Sort favorites in the order they were selected
    favoriteCategories.sort((a, b) => {
      const aIndex = favoriteIds.indexOf(a.id);
      const bIndex = favoriteIds.indexOf(b.id);
      return aIndex - bIndex;
    });
    
    return [...favoriteCategories, ...otherCategories];
  })() : [];
  
  // Fetch subcategories for selected category
  const {
    subcategories,
    isLoading: isLoadingSubcategories
  } = useSubcategories(selectedCategoryId);
  
  // Get all subcategories for resource card display
  const { 
    data: allSubcategories = [], 
    isLoading: isLoadingAllSubcategories 
  } = useQuery<Subcategory[]>({ 
    queryKey: ['/api/all-subcategories'],
    queryFn: async () => {
      // This is a client-side collection of all subcategories from all loaded categories
      // In a real app, we might have a separate endpoint for this
      const allSubs: Subcategory[] = [];
      for (const category of categories) {
        const subs = await fetch(`/api/subcategories?categoryId=${category.id}`).then(r => r.json());
        if (subs.subcategories) {
          allSubs.push(...subs.subcategories);
        }
      }
      return allSubs;
    },
    enabled: categories.length > 0 && !isLoadingCategories,
  });
  
  // Create location param for useResources hook
  const getLocationParam = (): Parameters<typeof useResources>[2] => {
    if (locationState.type === 'coordinates') {
      return {
        type: 'coordinates',
        latitude: locationState.latitude,
        longitude: locationState.longitude
      };
    } else if (locationState.type === 'zipCode') {
      return {
        type: 'zipCode',
        value: locationState.zipCode
      };
    }
    return null;
  };
  
  // State for sorting
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'name'>('relevance');
  
  // Fetch resources based on current filters
  const {
    resources,
    totalCount,
    dataSource,
    isLoading: isLoadingResources,
    error: resourcesError,
    refetch: refetchResources
  } = useResources(
    searchType === 'keyword' ? null : selectedCategoryId,
    searchType === 'keyword' ? null : selectedSubcategoryId,
    getLocationParam(),
    useNational211Api,
    sortBy,
    searchType === 'keyword' ? keywordQuery.trim() : undefined
  );
  
  // Category change handler
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null); // Reset subcategory selection when category changes
  };
  
  // Subcategory change handler
  const handleSubcategoryChange = (subcategoryId: string | null) => {
    setSelectedSubcategoryId(subcategoryId);
  };
  
  // Category grid selection handler
  const handleCategorySelect = (categoryId: string) => {
    setRouterLocation(`/resources?categoryId=${categoryId}&useApi=true`);
  };
  
  // "Use my location" button handler
  const handleUseMyLocation = async () => {
    setIsLocationLoading(true);
    try {
      await requestCurrentLocation();
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsLocationLoading(false);
    }
  };
  
  // Zip code change handler
  const handleZipCodeChange = (zipCode: string) => {
    setIsLocationLoading(true);
    setLocationByZipCode(zipCode)
      .finally(() => setIsLocationLoading(false));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setKeywordQuery('');
    setSearchType('category');
    clearLocation();
  };

  // Keyword search handler
  const handleKeywordSearch = () => {
    if (keywordQuery.trim()) {
      setSearchType('keyword');
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
    }
  };

  // Handle enter key in search input
  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleKeywordSearch();
    }
  };
  
  // Back to categories button handler
  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    if (searchType === 'keyword') {
      setKeywordQuery('');
      setSearchType('category');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <img src={new211Logo} alt="Santa Barbara County 211" className="h-32" />
          
          {/* Loading indicator */}
          {(isLoadingCategories || isLoadingResources) && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#005191]" />
              <span className="text-base text-[#005191] font-medium">{loadingText}</span>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 bg-gray-50 min-h-screen pb-24">
        {/* Prominent Search Buttons */}
        <div className="mb-8">
          <div className="flex space-x-4 justify-center">
            <Button 
              className="flex-1 max-w-[200px] bg-orange-500 hover:bg-orange-600 text-black font-medium py-4 text-lg"
            >
              <Search className="mr-2 h-5 w-5" />
              <TranslatedText text="Search Category" />
            </Button>
            <Button 
              onClick={() => setRouterLocation("/search-keyword")}
              className="flex-1 max-w-[200px] bg-orange-500 hover:bg-orange-600 text-black font-medium py-4 text-lg"
            >
              <Search className="mr-2 h-5 w-5" />
              <TranslatedText text="Search Keyword" />
            </Button>
          </div>
        </div>

        {/* Category Grid - Main Content */}
        <div>
          {isLoadingCategories ? (
            <CategoryGridSkeleton />
          ) : (
            <CategoryGrid 
              categories={sortedCategories}
              onCategorySelect={handleCategorySelect}
              selectedCategoryId={selectedCategoryId}
            />
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {footerText} &copy; {new Date().getFullYear()} | {footerSubtext}
          </p>
        </div>
      </footer>
    </div>
  );
}
