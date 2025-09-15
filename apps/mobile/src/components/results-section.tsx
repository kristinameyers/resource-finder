import { Resource, Category, Subcategory } from "@sb211/shared-schema/src";
import ResourceCard from "./resource-card";
import ResourceCardSkeleton from "./resource-card-skeleton";
import SortControl from "./sort-control";
import { Button } from "./ui/button";
import { AlertTriangle, Loader2, Clock } from "lucide-react";
import { useTranslatedText } from "./TranslatedText";

interface ResultsSectionProps {
  resources: Resource[];
  totalCount: number;
  categories: Category[];
  subcategories: Subcategory[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onClearFilters: () => void;
  selectedCategoryId?: string | null;
  sortBy: 'relevance' | 'distance' | 'name';
  onSortChange: (value: 'relevance' | 'distance' | 'name') => void;
  hasLocation: boolean;
}

export default function ResultsSection({
  resources,
  totalCount,
  categories,
  subcategories,
  isLoading,
  error,
  onRetry,
  onClearFilters,
  selectedCategoryId,
  sortBy,
  onSortChange,
  hasLocation
}: ResultsSectionProps) {
  const { text: loadingResourcesText } = useTranslatedText("Loading resources...");
  const { text: noResourcesText } = useTranslatedText("No resources found");
  const { text: errorLoadingText } = useTranslatedText("Error loading resources");
  const { text: tryAgainText } = useTranslatedText("Try Again");
  const { text: clearFiltersText } = useTranslatedText("Clear Filters");
  const { text: foundText } = useTranslatedText("Found");
  const { text: resourcesText } = useTranslatedText("resources");
  const { text: serviceTemporarilyBusyText } = useTranslatedText("Service Temporarily Busy");
  const { text: failedToLoadResourcesText } = useTranslatedText("Failed to load resources");
  const { text: resourceDatabaseBusyText } = useTranslatedText("The resource database is experiencing high traffic. Please wait a moment and try again.");
  const { text: errorLoadingDetailsText } = useTranslatedText("There was an error loading the resources. Please try again.");
  const { text: retryText } = useTranslatedText("Retry");
  const { text: noResourcesMatchText } = useTranslatedText("No resources match your current filters. Try changing your filters or clearing them.");
  const { text: tipText } = useTranslatedText("💡 Tip: Try selecting a different category or wait 30 seconds before retrying.");
  const { text: liveDataText } = useTranslatedText("Live 211 Data");
  const { text: addToFavoritesText } = useTranslatedText("Add to Favorites");
  const { text: viewDetailsText } = useTranslatedText("View Details");
  // Find category and subcategory objects for a resource
  const getCategoryForResource = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };
  
  const getSubcategoryForResource = (subcategoryId?: string) => {
    if (!subcategoryId) return undefined;
    return subcategories.find(s => s.id === subcategoryId);
  };

  // Loading state - show skeleton cards
  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#005191' }} className="p-6 rounded-lg space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="h-5 w-5 text-white animate-spin" />
          <h2 className="text-xl font-semibold text-white">{loadingResourcesText}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ResourceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isRateLimited = error.message?.includes('RATE_LIMITED');
    
    return (
      <div style={{ backgroundColor: '#005191' }} className="p-6 rounded-lg flex flex-col items-center justify-center py-12 text-center">
        {isRateLimited ? (
          <Clock className="h-12 w-12 text-yellow-400 mb-4" />
        ) : (
          <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        )}
        <h3 className="font-semibold text-lg mb-2 text-white">
          {isRateLimited ? serviceTemporarilyBusyText : failedToLoadResourcesText}
        </h3>
        <p className="text-gray-200 mb-4 max-w-md">
          {isRateLimited 
            ? resourceDatabaseBusyText
            : errorLoadingDetailsText
          }
        </p>
        <div className="space-x-2">
          <Button onClick={onRetry} className="bg-white text-[#005191] hover:bg-gray-100">
            {isRateLimited ? tryAgainText : retryText}
          </Button>
          {isRateLimited && (
            <Button onClick={onClearFilters} variant="outline" className="border-white text-white hover:bg-white hover:text-[#005191]">
              {clearFiltersText}
            </Button>
          )}
        </div>
        {isRateLimited && (
          <p className="text-sm text-gray-200 mt-4">
            {tipText}
          </p>
        )}
      </div>
    );
  }

  // Empty state
  if (resources.length === 0) {
    return (
      <div style={{ backgroundColor: '#005191' }} className="p-6 rounded-lg flex flex-col items-center justify-center py-12 text-center">
        <h3 className="font-semibold text-lg mb-2 text-white">{noResourcesText}</h3>
        <p className="text-gray-200 mb-4 max-w-md">
          {noResourcesMatchText}
        </p>
        <Button onClick={onClearFilters} className="bg-white text-[#005191] hover:bg-gray-100">{clearFiltersText}</Button>
      </div>
    );
  }

  // Get the selected category if there is one
  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;

  // Display results
  return (
    <div style={{ backgroundColor: '#005191' }} className="p-6 rounded-lg">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              {totalCount} Resource{totalCount !== 1 && 's'} 
              {selectedCategory ? ` in ${selectedCategory.name}` : ' Found'}
            </h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {liveDataText}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SortControl 
              value={sortBy}
              onValueChange={onSortChange}
              hasLocation={hasLocation}
            />
            {selectedCategoryId && (
              <Button variant="outline" onClick={onClearFilters} className="bg-white text-[#005191] border-white hover:bg-gray-100">
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <ResourceCard 
            key={`${resource.id}-${resource.categoryId}-${index}`} 
            resource={resource} 
            category={getCategoryForResource(resource.categoryId)}
            subcategory={resource.subcategoryId ? getSubcategoryForResource(resource.subcategoryId) : undefined}
          />
        ))}
      </div>
    </div>
  );
}