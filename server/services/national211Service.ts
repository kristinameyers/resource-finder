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

// Using the correct 211 V2 API endpoint structure 
const API_BASE_URL = "https://api.211.org/resources/v2/search";  // V2 endpoint without /keyword

// Get API key from environment variables  
const SUBSCRIPTION_KEY = '535f3ff3321744c79fd85f4110b09545'; // Use your latest API key directly

console.log('211 API V2 configuration set up');
console.log(`API URL: ${API_BASE_URL}`);
console.log('Using API key authentication with Api-Key header');
console.log(`API Key: ${SUBSCRIPTION_KEY.substring(0, 8)}...${SUBSCRIPTION_KEY.substring(SUBSCRIPTION_KEY.length - 8)}`);

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
        
        response = await fetch(`${API_BASE_URL}/keyword`, {
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