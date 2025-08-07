import { Resource } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { fetchResources } from "@/lib/api";

interface ResourcesResponse {
  resources: Resource[];
  total: number;
  source: string;
}

export function useResources(
  categoryId: string | null, 
  subcategoryId: string | null, 
  location: { type: 'zipCode', value: string } | { type: 'coordinates', latitude: number, longitude: number } | null,
  useApi: boolean = true,
  sortBy: 'relevance' | 'distance' | 'name' = 'relevance'
) {
  // Query key that depends on filters
  const queryKey = [
    '/api/resources', 
    { 
      categoryId, 
      subcategoryId,
      location: location ? JSON.stringify(location) : null,
      useApi,
      sortBy
    }
  ];
  
  // Make the API request
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<ResourcesResponse>({
    queryKey,
    queryFn: async () => {
      let result;
      if (location) {
        if (location.type === 'zipCode') {
          result = await fetchResources(
            categoryId || undefined, 
            subcategoryId || undefined, 
            location.value,
            undefined,
            useApi,
            sortBy
          );
        } else {
          result = await fetchResources(
            categoryId || undefined, 
            subcategoryId || undefined, 
            undefined, 
            { latitude: location.latitude, longitude: location.longitude },
            useApi,
            sortBy
          );
        }
      } else {
        // Default to Santa Barbara when no location specified
        result = await fetchResources(
          categoryId || undefined, 
          subcategoryId || undefined,
          "93101", // Default to Santa Barbara zip code
          undefined,
          useApi,
          sortBy
        );
      }
      
      // Store resources in localStorage for resource detail page access
      if (result.resources && result.resources.length > 0) {
        localStorage.setItem('recentResources', JSON.stringify(result.resources));
      }
      
      return result;
    },
    enabled: true,
  });
  
  return {
    resources: data?.resources || [],
    totalCount: data?.total || 0,
    dataSource: data?.source || 'local',
    isLoading,
    error: error as Error | null,
    refetch
  };
}
