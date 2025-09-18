import { apiRequest } from "../utils/queryClient";
import {
  Resource,
  Category,
  Subcategory,
  Location,
  User,
  InsertUser,
  resourceSchema,
  users
} from "../types/shared-schema";

// If you want to support local and remote endpoints:
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

/** ---- Resource/Category/Location APIs ---- **/

export async function fetchResources(
  categoryId?: string,
  subcategoryId?: string,
  zipCode?: string,
  coordinates?: { latitude: number; longitude: number },
  useApi = true,
  sortBy: 'relevance' | 'distance' | 'name' = 'relevance',
  keyword?: string,
  skip = 0,
  take = 20
): Promise<{ resources: Resource[]; total: number; source: string }> {
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append('categoryId', categoryId);
  if (subcategoryId) queryParams.append('subcategoryId', subcategoryId);
  if (zipCode) queryParams.append('zipCode', zipCode);
  if (coordinates) {
    queryParams.append('latitude', coordinates.latitude.toString());
    queryParams.append('longitude', coordinates.longitude.toString());
  }
  queryParams.append('use211Api', useApi.toString());
  queryParams.append('sortBy', sortBy);
  if (keyword) queryParams.append('keyword', keyword);
  queryParams.append('skip', skip.toString());
  queryParams.append('take', take.toString());

  // Universal: use env if set, else fallback to /api route
  const url = API_BASE_URL
    ? `${API_BASE_URL}/resources?${queryParams}`
    : `/api/resources?${queryParams}`;
  try {
    const response = await apiRequest('GET', url);
    if (response.status === 429) {
      const errorData = await response.json();
      throw new Error(`RATE_LIMITED: ${errorData.message || 'API rate limit exceeded. Please wait and try again.'}`);
    }
    const data = await response.json();
    return {
      resources: data.resources,
      total: data.total || data.resources.length,
      source: data.source || (API_BASE_URL ? "api" : "local")
    };
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}

export async function fetchResourceById(id: string, useApi = true): Promise<Resource> {
  const queryParams = new URLSearchParams();
  if (useApi) queryParams.append('useApi', 'true');
  const url = API_BASE_URL
    ? `${API_BASE_URL}/resources/${id}${queryParams.toString() ? `?${queryParams}` : ""}`
    : `/api/resources/${id}${queryParams.toString() ? `?${queryParams}` : ""}`;
  try {
    const response = await apiRequest('GET', url);
    if (response.status === 404) throw new Error('Resource not found');
    const data = await response.json();
    return data.resource;
  } catch (error) {
    console.error('Error fetching resource by ID:', error);
    throw error;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const url = API_BASE_URL ? `${API_BASE_URL}/categories` : `/api/categories`;
  try {
    const response = await apiRequest('GET', url);
    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/subcategories?categoryId=${categoryId}`
    : `/api/subcategories?categoryId=${categoryId}`;
  try {
    const response = await apiRequest('GET', url);
    const data = await response.json();
    return data.subcategories;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
}

export async function fetchLocations(): Promise<Location[]> {
  const url = API_BASE_URL ? `${API_BASE_URL}/locations` : `/api/locations`;
  try {
    const response = await apiRequest('GET', url);
    const data = await response.json();
    return data.locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}

export async function fetchLocationByZipCode(zipCode: string): Promise<Location | null> {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/location/zipcode/${zipCode}`
    : `/api/location/zipcode/${zipCode}`;
  try {
    const response = await apiRequest('GET', url);
    if (response.status === 404) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching location by zip code:', error);
    throw error;
  }
}

export async function fetchLocationByCoordinates(latitude: number, longitude: number): Promise<Location | null> {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/location/coordinates?latitude=${latitude}&longitude=${longitude}`
    : `/api/location/coordinates?latitude=${latitude}&longitude=${longitude}`;
  try {
    const response = await apiRequest('GET', url);
    if (response.status === 404) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching location by coordinates:', error);
    throw error;
  }
}

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
      (error) => { reject(error); }
    );
  });
}

export async function fetchResourceDetails(id: string, serviceId?: string): Promise<any> {
  const queryParams = serviceId ? `?serviceId=${serviceId}` : '';
  const url = API_BASE_URL
    ? `${API_BASE_URL}/resources/${id}/details${queryParams}`
    : `/api/resources/${id}/details${queryParams}`;
  try {
    const response = await apiRequest('GET', url);
    if (response.status === 404) return null;
    const data = await response.json();
    return data.details;
  } catch (error) {
    console.error('Error fetching resource details:', error);
    return null;
  }
}
