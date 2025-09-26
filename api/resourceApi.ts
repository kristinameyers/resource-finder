// src/api/resourceApi.ts
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
} from "../taxonomy";

/* --------------------------------------------------------------
   ENVIRONMENT
   -------------------------------------------------------------- */
const API_KEY = process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY ?? "";
const BASE_URL =
  process.env.EXPO_PUBLIC_NATIONAL_211_API_URL ??
  "https://api.211.org/resources/v2";

/* --------------------------------------------------------------
   Helper – build a clean URL (adds trailing slash, removes double slashes)
   -------------------------------------------------------------- */
function buildUrl(path: string, params?: URLSearchParams): string {
  const cleanBase = BASE_URL.replace(/\/+$/, "/");
  const cleanPath = path.replace(/^\/+/, "");
  const url = `${cleanBase}${cleanPath}`;
  return params && params.toString() ? `${url}?${params}` : url;
}

/* --------------------------------------------------------------
   Unified GET – logs (dev only), normalises errors, validates JSON
   -------------------------------------------------------------- */
async function httpGet<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = buildUrl(path, params);
  const headers: Record<string, string> = {};

  if (API_KEY) headers["Api-Key"] = API_KEY;

  try {
    const resp = await axios.get<T>(url, { headers });

    // Debug‑only logging (won’t appear in production builds)
    if (__DEV__) {
      console.log("🔎 GET", url, "→", resp.status);
      console.log("🔎 Raw data:", resp.data);
    }

    // Basic runtime guard – ensures we got an object back
    if (resp.data === null || typeof resp.data !== "object") {
      throw new Error("Malformed API response – expected an object");
    }

    return resp.data;
  } catch (err: any) {
    if (err.response) {
      const { status, data } = err.response;
      throw new Error(`HTTP ${status}: ${data?.message ?? err.message}`);
    }
    throw new Error(`Network error: ${err.message}`);
  }
}

/* ------------------------------------------------------------------
   TAXONOMY MAP – generated from the static sub‑category list.
   ------------------------------------------------------------------ */
export const TAXONOMY_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  // Walk every sub‑category and store its taxonomyCode keyed by the *display name*
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
   FETCH RESOURCES – core function used by the infinite‑scroll list
   ------------------------------------------------------------------ */
export interface ResourcePage {
  items: Resource[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch a page of resources for a given **sub‑category** (or plain keyword).
 *
 * @param subcatName   Human‑readable sub‑category name (e.g. "Food Pantries")
 * @param zipCode      Optional 5‑digit ZIP (if omitted we fall back to county)
 * @param skip         Pagination offset (must be a multiple of `size`)
 * @param size         Page size (default 20, max 100)
 */
export async function fetchResourcesBySubcategory(
  subcatName: string,
  zipCode?: string,
  skip = 0,
  size = 20
): Promise<ResourcePage> {
  // --------------------------------------------------------------
  // 1️⃣ Determine whether we have a taxonomy code or a plain keyword
  // --------------------------------------------------------------
  const taxonomyCode = TAXONOMY_MAP[subcatName];
  const isTaxonomy = Boolean(taxonomyCode);
  const keywordParam = isTaxonomy ? taxonomyCode! : subcatName;

  // --------------------------------------------------------------
  // 2️⃣ Build query parameters according to the spec you gave
  // --------------------------------------------------------------
  const qp = new URLSearchParams();
  qp.append("keywords", keywordParam);
  qp.append("keywordIsTaxonomyCode", isTaxonomy ? "true" : "false");
  qp.append("searchMode", "All"); // strict match per spec

  // Location handling
  if (zipCode) {
    qp.append("location", zipCode);
    qp.append("distance", "100"); // fixed radius for zip‑code searches
    qp.append("orderByDistance", "true");
  } else {
    qp.append("location", "Santa Barbara, California");
    qp.append("orderByDistance", "false");
  }

  qp.append("size", size.toString());
  qp.append("skip", skip.toString());

  // --------------------------------------------------------------
  // 3️⃣ Call the unified 211 endpoint
  // --------------------------------------------------------------
  const data = await httpGet<{
    resources: Resource[];
    total?: number;
  }>("/search/keyword", qp);

  // Defensive shape check – the runtime guard in httpGet already ensured an object,
  // but we double‑check the array shape.
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

/* ------------------------------------------------------------------
   FETCH CATEGORIES – **STATIC** – use the taxonomy JSON.
   ------------------------------------------------------------------ */
export async function fetchCategories(): Promise<Category[]> {
  // Convert the MAIN_CATEGORIES map into an array that matches the
  // Category interface (including the required `keywords` field).
  const categoriesArray: Category[] = Object.entries(MAIN_CATEGORIES).map(
    ([id, cat]) => ({
      id,
      name: cat.name,
      icon: cat.icon,
      // Some taxonomy entries may omit keywords – default to an empty array.
      keywords: Array.isArray(cat.keywords) ? cat.keywords : [],
    })
  );

  if (__DEV__) {
    console.log("📦 fetchCategories →", categoriesArray.length, "categories");
  }
  return categoriesArray;
}

export async function fetchSubcategories(
  categoryId: string
): Promise<Subcategory[]> {
  const qp = new URLSearchParams();
  qp.append("categoryId", categoryId);
  const { subcategories } = await httpGet<{
    subcategories: Subcategory[];
  }>("/subcategories", qp);
  return subcategories;
}

/* ------------------------------------------------------------------
   GEOLOCATION – thin wrapper around expo-location
   ------------------------------------------------------------------ */
/**
 * Get the device’s current GPS coordinates.
 * Works with all Expo SDKs – the PermissionStatus enum already
 * contains the GRANTED value, so we don’t need a string comparison.
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  // Request foreground location permission
  const { status } = await Location.requestForegroundPermissionsAsync();

  // The enum value for “granted” is Location.PermissionStatus.GRANTED
  const granted = status === Location.PermissionStatus.GRANTED;

  if (!granted) {
    throw new Error("Location permission not granted");
  }

  // Permission granted – fetch the actual coordinates
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
  const R = unit === "mi" ? 3959 : 6371; // Earth radius

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