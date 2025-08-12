import { pgTable, text, serial, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  resourceId: text("resource_id").notNull(),
  sessionId: text("session_id").notNull(), // Use session ID instead of user ID for anonymous voting
  vote: text("vote").notNull(), // 'up' or 'down'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Ensure one vote per session per resource
  uniqueSessionResource: unique().on(table.sessionId, table.resourceId),
}));

export const insertRatingSchema = createInsertSchema(ratings).pick({
  resourceId: true,
  sessionId: true,
  vote: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

// Phone number interface for comprehensive phone data from Query API
export interface PhoneDetails {
  id?: string;
  name?: string;
  type?: string;
  number?: string;
  extension?: string;
  description?: string;
  isMain?: boolean;
  access?: any;
}

// Resource schema definition
export interface Category {
  id: string;
  name: string;
  icon?: string; // Icon identifier for this category
  taxonomyCode?: string; // 211 taxonomy code for this category
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string; // Parent category ID
}

export interface Location {
  id: string;
  name: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  location: string;
  zipCode?: string;
  url?: string;
  phone?: string;
  email?: string;
  address?: string;
  schedules?: string;
  accessibility?: string;
  languages?: string[];
  thumbsUp?: number; // Number of thumbs up votes
  thumbsDown?: number; // Number of thumbs down votes
  userVote?: 'up' | 'down' | null; // Current user's vote for this resource
  distanceMiles?: number; // Distance from user's location in miles
  distance?: number; // Distance for API calculations
  
  // Enhanced iCarol API fields
  applicationProcess?: string; // How to apply for services
  documents?: string; // Required documents
  fees?: string; // Cost information
  serviceAreas?: string; // Geographic areas served
  hoursOfOperation?: string; // Detailed hours (different from schedules)
  eligibility?: string; // Eligibility requirements
  phoneNumbers?: {
    main?: string;
    fax?: string;
    tty?: string;
    crisis?: string;
  };
  additionalLanguages?: string[]; // More detailed language support
  
  // Comprehensive phone data from Query API
  comprehensivePhones?: PhoneDetails[];
}

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  categoryId: z.string(),
  subcategoryId: z.string().optional(),
  location: z.string(),
  zipCode: z.string().optional(),
  url: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  schedules: z.string().optional(),
  accessibility: z.string().optional(),
  languages: z.array(z.string()).optional(),
  
  // Enhanced iCarol API fields
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
  eligibility: z.string().optional(),
  
  // Comprehensive phone data from Query API
  comprehensivePhones: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional(),
    number: z.string().optional(),
    extension: z.string().optional(),
    description: z.string().optional(),
    isMain: z.boolean().optional(),
    access: z.any().optional(),
  })).optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  taxonomyCode: z.string().optional(),
});

export const subcategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
});

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  zipCode: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ResourcesResponse = {
  resources: Resource[];
  total: number;
};

export type CategoriesResponse = {
  categories: Category[];
};

export type SubcategoriesResponse = {
  subcategories: Subcategory[];
};

export type LocationsResponse = {
  locations: Location[];
};
