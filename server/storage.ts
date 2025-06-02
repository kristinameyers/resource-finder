import { users, type User, type InsertUser, type Resource, type Category, type Subcategory, type Location } from "@shared/schema";
import fetch from "node-fetch";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resources related methods
  getResources(categoryId?: string, subcategoryId?: string, zipCode?: string, latitude?: number, longitude?: number, sessionId?: string): Promise<Resource[]>;
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
    
    // Populate default categories with icons and 211 taxonomy codes
    this.categories = [
      { id: 'housing', name: 'Housing', icon: 'home', taxonomyCode: 'BH' },
      { id: 'finance-employment', name: 'Finance & Employment', icon: 'briefcase', taxonomyCode: 'N' },
      { id: 'food', name: 'Food', icon: 'utensils', taxonomyCode: 'BD' },
      { id: 'transportation', name: 'Transportation', icon: 'bus', taxonomyCode: 'BT' },
      { id: 'healthcare', name: 'Health Care', icon: 'stethoscope', taxonomyCode: 'L' },
      { id: 'hygiene-household', name: 'Hygiene & Household', icon: 'shower', taxonomyCode: 'BM-3000' },
      { id: 'mental-wellness', name: 'Mental Wellness', icon: 'brain', taxonomyCode: 'RR' },
      { id: 'substance-use', name: 'Substance Use', icon: 'pills', taxonomyCode: 'RX' },
      { id: 'children-family', name: 'Children & Family', icon: 'users', taxonomyCode: 'P' },
      { id: 'young-adults', name: 'Young Adults', icon: 'graduation-cap', taxonomyCode: 'YB-9000' },
      { id: 'education', name: 'Education', icon: 'book', taxonomyCode: 'H' },
      { id: 'seniors-caregivers', name: 'Seniors & Caregivers', icon: 'user-nurse', taxonomyCode: 'YB-8000' },
      { id: 'legal-assistance', name: 'Legal Assistance', icon: 'gavel', taxonomyCode: 'F' },
      { id: 'utilities', name: 'Utilities', icon: 'bolt', taxonomyCode: 'BV' },
      { id: 'reentry', name: 'Reentry', icon: 'door-open', taxonomyCode: 'TJ-6500' },
    ];
    
    // Populate subcategories for each category
    this.subcategories = [
      // Housing subcategories
      { id: 'animal-housing', name: 'Animal Housing', categoryId: 'housing' },
      { id: 'emergency-housing-shelters', name: 'Emergency Housing & Shelters', categoryId: 'housing' },
      { id: 'housing-expense-assistance', name: 'Housing Expense Assistance', categoryId: 'housing' },
      { id: 'housing-financial-legal-assistance', name: 'Housing Financial & Legal Assistance', categoryId: 'housing' },
      { id: 'supportive-services-homeless', name: 'Supportive Services for Homeless Individuals & Families', categoryId: 'housing' },
      
      // Finance & Employment subcategories
      { id: 'employment', name: 'Employment', categoryId: 'finance-employment' },
      { id: 'money-management', name: 'Money Management', categoryId: 'finance-employment' },
      { id: 'personal-household-items', name: 'Personal & Household Items', categoryId: 'finance-employment' },
      { id: 'pet-support-services', name: 'Pet Support Services', categoryId: 'finance-employment' },
      { id: 'public-assistance-benefits', name: 'Public Assistance & Benefits', categoryId: 'finance-employment' },
      { id: 'utility-assistance', name: 'Utility Assistance', categoryId: 'finance-employment' },
      
      // Food subcategories
      { id: 'food', name: 'Food', categoryId: 'food' },
      { id: 'meals', name: 'Meals', categoryId: 'food' },
      { id: 'nutrition-education', name: 'Nutrition Education', categoryId: 'food' },
      { id: 'pet-food', name: 'Pet Food', categoryId: 'food' },
      
      // Transportation subcategories
      { id: 'dmv', name: 'DMV', categoryId: 'transportation' },
      { id: 'medical-transportation', name: 'Medical Transportation', categoryId: 'transportation' },
      { id: 'public-transportation', name: 'Public Transportation', categoryId: 'transportation' },
      { id: 'senior-ride-programs', name: 'Senior Ride Programs', categoryId: 'transportation' },
      
      // Health Care subcategories
      { id: 'disability-services', name: 'Disability Services', categoryId: 'healthcare' },
      { id: 'disease-poison-control', name: 'Disease & Poison Control', categoryId: 'healthcare' },
      { id: 'health-insurance', name: 'Health Insurance', categoryId: 'healthcare' },
      { id: 'home-nursing-caregiving', name: 'Home Nursing & Caregiving', categoryId: 'healthcare' },
      { id: 'medical-facilities', name: 'Medical Facilities', categoryId: 'healthcare' },
      { id: 'medical-transportation-health', name: 'Medical Transportation', categoryId: 'healthcare' },
      { id: 'sexual-reproductive-health', name: 'Sexual & Reproductive Health', categoryId: 'healthcare' },
      { id: 'specialty-screenings-services', name: 'Specialty Screenings & Services', categoryId: 'healthcare' },
      
      // Hygiene & Household subcategories
      { id: 'clothing', name: 'Clothing', categoryId: 'hygiene-household' },
      { id: 'grooming', name: 'Grooming', categoryId: 'hygiene-household' },
      { id: 'household', name: 'Household', categoryId: 'hygiene-household' },
      { id: 'pet-services', name: 'Pet Services', categoryId: 'hygiene-household' },
      
      // Mental Wellness subcategories
      { id: 'counseling', name: 'Counseling', categoryId: 'mental-wellness' },
      { id: 'hotlines-crisis-response', name: 'Hotlines & Crisis Response', categoryId: 'mental-wellness' },
      { id: 'mental-wellness-information-education', name: 'Mental Wellness Information & Education', categoryId: 'mental-wellness' },
      { id: 'psychiatric-services', name: 'Psychiatric Services', categoryId: 'mental-wellness' },
      { id: 'report-potential-abuse', name: 'Report Potential Abuse', categoryId: 'mental-wellness' },
      { id: 'support-groups', name: 'Support Groups', categoryId: 'mental-wellness' },
      
      // Substance Use subcategories
      { id: 'alcohol-treatment-facilities', name: 'Alcohol Treatment & Facilities', categoryId: 'substance-use' },
      { id: 'drug-treatment-facilities', name: 'Drug Treatment & Facilities', categoryId: 'substance-use' },
      { id: 'education-prevention-testing', name: 'Education, Prevention & Testing', categoryId: 'substance-use' },
      
      // Children & Family subcategories
      { id: 'child-family-support', name: 'Child & Family Support', categoryId: 'children-family' },
      { id: 'child-abuse-prevention', name: 'Child Abuse Prevention', categoryId: 'children-family' },
      { id: 'child-care-early-education', name: 'Child Care & Early Education', categoryId: 'children-family' },
      { id: 'expectant-new-parents', name: 'Expectant & New Parents', categoryId: 'children-family' },
      { id: 'family-counseling', name: 'Family Counseling', categoryId: 'children-family' },
      { id: 'family-law', name: 'Family Law', categoryId: 'children-family' },
      { id: 'foster-care-adoption', name: 'Foster Care & Adoption', categoryId: 'children-family' },
      { id: 'military-families', name: 'Military Families', categoryId: 'children-family' },
      { id: 'parenting-resources', name: 'Parenting Resources', categoryId: 'children-family' },
      
      // Young Adults subcategories
      { id: 'counseling-support-services', name: 'Counseling & Support Services', categoryId: 'young-adults' },
      { id: 'prevention-intervention', name: 'Prevention & Intervention', categoryId: 'young-adults' },
      { id: 'sports-youth-programs', name: 'Sports & Youth Programs', categoryId: 'young-adults' },
      { id: 'teen-sexual-reproductive-health', name: 'Teen Sexual & Reproductive Health', categoryId: 'young-adults' },
      
      // Education subcategories
      { id: 'education-programs', name: 'Education Programs', categoryId: 'education' },
      { id: 'educational-services', name: 'Educational Services', categoryId: 'education' },
      { id: 'immigration', name: 'Immigration', categoryId: 'education' },
      
      // Seniors & Caregivers subcategories
      { id: 'caregiver-support-service', name: 'Caregiver Support Service', categoryId: 'seniors-caregivers' },
      { id: 'elder-abuse-prevention', name: 'Elder Abuse Prevention', categoryId: 'seniors-caregivers' },
      { id: 'senior-health-care', name: 'Senior Health Care', categoryId: 'seniors-caregivers' },
      { id: 'senior-housing', name: 'Senior Housing', categoryId: 'seniors-caregivers' },
      { id: 'senior-meals', name: 'Senior Meals', categoryId: 'seniors-caregivers' },
      { id: 'senior-support-services', name: 'Senior Support Services', categoryId: 'seniors-caregivers' },
      { id: 'senior-transportation', name: 'Senior Transportation', categoryId: 'seniors-caregivers' },
      
      // Legal Assistance subcategories
      { id: 'courts', name: 'Courts', categoryId: 'legal-assistance' },
      { id: 'general-legal-services', name: 'General Legal Services', categoryId: 'legal-assistance' },
      { id: 'immigration-services', name: 'Immigration Services', categoryId: 'legal-assistance' },
      { id: 'records-certificates', name: 'Records & Certificates', categoryId: 'legal-assistance' },
      { id: 'victim-assistance', name: 'Victim Assistance', categoryId: 'legal-assistance' },
      
      // Utilities subcategories
      { id: 'utility-assistance-util', name: 'Utility Assistance', categoryId: 'utilities' },
      { id: 'weatherization', name: 'Weatherization', categoryId: 'utilities' },
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
  
  async getResources(categoryId?: string, subcategoryId?: string, zipCode?: string, latitude?: number, longitude?: number, sessionId?: string): Promise<Resource[]> {
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
    
    // Add rating information to each resource
    const resourcesWithRatings = await Promise.all(
      filteredResources.map(async (resource) => {
        const ratings = await this.getRatings(resource.id);
        const userVote = sessionId ? await this.getUserVote(resource.id, sessionId) : null;
        
        return {
          ...resource,
          thumbsUp: ratings.thumbsUp,
          thumbsDown: ratings.thumbsDown,
          userVote
        };
      })
    );
    
    return resourcesWithRatings;
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
