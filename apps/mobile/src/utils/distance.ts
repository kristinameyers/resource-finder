/**
 * Distance Calculation Utility Module
 * Centralized location for all distance-related calculations
 * Uses zipcodes package for US postal code geolocation
 */

// @ts-ignore - zipcodes package doesn't have TypeScript definitions
import zipcodes from 'zipcodes';

/**
 * Haversine formula to calculate distance between two points
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point  
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of Earth in miles
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round((R * c) * 100) / 100; // Round to 2 decimal places
}

/**
 * Get coordinates for a US zip code
 * @param zipCode 5-digit US zip code
 * @returns Coordinates object or null if not found
 */
export function getZipCodeCoordinates(zipCode: string): { lat: number; lng: number } | null {
  try {
    const location = zipcodes.lookup(zipCode);
    if (location && location.latitude && location.longitude) {
      return {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude)
      };
    }
    return null;
  } catch (error) {
    console.warn(`Failed to lookup coordinates for zip code ${zipCode}:`, error);
    return null;
  }
}

/**
 * Calculate distance between two zip codes
 * @param userZip User's zip code
 * @param resourceZip Resource's zip code
 * @returns Distance in miles or null if calculation fails
 */
export function calculateDistanceBetweenZipCodes(userZip: string, resourceZip: string): number | null {
  const userCoords = getZipCodeCoordinates(userZip);
  const resourceCoords = getZipCodeCoordinates(resourceZip);
  
  if (!userCoords || !resourceCoords) {
    return null;
  }
  
  return haversineDistance(userCoords.lat, userCoords.lng, resourceCoords.lat, resourceCoords.lng);
}

/**
 * Add distance calculations to a list of resources and sort by proximity
 * @param userZip User's zip code for distance calculation
 * @param resources Array of resources with zipCode property
 * @returns Sorted array with distance information added
 */
export function addDistanceAndSort<T extends { zipCode?: string }>(
  userZip: string,
  resources: T[]
): (T & { distanceMiles?: number })[] {
  // Add distance to each resource
  const resourcesWithDistance = resources.map(resource => {
    if (!resource.zipCode) {
      return { ...resource, distanceMiles: undefined };
    }
    
    const distance = calculateDistanceBetweenZipCodes(userZip, resource.zipCode);
    return { ...resource, distanceMiles: distance || undefined };
  });
  
  // Sort by distance (closest first), putting resources without distance at the end
  return resourcesWithDistance.sort((a, b) => {
    if (a.distanceMiles === undefined && b.distanceMiles === undefined) return 0;
    if (a.distanceMiles === undefined) return 1;
    if (b.distanceMiles === undefined) return -1;
    return a.distanceMiles - b.distanceMiles;
  });
}

/**
 * Filter resources by Santa Barbara County and sort by distance
 * @param userZip User's zip code for distance calculation
 * @param resources Array of resources
 * @returns Filtered and sorted resources from Santa Barbara County
 */
export function filterSantaBarbaraAndSort<T extends { zipCode?: string; serviceAreas?: string }>(
  userZip: string,
  resources: T[]
): (T & { distanceMiles?: number })[] {
  // Filter for Santa Barbara County resources
  const santaBarbaraResources = resources.filter(resource => {
    return resource.serviceAreas?.toLowerCase().includes('santa barbara');
  });
  
  // Add distance and sort
  return addDistanceAndSort(userZip, santaBarbaraResources);
}