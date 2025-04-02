import { Resource } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { fetchResources } from "@/lib/api";

export function useResources(
  categoryId: string | null, 
  subcategoryId: string | null, 
  location: { type: 'zipCode', value: string } | { type: 'coordinates', latitude: number, longitude: number } | null
) {
  // Query key that depends on filters
  const queryKey = [
    '/api/resources', 
    { 
      categoryId, 
      subcategoryId,
      location: location ? JSON.stringify(location) : null 
    }
  ];
  
  // Make the API request
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<Resource[]>({
    queryKey,
    queryFn: async () => {
      if (location) {
        if (location.type === 'zipCode') {
          return fetchResources(
            categoryId || undefined, 
            subcategoryId || undefined, 
            location.value
          );
        } else {
          return fetchResources(
            categoryId || undefined, 
            subcategoryId || undefined, 
            undefined, 
            { latitude: location.latitude, longitude: location.longitude }
          );
        }
      } else {
        return fetchResources(
          categoryId || undefined, 
          subcategoryId || undefined
        );
      }
    },
    enabled: true,
  });
  
  return {
    resources: data || [],
    totalCount: data?.length || 0,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
