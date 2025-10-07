// /taxonomy/index.ts
/* --------------------------------------------------------------
   Taxonomy – a single import point for the whole app
   Consolidated and refactored from officialTaxonomy.ts
   -------------------------------------------------------------- */

import type { Category, Subcategory } from "../types/shared-schema"; // Assuming Category/Subcategory are now satisfied by the new structure

/* ---------- 1️⃣ Import Raw Data (from original index.ts) --------- */
import mainCategoriesRaw from "./mainCategories.json";
import subCategoriesRaw from "./subCategories.json";

/* ---------- 2️⃣ Define new internal types (from officiaTaxonomy) --- */

// Internal interfaces to type the raw JSON imports
interface MainCategoryData {
  id: string;
  name: string;
  taxonomyCode?: string;
  keywords?: string[];
  icon?: string;
}

type SubCategoryDataRaw = Record<string, Array<{
  id: string;
  name: string;
  taxonomyCode: string;
  // NOTE: categoryId is likely present in subCategoriesRaw, 
  // but it's not strictly necessary if we rely on the map key.
}>>;

// MainCategory is either defined by taxonomy code OR keywords
export type MainCategory =
  | { name: string; taxonomyCode: string; keywords?: never; icon?: string }
  | { name: string; keywords: string[]; taxonomyCode?: never; icon?: string };

// Subcategory structure used internally for the map
export type OfficialSubcategory = {
  id: string;
  name: string;
  taxonomyCode: string;
};

// Map the shared Category type to the new internal MainCategory type
// This assumes the rest of the app expects the keys used below.
export const MAIN_CATEGORIES: Record<string, MainCategory> = Object.entries(
  (mainCategoriesRaw as Record<string, MainCategoryData>)
).reduce((acc, [key, cur]) => {
  const id = key.toLowerCase().trim();
  // Choose the type based on the presence of taxonomyCode
  acc[id] = cur.taxonomyCode
    ? { name: cur.name, taxonomyCode: cur.taxonomyCode, icon: cur.icon }
    : { name: cur.name, keywords: cur.keywords ?? [], icon: cur.icon };
  return acc;
}, {} as Record<string, MainCategory>);


// Build SUBCATEGORIES from JSON map
const rawSubCategories = subCategoriesRaw as SubCategoryDataRaw;

export const SUBCATEGORIES: Record<string, OfficialSubcategory[]> = Object.entries(
  rawSubCategories
).reduce((acc, [catId, arr]) => {
  acc[catId.toLowerCase().trim()] = arr.map((cur) => ({
    id: cur.id.toLowerCase().trim(),
    name: cur.name,
    taxonomyCode: cur.taxonomyCode,
  }));
  return acc;
}, {} as Record<string, OfficialSubcategory[]>);


/* ---------- 3️⃣ Preserve original index.ts helper utility names --- */

/**
 * Resolve a top‑level category from a free‑form term.
 * Returns `null` if nothing matches.
 * * NOTE: This combines the old (keyword) and new (taxonomyCode) lookup.
 * Since the original `resolveCategory` primarily used keywords, we 
 * will use the new `getCategoryByKeyword` for consistency, but enhance it.
 */
export function resolveCategory(term: string): { id: string; name: string } | null {
  const norm = term.toLowerCase().trim();

  // 1. Try exact match by key (case-insensitive)
  const catByKey = MAIN_CATEGORIES[norm];
  if (catByKey) {
    return { id: norm, name: catByKey.name };
  }

  // 2. Try match by keyword (using robust logic from officiaTaxonomy)
  const catByKeyword = getCategoryByKeyword(term);
  if (catByKeyword) {
    return catByKeyword;
  }
  
  // 3. Fallback: Check if the term is a taxonomy code
  const catByCode = getCategoryByTaxonomyCode(term);
  if (catByCode) {
    return catByCode;
  }

  return null;
}

/**
 * Get the icon name for a given category id (case‑insensitive).
 */
export function getCategoryIcon(categoryId: string): string | null {
  const cat = MAIN_CATEGORIES[categoryId.toLowerCase().trim()];
  return cat?.icon ?? null;
}

/* ---------- 4️⃣ Retain/Re-export utility functions ------------- */

// Helper functions copied from officiaTaxonomy:

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


/* ---------- 5️⃣ Export for downstream inference and legacy style ------ */

// 7️⃣ Export a type for downstream inference
// NOTE: Type inference on SUBCATEGORIES will use OfficialSubcategory[]
export type SubcategoryMap = typeof SUBCATEGORIES; 


// 8️⃣ Default export (preserves old import style)
export default {
  MAIN_CATEGORIES,
  SUBCATEGORIES,
  resolveCategory,
  getCategoryIcon,
  // New helper functions are also available on the default export
  getCategoryByTaxonomyCode, 
  getCategoryByKeyword,
};