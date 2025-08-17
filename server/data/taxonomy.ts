// Taxonomy data from Santa Barbara 211 for accurate API calls
export interface TaxonomyMapping {
  id: string;
  name: string;
  taxonomyCode: string;
  subcategories?: SubcategoryMapping[];
}

export interface SubcategoryMapping {
  id: string;
  name: string;
  taxonomyCode: string;
}

// Main category taxonomy codes
export const CATEGORY_TAXONOMY: Record<string, TaxonomyMapping> = {
  housing: {
    id: 'housing',
    name: 'Housing',
    taxonomyCode: 'BH-1800',
    subcategories: [
      { id: 'domestic-violence-shelters', name: 'Domestic Violence Shelters', taxonomyCode: 'BH-1800.1500-100' },
      { id: 'homeless-shelters', name: 'Homeless Shelters', taxonomyCode: 'BH-1800.8500' },
      { id: 'maternity-homes', name: 'Maternity Homes', taxonomyCode: 'LJ-5000.5000' },
      { id: 'senior-housing', name: 'Senior Housing', taxonomyCode: 'BH-8500.8000' },
      { id: 'sexual-assault-shelters', name: 'Sexual Assault Shelters', taxonomyCode: 'BH-1800.1500-800' },
      { id: 'supervised-living-youth', name: 'Supervised Living for Older Youth', taxonomyCode: 'PH-6300.8000' },
      { id: 'youth-shelters', name: 'Youth Shelters', taxonomyCode: 'BH-1800.1500-960' },
      { id: 'appliances', name: 'Appliances', taxonomyCode: 'BM-3000.0500' },
      { id: 'clothing', name: 'Clothing', taxonomyCode: 'BM-6500.1500' },
      { id: 'furniture', name: 'Furniture', taxonomyCode: 'BM-3000.2000' },
      { id: 'home-maintenance', name: 'Home Maintenance & Minor Repair Services', taxonomyCode: 'PH-3300.2750' },
      { id: 'utility-payment-assistance', name: 'Utility Payment Assistance', taxonomyCode: 'BV-8900.9300' },
      { id: 'energy-efficient-improvement', name: 'Energy Efficient Home Improvement Assistance', taxonomyCode: 'NL-6000.9500' },
      { id: 'housing-discrimination', name: 'Housing Discrimination', taxonomyCode: 'FT-1800.3000' },
      { id: 'low-income-rental', name: 'Low Income Rental Housing', taxonomyCode: 'BH-7000.4600' },
      { id: 'rent-payment-assistance', name: 'Rent Payment Assistance', taxonomyCode: 'BH-3800.7000' },
      { id: 'section-8-voucher', name: 'Section 8 Voucher / Housing Authority', taxonomyCode: 'BH-8300.3000' },
      { id: 'bathing-facilities', name: 'Bathing Facilities', taxonomyCode: 'BH-1800.3500' },
      { id: 'temporary-mailing', name: 'Temporary Mailing Address', taxonomyCode: 'BM-6500.6500-850' },
      { id: 'meals', name: 'Meals', taxonomyCode: 'BD-5000' },
      { id: 'animal-shelters', name: 'Animal Shelters', taxonomyCode: 'PD-7600.0600' },
      { id: 'animal-licenses', name: 'Animal Licenses', taxonomyCode: 'PD-0700.0600' }
    ]
  },
  
  'finance-employment': {
    id: 'finance-employment',
    name: 'Finance & Employment',
    taxonomyCode: 'NL-1000',
    subcategories: [
      { id: 'career-counseling', name: 'Career Counseling', taxonomyCode: 'HL-2500.8035' },
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
      { id: 'pet-checkups', name: 'Well Animal Checkups', taxonomyCode: 'PD-9000.9700' },
      { id: 'pet-food', name: 'Pet Food', taxonomyCode: 'PD-6250.6600' }
    ]
  },

  food: {
    id: 'food',
    name: 'Food',
    taxonomyCode: 'BD-1800.2000',
    subcategories: [
      { id: 'calfresh', name: 'CalFresh (formerly Food Stamps)', taxonomyCode: 'NL-6000.2000' },
      { id: 'groceries', name: 'Groceries', taxonomyCode: 'BD-1800.1000' },
      { id: 'disaster-food', name: 'Post Disaster Food Services', taxonomyCode: 'TH-2600.6450' },
      { id: 'wic', name: 'Women, Infants, & Children', taxonomyCode: 'NL-6000.9500' },
      { id: 'home-delivery-meals', name: 'Home Delivery Meals', taxonomyCode: 'BD-5000.3500' },
      { id: 'meals', name: 'Meals', taxonomyCode: 'BD-5000' },
      { id: 'nutrition-education', name: 'Nutrition Education', taxonomyCode: 'LH-2700.6000' }
    ]
  },

  transportation: {
    id: 'transportation',
    name: 'Transportation',
    taxonomyCode: 'BT-4500',
    subcategories: [
      { id: 'bus-services', name: 'Bus Services', taxonomyCode: 'BT-4500.4700' },
      { id: 'travel-directions', name: 'Travel Directions/Trip Planning', taxonomyCode: 'BT-8750.8600' },
      { id: 'rail-transportation', name: 'Rail Transportation', taxonomyCode: 'BT-4800.7000' },
      { id: 'disability-transportation', name: 'Disability Related Transportation', taxonomyCode: 'BT-4500.6500-170' },
      { id: 'medical-transportation', name: 'Medical Transportation', taxonomyCode: 'LD-1500' },
      { id: 'senior-ride-programs', name: 'Senior Ride Programs', taxonomyCode: 'BT-4500.6500-800' },
      { id: 'paratransit', name: 'General Paratransit/Community Ride Programs', taxonomyCode: 'BT-4500.6500-280' },
      { id: 'parking-permits', name: 'Parking Permits People With Disabilities/Health Conditions', taxonomyCode: 'DF-7000.6550' }
    ]
  },

  healthcare: {
    id: 'healthcare',
    name: 'Health Care',
    taxonomyCode: 'LN',
    subcategories: [
      { id: 'clinics-urgent-care', name: 'Clinics & Urgent Care', taxonomyCode: 'LN' },
      { id: 'hospitals', name: 'Hospitals', taxonomyCode: 'LL-3000' },
      { id: 'psychiatric-hospitals', name: 'Psychiatric hospitals', taxonomyCode: 'RM-3300.6500' },
      { id: 'aca-counseling', name: 'Affordable Care Act Information & Counseling', taxonomyCode: 'LH-3500.0200' },
      { id: 'medicaid', name: 'Medicaid', taxonomyCode: 'NL-5000.5000' },
      { id: 'medicare', name: 'Medicare', taxonomyCode: 'NS-8000.5000' },
      { id: 'patient-rights', name: 'Patient Rights Assistance', taxonomyCode: 'FT-6200' },
      { id: 'prescription-assistance', name: 'Prescription Drug Patient Assistance Programs', taxonomyCode: 'LH-6700.6300' },
      { id: 'cancer-clinics', name: 'Cancer Clinics', taxonomyCode: 'LT-1750.1500' },
      { id: 'eye-screening', name: 'Eye Screening', taxonomyCode: 'LF-4900.2000' },
      { id: 'general-dentistry', name: 'General Dentistry', taxonomyCode: 'LV-1600.2400' },
      { id: 'physical-examinations', name: 'General Physical Examinations', taxonomyCode: 'LF-7100.2500' },
      { id: 'hearing-screening', name: 'Hearing Screening', taxonomyCode: 'LF-4900.2150' },
      { id: 'immunizations', name: 'Immunizations', taxonomyCode: 'LT-3400' },
      { id: 'mammograms', name: 'Mammograms', taxonomyCode: 'LF-4900.1500-500' },
      { id: 'newborn-care', name: 'Newborn Care', taxonomyCode: 'YB-9500.6000' },
      { id: 'physical-therapy', name: 'Physical Therapy', taxonomyCode: 'LR-6600' },
      { id: 'postpartum-depression', name: 'Postpartum Depression', taxonomyCode: 'RP-1400.8000-655' },
      { id: 'tattoo-removal', name: 'Tattoo Removal', taxonomyCode: 'LT-8500' },
      { id: 'abortion-services', name: 'Abortion Services', taxonomyCode: 'LJ-2000.0100' },
      { id: 'birth-control', name: 'Birth Control', taxonomyCode: 'LJ-2000.1000' },
      { id: 'reproductive-health', name: 'General Sexuality/Reproductive Health Education', taxonomyCode: 'LJ-8000.2500' },
      { id: 'pregnancy-testing', name: 'Pregnancy Testing', taxonomyCode: 'LJ-2000.6750' },
      { id: 'sti-screening', name: 'Sexually Transmitted Infection Screening', taxonomyCode: 'LF-4900.8000' },
      { id: 'teen-pregnancy-prevention', name: 'Teen Pregnancy Prevention', taxonomyCode: 'LJ-8000.8500' },
      { id: 'prenatal-care', name: 'Prenatal Care', taxonomyCode: 'LJ-5000.6600' }
    ]
  },

  'mental-wellness': {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    taxonomyCode: 'RP-1400',
    subcategories: [
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
      { id: 'youth-counseling', name: 'Adolescent/Youth Counseling', taxonomyCode: 'RP-1400.8000-050' }
    ]
  },

  'substance-use': {
    id: 'substance-use',
    name: 'Substance Use',
    taxonomyCode: 'RX-8250',
    subcategories: [
      { id: 'alcohol-detox', name: 'Alcohol Detoxification', taxonomyCode: 'RX-1700.0500' },
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
    ]
  },

  'children-family': {
    id: 'children-family',
    name: 'Children & Family',
    taxonomyCode: 'PH',
    subcategories: [
      { id: 'family-law-courts', name: 'Family Law Courts', taxonomyCode: 'FC-8200.8100-200' },
      { id: 'child-custody', name: 'Child Custody', taxonomyCode: 'FT-3000.1500' },
      { id: 'child-support', name: 'Child Support', taxonomyCode: 'FT-3000.1600' },
      { id: 'foster-care-legal', name: 'Foster Care Legal Services', taxonomyCode: 'FT-3000.2100' },
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
    ]
  },

  'young-adults': {
    id: 'young-adults',
    name: 'Young Adults',
    taxonomyCode: 'PS-9800',
    subcategories: [
      { id: 'dropout-prevention', name: 'Drop Out Prevention', taxonomyCode: 'HH-1600.1600' },
      { id: 'gang-prevention', name: 'Gang Prevention', taxonomyCode: 'FN-2300' },
      { id: 'violence-prevention', name: 'Youth Violence Prevention', taxonomyCode: 'FN-1500.9700' },
      { id: 'mentoring', name: 'Child & Youth Mentoring Programs', taxonomyCode: 'PH-1400.5000-100' },
      { id: 'fitness-education', name: 'Physical Activity and Fitness Education', taxonomyCode: 'LH-2700.6450' },
      { id: 'recreational-clubs', name: 'Recreational Clubs', taxonomyCode: 'PL-6400.6750' },
      { id: 'youth-development', name: 'Youth Development', taxonomyCode: 'PS-9800' },
      { id: 'teen-pregnancy-prevention', name: 'Teen Pregnancy Prevention', taxonomyCode: 'LJ-8000.8500' }
    ]
  },

  education: {
    id: 'education',
    name: 'Education',
    taxonomyCode: 'HD-1800.8000',
    subcategories: [
      { id: 'adult-literacy', name: 'Adult Literacy', taxonomyCode: 'HH-4500.0500' },
      { id: 'computer-literacy', name: 'Computer Literacy Training Programs', taxonomyCode: 'PL-7400.1500' },
      { id: 'ged', name: 'GED', taxonomyCode: 'YG-1700.3000' },
      { id: 'esl', name: 'English as a Second Language', taxonomyCode: 'HL-2000.0550' },
      { id: 'technical-schools', name: 'Technical/Trade Schools', taxonomyCode: 'HD-6000.9000' },
      { id: 'parent-involvement', name: 'Parent/Family Involvement in Education', taxonomyCode: 'HL-3010.6500' },
      { id: 'school-readiness', name: 'School Readiness Programs', taxonomyCode: 'HD-1800.8000' },
      { id: 'financial-aid', name: 'Student Financial Aid', taxonomyCode: 'HL-8000' },
      { id: 'tutoring', name: 'Tutoring', taxonomyCode: 'HL-8700' },
      { id: 'citizenship-education', name: 'Citizenship Education', taxonomyCode: 'HH-0500.1500' }
    ]
  },

  'legal-assistance': {
    id: 'legal-assistance',
    name: 'Legal Assistance',
    taxonomyCode: 'FT',
    subcategories: [
      { id: 'criminal-courts', name: 'Criminal State Trial Courts', taxonomyCode: 'FC-8200.1550' },
      { id: 'juvenile-courts', name: 'Juvenile Justice Courts', taxonomyCode: 'FC-8200.3500-350' },
      { id: 'mental-health-courts', name: 'Mental Health Courts', taxonomyCode: 'FC-8200.8100-500' },
      { id: 'small-claims', name: 'Small Claims Courts', taxonomyCode: 'FC-8200.8100-800' },
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
    ]
  },

  utilities: {
    id: 'utilities',
    name: 'Utilities',
    taxonomyCode: 'BV',
    subcategories: [
      { id: 'electric-payment', name: 'Electric Service Payment Assistance', taxonomyCode: 'BV-8900.9300-180' },
      { id: 'gas-payment', name: 'Gas Service Payment Assistance', taxonomyCode: 'BV-8900.9300-250' },
      { id: 'internet-provider', name: 'Internet Provider', taxonomyCode: 'BV-9000.3300' },
      { id: 'utility-payment', name: 'Utility Payment Assistance', taxonomyCode: 'BV-8900.9300' },
      { id: 'energy-efficient', name: 'Energy Efficient Home Improvement Assistance', taxonomyCode: 'BV-8900.9300-180' }
    ]
  }
};

// Helper function to get taxonomy code for a category
export function getCategoryTaxonomyCode(categoryId: string): string {
  const category = CATEGORY_TAXONOMY[categoryId];
  return category?.taxonomyCode || categoryId.toUpperCase();
}

// Import and use official taxonomy codes when available
import { getOfficialCategoryTaxonomyCode, getOfficialSubcategoryTaxonomyCode } from './officialTaxonomy';

export function getOfficialCategoryCode(categoryId: string): string {
  const officialCode = getOfficialCategoryTaxonomyCode(categoryId);
  if (officialCode) return officialCode;
  
  // Fallback to existing system
  return getCategoryTaxonomyCode(categoryId);
}

export function getOfficialSubcategoryCode(categoryId: string, subcategoryId: string): string | null {
  return getOfficialSubcategoryTaxonomyCode(categoryId, subcategoryId);
}

// Helper function to get taxonomy code for a subcategory
export function getSubcategoryTaxonomyCode(categoryId: string, subcategoryId: string): string {
  const category = CATEGORY_TAXONOMY[categoryId];
  if (!category?.subcategories) return '';
  
  const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
  return subcategory?.taxonomyCode || '';
}

// Helper function to get all subcategories for a category
export function getSubcategoriesForCategory(categoryId: string): SubcategoryMapping[] {
  const category = CATEGORY_TAXONOMY[categoryId];
  return category?.subcategories || [];
}