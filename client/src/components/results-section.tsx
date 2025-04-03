import { Resource, Category, Subcategory } from "@shared/schema";
import ResourceCard from "./resource-card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ResultsSectionProps {
  resources: Resource[];
  categories: Category[];
  subcategories: Subcategory[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onClearFilters: () => void;
  selectedCategoryId?: string | null;
}

export default function ResultsSection({
  resources,
  categories,
  subcategories,
  isLoading,
  error,
  onRetry,
  onClearFilters,
  selectedCategoryId
}: ResultsSectionProps) {
  // Find category and subcategory objects for a resource
  const getCategoryForResource = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };
  
  const getSubcategoryForResource = (subcategoryId?: string) => {
    if (!subcategoryId) return undefined;
    return subcategories.find(s => s.id === subcategoryId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading resources...</p>
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
        <h2 className="text-xl font-semibold">
          {resources.length} Resource{resources.length !== 1 && 's'} 
          {selectedCategory ? ` in ${selectedCategory.name}` : ' Found'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <ResourceCard 
            key={resource.id} 
            resource={resource} 
            category={getCategoryForResource(resource.categoryId)}
            subcategory={resource.subcategoryId ? getSubcategoryForResource(resource.subcategoryId) : undefined}
          />
        ))}
      </div>
    </div>
  );
}