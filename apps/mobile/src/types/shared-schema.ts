import { z } from "zod";

// Base resource type definition
export interface Resource {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  location: string;
  zipCode: string;
  url?: string;
  phone?: string;
  email?: string;
  address?: string;
  schedules?: string;
  accessibility?: string;
  languages?: string[];
  thumbsUp: number;
  thumbsDown: number;
  userVote?: 'up' | 'down' | null;
  // Enhanced 211 API fields
  applicationProcess?: string;
  documents?: string;
  fees?: string;
  serviceAreas?: string;
  hoursOfOperation?: string;
  phoneNumbers?: {
    main?: string;
    fax?: string;
    tty?: string;
    crisis?: string;
  };
  additionalLanguages?: string[];
  distanceMiles?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  taxonomyCode?: string;
  icon?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  taxonomyCode?: string;
}

export interface Location {
  id?: string;
  name?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  type?: 'zipCode' | 'address';
  value?: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  username?: string; // <--- Added here
}

export interface InsertUser {
  email?: string;
  name?: string;
  username?: string; // <--- Added here if needed for creation
}

// Zod schemas for validation
export const resourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  categoryId: z.string(),
  subcategoryId: z.string().optional(),
  location: z.string(),
  zipCode: z.string(),
  url: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  schedules: z.string().optional(),
  accessibility: z.string().optional(),
  languages: z.array(z.string()).optional(),
  thumbsUp: z.number().default(0),
  thumbsDown: z.number().default(0),
  userVote: z.enum(['up', 'down']).nullable().optional(),
  applicationProcess: z.string().optional(),
  documents: z.string().optional(),
  fees: z.string().optional(),
  serviceAreas: z.string().optional(),
  hoursOfOperation: z.string().optional(),
  phoneNumbers: z.object({
    main: z.string().optional(),
    fax: z.string().optional(),
    tty: z.string().optional(),
    crisis: z.string().optional(),
  }).optional(),
  additionalLanguages: z.array(z.string()).optional(),
  distanceMiles: z.number().optional(),
});

// Temporary placeholder for users table (if needed)
export const users = {} as any;
