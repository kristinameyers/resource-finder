import { useState, useEffect } from "react";
import { Resource } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export function useResources(categories: string[], location: string | null) {
  // Query key that depends on filters
  const queryKey = ['/api/resources', { 
    categories: categories.join(','), 
    location 
  }];
  
  // Build query params
  const queryParams = new URLSearchParams();
  if (categories.length > 0) {
    queryParams.append('categories', categories.join(','));
  }
  if (location) {
    queryParams.append('location', location);
  }
  
  // Make the API request
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<{ resources: Resource[], total: number }>({
    queryKey,
    queryFn: ({ queryKey }) => {
      // Using the built-in fetcher from queryClient.ts
      const [baseUrl, params] = queryKey;
      const url = queryParams.toString() 
        ? `${baseUrl}?${queryParams.toString()}` 
        : baseUrl as string;
      return fetch(url, { credentials: 'include' }).then(res => {
        if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
        return res.json();
      });
    },
    enabled: true,
  });
  
  return {
    resources: data?.resources || [],
    totalCount: data?.total || 0,
    isLoading,
    error: error as Error | null,
    refetch
  };
}
