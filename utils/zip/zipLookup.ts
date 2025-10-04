// utils/zip/zipLookup.ts (New/Modified File)

// 1. Export the data map directly
export const ZIP_CODE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "93001": { lat: 34.35321, lng: -119.31868 }, // Ventura, Ventura
  "93003": { lat: 34.28434, lng: -119.22256 }, // Ventura, Ventura
  "93004": { lat: 34.27901, lng: -119.16537 }, // Ventura, Ventura
  "93010": { lat: 34.23007, lng: -119.07437 }, // Camarillo, Ventura
  "93012": { lat: 34.20518, lng: -118.99309 }, // Camarillo, Ventura
  "93013": { lat: 34.42697, lng: -119.48032 }, // Carpinteria, Santa Barbara
  "93015": { lat: 34.40969, lng: -118.87807 }, // Fillmore, Ventura
  "93021": { lat: 34.30417, lng: -118.88274 }, // Moorpark, Ventura
  "93022": { lat: 34.40324, lng: -119.29836 }, // Oak View, Ventura
  "93023": { lat: 34.50372, lng: -119.24856 }, // Ojai, Ventura
  "93030": { lat: 34.2051, lng: -119.1753 }, // Oxnard, Ventura
  "93033": { lat: 34.15401, lng: -119.12296 }, // Oxnard, Ventura
  "93035": { lat: 34.19034, lng: -119.22879 }, // Oxnard, Ventura
  "93036": { lat: 34.24911, lng: -119.15977 }, // Oxnard, Ventura
  "93040": { lat: 34.59337, lng: -118.93657 }, // Piru, Ventura
  "93041": { lat: 34.14956, lng: -119.17458 }, // Port Hueneme, Ventura
  "93042": { lat: 33.4077, lng: -119.43365 }, // Point Mugu Nawc, Ventura
  "93043": { lat: 34.17001, lng: -119.2026 }, // Port Hueneme Cbc Base, Ventura
  "93060": { lat: 34.36543, lng: -119.09563 }, // Santa Paula, Ventura
  "93063": { lat: 34.30922, lng: -118.69041 }, // Simi Valley, Ventura
  "93064": { lat: 34.24527, lng: -118.69984 }, // Brandeis, Ventura
  "93065": { lat: 34.26206, lng: -118.77151 }, // Simi Valley, Ventura
  "93066": { lat: 34.28851, lng: -119.02848 }, // Somis, Ventura
  "93067": { lat: 34.42162, lng: -119.59277 }, // Summerland, Santa Barbara
  "93101": { lat: 34.41925, lng: -119.70808 }, // Santa Barbara, Santa Barbara
  "93103": { lat: 34.43888, lng: -119.68173 }, // Santa Barbara, Santa Barbara
  "93105": { lat: 34.52702, lng: -119.76082 }, // Santa Barbara, Santa Barbara
  "93106": { lat: 34.41719, lng: -119.85111 }, // Santa Barbara, Santa Barbara
  "93108": { lat: 34.44934, lng: -119.60397 }, // Santa Barbara, Santa Barbara
  "93109": { lat: 34.40662, lng: -119.72682 }, // Santa Barbara, Santa Barbara
  "93110": { lat: 34.43913, lng: -119.7666 }, // Santa Barbara, Santa Barbara
  "93111": { lat: 34.44932, lng: -119.80223 }, // Santa Barbara, Santa Barbara
  "93117": { lat: 34.49102, lng: -120.08201 }, // Goleta, Santa Barbara
  "93254": { lat: 34.92498, lng: -119.74834 }, // New Cuyama, Santa Barbara
  "93401": { lat: 35.23539, lng: -120.61834 }, // San Luis Obispo, San Luis Obispo
  "93402": { lat: 35.29082, lng: -120.8392 }, // Los Osos, San Luis Obispo
  "93405": { lat: 35.29672, lng: -120.72618 }, // San Luis Obispo, San Luis Obispo
  "93407": { lat: 35.30747, lng: -120.66986 }, // San Luis Obispo, San Luis Obispo
  "93408": { lat: 35.32117, lng: -120.71889 }, // San Luis Obispo, San Luis Obispo
  "93409": { lat: 35.32352, lng: -120.69743 }, // San Luis Obispo, San Luis Obispo
  "93410": { lat: 35.30428, lng: -120.65683 }, // San Luis Obispo, San Luis Obispo
  "93420": { lat: 35.16682, lng: -120.46617 }, // Arroyo Grande, San Luis Obispo
  "93422": { lat: 35.4638, lng: -120.69007 }, // Atascadero, San Luis Obispo
  "93424": { lat: 35.20141, lng: -120.78394 }, // Avila Beach, San Luis Obispo
  "93427": { lat: 34.62724, lng: -120.22465 }, // Buellton, Santa Barbara
  "93428": { lat: 35.58995, lng: -121.02943 }, // Cambria, San Luis Obispo
  "93429": { lat: 34.86682, lng: -120.53582 }, // Casmalia, Santa Barbara
  "93430": { lat: 35.49214, lng: -120.92422 }, // Cayucos, San Luis Obispo
  "93432": { lat: 35.47686, lng: -120.47228 }, // Creston, San Luis Obispo
  "93433": { lat: 35.12045, lng: -120.61894 }, // Grover Beach, San Luis Obispo
  "93434": { lat: 34.94086, lng: -120.6113 }, // Guadalupe, Santa Barbara
  "93436": { lat: 34.60888, lng: -120.4002 }, // Lompoc, Santa Barbara
  "93437": { lat: 34.76049, lng: -120.51102 }, // Lompoc, Santa Barbara
  "93440": { lat: 34.74606, lng: -120.25292 }, // Los Alamos, Santa Barbara
  "93441": { lat: 34.73296, lng: -120.09721 }, // Los Olivos, Santa Barbara
  "93442": { lat: 35.4, lng: -120.80495 }, // Morro Bay, San Luis Obispo
  "93444": { lat: 35.03553, lng: -120.50293 }, // Nipomo, San Luis Obispo
  "93445": { lat: 35.03319, lng: -120.62002 }, // Oceano, San Luis Obispo
  "93446": { lat: 35.65861, lng: -120.71888 }, // Paso Robles, San Luis Obispo
  "93449": { lat: 35.15803, lng: -120.6504 }, // Pismo Beach, San Luis Obispo
  "93452": { lat: 35.71078, lng: -121.20396 }, // San Simeon, San Luis Obispo
  "93453": { lat: 35.31339, lng: -120.1655 }, // Santa Margarita, San Luis Obispo
  "93454": { lat: 34.94834, lng: -120.23425 }, // Santa Maria, Santa Barbara
  "93455": { lat: 34.84195, lng: -120.45522 }, // Santa Maria, Santa Barbara
  "93458": { lat: 34.95477, lng: -120.49042 }, // Santa Maria, Santa Barbara
  "93460": { lat: 34.66214, lng: -119.90091 }, // Santa Ynez, Santa Barbara
  "93461": { lat: 35.63519, lng: -120.26951 }, // Shandon, San Luis Obispo
  "93463": { lat: 34.60688, lng: -120.13495 }, // Solvang, Santa Barbara
  "93465": { lat: 35.54267, lng: -120.73417 } // Templeton, San Luis Obispo
};

// 2. Export the synchronous getter
export function getCoordinatesByZip(zipCode: string): { lat: number; lng: number } | null {
  const cleanedZip = String(zipCode).replace(/\D/g, '').substring(0, 5);
  return ZIP_CODE_COORDINATES[cleanedZip] || null;
}

// 3. Export Haversine calculation (from zipCodeData.js/zipUtils.ts)
const R = 3959; // Radius of the Earth in miles
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}