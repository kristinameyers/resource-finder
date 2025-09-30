// src/types/shared-schema.ts
import { z } from "zod";

/* ------------------------------------------------------------------
   1️⃣  Core data models (used throughout the app)
   ------------------------------------------------------------------ */

/** A single resource returned from the 211 API */
export interface Resource {
  // Legacy fields for backward compatibility
  id?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  location?: string;          // usually a ZIP or address string
  zipCode?: string;
  url?: string;
  phone?: string;
  email?: string;
  schedules?: string;
  accessibility?: string;
  languages?: string[];
  thumbsUp?: number;
  thumbsDown?: number;
  userVote?: "up" | "down" | null;
  organizationName?: string;

  // 211 National Database API specific fields
  idServiceAtLocation?: string;
  idOrganization?: string;
  idService?: string;
  idLocation?: string;
  nameOrganization?: string;
  nameService?: string;
  nameLocation?: string;
  nameServiceAtLocation?: string;
  alternateNamesOrganization?: string[];
  alternateNamesService?: string[];
  alternateNamesLocation?: string[];
  descriptionOrganization?: string;
  descriptionService?: string;
  descriptionServiceVector?: any[];

  address?: {
    streetAddress?: string;
    city?: string;
    county?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };
  
  taxonomy?: Array<{
    taxonomyTerm?: string;
    taxonomyCode?: string;
    taxonomyTermLevel1?: string;
    taxonomyTermLevel2?: string;
    taxonomyTermLevel3?: string;
    taxonomyTermLevel4?: string;
    taxonomyTermLevel5?: string;
    taxonomyTermLevel6?: string;
    targets?: Array<{
      code?: string;
      term?: string;
    }>;
  }>;
  
  serviceAreas?: Array<{
    type?: string;
    value?: string;
  }>;
  
  tagsService?: string[];
  dataOwner?: string;
  dataOwnerDisplayName?: string;
  geoPoint?: any;
  status?: any;

  /* ---------- Enhanced 211 fields (optional) ---------- */
  applicationProcess?: string;
  documents?: string;
  fees?: string;
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

/* ------------------------------------------------------------------
   2️⃣  Service At Location Details (from the new endpoint)
   ------------------------------------------------------------------ */

/** Service phone number with type and extension support */
export interface ServicePhone {
  number?: string;
  type?: string;
  extension?: string;
}

/** Address structure for service at location details */
export interface ServiceAddress {
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
}

/** Complete service at location details from the API endpoint */
export interface ServiceAtLocationDetails {
  organizationName?: string;
  serviceName?: string;
  locationName?: string;
  serviceDescription?: string;
  serviceHoursText?: string;
  website?: string;
  address?: ServiceAddress;
  servicePhones?: ServicePhone[];
  fees?: string;
  applicationProcess?: string;
  eligibility?: string;
  documentsRequired?: string;
  languagesOffered?: string[];
  disabilitiesAccess?: string;
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
  type?: "zipCode" | "address";
  value?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
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
   3️⃣  Legacy DTOs (for backward compatibility)
   ------------------------------------------------------------------ */
export interface ServiceAtLocationDto {
  /** Human‑readable name of the service */
  serviceName?: string;
  /** Legacy field kept for backward compatibility */
  serviceAtLocationName?: string;
}

/** The shape returned by the "resource details" API call */
export interface ResourceDetail {
  /** The display name that the UI shows */
  serviceName: string;
}

/* ------------------------------------------------------------------
   4️⃣  Miscellaneous exported types
   ------------------------------------------------------------------ */
export type MainCategory = Category;

/* ------------------------------------------------------------------
   5️⃣  Zod schemas for runtime validation
   ------------------------------------------------------------------ */

/** Service phone validation schema */
export const servicePhoneSchema = z.object({
  number: z.string().optional(),
  type: z.string().optional(),
  extension: z.string().optional(),
});

/** Service address validation schema */
export const serviceAddressSchema = z.object({
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

/** Service at location details validation schema */
export const serviceAtLocationDetailsSchema = z.object({
  organizationName: z.string().optional(),
  serviceName: z.string().optional(),
  locationName: z.string().optional(),
  serviceDescription: z.string().optional(),
  serviceHoursText: z.string().optional(),
  website: z.string().optional(),
  address: serviceAddressSchema.optional(),
  servicePhones: z.array(servicePhoneSchema).optional(),
  fees: z.string().optional(),
  applicationProcess: z.string().optional(),
  eligibility: z.string().optional(),
  documentsRequired: z.string().optional(),
  languagesOffered: z.array(z.string()).optional(),
  disabilitiesAccess: z.string().optional(),
});

/** Main resource validation schema */
export const resourceSchema = z.object({
  // Legacy fields
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  location: z.string().optional(),
  zipCode: z.string().optional(),
  url: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  schedules: z.string().optional(),
  accessibility: z.string().optional(),
  languages: z.array(z.string()).optional(),
  thumbsUp: z.number().default(0).optional(),
  thumbsDown: z.number().default(0).optional(),
  userVote: z.enum(["up", "down"]).nullable().optional(),
  organizationName: z.string().optional(),

  // 211 National Database API fields
  idServiceAtLocation: z.string().optional(),
  idOrganization: z.string().optional(),
  idService: z.string().optional(),
  idLocation: z.string().optional(),
  nameOrganization: z.string().optional(),
  nameService: z.string().optional(),
  nameLocation: z.string().optional(),
  nameServiceAtLocation: z.string().optional(),
  alternateNamesOrganization: z.array(z.string()).optional(),
  alternateNamesService: z.array(z.string()).optional(),
  alternateNamesLocation: z.array(z.string()).optional(),
  descriptionOrganization: z.string().optional(),
  descriptionService: z.string().optional(),
  descriptionServiceVector: z.array(z.any()).optional(),

  address: z.object({
    streetAddress: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    stateProvince: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  }).optional(),

  taxonomy: z.array(z.object({
    taxonomyTerm: z.string().optional(),
    taxonomyCode: z.string().optional(),
    taxonomyTermLevel1: z.string().optional(),
    taxonomyTermLevel2: z.string().optional(),
    taxonomyTermLevel3: z.string().optional(),
    taxonomyTermLevel4: z.string().optional(),
    taxonomyTermLevel5: z.string().optional(),
    taxonomyTermLevel6: z.string().optional(),
    targets: z.array(z.object({
      code: z.string().optional(),
      term: z.string().optional(),
    })).optional(),
  })).optional(),

  serviceAreas: z.array(z.object({
    type: z.string().optional(),
    value: z.string().optional(),
  })).optional(),

  tagsService: z.array(z.string()).optional(),
  dataOwner: z.string().optional(),
  dataOwnerDisplayName: z.string().optional(),
  geoPoint: z.any().optional(),
  status: z.any().optional(),

  /* ---------- Enhanced 211 fields (optional) ---------- */
  applicationProcess: z.string().optional(),
  documents: z.string().optional(),
  fees: z.string().optional(),
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

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  keywords: z.array(z.string()),
});

export const subcategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
  taxonomyCode: z.string().optional(),
});

export const locationSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  zipCode: z.string().optional(),
  type: z.enum(["zipCode", "address"]).optional(),
  value: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

/* ------------------------------------------------------------------
   6️⃣  API Response Types
   ------------------------------------------------------------------ */

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

/** Resource search response */
export interface ResourceSearchResponse {
  results: Resource[];
  count: number;
  total?: number;
  facets?: Record<string, any>;
}

/** Resource page for infinite queries */
export interface ResourcePage {
  items: Resource[];
  total: number;
  hasMore: boolean;
  /** True if the backend switched to county-based fallback (ZIP out of area) */
  usedCountyInstead?: boolean;
  /** Error message for out-of-area or query issues */
  error?: string;
}

/* ------------------------------------------------------------------
   7️⃣  Utility Types
   ------------------------------------------------------------------ */

/** Extract the unique ID from a resource */
export type ResourceId = string;

/** Phone number types supported by the API */
export type PhoneType = 'main' | 'fax' | 'tty' | 'crisis' | 'toll-free' | 'hotline';

/** Location mode for searches */
export type LocationMode = 'within' | 'serving' | 'near';

/** Search mode for queries */
export type SearchMode = 'All' | 'Keyword' | 'Taxonomy';

/* ------------------------------------------------------------------
   8️⃣  Error Types
   ------------------------------------------------------------------ */

/** API error response */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

/** Network error wrapper */
export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

/** Validation error wrapper */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/* ------------------------------------------------------------------
   9️⃣  Temporary placeholder for the users table (if needed)
   ------------------------------------------------------------------ */
export const users = {} as any;
