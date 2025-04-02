import { users, type User, type InsertUser, type Resource, type Category, type Location } from "@shared/schema";
import fetch from "node-fetch";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resources related methods
  getResources(categories?: string[], location?: string): Promise<Resource[]>;
  getCategories(): Promise<Category[]>;
  getLocations(): Promise<Location[]>;
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
    
    // Initialize with empty arrays
    this.resources = [];
    this.categories = [];
    this.locations = [];
    
    // Populate default categories
    this.categories = [
      { id: 'health', name: 'Health & Wellness' },
      { id: 'education', name: 'Education' },
      { id: 'housing', name: 'Housing' },
      { id: 'employment', name: 'Employment' },
      { id: 'food', name: 'Food Assistance' },
    ];
    
    // Populate default locations
    this.locations = [
      { id: 'new-york', name: 'New York, NY' },
      { id: 'los-angeles', name: 'Los Angeles, CA' },
      { id: 'chicago', name: 'Chicago, IL' },
      { id: 'houston', name: 'Houston, TX' },
      { id: 'phoenix', name: 'Phoenix, AZ' },
    ];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getResources(categories?: string[], location?: string): Promise<Resource[]> {
    // Here we'd normally fetch from an external API
    // For now, we'll use the API proxy from our own server
    try {
      const apiUrl = 'https://api.211sandiego.org/v1/resources';
      const url = new URL(apiUrl);
      
      // Add query parameters if provided
      if (categories && categories.length > 0) {
        url.searchParams.append('categories', categories.join(','));
      }
      
      if (location) {
        url.searchParams.append('location', location);
      }
      
      // Set limit and other parameters
      url.searchParams.append('limit', '100');
      
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json() as any;
      
      if (!Array.isArray(data)) {
        // Format the data to match our Resource type
        // This depends on the exact shape of the API response
        // For now, returning our empty array
        return this.resources;
      }
      
      return data.map((item: any) => ({
        id: item.id || String(Math.random()),
        name: item.name || item.title || 'Resource',
        description: item.description || item.summary || 'No description available',
        category: item.category || 'Uncategorized',
        location: item.location || 'Unknown location',
        imageUrl: item.image_url || item.imageUrl,
        url: item.url || item.website,
      })) as Resource[];
      
    } catch (error) {
      console.error('Error fetching resources:', error);
      // Since this is a fallback, we'll return our cached resources if available
      // or an empty array if we don't have any cached
      return this.resources.length ? this.resources : [];
    }
  }
  
  async getCategories(): Promise<Category[]> {
    // Return our predefined categories
    return this.categories;
  }
  
  async getLocations(): Promise<Location[]> {
    // Return our predefined locations
    return this.locations;
  }
}

export const storage = new MemStorage();
