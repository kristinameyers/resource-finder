// server/storage.ts
import { users, type User, type InsertUser, type Resource, type Category, type Subcategory, type Location } from "@shared/schema";
import fetch from "node-fetch";
import { calculateDistanceFromZipCodes } from "../../packages/taxonomy/src/zipCodes";
import { getCoordinatesForZip } from "../../packages/geo/src/zipcode-db";
import {
  MAIN_CATEGORIES,
  getSubcategoriesForCategory,
  getCategoryByKeyword
} from "../../packages/taxonomy/src/officialTaxonomy";

// Helper function to calculate distance between coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// UI order for categories
const CATEGORY_ORDER = [
  'children-family',
  'food',
  'education',
  'finance-employment',
  'housing',
  'healthcare',
  'hygiene-household',
  'mental-wellness',
  'legal-assistance',
  'substance-use',
  'transportation',
  'young-adults',
  'utilities'
];

// Build ordered categories array
const orderedCategories: Category[] = CATEGORY_ORDER
  .filter(id => id in MAIN_CATEGORIES)
  .map(id => {
    const cat = MAIN_CATEGORIES[id as keyof typeof MAIN_CATEGORIES];
    return {
      id,
      name: cat.name,
      taxonomyCode: 'taxonomyCode' in cat ? cat.taxonomyCode : "",
      icon: getIconForCategory(id),
    };
  });

function getIconForCategory(id: string): string | undefined {
  const icons: Record<string, string> = {
    'children-family': 'users',
    'food': 'utensils',
    'education': 'book',
    'finance-employment': 'briefcase',
    'housing': 'home',
    'healthcare': 'stethoscope',
    'hygiene-household': 'shower',
    'mental-wellness': 'brain',
    'legal-assistance': 'gavel',
    'substance-use': 'pills',
    'transportation': 'bus',
    'young-adults': 'graduation-cap',
    'utilities': 'bolt'
  };
  return icons[id];
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
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
    sortBy?: 'relevance' | 'distance' | 'name',
    keyword?: string
  ): Promise<Resource[]>;

  getCategories(): Promise<Category[]>;
  getSubcategories(categoryId: string): Promise<Subcategory[]>;
  getLocations(): Promise<Location[]>;
  getLocationByZipCode(zipCode: string): Promise<Location | undefined>;
  getLocationByCoordinates(latitude: number, longitude: number): Promise<Location | undefined>;

  getRatings(resourceId: string): Promise<{ thumbsUp: number; thumbsDown: number }>;
  getUserVote(resourceId: string, sessionId: string, ipAddress: string): Promise<'up' | 'down' | null>;
  submitVote(resourceId: string, sessionId: string, ipAddress: string, vote: 'up' | 'down'): Promise<void>;
  removeVote(resourceId: string, sessionId: string, ipAddress: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private resources: Resource[] = [];
  private categories: Category[] = orderedCategories;
  private locations: Location[] = [
    { id: 'new-york', name: 'New York, NY', zipCode: '10001', latitude: 40.7128, longitude: -74.0060 },
    { id: 'los-angeles', name: 'Los Angeles, CA', zipCode: '90001', latitude: 34.0522, longitude: -118.2437 },
    { id: 'chicago', name: 'Chicago, IL', zipCode: '60601', latitude: 41.8781, longitude: -87.6298 },
    { id: 'houston', name: 'Houston, TX', zipCode: '77001', latitude: 29.7604, longitude: -95.3698 },
    { id: 'phoenix', name: 'Phoenix, AZ', zipCode: '85001', latitude: 33.4484, longitude: -112.0740 },
    { id: 'santa-barbara', name: 'Santa Barbara, CA', zipCode: '93101', latitude: 34.4217, longitude: -119.7026 },
    { id: 'san-francisco', name: 'San Francisco, CA', zipCode: '94102', latitude: 37.7749, longitude: -122.4194 },
    { id: 'seattle', name: 'Seattle, WA', zipCode: '98101', latitude: 47.6062, longitude: -122.3321 }
  ];
  private currentId = 1;

  async getUser(id: number) { return this.users.get(id); }
  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async createUser(insertUser: InsertUser) {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getResources(
    categoryId?: string,
    subcategoryId?: string,
    zipCode?: string,
    latitude?: number,
    longitude?: number,
    sessionId?: string,
    ipAddress?: string,
    sortBy?: 'relevance' | 'distance' | 'name',
    keyword?: string
  ): Promise<Resource[]> {
    let serviceTaxonomyCode: string | undefined;
    let freeKeyword: string | undefined;
    let userLatitude = latitude;
    let userLongitude = longitude;

    if (categoryId) {
      const cat = MAIN_CATEGORIES[categoryId];
      if ('taxonomyCode' in cat) {
        serviceTaxonomyCode = cat.taxonomyCode;
      } else {
        // Use the first keyword for category-based fallback
        freeKeyword = cat.keywords[0];
      }
    } else if (keyword) {
      const match = getCategoryByKeyword(keyword);
      if (match) {
        const cat = MAIN_CATEGORIES[match.id];
        if ('taxonomyCode' in cat) {
          serviceTaxonomyCode = cat.taxonomyCode;
        } else {
          freeKeyword = cat.keywords[0];
        }
      } else {
        freeKeyword = keyword;
      }
    }
    const url = new URL('https://api.211.org/resources/v2/search/keyword');
    if (serviceTaxonomyCode) {
      url.searchParams.set('serviceTaxonomyCode', serviceTaxonomyCode);
    } else if (freeKeyword) {
      url.searchParams.set('keywords', freeKeyword);
    }
    if (zipCode) {
      url.searchParams.set('location', zipCode);
      url.searchParams.set('locationMode', 'Within');
    } else if (userLatitude != null && userLongitude != null) {
      url.searchParams.set('location', `${userLatitude},${userLongitude}`);
      url.searchParams.set('locationMode', 'Near');
      url.searchParams.set('distance', '25');
    }

    // If sorting by distance and we have a ZIP but no coordinates, resolve them
    if (sortBy === 'distance' && zipCode && userLatitude == null && userLongitude == null) {
      const userLoc = await this.getLocationByZipCode(zipCode);
      if (userLoc && userLoc.latitude != null && userLoc.longitude != null) {
        userLatitude = userLoc.latitude;
        userLongitude = userLoc.longitude;
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Api-Key': process.env.API_211_KEY!,
        'Accept': 'application/json'
      }
    });

    interface SearchResponse {
      count: number;
      results: Resource[];
    }

    const data = (await response.json()) as SearchResponse;
    const results = data.results;

    // Apply distance sorting if requested and we have user coordinates
    if (sortBy === 'distance' && userLatitude != null && userLongitude != null) {
      const withDistance = await Promise.all(
        results.map(async (resource) => {
          let distance = Infinity;

          // resource.location is a ZIP string
          const resourceZip = typeof resource.location === 'string'
            ? resource.location
            : undefined;
          if (resourceZip) {
            const resourceLoc = await this.getLocationByZipCode(resourceZip);
            if (
              resourceLoc &&
              resourceLoc.latitude != null &&
              resourceLoc.longitude != null
            ) {
              distance = calculateDistance(
                userLatitude,
                userLongitude,
                resourceLoc.latitude,
                resourceLoc.longitude
              );
            }
          }

          return { resource, distance };
        })
      );

      // Sort by distance and return resources
      withDistance.sort((a, b) => a.distance - b.distance);
      return withDistance.map(item => item.resource);
    }

    // Apply name sorting if requested
    if (sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results || [];
  }

  async getCategories() { return this.categories; }

  async getSubcategories(categoryId: string) {
    return getSubcategoriesForCategory(categoryId).map(sub => ({
      ...sub,
      categoryId,
      icon: undefined
    }));
  }

  async getLocations() { return this.locations; }

  async getLocationByZipCode(zipCode: string): Promise<Location | undefined> {
    const normalized = zipCode.trim().padStart(5, '0');

    // Check cache first
    let location = this.locations.find(l => l.zipCode === normalized);
    if (location) {
      return location;
    }

    // Lookup coordinates from ZIP database
    const coords = getCoordinatesForZip(normalized);
    if (!coords) {
      return undefined; // ZIP not found in database
    }

    // Create new location and cache it
    location = {
      id: `zip-${normalized}`,
      name: `Zip Code ${normalized}`,
      zipCode: normalized,
      latitude: coords.latitude,
      longitude: coords.longitude
    };

    this.locations.push(location);
    return location;
  }

  async getLocationByCoordinates(latitude: number, longitude: number): Promise<Location | undefined> {
    // Find closest existing location (optional implementation)
    // For now, return undefined or implement reverse lookup if needed
    return undefined;
  }

  async getRatings(resourceId: string) {
    const { getVoteStats } = await import('./src/services/firestoreVotingService');
    return getVoteStats(resourceId);
  }

  async getUserVote(resourceId: string, sessionId: string, ipAddress: string) {
    const { getUserVote } = await import('./src/services/firestoreVotingService');
    return getUserVote(resourceId, sessionId, ipAddress);
  }

  async submitVote(resourceId: string, sessionId: string, ipAddress: string, vote: 'up' | 'down') {
    const { submitVote } = await import('./src/services/firestoreVotingService');
    return submitVote(resourceId, sessionId, ipAddress, vote);
  }

  async removeVote(resourceId: string, sessionId: string, ipAddress: string) {
    const { removeVote } = await import('./src/services/firestoreVotingService');
    return removeVote(resourceId, sessionId, ipAddress);
  }
}

export const storage = new MemStorage();
