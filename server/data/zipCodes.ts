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
    const fs = await import('fs');
    const path = await import('path');
    
    // Load from the attached US zip codes CSV file
    const csvPath = path.join(process.cwd(), 'attached_assets', 'uszips_1753848499131.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');
      
      // Skip header row - load all zip codes since we need nationwide coverage
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line (handle quoted fields)
        const parts = line.split(',').map(part => part.replace(/"/g, ''));
        if (parts.length >= 6) {
          const zipData: ZipCodeData = {
            zip: parts[0],
            lat: parseFloat(parts[1]),
            lng: parseFloat(parts[2]),
            city: parts[3],
            state: parts[5] // state_name is at index 5
          };
          
          if (!isNaN(zipData.lat) && !isNaN(zipData.lng)) {
            zipCodeMap.set(zipData.zip, zipData);
          }
        }
      }
      
      console.log(`Loaded ${zipCodeMap.size} zip codes from CSV file for distance calculations`);

    } else {
      // Fallback to hardcoded data including the specific zip codes we're seeing in the logs
      const fallbackZipCodes: ZipCodeData[] = [
        // Santa Barbara County zip codes from 211 API logs
        { zip: "93436", lat: 34.73639, lng: -120.42167, city: "Lompoc", state: "CA" },
        { zip: "93454", lat: 34.61639, lng: -120.41417, city: "Santa Maria", state: "CA" },
        { zip: "93455", lat: 34.92028, lng: -120.42750, city: "Santa Maria", state: "CA" },
        { zip: "93458", lat: 34.94306, lng: -120.43583, city: "Santa Maria", state: "CA" },
        { zip: "93463", lat: 34.89472, lng: -120.67639, city: "Surf", state: "CA" },
        
        // Existing sample zip codes for testing
        { zip: "93101", lat: 34.41889, lng: -119.69810, city: "Santa Barbara", state: "CA" },
        { zip: "91303", lat: 34.22834, lng: -118.61842, city: "Canoga Park", state: "CA" },
        { zip: "90210", lat: 34.10237, lng: -118.41047, city: "Beverly Hills", state: "CA" },
      ];
      
      fallbackZipCodes.forEach(zipData => {
        zipCodeMap.set(zipData.zip, zipData);
      });
      
      console.log(`Loaded ${zipCodeMap.size} fallback zip codes for distance calculations`);
    }
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