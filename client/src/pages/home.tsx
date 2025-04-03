import { useState } from "react";
import FilterSection from "@/components/filter-section";
import CategoryGrid from "@/components/category-grid";
import ResultsSection from "@/components/results-section";
import { useResources } from "@/hooks/use-resources";
import { useSubcategories } from "@/hooks/use-subcategories";
import { useLocation, LocationState } from "@/hooks/use-location";
import { useQuery } from "@tanstack/react-query";
import { type Category, type Subcategory } from "@shared/schema";
import { Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  // State for selected filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  
  // Category & location hooks
  const { locationState, requestCurrentLocation, setLocationByZipCode, clearLocation } = useLocation();
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery<{categories: Category[]}, Error, Category[]>({ 
    queryKey: ['/api/categories'],
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
  
  // Fetch resources based on current filters
  const {
    resources,
    isLoading: isLoadingResources,
    error: resourcesError,
    refetch: refetchResources
  } = useResources(
    selectedCategoryId,
    selectedSubcategoryId,
    getLocationParam()
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
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Resource Finder</h1>
          
          {/* Loading indicator */}
          {(isLoadingCategories || isLoadingResources) && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
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
            />
          </>
        ) : (
          // Show category grid when no category is selected
          <CategoryGrid 
            categories={categories}
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
          />
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
