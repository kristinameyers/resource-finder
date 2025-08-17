/**
 * Official Santa Barbara 211 Taxonomy Data
 * Source: SB211 Taxonomy CSV files provided January 7, 2025
 * This is the authoritative mapping between categories/subcategories and their official taxonomy codes
 */

// Main Categories with official taxonomy codes - Updated January 2025 per user requirements
export const MAIN_CATEGORIES = {
  'housing': { name: 'Housing', taxonomyCode: 'BH-1800' },
  'finance-employment': { name: 'Finance & Employment', taxonomyCode: 'NL-1000' },
  'food': { name: 'Food', taxonomyCode: 'BD-1800.2000' },
  'healthcare': { name: 'Health Care', taxonomyCode: 'LN' },
  'mental-wellness': { name: 'Mental Wellness', taxonomyCode: 'RP-1400' },
  'substance-use': { name: 'Substance Use', taxonomyCode: 'RX-8250' },
  'children-family': { name: 'Children & Family', taxonomyCode: 'PH' },
  'young-adults': { name: 'Young Adults', taxonomyCode: 'PS-9800' },
  'education': { name: 'Education', taxonomyCode: 'HD-1800.8000' },
  'legal-assistance': { name: 'Legal Assistance', taxonomyCode: 'FT' },
  'utilities': { name: 'Utilities', taxonomyCode: 'BV' },
  'transportation': { name: 'Transportation', taxonomyCode: 'BT-4500' }
} as const;

// Subcategories with official taxonomy codes
export const SUBCATEGORIES = {
  'housing': [
    { id: 'domestic-violence-shelters', name: 'Domestic Violence Shelters', taxonomyCode: 'BH-1800.1500-100' },
    { id: 'homeless-shelters', name: 'Homeless Shelters', taxonomyCode: 'BH-1800.8500' },
    { id: 'maternity-homes', name: 'Maternity Homes', taxonomyCode: 'LJ-5000.5000' },
    { id: 'senior-housing', name: 'Senior Housing', taxonomyCode: 'BH-8500.8000' },
    { id: 'sexual-assault-shelters', name: 'Sexual Assault Shelters', taxonomyCode: 'BH-1800.1500-800' },
    { id: 'supervised-living-older-youth', name: 'Supervised Living for Older Youth', taxonomyCode: 'PH-6300.8000' },
    { id: 'youth-shelters', name: 'Youth Shelters', taxonomyCode: 'BH-1800.1500-960' },
    { id: 'appliances', name: 'Appliances', taxonomyCode: 'BM-3000.0500' },
    { id: 'clothing', name: 'Clothing', taxonomyCode: 'BM-6500.1500' },
    { id: 'furniture', name: 'Furniture', taxonomyCode: 'BM-3000.2000*' },
    { id: 'home-maintenance-repair', name: 'Home Maintenance & Minor Repair Services', taxonomyCode: 'PH-3300.2750' },
    { id: 'utility-payment-assistance', name: 'Utility Payment Assistance', taxonomyCode: 'BV-8900.9300' },
    { id: 'energy-efficient-home-improvement', name: 'Energy Efficient Home Improvement Assistance', taxonomyCode: 'NL-6000.9500' },
    { id: 'housing-discrimination', name: 'Housing Discrimination', taxonomyCode: 'FT-1800.3000' },
    { id: 'low-income-rental-housing', name: 'Low Income Rental Housing', taxonomyCode: 'BH-7000.4600' },
    { id: 'rent-payment-assistance', name: 'Rent Payment Assistance', taxonomyCode: 'BH-3800.7000' },
    { id: 'section-8-voucher', name: 'Section 8 Voucher / Housing Authority', taxonomyCode: 'BH-8300.3000' },
    { id: 'bathing-facilities', name: 'Bathing Facilities', taxonomyCode: 'BH-1800.3500' },
    { id: 'temporary-mailing-address', name: 'Temporary Mailing Address', taxonomyCode: 'BM-6500.6500-850' },
    { id: 'animal-shelters', name: 'Animal Shelters', taxonomyCode: 'PD-7600.0600' },
    { id: 'animal-licenses', name: 'Animal Licenses', taxonomyCode: 'PD-0700.0600' }
  ],
  'finance-employment': [
    { id: 'career-counseling', name: 'Career Counseling', taxonomyCode: 'HL-2500.8035' },
    { id: 'job-assistance-centers', name: 'Job Assistance Centers', taxonomyCode: 'ND-1500' },
    { id: 'employment-discrimination', name: 'Employment Discrimination Assistance', taxonomyCode: 'FT-1800.1850' },
    { id: 'vocational-rehabilitation', name: 'Vocational Rehabilitation', taxonomyCode: 'ND-9000' },
    { id: 'technical-schools', name: 'Technical/Trade Schools', taxonomyCode: 'HD-6000.9000' },
    { id: 'calworks', name: 'CalWorks', taxonomyCode: 'NL-1000.8500*' },
    { id: 'general-relief', name: 'General Relief', taxonomyCode: 'NL-1000.2500' },
    { id: 'cash-assistance-immigrants', name: 'Cash Assistance Program for Immigrants', taxonomyCode: 'NL-1000.2400-150' },
    { id: 'veteran-benefits', name: 'Veteran Benefits Assistance', taxonomyCode: 'FT-1000.9000' },
    { id: 'calfresh', name: 'CalFresh (formerly Food Stamps)', taxonomyCode: 'NL-6000.2000' },
    { id: 'medicaid', name: 'Medicaid', taxonomyCode: 'NL-5000.5000' },
    { id: 'wic', name: 'Women, Infants, & Children', taxonomyCode: 'NL-6000.9500' },
    { id: 'medicare', name: 'Medicare', taxonomyCode: 'NS-8000.5000' },
    { id: 'credit-counseling', name: 'Credit Counseling', taxonomyCode: 'DM-1500.1500' },
    { id: 'vita-programs', name: 'VITA Programs', taxonomyCode: 'DT-8800.9300' },
    { id: 'utility-payment-assistance', name: 'Utility Payment Assistance', taxonomyCode: 'BV-8900.9300' },
    { id: 'well-animal-checkups', name: 'Well Animal Checkups', taxonomyCode: 'PD-9000.9700' },
    { id: 'pet-food', name: 'Pet Food', taxonomyCode: 'PD-6250.6600' }
  ],
  'legal-assistance': [
    { id: 'criminal-courts', name: 'Criminal State Trial Courts', taxonomyCode: 'FC-8200.1550' },
    { id: 'juvenile-courts', name: 'Juvenile Justice Courts', taxonomyCode: 'FC-8200.3500-350' },
    { id: 'mental-health-courts', name: 'Mental Health Courts', taxonomyCode: 'FC-8200.8100-500' },
    { id: 'small-claims', name: 'Small Claims Courts', taxonomyCode: 'FC-8200.8100-800' },
    { id: 'traffic-courts', name: 'Traffic Courts', taxonomyCode: 'FC-8200.8100-900' },
    { id: 'veterans-courts', name: 'Veterans Courts', taxonomyCode: 'FC-8200.8100-920' },
    { id: 'general-legal-aid', name: 'General Legal Aid', taxonomyCode: 'FT-3200' },
    { id: 'lawyers-referral', name: 'Lawyers Referral Services', taxonomyCode: 'FT-4800' },
    { id: 'immigration-legal', name: 'Immigration/ Naturalization Legal Services', taxonomyCode: 'FT-3600' },
    { id: 'immigration-adjudication', name: 'Immigration/ Naturalization Adjucaation Services', taxonomyCode: 'FT-3550' },
    { id: 'birth-certificates', name: 'Birth Certificates', taxonomyCode: 'DF-7000.1200' },
    { id: 'business-registration', name: 'Business Registration/Licensing', taxonomyCode: 'DF-4500.1000' },
    { id: 'court-records', name: 'Court Records', taxonomyCode: 'DF-7000.1550' },
    { id: 'death-certificates', name: 'Death Certificates', taxonomyCode: 'DF-7000.1700-300' },
    { id: 'divorce-records', name: 'Divorce Records', taxonomyCode: 'DF-7000.1800' },
    { id: 'identification-cards', name: 'Identification Cards', taxonomyCode: 'DF-7000.3300' },
    { id: 'marriage-certificates', name: 'Marriage Certificates', taxonomyCode: 'DF-7000.4950' },
    { id: 'land-records', name: 'Land Records', taxonomyCode: 'DF-7000.4550)' },
    { id: 'social-security-numbers', name: 'Social Security Numbers', taxonomyCode: 'DF-7000.8250' },
    { id: 'voter-registration', name: 'Voter Registration Offices', taxonomyCode: 'TQ-1800.9000' },
    { id: 'passports', name: 'Passports', taxonomyCode: 'DF-7000.6650' },
    { id: 'crime-victim-assistance', name: 'Crime Victim Assistance', taxonomyCode: 'FN-1900.2500' },
    { id: 'dv-legal-services', name: 'Domestic Violence Legal Services', taxonomyCode: 'FT-3000.1750' },
    { id: 'employment-discrimination', name: 'Employment Discrimination', taxonomyCode: 'FT-1800.1850' },
    { id: 'housing-discrimination', name: 'Housing Discrimination', taxonomyCode: 'FT-1800.3000' },
    { id: 'landlord-tenant', name: 'Landlord/Tenant Dispute', taxonomyCode: 'FT-4500.4600' },
    { id: 'patient-rights', name: 'Patient Rights', taxonomyCode: 'FT-6200' },
    { id: 'restraining-orders', name: 'Restraining Orders', taxonomyCode: 'FT-6940' },
    { id: 'social-security-fraud', name: 'Social Security Fraud Reporting', taxonomyCode: 'FN-1700.7800' },
    { id: 'welfare-rights', name: 'Welfare Rights', taxonomyCode: 'FT-1000.9500' }
  ],
  
  'food': [
    { id: 'meals', name: 'Meals', taxonomyCode: 'BD-5000' },
    { id: 'calaim', name: 'CalAIM', taxonomyCode: 'BD-5000.3500' },
    { id: 'food-pantries', name: 'Food Pantries', taxonomyCode: 'BD-1800.2000' },
    { id: 'calfresh', name: 'CalFresh (Food Stamps)', taxonomyCode: 'NL-6000.2000' },
    { id: 'wic', name: 'Women, Infants, & Children (WIC)', taxonomyCode: 'NL-6000.9500' },
    { id: 'senior-nutrition', name: 'Senior Nutrition Programs', taxonomyCode: 'BD-5000.8000' },
    { id: 'school-meals', name: 'School Meal Programs', taxonomyCode: 'BD-1800.7500' },
    { id: 'emergency-food', name: 'Emergency Food Assistance', taxonomyCode: 'BD-1800.2000' },
    { id: 'home-delivery-meals', name: 'Home Delivery Meals', taxonomyCode: 'BD-5000.3500' }
  ]
} as const;

/**
 * Get the official taxonomy code for a main category with proper error handling
 */
export function getOfficialCategoryTaxonomyCode(categoryId: string): string | null {
  if (!categoryId) {
    console.warn(`[Taxonomy] Empty categoryId provided`);
    return null;
  }
  
  // Ensure lowercase for consistent lookups
  const normalizedCategoryId = categoryId.toLowerCase().trim();
  const category = MAIN_CATEGORIES[normalizedCategoryId as keyof typeof MAIN_CATEGORIES];
  
  if (!category) {
    console.warn(`[Taxonomy] No main category mapping found for categoryId="${categoryId}" (normalized: "${normalizedCategoryId}")`);
    console.warn(`[Taxonomy] Available categories: ${Object.keys(MAIN_CATEGORIES).join(', ')}`);
    return null;
  }
  
  console.log(`[Taxonomy] ✅ Mapped categoryId "${categoryId}" → taxonomy code "${category.taxonomyCode}"`);
  return category.taxonomyCode;
}

/**
 * Get the official taxonomy code for a subcategory with proper error handling
 */
export function getOfficialSubcategoryTaxonomyCode(categoryId: string, subcategoryId: string): string | null {
  if (!categoryId || !subcategoryId) {
    console.warn(`[Taxonomy] Missing categoryId or subcategoryId: ${categoryId}, ${subcategoryId}`);
    return null;
  }
  
  const normalizedCategoryId = categoryId.toLowerCase().trim();
  const subcategories = SUBCATEGORIES[normalizedCategoryId as keyof typeof SUBCATEGORIES];
  
  if (!subcategories) {
    console.warn(`[Taxonomy] No subcategories found for categoryId="${categoryId}" (normalized: "${normalizedCategoryId}")`);
    return null;
  }
  
  const subcategory = subcategories.find(sub => sub.id === subcategoryId.toLowerCase().trim());
  
  if (!subcategory) {
    console.warn(`[Taxonomy] No subcategory mapping found for "${subcategoryId}" in category "${categoryId}"`);
    console.warn(`[Taxonomy] Available subcategories: ${subcategories.map(s => s.id).join(', ')}`);
    return null;
  }
  
  console.log(`[Taxonomy] ✅ Mapped subcategory "${subcategoryId}" in "${categoryId}" → taxonomy code "${subcategory.taxonomyCode}"`);
  return subcategory.taxonomyCode;
}