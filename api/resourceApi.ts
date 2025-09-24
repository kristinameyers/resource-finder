// ---------------------------------------------------------------
// resourceApi.ts – Updated to match the modern index.ts API
// ---------------------------------------------------------------

import axios from "axios";

import * as Location from "expo-location";

import { apiRequest } from "../utils/queryClient";
import {
  Resource,
  Category,
  Subcategory,
  Location as Loc,
  // keep the shared schema imports for strong typing
  resourceSchema,
  users,
  // NOTE: Do NOT import ResourceDetail or ServiceAtLocationDto here –
  // we declare them locally below.
} from "../types/shared-schema";

/* ---------- Local type definitions (only needed if they aren’t exported) ---------- */
interface ServiceAtLocationDto {
  /** Optional name returned by the backend */
  serviceName?: string;
  /** Legacy field name – kept for backward compatibility */
  serviceAtLocationName?: string;
  // Add any additional fields you need from the API response
  // e.g. description?: string;
  //      phone?: string;
}

interface ResourceDetail {
  /** The display name that the UI will show */
  serviceName: string;
  // Add every property you map in `getResourceDetail`
  // e.g. description?: string;
  //      phone?: string;
}

/* ------------------------------------------------------------------
   ENVIRONMENT VARIABLES (Expo exposes only EXPO_PUBLIC_* vars)
   ------------------------------------------------------------------ */
const API_KEY = process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY ?? "";
const SEARCH_API_URL =
  process.env.EXPO_PUBLIC_NATIONAL_211_API_URL ?? ""; // primary endpoint
const QUERY_API_URL =
  process.env.EXPO_PUBLIC_NATIONAL_211_API_URL2 ?? ""; // secondary endpoint

/* ------------------------------------------------------------------
   Helper: build a URL with optional query parameters.
   ------------------------------------------------------------------ */
function buildUrl(path: string, params?: URLSearchParams): string {
  // Prefer the explicit SEARCH_API_URL; if it’s empty we fall back to QUERY_API_URL.
  const base = SEARCH_API_URL || QUERY_API_URL;
  const prefix = base ? `${base}${path}` : `/api${path}`;
  return params && params.toString() ? `${prefix}?${params}` : prefix;
}

/* ------------------------------------------------------------------
   Unified GET wrapper – uses axios for consistency.
   ------------------------------------------------------------------ */
async function httpGet<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = buildUrl(path, params);
  const headers: Record<string, string> = {};

  if (API_KEY) {
    headers["Api-Key"] = API_KEY;
  }

  try {
    // axios.get<T>() already knows the shape of the response body.
    const { data } = await axios.get<T>(url, { headers });
    return data;
  } catch (err: any) {
    // Normalise Axios errors into something easier for callers.
    if (err.response) {
      const status = err.response.status;
      const msg = err.response.data?.message ?? err.message;
      throw new Error(`HTTP ${status}: ${msg}`);
    }
    throw new Error(`Network error: ${err.message}`);
  }

/**
 * Generic GET request that:
 *   • logs the full Axios response for debugging,
 *   • returns the JSON payload (`data`),
 *   • throws a plain Error with a consistent message format.
 *
 * @param url      Fully‑qualified URL (including any query string)
 * @param headers  Optional request headers (e.g. Api‑Key)
 */
async function httpGet<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  try {
    // Axios automatically parses JSON and infers the shape via <T>.
    const response = await axios.get<T>(url, { headers });

    // 👉 Log the *entire* Axios response object – this includes
    //    status, headers, and the raw data that came back from the server.
    console.log("🔎 Raw response:", response);

    // The actual payload we care about lives in `response.data`.
    return response.data;
  } catch (err: any) {
    // Axios puts the server’s response (if any) on `err.response`.
    if (err.response) {
      const status = err.response.status;
      const msg = err.response.data?.message ?? err.message;
      throw new Error(`HTTP ${status}: ${msg}`);
    }

    // Anything else (network failure, timeout, DNS error, etc.).
    throw new Error(`Network error: ${err.message}`);
  }
}


}

/* ------------------------------------------------------------------
   Existing functions (search, list, …) – placeholders for your own
   ------------------------------------------------------------------ */
export async function getServiceList(orgId: string) {
  // TODO: implement according to your backend contract
}

/* ------------------------------------------------------------------
   NEW: detailed resource helper
   ------------------------------------------------------------------ */
export async function getResourceDetail(
  serviceAtLocationId: string
): Promise<ResourceDetail> {
  const raw = await httpGet<ServiceAtLocationDto>(
    `/service-at-location/${serviceAtLocationId}`
  );

  // Flatten / map the DTO into the shape you expose to the UI.
  return {
    serviceName:
      raw.serviceName ?? raw.serviceAtLocationName ?? "Unnamed Service",
    // Add the rest of the mapping you need here…
    // e.g. description: raw.description ?? "",
    //       phone: raw.phone ?? "",
    //       ...etc.
  };
}

/* ------------------------------------------------------------------
   FETCH RESOURCES (list)
   ------------------------------------------------------------------ */
export async function fetchResources(
  categoryId?: string,
  subcategoryId?: string,
  zipCode?: string,
  coordinates?: { latitude: number; longitude: number },
  useApi = true,
  sortBy: "relevance" | "distance" | "name" = "relevance",
  keyword?: string,
  skip = 0,
  take = 20
): Promise<{ resources: Resource[]; total: number; source: string }> {
  const qp = new URLSearchParams();

  if (categoryId) qp.append("categoryId", categoryId);
  if (subcategoryId) qp.append("subcategoryId", subcategoryId);
  if (zipCode) qp.append("zipCode", zipCode);
  if (coordinates) {
    qp.append("latitude", coordinates.latitude.toString());
    qp.append("longitude", coordinates.longitude.toString());
  }

  qp.append("use211Api", String(useApi));
  qp.append("sortBy", sortBy);
  if (keyword) qp.append("keyword", keyword);
  qp.append("skip", skip.toString());
  qp.append("take", take.toString());

  const urlPath = "/resources";

  try {
    // Using the generic wrapper keeps headers/keys consistent.
    const data = await httpGet<{
      resources: unknown[];
      total?: number;
      source?: string;
    }>(urlPath, qp);

    // Defensive shape checking
    if (!Array.isArray(data.resources)) {
      throw new Error("Malformed API response: `resources` is not an array");
    }

    const resources = data.resources as Resource[];

    return {
      resources,
      total: data.total ?? resources.length,
      source: data.source ?? (SEARCH_API_URL ? "api" : "local"),
    };
  } catch (e) {
    console.error("Error fetching resources:", e);
    throw e;
  }
}

/* ------------------------------------------------------------------
   FETCH SINGLE RESOURCE BY ID
   ------------------------------------------------------------------ */
export async function fetchResourceById(
  id: string,
  useApi = true
): Promise<Resource> {
  const qp = new URLSearchParams();
  if (useApi) qp.append("useApi", "true");

  const data = await httpGet<{ resource: Resource }>(
    `/resources/${encodeURIComponent(id)}`,
    qp
  );

  if (!data.resource) {
    throw new Error("Resource not found");
  }
  return data.resource;
}

/* ------------------------------------------------------------------
   CATEGORIES & SUBCATEGORIES
   ------------------------------------------------------------------ */
export async function fetchCategories(): Promise<Category[]> {
  const data = await httpGet<{ categories: Category[] }>("/categories");
  return data.categories;
}

export async function fetchSubcategories(
  categoryId: string
): Promise<Subcategory[]> {
  const qp = new URLSearchParams();
  qp.append("categoryId", categoryId);
  const data = await httpGet<{ subcategories: Subcategory[] }>(
    "/subcategories",
    qp
  );
  return data.subcategories;
}

/* ------------------------------------------------------------------
   LOCATIONS (static list, zip‑code lookup, coordinate lookup)
   ------------------------------------------------------------------ */
export async function fetchLocations(): Promise<Loc[]> {
  const data = await httpGet<{ locations: Loc[] }>("/locations");
  return data.locations;
}

/**
 * Returns `null` when the location cannot be found (404) – matches the newer
 * index.ts implementation.
 */
export async function fetchLocationByZipCode(
  zipCode: string
): Promise<Loc | null> {
  const data = await httpGet<{ location?: Loc }>(
    `/location/zipcode/${encodeURIComponent(zipCode)}`
  );
  return data.location ?? null;
}

export async function fetchLocationByCoordinates(
  latitude: number,
  longitude: number
): Promise<Loc | null> {
  const qp = new URLSearchParams();
  qp.append("latitude", latitude.toString());
  qp.append("longitude", longitude.toString());

  const data = await httpGet<{ location?: Loc }>(
    "/location/coordinates",
    qp
  );
  return data.location ?? null;
}

/* ------------------------------------------------------------------
   GEOLOCATION HELPER – uses expo-location (works on iOS/Android)
   ------------------------------------------------------------------ */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  // Request permission first – expo-location handles the native dialog.
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error("Location permission not granted");
  }

  const loc = await Location.getCurrentPositionAsync({});
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}

/* ------------------------------------------------------------------
   FETCH DETAILED INFO FOR A RESOURCE
   ------------------------------------------------------------------ */
export interface ResourceDetails {
  // Define the exact shape you expect from the backend.
  // Example:
  description?: string;
  phone?: string;
  website?: string;
  // …add whatever fields the `/details` endpoint returns
}

export async function fetchResourceDetails(
  id: string,
  serviceId?: string
): Promise<ResourceDetails | null> {
  const qp = new URLSearchParams();
  if (serviceId) qp.append("serviceId", serviceId);

  const data = await httpGet<{
    details?: ResourceDetails;
  }>(`/resources/${encodeURIComponent(id)}/details`, qp);

  return data.details ?? null;
}

/* ------------------------------------------------------------------
   OPTIONAL: USER‑RELATED ENDPOINTS (kept for completeness)
   ------------------------------------------------------------------ */
// Example – you can extend these similarly if you need them.
// export async function fetchUsers(): Promise<User[]> { … }
// export async function insertUser(payload: InsertUser): Promise<User> { … }