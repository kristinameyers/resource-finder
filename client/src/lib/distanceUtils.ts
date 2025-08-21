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

// Filter and sort resources for Santa Barbara County with distance calculations
export function filterSantaBarbaraAndSort(userZipCode: string, resources: any[]): any[] {
  return resources
    .filter((resource: any) => {
      // Filter for Santa Barbara County resources
      if (!resource.address) return false;
      
      const address = resource.address.toLowerCase();
      return address.includes('santa barbara') || 
             address.includes('ca') ||
             resource.serviceAreas?.toLowerCase().includes('santa barbara');
    })
    .map((resource: any) => {
      // Add distance calculation if coordinates are available
      if (resource.coordinates && userZipCode) {
        // This would need user coordinates, which we'd get from userZipCode
        // For now, return the resource as-is
        return resource;
      }
      return resource;
    })
    .sort((a: any, b: any) => {
      // Sort by distance if available, otherwise by name
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
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