<<<<<<< HEAD
// resourceApi.ts
=======
import axios from "axios";
>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799
import * as Location from "expo-location";
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

/* --------------------------------------------------------------
   ENVIRONMENT
   -------------------------------------------------------------- */
<<<<<<< HEAD
const API_KEY = process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY ?? "";
const BASE_URL = process.env.EXPO_PUBLIC_NATIONAL_211_API_URL ?? "https://api.211.org/resources/v2";

/* SANTA BARBARA CITY NAME CONSTANT */
const SANTA_BARBARA_TEXT = "Santa Barbara";
=======
const BASE_URL = process.env.EXPO_PUBLIC_NATIONAL_211_API_URL || "https://api.211.org/resources/v2";
const API_KEY = process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY || "";
>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799

/* --------------------------------------------------------------
   Helper – build a clean URL (adds trailing slash, removes double slashes)
   -------------------------------------------------------------- */
<<<<<<< HEAD
function buildUrl(path: string) {
=======
function buildUrl(path: string): string {
>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799
  const cleanBase = BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

<<<<<<< HEAD
/* ------------------ MINIMAL PARAM SUPPORT FOR MAIN CATEGORIES ------------------ */
function buildLocationParams(): {
  location: string;
  locationMode: "Within";
} {
  return {
    location: SANTA_BARBARA_TEXT,
    locationMode: "Within",
  };
}

// LEGACY, more complex locationParams builder (keep as comments for restoration)
/*
function buildLocationParams(
  zipCode?: string
): {
  location: string;
  locationMode: "postalcode" | "within";
  distance?: number;
  orderByDistance?: "true" | "false";
} {
  const isZip = zipCode && zipCode.trim() !== "";
  if (isZip) {
    return {
      location: zipCode!,
      locationMode: "postalcode",
      distance: 50,
      orderByDistance: "true",
    };
  } else {
    return {
      location: SANTA_BARBARA_TEXT,
      locationMode: "within",
    };
=======
/* --------------------------------------------------------------
   Unified GET – logs (dev only), normalises errors, validates JSON
   -------------------------------------------------------------- */
async function httpGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = buildUrl(path);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Api-Key": API_KEY,
    "Accept": "application/json"
  };

  console.log('Axios GET request:', { url, headers, params });

  try {
    const resp = await axios.get<T>(url, { headers, params });
    if (__DEV__) {
      console.log("🔎 GET", url, "→", resp.status);
      console.log("🔎 Raw data:", resp.data);
    }
    if (resp.data === null || typeof resp.data !== "object") {
      throw new Error("Malformed API response – expected an object");
    }
    return resp.data;
  } catch (err: any) {
    if (err.response) {
      console.error('API error:', err.response.status, err.response.data);
      throw new Error(`HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    }
    throw new Error(`Network error: ${err.message}`);
>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799
  }
}
*/

/* --------------------------------------------------------------
   NATIVE FETCH USING URL + searchParams.append (GET)
   -------------------------------------------------------------- */
async function national211Get<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const urlObj = new URL(buildUrl(path));
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null) {
        urlObj.searchParams.append(key, value);
      }
    });
  }
  const url = urlObj.toString();
  const headers: Record<string, string> = {
    "Api-Key": API_KEY,
    "Accept": "application/json"
  };
  console.log("Fetch GET request:", url, headers);
  const res = await fetch(url, { method: "GET", headers });
  console.log("🔎 Response status:", res.status);
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
  const data = await res.json();
  if (__DEV__) {
    console.log("🔎 GET", url, "→", res.status);
    console.log("🔎 Raw data:", data);
  }
  if (data === null || typeof data !== "object") {
    throw new Error("Malformed API response – expected an object");
  }
  return data;
}

/* ------------------------------------------------------------------
   TAXONOMY MAP – generated from the static sub‑category list.
   ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   FETCH CATEGORIES – **STATIC** – use the taxonomy JSON.
   ------------------------------------------------------------------ */
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

<<<<<<< HEAD
/* ------------- MINIMAL MAIN CATEGORY FETCH FOR TESTING ----------- */
export async function fetchResourcesByMainCategory(
  categoryName: string
): Promise<ResourcePage> {
  console.log('fetchResourcesByMainCategory called!');
  const locationParams = buildLocationParams();
  const params: Record<string, string | undefined> = {
    keywords: categoryName.trim().toLowerCase(),
    location: locationParams.location,
    locationMode: locationParams.locationMode,
  };
  console.log('Actual request params:', params);
  const data = await national211Get<{ resources: Resource[]; total?: number }>("/search/keyword", params);
=======
/* ------------------------------------------------------------------
   FETCH MAIN CATEGORY RESOURCES – for HomeScreen icon clicks
   ------------------------------------------------------------------ */
export async function fetchResourcesByMainCategory(
  categoryName: string,
  zipCode?: string
): Promise<ResourcePage> {
  console.log('fetchResourcesByMainCategory called!');

  const keywordParam = categoryName.trim().toLowerCase();

  const params: Record<string, string> = {
    keywords: keywordParam,
    keywordIsTaxonomyCode: "false",
    location: zipCode || "Santa Barbara",
    locationMode: zipCode ? "postalcode" : "within"
  };

  console.log('🔎 keywords:', params.keywords);
  console.log('🔎 location:', params.location);
  console.log('🔎 locationMode:', params.locationMode);

  const data = await httpGet<{ resources: Resource[]; total?: number }>("/search/keyword", params);

>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799
  if (!Array.isArray(data.resources)) {
    throw new Error("Malformed API response – `resources` is not an array");
  }
  const total = typeof data.total === "number" ? data.total : data.resources.length;
<<<<<<< HEAD
  const hasMore = total > 0;
  return { items: data.resources, total, hasMore };
}

/* Core ResourcePage interface */
=======
  const hasMore = false;
  return { items: data.resources, total, hasMore };
}

/* ------------------------------------------------------------------
   FETCH SUBCATEGORY OR TAXONOMY RESOURCES – core function used by the infinite‑scroll list
   ------------------------------------------------------------------ */
>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799
export interface ResourcePage {
  items: Resource[];
  total: number;
  hasMore: boolean;
}

<<<<<<< HEAD
/* --------- LEGACY ADVANCED SUBCATEGORY AND SUPPORT (restored as needed) ---------- */
=======
>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799
export async function fetchResourcesBySubcategory(
  subcatName: string,
  zipCode?: string,
  skip = 0,
  size = 10
): Promise<ResourcePage> {
  const taxonomyCode = TAXONOMY_MAP[subcatName];
  const isTaxonomy = Boolean(taxonomyCode);
<<<<<<< HEAD
  //const locationParams = buildLocationParams(zipCode); // For advanced param support
  // For minimal test, just use Santa Barbara city params:
  const locationParams = buildLocationParams();
  const params: Record<string, string | undefined> = {
    keywords: isTaxonomy ? taxonomyCode! : subcatName.trim().toLowerCase(),
    keywordIsTaxonomyCode: isTaxonomy ? "true" : "false",
    location: locationParams.location,
    locationMode: locationParams.locationMode,
    // If you later want size & skip, convert with String():
    // size: size !== undefined ? String(size) : undefined,
    // skip: skip !== undefined ? String(skip) : undefined,
    //searchMode: "All",
  };
  console.log('Actual subcategory request params:', params);
  const data = await national211Get<{ resources: Resource[]; total?: number }>("/search/keyword", params);
=======

  const keywordParam = isTaxonomy
    ? taxonomyCode!
    : subcatName.trim().toLowerCase();

  const params: Record<string, string | number> = {
    keywords: keywordParam,
    keywordIsTaxonomyCode: isTaxonomy ? "true" : "false",
    searchMode: "All",
    location: zipCode || "Santa Barbara",
    locationMode: zipCode ? "postalcode" : "within",
    orderByDistance: zipCode ? "true" : "false",
    size,
    skip
  };

  if (zipCode) {
    params.distance = 100;
  }

  const data = await httpGet<{
    resources: Resource[];
    total?: number;
  }>("/search/keyword", params);

>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799
  if (!Array.isArray(data.resources)) {
    throw new Error("Malformed API response – `resources` is not an array");
  }
  const total = typeof data.total === "number" ? data.total : data.resources.length;
  const hasMore = total > 0;
  return {
    items: data.resources,
    total,
    hasMore,
  };
}

/* FETCH SUBCATEGORIES */
export async function fetchSubcategories(
  categoryId: string
): Promise<Subcategory[]> {
<<<<<<< HEAD
  const params: Record<string, string | undefined> = { categoryId };
  const { subcategories } = await national211Get<{ subcategories: Subcategory[] }>("/subcategories", params);
=======
  const params: Record<string, string> = { categoryId };
  const { subcategories } = await httpGet<{ subcategories: Subcategory[] }>("/subcategories", params);
>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799
  return subcategories;
}

/* ------------------------------------------------------------------
   GEOLOCATION – thin wrapper around expo-location
   ------------------------------------------------------------------ */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  const granted = status === Location.PermissionStatus.GRANTED;
  if (!granted) throw new Error("Location permission not granted");
<<<<<<< HEAD
=======

>>>>>>> 51917e9f92a65843d202d9bb3fa621ace36fe799
  const loc = await Location.getCurrentPositionAsync({});
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}

/* ------------------------------------------------------------------
   Haversine utility (client‑side distance calc)
   ------------------------------------------------------------------ */
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
