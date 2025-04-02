import { Subcategory } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { fetchSubcategories } from "@/lib/api";

export function useSubcategories(categoryId: string | null) {
  // Query key that depends on the selected category
  const queryKey = ['/api/subcategories', { categoryId }];
  
  // Make the API request
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<Subcategory[]>({
    queryKey,
    queryFn: async () => {
      if (!categoryId) {
        return [];
      }
      return fetchSubcategories(categoryId);
    },
    enabled: !!categoryId, // Only run query if categoryId is provided
  });
  
  return {
    subcategories: data || [],
    isLoading,
    error: error as Error | null,
    refetch
  };
}