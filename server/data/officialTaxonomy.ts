/**
 * Official Santa Barbara 211 Taxonomy Data
 * Source: SB211 Taxonomy CSV files provided January 7, 2025
 * This is the authoritative mapping between categories/subcategories and their official taxonomy codes
 */

// Main Categories with official taxonomy codes - Updated January 2025 per user requirements

export const MAIN_CATEGORIES = {
  'housing': { name: 'Housing', taxonomyCode: 'BH-1800.8500' },
  'finance-employment': { name: 'Finance & Employment', taxonomyCode: 'NL-1000' },
  'food': { name: 'Food', taxonomyCode: 'BD-5000' },
  'healthcare': { name: 'Health Care', taxonomyCode: 'LN' },
  'mental-wellness': { name: 'Mental Wellness', taxonomyCode: 'RP-1400' },
  'substance-use': { name: 'Substance Use', taxonomyCode: 'RX-8250' },
  'children-family': { name: 'Children & Family', taxonomyCode: 'PH-2360.2400' },
  'young-adults': { name: 'Young Adults', taxonomyCode: 'PS-9800' },
  'education': { name: 'Education', taxonomyCode: 'HD-1800.8000' },
  'legal-assistance': { name: 'Legal Assistance', taxonomyCode: 'FT' },
  'utilities': { name: 'Utilities', taxonomyCode: 'BV' },
  'transportation': { name: 'Transportation', taxonomyCode: 'BT-4500' },
  'hygiene-household': { name: 'Hygiene & Household', taxonomyCode: 'BM-3000' }
} as const;

// Subcategories with official taxonomy codes
export const SUBCATEGORIES = {
  'housing': [
    { id: 'housing', name: 'Housing', taxonomyCode: 'BH-1800.8500' },
    { id: 'domestic-violence-shelters', name: 'Domestic Violence Shelters', taxonomyCode: 'BH-1800.1500-100' },
    { id: 'homeless-shelters', name: 'Homeless Shelters', taxonomyCode: 'BH-1800.8500' },
    { id: 'maternity-homes', name: 'Maternity Homes', taxonomyCode: 'LJ-5000.5000' },
    { id: 'senior-housing', name: 'Senior Housing', taxonomyCode: 'BH-8500.8000' },
    { id: 'sexual-assault-shelters', name: 'Sexual Assault Shelters', taxonomyCode: 'BH-1800.1500-800' },
    { id: 'supervised-living-older-youth', name: 'Supervised Living for Older Youth', taxonomyCode: 'PH-6300.8000' },
    { id: 'youth-shelters', name: 'Youth Shelters', taxonomyCode: 'BH-1800.1500-960' },
    { id: 'furniture', name: 'Furniture', taxonomyCode: 'BM-3000.2000*' },
    { id: 'home-maintenance-repair', name: 'Home Maintenance & Minor Repair Services', taxonomyCode: 'PH-3300.2750' },
    { id: 'energy-efficient-home-improvement', name: 'Energy Efficient Home Improvement Assistance', taxonomyCode: 'NL-6000.9500' },
    { id: 'housing-discrimination', name: 'Housing Discrimination', taxonomyCode: 'FT-1800.3000' },
    { id: 'low-income-rental-housing', name: 'Low Income Rental Housing', taxonomyCode: 'BH-7000.4600' },
    { id: 'section-8-voucher', name: 'Section 8 Voucher / Housing Authority', taxonomyCode: 'BH-8300.3000' },
    { id: 'bathing-facilities', name: 'Bathing Facilities', taxonomyCode: 'BH-1800.3500' },
    { id: 'temporary-mailing-address', name: 'Temporary Mailing Address', taxonomyCode: 'BM-6500.6500-850' },
    { id: 'meals', name: 'Meals', taxonomyCode: 'BD-5000' },
    { id: 'animal-shelters', name: 'Animal Shelters', taxonomyCode: 'PD-7600.0600' }
  ],
  'finance-employment': [
    { id: 'finance-employment', name: 'Finance Employment', taxonomyCode: 'ND-9000' },
    // { id: 'career-counseling', name: 'Career Counseling', taxonomyCode: 'HL-2500.8035' },
    { id: 'career-counseling', name: 'Career Counseling', taxonomyCode: 'HH-1000.1400' },
    { id: 'job-assistance', name: 'Job Assistance Centers', taxonomyCode: 'ND-1500' },
    { id: 'employment-discrimination', name: 'Employment Discrimination Assistance', taxonomyCode: 'FT-1800.1850' },
    { id: 'vocational-rehabilitation', name: 'Vocational Rehabilitation', taxonomyCode: 'ND-9000' },
    { id: 'technical-trade-schools', name: 'Technical/Trade Schools', taxonomyCode: 'HD-6000.9000' },
    { id: 'calworks', name: 'CalWorks', taxonomyCode: 'NL-1000.8500' },
    { id: 'general-relief', name: 'General Relief', taxonomyCode: 'NL-1000.2500' },
    { id: 'cash-assistance-immigrants', name: 'Cash Assistance Program for Immigrants', taxonomyCode: 'NL-1000.2400-150' },
    { id: 'veteran-benefits', name: 'Veteran Benefits Assistance', taxonomyCode: 'FT-1000.9000' },
    { id: 'calaim', name: 'CalAIM', taxonomyCode: 'BD-5000.3500' },
    { id: 'calfresh', name: 'CalFresh (formerly Food Stamps)', taxonomyCode: 'NL-6000.2000' },
    { id: 'medicaid', name: 'Medicaid', taxonomyCode: 'NL-5000.5000' },
    { id: 'wic', name: 'Women, Infants, & Children', taxonomyCode: 'NL-6000.9500' },
    { id: 'medicare', name: 'Medicare', taxonomyCode: 'NS-8000.5000' },
    { id: 'credit-counseling', name: 'Credit Counseling', taxonomyCode: 'DM-1500.1500' },
    { id: 'vita-programs', name: 'VITA Programs', taxonomyCode: 'DT-8800.9300' },
    { id: 'utility-payment', name: 'Utility Payment Assistance', taxonomyCode: 'BV-8900.9300' },
    { id: 'pet-checkups', name: 'Low-Cost Veterinary Care', taxonomyCode: 'PD-9000.9700' }
  ],
  'legal-assistance': [
    { id: 'legal-assistance', name: 'Legal Assistance', taxonomyCode: 'FT' },
    { id: 'traffic-courts', name: 'Traffic Courts', taxonomyCode: 'FC-8200.8100-900' },
    { id: 'veterans-courts', name: 'Veterans Courts', taxonomyCode: 'FC-8200.8100-920' },
    { id: 'general-legal-aid', name: 'General Legal Aid', taxonomyCode: 'FT-3200' },
    { id: 'lawyers-referral', name: 'Lawyers Referral Services', taxonomyCode: 'FT-4800' },
    { id: 'immigration-legal', name: 'Immigration/ Naturalization Legal Services', taxonomyCode: 'FT-3600' },
    { id: 'immigration-adjudication', name: 'Immigration/ Naturalization Adjudication Services', taxonomyCode: 'FT-3550' },
    { id: 'birth-certificates', name: 'Birth Certificates', taxonomyCode: 'DF-7000.1200' },
    { id: 'business-registration', name: 'Business Registration/Licensing', taxonomyCode: 'DF-4500.1000' },
    { id: 'court-records', name: 'Court Records', taxonomyCode: 'DF-7000.1550' },
    { id: 'death-certificates', name: 'Death Certificates', taxonomyCode: 'DF-7000.1700-300' },
    { id: 'divorce-records', name: 'Divorce Records', taxonomyCode: 'DF-7000.1800' },
    { id: 'identification-cards', name: 'Identification Cards', taxonomyCode: 'DF-7000.3300' },
    { id: 'marriage-certificates', name: 'Marriage Certificates', taxonomyCode: 'DF-7000.4950' },
    { id: 'land-records', name: 'Land Records', taxonomyCode: 'DF-7000.4550' },
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
  'transportation': [
    { id: 'transportation', name: 'Transportation', taxonomyCode: 'BT-4500' },
    { id: 'bus-services', name: 'Bus Services', taxonomyCode: 'BT-4500.4700' },
    { id: 'travel-directions', name: 'Travel Directions/Trip Planning', taxonomyCode: 'BT-8750.8600' },
    { id: 'rail-transportation', name: 'Rail Transportation', taxonomyCode: 'BT-4800.7000' },
    { id: 'disability-transportation', name: 'Disability Related Transportation', taxonomyCode: 'BT-4500.6500-170' },
    { id: 'medical-transportation', name: 'Medical Transportation', taxonomyCode: 'LD-1500' },
    { id: 'senior-ride-programs', name: 'Senior Ride Programs', taxonomyCode: 'BT-4500.6500-800' },
    { id: 'paratransit', name: 'General Paratransit/Community Ride Programs', taxonomyCode: 'BT-4500.6500-280' },
    { id: 'parking-permits', name: 'Parking Permits People With Disabilities/Health Conditions', taxonomyCode: 'DF-7000.6550' }
  ],
  'healthcare': [
    { id: 'healthcare', name: 'Health Care', taxonomyCode: 'LN' },
    { id: 'clinics-urgent-care', name: 'Clinics & Urgent Care', taxonomyCode: 'LN' },
    { id: 'hospitals', name: 'Hospitals', taxonomyCode: 'LL-3000' },
    //{ id: 'psychiatric-hospitals', name: 'Psychiatric hospitals', taxonomyCode: 'RM-3300.6500' },
    //{ id: 'aca-counseling', name: 'Affordable Care Act Information & Counseling', taxonomyCode: 'LH-3500.0200' },
    { id: 'medicaid', name: 'Medicaid', taxonomyCode: 'NL-5000.5000' },
    { id: 'medicare', name: 'Medicare', taxonomyCode: 'NS-8000.5000' },
    { id: 'patient-rights', name: 'Patient Rights Assistance', taxonomyCode: 'FT-6200' },
    { id: 'prescription-assistance', name: 'Prescription Drug Patient Assistance Programs', taxonomyCode: 'LH-6700.6300' },
    { id: 'cancer-clinics', name: 'Cancer Clinics', taxonomyCode: 'LT-1750.1500' },
    { id: 'eye-screening', name: 'Eye Screening', taxonomyCode: 'LF-4900.2000' },
    //{ id: 'general-dentistry', name: 'General Dentistry', taxonomyCode: 'LV-1600.2400' },
    { id: 'physical-examinations', name: 'General Physical Examinations', taxonomyCode: 'LF-7100.2500' },
    { id: 'hearing-screening', name: 'Hearing Screening', taxonomyCode: 'LF-4900.2150' },
    { id: 'immunizations', name: 'Immunizations', taxonomyCode: 'LT-3400' },
    { id: 'mammograms', name: 'Mammograms', taxonomyCode: 'LF-4900.1500-500' },
    //{ id: 'newborn-care', name: 'Newborn Care', taxonomyCode: 'YB-9500.6000' },
    { id: 'physical-therapy', name: 'Physical Therapy', taxonomyCode: 'LR-6600' },
    { id: 'postpartum-depression', name: 'Postpartum Depression', taxonomyCode: 'RP-1400.8000-655' },
    //{ id: 'tattoo-removal', name: 'Tattoo Removal', taxonomyCode: 'LT-8500' },
    { id: 'abortion-services', name: 'Abortion Services', taxonomyCode: 'LJ-2000.0100' },
    { id: 'birth-control', name: 'Birth Control', taxonomyCode: 'LJ-2000.1000' },
    { id: 'reproductive-health', name: 'General Sexuality/Reproductive Health Education', taxonomyCode: 'LJ-8000.2500' },
    { id: 'pregnancy-testing', name: 'Pregnancy Testing', taxonomyCode: 'LJ-2000.6750' },
    { id: 'sti-screening', name: 'Sexually Transmitted Infection Screening', taxonomyCode: 'LF-4900.8000' },
    { id: 'teen-pregnancy-prevention', name: 'Teen Pregnancy Prevention', taxonomyCode: 'LJ-8000.8500' },
    { id: 'prenatal-care', name: 'Prenatal Care', taxonomyCode: 'LJ-5000.6600' }
  ],
  'mental-wellness': [
    { id: 'mental-wellness', name: 'Mental Wellness', taxonomyCode: 'RP-1400' },
    { id: 'adoption-counseling', name: 'Adoption Counseling and Support', taxonomyCode: 'PH-0300.0300' },
    { id: 'bereavement-grief', name: 'Bereavement and Grief Counseling', taxonomyCode: 'RP-1400.8000-100' },
    { id: 'child-abuse-counseling', name: 'Child Abuse Counseling', taxonomyCode: 'RP-1400.8000-020.15' },
    { id: 'divorce-counseling', name: 'Divorce Counseling', taxonomyCode: 'RP-1400.8000-175' },
    { id: 'dv-support-groups', name: 'Domestic Violence Support Groups', taxonomyCode: 'PN-8100.0200-180' },
    { id: 'general-counseling', name: 'General', taxonomyCode: 'RP-1400.2500' },
    { id: 'geriatric-counseling', name: 'Geriatric Counseling', taxonomyCode: 'RP-1400.8000-270' },
    { id: 'health-disability-counseling', name: 'Health/Disability Related', taxonomyCode: 'PN-8100.3000' },
    { id: 'human-trafficking', name: 'Human Trafficking Counseling', taxonomyCode: 'RP-1400.8000-327' },
    { id: 'lgbtq-centers', name: 'LGBTQ2+ Community Centers', taxonomyCode: 'TC-5500.4000' },
    { id: 'marriage-counseling', name: 'Marriage Counseling', taxonomyCode: 'RP-1400.8000-500' },
    { id: 'parent-child-therapy', name: 'Parent Child Interactive Therapy', taxonomyCode: 'RP-1400.8000-645' },
    { id: 'postpartum-depression', name: 'Postpartum Depression', taxonomyCode: 'RP-1400.8000-655' },
    { id: 'sexual-assault-counseling', name: 'Sexual Assault', taxonomyCode: 'LT-1750.7935' },
    { id: 'suicide-counseling', name: 'Suicide Counseling', taxonomyCode: 'RP-1400.8000-825' },
    { id: 'youth-counseling', name: 'Adolescent/Youth Counseling', taxonomyCode: 'RP-1400.8000-050' },
    { id: 'domestic-violence-hotlines', name: 'Domestic Violence Hotlines', taxonomyCode: 'RP-1500.1400-200' },
    { id: 'general-crisis-intervention-hotlines', name: 'General Crisis Intervention Hotlines', taxonomyCode: 'RP-1500.1400-250' },
    { id: 'lgbtq2-helplines', name: 'LGBTQ2+ Helplines', taxonomyCode: 'RP-1500.1400-400' },
    { id: 'psychiatric-response-hotline', name: 'Psychiatric Response Hotline', taxonomyCode: 'RP-1500.3400-650' },
    { id: 'sexual-assault-hotlines', name: 'Sexual Assault Hotlines', taxonomyCode: 'RP-1500.1400-750' },
  ],
  'substance-use': [
    { id: 'substance-use', name: 'Substance Use', taxonomyCode: 'RX-8250' },
    { id: 'alcohol-detox', name: 'Alcohol Detox', taxonomyCode: 'RX-1700.0500' },
    { id: 'alcohol-support-groups', name: 'Alcohol Support Groups', taxonomyCode: 'PN-8100.0500-070' },
    { id: 'alcoholism-counseling', name: 'Alcoholism Counseling', taxonomyCode: 'RX-8450.8000-050' },
    { id: 'sober-living', name: 'Sober Living Homes', taxonomyCode: 'RX-8500.8000' },
    { id: 'drug-detox', name: 'Drug Detoxification', taxonomyCode: 'RX-1700.1700' },
    { id: 'drug-counseling', name: 'Drug Abuse Counseling', taxonomyCode: 'RX-8450.8000-180' },
    { id: 'drug-support-groups', name: 'Drug Support Groups', taxonomyCode: 'PN-8100.0500-180' },
    { id: 'smoking-prevention', name: 'Smoking Prevention', taxonomyCode: 'RX-8450.7900' },
    { id: 'sober-living-drug', name: 'Sober Living Homes for Recovering Drug Abusers', taxonomyCode: 'RX-8450.3300-350' },
    { id: 'alcohol-education', name: 'Alcohol Abuse Education & Prevention', taxonomyCode: 'RX-8250.0500' },
    { id: 'drug-alcohol-testing', name: 'Drug & Alcohol Testing', taxonomyCode: 'RX-0400.1850' }
  ],
  'children-family': [
    { id: 'children-family', name: 'Children & Family', taxonomyCode: 'PH' },
    { id: 'family-law-courts', name: 'Family Law Courts', taxonomyCode: 'FC-8200.8100-200' },
    { id: 'child-custody', name: 'Child Custody', taxonomyCode: 'FT-3000.1500' },
    { id: 'child-support', name: 'Child Support', taxonomyCode: 'FT-3000.1600' },
    //{ id: 'foster-care-legal', name: 'Foster Care Legal Services', taxonomyCode: 'FT-3000.2100' },
    { id: 'child-abuse-prevention', name: 'Child Abuse Prevention', taxonomyCode: 'FN-1500.1900-150' },
    { id: 'child-abuse-reporting', name: 'Child Abuse Reporting', taxonomyCode: 'PH-6500.1500-140' },
    { id: 'safe-surrender', name: 'Safe Surrender for Newborns', taxonomyCode: 'LJ-5000.8000' },
    { id: 'childcare-referrals', name: 'Child Care Provider Referrals', taxonomyCode: 'PH-2400.1500' },
    { id: 'head-start', name: 'Head Start', taxonomyCode: 'HD-1800.3000' },
    { id: 'breastfeeding-support', name: 'Breastfeeding Support Programs', taxonomyCode: 'LJ-5000.1000' },
    { id: 'new-parent-programs', name: 'Expecting & New Parent Programs', taxonomyCode: 'PH-6100.1800' },
    { id: 'recreation', name: 'Recreation', taxonomyCode: 'PL-7000.4360' },
    { id: 'computer-literacy', name: 'Computer Literacy Training Programs', taxonomyCode: 'PL-7400.1500' },
    { id: 'family-support-centers', name: 'Family Support Centers', taxonomyCode: 'PH-2360.2400' }
  ],
  'young-adults': [
    { id: 'young-adults', name: 'Young Adults', taxonomyCode: 'PS-9800' },
    { id: 'dropout-prevention', name: 'Drop Out Prevention', taxonomyCode: 'HH-1600.1600' },
    { id: 'gang-prevention', name: 'Gang Prevention', taxonomyCode: 'FN-2300' },
    { id: 'violence-prevention', name: 'Youth Violence Prevention', taxonomyCode: 'FN-1500.9700' },
    { id: 'mentoring', name: 'Child & Youth Mentoring Programs', taxonomyCode: 'PH-1400.5000-100' },
    { id: 'fitness-education', name: 'Physical Activity and Fitness Education', taxonomyCode: 'LH-2700.6450' },
    { id: 'recreational-clubs', name: 'Recreational Clubs', taxonomyCode: 'PL-6400.6750' },
    { id: 'youth-development', name: 'Youth Development', taxonomyCode: 'PS-9800' },
    { id: 'teen-pregnancy-prevention', name: 'Teen Pregnancy Prevention', taxonomyCode: 'LJ-8000.8500' }
  ],
  'education': [
    { id: 'education', name: 'Education', taxonomyCode: 'HD-1800.8000' },
    //{ id: 'adult-literacy', name: 'Adult Literacy and Basic Education', taxonomyCode: 'HD-0100.0200' },
    { id: 'computer-literacy', name: 'Computer Literacy Training Programs', taxonomyCode: 'PL-7400.1500' },
    // { id: 'career-counseling', name: 'Career Counseling', taxonomyCode: 'HH-1000.1400' },
    { id: 'financial-literacy', name: 'Financial Literacy', taxonomyCode: 'NL-1000.2100' },
    { id: 'esl', name: 'English as a Second Language', taxonomyCode: 'HL-2000.0550' },
    { id: 'technical-schools', name: 'Technical/Trade Schools', taxonomyCode: 'HD-6000.9000' },
    { id: 'parent-involvement', name: 'Parent/Family Involvement in Education', taxonomyCode: 'HL-3010.6500' },
    { id: 'school-readiness', name: 'School Readiness Programs', taxonomyCode: 'HD-1800.8000' },
    { id: 'financial-aid', name: 'Student Financial Aid', taxonomyCode: 'HL-8000' },
    { id: 'tutoring', name: 'Tutoring', taxonomyCode: 'HL-8700' }
  ],
  'utilities': [
    { id: 'utilities', name: 'Utilities', taxonomyCode: 'BV' },
    { id: 'electric-payment', name: 'Electric Service Payment Assistance', taxonomyCode: 'BV-8900.9300-180' },
    { id: 'gas-payment', name: 'Gas Service Payment Assistance', taxonomyCode: 'BV-8900.9300-250' },
    { id: 'internet-provider', name: 'Internet Provider', taxonomyCode: 'BV-9000.3300' },
    { id: 'utility-payment', name: 'Utility Payment Assistance', taxonomyCode: 'BV-8900.9300' },
    { id: 'energy-efficient', name: 'Energy Efficient Home Improvement Assistance', taxonomyCode: 'BV-8900.9300-180' }
  ],
  'food': [
    { id: 'food', name: 'Food', taxonomyCode: 'BD-5000' },
    { id: 'meals', name: 'Hot Meals', taxonomyCode: 'BD-5000' },
    { id: 'food-pantries', name: 'Food Pantries', taxonomyCode: 'BD-1800.2000' },
    { id: 'calfresh', name: 'CalFresh (Food Stamps)', taxonomyCode: 'NL-6000.2000' },
    { id: 'wic', name: 'Women, Infants, & Children (WIC)', taxonomyCode: 'NL-6000.9500' },
    { id: 'senior-nutrition', name: 'Senior Nutrition Programs', taxonomyCode: 'BD-5000.8000' },
    { id: 'school-meals', name: 'School Meal Programs', taxonomyCode: 'BD-1800.7500' },
    { id: 'emergency-food', name: 'Emergency Food Assistance', taxonomyCode: 'BD-1800.2000' },
    { id: 'home-delivery-meals', name: 'Home Delivery Meals', taxonomyCode: 'BD-5000.3500' },
    { id: 'pet-food', name: 'Pet Food', taxonomyCode: 'PD-6250.6600' }
  ],
  'hygiene-household': [
    { id: 'hygiene-household', name: 'Hygiene & Household', taxonomyCode: 'BM' },
    { id: 'disaster-related', name: 'Disaster Related Clothing & Emergency Supplies', taxonomyCode: 'TH-2600.1550' },
    { id: 'grooming-supplies', name: 'Grooming Supplies', taxonomyCode: 'TI-1800.6700' },
    { id: 'household-hazardous-materials', name: 'Household Hazardous Materials Information', taxonomyCode: 'JR-8200.3000-300' },
    { id: 'animal-control', name: 'Animal Control', taxonomyCode: 'PD-0700.0400' }
  ]
} as const;

/**
 * Get the official taxonomy code for a main category with proper error handling
 */
export function getSubcategoriesForCategory(categoryId: string) {
  const normalized = categoryId.toLowerCase().trim();
  if (normalized in SUBCATEGORIES) {
    return SUBCATEGORIES[normalized as keyof typeof SUBCATEGORIES];
  }
  return [];
}


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

  // Ensure lowercase for consistent lookups
  const normalizedCategoryId = categoryId.toLowerCase().trim();
  const normalizedSubcategoryId = subcategoryId.toLowerCase().trim();

  const subcategoriesForCategory = SUBCATEGORIES[normalizedCategoryId as keyof typeof SUBCATEGORIES];
  if (!subcategoriesForCategory) {
    console.warn(`[Taxonomy] No subcategories found for categoryId="${categoryId}" (normalized: "${normalizedCategoryId}")`);
    console.warn(`[Taxonomy] Available categories: ${Object.keys(SUBCATEGORIES).join(', ')}`);
    return null;
  }

  const subcategory = subcategoriesForCategory.find(sub => sub.id === normalizedSubcategoryId);
  if (!subcategory) {
    console.warn(`[Taxonomy] No subcategory mapping found for subcategoryId="${subcategoryId}" in category="${categoryId}"`);
    console.warn(`[Taxonomy] Available subcategories in "${categoryId}": ${subcategoriesForCategory.map(sub => sub.id).join(', ')}`);
    return null;
  }

  console.log(`[Taxonomy] ✅ Mapped subcategoryId "${subcategoryId}" in category "${categoryId}" → taxonomy code "${subcategory.taxonomyCode}"`);
  return subcategory.taxonomyCode;
}