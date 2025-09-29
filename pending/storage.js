import type { Resource, Category, Vote, InsertResource, InsertCategory, InsertVote } from '../shared/schema';

// Storage interface for the application
export interface IStorage {
  getResources(): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | null>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource | null>;
  deleteResource(id: string): Promise<boolean>;
  searchResources(query: string): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;

  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;

  getVotesForResource(resourceId: string): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  getUserVote(resourceId: string, sessionId: string): Promise<Vote | null>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private resources: Resource[] = [];
  private categories: Category[] = [];
  private votes: Vote[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    this.categories = [
      {
        id: 'cat-1',
        name: 'Housing',
        description: 'Housing assistance and shelter services',
        icon: 'housing',
        isActive: true,
      },
      {
        id: 'cat-2',
        name: 'Food',
        description: 'Food assistance and nutrition programs',
        icon: 'food',
        isActive: true,
      },
      {
        id: 'cat-3',
        name: 'Healthcare',
        description: 'Medical and health services',
        icon: 'healthcare',
        isActive: true,
      },
      {
        id: 'cat-4',
        name: 'Education',
        description: 'Educational programs and resources',
        icon: 'education',
        isActive: true,
      },
    ];

    this.resources = [
      {
        id: 'res-1',
        name: 'Community Food Bank',
        description: 'Provides free groceries and meals to families in need',
        category: 'Food',
        location: '123 Main St, Santa Barbara, CA',
        zipCode: '93101',
        phone: '(805) 555-0123',
        website: 'https://example.com',
        hours: 'Monday-Friday 9AM-5PM',
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'res-2',
        name: 'Homeless Shelter Services',
        description: 'Emergency shelter and transitional housing support',
        category: 'Housing',
        location: '456 Oak Ave, Santa Barbara, CA',
        zipCode: '93101',
        phone: '(805) 555-0456',
        website: 'https://example.org',
        hours: '24/7',
        isActive: true,
        createdAt: new Date(),
      },
    ];
  }

  async getResources(): Promise<Resource[]> {
    return this.resources.filter(r => r.isActive);
  }

  async getResource(id: string): Promise<Resource | null> {
    return this.resources.find(r => r.id === id && r.isActive) || null;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const newResource: Resource = {
      id: `res-${Date.now()}`,
      ...resource,
      createdAt: new Date(),
      isActive: true,
    };
    this.resources.push(newResource);
    return newResource;
  }

  async updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource | null> {
    const index = this.resources.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.resources[index] = { ...this.resources[index], ...resource };
    return this.resources[index];
  }

  async deleteResource(id: string): Promise<boolean> {
    const index = this.resources.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.resources[index].isActive = false;
    return true;
  }

  async searchResources(query: string): Promise<Resource[]> {
    const lq = query.toLowerCase();
    return this.resources.filter(r =>
      r.isActive &&
      (
        r.name.toLowerCase().includes(lq) ||
        (r.description?.toLowerCase().includes(lq) ?? false) ||
        r.category.toLowerCase().includes(lq)
      )
    );
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return this.resources.filter(r => r.isActive && r.category === category);
  }

  async getCategories(): Promise<Category[]> {
    return this.categories.filter(c => c.isActive);
  }

  async getCategory(id: string): Promise<Category | null> {
    return this.categories.find(c => c.id === id && c.isActive) || null;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      ...category,
      isActive: true,
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | null> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.categories[index] = { ...this.categories[index], ...category };
    return this.categories[index];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.categories[index].isActive = false;
    return true;
  }

  async getVotesForResource(resourceId: string): Promise<Vote[]> {
    return this.votes.filter(v => v.resourceId === resourceId);
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const existing = await this.getUserVote(vote.resourceId, vote.sessionId);
    if (existing) {
      existing.vote = vote.vote;
      return existing;
    }
    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      ...vote,
      createdAt: new Date(),
    };
    this.votes.push(newVote);
    return newVote;
  }

  async getUserVote(resourceId: string, sessionId: string): Promise<Vote | null> {
    return this.votes.find(v => v.resourceId === resourceId && v.sessionId === sessionId) || null;
  }
}

export const storage = new MemStorage();
