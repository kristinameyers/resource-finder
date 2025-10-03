// /taxonomy/index.ts
/* --------------------------------------------------------------
   Taxonomy – a single import point for the whole app
   -------------------------------------------------------------- */

import type { Category, Subcategory } from "../types/shared-schema";

/* ---------- 1️⃣ Load the static JSON ------------------------ */
import mainCategoriesRaw from "./mainCategories.json";
import subCategoriesRaw from "./subCategories.json";

/* ---------- 2️⃣ Give the JSON a typed shape ----------------- */
// Main categories already match the `Category` interface.
export const MAIN_CATEGORIES: Record<string, Category> =
  mainCategoriesRaw as Record<string, Category>;

/* ---------- 3️⃣ Prepare the raw sub‑category data ------------- */
// The JSON we import does **not** contain `categoryId`. We type it
// loosely first, then we’ll inject the missing field.
const rawSubcategories = subCategoriesRaw as Record<
  string,
  { id: string; name: string; taxonomyCode: string }[]
>;

/* ---------- 4️⃣ Build a fully‑typed SUBCATEGORIES map ------- */
export const SUBCATEGORIES: Record<string, Subcategory[]> = Object.fromEntries(
  Object.entries(rawSubcategories).map(([catKey, arr]) => [
    catKey,
    arr.map(sc => ({
      ...sc,
      categoryId: catKey, // <-- inject required field
    })),
  ])
);

/* ---------- 5️⃣ Lower‑cased lookup map for fast access ----- */
const LOWERCASE_MAP: Record<string, Category> = Object.fromEntries(
  Object.entries(MAIN_CATEGORIES).map(([k, v]) => [k.toLowerCase(), v])
);

/* ---------- 6️⃣ Helper utilities --------------------------- */

/**
 * Resolve a top‑level category from a free‑form term.
 * Returns `null` if nothing matches.
 */
export function resolveCategory(term: string): Category | null {
  const normalized = term.toLowerCase().trim();

  // 1️⃣ Exact key match (case‑insensitive)
  if (LOWERCASE_MAP[normalized]) {
    return LOWERCASE_MAP[normalized];
  }

  // 2️⃣ Keyword match – any keyword that equals the term **or**
  //    is contained within the term.
  for (const cat of Object.values(MAIN_CATEGORIES)) {
    if (
      cat.keywords.some(
        kw => kw.toLowerCase() === normalized || normalized.includes(kw.toLowerCase())
      )
    ) {
      return cat;
    }
  }

  return null;
}

/**
 * Get the icon name for a given category id (case‑insensitive).
 */
export function getCategoryIcon(categoryId: string): string | null {
  const cat = LOWERCASE_MAP[categoryId.toLowerCase().trim()];
  return cat?.icon ?? null;
}

/* ---------- 7️⃣ Export a type for downstream inference ------ */
export type SubcategoryMap = typeof SUBCATEGORIES;

/* ---------- 8️⃣ Default export (preserves old import style) - */
export default {
  MAIN_CATEGORIES,
  SUBCATEGORIES,
  resolveCategory,
  getCategoryIcon,
};