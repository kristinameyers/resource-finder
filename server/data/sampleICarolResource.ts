import { Resource } from "@shared/schema";

/**
 * Sample resource with enhanced iCarol API information
 * This demonstrates the additional fields we can display from the 211 API
 */
export const sampleICarolResource: Resource = {
  id: "sample-icarol-resource-001",
  name: "Family Support Center - Comprehensive Services",
  description: "Provides comprehensive family support services including counseling, case management, emergency assistance, and educational programs. We serve families experiencing crisis, domestic violence survivors, and those needing support with basic needs and life skills development.",
  categoryId: "children-family",
  subcategoryId: "family-support-services",
  location: "Santa Barbara, CA",
  zipCode: "93101",
  url: "https://example-family-center.org",
  phone: "(805) 555-1234",
  email: "info@familycenter.org",
  address: "100 Main Street, Santa Barbara, CA 93101",
  schedules: "Monday-Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 2:00 PM",
  accessibility: "Wheelchair accessible, ASL interpreters available upon request",
  languages: ["English", "Spanish"],
  thumbsUp: 0,
  thumbsDown: 0,
  userVote: null,
  
  // Enhanced iCarol API fields
  applicationProcess: "Call or visit our office to speak with an intake coordinator. Initial assessment will be scheduled within 48 hours. Bring photo ID and proof of income. Emergency services are available 24/7 through our crisis hotline.",
  documents: "Photo identification (driver's license, state ID, or passport), proof of income (pay stubs, benefit letters), proof of residency (utility bill, lease agreement), children's birth certificates or school records if applicable.",
  fees: "Most services are provided at no cost. Some specialized programs may have sliding scale fees based on income. Financial assistance is available for qualifying families.",
  serviceAreas: "Santa Barbara County, including the cities of Santa Barbara, Goleta, Carpinteria, and surrounding unincorporated areas. Some services available countywide.",
  hoursOfOperation: "Monday-Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed\nCrisis Hotline: 24/7",
  phoneNumbers: {
    main: "(805) 555-1234",
    fax: "(805) 555-1235", 
    tty: "(805) 555-1236",
    crisis: "(805) 555-HELP"
  },
  additionalLanguages: ["Mandarin", "Tagalog", "ASL"]
};