// Centralized distance calculation and geolocation utilities
import { getCoordinatesByZip } from './zip/zipLookup';
import * as Location from 'expo-location';

/**
 * Sync: Get coordinates for a zip code (node/server/zipcodes package or preloaded map)
 */
export function getCoordinatesForZipSync(zipCode: string): { lat: number; lng: number } | null {
  // Now uses the imported synchronous function
  return getCoordinatesByZip(zipCode);
}

/**
 * Async: Get coordinates using an API call (client or server)
 */
export async function getCoordinatesForZip(zipCode: string): Promise<{ lat: number; lng: number } | null> {
  // Use the local lookup table and return a resolved promise.
  const coords = getCoordinatesByZip(zipCode); 
  return Promise.resolve(coords);
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

// --- Geolocation: Expo Location API ---
export async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted.');
    }
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { lat: location.coords.latitude, lng: location.coords.longitude };
  } catch (error) {
    throw error;
  }
}
