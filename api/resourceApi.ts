// resourceApi.ts
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Resource,
  Category,
  Subcategory,
  Location as Loc,
} from "../types/shared-schema";
import {
  MAIN_CATEGORIES,
  SUBCATEGORIES,
  resolveCategory,
  getCategoryIcon,
} from "../taxonomy";

/* ENVIRONMENT */
const API_KEY = process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY ?? "";
const BASE_URL = process.env.EXPO_PUBLIC_NATIONAL_211_API_URL ?? "https://api.211.org/resources/v2";

/* SANTA BARBARA COUNTY CONSTANT */
const SANTA_BARBARA_COUNTY = "santa barbara county";

/* ASYNC STORAGE KEYS */
const STORAGE_KEYS = {
  RECENT_211_RESOURCES: 'recent211Resources',
  CACHED_CATEGORIES: 'cached211Categories',
  CACHED_SUBCATEGORIES: 'cached211Subcategories',
} as const;

/* Helper – build a clean URL */
function buildUrl(path: string) {
  const cleanBase = BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

/* LOCATION PARAMS */
function buildLocationParams(): {
  location: string;
} {
  return {
    location: SANTA_BARBARA_COUNTY,
  };
}

/* ENHANCED FETCH USING HEADERS FOR SEARCH PARAMS */
async function national211Get<T>(
  path: string, 
  queryParams?: Record<string, string | undefined>,
  searchHeaders?: Record<string, string | undefined>
): Promise<T> {
  const urlObj = new URL(buildUrl(path));
  
  // Add query parameters
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null) {
        urlObj.searchParams.append(key, value);
      }
    });
  }
  
  const url = urlObj.toString();
  
  // Build headers - combine standard headers with search headers
  const headers: Record<string, string> = {
    "Api-Key": API_KEY,
    "Accept": "application/json",
    "Cache-Control": "no-cache"
  };
  
  // Add search-specific headers
  if (searchHeaders) {
    Object.entries(searchHeaders).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null) {
        headers[key] = value;
      }
    });
  }
  
  console.log("Fetch GET request:", url, headers);

  let res: Response;
  try {
    res = await fetch(url, { method: "GET", headers });
  } catch (networkError: any) {
    console.error("Network error during fetch:", networkError);
    throw new Error("Network error while reaching National 211 API");
  }
  
  console.log("🔎 Response status:", res.status);

  // Handle 404 as empty results
  if (res.status === 404) {
    console.log("🔎 No resources found for query parameters");
    return { resources: [], results: [], total: 0, count: 0 } as T;
  }

  if (!res.ok) {
    let msg = "";
    try {
      const json = await res.json();
      msg = JSON.stringify(json);
    } catch {
      msg = await res.text();
    }
    throw new Error(`National 211 API error: [${res.status}] ${msg || res.statusText}`);
  }

  let data: T;
  try {
    data = await res.json();
  } catch (parseError: any) {
    throw new Error("Failed to parse API response as JSON");
  }
  
  if (__DEV__) {
    console.log("🔎 GET", url, "→", res.status);
  }
  
  return data;
}

/* TAXONOMY MAP */
export const TAXONOMY_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  Object.values(SUBCATEGORIES).forEach((subArr) => {
    subArr.forEach((sub) => {
      if (sub.name && sub.taxonomyCode) {
        map[sub.name] = sub.taxonomyCode;
      }
    });
  });
  return map;
})();

/* Core ResourcePage interface */
export interface ResourcePage {
  items: Resource[];
  total: number;
  hasMore: boolean;
}

/* ASYNC STORAGE UTILITIES */
export async function storeResourceForDetailView(resource: Resource): Promise<void> {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_211_RESOURCES);
    const resources = existingData ? JSON.parse(existingData) : [];
    
    const resourceId = resource.idServiceAtLocation || resource.idService || resource.id;
    
    // Remove existing resource with same ID
    const filteredResources = resources.filter((r: Resource) => {
      const existingId = r.idServiceAtLocation || r.idService || r.id;
      return existingId !== resourceId;
    });
    
    // Add to beginning
    filteredResources.unshift(resource);
    
    // Keep only last 100 resources to prevent storage bloat
    const limitedResources = filteredResources.slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_211_RESOURCES, JSON.stringify(limitedResources));
    
    console.log(`📦 Stored resource ${resourceId} for detail view`);
  } catch (error) {
    console.error('Error storing resource for detail view:', error);
  }
}

/* FETCH RESOURCE BY ID (from cache or API) */
export async function fetchResourceById(resourceId: string): Promise<Resource | null> {
  console.log(`🔍 Fetching resource by ID: ${resourceId}`);
  
  // First try AsyncStorage for recently viewed resources
  try {
    const storedResources = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_211_RESOURCES);
    if (storedResources) {
      const resourcesArr: Resource[] = JSON.parse(storedResources);
      const foundResource = resourcesArr.find((r: Resource) => 
        r.idServiceAtLocation === resourceId || 
        r.idService === resourceId || 
        r.id === resourceId
      );
      
      if (foundResource) {
        console.log(`✅ Found resource ${resourceId} in storage`);
        return foundResource;
      }
    }
  } catch (error) {
    console.error('Error reading resource from AsyncStorage:', error);
  }

  // If not found in storage and no individual resource detail API is available,
  // we return null. The 211 National API doesn't seem to have individual resource endpoints.
  console.log(`❌ Resource ${resourceId} not found in storage and no detail API available`);
  return null;
}

/* FETCH CATEGORIES – STATIC */
export async function fetchCategories(): Promise<Category[]> {
  const categoriesArray: Category[] = Object.entries(MAIN_CATEGORIES).map(
    ([id, cat]) => ({
      id,
      name: cat.name,
      icon: cat.icon,
      keywords: Array.isArray(cat.keywords) ? cat.keywords : [],
    })
  );
  if (__DEV__) {
    console.log("📦 fetchCategories →", categoriesArray.length, "categories");
  }
  return categoriesArray;
}

/* FETCH SUBCATEGORIES */
export async function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
  if (categoryId === 'all') {
    // Return all subcategories from all categories
    const allSubcategories: Subcategory[] = [];
    Object.entries(SUBCATEGORIES).forEach(([catId, subcats]) => {
      subcats.forEach(sub => {
        allSubcategories.push({
          id: sub.id || `${catId}-${sub.name}`,
          name: sub.name,
          categoryId: catId,
          taxonomyCode: sub.taxonomyCode,
        });
      });
    });
    return allSubcategories;
  }

  // Return subcategories for specific category
  const categorySubcats = SUBCATEGORIES[categoryId] || [];
  return categorySubcats.map(sub => ({
    id: sub.id || `${categoryId}-${sub.name}`,
    name: sub.name,
    categoryId: categoryId,
    taxonomyCode: sub.taxonomyCode,
  }));
}

/* MAIN CATEGORY FETCH - Uses keywordIsTaxonomyTerm: true */
export async function fetchResourcesByMainCategory(
  categoryName: string,
  skip = 0,
  size = 20
): Promise<ResourcePage> {
  console.log('fetchResourcesByMainCategory called!');
  const locationParams = buildLocationParams();
  
  // Query parameters
  const queryParams: Record<string, string | undefined> = {
    keywords: categoryName.trim().toLowerCase(),
    location: locationParams.location,
    skip: String(skip),
    size: String(size),
  };
  
  // Search parameters as headers
  const searchHeaders: Record<string, string | undefined> = {
    "searchMode": "All",
    "locationMode": "Within",
    "keywordIsTaxonomyCode": "false",
    "keywordIsTaxonomyTerm": "true", // TRUE for main categories
  };
  
  console.log('Main category request params:', queryParams);
  console.log('Main category search headers:', searchHeaders);
  
  const data = await national211Get<{ results: Resource[]; count?: number; total?: number }>(
    "/search/keyword", 
    queryParams, 
    searchHeaders
  );
  
  // Handle response structure (API returns "results" and "count")
  if (!data || !data.results) {
    return { items: [], total: 0, hasMore: false };
  }
  
  if (!Array.isArray(data.results)) {
    throw new Error("Malformed API response – `results` is not an array");
  }
  
  const total = typeof data.count === "number" ? data.count : data.results.length;
  const hasMore = data.results.length >= size; // More data available if we got a full page
  return { items: data.results, total, hasMore };
}

/* SUBCATEGORY FETCH - Uses keywordIsTaxonomyCode: true */
export async function fetchResourcesBySubcategory(
  subcatName: string,
  zipCode?: string,
  skip = 0,
  size = 20
): Promise<ResourcePage> {
  const taxonomyCode = TAXONOMY_MAP[subcatName];
  const isTaxonomy = Boolean(taxonomyCode);
  const locationParams = buildLocationParams();
  
  // Query parameters
  const queryParams: Record<string, string | undefined> = {
    keywords: isTaxonomy ? taxonomyCode! : subcatName.trim().toLowerCase(),
    location: zipCode?.trim() || locationParams.location,
    skip: String(skip),
    size: String(size),
  };
  
  // Search parameters as headers
  const searchHeaders: Record<string, string | undefined> = {
    "searchMode": "All",
    "locationMode": "Within",
    "keywordIsTaxonomyCode": isTaxonomy ? "true" : "false", // TRUE for subcategories when using taxonomy code
    "keywordIsTaxonomyTerm": "false",
  };
  
  console.log('Subcategory request params:', queryParams);
  console.log('Subcategory search headers:', searchHeaders);
  
  const data = await national211Get<{ results: Resource[]; count?: number; total?: number }>(
    "/search/keyword", 
    queryParams, 
    searchHeaders
  );
  
  if (!data || !data.results) {
    return { items: [], total: 0, hasMore: false };
  }
  
  if (!Array.isArray(data.results)) {
    throw new Error("Malformed API response – `results` is not an array");
  }
  
  const total = typeof data.count === "number" ? data.count : data.results.length;
  const hasMore = data.results.length >= size;
  return {
    items: data.results,
    total,
    hasMore,
  };
}

/* RESOURCE DETAILS HELPER FUNCTIONS */
export function getResourcePhoneNumber(resource: Resource): string | null {
  if (resource.phoneNumbers?.main) return resource.phoneNumbers.main;
  if (resource.phone) return resource.phone;
  return null;
}

export function getResourceFormattedAddress(resource: Resource): string | null {
  if (resource.address) {
    const addr = resource.address;
    return [
      addr.streetAddress,
      addr.city,
      addr.stateProvince,
      addr.postalCode
    ].filter(Boolean).join(', ');
  }
  if (resource.location) return resource.location;
  return null;
}

export function getResourceDisplayName(resource: Resource): string {
  return resource.nameServiceAtLocation || 
         resource.nameService || 
         resource.name || 
         'Unknown Service';
}

export function getResourceDescription(resource: Resource): string {
  return resource.descriptionService || 
         resource.description || 
         'No description available';
}

export function getResourceUniqueId(resource: Resource): string | null {
  return resource.idServiceAtLocation || 
         resource.idService || 
         resource.id || 
         null;
}

/* SERVICE AT LOCATION DETAILS INTERFACE */
export interface ServiceAtLocationDetails {
  organizationName?: string;
  serviceName?: string;
  locationName?: string;
  serviceDescription?: string;
  serviceHoursText?: string;
  website?: string;
  address?: {
    streetAddress?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };
  servicePhones?: Array<{
    number?: string;
    type?: string;
    extension?: string;
  }>;
  fees?: string;
  applicationProcess?: string;
  eligibility?: string;
  documentsRequired?: string;
  languagesOffered?: string[];
  disabilitiesAccess?: string;
}

/* FETCH SERVICE AT LOCATION DETAILS */
export async function fetchServiceAtLocationDetails(serviceAtLocationId: string): Promise<ServiceAtLocationDetails | null> {
  console.log(`🔍 Fetching service at location details for ID: ${serviceAtLocationId}`);
  
  try {
    const data = await national211Get<ServiceAtLocationDetails>(
      `/query/service-at-location-details/${serviceAtLocationId}`
    );
    
    console.log(`✅ Successfully fetched details for service at location ${serviceAtLocationId}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch service at location details for ${serviceAtLocationId}:`, error);
    return null;
  }
}

/* HTML UTILITY FUNCTIONS */
export function stripHtmlTags(htmlString: string | undefined | null): string {
  if (!htmlString) return '';
  
  // Remove HTML tags using regex
  const strippedString = htmlString
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular space
    .replace(/&amp;/g, '&')  // Replace &amp; with &
    .replace(/&lt;/g, '<')   // Replace &lt; with <
    .replace(/&gt;/g, '>')   // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#x27;/g, "'") // Replace &#x27; with '
    .replace(/&#x2F;/g, '/') // Replace &#x2F; with /
    .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
    .trim();                 // Remove leading/trailing whitespace
  
  return strippedString;
}

/* ENHANCED DESCRIPTION HELPER */
export function getResourceCleanDescription(resource: ServiceAtLocationDetails): string {
  const rawDescription = resource.serviceDescription || 'No description available';
  return stripHtmlTags(rawDescription);
}


/* GEOLOCATION */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  const granted = status === Location.PermissionStatus.GRANTED;
  if (!granted) throw new Error("Location permission not granted");
  const loc = await Location.getCurrentPositionAsync({});
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}

/* Haversine utility */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: "mi" | "km" = "mi"
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = unit === "mi" ? 3959 : 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* CLEAR STORAGE (for debugging/cleanup) */
export async function clearResourceStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_211_RESOURCES);
    console.log('📦 Cleared resource storage');
  } catch (error) {
    console.error('Error clearing resource storage:', error);
  }
}

/* GET STORAGE STATS (for debugging) */
export async function getStorageStats(): Promise<{
  resourceCount: number;
  storageSize: string;
}> {
  try {
    const storedResources = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_211_RESOURCES);
    if (storedResources) {
      const resources = JSON.parse(storedResources);
      const sizeInBytes = new Blob([storedResources]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      
      return {
        resourceCount: resources.length,
        storageSize: `${sizeInKB} KB`,
      };
    }
  } catch (error) {
    console.error('Error getting storage stats:', error);
  }
  
  return {
    resourceCount: 0,
    storageSize: '0 KB',
  };
}
