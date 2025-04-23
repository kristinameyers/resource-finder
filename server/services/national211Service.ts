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
const API_KEY = process.env.NATIONAL_211_API_KEY;

if (!API_URL || !API_KEY) {
  console.error('Missing 211 API configuration. Please set NATIONAL_211_API_URL and NATIONAL_211_API_KEY environment variables.');
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
    const queryParams = new URLSearchParams();
    
    // Add taxonomy code
    queryParams.append('taxonomy_code', taxonomyCode);
    
    // Add location parameters if provided
    if (zipCode) {
      queryParams.append('zip_code', zipCode);
    } else if (latitude !== undefined && longitude !== undefined) {
      queryParams.append('latitude', latitude.toString());
      queryParams.append('longitude', longitude.toString());
    }
    
    // Add pagination
    queryParams.append('limit', limit.toString());
    queryParams.append('offset', offset.toString());
    
    // Make the API request
    const response = await fetch(`${API_URL}/resources/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`211 API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as SearchResourcesResponse;
    
    // Transform the 211 resource format to our app's resource format
    const transformedResources = data.resources.map(transformResource);
    
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
    const response = await fetch(`${API_URL}/resources/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      throw new Error(`211 API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as National211Resource;
    return transformResource(data);
  } catch (error) {
    console.error('Error fetching resource by ID:', error);
    throw error;
  }
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
  
  // Create the transformed resource
  return {
    id: apiResource.id,
    name: apiResource.name,
    description: apiResource.description || 'No description available',
    categoryId: apiResource.taxonomy_code || '',
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