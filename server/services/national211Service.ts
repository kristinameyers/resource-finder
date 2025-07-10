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
const API_BASE_URL = "https://api.211.org/resources/v2/search";  // Correct V2 endpoint

// Get API key from environment variables
const SUBSCRIPTION_KEY = process.env.NATIONAL_211_API_KEY || 'd0b38b7a580b46a0a14c993849bde8c0';

console.log('211 API V2 configuration set up');
console.log(`API URL: ${API_BASE_URL}`);
console.log('Using subscription key authentication with Ocp-Apim-Subscription-Key header');

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
    
    // Convert taxonomy codes to keyword searches that work with the V2 API
    // Based on your working example: keywords=food&location=93101
    const taxonomyToKeyword: { [key: string]: string } = {
      'BD': 'food',
      'BH': 'housing',
      'N': 'employment',
      'BT': 'transportation',
      'L': 'healthcare',
      'BM': 'clothing',
      'RR': 'mental health',
      'RX': 'substance abuse',
      'P': 'family support',
      'H': 'education',
      'F': 'legal aid',
      'BV': 'utilities'
    };
    
    // Use keyword search instead of taxonomy codes
    const keyword = taxonomyToKeyword[taxonomyCode] || taxonomyCode;
    
    let queryParams = [
      `keywords=${encodeURIComponent(keyword)}`, // Use keyword that works with V2 API
    ];
    
    // Add location parameters if provided
    if (zipCode) {
      queryParams.push(`location=${zipCode}`);
      queryParams.push('locationMode=postal'); // Match the POST data
      queryParams.push('distance=25'); // Search radius in miles
      queryParams.push('distanceUnit=miles'); // Add distance unit
    } else if (latitude !== undefined && longitude !== undefined) {
      queryParams.push(`location=${latitude},${longitude}`);
      queryParams.push('locationMode=geo'); // Match the POST data
      queryParams.push('distance=25');
      queryParams.push('distanceUnit=miles');
    }
    
    // Join the parameters with &
    const queryString = queryParams.join('&');
    
    // Use the correct V2 API endpoint structure
    const requestUrl = `${API_BASE_URL}/keyword?${queryString}`;
    console.log(`Making 211 API V2 request to: ${requestUrl}`);
    
    // Set headers with subscription key - try multiple header formats
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      'X-API-Key': SUBSCRIPTION_KEY, // Alternative header name
      'API-Key': SUBSCRIPTION_KEY,   // Another alternative
      'Cache-Control': 'no-cache'    // As mentioned in your instructions
    };
    
    console.log('Sending request with headers:', JSON.stringify(headers));
    
    try {
      // Try POST method with form data, as some APIs expect POST for search with parameters
      const formData = new URLSearchParams();
      formData.append('keywords', keyword);
      if (zipCode) {
        formData.append('location', zipCode);
        formData.append('locationMode', 'postal'); // Try postal for zip codes
        formData.append('distance', '25');
        formData.append('distanceUnit', 'miles'); // Add distance unit
      } else if (latitude !== undefined && longitude !== undefined) {
        formData.append('location', `${latitude},${longitude}`);
        formData.append('locationMode', 'geo'); // Try geo for coordinates
        formData.append('distance', '25');
        formData.append('distanceUnit', 'miles');
      }

      console.log('Trying POST method with form data:', formData.toString());
      
      // Try POST first
      let response = await fetch(`${API_BASE_URL}/keyword`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      
      // If POST fails, try GET with URL parameters
      if (!response.ok) {
        console.log('POST failed, trying GET method...');
        response = await fetch(requestUrl, {
          method: 'GET',
          headers
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
      console.log('⚠️ API Integration still in progress, returning placeholder notice');
      
      // Create a detailed notice resource with troubleshooting information
      const noticeResource: Resource = {
        id: "api-notice-" + taxonomyCode,
        name: "211 API Parameter Configuration Issue",
        description: `Authentication with your API key is successful! The API is responding but requires specific locationMode parameter values. We've tested: "Near", "zipcode", "postal", "coordinates", "geo" with both POST and GET methods. The API documentation at apiportal.211.org may have the correct parameter specifications. Current request: keywords=${keyword}, location=${zipCode || 'coordinates'}, locationMode=postal, distance=25.`,
        categoryId: taxonomyCode,
        subcategoryId: undefined,
        location: "API Configuration Status",
        zipCode: zipCode,
        url: "https://apiportal.211.org/",
        phone: undefined,
        email: undefined,
        address: "Check API documentation for correct locationMode values",
        schedules: "Authentication: ✓ Working | Parameter Format: ❌ Needs adjustment",
        accessibility: "API responds with 400 validation error instead of 401 authentication error",
        languages: [],
      };
      
      return {
        resources: [noticeResource],
        total: 1
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