/**
 * Shared taxonomy package for Santa Barbara 211
 * Contains category definitions and search logic
 */

export const MAIN_CATEGORIES = {
  'housing': { name: 'Housing', taxonomyCode: 'BH-1800.8500' },
  'food': { name: 'Food', taxonomyCode: 'BD-5000' },
  'healthcare': { name: 'Health Care', taxonomyCode: 'LN' },
  'mental-wellness': { name: 'Mental Wellness', taxonomyCode: 'RP-1400' },
  'substance-use': { name: 'Substance Use', taxonomyCode: 'RX-8250' },
  'children-family': { name: 'Children & Family', taxonomyCode: 'PH-2360.2400' },
  'young-adults': { name: 'Young Adults', taxonomyCode: 'PS-9800' },
  'legal-assistance': { name: 'Legal Assistance', taxonomyCode: 'FT' },
  'utilities': { name: 'Utilities', taxonomyCode: 'BV' },
  'transportation': { name: 'Transportation', taxonomyCode: 'BT-4500' },
  'hygiene-household': { name: 'Hygiene & Household', taxonomyCode: 'BM-3000' },
  'finance-employment': { name: 'Finance & Employment', keywords: ['finance'] },
  'education': { name: 'Education', keywords: ['education'] }
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
  const category = getCategoryById(categoryId);
  if (category && 'taxonomyCode' in category) {
    return category.taxonomyCode;
  }
  return null;
}

export function getKeywords(categoryId: string): string[] {
  const category = getCategoryById(categoryId);
  if (category && 'keywords' in category) {
    return category.keywords;
  }
  return [];
}