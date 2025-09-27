/**
 * Official Santa Barbara 211 Taxonomy Data
 * Source: SB211 Taxonomy CSV files provided January 7, 2025
 */
import mainCategoryData from './mainCategories.json';
import subCategoryData from './subCategories.json';

/** JSON import types */
interface MainCategoryData {
  id: string;
  name: string;
  taxonomyCode?: string;
  keywords?: string[];
  icon?: string;
}
// subCategoryData is a map: Record<string, Array<…>>
type SubCategoryDataMap = Record<string, Array<{
  id: string;
  name: string;
  taxonomyCode: string;
  categoryId: string;
}>>;

/** MainCategory and Subcategory types used in code */
export type MainCategory =
  | { name: string; taxonomyCode: string; keywords?: never; icon?: string }
  | { name: string; keywords: string[]; taxonomyCode?: never; icon?: string };

export type Subcategory = {
  id: string;
  name: string;
  taxonomyCode: string;
};

/** Build MAIN_CATEGORIES from JSON object */
export const MAIN_CATEGORIES: Record<string, MainCategory> = Object.entries(
  (mainCategoryData as Record<string, MainCategoryData>)
).reduce((acc, [key, cur]) => {
  const id = key.toLowerCase().trim();
  acc[id] = cur.taxonomyCode
    ? { name: cur.name, taxonomyCode: cur.taxonomyCode, icon: cur.icon }
    : { name: cur.name, keywords: cur.keywords ?? [], icon: cur.icon };
  return acc;
}, {} as Record<string, MainCategory>);

/** Build SUBCATEGORIES from JSON map */
const rawSubCategories = subCategoryData as SubCategoryDataMap;

export const SUBCATEGORIES: Record<string, Subcategory[]> = Object.entries(
  rawSubCategories
).reduce((acc, [catId, arr]) => {
  acc[catId.toLowerCase().trim()] = arr.map((cur) => ({
    id: cur.id.toLowerCase().trim(),
    name: cur.name,
    taxonomyCode: cur.taxonomyCode,
  }));
  return acc;
}, {} as Record<string, Subcategory[]>);

/** Get subcategories for a given category */
export function getSubcategoriesForCategory(categoryId: string): Subcategory[] {
  return SUBCATEGORIES[categoryId.toLowerCase().trim()] ?? [];
}

/** Lookup main category by taxonomyCode */
export function getCategoryByTaxonomyCode(
  code: string
): { id: string; name: string } | null {
  for (const [id, cat] of Object.entries(MAIN_CATEGORIES)) {
    if ('taxonomyCode' in cat && cat.taxonomyCode === code) {
      return { id, name: cat.name };
    }
  }
  return null;
}

/** Lookup main category by keyword */
export function getCategoryByKeyword(
  keyword: string
): { id: string; name: string } | null {
  const norm = keyword.toLowerCase().trim();
  for (const [id, cat] of Object.entries(MAIN_CATEGORIES)) {
    if ('keywords' in cat && cat.keywords && cat.keywords.length > 0) {
      if (cat.keywords.some(kw => norm.includes(kw.toLowerCase()) || kw.toLowerCase().includes(norm))) {
        return { id, name: cat.name };
      }
    }
  }
  return null;
}

/** Get taxonomyCode for main category, or null */
export function getMainCategoryTaxonomyCode(categoryId: string): string | null {
  const cat = MAIN_CATEGORIES[categoryId.toLowerCase().trim()];
  return (cat && 'taxonomyCode' in cat) ? cat.taxonomyCode ?? null : null;
}

/** Lookup a subcategory’s taxonomyCode */
export function getOfficialSubcategoryTaxonomyCode(
  categoryId: string,
  subcategoryId: string
): string | null {
  const subs = SUBCATEGORIES[categoryId.toLowerCase().trim()];
  const sub = subs?.find(s => s.id === subcategoryId.toLowerCase().trim());
  return sub?.taxonomyCode ?? null;
}
