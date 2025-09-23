import { Resource, Category, Subcategory, Location } from "../types/shared-schema";

// Pull environment variables with fallback for Expo/React Native
const NATIONAL_211_API_URL: string =
  process.env.EXPO_PUBLIC_NATIONAL_211_API_URL || "";
const NATIONAL_211_API_KEY: string =
  process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY || "";

// ---- INTERNAL: Generic fetch utility for National 211 API ----
async function national211Request(
  endpoint: string,
  params?: Record<string, string | number | undefined>
): Promise<any> {
  if (!NATIONAL_211_API_URL) throw new Error("National 211 API URL is not configured.");
  if (!NATIONAL_211_API_KEY) throw new Error("National 211 API Key is not configured.");

  // Format URL safely
  const base = NATIONAL_211_API_URL.replace(/\/$/, "");
  const path = endpoint.replace(/^\//, "");
  const url = new URL(`${base}/${path}`);

  // Attach query params if any
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Fetch using get and add required headers
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Api-Key": NATIONAL_211_API_KEY,
      Accept: "application/json",
    },
  });

  // Handle HTTP error
  if (!res.ok) {
    let msg = "";
    try {
      const json = await res.json();
      msg = json && json.message ? json.message : "";
    } catch {
      msg = await res.text();
    }
    throw new Error(`National 211 API error: [${res.status}] ${msg || res.statusText}`);
  }

  return res.json();
}

// ---- API Functions ----

// GENERAL SEARCH / RESOURCES
export async function fetchNational211Resources(options: {
  taxonomyCode?: string;
  keyword?: string;
  location?: string; // e.g. zip or coords
  locationMode?: "Within" | "Near";
  distance?: number;
  sortBy?: "relevance" | "distance" | "name";
  skip?: number;
  take?: number;
}): Promise<{ resources: Resource[]; total: number }> {
  const params: Record<string, string | number | undefined> = {
    sort: options.sortBy,
    keywords: options.keyword,
    serviceTaxonomyCode: options.taxonomyCode,
    location: options.location,
    locationMode: options.locationMode,
    distance: options.distance,
    skip: options.skip || 0,
    take: options.take || 20,
  };

  // Endpoint for national search (see 211.org docs)
  const data = await national211Request("search/keyword", params);

  // Defensive: ensure shape
  return {
    resources: Array.isArray(data.results) ? data.results : [],
    total:
      typeof data.count === "number"
        ? data.count
        : Array.isArray(data.results)
        ? data.results.length
        : 0,
  };
}

// DETAIL: fetch a single resource by national 211 resourceId
export async function fetchNational211ResourceById(resourceId: string): Promise<Resource | null> {
  if (!resourceId) throw new Error("Resource ID is required.");
  // There is not always a canonical 'by id' endpoint; this may change per 211 docs.
  try {
    const data = await national211Request(`resource/${resourceId}`);
    if (data && typeof data === "object") {
      return (
        data.resource || data // Accept either a { resource } wrapper or bare resource
      );
    }
    return null;
  } catch (e: any) {
    // If 404, return null
    if (typeof e.message === "string" && e.message.includes("404")) return null;
    throw e;
  }
}

// CATEGORIES (for mapping category pickers, etc)
export async function fetchNational211Categories(): Promise<Category[]> {
  try {
    const data = await national211Request("categories");
    return Array.isArray(data.categories) ? data.categories : [];
  } catch {
    // National API may not expose top-level categories; fallback to empty
    return [];
  }
}

// SUBCATEGORIES (pass taxonomy code to get subcategory details)
// Not all endpoints may be implemented by 211 API—use fallback
export async function fetchNational211Subcategories(
  taxonomyCode: string
): Promise<Subcategory[]> {
  try {
    const data = await national211Request("subcategories", { taxonomyCode });
    return Array.isArray(data.subcategories) ? data.subcategories : [];
  } catch {
    return [];
  }
}

// ---- LOCATION SUPPORT ----

// These are mostly stubs; national API may not expose zip/coordinate to location mapping

// By Zip code – if supported in future
export async function fetchNational211LocationByZip(
  zipCode: string
): Promise<Location | null> {
  // Not available in public API, stub for extensibility
  return null;
}

// By coordinates – if supported in future
export async function fetchNational211LocationByCoordinates(
  latitude: number,
  longitude: number
): Promise<Location | null> {
  // Not available in public API, stub for extensibility
  return null;
}

// ---- UTILITY: Validate credentials/config ----
export async function checkNational211ApiStatus(): Promise<boolean> {
  try {
    // Ping categories endpoint as a lightweight check
    await fetchNational211Categories();
    return true;
  } catch {
    return false;
  }
}
