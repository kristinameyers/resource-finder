// src/api/resourceApi.ts
import axios from "axios";
import * as Location from "expo-location";

import {
  Resource,
  Category,
  Subcategory,
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
const API_KEY = process.env.EXPO_PUBLIC_NATIONAL_211_API_KEY ?? "";
const BASE_URL =
  process.env.EXPO_PUBLIC_NATIONAL_211_API_URL ??
  "https://api.211.org/resources/v2";

/* --------------------------------------------------------------
   Helper – build a clean URL
   -------------------------------------------------------------- */
function buildUrl(path: string, params?: URLSearchParams): string {
  const cleanBase = BASE_URL.replace(/\/+$/, "/");
  const cleanPath = path.replace(/^\/+/, "");
  const url = `${cleanBase}${cleanPath}`;
  return params && params.toString() ? `${url}?${params}` : url;
}

/* --------------------------------------------------------------
   Runtime guard – ensure the payload looks like an object
   -------------------------------------------------------------- */
function assertObject<T>(payload: any, context: string): asserts payload is T {
  if (payload === null || typeof payload !== "object") {
    throw new Error(`Unexpected response shape in ${context}`);
  }
}

/* --------------------------------------------------------------
   Unified GET – logs (dev only), normalises errors, validates data
   -------------------------------------------------------------- */
async function httpGet<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = buildUrl(path, params);
  const headers: Record<string, string> = {};

  if (API_KEY) headers["Api-Key"] = API_KEY;

  try {
    const response = await axios.get<T>(url, { headers });

    // Debug logging only in development builds
    if (__DEV__) {
      console.log("🔎 GET", url, "→", response.status);
      console.log("🔎 Raw response data:", response.data);
    }

    // Basic runtime guard – helps catch malformed API responses early
    assertObject<T>(response.data, `GET ${path}`);

    return response.data;
  } catch (err: any) {
    if (err.response) {
      const { status, data } = err.response;
      throw new Error(`HTTP ${status}: ${data?.message ?? err.message}`);
    }
    throw new Error(`Network error: ${err.message}`);
  }
}

/* ------------------------------------------------------------------
   DETAIL DTO – keep only the fields you actually render.
   ------------------------------------------------------------------ */
export interface ServiceAtLocationDetails {
  serviceAtLocationId: string;
  organizationId: string;
  serviceId: string;
  locationId: string;

  organizationName: string;
  serviceName: string;
  locationName: string;

  organizationDescription?: string;
  serviceDescription?: string;
  locationDescription?: string;

  serviceHoursText?: string;
  locationHoursText?: string;

  website?: string;
  fees?: string;
  applicationProcess?: string;
  eligibility?: string;
  documentsRequired?: string;

  languagesOffered?: string[];
  disabilitiesAccess?: string;

  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };

  servicePhones?: { number: string; type?: string }[];
}

/* ------------------------------------------------------------------
   FETCH DETAILED INFO FOR ONE RESOURCE
   ------------------------------------------------------------------ */
export async function fetchResourceDetail(
  serviceAtLocationId: string
): Promise<ServiceAtLocationDetails> {
  if (!serviceAtLocationId) {
    throw new Error("Missing serviceAtLocationId");
  }

  const endpoint = `/query/service-at-location-details/${encodeURIComponent(
    serviceAtLocationId
  )}`;

  return await httpGet<ServiceAtLocationDetails>(endpoint);
}

/* --------------------------------------------------------------
   TAXONOMY MAP – built from the static taxonomy JSON
   -------------------------------------------------------------- */
export const TAXONOMY_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};

  // Walk through every sub‑category and expose its human‑readable name →
  // taxonomy code. This guarantees the map stays in sync with the JSON.
  Object.values(SUBCATEGORIES).forEach((subList) => {
    subList.forEach((sub) => {
      if (sub.name && sub.taxonomyCode) {
        map[sub.name] = sub.taxonomyCode;
      }
    });
  });

  return map;
})();

/* --------------------------------------------------------------
   FETCH RESOURCES – core function used by the infinite‑scroll list
   -------------------------------------------------------------- */
export interface ResourcePage {
  items: Resource[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch a page of resources for a given sub‑category.
 *
 * @param subcatName Human‑readable sub‑category (e.g. "Food Pantries")
 * @param zipCode    Optional 5‑digit ZIP (validated)
 * @param skip       Pagination offset (must be ≥ 0 and a multiple of `size`)
 * @param size       Page size (defaults to 20, must be > 0 and ≤ 100)
 */
export async function fetchResourcesBySubcategory(
  subcatName: string,
  zipCode?: string,
  skip = 0,
  size = 20
): Promise<ResourcePage> {
  // ---- basic argument validation ---------------------------------
  if (skip < 0 || skip % size !== 0) {
    throw new Error("`skip` must be a non‑negative multiple of `size`");
  }

  if (size <= 0 || size > 100) {
    throw new Error("`size` must be between 1 and 100");
  }

  if (zipCode && !/^\d{5}$/.test(zipCode)) {
    throw new Error(
      "`zipCode` must be a 5‑digit US postal code (e.g. 90210)"
    );
  }

  // ---- taxonomy lookup -------------------------------------------
  const taxonomyCode = TAXONOMY_MAP[subcatName];
  if (!taxonomyCode) {
    throw new Error(`Unknown sub‑category "${subcatName}"`);
  }

  // ---- build query parameters -------------------------------------
  const qp = new URLSearchParams();
  qp.append("keywords", taxonomyCode);
  qp.append("keywordIsTaxonomyCode", "true");
  qp.append("searchMode", "All");

  if (zipCode) {
    qp.append("location", zipCode);
    qp.append("distance", "100"); // could be made configurable later
    qp.append("orderByDistance", "true");
  } else {
    qp.append("location", "Santa Barbara County, California");
    qp.append("orderByDistance", "false");
  }

  qp.append("size", size.toString());
  qp.append("skip", skip.toString());

  // ---- actual request ---------------------------------------------
  const data = await httpGet<{
    resources: Resource[];
    total?: number;
  }>("/search/keyword", qp);

  // Defensive shape check – the runtime guard in httpGet already ran,
  // but we double‑check the array because the API sometimes mis‑labels it.
  if (!Array.isArray(data.resources)) {
    throw new Error("Malformed API response – `resources` is not an array");
  }

  // The API *should* always return `total`; if it doesn’t we fall back
  // to the length of the returned page (best‑effort).
  const total = typeof data.total === "number" ? data.total : data.resources.length;
  const hasMore = skip + size < total;

  return {
    items: data.resources,
    total,
    hasMore,
  };
}

/* --------------------------------------------------------------
   CATEGORY HELPERS
   -------------------------------------------------------------- */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const { categories } = await httpGet<{ categories: Category[] }>(
      "/categories"
    );
    return categories;
  } catch (e) {
    throw new Error(`Failed to load categories – ${(e as Error).message}`);
  }
}

export async function fetchSubcategories(
  categoryId: string
): Promise<Subcategory[]> {
  const qp = new URLSearchParams();
  qp.append("categoryId", categoryId);

  try {
    const { subcategories } = await httpGet<{
      subcategories: Subcategory[];
    }>("/subcategories", qp);
    return subcategories;
  } catch (e) {
    throw new Error(
      `Failed to load sub‑categories for "${categoryId}" – ${
        (e as Error).message
      }`
    );
  }
}

/* --------------------------------------------------------------
   GEOLOCATION – thin wrapper around expo-location
   -------------------------------------------------------------- */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  // `status` is a string union: "granted" | "denied" | "undetermined"
  if (status !== "granted") {
    throw new Error("Location permission not granted");
  }

  const loc = await Location.getCurrentPositionAsync({});
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}

/* --------------------------------------------------------------
   Haversine utility (optional, client‑side distance calc)
   -------------------------------------------------------------- */
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