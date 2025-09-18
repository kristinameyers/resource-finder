// Simple TypeScript types for the Resource Finder application

export interface Resource {
  id: string;
  name: string;
  description?: string;
  category: string;
  location?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  hours?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface Vote {
  id: string;
  resourceId: string;
  sessionId: string;
  vote: number; // 1 for helpful, -1 for not helpful
  createdAt: Date;
}

// Insert types (without auto-generated fields)
export interface InsertResource {
  name: string;
  description?: string;
  category: string;
  location?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  hours?: string;
  isActive: boolean;
}

export interface InsertCategory {
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface InsertVote {
  resourceId: string;
  sessionId: string;
  vote: number;
}