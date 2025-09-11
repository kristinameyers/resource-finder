// client/src/data/zipcode-db.ts

// Import the JSON map generated at build time
import zipData from './zipcode-db.json';

// Define the shape of a coordinate tuple
type ZipCoords = [number, number];

/**
 * Returns latitude and longitude for a given ZIP code.
 * @param zip - A string of 5 digits (leading zeros allowed)
 * @returns An object with latitude and longitude, or null if not found.
 */
export function getCoordinatesForZip(zip: string): { latitude: number; longitude: number } | null {
  // Normalize to exactly 5 digits
  const key = zip.trim().padStart(5, '0');
  // Look up in the imported JSON
  const coords = (zipData as Record<string, ZipCoords>)[key];
  if (!coords) {
    return null;
  }
  return { latitude: coords[0], longitude: coords[1] };
}
