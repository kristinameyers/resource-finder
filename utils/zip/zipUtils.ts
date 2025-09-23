// apps/mobile/src/utils/zip/zipUtils.ts

export interface ZipCodeData {
  zip: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
}

// Stores all zip code data (loaded from CSV)
let zipCodeMap: Map<string, ZipCodeData> = new Map();

/**
 * Load zip code data from uszips.csv
 * - You should place uszips.csv in apps/mobile/src/utils/zip/
 * - This only runs server-side (Node), so use a fallback/hardcoded set on client
 */
export async function loadZipCodeData() {
  if (zipCodeMap.size > 0) return;

  try {
    const fs = await import('fs');
    const path = await import('path');
    const csvPath = path.join(__dirname, 'uszips.csv');
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map(part => part.replace(/"/g, ''));
        if (parts.length >= 6) {
          const zipData: ZipCodeData = {
            zip: parts[0],
            lat: parseFloat(parts[1]),
            lng: parseFloat(parts[2]),
            city: parts[3],
            state: parts[5]
          };
          if (!isNaN(zipData.lat) && !isNaN(zipData.lng)) {
            zipCodeMap.set(zipData.zip, zipData);
          }
        }
      }
      // Optionally, add any fallback/frequently missing zip codes here as in your previous logic
      // ...
      console.log(`Loaded ${zipCodeMap.size} zip codes from CSV file.`);
    }
  } catch (error) {
    console.error('Error loading zip code data:', error);
  }
}

/**
 * Get coordinates for a zip code
 */
export function getZipCodeCoordinates(zip: string): { lat: number; lng: number } | null {
  const zipData = zipCodeMap.get(zip.trim());
  if (zipData) {
    return { lat: zipData.lat, lng: zipData.lng };
  }
  return null;
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // miles, rounded
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two ZIP codes
 */
export function calculateDistanceFromZipCodes(zipA: string, zipB: string): number | null {
  const a = getZipCodeCoordinates(zipA);
  const b = getZipCodeCoordinates(zipB);
  if (!a || !b) return null;
  return calculateDistance(a.lat, a.lng, b.lat, b.lng);
}

// Optionally: run loadZipCodeData at module initialization on server
// (disable for client/bundled builds)
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  loadZipCodeData();
}
