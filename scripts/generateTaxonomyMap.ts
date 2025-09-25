// scripts/generateTaxonomyMap.ts
import subcategories from '../taxonomy/subcategories.json';
const map = Object.entries(subcategories).reduce((acc, [_cat, subs]) => {
  subs.forEach(s => acc[s.name] = s.taxonomyCode);
  return acc;
}, {} as Record<string, string>);
// write map to src/api/taxonomyMap.json