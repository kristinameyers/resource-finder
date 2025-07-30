// ZIP code coordinates data for distance calculations
export interface ZipCodeData {
  zip: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
}

// This will store the zip code data - we'll load it from the CSV
let zipCodeMap: Map<string, ZipCodeData> = new Map();

/**
 * Load zip code data from CSV file
 */
export async function loadZipCodeData() {
  if (zipCodeMap.size > 0) {
    return; // Already loaded
  }

  try {
    // Use a curated set of zip codes for better performance
    // Including key California zip codes and major metropolitan areas
    const sampleZipCodes: ZipCodeData[] = [
      // Santa Barbara County
      { zip: "93101", lat: 34.41889, lng: -119.69810, city: "Santa Barbara", state: "CA" },
      { zip: "93105", lat: 34.43611, lng: -119.76972, city: "Santa Barbara", state: "CA" },
      { zip: "93110", lat: 34.45833, lng: -119.71667, city: "Santa Barbara", state: "CA" },
      { zip: "93111", lat: 34.46389, lng: -119.78750, city: "Goleta", state: "CA" },
      { zip: "93117", lat: 34.44167, lng: -119.84444, city: "Goleta", state: "CA" },
      { zip: "93454", lat: 34.61639, lng: -120.41417, city: "Santa Maria", state: "CA" },
      
      // Los Angeles County
      { zip: "90210", lat: 34.10237, lng: -118.41047, city: "Beverly Hills", state: "CA" },
      { zip: "91303", lat: 34.22834, lng: -118.61842, city: "Canoga Park", state: "CA" },
      { zip: "90028", lat: 34.09778, lng: -118.32639, city: "Hollywood", state: "CA" },
      { zip: "90401", lat: 34.01750, lng: -118.49611, city: "Santa Monica", state: "CA" },
      { zip: "91501", lat: 34.15889, lng: -118.25278, city: "Burbank", state: "CA" },
      { zip: "91711", lat: 34.09167, lng: -117.73944, city: "Claremont", state: "CA" },
      { zip: "90245", lat: 33.89167, lng: -118.34889, city: "El Segundo", state: "CA" },
      { zip: "90740", lat: 33.84722, lng: -118.07028, city: "Seal Beach", state: "CA" },
      
      // Orange County
      { zip: "92602", lat: 33.66000, lng: -117.76000, city: "Irvine", state: "CA" },
      { zip: "92637", lat: 33.62889, lng: -117.92917, city: "Laguna Woods", state: "CA" },
      
      // San Diego County
      { zip: "92037", lat: 32.84889, lng: -117.22639, city: "La Jolla", state: "CA" },
      { zip: "92101", lat: 32.71611, lng: -117.16028, city: "San Diego", state: "CA" },
      
      // San Francisco Bay Area
      { zip: "94102", lat: 37.78167, lng: -122.41639, city: "San Francisco", state: "CA" },
      { zip: "94103", lat: 37.77056, lng: -122.40833, city: "San Francisco", state: "CA" },
      { zip: "94301", lat: 37.44194, lng: -122.17306, city: "Palo Alto", state: "CA" },
      { zip: "95014", lat: 37.32306, lng: -122.04528, city: "Cupertino", state: "CA" },
      
      // Major US Cities for comparison
      { zip: "10001", lat: 40.74844, lng: -73.99639, city: "New York", state: "NY" },
      { zip: "10010", lat: 40.73946, lng: -73.98194, city: "New York", state: "NY" },
      { zip: "20001", lat: 38.90000, lng: -77.00000, city: "Washington", state: "DC" },
      { zip: "60601", lat: 41.88389, lng: -87.62278, city: "Chicago", state: "IL" },
      { zip: "75201", lat: 32.78306, lng: -96.80667, city: "Dallas", state: "TX" },
      { zip: "77002", lat: 29.75889, lng: -95.36778, city: "Houston", state: "TX" },
      { zip: "98101", lat: 47.60621, lng: -122.33207, city: "Seattle", state: "WA" }
    ];

    // Load into map
    sampleZipCodes.forEach(zipData => {
      zipCodeMap.set(zipData.zip, zipData);
    });

    console.log(`Loaded ${zipCodeMap.size} zip codes for distance calculations`);
  } catch (error) {
    console.error('Error loading zip code data:', error);
  }
}

/**
 * Get coordinates for a zip code
 */
export function getZipCodeCoordinates(zipCode: string): { lat: number; lng: number } | null {
  const zipData = zipCodeMap.get(zipCode);
  if (zipData) {
    return { lat: zipData.lat, lng: zipData.lng };
  }
  return null;
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between a user's zip code and a resource's zip code
 */
export function calculateDistanceFromZipCodes(userZip: string, resourceZip: string): number | null {
  const userCoords = getZipCodeCoordinates(userZip);
  const resourceCoords = getZipCodeCoordinates(resourceZip);
  
  if (!userCoords || !resourceCoords) {
    return null;
  }
  
  return calculateDistance(userCoords.lat, userCoords.lng, resourceCoords.lat, resourceCoords.lng);
}

// Initialize on module load
loadZipCodeData();