import { Resource } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { fetchResources } from "@/lib/api";

interface ResourcesResponse {
  resources: Resource[];
  source: string;
}

export function useResources(
  categoryId: string | null, 
  subcategoryId: string | null, 
  location: { type: 'zipCode', value: string } | { type: 'coordinates', latitude: number, longitude: number } | null,
  useApi: boolean = true
) {
  // Query key that depends on filters
  const queryKey = [
    '/api/resources', 
    { 
      categoryId, 
      subcategoryId,
      location: location ? JSON.stringify(location) : null,
      useApi
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
            useApi
          );
        } else {
          result = await fetchResources(
            categoryId || undefined, 
            subcategoryId || undefined, 
            undefined, 
            { latitude: location.latitude, longitude: location.longitude },
            useApi
          );
        }
      } else {
        result = await fetchResources(
          categoryId || undefined, 
          subcategoryId || undefined,
          undefined,
          undefined,
          useApi
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
    totalCount: data?.resources?.length || 0,
    dataSource: data?.source || 'local',
    isLoading,
    error: error as Error | null,
    refetch
  };
}
