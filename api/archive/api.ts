import { Resource, Category, Subcategory, Location } from "../../types/shared-schema";

// Expo/React Native: Use environment variable (see .env setup)
const NATIONAL_211_API_URL = process.env.EXPO_PUBLIC_NATIONAL_211_API_URL || "";
const NATIONAL_211_API_KEY = process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY || "";

// Helper to add API key header when calling National 211 API
async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const isNationalApi = url.startsWith(NATIONAL_211_API_URL);
  const headers: Record<string, string> = 
    isNationalApi
      ? {
          "Content-Type": "application/json",
          "Api-Key": NATIONAL_211_API_KEY || "",
          Accept: "application/json"
        }
      : { "Content-Type": "application/json" };

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include"
  });

  if (!response.ok && response.status !== 404) {
    const text = (await response.text()) || response.statusText;
    throw new Error(`${response.status}: ${text}`);
  }
  return response;
}

// Fetch resources: always uses National 211 API unless instructed otherwise
export async function fetchResources(
  categoryId?: string,
  subcategoryId?: string,
  zipCode?: string,
  coordinates?: { latitude: number; longitude: number },
  useNationalApi: boolean = true,
  sortBy: 'relevance' | 'distance' | 'name' = 'relevance',
  keyword?: string,
  skip: number = 0,
  take: number = 20
): Promise<{ resources: Resource[]; total: number; source: string }> {
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append('categoryId', categoryId);
  if (subcategoryId) queryParams.append('subcategoryId', subcategoryId);
  if (zipCode) queryParams.append('zipCode', zipCode);
  if (coordinates) {
    queryParams.append('latitude', coordinates.latitude.toString());
    queryParams.append('longitude', coordinates.longitude.toString());
  }
  if (keyword) queryParams.append('keyword', keyword);
  queryParams.append('sortBy', sortBy);
  queryParams.append('skip', String(skip));
  queryParams.append('take', String(take));

  let url: string;
  if (useNationalApi && NATIONAL_211_API_URL) {
    url = `${NATIONAL_211_API_URL}/search?${queryParams.toString()}`;
  } else {
    url = `/api/resources${queryParams.toString() ? `?${queryParams}` : ""}`;
  }

  const response = await apiRequest("GET", url);
  const data = await response.json();
  return {
    resources: data.resources || [],
    total: data.total || (data.resources ? data.resources.length : 0),
    source: data.source || (useNationalApi ? "211_API" : "local")
  };
}

// Fetch a resource by ID
export async function fetchResourceById(id: string, useNationalApi = true): Promise<Resource> {
  let url: string;
  if (useNationalApi && NATIONAL_211_API_URL) {
    url = `${NATIONAL_211_API_URL}/resource/${id}`;
  } else {
    url = `/api/resources/${id}`;
  }
  const response = await apiRequest("GET", url);
  if (response.status === 404) throw new Error('Resource not found');
  const data = await response.json();
  return data.resource || data;
}

// Fetch categories
export async function fetchCategories(): Promise<Category[]> {
  if (NATIONAL_211_API_URL) {
    const response = await apiRequest("GET", `${NATIONAL_211_API_URL}/categories`);
    const data = await response.json();
    return data.categories || [];
  } else {
    const response = await apiRequest("GET", "/api/categories");
    const data = await response.json();
    return data.categories || [];
  }
}

// Fetch subcategories
export async function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
  if (NATIONAL_211_API_URL) {
    const response = await apiRequest("GET", `${NATIONAL_211_API_URL}/subcategories?categoryId=${categoryId}`);
    const data = await response.json();
    return data.subcategories || [];
  } else {
    const response = await apiRequest("GET", `/api/subcategories?categoryId=${categoryId}`);
    const data = await response.json();
    return data.subcategories || [];
  }
}

// Fetch locations
export async function fetchLocations(): Promise<Location[]> {
  const response = await apiRequest("GET", "/api/locations");
  const data = await response.json();
  return data.locations || [];
}

// Fetch location by zip code
export async function fetchLocationByZipCode(zipCode: string): Promise<Location | null> {
  const response = await apiRequest("GET", `/api/location/zipcode/${zipCode}`);
  if (response.status === 404) return null;
  return await response.json();
}

// Fetch location by coordinates
export async function fetchLocationByCoordinates(latitude: number, longitude: number): Promise<Location | null> {
  const response = await apiRequest(
    "GET",
    `/api/location/coordinates?latitude=${latitude}&longitude=${longitude}`
  );
  if (response.status === 404) return null;
  return await response.json();
}

export async function fetchResourceDetails(id: string, serviceId?: string): Promise<any> {
  const queryParams = serviceId ? `?serviceId=${serviceId}` : "";
  const response = await apiRequest("GET", `/api/resources/${id}/details${queryParams}`);
  if (response.status === 404) return null;
  const data = await response.json();
  return data.details;
}
