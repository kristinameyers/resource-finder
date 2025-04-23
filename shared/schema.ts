import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
