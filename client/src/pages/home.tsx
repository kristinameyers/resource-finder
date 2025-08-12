import { useState, useEffect } from "react";
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

export default function Home() {
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
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
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
          <h1 className="text-4xl font-normal text-[#005191]">Santa Barbara 211</h1>
          
          {/* Loading indicator */}
          {(isLoadingCategories || isLoadingResources) && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#005191]" />
              <span className="text-base text-[#005191] font-medium">Loading...</span>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 bg-gray-50 min-h-screen pb-24">
        {/* Data source toggle */}
        <div className="flex items-center justify-end mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant={useNational211Api ? "outline" : "default"}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setUseNational211Api(false)}
            >
              <Database className="h-4 w-4" />
              Local Data
            </Button>
            <Button 
              variant={useNational211Api ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1 btn-highlight"
              onClick={() => setUseNational211Api(true)}
            >
              <Database className="h-4 w-4" />
              211 API
            </Button>
          </div>
          
          {dataSource && (
            <Badge variant="outline" className={dataSource === '211 API' ? 'bg-primary/10 highlight' : 'bg-muted'}>
              <Database className="h-3 w-3 mr-1" /> 
              {dataSource}
            </Badge>
          )}
        </div>
        
        {isLoadingCategories ? (
          <FilterSectionSkeleton />
        ) : (
          <FilterSection 
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
            subcategories={subcategories}
            selectedSubcategoryId={selectedSubcategoryId}
            onSubcategoryChange={handleSubcategoryChange}
            locationState={locationState}
            onUseMyLocation={handleUseMyLocation}
            onZipCodeChange={handleZipCodeChange}
            onClearLocation={clearLocation}
            isLoadingSubcategories={isLoadingSubcategories}
            isLoadingLocation={isLocationLoading}
          />
        )}
        
        {/* Keyword Search Section - Below Resource Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Enter keyword (e.g., childcare, food help, housing)"
                  value={keywordQuery}
                  onChange={(e) => setKeywordQuery(e.target.value)}
                  onKeyPress={handleKeywordInputKeyPress}
                  className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-[#005191] focus:ring-[#005191]"
                />
              </div>
              <Button
                onClick={handleKeywordSearch}
                disabled={!keywordQuery.trim()}
                className="px-6 py-3 bg-[#005191] hover:bg-[#0066b3] text-white rounded-lg flex items-center gap-2 shadow-sm"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            {searchType === 'keyword' && keywordQuery && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-[#005191]">
                  Keyword search: "{keywordQuery}"
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setKeywordQuery('');
                    setSearchType('category');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {selectedCategoryId || (searchType === 'keyword' && keywordQuery.trim()) ? (
          // Show results when a category is selected
          <>
            <div className="mb-4">
              <Button
                variant="ghost"
                className="flex items-center text-muted-foreground"
                onClick={handleBackToCategories}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {searchType === 'keyword' ? 'Back to Search' : 'Back to Categories'}
              </Button>
            </div>
            
            <ResultsSection 
              resources={resources}
              totalCount={totalCount}
              categories={categories}
              subcategories={[...subcategories, ...allSubcategories]}
              isLoading={isLoadingResources}
              error={resourcesError}
              onRetry={refetchResources}
              onClearFilters={handleClearFilters}
              selectedCategoryId={selectedCategoryId}
              sortBy={sortBy}
              onSortChange={setSortBy}
              hasLocation={locationState.type !== 'none'}
            />
          </>
        ) : (
          // Show category grid when no category is selected
          <div className="mb-8">
            {isLoadingCategories ? (
              <CategoryGridSkeleton />
            ) : (
              <CategoryGrid 
                categories={categories}
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={selectedCategoryId}
              />
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Resource Finder &copy; {new Date().getFullYear()} | Find local resources and services
          </p>
        </div>
      </footer>
    </div>
  );
}
