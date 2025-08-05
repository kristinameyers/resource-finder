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
import { Loader2, ChevronLeft, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCategories } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  // State for selected filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  
  // Category & location hooks
  const { locationState, requestCurrentLocation, setLocationByZipCode, clearLocation } = useLocation();
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  // Set a default location for demonstrating real 211 API data - only on initial load
  const [hasSetDefaultLocation, setHasSetDefaultLocation] = useState(false);
  useEffect(() => {
    if (locationState.type === 'none' && !hasSetDefaultLocation) {
      setLocationByZipCode('91303'); // West Hills, CA - area with active 211 resources
      setHasSetDefaultLocation(true);
    }
  }, [locationState.type, setLocationByZipCode, hasSetDefaultLocation]);
  
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
    dataSource,
    isLoading: isLoadingResources,
    error: resourcesError,
    refetch: refetchResources
  } = useResources(
    selectedCategoryId,
    selectedSubcategoryId,
    getLocationParam(),
    useNational211Api,
    sortBy
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
    clearLocation();
  };
  
  // Back to categories button handler
  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[#005191] tracking-wide">Resource Finder</h1>
          
          {/* Loading indicator */}
          {(isLoadingCategories || isLoadingResources) && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#005191]" />
              <span className="text-base text-[#005191] font-medium">Loading...</span>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
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
        
        {selectedCategoryId ? (
          // Show results when a category is selected
          <>
            <div className="mb-4">
              <Button
                variant="ghost"
                className="flex items-center text-muted-foreground"
                onClick={handleBackToCategories}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Categories
              </Button>
            </div>
            
            <ResultsSection 
              resources={resources}
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
