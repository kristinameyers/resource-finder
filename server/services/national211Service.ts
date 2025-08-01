import fetch from 'node-fetch';
import { Resource } from '../../shared/schema';
import { getCategoryTaxonomyCode, getSubcategoryTaxonomyCode } from '../data/taxonomy';

// Define interfaces for the 211 API responses
interface National211Resource {
  // Add proper typing based on the actual API response
  id: string;
  taxonomy_code?: string;
  taxonomy_name?: string;
  name: string;
  description?: string;
  service_area?: {
    zip_codes?: string[];
  };
  location?: {
    name?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    address_1?: string;
    address_2?: string;
    city?: string;
    state_province?: string;
  };
  phone?: {
    number?: string;
    description?: string;
  }[];
  url?: string;
  email?: string;
  schedule?: {
    days_of_week?: string[];
    opens_at?: string;
    closes_at?: string;
    description?: string;
  }[];
  accessibility?: string[];
  languages?: string[];
}

interface SearchResourcesResponse {
  resources: National211Resource[];
  total: number;
  // Include other fields returned by the API
}

// Using the correct 211 API endpoint structure 
const API_BASE_URL = "https://api.211.org/resources/v2/search/keyword";  // Back to keyword endpoint
const QUERY_API_BASE_URL = "https://api.211.org/resources/v2/query";

// Get API key from environment variables  
const SUBSCRIPTION_KEY = '535f3ff3321744c79fd85f4110b09545'; // Use your latest API key directly

console.log('211 API V2 configuration set up');
console.log(`API URL: ${API_BASE_URL}`);
console.log('Using API key authentication with Api-Key header');
console.log(`API Key: ${SUBSCRIPTION_KEY.substring(0, 8)}...${SUBSCRIPTION_KEY.substring(SUBSCRIPTION_KEY.length - 8)}`);

/**
 * Searches for resources by keyword (fallback for compatibility)
 */
export async function searchResourcesByKeyword(
  keyword: string,
  zipCode?: string,
  latitude?: number,
  longitude?: number
): Promise<Resource[]> {
  try {
    console.log(`Searching for resources with keyword: ${keyword}`);
    
    // Use POST method with JSON body based on API requirements
    const postBody: any = {
      search: keyword,
      input: keyword,
      locationMode: 'Serving',
      distance: 25,
      location: zipCode || '90210' // Default location if none provided (API requires this)
    };
    
    if (latitude !== undefined && longitude !== undefined) {
      postBody.longitude_latitude = `lon:${longitude}_lat:${latitude}`;
      delete postBody.location; // Use coordinates instead of location
    }
    
    console.log(`Making 211 API keyword request with POST method`);
    console.log(`Request body:`, JSON.stringify(postBody));
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Api-Key': SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`211 API Error: ${response.status} ${errorText}`);
      throw new Error(`211 API Error: ${response.status} - ${errorText}`);
    }
    
    const data: any = await response.json();
    console.log(`API response received with ${data.results?.length || 0} resources`);
    
    if (!data.results || data.results.length === 0) {
      return [];
    }
    
    return data.results.map(transformResource);
  } catch (error) {
    console.error('Error searching resources by keyword:', error);
    throw error;
  }
}

/**
 * Searches for resources by taxonomy code (primary method)
 */
export async function searchResourcesByTaxonomyCode(
  taxonomyCode: string,
  zipCode?: string,
  latitude?: number,
  longitude?: number,
  limit: number = 20,
  offset: number = 0
): Promise<{ resources: Resource[], total: number }> {
  try {
    console.log(`Searching for resources with taxonomy code: ${taxonomyCode}`);
    
    // Use taxonomy codes directly as per the API documentation
    // The API supports searching by taxonomy codes with keywordIsTaxonomyCode=true
    // First try with taxonomy code, then fall back to keyword search if needed
    const searchTerm = taxonomyCode;
    
    // Build query parameters (only keywords and location go in query string)
    let queryParams = [
      `keywords=${encodeURIComponent(searchTerm)}`, // Use taxonomy code
    ];
    
    // Add location as query parameter if provided
    if (zipCode) {
      queryParams.push(`location=${zipCode}`);
    } else if (latitude !== undefined && longitude !== undefined) {
      // Use the correct longitude_latitude format: lon:-119.293106_lat:34.28083
      queryParams.push(`location=lon:${longitude}_lat:${latitude}`);
    }
    
    // Join the parameters with &
    const queryString = queryParams.join('&');
    
    // Use the correct V2 API endpoint structure (with /keyword path)
    const requestUrl = `${API_BASE_URL}/keyword?${queryString}`;
    console.log(`Making 211 API V2 request to: ${requestUrl}`);
    
    // Set headers with subscription key and search configuration
    // According to OpenAPI 3.0.1 docs, these parameters go in headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Api-Key': SUBSCRIPTION_KEY, // Use Api-Key header (this worked before)
      'Cache-Control': 'no-cache',
      'keywordIsTaxonomyCode': 'true', // Enable taxonomy code search
      'searchMode': 'All' // Use 'All' for exact matches
    };
    
    // Add location mode and distance headers if location is provided
    if (zipCode || (latitude !== undefined && longitude !== undefined)) {
      headers['locationMode'] = 'Serving'; // Use Serving for both zip codes and coordinates
      headers['distance'] = '25'; // Search radius in miles
    }
    
    console.log('Sending request with headers:', JSON.stringify(headers));
    
    try {
      // Try GET method first with minimal headers
      const minimalHeaders: HeadersInit = {
        'Accept': 'application/json',
        'Api-Key': SUBSCRIPTION_KEY, // Use Api-Key header (this worked before)
        'Cache-Control': 'no-cache'
      };
      
      console.log('Trying GET method with minimal headers first...');
      let response = await fetch(requestUrl, {
        method: 'GET',
        headers: minimalHeaders
      });
      
      // If GET fails, try POST with JSON body (keeping taxonomy code approach)
      if (!response.ok) {
        console.log('GET failed, trying POST method with JSON body...');
        
        // Build POST body with correct API structure
        // Using taxonomy code directly as search term
        const postBody: any = {
          search: taxonomyCode,
          input: taxonomyCode, // Required field based on validation error
          keywordIsTaxonomyCode: true,
          skip: 0,
          size: 20,
          includeTotalCount: true
        };
        
        if (zipCode) {
          postBody.location = zipCode;
          postBody.distance = 25;
          postBody.locationMode = 'Serving';
        } else if (latitude !== undefined && longitude !== undefined) {
          postBody.location = `lon:${longitude}_lat:${latitude}`;
          postBody.distance = 25;
          postBody.locationMode = 'Near';
        } else {
          // Provide default location if none specified
          postBody.location = 'United States';
          postBody.distance = 5000;
          postBody.locationMode = 'Serving';
        }
        
        // Add headers for taxonomy code search
        const postHeaders = {
          'Accept': 'application/json',
          'Api-Key': SUBSCRIPTION_KEY,
          'Content-Type': 'application/json',
          'keywordIsTaxonomyCode': 'true',
          'searchMode': 'All'
        };

        console.log('Trying POST method with JSON body:', JSON.stringify(postBody));
        
        response = await fetch(`${API_BASE_URL}`, {
          method: 'POST',
          headers: postHeaders,
          body: JSON.stringify(postBody)
        });
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`211 API Error: ${response.status}`, errorText);
        throw new Error(`211 API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json() as SearchResourcesResponse;
      console.log(`Received ${data.resources?.length || 0} resources from 211 API`);
      
      // Transform the 211 resource format to our app's resource format
      const transformedResources = data.resources?.map(transformResource) || [];
      
      return {
        resources: transformedResources,
        total: data.total || transformedResources.length,
      };
    } catch (apiError) {
      console.error('API Integration Error:', apiError);
      console.log('API request failed, returning empty result for now');
      
      // Return empty results when API fails - this allows for better debugging
      return {
        resources: [],
        total: 0
      };
    }
  } catch (error) {
    console.error('Error searching resources by taxonomy:', error);
    throw error;
  }
}

/**
 * Fetches detailed resource information using the Query V2 API
 */
async function getDetailedResourceInfo(organizationId: string): Promise<any | null> {
  try {
    console.log(`Fetching detailed services for organization ID: ${organizationId}`);
    
    const requestUrl = `${QUERY_API_BASE_URL}/services-for-organization/${organizationId}`;
    console.log(`Making Query API V2 request to: ${requestUrl}`);
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Api-Key': SUBSCRIPTION_KEY
    };
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      console.log(`Query API returned ${response.status}: ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return null;
    }
    
    const detailedData = await response.json() as any;
    console.log('Services API response type:', Array.isArray(detailedData) ? 'array' : typeof detailedData);
    console.log('Services count:', Array.isArray(detailedData) ? detailedData.length : 'not an array');
    
    if (Array.isArray(detailedData) && detailedData.length > 0) {
      const firstService = detailedData[0];
      console.log('First service keys:', Object.keys(firstService));
      console.log('Service has phones:', !!firstService.phones);
      console.log('Service has schedules:', !!firstService.schedules);
      console.log('Service has applicationProcess:', !!firstService.applicationProcess);
      console.log('Service has eligibility:', !!firstService.eligibility);
      console.log('Service has fees:', !!firstService.fees);
      return firstService;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching detailed resource info:', error);
    return null;
  }
}

/**
 * Fetches a resource by ID
 */
export async function getResourceById(id: string): Promise<Resource | null> {
  try {
    console.log(`Fetching resource with ID: ${id}`);
    
    // Use the V2 API base URL for resource detail lookup
    const requestUrl = `${API_BASE_URL}/detail?id=${id}`;
    console.log(`Making 211 API V2 request to: ${requestUrl} for resource ${id}`);
    
    // Set headers with subscription key
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
    };
    
    console.log('Sending detail request with headers:', JSON.stringify(headers));
    
    // Make the API request as a GET
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Resource with ID ${id} not found in 211 API`);
        return null;
      }
      const errorText = await response.text();
      console.error(`211 API Error fetching resource: ${response.status}`, errorText);
      throw new Error(`211 API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as any;
    console.log(`Successfully retrieved resource "${data.name || data.nameService}" from 211 API`);
    
    // Try to get detailed information for enhanced display using organization ID
    const organizationId = data.idOrganization || data.id;
    const detailedInfo = await getDetailedResourceInfo(organizationId);
    const enhancedData = detailedInfo ? { ...data, detailedService: detailedInfo } : data;
    
    return transformResource(enhancedData);
  } catch (error) {
    console.error('Error fetching resource by ID:', error);
    throw error;
  }
}

// Mapping of taxonomy codes to our category IDs
const taxonomyToCategory: { [key: string]: string } = {
  'BH': 'housing',
  'N': 'finance-employment',
  'BD': 'food',
  'BT': 'transportation',
  'L': 'healthcare',
  'BM-3000': 'hygiene-household',
  'RR': 'mental-wellness',
  'RX': 'substance-use',
  'P': 'children-family',
  'YB-9000': 'young-adults',
  'H': 'education',
  'YB-8000': 'seniors-caregivers',
  'F': 'legal-assistance',
  'BV': 'utilities',
};

/**
 * Maps a 211 taxonomy code to our app's category ID
 */
function getCategoryIdFromTaxonomy(taxonomyCode?: string): string {
  if (!taxonomyCode) return '';
  
  // First check exact match
  if (taxonomyToCategory[taxonomyCode]) {
    return taxonomyToCategory[taxonomyCode];
  }
  
  // Then check for parent code match (e.g., if BD-1000, check for BD)
  const parentCode = taxonomyCode.split('-')[0];
  if (taxonomyToCategory[parentCode]) {
    return taxonomyToCategory[parentCode];
  }
  
  // Default to the first part of the taxonomy code
  return parentCode.toLowerCase();
}

/**
 * Transforms a 211 resource into our application's resource format
 */
function transformResource(apiResource: any): Resource {
  // Debug: Log the full API resource structure to understand available fields (limited output)
  console.log('API Resource keys:', Object.keys(apiResource));
  
  const address = apiResource.address || {};
  const taxonomy = apiResource.taxonomy?.[0] || {};
  const detailedService = apiResource.detailedService || {};
  
  console.log('Enhanced service data available:', !!detailedService && Object.keys(detailedService).length > 0);
  if (detailedService && Object.keys(detailedService).length > 0) {
    console.log('Detailed service fields:', Object.keys(detailedService));
    console.log('Has phones:', !!detailedService.phones);
    console.log('Has eligibility:', !!detailedService.eligibility);
    console.log('Has applicationProcess:', !!detailedService.applicationProcess);
    console.log('Has schedules:', !!detailedService.schedules);
  }
  
  // Clean HTML from description
  const cleanDescription = (apiResource.descriptionService || apiResource.description || 'No description available')
    .replace(/<[^>]*>/g, '').trim();
  
  // Map taxonomy code to category ID
  const categoryId = getCategoryIdFromTaxonomy(taxonomy.taxonomyCode);
  console.log(`Mapping taxonomy code ${taxonomy.taxonomyCode} to category ID ${categoryId}`);
  
  // Extract additional iCarol API fields based on actual API structure
  console.log('Available API fields:', Object.keys(apiResource));
  
  // Check for phone numbers in both detailed service and base resource
  const phones = detailedService.phones || apiResource.phones || [];
  const phoneNumbers = phones.length > 0 ? {
    main: phones.find((p: any) => p.isMain || p.type === 'Main')?.number || phones[0]?.number,
    fax: phones.find((p: any) => p.type === 'Fax')?.number,
    tty: phones.find((p: any) => p.type === 'TTY')?.number,
    crisis: phones.find((p: any) => p.type === 'Crisis')?.number,
  } : undefined;

  // Extract hours of operation with proper formatting
  const hoursOfOperation = apiResource.schedules?.map((schedule: any) => {
    const days = schedule.daysOfWeek || schedule.opensAt ? 
      `${schedule.daysOfWeek || 'Monday-Friday'}: ${schedule.opensAt || '9am'}-${schedule.closesAt || '5pm'}` :
      schedule.description;
    return days;
  }).join('\n');
  
  // Debug: Check for specific iCarol fields
  console.log('Checking for key fields:');
  console.log('- phones/contacts:', !!apiResource.phones || !!apiResource.contacts);
  console.log('- eligibility:', !!apiResource.eligibility);
  console.log('- serviceAreas:', !!apiResource.serviceAreas);
  console.log('- schedules:', !!apiResource.schedules);
  console.log('- languages:', !!apiResource.languages);

  // Create the transformed resource
  return {
    id: apiResource.idServiceAtLocation || apiResource.id,
    name: apiResource.nameService || apiResource.nameServiceAtLocation || apiResource.name || 'Unnamed Service',
    description: cleanDescription,
    categoryId,
    subcategoryId: taxonomy.taxonomyTerm ? taxonomy.taxonomyTerm.toLowerCase().replace(/\s+/g, '-') : undefined,
    location: apiResource.nameLocation || address.city || 'Unknown location',
    zipCode: address.postalCode,
    url: detailedService.url || apiResource.url || apiResource.website || extractUrlFromDescription(apiResource.descriptionService),
    phone: phoneNumbers?.main || phones[0]?.number || apiResource.phone || extractPhoneFromDescription(apiResource.descriptionService),
    email: apiResource.email || extractEmailFromDescription(apiResource.descriptionService),
    address: [
      address.streetAddress,
      address.city,
      address.stateProvince,
      address.postalCode
    ].filter(Boolean).join(', '),
    schedules: formatSchedules(detailedService.schedules) || 'Contact for hours',
    accessibility: detailedService.accessibility?.description || 'Contact for accessibility information',
    languages: detailedService.languages?.description ? [detailedService.languages.description] : apiResource.languages?.map((lang: any) => lang.name || lang) || ['English'],
    thumbsUp: 0,
    thumbsDown: 0,
    userVote: null,
    
    // Enhanced iCarol API fields - using detailed service data
    applicationProcess: detailedService.applicationProcess || 
                       apiResource.applicationProcess || 
                       "Contact the organization directly for application information",
    documents: detailedService.documents?.description || 
               apiResource.documents || 
               "Contact the organization for required documentation",
    fees: detailedService.fees?.description || 
          apiResource.fees || 
          "Contact the organization for fee information",
    serviceAreas: detailedService.serviceAreas?.map((area: any) => area.value || area.description || area.name).join(', ') ||
                  apiResource.serviceAreas?.map((area: any) => area.value || area.description || area.name).join(', ') || 
                  "Contact the organization for service area information",
    hoursOfOperation: formatSchedules(detailedService.schedules) || 
                      hoursOfOperation ||
                      "Contact the organization for hours of operation",
    eligibility: detailedService.eligibility?.description || 
                 extractEligibilityFromTaxonomy(apiResource.taxonomy) ||
                 "Contact the organization for eligibility information",
    phoneNumbers: phoneNumbers,
    additionalLanguages: apiResource.interpretationServices || 
                        apiResource.interpretation_services || 
                        apiResource.languages_spoken || []
  };
}

function extractPhoneFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  const phoneMatch = description.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return phoneMatch?.[0];
}

function extractEmailFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  const emailMatch = description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch?.[0];
}

function extractUrlFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  const urlMatch = description.match(/https?:\/\/[^\s<>"]+/);
  return urlMatch?.[0];
}

function extractEligibilityFromTaxonomy(taxonomy: any[]): string | undefined {
  if (!taxonomy?.length) return undefined;
  
  const targets = taxonomy.flatMap(t => t.targets || []);
  if (targets.length > 0) {
    const eligibleGroups = targets.map((target: any) => target.term).join(', ');
    return `This service is designed for: ${eligibleGroups}`;
  }
  
  return undefined;
}

function formatSchedules(schedules: any[]): string | undefined {
  if (!schedules?.length) return undefined;
  
  return schedules.map(schedule => {
    if (schedule.open?.length) {
      const hours = schedule.open.map((time: any) => {
        const day = time.day || 'Unknown';
        const opens = time.opensAt || 'Unknown';
        const closes = time.closesAt || 'Unknown';
        return `${day}: ${opens} - ${closes}`;
      }).join('\n');
      return hours;
    }
    return 'Contact for specific hours';
  }).join('\n\n');
}

/**
 * Main searchResources function - uses proper taxonomy codes
 */
export async function searchResources(
  category: string | null, 
  subcategory: string | null,
  zipCode?: string,
  latitude?: number,
  longitude?: number,
  use211Api: boolean = true
): Promise<{ resources: Resource[], total: number }> {
  console.log(`Selected category: ${category}, Subcategory: ${subcategory}`);
  console.log(`Location params: ZipCode=${zipCode}, Lat=${latitude}, Lng=${longitude}`);
  console.log(`Using 211 API: ${use211Api}`);
  
  if (!use211Api) {
    return { resources: [], total: 0 };
  }
  
  if (!category) {
    console.log('No category specified for 211 API search');
    return { resources: [], total: 0 };
  }

  // Get the proper taxonomy code using our imported taxonomy data
  let taxonomyCode: string;
  
  // If we have a subcategory, use its specific taxonomy code
  if (subcategory) {
    taxonomyCode = getSubcategoryTaxonomyCode(category, subcategory);
    if (taxonomyCode) {
      console.log(`Using subcategory taxonomy code: ${taxonomyCode} for ${subcategory}`);
    } else {
      // Fallback to category taxonomy if subcategory not found
      taxonomyCode = getCategoryTaxonomyCode(category);
      console.log(`Subcategory not found, using category taxonomy code: ${taxonomyCode} for ${category}`);
    }
  } else {
    // Use the main category taxonomy code
    taxonomyCode = getCategoryTaxonomyCode(category);
    console.log(`Using category taxonomy code: ${taxonomyCode} for ${category}`);
  }

  if (!taxonomyCode) {
    console.log(`No taxonomy code found for category: ${category}`);
    return { resources: [], total: 0 };
  }

  // Use the taxonomy-based search function
  return await searchResourcesByTaxonomyCode(taxonomyCode, zipCode, latitude, longitude);
}