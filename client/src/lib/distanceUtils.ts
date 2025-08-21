/**
 * Distance calculation utilities for resource location
 */

// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Convert ZIP code to coordinates using a local zip code database
export async function getCoordinatesFromZipCode(zipCode: string): Promise<{ lat: number; lng: number } | null> {
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

// The backend now handles all 211 API taxonomy-based filtering and distance calculations
// This function is kept for compatibility but should not be needed
export function filterSantaBarbaraAndSort(userZipCode: string, resources: any[]): any[] {
  // Backend already handles proper Santa Barbara filtering via 211 API
  // Just return resources as-is since they're already properly filtered
  return resources.sort((a: any, b: any) => {
    // Sort by distance if available (backend calculates this), otherwise by name
    if (a.distanceMiles !== undefined && b.distanceMiles !== undefined) {
      return a.distanceMiles - b.distanceMiles;
    }
    if (a.distanceMiles !== undefined) return -1;
    if (b.distanceMiles !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });
}

// Get user's current location using browser geolocation
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
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