import fetch from 'node-fetch';
import { Resource } from '../../shared/schema';

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

const API_URL = process.env.NATIONAL_211_API_URL;

// Subscription key for the 211 API - provided by user
const SUBSCRIPTION_KEY = 'd0b38b7a580b46a0a14c993849bde8c0';
// Backup subscription key if needed
const BACKUP_SUBSCRIPTION_KEY = '535f3ff3321744c79fd85f4110b09545';

if (!API_URL) {
  console.error('Missing 211 API configuration. Please set NATIONAL_211_API_URL environment variable.');
} else {
  console.log('211 API configuration found');
  console.log(`API URL: ${API_URL}`);
  console.log('Using subscription key authentication');
}

/**
 * Searches for resources by taxonomy code
 */
export async function searchResourcesByTaxonomy(
  taxonomyCode: string,
  zipCode?: string,
  latitude?: number,
  longitude?: number,
  limit: number = 20,
  offset: number = 0
): Promise<{ resources: Resource[], total: number }> {
  try {
    console.log(`Searching for resources with taxonomy code: ${taxonomyCode}`);
    
    const queryParams = new URLSearchParams();
    
    // Add taxonomy code (we can search by parent code) - use TaxonomyCode with capital letters as per API docs
    queryParams.append('TaxonomyCode', taxonomyCode);
    
    // Add location parameters if provided
    if (zipCode) {
      console.log(`Adding zip code filter: ${zipCode}`);
      queryParams.append('Location', zipCode); // Use Location parameter as per API docs
    } else if (latitude !== undefined && longitude !== undefined) {
      console.log(`Adding coordinates filter: ${latitude}, ${longitude}`);
      // Format coordinates as "latitude,longitude" string for the Location parameter
      queryParams.append('Location', `${latitude},${longitude}`);
      // Add a reasonable distance (in miles)
      queryParams.append('Distance', '20');
    }
    
    // Add pagination - use Skip and Top as per API docs
    queryParams.append('Skip', offset.toString());
    queryParams.append('Top', limit.toString());
    
    // Also try adding subscription key as a query parameter
    queryParams.append('subscription-key', SUBSCRIPTION_KEY);
    
    // Build the full URL - ensure no double slashes
    // The API URL might already include a trailing slash
    const baseUrl = API_URL && API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL || '';
    
    // Use the Guided endpoint as per API documentation
    const requestUrl = `${baseUrl}/Guided?${queryParams.toString()}`;
    console.log(`Making 211 API request to: ${requestUrl}`);
    
    // Try different header approaches for the subscription key
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      // Alternative ways to send the subscription key
      'subscription-key': SUBSCRIPTION_KEY,
      'api-key': SUBSCRIPTION_KEY,
    };
    
    console.log('Sending request with headers:', JSON.stringify(headers));
    
    // Make the API request
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers
    });
    
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
  } catch (error) {
    console.error('Error searching resources by taxonomy:', error);
    throw error;
  }
}

/**
 * Fetches a resource by ID
 */
export async function getResourceById(id: string): Promise<Resource | null> {
  try {
    console.log(`Fetching resource with ID: ${id}`);
    
    // Fix URL formatting to prevent double slashes
    const baseUrl = API_URL && API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL || '';
    
    // For resource details, construct URL with query parameters including subscription key
    const queryParams = new URLSearchParams();
    queryParams.append('Id', id);
    queryParams.append('subscription-key', SUBSCRIPTION_KEY);
    
    const requestUrl = `${baseUrl}/Resource/Details?${queryParams.toString()}`;
    console.log(`Making 211 API request to: ${requestUrl}`);
    
    // Try different header approaches for the subscription key
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      // Alternative ways to send the subscription key
      'subscription-key': SUBSCRIPTION_KEY,
      'api-key': SUBSCRIPTION_KEY,
    };
    
    console.log('Sending detail request with headers:', JSON.stringify(headers));
    
    // Make the API request
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
    
    const data = await response.json() as National211Resource;
    console.log(`Successfully retrieved resource "${data.name}" from 211 API`);
    
    return transformResource(data);
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
function transformResource(apiResource: National211Resource): Resource {
  // Extract the first phone number if available
  const phone = apiResource.phone && apiResource.phone.length > 0 
    ? apiResource.phone[0].number 
    : undefined;
  
  // Extract the schedules if available
  const schedules = apiResource.schedule 
    ? apiResource.schedule.map(s => {
        const days = s.days_of_week ? s.days_of_week.join(', ') : '';
        const hours = s.opens_at && s.closes_at ? `${s.opens_at} - ${s.closes_at}` : '';
        const desc = s.description || '';
        return [days, hours, desc].filter(Boolean).join(' ');
      }).join('\n') 
    : undefined;
  
  // Extract address
  const location = apiResource.location;
  const address = location 
    ? [
        location.address_1,
        location.address_2,
        [location.city, location.state_province].filter(Boolean).join(', ')
      ].filter(Boolean).join('\n')
    : undefined;
  
  // Map taxonomy code to category ID
  const categoryId = getCategoryIdFromTaxonomy(apiResource.taxonomy_code);
  console.log(`Mapping taxonomy code ${apiResource.taxonomy_code} to category ID ${categoryId}`);
  
  // Create the transformed resource
  return {
    id: apiResource.id,
    name: apiResource.name,
    description: apiResource.description || 'No description available',
    categoryId,
    subcategoryId: apiResource.taxonomy_name ? apiResource.taxonomy_name.toLowerCase().replace(/\s+/g, '-') : undefined,
    location: location?.name || 'Unknown location',
    zipCode: location?.postal_code,
    url: apiResource.url,
    phone,
    email: apiResource.email,
    address,
    schedules,
    accessibility: apiResource.accessibility?.join(', '),
    languages: apiResource.languages || [],
  };
}