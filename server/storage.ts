import { users, type User, type InsertUser, type Resource, type Category, type Subcategory, type Location } from "@shared/schema";
import fetch from "node-fetch";
import { calculateDistanceFromZipCodes } from "./data/zipCodes";
import { 
  MAIN_CATEGORIES, 
  getSubcategoriesForCategory 
} from "./data/officialTaxonomy";

// If you want UI order, define it as an array of IDs:
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

// Helper: Build categories array from officialTaxonomy with UI order
const orderedCategories: Category[] = CATEGORY_ORDER
  .filter(id => id in MAIN_CATEGORIES)
  .map(id => {
    const cat = MAIN_CATEGORIES[id as keyof typeof MAIN_CATEGORIES];

    // Use a type guard to access taxonomyCode safely
    return {
      id,
      name: cat.name,
      taxonomyCode: 'taxonomyCode' in cat ? cat.taxonomyCode : "",
      icon: getIconForCategory(id),
    };
  });

function getIconForCategory(id: string): string | undefined {
  // Optionally map IDs to icon names (adjust as needed)
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

  // Resources related methods
  getResources(categoryId?: string, subcategoryId?: string, zipCode?: string, latitude?: number, longitude?: number, sessionId?: string, ipAddress?: string, sortBy?: 'relevance' | 'distance' | 'name'): Promise<Resource[]>;
  getCategories(): Promise<Category[]>;
  getSubcategories(categoryId: string): Promise<Subcategory[]>;
  getLocations(): Promise<Location[]>;
  getLocationByZipCode(zipCode: string): Promise<Location | undefined>;
  getLocationByCoordinates(latitude: number, longitude: number): Promise<Location | undefined>;

  // Rating related methods (now using Firebase Firestore)
  getRatings(resourceId: string): Promise<{ thumbsUp: number; thumbsDown: number }>;
  getUserVote(resourceId: string, sessionId: string, ipAddress: string): Promise<'up' | 'down' | null>;
  submitVote(resourceId: string, sessionId: string, ipAddress: string, vote: 'up' | 'down'): Promise<void>;
  removeVote(resourceId: string, sessionId: string, ipAddress: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resources: Resource[];
  private categories: Category[];
  private locations: Location[];

  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.resources = []; // Optionally populate with mock data as before
    // Always use the ordered, canonical categories from officialTaxonomy
    this.categories = orderedCategories;
    this.locations = [
      { id: 'new-york', name: 'New York, NY', zipCode: '10001', latitude: 40.7128, longitude: -74.0060 },
      { id: 'los-angeles', name: 'Los Angeles, CA', zipCode: '90001', latitude: 34.0522, longitude: -118.2437 },
      { id: 'chicago', name: 'Chicago, IL', zipCode: '60601', latitude: 41.8781, longitude: -87.6298 },
      { id: 'houston', name: 'Houston, TX', zipCode: '77001', latitude: 29.7604, longitude: -95.3698 },
      { id: 'phoenix', name: 'Phoenix, AZ', zipCode: '85001', latitude: 33.4484, longitude: -112.0740 },
      { id: 'santa-barbara', name: 'Santa Barbara, CA', zipCode: '93101', latitude: 34.4217, longitude: -119.7026 },
      { id: 'san-francisco', name: 'San Francisco, CA', zipCode: '94102', latitude: 37.7749, longitude: -122.4194 },
      { id: 'seattle', name: 'Seattle, WA', zipCode: '98101', latitude: 47.6062, longitude: -122.3321 }
    ];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getResources(categoryId?: string, subcategoryId?: string, zipCode?: string, latitude?: number, longitude?: number, sessionId?: string, ipAddress?: string, sortBy?: 'relevance' | 'distance' | 'name'): Promise<Resource[]> {
    // (Retain your mock or API logic for resources as needed)
    // ... (your existing resource logic here)
    return []; // placeholder
  }

  async getCategories(): Promise<Category[]> {
    // Use the canonical, ordered categories
    return this.categories;
  }

  async getSubcategories(categoryId: string): Promise<Subcategory[]> {
    // Get from officialTaxonomy, and append categoryId & optional icon if needed
    return getSubcategoriesForCategory(categoryId).map(sub => ({
      ...sub,
      categoryId,
      icon: undefined // or map icon if your UI requires
    }));
  }

  async getLocations(): Promise<Location[]> {
    return this.locations;
  }

  async getLocationByZipCode(zipCode: string): Promise<Location | undefined> {
    const existingLocation = this.locations.find(loc => loc.zipCode === zipCode);
    if (existingLocation) {
      return existingLocation;
    }
    if (zipCode && zipCode.length === 5 && /^\d+$/.test(zipCode)) {
      const newLocation: Location = {
        id: `zip-${zipCode}`,
        name: `Zip Code ${zipCode}`,
        zipCode: zipCode,
        latitude: undefined,
        longitude: undefined
      };
      this.locations.push(newLocation);
      return newLocation;
    }
    return undefined;
  }

  async getLocationByCoordinates(latitude: number, longitude: number): Promise<Location | undefined> {
    console.log(`Finding location by coordinates: ${latitude}, ${longitude}`);
    return this.locations[0];
  }

  async getRatings(resourceId: string): Promise<{ thumbsUp: number; thumbsDown: number }> {
    const { getVoteStats } = await import('./services/firestoreVotingService');
    return await getVoteStats(resourceId);
  }

  async getUserVote(resourceId: string, sessionId: string, ipAddress: string): Promise<'up' | 'down' | null> {
    const { getUserVote } = await import('./services/firestoreVotingService');
    return await getUserVote(resourceId, sessionId, ipAddress);
  }

  async submitVote(resourceId: string, sessionId: string, ipAddress: string, vote: 'up' | 'down'): Promise<void> {
    const { submitVote } = await import('./services/firestoreVotingService');
    await submitVote(resourceId, sessionId, ipAddress, vote);
  }

  async removeVote(resourceId: string, sessionId: string, ipAddress: string): Promise<void> {
    const { removeVote } = await import('./services/firestoreVotingService');
    await removeVote(resourceId, sessionId, ipAddress);
  }
}

export const storage = new MemStorage();
