// Centralized distance calculation and geolocation utilities

// --- For Node/server-side lookup (using zipcodes package or CSV data), use one approach ---

// import zipcodes from 'zipcodes'; // If using 'zipcodes' NPM package

/**
 * Sync: Get coordinates for a zip code (node/server/zipcodes package or preloaded map)
 */
export function getCoordinatesForZipSync(zipCode: string): { lat: number; lng: number } | null {
  // Example for zipcodes package; replace as needed for your real db
  // const location = zipcodes.lookup(zipCode);
  // if (location) return { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) };
  // return null;

  // Or, from a preloaded in-memory map (see zipUtils)
  // return getZipCodeCoordinates(zipCode);
  return null;
}

/**
 * Async: Get coordinates using an API call (client or server)
 */
export async function getCoordinatesForZip(zipCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(`/api/zip-to-coords?zipCode=${zipCode}`);
    if (response.ok) {
      const data = await response.json();
      return { lat: data.latitude, lng: data.longitude };
    }
  } catch (error) {
    console.error('Error getting coordinates for zip code:', error);
  }
  return null;
}

// --- Calculation: Haversine formula ---
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
          + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2))
          * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Sync version: Calculate distance between two zip codes using local lookup
 */
export function calculateDistanceBetweenZipCodesSync(userZip: string, resourceZip: string): number | null {
  const userCoords = getCoordinatesForZipSync(userZip);
  const resourceCoords = getCoordinatesForZipSync(resourceZip);

  if (!userCoords || !resourceCoords) return null;
  return calculateDistance(userCoords.lat, userCoords.lng, resourceCoords.lat, resourceCoords.lng);
}

/**
 * Async version: Calculate distance between two zip codes with remote/api lookup
 */
export async function calculateDistanceBetweenZipCodes(userZip: string, resourceZip: string): Promise<number | null> {
  const userCoords = await getCoordinatesForZip(userZip);
  const resourceCoords = await getCoordinatesForZip(resourceZip);

  if (!userCoords || !resourceCoords) return null;
  return calculateDistance(userCoords.lat, userCoords.lng, resourceCoords.lat, resourceCoords.lng);
}

// --- Utilities to attach/sort resources by distance ---
export async function addDistanceAndSort<T extends { zipCode?: string }>(
  userZip: string,
  resources: T[]
): Promise<(T & { distanceMiles?: number })[]> {
  const resourcesWithDistance = await Promise.all(resources.map(async resource => {
    if (!resource.zipCode) return { ...resource, distanceMiles: undefined };
    const distance = await calculateDistanceBetweenZipCodes(userZip, resource.zipCode);
    return { ...resource, distanceMiles: distance || undefined };
  }));

  return resourcesWithDistance.sort((a, b) => {
    if (a.distanceMiles === undefined && b.distanceMiles === undefined) return 0;
    if (a.distanceMiles === undefined) return 1;
    if (b.distanceMiles === undefined) return -1;
    return a.distanceMiles - b.distanceMiles;
  });
}

// --- Filtering Santa Barbara resources and sorting ---
export async function filterSantaBarbaraAndSort<T extends { zipCode?: string; serviceAreas?: string }>(
  userZip: string,
  resources: T[]
): Promise<(T & { distanceMiles?: number })[]> {
  const santaBarbaraResources = resources.filter(resource =>
    resource.serviceAreas?.toLowerCase().includes('santa barbara')
  );
  return addDistanceAndSort(userZip, santaBarbaraResources);
}

// --- Geolocation (browser) ---
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}
