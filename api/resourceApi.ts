import axios from "axios";
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
const BASE_URL = process.env.EXPO_PUBLIC_NATIONAL_211_API_URL || "https://api.211.org/resources/v2";
const API_KEY = process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY || "";

/* --------------------------------------------------------------
   Helper – build a clean URL (adds trailing slash, removes double slashes)
   -------------------------------------------------------------- */
function buildUrl(path: string): string {
  const cleanBase = BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

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
  }
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

  if (!Array.isArray(data.resources)) {
    throw new Error("Malformed API response – `resources` is not an array");
  }

  const total = typeof data.total === "number" ? data.total : data.resources.length;
  const hasMore = false;
  return { items: data.resources, total, hasMore };
}

/* ------------------------------------------------------------------
   FETCH SUBCATEGORY OR TAXONOMY RESOURCES – core function used by the infinite‑scroll list
   ------------------------------------------------------------------ */
export interface ResourcePage {
  items: Resource[];
  total: number;
  hasMore: boolean;
}

export async function fetchResourcesBySubcategory(
  subcatName: string,
  zipCode?: string,
  skip = 0,
  size = 10
): Promise<ResourcePage> {
  const taxonomyCode = TAXONOMY_MAP[subcatName];
  const isTaxonomy = Boolean(taxonomyCode);

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

  if (!Array.isArray(data.resources)) {
    throw new Error("Malformed API response – `resources` is not an array");
  }

  const total = typeof data.total === "number" ? data.total : data.resources.length;
  const hasMore = skip + size < total;

  return {
    items: data.resources,
    total,
    hasMore,
  };
}

export async function fetchSubcategories(
  categoryId: string
): Promise<Subcategory[]> {
  const params: Record<string, string> = { categoryId };
  const { subcategories } = await httpGet<{ subcategories: Subcategory[] }>("/subcategories", params);
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

  const loc = await Location.getCurrentPositionAsync({});
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}

/* ------------------------------------------------------------------
   Haversine utility (optional, client‑side distance calc)
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
