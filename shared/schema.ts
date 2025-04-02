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
}

export interface Location {
  id: string;
  name: string;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string;
  url?: string;
}

export const resourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  location: z.string(),
  imageUrl: z.string().optional(),
  url: z.string().optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type ResourcesResponse = {
  resources: Resource[];
  total: number;
};

export type CategoriesResponse = {
  categories: Category[];
};

export type LocationsResponse = {
  locations: Location[];
};
