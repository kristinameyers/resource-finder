/**
 * Shared taxonomy package for Santa Barbara 211
 * Contains category definitions and search logic
 */

export const MAIN_CATEGORIES = {
  'finance-employment': { name: 'Finance & Employment', keywords: ['finance'] },
  'education': { name: 'Education', keywords: ['education'] },
  'housing': { name: 'Housing', keywords: ['housing'] },
  'food': { name: 'Food', keywords: ['food'] },
  'healthcare': { name: 'Health Care', keywords: ['healthcare'] },
  'mental-wellness': { name: 'Mental Wellness', keywords: ['mental wellness'] },
  'substance-use': { name: 'Substance Use', keywords: ['substance use'] },
  'children-family': { name: 'Children & Family', keywords: ['children and family'] },
  'young-adults': { name: 'Young Adults', keywords: ['young adults'] },
  'legal-assistance': { name: 'Legal Assistance', keywords: ['legal assistance'] },
  'utilities': { name: 'Utilities', keywords: ['utilities'] },
  'transportation': { name: 'Transportation', keywords: ['transportation'] },
  'hygiene-household': { name: 'Hygiene & Household', keywords: ['hygiene'] }
};

export interface Resource {
  id: string;
  name: string;
  organization: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  hours?: string;
  eligibility?: string;
  applicationProcess?: string;
  requiredDocuments?: string;
  fees?: string;
  languages?: string[];
  serviceAreas?: string[];
  distance?: number;
  latitude?: number;
  longitude?: number;
}

export function getCategoryById(id: string) {
  return MAIN_CATEGORIES[id as keyof typeof MAIN_CATEGORIES];
}

export function shouldUseKeywordSearch(categoryId: string): boolean {
  const category = getCategoryById(categoryId);
  return category && 'keywords' in category;
}

export function getTaxonomyCode(categoryId: string): string | null {
  // All categories now use keywords, not taxonomy codes
  return null;
}

export function getKeywords(categoryId: string): string[] {
  const category = getCategoryById(categoryId);
  if (category && 'keywords' in category) {
    return category.keywords;
  }
  return [];
}