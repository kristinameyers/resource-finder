// api/resourceApi.ts
import { Resource, Category, Subcategory, Location } from "../types/shared-schema";
import { resolveCategory, getCategoryIcon } from "./taxonomy";

const API_BASE_URL = process.env.EXPO_PUBLIC_NATIONAL_211_API_URL || process.env.EXPO_PUBLIC_API_URL || "";
const NATIONAL_211_API_KEY = process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY || "";

async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  if (API_BASE_URL && url.startsWith(API_BASE_URL) && NATIONAL_211_API_KEY) headers["Api-Key"] = NATIONAL_211_API_KEY;
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

// Single search logic: categories resolve to their keyword arrays, queries use keywords
export async function fetchResourcesByCategory(categoryId: string, opts: {
  subcategoryId?: string;
  zipCode?: string;
  coordinates?: { latitude: number; longitude: number };
  sortBy?: "relevance" | "distance" | "name";
  skip?: number;
  take?: number;
} = {}): Promise<{ resources: Resource[]; total: number; source: string }> {
  const category = resolveCategory(categoryId);
  const keywords = category ? category.keywords.join(" ") : categoryId; // Use all known keywords for the category
  const queryParams = new URLSearchParams();
  queryParams.append("keyword", keywords);

  if (opts.subcategoryId) queryParams.append("subcategoryId", opts.subcategoryId);
  if (opts.zipCode) queryParams.append("zipCode", opts.zipCode);
  if (opts.coordinates) {
    queryParams.append("latitude", `${opts.coordinates.latitude}`);
    queryParams.append("longitude", `${opts.coordinates.longitude}`);
  }
  queryParams.append("sortBy", opts.sortBy || "relevance");
  queryParams.append("skip", String(opts.skip ?? 0));
  queryParams.append("take", String(opts.take ?? 20));

  const url = API_BASE_URL
    ? `${API_BASE_URL}/search?${queryParams}`
    : `/api/resources?${queryParams}`;

  const response = await apiRequest("GET", url);
  const data = await response.json();
  return {
    resources: data.resources || [],
    total: data.total || (data.resources ? data.resources.length : 0),
    source: data.source || (API_BASE_URL ? "211_API" : "local")
  };
}

export async function fetchResourcesByKeyword(keyword: string, opts: {
  zipCode?: string;
  coordinates?: { latitude: number; longitude: number };
  sortBy?: "relevance" | "distance" | "name";
  skip?: number;
  take?: number;
} = {}): Promise<{ resources: Resource[]; total: number; source: string }> {
  const queryParams = new URLSearchParams();
  queryParams.append("keyword", keyword);
  if (opts.zipCode) queryParams.append("zipCode", opts.zipCode);
  if (opts.coordinates) {
    queryParams.append("latitude", `${opts.coordinates.latitude}`);
    queryParams.append("longitude", `${opts.coordinates.longitude}`);
  }
  queryParams.append("sortBy", opts.sortBy || "relevance");
  queryParams.append("skip", String(opts.skip ?? 0));
  queryParams.append("take", String(opts.take ?? 20));

  const url = API_BASE_URL
    ? `${API_BASE_URL}/search?${queryParams}`
    : `/api/resources?${queryParams}`;

  const response = await apiRequest("GET", url);
  const data = await response.json();
  return {
    resources: data.resources || [],
    total: data.total || (data.resources ? data.resources.length : 0),
    source: data.source || (API_BASE_URL ? "211_API" : "local")
  };
}

// Additional fetchers (ID, categories, subcategories, locations, details)
export async function fetchResourceById(id: string): Promise<Resource> {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/resource/${id}`
    : `/api/resources/${id}`;
  const response = await apiRequest("GET", url);
  if (response.status === 404) throw new Error("Resource not found");
  const data = await response.json();
  return data.resource || data;
}

export async function fetchCategories(): Promise<Category[]> {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/categories`
    : `/api/categories`;
  const response = await apiRequest("GET", url);
  const data = await response.json();
  return data.categories || [];
}

export async function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/subcategories?categoryId=${categoryId}`
    : `/api/subcategories?categoryId=${categoryId}`;
  const response = await apiRequest("GET", url);
  const data = await response.json();
  return data.subcategories || [];
}

export async function fetchLocations(): Promise<Location[]> {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/locations`
    : `/api/locations`;
  const response = await apiRequest("GET", url);
  const data = await response.json();
  return data.locations || [];
}

export async function fetchResourceDetails(id: string, serviceId?: string): Promise<any> {
  const queryParams = serviceId ? `?serviceId=${serviceId}` : "";
  const url = API_BASE_URL
    ? `${API_BASE_URL}/resource/${id}/details${queryParams}`
    : `/api/resources/${id}/details${queryParams}`;
  const response = await apiRequest("GET", url);
  if (response.status === 404) return null;
  const data = await response.json();
  return data.details;
}
