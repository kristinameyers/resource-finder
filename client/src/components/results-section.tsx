import { Resource, Category, Subcategory } from "@shared/schema";
import ResourceCard from "./resource-card";
import ResourceCardSkeleton from "./resource-card-skeleton";
import SortControl from "./sort-control";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

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
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
          <h2 className="text-xl font-semibold">Loading resources...</h2>
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="font-semibold text-lg mb-2">Failed to load resources</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          There was an error loading the resources. Please try again.
        </p>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  // Empty state
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="font-semibold text-lg mb-2">No resources found</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          No resources match your current filters. Try changing your filters or clearing them.
        </p>
        <Button onClick={onClearFilters}>Clear Filters</Button>
      </div>
    );
  }

  // Get the selected category if there is one
  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;

  // Display results
  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {totalCount} Resource{totalCount !== 1 && 's'} 
              {selectedCategory ? ` in ${selectedCategory.name}` : ' Found'}
            </h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Live 211 Data
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SortControl 
              value={sortBy}
              onValueChange={onSortChange}
              hasLocation={hasLocation}
            />
            {selectedCategoryId && (
              <Button variant="outline" onClick={onClearFilters}>
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