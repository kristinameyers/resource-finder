import fetch from 'node-fetch';
import { Resource } from '../../shared/schema';
import { getCategoryByTaxonomyCode, getOfficialSubcategoryTaxonomyCode, getMainCategoryTaxonomyCode, MAIN_CATEGORIES } from '../data/officialTaxonomy';
import { getCoordinatesForZip } from "../../client/src/data/zipcode-db";

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

// National 211 API configuration - use v2 endpoints as specified
const API_BASE_URL = "https://api.211.org/resources/v2/search";
const QUERY_API_BASE_URL = "https://api.211.org/resources/v2/query";

// Get API key from environment variables  
const SUBSCRIPTION_KEY = process.env.NATIONAL_211_API_KEY;

console.log('National 211 API V2 configuration set up');
console.log(`API URL: ${API_BASE_URL}`);
console.log('Using proper National 211 API credentials');

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // miles
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLon = (lon2 - lon1) * Math.PI/180;
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Transform iCarol API resource to our Resource format (based on your sample code)
 */
function transformICarolResource(icarolItem: any): Resource {
  const resource = icarolItem.resource;
  
  // Extract primary name like your sample code
  let name = '';
  if (resource.names) {
    resource.names.forEach((nameObj: any) => {
      if (nameObj.purpose === 'Primary') {
        name = nameObj.value;
      }
    });
  }
  
  // Extract organization name
  let organizationName = '';
  if (resource.related) {
    resource.related.forEach((relatedObj: any) => {
      if (relatedObj.type === 'Agency') {
        organizationName = relatedObj.name;
      }
    });
  }
  
  // Extract address
  let address = '';
  if (resource.addresses && resource.addresses.length > 0) {
    const addr = resource.addresses[0];
    address = `${addr.address1 || ''} ${addr.city || ''} ${addr.stateProvince || ''} ${addr.postalCode || ''}`.trim();
  }
  
  // Extract phone
  let phone = '';
  if (resource.phones && resource.phones.length > 0) {
    phone = resource.phones[0].number || '';
  }
  
  return {
    id: icarolItem.resourceId || `icarol-${Date.now()}`,
    name: name || 'Unknown Service',
    location: address || 'Unknown Location',
    description: resource.description || '',
    address: address,
    phone: phone,
    url: resource.website || '',
    categoryId: 'general',
    subcategoryId: undefined,
    schedules: undefined,
    accessibility: undefined,
    languages: undefined,
    eligibility: undefined,
    applicationProcess: undefined,
    // requiredDocuments: undefined, // Not in Resource interface
    fees: undefined,
    serviceAreas: undefined,
    // source: 'iCarol' // Not in Resource interface
  };
}

/**
 * Searches for resources by keyword using National 211 API V2 with pagination
 */
export async function searchResourcesByKeyword(
  keyword: string,
  zipCode?: string,
  latitude?: number,
  longitude?: number,
  size = 10,
  offset = 0
): Promise<{ resources: Resource[], total: number }> {
  try {
    console.log(`Searching for resources with keyword: ${keyword}`);
    
    // Use the same proven working /keyword endpoint that taxonomy search uses
    const requestUrl = `${API_BASE_URL}/keyword`;
    console.log('Using proven working /keyword endpoint for keyword search...');
    
    // Build query parameters using the same format as working taxonomy search
    const queryParams = new URLSearchParams({
      keywords: keyword, // Free text keyword instead of taxonomy code
      distance: '25',
      size: size.toString(),
      offset: offset.toString()
    });
    
    // Add location parameter using same logic as working taxonomy search
    if (zipCode) {
      queryParams.set('location', zipCode);
      console.log(`Using zip code location: ${zipCode}`);
    } else if (latitude !== undefined && longitude !== undefined) {
      queryParams.set('location', `${latitude},${longitude}`);
      console.log(`Using coordinate location: ${latitude},${longitude}`);
    } else {
      // No location provided - use county for broader search (same as taxonomy search)
      console.log('No location provided, defaulting to Santa Barbara County');
      queryParams.set('location', 'Santa Barbara County, CA'); // Search county wide
      queryParams.set('distance', '100'); // Increase distance for county-wide search
    }
    
    const fullUrl = `${requestUrl}?${queryParams.toString()}`;
    console.log(`Request URL: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Api-Key': SUBSCRIPTION_KEY || '',
        'locationMode': 'Within',
        'keywordIsTaxonomyCode': 'false' // Set to false for keyword search
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`211 API Error: ${response.status} ${errorText}`);
      throw new Error(`211 API Error: ${response.status} - ${errorText}`);
    }
    
    const data: any = await response.json();
    console.log(`API response received with ${data.results?.length || 0} resources`);
    console.log(`Total available results: ${data.totalCount || 0}`);
    console.log(`API Response structure:`, Object.keys(data));
    console.log(`Sample API fields:`, Object.keys(data.results?.[0] || {}));
    
    if (!data.results || data.results.length === 0) {
      return { resources: [], total: 0 };
    }
    
    // Transform basic resources using the same logic as taxonomy search
    const basicResources = data.results.map(transformResource);
    
    console.log(`Transformed ${basicResources.length} resources from 211 API keyword search`);
    return { 
      resources: basicResources, 
      total: data.totalCount || basicResources.length 
    };
  } catch (error) {
    console.error('Error searching resources by keyword:', error);
    throw error;
  }
}

/**
 * Searches for ALL resources by keyword (retrieves all pages)
 */
export async function searchAllResourcesByKeyword(
  keyword: string,
  zipCode?: string,
  latitude?: number,
  longitude?: number,
  skip: number = 0,
  take: number = 20
): Promise<{ resources: Resource[], total: number }> {
  console.log(`\n=== FETCHING RESOURCES FOR KEYWORD: ${keyword} (skip: ${skip}, take: ${take}) ===`);
  
  try {
    console.log(`Fetching resources with pagination - skip: ${skip}, take: ${take}`);
    
    const pageResult = await searchResourcesByKeyword(
      keyword,
      zipCode,
      latitude,
      longitude,
      take, // use take as size
      skip  // use skip as offset
    );
    
    console.log(`API returned ${pageResult.resources.length} resources for keyword: ${keyword}`);
    
    let resources = pageResult.resources;
    
    // With this:
if (zipCode && resources.length > 0) {
  console.log(`Calculating distances from user zip code: ${zipCode}`);
  
  // Get user coordinates from ZIP database
  const userCoords = getCoordinatesForZip(zipCode);
  
  if (userCoords) {
    resources = resources.map(resource => {
      let distance: number | undefined = undefined;
      
      if (resource.zipCode) {
        const resourceCoords = getCoordinatesForZip(resource.zipCode);
        if (resourceCoords) {
          distance = Number(calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            resourceCoords.latitude,
            resourceCoords.longitude
          ).toFixed(1));
        }
      }
      
      return {
        ...resource,
        distance
      };
    });
  }
      
      // Sort by distance if we have distance data
      resources.sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return (a.distance || 0) - (b.distance || 0);
      });
      
      console.log(`Applied distance calculations and sorting for ${resources.length} resources`);
    }
    
    console.log(`=== KEYWORD SEARCH COMPLETE: ${resources.length} resources ===\n`);
    
    return {
      resources: resources,
      total: pageResult.total
    };
  } catch (error) {
    console.error('Error in keyword search with pagination:', error);
    throw error;
  }
}

/**
 * Searches for ALL resources by taxonomy code (retrieves all pages)
 */
export async function searchAllResourcesByTaxonomyCode(
  taxonomyCode: string,
  zipCode?: string,
  latitude?: number,
  longitude?: number
): Promise<{ resources: Resource[], total: number }> {
  console.log(`\n=== FETCHING ALL RESOURCES FOR TAXONOMY: ${taxonomyCode} ===`);
  
  let allResources: Resource[] = [];
  let currentPage = 0;
  const pageSize = 50; // API cap 
  let hasMoreResults = true;
  let apiTotalCount = 0;
  
  while (hasMoreResults) {
    try {
      const offset = currentPage * pageSize;
      console.log(`Fetching page ${currentPage + 1} (offset: ${offset})`);
      
      const pageResult = await searchResourcesByTaxonomyCode(
        taxonomyCode,
        zipCode,
        latitude,
        longitude,
        pageSize,
        offset
      );
      
      // Store the total count from API on first page
      if (currentPage === 0) {
        apiTotalCount = pageResult.total;
        console.log(`API reports total of ${apiTotalCount} resources available`);
      }
      
      if (pageResult.resources.length === 0) {
        hasMoreResults = false;
        console.log(`No more results found at page ${currentPage + 1}`);
      } else {
        allResources.push(...pageResult.resources);
        console.log(`Retrieved ${pageResult.resources.length} resources from page ${currentPage + 1}`);
        console.log(`Total resources so far: ${allResources.length} / ${apiTotalCount}`);
        
        // Check if we've gotten all available resources based on API total count
        if (allResources.length >= apiTotalCount) {
          hasMoreResults = false;
          console.log(`Retrieved all ${allResources.length} available resources`);
        } else if (pageResult.resources.length < pageSize) {
          // Also stop if we get fewer results than expected (backup condition)
          hasMoreResults = false;
          console.log(`Got ${pageResult.resources.length} < ${pageSize}, reached end of results`);
        } else {
          currentPage++;
        }
      }
    } catch (error) {
      console.error(`Error fetching page ${currentPage + 1}:`, error);
      hasMoreResults = false;
    }
  }
  
  // Add distance calculations if user provided a zip code
  if (zipCode && allResources.length > 0) {
    console.log(`Calculating distances from user zip code: ${zipCode}`);
    
    const userCoords = getCoordinatesForZip(zipCode);
    
    if (userCoords) {
      allResources = allResources.map(resource => {
        if (resource.zipCode) {
          if (resource.zipCode === zipCode) {
            return {
              ...resource,
              distanceMiles: 0
            };
          } else {
            const resourceCoords = getCoordinatesForZip(resource.zipCode);
            if (resourceCoords) {
              const distance = calculateDistance(
                userCoords.latitude,
                userCoords.longitude,
                resourceCoords.latitude,
                resourceCoords.longitude
              );
              return {
                ...resource,
                distanceMiles: Number(distance.toFixed(1))
              };
            }
          }
        }
        return resource;
      });
      
      console.log(`Added distance calculations to ${allResources.filter(r => r.distanceMiles !== undefined).length} resources`);
    }
  }

  console.log(`=== COMPLETED: Retrieved ${allResources.length} total resources for ${taxonomyCode} ===`);
  return { resources: allResources, total: Math.max(allResources.length, apiTotalCount) };
}

/**
 * Handles API rate limiting with exponential backoff retry
 */
async function handleRateLimitedRequest(requestFn: () => Promise<any>, maxRetries: number = 3): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await requestFn();
      
      if (response.status === 429) {
        const rateLimitText = await response.text();
        console.log(`Rate limit hit (attempt ${attempt + 1}/${maxRetries}):`, rateLimitText);
        
        // Extract wait time from error message if available
        const waitTimeMatch = rateLimitText.match(/Try again in (\d+) seconds/);
        const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : Math.pow(2, attempt) * 1000;
        
        if (attempt < maxRetries - 1) {
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
          continue;
        } else {
          throw new Error(`Rate limit exceeded after ${maxRetries} attempts. ${rateLimitText}`);
        }
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      console.log(`Request failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Searches for resources by taxonomy code (single page - internal method)
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
    console.log(`\n=== Searching 211 API ===`);
    console.log(`Taxonomy Code: ${taxonomyCode}`);
    
    // Build request URL for the /keyword endpoint (proven working method)
    const requestUrl = `${API_BASE_URL}/keyword`;
    console.log('Using proven working /keyword endpoint...');
    
    // Build query parameters for the GET request
    const queryParams = new URLSearchParams({
      keywords: taxonomyCode,
      distance: '25',
      size: Math.min(limit, 10).toString(), // API seems to cap at 10
      skip: offset.toString()
    });
    
    // Add location parameter - use Santa Barbara County by default
    if (zipCode) {
      queryParams.set('location', zipCode);
      console.log(`Using zip code location: ${zipCode}`);
    } else if (latitude !== undefined && longitude !== undefined) {
      queryParams.set('location', `${latitude},${longitude}`);
      console.log(`Using coordinate location: ${latitude},${longitude}`);
    } else {
      // Always search Santa Barbara County - no postal code restriction
      console.log('Searching all Santa Barbara County resources');
      queryParams.set('location', 'Santa Barbara County, CA'); // Search county wide
      queryParams.set('distance', '100'); // County-wide search distance
    }
    
    const fullUrl = `${requestUrl}?${queryParams.toString()}`;
    console.log(`Making GET request to: ${fullUrl}`);
    
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Api-Key': SUBSCRIPTION_KEY || '',
        'locationMode': 'Serving'
      };
      
      // Log the taxonomy code being used
      console.log(`Searching with taxonomy code: ${taxonomyCode}`);
      headers['keywordIsTaxonomyCode'] = 'true';
      
      console.log('Trying GET method with correct parameters...');
      let response = await handleRateLimitedRequest(async () => {
        return await fetch(fullUrl, {
          method: 'GET',
          headers
        });
      });
      
      // Handle response - API returns 204 for empty results, 404 for no results with advanced mode
      if (response.status === 204) {
        console.log('API returned 204 - no results found');
        return { resources: [], total: 0 };
      }
      
      if (response.status === 404) {
        console.log('API returned 404 with taxonomy search - trying text search fallback');
        
        // Try fallback with text search instead of taxonomy code
        console.log(`Retrying with same location: ${queryParams.get('location')}`);
        const fallbackHeaders: HeadersInit = {
          'Accept': 'application/json',
          'Api-Key': SUBSCRIPTION_KEY || '',
          'locationMode': 'Serving',
          'keywordIsTaxonomyCode': 'false'
        };
        
        // Use category name as search term - updated with new taxonomy codes
        const categoryNames: { [key: string]: string } = {
          'BD-500': 'food',
          'BH-1800.8500': 'housing',
          'NL-1000.8500': 'finance-employment',
          'LN': 'healthcare',
          'FT': 'legal-assistance',
          'HD-1800.8000': 'education',
          'BT-4500': 'transportation',
          'PH-2360.2400': 'children-family',
          'RX-8250': 'substance-use',
          'RP-1400': 'mental-wellness',
          'PS-9800': 'young-adults',
          'BV': 'utilities',
          'BM-3000':'hygiene-household'
        };
        
        const searchTerm = categoryNames[taxonomyCode] || categoryNames[taxonomyCode.split('-')[0]] || 'food';
        const fallbackParams = new URLSearchParams(queryParams);
        fallbackParams.set('keywords', searchTerm);
        
        const fallbackUrl = `${requestUrl}?${fallbackParams.toString()}`;
        console.log(`Trying text search fallback: ${fallbackUrl}`);
        
        const fallbackResponse = await handleRateLimitedRequest(async () => {
          return await fetch(fallbackUrl, {
            method: 'GET',
            headers: fallbackHeaders
          });
        });
        
        if (fallbackResponse.ok) {
          response = fallbackResponse;
          console.log('Text search fallback succeeded');
        } else {
          // Try keyword fallback for categories that have keywords defined
          const categoryForTaxonomy = Object.entries(MAIN_CATEGORIES).find(([id, cat]) => cat.taxonomyCode === taxonomyCode);
          
          if (categoryForTaxonomy && categoryForTaxonomy[1].keywords) {
            console.log(`Category text search failed, trying keywords: ${categoryForTaxonomy[1].keywords.join(', ')}`);
            
            for (const keyword of categoryForTaxonomy[1].keywords) {
              const keywordParams = new URLSearchParams(queryParams);
              keywordParams.set('keywords', keyword);
              
              const keywordUrl = `${requestUrl}?${keywordParams.toString()}`;
              console.log(`Trying keyword search: ${keyword}`);
              
              const keywordResponse = await handleRateLimitedRequest(async () => {
                return await fetch(keywordUrl, {
                  method: 'GET',
                  headers: fallbackHeaders
                });
              });
              
              if (keywordResponse.ok) {
                response = keywordResponse;
                console.log(`Keyword search succeeded with: ${keyword}`);
                break;
              }
            }
          }
          
          if (!response.ok) {
            console.log('All search attempts failed - no results found');
            return { resources: [], total: 0 };
          }
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`211 API Error: ${response.status}`, errorText);
        throw new Error(`211 API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json() as any;
      console.log(`Received response from 211 API`);
      console.log('Response structure:', Object.keys(data));
      
      // Handle different response formats - API can return 'results' or 'resources'
      const apiResults = data.results || data.resources || [];
      const totalCount = data.count || data.total || apiResults.length;
      
      console.log(`API returned ${apiResults.length} resources, total count: ${totalCount}`);
      
      // Transform the 211 resource format to our app's resource format
      const transformedResources = apiResults.map(transformResource) || [];
      
      return {
        resources: transformedResources,
        total: totalCount,
      };
    } catch (connectivityError) {
      console.error('API connectivity test failed:', connectivityError);
      
      // Check if this is a rate limit error and provide appropriate response
      if (connectivityError instanceof Error && connectivityError.message.includes('Rate limit exceeded')) {
        console.log('Rate limit exceeded - returning temporary empty results');
        // Return a special marker to indicate rate limiting
        throw new Error('RATE_LIMITED: ' + connectivityError.message);
      }
      
      return { resources: [], total: 0 };
    }
  } catch (error) {
    console.error('Error searching resources by taxonomy:', error);
    throw error;
  }
}

/**
 * Fetches comprehensive service details from Query API services endpoint
 */
export async function getServiceDetails(serviceId: string): Promise<any> {
  // Ensure the service ID has the proper 211santaba- prefix format
  const fullServiceId = serviceId.startsWith('211santaba-') ? serviceId : `211santaba-${serviceId}`;
  console.log(`Fetching detailed service info for service ID: ${serviceId} (formatted: ${fullServiceId})`);
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Api-Key': SUBSCRIPTION_KEY || ''
  };
  
  try {
    const endpoint = `${QUERY_API_BASE_URL}/services/${fullServiceId}`;
    console.log(`Trying services endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const serviceDetails = await response.json() as any;
      console.log(`Retrieved detailed service info from services endpoint`);
      
      // Check for servicePhones and serviceHoursText in response
      if (serviceDetails.servicePhones) {
        console.log(`✓ Found servicePhones in service details:`, serviceDetails.servicePhones.length, 'phones');
      }
      if (serviceDetails.serviceHoursText) {
        console.log(`✓ Found serviceHoursText in service details:`, serviceDetails.serviceHoursText.substring(0, 100) + '...');
      }
      
      return serviceDetails;
    } else {
      console.log(`Services endpoint failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error fetching service details:`, error);
  }
  
  return null;
}

/**
 * Fetches comprehensive phone numbers for a resource using multiple Query API endpoints
 */
export async function getPhoneNumbers(serviceAtLocationId: string, serviceId?: string, organizationId?: string, locationId?: string): Promise<any[]> {
  try {
    // Ensure all IDs have the proper 211santaba- prefix format
    const formatId = (id: string | undefined) => {
      if (!id || id === 'undefined' || id === 'null') return undefined;
      return id.startsWith('211santaba-') ? id : `211santaba-${id}`;
    };
    
    const fullServiceAtLocationId = formatId(serviceAtLocationId);
    const fullServiceId = formatId(serviceId);
    const fullOrganizationId = formatId(organizationId);
    const fullLocationId = formatId(locationId);
    
    console.log(`Fetching phone numbers for serviceAtLocation ID: ${serviceAtLocationId} (formatted: ${fullServiceAtLocationId})`);
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Api-Key': SUBSCRIPTION_KEY || ''
    };
    
    // Try multiple endpoints to get phone numbers with proper formatted IDs
    const endpoints: string[] = [];
    
    if (fullServiceAtLocationId) {
      endpoints.push(`${QUERY_API_BASE_URL}/phones-for-service-at-location/${fullServiceAtLocationId}`);
    }
    if (fullServiceId) {
      endpoints.push(`${QUERY_API_BASE_URL}/phones-for-service/${fullServiceId}`);
    }
    if (fullOrganizationId) {
      endpoints.push(`${QUERY_API_BASE_URL}/phones-for-organization/${fullOrganizationId}`);
    }
    if (fullLocationId) {
      endpoints.push(`${QUERY_API_BASE_URL}/phones-for-location/${fullLocationId}`);
    }
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying phone endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers
        });
        
        if (response.ok) {
          const phoneData = await response.json() as any;
          console.log(`Phone numbers API successful from: ${endpoint}`);
          console.log(`Found ${Array.isArray(phoneData) ? phoneData.length : 1} phone numbers`);
          // Log the phone data structure for debugging
          if (Array.isArray(phoneData) && phoneData.length > 0) {
            console.log('Sample phone data:', JSON.stringify(phoneData[0], null, 2));
          }
          return Array.isArray(phoneData) ? phoneData : [phoneData];
        } else {
          console.log(`Phone endpoint failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`Error with endpoint ${endpoint}:`, error);
      }
    }
    
    console.log('All phone endpoints failed, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    return [];
  }
}

/**
 * Fetches detailed resource information using the Service At Location Details endpoint
 */
export async function getServiceAtLocationDetails(serviceAtLocationId: string): Promise<any | null> {
  try {
    console.log(`Fetching detailed info for serviceAtLocation ID: ${serviceAtLocationId}`);
    
    // Ensure the ID has the proper 211santaba- prefix format
    const fullServiceAtLocationId = serviceAtLocationId.startsWith('211santaba-') 
      ? serviceAtLocationId 
      : `211santaba-${serviceAtLocationId}`;
    
    // Use the Service At Location Details endpoint as specified by the user
    const requestUrl = `${QUERY_API_BASE_URL}/service-at-location-details/${fullServiceAtLocationId}`;
    console.log(`Calling Service At Location Details endpoint: ${requestUrl}`);
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Api-Key': SUBSCRIPTION_KEY || ''
    };
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const detailsData = await response.json() as any;
      console.log('Service At Location Details API successful');
      console.log('Details include:');
      console.log('- Description:', !!detailsData.description);
      console.log('- Eligibility:', !!detailsData.eligibility);
      console.log('- Fees:', !!detailsData.fees);
      console.log('- Hours:', !!detailsData.hours || !!detailsData.schedule);
      console.log('- Documents:', !!detailsData.documents || !!detailsData.requiredDocuments);
      console.log('- Contact info:', !!detailsData.contacts || !!detailsData.phones);
      return detailsData;
    } else {
      console.log(`Service At Location Details API failed with status: ${response.status}`);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching Service At Location Details:', error);
    return null;
  }
}

/**
 * Legacy function - keeping for backward compatibility
 */
async function getDetailedResourceInfo(organizationId: string): Promise<any | null> {
  try {
    console.log(`Fetching detailed info for organization ID: ${organizationId}`);
    
    // Try services-for-organization first
    let requestUrl = `${QUERY_API_BASE_URL}/services-for-organization/${organizationId}`;
    console.log(`Trying services endpoint: ${requestUrl}`);
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Api-Key': SUBSCRIPTION_KEY || ''
    };
    
    let response = await fetch(requestUrl, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const servicesData = await response.json() as any;
      if (Array.isArray(servicesData) && servicesData.length > 0) {
        console.log('Services API successful, returning service data');
        return servicesData[0];
      }
    }
    
    // If services fails, try locations-for-organization (which has phones, schedules, etc.)
    console.log(`Services API failed (${response.status}), trying locations endpoint`);
    requestUrl = `${QUERY_API_BASE_URL}/locations-for-organization/${organizationId}`;
    console.log(`Trying locations endpoint: ${requestUrl}`);
    
    response = await fetch(requestUrl, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const locationsData = await response.json() as any;
      if (Array.isArray(locationsData) && locationsData.length > 0) {
        const firstLocation = locationsData[0];
        console.log('Locations API successful');
        console.log('Location has phones:', !!firstLocation.phones);
        console.log('Location has schedules:', !!firstLocation.schedules);
        console.log('Location has contacts:', !!firstLocation.contacts);
        return firstLocation;
      }
    }
    
    console.log(`Both endpoints failed. Services: ${response.status}, Locations: ${response.status}`);
    return null;
  } catch (error) {
    console.error('Error fetching detailed resource info:', error);
    return null;
  }
}

/**
 * Fetches comprehensive resource details using Service At Location Details endpoint
 */
export async function getResourceById(id: string): Promise<Resource | null> {
  try {
    console.log(`Fetching comprehensive resource details for ID: ${id}`);
    
    // Keep the serviceAtLocation ID with the proper prefix format
    const serviceAtLocationId = id.startsWith('211santaba-') ? id : `211santaba-${id}`;
    
    // First get basic resource info from search endpoint
    const requestUrl = `${API_BASE_URL}/keyword?keywords=${id}&keywordIsTaxonomyCode=false&location=Santa%20Barbara%20County,%20CA&distance=100&size=1`;
    console.log(`Getting basic resource info: ${requestUrl}`);
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Api-Key': SUBSCRIPTION_KEY || '',
      'locationMode': 'Serving',
      'keywordIsTaxonomyCode': 'false'
    };
    
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
    
    const searchData = await response.json() as any;
    const resourceData = searchData.results?.[0] || searchData;
    
    if (!resourceData) {
      console.log(`No resource data found for ID: ${id}`);
      return null;
    }
    
    console.log(`Retrieved basic resource info for: ${resourceData.nameService || resourceData.name}`);
    console.log(`ServiceAtLocation ID: ${resourceData.idServiceAtLocation}`);
    
    // Now get comprehensive details using Service At Location Details endpoint
    let detailedInfo = null;
    let phoneNumbers = [];
    if (resourceData.idServiceAtLocation) {
      console.log(`Fetching detailed info using serviceAtLocation ID: ${resourceData.idServiceAtLocation}`);
      
      // Always try to fetch phone numbers even if Service At Location Details fails
      try {
        phoneNumbers = await getPhoneNumbers(
          resourceData.idServiceAtLocation,
          resourceData.idService,
          resourceData.idOrganization,
          resourceData.idLocation
        );
        console.log(`Retrieved ${phoneNumbers.length} phone numbers from Query API`);
      } catch (phoneError) {
        console.error('Error fetching phone numbers:', phoneError);
      }
      
      // Try to get detailed info (this might fail with 404, but phone numbers should still work)
      try {
        detailedInfo = await getServiceAtLocationDetails(resourceData.idServiceAtLocation);
      } catch (detailsError) {
        console.log('Service At Location Details failed, continuing with basic data');
      }
    }
    
    // Merge basic and detailed information including phone numbers
    const enhancedData = { 
      ...resourceData, 
      ...(detailedInfo ? { serviceDetails: detailedInfo } : {}),
      ...(phoneNumbers.length > 0 ? { comprehensivePhones: phoneNumbers } : {})
    };
    
    return transformResource(enhancedData);
  } catch (error) {
    console.error('Error fetching comprehensive resource details:', error);
    throw error;
  }
}

// Mapping of taxonomy codes to our category IDs
const taxonomyToCategory: { [key: string]: string } = {
  'BH-1800.8500': 'housing',
  'NL-1000.8500': 'finance-employment',
  'BD-5000': 'food',
  'BT-4500': 'transportation',
  'LN': 'healthcare',
  'BM-3000': 'hygiene-household',
  'RP-1400': 'mental-wellness',
  'RX-8250': 'substance-use',
  'PH-2360.2400': 'children-family',
  'PS-9800': 'young-adults',
  'HD-1800.8000': 'education',
  'YB-8000': 'seniors-caregivers',
  'FT': 'legal', // Lawyer referral services (FT-4800)
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
  
  // Debug: Check for the specific fields user requested
  if (apiResource.servicePhones) {
    console.log('✓ Found servicePhones field:', apiResource.servicePhones.length, 'phones');
  } else {
    console.log('✗ servicePhones field not found');
  }
  
  if (apiResource.serviceHoursText) {
    console.log('✓ Found serviceHoursText field:', apiResource.serviceHoursText.substring(0, 100) + '...');
  } else {
    console.log('✗ serviceHoursText field not found');
  }
  
  // Fix address extraction - API uses different structure
  // Extract address information from multiple possible locations
  const address = apiResource.address || apiResource.addresses?.[0] || {};
  const geoPoint = apiResource.geoPoint || {};
  const taxonomy = apiResource.taxonomy?.[0] || {};
  const detailedService = apiResource.detailedService || {};
  
  // Address validation - API provides good address data
  const hasValidAddress = address && Object.keys(address).length > 0;
  
  // Check for enhanced service data from detailed API calls
  const hasDetailedService = detailedService && Object.keys(detailedService).length > 0;
  const hasServiceDetails = apiResource.serviceDetails && Object.keys(apiResource.serviceDetails).length > 0;
  
  // Enhanced HTML cleaning function with list preservation
  const cleanHtml = (text: string) => {
    if (!text) return '';
    
    let cleaned = text
      // First preserve list items by converting them to bullet points
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
      .replace(/<ul[^>]*>/gi, '\n')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>/gi, '\n')
      .replace(/<\/ol>/gi, '\n')
      // Convert paragraph breaks to newlines
      .replace(/<\/p>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<br[^>]*>/gi, '\n')
      // Remove problematic data attribute tags first
      .replace(/<[^>]*data-block-id[^>]*>/gi, '')
      .replace(/<[^>]*data-pm-slice[^>]*>/gi, '')
      // Remove all remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&hellip;/g, '...')
      // Remove any remaining HTML entity patterns
      .replace(/&[a-zA-Z0-9#]+;/g, '')
      // Clean up multiple consecutive spaces and newlines
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      // Remove any leftover fragments that look like HTML attributes
      .replace(/data-[a-zA-Z0-9-]+="[^"]*"/g, '')
      .replace(/[a-zA-Z-]+=["'][^"']*["']/g, '')
      .trim();

    // Smart list detection: look for patterns that should be bullet points
    // Pattern: "Services include, but are not limited to:ItemItemItem"
    cleaned = cleaned.replace(
      /(Services include[^:]*:)\s*(.+?)(?=\n|$)/gi,
      (match, intro, content) => {
        // Look for concatenated capitalized words/phrases that should be list items
        const listItems = content.match(/[A-Z][A-Za-z\s&,.-]+?(?=[A-Z]|$)/g) || [];
        
        if (listItems.length > 2) {
          const bulletList = listItems
            .map((item: string) => `• ${item.trim().replace(/,$/, '')}`)
            .join('\n');
          return `${intro}\n${bulletList}`;
        }
        return match;
      }
    );

    // Also handle lists that start with patterns like "Meals Health and Wellness"
    cleaned = cleaned.replace(
      /([A-Z][a-z]+)([A-Z][a-z\s]+)([A-Z][a-z\s&]+)([A-Z][a-z\s:,.-]+)/g,
      (match, ...items) => {
        // If we have multiple capitalized phrases in sequence, convert to list
        if (items.length >= 3) {
          return items
            .filter((item: string) => item && item.trim())
            .map((item: string) => `• ${item.trim()}`)
            .join('\n');
        }
        return match;
      }
    );

    return cleaned;
  };
  
  // Build comprehensive description with services information
  let serviceDescription = cleanHtml(apiResource.descriptionService || apiResource.description || 'No description available');
  
  // Add extracted service information to description
  const extractedHours = extractHoursFromDescription(apiResource.descriptionService);
  const extractedServices = extractServicesFromDescription(apiResource.descriptionService);
  
  if (extractedServices || extractedHours) {
    serviceDescription += '\n\n**Services:**\n';
    if (extractedServices) {
      serviceDescription += extractedServices + '\n';
    }
    if (extractedHours) {
      serviceDescription += cleanHtml(extractedHours);
    }
  }
  
  const cleanDescription = serviceDescription;
  
  // Map taxonomy code to category ID
  const categoryId = getCategoryIdFromTaxonomy(taxonomy.taxonomyCode);
  console.log(`Mapping taxonomy code ${taxonomy.taxonomyCode} to category ID ${categoryId}`);
  
  // Extract additional iCarol API fields based on actual API structure
  console.log('Available API fields:', Object.keys(apiResource));
  
  // Check for phone numbers from multiple sources:
  // 1. servicePhones field (priority - as requested by user)
  // 2. Comprehensive phones from Query API
  // 3. Detailed service phones
  // 4. Base resource phones
  const servicePhones = apiResource.servicePhones || apiResource.detailedServiceInfo?.servicePhones || [];
  const comprehensivePhones = apiResource.comprehensivePhones || [];
  const phones = detailedService.phones || apiResource.phones || [];
  
  // Prioritize servicePhones field, then comprehensive phones, then basic phones
  const phoneNumbers = servicePhones.length > 0 ? undefined : (
    comprehensivePhones.length > 0 ? undefined : (
      phones.length > 0 ? {
        main: phones.find((p: any) => p.isMain || p.type === 'Main')?.number || phones[0]?.number,
        fax: phones.find((p: any) => p.type === 'Fax')?.number,
        tty: phones.find((p: any) => p.type === 'TTY')?.number,
        crisis: phones.find((p: any) => p.type === 'Crisis')?.number,
      } : undefined
    )
  );

  // Extract hours of operation from multiple sources (prioritize serviceHoursText as requested by user)
  let hoursOfOperation = '';
  
  // First priority: serviceHoursText field (as requested by user)
  if (apiResource.serviceHoursText || apiResource.detailedServiceInfo?.serviceHoursText) {
    hoursOfOperation = cleanHtml(apiResource.serviceHoursText || apiResource.detailedServiceInfo?.serviceHoursText);
    console.log('Using hours from serviceHoursText field');
  } else if (hasServiceDetails && (apiResource.serviceDetails?.hours || apiResource.serviceDetails?.schedule)) {
    // Second priority: detailed service information from Service At Location Details
    hoursOfOperation = cleanHtml(apiResource.serviceDetails.hours || apiResource.serviceDetails.schedule);
    console.log('Using hours from Service At Location Details');
  } else if (detailedService?.schedules?.length > 0) {
    // Third priority: detailed service schedules
    hoursOfOperation = formatSchedules(detailedService.schedules) || '';
    console.log('Using hours from detailed service schedules');
  } else if (apiResource.schedules?.length > 0) {
    // Fourth priority: basic schedule information
    hoursOfOperation = apiResource.schedules.map((schedule: any) => {
      const days = schedule.daysOfWeek || schedule.opensAt ? 
        `${schedule.daysOfWeek || 'Monday-Friday'}: ${schedule.opensAt || '9am'}-${schedule.closesAt || '5pm'}` :
        schedule.description;
      return days;
    }).join('\n');
    console.log('Using hours from basic schedules');
  } else {
    // Last resort: extract from description
    const extractedHours = extractHoursFromDescription(apiResource.descriptionService || apiResource.description);
    if (extractedHours) {
      hoursOfOperation = cleanHtml(extractedHours);
      console.log('Using hours extracted from description');
    }
  }
  
  // Debug: Check for specific iCarol fields (uncomment for debugging)
  // console.log('Checking for key fields:');
  // console.log('- phones/contacts:', !!apiResource.phones || !!apiResource.contacts);
  // console.log('- eligibility:', !!apiResource.eligibility);
  // console.log('- serviceAreas:', !!apiResource.serviceAreas);
  // console.log('- schedules:', !!apiResource.schedules);
  // console.log('- languages:', !!apiResource.languages);

  // Skip debug logging to reduce console output
  
  // Create the transformed resource
  return {
    id: apiResource.idServiceAtLocation || apiResource.id,
    name: apiResource.nameService || apiResource.nameServiceAtLocation || apiResource.name || 'Unnamed Service',
    description: cleanDescription,
    categoryId,
    subcategoryId: taxonomy.taxonomyTerm ? taxonomy.taxonomyTerm.toLowerCase().replace(/\s+/g, '-') : undefined,
    location: apiResource.nameLocation || address.city || 'Unknown location',
    zipCode: address.postalCode ||
      geoPoint.postalCode ||
      extractZipCodeFromAddress(address.streetAddress || '') ||
      extractZipCodeFromDescription(apiResource.descriptionService) ||
      extractZipCodeFromServiceAreas(apiResource.serviceAreas) ||
      undefined,
    url: detailedService.url || apiResource.url || apiResource.website || extractUrlFromDescription(apiResource.descriptionService),
    phone: servicePhones[0]?.number || apiResource.detailedServiceInfo?.servicePhones?.[0]?.number || phoneNumbers?.main || phones[0]?.number || apiResource.phone || extractPhoneFromDescription(apiResource.descriptionService),
    email: apiResource.email || extractEmailFromDescription(apiResource.descriptionService),
    address: hasValidAddress ? [
      address.streetAddress,
      address.city,
      address.stateProvince,
      address.postalCode
    ].filter(Boolean).join(', ') : 'Address not available',
    schedules: formatSchedules(detailedService.schedules) || 'Contact for hours',
    accessibility: cleanHtml(detailedService.accessibility?.description || '') || 'Contact for accessibility information',
    languages: detailedService.languages?.description ? [detailedService.languages.description] : apiResource.languages?.map((lang: any) => lang.name || lang) || ['English'],
    thumbsUp: 0,
    thumbsDown: 0,
    userVote: null,
    
    // Enhanced fields with Service At Location Details integration
    applicationProcess: (() => {
      if (hasServiceDetails && apiResource.serviceDetails.applicationProcess) {
        return cleanHtml(apiResource.serviceDetails.applicationProcess);
      }
      return cleanHtml(detailedService.applicationProcess || 
                       apiResource.applicationProcess || 
                       extractApplicationProcessFromDescription(apiResource.descriptionService) || '') ||
                       "Contact the organization directly to learn about their application process";
    })(),
    documents: (() => {
      if (hasServiceDetails && (apiResource.serviceDetails.documents || apiResource.serviceDetails.requiredDocuments)) {
        return cleanHtml(apiResource.serviceDetails.documents || apiResource.serviceDetails.requiredDocuments);
      }
      return cleanHtml(detailedService.documents?.description || 
                       apiResource.documents || 
                       extractDocumentsFromDescription(apiResource.descriptionService) || '') ||
                       "Contact the organization to learn what documents you'll need";
    })(),
    fees: (() => {
      if (hasServiceDetails && apiResource.serviceDetails.fees) {
        return cleanHtml(apiResource.serviceDetails.fees);
      }
      return cleanHtml(detailedService.fees?.description || 
                       apiResource.fees || 
                       extractFeesFromDescription(apiResource.descriptionService) || '') ||
                       "Contact the organization for information about fees and costs";
    })(),
    serviceAreas: detailedService.serviceAreas?.map((area: any) => area.value || area.description || area.name).join(', ') ||
                  apiResource.serviceAreas?.map((area: any) => area.value || area.description || area.name).join(', ') || 
                  (apiResource.nameLocation ? `Serving ${apiResource.nameLocation} area` : "Contact for service area information"),
    hoursOfOperation: hoursOfOperation || 
                      formatSchedules(detailedService.schedules) ||
                      "Contact the organization for their hours of operation",
    eligibility: (() => {
      if (hasServiceDetails && apiResource.serviceDetails.eligibility) {
        return cleanHtml(apiResource.serviceDetails.eligibility);
      }
      return cleanHtml(detailedService.eligibility?.description || 
                       extractEligibilityFromTaxonomy(apiResource.taxonomy) ||
                       extractEligibilityFromDescription(apiResource.descriptionService) || '') ||
                       "Contact the organization to learn about eligibility requirements";
    })(),
    phoneNumbers: phoneNumbers,
    
    // Enhanced comprehensive phone numbers (prioritize servicePhones, then comprehensivePhones)
    comprehensivePhones: servicePhones.length > 0 ? servicePhones : (apiResource.comprehensivePhones || []),
    
    // Note: Phone extraction from description available if needed
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

function extractPhonesFromDescription(description: string): string[] {
  if (!description) return [];
  
  const phoneNumbers: string[] = [];
  const phonePatterns = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,          // 123-456-7890, 123.456.7890, 1234567890
    /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/g,            // (123) 456-7890
    /\b\d{3}\s+\d{3}\s+\d{4}\b/g                // 123 456 7890
  ];
  
  phonePatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      phoneNumbers.push(...matches);
    }
  });
  
  return Array.from(new Set(phoneNumbers)); // Remove duplicates
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

function extractApplicationProcessFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  
  const keywords = ['application', 'apply', 'registration', 'enrollment', 'intake', 'referral'];
  const sentences = description.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return undefined;
}

function extractDocumentsFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  
  const keywords = ['documents', 'identification', 'proof', 'bring', 'required', 'paperwork'];
  const sentences = description.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return undefined;
}

function extractFeesFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  
  const keywords = ['fee', 'cost', 'charge', 'payment', 'free', 'sliding scale', '$'];
  const sentences = description.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return undefined;
}

function extractHoursFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  
  const keywords = ['hours', 'open', 'closed', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'am', 'pm'];
  const sentences = description.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return undefined;
}

function extractEligibilityFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  
  const keywords = ['eligible', 'qualification', 'must', 'requirement', 'criteria', 'income', 'age', 'resident'];
  const sentences = description.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return undefined;
}

function extractServicesFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  
  const keywords = ['services include', 'offers', 'provides', 'programs', 'assistance with'];
  const sentences = description.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return undefined;
}

function extractZipCodeFromAddress(addressText: string): string | undefined {
  if (!addressText) return undefined;
  
  // Look for 5-digit zip codes
  const zipMatch = addressText.match(/\b\d{5}(-\d{4})?\b/);
  return zipMatch?.[0]?.split('-')[0]; // Return just the 5-digit part
}

function extractZipCodeFromDescription(description: string): string | undefined {
  if (!description) return undefined;
  
  // Look for 5-digit zip codes in description
  const zipMatch = description.match(/\b\d{5}(-\d{4})?\b/);
  return zipMatch?.[0]?.split('-')[0]; // Return just the 5-digit part
}

function extractZipCodeFromServiceAreas(serviceAreas: any[]): string | undefined {
  if (!serviceAreas?.length) return undefined;
  
  for (const area of serviceAreas) {
    const areaText = area.value || area.description || area.name || '';
    const zipMatch = areaText.match(/\b\d{5}(-\d{4})?\b/);
    if (zipMatch) {
      return zipMatch[0].split('-')[0];
    }
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
  use211Api: boolean = true,
  skip: number = 0,
  take: number = 20
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

  // Special handling for home screen categories: use only keyword search
  if (!subcategory) {
    // Finance & Employment -> only search for "employment" (broader term for more results)
    if (category === 'finance-employment') {
      console.log(`Home screen Finance & Employment: searching only for keyword "finance"`);
      try {
        const result = await searchResourcesByKeyword(
          'finance',
          zipCode,
          latitude,
          longitude,
          take,
          skip
        );
        console.log(`Finance and Employment keyword search returned ${result.resources.length} resources`);
        return result;
      } catch (error) {
        console.log(`Finance and Employment keyword search failed:`, error);
        return { resources: [], total: 0 };
      }
    }
    
    // Education -> only search for "education"
    if (category === 'education') {
      console.log(`Home screen Education: searching only for keyword "education"`);
      try {
        const result = await searchResourcesByKeyword(
          'education',
          zipCode,
          latitude,
          longitude,
          take,
          skip
        );
        console.log(`Education keyword search returned ${result.resources.length} resources`);
        return result;
      } catch (error) {
        console.log(`Education keyword search failed:`, error);
        return { resources: [], total: 0 };
      }
    }
  }

  // Regular taxonomy-first search for all other categories
  let taxonomyCode: string | null = null;
  
  // Use official taxonomy codes for both category and subcategory searches
  if (subcategory) {
    taxonomyCode = getOfficialSubcategoryTaxonomyCode(category, subcategory);
    if (!taxonomyCode) {
      // Fallback to category taxonomy
      taxonomyCode = getMainCategoryTaxonomyCode(category);
      console.log(`No subcategory taxonomy code found, using category code: ${taxonomyCode} for ${subcategory}`);
    } else {
      console.log(`Using subcategory taxonomy code: ${taxonomyCode} for ${subcategory}`);
    }
  } else {
    taxonomyCode = getMainCategoryTaxonomyCode(category);
    console.log(`Using category taxonomy code: ${taxonomyCode} for ${category}`);
  }

  if (!taxonomyCode) {
    console.log(`No taxonomy code found for category: ${category}`);
    return { resources: [], total: 0 };
  }
  // Now taxonomyCode is guaranteed to be a string (not null)

  // Use National 211 API with taxonomy codes (applying principles from your sample)
  console.log(`Using National 211 API with taxonomy code: ${taxonomyCode}`);
  
  try {
    // Use the searchResourcesByTaxonomyCode function with pagination
    const result = await searchResourcesByTaxonomyCode(
      taxonomyCode,
      zipCode,
      latitude,
      longitude,
      take,
      skip
    );
    
    // Sort by distance if user location is available
    if ((zipCode || (latitude && longitude)) && result.resources.length > 0) {
      result.resources.sort((a, b) => {
        const distanceA = a.distanceMiles || 999999;
        const distanceB = b.distanceMiles || 999999;
        return distanceA - distanceB;
      });
      console.log(`Auto-sorted ${result.resources.length} resources by distance (closest first)`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`National 211 API search failed:`, error);
    return { resources: [], total: 0 };
  }
}
