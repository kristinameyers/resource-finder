/*****************************************************************************************
 * utils/storage.ts
 *
 * In‑memory mock storage that:
 *   • Loads location seed data from src/data/locations.json (generated from uszips.csv)
 *   • Provides helpers to turn a PartialLocation into a full Location
 *   • Guarantees the `keywords` field on categories
 *   • Implements the IStorage contract used throughout the app
 *
 * If the JSON file does not exist yet, the module falls back to an empty array so the
 * app can still start. Run `scripts/build-zipcode-db.ts` to create the file.
 *****************************************************************************************/

import {
  users,
  type User,
  type InsertUser,
  type Resource,
  type Category,
  type Subcategory,
  type Location,
  type PartialLocation,
} from "../types/shared-schema";

import {
  MAIN_CATEGORIES,
  getSubcategoriesForCategory,
} from "../api/archive/officialTaxonomy";

import { calculateDistanceBetweenZipCodes, getCoordinatesForZip } from "./distance";

import fetch from "node-fetch";
import { readFileSync } from "fs";
import { join } from "path";

/* -------------------------------------------------------------------------- */
/* 1️⃣  Load the generated locations JSON (fallback to empty array)           */
/* -------------------------------------------------------------------------- */
let seedLocations: PartialLocation[] = [];

try {
  const jsonPath = join(__dirname, "..", "data", "locations.json");
  const raw = readFileSync(jsonPath, "utf8");
  seedLocations = JSON.parse(raw) as PartialLocation[];
} catch (e) {
  console.warn("[storage] locations.json not found – starting with an empty seed list.");
}

/* -------------------------------------------------------------------------- */
/* 2️⃣  Helper: turn a PartialLocation into a full Location                  */
/* -------------------------------------------------------------------------- */
function toFullLocation(p: PartialLocation): Location {
  return {
    id: p.id ?? `zip-${p.zipCode ?? "unknown"}`,
    name: p.name ?? `Zip Code ${p.zipCode ?? "?????"}`,
    zipCode: p.zipCode ?? "00000",
    latitude: p.latitude!,
    longitude: p.longitude!,
    city: p.city ?? "Unknown City",
    state: p.state ?? "Unknown State",
    country: p.country ?? "US",
  };
}

/* -------------------------------------------------------------------------- */
/* 3️⃣  Category ordering – guarantee `keywords`                              */
/* -------------------------------------------------------------------------- */
const CATEGORY_ORDER = [
  "children-family",
  "food",
  "education",
  "finance-employment",
  "housing",
  "healthcare",
  "hygiene-household",
  "mental-wellness",
  "legal-assistance",
  "substance-use",
  "transportation",
  "young-adults",
  "utilities",
];

function getIconForCategory(id: string): string | undefined {
  const icons: Record<string, string> = {
    "children-family": "users",
    food: "utensils",
    education: "book",
    "finance-employment": "briefcase",
    housing: "home",
    healthcare: "stethoscope",
    "hygiene-household": "shower",
    "mental-wellness": "brain",
    "legal-assistance": "gavel",
    "substance-use": "pills",
    transportation: "bus",
    "young-adults": "graduation-cap",
    utilities: "bolt",
  };
  return icons[id];
}

const orderedCategories: Category[] = CATEGORY_ORDER.filter((id) =>
  id in MAIN_CATEGORIES
).map((id) => {
  const cat = MAIN_CATEGORIES[id as keyof typeof MAIN_CATEGORIES];
  return {
    id,
    name: cat.name,
    icon: getIconForCategory(id),
    // Some taxonomies omit keywords – default to an empty array.
    keywords: Array.isArray(cat.keywords) ? cat.keywords : [],
  };
});

/* -------------------------------------------------------------------------- */
/* 4️⃣  In‑memory storage implementation                                      */
/* -------------------------------------------------------------------------- */
class MemStorage implements IStorage {
  /* -------------------- static data loaded at startup -------------------- */
  private users: User[] = users; // mock user list from shared-schema
  private categories: Category[] = orderedCategories;
  private subcategories: Subcategory[] = []; // filled lazily
  private locations: Location[] = seedLocations.map(toFullLocation);

  /* -------------------- USER OPERATIONS --------------------------------- */
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    // `InsertUser` does NOT contain `createdAt` – we only add the fields that exist.
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
    };
    this.users.push(newUser);
    return newUser;
  }

  /* -------------------- RESOURCE SEARCH --------------------------------- */
  async getResources(
    categoryId?: string,
    subcategoryId?: string,
    zipCode?: string,
    latitude?: number,
    longitude?: number,
    sessionId?: string,
    ipAddress?: string,
    sortBy: "relevance" | "distance" | "name" = "relevance",
    keyword?: string
  ): Promise<Resource[]> {
    // --------------------------------------------------------------
    // Build the 211 API query URL (mirrors production behaviour)
    // --------------------------------------------------------------
    const url = new URL("https://api.211.org/search");
    if (categoryId) url.searchParams.append("category", categoryId);
    if (subcategoryId) url.searchParams.append("subcategory", subcategoryId);
    if (keyword) url.searchParams.append("keyword", keyword);
    if (zipCode) url.searchParams.append("zip", zipCode);
    if (latitude !== undefined && longitude !== undefined) {
      url.searchParams.append("lat", latitude.toString());
      url.searchParams.append("lng", longitude.toString());
    }

    // --------------------------------------------------------------
    // Resolve user coordinates if distance sorting is requested
    // --------------------------------------------------------------
    let userLat = latitude;
    let userLng = longitude;
    if (sortBy === "distance" && zipCode && (userLat == null || userLng == null)) {
      const loc = await this.getLocationByZipCode(zipCode);
      if (loc?.latitude != null && loc?.longitude != null) {
        userLat = loc.latitude;
        userLng = loc.longitude;
      }
    }

    // --------------------------------------------------------------
    // Perform the HTTP request
    // --------------------------------------------------------------
    const response = await fetch(url.toString(), {
      headers: {
        "Api-Key": process.env.API_211_KEY!,
        Accept: "application/json",
      },
    });

    interface SearchResponse {
      count: number;
      results: Resource[];
    }

    const data = (await response.json()) as SearchResponse;
    const results = data.results ?? [];

    // --------------------------------------------------------------
    // Distance sorting – compute distance for each result
    // --------------------------------------------------------------
    if (sortBy === "distance" && userLat != null && userLng != null) {
      const withDist = await Promise.all(
        results.map(async (res) => {
          let distance = Infinity;

          // The API returns a ZIP string in `res.location`
          const zip = typeof res.location === "string" ? res.location : undefined;
          if (zip) {
            const loc = await this.getLocationByZipCode(zip);
            if (loc?.latitude != null && loc?.longitude != null) {
              distance = calculateDistance(
                userLat!,
                userLng!,
                loc.latitude,
                loc.longitude
              );
            }
          }

          return { res, distance };
        })
      );

      withDist.sort((a, b) => a.distance - b.distance);
      return withDist.map((d) => d.res);
    }

    // --------------------------------------------------------------
    // Alphabetical sorting (by name)
    // --------------------------------------------------------------
    if (sortBy === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  }

  /* -------------------- CATEGORY HELPERS ------------------------------- */
  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async getSubcategories(categoryId: string): Promise<Subcategory[]> {
    return getSubcategoriesForCategory(categoryId).map((sub) => ({
      ...sub,
      categoryId,
      icon: undefined,
    }));
  }

  /* --------------------  LOCATION HELPERS ------------------------------- */
  async getLocations(): Promise<Location[]> {
    return this.locations;
  }

  /** Look up a location by ZIP. If it isn’t cached yet we fetch the
   *  coordinates from the CSV‑based helper and cache the result. */
  async getLocationByZipCode(zipCode: string): Promise<Location | undefined> {
    const normalized = zipCode.trim().padStart(5, "0");

    // 1️⃣  Try the in‑memory cache first
    let loc = this.locations.find((l) => l.zipCode === normalized);
    if (loc) return loc;

    // 2️⃣  Resolve coordinates from the CSV‑derived helper
    const coords = await getCoordinatesForZip(normalized);
    if (!coords) return undefined;

    // 3️⃣  Build a full Location object and cache it
    loc = {
      id: `zip-${normalized}`,
      name: `Zip Code ${normalized}`,
      zipCode: normalized,
      latitude: coords.lat,
      longitude: coords.lng,
      city: "Unknown City",
      state: "Unknown State",
      country: "US",
    };

    this.locations.push(loc);
    return loc;
  }

  /** Reverse‑lookup is not required for the prototype – return undefined. */
  async getLocationByCoordinates(
    latitude: number,
    longitude: number
  ): Promise<Location | undefined> {
    // Optional: implement a nearest‑neighbor search against this.locations.
    return undefined;
  }

  /* --------------------  VOTING / RATING ------------------------------- */
  async getRatings(resourceId: string) {
    const { getVoteStats } = await import("./firestoreVotingService");
    return getVoteStats(resourceId);
  }

  async getUserVote(resourceId: string, sessionId: string, ipAddress: string) {
    const { getUserVote } = await import("./firestoreVotingService");
    return getUserVote(resourceId, sessionId, ipAddress);
  }

  async submitVote(
    resourceId: string,
    sessionId: string,
    ipAddress: string,
    vote: "up" | "down"
  ) {
    const { submitVote } = await import("./firestoreVotingService");
    return submitVote(resourceId, sessionId, ipAddress, vote);
  }

  async removeVote(resourceId: string, sessionId: string, ipAddress: string) {
    const { removeVote } = await import("./firestoreVotingService");
    return removeVote(resourceId, sessionId, ipAddress);
  }
}

/* -------------------------------------------------------------------------- */
/* 5️⃣  Export a singleton instance for the rest of the app to use             */
/* -------------------------------------------------------------------------- */
export const storage = new MemStorage();

/* -------------------------------------------------------------------------- */
/* 6️⃣  Export the IStorage interface (kept in this file for convenience)     */
/* -------------------------------------------------------------------------- */
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getResources(
    categoryId?: string,
    subcategoryId?: string,
    zipCode?: string,
    latitude?: number,
    longitude?: number,
    sessionId?: string,
    ipAddress?: string,
    sortBy?: "relevance" | "distance" | "name",
    keyword?: string
  ): Promise<Resource[]>;

  getCategories(): Promise<Category[]>;
  getSubcategories(categoryId: string): Promise<Subcategory[]>;
  getLocations(): Promise<Location[]>;
  getLocationByZipCode(zipCode: string): Promise<Location | undefined>;
  getLocationByCoordinates(
    latitude: number,
    longitude: number
  ): Promise<Location | undefined>;

  getRatings(resourceId: string): Promise<{ thumbsUp: number; thumbsDown: number }>;
  getUserVote(
    resourceId: string,
    sessionId: string,
    ipAddress: string
  ): Promise<"up" | "down" | null>;
  submitVote(
    resourceId: string,
    sessionId: string,
    ipAddress: string,
    vote: "up" | "down"
  ): Promise<void>;
  removeVote(resourceId: string, sessionId: string, ipAddress: string): Promise<void>;
}