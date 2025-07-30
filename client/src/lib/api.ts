import { apiRequest } from "./queryClient";
import { 
  type Resource, 
  type Category,
  type Subcategory, 
  type Location, 
  type ResourcesResponse,
  type CategoriesResponse,
  type SubcategoriesResponse,
  type LocationsResponse
} from "@shared/schema";

// Type for the enhanced resources response
interface EnhancedResourcesResponse extends ResourcesResponse {
  source: string;
}

// Interface for resource details response
interface ResourceDetailResponse {
  resource: Resource;
  source: string;
}

// Fetch resources with optional filtering
export async function fetchResources(
  categoryId?: string,
  subcategoryId?: string,
  zipCode?: string,
  coordinates?: { latitude: number; longitude: number },
  useApi: boolean = true,
  sortBy: 'relevance' | 'distance' | 'name' = 'relevance'
): Promise<{resources: Resource[], source: string}> {
  const queryParams = new URLSearchParams();
  
  // Add filter parameters if they exist
  if (categoryId) {
    queryParams.append('categoryId', categoryId);
  }
  
  if (subcategoryId) {
    queryParams.append('subcategoryId', subcategoryId);
  }
  
  if (zipCode) {
    queryParams.append('zipCode', zipCode);
  }
  
  if (coordinates) {
    queryParams.append('latitude', coordinates.latitude.toString());
    queryParams.append('longitude', coordinates.longitude.toString());
  }
  
  // Add parameter to use National 211 API
  queryParams.append('useApi', useApi.toString());
  
  // Add sort parameter
  queryParams.append('sortBy', sortBy);
  
  const url = `/api/resources${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  try {
    const response = await apiRequest('GET', url);
    const data = await response.json() as EnhancedResourcesResponse;
    return {
      resources: data.resources,
      source: data.source || 'local'
    };
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}

// Fetch a specific resource by ID
export async function fetchResourceById(id: string, useApi: boolean = true): Promise<Resource> {
  const queryParams = new URLSearchParams();
  if (useApi) {
    queryParams.append('useApi', 'true');
  }
  
  const url = `/api/resources/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  try {
    const response = await apiRequest('GET', url);
    if (response.status === 404) {
      throw new Error('Resource not found');
    }
    const data = await response.json() as ResourceDetailResponse;
    return data.resource;
  } catch (error) {
    console.error('Error fetching resource by ID:', error);
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

// Fetch subcategories for a specific category
export async function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
  try {
    const response = await apiRequest('GET', `/api/subcategories?categoryId=${categoryId}`);
    const data = await response.json() as SubcategoriesResponse;
    return data.subcategories;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
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

// Fetch location by zip code
export async function fetchLocationByZipCode(zipCode: string): Promise<Location | null> {
  try {
    const response = await apiRequest('GET', `/api/location/zipcode/${zipCode}`);
    if (response.status === 404) {
      return null;
    }
    const location = await response.json() as Location;
    return location;
  } catch (error) {
    console.error('Error fetching location by zip code:', error);
    throw error;
  }
}

// Fetch location by coordinates
export async function fetchLocationByCoordinates(latitude: number, longitude: number): Promise<Location | null> {
  try {
    const response = await apiRequest(
      'GET', 
      `/api/location/coordinates?latitude=${latitude}&longitude=${longitude}`
    );
    if (response.status === 404) {
      return null;
    }
    const location = await response.json() as Location;
    return location;
  } catch (error) {
    console.error('Error fetching location by coordinates:', error);
    throw error;
  }
}

// Get user's current location using browser's Geolocation API
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}
