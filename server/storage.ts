import { users, type User, type InsertUser, type Resource, type Category, type Subcategory, type Location } from "@shared/schema";
import fetch from "node-fetch";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resources related methods
  getResources(categoryId?: string, subcategoryId?: string, zipCode?: string, latitude?: number, longitude?: number): Promise<Resource[]>;
  getCategories(): Promise<Category[]>;
  getSubcategories(categoryId: string): Promise<Subcategory[]>;
  getLocations(): Promise<Location[]>;
  getLocationByZipCode(zipCode: string): Promise<Location | undefined>;
  getLocationByCoordinates(latitude: number, longitude: number): Promise<Location | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resources: Resource[];
  private categories: Category[];
  private subcategories: Subcategory[];
  private locations: Location[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Initialize with empty arrays
    this.resources = [];
    this.categories = [];
    this.subcategories = [];
    this.locations = [];
    
    // Populate default categories with icons
    this.categories = [
      { id: 'housing', name: 'Housing', icon: 'home' },
      { id: 'finance-employment', name: 'Finance & Employment', icon: 'briefcase' },
      { id: 'food', name: 'Food', icon: 'utensils' },
      { id: 'transportation', name: 'Transportation', icon: 'bus' },
      { id: 'healthcare', name: 'Health Care', icon: 'stethoscope' },
      { id: 'hygiene-household', name: 'Hygiene & Household', icon: 'shower' },
      { id: 'mental-wellness', name: 'Mental Wellness', icon: 'brain' },
      { id: 'substance-use', name: 'Substance Use', icon: 'pills' },
      { id: 'children-family', name: 'Children & Family', icon: 'users' },
      { id: 'young-adults', name: 'Young Adults', icon: 'graduation-cap' },
      { id: 'education', name: 'Education', icon: 'book' },
      { id: 'seniors-caregivers', name: 'Seniors & Caregivers', icon: 'user-nurse' },
      { id: 'legal-assistance', name: 'Legal Assistance', icon: 'gavel' },
      { id: 'utilities', name: 'Utilities', icon: 'bolt' },
      { id: 'reentry', name: 'Reentry', icon: 'door-open' },
    ];
    
    // Populate subcategories for each category
    this.subcategories = [
      // Housing subcategories
      { id: 'emergency-shelters', name: 'Emergency Shelters', categoryId: 'housing' },
      { id: 'transitional-housing', name: 'Transitional Housing', categoryId: 'housing' },
      { id: 'rental-assistance', name: 'Rental Assistance', categoryId: 'housing' },
      { id: 'affordable-housing', name: 'Affordable Housing', categoryId: 'housing' },
      
      // Finance & Employment subcategories
      { id: 'job-training', name: 'Job Training', categoryId: 'finance-employment' },
      { id: 'job-placement', name: 'Job Placement', categoryId: 'finance-employment' },
      { id: 'financial-assistance', name: 'Financial Assistance', categoryId: 'finance-employment' },
      { id: 'financial-education', name: 'Financial Education', categoryId: 'finance-employment' },
      
      // Food subcategories
      { id: 'food-pantries', name: 'Food Pantries', categoryId: 'food' },
      { id: 'meal-programs', name: 'Meal Programs', categoryId: 'food' },
      { id: 'snap-benefits', name: 'SNAP Benefits', categoryId: 'food' },
      { id: 'wic', name: 'WIC', categoryId: 'food' },
      
      // Add a few subcategories for each main category
      { id: 'public-transit', name: 'Public Transit', categoryId: 'transportation' },
      { id: 'medical-transportation', name: 'Medical Transportation', categoryId: 'transportation' },
      
      { id: 'primary-care', name: 'Primary Care', categoryId: 'healthcare' },
      { id: 'specialty-care', name: 'Specialty Care', categoryId: 'healthcare' },
      { id: 'dental-care', name: 'Dental Care', categoryId: 'healthcare' },
      
      { id: 'counseling', name: 'Counseling', categoryId: 'mental-wellness' },
      { id: 'crisis-support', name: 'Crisis Support', categoryId: 'mental-wellness' },
    ];
    
    // Populate default locations with zip codes
    this.locations = [
      { id: 'new-york', name: 'New York, NY', zipCode: '10001', latitude: 40.7128, longitude: -74.0060 },
      { id: 'los-angeles', name: 'Los Angeles, CA', zipCode: '90001', latitude: 34.0522, longitude: -118.2437 },
      { id: 'chicago', name: 'Chicago, IL', zipCode: '60601', latitude: 41.8781, longitude: -87.6298 },
      { id: 'houston', name: 'Houston, TX', zipCode: '77001', latitude: 29.7604, longitude: -95.3698 },
      { id: 'phoenix', name: 'Phoenix, AZ', zipCode: '85001', latitude: 33.4484, longitude: -112.0740 },
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
  
  async getResources(categoryId?: string, subcategoryId?: string, zipCode?: string, latitude?: number, longitude?: number): Promise<Resource[]> {
    // Here we would normally fetch from an external API
    // For testing, we'll generate mock resources if none exist yet
    if (this.resources.length === 0) {
      // Generate some sample resources for each category and subcategory
      for (const category of this.categories) {
        // Get subcategories for this category
        const categorySubs = this.subcategories.filter(sub => sub.categoryId === category.id);
        
        for (const sub of categorySubs) {
          // Generate 2-4 resources per subcategory
          const numResources = 2 + Math.floor(Math.random() * 3);
          
          for (let i = 0; i < numResources; i++) {
            const resourceId = `${category.id}-${sub.id}-${i}`;
            
            this.resources.push({
              id: resourceId,
              name: `${sub.name} Resource ${i + 1}`,
              description: `This is a resource for ${sub.name} under the ${category.name} category. We provide support services for individuals in need.`,
              categoryId: category.id,
              subcategoryId: sub.id,
              location: "Various Locations",
              zipCode: "00000", // Default zip code
              url: `https://example.com/resources/${resourceId}`,
              phone: `(555) 123-${1000 + i}`,
              email: `contact@${sub.id}-resource${i + 1}.org`,
              address: `${100 + i} Main Street, Anytown, USA`,
              schedules: `Monday-Friday: 9am-5pm\nSaturday: 10am-2pm\nSunday: Closed`,
              accessibility: i % 2 === 0 ? "Wheelchair accessible, ADA compliant" : "Limited accessibility, please call ahead",
              languages: ["English", "Spanish", i % 3 === 0 ? "Mandarin" : "French"]
            });
          }
        }
      }
    }
    
    // Filter resources based on provided parameters
    let filteredResources = [...this.resources];
    
    if (categoryId) {
      filteredResources = filteredResources.filter(r => r.categoryId === categoryId);
    }
    
    if (subcategoryId) {
      filteredResources = filteredResources.filter(r => r.subcategoryId === subcategoryId);
    }
    
    if (zipCode) {
      // For now, just filter to resources that have a matching zip code
      // In a real app, we might include resources from nearby zip codes
      filteredResources = filteredResources.filter(r => r.zipCode === zipCode);
    }
    
    if (latitude && longitude) {
      // In a real app, we would filter resources by proximity to these coordinates
      // For now, we'll just return all resources since this is a mock implementation
      console.log(`Filtering by coordinates: ${latitude}, ${longitude}`);
    }
    
    return filteredResources;
  }
  
  async getCategories(): Promise<Category[]> {
    // Return our predefined categories
    return this.categories;
  }
  
  async getSubcategories(categoryId: string): Promise<Subcategory[]> {
    // Filter subcategories by category ID
    return this.subcategories.filter(sub => sub.categoryId === categoryId);
  }
  
  async getLocations(): Promise<Location[]> {
    // Return our predefined locations
    return this.locations;
  }
  
  async getLocationByZipCode(zipCode: string): Promise<Location | undefined> {
    // Find location by zip code
    return this.locations.find(loc => loc.zipCode === zipCode);
  }
  
  async getLocationByCoordinates(latitude: number, longitude: number): Promise<Location | undefined> {
    // In a real app, we would find the closest location to the given coordinates
    // For now, we'll just return the first location since this is a mock implementation
    console.log(`Finding location by coordinates: ${latitude}, ${longitude}`);
    return this.locations[0];
  }
}

export const storage = new MemStorage();
