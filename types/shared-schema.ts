// src/types/shared-schema.ts
import { z } from "zod";

/* ------------------------------------------------------------------
   1️⃣  Core data models (used throughout the app)
   ------------------------------------------------------------------ */

/** A single resource returned from the 211 API */
export interface Resource {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  location: string;          // usually a ZIP or address string
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
  userVote?: "up" | "down" | null;

  /** NEW – organization name that the UI displays */
  organizationName?: string;

  /* ---------- Enhanced 211 fields (optional) ---------- */
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

/** Top‑level category (shown in the grid) */
export interface Category {
  id: string;
  name: string;
  icon?: string;
  keywords: string[];
}

/** Sub‑category – always belongs to a parent Category */
export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  taxonomyCode?: string;
}

/**
 * Unified **Location** type.
 *
 * It contains the address fields required by the API (`city`, `state`,
 * `country`) **plus** optional geo/ZIP fields that other parts of the
 * codebase use (`id`, `name`, `zipCode`, `latitude`, `longitude`,
 * `type`, `value`). Making everything optional lets us use the same
 * type for both purposes without TypeScript conflicts.
 */
export interface Location {
  // Address fields (always present for a full location)
  city?: string;
  state?: string;
  country?: string;

  // Optional geo / zip / address helper fields
  id?: string;
  name?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  type?: "zipCode" | "address";
  value?: string;
}

/** Helper – a location where any field may be missing */
export type PartialLocation = Partial<Location>;

/** Simple user record */
export interface User {
  id: string;
  email?: string;
  name?: string;
  /** Username is optional – added for onboarding */
  username?: string;
}

/** Payload used when creating a new user */
export interface InsertUser {
  email?: string;
  name?: string;
  /** Username is optional – added for onboarding */
  username?: string;
}

/* ------------------------------------------------------------------
   2️⃣  DTOs used by the detailed resource endpoint
   ------------------------------------------------------------------ */
export interface ServiceAtLocationDto {
  /** Human‑readable name of the service */
  serviceName?: string;
  /** Legacy field kept for backward compatibility */
  serviceAtLocationName?: string;
  // Add any extra fields you need here (description, phone, etc.)
  // description?: string;
  // phone?: string;
  // …
}

/** The shape returned by the “resource details” API call */
export interface ResourceDetail {
  /** The display name that the UI shows */
  serviceName: string;
  // Add every property you map in `getResourceDetail`
  // description?: string;
  // phone?: string;
  // website?: string;
  // …
}

/* ------------------------------------------------------------------
   3️⃣  Miscellaneous exported types
   ------------------------------------------------------------------ */
export type MainCategory = Category;

/* ------------------------------------------------------------------
   4️⃣  Zod schema for runtime validation (keeps in sync with
       the TypeScript interface above)
   ------------------------------------------------------------------ */
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
  userVote: z.enum(["up", "down"]).nullable().optional(),

  /** NEW – organization name (optional) */
  organizationName: z.string().optional(),

  /* ---------- Enhanced 211 fields (optional) ---------- */
  applicationProcess: z.string().optional(),
  documents: z.string().optional(),
  fees: z.string().optional(),
  serviceAreas: z.string().optional(),
  hoursOfOperation: z.string().optional(),
  phoneNumbers: z
    .object({
      main: z.string().optional(),
      fax: z.string().optional(),
      tty: z.string().optional(),
      crisis: z.string().optional(),
    })
    .optional(),
  additionalLanguages: z.array(z.string()).optional(),
  distanceMiles: z.number().optional(),
});

/* ------------------------------------------------------------------
   5️⃣  Temporary placeholder for the users table (if needed)
   ------------------------------------------------------------------ */
export const users = {} as any;