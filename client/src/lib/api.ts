import { apiRequest } from "./queryClient";
import { 
  type Resource, 
  type Category, 
  type Location, 
  type ResourcesResponse,
  type CategoriesResponse,
  type LocationsResponse
} from "@shared/schema";

// Fetch resources with optional filtering
export async function fetchResources(
  categories?: string[],
  location?: string
): Promise<Resource[]> {
  const queryParams = new URLSearchParams();
  
  // Add filter parameters if they exist
  if (categories && categories.length > 0) {
    queryParams.append('categories', categories.join(','));
  }
  
  if (location) {
    queryParams.append('location', location);
  }
  
  const url = `/api/resources${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  try {
    const response = await apiRequest('GET', url);
    const data = await response.json() as ResourcesResponse;
    return data.resources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}

// Fetch available categories
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await apiRequest('GET', '/api/categories');
    const data = await response.json() as CategoriesResponse;
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Fetch available locations
export async function fetchLocations(): Promise<Location[]> {
  try {
    const response = await apiRequest('GET', '/api/locations');
    const data = await response.json() as LocationsResponse;
    return data.locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}
